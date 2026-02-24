# Desired State

## What We're Building

A Stylelint plugin package called **`stylelint-sass`** that provides
lint rules specific to Sass indented syntax (`.sass`), using
**sass-parser** (official) as the custom syntax parser.

The plugin does NOT reimplement what Stylelint core already provides.
It adds rules for Sass-specific constructs (mixins, variables,
placeholders, @use/@forward, ordering) and ships a `recommended`
config that bundles both core Stylelint rules and plugin rules tuned
for `.sass` files.

---

## Installation

```bash
npm install --save-dev stylelint sass-parser stylelint-sass
```

Peer dependencies:

- `stylelint >= 16.0.0`
- `sass-parser >= 0.4.0`

---

## Configuration

### Minimal (recommended preset)

`.stylelintrc.json`:

```json
{
  "customSyntax": "sass-parser/lib/syntax/sass",
  "extends": ["stylelint-sass/recommended"]
}
```

This single config gives you:

- All Stylelint core rules that apply to `.sass`
  (pre-configured, with Sass `@`-rules whitelisted)
- All `sass/*` plugin rules at their recommended severity

### Explicit (pick rules manually)

```json
{
  "customSyntax": "sass-parser/lib/syntax/sass",
  "plugins": ["stylelint-sass"],
  "rules": {
    "sass/no-debug": true,
    "sass/no-import": true,
    "sass/dollar-variable-pattern": "/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/",
    "sass/at-mixin-pattern": "/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/",
    "sass/at-extend-no-missing-placeholder": true,
    "sass/declarations-before-nesting": true
  }
}
```

### Mixed codebase (.sass + .scss + .css)

```json
{
  "overrides": [
    {
      "files": ["**/*.sass"],
      "customSyntax": "sass-parser/lib/syntax/sass",
      "extends": ["stylelint-sass/recommended"]
    },
    {
      "files": ["**/*.scss"],
      "customSyntax": "sass-parser/lib/syntax/scss",
      "extends": ["stylelint-config-standard-scss"]
    }
  ]
}
```

---

## CLI Usage

```bash
# Lint all .sass files
npx stylelint "src/**/*.sass"

# Lint with autofix (only rules that support it)
npx stylelint "src/**/*.sass" --fix

# Output as JSON (CI integration)
npx stylelint "src/**/*.sass" -f json
```

---

## Editor Integration

Works with any editor that supports Stylelint:

- **VS Code / Cursor**: `stylelint.vscode-stylelint` extension — auto-detects `.stylelintrc.json`
- **Neovim**: `nvim-lint` or `none-ls` with Stylelint source
- **JetBrains**: Built-in Stylelint support

No special configuration needed — the `customSyntax` in
`.stylelintrc.json` handles `.sass` parsing automatically.

---

## What the `recommended` Config Includes

### From Stylelint core (pre-configured for Sass)

These core rules work out of the box with sass-parser. The
recommended config enables them with Sass-appropriate settings:

<!-- markdownlint-disable MD013 -->

| Core Rule                                   | Setting                            | Notes                    |
| ------------------------------------------- | ---------------------------------- | ------------------------ |
| `color-no-invalid-hex`                      | `true`                             |                          |
| `declaration-block-no-duplicate-properties` | `true`                             |                          |
| `block-no-empty`                            | `true`                             |                          |
| `no-duplicate-selectors`                    | `true`                             |                          |
| `declaration-no-important`                  | `true`                             |                          |
| `no-descending-specificity`                 | `true`                             |                          |
| `no-eol-whitespace`                         | `true`                             |                          |
| `no-missing-end-of-source-newline`          | `true`                             |                          |
| `max-nesting-depth`                         | `[3]`                              | Default max 3 levels     |
| `at-rule-no-unknown`                        | `[true, { ignoreAtRules: [...] }]` | Whitelists Sass at-rules |
| `shorthand-property-no-redundant-values`    | `true`                             |                          |
| `length-zero-no-unit`                       | `true`                             |                          |

<!-- markdownlint-enable MD013 -->

### From stylelint-sass plugin (this project)

<!-- markdownlint-disable MD013 -->

| Plugin Rule                                   | Default                             | Category       |
| --------------------------------------------- | ----------------------------------- | -------------- |
| `sass/no-debug`                               | `true`                              | Disallow       |
| `sass/no-warn`                                | `true`                              | Disallow       |
| `sass/no-import`                              | `true`                              | Disallow       |
| `sass/at-extend-no-missing-placeholder`       | `true`                              | @extend        |
| `sass/dollar-variable-pattern`                | `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"` | Naming         |
| `sass/percent-placeholder-pattern`            | `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"` | Naming         |
| `sass/at-mixin-pattern`                       | `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"` | Naming         |
| `sass/at-function-pattern`                    | `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"` | Naming         |
| `sass/no-duplicate-mixins`                    | `true`                              | Duplicates     |
| `sass/no-duplicate-dollar-variables`          | `true`                              | Duplicates     |
| `sass/no-duplicate-load-rules`                | `true`                              | Duplicates     |
| `sass/no-global-function-names`               | `true`                              | Modern Sass    |
| `sass/at-use-no-redundant-alias`              | `true`                              | Modern Sass    |
| `sass/at-if-no-null`                          | `true`                              | Modern Sass    |
| `sass/extends-before-declarations`            | `true`                              | Ordering       |
| `sass/mixins-before-declarations`             | `true`                              | Ordering       |
| `sass/declarations-before-nesting`            | `true`                              | Ordering       |
| `sass/selector-no-redundant-nesting-selector` | `true`                              | Best practices |
| `sass/no-color-literals`                      | `"warning"`                         | Best practices |
| `sass/operator-no-unspaced`                   | `true`                              | Best practices |
| `sass/dimension-no-non-numeric-values`        | `true`                              | Best practices |
| `sass/selector-no-union-class-name`           | `true`                              | Best practices |
| `sass/at-use-no-unnamespaced`                 | `true`                              | Modern Sass    |

<!-- markdownlint-enable MD013 -->
