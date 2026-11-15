import { describe, it, expect } from 'vitest';
import recommended from '../../recommended.js';
import customSyntax from '../../syntax.js';
import { hasRule, lintSass } from './lint.js';

const RULE = 'at-charset-rule-no-invalid';
const rules = { [RULE]: true };

describe(`${RULE} on .sass`, () => {
  // sass-parser leaves `@charset` out of the AST, because Sass writes the charset itself.
  it('never sees @charset, which sass-parser drops', () => {
    const root = customSyntax.parse('@charset "UTF-8"\n.a\n  color: red\n');
    const names: string[] = [];
    root.walkAtRules((atRule) => {
      names.push(atRule.name);
    });
    expect(names).toEqual([]);
  });

  // Added in stylelint 18.0.0, so stylelint 17 skips the rule test.
  it.skipIf(!hasRule(RULE))('stays silent even on an invalid @charset', async () => {
    const { problems } = await lintSass(".a\n  color: red\n@charset 'utf-8'\n", rules);
    expect(problems).toEqual([]);
  });

  // The rule cannot report anything in .sass.
  it('stays out of recommended', () => {
    expect(recommended.rules).not.toHaveProperty(RULE);
  });
});
