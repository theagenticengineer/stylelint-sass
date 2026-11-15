import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';

/**
 * Lints `.sass` with one plugin rule and returns where each problem starts and ends.
 *
 * @param code - The `.sass` source
 * @param rule - The plugin rule name
 * @param option - The primary option
 * @returns The ranges as `line:column-endLine:endColumn`
 */
async function ranges(code: string, rule: string, option: unknown = true): Promise<string[]> {
  const { results } = await stylelint.lint({
    code,
    config: { customSyntax, plugins: ['./src/index.ts'], rules: { [rule]: option } },
  });
  return results[0]!.warnings.map((w) => `${w.line}:${w.column}-${w.endLine}:${w.endColumn}`);
}

// sass-parser 0.4.55 stopped adding a newline to the end of `Rule.selector` in the indented
// syntax. CI runs this file on sass-parser 0.4.42 and 0.5.6, so each range holds on both.
describe('selector rule positions', () => {
  it.each([
    ['sass/selector-no-union-class-name', '.card\n  &-title\n    color: $c\n', ['2:3-2:10']],
    [
      'sass/selector-no-union-class-name',
      '.card\n  &-a,\n  &-b\n    color: $c\n',
      ['2:3-2:6', '3:3-3:6'],
    ],
    [
      'sass/selector-no-redundant-nesting-selector',
      '.card\n  & .title\n    color: $c\n',
      ['2:3-2:4'],
    ],
    [
      'sass/selector-no-redundant-nesting-selector',
      '.card\n  & .a,\n  & .b\n    color: $c\n',
      ['2:3-2:4'],
    ],
    ['sass/at-extend-no-missing-placeholder', '.a\n  @extend .b\n', ['2:3-2:14']],
    ['sass/declarations-before-nesting', '.a\n  .b\n    x: y\n  color: $c\n', ['4:3-4:13']],
    ['sass/percent-placeholder-pattern', '%Bad\n  x: y\n', ['1:1-2:8'], /^[a-z-]+$/],
  ])('%s reports %j at %j', async (rule, code, expected, option = true) => {
    expect(await ranges(code, rule, option)).toEqual(expected);
  });

  it('fixes a redundant & in a selector list without a stray newline', async () => {
    const { results } = await stylelint.lint({
      code: '.card\n  & .a,\n  & .b\n    color: $c\n',
      fix: true,
      config: {
        customSyntax,
        plugins: ['./src/index.ts'],
        rules: { 'sass/selector-no-redundant-nesting-selector': true },
      },
    });
    const selectors: string[] = [];
    results[0]!._postcssResult!.root.walkRules((rule) => {
      selectors.push(rule.selector);
    });
    expect(selectors).toEqual(['.card', '.a, .b']);
  });
});
