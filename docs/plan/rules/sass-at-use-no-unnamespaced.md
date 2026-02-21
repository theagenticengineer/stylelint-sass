<!-- markdownlint-disable MD024 -->

# sass/at-use-no-unnamespaced

Disallow `@use` with `as *` (unnamespaced). Unnamespaced `@use` dumps
all members into the current scope, defeating the purpose of the module
system and risking name collisions — the same problem `@import` had.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// @use with as * dumps everything into global scope
@use "variables" as *
```

## BAD

```sass
// @use built-in module with as *
@use "sass:math" as *
```

## BAD

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

## GOOD

```sass
// @use with explicit short namespace
@use "variables" as vars

.link
  color: vars.$primary
```

## GOOD

```sass
// @use built-in with default namespace
@use "sass:math"

.half
  width: math.div($width, 2)
```

## GOOD

```sass
// @use with explicit namespace for built-in
@use "sass:color" as c

.link
  &:hover
    color: c.adjust($primary, $lightness: -10%)
```

## GOOD

```sass
// @forward with as * IS allowed (re-exporting is different)
@forward "tokens" as *
```

## GOOD

```sass
// Multiple namespaced @use
@use "sass:math"
@use "sass:color"
@use "sass:map"
@use "variables" as vars
@use "mixins" as mx
```
