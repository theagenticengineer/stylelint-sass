import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const RULE = 'selector-no-unmatchable';
const rules = { [RULE]: true };

// Added in stylelint 17.15.0, so stylelint 17.8 skips the rule tests.
describe.skipIf(!hasRule(RULE))(`${RULE} on .sass`, () => {
  it('reports unmatchable selectors written in indented syntax', async () => {
    const { problems } = await lintSass(
      'label:checked\n  color: red\n::before:first-child\n  color: red\n',
      rules,
    );
    expect(problems.map(({ line }) => line)).toEqual([1, 3]);
    expect(problems[0]!.text).toContain('":checked" never matches "label" elements');
  });

  it('stays silent on Sass constructs', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(problems).toEqual([]);
  });

  // Sass joins `&` as text, so `&:hover` under `&::before` compiles to `.a::before:hover`, a
  // selector browsers match. The rule resolves `&` as CSS nesting does, as `:is(.a::before)`,
  // and pseudo-elements cannot sit inside `:is()`.
  it('reports `&` after a pseudo-element, which Sass compiles to a matchable selector', async () => {
    const { problems } = await lintSass(
      '.a\n  &::before\n    &:hover\n      color: red\na::before\n  .theme-dark &\n    color: red\n',
      rules,
    );
    expect(problems.map(({ line }) => line)).toEqual([3, 6]);
    expect(problems[0]!.text).toContain('"&" cannot represent pseudo-elements');
  });

  // Those false positives hit a common Sass pattern, so the rule stays out.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
  });
});
