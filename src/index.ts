/**
 * Stylelint plugin entry point for `stylelint-sass`.
 *
 * Exports the array of rule definitions that Stylelint loads when the plugin
 * is listed in a configuration's `plugins` field.
 */
import type stylelint from 'stylelint';
import noDebug from './rules/no-debug/index.js';
import noWarn from './rules/no-warn/index.js';

const rules: stylelint.Plugin[] = [noDebug, noWarn];

export default rules;
