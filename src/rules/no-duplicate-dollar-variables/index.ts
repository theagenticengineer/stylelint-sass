/**
 * Rule: `sass/no-duplicate-dollar-variables`
 *
 * Disallow duplicate `$variable` declarations within the same scope.
 * Duplicate declarations silently override earlier values, making
 * the final value unpredictable and the code confusing.
 *
 * @example
 * ```sass
 * // BAD — $color declared twice in the same scope
 * $color: red
 * $color: blue
 *
 * // GOOD — unique variable names
 * $color-primary: red
 * $color-secondary: blue
 * ```
 */
import stylelint from 'stylelint';
import type { AtRule, ChildNode, Container, Declaration } from 'postcss';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/no-duplicate-dollar-variables';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/no-duplicate-dollar-variables.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (variable: string) => `Unexpected duplicate variable declaration '${variable}'`,
});

/**
 * Checks whether a declaration node represents a `!default` variable.
 *
 * @param node - The PostCSS `Declaration` node
 * @returns `true` if the value ends with `!default`
 */
function isDefaultDeclaration(node: Declaration): boolean {
  // sass-parser's Declaration.important is not yet implemented (throws),
  // so we check the raw source text for !default instead
  if (node.source?.start && node.source?.end) {
    const raw = node.source.input.css.slice(node.source.start.offset, node.source.end.offset + 1);
    return raw.includes('!default');
  }
  const value = node.value ?? '';
  return value.trim().endsWith('!default');
}

/**
 * Checks whether a node is inside an `@if` / `@else` chain.
 *
 * @param node - The PostCSS node to check
 * @returns `true` if the node is inside an `@if` or `@else` at-rule
 */
function isInsideIfElse(node: ChildNode): boolean {
  let parent = node.parent;
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') {
      const name = (parent as AtRule).name;
      if (name === 'if' || name === 'else') return true;
    }
    parent = (parent as ChildNode).parent;
  }
  return false;
}

/**
 * Checks whether a node is inside any at-rule.
 *
 * @param node - The PostCSS node to check
 * @returns `true` if the node is inside an at-rule
 */
function isInsideAtRule(node: ChildNode): boolean {
  let parent = node.parent;
  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') return true;
    parent = (parent as ChildNode).parent;
  }
  return false;
}

interface SecondaryOptions {
  ignoreDefaults?: boolean;
  ignoreInside?: string[];
}

/**
 * Stylelint rule function for `sass/no-duplicate-dollar-variables`.
 *
 * Walks all declarations starting with `$` and tracks seen variable names
 * per scope (parent node). Reports duplicates within the same scope.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @param secondaryOptions - Optional secondary options
 * @returns A PostCSS plugin callback
 */
const ruleFunction: stylelint.Rule = (primary, secondaryOptions) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual: primary },
      {
        actual: secondaryOptions,
        possible: {
          ignoreDefaults: [true, false],
          ignoreInside: ['at-rule', 'if-else'],
        },
        optional: true,
      },
    );
    if (!validOptions) return;

    const opts = (secondaryOptions ?? {}) as SecondaryOptions;
    const ignoreDefaults = opts.ignoreDefaults === true;
    const ignoreInside = opts.ignoreInside ?? [];

    // Track seen variable names per scope (using parent node identity)
    const scopeMap = new Map<Container | undefined, Set<string>>();

    root.walkDecls((decl) => {
      const prop = decl.prop;
      if (!prop.startsWith('$')) return;

      // Check ignoreInside options
      if (ignoreInside.includes('if-else') && isInsideIfElse(decl)) return;
      if (ignoreInside.includes('at-rule') && isInsideAtRule(decl)) return;

      // Check ignoreDefaults
      if (ignoreDefaults && isDefaultDeclaration(decl)) return;

      const scope = decl.parent;
      let seen = scopeMap.get(scope);
      if (!seen) {
        seen = new Set<string>();
        scopeMap.set(scope, seen);
      }

      if (seen.has(prop)) {
        utils.report({
          message: messages.rejected(prop),
          node: decl,
          result,
          ruleName,
        });
      } else {
        seen.add(prop);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
