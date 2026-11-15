import { sass } from 'sass-parser';

/**
 * PostCSS syntax for `.sass` (indented syntax) files, for Stylelint's `customSyntax`.
 *
 * `sass-parser` exports its syntaxes as named objects, so the package itself is not a
 * syntax. The methods are bound because `sass-parser` loses `this` when they are detached.
 *
 * @example
 * ```js
 * export default {
 *   customSyntax: '@theagenticengineer/stylelint-sass/syntax',
 *   extends: ['@theagenticengineer/stylelint-sass/recommended'],
 * };
 * ```
 */
const syntax = {
  parse: sass.parse.bind(sass),
  stringify: sass.stringify.bind(sass),
};

export default syntax;
