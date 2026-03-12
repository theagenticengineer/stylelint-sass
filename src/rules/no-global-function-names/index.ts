/**
 * Rule: `sass/no-global-function-names`
 *
 * Disallow use of global Sass function names that have been moved to
 * built-in modules. Since Dart Sass 1.80, `@import` is deprecated and
 * functions should be accessed via `@use "sass:*"` namespaced modules.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule
 * .btn
 *   background: darken($primary, 10%)
 * ```
 *
 * @example
 * ```sass
 * // GOOD — namespaced
 * @use "sass:color"
 *
 * .btn
 *   background: color.adjust($primary, $lightness: -10%)
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/** Fully qualified rule name including the plugin namespace. */
const ruleName = 'sass/no-global-function-names';

/** Rule metadata for documentation linking. */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/no-global-function-names.md',
};

/**
 * Entry in the deprecated function lookup table.
 *
 * @example
 * ```ts
 * { module: 'color', replacement: 'color.adjust' }
 * ```
 */
interface DeprecatedFunction {
  /** The `sass:*` module the function belongs to. */
  module: string;
  /** The recommended namespaced replacement (e.g. `color.adjust`). */
  replacement: string;
}

/**
 * Comprehensive map of deprecated global Sass function names to their
 * namespaced replacements. Covers functions from sass:color, sass:list,
 * sass:map, sass:math, sass:meta, sass:selector, and sass:string
 * built-in modules.
 *
 * Functions that conflict with native CSS functions are intentionally
 * excluded to prevent false positives (e.g. `min`, `max`, `round`,
 * `abs`, `invert`, `grayscale`, `saturate`, `alpha`, `opacity`).
 * See: https://github.com/stylelint-scss/stylelint-scss/issues/486
 */
const DEPRECATED_FUNCTIONS: ReadonlyMap<string, DeprecatedFunction> = new Map([
  // sass:color
  // Excluded: alpha, grayscale, invert, opacity, saturate (CSS-native)
  ['adjust-color', { module: 'color', replacement: 'color.adjust' }],
  ['adjust-hue', { module: 'color', replacement: 'color.adjust' }],
  ['blue', { module: 'color', replacement: 'color.blue' }],
  ['change-color', { module: 'color', replacement: 'color.change' }],
  ['complement', { module: 'color', replacement: 'color.complement' }],
  ['darken', { module: 'color', replacement: 'color.adjust' }],
  ['desaturate', { module: 'color', replacement: 'color.adjust' }],
  ['green', { module: 'color', replacement: 'color.green' }],
  ['hue', { module: 'color', replacement: 'color.hue' }],
  ['ie-hex-str', { module: 'color', replacement: 'color.ie-hex-str' }],
  ['lighten', { module: 'color', replacement: 'color.adjust' }],
  ['lightness', { module: 'color', replacement: 'color.lightness' }],
  ['mix', { module: 'color', replacement: 'color.mix' }],
  ['opacify', { module: 'color', replacement: 'color.adjust' }],
  ['red', { module: 'color', replacement: 'color.red' }],
  ['saturation', { module: 'color', replacement: 'color.saturation' }],
  ['scale-color', { module: 'color', replacement: 'color.scale' }],
  ['transparentize', { module: 'color', replacement: 'color.adjust' }],
  ['fade-in', { module: 'color', replacement: 'color.adjust' }],
  ['fade-out', { module: 'color', replacement: 'color.adjust' }],

  // sass:list
  ['append', { module: 'list', replacement: 'list.append' }],
  ['index', { module: 'list', replacement: 'list.index' }],
  ['is-bracketed', { module: 'list', replacement: 'list.is-bracketed' }],
  ['join', { module: 'list', replacement: 'list.join' }],
  ['length', { module: 'list', replacement: 'list.length' }],
  ['list-separator', { module: 'list', replacement: 'list.separator' }],
  ['nth', { module: 'list', replacement: 'list.nth' }],
  ['set-nth', { module: 'list', replacement: 'list.set-nth' }],
  ['zip', { module: 'list', replacement: 'list.zip' }],

  // sass:map
  ['map-get', { module: 'map', replacement: 'map.get' }],
  ['map-has-key', { module: 'map', replacement: 'map.has-key' }],
  ['map-keys', { module: 'map', replacement: 'map.keys' }],
  ['map-merge', { module: 'map', replacement: 'map.merge' }],
  ['map-remove', { module: 'map', replacement: 'map.remove' }],
  ['map-values', { module: 'map', replacement: 'map.values' }],

  // sass:math
  // Excluded: abs, max, min, round (CSS Values Level 4 native)
  ['ceil', { module: 'math', replacement: 'math.ceil' }],
  ['comparable', { module: 'math', replacement: 'math.compatible' }],
  ['floor', { module: 'math', replacement: 'math.floor' }],
  ['percentage', { module: 'math', replacement: 'math.percentage' }],
  ['random', { module: 'math', replacement: 'math.random' }],
  ['unit', { module: 'math', replacement: 'math.unit' }],
  ['unitless', { module: 'math', replacement: 'math.is-unitless' }],

  // sass:meta
  ['call', { module: 'meta', replacement: 'meta.call' }],
  ['content-exists', { module: 'meta', replacement: 'meta.content-exists' }],
  ['feature-exists', { module: 'meta', replacement: 'meta.feature-exists' }],
  ['function-exists', { module: 'meta', replacement: 'meta.function-exists' }],
  ['get-function', { module: 'meta', replacement: 'meta.get-function' }],
  ['global-variable-exists', { module: 'meta', replacement: 'meta.global-variable-exists' }],
  ['inspect', { module: 'meta', replacement: 'meta.inspect' }],
  ['mixin-exists', { module: 'meta', replacement: 'meta.mixin-exists' }],
  ['type-of', { module: 'meta', replacement: 'meta.type-of' }],
  ['variable-exists', { module: 'meta', replacement: 'meta.variable-exists' }],

  // sass:selector
  ['is-superselector', { module: 'selector', replacement: 'selector.is-superselector' }],
  ['selector-append', { module: 'selector', replacement: 'selector.append' }],
  ['selector-extend', { module: 'selector', replacement: 'selector.extend' }],
  ['selector-nest', { module: 'selector', replacement: 'selector.nest' }],
  ['selector-parse', { module: 'selector', replacement: 'selector.parse' }],
  ['selector-replace', { module: 'selector', replacement: 'selector.replace' }],
  ['selector-unify', { module: 'selector', replacement: 'selector.unify' }],
  ['simple-selectors', { module: 'selector', replacement: 'selector.simple-selectors' }],

  // sass:string
  ['quote', { module: 'string', replacement: 'string.quote' }],
  ['str-index', { module: 'string', replacement: 'string.index' }],
  ['str-insert', { module: 'string', replacement: 'string.insert' }],
  ['str-length', { module: 'string', replacement: 'string.length' }],
  ['str-slice', { module: 'string', replacement: 'string.slice' }],
  ['to-lower-case', { module: 'string', replacement: 'string.to-lower-case' }],
  ['to-upper-case', { module: 'string', replacement: 'string.to-upper-case' }],
  ['unique-id', { module: 'string', replacement: 'string.unique-id' }],
  ['unquote', { module: 'string', replacement: 'string.unquote' }],
]);

/**
 * Build a single regex that matches any deprecated global function call.
 * Uses a negative lookbehind to avoid matching namespaced calls (e.g.
 * `color.adjust(`) and a word boundary / hyphen-aware pattern so that
 * partial names don't match.
 *
 * @returns A global RegExp that captures the deprecated function name
 */
function buildFunctionCallRegex(): RegExp {
  const names = [...DEPRECATED_FUNCTIONS.keys()].map(escapeRegExp);
  // Sort longest-first so `adjust-color` matches before `adjust`
  names.sort((a, b) => b.length - a.length);
  // Negative lookbehind: not preceded by `.` or `$` or word char
  // Lookahead: followed by `(`
  return new RegExp(`(?<![.$\\w-])(?:${names.join('|')})(?=\\()`, 'g');
}

/**
 * Escape special regex characters in a string.
 *
 * @param s - The string to escape
 * @returns The escaped string safe for use in a RegExp
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Pre-compiled regex for matching deprecated function calls in values. */
const FUNCTION_CALL_RE = buildFunctionCallRegex();

/**
 * Diagnostic messages produced by this rule.
 *
 * @param name - The deprecated global function name
 * @param replacement - The recommended namespaced replacement
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (name: string, replacement: string) =>
    `Unexpected global function '${name}'. Use '${replacement}' instead`,
});

/**
 * Stylelint rule function for `sass/no-global-function-names`.
 *
 * Walks all declarations (including `$variable` declarations) and
 * at-rules, searching values for calls to deprecated global Sass
 * functions.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback that walks nodes
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    /**
     * Check a string value for deprecated global function calls and
     * report any matches.
     *
     * @param value - The declaration value to scan
     * @param node - The PostCSS node for error reporting
     */
    function checkValue(value: string, node: import('postcss').Node): void {
      FUNCTION_CALL_RE.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = FUNCTION_CALL_RE.exec(value)) !== null) {
        const name = match[0];
        const entry = DEPRECATED_FUNCTIONS.get(name);
        /* istanbul ignore next -- safety guard */
        if (!entry) continue;
        utils.report({
          message: messages.rejected(name, entry.replacement),
          node,
          result,
          ruleName,
        });
      }
    }

    // Check declaration values (includes $variable declarations)
    root.walkDecls((decl) => {
      checkValue(decl.value, decl);
    });

    // Check at-rule params (e.g. @if unitless($val), @return percentage(0.5))
    root.walkAtRules((atRule) => {
      if (atRule.params) {
        checkValue(atRule.params, atRule);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
