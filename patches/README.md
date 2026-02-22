# Patches

## `eslint-plugin-tsdoc@0.4.0`

Fixes two ESLint 10 (flat config) incompatibilities:

1. **`context.parserOptions` removed** — the plugin reads `tsconfigRootDir` from
   `context.parserOptions`, which no longer exists in ESLint 10. The patch falls back to
   `context.languageOptions.parserOptions`.

2. **`context.getSourceCode()` removed** — replaced by `context.sourceCode`. The patch
   uses `context.sourceCode` with a fallback to `context.getSourceCode()`.

**Remove when**: `eslint-plugin-tsdoc` releases a version with native ESLint 10 support.
Track [microsoft/tsdoc#389](https://github.com/microsoft/tsdoc/issues/389).
