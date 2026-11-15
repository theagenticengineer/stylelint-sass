import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, lintSass } from './lint.js';

const rules = { 'property-layout-mappings': 'flow-relative' };

describe('property-layout-mappings on .sass', () => {
  it('reports physical properties in nested rules and mixins', async () => {
    const { problems } = await lintSass(
      '.a\n  margin-left: 1px\n  .b\n    padding-top: 2px\n@mixin m\n  border-right: 0\n',
      rules,
    );
    expect(problems.map(({ text, line }) => ({ text, line }))).toEqual([
      { text: 'Disallowed physical property "margin-left" (property-layout-mappings)', line: 2 },
      { text: 'Disallowed physical property "padding-top" (property-layout-mappings)', line: 4 },
      { text: 'Disallowed physical property "border-right" (property-layout-mappings)', line: 6 },
    ]);
  });

  it('accepts flow-relative properties', async () => {
    const { problems } = await lintSass(
      '.a\n  margin-inline-start: 1px\n  padding-block: 2px\n',
      rules,
    );
    expect(problems).toEqual([]);
  });

  // `margin-#{$side}` cannot be resolved before Sass runs, so the rule skips it; the only
  // problems in the fixture are `width` and `height`, which "flow-relative" maps to
  // `inline-size` and `block-size`.
  it('skips interpolated property names in Sass constructs', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(problems.map(({ text }) => text)).toEqual([
      'Disallowed physical property "width" (property-layout-mappings)',
      'Disallowed physical property "height" (property-layout-mappings)',
      'Disallowed physical property "width" (property-layout-mappings)',
    ]);
  });

  // Logical versus physical properties is a project policy.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty('property-layout-mappings');
  });
});
