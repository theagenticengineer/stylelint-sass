/**
 * Rule: `sass/no-duplicate-mixins`
 *
 * Disallow duplicate mixin definitions within the same scope. Duplicate
 * definitions silently override the first, making behavior unpredictable.
 *
 * @example
 * ```sass
 * // BAD — duplicate mixin definition
 * =button
 *   padding: 8px 16px
 *
 * =button
 *   padding: 12px 24px
 *
 * // GOOD — unique mixin names
 * =button-base
 *   padding: 8px 16px
 *
 * =button-primary
 *   +button-base
 *   background: blue
 * ```
 */
import stylelint from 'stylelint';
import type { ChildNode, Container } from 'postcss';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/no-duplicate-mixins';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/no-duplicate-mixins.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: (mixinName: string) => `Unexpected duplicate mixin definition '${mixinName}'`,
});

/**
 * Extracts the mixin name from the at-rule params, stripping any arguments.
 *
 * @param params - The raw params string from the at-rule node
 * @returns The mixin name without parenthesized arguments
 *
 * @example
 * ```ts
 * extractMixinName('spacing($size)')       // 'spacing'
 * extractMixinName('button')              // 'button'
 * extractMixinName('spacing($size, $dir)') // 'spacing'
 * ```
 */
function extractMixinName(params: string): string {
  const parenIndex = params.indexOf('(');
  return parenIndex === -1 ? params.trim() : params.slice(0, parenIndex).trim();
}

/**
 * Stylelint rule function for `sass/no-duplicate-mixins`.
 *
 * Walks `@mixin` at-rules and tracks seen mixin names per scope (parent node).
 * Reports duplicates within the same scope.
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

    const scopeMap = new Map<Container<ChildNode> | undefined, Set<string>>();

    root.walkAtRules('mixin', (node) => {
      const name = extractMixinName(node.params);
      if (!name) return;

      const scope = node.parent;
      let seen = scopeMap.get(scope);
      if (!seen) {
        seen = new Set<string>();
        scopeMap.set(scope, seen);
      }

      if (seen.has(name)) {
        utils.report({
          message: messages.rejected(name),
          node,
          result,
          ruleName,
        });
      } else {
        seen.add(name);
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
