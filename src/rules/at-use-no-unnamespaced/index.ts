/**
 * Rule: `sass/at-use-no-unnamespaced`
 *
 * Disallow `@use` with `as *` (unnamespaced). Unnamespaced `@use` dumps
 * all members into the current scope, defeating the purpose of the module
 * system and risking name collisions — the same problem `@import` had.
 *
 * @example
 * ```sass
 * // BAD — unnamespaced @use dumps everything into global scope
 * @use "variables" as *
 *
 * // GOOD — use a namespace
 * @use "variables"
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/at-use-no-unnamespaced';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/at-use-no-unnamespaced.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected @use with `as *`. Use an explicit namespace instead',
});

/**
 * Extracts the original source text for a node from its source map.
 *
 * @param node - The PostCSS at-rule node
 * @returns The original source text, or `undefined` if unavailable
 */
function getOriginalSource(node: {
  source?: { input: { css: string }; start?: { offset: number }; end?: { offset: number } };
}): string | undefined {
  if (!node.source?.start || !node.source?.end) return undefined;
  return node.source.input.css.slice(node.source.start.offset, node.source.end.offset + 1);
}

/**
 * Stylelint rule function for `sass/at-use-no-unnamespaced`.
 *
 * Walks `@use` at-rules and reports any that contain `as *`.
 * Uses original source text because sass-parser may normalize params.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks `@use` at-rules
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkAtRules('use', (node) => {
      const original = getOriginalSource(node);
      if (!original) return;

      // Strip inline comments before matching
      const cleaned = original
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();

      // Check for `as *` pattern — with optional `with (...)` after
      if (/\bas\s+\*\s*(?:with\s*\(|$)/i.test(cleaned)) {
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
