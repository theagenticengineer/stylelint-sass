<!-- markdownlint-disable MD024 -->

# Roadmap

## Guiding Principles

- **Autonomous agentic development**: each phase is self-contained
  with clear entry/exit criteria. Human feedback is only needed at
  phase gates (approve/reject before moving to next phase).
- **Test-first**: every rule has tests written before implementation.
  sass-parser alpha gaps are discovered early through test failures,
  not production surprises.
- **Ship incrementally**: a usable plugin is published after Phase 1.
  Each subsequent phase adds rules.

---

## Phase 0 — Scaffolding

**Goal**: Working project skeleton. No rules yet, but the plugin
loads in Stylelint and one smoke test passes.

### Tasks

1. `npm init` — create `package.json` with name `stylelint-sass`,
   type `module`
2. Install dependencies:
   - `stylelint` (peer + dev)
   - `sass-parser` (peer + dev)
   - `vitest` (dev)
   - `typescript` (dev)
3. Create `tsconfig.json` (ESM, strict, `outDir: dist`)
4. Create `vitest.config.ts`
5. Create `src/index.ts` — empty plugin array export
6. Create `src/recommended.ts` — config with core Stylelint rules
   configured for Sass `@`-rules
7. Write smoke test: load recommended config, lint a valid `.sass`
   string, assert zero warnings
8. Write smoke test: lint an invalid `.sass` string (e.g., invalid
   hex), assert Stylelint core catches it
9. Configure `package.json` exports:
   - `"."` → plugin entry
   - `"./recommended"` → recommended config
10. Add build script (`tsc`)
11. Add test script (`vitest run`)
12. Add CI config (GitHub Actions): build + test on Node 18, 20, 22

### Exit criteria

- `npm run build` succeeds
- `npm test` passes (smoke tests)
- `npx stylelint --custom-syntax sass-parser/lib/syntax/sass
"fixture.sass"` runs with recommended config

### Human feedback needed

- Confirm package name (`stylelint-sass` or alternative if taken
  on npm)
- Confirm Node version matrix

---

## Phase 1 — Disallow Rules (simplest)

**Goal**: Ship 3 simple rules that need only `walkAtRules`. These
are the easiest to implement and validate that the full pipeline
works.

### Rules

| Rule             | Complexity | Notes                   |
| ---------------- | ---------- | ----------------------- |
| `sass/no-debug`  | Trivial    | `walkAtRules('debug')`  |
| `sass/no-warn`   | Trivial    | `walkAtRules('warn')`   |
| `sass/no-import` | Trivial    | `walkAtRules('import')` |

### Tasks per rule

1. Write test file from test cases in `docs/plan/rules/`
2. Implement rule
3. All tests pass
4. Add rule to recommended config

### Exit criteria

- 3 rules implemented and tested
- Recommended config includes them
- README documents the 3 rules

### Human feedback needed

- None (proceed autonomously)

---

## Phase 2 — Naming Pattern Rules

**Goal**: 4 naming convention rules. Same structure, parameterized
by regex.

### Rules

| Rule                               | Complexity | Notes                     |
| ---------------------------------- | ---------- | ------------------------- |
| `sass/dollar-variable-pattern`     | Low        | `walkDecls`, check `$`    |
| `sass/percent-placeholder-pattern` | Low        | `walkRules`, check `%`    |
| `sass/at-mixin-pattern`            | Low        | `walkAtRules('mixin')`    |
| `sass/at-function-pattern`         | Low        | `walkAtRules('function')` |

### Shared utility

Create `src/utils/patterns.ts` — validates name against a
user-supplied regex. All 4 rules delegate to it.

### Tasks per rule

1. Write test file
2. Implement rule using shared pattern utility
3. All tests pass
4. Add to recommended config

### Exit criteria

- 4 rules implemented and tested
- `src/utils/patterns.ts` shared utility created
- Regex option parsing works (string to RegExp)

### Human feedback needed

- None

---

## Phase 3 — @extend and Ordering Rules

**Goal**: 4 structural rules that inspect node ordering within a
block.

### Rules

| Rule                                    | Complexity | Notes           |
| --------------------------------------- | ---------- | --------------- |
| `sass/at-extend-no-missing-placeholder` | Low        | Check `%` param |
| `sass/extends-before-declarations`      | Medium     | Track ordering  |
| `sass/mixins-before-declarations`       | Medium     | Track ordering  |
| `sass/declarations-before-nesting`      | Medium     | Track ordering  |

### Shared utility

Create `src/utils/ordering.ts` — given a Rule node, classifies
each child as `extend`, `include`, `declaration`, or `nested-rule`.
The 3 ordering rules use this classification.

### Tasks per rule

1. Write test file
2. Implement rule (ordering rules share utility)
3. All tests pass
4. Add to recommended config

### Exit criteria

- 4 rules implemented and tested
- `src/utils/ordering.ts` shared utility created
- Ordering rules correctly handle mixed content (comments,
  empty lines)

### Human feedback needed

- None

---

## Phase 4 — Duplicate Detection Rules

**Goal**: 2 rules that detect duplicate definitions within scope.

### Rules

| Rule                                 | Complexity | Notes                       |
| ------------------------------------ | ---------- | --------------------------- |
| `sass/no-duplicate-mixins`           | Medium     | Track mixin names per scope |
| `sass/no-duplicate-dollar-variables` | Medium     | Track var names, `!default` |

### Tasks per rule

1. Write test file
2. Implement rule with scope tracking
3. All tests pass
4. Add to recommended config

### Exit criteria

- 2 rules implemented and tested
- Scope tracking works (same name in different scopes is OK)
- `ignoreDefaults` option works for variables

### Human feedback needed

- None

---

## Phase 5 — Best Practices Rules

**Goal**: 3 rules that inspect selectors and values.

### Rules

| Rule                                          | Complexity | Notes                   |
| --------------------------------------------- | ---------- | ----------------------- |
| `sass/selector-no-redundant-nesting-selector` | Medium     | Fixable                 |
| `sass/no-color-literals`                      | High       | Needs `valueExpression` |
| `sass/operator-no-unspaced`                   | High       | Needs `valueExpression` |

### sass-parser dependency risk

`no-color-literals` and `operator-no-unspaced` depend on
sass-parser's `valueExpression` providing parsed value ASTs.
If this feature is incomplete in the current sass-parser version:

- **Fallback**: regex-based string parsing of `node.value`
- **Track**: open issues on sass-parser for missing value
  expression support

### Tasks per rule

1. Write test file
2. Probe sass-parser's `valueExpression` support for the needed
   node types
3. Implement rule (sass-parser AST preferred, regex fallback
   if needed)
4. All tests pass
5. Add to recommended config

### Exit criteria

- 3 rules implemented and tested
- Autofix works for `selector-no-redundant-nesting-selector`
  and `operator-no-unspaced`
- Fallback strategy documented if sass-parser gaps were hit

### Human feedback needed

- If sass-parser `valueExpression` is too incomplete, confirm
  whether to ship regex fallback or defer rules to a later phase

---

## Phase 6 — Modern Sass Rules

**Goal**: 2 rules that enforce modern Sass module system usage.

### Rules

| Rule                            | Complexity | Notes                  |
| ------------------------------- | ---------- | ---------------------- |
| `sass/no-global-function-names` | High       | Map deprecated globals |
| `sass/at-use-no-unnamespaced`   | Low        | Check `as *` in params |

### Tasks

1. Write test files
2. Build global function name map
   (`darken` to `color.adjust`, `map-get` to `map.get`, etc.)
3. Implement `no-global-function-names` (value inspection or regex)
4. Implement `at-use-no-unnamespaced` (simple string check)
5. All tests pass
6. Add to recommended config

### Exit criteria

- 2 rules implemented and tested
- Global function map covers sass:math, sass:color, sass:list,
  sass:map, sass:string, sass:selector, sass:meta
- `@forward ... as *` is NOT flagged (only `@use ... as *`)

### Human feedback needed

- None

---

## Phase 7 — Polish and Publish

**Goal**: First public release on npm.

### Tasks

1. Write README with:
   - Installation instructions
   - Configuration examples (minimal, explicit, mixed codebase)
   - Rule reference table with links to individual rule docs
2. Generate rule documentation from test case files
3. Add `CHANGELOG.md`
4. Add `LICENSE` (MIT)
5. Verify `package.json` metadata (description, keywords,
   repository, exports)
6. Dry run: `npm pack` and inspect contents
7. Publish `v0.1.0` to npm
8. Create GitHub release

### Exit criteria

- `npm install stylelint-sass` works
- README is complete
- All 18 rules documented with examples

### Human feedback needed

- Confirm npm org/scope (e.g., `stylelint-sass` vs
  `@stylelint-sass/core`)
- Approve README before publish

---

## Future Phases (post v0.1.0)

| Phase       | Rules / Features                     | Notes                       |
| ----------- | ------------------------------------ | --------------------------- |
| **v0.2**    | Autofix for fixable rules            | Snapshot testing on `.sass` |
| **v0.2**    | `sass/no-qualifying-elements`        | Disallow `div.class`        |
| **v0.2**    | `sass/declaration-nested-properties` | Nested props                |
| **v0.3**    | `sass/property-sort-order`           | Alpha or custom groups      |
| **v0.3**    | `sass/partial-no-import`             | Partials: no @import        |
| **v0.4**    | Shared config presets                | `strict`, `loose`           |
| **v0.5**    | Migration CLI                        | `.sass-lint.yml` migration  |
| **ongoing** | Track sass-parser releases           | Remove fallbacks            |

---

## Phase Dependency Graph

```text
Phase 0 (Scaffolding)
  |
  +-- Phase 1 (Disallow Rules)
  |     |
  |     +-- Phase 2 (Naming Patterns)
  |     |
  |     +-- Phase 3 (@extend + Ordering)
  |     |     |
  |     |     +-- Phase 4 (Duplicate Detection)
  |     |
  |     +-- Phase 6 (Modern Sass)
  |
  +-- Phase 5 (Best Practices)
        |
        +-- Phase 6 (no-global-function-names)
              |
              +-- Phase 7 (Polish + Publish)
```

Phases 2, 3, and 6 (`at-use-no-unnamespaced` only) can run in
parallel after Phase 1.
