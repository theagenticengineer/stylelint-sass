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
  rules: { 'sass/declarations-before-nesting': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/declarations-before-nesting', () => {
  // BAD cases
  it('rejects nested rule before declaration', async () => {
    const result = await lint('.card\n  .title\n    font-weight: bold\n  padding: 16px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/declarations-before-nesting');
  });

  it('rejects mixed ordering', async () => {
    const result = await lint(
      '.nav\n  color: white\n  .item\n    display: inline-block\n  background: navy',
    );
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/declarations-before-nesting');
  });

  it('rejects pseudo-selector nesting before declaration', async () => {
    const result = await lint('.link\n  &:hover\n    text-decoration: underline\n  color: blue');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/declarations-before-nesting');
  });

  it('rejects parent selector nesting before declaration', async () => {
    const result = await lint('.btn\n  &--primary\n    background: blue\n  padding: 8px 16px');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/declarations-before-nesting');
  });

  // GOOD cases
  it('accepts declarations before nested rules', async () => {
    const result = await lint(
      '.card\n  padding: 16px\n  background: white\n\n  .title\n    font-weight: bold\n\n  .body\n    line-height: 1.5',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts full ordering (extends, mixins, declarations, nested)', async () => {
    const result = await lint(
      '.card\n  @extend %rounded\n  +shadow(2)\n  padding: 16px\n  background: white\n\n  .title\n    font-weight: bold',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts pseudo-selectors after declarations', async () => {
    const result = await lint(
      '.link\n  color: blue\n  text-decoration: none\n\n  &:hover\n    text-decoration: underline\n\n  &:focus\n    outline: 2px solid blue',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts BEM modifier after declarations', async () => {
    const result = await lint(
      '.btn\n  padding: 8px 16px\n  border: none\n\n  &--primary\n    background: blue\n\n  &--secondary\n    background: gray',
    );
    expect(result.warnings).toHaveLength(0);
  });

  // Edge cases
  it('accepts rule block with only declarations', async () => {
    const result = await lint('.header\n  font-size: 24px\n  margin-bottom: 1rem');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts rule block with only nested rules', async () => {
    const result = await lint(
      '.button\n  &:hover\n    opacity: 0.8\n  .icon\n    margin-right: 5px',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts empty rule block', async () => {
    const result = await lint('.empty\n  // nothing here');
    expect(result.warnings).toHaveLength(0);
  });

  it('ignores comments between nested rules and declarations', async () => {
    const result = await lint(
      '.card\n  padding: 16px\n  // a comment\n  .title\n    font-weight: bold',
    );
    expect(result.warnings).toHaveLength(0);
  });

  it('ignores @media at-rules (not treated as nested rules)', async () => {
    const result = await lint(
      '.container\n  @media (min-width: 768px)\n    display: grid\n  padding: 10px',
    );
    expect(result.warnings).toHaveLength(0);
  });
});
