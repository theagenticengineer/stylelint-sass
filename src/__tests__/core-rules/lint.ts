/**
 * Helpers for the core-rule tests: each test lints indented Sass through the plugin's `/syntax`
 * entry with one core Stylelint rule, as a consumer of `recommended` does.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import stylelint from 'stylelint';
import customSyntax from '../../syntax.js';

/**
 * A Sass-heavy stylesheet: module functions, interpolation, placeholders, `&` suffixes,
 * control flow and nested properties.
 */
export const SASS_CONSTRUCTS = readFileSync(
  resolve(import.meta.dirname, '../fixtures/sass-constructs.sass'),
  'utf8',
);

/**
 * Tells whether the installed Stylelint ships a rule, so tests of rules newer than the oldest
 * supported Stylelint skip there.
 *
 * @param name - The core rule name
 * @returns `true` when the installed Stylelint has the rule
 *
 * @example
 * ```ts
 * describe.skipIf(!hasRule('value-no-invalid'))('value-no-invalid', () => {});
 * ```
 */
export function hasRule(name: string): boolean {
  return name in stylelint.rules;
}

/** A reported problem, reduced to what the tests assert. */
export interface Problem {
  /** The rule that reported it. */
  rule: string;
  /** The message text. */
  text: string;
  /** The 1-based line of the start. */
  line: number;
  /** The 1-based column of the start. */
  column: number;
}

/**
 * Lints indented Sass with the given rules through the plugin syntax.
 *
 * @param code - The `.sass` source
 * @param rules - The Stylelint `rules` object
 * @returns The problems and the option warnings
 *
 * @example
 * ```ts
 * const { problems } = await lintSass('.a\n  color: red\n', { 'color-named': 'never' });
 * ```
 */
export async function lintSass(
  code: string,
  rules: Record<string, unknown>,
): Promise<{ problems: Problem[]; invalidOptions: string[] }> {
  const { results } = await stylelint.lint({
    code,
    codeFilename: 'test.sass',
    config: { customSyntax, rules },
  });
  const result = results[0]!;
  return {
    problems: result.warnings.map(({ rule, text, line, column }) => ({ rule, text, line, column })),
    invalidOptions: result.invalidOptionWarnings.map((warning) => warning.text),
  };
}
