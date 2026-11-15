import { describe, it, expect } from 'vitest';
import { sass } from 'sass-parser';
import { toCssSyntaxError, type CssSyntaxErrorLike } from './syntax-error.js';

/**
 * Captures what sass-parser throws for a source.
 *
 * @param css - The `.sass` source
 * @param from - The file name passed to the parser
 * @returns The thrown value
 */
function thrownBy(css: string, from?: string): unknown {
  try {
    sass.parse(css, from ? { from } : undefined);
  } catch (error) {
    return error;
  }
  throw new Error('expected sass-parser to throw');
}

describe('toCssSyntaxError', () => {
  it('reads reason, line and column from a sass-parser exception', () => {
    const converted = toCssSyntaxError(
      thrownBy('.a\n  &:hover(\n    x: y\n'),
    ) as CssSyntaxErrorLike;
    expect(converted).toMatchObject({
      name: 'CssSyntaxError',
      reason: 'expected ")".',
      line: 3,
      column: 9,
      message: '<input css>:3:9: expected ")".',
    });
  });

  it('keeps the file name the parser was given', () => {
    const converted = toCssSyntaxError(
      thrownBy('a:is()\n  x: y\n', '/project/a b.sass'),
      '/project/a b.sass',
    ) as CssSyntaxErrorLike;
    expect(converted).toMatchObject({
      reason: 'expected selector.',
      line: 1,
      file: '/project/a b.sass',
    });
  });

  it('leaves the position out when the message has none', () => {
    const converted = toCssSyntaxError(new Error('boom')) as CssSyntaxErrorLike;
    expect(converted).toMatchObject({
      name: 'CssSyntaxError',
      reason: 'boom',
      message: '<input css>: boom',
    });
    expect(converted.line).toBeUndefined();
  });

  it('returns values that are no Error, and CssSyntaxErrors, unchanged', () => {
    const existing = Object.assign(new Error('x'), { name: 'CssSyntaxError' });
    expect(toCssSyntaxError(existing)).toBe(existing);
    expect(toCssSyntaxError('text')).toBe('text');
  });
});
