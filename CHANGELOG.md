# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased

Initial release of `stylelint-sass` — a Stylelint plugin for linting `.sass`
(indented syntax) files, built on
[sass-parser](https://www.npmjs.com/package/sass-parser).

### Added

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

A `stylelint-sass/recommended` config that enables:

- 8 core Stylelint rules pre-configured for Sass (`at-rule-no-unknown` with
  Sass at-rules whitelisted, `color-no-invalid-hex`, `block-no-empty`,
  `max-nesting-depth`, and more)
- All 23 plugin rules at their recommended defaults

#### Dev infrastructure

- CI pipeline (GitHub Actions) — typecheck, lint, format, test on Node 20/22
- AI-powered code review (Gemini 2.5 Flash) on every PR
- Upstream release monitoring (`stylelint-scss` release tracker)
- Dev Container for instant contributor onboarding
- Comprehensive SDLC documentation

[0.1.0]: https://github.com/theagenticengineer/stylelint-sass/releases/tag/v0.1.0
