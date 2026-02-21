# Architecture

## Package Structure

```text
stylelint-sass/
├── src/
│   ├── index.ts                    # Plugin entry — exports all rules
│   ├── recommended.ts              # Recommended config (core + plugin rules)
│   ├── utils/
│   │   ├── namespace.ts            # Plugin namespace ("sass")
│   │   ├── ast.ts                  # sass-parser AST traversal helpers
│   │   └── patterns.ts             # Shared regex/naming pattern utilities
│   └── rules/
│       ├── no-debug/
│       │   ├── index.ts            # Rule implementation
│       │   └── index.test.ts       # Rule tests
│       ├── no-warn/
│       │   ├── index.ts
│       │   └── index.test.ts
│       ├── ... (one directory per rule)
│       └── at-use-no-unnamespaced/
│           ├── index.ts
│           └── index.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── CLAUDE.md
```

## Rule Implementation Pattern

Every rule follows the same structure, using Stylelint's plugin API:

```typescript
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

const ruleName = 'sass/no-debug';
const meta = { url: 'https://github.com/<org>/stylelint-sass/blob/main/docs/rules/no-debug.md' };

const messages = utils.ruleMessages(ruleName, {
  rejected: 'Unexpected @debug statement',
});

const ruleFunction: stylelint.Rule = (primary, secondary, context) => {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: primary,
    });
    if (!validOptions) return;

    root.walkAtRules('debug', (node) => {
      utils.report({
        message: messages.rejected,
        node,
        result,
        ruleName,
      });
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
```

## Test Pattern

Tests use Vitest + Stylelint's `lint()` API directly. Each test file
parses `.sass` source strings through sass-parser:

```typescript
import { describe, it, expect } from 'vitest';
import stylelint from 'stylelint';

const config = {
  customSyntax: 'sass-parser/lib/syntax/sass',
  plugins: ['./src/rules/no-debug/index.ts'],
  rules: { 'sass/no-debug': true },
};

async function lint(code: string) {
  const result = await stylelint.lint({ code, config });
  return result.results[0];
}

describe('sass/no-debug', () => {
  it('rejects @debug statements', async () => {
    const result = await lint('@debug "test"');
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].rule).toBe('sass/no-debug');
  });

  it('accepts code without @debug', async () => {
    const result = await lint('.foo\n  color: red');
    expect(result.warnings).toHaveLength(0);
  });
});
```

## Plugin Entry Point

`src/index.ts` exports:

```typescript
import noDebug from './rules/no-debug';
import noWarn from './rules/no-warn';
// ... all rules

export default [noDebug, noWarn /* ... */];
```

`src/recommended.ts` exports:

```typescript
export default {
  plugins: ['stylelint-sass'],
  rules: {
    // Stylelint core rules configured for Sass
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'use',
          'forward',
          'mixin',
          'include',
          'function',
          'extend',
          'at-root',
          'error',
          'warn',
          'debug',
          'if',
          'else',
          'each',
          'for',
          'while',
        ],
      },
    ],
    'color-no-invalid-hex': true,
    'declaration-block-no-duplicate-properties': true,
    'block-no-empty': true,
    // ... more core rules

    // Plugin rules
    'sass/no-debug': true,
    'sass/no-warn': true,
    'sass/no-import': true,
    // ... all plugin rules with recommended defaults
  },
};
```

## Key Design Decisions

1. **TypeScript throughout** — type safety, IDE support, easier contributor onboarding
2. **Vitest for testing** — fast, ESM-native, works well with TypeScript
3. **One directory per rule** — rule + test co-located, easy to add/remove rules
4. **sass-parser as peerDependency** — user controls the version, avoids duplication
5. **No autofix in v1** — autofix for indentation-sensitive syntax is
   dangerous; defer to v2 after extensive snapshot testing
6. **ESM-only package** — no CJS dual-publish; Stylelint 16+ is ESM

## AST Traversal Notes

sass-parser extends PostCSS nodes, so standard PostCSS walking methods work:

- `root.walkAtRules(name, callback)` — find `@debug`, `@warn`, `@import`, `@mixin`, etc.
- `root.walkRules(callback)` — find selector rules
- `root.walkDecls(callback)` — find property declarations
- `root.walk(callback)` — visit all nodes

sass-parser adds richer properties:

- `Declaration.valueExpression` — parsed value AST
  (for color literal detection, operator spacing)
- `Rule.parsedSelector` — parsed selector AST (for nesting selector analysis)
- `AtRule.name` — the at-rule identifier without `@`

When sass-parser properties are unavailable (alpha gaps), fall back
to string parsing of `node.value` / `node.params`.

## CI / Quality Gates

- `vitest run` — all rule tests must pass
- `tsc --noEmit` — type checking
- `stylelint-sass` self-lints its own `.sass` test fixtures
- GitHub Actions: test matrix on Node 18, 20, 22
