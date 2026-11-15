import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';

/**
 * Lints `.sass` with plugin rules and returns the rule of each problem.
 *
 * @param code - The `.sass` source
 * @param rules - The Stylelint `rules` object
 * @returns The rule names reported, in order
 */
async function reported(code: string, rules: Record<string, unknown>): Promise<string[]> {
  const { results } = await stylelint.lint({
    code,
    config: { customSyntax, plugins: ['./src/index.ts'], rules },
  });
  return results[0]!.warnings.map((w) => w.rule);
}

// Dart Sass 1.105 adds first-class modules: `meta.load()` and `meta.get-module()` return a
// module value, and the `meta.css()` mixin includes CSS from it.
const FIRST_CLASS_MODULES = [
  '@use "sass:meta"',
  '$theme: meta.load("theme")',
  '$math: meta.get-module("sass:math")',
  '.a',
  '  @include meta.css($theme)',
  '  width: meta.call(meta.get-function("div", $module: $math), 1, 2)',
  '',
].join('\n');

const rules = {
  'sass/at-use-no-unnamespaced': true,
  'sass/no-global-function-names': true,
};

describe('first-class modules', () => {
  it('pass at-use-no-unnamespaced and no-global-function-names', async () => {
    expect(await reported(FIRST_CLASS_MODULES, rules)).toEqual([]);
  });

  it('leave the global forms of meta functions reported', async () => {
    const code = `${FIRST_CLASS_MODULES}  height: call(get-function("double"), 1)\n`;
    expect(await reported(code, rules)).toEqual([
      'sass/no-global-function-names',
      'sass/no-global-function-names',
    ]);
  });

  it('leave `@use ... as *` reported next to them', async () => {
    const code = `@use "theme" as *\n${FIRST_CLASS_MODULES}`;
    expect(await reported(code, rules)).toEqual(['sass/at-use-no-unnamespaced']);
  });
});
