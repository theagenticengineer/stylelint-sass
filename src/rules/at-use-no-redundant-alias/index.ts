/**
 * Rule: `sass/at-use-no-redundant-alias`
 *
 * Disallow `@use` rules where the `as` alias matches the default namespace.
 * Sass already defaults the namespace to the last segment of the URL
 * (without extension or leading underscore), so an explicit alias that
 * matches adds noise without changing behavior.
 *
 * @example
 * ```sass
 * // BAD — alias matches the default namespace
 * @use "colors" as colors
 *
 * // GOOD — no alias needed; default namespace is already "colors"
 * @use "colors"
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/at-use-no-redundant-alias';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/at-use-no-redundant-alias.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (alias: string) =>
    `Unexpected redundant alias '${alias}'. The default namespace is already '${alias}'`,
});

/**
 * Computes the default namespace for a `@use` URL.
 *
 * For built-in modules like `sass:math`, the default namespace is
 * the part after the colon (e.g. `math`). For file paths, it is
 * the last segment without extension or leading underscore.
 *
 * @param url - The unquoted URL string from the `@use` rule
 * @returns The computed default namespace
 *
 * @example
 * ```ts
 * computeDefaultNamespace('sass:math')    // 'math'
 * computeDefaultNamespace('src/utils/_helpers.scss') // 'helpers'
 * computeDefaultNamespace('colors')       // 'colors'
 * ```
 */
function computeDefaultNamespace(url: string): string {
  // Built-in modules: sass:xxx -> xxx
  if (url.startsWith('sass:')) {
    return url.slice(5);
  }

  // File paths: take last segment, strip extension and leading underscore
  const lastSegment = url.split('/').pop() ?? url;
  const withoutExtension = lastSegment.replace(/\.[^.]+$/, '');
  const withoutUnderscore = withoutExtension.replace(/^_/, '');

  return withoutUnderscore;
}

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
 * Stylelint rule function for `sass/at-use-no-redundant-alias`.
 *
 * Uses the original source text to detect whether the user explicitly
 * wrote an `as` alias that matches the default namespace. sass-parser
 * normalizes the `params` property and strips redundant aliases, so
 * we must inspect the raw source to detect this pattern.
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

      // Strip inline comments before matching the `as` clause
      const cleaned = original
        .replace(/\/\/.*$/, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim();

      // Check if the cleaned source contains an explicit `as` clause
      const asMatch = cleaned.match(/\bas\s+(\S+)\s*$/);
      if (!asMatch) return;

      const alias = asMatch[1];

      // Skip `as *` (unnamespaced — that's a different rule)
      if (alias === '*') return;

      // Extract the URL from the original source
      const urlMatch = original.match(/(['"])(.+?)\1/);
      if (!urlMatch) return;

      const url = urlMatch[2]!;
      const defaultNamespace = computeDefaultNamespace(url);

      if (alias === defaultNamespace) {
        utils.report({
          message: messages.rejected(alias),
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
