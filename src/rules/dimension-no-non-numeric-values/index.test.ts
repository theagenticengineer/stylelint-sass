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
  rules: { 'sass/dimension-no-non-numeric-values': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/dimension-no-non-numeric-values', () => {
  // BAD cases — should report

  it('rejects string concat with px', async () => {
    const result = await lint('.box\n  width: $n + "px"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('rejects interpolation to build dimension with px', async () => {
    const result = await lint('.container\n  max-width: #{$column-count * 80}px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('rejects concat with em', async () => {
    const result = await lint('.heading\n  font-size: $scale-factor + "em"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('rejects concat with rem', async () => {
    const result = await lint('.body\n  margin-top: $spacing-value + "rem"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('rejects interpolation with %', async () => {
    const result = await lint('.progress\n  width: #{$ratio * 100}%');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('rejects interpolation inside mixin body', async () => {
    const result = await lint('=responsive-width($count)\n  width: #{$count * 120}px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('rejects concat in @return', async () => {
    const result = await lint('@function to-rem($px)\n  @return math.div($px, 16) + "rem"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  // GOOD cases — should NOT report

  it('accepts multiplication by unit literal (px)', async () => {
    const result = await lint('.box\n  width: $n * 1px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts division then multiply by unit (rem)', async () => {
    const result = await lint('.text\n  font-size: math.div($base-size, 16) * 1rem');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiply with em', async () => {
    const result = await lint('.heading\n  font-size: $scale-factor * 1em');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiply with %', async () => {
    const result = await lint('.progress\n  width: $ratio * 100%');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts plain string concat (not a dimension)', async () => {
    const result = await lint('.greeting\n  content: "hello" + " world"');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts direct dimension literals', async () => {
    const result = await lint('$padding: 16px\n$gutter: 1.5rem');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts arithmetic between dimensioned values', async () => {
    const result = await lint(
      '.wrapper\n  width: $total-width - $sidebar-width\n  padding: $base-padding + 4px',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts interpolation in selectors (not values)', async () => {
    const result = await lint('.col-#{$i}\n  flex: 0 0 $i * 1%');
    expect(result.warnings).toHaveLength(0);
  });

  // Edge cases

  it('accepts single-quoted unit string concat as violation', async () => {
    const result = await lint(".box\n  width: $n + 'px'");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/dimension-no-non-numeric-values');
  });

  it('does not flag when rule is disabled', async () => {
    const disabledConfig = {
      plugins: ['./src/index.ts'],
      customSyntax,
      rules: { 'sass/dimension-no-non-numeric-values': [true] },
    };
    const result = await stylelint.lint({
      code: '.box\n  width: $n * 1px',
      config: disabledConfig,
    });
    expect(result.results[0]!.warnings).toHaveLength(0);
  });
});
