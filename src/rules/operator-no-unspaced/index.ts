/**
 * Rule: `sass/operator-no-unspaced`
 *
 * Require spaces around math and comparison operators (`+`, `-`, `*`, `/`,
 * `%`, `==`, `!=`, `<`, `>`, `<=`, `>=`). Unspaced operators hurt
 * readability and can be ambiguous.
 *
 * @example
 * ```sass
 * // BAD — triggers the rule
 * .box
 *   width: $a+$b
 *
 * // GOOD — spaced operator
 * .box
 *   width: $a + $b
 * ```
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/operator-no-unspaced';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/operator-no-unspaced.md',
  fixable: true,
};

/**
 * Diagnostic messages produced by this rule.
 *
 * @param operator - The operator that is missing surrounding spaces
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (operator: string) => `Expected spaces around operator "${operator}"`,
});

/**
 * The set of binary operators that this rule checks for spacing.
 * Excludes `=` (assignment in `@each`) and logical operators (`and`, `or`)
 * which are always keyword-spaced.
 */
const CHECKED_OPERATORS = new Set(['+', '-', '*', '/', '%', '==', '!=', '<', '>', '<=', '>=']);

/**
 * Extract the original source text between two character offsets.
 *
 * @param css - The full source string
 * @param startOffset - The start offset (inclusive)
 * @param endOffset - The end offset (exclusive)
 * @returns The substring between the offsets
 */
function sliceSource(css: string, startOffset: number, endOffset: number): string {
  return css.slice(startOffset, endOffset);
}

/**
 * Check whether a binary-operation expression node has proper spacing around
 * its operator by examining the original source text.
 *
 * Properly spaced means exactly: `<left> <operator> <right>` — at least one
 * space before the operator and at least one space after.
 *
 * @param expr - A sass-parser BinaryOperationExpression node
 * @param css - The full original source text
 * @returns An object describing the spacing state, or `null` if source info is unavailable
 */
function checkOperatorSpacing(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expr: any,
  css: string,
): { hasSpaceBefore: boolean; hasSpaceAfter: boolean; operator: string } | null {
  const leftEnd = expr.left?.source?.end?.offset;
  const rightStart = expr.right?.source?.start?.offset;

  if (leftEnd == null || rightStart == null) return null;

  const between = sliceSource(css, leftEnd, rightStart);
  const operator: string = expr.operator;

  // The text between left.end and right.start should be " <op> "
  // Find the operator within the between string
  const opIndex = between.indexOf(operator);
  if (opIndex === -1) return null;

  const beforeOp = between.slice(0, opIndex);
  const afterOp = between.slice(opIndex + operator.length);

  return {
    hasSpaceBefore: beforeOp.length > 0 && beforeOp.trim() === '',
    hasSpaceAfter: afterOp.length > 0 && afterOp.trim() === '',
    operator,
  };
}

/**
 * Recursively collect all binary-operation expression nodes from an
 * expression tree.
 *
 * @param expr - A sass-parser expression node
 * @returns Array of binary-operation expression nodes found in the tree
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectBinaryOperations(expr: any): any[] {
  if (!expr || !expr.sassType) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];

  if (expr.sassType === 'binary-operation') {
    results.push(expr);
    // Also check left and right subtrees for nested operations
    results.push(...collectBinaryOperations(expr.left));
    results.push(...collectBinaryOperations(expr.right));
  } else if (expr.sassType === 'list' && expr._nodes) {
    for (const child of expr._nodes) {
      results.push(...collectBinaryOperations(child));
    }
  } else if (expr.sassType === 'parenthesized' && expr._expression) {
    results.push(...collectBinaryOperations(expr._expression));
  } else if (expr.sassType === 'function-call' && expr._arguments?._nodes) {
    for (const arg of expr._arguments._nodes) {
      if (arg?._expression) {
        results.push(...collectBinaryOperations(arg._expression));
      }
    }
  } else if (expr.sassType === 'map' && expr._nodes) {
    for (const entry of expr._nodes) {
      if (entry?._key) results.push(...collectBinaryOperations(entry._key));
      if (entry?._value) results.push(...collectBinaryOperations(entry._value));
    }
  } else if (expr.sassType === 'unary-operation' && expr._operand) {
    results.push(...collectBinaryOperations(expr._operand));
  } else if (expr.sassType === 'if-expr') {
    // Ternary if() expression
    if (expr._condition) results.push(...collectBinaryOperations(expr._condition));
    if (expr._trueExpression) results.push(...collectBinaryOperations(expr._trueExpression));
    if (expr._falseExpression) results.push(...collectBinaryOperations(expr._falseExpression));
  }

  return results;
}

/**
 * Known expression-bearing property names on sass-parser AST nodes.
 *
 * Each sass-parser node type stores its expression(s) under different
 * private property names. This list covers declarations, `@if`, `@while`,
 * `@for`, `@each`, and `@return` rules.
 */
const EXPRESSION_PROPS = [
  '_expression', // Declarations (property and variable)
  '_ifCondition', // @if / @else if
  '_whileCondition', // @while
  '_fromExpression', // @for ... from <expr>
  '_toExpression', // @for ... through/to <expr>
  '_returnExpression', // @return
  '_eachExpression', // @each ... in <expr>
];

/**
 * Stylelint rule function for `sass/operator-no-unspaced`.
 *
 * Walks the entire AST to find binary-operation expression nodes and
 * checks that each operator has at least one space on each side.
 * Uses source offset positions from the original text to detect
 * actual spacing, since sass-parser normalises expressions when
 * reading `.value`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @returns A PostCSS plugin callback
 *
 * @example
 * ```json
 * { "sass/operator-no-unspaced": true }
 * ```
 */
const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    const cssText = root.source?.input?.css;
    if (!cssText) return;
    // After the guard, cssText is known to be a non-empty string.
    const css: string = cssText;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function reportUnspacedOperators(node: any, binOps: any[]) {
      for (const binOp of binOps) {
        const operator: string = binOp.operator;
        if (!CHECKED_OPERATORS.has(operator)) continue;

        const spacing = checkOperatorSpacing(binOp, css);
        if (!spacing) continue;

        if (spacing.hasSpaceBefore && spacing.hasSpaceAfter) continue;

        utils.report({
          message: messages.rejected(operator),
          node,
          result,
          ruleName,
          fix: {
            apply: () => {
              // Set raws to ensure proper spacing on serialization.
              // BinaryOperationExpression.toString() uses
              // `raws.beforeOperator ?? ' '` and `raws.afterOperator ?? ' '`,
              // defaulting to a space when undefined. However, we explicitly
              // set them to guarantee the fix.
              binOp.raws.beforeOperator = ' ';
              binOp.raws.afterOperator = ' ';
            },
            node,
          },
        });
      }
    }

    root.walk((node) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyNode = node as any;

      // Check expression-bearing properties (declarations, @if, @while, @for, @each, @return)
      for (const prop of EXPRESSION_PROPS) {
        const expr = anyNode[prop];
        if (!expr || !expr.sassType) continue;

        reportUnspacedOperators(node, collectBinaryOperations(expr));
      }

      // Check @include mixin call arguments (_arguments.nodes[]._value)
      const args = anyNode._arguments;
      if (args?.sassType === 'argument-list' && args._nodes) {
        for (const arg of args._nodes) {
          if (arg?._value?.sassType) {
            reportUnspacedOperators(node, collectBinaryOperations(arg._value));
          }
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
