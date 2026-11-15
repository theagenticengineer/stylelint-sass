import stylelint from 'stylelint';

/**
 * Core rules newer than stylelint 17.8.0, the floor of the peer range. The recommended config
 * enables each one only when the installed stylelint ships it, because a config that names an
 * unknown rule makes stylelint report `Unknown rule` in every file.
 */
const NEWER_CORE_RULES: Record<string, unknown> = {
  // stylelint 17.10.0
  'selector-no-invalid': true,
  // stylelint 18.0.0
  'value-no-invalid': true,
};

/** The entries of {@link NEWER_CORE_RULES} that the installed stylelint ships. */
const availableNewerCoreRules = Object.fromEntries(
  Object.entries(NEWER_CORE_RULES).filter(([name]) => name in stylelint.rules),
);

/**
 * Recommended Stylelint configuration for `stylelint-sass`.
 *
 * Extends the plugin with a curated set of core Stylelint rules and
 * Sass-specific rules suited for `.sass` (indented syntax) projects.
 */
export default {
  plugins: ['@theagenticengineer/stylelint-sass'],
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
    'selector-no-deprecated': true,
    // Off: CSS does not define user-defined Sass functions such as `double()`, so the rule
    // reports them. sass/no-global-function-names covers the global Sass built-ins.
    'function-no-unknown': null,
    ...availableNewerCoreRules,

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
    'sass/at-function-pattern': [/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/],
    'sass/at-extend-no-missing-placeholder': true,
    'sass/extends-before-declarations': true,
    'sass/mixins-before-declarations': true,
    'sass/no-global-function-names': true,
    'sass/at-use-no-redundant-alias': true,
    'sass/at-if-no-null': true,
    'sass/declarations-before-nesting': true,
    'sass/at-use-no-unnamespaced': true,
    'sass/no-duplicate-mixins': true,
    'sass/no-duplicate-load-rules': true,
    'sass/selector-no-redundant-nesting-selector': true,
    'sass/no-duplicate-dollar-variables': true,
    'sass/selector-no-union-class-name': true,
    'sass/dimension-no-non-numeric-values': true,
    'sass/no-color-literals': true,
    'sass/operator-no-unspaced': true,
    'sass/selector-no-adjacent-compounds': true,
  },
};
