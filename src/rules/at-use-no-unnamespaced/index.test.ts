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
  rules: { 'sass/at-use-no-unnamespaced': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/at-use-no-unnamespaced', () => {
  // BAD cases — should report

  it('rejects @use with as * (unnamespaced)', async () => {
    const result = await lint('@use "variables" as *');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-unnamespaced');
  });

  it('rejects @use built-in module with as *', async () => {
    const result = await lint('@use "sass:math" as *');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-unnamespaced');
  });

  it('rejects @use with config and as *', async () => {
    const result = await lint('@use "config" as * with ($primary: #036)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-use-no-unnamespaced');
  });

  // GOOD cases — should NOT report

  it('accepts @use with default namespace', async () => {
    const result = await lint('@use "variables"\n\n.link\n  color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with explicit short namespace', async () => {
    const result = await lint('@use "variables" as vars\n\n.link\n  color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use built-in with default namespace', async () => {
    const result = await lint('@use "sass:math"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @use with explicit namespace for built-in', async () => {
    const result = await lint('@use "sass:color" as c');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @forward with as prefix-* (re-exporting is different)', async () => {
    const result = await lint('@forward "tokens" as token-*');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiple namespaced @use', async () => {
    const code = [
      '@use "sass:math"',
      '@use "sass:color"',
      '@use "sass:map"',
      '@use "variables" as vars',
      '@use "mixins" as mx',
    ].join('\n');
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });
});
