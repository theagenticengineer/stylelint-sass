import { createRequire } from 'node:module';
import { join } from 'node:path';
import { sass } from 'sass-parser';
import { toCssSyntaxError } from './utils/syntax-error.js';

/**
 * Finds the private `my` symbol of each postcss copy that Stylelint runs on.
 *
 * postcss marks every node it builds with its own `my` symbol. A node without it counts as
 * foreign, and postcss rebuilds it onto its plain prototypes (in `LazyResult` and in
 * `new Warning()`). sass-parser pins postcss exactly, so a consumer often holds two copies, and
 * the rebuild strips sass-parser's getters (`parsedSelector`, the at-rule `name`). Stylelint is
 * resolved from this package and from the working directory, and postcss from each Stylelint.
 *
 * @returns The `my` symbol of each postcss copy found.
 */
function stylelintPostcssMarkers(): symbol[] {
  const markers = new Set<symbol>();
  for (const base of [import.meta.url, join(process.cwd(), 'package.json')]) {
    try {
      const stylelintManifest = createRequire(base).resolve('stylelint/package.json');
      const postcss = createRequire(stylelintManifest)('postcss') as { Root: new () => object };
      const marker = Object.getOwnPropertySymbols(new postcss.Root()).find(
        (symbol) => symbol.description === 'my',
      );
      if (marker) markers.add(marker);
    } catch {
      // Stylelint or its postcss does not resolve from this base.
    }
  }
  return [...markers];
}

/**
 * Marks sass-parser's postcss `Node.prototype` as native to Stylelint's postcss copies, so
 * every sass-parser node (parsed now or built later) keeps its own prototype.
 */
function adoptSassParserNodes(): void {
  let nodePrototype = Object.getPrototypeOf(sass.parse('')) as object | null;
  while (nodePrototype && Object.getPrototypeOf(nodePrototype) !== Object.prototype) {
    nodePrototype = Object.getPrototypeOf(nodePrototype) as object | null;
  }
  if (!nodePrototype) return;
  for (const marker of stylelintPostcssMarkers()) {
    // Writable: when sass-parser and Stylelint share one postcss copy, the marker is
    // sass-parser's own symbol, and its node constructors assign `this[my] = true`, which
    // throws in strict mode when the inherited property is read-only.
    Object.defineProperty(nodePrototype, marker, {
      value: true,
      configurable: true,
      writable: true,
    });
  }
}

adoptSassParserNodes();

/**
 * PostCSS syntax for `.sass` (indented syntax) files, for Stylelint's `customSyntax`.
 *
 * `sass-parser` exports its syntaxes as named objects, so the package itself is not a
 * syntax. The methods are bound because `sass-parser` loses `this` when they are detached.
 * A Sass syntax error becomes a `CssSyntaxError`, which Stylelint reports as a problem in that
 * file instead of aborting the run.
 * Loading this module marks sass-parser's nodes as native to Stylelint's postcss, so they
 * keep their sass-parser prototype even when the consumer holds two postcss copies.
 *
 * @example
 * ```js
 * export default {
 *   customSyntax: '@theagenticengineer/stylelint-sass/syntax',
 *   extends: ['@theagenticengineer/stylelint-sass/recommended'],
 * };
 * ```
 */
const syntax: { parse: typeof sass.parse; stringify: typeof sass.stringify } = {
  parse: (css, opts) => {
    try {
      return sass.parse(css, opts);
    } catch (error) {
      throw toCssSyntaxError(error, opts?.from);
    }
  },
  stringify: sass.stringify.bind(sass),
};

export default syntax;
