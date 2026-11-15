import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../../syntax.js';

/**
 * Lints `.sass` with the rule and returns the reported lines.
 *
 * @param code - The `.sass` source
 * @returns The line of each problem
 */
async function lines(code: string): Promise<number[]> {
  const { results } = await stylelint.lint({
    code,
    config: {
      customSyntax,
      plugins: ['./src/index.ts'],
      rules: { 'sass/selector-no-redundant-nesting-selector': true },
    },
  });
  return results[0]!.warnings.map((w) => w.line);
}

// Dart Sass 1.99 emits a root-level `&` as-is, where CSS reads it as the scoping root. With no
// parent rule, `&` is the only thing `& .x` is relative to, so removing it changes the selector.
describe('sass/selector-no-redundant-nesting-selector with a root-level &', () => {
  it('accepts `& .root` and `&.root` at the root', async () => {
    expect(await lines('& .root\n  color: $c\n&.root\n  color: $c\n')).toEqual([]);
  });

  it('accepts `& .x` in a root-level @media, @supports or @include block', async () => {
    expect(
      await lines(
        [
          '@media (min-width: 1px)',
          '  & .x',
          '    color: $c',
          '@supports (display: grid)',
          '  & .y',
          '    color: $c',
          '@include theme',
          '  & .z',
          '    color: $c',
          '',
        ].join('\n'),
      ),
    ).toEqual([]);
  });

  it('accepts `& .x` in a @mixin, whose parent is only known where it is included', async () => {
    expect(await lines('@mixin m\n  & .x\n    color: $c\n')).toEqual([]);
  });

  it('still reports `& .x` in a @media block nested in a rule', async () => {
    expect(await lines('.card\n  @media (min-width: 1px)\n    & .x\n      color: $c\n')).toEqual([
      3,
    ]);
  });
});
