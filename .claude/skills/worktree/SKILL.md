---
description: Create an isolated git worktree for parallel work
---

# Worktree

Create a git worktree for `$ARGUMENTS` (branch name or
phase description).

## Steps

1. Determine branch name from arguments
   (e.g. `feat/sass-lint-phase-2-naming`)
2. Create worktree:

   ```bash
   git worktree add .worktrees/<name> -b <branch>
   ```

3. In the worktree directory:

   ```bash
   cd .worktrees/<name>
   pnpm install
   ```

4. Initialize Graphite if needed:

   ```bash
   gt init
   ```

5. Verify:

   ```bash
   pnpm check
   ```

6. Report the worktree path for the subagent
