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

The package is published to GitHub Packages, which requires a token even to install. Two npmrc
files hold the setup:

- the project `.npmrc` maps the `@theagenticengineer` scope to GitHub's registry
- a user-level npmrc holds the token, because pnpm expands environment variables in registry
  credentials only from a user-level npmrc

Project `.npmrc`, committed with the project:

```ini
@theagenticengineer:registry=https://npm.pkg.github.com
```

On a developer machine, add the token line to `~/.npmrc` and export `NODE_AUTH_TOKEN`, a classic
personal access token with `read:packages`:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

In GitHub Actions, `actions/setup-node` writes that user-level npmrc. The package grants the
consuming repository read access in its package settings (**Manage Actions access**):

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      registry-url: https://npm.pkg.github.com
      scope: '@theagenticengineer'
  - run: pnpm install --frozen-lockfile
    env:
      NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then install:

```bash
pnpm add -D stylelint sass-parser @theagenticengineer/stylelint-sass
```

Install all three as local devDependencies of the project. Stylelint resolves `extends`,
`plugins` and `customSyntax` from the project's `node_modules`, and Stylelint 18 no longer looks in
the global `node_modules`.

### Supported versions

<!-- markdownlint-disable MD013 -->

| Package     | Range          | Tested in CI      |
| ----------- | -------------- | ----------------- |
| stylelint   | `>=17.8.0 <19` | 17.8.0 and 18.0.0 |
| sass-parser | `>=0.4 <0.6`   | 0.4.42 and 0.5.6  |
| Node.js     | `>=20.19.0`    | 20, 22 and 24     |

<!-- markdownlint-enable MD013 -->

- Stylelint 17.8 runs on Node.js 20.19 and later.
- Stylelint 18 runs on Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.
- The plugin works when sass-parser and Stylelint resolve different postcss copies, which is the
  usual pnpm layout, so a `postcss` override is optional.

## Usage

```js
// stylelint.config.js
export default {
  customSyntax: '@theagenticengineer/stylelint-sass/syntax',
  extends: ['@theagenticengineer/stylelint-sass/recommended'],
};
```

A TypeScript config works too. Stylelint 18 loads it with Node.js type stripping, so it imports
types with `import type` and uses erasable syntax only:

```ts
// stylelint.config.ts
import type { Config } from 'stylelint';

const config: Config = {
  customSyntax: '@theagenticengineer/stylelint-sass/syntax',
  extends: ['@theagenticengineer/stylelint-sass/recommended'],
};

export default config;
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

## Core rules on `.sass`

Core Stylelint rules read the AST that sass-parser builds, and sass-parser rewrites some source
text:

- Colors in declaration values become hex: `color: red` reaches the rules as `#ff0000`. So
  `color-named` never reports, and `color-no-hex` reports named colors as hex, with or without
  its `ignoreFunctions` option. `sass/no-color-literals` reads the source text, so it is the
  color rule for `.sass`.
- Sass nested properties (`font:` with `family` and `size` children) leave the parent
  declaration with an empty value, which `declaration-property-value-no-unknown` reports. So
  `recommended` leaves that rule off.
- `function-no-unknown` reports user-defined Sass functions, such as `double()` from
  `@function double`, because CSS does not define them; it skips namespaced calls such as
  `math.div()`. `recommended` turns it off, so list `recommended` after
  `stylelint-config-standard` in `extends`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, branch naming conventions,
and rule implementation guide.

The fastest way to get a working dev environment is with a
[Dev Container](.devcontainer/README.md) — open the repo in VS Code or Cursor and run
**Dev Containers: Reopen in Container**. Everything (Node 22, pnpm, GitHub CLI (gh),
Claude Code) is pre-installed, and host authentication persists across rebuilds
via bind mounts.
