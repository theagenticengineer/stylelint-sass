import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string;
  version: string;
  publishConfig?: { registry?: string };
};

const PUBLISHED_NAME = '@theagenticengineer/stylelint-sass';
const REGISTRY = 'https://npm.pkg.github.com';

// Nested rules go through sass-parser's rule stringifier, and `@debug` is an at-rule that
// both `sass/no-debug` and `at-rule-no-unknown` visit.
const NESTED_SASS = '.card\n  color: red\n  .title\n    font-weight: bold\n\n@debug "x"\n';

// Each consumer pins one end of the supported sass-parser range. sass-parser pins postcss
// exactly, and stylelint takes the newest postcss 8, so every consumer holds two postcss copies.
const CONSUMERS = [
  { sassParser: '0.4.58', stylelint: '17.16.0' },
  { sassParser: '0.5.6', stylelint: '18.0.0' },
];

type LintResult = { warnings: { rule: string }[] };

describe('published package', () => {
  let workdir = '';
  let tarball = '';

  // Packs the tarball once. Each consumer installs it with stylelint and sass-parser from
  // the npm registry, so the consumer resolves postcss exactly as a real project does.
  beforeAll(() => {
    workdir = mkdtempSync(join(tmpdir(), 'stylelint-sass-consumer-'));
    const packs = join(workdir, 'packs');
    mkdirSync(packs);
    execFileSync('pnpm', ['run', 'build'], { cwd: root, stdio: 'ignore' });
    execFileSync('pnpm', ['pack', '--pack-destination', packs], { cwd: root, stdio: 'ignore' });
    const file = readdirSync(packs).find((f) => f.endsWith('.tgz'));
    if (!file) throw new Error('pnpm pack produced no tarball');
    tarball = join(packs, file);
  }, 120_000);

  afterAll(() => {
    if (workdir) rmSync(workdir, { recursive: true, force: true });
  });

  it('is named for the GitHub Packages scope', () => {
    expect(pkg.name).toBe(PUBLISHED_NAME);
    expect(pkg.publishConfig?.registry).toBe(REGISTRY);
  });

  describe.each(CONSUMERS)(
    'in a consumer with sass-parser $sassParser and stylelint $stylelint',
    ({ sassParser, stylelint }) => {
      let consumer = '';
      const resolveFromConsumer = (specifier: string) =>
        createRequire(join(consumer, 'package.json')).resolve(specifier);

      beforeAll(() => {
        consumer = join(workdir, `sass-parser-${sassParser}`);
        mkdirSync(consumer);
        writeFileSync(
          join(consumer, 'package.json'),
          JSON.stringify({ name: 'consumer', private: true, type: 'module' }),
        );
        // pnpm resolves each postcss range on its own, while npm would hoist one copy.
        execFileSync(
          'pnpm',
          [
            'add',
            '--save-dev',
            '--ignore-scripts',
            '--config.strict-dep-builds=false',
            `stylelint@${stylelint}`,
            `sass-parser@${sassParser}`,
            tarball,
          ],
          { cwd: consumer, stdio: 'ignore' },
        );
        writeFileSync(
          join(consumer, 'stylelint.config.js'),
          [
            'export default {',
            `  customSyntax: '${PUBLISHED_NAME}/syntax',`,
            `  extends: ['${PUBLISHED_NAME}/recommended'],`,
            '};',
            '',
          ].join('\n'),
        );
        writeFileSync(join(consumer, 'nested.sass'), NESTED_SASS);
        copyFileSync(join(root, 'src/__tests__/fixtures/valid.sass'), join(consumer, 'valid.sass'));
      }, 180_000);

      it('holds two postcss copies, one for sass-parser and one for stylelint', () => {
        const postcssOf = (dep: string) =>
          createRequire(resolveFromConsumer(dep)).resolve('postcss');
        expect(postcssOf('sass-parser')).not.toBe(postcssOf('stylelint'));
      });

      // Runs the consumer's own stylelint CLI, which exits 2 when it reports problems and 1
      // when it crashes. It prints the formatter output to stderr.
      const lint = (file: string) => {
        const bin = join(
          dirname(resolveFromConsumer('stylelint/package.json')),
          'bin/stylelint.mjs',
        );
        const run = spawnSync(process.execPath, [bin, file, '--formatter', 'json'], {
          cwd: consumer,
          encoding: 'utf8',
        });
        const output = run.stdout.trim() || run.stderr;
        const results = run.status === 1 ? [] : (JSON.parse(output) as LintResult[]);
        return {
          status: run.status,
          output,
          rules: results.flatMap((r) => r.warnings.map((w) => w.rule)),
        };
      };

      it("lints nested .sass through the consumer's stylelint CLI", () => {
        const { status, output, rules } = lint('nested.sass');
        expect(status, output).toBe(2);
        expect(rules).toContain('sass/no-color-literals');
        expect(rules).toContain('sass/no-debug');
      });

      it('reports nothing on valid.sass', () => {
        const { status, output, rules } = lint('valid.sass');
        expect(status, output).toBe(0);
        expect(rules).toEqual([]);
      });
    },
  );
});
