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
  rules: { 'sass/at-extend-no-missing-placeholder': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/at-extend-no-missing-placeholder', () => {
  // BAD cases — extending non-placeholder selectors
  it('rejects extending a class', async () => {
    const result = await lint('.error\n  color: red\n\n.alert\n  @extend .error');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-extend-no-missing-placeholder');
  });

  it('rejects extending an element', async () => {
    const result = await lint('.nav-item\n  @extend a');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects extending an ID', async () => {
    const result = await lint('.widget\n  @extend #main');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects extending a compound selector', async () => {
    const result = await lint('.btn-primary\n  @extend .btn.large');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects extending a class inside a nested rule', async () => {
    const result = await lint('.card\n  .header\n    @extend .title');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects a selector list with a non-placeholder', async () => {
    const result = await lint('.nav\n  @extend %reset-list, .some-class');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects extending an attribute selector', async () => {
    const result = await lint('.item\n  @extend [data-foo]');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects extending a pseudo-class or pseudo-element', async () => {
    const result = await lint('.button\n  @extend :hover\n.text\n  @extend ::before');
    expect(result.warnings).toHaveLength(2);
  });

  it('rejects extending a class with !optional flag', async () => {
    const result = await lint('.alert\n  @extend .error !optional');
    expect(result.warnings).toHaveLength(1);
  });

  // GOOD cases — extending placeholders
  it('accepts extending a placeholder', async () => {
    const result = await lint(
      '%visually-hidden\n  position: absolute\n  width: 1px\n\n.sr-only\n  @extend %visually-hidden',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiple placeholder extends', async () => {
    const result = await lint(
      '%reset-list\n  margin: 0\n\n%inline-items\n  display: flex\n\n.nav\n  @extend %reset-list\n  @extend %inline-items',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts placeholder extend inside nested rule', async () => {
    const result = await lint(
      '%text-truncate\n  overflow: hidden\n\n.card\n  .title\n    @extend %text-truncate',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts a selector list with only placeholders', async () => {
    const result = await lint('.nav\n  @extend %reset-list, %inline-items');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts extending a placeholder with !optional flag', async () => {
    const result = await lint('.sr-only\n  @extend %visually-hidden !optional');
    expect(result.warnings).toHaveLength(0);
  });
});
