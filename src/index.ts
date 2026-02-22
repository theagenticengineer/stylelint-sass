/**
 * Stylelint plugin entry point for `stylelint-sass`.
 *
 * Exports the array of rule definitions that Stylelint loads when the plugin
 * is listed in a configuration's `plugins` field.
 */
import type stylelint from 'stylelint';
import noDebug from './rules/no-debug/index.js';
import noWarn from './rules/no-warn/index.js';

import noImport from './rules/no-import/index.js';
import dollarVariablePattern from './rules/dollar-variable-pattern/index.js';
import atMixinPattern from './rules/at-mixin-pattern/index.js';
import percentPlaceholderPattern from './rules/percent-placeholder-pattern/index.js';
import atFunctionPattern from './rules/at-function-pattern/index.js';
import atExtendNoMissingPlaceholder from './rules/at-extend-no-missing-placeholder/index.js';
import extendsBeforeDeclarations from './rules/extends-before-declarations/index.js';
import mixinsBeforeDeclarations from './rules/mixins-before-declarations/index.js';

const rules: stylelint.Plugin[] = [
  noDebug,
  noWarn,
  noImport,
  dollarVariablePattern,
  atMixinPattern,
  percentPlaceholderPattern,
  atFunctionPattern,
  atExtendNoMissingPlaceholder,
  extendsBeforeDeclarations,
  mixinsBeforeDeclarations,
];

export default rules;
