---
description: Clean up a worktree after PRs are merged
---

# Clean Worktree

Clean up worktree `$ARGUMENTS` after the human has merged
its PR stack via Graphite Web.

## Steps

1. Sync merged changes:

   ```bash
   gt sync
   ```

2. Clean up the worktree:

   ```bash
   git worktree remove .worktrees/<name>
   ```

3. Delete local branches:

   ```bash
   gt branch delete --force <branch>
   ```

4. Report which PRs were merged and issues closed
