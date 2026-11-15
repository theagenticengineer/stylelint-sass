import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { lintSass } from './lint.js';

const RULE = 'declaration-property-value-no-unknown';
const rules = { [RULE]: true };

describe(`${RULE} on .sass`, () => {
  it('reports an unknown value written in indented syntax', async () => {
    const { problems } = await lintSass('.a\n  top: solid\n', rules);
    expect(problems.map(({ line }) => line)).toEqual([2]);
    expect(problems[0]!.text).toContain('"solid" for property "top"');
  });

  it('stays silent on Sass variables, functions and interpolation', async () => {
    const { problems } = await lintSass(
      '.a\n  top: $gap\n  width: math.div(100%, 3)\n  margin-#{$side}: 1px\n',
      rules,
    );
    expect(problems).toEqual([]);
  });

  // Sass nested properties compile `font:` with children to `font-family` and `font-size`. The
  // parent declaration has an empty value, which the rule reports.
  it('reports the empty parent of Sass nested properties', async () => {
    const { problems } = await lintSass(
      '.a\n  font:\n    family: sans-serif\n    size: 12px\n',
      rules,
    );
    expect(problems.map(({ line }) => line)).toEqual([2]);
    expect(problems[0]!.text).toContain('for property "font"');
  });

  // The nested-property false positive keeps it out.
  it('stays out of recommended, and recommended passes none of the removed *syntax options', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
    expect(JSON.stringify(recommended)).not.toMatch(/propertiesSyntax|typesSyntax/);
  });
});
