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

/** Matches one CSS escape: up to six hex digits plus one optional whitespace, or one character. */
const CSS_ESCAPE = /\\(?:([0-9a-fA-F]{1,6})[ \t\n\r\f]?|([^\n\r\f0-9a-fA-F]))/g;

/**
 * Decode the CSS escapes of an identifier, as Sass does when it compares names.
 *
 * Code points that are zero, surrogates or beyond U+10FFFF decode to U+FFFD, as in CSS.
 *
 * @param name - An identifier as written in the source, such as `f\6Fo`
 * @returns The identifier with every escape decoded, such as `foo`
 *
 * @example
 * ```ts
 * unescapeIdentifier('f\\6Fo'); // 'foo'
 * unescapeIdentifier('a\\.b');  // 'a.b'
 * ```
 */
export function unescapeIdentifier(name: string): string {
  return name.replace(CSS_ESCAPE, (_, hex: string | undefined, char: string | undefined) => {
    if (char !== undefined) return char;
    const codePoint = parseInt(hex!, 16);
    const valid =
      codePoint > 0 && codePoint <= 0x10ffff && !(codePoint >= 0xd800 && codePoint <= 0xdfff);
    return String.fromCodePoint(valid ? codePoint : 0xfffd);
  });
}
