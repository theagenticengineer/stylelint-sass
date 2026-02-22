/**
 * Shared naming pattern utilities for rules that enforce naming conventions
 * via user-supplied regular expressions.
 *
 * Used by `sass/dollar-variable-pattern`, `sass/percent-placeholder-pattern`,
 * `sass/at-mixin-pattern`, and `sass/at-function-pattern`.
 */

/**
 * Convert a primary option (string or RegExp) to a `RegExp` instance.
 *
 * Accepts either a `RegExp` object or a string pattern (with or without
 * surrounding slashes). Returns `null` if the input is invalid.
 *
 * Note: string patterns do not support regex flags (e.g. `"/pattern/i"`).
 * Use a `RegExp` object directly when flags are needed.
 *
 * @param pattern - A regex string (e.g. `"^[a-z]+$"`) or `RegExp`
 * @returns The compiled `RegExp`, or `null` if conversion fails
 *
 * @example
 * ```ts
 * toRegExp(/^[a-z]+$/);          // RegExp
 * toRegExp('^[a-z]+$');          // RegExp
 * toRegExp('/^[a-z]+$/');        // RegExp (strips slashes)
 * ```
 */
export function toRegExp(pattern: string | RegExp): RegExp | null {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (typeof pattern !== 'string') {
    return null;
  }

  // Strip surrounding slashes if present: "/^foo$/" → "^foo$"
  const stripped =
    pattern.startsWith('/') && pattern.endsWith('/') ? pattern.slice(1, -1) : pattern;

  try {
    return new RegExp(stripped);
  } catch {
    return null;
  }
}

/**
 * Test whether a name matches the given pattern.
 *
 * @param name - The identifier to test (without sigil like `$` or `%`)
 * @param pattern - A `RegExp` to match against
 * @returns `true` if the name matches, `false` otherwise
 *
 * @example
 * ```ts
 * matchesPattern('font-size', /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/); // true
 * matchesPattern('fontSize', /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);  // false
 * ```
 */
export function matchesPattern(name: string, pattern: RegExp): boolean {
  return pattern.test(name);
}
