/**
 * Rule: `sass/selector-no-union-class-name`
 *
 * Disallow using the parent selector (`&`) to construct union class names
 * like `&-suffix` or `&_suffix`. These create class names that cannot be
 * searched in the codebase because the final name (e.g. `.block-element`)
 * never appears literally in the source.
 *
 * @example
 * ```sass
 * // BAD — union with hyphen; .nav-item can't be found via search
 * .nav
 *   &-item
 *     display: inline-block
 *
 * // GOOD — descendant selector; & is followed by a space
 * .nav
 *   & .item
 *     display: inline-block
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/selector-no-union-class-name';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/selector-no-union-class-name.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected union class name with parent selector (&)',
});

/**
 * Pattern that matches `&` immediately followed by a character that forms
 * a union class name: a letter, digit, hyphen, or underscore.
 *
 * This excludes valid uses like `&.class`, `&:pseudo`, `&::pseudo-element`,
 * `& .descendant`, `& + .sibling`, `& ~ .general-sibling`, `& > .child`,
 * and `&[attr]`.
 */
const unionPattern = /&[a-zA-Z0-9_-]/;

/**
 * Stylelint rule function for `sass/selector-no-union-class-name`.
 *
 * Walks all rules in the PostCSS AST and checks each selector for
 * parent selector unions. Selector lists (comma-separated) are split
 * and each part is checked independently.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks rule selectors
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkRules((rule) => {
      const selector = rule.selector;

      // Split selector list by comma and check each part
      const parts = selector.split(',');

      for (const part of parts) {
        const trimmed = part.trim();
        if (unionPattern.test(trimmed)) {
          utils.report({
            message: messages.rejected,
            node: rule,
            result,
            ruleName,
            word: trimmed,
          });
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
