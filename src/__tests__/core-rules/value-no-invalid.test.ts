import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const RULE = 'value-no-invalid';
const rules = { [RULE]: true };

describe('value-no-invalid on .sass', () => {
  // Added in stylelint 18.0.0, so stylelint 17 skips the rule tests.
  describe.skipIf(!hasRule(RULE))('with the rule available', () => {
    it('reports a number added to a dimension inside calc()', async () => {
      const { problems } = await lintSass('.a\n  top: calc(1px + 2)\n', rules);
      expect(problems.map(({ text, line, column }) => ({ text, line, column }))).toEqual([
        {
          text: `Invalid value "1px + 2", a number and a dimension or percentage cannot be added (${RULE})`,
          line: 2,
          column: 12,
        },
      ]);
    });

    // Outside calc() these are Sass expressions, which Sass evaluates before CSS sees them.
    it('stays silent on Sass math, functions and maps', async () => {
      const { problems } = await lintSass(
        [
          '.a',
          '  width: $a + 2',
          '  left: 1px + 2',
          '  height: math.div(100%, 3) + 1',
          '  margin: if($x, 1px, 2px)',
          '  padding: map.get($m, a)',
          '  border-width: (1px + 2)',
          '  top: calc(100% - #{$gap})',
          '',
        ].join('\n'),
        rules,
      );
      expect(problems).toEqual([]);
    });

    it('stays silent on Sass constructs', async () => {
      const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
      expect(problems).toEqual([]);
    });

    it('is part of recommended', () => {
      expect(recommended.rules[RULE]).toBe(true);
    });
  });

  it.skipIf(hasRule(RULE))('stays out of recommended on stylelint versions without it', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
  });
});
