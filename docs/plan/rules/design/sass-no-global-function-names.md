<!-- markdownlint-disable MD024 -->

# sass/no-global-function-names

Disallow use of global Sass function names that have been moved to
built-in modules. Since Dart Sass 1.80, `@import` is deprecated and
functions should be accessed via `@use "sass:*"` namespaced modules.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// Global adjust-color — should use color.adjust()
.link
  color: adjust-color($primary, $lightness: -10%)
```

## BAD

```sass
// Global darken — should use color.adjust()
.btn
  background: darken($primary, 10%)
```

## BAD

```sass
// Global lighten — should use color.adjust()
.surface
  background: lighten($gray, 20%)
```

## BAD

```sass
// Global mix — should use color.mix()
.blend
  color: mix($black, $primary, 50%)
```

## BAD

```sass
// Global map-get — should use map.get()
.theme
  color: map-get($colors, primary)
```

## BAD

```sass
// Global str-index — should use string.index()
$pos: str-index("helvetica", "vet")
```

## BAD

```sass
// Global unitless — should use math.is-unitless()
@function to-rem($val)
  @if unitless($val)
    @return $val * 1px
  @return $val
```

## BAD

```sass
// Global percentage — should use math.percentage()
.col-half
  width: percentage(0.5)
```

## GOOD

```sass
// Namespaced color functions
@use "sass:color"

.link
  color: color.adjust($primary, $lightness: -10%)
```

## GOOD

```sass
// Namespaced math functions
@use "sass:math"

@function to-rem($px)
  @return math.div($px, 16) * 1rem
```

## GOOD

```sass
// Namespaced map functions
@use "sass:map"

.theme
  color: map.get($colors, primary)
```

## GOOD

```sass
// Namespaced list functions
@use "sass:list"

$first: list.nth($items, 1)
```

## GOOD

```sass
// User-defined global functions are fine
@function spacing($multiplier)
  @return $multiplier * 8px

.box
  padding: spacing(2)
```
