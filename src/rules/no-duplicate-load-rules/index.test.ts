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
  rules: { 'sass/no-duplicate-load-rules': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-duplicate-load-rules', () => {
  // BAD cases — should report

  it('rejects duplicate @use of the same module', async () => {
    const result = await lint('@use "variables"\n@use "mixins"\n@use "variables"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  it('rejects duplicate @forward of the same module', async () => {
    const result = await lint('@forward "colors"\n@forward "typography"\n@forward "colors"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  it('rejects same module with different aliases', async () => {
    const result = await lint('@use "colors" as c\n@use "colors" as clr');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  it('rejects duplicate built-in module load', async () => {
    const result = await lint('@use "sass:math"\n@use "sass:color"\n@use "sass:math"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  it('rejects duplicate @import of the same file', async () => {
    const result = await lint(
      '@import "legacy/helpers"\n@import "legacy/grid"\n@import "legacy/helpers"',
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  it('rejects same module with and without file extension', async () => {
    const result = await lint('@use "variables"\n@use "variables.sass"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  it('rejects bare @use and @use with with() of the same module', async () => {
    const result = await lint('@use "config"\n@use "config" with ($primary: #036)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-load-rules');
  });

  // GOOD cases — should NOT report

  it('accepts different modules loaded once each', async () => {
    const result = await lint(
      '@use "sass:math"\n@use "sass:color"\n@use "variables"\n@use "mixins"',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use and @forward of the same module', async () => {
    const result = await lint('@use "colors" as c\n@forward "colors"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts same filename in different directories', async () => {
    const result = await lint('@use "base/reset"\n@use "utils/reset"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiple distinct @use statements', async () => {
    const code = [
      '@use "sass:math"',
      '@use "variables" as vars',
      '@use "mixins" as mx',
      '@use "config"',
    ].join('\n');
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with with() configuration', async () => {
    const result = await lint('@use "config" with ($primary: #036, $border-radius: 4px)');
    expect(result.warnings).toHaveLength(0);
  });
});
