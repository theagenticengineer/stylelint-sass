import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../../syntax.js';
import recommended from '../../recommended.js';

const RULE = 'sass/selector-no-adjacent-compounds';

/**
 * Lints `.sass` with the rule.
 *
 * @param code - The `.sass` source
 * @returns The problems as `line:column-endLine:endColumn text`
 */
async function lint(code: string): Promise<string[]> {
  const { results } = await stylelint.lint({
    code,
    config: { customSyntax, plugins: ['./src/index.ts'], rules: { [RULE]: true } },
  });
  return results[0]!.warnings.map(
    (w) => `${w.line}:${w.column}-${w.endLine}:${w.endColumn} ${w.text}`,
  );
}

describe(RULE, () => {
  // BAD cases from the spec
  it('rejects a type selector after an attribute selector', async () => {
    expect(await lint('[class]a\n  color: red\n')).toEqual([
      `1:8-1:9 Expected whitespace or a combinator between "[class]" and "a" (${RULE})`,
    ]);
  });

  it('rejects adjacent compounds inside a nested rule', async () => {
    expect(await lint('.card\n  &[data-x]span\n    color: red\n')).toEqual([
      `2:12-2:16 Expected whitespace or a combinator between "[data-x]" and "span" (${RULE})`,
    ]);
  });

  it('rejects a type selector after a functional pseudo-class', async () => {
    expect(await lint('.a:not(.b)p\n  color: red\n')).toEqual([
      `1:11-1:12 Expected whitespace or a combinator between ":not(.b)" and "p" (${RULE})`,
    ]);
  });

  it('rejects a namespaced type selector and a type selector after :nth-child()', async () => {
    expect(await lint('[x]|a\n  color: red\n.a:nth-child(2n)b\n  color: red\n')).toHaveLength(2);
  });

  it('rejects each adjacent compound of a selector list split over lines', async () => {
    const problems = await lint('.a,\n[x]b,\n.c\n  color: red\n');
    expect(problems.map((p) => p.split(' ')[0])).toEqual(['2:4-2:5']);
  });

  // GOOD cases from the spec
  it.each([
    ['the type selector first', 'a[class]\n  color: red\n'],
    ['whitespace between compounds', '[class] a\n  color: red\n'],
    ['a combinator between compounds', '[class] > a\n  color: red\n'],
    ['pseudo-classes and pseudo-elements', 'a:hover::before\n  color: red\n'],
    ['compound classes', '.a.b[x]\n  color: red\n'],
    [
      'parent selector suffixes',
      '.card\n  &__title\n    color: red\n  &:not(.x)\n    color: red\n',
    ],
    ['placeholders', '%base[x]\n  color: red\n'],
    ['interpolation', '.a#{$x}b\n  color: red\n[#{$attr}]\n  color: red\n'],
    ['a functional pseudo-class closing before a class', ':is(.a).b\n  color: red\n'],
    // Dart Sass 1.108 accepts `[x]*` without a deprecation warning.
    ['the universal selector after an attribute selector', '[x]*\n  color: red\n'],
    ['attribute values with brackets in strings', '[data-x="]a"]\n  color: red\n'],
    ['at-rules and declarations', '@media (min-width: 1px)\n  .a\n    color: red\n'],
  ])('accepts %s', async (_, code) => {
    expect(await lint(code)).toEqual([]);
  });

  it('is part of recommended', () => {
    expect(recommended.rules[RULE]).toBe(true);
  });
});
