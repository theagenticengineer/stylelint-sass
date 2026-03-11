/**
 * Rule: `sass/at-if-no-null`
 *
 * Disallow explicit `null` comparisons in `@if` conditions.
 * Sass truthiness checks already handle `null` implicitly, so
 * `@if $x != null` can be replaced with `@if $x` and
 * `@if $x == null` can be replaced with `@if not $x`.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule
 * @if $x != null
 *   color: red
 *
 * // GOOD — use truthiness instead
 * @if $x
 *   color: red
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/at-if-no-null';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/at-if-no-null.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected null comparison. Use Sass truthiness instead',
});

/**
 * Pattern that matches explicit null comparisons in `@if` conditions.
 *
 * Matches both `$var == null`, `$var != null` and reversed forms
 * like `null == $var`, `null != $var`.
 */
const nullComparisonPattern = /\bnull\b\s*(?:==|!=)|(?:==|!=)\s*\bnull\b/;

/**
 * Stylelint rule function for `sass/at-if-no-null`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks `@if` at-rules
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkAtRules('if', (node) => {
      if (nullComparisonPattern.test(node.params)) {
        utils.report({
          message: messages.rejected,
          node,
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
