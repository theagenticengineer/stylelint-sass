import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const RULE = 'declaration-property-custom-property-allowed-list';
const rules = { [RULE]: { '/^margin/': ['/^--space-/'] } };

// Added in stylelint 18.0.0, so stylelint 17 skips these tests.
describe.skipIf(!hasRule(RULE))(`${RULE} on .sass`, () => {
  it('reports a custom property outside the allowed list', async () => {
    const { problems } = await lintSass(
      '.a\n  margin: var(--x)\n  margin-top: var(--space-1)\n',
      rules,
    );
    expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: `Disallowed custom property "--x" for property "margin" (${RULE})`, line: 2 },
    ]);
  });

  it('stays silent on Sass constructs', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(problems).toEqual([]);
  });

  // The allowed lists are project-specific.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
  });
});
