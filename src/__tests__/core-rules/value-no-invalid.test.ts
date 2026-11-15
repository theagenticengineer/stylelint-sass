import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import { SASS_CONSTRUCTS, hasRule, lintSass } from './lint.js';

const RULE = 'value-no-invalid';
const rules = { [RULE]: true };

/**
 * Lints one declaration value with the rule.
 *
 * @param value - The value of `padding`
 * @returns The problem texts
 */
async function problemsFor(value: string): Promise<string[]> {
  const { problems } = await lintSass(`.a\n  padding: ${value}\n`, rules);
  return problems.map(({ text }) => text);
}

// Added in stylelint 18.0.0, so stylelint 17 skips these tests.
describe.skipIf(!hasRule(RULE))('value-no-invalid on .sass', () => {
  it('reports a number added to a dimension inside calc()', async () => {
    const { problems } = await lintSass('.a\n  top: calc(1px + 2)\n', rules);
    expect(problems.map(({ text, line, column }) => ({ text, line, column }))).toEqual([
      {
        text: `Invalid value "1px + 2", a number and a dimension or percentage cannot be added (${RULE})`,
        line: 2,
        column: 12,
      },
    ]);
  });

  // Outside calc() these are Sass expressions, which Sass evaluates before CSS sees them.
  it.each([
    '$a + 2',
    '1px + 2',
    'math.div(100%, 3) + 1',
    'if($x, 1px, 2px)',
    'map.get($m, a)',
    'math.div($a, 2)',
    '(1px + 2)',
    'calc(100% - #{$gap})',
    'url($path)',
    'fn(#{$a})',
    'rgba(tokens.$shadow, 0.2)',
  ])('accepts %s', async (value) => {
    expect(await problemsFor(value)).toEqual([]);
  });

  // The rule cannot parse a `$variable` inside a plain function call or a space-separated
  // list, which is everyday Sass. These false positives keep it out of recommended, and an
  // upstream fix shows up here as a failing test.
  it.each([
    ['double($gap)', '")" is expected'],
    ['rgba($c, 0.5)', '")" is expected'],
    ['darken($c, 5%)', '")" is expected'],
    ['translate($x)', '")" is expected'],
    ['calc($a + 1px)', '")" is expected'],
    ['min($a, 1px)', '")" is expected'],
    ['1px solid $c', 'unexpected input'],
  ])('reports the valid Sass %s', async (value, reason) => {
    const reported = await problemsFor(value);
    expect(reported).toHaveLength(1);
    expect(reported[0]).toContain(reason);
  });

  it('stays silent on Sass constructs', async () => {
    const { problems } = await lintSass(SASS_CONSTRUCTS, rules);
    expect(problems).toEqual([]);
  });
});

it('stays out of recommended', () => {
  expect(recommended.rules).not.toHaveProperty(RULE);
});
