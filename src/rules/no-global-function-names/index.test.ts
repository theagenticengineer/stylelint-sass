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
  rules: { 'sass/no-global-function-names': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-global-function-names', () => {
  // --- BAD: global function names that should be namespaced ---

  it('rejects adjust-color()', async () => {
    const result = await lint('.link\n  color: adjust-color($primary, $lightness: -10%)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-global-function-names');
    expect(result.warnings[0].text).toContain('adjust-color');
    expect(result.warnings[0].text).toContain('color.adjust');
  });

  it('rejects darken()', async () => {
    const result = await lint('.btn\n  background: darken($primary, 10%)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('darken');
    expect(result.warnings[0].text).toContain('color.adjust');
  });

  it('rejects lighten()', async () => {
    const result = await lint('.surface\n  background: lighten($gray, 20%)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('lighten');
    expect(result.warnings[0].text).toContain('color.adjust');
  });

  it('rejects mix()', async () => {
    const result = await lint('.blend\n  color: mix($black, $primary, 50%)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('mix');
    expect(result.warnings[0].text).toContain('color.mix');
  });

  it('rejects map-get()', async () => {
    const result = await lint('.theme\n  color: map-get($colors, primary)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('map-get');
    expect(result.warnings[0].text).toContain('map.get');
  });

  it('rejects str-index() in a variable declaration', async () => {
    const result = await lint('$pos: str-index("helvetica", "vet")');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('str-index');
    expect(result.warnings[0].text).toContain('string.index');
  });

  it('rejects unitless() inside @if condition', async () => {
    const code = [
      '@function to-rem($val)',
      '  @if unitless($val)',
      '    @return $val * 1px',
      '  @return $val',
    ].join('\n');
    const result = await lint(code);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('unitless');
    expect(result.warnings[0].text).toContain('math.is-unitless');
  });

  it('rejects percentage()', async () => {
    const result = await lint('.col-half\n  width: percentage(0.5)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('percentage');
    expect(result.warnings[0].text).toContain('math.percentage');
  });

  // --- Additional deprecated globals ---

  it('rejects map-merge()', async () => {
    const result = await lint('$merged: map-merge($a, $b)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('map-merge');
    expect(result.warnings[0].text).toContain('map.merge');
  });

  it('rejects map-remove()', async () => {
    const result = await lint('$clean: map-remove($map, key)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('map-remove');
    expect(result.warnings[0].text).toContain('map.remove');
  });

  it('rejects map-has-key()', async () => {
    const result = await lint('$has: map-has-key($map, key)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('map-has-key');
    expect(result.warnings[0].text).toContain('map.has-key');
  });

  it('rejects map-keys()', async () => {
    const result = await lint('$keys: map-keys($map)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('map-keys');
    expect(result.warnings[0].text).toContain('map.keys');
  });

  it('rejects map-values()', async () => {
    const result = await lint('$vals: map-values($map)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('map-values');
    expect(result.warnings[0].text).toContain('map.values');
  });

  it('rejects str-length()', async () => {
    const result = await lint('$len: str-length("hello")');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('str-length');
    expect(result.warnings[0].text).toContain('string.length');
  });

  it('rejects comparable()', async () => {
    const result = await lint('$ok: comparable(1px, 1em)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].text).toContain('comparable');
    expect(result.warnings[0].text).toContain('math.compatible');
  });

  it('rejects multiple deprecated calls in one declaration', async () => {
    const result = await lint('.x\n  color: mix(darken($a, 10%), $b, 50%)');
    expect(result.warnings).toHaveLength(2);
  });

  // --- GOOD: namespaced and user-defined functions ---

  it('accepts namespaced color.adjust()', async () => {
    const code = '@use "sass:color"\n\n.link\n  color: color.adjust($primary, $lightness: -10%)';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts namespaced math.div()', async () => {
    const code = [
      '@use "sass:math"',
      '',
      '@function to-rem($px)',
      '  @return math.div($px, 16) * 1rem',
    ].join('\n');
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts namespaced map.get()', async () => {
    const code = '@use "sass:map"\n\n.theme\n  color: map.get($colors, primary)';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts namespaced list.nth()', async () => {
    const code = '@use "sass:list"\n\n$first: list.nth($items, 1)';
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts user-defined global function', async () => {
    const code = [
      '@function spacing($multiplier)',
      '  @return $multiplier * 8px',
      '',
      '.box',
      '  padding: spacing(2)',
    ].join('\n');
    const result = await lint(code);
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts function name as substring in non-function context', async () => {
    const result = await lint('.darken\n  color: red');
    expect(result.warnings).toHaveLength(0);
  });

  // --- CSS-native functions excluded to prevent false positives ---

  it('accepts CSS min()', async () => {
    const result = await lint('.container\n  width: min(100px, 50vw)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS max()', async () => {
    const result = await lint('.container\n  height: max(200px, 10vh)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS round()', async () => {
    const result = await lint('.grid\n  width: round(100.5px)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS abs()', async () => {
    const result = await lint('.offset\n  margin-left: abs(-10px)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS filter invert()', async () => {
    const result = await lint('img\n  filter: invert(1)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS filter grayscale()', async () => {
    const result = await lint('img\n  filter: grayscale(100%)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS filter saturate()', async () => {
    const result = await lint('img\n  backdrop-filter: saturate(140%)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS alpha()', async () => {
    const result = await lint('.el\n  color: alpha(red)');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts CSS opacity()', async () => {
    const result = await lint('.el\n  filter: opacity(50%)');
    expect(result.warnings).toHaveLength(0);
  });
});
