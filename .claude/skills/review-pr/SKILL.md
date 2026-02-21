---
description: Review loop for every PR before merge
---

# Review PR

Run the full review loop. Must be run on every PR.

## Phase 1 — Local review (before PR)

Run PAL MCP Server `codereview` tool on the diff:

- Address any issues found
- If fixing the current (top) commit: amend it
- If fixing an earlier commit in the stack: create a fixup
  commit (`git commit --fixup <sha>`) then autosquash
  (`git rebase --autosquash`)

## Phase 2 — Submit PR

```bash
gt submit
```

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
or a "no issues found" summary). Address actionable
comments, push fixes if needed. Re-monitor CI if fixes
were pushed (back to Phase 3).

## Phase 5 — Hand off to human

All CI checks green + Gemini review addressed:

Report that the PR is ready for merge. The human merges
via Graphite Web.
