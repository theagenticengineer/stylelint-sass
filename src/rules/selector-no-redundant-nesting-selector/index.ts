/**
 * Rule: `sass/selector-no-redundant-nesting-selector`
 *
 * Disallow redundant nesting selectors (`&`) that don't add meaning.
 * A lone `&` at the start of a selector that doesn't concatenate or use
 * pseudo-classes/elements produces the same output as omitting it.
 *
 * @example
 * ```sass
 * // BAD — redundant &
 * .parent
 *   & .child
 *     color: red
 *
 * // GOOD — & omitted
 * .parent
 *   .child
 *     color: red
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/selector-no-redundant-nesting-selector';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/selector-no-redundant-nesting-selector.md',
  fixable: true,
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected redundant nesting selector (&)',
});

/**
 * Pattern that matches a redundant `&` at the start of a single selector.
 *
 * A nesting selector is redundant when it appears at the very beginning
 * followed by whitespace (optionally with a combinator like `>`, `+`, `~`).
 * This means it simply re-states the parent context without concatenation,
 * pseudo-classes, pseudo-elements, or compound selectors.
 *
 * Examples that match (redundant):
 * - `& .child`
 * - `& > .child`
 * - `& + .sibling`
 * - `& ~ .general`
 *
 * Examples that do NOT match (meaningful):
 * - `&--modifier` (BEM concatenation)
 * - `&:hover` (pseudo-class)
 * - `&::before` (pseudo-element)
 * - `&.class` (compound)
 * - `.parent &` (non-first position)
 * - `&` (lone ampersand)
 */
const REDUNDANT_NESTING_RE = /^&\s+/;

/**
 * Check whether a single selector part has a redundant leading `&`.
 *
 * @param selector - A single (non-comma-separated) selector string, trimmed
 * @returns `true` when the selector starts with a redundant `&`
 */
function isRedundant(selector: string): boolean {
  return REDUNDANT_NESTING_RE.test(selector);
}

/**
 * Stylelint rule function for `sass/selector-no-redundant-nesting-selector`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks rule nodes
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkRules((rule) => {
      // Skip rules that aren't nested (top-level rules can't have &)
      if (!rule.parent || rule.parent.type === 'root') return;

      const selector = rule.selector;

      // Split comma-separated selector list and check each part
      const parts = selector.split(',');

      for (const part of parts) {
        const trimmed = part.trim();

        if (isRedundant(trimmed)) {
          utils.report({
            message: messages.rejected,
            node: rule,
            result,
            ruleName,
            word: '&',
            fix: {
              apply: () => {
                // Remove the redundant "& " from each matching part
                rule.selector = parts
                  .map((p) => {
                    const t = p.trim();
                    if (isRedundant(t)) {
                      return p.replace(/&\s+/, '');
                    }
                    return p;
                  })
                  .join(',');
              },
              node: rule,
            },
          });
          // Report once per rule node, even if multiple parts are redundant
          break;
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
