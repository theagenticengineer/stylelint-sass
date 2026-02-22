# CLAUDE.md

## Project

`stylelint-sass` — a Stylelint plugin for linting `.sass` (indented syntax) files. Built on
[sass-parser](https://www.npmjs.com/package/sass-parser) (official, PostCSS-compatible, maintained
by the Sass team).

Repo: `theagenticengineer/stylelint-sass`

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
- Branch naming: `<type>/sass-lint-<issue#>-<title>` (e.g. `feat/sass-lint-12-no-debug`)
- TSDoc on all exported functions and constants — include `@param`, `@returns`, `@example`

## Workflow Rules

These are non-negotiable and apply to every session:

1. **Human merges PRs** — the agent never merges. Submit PRs via `gt submit`, human merges via
   Graphite Web.
2. **Test-first** — write tests before implementation. BAD/GOOD `.sass` cases from the rule spec
   are the acceptance criteria.
3. **`pnpm check` before commit** — all quality gates must pass before any commit.
4. **Every PR goes through `/review-pr`** — local PAL review, submit, monitor CI, read Gemini
   feedback, then hand off to human.
5. **Rule issues include full spec** — when creating a rule issue, copy the BAD/GOOD `.sass` code
   blocks from `docs/plan/rules/` verbatim into the issue body.
6. **Fixup, don't separate** — when fixing a previous commit, use `git commit --fixup <sha>` then
   `GIT_SEQUENCE_EDITOR=true git rebase --autosquash`.
7. **Every branch = its own worktree** — never use `gt create` (it auto-generates bad names) or
   `git checkout -b` in the main tree. Create worktrees via
   `git worktree add .worktrees/<name> -b <type>/sass-lint-<issue#>-<title>`, then `gt track`.
   The main working tree stays on `main`. To stack B on A, pass the parent branch:
   `git worktree add .worktrees/<name> -b <branch> <parent-branch>`.
8. **Never `git push`** — always use `gt restack` then `gt submit` to push branches. This keeps
   Graphite metadata in sync and ensures proper stack management.

## Skills

- `/add-rule` — implement a rule from its spec (test-first, register, pnpm check, commit)
- `/create-issue` — create a structured GitHub issue via `gh` CLI
- `/worktree` — create an isolated git worktree
- `/merge-worktree` — clean up worktree after human merges via Graphite Web
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
