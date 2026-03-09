# CLAUDE.md

## Project

`stylelint-sass` — a Stylelint plugin for linting `.sass` (indented syntax) files. Built on
[sass-parser](https://www.npmjs.com/package/sass-parser) (official, PostCSS-compatible, maintained
by the Sass team).

Repo: `CauseMint/stylelint-sass`

## Commands

```bash
pnpm check            # all quality gates (typecheck + lint + format + test)
pnpm test             # vitest run
pnpm run lint:md      # markdownlint
pnpm run format       # prettier --write
pnpm run format:check
```

## Code Style

- 2-space indent, LF line endings, UTF-8
- 100 character max line length (markdownlint + prettier)
- Prettier: `printWidth: 100`, `singleQuote: true`
- Conventional commits: `feat(#N):`, `fix(#N):`, `chore(#N):`, `docs(#N):` — always reference
  the issue number
- Branch naming: `<type>/sass-lint-<issue#>-<title>` (e.g. `feat/sass-lint-12-no-debug`).
  Enforced by a `post-checkout` hook (`.husky/post-checkout`) — fires immediately on branch
  creation so the agent can self-correct before doing any work. Valid types: `feat`, `fix`,
  `chore`, `docs`, `refactor`, `test`, `ci`. Title must be kebab-case. Every branch must
  reference an issue number.
- TSDoc on all exported functions and constants — include `@param`, `@returns`, `@example`

## Workflow Rules

These are non-negotiable and apply to every session:

1. **Human merges PRs** — the agent never merges. Submit PRs via `gt submit`, human merges via
   Graphite Web.
2. **Test-first** — write tests before implementation. BAD/GOOD `.sass` cases from the rule spec
   are the acceptance criteria.
3. **`pnpm check` before commit** — all quality gates must pass before any commit.
4. **Every PR goes through `/review-pr`** — local PAL review, submit, monitor CI, read Gemini
   feedback, then hand off to human. When dismissing a Gemini suggestion, the PR comment must
   include **authoritative evidence** (link to upstream source code, test suite, or official docs)
   proving the claim wrong — never post bare assertions. When Gemini raises a valid concern that
   the upstream also has, flag it as a potential upstream issue rather than silently dismissing.
5. **Rule issues include full spec** — when creating a rule issue, copy the BAD/GOOD `.sass` code
   blocks from `docs/plan/rules/design/` verbatim into the issue body.
6. **Fixup, don't separate** — when fixing a previous commit, use `git commit --fixup <sha>` then
   `GIT_SEQUENCE_EDITOR=true git rebase --autosquash`.
7. **Every branch = its own worktree** — never use `gt create` (it auto-generates bad names) or
   `git checkout -b` in the main tree. The worktree path must mirror the branch name exactly:
   `git worktree add .worktrees/<type>/sass-lint-<issue#>-<title> -b <type>/sass-lint-<issue#>-<title>`.
   Example: `git worktree add .worktrees/feat/sass-lint-12-no-debug -b feat/sass-lint-12-no-debug`.
   This creates a `<type>/` subdirectory under `.worktrees/`. Then run `gt track`.
   The main working tree stays on `main`. To stack B on A, pass the parent branch:
   `git worktree add .worktrees/<type>/sass-lint-<N>-<title> -b <type>/sass-lint-<N>-<title> <parent-branch>`.
   **Never use `isolation: "worktree"` on the Task tool** — it creates worktrees in
   `.claude/worktrees/` instead of `.worktrees/`. Always create worktrees manually per this rule.
   **Parallel branches**: when implementing independent rules in parallel, create each branch off
   `main` (not stacked on each other). After merging one, `gt sync` to advance main, then
   `gt restack` only the next branch to review — other worktrees remain untouched until their turn.
8. **Pushing** — for feature branches (worktrees), never `git push`; always use `gt restack` then
   `gt submit` to keep Graphite metadata in sync. For `main`, use `git push origin main` directly
   (Graphite does not manage trunk). Never force-push main.
9. **Blockers interrupt, not fix** — when a task (skill, subagent, etc.) hits an unexpected issue
   outside its scope (infrastructure bug, tooling failure, missing dependency), it must **stop
   immediately** and report back with: (a) what failed, (b) a proposed GitHub issue with clear
   description and fix actions. Never attempt an inline workaround — this causes scope creep and,
   when multiple agents hit the same issue, wastes tokens on duplicate fixes.
10. **PR title auto-closes its issue** — every PR title must follow the format
    `Closes #N: <description>` so GitHub automatically closes the linked issue on merge.
    The `/review-pr` skill enforces this in Phase 2 via `gh pr edit --title`. The PR body
    should also include a summary of changes and a test plan. Never submit a PR with a bare
    template body.

## Skills

- `/add-rule` — implement a rule from its spec (test-first, register, pnpm check, commit)
- `/create-issue` — create a structured GitHub issue via `gh` CLI
- `/worktree` — create an isolated git worktree
- `/post-merge` — sync main, clean up worktree, suggest next PR to review
- `/review-pr` — 5-phase review loop: PAL local review, submit PR, monitor CI, read Gemini
  review, hand off

## Architecture

- **Parser**: sass-parser (official, v0.4.x)
- **Strategy**: Stylelint plugin using sass-parser as `customSyntax`
- **Rule pattern**: see `docs/plan/01-architecture.md`
- **23 rules** across 7 phases — see `docs/plan/02-roadmap.md`

## Implementation Plan

Full plan lives in `docs/plan/`:

- `00-desired-state.md` — config, CLI usage
- `01-architecture.md` — package structure, rule pattern
- `02-roadmap.md` — 8-phase roadmap with exit criteria
- `03-implementation-plan.md` — detailed implementation
- `04-execution-steps.md` — atomic execution steps
- `rules/` — 23 rule specs with BAD/GOOD `.sass` cases

Development is designed for autonomous agentic execution: each phase has clear entry/exit criteria.
