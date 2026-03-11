/**
 * Rule: `sass/no-duplicate-load-rules`
 *
 * Disallow duplicate `@use`, `@forward`, or `@import` statements that load
 * the same module. Duplicate loads are wasteful and can cause confusion
 * about where members come from.
 *
 * @example
 * ```sass
 * // BAD — duplicate @use
 * @use "variables"
 * @use "mixins"
 * @use "variables"
 *
 * // GOOD — each module loaded once
 * @use "variables"
 * @use "mixins"
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/no-duplicate-load-rules';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/no-duplicate-load-rules.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (atRuleName: string, url: string) => `Unexpected duplicate @${atRuleName} of '${url}'`,
});

/** Load directive names this rule inspects. */
const LOAD_DIRECTIVES = new Set(['use', 'forward', 'import']);

/**
 * Extracts the URL string from at-rule params.
 *
 * @param params - The raw params string from the at-rule node
 * @returns The unquoted URL, or `null` if extraction fails
 *
 * @example
 * ```ts
 * extractUrl('"variables"')              // 'variables'
 * extractUrl('"colors" as c')            // 'colors'
 * extractUrl('"config" with ($a: 1)')    // 'config'
 * ```
 */
function extractUrl(params: string): string | null {
  const match = params.match(/['"]([^'"]+)['"]/);
  return match ? match[1]! : null;
}

/**
 * Normalizes a URL for comparison by stripping file extensions.
 *
 * @param url - The raw URL string
 * @returns The normalized URL
 */
function normalizeUrl(url: string): string {
  return url.replace(/\.(sass|scss|css)$/, '');
}

/**
 * Stylelint rule function for `sass/no-duplicate-load-rules`.
 *
 * Walks `@use`, `@forward`, and `@import` at-rules and tracks seen URLs
 * per directive type. Reports duplicates within the same directive type.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    // Track seen URLs per directive type
    const seen = new Map<string, Set<string>>();

    root.walkAtRules((node) => {
      if (!LOAD_DIRECTIVES.has(node.name)) return;

      const url = extractUrl(node.params);
      if (!url) return;

      const normalized = normalizeUrl(url);
      const key = node.name;

      let seenUrls = seen.get(key);
      if (!seenUrls) {
        seenUrls = new Set<string>();
        seen.set(key, seenUrls);
      }

      if (seenUrls.has(normalized)) {
        utils.report({
          message: messages.rejected(node.name, url),
          node,
          result,
          ruleName,
        });
      } else {
        seenUrls.add(normalized);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
