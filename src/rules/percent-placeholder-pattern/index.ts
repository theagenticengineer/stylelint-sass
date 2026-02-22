/**
 * Rule: `sass/percent-placeholder-pattern`
 *
 * Enforce a naming pattern for `%placeholder` selectors.
 * Default enforces `kebab-case`.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule (camelCase)
 * %visuallyHidden
 *   display: none
 * ```
 */
import stylelint from 'stylelint';
import { matchesPattern, toRegExp } from '../../utils/patterns.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/percent-placeholder-pattern';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/percent-placeholder-pattern.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param name - The placeholder name that violated the pattern
 * @param pattern - The expected pattern as a string
 */
const messages = utils.ruleMessages(ruleName, {
  expected: (name: string, pattern: string) => `Expected %${name} to match pattern "${pattern}"`,
});

/** Default pattern: kebab-case */
const DEFAULT_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Stylelint rule function for `sass/percent-placeholder-pattern`.
 *
 * Walks all rules and checks those whose selector starts with `%`
 * against the configured pattern.
 *
 * @param primary - A regex pattern (string or RegExp) to match
 *   placeholder names against
 * @returns A PostCSS plugin callback that walks rules
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

    root.walkRules((rule) => {
      const selector = rule.selector;

      // Only check placeholder selectors (%name)
      if (!selector.startsWith('%')) return;

      const name = selector.slice(1);

      if (!matchesPattern(name, pattern)) {
        utils.report({
          message: messages.expected(name, pattern.toString()),
          node: rule,
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
