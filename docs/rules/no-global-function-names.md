<!-- markdownlint-disable MD024 -->

# sass/no-global-function-names

Disallow use of global Sass function names that have been moved to built-in modules.

**Default**: `true`
**Fixable**: No

## Why?

Sass historically provided dozens of built-in functions — `darken()`, `map-get()`, `str-length()`,
etc. — available globally without any import. Since Dart Sass 1.80, `@import` is deprecated and
these functions have been reorganized into namespaced modules (`sass:color`, `sass:map`,
`sass:math`, etc.) accessed via `@use`.

The global names still work but are deprecated. Using them creates two problems:

- **Migration debt** — global functions will eventually be removed, so code using them will break in
  a future Sass release.
- **Ambiguity** — some global names overlap with CSS-native functions. For example, both Sass and
  CSS define `min()` and `max()`. The namespaced `math.min()` makes it unambiguous that you intend
  the Sass version.

```sass
// Global — deprecated
.btn
  background: darken($primary, 10%)
  color: mix($white, $primary, 80%)

$keys: map-get($theme, colors)
```

```sass
// Namespaced — recommended
@use "sass:color"
@use "sass:map"

.btn
  background: color.adjust($primary, $lightness: -10%)
  color: color.mix($white, $primary, $weight: 80%)

$keys: map.get($theme, colors)
```

This rule flags calls to deprecated global Sass functions and recommends their namespaced
replacements. CSS-native functions like `min()`, `max()`, `round()`, `invert()`, and `grayscale()`
are intentionally excluded to prevent false positives on valid CSS.

## Configuration

```json
{
  "sass/no-global-function-names": true
}
```

## BAD

```sass
// Global adjust-color — should use color.adjust()
.link
  color: adjust-color($primary, $lightness: -10%)
```

```sass
// Global darken — should use color.adjust()
.btn
  background: darken($primary, 10%)
```

```sass
// Global lighten — should use color.adjust()
.surface
  background: lighten($gray, 20%)
```

```sass
// Global mix — should use color.mix()
.blend
  color: mix($black, $primary, 50%)
```

```sass
// Global map-get — should use map.get()
.theme
  color: map-get($colors, primary)
```

```sass
// Global str-index — should use string.index()
$pos: str-index("helvetica", "vet")
```

```sass
// Global unitless — should use math.is-unitless()
@function to-rem($val)
  @if unitless($val)
    @return $val * 1px
  @return $val
```

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

```sass
// Namespaced math functions
@use "sass:math"

@function to-rem($px)
  @return math.div($px, 16) * 1rem
```

```sass
// Namespaced map functions
@use "sass:map"

.theme
  color: map.get($colors, primary)
```

```sass
// Namespaced list functions
@use "sass:list"

$first: list.nth($items, 1)
```

```sass
// User-defined global functions are fine
@function spacing($multiplier)
  @return $multiplier * 8px

.box
  padding: spacing(2)
```
