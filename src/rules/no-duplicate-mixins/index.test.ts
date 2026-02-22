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
  rules: { 'sass/no-duplicate-mixins': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-duplicate-mixins', () => {
  // BAD cases — should report

  it('rejects duplicate mixin at root scope (= shorthand)', async () => {
    const code = '=button\n  padding: 8px 16px\n\n=button\n  padding: 12px 24px';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-mixins');
  });

  it('rejects duplicate with = shorthand', async () => {
    const code = '=reset\n  margin: 0\n\n=reset\n  margin: 0\n  padding: 0';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-mixins');
  });

  it('rejects duplicate using @mixin syntax', async () => {
    const code = '@mixin card\n  border: 1px solid #ccc\n\n@mixin card\n  border: 1px solid #ddd';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-mixins');
  });

  it('rejects duplicate with different parameters', async () => {
    const code =
      '=spacing($size)\n  padding: $size\n\n=spacing($size, $direction: all)\n  padding: $size';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-mixins');
  });

  // GOOD cases — should NOT report

  it('accepts unique mixin names', async () => {
    const code =
      '=button-base\n  padding: 8px 16px\n\n=button-primary\n  +button-base\n  background: blue';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts single mixin definition with @mixin', async () => {
    const code = '@mixin respond-to($bp)\n  @media (min-width: $bp)\n    @content';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });
});
