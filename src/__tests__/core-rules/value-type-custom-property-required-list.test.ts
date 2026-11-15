import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const RULE = 'value-type-custom-property-required-list';
const rules = { [RULE]: ['length'] };

// Added as experimental in stylelint 18.0.0, so stylelint 17 skips these tests.
describe.skipIf(!hasRule(RULE))(`${RULE} on .sass`, () => {
  it('reports a literal length and accepts a custom property', async () => {
    const { problems } = await lintSass('.a\n  margin: 1rem\n  padding: var(--space)\n', rules);
    expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: `Expected "1rem" to be a custom property, as of type "<length>" (${RULE})`, line: 2 },
    ]);
  });

  // Sass projects keep tokens in `$variables`. The rule reads `$gap` as a non-length and stays
  // silent, and reports only the literal lengths `0` and `12px`.
  it('accepts Sass variables and reports literal lengths in Sass constructs', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(problems.map(({ text }) => text)).toEqual([
      `Expected "0" to be a custom property, as of type "<length>" (${RULE})`,
      `Expected "12px" to be a custom property, as of type "<length>" (${RULE})`,
    ]);
  });

  // Experimental upstream, and the value types are project-specific.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
  });
});
