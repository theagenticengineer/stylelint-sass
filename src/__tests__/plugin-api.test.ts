import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ESLint } from 'eslint';
import stylelint from 'stylelint';
import customSyntax from '../syntax.js';
import plugin from '../index.js';
import { stylelintAtLeast } from './core-rules/lint.js';

const root = resolve(import.meta.dirname, '../..');
const eslint = new ESLint({ cwd: root });

/**
 * Lints a snippet as if it were a rule source file.
 *
 * @param code - The TypeScript source
 * @returns The ESLint rule ids reported
 */
async function eslintRuleIds(code: string): Promise<(string | null)[]> {
  const [result] = await eslint.lintText(code, { filePath: join(root, 'src/rules/x/index.ts') });
  return result!.messages.map((message) => message.ruleId);
}

describe('stylelint 18 plugin API', () => {
  describe('context.fix, removed in stylelint 18', () => {
    it('is rejected by ESLint in rule sources', async () => {
      expect(
        await eslintRuleIds('export const f = (context: { fix?: boolean }) => context.fix;\n'),
      ).toContain('no-restricted-syntax');
    });

    it('is absent from every rule source', () => {
      for (const { ruleName } of plugin) {
        const source = readFileSync(
          join(root, 'src/rules', ruleName.replace('sass/', ''), 'index.ts'),
          'utf8',
        );
        expect(source, ruleName).not.toMatch(/context\.fix\b/);
      }
    });

    // A rule that passes a `fix` callback to `utils.report` must say so in `meta.fixable`, or
    // stylelint 18 never applies the fix.
    it('leaves fixes to utils.report in rules that declare meta.fixable', () => {
      for (const { ruleName, rule } of plugin) {
        const source = readFileSync(
          join(root, 'src/rules', ruleName.replace('sass/', ''), 'index.ts'),
          'utf8',
        );
        const hasFixCallback = /\bfix:\s*(?:\{|\(|function)/.test(source);
        expect(Boolean(rule.meta?.fixable), ruleName).toBe(hasFixCallback);
      }
    });

    // sass-parser stringifies every root as SCSS, so the fixed selectors are read from the AST.
    it('still fixes a redundant nesting selector through stylelint.lint({ fix: true })', async () => {
      const { results } = await stylelint.lint({
        code: '.a\n  & .b\n    color: $c\n',
        fix: true,
        config: {
          customSyntax,
          plugins: ['./src/index.ts'],
          rules: { 'sass/selector-no-redundant-nesting-selector': true },
        },
      });
      const selectors: string[] = [];
      results[0]!._postcssResult!.root.walkRules((rule) => {
        selectors.push(rule.selector);
      });
      expect(results[0]!.warnings).toEqual([]);
      expect(selectors).toEqual(['.a', '.b']);
    });
  });

  describe('result.stylelint.postcss, added in stylelint 18', () => {
    it('is rejected by ESLint as a value import of postcss in plugin sources', async () => {
      expect(
        await eslintRuleIds("import postcss from 'postcss';\nexport const p = postcss;\n"),
      ).toContain('@typescript-eslint/no-restricted-imports');
      expect(
        await eslintRuleIds("import type { Root } from 'postcss';\nexport type R = Root;\n"),
      ).toEqual([]);
    });

    // The syntax builds the AST with sass-parser's postcss before any rule runs, so the postcss
    // copy stylelint hands to rules cannot rebuild it. The plugin builds no nodes itself.
    it.skipIf(!stylelintAtLeast(18, 0))(
      "names stylelint's postcss, which differs from the copy that built the sass-parser AST",
      async () => {
        const seen: { postcss?: unknown; rootIsStylelintNode?: boolean } = {};
        const probe = stylelint.createPlugin('probe/postcss', () => (postcssRoot, result) => {
          const fromResult = (result.stylelint as { postcss?: { Root: new () => object } }).postcss;
          seen.postcss = fromResult;
          seen.rootIsStylelintNode = fromResult
            ? postcssRoot instanceof fromResult.Root
            : undefined;
        });
        await stylelint.lint({
          code: '.a\n  color: $c\n',
          config: { customSyntax, plugins: [probe], rules: { 'probe/postcss': true } },
        });
        expect(typeof (seen.postcss as { rule?: unknown }).rule).toBe('function');
        expect(seen.rootIsStylelintNode).toBe(false);
      },
    );
  });
});
