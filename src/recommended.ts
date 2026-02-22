/**
 * Recommended Stylelint configuration for `stylelint-sass`.
 *
 * Extends the plugin with a curated set of core Stylelint rules and
 * Sass-specific rules suited for `.sass` (indented syntax) projects.
 */
export default {
  plugins: ['stylelint-sass'],
  rules: {
    'color-no-invalid-hex': true,
    'block-no-empty': true,
    'no-duplicate-selectors': true,
    'no-descending-specificity': true,
    'max-nesting-depth': [3],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'use',
          'forward',
          'mixin',
          'include',
          'function',
          'extend',
          'at-root',
          'error',
          'warn',
          'debug',
          'if',
          'else',
          'each',
          'for',
          'while',
        ],
      },
    ],
    'shorthand-property-no-redundant-values': true,
    'length-zero-no-unit': true,

    // Disabled pending sass-parser support for Declaration.important:
    // 'declaration-block-no-duplicate-properties': true,
    // 'declaration-no-important': true,

    // Removed in Stylelint 16 (use Prettier instead):
    // 'no-eol-whitespace': true,
    // 'no-missing-end-of-source-newline': true,

    // Plugin rules
    'sass/no-debug': true,
    'sass/no-warn': true,
    'sass/no-import': true,
    'sass/dollar-variable-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/],
    'sass/at-mixin-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/],
    'sass/percent-placeholder-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/],
  },
};
