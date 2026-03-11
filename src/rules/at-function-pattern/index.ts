/**
 * Rule: `sass/at-function-pattern`
 *
 * Enforce a naming pattern for `@function` names.
 * Default enforces `kebab-case`.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule (camelCase)
 * @function toRem($px)
 *   @return $px / 16 * 1rem
 * ```
 */
import stylelint from 'stylelint';
import { matchesPattern, toRegExp } from '../../utils/patterns.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/at-function-pattern';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/at-function-pattern.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param name - The function name that violated the pattern
 * @param pattern - The expected pattern as a string
 */
const messages = utils.ruleMessages(ruleName, {
  expected: (name: string, pattern: string) =>
    `Expected @function "${name}" to match pattern "${pattern}"`,
});

/** Default pattern: kebab-case */
const DEFAULT_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Extract the function name from `atRule.params`.
 *
 * The params string contains the function name followed by optional
 * parenthesised arguments, e.g. `"to-rem($px)"` or `"get-base-size"`.
 *
 * @param params - The raw `params` string from the `@function` at-rule
 * @returns The function name (first word before `(` or whitespace)
 *
 * @example
 * ```ts
 * extractFunctionName('to-rem($px)'); // 'to-rem'
 * extractFunctionName('spacing($m)'); // 'spacing'
 * ```
 */
function extractFunctionName(params: string): string {
  const trimmed = params.trim();
  const match = trimmed.match(/^([^\s(]+)/);
  return match ? match[1]! : trimmed;
}

/**
 * Stylelint rule function for `sass/at-function-pattern`.
 *
 * Walks all `@function` at-rules and checks their names against
 * the configured pattern.
 *
 * @param primary - A regex pattern (string or RegExp) to match
 *   function names against
 * @returns A PostCSS plugin callback that walks at-rules
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
      possible: [(v: unknown) => v instanceof RegExp || typeof v === 'string'],
    });
    if (!validOptions) return;

    const pattern = primary ? toRegExp(primary) : DEFAULT_PATTERN;
    if (!pattern) return;

    root.walkAtRules('function', (atRule) => {
      const name = extractFunctionName(atRule.params);

      if (!matchesPattern(name, pattern)) {
        utils.report({
          message: messages.expected(name, pattern.toString()),
          node: atRule,
          result,
          ruleName,
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
