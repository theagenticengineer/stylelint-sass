# sass/at-use-no-redundant-alias

Disallow `@use` rules where the `as` alias matches the default namespace.

**Default**: `true`
**Fixable**: No

## Why?

Sass's `@use` rule loads a module and automatically assigns it a namespace based on the last
segment of the URL. For example, `@use "theme/colors"` makes the module available as `colors` —
you access its members via `colors.$primary`, `colors.adjust()`, etc.

You can override this default with an explicit `as` alias:

```sass
@use "theme/colors" as palette

.link
  color: palette.$primary
```

However, when the alias matches the default namespace, the `as` clause adds nothing:

```sass
// These two are identical — the second just adds noise
@use "theme/colors"
@use "theme/colors" as colors
```

The same applies to built-in modules:

```sass
// Redundant — sass:math already defaults to "math"
@use "sass:math" as math

// Clean — relies on the default
@use "sass:math"
```

This rule flags `@use` rules where the explicit alias is identical to what Sass would assign
automatically. Removing the redundant `as` clause keeps stylesheets concise and reduces visual
noise. Note that `@forward` rules are not checked — they have different aliasing semantics.

## Configuration

```json
{
  "sass/at-use-no-redundant-alias": true
}
```

## BAD

```sass
// alias matches filename
@use "colors" as colors
```

```sass
// alias matches last path segment
@use "src/utils/helpers" as helpers
```

```sass
// alias matches built-in module name
@use "sass:math" as math
```

```sass
// another built-in with redundant alias
@use "sass:color" as color
```

```sass
// alias matches filename without leading underscore
@use "_variables" as variables
```

## GOOD

```sass
// no alias, uses default namespace
@use "colors"
```

```sass
// short alias, different from default
@use "colors" as c
```

```sass
// built-in with default namespace
@use "sass:math"
```

```sass
// built-in with short alias
@use "sass:math" as m
```

```sass
// alias differs from default namespace
@use "variables" as vars
```

```sass
// unnamespaced (separate rule handles this)
@use "colors" as *
```

```sass
// @forward is NOT flagged
@forward "colors" as colors
```
