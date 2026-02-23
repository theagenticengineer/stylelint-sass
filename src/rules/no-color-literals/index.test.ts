import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import { sass } from 'sass-parser';

const customSyntax = {
  parse: sass.parse.bind(sass),
  stringify: sass.stringify.bind(sass),
};

const defaultConfig = {
  plugins: ['./src/index.ts'],
  customSyntax,
  rules: { 'sass/no-color-literals': true },
};

async function lint(code: string, options?: Record<string, unknown>) {
  const config = options
    ? {
        ...defaultConfig,
        rules: { 'sass/no-color-literals': [true, options] },
      }
    : defaultConfig;
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/no-color-literals', () => {
  // BAD cases from spec

  it('rejects hex color in property declaration', async () => {
    const result = await lint('.header\n  background: #336699');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  it('rejects named color in property declaration', async () => {
    const result = await lint('.error\n  color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  it('rejects short hex color in property declaration', async () => {
    const result = await lint('.link\n  color: #036');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  it('rejects rgb() in property declaration', async () => {
    const result = await lint('.overlay\n  background: rgb(0, 0, 0)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  it('rejects hsl() in property declaration', async () => {
    const result = await lint('.accent\n  color: hsl(210, 100%, 50%)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  it('rejects rgba() in property declaration', async () => {
    const result = await lint('.modal-backdrop\n  background: rgba(0, 0, 0, 0.5)');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  it('rejects color in shorthand property', async () => {
    const result = await lint('.card\n  border: 1px solid #ccc');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-color-literals');
  });

  // GOOD cases from spec

  it('accepts variable reference instead of color literal', async () => {
    const result = await lint('$primary: #036\n\n.link\n  color: $primary');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts color literals in variable assignments (allowInVariables default)', async () => {
    const result = await lint(
      '$error-color: red\n$primary: #336699\n$overlay-bg: rgba(0, 0, 0, 0.5)',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts allowed colors (transparent, currentColor, inherit)', async () => {
    const result = await lint(
      '.hidden\n  color: transparent\n\n.icon\n  fill: currentColor\n\n.reset\n  color: inherit',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts namespaced function calls with variable arguments', async () => {
    const result = await lint(
      '@use "sass:color"\n$primary: #036\n\n.adjusted\n  color: color.adjust($primary, $lightness: -10%)',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts design token map with colors in variable assignment', async () => {
    const result = await lint(
      '$colors: (primary: #036, error: red, success: green)\n\n.link\n  color: map-get($colors, error)',
    );
    expect(result.warnings).toHaveLength(0);
  });

  // Option: allowInVariables: false

  it('rejects color in variable assignment when allowInVariables is false', async () => {
    const result = await lint('$primary: #036', { allowInVariables: false });
    expect(result.warnings).toHaveLength(1);
  });

  // Option: allowInFunctions: true

  it('accepts color literal in function argument when allowInFunctions is true', async () => {
    const result = await lint('.box\n  background: rgba(0, 0, 0, 0.5)', {
      allowInFunctions: true,
    });
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects color literal in function argument by default', async () => {
    const result = await lint('.box\n  background: rgba(0, 0, 0, 0.5)');
    expect(result.warnings).toHaveLength(1);
  });

  // Option: allowedColors

  it('accepts custom allowed colors', async () => {
    const result = await lint('.box\n  background: white', {
      allowedColors: ['transparent', 'currentColor', 'inherit', 'white'],
    });
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects colors not in allowedColors list', async () => {
    const result = await lint('.box\n  color: red', {
      allowedColors: ['transparent'],
    });
    expect(result.warnings).toHaveLength(1);
  });

  // Edge cases

  it('reports multiple violations in a single rule', async () => {
    const result = await lint('.box\n  color: red\n  background: blue');
    expect(result.warnings).toHaveLength(2);
  });

  it('does not flag non-color values', async () => {
    const result = await lint('.box\n  width: 100px\n  display: block\n  margin: 1em auto');
    expect(result.warnings).toHaveLength(0);
  });

  it('does not flag color in comment', async () => {
    const result = await lint('// color: red\n.box\n  width: 100px');
    expect(result.warnings).toHaveLength(0);
  });
});
