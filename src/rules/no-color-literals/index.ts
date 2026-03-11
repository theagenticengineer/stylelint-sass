/**
 * Rule: `sass/no-color-literals`
 *
 * Disallow color literals (hex, named colors, rgb/hsl) used directly in
 * property declarations. Colors should be stored in variables.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule
 * .header
 *   background: #336699
 *
 * // GOOD — use a variable
 * $primary: #336699
 * .header
 *   background: $primary
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/no-color-literals';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/no-color-literals.md',
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param color - The color literal that was found
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (color: string) => `Unexpected color literal "${color}". Use a variable instead`,
});

/**
 * Default colors that are exempt from the rule.
 * These are CSS keywords that are commonly used as non-design-token values.
 * Stored in lowercase for case-insensitive matching.
 */
const DEFAULT_ALLOWED_COLORS = ['transparent', 'currentcolor', 'inherit'];

/**
 * CSS color function names that produce color values.
 */
const COLOR_FUNCTION_NAMES = new Set(['rgb', 'rgba', 'hsl', 'hsla']);

/**
 * Get the original source text of a color expression node.
 *
 * sass-parser normalizes named colors (e.g. `red` to `#ff0000`) and short hex
 * (e.g. `#036` to `#003366`). This function retrieves the original text from
 * the source span when available, falling back to the normalized string
 * representation.
 *
 * @param expr - A sass-parser expression node with sassType 'color'
 * @returns The original source text of the color, or the normalized string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOriginalColorText(expr: any): string {
  // Access the internal SassColor value's format span to get original source text
  const format = expr?._value?.format;
  if (format?._color0$_span?.text) {
    return format._color0$_span.text as string;
  }
  // Fall back to the normalized string representation
  return String(expr);
}

/**
 * Check if a color's original text is in the allowed colors list.
 *
 * @param originalText - The original source text of the color
 * @param allowedColors - Set of allowed color names (lowercase)
 * @returns `true` if the color is allowed
 */
function isAllowedColor(originalText: string, allowedColors: Set<string>): boolean {
  return allowedColors.has(originalText.toLowerCase());
}

/**
 * Collect color literals from a sass-parser expression node.
 *
 * Recursively walks the expression tree to find color literals and
 * color function calls. Respects the `allowInFunctions` and
 * `allowedColors` options.
 *
 * @param expr - A sass-parser expression node
 * @param allowInFunctions - Whether to allow color literals inside function calls
 * @param allowedColors - Set of allowed color names (lowercase)
 * @param insideFunctionArg - Whether we are currently inside a function argument
 * @returns Array of original color literal text strings that violate the rule
 */
function collectColorLiterals(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expr: any,
  allowInFunctions: boolean,
  allowedColors: Set<string>,
  insideFunctionArg = false,
): string[] {
  if (!expr || !expr.sassType) return [];

  const colors: string[] = [];

  switch (expr.sassType) {
    case 'color': {
      if (insideFunctionArg && allowInFunctions) break;
      const originalText = getOriginalColorText(expr);
      if (!isAllowedColor(originalText, allowedColors)) {
        colors.push(originalText);
      }
      break;
    }

    case 'function-call': {
      const funcName = expr._name ? String(expr._name) : '';
      if (COLOR_FUNCTION_NAMES.has(funcName.toLowerCase())) {
        // This is a color function like rgb(), rgba(), hsl(), hsla()
        if (!allowInFunctions) {
          // Report the whole function call as a color literal
          colors.push(String(expr));
        }
      } else {
        // Non-color function — check arguments for color literals
        if (expr._arguments?._nodes) {
          for (const arg of expr._arguments._nodes) {
            // Each argument node wraps an expression
            const argExpr = arg?._expression;
            if (argExpr) {
              colors.push(...collectColorLiterals(argExpr, allowInFunctions, allowedColors, true));
            }
          }
        }
      }
      break;
    }

    case 'list': {
      if (expr._nodes) {
        for (const child of expr._nodes) {
          colors.push(
            ...collectColorLiterals(child, allowInFunctions, allowedColors, insideFunctionArg),
          );
        }
      }
      break;
    }

    // 'variable', 'string', 'number', 'map', etc. — not color literals
    default:
      break;
  }

  return colors;
}

/** Secondary option schema for this rule. */
interface SecondaryOptions {
  allowInVariables?: boolean;
  allowInFunctions?: boolean;
  allowedColors?: string[];
}

/**
 * Stylelint rule function for `sass/no-color-literals`.
 *
 * Walks all declarations and reports color literals (hex, named colors,
 * rgb/hsl functions) used directly in property values. Colors should be
 * stored in variables instead.
 *
 * Uses the sass-parser AST expression types (`_expression.sassType`) to
 * accurately detect color literals, even when the parser normalizes values
 * (e.g. named colors like `red` become `#ff0000`).
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @param secondaryOptions - Optional configuration object
 * @returns A PostCSS plugin callback that walks declarations
 *
 * @example
 * ```json
 * { "sass/no-color-literals": [true, { "allowInVariables": true }] }
 * ```
 */
const ruleFunction: stylelint.Rule<true, SecondaryOptions> = (primary, secondaryOptions) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual: primary },
      {
        actual: secondaryOptions,
        possible: {
          allowInVariables: [true, false],
          allowInFunctions: [true, false],
          allowedColors: [(v: unknown) => typeof v === 'string'],
        },
        optional: true,
      },
    );
    if (!validOptions) return;

    const allowInVariables = secondaryOptions?.allowInVariables !== false;
    const allowInFunctions = secondaryOptions?.allowInFunctions === true;
    const allowedColors = new Set(
      (secondaryOptions?.allowedColors ?? DEFAULT_ALLOWED_COLORS).map((c) => c.toLowerCase()),
    );

    root.walkDecls((decl) => {
      const prop = decl.prop;

      // Skip variable declarations when allowInVariables is true
      if (allowInVariables && prop.startsWith('$')) return;

      // Access the sass-parser expression tree for accurate type detection.
      // The _expression property is set by sass-parser on Declaration nodes.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expr = (decl as any)._expression;
      if (!expr) return;

      const colorLiterals = collectColorLiterals(expr, allowInFunctions, allowedColors);

      for (const color of colorLiterals) {
        utils.report({
          message: messages.rejected(color),
          node: decl,
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
