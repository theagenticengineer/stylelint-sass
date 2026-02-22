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
  rules: { 'sass/no-warn': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-warn', () => {
  it('rejects @warn at root level', async () => {
    const result = await lint('@warn "Deprecated stylesheet loaded"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-warn');
  });

  it('rejects @warn inside mixin', async () => {
    const result = await lint(
      '=old-clearfix\n  @warn "Use modern clearfix instead"\n  overflow: hidden',
    );
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @warn inside function', async () => {
    const result = await lint(
      '@function to-rem($px)\n  @warn "to-rem() is deprecated, use math.div()"\n  @return $px / 16 * 1rem',
    );
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @warn inside conditional', async () => {
    const result = await lint(
      '=spacing($size)\n  @if $size == "small"\n    @warn "Use sm token instead of small"\n  padding: $size',
    );
    expect(result.warnings).toHaveLength(1);
  });

  it('accepts code without @warn', async () => {
    const result = await lint(
      '=clearfix\n  &::after\n    content: ""\n    display: table\n    clear: both',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts mixin with @content', async () => {
    const result = await lint('=responsive($bp)\n  @media (min-width: $bp)\n    @content');
    expect(result.warnings).toHaveLength(0);
  });
});
