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
  rules: { 'sass/operator-no-unspaced': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

async function fix(code: string) {
  const result = await stylelint.lint({ code, config, fix: true });
  return result;
}

describe('sass/operator-no-unspaced', () => {
  // BAD cases from spec — should warn

  it('rejects unspaced addition', async () => {
    const result = await lint('.box\n  width: $a+$b');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced multiplication', async () => {
    const result = await lint('.grid\n  width: $columns*$col-width');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced division', async () => {
    const result = await lint('.half\n  width: $width/2');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced modulo and equality', async () => {
    const result = await lint('.alt-row\n  @if $index%2==0\n    background: $gray');
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced comparison (>)', async () => {
    const result = await lint('.foo\n  @if $size>10\n    font-size: 14px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced equality (==)', async () => {
    const result = await lint('.foo\n  @if $theme=="dark"\n    background: #111');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects partially spaced operator (left only)', async () => {
    const result = await lint('.box\n  margin: $a +$b');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects partially spaced operator (right only)', async () => {
    const result = await lint('.box\n  margin: $a+ $b');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced operator in variable declaration', async () => {
    const result = await lint('$sum: $a+$b');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced operator in @return', async () => {
    const result = await lint('@function double($n)\n  @return $n*2');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced operator in @while condition', async () => {
    const result = await lint('@while $i>0\n  $i: $i - 1');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced != operator', async () => {
    const result = await lint('.foo\n  @if $a!=$b\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced <= operator', async () => {
    const result = await lint('.foo\n  @if $a<=$b\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced >= operator', async () => {
    const result = await lint('.foo\n  @if $a>=$b\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('rejects unspaced < operator', async () => {
    const result = await lint('.foo\n  @if $a<$b\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/operator-no-unspaced');
  });

  it('reports multiple violations in nested binary operations', async () => {
    const result = await lint('.foo\n  @if $index%2==0\n    background: $gray');
    // Both % and == are unspaced
    expect(result.warnings.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects unspaced operator in @each list expression', async () => {
    const result = await lint('@each $item in 1+2, 3*4\n  .item\n    content: ""');
    expect(result.warnings).toHaveLength(2);
  });

  it('rejects unspaced operator in @include mixin call arguments', async () => {
    const result = await lint('@mixin foo($a, $b)\n  width: $a\n+foo(1+2, 3*4)');
    expect(result.warnings).toHaveLength(2);
  });

  // GOOD cases from spec — should NOT warn

  it('accepts spaced addition', async () => {
    const result = await lint('.box\n  width: $a + $b');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced subtraction', async () => {
    const result = await lint('.box\n  width: $total - $padding');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced multiplication', async () => {
    const result = await lint('.grid\n  width: $columns * $col-width');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts math.div function call', async () => {
    const result = await lint('@use "sass:math"\n\n.half\n  width: math.div($width, 2)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced comparison', async () => {
    const result = await lint('.foo\n  @if $size > 10\n    font-size: 14px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts negative numbers (unary minus)', async () => {
    const result = await lint('.offset\n  margin-left: -$spacing');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts minus in property value (not an operator)', async () => {
    const result = await lint('.animation\n  transition: all 0.3s ease-in-out');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts minus in variable name', async () => {
    const result = await lint('$font-size-sm: 12px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced equality in @if', async () => {
    const result = await lint('.foo\n  @if $theme == "dark"\n    background: #111');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced modulo and equality', async () => {
    const result = await lint('.alt-row\n  @if $index % 2 == 0\n    background: $gray');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced operator in @return', async () => {
    const result = await lint('@function double($n)\n  @return $n * 2');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced operator in variable declaration', async () => {
    const result = await lint('$sum: $a + $b');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced operator in @each list expression', async () => {
    const result = await lint('@each $item in 1 + 2, 3 * 4\n  .item\n    content: ""');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts spaced operator in @include mixin call arguments', async () => {
    const result = await lint('@mixin foo($a, $b)\n  width: $a\n+foo(1 + 2, 3 * 4)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts numeric literals without operators', async () => {
    const result = await lint('.box\n  width: 100px\n  margin: 0');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts color values without operators', async () => {
    const result = await lint('.box\n  color: #333');
    expect(result.warnings).toHaveLength(0);
  });

  // Fixable behavior

  it('fixes unspaced addition', async () => {
    const result = await fix('.box\n  width: $a+$b');
    expect(result.code).toContain('$a + $b');
  });

  it('fixes unspaced multiplication', async () => {
    const result = await fix('.grid\n  width: $columns*$col-width');
    expect(result.code).toContain('$columns * $col-width');
  });

  it('fixes partially spaced operator', async () => {
    const result = await fix('.box\n  margin: $a +$b');
    expect(result.code).toContain('$a + $b');
  });

  it('fixes unspaced operator in variable declaration', async () => {
    const result = await fix('$sum: $a+$b');
    expect(result.code).toContain('$a + $b');
  });
});
