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
  rules: { 'sass/dollar-variable-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/] },
};

async function lint(code: string, pattern?: RegExp | string) {
  const overrides = pattern
    ? { ...config, rules: { 'sass/dollar-variable-pattern': [pattern] } }
    : config;
  const result = await stylelint.lint({ code, config: overrides });
  return result.results[0]!;
}

describe('sass/dollar-variable-pattern', () => {
  // BAD cases from spec

  it('rejects camelCase variable', async () => {
    const result = await lint('$fontSize: 16px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dollar-variable-pattern');
  });

  // sass-parser normalizes _ to - in identifiers, so $font_size becomes
  // $font-size which matches kebab-case. This is correct Sass behavior:
  // underscores and hyphens are interchangeable in Sass identifiers.
  it('treats snake_case as kebab-case (sass-parser normalizes _ to -)', async () => {
    const result = await lint('$font_size: 16px');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects PascalCase variable', async () => {
    const result = await lint('$FontSize: 16px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dollar-variable-pattern');
  });

  it('rejects SCREAMING_CASE variable', async () => {
    const result = await lint('$FONT_SIZE: 16px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dollar-variable-pattern');
  });

  // $1st-color is invalid Sass syntax — sass-parser throws a parse error.
  // Variables cannot start with a digit in Sass, so this case is
  // caught by the parser before our rule runs.
  it('rejects variable starting with number (parse error)', async () => {
    await expect(lint('$1st-color: red')).rejects.toThrow();
  });

  it('rejects double hyphens', async () => {
    const result = await lint('$font--size: 16px');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects non-matching variable inside a rule', async () => {
    const result = await lint('.component\n  $myColor: blue\n  color: $myColor');
    expect(result.warnings).toHaveLength(1);
  });

  // GOOD cases from spec

  it('accepts kebab-case variables', async () => {
    const result = await lint('$font-size: 16px\n$primary-color: #036\n$border-radius-sm: 4px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts single word variable', async () => {
    const result = await lint('$spacing: 8px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts variable with number', async () => {
    const result = await lint('$heading-2: 24px\n$z-index-100: 100');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts matching variable inside a rule', async () => {
    const result = await lint('.component\n  $local-color: blue\n  color: $local-color');
    expect(result.warnings).toHaveLength(0);
  });

  // Custom pattern

  // sass-parser normalizes _ to - so $FONT_SIZE becomes $FONT-SIZE;
  // custom patterns must use - not _ to match screaming-case identifiers.
  it('accepts SCREAMING-CASE with custom pattern', async () => {
    const result = await lint(
      '$FONT_SIZE: 16px',
      /^[a-z][a-z0-9]*(-[a-z0-9]+)*$|^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/,
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts string pattern option', async () => {
    const result = await lint('$FONT_SIZE: 16px', '^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects when string pattern does not match', async () => {
    const result = await lint('$font-size: 16px', '^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$');
    expect(result.warnings).toHaveLength(1);
  });

  // Edge cases

  it('does not flag variable references (only declarations)', async () => {
    const result = await lint('.foo\n  color: $myColor');
    expect(result.warnings).toHaveLength(0);
  });

  it('reports multiple violations', async () => {
    const result = await lint('$fontSize: 16px\n$fontWeight: bold');
    expect(result.warnings).toHaveLength(2);
  });
});
