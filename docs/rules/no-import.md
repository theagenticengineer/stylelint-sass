# sass/no-import

Disallow `@import`. The Sass team deprecated `@import` in Dart Sass 1.80
in favor of `@use` and `@forward`. Using `@import` causes global namespace
pollution and makes dependency tracking impossible.

**Default**: `true`
**Fixable**: No

## Why?

`@import` was Sass's original mechanism for loading other stylesheets, but it has fundamental
problems that led the Sass team to deprecate it in Dart Sass 1.80:

- **Global namespace pollution** — every `@import` dumps all variables, mixins, and functions into a
  single global scope. Two files that define `$color` silently overwrite each other, and the
  "winner" depends on import order.
- **No encapsulation** — there is no way to keep implementation details private. Every helper
  variable and internal mixin becomes part of the public API.
- **Duplicate CSS output** — if the same file is imported from multiple places, its CSS is emitted
  each time, inflating the output.
- **Impossible dependency tracking** — since everything is global, tools cannot determine which file
  actually provides a given variable or mixin.

`@use` and `@forward` solve all of these problems by introducing module-scoped namespaces, explicit
re-exports, and single-load semantics:

```sass
// Before — global, fragile
@import "variables"
@import "mixins"

// After — scoped, explicit
@use "variables" as vars
@use "mixins" as mx
```

This rule flags every `@import` to encourage migration to the module system.

## Configuration

```json
{
  "sass/no-import": true
}
```

## BAD

```sass
// pollutes the global namespace
@import "variables"
```

```sass
// makes dependency tracking impossible
@import "utils/mixins"
```

```sass
// deprecated since Dart Sass 1.80
@import "theme.sass"
```

```sass
// URL imports are also flagged
@import url("https://fonts.googleapis.com/css?family=Roboto")
```

## GOOD

```sass
// module-scoped access to variables
@use "variables"
```

```sass
// namespaced import avoids collisions
@use "utils/mixins" as mx
```

```sass
// re-export for downstream consumers
@forward "theme"
```

```sass
// configure module defaults at load time
@use "config" with ($primary: #036, $border-radius: 4px)
```
