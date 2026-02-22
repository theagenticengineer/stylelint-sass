---
description: >-
  Sync main after a PR merge, clean up its worktree, and suggest the next PR to review.
  Use after the human merges a PR via Graphite Web.
---

# Post-Merge

Run after the human merges a PR. Syncs main, cleans up the
merged worktree, and surfaces the next PR to review.

Argument: worktree name or branch (e.g. `mixins-before-decl`)
— if omitted, detect from recently merged PRs.

## Step 1 — Sync merged changes

```bash
cd /Users/fabio/workspace/sass-lint
gt sync
```

## Step 2 — Identify what was merged

```bash
gh pr list --state merged --limit 5 --json number,title,mergedAt,headRefName
```

Report which PRs were merged and which issues were auto-closed
(look for `Closes #N` in titles).

## Step 3 — Clean up the worktree

For each merged branch that still has a local worktree:

```bash
git worktree remove .worktrees/<name>
gt delete --force <branch>
```

If `$ARGUMENTS` was given, clean that specific worktree.
Otherwise, clean all worktrees whose branches were merged.

## Step 4 — Find the next PR to review

```bash
gh pr list --state open --json number,title,headRefName,createdAt,isDraft
```

Rank candidates:

1. **Non-draft PRs** over drafts
2. **Stacked on the just-merged branch** (same parent) first
3. **Oldest first** (FIFO)

If there's a single clear candidate, propose it directly.
If multiple are open, list them all with a recommendation.
If none are open, report that the queue is clear.

## Step 5 — Restack and prepare the next PR

If a next PR was identified and the user agrees:

```bash
cd .worktrees/<next-worktree>
gt restack
pnpm install
pnpm check
```

Then propose running `/review-pr` on it.

If `pnpm check` fails after restack, report the failure —
do not attempt to fix (blockers interrupt, not fix).
