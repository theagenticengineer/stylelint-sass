# Software Development Lifecycle

<!-- markdownlint-disable MD024 -->

This document describes how `stylelint-sass` is developed, tested,
reviewed, and shipped. It is written for contributors of all experience
levels — whether you are making your first open-source PR or you are an
AI agent executing a skill.

---

## Table of Contents

- [What is stylelint-sass?](#what-is-stylelint-sass)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Code Quality Gates](#code-quality-gates)
- [Git Workflow](#git-workflow)
- [Rule Implementation Lifecycle](#rule-implementation-lifecycle)
- [Code Review Process](#code-review-process)
- [CI/CD Pipeline](#cicd-pipeline)
- [Agentic Development](#agentic-development)
- [Configuration Files Reference](#configuration-files-reference)
- [GitHub Templates](#github-templates)

---

## What is stylelint-sass?

`stylelint-sass` is a [Stylelint](https://stylelint.io/) plugin that
provides lint rules for `.sass` (indented syntax) files. It is built on
[sass-parser](https://www.npmjs.com/package/sass-parser), the official
PostCSS-compatible Sass parser maintained by the Sass team.

The plugin does **not** reimplement what Stylelint core already provides.
It adds rules for Sass-specific constructs — mixins, variables,
placeholders, `@use`/`@forward`, ordering — and ships a `recommended`
config that bundles both core and plugin rules tuned for `.sass` files.

**Who it's for**: any team that writes `.sass` (indented syntax) and
wants automated linting integrated into their Stylelint pipeline.

**Why it exists**: in an agentic development workflow, Tailwind's
core advantages — eliminating naming fatigue, enforcing consistency,
reducing onboarding friction — are irrelevant when AI agents are the
primary engineering workforce. SASS provides clean semantic HTML, full
separation of concerns, and zero framework lock-in, while PurgeCSS
handles dead CSS elimination at build time. The missing piece was a
modern `.sass` linter — see the
[README](../README.md#why-sass-why-not-tailwind) for the full
rationale.

---

## Development Environment Setup

### Dev Container (recommended)

The fastest path to a working environment. Everything is pre-installed.

1. Install the
   [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   extension in VS Code or Cursor
2. Open the repo and run **Dev Containers: Reopen in Container**
3. Wait for the container to build (first time takes a few minutes)

The container includes: Node 22, pnpm, GitHub CLI (gh), Graphite
CLI (gt), Claude Code, and all VS Code extensions.

See [.devcontainer/README.md](../.devcontainer/README.md) for details.

### Manual setup

If you prefer not to use a Dev Container:

1. **Node.js 20 or 22** — the CI matrix tests both
2. **pnpm** — the package manager (`corepack enable` to use the
   version pinned in `package.json`)
3. **GitHub CLI (gh)** — used by agentic skills for issue/PR
   management (`brew install gh` or
   [cli.github.com](https://cli.github.com/))
4. **Graphite CLI (gt)** — used by agentic skills for branch
   submission and restacking
   (`npm install -g @withgraphite/graphite-cli`)

```bash
git clone https://github.com/theagenticengineer/stylelint-sass.git
cd stylelint-sass
pnpm install
pnpm check  # verify everything works
```

### Editor extensions

These are auto-installed in the Dev Container. For manual setup,
install them from the VS Code / Cursor marketplace:

| Extension                        | Purpose                     |
| -------------------------------- | --------------------------- |
| `dbaeumer.vscode-eslint`         | ESLint integration          |
| `esbenp.prettier-vscode`         | Prettier formatting on save |
| `DavidAnson.vscode-markdownlint` | Markdown linting            |
| `vitest.explorer`                | Vitest test runner UI       |

---

## Project Structure

```text
stylelint-sass/
├── src/
│   ├── index.ts                     # Plugin entry — exports all 23 rules
│   ├── recommended.ts               # Recommended config (core + plugin rules)
│   ├── utils/
│   │   ├── namespace.ts             # Plugin namespace ("sass")
│   │   ├── ast.ts                   # sass-parser AST traversal helpers
│   │   ├── ordering.ts              # Shared ordering classification utility
│   │   └── patterns.ts              # Shared regex/naming pattern utilities
│   └── rules/
│       ├── no-debug/
│       │   ├── index.ts             # Rule implementation
│       │   └── index.test.ts        # Rule tests (Vitest)
│       ├── no-warn/
│       │   ├── index.ts
│       │   └── index.test.ts
│       └── ... (one directory per rule, 23 total)
├── docs/
│   ├── rules/                       # Per-rule documentation (23 .md files)
│   └── sdlc.md                      # This document
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # CI pipeline (typecheck + lint + test)
│   │   ├── ai-review.yml           # Gemini AI code review on PRs
│   │   └── monitor-stylelint-scss.yml  # Upstream release tracker
│   └── ISSUE_TEMPLATE/
│       ├── rule.yml                 # New rule request template
│       └── bug.yml                  # Bug report template
├── .husky/
│   ├── commit-msg                   # commitlint enforcement
│   ├── pre-commit                   # lint-staged on staged files
│   └── pre-push                     # branch naming validation
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
├── commitlint.config.js
├── .prettierrc.json
├── .prettierignore
├── .editorconfig
├── .markdownlint.json
├── .lintstagedrc.json
├── CLAUDE.md                        # Agentic development instructions
├── CONTRIBUTING.md                  # Contributor quick-start
├── CHANGELOG.md                     # Release history
└── LICENSE                          # MIT
```

---

## Code Quality Gates

A single command (`pnpm check`) runs every quality gate in sequence.
This means there is one thing to remember, and it is the same check
that runs locally and in CI — if it passes on your machine, it will
pass in the pipeline.

### The single command: `pnpm check`

Every commit must pass `pnpm check` before it is pushed. This command
runs all quality gates in sequence:

```bash
pnpm run typecheck         # tsc --noEmit
  && pnpm run lint         # eslint . && markdownlint-cli2
  && pnpm run format:check # prettier --check .
  && pnpm run test         # vitest run
```

If any gate fails, the entire command fails. Fix the issue before
committing.

### What each gate checks

| Gate         | Command              | What it catches                                  |
| ------------ | -------------------- | ------------------------------------------------ |
| TypeScript   | `tsc --noEmit`       | Type errors, missing imports, strict null checks |
| ESLint       | `eslint .`           | Code quality, unused vars, TSDoc syntax          |
| Markdownlint | `markdownlint-cli2`  | Markdown formatting (100-char line length)       |
| Prettier     | `prettier --check .` | Formatting inconsistencies                       |
| Vitest       | `vitest run`         | Test failures, regressions                       |

### Enforcement layers

Defense in depth — hooks catch issues at commit time, CI is the
safety net for anything that slips through, and manual runs give
confidence before pushing. Quality gates are enforced at three
levels:

1. **Pre-commit hook** (`lint-staged`): runs ESLint + Prettier on
   staged `.ts` files, markdownlint + Prettier on staged `.md` files
2. **CI pipeline**: runs `pnpm check` on every push to `main` and
   every PR, across Node 20 and 22
3. **Manual**: developers run `pnpm check` before committing

---

## Git Workflow

### Branch naming convention

Structured branch names make every branch traceable to an issue
and let automation parse the change type and issue number. The
`pre-push` hook enforces the pattern so mistakes are caught
before they reach CI.

All branches follow the pattern:

```text
<type>/sass-lint-<issue#>-<title>
```

- **type**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`
- **issue#**: the GitHub issue number
- **title**: kebab-case description

Examples:

```text
feat/sass-lint-12-no-debug
fix/sass-lint-42-false-positive
chore/sass-lint-4-polish-publish
```

### Worktree-based development

Worktrees eliminate the need to stash, switch branches, or juggle
context. Each branch is a physically separate directory, so
multiple branches can be open simultaneously — and agents can work
on independent features in parallel without interfering with each
other.

Every branch gets its own
[git worktree](https://git-scm.com/docs/git-worktree). This keeps
`main` clean in the primary working tree and allows parallel work on
multiple branches.

The worktree path must mirror the branch name exactly:

```bash
# Create a worktree — path mirrors branch name
git worktree add .worktrees/feat/sass-lint-12-no-debug \
  -b feat/sass-lint-12-no-debug

# Work in the worktree
cd .worktrees/feat/sass-lint-12-no-debug

# Cleanup happens automatically via /post-merge after the PR merges
```

Worktree cleanup is handled by the `/post-merge` skill — do not
remove worktrees manually. After the human merges a PR, run
`/post-merge` to sync `main`, remove the merged worktree, and
surface the next PR to review.

Independent features branch off `main`. Stacked features use a
parent branch — this is
[Graphite's stacking model](https://graphite.dev/docs/stacking),
where a chain of dependent branches are reviewed as focused,
incremental PRs instead of one large diff:

```bash
git worktree add .worktrees/feat/sass-lint-13-child \
  -b feat/sass-lint-13-child \
  feat/sass-lint-12-parent
```

### Conventional commits

Structured commit messages enable automated changelog generation
and create a traceable link from every commit back to the
requirement that motivated it. The `commit-msg` hook runs
commitlint to enforce consistency automatically.

All commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/) and
reference a GitHub issue:

```text
feat(#12): add sass/no-debug rule
fix(#12): handle edge case in no-debug
chore(#2): add TypeScript compiler and config
docs(#4): add SDLC documentation
```

### Fixup workflow

When fixing a previous commit (e.g., after code review feedback),
use fixup commits instead of separate "fix" commits. This keeps
the history clean — each commit represents a complete, logical
change rather than a change followed by corrections. The fixup
is squashed into the original commit automatically, so reviewers
see the final result without the back-and-forth:

```bash
git commit --fixup <sha>
GIT_SEQUENCE_EDITOR=true git rebase --autosquash
```

### Pushing

Feature branches go through Graphite so that stacking metadata
stays in sync with the remote — using plain `git push` would
break Graphite's dependency graph and cause restacking failures
downstream.

- **Feature branches** (worktrees): use `gt restack` then `gt submit`
- **Main branch**: use `git push origin main` directly (Graphite
  does not manage trunk)
- **Never force-push** main

---

## Rule Implementation Lifecycle

The BAD/GOOD cases in each rule spec _are_ the acceptance criteria.
Writing tests first ensures the implementation is driven by the
spec, not the other way around — this prevents the common failure
mode of writing a rule and then retro-fitting tests that only cover
what the implementation happens to do.

Every rule follows the same test-first workflow. The `/add-rule` skill
automates this process, but the steps are the same for manual work.

### Step 1 — Read the spec

Each rule has a design spec in the
[wiki](https://github.com/theagenticengineer/stylelint-sass/wiki)
(named `sass-<rule-name>.md`) with:

- Rule name and description
- BAD examples (code that should trigger a warning)
- GOOD examples (code that should pass)
- Configuration options
- Edge cases

### Step 2 — Write tests first

Create `src/rules/<name>/index.test.ts`. Tests use Vitest and
Stylelint's `lint()` API:

```typescript
import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';

const config = {
  customSyntax: 'sass-parser/lib/syntax/sass',
  plugins: ['./src/rules/<name>/index.ts'],
  rules: { 'sass/<name>': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0];
}

describe('sass/<name>', () => {
  it('rejects BAD code', async () => {
    const result = await lint('<bad-code>');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/<name>');
  });

  it('accepts GOOD code', async () => {
    const result = await lint('<good-code>');
    expect(result.warnings).toHaveLength(0);
  });
});
```

### Step 3 — Implement the rule

Create `src/rules/<name>/index.ts` following the plugin pattern:

```typescript
import stylelint from 'stylelint';
const { createPlugin, utils } = stylelint;

const ruleName = 'sass/<name>';
const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected ...',
});

const ruleFunction: stylelint.Rule = (primary) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual: primary });
    if (!validOptions) return;

    root.walkAtRules('<name>', (node) => {
      utils.report({ message: messages.rejected, node, result, ruleName });
    });
  };
};
```

### Step 4 — Register the rule

1. Import in `src/index.ts` and add to the rules array
2. Add the default value in `src/recommended.ts`

### Step 5 — Write documentation

Create `docs/rules/<name>.md` with:

- Description and rationale
- Default severity and options
- BAD/GOOD examples in `.sass` syntax

### Step 6 — Verify

```bash
pnpm check  # all gates must pass
```

### File locations summary

<!-- markdownlint-disable MD013 MD060 -->

| Artifact            | Path                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| Rule implementation | `src/rules/<name>/index.ts`                                                        |
| Rule tests          | `src/rules/<name>/index.test.ts`                                                   |
| Rule documentation  | `docs/rules/<name>.md`                                                             |
| Plugin registration | `src/index.ts`                                                                     |
| Recommended default | `src/recommended.ts`                                                               |
| Rule spec (design)  | [Wiki](https://github.com/theagenticengineer/stylelint-sass/wiki) `sass-<name>.md` |

<!-- markdownlint-enable MD013 MD060 -->

---

## Code Review Process

Each review layer catches different things. Local PAL review
catches issues before pushing, saving CI round-trips. Gemini CI
review brings a fresh perspective to things the local pass may
have missed. Human review ensures the change makes sense for the
project direction. Together, the three layers balance speed with
thoroughness.

Every PR goes through three layers of review.

### Layer 1 — PAL local review

[PAL](https://github.com/BeehiveInnovations/pal-mcp-server)
(Provider Abstraction Layer) is an MCP server that connects AI
coding tools to multiple model providers — Gemini, OpenAI, Grok,
Ollama, and others. Its `codereview` tool can run a review against
a single model or build multi-model consensus, so the same diff
gets evaluated from multiple perspectives before it leaves the
developer's machine.

### Layer 2 — Gemini CI review

The `ai-review.yml` workflow automatically posts an AI review comment
on every PR. It:

1. Extracts the PR diff
2. Sends it to Gemini 2.5 Flash for review
3. Posts (or updates) a review comment on the PR
4. Uses diff hashing for idempotency — unchanged diffs skip review

### Layer 3 — Human review

The human maintainer reviews the PR via Graphite Web and merges.

### Handling Gemini feedback

When Gemini raises a concern:

- **Valid concern, easy fix**: adopt the suggestion
- **Invalid concern**: dismiss with **authoritative evidence** — link
  to upstream source code, test suite, or official docs proving the
  claim wrong. Never post bare assertions
- **Valid concern in upstream too**: flag it as a potential upstream
  issue rather than silently dismissing

### PR title format

Every PR title must follow:

```text
Closes #N: <description>
```

This auto-closes the linked issue when the PR is merged.

---

## CI/CD Pipeline

### ci.yml — Main CI

Runs on every push to `main` and every PR.

| Step       | What it does                                        |
| ---------- | --------------------------------------------------- |
| Checkout   | `actions/checkout@v4`                               |
| pnpm setup | `pnpm/action-setup@v4`                              |
| Node setup | `actions/setup-node@v4` (matrix: 20, 22)            |
| Install    | `pnpm install --frozen-lockfile`                    |
| Check      | `pnpm run check` (typecheck + lint + format + test) |

The Node matrix ensures compatibility across the two supported LTS
versions.

### ai-review.yml — Gemini code review

Runs on `pull_request` events (`opened`, `synchronize`).

- Uses `GEMINI_API_KEY` secret to call the Gemini API
- Extracts the PR diff via `gh pr diff`
- Hashes the diff for idempotency — if the diff hasn't changed since
  the last review, it skips
- Posts or updates a single review comment per PR
- Reviews for: bugs, missing tests, type safety, naming, performance

### monitor-stylelint-scss.yml — Upstream tracker

Runs daily at 9am UTC (and on manual dispatch).

- Fetches the latest `stylelint-scss` release from GitHub
- If no issue exists for that version, creates one
- Labels it `enhancement` for triage
- Helps the team stay aware of new upstream rules that may affect
  this project

---

## Agentic Development

This project is designed for autonomous AI-agent execution. The
`CLAUDE.md` file at the repo root contains the complete instructions
that Claude Code follows.

### The 10 workflow rules

These rules are non-negotiable and apply to every session:

1. **Human merges PRs** — the agent never merges
2. **Test-first** — write tests before implementation
3. **`pnpm check` before commit** — all gates must pass
4. **Every PR goes through `/review-pr`** — local review, submit,
   monitor CI, read Gemini feedback, hand off
5. **Rule issues include full spec** — BAD/GOOD code blocks from
   the wiki rule specs
6. **Fixup, don't separate** — use `git commit --fixup` for fixes
7. **Every branch = its own worktree** — never `git checkout -b` in
   the main tree
8. **Pushing** — feature branches use `gt submit`, main uses
   `git push origin main`
9. **Blockers interrupt, not fix** — stop and report, don't
   inline-workaround
10. **PR title auto-closes its issue** — `Closes #N: <description>`

### Available skills

Skills are on-demand commands that automate complex workflows. They
are loaded only when invoked, not kept in context permanently.

| Skill           | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `/create-issue` | Create a structured GitHub issue                          |
| `/worktree`     | Create an isolated git worktree                           |
| `/add-rule`     | Implement a rule from its spec (test-first)               |
| `/review-pr`    | 5-phase review: local, submit, CI, Gemini, human          |
| `/post-merge`   | Sync main after merge, clean up worktree, suggest next PR |

### How skills work

Skills are prompt templates stored in the project. When a user types
`/add-rule`, Claude Code loads the skill's full prompt and follows it
step-by-step. Skills can call tools (Bash, Read, Write, etc.) and
spawn sub-agents for parallel work.

### Blockers interrupt, not fix

When a task hits an unexpected issue outside its scope (infrastructure
bug, tooling failure, missing dependency), the agent must **stop
immediately** and report back with:

1. What failed
2. A proposed GitHub issue with clear description and fix actions

This prevents scope creep and duplicate work when multiple agents hit
the same issue.

---

## Configuration Files Reference

<!-- markdownlint-disable MD013 -->

| File                   | Tool         | Key settings                                                  |
| ---------------------- | ------------ | ------------------------------------------------------------- |
| `.editorconfig`        | EditorConfig | 2-space indent, LF, UTF-8, 100-char max line                  |
| `.prettierrc.json`     | Prettier     | `printWidth: 100`, `singleQuote: true`                        |
| `.prettierignore`      | Prettier     | Ignores `dist/`, `pnpm-lock.yaml`, `coverage/`                |
| `eslint.config.js`     | ESLint       | `@eslint/js` recommended + `typescript-eslint` + TSDoc        |
| `.markdownlint.json`   | markdownlint | `MD013` line length set to 100                                |
| `.lintstagedrc.json`   | lint-staged  | `.ts` → ESLint + Prettier; `.md` → markdownlint + Prettier    |
| `commitlint.config.js` | commitlint   | Extends `@commitlint/config-conventional`                     |
| `tsconfig.json`        | TypeScript   | Strict, ES2022, Node16 modules, `outDir: dist`                |
| `vitest.config.ts`     | Vitest       | Excludes `node_modules` and `.worktrees`, inlines `stylelint` |
| `.husky/commit-msg`    | Husky        | Runs `commitlint --edit` on commit messages                   |
| `.husky/pre-commit`    | Husky        | Runs `lint-staged` on staged files                            |
| `.husky/pre-push`      | Husky        | Validates branch naming convention                            |

<!-- markdownlint-enable MD013 -->

---

## GitHub Templates

### Issue templates

Two templates are available in `.github/ISSUE_TEMPLATE/`:

**Rule request** (`rule.yml`):

- Rule name
- BAD examples (Sass code that should trigger a warning)
- GOOD examples (Sass code that should pass)
- Options description
- Fixable? (Yes/No dropdown)

**Bug report** (`bug.yml`):

- Rule name
- Input code (the Sass that triggers the bug)
- Expected behavior
- Actual behavior
- Configuration (relevant Stylelint config)

### PR workflow

1. All CI checks must be green
2. Gemini review comments must be addressed (adopt, dismiss with
   evidence, or flag as upstream issue)
3. Human merges via Graphite Web
4. PR title must follow `Closes #N: <description>` format
