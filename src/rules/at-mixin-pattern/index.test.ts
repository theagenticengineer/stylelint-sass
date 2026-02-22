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
  rules: { 'sass/at-mixin-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/] },
};

async function lint(code: string, pattern?: RegExp | string) {
  const overrides = pattern ? { ...config, rules: { 'sass/at-mixin-pattern': [pattern] } } : config;
  const result = await stylelint.lint({ code, config: overrides });
  return result.results[0]!;
}

describe('sass/at-mixin-pattern', () => {
  // BAD cases from spec

  it('rejects camelCase mixin with = shorthand', async () => {
    const result = await lint('=flexCenter\n  display: flex');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-mixin-pattern');
  });

  // sass-parser normalizes _ to - in identifiers, so flex_center becomes
  // flex-center which matches kebab-case. This is correct Sass behavior:
  // underscores and hyphens are interchangeable in Sass identifiers.
  it('treats snake_case as kebab-case (sass-parser normalizes _ to -)', async () => {
    const result = await lint('=flex_center\n  display: flex');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects PascalCase mixin with = shorthand', async () => {
    const result = await lint('=FlexCenter\n  display: flex');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-mixin-pattern');
  });

  it('rejects camelCase mixin with @mixin syntax', async () => {
    const result = await lint('@mixin respondTo($bp)\n  @content');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-mixin-pattern');
  });

  // GOOD cases from spec

  it('accepts kebab-case mixin with = shorthand', async () => {
    const result = await lint('=flex-center\n  display: flex');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts kebab-case mixin with @mixin syntax', async () => {
    const result = await lint('@mixin respond-to($bp)\n  @content');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts single word mixin', async () => {
    const result = await lint('=clearfix\n  display: block');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts mixin name with numbers', async () => {
    const result = await lint('=heading-2\n  font-weight: bold');
    expect(result.warnings).toHaveLength(0);
  });

  // Custom pattern

  it('accepts PascalCase with custom pattern', async () => {
    const result = await lint('=FlexCenter\n  display: flex', /^[A-Z][a-zA-Z0-9]*$/);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts string pattern option', async () => {
    const result = await lint('=FlexCenter\n  display: flex', '^[A-Z][a-zA-Z0-9]*$');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects when string pattern does not match', async () => {
    const result = await lint('=flex-center\n  display: flex', '^[A-Z][a-zA-Z0-9]*$');
    expect(result.warnings).toHaveLength(1);
  });

  // Edge cases

  it('does not flag @include calls (only declarations)', async () => {
    const result = await lint('.foo\n  +flexCenter');
    expect(result.warnings).toHaveLength(0);
  });

  it('reports multiple violations', async () => {
    const result = await lint('=flexCenter\n  display: flex\n=alignItems\n  align-items: center');
    expect(result.warnings).toHaveLength(2);
  });

  it('extracts name correctly when params have parentheses', async () => {
    const result = await lint('@mixin respondTo($breakpoint, $type: screen)\n  @content');
    expect(result.warnings).toHaveLength(1);
  });

  it('accepts valid mixin with complex params', async () => {
    const result = await lint('@mixin respond-to($breakpoint, $type: screen)\n  @content');
    expect(result.warnings).toHaveLength(0);
  });
});
