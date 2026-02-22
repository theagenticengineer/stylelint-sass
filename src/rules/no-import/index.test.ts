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
  rules: { 'sass/no-import': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-import', () => {
  it('rejects single @import', async () => {
    const result = await lint('@import "variables"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-import');
  });

  it('rejects @import with path', async () => {
    const result = await lint('@import "utils/mixins"');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @import with extension', async () => {
    const result = await lint('@import "theme.sass"');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects multiple imports on separate lines', async () => {
    const result = await lint('@import "variables"\n@import "mixins"\n@import "base"');
    expect(result.warnings).toHaveLength(3);
  });

  it('rejects @import with media query', async () => {
    const result = await lint('@import "print" screen');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @import with url()', async () => {
    const result = await lint('@import url("https://fonts.googleapis.com/css?family=Roboto")');
    expect(result.warnings).toHaveLength(1);
  });

  it('accepts @use', async () => {
    const result = await lint('@use "variables"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with namespace', async () => {
    const result = await lint('@use "utils/mixins" as mx');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @forward', async () => {
    const result = await lint('@forward "theme"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with configuration', async () => {
    const result = await lint('@use "config" with ($primary: #036, $border-radius: 4px)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiple @use statements', async () => {
    const result = await lint('@use "sass:math"\n@use "sass:color"\n@use "variables" as vars');
    expect(result.warnings).toHaveLength(0);
  });
});
