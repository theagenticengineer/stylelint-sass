/**
 * Conversion of sass-parser exceptions into the error shape Stylelint reports.
 *
 * Stylelint reports a parse failure as a `CssSyntaxError` problem only when the thrown error
 * is named `CssSyntaxError`, and rethrows anything else, which aborts the whole run.
 * sass-parser throws a plain `Error` whose message ends with the location, such as
 * `- 5:15  root stylesheet` or `/path/a.sass 5:15  root stylesheet`.
 */

/** The fields of a PostCSS `CssSyntaxError` that Stylelint reads. */
export interface CssSyntaxErrorLike extends Error {
  /** Always `CssSyntaxError`. */
  name: 'CssSyntaxError';
  /** The parser message without the source excerpt. */
  reason: string;
  /** The 1-based line of the error, when the parser gave one. */
  line?: number;
  /** The 1-based column of the error, when the parser gave one. */
  column?: number;
  /** The file being parsed, when known. */
  file?: string;
}

/** Matches the first stack-trace location of a Sass exception, such as `5:15  root`. */
const LOCATION = /\s(\d+):(\d+)\s+root stylesheet/;

/**
 * Converts an error thrown by sass-parser into a `CssSyntaxError` Stylelint reports.
 *
 * @param error - The thrown value
 * @param file - The file being parsed, from the PostCSS `from` option
 * @returns An error named `CssSyntaxError`, or the thrown value unchanged when it is no `Error`
 *   or already a `CssSyntaxError`
 *
 * @example
 * ```ts
 * try {
 *   sass.parse(css, opts);
 * } catch (error) {
 *   throw toCssSyntaxError(error, opts?.from);
 * }
 * ```
 */
export function toCssSyntaxError(error: unknown, file?: string): unknown {
  if (!(error instanceof Error) || error.name === 'CssSyntaxError') return error;
  const reason = error.message.split('\n')[0]!.replace(/^Error: /, '');
  const location = LOCATION.exec(error.message);
  const line = location ? Number(location[1]) : undefined;
  const column = location ? Number(location[2]) : undefined;
  const where = [file ?? '<input css>', line, column].filter((part) => part !== undefined);
  const converted = new Error(`${where.join(':')}: ${reason}`, { cause: error });
  return Object.assign(converted, { name: 'CssSyntaxError' as const, reason, line, column, file });
}
