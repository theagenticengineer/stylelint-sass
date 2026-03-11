---
description: Review loop for every PR before merge
---

# Review PR

Run the full review loop. Must be run on every PR.

## Phase 0 — Acceptance criteria check

Before reviewing code quality, verify the implementation
fulfills everything the issue asks for.

1. **Extract the issue number** from the branch name
   (`feat/sass-lint-N-...`) or commit message (`feat(#N):`).

2. **Fetch the issue body**:

   ```bash
   gh issue view <N>
   ```

3. **Identify the issue type** from its labels, title, or
   body content and follow the matching path below.

### Path A — Rule implementation issues

If the issue is about implementing a lint rule:

1. **Bootstrap the wiki and load the rule spec**:

   ```bash
   WIKI=$(bash .claude/scripts/ensure-wiki.sh)
   ```

   Load the spec from `$WIKI/`.
   Match by rule name (e.g. issue title
   `sass/at-use-no-unnamespaced` →
   `sass-at-use-no-unnamespaced.md`).

2. **Inventory every BAD and GOOD case** from the spec.
   For each case, verify the test file includes a
   corresponding test that:
   - Uses the same (or equivalent) `.sass` input
   - Asserts the correct outcome (warning for BAD,
     no warning for GOOD)

3. **Check the implementation against the spec**:
   - Does the rule message match what the spec describes?
   - Does the rule handle all variants shown in BAD cases
     (e.g. different syntactic forms, edge cases with
     configs or built-in modules)?
   - Are GOOD cases correctly allowed (no false positives)?

4. **Verify all deliverables from `/add-rule` exist**:
   - `src/rules/<rule-name>/index.ts` — rule implementation
   - `src/rules/<rule-name>/index.test.ts` — test file
   - `src/index.ts` — rule registered
   - `src/recommended.ts` — rule added with default setting
   - `docs/rules/<rule-name>.md` — user-facing documentation
   - `src/__tests__/fixtures/invalid.sass` — BAD example added

5. **Identify blind spots** — scenarios not in the spec but
   discovered during implementation or obvious from the
   rule's purpose:
   - Edge cases the spec didn't anticipate (empty inputs,
     comments, nested contexts, mixed syntax)
   - Interaction with related rules or Sass features
   - Report these as suggestions — not blockers — in the
     review output

### Path B — All other issues (tooling, devops, docs, etc.)

1. **Extract acceptance criteria** from the issue body —
   checklist items, requirements, or described behavior.

2. **Verify each criterion** against the diff:
   - Is every requirement addressed by the changes?
   - Are there new files, config changes, or scripts that
     match what the issue asked for?
   - If tests are expected, do they exist and cover the
     described scenarios?

3. **Identify blind spots** — things the issue didn't
   mention but the implementation should consider:
   - Error handling, edge cases, backwards compatibility
   - Documentation updates needed
   - CI/CD or config implications
   - Report these as suggestions — not blockers

### Verdict (both paths)

- **All criteria covered + no obvious blind spots** →
  proceed to Phase 1.
- **Missing coverage** → fix before proceeding. Use fixup
  commits per workflow rules.
- **Blind spots found** → add high-value ones, note the
  rest as follow-up suggestions in the PR body.

## Phase 1 — Local code review (before PR)

Run PAL MCP Server `codereview` tool on the diff:

- Address any issues found
- If fixing the current (top) commit: amend it
- If fixing an earlier commit in the stack: create a fixup
  commit (`git commit --fixup <sha>`) then autosquash
  (`git rebase --autosquash`)

## Phase 2 — Submit PR

1. Submit via Graphite:

   ```bash
   gt submit
   ```

2. After submit, update the PR title and body. Extract the
   issue number from the commit message (`feat(#N):`) or
   branch name (`feat/sass-lint-N-...`).

   **PR title format**: `Closes #N: <description>` — this
   makes GitHub auto-close the issue when the PR is merged.

   ```bash
   gh pr edit <number> \
     --title "Closes #N: <short description>" \
     --body "$(cat <<'EOF'
   ## Summary
   <bullet points describing the change>

   ## Test plan
   - [x] `pnpm check` passes
   - [x] <key test scenarios>

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

3. Verify the PR title and body are set correctly:

   ```bash
   gh pr view <number> --json title,body --jq '.title'
   ```

   The title must start with `Closes #N:`. If not, re-run
   the `gh pr edit` command above.

## Phase 3 — Monitor CI

```bash
gh run list --branch <branch> --limit 1
gh run watch <run-id>
```

If CI fails:

```bash
gh run view <run-id> --log-failed
```

Fix, push, re-monitor.

## Phase 4 — Read Gemini CI review

```bash
gh api repos/theagenticengineer/stylelint-sass/pulls/<number>/comments
```

The ai-review workflow always posts (either inline issues
or a "no issues found" summary).

### Triage each suggestion

For every suggestion Gemini raises, perform a rigorous
analysis before deciding to adopt or dismiss:

1. **Understand the claim** — restate what Gemini is
   actually arguing (bug, missing test, style issue, etc.)
   in your own words. Don't strawman it.

2. **Gather authoritative evidence** — check the upstream
   source of truth before forming an opinion:
   - For rule behavior: read `stylelint-scss` source code
     and test suite for the equivalent rule. Use web search
     or the Task tool to fetch the actual implementation.
   - For Sass semantics: check the official Sass docs.
   - For Stylelint API usage: check Stylelint docs/source.
   - For general coding claims: verify with language specs
     or library docs.

3. **Evaluate against evidence** — compare Gemini's claim
   to what the authoritative source actually does:
   - Does the evidence **support** Gemini? → Actionable.
   - Does the evidence **contradict** Gemini? → Dismiss
     with proof.
   - Is the evidence **ambiguous** or does Gemini raise a
     valid concern the upstream also has? → Consider
     filing an upstream issue or adopting the fix as a
     deliberate improvement. Flag to human reviewer.

### Act on the verdict

- **Actionable** — fix, push, re-monitor CI (back to
  Phase 3).
- **Upstream concern** — note it in the PR comment as a
  potential upstream issue worth filing. Adopt or defer
  based on scope.
- **Dismissed** — post a PR comment with:
  1. The specific claim being dismissed
  2. The authoritative source consulted (link to source
     code, test file, or docs)
  3. What the source shows (concrete behavior, test cases,
     or code paths)
  4. The conclusion: why the claim is incorrect or out of
     scope

  Use `gh pr comment`. The human reviewer must be able to
  verify the dismissal independently from the evidence
  provided — never post bare assertions like "consistent
  with X" without showing proof.

## Phase 5 — Hand off to human

All CI checks green + Gemini review addressed:

Report that the PR is ready for merge. The human merges
via Graphite Web.
