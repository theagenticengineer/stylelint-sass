import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import stylelint from 'stylelint';
import { stylelintAtLeast } from './core-rules/lint.js';

const root = resolve(import.meta.dirname, '../..');

describe('config locators', () => {
  let dir = '';

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'stylelint-sass-locators-'));
    writeFileSync(
      join(dir, 'plugin.js'),
      [
        '// The shape stylelint.createPlugin returns, so the file needs no stylelint import.',
        "const rule = Object.assign(() => () => {}, { ruleName: 'probe/noop' });",
        "export default { ruleName: 'probe/noop', rule };",
        '',
      ].join('\n'),
    );
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module' }));
  });

  afterAll(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  /**
   * Lints CSS with a plugin locator resolved from the scratch directory.
   *
   * @param locator - The `plugins` entry
   * @returns The lint promise
   */
  const lintWith = (locator: string) =>
    stylelint.lint({
      code: 'a {}',
      configBasedir: dir,
      config: { plugins: [locator], rules: { 'probe/noop': true } },
    });

  it('resolves a relative locator written with its extension', async () => {
    await expect(lintWith('./plugin.js')).resolves.toBeDefined();
  });

  // Stylelint 18 removed CommonJS-style extension-less locators.
  it.skipIf(!stylelintAtLeast(18, 0))(
    'rejects an extension-less relative locator on stylelint 18',
    async () => {
      await expect(lintWith('./plugin')).rejects.toThrow(/Could not find "\.\/plugin"/);
    },
  );

  // Every locator the docs show must work on stylelint 18: package names, `exports` subpaths,
  // or relative paths with their extension.
  it('appears in the docs only as a package path or a relative path with an extension', () => {
    const docs = [
      'README.md',
      'CONTRIBUTING.md',
      ...readdirSync(join(root, 'docs/rules')).map((f) => `docs/rules/${f}`),
    ];
    const locators = docs.flatMap((file) =>
      [
        ...readFileSync(join(root, file), 'utf8').matchAll(
          /(?:customSyntax|extends|plugins)\s*:\s*\[?\s*['"]([^'"]+)['"]/g,
        ),
      ].map((match) => ({ file, locator: match[1]! })),
    );
    expect(locators.length).toBeGreaterThan(0);
    const extensionless = locators.filter(
      ({ locator }) => locator.startsWith('.') && !/\.[cm]?[jt]s$/.test(locator),
    );
    expect(extensionless).toEqual([]);
  });
});
