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

2. Read the rule spec from `docs/plan/rules/design/sass-<rule-name>.md`
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
9. Write user-facing documentation at
   `docs/rules/<rule-name>.md`. This ships with the rule,
   not as a separate task. Every doc **must** include:
   - A one-line summary of what the rule enforces
   - A **"## Why?"** section that explains _what the Sass
     feature does_ and _why this rule matters_. Assume the
     reader may not know the feature. Use concrete Sass
     examples (and compiled CSS output when helpful) to
     show the problem the rule prevents. See
     `docs/rules/at-extend-no-missing-placeholder.md` as
     the reference template.
   - Default severity, options (if any)
   - BAD/GOOD examples from the spec
10. Run `pnpm check` — all tests must pass
11. **If any step fails due to an issue outside the rule's scope**
    (infrastructure bug, tooling failure, dependency problem, etc.):
    - **Stop immediately** — do not attempt an inline workaround
    - Report back with: what failed, the error message, and a
      proposed GitHub issue describing the problem and fix actions
    - Wait for the issue to be resolved before continuing
    - This prevents scope creep and avoids duplicate work when
      multiple agents hit the same blocker
12. Commit (the `Closes #N` in the commit message body is
    for traceability; the PR title set during `/review-pr`
    Phase 2 is what actually auto-closes the issue):

```bash
git add -A
git commit -m "feat(#N): add sass/<rule> rule" -m "Closes #N"
```
