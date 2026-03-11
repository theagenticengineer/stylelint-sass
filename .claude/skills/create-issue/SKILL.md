---
description: Create a structured GitHub issue
---

# Create Issue

Create a GitHub issue based on `$ARGUMENTS`.

## Steps

1. Parse `$ARGUMENTS` for the issue description
2. Generate a structured issue body:

   **Goal**: one-sentence summary

   **Acceptance criteria**:
   - [ ] checklist item 1
   - [ ] checklist item 2
   - ...

3. Determine appropriate labels from: `phase-0` through
   `phase-7`, `rule`, `bug`, `sdlc`, `new`
4. Create via:

   ```bash
   gh issue create \
     --repo theagenticengineer/stylelint-sass \
     --title "<title>" \
     --label "<labels>" \
     --body "<body>"
   ```

5. Report the issue URL
