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
  rules: {
    'sass/percent-placeholder-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/],
  },
};

async function lint(code: string, pattern?: RegExp | string) {
  const overrides = pattern
    ? {
        ...config,
        rules: { 'sass/percent-placeholder-pattern': [pattern] },
      }
    : config;
  const result = await stylelint.lint({ code, config: overrides });
  return result.results[0]!;
}

describe('sass/percent-placeholder-pattern', () => {
  // BAD cases from spec

  it('rejects camelCase placeholder', async () => {
    const result = await lint('%visuallyHidden\n  display: none');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/percent-placeholder-pattern');
  });

  // Unlike $variables, sass-parser does NOT normalize _ to - in
  // placeholder selectors, so %visually_hidden keeps the underscore
  // and fails the default kebab-case pattern.
  it('rejects snake_case placeholder (no normalization in selectors)', async () => {
    const result = await lint('%visually_hidden\n  display: none');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/percent-placeholder-pattern');
  });

  it('rejects PascalCase placeholder', async () => {
    const result = await lint('%VisuallyHidden\n  display: none');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/percent-placeholder-pattern');
  });

  it('rejects placeholder starting with uppercase', async () => {
    const result = await lint('%Hidden\n  display: none');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/percent-placeholder-pattern');
  });

  // GOOD cases from spec

  it('accepts kebab-case placeholder', async () => {
    const result = await lint('%visually-hidden\n  display: none');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts single word placeholder', async () => {
    const result = await lint('%clearfix\n  overflow: hidden');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multi-word kebab-case placeholder', async () => {
    const result = await lint('%reset-list\n  margin: 0');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts placeholder name with numbers', async () => {
    const result = await lint('%grid-12-col\n  width: 100%');
    expect(result.warnings).toHaveLength(0);
  });

  // Custom pattern

  it('accepts PascalCase with custom pattern', async () => {
    const result = await lint('%VisuallyHidden\n  display: none', /^[A-Z][a-zA-Z0-9]*$/);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts string pattern option', async () => {
    const result = await lint('%VisuallyHidden\n  display: none', '^[A-Z][a-zA-Z0-9]*$');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects when string pattern does not match', async () => {
    const result = await lint('%visually-hidden\n  display: none', '^[A-Z][a-zA-Z0-9]*$');
    expect(result.warnings).toHaveLength(1);
  });

  // Edge cases

  it('does not flag non-placeholder selectors', async () => {
    const result = await lint('.myComponent\n  color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('reports multiple violations', async () => {
    const code = '%visuallyHidden\n  display: none\n' + '%VisuallyHidden\n  display: none';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(2);
  });

  it('checks placeholder inside @extend usage (no flag)', async () => {
    const result = await lint('.foo\n  @extend %visuallyHidden');
    // @extend references should not be flagged — only
    // placeholder definitions should trigger the rule
    expect(result.warnings).toHaveLength(0);
  });

  it('does not crash on invalid regex string', async () => {
    // toRegExp returns null for invalid patterns; rule exits early
    const result = await lint('%foo\n  display: none', '[');
    expect(result.warnings).toHaveLength(0);
  });
});
