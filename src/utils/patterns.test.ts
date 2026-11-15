import { describe, it, expect } from 'vitest';
import { unescapeIdentifier } from './patterns.js';

describe('unescapeIdentifier', () => {
  it.each([
    ['f\\6Fo', 'foo'],
    ['\\66 oo', 'foo'],
    ['a\\.b', 'a.b'],
    ['a\\_b', 'a_b'],
    ['\\0', '�'],
    ['\\D800', '�'],
    ['\\110000', '�'],
    ['plain-name', 'plain-name'],
  ])('decodes %s as %s', (written, decoded) => {
    expect(unescapeIdentifier(written)).toBe(decoded);
  });
});
