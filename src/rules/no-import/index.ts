/**
 * Rule: `sass/no-import`
 *
 * Disallow `@import`. The Sass team deprecated `@import` in Dart Sass 1.80
 * in favor of `@use` and `@forward`. Using `@import` causes global namespace
 * pollution and makes dependency tracking impossible.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule
 * @import "variables"
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/** Fully qualified rule name including the plugin namespace. */
const ruleName = 'sass/no-import';

/** Rule metadata for documentation linking. */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/no-import.md',
};

/** Diagnostic messages produced by this rule. */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected @import. Use @use or @forward instead',
});

/**
 * Stylelint rule function for `sass/no-import`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks at-rules
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual: primary });
    if (!validOptions) return;

    root.walkAtRules('import', (node) => {
      utils.report({ message: messages.rejected, node, result, ruleName });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
