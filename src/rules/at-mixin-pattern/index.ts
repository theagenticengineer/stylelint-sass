/**
 * Rule: `sass/at-mixin-pattern`
 *
 * Enforce a naming pattern for `@mixin` declarations.
 * Default enforces `kebab-case`.
 *
 * sass-parser normalizes the `=` shorthand to `@mixin`, so both
 * `=flex-center` and `@mixin flex-center` are caught by
 * `walkAtRules('mixin')`.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule (camelCase)
 * =flexCenter
 *   display: flex
 * ```
 */
import stylelint from 'stylelint';
import { matchesPattern, toRegExp } from '../../utils/patterns.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/at-mixin-pattern';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/at-mixin-pattern.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param name - The mixin name that violated the pattern
 * @param pattern - The expected pattern as a string
 */
const messages = utils.ruleMessages(ruleName, {
  expected: (name: string, pattern: string) =>
    `Expected mixin "${name}" to match pattern "${pattern}"`,
});

/** Default pattern: kebab-case */
const DEFAULT_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Extract the mixin name from an at-rule's params string.
 *
 * The params string may contain the mixin name followed by parenthesized
 * arguments (e.g. `"respond-to($bp)"`) or just the name (e.g. `"clearfix"`).
 *
 * @param params - The raw `atRule.params` value
 * @returns The mixin name (first word before `(` or whitespace)
 *
 * @example
 * ```ts
 * extractMixinName('respond-to($bp)');   // 'respond-to'
 * extractMixinName('clearfix');          // 'clearfix'
 * ```
 */
function extractMixinName(params: string): string {
  const trimmed = params.trim();
  const parenIndex = trimmed.indexOf('(');
  const spaceIndex = trimmed.indexOf(' ');

  let endIndex = trimmed.length;
  if (parenIndex !== -1) endIndex = parenIndex;
  if (spaceIndex !== -1 && spaceIndex < endIndex) endIndex = spaceIndex;

  return trimmed.slice(0, endIndex);
}

/**
 * Stylelint rule function for `sass/at-mixin-pattern`.
 *
 * Walks all `@mixin` at-rules (which also covers `=` shorthand thanks to
 * sass-parser normalization) and checks the mixin name against the
 * configured pattern.
 *
 * @param primary - A regex pattern (string or RegExp) to match mixin names
 * @returns A PostCSS plugin callback that walks at-rules
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

    root.walkAtRules('mixin', (atRule) => {
      const name = extractMixinName(atRule.params);
      if (!name) return;

      if (!matchesPattern(name, pattern)) {
        utils.report({
          message: messages.expected(name, pattern.toString()),
          node: atRule,
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
