# Contributing

Thank you for your interest in contributing to
`stylelint-sass`! This guide covers both traditional and
agentic (Claude Code) workflows.

## Quick Start

```bash
# Fork and clone
gh repo fork theagenticengineer/stylelint-sass --clone
cd stylelint-sass

# Install dependencies
pnpm install

# Run all quality gates
pnpm check
```

## Branch Naming

All branches follow the pattern:

```text
<type>/sass-lint-<issue#>-<title>
```

Examples:

- `feat/sass-lint-3-no-debug`
- `fix/sass-lint-42-false-positive`
- `chore/sass-lint-2-scaffolding`

## Development Workflow

### Traditional

1. Pick an issue from the backlog
2. Create a branch: `git checkout -b feat/sass-lint-N-name`
3. Write tests **first** using BAD/GOOD cases from the issue
4. Implement the rule to make tests pass
5. Register in `src/index.ts` and `src/recommended.ts`
6. Run `pnpm check` — all quality gates must pass
7. Commit with conventional message referencing the issue
8. Open a PR

### Agentic (Claude Code)

Claude Code skills automate the full workflow:

- `/add-rule` — implement a rule from its spec (test-first)
- `/create-issue` — create a structured GitHub issue
- `/worktree` — create an isolated git worktree
- `/post-merge` — sync main, clean up worktree, suggest
  next PR to review
- `/review-pr` — full review loop (local review, submit,
  monitor CI, read Gemini feedback)

Example session:

```text
> /add-rule sass/no-debug
> /review-pr
```

## Rule Implementation Guide

Every rule follows the same pattern:

1. **Read the spec** from the
   [wiki](https://github.com/theagenticengineer/stylelint-sass/wiki)
2. **Write tests first** at `src/rules/<name>/index.test.ts`
   using the BAD/GOOD `.sass` cases from the spec
3. **Implement** at `src/rules/<name>/index.ts` following
   the pattern in the wiki
   [Architecture](https://github.com/theagenticengineer/stylelint-sass/wiki/Architecture)
   page
4. **Register** in `src/index.ts`
5. **Add default** to `src/recommended.ts`
6. **Write docs** at `docs/rules/<name>.md` — description,
   default severity, options, BAD/GOOD examples
7. **Verify**: `pnpm check`

## Quality Standards

### Conventional Commits

All commits must follow
[Conventional Commits](https://www.conventionalcommits.org/):

```text
feat(#3): add sass/no-debug rule
fix(#3): handle edge case in no-debug
chore(#2): add TypeScript compiler and config
docs(#1): add contributing guide
```

### Line Length

Maximum 100 characters per line, enforced by:

- markdownlint (`.md` files)
- prettier (all formatted files)
- `.editorconfig` (editor hints)

### Quality Gates

`pnpm check` runs all quality gates:

- `typecheck` — TypeScript compiler
- `lint` — ESLint on `.ts` files
- `format:check` — prettier
- `lint:md` — markdownlint
- `test` — vitest

Pre-commit hooks run lint-staged automatically on every
commit (markdownlint + prettier on staged files).

## Code Review

Every PR goes through three layers of review:

1. **PAL local review** — Gemini-powered code review via
   PAL MCP Server, run locally before submitting the PR
2. **Gemini CI review** — automated AI review workflow
   posts inline comments on every PR
3. **CI checks** — markdownlint, prettier, typecheck,
   eslint, vitest across Node 20/22

## Further Reading

For a comprehensive guide to the full development lifecycle
— project structure, quality gates, CI/CD, agentic
workflows, and more — see [docs/sdlc.md](docs/sdlc.md).

## PR Workflow

1. All CI checks must be green
2. Gemini review comments must be addressed
3. Human merges via Graphite Web
