import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';

const BROKEN = '.a\n  color: $c\n.b\n  &:hover(\n    color: $c\n';
const config = { customSyntax, rules: { 'color-no-invalid-hex': true } };

describe('a Sass syntax error', () => {
  it('becomes a CssSyntaxError problem at the reported position', async () => {
    const { results, errored } = await stylelint.lint({ code: BROKEN, config });
    expect(errored).toBe(true);
    expect(results[0]!.warnings).toEqual([
      expect.objectContaining({
        rule: 'CssSyntaxError',
        severity: 'error',
        text: 'expected ")". (CssSyntaxError)',
        line: 5,
        column: 14,
      }),
    ]);
  });

  it('leaves the other files of the run linted', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'stylelint-sass-syntax-error-'));
    try {
      writeFileSync(join(dir, 'broken.sass'), BROKEN);
      writeFileSync(join(dir, 'bad-hex.sass'), '.a\n  color: #ggg\n');
      const { results } = await stylelint.lint({ files: join(dir, '*.sass'), config });
      const rules = Object.fromEntries(
        results.map((r) => [r.source!.split('/').pop(), r.warnings.map((w) => w.rule)]),
      );
      expect(rules).toEqual({
        'broken.sass': ['CssSyntaxError'],
        'bad-hex.sass': ['color-no-invalid-hex'],
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
