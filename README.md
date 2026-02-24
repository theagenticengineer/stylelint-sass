# stylelint-sass

A [Stylelint](https://stylelint.io/) plugin for linting `.sass` (indented syntax) files. Built on
[sass-parser](https://www.npmjs.com/package/sass-parser) (official, PostCSS-compatible, maintained
by the Sass team).

## Why SASS? Why not Tailwind?

Tailwind solves real problems for human teams: naming fatigue, dead CSS accumulation,
inconsistency across developers, and onboarding friction. But in an **agentic development**
workflow — where AI agents write and maintain the majority of code — the calculus changes:

<!-- markdownlint-disable MD013 -->

| Tailwind advantage          | For human teams | For AI agents                                              |
| --------------------------- | --------------- | ---------------------------------------------------------- |
| Eliminates naming fatigue   | High value      | **Irrelevant** — naming has zero cognitive cost for agents |
| Enforces consistency        | High value      | **Redundant** — agents follow design tokens precisely      |
| Low onboarding friction     | High value      | **Irrelevant** — agents don't need onboarding              |
| Colocation (style + markup) | Medium value    | **Marginal** — agents read multiple files without cost     |
| Prevents dead CSS           | High value      | **Replaceable** — PurgeCSS solves this at build time       |

<!-- markdownlint-enable MD013 -->

With Tailwind's advantages neutralized, SASS offers clear benefits: clean semantic HTML, full
separation of concerns, zero framework lock-in, nesting/mixins/partials for DRY stylesheets,
and equivalent bundle performance via PurgeCSS. Dead CSS prevention is handled by PurgeCSS
(build), Stylelint (lint), and Knip (project audit).

The missing piece was a **modern Stylelint plugin for `.sass` indented syntax** — the existing
`stylelint-scss` targets SCSS only, and the original `sass-lint` is unmaintained. This project
fills that gap, built on the official `sass-parser` maintained by the Sass team.

## Installation

```bash
npm install --save-dev stylelint sass-parser stylelint-sass
```

Peer dependencies: `stylelint >= 16` and `sass-parser >= 0.4`.

## Usage

```js
// stylelint.config.js
export default {
  customSyntax: 'sass-parser',
  extends: ['stylelint-sass/recommended'],
};
```

```bash
npx stylelint "src/**/*.sass"
```

## Rules

<!-- markdownlint-disable MD013 -->

| Rule                                                                                                  | Default      | Category       |
| ----------------------------------------------------------------------------------------------------- | ------------ | -------------- |
| [`sass/no-debug`](docs/rules/no-debug.md)                                                             | `true`       | Disallow       |
| [`sass/no-warn`](docs/rules/no-warn.md)                                                               | `true`       | Disallow       |
| [`sass/no-import`](docs/rules/no-import.md)                                                           | `true`       | Disallow       |
| [`sass/dollar-variable-pattern`](docs/rules/dollar-variable-pattern.md)                               | `kebab-case` | Naming         |
| [`sass/percent-placeholder-pattern`](docs/rules/percent-placeholder-pattern.md)                       | `kebab-case` | Naming         |
| [`sass/at-mixin-pattern`](docs/rules/at-mixin-pattern.md)                                             | `kebab-case` | Naming         |
| [`sass/at-function-pattern`](docs/rules/at-function-pattern.md)                                       | `kebab-case` | Naming         |
| [`sass/at-extend-no-missing-placeholder`](docs/rules/at-extend-no-missing-placeholder.md)             | `true`       | @extend        |
| [`sass/extends-before-declarations`](docs/rules/extends-before-declarations.md)                       | `true`       | Ordering       |
| [`sass/mixins-before-declarations`](docs/rules/mixins-before-declarations.md)                         | `true`       | Ordering       |
| [`sass/declarations-before-nesting`](docs/rules/declarations-before-nesting.md)                       | `true`       | Ordering       |
| [`sass/no-global-function-names`](docs/rules/no-global-function-names.md)                             | `true`       | Modern Sass    |
| [`sass/at-use-no-redundant-alias`](docs/rules/at-use-no-redundant-alias.md)                           | `true`       | Modern Sass    |
| [`sass/at-if-no-null`](docs/rules/at-if-no-null.md)                                                   | `true`       | Modern Sass    |
| [`sass/at-use-no-unnamespaced`](docs/rules/at-use-no-unnamespaced.md)                                 | `true`       | Modern Sass    |
| [`sass/no-duplicate-mixins`](docs/rules/no-duplicate-mixins.md)                                       | `true`       | Duplicates     |
| [`sass/no-duplicate-dollar-variables`](docs/rules/no-duplicate-dollar-variables.md)                   | `true`       | Duplicates     |
| [`sass/no-duplicate-load-rules`](docs/rules/no-duplicate-load-rules.md)                               | `true`       | Duplicates     |
| [`sass/no-color-literals`](docs/rules/no-color-literals.md)                                           | `true`       | Best Practices |
| [`sass/operator-no-unspaced`](docs/rules/operator-no-unspaced.md)                                     | `true`       | Best Practices |
| [`sass/dimension-no-non-numeric-values`](docs/rules/dimension-no-non-numeric-values.md)               | `true`       | Best Practices |
| [`sass/selector-no-union-class-name`](docs/rules/selector-no-union-class-name.md)                     | `true`       | Best Practices |
| [`sass/selector-no-redundant-nesting-selector`](docs/rules/selector-no-redundant-nesting-selector.md) | `true`       | Best Practices |

<!-- markdownlint-enable MD013 -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, branch naming conventions,
and rule implementation guide.

The fastest way to get a working dev environment is with a
[Dev Container](.devcontainer/README.md) — open the repo in VS Code or Cursor and run
**Dev Containers: Reopen in Container**. Everything (Node 22, pnpm, GitHub CLI (gh),
Graphite CLI (gt), Claude Code) is pre-installed, and host authentication persists across rebuilds
via bind mounts.

For local AI code review before CI, install
[PAL MCP Server](https://github.com/BeehiveInnovations/pal-mcp-server) on your host — the
Dev Container picks up your MCP config automatically. PAL enables the `/review-pr` skill to run
local code review (Phase 1) before pushing, catching issues without a full CI round-trip. See
[setup details](.devcontainer/README.md#pal-mcp-server-recommended).
