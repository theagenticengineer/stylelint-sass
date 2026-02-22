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
  rules: { 'sass/extends-before-declarations': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/extends-before-declarations', () => {
  // BAD cases
  it('rejects @extend after declaration', async () => {
    const result = await lint('.alert\n  color: red\n  @extend %message-base');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/extends-before-declarations');
  });

  it('rejects @extend between declarations', async () => {
    const result = await lint('.card\n  display: flex\n  @extend %rounded\n  padding: 16px');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects multiple @extends with some after declarations', async () => {
    const result = await lint(
      '.btn-primary\n  @extend %btn-base\n  background: blue\n  @extend %text-white',
    );
    expect(result.warnings).toHaveLength(1);
  });

  // GOOD cases
  it('accepts @extend before all declarations', async () => {
    const result = await lint('.alert\n  @extend %message-base\n  color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiple @extends before declarations', async () => {
    const result = await lint(
      '.btn-primary\n  @extend %btn-base\n  @extend %text-white\n  background: blue\n  padding: 8px 16px',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @extend before declarations and nesting', async () => {
    const result = await lint(
      '.card\n  @extend %rounded\n  padding: 16px\n  background: white\n\n  .title\n    font-weight: bold',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts rule with only @extend', async () => {
    const result = await lint('.sr-only\n  @extend %visually-hidden');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts rule with only declarations', async () => {
    const result = await lint('.box\n  width: 100px\n  height: 100px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts rule with declarations and nesting but no extend', async () => {
    const result = await lint('.parent\n  color: blue\n  .child\n    font-size: 16px');
    expect(result.warnings).toHaveLength(0);
  });
});
