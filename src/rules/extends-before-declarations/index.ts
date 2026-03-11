/**
 * Rule: `sass/extends-before-declarations`
 *
 * `@extend` statements must appear before property declarations within a rule
 * block. This enforces a predictable ordering: extends first, then properties.
 *
 * @example
 * ```sass
 * // BAD — @extend after declaration
 * .alert
 *   color: red
 *   @extend %message-base
 *
 * // GOOD — @extend before declarations
 * .alert
 *   @extend %message-base
 *   color: red
 * ```
 */
import stylelint from 'stylelint';
import { classifyChild } from '../../utils/ordering.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/extends-before-declarations';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/extends-before-declarations.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: '@extend must come before declarations',
});

/**
 * Stylelint rule function for `sass/extends-before-declarations`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks rule blocks
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkRules((rule) => {
      let seenDeclaration = false;

      rule.each((child) => {
        const kind = classifyChild(child);

        if (kind === 'declaration') {
          seenDeclaration = true;
        } else if (kind === 'extend' && seenDeclaration) {
          utils.report({
            message: messages.rejected,
            node: child,
            result,
            ruleName,
          });
        }
      });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
