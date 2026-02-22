# stylelint-sass

A [Stylelint](https://stylelint.io/) plugin for linting `.sass` (indented syntax) files. Built on
[sass-parser](https://www.npmjs.com/package/sass-parser) (official, PostCSS-compatible, maintained
by the Sass team).

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

| Rule                                                                                      | Default      | Category    |
| ----------------------------------------------------------------------------------------- | ------------ | ----------- |
| [`sass/no-debug`](docs/rules/no-debug.md)                                                 | `true`       | Disallow    |
| [`sass/no-warn`](docs/rules/no-warn.md)                                                   | `true`       | Disallow    |
| [`sass/no-import`](docs/rules/no-import.md)                                               | `true`       | Disallow    |
| [`sass/at-extend-no-missing-placeholder`](docs/rules/at-extend-no-missing-placeholder.md) | `true`       | @extend     |
| [`sass/dollar-variable-pattern`](docs/rules/dollar-variable-pattern.md)                   | `kebab-case` | Naming      |
| [`sass/percent-placeholder-pattern`](docs/rules/percent-placeholder-pattern.md)           | `kebab-case` | Naming      |
| [`sass/at-mixin-pattern`](docs/rules/at-mixin-pattern.md)                                 | `kebab-case` | Naming      |
| [`sass/at-function-pattern`](docs/rules/at-function-pattern.md)                           | `kebab-case` | Naming      |
| [`sass/no-global-function-names`](docs/rules/no-global-function-names.md)                 | `true`       | Modern Sass |
| [`sass/at-use-no-redundant-alias`](docs/rules/at-use-no-redundant-alias.md)               | `true`       | Modern Sass |
| [`sass/at-if-no-null`](docs/rules/at-if-no-null.md)                                       | `true`       | Modern Sass |
| [`sass/extends-before-declarations`](docs/rules/extends-before-declarations.md)           | `true`       | Ordering    |
| [`sass/mixins-before-declarations`](docs/rules/mixins-before-declarations.md)             | `true`       | Ordering    |
| [`sass/declarations-before-nesting`](docs/rules/declarations-before-nesting.md)           | `true`       | Ordering    |

<!-- markdownlint-enable MD013 -->

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, branch naming conventions,
and rule implementation guide.

The fastest way to get a working dev environment is with a
[Dev Container](.devcontainer/README.md) — open the repo in VS Code or Cursor and run
**Dev Containers: Reopen in Container**. Everything (Node 22, pnpm, gh CLI, Graphite CLI,
Claude Code) is pre-installed.
