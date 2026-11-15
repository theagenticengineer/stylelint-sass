import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const RULE = 'selector-no-invalid';
const rules = { [RULE]: true };

describe('selector-no-invalid on .sass', () => {
  // Added in stylelint 17.10.0, so stylelint 17.8 skips the rule tests.
  describe.skipIf(!hasRule(RULE))('with the rule available', () => {
    // sass-parser accepts `:nth-child(2n+)`, so only the core rule catches it.
    it('reports an invalid selector that sass-parser accepts', async () => {
      const { problems } = await lintSass('.list\n  &:nth-child(2n+)\n    color: red\n', rules);
      expect(problems.map(({ rule, line }) => ({ rule, line }))).toEqual([{ rule: RULE, line: 2 }]);
      expect(problems[0]!.text).toContain('integer is expected');
    });

    // sass-parser rejects `:is()` itself, and the syntax reports it as a CssSyntaxError.
    it('leaves selectors that sass-parser rejects to the CssSyntaxError problem', async () => {
      const { problems } = await lintSass('a:is()\n  color: red\n', rules);
      expect(problems.map(({ rule }) => rule)).toEqual(['CssSyntaxError']);
    });

    it('stays silent on Sass constructs', async () => {
      const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
      expect(problems).toEqual([]);
    });

    it('stays silent on interpolated selectors, placeholders and @extend', async () => {
      const { problems } = await lintSass(
        '.#{$b}-c:not(.#{$d})\n  color: red\n#{$sel}\n  color: red\n%p::before\n  color: red\n.a::before\n  @extend %p\n',
        rules,
      );
      expect(problems).toEqual([]);
    });

    it('is part of recommended', () => {
      expect(recommended.rules[RULE]).toBe(true);
    });
  });

  // A config naming a rule the installed stylelint lacks reports "Unknown rule".
  it.skipIf(hasRule(RULE))('stays out of recommended on stylelint versions without it', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
  });
});
