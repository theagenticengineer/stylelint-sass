import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';
import recommended from '../recommended.js';

const coreRules = Object.keys(recommended.rules).filter((name) => !name.startsWith('sass/'));

// CI runs this file on stylelint 17.8 and 18, so recommended holds on both ends of the range.
describe('recommended on the installed stylelint', () => {
  it('names only core rules the installed stylelint ships', () => {
    expect(coreRules.filter((name) => !(name in stylelint.rules))).toEqual([]);
  });

  // Stylelint 18 removed declaration-block-single-line-max-declarations, and the
  // ignoreSelectors option of selector-max-specificity.
  it('names no rule or option that stylelint 18 removed', () => {
    expect(recommended.rules).not.toHaveProperty('declaration-block-single-line-max-declarations');
    expect(JSON.stringify(recommended.rules['selector-max-specificity'] ?? null)).not.toContain(
      'ignoreSelectors',
    );
  });

  it('passes options every rule accepts, and no rule is unknown', async () => {
    const { results } = await stylelint.lint({
      code: '.a\n  color: $c\n',
      config: { customSyntax, plugins: ['./src/index.ts'], rules: recommended.rules },
    });
    expect(results[0]!.invalidOptionWarnings).toEqual([]);
    expect(results[0]!.warnings).toEqual([]);
  });
});
