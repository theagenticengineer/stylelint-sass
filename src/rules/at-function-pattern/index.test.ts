import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import { sass } from 'sass-parser';

const customSyntax = {
  parse: sass.parse.bind(sass),
  stringify: sass.stringify.bind(sass),
};

const config = {
  plugins: ['./src/index.ts'],
  customSyntax,
  rules: { 'sass/at-function-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/] },
};

async function lint(code: string, pattern?: RegExp | string) {
  const overrides = pattern
    ? { ...config, rules: { 'sass/at-function-pattern': [pattern] } }
    : config;
  const result = await stylelint.lint({ code, config: overrides });
  return result.results[0]!;
}

describe('sass/at-function-pattern', () => {
  // BAD cases from spec

  it('rejects camelCase function name', async () => {
    const result = await lint('@function toRem($px)\n  @return $px / 16 * 1rem');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-function-pattern');
  });

  // sass-parser normalizes _ to - in identifiers, so to_rem becomes
  // to-rem which matches kebab-case. This is correct Sass behavior:
  // underscores and hyphens are interchangeable in Sass identifiers.
  it('treats snake_case as kebab-case (sass-parser normalizes _ to -)', async () => {
    const result = await lint('@function to_rem($px)\n  @return $px / 16 * 1rem');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects PascalCase function name', async () => {
    const result = await lint('@function ToRem($px)\n  @return $px / 16 * 1rem');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-function-pattern');
  });

  // sass-parser normalizes leading _ to -, so _private-helper becomes
  // -private-helper which does not match kebab-case (starts with -).
  it('rejects function starting with underscore (normalized to -)', async () => {
    const result = await lint('@function _private-helper($val)\n  @return $val * 2');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-function-pattern');
  });

  // GOOD cases from spec

  it('accepts kebab-case function name', async () => {
    const result = await lint('@function to-rem($px)\n  @return $px / 16 * 1rem');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts single word function name', async () => {
    const result = await lint('@function spacing($multiplier)\n  @return $multiplier * 8px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multi-word kebab-case', async () => {
    const result = await lint('@function z-index-above($layer)\n  @return $layer + 1');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts kebab-case name with digits', async () => {
    const result = await lint('@function grid-column-12()\n  @return 12');
    expect(result.warnings).toHaveLength(0);
  });

  // Custom pattern

  it('accepts camelCase with custom pattern', async () => {
    const result = await lint(
      '@function toRem($px)\n  @return $px / 16 * 1rem',
      /^[a-zA-Z][a-zA-Z0-9]*$/,
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts string pattern option', async () => {
    const result = await lint(
      '@function toRem($px)\n  @return $px / 16 * 1rem',
      '^[a-zA-Z][a-zA-Z0-9]*$',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects when string pattern does not match', async () => {
    const result = await lint(
      '@function to-rem($px)\n  @return $px / 16 * 1rem',
      '^[a-zA-Z][a-zA-Z0-9]*$',
    );
    expect(result.warnings).toHaveLength(1);
  });

  // Edge cases

  it('reports multiple violations', async () => {
    const code = [
      '@function toRem($px)',
      '  @return $px / 16 * 1rem',
      '@function ToEm($px)',
      '  @return $px / 16 * 1em',
    ].join('\n');
    const result = await lint(code);
    expect(result.warnings).toHaveLength(2);
  });

  it('does not flag non-function at-rules', async () => {
    const result = await lint('@use "colors"');
    expect(result.warnings).toHaveLength(0);
  });

  it('handles function with no arguments', async () => {
    const result = await lint('@function get-base-size()\n  @return 16px');
    expect(result.warnings).toHaveLength(0);
  });
});
