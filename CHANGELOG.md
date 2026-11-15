# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `recommended` no longer turns on `value-no-invalid` on stylelint 18. The rule reports every
  `$variable` inside a plain function call, such as `double($gap)` or `rgba($c, 0.5)`, and in
  space-separated lists such as `1px solid $c` ([#166]).

## [0.2.0] - 2026-11-15

Aligns the plugin with stylelint 17.8 through 18.0, sass-parser 0.5 and Dart Sass 1.108.

### Added

- `sass/selector-no-adjacent-compounds`: disallow compound selectors written without whitespace,
  such as `[class]a`, which Dart Sass 1.100 deprecates and Dart Sass 2 rejects. It is in
  `recommended` ([#125]).
- `recommended` turns on `selector-no-deprecated` ([#99]), `selector-no-invalid` on
  stylelint 17.10 and later ([#102]) and `value-no-invalid` on stylelint 18 ([#108]). Core
  rules newer than stylelint 17.8 join only when the installed stylelint ships them.
- README: supported versions, the recommended contents, a `stylelint.config.ts` example
  ([#119]), how core rules behave on `.sass` and the known limitations.
- Tests that pin each new stylelint rule through the `.sass` syntax, kept out of `recommended`
  with the reasons: `relative-selector-nesting-notation` ([#100]), `property-layout-mappings`
  ([#101]), `unit-layout-mappings` ([#103]), `value-keyword-layout-mappings` ([#104]),
  `selector-no-unmatchable` ([#105]), `color-named` and `color-no-hex` with `ignoreFunctions`
  ([#106]), `at-charset-rule-no-invalid` ([#107]),
  `declaration-property-custom-property-allowed-list` ([#109]),
  `value-type-custom-property-required-list` ([#110]) and
  `declaration-property-value-no-unknown` ([#117]).
- Tests for the stylelint 18 changes: full-path locators ([#113]), no global `node_modules`
  ([#114]), rules and options of `recommended` on both majors ([#116], [#118]), guards against
  `context.fix` and value imports of postcss ([#115], [#122]). The stylelint 18 CLI and
  `globbyOptions` changes need no plugin change ([#120]).
- Tests for sass-parser 0.5 and Dart Sass: CSS escapes in names ([#123]), selector rule
  positions ([#124]), first-class modules ([#126]) and a map of every Dart Sass 2 fatal
  deprecation to what reports it ([#128]).

### Changed

- The `stylelint` peer range is `>=17.8.0 <19` ([#112]).
- The Node.js floor is `>=20.19.0`, the floor of stylelint 17.8. Stylelint 18 needs Node.js
  22.22.2 or later ([#111]).
- CI runs `check (20)` on stylelint 17.8.0 with sass-parser 0.4.42, `check (22)` on stylelint
  18.0.0 with sass-parser 0.5.6, and `compat` jobs on the other corners ([#112], [#123]).
- `recommended` turns `function-no-unknown` off, which reports user-defined Sass functions
  ([#121]).
- `sass/selector-no-redundant-nesting-selector` checks only rules inside another style rule. A
  root-level `&` (the scoping root since Dart Sass 1.99) and `&` in a `@mixin` stay ([#127]).
- `sass/percent-placeholder-pattern` matches the name after decoding CSS escapes, and skips
  interpolated names ([#123]).
- The rule tests lint through the plugin's `/syntax` entry, as consumers do.

### Fixed

- A Sass syntax error is reported as a `CssSyntaxError` problem in its file. It used to abort the
  whole run ([#137]).
- `.sass` linting works when sass-parser and stylelint share one postcss copy, the usual npm
  layout. 0.1.1 failed every parse there ([#139]).
- `recommended` accepts `@return`, which it reported as an unknown at-rule ([#158]).

### Removed

- Support for stylelint 16 and 17.0 to 17.7 ([#112]).
- Support for Node.js below 20.19 ([#111]).

## [0.1.1] - 2026-11-15

### Fixed

- Linting nested `.sass` no longer crashes with a `TypeError` in sass-parser's stringifier when
  sass-parser and Stylelint resolve different postcss copies. sass-parser pins postcss exactly,
  so pnpm installs two copies, and Stylelint's postcss rebuilt sass-parser's nodes onto its plain
  prototypes. The `/syntax` entry now marks sass-parser's nodes as native to Stylelint's postcss,
  so they keep their sass-parser prototype.
- The README install steps put the `_authToken` line in a user-level npmrc, because pnpm expands
  environment variables in registry credentials only from there.

### Changed

- The `sass-parser` peer range is `>=0.4 <0.6`, the versions the pack test covers.
- The pack test installs stylelint and sass-parser in the throwaway consumer from the registry,
  for sass-parser 0.4 and 0.5, and runs the consumer's own stylelint CLI.

## [0.1.0] - 2026-11-15

Initial release of `@theagenticengineer/stylelint-sass` — a Stylelint plugin for linting `.sass`
(indented syntax) files, built on
[sass-parser](https://www.npmjs.com/package/sass-parser).

### Added

- Published to GitHub Packages as `@theagenticengineer/stylelint-sass`, released by a `v*` tag
- A `@theagenticengineer/stylelint-sass/syntax` entry for Stylelint's `customSyntax`

#### 23 lint rules across 7 categories

**Disallow** — ban deprecated or unwanted statements:

- `sass/no-debug` — disallow `@debug` statements
- `sass/no-warn` — disallow `@warn` statements
- `sass/no-import` — disallow `@import` (use `@use`/`@forward` instead)

**Naming** — enforce consistent naming patterns:

- `sass/dollar-variable-pattern` — `$variable` names must match a pattern (default: kebab-case)
- `sass/percent-placeholder-pattern` — `%placeholder` names must match a pattern
- `sass/at-mixin-pattern` — `@mixin` names must match a pattern
- `sass/at-function-pattern` — `@function` names must match a pattern

**@extend** — validate `@extend` usage:

- `sass/at-extend-no-missing-placeholder` — `@extend` must target a `%placeholder`

**Ordering** — enforce declaration order within blocks:

- `sass/extends-before-declarations` — `@extend` must come before declarations
- `sass/mixins-before-declarations` — `@include` must come before declarations
- `sass/declarations-before-nesting` — declarations must come before nested rules

**Modern Sass** — encourage the modern module system:

- `sass/no-global-function-names` — disallow deprecated global functions
  (e.g., `darken()` → `color.adjust()`)
- `sass/at-use-no-redundant-alias` — disallow redundant aliases in `@use`
- `sass/at-if-no-null` — disallow explicit `!= null` checks (use truthiness)
- `sass/at-use-no-unnamespaced` — disallow `@use ... as *`

**Duplicates** — detect duplicate definitions:

- `sass/no-duplicate-mixins` — disallow duplicate `@mixin` definitions within scope
- `sass/no-duplicate-dollar-variables` — disallow duplicate `$variable` definitions
  within scope
- `sass/no-duplicate-load-rules` — disallow duplicate `@use` or `@forward` statements

**Best Practices** — catch common mistakes:

- `sass/no-color-literals` — disallow color literals outside of variable declarations
- `sass/operator-no-unspaced` — require spaces around operators in expressions
- `sass/dimension-no-non-numeric-values` — disallow non-numeric values in dimension
  expressions
- `sass/selector-no-union-class-name` — disallow union class name selectors
  (e.g., `&-suffix`)
- `sass/selector-no-redundant-nesting-selector` — disallow redundant nesting selectors
  (`&`)

#### Recommended config

A `@theagenticengineer/stylelint-sass/recommended` config that enables:

- 8 core Stylelint rules pre-configured for Sass (`at-rule-no-unknown` with
  Sass at-rules whitelisted, `color-no-invalid-hex`, `block-no-empty`,
  `max-nesting-depth`, and more)
- All 23 plugin rules at their recommended defaults

#### Dev infrastructure

- CI pipeline (GitHub Actions) — typecheck, lint, format, test on Node 20/22
- Upstream release monitoring (`stylelint-scss` release tracker)
- Dev Container for instant contributor onboarding
- Comprehensive SDLC documentation

[0.2.0]: https://github.com/theagenticengineer/stylelint-sass/releases/tag/v0.2.0
[0.1.1]: https://github.com/theagenticengineer/stylelint-sass/releases/tag/v0.1.1
[0.1.0]: https://github.com/theagenticengineer/stylelint-sass/releases/tag/v0.1.0
[#99]: https://github.com/theagenticengineer/stylelint-sass/issues/99
[#100]: https://github.com/theagenticengineer/stylelint-sass/issues/100
[#101]: https://github.com/theagenticengineer/stylelint-sass/issues/101
[#102]: https://github.com/theagenticengineer/stylelint-sass/issues/102
[#103]: https://github.com/theagenticengineer/stylelint-sass/issues/103
[#104]: https://github.com/theagenticengineer/stylelint-sass/issues/104
[#105]: https://github.com/theagenticengineer/stylelint-sass/issues/105
[#106]: https://github.com/theagenticengineer/stylelint-sass/issues/106
[#107]: https://github.com/theagenticengineer/stylelint-sass/issues/107
[#108]: https://github.com/theagenticengineer/stylelint-sass/issues/108
[#109]: https://github.com/theagenticengineer/stylelint-sass/issues/109
[#110]: https://github.com/theagenticengineer/stylelint-sass/issues/110
[#111]: https://github.com/theagenticengineer/stylelint-sass/issues/111
[#112]: https://github.com/theagenticengineer/stylelint-sass/issues/112
[#113]: https://github.com/theagenticengineer/stylelint-sass/issues/113
[#114]: https://github.com/theagenticengineer/stylelint-sass/issues/114
[#115]: https://github.com/theagenticengineer/stylelint-sass/issues/115
[#116]: https://github.com/theagenticengineer/stylelint-sass/issues/116
[#117]: https://github.com/theagenticengineer/stylelint-sass/issues/117
[#118]: https://github.com/theagenticengineer/stylelint-sass/issues/118
[#119]: https://github.com/theagenticengineer/stylelint-sass/issues/119
[#120]: https://github.com/theagenticengineer/stylelint-sass/issues/120
[#121]: https://github.com/theagenticengineer/stylelint-sass/issues/121
[#122]: https://github.com/theagenticengineer/stylelint-sass/issues/122
[#123]: https://github.com/theagenticengineer/stylelint-sass/issues/123
[#124]: https://github.com/theagenticengineer/stylelint-sass/issues/124
[#125]: https://github.com/theagenticengineer/stylelint-sass/issues/125
[#126]: https://github.com/theagenticengineer/stylelint-sass/issues/126
[#127]: https://github.com/theagenticengineer/stylelint-sass/issues/127
[#128]: https://github.com/theagenticengineer/stylelint-sass/issues/128
[#137]: https://github.com/theagenticengineer/stylelint-sass/issues/137
[#139]: https://github.com/theagenticengineer/stylelint-sass/issues/139
[#158]: https://github.com/theagenticengineer/stylelint-sass/issues/158
[#166]: https://github.com/theagenticengineer/stylelint-sass/issues/166
