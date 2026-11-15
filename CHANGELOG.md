# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The `stylelint` peer range is `>=17.8.0 <19`, and CI tests stylelint 17.8.0 and 18.0.0
  ([#112](https://github.com/theagenticengineer/stylelint-sass/issues/112)).
- The Node.js floor is `>=20.19.0`, the floor of stylelint 17.8. Stylelint 18 needs Node.js 22.22.2
  or later ([#111](https://github.com/theagenticengineer/stylelint-sass/issues/111)).
- The development dependency is sass-parser 0.5.6, and CI also tests sass-parser 0.4.42
  ([#123](https://github.com/theagenticengineer/stylelint-sass/issues/123)).
- The rule tests lint through the plugin's `/syntax` entry, as consumers do.

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

[0.1.1]: https://github.com/theagenticengineer/stylelint-sass/releases/tag/v0.1.1
[0.1.0]: https://github.com/theagenticengineer/stylelint-sass/releases/tag/v0.1.0
