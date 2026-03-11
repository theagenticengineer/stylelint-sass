/**
 * Rule: `sass/dimension-no-non-numeric-values`
 *
 * Disallow constructing dimension values by concatenating a number with a
 * unit string (e.g., `$n + "px"`). Use multiplication by a unit literal
 * (`$n * 1px`) instead, which preserves type safety and avoids producing
 * unquoted strings that only look like dimensions.
 *
 * @example
 * ```sass
 * // BAD — string concatenation to build a dimension
 * .box
 *   width: $n + "px"
 *
 * // BAD — interpolation followed by a unit
 * .container
 *   max-width: #{$column-count * 80}px
 *
 * // GOOD — multiply by a unit literal
 * .box
 *   width: $n * 1px
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/dimension-no-non-numeric-values';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/dimension-no-non-numeric-values.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @example
 * ```ts
 * messages.rejectedConcat  // 'Unexpected dimension built via string concatenation. Use multiplication …'
 * messages.rejectedInterp  // 'Unexpected dimension built via interpolation. Use multiplication …'
 * ```
 */
const messages = utils.ruleMessages(ruleName, {
  rejectedConcat:
    'Unexpected dimension built via string concatenation. Use multiplication by a unit literal (e.g., $n * 1px) instead',
  rejectedInterp:
    'Unexpected dimension built via interpolation. Use multiplication by a unit literal (e.g., $n * 1px) instead',
});

/**
 * All CSS unit keywords that this rule recognises when they appear after
 * a `+` operator with a quoted string, or after an interpolation block.
 */
const UNITS = 'px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|deg|rad|grad|turn|s|ms';

/**
 * Matches string concatenation that builds a dimension value.
 *
 * Pattern: `+ "px"` or `+ 'rem'` etc.
 */
const STRING_CONCAT_RE = new RegExp(`\\+\\s*["'](?:${UNITS})["']`);

/**
 * Matches interpolation immediately followed by a CSS unit.
 *
 * Pattern: `#{...}px`, `#{...}%`, etc.
 */
const INTERPOLATION_UNIT_RE = new RegExp(`#\\{[^}]+\\}(?:${UNITS})(?![a-zA-Z])`);

/**
 * Extracts the original source text for a node from its source input.
 *
 * sass-parser may normalise certain expressions, so inspecting the raw
 * source is necessary for reliable pattern detection.
 *
 * @param node - A PostCSS node with source position info
 * @returns The original source text, or `undefined` if unavailable
 */
function getOriginalSource(node: {
  source?: { input: { css: string }; start?: { offset: number }; end?: { offset: number } };
}): string | undefined {
  if (!node.source?.start || !node.source?.end) return undefined;
  return node.source.input.css.slice(node.source.start.offset, node.source.end.offset + 1);
}

/**
 * Stylelint rule function for `sass/dimension-no-non-numeric-values`.
 *
 * Walks declarations and `@return` at-rules, checking their value text
 * against two patterns:
 *
 * 1. String concatenation: `+ "px"`, `+ "em"`, etc.
 * 2. Interpolation + unit: `#{...}px`, `#{...}%`, etc.
 *
 * Only flags matches in declaration values and `@return` values, not in
 * selectors or property names.
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

    // Check declaration values
    root.walkDecls((decl) => {
      const original = getOriginalSource(decl);
      // Use original source if available, fall back to decl.value
      const value = original ?? decl.value;

      checkValue(value, decl);
    });

    // Check @return values
    root.walkAtRules('return', (node) => {
      const original = getOriginalSource(node);
      // Use original source if available, fall back to node.params
      const value = original ?? node.params;

      checkValue(value, node);
    });

    /**
     * Tests a value string against both detection patterns and reports
     * a violation if either matches.
     *
     * @param value - The raw value text to check
     * @param node - The PostCSS node to attach the warning to
     */
    function checkValue(value: string, node: Parameters<typeof utils.report>[0]['node']): void {
      if (STRING_CONCAT_RE.test(value)) {
        utils.report({
          message: messages.rejectedConcat,
          node,
          result,
          ruleName,
        });
      }

      if (INTERPOLATION_UNIT_RE.test(value)) {
        utils.report({
          message: messages.rejectedInterp,
          node,
          result,
          ruleName,
        });
      }
    }
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
