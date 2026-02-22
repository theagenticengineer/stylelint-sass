<!-- markdownlint-disable MD024 -->

# sass/no-duplicate-load-rules

Disallow duplicate `@use`, `@forward`, or `@import` statements that load
the same module. Duplicate loads are wasteful and can cause confusion
about where members come from.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// Duplicate @use of the same module
@use "variables"
@use "mixins"
@use "variables"
```

## BAD

```sass
// Duplicate @forward of the same module
@forward "colors"
@forward "typography"
@forward "colors"
```

## BAD

```sass
// Duplicate @import of the same file
@import "legacy/helpers"
@import "legacy/grid"
@import "legacy/helpers"
```

## BAD

```sass
// Same module with different aliases is still a duplicate load
@use "colors" as c
@use "colors" as clr
```

## BAD

```sass
// Same module with and without file extension
@use "variables"
@use "variables.sass"
```

## BAD

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

## GOOD

```sass
// @use and @forward of the same module — different purposes
@use "colors" as c
@forward "colors"
```

## GOOD

```sass
// Same filename in different directories — distinct modules
@use "base/reset"
@use "utils/reset"
```

## GOOD

```sass
// Multiple distinct @use statements
@use "sass:math"
@use "variables" as vars
@use "mixins" as mx
@use "config"
```

## GOOD

```sass
// @use with with() configuration
// NOTE: even if a bare @use of the same module exists in another
// file, a with() clause makes the load unique to this entry point.
// However, two @use of the same module in the SAME file — one bare
// and one with with() — is still flagged because Sass itself errors
// on that.
@use "config" with ($primary: #036, $border-radius: 4px)
```
