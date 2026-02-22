# sass/no-duplicate-load-rules

Disallow duplicate `@use`, `@forward`, or `@import` statements that load the same module.

**Default**: `true`
**Fixable**: No

## Why?

Sass's `@use` and `@forward` rules load modules into the current file. Loading the same module
twice serves no purpose — the second load is silently ignored by Sass, but it clutters the file
and can confuse readers about where members come from:

```sass
@use "variables"
@use "mixins"
@use "variables"   // duplicate — silently ignored
```

For `@import` (the legacy loading mechanism), duplicate loads are even more harmful: Sass
re-evaluates the file each time, potentially causing duplicate CSS output and unexpected side
effects from re-executed `@if` guards or variable re-assignments.

This rule flags any `@use`, `@forward`, or `@import` that loads a module already loaded by the
same directive type in the same file. It normalizes file extensions (`.sass`, `.scss`, `.css`)
so that `@use "variables"` and `@use "variables.sass"` are treated as duplicates.

Note that `@use` and `@forward` of the same module are **not** considered duplicates — they serve
different purposes (consuming vs re-exporting).

## Configuration

```json
{
  "sass/no-duplicate-load-rules": true
}
```

## BAD

```sass
// Duplicate @use of the same module
@use "variables"
@use "mixins"
@use "variables"
```

```sass
// Duplicate @forward of the same module
@forward "colors"
@forward "typography"
@forward "colors"
```

```sass
// Duplicate @import of the same file
@import "legacy/helpers"
@import "legacy/grid"
@import "legacy/helpers"
```

```sass
// Same module with different aliases is still a duplicate load
@use "colors" as c
@use "colors" as clr
```

```sass
// Same module with and without file extension
@use "variables"
@use "variables.sass"
```

```sass
// Duplicate built-in module load
@use "sass:math"
@use "sass:color"
@use "sass:math"
```

## GOOD

```sass
// Different modules loaded once each
@use "sass:math"
@use "sass:color"
@use "variables"
@use "mixins"
```

```sass
// @use and @forward of the same module — different purposes
@use "colors" as c
@forward "colors"
```

```sass
// Same filename in different directories — distinct modules
@use "base/reset"
@use "utils/reset"
```

```sass
// Multiple distinct @use statements
@use "sass:math"
@use "variables" as vars
@use "mixins" as mx
@use "config"
```

```sass
// @use with with() configuration
// NOTE: even if a bare @use of the same module exists in another
// file, a with() clause makes the load unique to this entry point.
// However, two @use of the same module in the SAME file — one bare
// and one with with() — is still flagged because Sass itself errors
// on that.
@use "config" with ($primary: #036, $border-radius: 4px)
```
