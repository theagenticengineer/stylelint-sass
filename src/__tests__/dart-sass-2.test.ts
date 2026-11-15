import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';
import plugin from '../index.js';
import recommended from '../recommended.js';

const root = resolve(import.meta.dirname, '../..');

/** A Dart Sass version as the JS API exposes it. */
interface SassVersion {
  major: number;
  minor: number;
  patch: number;
}

/** A deprecation as the JS API exposes it. */
interface Deprecation {
  id: string;
  status: string;
  deprecatedIn: SassVersion | null;
}

/** The Dart Sass that sass-parser depends on. */
const sass = createRequire(createRequire(join(root, 'package.json')).resolve('sass-parser'))(
  'sass',
) as {
  deprecations: Record<string, Deprecation> & {
    dartSass2?: { include: SassVersion; exclude: Deprecation[] };
  };
};

/** How the plugin meets one Dart Sass 2 fatal deprecation. */
type Coverage =
  | { rule: string }
  | { parser: string }
  | { coreRule: string; note: string }
  | { gap: string }
  | { outOfScope: string };

/**
 * Every deprecation Dart Sass 2.0.0 makes fatal, mapped to what reports it. `rule` names a rule
 * in `recommended`, `parser` a source that sass-parser rejects, `coreRule` a core rule outside
 * `recommended`, `gap` the issue that tracks a missing rule, and `outOfScope` why no lint rule
 * can see it.
 */
const COVERAGE: Record<string, Coverage> = {
  'adjacent-compounds': { rule: 'sass/selector-no-adjacent-compounds' },
  'color-functions': { rule: 'sass/no-global-function-names' },
  elseif: { rule: 'at-rule-no-unknown' },
  'function-name': { rule: 'sass/at-function-pattern' },
  'strict-unary': { rule: 'sass/operator-no-unspaced' },
  'misplaced-rest': { parser: '`@mixin m($args..., $b)` is a CssSyntaxError' },
  'moz-document': { coreRule: 'at-rule-no-vendor-prefix', note: 'outside recommended, #162' },
  'abs-percent': { gap: '#162' },
  'bogus-combinators': { gap: '#162' },
  'call-string': { gap: '#162' },
  'duplicate-var-flags': { gap: '#162' },
  'new-global': { gap: '#162' },
  'with-private': { gap: '#162' },
  'slash-div': { gap: '#160' },
  'color-4-api': { gap: '#161' },
  'feature-exists': { gap: '#161' },
  'function-units': { outOfScope: 'units of runtime values reach built-in functions' },
  'relative-canonical': { outOfScope: 'importer API' },
  'fs-importer-cwd': { outOfScope: 'load-path configuration' },
  'null-alpha': { outOfScope: 'JavaScript API' },
  'legacy-js-api': { outOfScope: 'JavaScript API' },
  'compile-string-relative-url': { outOfScope: 'JavaScript API' },
};

/**
 * Compares two Dart Sass versions.
 *
 * @param a - The first version
 * @param b - The second version
 * @returns `true` when `a` is `b` or older
 */
function atMost(a: SassVersion, b: SassVersion): boolean {
  return a.major !== b.major
    ? a.major < b.major
    : a.minor !== b.minor
      ? a.minor < b.minor
      : a.patch <= b.patch;
}

/** A source that triggers each deprecation that `recommended` or the parser reports. */
const SAMPLES: Record<string, string> = {
  'adjacent-compounds': '[class]a\n  color: $c\n',
  'color-functions': '.a\n  color: darken($c, 5%)\n',
  elseif: '@if $a\n  .x\n    y: z\n@elseif $b\n  .x\n    y: w\n',
  'function-name': '@function URL($x)\n  @return $x\n',
  'strict-unary': '.a\n  margin: $a -$b\n',
  'misplaced-rest': '@mixin m($args..., $b)\n  a: b\n',
};

const dartSass2 = sass.deprecations.dartSass2;

// `sass.deprecations.dartSass2` arrived in Dart Sass 1.107.0. It holds every active
// deprecation up to `include`, minus `exclude`.
describe.skipIf(!dartSass2)('Dart Sass 2 fatal deprecations', () => {
  const fatal = Object.values(sass.deprecations)
    .filter(
      (d): d is Deprecation =>
        typeof d === 'object' && d !== null && 'id' in d && d.status === 'active',
    )
    .filter((d) => d.deprecatedIn && atMost(d.deprecatedIn, dartSass2!.include))
    .filter((d) => !dartSass2!.exclude.some((excluded) => excluded.id === d.id))
    .map((d) => d.id)
    .sort();

  it('are each mapped to what reports them, with no stale entry', () => {
    expect(Object.keys(COVERAGE).sort()).toEqual(fatal);
  });

  it.each(Object.entries(SAMPLES))('%s is reported by recommended', async (id, code) => {
    const coverage = COVERAGE[id]!;
    const expected = 'rule' in coverage ? coverage.rule : 'CssSyntaxError';
    const { results } = await stylelint.lint({
      code,
      config: { customSyntax, plugins: ['./src/index.ts'], rules: recommended.rules },
    });
    expect(results[0]!.warnings.map((w) => w.rule)).toContain(expected);
  });

  it('name rules that exist', () => {
    const pluginRules = new Set(plugin.map((p) => p.ruleName));
    for (const coverage of Object.values(COVERAGE)) {
      const name =
        'rule' in coverage ? coverage.rule : 'coreRule' in coverage ? coverage.coreRule : '';
      if (!name) continue;
      expect(pluginRules.has(name) || name in stylelint.rules, name).toBe(true);
    }
  });
});
