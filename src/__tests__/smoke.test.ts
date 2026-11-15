import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';
import plugin from '../index.js';
import recommended from '../recommended.js';

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

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
        'selector-no-deprecated',
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
        'sass/no-duplicate-load-rules',
        'sass/selector-no-redundant-nesting-selector',
        'sass/no-duplicate-dollar-variables',
        'sass/selector-no-union-class-name',
        'sass/dimension-no-non-numeric-values',
        'sass/no-color-literals',
      ]),
    );
  });

  // Core rules newer than stylelint 17.8 join recommended only when the installed stylelint has
  // them, so each run expects exactly the ones it ships.
  it('reports the newer core rules the installed stylelint ships', async () => {
    const result = await stylelint.lint({
      files: resolve(fixturesDir, 'invalid.sass'),
      config,
    });
    const ruleNames = new Set(result.results[0]!.warnings.map((w) => w.rule));
    for (const rule of ['selector-no-invalid']) {
      expect(ruleNames.has(rule), rule).toBe(rule in stylelint.rules);
    }
  });
});
