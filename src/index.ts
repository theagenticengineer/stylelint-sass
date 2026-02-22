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
import noGlobalFunctionNames from './rules/no-global-function-names/index.js';
import atUseNoRedundantAlias from './rules/at-use-no-redundant-alias/index.js';
import atIfNoNull from './rules/at-if-no-null/index.js';
import declarationsBeforeNesting from './rules/declarations-before-nesting/index.js';
import atUseNoUnnamespaced from './rules/at-use-no-unnamespaced/index.js';
import noDuplicateMixins from './rules/no-duplicate-mixins/index.js';
import noDuplicateLoadRules from './rules/no-duplicate-load-rules/index.js';
import selectorNoRedundantNestingSelector from './rules/selector-no-redundant-nesting-selector/index.js';
import noDuplicateDollarVariables from './rules/no-duplicate-dollar-variables/index.js';
import selectorNoUnionClassName from './rules/selector-no-union-class-name/index.js';

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
  noGlobalFunctionNames,
  atUseNoRedundantAlias,
  atIfNoNull,
  declarationsBeforeNesting,
  atUseNoUnnamespaced,
  noDuplicateMixins,
  noDuplicateLoadRules,
  selectorNoRedundantNestingSelector,
  noDuplicateDollarVariables,
  selectorNoUnionClassName,
];

export default rules;
