import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, lintSass } from './lint.js';

const SOURCE = '.a\n  & > .b\n    color: red\n  > .c\n    color: red\n  & .d\n    color: red\n';

describe('relative-selector-nesting-notation on .sass', () => {
  it('reports the explicit notation with "implicit", descendant `& .d` included', async () => {
    const { problems } = await lintSass(SOURCE, {
      'relative-selector-nesting-notation': 'implicit',
    });
    expect(problems.map(({ line, column }) => ({ line, column }))).toEqual([
      { line: 2, column: 3 },
      { line: 6, column: 3 },
    ]);
    expect(problems[0]!.text).toBe(
      'Expected implicit nesting notation (relative-selector-nesting-notation)',
    );
  });

  it('reports the implicit notation with "explicit"', async () => {
    const { problems } = await lintSass(SOURCE, {
      'relative-selector-nesting-notation': 'explicit',
    });
    expect(problems.map(({ line, column }) => ({ line, column }))).toEqual([
      { line: 4, column: 3 },
    ]);
  });

  // Both rules report `& > .b` and `& .d`, so a project that enables the core rule with
  // "implicit" gets each problem twice.
  it('reports the same selectors as sass/selector-no-redundant-nesting-selector', async () => {
    const { problems } = await lintSass(SOURCE, {
      'relative-selector-nesting-notation': 'implicit',
      'sass/selector-no-redundant-nesting-selector': true,
    });
    expect(problems.map(({ rule, line }) => `${rule}:${line}`).sort()).toEqual([
      'relative-selector-nesting-notation:2',
      'relative-selector-nesting-notation:6',
      'sass/selector-no-redundant-nesting-selector:2',
      'sass/selector-no-redundant-nesting-selector:6',
    ]);
  });

  it('stays silent on Sass constructs with "implicit"', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, {
      'relative-selector-nesting-notation': 'implicit',
    });
    expect(problems).toEqual([]);
  });

  // A style preference that `sass/selector-no-redundant-nesting-selector` already enforces in
  // recommended, so enabling both would report each problem twice.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty('relative-selector-nesting-notation');
  });
});
