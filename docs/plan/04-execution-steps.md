# Execution Steps

Exhaustive, atomic execution steps for implementing `stylelint-sass`. Each step has explicit
preconditions, actions, and postconditions.

**No planning nor task changes during execution without human approval.**

---

## Current State

- Zero commits — repo initialized, no history
- Planning docs, rule specs, CLAUDE.md, .claude/settings exist as untracked files
- Remote `theagenticengineer/stylelint-sass` exists (empty)
- No issues exist on GitHub
- No `package.json` or source code yet

---

## Prerequisites

### PAL MCP Server (formerly ZenMCP)

The `/review-pr` skill runs PAL MCP Server locally before creating a PR — catches issues early,
before code hits CI. Set up before starting execution.

**Install**: requires Python 3.10+ and `uv` package manager. No clone needed — runs via `uvx`.

**Configure**: add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "pal": {
      "command": "bash",
      "args": [
        "-c",
        "uvx --from git+https://github.com/BeehiveInnovations/pal-mcp-server.git pal-mcp-server"
      ],
      "env": {
        "GEMINI_API_KEY": "<your-key>",
        "DISABLED_TOOLS": "analyze,refactor,testgen,secaudit,docgen,tracer",
        "DEFAULT_MODEL": "auto"
      }
    }
  }
}
```

**API key**: get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

**Tools used by this project**:

- `codereview` — severity-based code review (sends diff to Gemini Pro, leverages 1M token context
  window)
- `consensus` — multi-model debate for design decisions

### Graphite CLI

Stacked PRs enable 1:1 issue-to-PR mapping while keeping parallel worktrees. Each rule gets its own
branch → PR → merge cycle.

**Install**: `npm i -g @withgraphite/graphite-cli`

**Init** (run once after first push to remote): `gt init`

Workflow automation (stacking, submitting, syncing, cleanup) is encoded in the Claude skills
(`/add-rule`, `/worktree`, `/post-merge`). See Step 3.

### Other prerequisites

- `gh` CLI authenticated with GitHub
- `pnpm` installed
- Node.js >= 18
- Remote `theagenticengineer/stylelint-sass` exists

---

## Issue Map

Issues created in Step 5. Issue #3 closed as duplicate of #2.

| #   | Title                                         | Phase | Labels                   |
| --- | --------------------------------------------- | ----- | ------------------------ |
| 1   | Establish project SDLC                        | 0     | `phase-0`, `sdlc`        |
| 2   | Project scaffolding                           | 0     | `phase-0`                |
| 4   | Polish and publish v0.1.0                     | 7     | `phase-7`                |
| 5   | `sass/no-debug`                               | 1     | `phase-1`, `rule`        |
| 6   | `sass/dollar-variable-pattern`                | 2     | `phase-2`, `rule`        |
| 7   | `sass/no-warn`                                | 1     | `phase-1`, `rule`        |
| 8   | `sass/at-extend-no-missing-placeholder`       | 3     | `phase-3`, `rule`        |
| 9   | `sass/percent-placeholder-pattern`            | 2     | `phase-2`, `rule`        |
| 10  | `sass/at-use-no-unnamespaced`                 | 6     | `phase-6`, `rule`        |
| 11  | `sass/no-import`                              | 1     | `phase-1`, `rule`        |
| 12  | `sass/selector-no-redundant-nesting-selector` | 5     | `phase-5`, `rule`        |
| 13  | `sass/at-mixin-pattern`                       | 2     | `phase-2`, `rule`        |
| 14  | `sass/extends-before-declarations`            | 3     | `phase-3`, `rule`        |
| 15  | `sass/no-global-function-names`               | 6     | `phase-6`, `rule`        |
| 16  | `sass/no-duplicate-mixins`                    | 4     | `phase-4`, `rule`        |
| 17  | `sass/at-function-pattern`                    | 2     | `phase-2`, `rule`        |
| 18  | `sass/at-use-no-redundant-alias`              | 6     | `phase-6`, `rule`, `new` |
| 19  | `sass/no-color-literals`                      | 5     | `phase-5`, `rule`        |
| 20  | `sass/mixins-before-declarations`             | 3     | `phase-3`, `rule`        |
| 21  | `sass/at-if-no-null`                          | 6     | `phase-6`, `rule`, `new` |
| 22  | `sass/no-duplicate-dollar-variables`          | 4     | `phase-4`, `rule`        |
| 23  | `sass/operator-no-unspaced`                   | 5     | `phase-5`, `rule`        |
| 24  | `sass/declarations-before-nesting`            | 3     | `phase-3`, `rule`        |
| 25  | `sass/no-duplicate-load-rules`                | 4     | `phase-4`, `rule`, `new` |
| 26  | `sass/selector-no-union-class-name`           | 5     | `phase-5`, `rule`, `new` |
| 27  | `sass/dimension-no-non-numeric-values`        | 5     | `phase-5`, `rule`, `new` |

---

## Branch Strategy

- **`main`** — protected, requires PR + passing CI (after CI exists)
- **Phase 0 SDLC bootstrap** (Steps 1–5) — direct to `main` (no CI exists yet, no SDLC to follow).
  Step 5 also creates all project issues #2–#27.
- **Phase 0 scaffolding** (Steps 6–9) — one stacked PR per commit, merged bottom-up
- **Phase 1+** — one stacked PR per rule (1:1 issue-to-PR mapping), merged bottom-up
- Branch naming: `<type>/sass-lint-<issue>-<title>`
- Parallel phases use worktrees, each with its own stack

---

## Phase 0 — SDLC Bootstrap (direct to main)

Steps 1–5 commit directly to main because the SDLC (CI, hooks, review workflows) doesn't exist yet.
These steps CREATE the SDLC. Once established, all subsequent work follows it.

### Step 1: Create issue #1 — Establish project SDLC

**Preconditions**:

- `gh` CLI authenticated
- Remote `theagenticengineer/stylelint-sass` exists

**Actions**:

1. Create issue #1 via `gh issue create`:
   - Title: `Establish project SDLC`
   - Labels: `phase-0`, `sdlc`
   - Body (structured — no template exists yet):

     **Goal**: Define how agents and contributors work in this repo.

     **Acceptance criteria**:
     - [ ] markdownlint, prettier, commitlint enforce code quality on every commit
     - [ ] husky pre-commit hooks run lint-staged automatically
     - [ ] vitest test scaffold runs via `pnpm test`
     - [ ] CI workflow validates PRs (markdown, formatting, tests)
     - [ ] Gemini AI review workflow posts review comments on every PR
     - [ ] GitHub issue templates (rule, bug) and PR template exist
     - [ ] Planning docs committed and validated by toolchain
     - [ ] Claude Code skills: add-rule, create-issue, worktree, post-merge, review-pr
     - [ ] CONTRIBUTING.md documents both traditional and agentic workflows

**Postconditions**:

- Issue #1 exists on GitHub

### Step 2: Bootstrap SDLC toolchain

**Preconditions**:

- Issue #1 exists
- `04-execution-steps.md` written
- `pnpm` available

**Overview**:

Establish the full SDLC toolchain first (markdownlint, prettier, pre-commit hooks, vitest, CI),
then commit the planning docs with full pre-commit validation. Each sub-step is one atomic commit.

#### 2a: Markdownlint setup

**Actions**:

1. Create `package.json`:
   - name: `stylelint-sass`, type: `module`
   - devDeps: markdownlint-cli2
   - Scripts: `lint:md`
   - engines: node >=18
2. Create `.editorconfig` (editor hints only — not validated by any CLI tool):
   - max_line_length: 100, indent: 2 spaces
3. Create `.markdownlint.json`:
   - MD013 line_length: 100
4. Run `pnpm install`
5. Verify: `pnpm run lint:md` passes on existing markdown files (plan docs, CLAUDE.md, etc.)

**Commit**:

```text
chore(#1): add markdownlint configuration
```

#### 2b: Prettier configuration

**Actions**:

1. Add prettier to devDeps, `pnpm install`
2. Create `.prettierrc.json`:
   - printWidth: 100, singleQuote: true
3. Create `.prettierignore`:
   - dist/, pnpm-lock.yaml, coverage/
4. Add `format` and `format:check` scripts to `package.json`
5. Verify: `pnpm run format:check` passes

**Commit**:

```text
chore(#1): add prettier configuration
```

#### 2c: Pre-commit hooks

**Actions**:

1. Add devDeps: husky, lint-staged, @commitlint/cli, @commitlint/config-conventional.
   `pnpm install`
2. Create `commitlint.config.js`:
   - Extends @commitlint/config-conventional
3. Add `prepare` script to `package.json`
4. Run `pnpm exec husky init`
5. Create `.husky/pre-commit`:
   - `pnpm exec lint-staged`
6. Create `.husky/commit-msg`:
   - `pnpm exec commitlint --edit $1`
7. Create `.lintstagedrc.json`:
   - \*.md: markdownlint-cli2, prettier --write
   - \*.{json,yml,yaml}: prettier --write
8. Verify: this commit passes through hooks

**Commit**:

```text
chore(#1): add pre-commit hooks and commitlint
```

**Postconditions**:

- Pre-commit hooks now enforce markdownlint + prettier on all subsequent commits

#### 2d: Test scaffold

**Actions**:

1. Add vitest to devDeps, `pnpm install`
2. Create `vitest.config.ts` (minimal — `defineConfig({})`)
3. Create `src/__tests__/scaffold.test.ts`:

   ```ts
   import { expect, test } from 'vitest';

   test('test scaffold works', () => {
     expect(true).toBe(true);
   });
   ```

   (replaced with real smoke tests in Step 8b)

4. Add `test` script to `package.json`: `vitest run`
5. Verify: `pnpm run test` passes

**Commit**:

```text
chore(#1): add vitest test scaffold
```

#### 2e: CI workflow + AI review + GitHub templates

**Actions**:

1. Create `.github/workflows/ci.yml`:
   - Trigger: push to main, pull_request
   - Matrix: Node 18, 20, 22
   - Steps: checkout, pnpm install, markdownlint-cli2, prettier --check, vitest run
2. Create `.github/workflows/ai-review.yml`:
   - Trigger: pull_request (opened, synchronize)
   - Get PR diff via `gh pr diff`, send to Gemini API with project conventions as system prompt
   - Gemini posts inline review comments on the PR (via GitHub API)
   - If Gemini finds no issues, the workflow must still post a summary comment (e.g. "Gemini
     review: no issues found") so the agent knows the review completed
   - Requires GEMINI_API_KEY repo secret
   - Available from the first PR — even SDLC scaffolding PRs get Gemini feedback
3. Create `.github/ISSUE_TEMPLATE/rule.yml`:
   - Title prefix: `feat: implement sass/`
   - Fields: rule name, BAD examples (required), GOOD examples (required), options,
     fixable (yes/no)
   - Labels: `rule`
   - Ensures every rule issue has testable acceptance criteria baked into the template
4. Create `.github/ISSUE_TEMPLATE/bug.yml`:
   - Fields: rule name, input code, expected behavior, actual behavior, config
   - Labels: `bug`
5. Create `.github/PULL_REQUEST_TEMPLATE.md`:
   - Checklist: tests pass (`pnpm check`), rule registered in index.ts + recommended.ts, spec
     exists in docs/plan/rules/design/, commit message references issue number

**Commit**:

```text
chore(#1): add CI, AI review workflow, and GitHub templates
```

#### 2f: Planning docs

**Preconditions**:

- All toolchain commits (2a–2e) complete
- Pre-commit hooks active

**Actions**:

1. Fix any markdownlint/prettier errors in existing docs/plan/ files
2. Stage all planning docs: docs/plan/\*, CLAUDE.md, .claude/settings.local.json, .gitignore,
   LICENSE
3. Commit — pre-commit hooks validate all .md files automatically

**Commit**:

```text
docs(#1): add project plans and execution steps
```

#### 2g: Push to remote

**Actions**:

1. Add remote: `git remote add origin https://github.com/theagenticengineer/stylelint-sass.git`
2. Push: `git push -u origin main`

**Postconditions**:

- Remote `main` has 6 atomic commits: toolchain first, then validated planning docs
- markdownlint, prettier, commitlint, vitest available
- Pre-commit hooks enforce quality on all subsequent commits
- CI validates PRs: markdown, formatting, tests
- Gemini AI review posts inline comments on every PR
- All subsequent PRs get automated feedback before merge

### Step 3: Create Claude Code skills

**Preconditions**:

- Step 2 complete (toolchain installed)
- markdownlint + prettier available
- Pre-commit hooks active (validates .md files)

**Actions**:

1. Create `.claude/commands/add-rule.md`:
   - Read spec from `docs/plan/rules/design/`
   - Write test file **first** (BAD/GOOD cases from spec = acceptance criteria)
   - Implement rule to make tests pass
   - Register in index.ts + recommended.ts
   - Run `pnpm check`
   - Commit: `git add -A && git commit -m "feat(#N): add sass/<rule> rule" -m "Closes #N"`
2. Create `.claude/commands/create-issue.md`:
   - Takes `$ARGUMENTS` as a description of what the issue should cover
   - Generates a structured issue body: **Goal**, **Acceptance criteria** (checklist), **Labels**
   - Creates the issue via `gh issue create`
   - Works for any contributor or context — not tied to a specific source file
3. Create `.claude/commands/worktree.md`:
   - Create isolated git worktree: `git worktree add .worktrees/<name> -b <branch>`
   - Run `pnpm install` in worktree
   - Initialize Graphite tracking: `gt init` (if needed)
   - Verify `pnpm check` passes
   - Report worktree path for the subagent
4. Create `.claude/commands/post-merge.md`:
   - Sync merged changes: `gt sync`
   - Clean up worktree: `git worktree remove .worktrees/<name>`
   - Delete local branches: `gt branch delete --force <branch>`
   - Find next open PR, restack its worktree, propose `/review-pr`
5. Create `.claude/commands/review-pr.md` — the agent's review loop for every PR:

   **Phase 1 — Local review (before PR)**:
   - Run PAL MCP Server `codereview` tool on the diff (local, no PR needed)
   - Address any issues found:
     - If fixing the current (top) commit: amend it
     - If fixing an earlier commit in the stack: create a fixup commit
       (`git commit --fixup <sha>`) then autosquash (`git rebase -i --autosquash`)
   - This catches problems before they hit CI

   **Phase 2 — Submit PR**:
   - `gt submit` to create/update the PR

   **Phase 3 — Monitor CI**:
   - Track GitHub Actions: `gh run list --branch <branch> --limit 1`
   - Wait for completion: `gh run watch <run-id>`
   - If CI fails: inspect logs via `gh run view <run-id> --log-failed`, fix, push, re-monitor

   **Phase 4 — Read Gemini CI review**:
   - Read PR comments: `gh api repos/{owner}/{repo}/pulls/{number}/comments`
   - The ai-review workflow always posts (either inline issues or a "no issues found" summary)
   - Address actionable comments, push fixes if needed
   - Re-monitor CI if fixes were pushed (back to Phase 3)

   **Phase 5 — Hand off to human**:
   - All CI checks green + Gemini review addressed
   - Report PR is ready for merge — human merges via Graphite Web

   Must be run on every PR after Step 3.

**Commit**:

```text
docs(#1): add Claude Code skills for agentic workflows
```

**Postconditions**:

- 5 skill files in `.claude/commands/`
- All validated by markdownlint + prettier via pre-commit hook
- Agents can now follow the SDLC

### Step 4: Create CONTRIBUTING.md

**Preconditions**:

- Step 3 committed

**Actions**:

1. Create `CONTRIBUTING.md`:
   - Quick start (fork, clone, pnpm install, pnpm check)
   - Branch naming: `<type>/sass-lint-<issue#>-<title>`
   - Traditional development workflow
   - Agentic workflow (Claude Code skills)
   - Rule implementation guide
   - Quality standards (conventional commits, 100 char lines, quality gates)
   - Code review (Copilot + Gemini + CI)
   - PR workflow

**Commit**:

```text
docs(#1): add contributing guide

Closes #1
```

**Postconditions**:

- SDLC fully documented
- Contributors and agents know how to work

### Step 5: Push SDLC baseline + create all issues

**Actions**:

1. Push to remote: `git push origin main`
2. Create all project issues #2–#27 via `/create-issue` skill:

| #   | Title                                         | Labels                   |
| --- | --------------------------------------------- | ------------------------ |
| 2   | Project scaffolding                           | `phase-0`                |
| 4   | Polish and publish v0.1.0                     | `phase-7`                |
| 5   | `sass/no-debug`                               | `phase-1`, `rule`        |
| 6   | `sass/dollar-variable-pattern`                | `phase-2`, `rule`        |
| 7   | `sass/no-warn`                                | `phase-1`, `rule`        |
| 8   | `sass/at-extend-no-missing-placeholder`       | `phase-3`, `rule`        |
| 9   | `sass/percent-placeholder-pattern`            | `phase-2`, `rule`        |
| 10  | `sass/at-use-no-unnamespaced`                 | `phase-6`, `rule`        |
| 11  | `sass/no-import`                              | `phase-1`, `rule`        |
| 12  | `sass/selector-no-redundant-nesting-selector` | `phase-5`, `rule`        |
| 13  | `sass/at-mixin-pattern`                       | `phase-2`, `rule`        |
| 14  | `sass/extends-before-declarations`            | `phase-3`, `rule`        |
| 15  | `sass/no-global-function-names`               | `phase-6`, `rule`        |
| 16  | `sass/no-duplicate-mixins`                    | `phase-4`, `rule`        |
| 17  | `sass/at-function-pattern`                    | `phase-2`, `rule`        |
| 18  | `sass/at-use-no-redundant-alias`              | `phase-6`, `rule`, `new` |
| 19  | `sass/no-color-literals`                      | `phase-5`, `rule`        |
| 20  | `sass/mixins-before-declarations`             | `phase-3`, `rule`        |
| 21  | `sass/at-if-no-null`                          | `phase-6`, `rule`, `new` |
| 22  | `sass/no-duplicate-dollar-variables`          | `phase-4`, `rule`        |
| 23  | `sass/operator-no-unspaced`                   | `phase-5`, `rule`        |
| 24  | `sass/declarations-before-nesting`            | `phase-3`, `rule`        |
| 25  | `sass/no-duplicate-load-rules`                | `phase-4`, `rule`, `new` |
| 26  | `sass/selector-no-union-class-name`           | `phase-5`, `rule`, `new` |
| 27  | `sass/dimension-no-non-numeric-values`        | `phase-5`, `rule`, `new` |

**Issue body format for rule issues (#5–#27)**: each issue body
includes the full acceptance criteria from the rule spec at
`docs/plan/rules/design/sass-<rule-name>.md`. All 23 specs exist. The
BAD/GOOD `.sass` code blocks are copied verbatim into the issue
body — an agent picking up the issue sees exactly which inputs must
be rejected and which must pass, without needing to find a separate
spec file.

**Issue body format for non-rule issues**:

**#2 (scaffolding)**: checklist of deliverables

- [ ] TypeScript compiles (`pnpm run typecheck`)
- [ ] ESLint passes on `.ts` files
- [ ] Plugin loads in Stylelint (smoke test)
- [ ] Recommended config lints `.sass` files
      (smoke test with valid/invalid fixtures)
- [ ] `pnpm run check` passes all quality gates
- [ ] CI runs typecheck + lint + test

**#4 (publish)**: checklist of deliverables

- [ ] README with install, config, rule reference
- [ ] CHANGELOG.md (v0.1.0)
- [ ] `pnpm pack --dry-run` produces clean tarball
- [ ] All 23 rules in `src/index.ts`
- [ ] Recommended config: 12 core + 23 plugin

**Postconditions**:

- SDLC established on remote
- Full project backlog visible (26 issues)
- Every rule issue has testable acceptance criteria (BAD/GOOD code blocks inline)
- All subsequent work follows branches + PRs

---

## Phase 0 — Scaffolding (stacked PRs)

From this point forward, all work goes through branches and PRs.
Dependencies are added only when immediately needed.

### Step 6: TypeScript setup

**Preconditions**:

- Issues #1–#27 exist
- On `main`, working tree clean
- `gt init` run (if not already)

**Actions**:

1. Add devDeps: typescript, @types/node. `pnpm install`
2. Create `tsconfig.json`:
   - strict: true, noUncheckedIndexedAccess: true
   - target: ES2022, module: Node16/NodeNext
   - outDir: `dist`, include: `["src"]`
3. Create minimal `src/index.ts` (`src/` already exists from Step 2d):
   `export const rules: unknown[] = [];` (gives tsc something to compile; replaced with full
   skeleton in Step 8b)
4. Add `typecheck` and `build` scripts to `package.json`
5. Verify: `pnpm run typecheck` passes, `pnpm run build` creates `dist/`
6. Commit: `git add -A && git commit -m "chore(#2): add TypeScript compiler and config"`
7. Run `/review-pr`

### Step 7: ESLint for TypeScript

**Preconditions**:

- Step 6 stacked

**Actions**:

1. Add devDeps: eslint, @eslint/js, typescript-eslint. `pnpm install`
2. Create `eslint.config.js`:
   - Flat config, typescript-eslint recommended
   - Ignore dist/, node_modules/, coverage/
3. Update `.lintstagedrc.json` (pre-commit hooks only know about
   `*.md` — add `*.ts` now that eslint exists):
   - Add `*.ts`: eslint --fix, prettier --write
4. Add `lint` script to `package.json` (eslint + markdownlint)
5. Verify: `pnpm run lint` passes (lints src/index.ts + markdown files)
6. Commit: `git add -A && git commit -m "chore(#2): add ESLint with TypeScript support"`
7. Run `/review-pr`

### Step 8: Plugin skeleton + smoke tests

**Preconditions**:

- Step 7 stacked

Each sub-step is one stacked commit.

#### 8a: Add plugin dependencies

**Actions**:

1. Add peerDeps: stylelint >=16, sass-parser >=0.4
2. Add devDeps: stylelint, sass-parser (vitest already installed in Step 2d). `pnpm install`
3. Verify: `pnpm run typecheck` still passes
4. Commit: `git add -A && git commit -m "chore(#2): add plugin dependencies"`
5. Run `/review-pr`

#### 8b: Plugin skeleton + smoke tests

Since vitest is already available (Step 2d), we can write tests alongside the code they verify —
proving the 12 core rules actually work on `.sass` in the same commit that adds them.

**Actions**:

1. Create `src/utils/namespace.ts`:
   - `const namespace = "sass"`
   - Helper to prefix rule names
2. Create `src/utils/ast.ts` — type guard helpers. When walking the AST, child nodes are typed as
   generic `ChildNode`. These narrow the type so rules can safely access properties like
   `.selector` or `.name`:

   ```ts
   // without helpers — unsafe cast
   const rule = node as Rule;
   rule.selector; // compiles but crashes
   //               if node is a Comment

   // with helpers — type-safe
   if (isRule(node)) {
     node.selector; // TS knows it's a Rule
   }
   ```

   Exports: isRule, isAtRule, isDeclaration

3. Replace minimal `src/index.ts` with full plugin entry: export empty plugin array `[]`
4. Create `src/recommended.ts`:
   - `plugins: ["stylelint-sass"]`
   - 12 core Stylelint rules configured for Sass (from docs/plan/00-desired-state.md)
5. Add ESM exports to `package.json`: `.` and `./recommended`
6. Create `.sass` fixtures in `src/__tests__/fixtures/`:
   - `valid.sass` — clean file that passes all 12 core rules in recommended config
   - `invalid.sass` — triggers at least one violation per core rule (invalid hex, duplicate
     properties, empty block, etc.)
7. Replace scaffold test with `src/__tests__/smoke.test.ts`:
   - Test: plugin array exported correctly
   - Test: `valid.sass` → zero warnings with recommended config
   - Test: `invalid.sass` → warnings from core rules (verifies sass-parser + config integration
     works end-to-end)
   - No need to assert every rule individually — that's Stylelint's job. We just prove the config
     loads and rules fire on `.sass`
8. Add `check` script to `package.json` (all quality gates now available: typecheck + lint +
   format:check + lint:md + test)
9. Verify: `pnpm run check` passes
10. Commit: `git add -A && git commit -m "feat(#2): add plugin skeleton with smoke tests"`
11. Run `/review-pr`

### Step 9: Update CI for TypeScript quality gates

**Preconditions**:

- Step 8 stacked

**Actions**:

1. Update `.github/workflows/ci.yml`:
   - Add steps: typecheck, eslint, vitest
   - AI review workflow already exists (from Step 2e) — no changes needed
2. Verify: `pnpm check` passes
3. Commit: `git add -A && git commit -m "chore(#2): update CI for TypeScript quality gates"`
   `-m "Closes #2"`
4. Run `/review-pr`

**Postconditions**:

- `pnpm check` passes on `main`
- CI + AI review green on GitHub
- Issue #2 closed
- Phase 0 complete

---

## Phase 1 — Disallow Rules (stacked PRs)

**Test-first pattern**: every rule step writes tests BEFORE implementation. Test cases come from the
issue's acceptance criteria (BAD/GOOD blocks). The rule is done when `pnpm check` passes — meaning
all acceptance criteria are met. This pattern applies to all rule steps in Phases 1–6.

**Documentation ships with the rule**: each rule commit includes user-facing docs at
`docs/rules/<rule-name>.md` (description, default severity, options, BAD/GOOD examples).
Documentation is not a separate phase — it is part of the rule's definition of done.

### Step 10: Implement sass/no-debug

**Preconditions**:

- On `main`, working tree clean
- `pnpm check` passes
- Vitest available (from Step 2d)

**Actions**:

1. Create `src/rules/no-debug/index.test.ts` **first** — test cases come directly from issue #5's
   acceptance criteria (the BAD/GOOD `.sass` blocks copied from the rule spec):
   - BAD (5): string, expression, inside mixin, inside function, nested in rule
   - GOOD (3): no @debug, @warn allowed, @error allowed
2. Create `src/rules/no-debug/index.ts`:
   - Rule template from docs/plan/01-architecture.md
   - `walkAtRules('debug')`, report each node
   - Message: `"Unexpected @debug statement"`
3. Register in `src/index.ts`
4. Add to `src/recommended.ts`: `"sass/no-debug": true`
5. Write `docs/rules/no-debug.md` — description, default, BAD/GOOD examples
6. Run `pnpm check` — tests pass = acceptance criteria met
7. Commit: `git add -A && git commit -m "feat(#5): add sass/no-debug rule" -m "Closes #5"`
8. Run `/review-pr`

### Step 11: Implement sass/no-warn

**Actions**:

1. Create `src/rules/no-warn/index.test.ts` first — from issue #7 acceptance criteria:
   - BAD (4): root level, inside mixin, inside function, inside conditional
   - GOOD (3): no @warn, @error allowed, @debug allowed
2. Create `src/rules/no-warn/index.ts`:
   - `walkAtRules('warn')`, report each node
   - Message: `"Unexpected @warn statement"`
3. Register in `src/index.ts`
4. Add to `src/recommended.ts`
5. Write `docs/rules/no-warn.md` — description, default, BAD/GOOD examples
6. Run `pnpm check`
7. Commit: `git add -A && git commit -m "feat(#7): add sass/no-warn rule" -m "Closes #7"`
8. Run `/review-pr`

### Step 12: Implement sass/no-import

**Actions**:

1. Create `src/rules/no-import/index.test.ts` first — from issue #11 acceptance criteria:
   - BAD (5): single, with path, with extension, multiple, with url()
   - GOOD (5): @use, @use with namespace, @forward, @use with config, multiple @use
2. Create `src/rules/no-import/index.ts`:
   - `walkAtRules('import')`, report each node
   - Message: `"Unexpected @import. Use @use or @forward instead"`
3. Register in `src/index.ts`
4. Add to `src/recommended.ts`
5. Write `docs/rules/no-import.md` — description, default, BAD/GOOD examples
6. Run `pnpm check`
7. Commit: `git add -A && git commit -m "feat(#11): add sass/no-import rule" -m "Closes #11"`
8. Run `/review-pr`

**Postconditions**:

- 3 rules on `main`, tested and CI green
- Issues #5, #7, #11 closed (one per PR)
- Rule pattern established

---

## Phases 2, 3, 6a — Parallel (worktree stacks)

### Parallelization strategy

Three phases run concurrently using **subagents** — independent Claude Code agents launched via the
Task tool, each operating in its own git worktree. This is real parallelism: all three agents
implement, test, and review code simultaneously.

**How it works**:

1. The main agent creates three git worktrees from the same `main` commit (via `/worktree` skill)
2. The main agent launches three subagents (via Task tool), one per worktree
3. Each subagent works autonomously in its worktree:
   - Implements each rule: test first → implement → register → commit
   - Runs `/review-pr` after each rule (Phases 1–4: PAL local review → submit PR → monitor CI →
     read Gemini feedback → fix issues). **Phase 5 (merge) is skipped** — see worktree mode in
     `/review-pr` skill (Step 3)
   - By the time a subagent finishes, all its PRs are submitted, reviewed, and CI-green
4. The main agent waits for all three subagents to complete
5. Step 14 merges the stacks sequentially (A → B → C) to resolve cross-worktree conflicts in
   `src/index.ts` and `src/recommended.ts`, then cleans up worktrees

**Why this works without conflicts**:

- Rule directories are unique per worktree — no file conflicts during implementation
- Each worktree has its own independent Graphite stack — PRs don't interfere
- `src/index.ts` and `src/recommended.ts` are the only shared files — conflicts are resolved at
  merge time (Step 14) by syncing + restacking between each worktree's merge

**Why review happens during implementation, not at merge**:

- `/review-pr` runs immediately after each rule is implemented — the agent still has full context
  of what it just wrote and why
- Deferring review to Step 14 would mean reviewing code without context, defeating the purpose
- Only the merge (Phase 5) is deferred — review feedback is already addressed by the time
  Step 14 runs

### Step 13: Parallel worktrees

| Worktree | Phase        | Rules                  | Branch                                     |
| -------- | ------------ | ---------------------- | ------------------------------------------ |
| A        | 2 — Naming   | 4 naming pattern rules | `feat/sass-lint-phase-2-naming`            |
| B        | 3 — Ordering | 4 ordering rules       | `feat/sass-lint-phase-3-ordering`          |
| C        | 6a           | at-use-no-unnamespaced | `feat/sass-lint-10-at-use-no-unnamespaced` |

#### 13.1: Worktree A — Phase 2 (Naming Rules)

**Setup**:

1. `git worktree add .worktrees/phase-2 -b feat/sass-lint-phase-2-naming`
2. In worktree: `pnpm install`
3. Verify: `pnpm check` passes

**13.1.1**: Create `src/utils/patterns.ts`

- `validatePattern(name, pattern)`: test name against regex
- `parsePattern(primary)`: string → RegExp
- Commit: `git add -A && git commit -m "feat(#6): add shared naming pattern utility"`
- Run `/review-pr`

**13.1.2**: `sass/dollar-variable-pattern`

- Test first, then implement
- `walkDecls()`, check `$` prefix, validate name
- BAD (7), GOOD (4), custom pattern test
- Register, add to recommended
- Commit: `git add -A && git commit -m "feat(#6): add sass/dollar-variable-pattern rule"`
  `-m "Closes #6"`
- Run `/review-pr`

**13.1.3**: `sass/percent-placeholder-pattern`

- Test first, then implement
- `walkRules()`, check `%` prefix, validate name
- BAD (4), GOOD (3)
- Commit: `git add -A && git commit -m "feat(#9): add sass/percent-placeholder-pattern rule"`
  `-m "Closes #9"`
- Run `/review-pr`

**13.1.4**: `sass/at-mixin-pattern`

- Test first, then implement
- `walkAtRules('mixin')`, extract name, validate
- BAD (4), GOOD (4)
- Commit: `git add -A && git commit -m "feat(#13): add sass/at-mixin-pattern rule" -m "Closes #13"`
- Run `/review-pr`

**13.1.5**: `sass/at-function-pattern`

- Test first, then implement
- `walkAtRules('function')`, extract name, validate
- BAD (4), GOOD (3)
- Commit: `git add -A && git commit -m "feat(#17): add sass/at-function-pattern rule" -m "Closes #17"`
- Run `/review-pr`

**Worktree A exit**: `pnpm check` passes, all 5 PRs submitted + reviewed + CI-green (not merged).

#### 13.2: Worktree B — Phase 3 (Ordering Rules)

**Setup**:

1. `git worktree add .worktrees/phase-3 -b feat/sass-lint-phase-3-ordering`
2. In worktree: `pnpm install`
3. Verify: `pnpm check` passes

**13.2.1**: Create `src/utils/ordering.ts`

- Type `ChildKind`, function `classifyChild(node)`
- Commit: `git add -A && git commit -m "feat(#8): add shared ordering utility"`
- Run `/review-pr`

**13.2.2**: `sass/at-extend-no-missing-placeholder`

- Test first, then implement
- `walkAtRules('extend')`, check `%` prefix
- BAD (5), GOOD (3)
- Commit: `git add -A && git commit -m "feat(#8): add sass/at-extend-no-missing-placeholder rule"`
  `-m "Closes #8"`
- Run `/review-pr`

**13.2.3**: `sass/extends-before-declarations`

- Test first, then implement
- Walk children, track ordering, ignore comments
- BAD (3), GOOD (4)
- Commit: `git add -A && git commit -m "feat(#14): add sass/extends-before-declarations rule"`
  `-m "Closes #14"`
- Run `/review-pr`

**13.2.4**: `sass/mixins-before-declarations`

- Test first, then implement
- Walk children, option `ignore: string[]`
- BAD (4), GOOD (5), test ignore option
- Commit: `git add -A && git commit -m "feat(#20): add sass/mixins-before-declarations rule"`
  `-m "Closes #20"`
- Run `/review-pr`

**13.2.5**: `sass/declarations-before-nesting`

- Test first, then implement
- Walk children, flag decl after nested rule
- BAD (4), GOOD (4)
- Commit: `git add -A && git commit -m "feat(#24): add sass/declarations-before-nesting rule"`
  `-m "Closes #24"`
- Run `/review-pr`

**Worktree B exit**: `pnpm check` passes, all 5 PRs submitted + reviewed + CI-green (not merged).

#### 13.3: Worktree C — Phase 6a

**Setup**:

1. `git worktree add .worktrees/phase-6a -b feat/sass-lint-10-at-use-no-unnamespaced`
2. In worktree: `pnpm install`
3. Verify: `pnpm check` passes

**13.3.1**: `sass/at-use-no-unnamespaced`

- Test first, then implement
- `walkAtRules('use')`, check `as *` in params
- Do NOT flag `@forward ... as *`
- BAD (3), GOOD (6)
- Commit: `git add -A && git commit -m "feat(#10): add sass/at-use-no-unnamespaced rule"`
  `-m "Closes #10"`
- Run `/review-pr`

**Worktree C exit**: `pnpm check` passes, 1 PR submitted + reviewed + CI-green (not merged).

### Step 14: Clean up worktrees after human merges

All subagents have completed. Every PR is submitted, reviewed
by PAL + CI + Gemini, feedback addressed, and CI-green — but
**not yet merged**. The human merges each worktree's stack
sequentially via Graphite Web (A → B → C), restacking between
each to resolve conflicts in `src/index.ts` and
`src/recommended.ts`.

**Why sequential**: all three worktrees modify `src/index.ts`
and `src/recommended.ts`. Merging one worktree's stack changes
the base for the next.

**After human merges**:

1. **Worktree A** (naming rules — 5 PRs):
   - Human merges via Graphite Web
   - Run `/post-merge` for Worktree A (syncs, cleans up)
2. **Worktree B** (ordering rules — 5 PRs):
   - In `.worktrees/phase-3`: `gt sync && gt restack`
   - Human merges via Graphite Web
   - Run `/post-merge` for Worktree B
3. **Worktree C** (at-use-no-unnamespaced — 1 PR):
   - In `.worktrees/phase-6a`: `gt sync && gt restack`
   - Human merges via Graphite Web
   - Run `/post-merge` for Worktree C
4. Back in main worktree: `gt sync`
5. Verify: `pnpm check` passes on `main`

**Postconditions**:

- `main` has 12 rules
  (3 from Phase 1 + 4 naming + 4 ordering + 1 use)
- Issues #6, #8, #9, #10, #13, #14, #17, #20, #24 closed (one per PR)
- `pnpm check` passes, CI green
- All worktrees removed, local branches deleted

---

## Phase 4 — Duplicate Detection (stacked PRs)

### Step 15: Implement duplicate detection rules

**Preconditions**:

- On `main`, clean, `pnpm check` passes

**15a**: `sass/no-duplicate-mixins`

- Test first, then implement
- Track mixin names per scope
- Nested scopes are independent
- BAD (4), GOOD (3)
- Commit: `git add -A && git commit -m "feat(#16): add sass/no-duplicate-mixins rule" -m "Closes #16"`
- Run `/review-pr`

**15b**: `sass/no-duplicate-dollar-variables`

- Test first, then implement
- Track $var names per scope
- Options: ignoreInside, ignoreDefaults
- BAD (3), GOOD (5)
- Commit: `git add -A && git commit -m "feat(#22): add sass/no-duplicate-dollar-variables rule"`
  `-m "Closes #22"`
- Run `/review-pr`

**15c**: `sass/no-duplicate-load-rules`

- Test first, then implement
- Collect @use/@forward/@import paths at root
- Normalize paths, flag duplicates
- BAD/GOOD from spec
- Commit: `git add -A && git commit -m "feat(#25): add sass/no-duplicate-load-rules rule"`
  `-m "Closes #25"`
- Run `/review-pr`

**Postconditions**:

- `main` has 15 rules, `pnpm check` passes
- Issues #16, #22, #25 closed (one per PR)

---

## Phase 5 — Best Practices (stacked PRs)

### Step 16: Implement best practices rules

**Preconditions**:

- On `main`, clean, `pnpm check` passes

**16a**: `sass/selector-no-redundant-nesting-selector`

- Test first, then implement
- Flag `& .child` where `&` is redundant
- Fixable: remove the `&` prefix
- BAD (3), GOOD (7)
- Commit: `git add -A && git commit -m "feat(#12): ...nesting-selector" -m "Closes #12"`
- Run `/review-pr`

**16b**: `sass/no-color-literals`

- Test first, then implement
- Detect hex, named, rgb(), hsl() in values
- Options: allowInVariables, allowInFunctions, allowedColors
- valueExpression first, regex fallback
- BAD (7), GOOD (5)
- Commit: `git add -A && git commit -m "feat(#19): add sass/no-color-literals rule" -m "Closes #19"`
- Run `/review-pr`

**16c**: `sass/operator-no-unspaced`

- Test first, then implement
- Check spacing around +, -, \*, /, ==, etc.
- Skip unary -, calc() ambiguity
- Fixable: add spaces
- BAD (8), GOOD (7)
- Commit: `git add -A && git commit -m "feat(#23): add sass/operator-no-unspaced rule" -m "Closes #23"`
- Run `/review-pr`

**16d**: `sass/selector-no-union-class-name`

- Test first, then implement
- Flag &-suffix, &\_suffix, &Suffix
- Allow &.class, &:pseudo, & .desc
- BAD/GOOD from spec
- Commit: `git add -A && git commit -m "feat(#26): add sass/selector-no-union-class-name rule"`
  `-m "Closes #26"`
- Run `/review-pr`

**16e**: `sass/dimension-no-non-numeric-values`

- Test first, then implement
- Flag $n + "px" string concatenation
- Suggest $n \* 1px
- BAD/GOOD from spec
- Commit: `git add -A && git commit -m "feat(#27): add sass/dimension-no-non-numeric-values rule"`
  `-m "Closes #27"`
- Run `/review-pr`

**Postconditions**:

- `main` has 20 rules, `pnpm check` passes
- Issues #12, #19, #23, #26, #27 closed (one per PR)

---

## Phase 6 remainder — Modern Sass (stacked PRs)

### Step 17: Implement modern Sass rules

**Preconditions**:

- On `main`, clean, `pnpm check` passes

**17a**: `sass/no-global-function-names`

- Test first, then implement
- Map of deprecated global → namespaced functions (sass:color, sass:list, sass:map, sass:math,
  sass:meta, sass:selector, sass:string)
- Search values for function calls
- BAD (8), GOOD (5)
- Commit: `git add -A && git commit -m "feat(#15): add sass/no-global-function-names rule"`
  `-m "Closes #15"`
- Run `/review-pr`

**17b**: `sass/at-use-no-redundant-alias`

- Test first, then implement
- Parse @use params, extract module + alias
- Compute default namespace from path
- Flag if alias == default namespace
- BAD/GOOD from spec
- Commit: `git add -A && git commit -m "feat(#18): add sass/at-use-no-redundant-alias rule"`
  `-m "Closes #18"`
- Run `/review-pr`

**17c**: `sass/at-if-no-null`

- Test first, then implement
- `walkAtRules('if')`, flag `!= null` / `== null`
- BAD/GOOD from spec
- Commit: `git add -A && git commit -m "feat(#21): add sass/at-if-no-null rule" -m "Closes #21"`
- Run `/review-pr`

**Postconditions**:

- `main` has 23 rules, `pnpm check` passes
- Issues #15, #18, #21 closed (one per PR)

---

## Phase 7 — Polish + Publish (stacked PRs)

### Step 18: Polish for release

**Preconditions**:

- On `main`, 23 rules, `pnpm check` passes

**18a**: Write README

- Installation, configuration (minimal, explicit, mixed codebase), CLI usage, rule reference table,
  editor integration, contributing, license
- Verify: `pnpm run lint:md` + `pnpm run format:check` pass
- Commit: `git add -A && git commit -m "docs(#4): add README with installation and rule reference"`
- Run `/review-pr`

**18b**: CHANGELOG

- CHANGELOG.md (Keep a Changelog format, v0.1.0)
- Verify: `pnpm run format:check` passes
- Commit: `git add -A && git commit -m "chore(#4): add changelog"`
  `-m "Closes #4"`
- Run `/review-pr`

### Step 19: Final verification

**Actions**:

1. Run `pnpm check` on main
2. Verify 23 rules in `src/index.ts`
3. Verify `src/recommended.ts` has 12 core + 23 plugin rules
4. Verify package.json exports (`.` and `./recommended`)
5. `pnpm build` — verify dist/ output
6. `pnpm pack --dry-run` — verify clean tarball
7. Report to human: ready for v0.1.0 tag

**Postconditions**:

- All 23 plugin rules implemented and tested
- Recommended config: 12 core + 23 plugin rules
- All quality gates green
- Package ready for `pnpm publish`

---

## Traceability Matrix

Each step uses a git worktree with a branch following the `<type>/sass-lint-<issue#>-<title>`
convention, registered with Graphite via `gt track`. PRs are submitted via `gt submit`.

| Step   | Ph    | Issue | Stack       | Files                                                 |
| ------ | ----- | ----- | ----------- | ----------------------------------------------------- |
| 1      | 0     | #1    | --          | (issue #1 creation)                                   |
| 2a     | 0     | #1    | main        | package.json, .editorconfig, .markdownlint.json       |
| 2b     | 0     | #1    | main        | .prettierrc.json, .prettierignore                     |
| 2c     | 0     | #1    | main        | commitlint.config.js, .husky/\*, .lintstagedrc.json   |
| 2d     | 0     | #1    | main        | vitest.config.ts, scaffold.test.ts                    |
| 2e     | 0     | #1    | main        | .github/workflows/\*, ISSUE_TEMPLATE/\*, PR template  |
| 2f     | 0     | #1    | main        | docs/plan/\*, CLAUDE.md, .gitignore, LICENSE          |
| 2g     | 0     | --    | main        | (push to remote)                                      |
| 3      | 0     | #1    | main        | .claude/commands/\*.md                                |
| 4      | 0     | #1    | main        | CONTRIBUTING.md                                       |
| 5      | 0     | --    | main        | (push + create issues #2--#27)                        |
| 6      | 0     | #2    | scaffolding | tsconfig.json, src/index.ts (minimal)                 |
| 7      | 0     | #2    | scaffolding | eslint.config.js, .lintstagedrc.json                  |
| 8a     | 0     | #2    | scaffolding | package.json (deps only)                              |
| 8b     | 0     | #2    | scaffolding | src/utils/\*, src/index.ts, src/recommended.ts, tests |
| 9      | 0     | #2    | scaffolding | .github/workflows/ci.yml (updated)                    |
| 10     | 1     | #5    | phase-1     | src/rules/no-debug/\*, docs/rules/no-debug.md         |
| 11     | 1     | #7    | phase-1     | src/rules/no-warn/\*, docs/rules/no-warn.md           |
| 12     | 1     | #11   | phase-1     | src/rules/no-import/\*, docs/rules/no-import.md       |
| 13.1.1 | 2     | #6    | worktree A  | src/utils/patterns.ts                                 |
| 13.1.2 | 2     | #6    | worktree A  | src/rules/dollar-variable-pattern/\*                  |
| 13.1.3 | 2     | #9    | worktree A  | src/rules/percent-placeholder-pattern/\*              |
| 13.1.4 | 2     | #13   | worktree A  | src/rules/at-mixin-pattern/\*                         |
| 13.1.5 | 2     | #17   | worktree A  | src/rules/at-function-pattern/\*                      |
| 13.2.1 | 3     | #8    | worktree B  | src/utils/ordering.ts                                 |
| 13.2.2 | 3     | #8    | worktree B  | src/rules/at-extend-no-missing-placeholder/\*         |
| 13.2.3 | 3     | #14   | worktree B  | src/rules/extends-before-declarations/\*              |
| 13.2.4 | 3     | #20   | worktree B  | src/rules/mixins-before-declarations/\*               |
| 13.2.5 | 3     | #24   | worktree B  | src/rules/declarations-before-nesting/\*              |
| 13.3.1 | 6     | #10   | worktree C  | src/rules/at-use-no-unnamespaced/\*                   |
| 14     | 2,3,6 | --    | main        | (merge stacks + cleanup)                              |
| 15a    | 4     | #16   | phase-4     | src/rules/no-duplicate-mixins/\*                      |
| 15b    | 4     | #22   | phase-4     | src/rules/no-duplicate-dollar-variables/\*            |
| 15c    | 4     | #25   | phase-4     | src/rules/no-duplicate-load-rules/\*                  |
| 16a    | 5     | #12   | phase-5     | src/rules/selector-no-redundant-nesting-selector/\*   |
| 16b    | 5     | #19   | phase-5     | src/rules/no-color-literals/\*                        |
| 16c    | 5     | #23   | phase-5     | src/rules/operator-no-unspaced/\*                     |
| 16d    | 5     | #26   | phase-5     | src/rules/selector-no-union-class-name/\*             |
| 16e    | 5     | #27   | phase-5     | src/rules/dimension-no-non-numeric-values/\*          |
| 17a    | 6     | #15   | phase-6     | src/rules/no-global-function-names/\*                 |
| 17b    | 6     | #18   | phase-6     | src/rules/at-use-no-redundant-alias/\*                |
| 17c    | 6     | #21   | phase-6     | src/rules/at-if-no-null/\*                            |
| 18a    | 7     | #4    | phase-7     | README.md                                             |
| 18b    | 7     | #4    | phase-7     | CHANGELOG.md                                          |
| 19     | 7     | —     | main        | (final verification)                                  |
