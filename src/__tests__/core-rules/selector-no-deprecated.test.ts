import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, lintSass } from './lint.js';

const rules = { 'selector-no-deprecated': true };

describe('selector-no-deprecated on .sass', () => {
  it('reports deprecated pseudo-classes in nested and top-level rules', async () => {
    const { problems } = await lintSass(
      '.a\n  &:-moz-any(.b)\n    color: red\nb:matches(.x)\n  color: red\n',
      rules,
    );
    expect(problems.map(({ text, line, column }) => ({ text, line, column }))).toEqual([
      { text: 'Expected ":-moz-any" to be ":is" (selector-no-deprecated)', line: 2, column: 4 },
      { text: 'Expected ":matches" to be ":is" (selector-no-deprecated)', line: 4, column: 2 },
    ]);
  });

  it('stays silent on Sass constructs', async () => {
    const { problems, invalidOptions } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(invalidOptions).toEqual([]);
    expect(problems).toEqual([]);
  });

  it('stays silent on interpolated selectors', async () => {
    const { problems } = await lintSass(
      '.#{$b}-c:not(.#{$d})\n  color: red\n#{$sel}\n  color: red\n.e:nth-child(#{$n})\n  color: red\n',
      rules,
    );
    expect(problems).toEqual([]);
  });

  it('is part of recommended', () => {
    expect(recommended.rules['selector-no-deprecated']).toBe(true);
  });
});
