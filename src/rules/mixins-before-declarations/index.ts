/**
 * Rule: `sass/mixins-before-declarations`
 *
 * `@include` (or `+` shorthand) statements must appear before property
 * declarations within a rule block. This enforces a predictable ordering:
 * mixins first, then properties.
 *
 * @example
 * ```sass
 * // BAD — +mixin after declaration
 * .card
 *   padding: 16px
 *   +rounded
 *
 * // GOOD — +mixin before declarations
 * .card
 *   +rounded
 *   padding: 16px
 * ```
 */
import stylelint from 'stylelint';
import type { AtRule } from 'postcss';
import { classifyChild } from '../../utils/ordering.js';

const { createPlugin, utils } = stylelint;

/**
 * Fully qualified rule name including the plugin namespace.
 */
const ruleName = 'sass/mixins-before-declarations';

/**
 * Rule metadata for documentation linking.
 */
const meta = {
  url: 'https://github.com/theagenticengineer/stylelint-sass/blob/main/docs/rules/mixins-before-declarations.md',
};

/**
 * Diagnostic messages produced by this rule.
 */
const messages = utils.ruleMessages(ruleName, {
  rejected: '@include must come before declarations',
});

/**
 * Secondary option type for `sass/mixins-before-declarations`.
 */
interface SecondaryOptions {
  /** Mixin names to exempt from the ordering requirement. */
  ignore?: string[];
}

/**
 * Extracts the mixin name from an at-rule's params string.
 *
 * @param params - The raw params string (e.g. `"rounded"` or `"respond-to(md)"`)
 * @returns The mixin name (first word before `(` or space)
 *
 * @example
 * ```ts
 * getMixinName('respond-to(md)'); // => 'respond-to'
 * getMixinName('rounded');        // => 'rounded'
 * ```
 */
function getMixinName(params: string): string {
  const trimmed = params.trim();
  const parenIndex = trimmed.indexOf('(');
  const spaceIndex = trimmed.indexOf(' ');

  let endIndex = trimmed.length;
  if (parenIndex !== -1) endIndex = Math.min(endIndex, parenIndex);
  if (spaceIndex !== -1) endIndex = Math.min(endIndex, spaceIndex);

  return trimmed.slice(0, endIndex);
}

/**
 * Stylelint rule function for `sass/mixins-before-declarations`.
 *
 * @param primary - The primary option (boolean `true` to enable)
 * @param secondaryOptions - Optional secondary options with `ignore` list
 * @returns A PostCSS plugin callback that walks rule blocks
 */
const ruleFunction: stylelint.Rule<true, SecondaryOptions> = (primary, secondaryOptions) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual: primary },
      {
        actual: secondaryOptions,
        possible: { ignore: [(v: unknown) => typeof v === 'string'] },
        optional: true,
      },
    );
    if (!validOptions) return;

    const ignoreList = secondaryOptions?.ignore ?? [];

    root.walkRules((rule) => {
      let seenDeclaration = false;

      rule.each((child) => {
        const kind = classifyChild(child);

        if (kind === 'declaration') {
          seenDeclaration = true;
        } else if (kind === 'include' && seenDeclaration) {
          // classifyChild already confirmed this is an AtRule with name 'include'
          const mixinName = getMixinName((child as AtRule).params);
          if (ignoreList.includes(mixinName)) return;

          utils.report({
            message: messages.rejected,
            node: child,
            result,
            ruleName,
          });
        }
      });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
