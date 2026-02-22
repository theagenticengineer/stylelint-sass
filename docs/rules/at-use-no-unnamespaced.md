# sass/at-use-no-unnamespaced

Disallow `@use` with `as *` (unnamespaced).

**Default**: `true`
**Fixable**: No

## Why?

Sass's `@use` rule loads members (variables, mixins, functions) from another module into the
current file. By default, members are accessed through a namespace derived from the module's
filename:

```sass
@use "variables"

.link
  color: variables.$primary
```

The `as *` modifier removes the namespace entirely, dumping all members into the current scope:

```sass
@use "variables" as *

.link
  // No namespace — $primary comes from... somewhere
  color: $primary
```

This recreates the exact problem that `@import` had: when multiple modules are loaded with `as *`,
any of them could define `$primary`, and name collisions are silent. The whole point of the Sass
module system is to eliminate this ambiguity.

Using `as *` with built-in modules is equally problematic — `@use "sass:math" as *` floods the
scope with dozens of functions (`ceil`, `floor`, `div`, `round`, ...) that shadow any local
definitions with the same names.

This rule enforces that every `@use` keeps a namespace, whether the default one or an explicit
short alias via `as <name>`. Note that `@forward ... as *` is intentionally allowed — re-exporting
all members from a forwarded module is a legitimate pattern for barrel files.

## Configuration

```json
{
  "sass/at-use-no-unnamespaced": true
}
```

## BAD

```sass
// @use with as * dumps everything into global scope
@use "variables" as *
```

```sass
// @use built-in module with as *
@use "sass:math" as *
```

```sass
// @use with config and as *
@use "config" as * with ($primary: #036)
```

## GOOD

```sass
// @use with default namespace
@use "variables"

.link
  color: variables.$primary
```

```sass
// @use with explicit short namespace
@use "variables" as vars

.link
  color: vars.$primary
```

```sass
// @use built-in with default namespace
@use "sass:math"

.half
  width: math.div($width, 2)
```

```sass
// @use with explicit namespace for built-in
@use "sass:color" as c

.link
  &:hover
    color: c.adjust($primary, $lightness: -10%)
```

```sass
// @forward with as * IS allowed (re-exporting is different)
@forward "tokens" as *
```

```sass
// Multiple namespaced @use
@use "sass:math"
@use "sass:color"
@use "sass:map"
@use "variables" as vars
@use "mixins" as mx
```
