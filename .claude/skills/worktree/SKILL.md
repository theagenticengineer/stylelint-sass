---
description: Create an isolated git worktree for parallel work
---

# Worktree

Create a git worktree for `$ARGUMENTS` (branch name or
phase description).

## Steps

1. Determine branch name from arguments
   (e.g. `feat/sass-lint-6-dollar-variable-pattern`)
2. Create worktree:

   ```bash
   git worktree add .worktrees/<name> -b <branch> <parent>
   ```

3. In the worktree directory:

   ```bash
   cd .worktrees/<name>
   pnpm install
   ```

4. Register the branch with Graphite:

   ```bash
   gt track
   ```

5. Verify:

   ```bash
   pnpm check
   ```

6. Report the worktree path for the subagent

## Stacking branches

Every branch gets its own worktree. To stack branch B on
top of branch A, pass the parent branch as the start point:

```bash
git worktree add .worktrees/sass-lint-N-<title> \
  -b feat/sass-lint-N-<title> \
  feat/sass-lint-M-<parent-title>
```

Then inside the new worktree: `pnpm install && gt track`.
Graphite will recognize the stack automatically.
