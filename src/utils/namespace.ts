/**
 * Stylelint requires every plugin rule to be namespaced (`namespace/rule`)
 * so that custom rules never collide with built-in ones. This constant
 * defines the plugin-wide prefix used by all rules in `stylelint-sass`.
 *
 * @see {@link https://stylelint.io/developer-guide/plugins/ | Stylelint plugin guide}
 */
export const namespace = 'sass';

/**
 * Prefix a rule name with the plugin namespace.
 *
 * @param name - The rule name without prefix
 * @returns The fully qualified rule name (e.g. `sass/no-debug`)
 *
 * @example
 * ```ts
 * prefixRule('no-debug'); // 'sass/no-debug'
 * ```
 */
export const prefixRule = (name: string) => `${namespace}/${name}`;
