---
description: Implement a lint rule from its spec
---

# Add Rule

Implement the rule specified in `$ARGUMENTS`.

## Steps

1. Create a worktree for the rule:

   ```bash
   git worktree add .worktrees/sass-lint-N-<rule-name> \
     -b feat/sass-lint-N-<rule-name> <parent>
   cd .worktrees/sass-lint-N-<rule-name>
   pnpm install
   gt track
   ```

   Replace `N` with the GitHub issue number, `<rule-name>`
   with the kebab-case rule name, and `<parent>` with the
   parent branch (`main` for the first rule in a phase,
   or the previous rule's branch when stacking).

2. Read the rule spec from `docs/plan/rules/sass-<rule-name>.md`
3. Write the test file **first** at
   `src/rules/<rule-name>/index.test.ts` using the BAD/GOOD
   cases from the spec as acceptance criteria
4. Implement the rule at `src/rules/<rule-name>/index.ts`
   following the pattern in `docs/plan/01-architecture.md`
5. Add TSDoc comments to the rule's exported function,
   `ruleName`, `messages`, and `meta` objects. Include
   `@example` showing a BAD case that triggers the rule.
6. Register the rule in `src/index.ts`
7. Add the rule to `src/recommended.ts` with its default
   setting from the spec
8. Add a BAD example to `src/__tests__/fixtures/invalid.sass`
   with a `// sass/<rule-name>` comment above it
9. Run `pnpm check` — all tests must pass
10. Commit:

```bash
git add -A
git commit -m "feat(#N): add sass/<rule> rule" -m "Closes #N"
```
