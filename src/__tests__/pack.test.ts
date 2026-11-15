import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import stylelint from 'stylelint';

const root = resolve(import.meta.dirname, '../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string;
  version: string;
  publishConfig?: { registry?: string };
};

const PUBLISHED_NAME = '@theagenticengineer/stylelint-sass';
const REGISTRY = 'https://npm.pkg.github.com';

describe('published package', () => {
  let consumer = '';

  // Packs the tarball and installs it offline in a throwaway consumer project,
  // with stylelint and sass-parser linked from this repository's node_modules.
  beforeAll(() => {
    consumer = mkdtempSync(join(tmpdir(), 'stylelint-sass-consumer-'));
    const packs = join(consumer, 'packs');
    mkdirSync(packs);
    execFileSync('pnpm', ['run', 'build'], { cwd: root, stdio: 'ignore' });
    execFileSync('pnpm', ['pack', '--pack-destination', packs], { cwd: root, stdio: 'ignore' });
    const tarball = readdirSync(packs).find((f) => f.endsWith('.tgz'));
    if (!tarball) throw new Error('pnpm pack produced no tarball');

    const installed = join(consumer, 'node_modules', ...pkg.name.split('/'));
    mkdirSync(installed, { recursive: true });
    execFileSync('tar', ['-xzf', join(packs, tarball), '-C', installed, '--strip-components=1']);
    for (const dep of ['stylelint', 'sass-parser']) {
      symlinkSync(join(root, 'node_modules', dep), join(consumer, 'node_modules', dep), 'dir');
    }
    copyFileSync(join(root, 'src/__tests__/fixtures/invalid.sass'), join(consumer, 'invalid.sass'));
  }, 120_000);

  afterAll(() => {
    if (consumer) rmSync(consumer, { recursive: true, force: true });
  });

  it('is named for the GitHub Packages scope', () => {
    expect(pkg.name).toBe(PUBLISHED_NAME);
    expect(pkg.publishConfig?.registry).toBe(REGISTRY);
  });

  it('lints .sass through the recommended config, as a consumer extends it', async () => {
    const result = await stylelint.lint({
      files: join(consumer, 'invalid.sass'),
      configBasedir: consumer,
      config: {
        customSyntax: `${PUBLISHED_NAME}/syntax`,
        extends: [`${PUBLISHED_NAME}/recommended`],
      },
    });
    const rules = result.results.flatMap((r) => r.warnings.map((w) => w.rule));
    expect(rules.some((rule) => rule.startsWith('sass/'))).toBe(true);
  });
});
