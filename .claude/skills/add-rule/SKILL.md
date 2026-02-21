---
description: Implement a lint rule from its spec
---

# Add Rule

Implement the rule specified in `$ARGUMENTS`.

## Steps

1. Read the rule spec from `docs/plan/rules/sass-<rule-name>.md`
2. Write the test file **first** at
   `src/rules/<rule-name>/index.test.ts` using the BAD/GOOD
   cases from the spec as acceptance criteria
3. Implement the rule at `src/rules/<rule-name>/index.ts`
   following the pattern in `docs/plan/01-architecture.md`
4. Register the rule in `src/index.ts`
5. Add the rule to `src/recommended.ts` with its default
   setting from the spec
6. Run `pnpm check` — all tests must pass
7. Stack the commit:

   ```bash
   gt create -a \
     -m "feat(#N): add sass/<rule> rule" \
     -m "Closes #N"
   ```

   Replace `#N` with the GitHub issue number.
