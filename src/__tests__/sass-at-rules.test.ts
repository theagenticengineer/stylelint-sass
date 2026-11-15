import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';
import recommended from '../recommended.js';

// Every Sass at-rule, in indented syntax.
const SASS_AT_RULES = [
  '@use "sass:math"',
  '@forward "src/list"',
  '@mixin button($size)',
  '  padding: $size',
  '  @content',
  '@function double($n)',
  '  @return $n * 2',
  '%base',
  '  margin: 0',
  '.a',
  '  @extend %base',
  '  @include button(1px)',
  '    color: $c',
  '  @at-root .b',
  '    color: $c',
  '  @if $x',
  '    color: $c',
  '  @else if $y',
  '    color: $d',
  '  @else',
  '    color: $e',
  '  @each $item in $list',
  '    color: $item',
  '  @for $i from 1 through 3',
  '    color: $c',
  '  @while $i > 0',
  '    color: $c',
  '  @error "x"',
  '  @warn "x"',
  '  @debug "x"',
  '',
].join('\n');

describe('at-rule-no-unknown in recommended', () => {
  it('accepts every Sass at-rule', async () => {
    const { results } = await stylelint.lint({
      code: SASS_AT_RULES,
      config: {
        customSyntax,
        rules: { 'at-rule-no-unknown': recommended.rules['at-rule-no-unknown'] },
      },
    });
    expect(results[0]!.warnings.map((w) => w.text)).toEqual([]);
  });

  it('still reports an unknown at-rule', async () => {
    const { results } = await stylelint.lint({
      code: '.a\n  @foo 1\n',
      config: {
        customSyntax,
        rules: { 'at-rule-no-unknown': recommended.rules['at-rule-no-unknown'] },
      },
    });
    expect(results[0]!.warnings.map((w) => w.rule)).toEqual(['at-rule-no-unknown']);
  });
});
