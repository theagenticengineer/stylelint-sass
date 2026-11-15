import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const rules = { 'unit-layout-mappings': 'flow-relative' };

// Added in stylelint 17.10.0, so stylelint 17.8 skips these tests.
describe.skipIf(!hasRule('unit-layout-mappings'))('unit-layout-mappings on .sass', () => {
  // The rule reads property declarations only, so a unit stored in `$w` goes unreported.
  it('reports physical units in declarations and skips Sass variables', async () => {
    const { problems } = await lintSass('$w: 10vw\n.a\n  height: 50vh\n  width: $w\n', rules);
    expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: 'Disallowed physical unit "vh" (unit-layout-mappings)', line: 3 },
    ]);
  });

  it('accepts flow-relative units', async () => {
    const { problems } = await lintSass('.a\n  inline-size: 10vi\n  block-size: 5vb\n', rules);
    expect(problems).toEqual([]);
  });

  it('stays silent on Sass constructs', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(problems).toEqual([]);
  });

  // Logical versus physical units is a project policy.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty('unit-layout-mappings');
  });
});
