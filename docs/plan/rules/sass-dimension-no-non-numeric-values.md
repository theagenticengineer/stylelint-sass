<!-- markdownlint-disable MD024 -->

# sass/dimension-no-non-numeric-values

Disallow constructing dimension values by concatenating a number with a
unit string (e.g., `$n + "px"`). String concatenation produces a value
that looks like a dimension but is actually a string and cannot be used
in Sass math operations. Use multiplication by a unit literal
(`$n * 1px`) instead for type-safe dimensions.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// String concatenation with addition produces a string, not a number
.box
  width: $n + "px"
```

## BAD

```sass
// Interpolation to build a dimension — result is a string
.container
  max-width: #{$column-count * 80}px
```

## BAD

```sass
// String concatenation with em unit
.heading
  font-size: $scale-factor + "em"
```

## BAD

```sass
// String concatenation with rem unit
.body
  margin-top: $spacing-value + "rem"
```

## BAD

```sass
// Interpolation with percentage unit
.progress
  width: #{$ratio * 100}%
```

## BAD

```sass
// Inside a mixin argument
=responsive-width($count)
  width: #{$count * 120}px

.sidebar
  +responsive-width(3)
```

## BAD

```sass
// Inside a function return value
@use "sass:math"

@function to-rem($px)
  @return math.div($px, 16) + "rem"
```

## GOOD

```sass
// Multiplication by a unit literal — produces a real dimension
.box
  width: $n * 1px
```

## GOOD

```sass
// Division then multiplication by unit
@use "sass:math"

.body
  font-size: math.div($base-size, 16) * 1rem
```

## GOOD

```sass
// Multiplication with em
.heading
  font-size: $scale-factor * 1em
```

## GOOD

```sass
// Multiplication with percentage
.progress
  width: $ratio * 100%
```

## GOOD

```sass
// Plain string concatenation that is NOT a dimension
.greeting
  content: "hello" + " world"
```

## GOOD

```sass
// Direct assignment of a dimension literal
$padding: 16px
$gutter: 1.5rem

.card
  padding: $padding
  margin-bottom: $gutter
```

## GOOD

```sass
// Arithmetic between two dimensioned values is fine
.wrapper
  width: $total-width - $sidebar-width
  padding: $base-padding + 4px
```

## GOOD

```sass
// Interpolation in selectors or property names is fine
.col-#{$i}
  flex: 0 0 $i * 1%
```
