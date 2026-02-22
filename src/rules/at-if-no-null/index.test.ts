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
  rules: { 'sass/at-if-no-null': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/at-if-no-null', () => {
  // BAD cases — should warn

  it('rejects @if $x != null', async () => {
    const result = await lint('.foo\n  @if $x != null\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if $x == null', async () => {
    const result = await lint('@if $x == null\n  @warn "x is not set"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if $color != null (realistic variable)', async () => {
    const result = await lint(
      '.foo\n  @if $color != null\n    background-color: $color\n  @else\n    background-color: transparent',
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if $map != null (map variable)', async () => {
    const result = await lint(
      '.foo\n  @if $map != null\n    $value: map-get($map, key)\n    font-size: $value',
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if null != $x (reversed operand order)', async () => {
    const result = await lint('.foo\n  @if null != $x\n    display: block');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if $x ==null (no space before null)', async () => {
    const result = await lint('.foo\n  @if $x ==null\n    display: block');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if $x!=null (no spaces around operator)', async () => {
    const result = await lint('.foo\n  @if $x!=null\n    display: block');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if null!=$x (no spaces, reversed)', async () => {
    const result = await lint('.foo\n  @if null!=$x\n    display: block');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  it('rejects @if $x != null and $y (compound condition)', async () => {
    const result = await lint('.foo\n  @if $x != null and $y\n    display: block');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/at-if-no-null');
  });

  // GOOD cases — should not warn

  it('accepts @if $x (truthiness check)', async () => {
    const result = await lint('.foo\n  @if $x\n    color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @if not $x (falsy check)', async () => {
    const result = await lint('@if not $x\n  @warn "x is not set"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @if $x == false (explicit false check)', async () => {
    const result = await lint('@if $x == false\n  @error "x was explicitly set to false"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @if $x > 0 (numeric comparison)', async () => {
    const result = await lint('.foo\n  @if $x > 0\n    margin-top: $x');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @if $x and $y (boolean combination)', async () => {
    const result = await lint('.foo\n  @if $x and $y\n    border: 1px solid $x');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @if type-of($x) == "number" (type check)', async () => {
    const result = await lint('.foo\n  @if type-of($x) == "number"\n    font-size: $x * 1px');
    expect(result.warnings).toHaveLength(0);
  });
});
