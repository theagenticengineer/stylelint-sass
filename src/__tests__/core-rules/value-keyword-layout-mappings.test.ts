import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const rules = { 'value-keyword-layout-mappings': 'flow-relative' };

// Added in stylelint 17.10.0, so stylelint 17.8 skips these tests.
describe.skipIf(!hasRule('value-keyword-layout-mappings'))(
  'value-keyword-layout-mappings on .sass',
  () => {
    it('reports physical keywords', async () => {
      const { problems } = await lintSass(
        '.a\n  float: left\n  .b\n    text-align: right\n',
        rules,
      );
      expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
        { text: 'Disallowed physical keyword "left" (value-keyword-layout-mappings)', line: 2 },
        { text: 'Disallowed physical keyword "right" (value-keyword-layout-mappings)', line: 4 },
      ]);
    });

    it('accepts flow-relative keywords', async () => {
      const { problems } = await lintSass('.a\n  float: inline-start\n  text-align: end\n', rules);
      expect(problems).toEqual([]);
    });

    // `$side: left` is a Sass variable, not a property value, so only its use counts.
    it('stays silent on Sass constructs', async () => {
      const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
      expect(problems).toEqual([]);
    });

    // Logical versus physical keywords is a project policy.
    it('stays out of recommended', () => {
      expect(recommended.rules).not.toHaveProperty('value-keyword-layout-mappings');
    });
  },
);
