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
  rules: { 'sass/at-use-no-redundant-alias': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/at-use-no-redundant-alias', () => {
  // BAD cases — should report

  it('rejects alias matching filename', async () => {
    const result = await lint('@use "colors" as colors');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-redundant-alias');
    expect(result.warnings[0].text).toContain('colors');
  });

  it('rejects alias matching last path segment', async () => {
    const result = await lint('@use "src/utils/helpers" as helpers');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-redundant-alias');
    expect(result.warnings[0].text).toContain('helpers');
  });

  it('rejects alias matching built-in module name (sass:math)', async () => {
    const result = await lint('@use "sass:math" as math');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-redundant-alias');
    expect(result.warnings[0].text).toContain('math');
  });

  it('rejects alias matching built-in module name (sass:color)', async () => {
    const result = await lint('@use "sass:color" as color');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-redundant-alias');
    expect(result.warnings[0].text).toContain('color');
  });

  it('rejects alias matching filename without leading underscore', async () => {
    const result = await lint('@use "_variables" as variables');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-redundant-alias');
    expect(result.warnings[0].text).toContain('variables');
  });

  it('rejects alias matching filename with extension stripped', async () => {
    const result = await lint('@use "theme/config.scss" as config');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-redundant-alias');
  });

  it('rejects redundant alias followed by inline comment', async () => {
    const result = await lint('@use "colors" as colors // theme colors');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('colors');
  });

  // GOOD cases — should NOT report

  it('accepts @use with no alias (default namespace)', async () => {
    const result = await lint('@use "colors"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with a short alias different from default', async () => {
    const result = await lint('@use "colors" as c');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts built-in with default namespace', async () => {
    const result = await lint('@use "sass:math"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts built-in with short alias', async () => {
    const result = await lint('@use "sass:math" as m');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts alias that differs from default namespace', async () => {
    const result = await lint('@use "variables" as vars');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with as * (unnamespaced)', async () => {
    const result = await lint('@use "colors" as *');
    expect(result.warnings).toHaveLength(0);
  });

  it('does not flag @forward', async () => {
    const result = await lint('@forward "colors" as colors-*');
    expect(result.warnings).toHaveLength(0);
  });
});
