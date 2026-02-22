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
  rules: { 'sass/mixins-before-declarations': true },
};

async function lint(code: string, overrides?: object) {
  const result = await stylelint.lint({ code, config: { ...config, ...overrides } });
  return result.results[0]!;
}

describe('sass/mixins-before-declarations', () => {
  // BAD cases
  it('rejects +include shorthand after declaration', async () => {
    const result = await lint('.card\n  padding: 16px\n  +rounded');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/mixins-before-declarations');
  });

  it('rejects @include after declaration', async () => {
    const result = await lint('.card\n  padding: 16px\n  @include rounded');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/mixins-before-declarations');
  });

  it('rejects mixin between declarations', async () => {
    const result = await lint(
      '.hero\n  display: flex\n  +respond-to(md)\n    flex-direction: row\n  color: white',
    );
    expect(result.warnings).toHaveLength(1);
  });

  it('rejects multiple mixins when some are after declarations', async () => {
    const result = await lint('.btn\n  +reset\n  background: blue\n  +hover-state');
    expect(result.warnings).toHaveLength(1);
  });

  // GOOD cases
  it('accepts mixins before declarations', async () => {
    const result = await lint('.card\n  +rounded\n  padding: 16px\n  background: white');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts multiple mixins before declarations', async () => {
    const result = await lint('.btn\n  +reset\n  +hover-state\n  background: blue\n  padding: 8px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts @include syntax before declarations', async () => {
    const result = await lint('.card\n  @include rounded\n  @include shadow(2)\n  padding: 16px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts ignored mixin after declarations', async () => {
    const result = await lint(
      '.grid\n  +flex-layout\n  display: grid\n  gap: 16px\n  +respond-to(md)\n    grid-template-columns: repeat(2, 1fr)',
      {
        rules: {
          'sass/mixins-before-declarations': [true, { ignore: ['respond-to'] }],
        },
      },
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts rule with only mixins and no declarations', async () => {
    const result = await lint('.icon\n  +size(24px)\n  +center');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects mixin after declaration inside a nested rule', async () => {
    const result = await lint('.parent\n  .child\n    padding: 10px\n    +rounded');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/mixins-before-declarations');
  });

  it('still rejects non-ignored mixin when ignore option is set', async () => {
    const result = await lint(
      '.grid\n  display: grid\n  +respond-to(md)\n    gap: 16px\n  +not-ignored',
      {
        rules: {
          'sass/mixins-before-declarations': [true, { ignore: ['respond-to'] }],
        },
      },
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/mixins-before-declarations');
  });

  it('accepts multiple ignored mixins after declarations', async () => {
    const result = await lint(
      '.grid\n  display: grid\n  +respond-to(md)\n    gap: 16px\n  +breakpoint(lg)\n    gap: 24px',
      {
        rules: {
          'sass/mixins-before-declarations': [true, { ignore: ['respond-to', 'breakpoint'] }],
        },
      },
    );
    expect(result.warnings).toHaveLength(0);
  });
});
