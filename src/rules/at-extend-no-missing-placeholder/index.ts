/**
 * Rule: `sass/at-extend-no-missing-placeholder`
 *
 * Disallow `@extend` with non-placeholder selectors. Extending classes,
 * elements, or IDs leads to unexpected selector bloat in compiled CSS.
 * Use `%placeholder` selectors instead.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule
 * .alert
 *   @extend .error
 *
 * // GOOD — placeholder selector
 * .sr-only
 *   @extend %visually-hidden
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/at-extend-no-missing-placeholder';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/at-extend-no-missing-placeholder.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Expected a placeholder selector (e.g. %placeholder) to follow @extend',
});

/**
 * Stylelint rule function for `sass/at-extend-no-missing-placeholder`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks `@extend` at-rules
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkAtRules('extend', (node) => {
      let params = node.params.trim();

      // Strip !optional flag before checking selectors
      if (params.endsWith('!optional')) {
        params = params.slice(0, -'!optional'.length).trim();
      }

      const selectors = params.split(',').map((s) => s.trim());

      for (const selector of selectors) {
        if (selector && !selector.startsWith('%')) {
          utils.report({
            message: messages.rejected,
            node,
            result,
            ruleName,
          });
          return;
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
