import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Lints `.sass` with one plugin rule.
 *
 * @param code - The `.sass` source
 * @param rule - The plugin rule name
 * @param option - The primary option
 * @returns The problem messages
 */
async function messages(code: string, rule: string, option: unknown = true): Promise<string[]> {
  const { results } = await stylelint.lint({
    code,
    config: { customSyntax, plugins: ['./src/index.ts'], rules: { [rule]: option } },
  });
  return results[0]!.warnings.map((w) => w.text);
}

// sass-parser 0.5 keeps CSS escapes as written in interpolations, and Dart Sass 1.106 normalizes
// escaped names. CI runs this file on sass-parser 0.4.42 and 0.5.6, so each case pins one
// result for both. `\6F` is `o`, `\65 ` is `e`, `\61` is `a` and `\6D` is `m`.
describe('names written with CSS escapes', () => {
  it.each([
    ['sass/at-mixin-pattern', '@mixin f\\6Fo\n  a: b\n', '@mixin F\\6Fo\n  a: b\n', 'mixin "Foo"'],
    [
      'sass/at-function-pattern',
      '@function f\\6Fo()\n  @return 1\n',
      '@function F\\6Fo()\n  @return 1\n',
      '@function "Foo"',
    ],
    ['sass/dollar-variable-pattern', '$f\\6Fo: 1\n', '$F\\6Fo: 1\n', '$Foo'],
    ['sass/percent-placeholder-pattern', '%f\\6Fo\n  a: b\n', '%F\\6Fo\n  a: b\n', '%Foo'],
  ])('%s matches the decoded name', async (rule, good, bad, shown) => {
    expect(await messages(good, rule, KEBAB)).toEqual([]);
    const reported = await messages(bad, rule, KEBAB);
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain(shown);
  });

  // Sass treats `_` and `-` as the same character in names, escaped or not.
  it('reads an escaped underscore in a variable name as a hyphen', async () => {
    expect(await messages('$a\\_b: 1\n', 'sass/dollar-variable-pattern', KEBAB)).toEqual([]);
  });

  // An interpolated placeholder name is only known once Sass runs.
  it('skips an interpolated placeholder name', async () => {
    expect(await messages('%a#{$x}\n  a: b\n', 'sass/percent-placeholder-pattern', KEBAB)).toEqual(
      [],
    );
  });

  it.each([
    ['sass/no-debug', '@d\\65 bug "x"\n'],
    ['sass/no-warn', '@w\\61rn "x"\n'],
    ['sass/no-import', '@i\\6Dport "x"\n'],
  ])('%s reports an escaped at-rule name', async (rule, code) => {
    expect(await messages(code, rule)).toHaveLength(1);
  });
});
