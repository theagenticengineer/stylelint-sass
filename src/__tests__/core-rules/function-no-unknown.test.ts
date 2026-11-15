import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../../syntax.js';
import recommended from '../../recommended.js';
import { lintSass } from './lint.js';

const RULE = 'function-no-unknown';

const SOURCE = [
  '@use "sass:math"',
  '@use "sass:color"',
  '@use "sass:map"',
  '@use "sass:string"',
  '@function double($n)',
  '  @return $n * 2',
  '.a',
  '  width: math.div(100%, 3)',
  '  color: color.adjust($c, $lightness: -5%)',
  '  margin: map.get($m, a)',
  '  content: string.unquote("x")',
  '  top: if($x, 1px, 2px)',
  '  bottom: calc(100% - 2px)',
  '  padding: double(2px)',
  '  left: darken($c, 5%)',
  '  right: percentage(0.5)',
  '',
].join('\n');

describe(`${RULE} on .sass`, () => {
  // The rule skips namespaced calls, and reports names CSS does not define: the user-defined
  // `double()` and the global Sass functions that sass/no-global-function-names also reports.
  it('reports user-defined and global Sass functions, and skips module functions', async () => {
    const { problems } = await lintSass(SOURCE, { [RULE]: true });
    expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: `Unknown function "double" (${RULE})`, line: 14 },
      { text: `Unknown function "darken" (${RULE})`, line: 15 },
      { text: `Unknown function "percentage" (${RULE})`, line: 16 },
    ]);
  });

  // A project that extends stylelint-config-standard gets the rule on; recommended, listed
  // after it, turns it off so user-defined Sass functions stay legal.
  it('is turned off by recommended over a config that enables it', async () => {
    const { results } = await stylelint.lint({
      code: SOURCE,
      config: {
        extends: [{ rules: { [RULE]: true } }],
        customSyntax,
        plugins: ['./src/index.ts'],
        rules: recommended.rules,
      },
    });
    expect(results[0]!.warnings.map((w) => w.rule)).not.toContain(RULE);
    expect(recommended.rules[RULE]).toBeNull();
  });
});
