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
  rules: { 'sass/no-duplicate-dollar-variables': true },
};

async function lint(code: string, overrides?: Record<string, unknown>) {
  const result = await stylelint.lint({
    code,
    config: overrides ? { ...config, rules: { ...overrides } } : config,
  });
  return result.results[0]!;
}

describe('sass/no-duplicate-dollar-variables', () => {
  // BAD cases — should report

  it('rejects duplicate at root scope', async () => {
    const result = await lint('$color: red\n$color: blue');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-dollar-variables');
  });

  it('rejects duplicate inside same rule block', async () => {
    const result = await lint('.component\n  $size: 16px\n  $size: 20px\n  font-size: $size');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-dollar-variables');
  });

  it('rejects duplicate across declarations in same scope', async () => {
    const result = await lint('$spacing: 8px\n$primary: blue\n$spacing: 12px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-duplicate-dollar-variables');
  });

  // GOOD cases — should NOT report

  it('accepts unique variable names', async () => {
    const result = await lint('$spacing-sm: 4px\n$spacing-md: 8px\n$spacing-lg: 16px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts same name in different scopes', async () => {
    const result = await lint('$color: red\n\n.component\n  $color: blue\n  color: $color');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts different variables', async () => {
    const result = await lint('$font-family: sans-serif\n$font-size: 16px\n$font-weight: 400');
    expect(result.warnings).toHaveLength(0);
  });

  // Options: ignoreDefaults

  it('reports !default duplicate when ignoreDefaults is off', async () => {
    const result = await lint('$primary: blue !default\n$primary: red');
    expect(result.warnings).toHaveLength(1);
  });

  it('ignores !default with ignoreDefaults: true', async () => {
    const result = await lint('$primary: blue !default\n$primary: red', {
      'sass/no-duplicate-dollar-variables': [true, { ignoreDefaults: true }],
    });
    expect(result.warnings).toHaveLength(0);
  });

  // Options: ignoreInside

  it('ignores duplicates inside if-else with ignoreInside: ["if-else"]', async () => {
    // $bg at root AND inside @if — would be a same-scope duplicate without ignoreInside
    const code = ['$bg: white', '', '@if $theme == dark', '  $bg: #111', '  $bg: #222'].join('\n');
    // Without the option, the two $bg inside @if would trigger a warning
    const withoutOption = await lint(code);
    expect(withoutOption.warnings).toHaveLength(1);
    // With the option, duplicates inside if-else are ignored
    const result = await lint(code, {
      'sass/no-duplicate-dollar-variables': [true, { ignoreInside: ['if-else'] }],
    });
    expect(result.warnings).toHaveLength(0);
  });

  it('ignores duplicates inside at-rule with ignoreInside: ["at-rule"]', async () => {
    const code = ['@mixin theme($mode)', '  $bg: white', '  $bg: black'].join('\n');
    // Without the option, duplicate $bg inside @mixin triggers a warning
    const withoutOption = await lint(code);
    expect(withoutOption.warnings).toHaveLength(1);
    // With the option, duplicates inside any at-rule are ignored
    const result = await lint(code, {
      'sass/no-duplicate-dollar-variables': [true, { ignoreInside: ['at-rule'] }],
    });
    expect(result.warnings).toHaveLength(0);
  });

  it('still reports root-scope duplicates with ignoreInside: ["if-else"]', async () => {
    const code = [
      '$var: 10px',
      '@if true',
      '  $inner-var: 20px',
      '  $inner-var: 30px',
      '$var: 50px',
    ].join('\n');
    const result = await lint(code, {
      'sass/no-duplicate-dollar-variables': [true, { ignoreInside: ['if-else'] }],
    });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]!.text).toContain("'$var'");
  });

  it('still reports root-scope duplicates with ignoreInside: ["at-rule"]', async () => {
    const code = [
      '$var: 10px',
      '@mixin test',
      '  $inner-var: 20px',
      '  $inner-var: 30px',
      '$var: 50px',
    ].join('\n');
    const result = await lint(code, {
      'sass/no-duplicate-dollar-variables': [true, { ignoreInside: ['at-rule'] }],
    });
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]!.text).toContain("'$var'");
  });

  it('ignores both if-else and at-rule with ignoreInside: ["if-else", "at-rule"]', async () => {
    const code = [
      '$root: 1px',
      '@mixin theme',
      '  $mixin-var: 2px',
      '  $mixin-var: 3px',
      '@if true',
      '  $if-var: 4px',
      '  $if-var: 5px',
      '$root: 6px',
    ].join('\n');
    const result = await lint(code, {
      'sass/no-duplicate-dollar-variables': [true, { ignoreInside: ['if-else', 'at-rule'] }],
    });
    // Only $root duplicate at root scope should be reported
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]!.text).toContain("'$root'");
  });
});
