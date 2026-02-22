# Implementation Plan: stylelint-sass

## Context

No maintained linter exists for `.sass` (indented syntax) files.
The archived `sasstools/sass-lint` used gonzales-pe (dead parser).
This project builds a **Stylelint plugin** (`stylelint-sass`) using
the official `sass-parser` as custom syntax, providing Sass-specific
rules while delegating generic CSS linting to Stylelint's 168 core
rules.

The repository currently contains only planning docs (18 rule specs,
architecture, roadmap) and zero source code. This plan covers MECE
gap analysis, scaffolding, and full implementation.

---

## MECE Analysis: Gap Assessment

### Coverage Model

The linter's coverage comes from TWO layers:

1. **Stylelint core rules** (12 pre-configured in `recommended`
   config) — generic CSS linting
2. **Plugin rules** (18 specs exist) — Sass-specific linting

### What the 18 existing rules cover

| Category            | Rules                                         | #      | Status   |
| ------------------- | --------------------------------------------- | ------ | -------- |
| Debug/development   | no-debug, no-warn                             | 2      | Complete |
| Deprecated features | no-import, no-global-function-names           | 2      | Complete |
| Module system       | at-use-no-unnamespaced                        | 1      | Partial  |
| Naming conventions  | 4 naming pattern rules                        | 4      | Complete |
| @extend safety      | at-extend-no-missing-placeholder              | 1      | Complete |
| Code ordering       | 3 ordering rules                              | 3      | Complete |
| Duplicate detection | no-duplicate-mixins, no-duplicate-dollar-vars | 2      | Partial  |
| Values/expressions  | no-color-literals, operator-no-unspaced       | 2      | Complete |
| Selector quality    | selector-no-redundant-nesting-selector        | 1      | Partial  |
| **Total**           |                                               | **18** |          |

### What Stylelint core covers (no plugin needed)

These are NOT gaps — they're already handled by core rules in
`recommended` config:

- `color-no-invalid-hex`
- `declaration-block-no-duplicate-properties`
- `block-no-empty`
- `no-duplicate-selectors`
- `declaration-no-important`
- `no-descending-specificity`
- `max-nesting-depth`
- `at-rule-no-unknown` (with Sass whitelist)
- `selector-class-pattern`, `selector-id-pattern`
- `no-eol-whitespace`, `no-missing-end-of-source-newline`
- `shorthand-property-no-redundant-values`, `length-zero-no-unit`

### Genuine MECE gaps (rules to ADD)

| Missing Rule                           | Category      | Priority |
| -------------------------------------- | ------------- | -------- |
| `sass/no-duplicate-load-rules`         | Duplicates    | High     |
| `sass/at-use-no-redundant-alias`       | Module system | High     |
| `sass/selector-no-union-class-name`    | Selectors     | Medium   |
| `sass/dimension-no-non-numeric-values` | Values        | Medium   |
| `sass/at-if-no-null`                   | Control flow  | Medium   |
| `sass/comment-no-loud`                 | Comments      | Low      |
| `sass/function-no-unknown`             | Validation    | Low      |

**Decision**: Add the top 5 (High + Medium) to implementation.
Low priority deferred to v0.2.

---

## Phase 0 — Scaffolding (6 commits)

### Commit 0a — Initial commit (plans + docs only)

Commit existing planning docs and project files. No source code.

- `docs/plan/` — all existing plan files and rule specs
- `docs/plan/03-implementation-plan.md` — this plan
- `CLAUDE.md`
- `.claude/settings.local.json`
- `.gitignore`
- `LICENSE` (MIT)

### Commit 0b — Package setup + TypeScript

- `package.json` — name: `stylelint-sass`, type: `module`, ESM
- `tsconfig.json` — strict, ESM, outDir: `dist`
- `pnpm-lock.yaml`

Dependencies:

- peer + dev: `stylelint >=16.0.0`, `sass-parser >=0.4.0`
- dev: `vitest`, `typescript`, `@types/node`

### Commit 0c — Linting + formatting toolchain

- `eslint.config.js` — ESLint flat config for TS
- `.prettierrc.json` — 100 char width
- `.prettierignore`
- `.markdownlint.json` — line-length: 100
- `.editorconfig` — max line length 100
- `commitlint.config.js` — conventional commits
- `.husky/pre-commit` — runs lint-staged
- `.husky/commit-msg` — runs commitlint
- `.lintstagedrc.json` — per-filetype config

### Commit 0d — Plugin skeleton + smoke tests

- `src/index.ts` — empty plugin array
- `src/recommended.ts` — 12 core Stylelint rules for Sass
- `src/utils/namespace.ts` — plugin namespace
- `src/utils/ast.ts` — syntax tree helpers
- `vitest.config.ts`
- `src/__tests__/smoke.test.ts` — smoke tests

### Commit 0e — CI + AI review workflows

- `.github/workflows/ci.yml` — CI pipeline
  (Node 18/20/22 matrix)
- `.github/workflows/ai-review.yml` — Gemini API review
- `CONTRIBUTING.md` — contributor guide

### Commit 0f — Claude skills

- `.claude/commands/add-rule.md`
- `.claude/commands/create-issues.md`
- `.claude/commands/worktree-phase.md`
- `.claude/commands/clean-worktree.md`
- `.claude/commands/review-pr.md`

**Phase 0 exit**: `pnpm check` passes.

---

## Phase 1 — Disallow Rules (3 commits)

Simplest rules. Each walks the parsed file for a specific `@`-rule
and reports it. Establishes the rule pattern.

| Commit | Rule             | Details                 |
| ------ | ---------------- | ----------------------- |
| 1a     | `sass/no-debug`  | `walkAtRules('debug')`  |
| 1b     | `sass/no-warn`   | `walkAtRules('warn')`   |
| 1c     | `sass/no-import` | `walkAtRules('import')` |

---

## Phase 2 — Naming Pattern Rules (5 commits)

| Commit | What                                             |
| ------ | ------------------------------------------------ |
| 2a     | `src/utils/patterns.ts` — shared pattern utility |
| 2b     | `sass/dollar-variable-pattern`                   |
| 2c     | `sass/percent-placeholder-pattern`               |
| 2d     | `sass/at-mixin-pattern`                          |
| 2e     | `sass/at-function-pattern`                       |

---

## Phase 3 — @extend + Ordering Rules (5 commits)

| Commit | What                                              |
| ------ | ------------------------------------------------- |
| 3a     | `src/utils/ordering.ts` — shared ordering utility |
| 3b     | `sass/at-extend-no-missing-placeholder`           |
| 3c     | `sass/extends-before-declarations`                |
| 3d     | `sass/mixins-before-declarations`                 |
| 3e     | `sass/declarations-before-nesting`                |

---

## Phase 4 — Duplicate Detection (3 commits)

| Commit | Rule                                 |
| ------ | ------------------------------------ |
| 4a     | `sass/no-duplicate-mixins`           |
| 4b     | `sass/no-duplicate-dollar-variables` |
| 4c     | `sass/no-duplicate-load-rules` (NEW) |

---

## Phase 5 — Best Practices (5 commits)

| Commit | Rule                                          |
| ------ | --------------------------------------------- |
| 5a     | `sass/selector-no-redundant-nesting-selector` |
| 5b     | `sass/no-color-literals`                      |
| 5c     | `sass/operator-no-unspaced`                   |
| 5d     | `sass/selector-no-union-class-name` (NEW)     |
| 5e     | `sass/dimension-no-non-numeric-values` (NEW)  |

---

## Phase 6 — Modern Sass (4 commits)

| Commit | Rule                                   |
| ------ | -------------------------------------- |
| 6a     | `sass/at-use-no-unnamespaced`          |
| 6b     | `sass/no-global-function-names`        |
| 6c     | `sass/at-use-no-redundant-alias` (NEW) |
| 6d     | `sass/at-if-no-null` (NEW)             |

---

## Phase 7 — Polish + Publish

- README (installation, config, rule reference)
- Per-rule docs
- CHANGELOG.md
- Verify package.json exports
- `pnpm pack` dry run
- Final commit: `chore(release): prepare v0.1.0`

---

## Quality Gates

All gates must pass before every commit:

1. `tsc --noEmit` — zero errors
2. `eslint .` — zero errors/warnings
3. `markdownlint-cli2` — zero violations
4. `vitest run` — all tests pass
5. `prettier --check .` — formatting verified
6. `commitlint` — conventional commit format

Combined: `pnpm check`

---

## Commit Conventions

Format: `<type>(#<issue>): <description>`

| Type        | Usage                     |
| ----------- | ------------------------- |
| `feat:`     | New rule, utility, config |
| `fix:`      | Bug fix                   |
| `test:`     | Test additions only       |
| `chore:`    | Tooling, CI, deps         |
| `docs:`     | Documentation only        |
| `refactor:` | No behavior change        |

---

## Summary

- **23 plugin rules** (18 existing + 5 new)
- **12 Stylelint core rules** in recommended config
- **8 phases** (0-7)
- **Conventional commits**: atomic, one per rule
- **100 char line limit** in TypeScript and Markdown
- **Automated code review**: Copilot + Gemini API
- **5 Claude skills**: add-rule, create-issues,
  worktree-phase, clean-worktree, review-pr
