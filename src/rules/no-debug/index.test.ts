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
  rules: { 'sass/no-debug': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-debug', () => {
  it('rejects @debug with string', async () => {
    const result = await lint('$width: 100px\n@debug "width is #{$width}"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-debug');
  });

  it('rejects @debug with expression', async () => {
    const result = await lint('$map: (a: 1, b: 2)\n@debug map-get($map, a)');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @debug inside mixin', async () => {
    const result = await lint(
      '=responsive($bp)\n  @debug "breakpoint: #{$bp}"\n  @media (min-width: $bp)\n    @content',
    );
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @debug inside function', async () => {
    const result = await lint('@function double($n)\n  @debug $n * 2\n  @return $n * 2');
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects @debug nested inside rule', async () => {
    const result = await lint('.component\n  @debug &\n  color: red');
    expect(result.warnings).toHaveLength(1);
  });

  it('accepts code without @debug', async () => {
    const result = await lint('$width: 100px\n\n.container\n  max-width: $width');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts mixin with @content', async () => {
    const result = await lint('=responsive($bp)\n  @media (min-width: $bp)\n    @content');
    expect(result.warnings).toHaveLength(0);
  });
});
