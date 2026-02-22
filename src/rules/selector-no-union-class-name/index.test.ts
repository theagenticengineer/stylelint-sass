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
  rules: { 'sass/selector-no-union-class-name': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0]!;
}

describe('sass/selector-no-union-class-name', () => {
  // BAD cases
  it('rejects union with hyphen (&-item)', async () => {
    const result = await lint('.nav\n  &-item\n    display: inline-block');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-union-class-name');
  });

  it('rejects union with underscore (&_header)', async () => {
    const result = await lint('.card\n  &_header\n    font-weight: bold');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-union-class-name');
  });

  it('rejects camelCase concatenation (&Primary)', async () => {
    const result = await lint('.btn\n  &Primary\n    background: blue');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-union-class-name');
  });

  it('rejects BEM modifier (&--disabled)', async () => {
    const result = await lint('.btn\n  &--disabled\n    opacity: 0.5\n    pointer-events: none');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/selector-no-union-class-name');
  });

  it('rejects deep nesting (&-list / &-item)', async () => {
    const result = await lint('.nav\n  &-list\n    margin: 0\n    &-item\n      display: inline');
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings[0].rule).toBe('sass/selector-no-union-class-name');
    expect(result.warnings[1].rule).toBe('sass/selector-no-union-class-name');
  });

  // GOOD cases
  it('accepts descendant selector (& .item)', async () => {
    const result = await lint('.nav\n  & .item\n    display: inline-block');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts compound selector (&.is-active)', async () => {
    const result = await lint('.btn\n  &.is-active\n    background: green');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts pseudo-class (&:hover)', async () => {
    const result = await lint('.link\n  &:hover\n    text-decoration: underline');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts pseudo-element (&::before)', async () => {
    const result = await lint('.icon\n  &::before\n    content: ""\n    display: block');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts standalone class (.nav-item)', async () => {
    const result = await lint('.nav-item\n  display: inline-block');
    expect(result.warnings).toHaveLength(0);
  });

  it('accepts adjacent sibling combinator (& + .card)', async () => {
    const result = await lint('.card\n  & + .card\n    margin-top: 16px');
    expect(result.warnings).toHaveLength(0);
  });
});
