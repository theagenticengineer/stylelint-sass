/**
 * Rule: `sass/dollar-variable-pattern`
 *
 * Enforce a naming pattern for `$variable` declarations.
 * Default enforces `kebab-case`.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule (camelCase)
 * $fontSize: 16px
 * ```
 */
import stylelint from 'stylelint';
import { matchesPattern, toRegExp } from '../../utils/patterns.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/dollar-variable-pattern';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/dollar-variable-pattern.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param name - The variable name that violated the pattern
 * @param pattern - The expected pattern as a string
 */
const messages = utils.ruleMessages(ruleName, {
  expected: (name: string, pattern: string) => `Expected $${name} to match pattern "${pattern}"`,
});

/** Default pattern: kebab-case */
const DEFAULT_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Stylelint rule function for `sass/dollar-variable-pattern`.
 *
 * Walks all declarations and checks those whose property starts with `$`
 * against the configured pattern.
 *
 * @param primary - A regex pattern (string or RegExp) to match variable names against
 * @returns A PostCSS plugin callback that walks declarations
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

    root.walkDecls((decl) => {
      const prop = decl.prop;

      // Only check Sass variable declarations ($name)
      if (!prop.startsWith('$')) return;

      const name = prop.slice(1);

      if (!matchesPattern(name, pattern)) {
        utils.report({
          message: messages.expected(name, pattern.toString()),
          node: decl,
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
