/**
 * Rule: `sass/declarations-before-nesting`
 *
 * Property declarations must appear before nested rules within a rule block.
 * This enforces a predictable ordering: extends, then mixins, then
 * declarations, then nested rules.
 *
 * @example
 * ```sass
 * // BAD — nested rule before declaration
 * .card
 *   .title
 *     font-weight: bold
 *   padding: 16px
 *
 * // GOOD — declarations before nested rules
 * .card
 *   padding: 16px
 *   background: white
 *
 *   .title
 *     font-weight: bold
 * ```
 */
import stylelint from 'stylelint';
import { classifyChild } from '../../utils/ordering.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/declarations-before-nesting';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/declarations-before-nesting.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Declarations must come before nested rules',
});

/**
 * Stylelint rule function for `sass/declarations-before-nesting`.
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
      let seenNestedRule = false;

      rule.each((child) => {
        const kind = classifyChild(child);

        if (kind === 'nested-rule') {
          seenNestedRule = true;
        } else if (kind === 'declaration' && seenNestedRule) {
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
