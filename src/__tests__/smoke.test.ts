import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import stylelint from 'stylelint';
import { sass } from 'sass-parser';
import plugin from '../index.js';
import recommended from '../recommended.js';

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

// .bind(sass) required — sass-parser loses `this` when methods are destructured
const customSyntax = {
  parse: sass.parse.bind(sass),
  stringify: sass.stringify.bind(sass),
};

describe('plugin entry', () => {
  it('exports an array of rules', () => {
    expect(Array.isArray(plugin)).toBe(true);
  });
});

describe('recommended config', () => {
  const config = {
    plugins: ['./src/index.ts'],
    rules: recommended.rules,
    customSyntax,
  };

  it('produces zero warnings on valid.sass', async () => {
    const result = await stylelint.lint({
      files: resolve(fixturesDir, 'valid.sass'),
      config,
    });
    expect(result.results[0]!.warnings).toHaveLength(0);
  });

  it('produces warnings on invalid.sass', async () => {
    const result = await stylelint.lint({
      files: resolve(fixturesDir, 'invalid.sass'),
      config,
    });
    const warnings = result.results[0]!.warnings;
    const ruleNames = warnings.map((w) => w.rule);
    expect(ruleNames).toEqual(
      expect.arrayContaining([
        'color-no-invalid-hex',
        'shorthand-property-no-redundant-values',
        'length-zero-no-unit',
        'block-no-empty',
        'no-duplicate-selectors',
        'no-descending-specificity',
        'max-nesting-depth',
        'at-rule-no-unknown',
        'sass/no-debug',
        'sass/no-warn',
        'sass/no-import',
        'sass/at-use-no-unnamespaced',
        'sass/no-duplicate-mixins',
      ]),
    );
  });
});
