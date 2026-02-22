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
  rules: { 'sass/selector-no-redundant-nesting-selector': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

/**
 * Run lint with autofix and return the selectors from the fixed PostCSS root.
 *
 * Stylelint stringifies fixed output with the default CSS stringifier, so we
 * walk the PostCSS root directly to inspect fixed selectors.
 *
 * @param code - Sass indented-syntax source
 * @returns Array of selector strings from the fixed AST
 */
async function lintFix(code: string) {
  const result = await stylelint.lint({ code, config, fix: true });
  const selectors: string[] = [];
  result.results[0]!._postcssResult!.root.walkRules((r: { selector: string }) => {
    selectors.push(r.selector);
  });
  return selectors;
}

describe('sass/selector-no-redundant-nesting-selector', () => {
  // BAD cases from spec

  it('rejects redundant & with descendant selector', async () => {
    const result = await lint('.parent\n  & .child\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-redundant-nesting-selector');
    const selectors = await lintFix('.parent\n  & .child\n    color: red');
    expect(selectors).toContain('.child');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  it('rejects redundant & with child combinator', async () => {
    const result = await lint('.parent\n  & > .child\n    color: red');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-redundant-nesting-selector');
    const selectors = await lintFix('.parent\n  & > .child\n    color: red');
    expect(selectors).toContain('> .child');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  it('rejects redundant & before element selector', async () => {
    const result = await lint('.nav\n  & li\n    display: inline');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-redundant-nesting-selector');
    const selectors = await lintFix('.nav\n  & li\n    display: inline');
    expect(selectors).toContain('li');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  // GOOD cases from spec

  it('accepts simple nesting without &', async () => {
    const result = await lint('.parent\n  .child\n    color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & for BEM concatenation (modifier)', async () => {
    const result = await lint('.btn\n  &--primary\n    background: blue');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & for BEM concatenation (element)', async () => {
    const result = await lint('.btn\n  &__icon\n    margin-right: 8px');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & for pseudo-class :hover', async () => {
    const result = await lint('.link\n  &:hover\n    text-decoration: underline');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & for pseudo-class :focus-visible', async () => {
    const result = await lint('.link\n  &:focus-visible\n    outline: 2px solid blue');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & for pseudo-element ::before', async () => {
    const result = await lint('.icon\n  &::before\n    content: ""\n    display: block');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & in compound selector', async () => {
    const result = await lint('.card\n  &.is-active\n    border-color: blue');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & after another selector (non-first position)', async () => {
    const result = await lint('.child\n  .parent &\n    color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts & in @at-root interpolation', async () => {
    const result = await lint('.component\n  @at-root #{&}-wrapper\n    display: block');
    expect(result.warnings).toHaveLength(0);
  });

  // Edge cases

  it('rejects redundant & with sibling combinator', async () => {
    const result = await lint('.parent\n  & + .sibling\n    color: red');
    expect(result.warnings).toHaveLength(1);
    const selectors = await lintFix('.parent\n  & + .sibling\n    color: red');
    expect(selectors).toContain('+ .sibling');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  it('rejects redundant & with general sibling combinator', async () => {
    const result = await lint('.parent\n  & ~ .sibling\n    color: red');
    expect(result.warnings).toHaveLength(1);
    const selectors = await lintFix('.parent\n  & ~ .sibling\n    color: red');
    expect(selectors).toContain('~ .sibling');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  it('reports multiple redundant & in same parent', async () => {
    const result = await lint('.parent\n  & .child\n    color: red\n  & li\n    color: blue');
    expect(result.warnings).toHaveLength(2);
    const selectors = await lintFix('.parent\n  & .child\n    color: red\n  & li\n    color: blue');
    expect(selectors).toContain('.child');
    expect(selectors).toContain('li');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  it('detects and fixes redundant & with multiple spaces', async () => {
    const result = await lint('.parent\n  &  .child\n    color: red');
    expect(result.warnings).toHaveLength(1);
    const selectors = await lintFix('.parent\n  &  .child\n    color: red');
    expect(selectors).toContain('.child');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });

  it('accepts lone & (entire selector is just &)', async () => {
    // A lone & by itself is a different pattern — it references the parent.
    // This is typically used with @at-root or similar constructs.
    // We do NOT flag it because it is syntactically valid and not redundant
    // in the way described by the spec.
    const result = await lint('.parent\n  &\n    color: red');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts selector list with & concatenation', async () => {
    const result = await lint('.btn\n  &:hover, &:focus\n    outline: none');
    expect(result.warnings).toHaveLength(0);
  });

  it('rejects redundant & in deeply nested rule', async () => {
    const result = await lint('.a\n  .b\n    & .c\n      color: red');
    expect(result.warnings).toHaveLength(1);
    const selectors = await lintFix('.a\n  .b\n    & .c\n      color: red');
    expect(selectors).toContain('.c');
    expect(selectors).not.toContainEqual(expect.stringMatching(/^&\s/));
  });
});
