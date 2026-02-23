# sass/dimension-no-non-numeric-values

Disallow constructing dimension values by concatenating a number with a unit string.

**Default**: `true`
**Fixable**: No

## Why?

Sass supports two common (but dangerous) shortcuts for attaching a unit to a number:

1. **String concatenation**: `$n + "px"` produces an unquoted string, not a true dimension. It
   _looks_ like `10px` but Sass treats it as a string. Subsequent math (`$result / 2`) will fail at
   compile time.
2. **Interpolation + unit suffix**: `#{$n}px` also produces an unquoted string for the same reason.

The safe alternative is **multiplication by a unit literal**: `$n * 1px`. This produces a genuine
Sass number with a unit, fully compatible with arithmetic, comparisons, and `math.*` functions.

## Configuration

```json
{
  "sass/dimension-no-non-numeric-values": true
}
```

## BAD

```sass
// String concatenation with a unit string
.box
  width: $n + "px"
```

```sass
// Interpolation immediately followed by a unit
.container
  max-width: #{$column-count * 80}px
```

```sass
// Concatenation with em
.heading
  font-size: $scale-factor + "em"
```

```sass
// Concatenation with rem
.body
  margin-top: $spacing-value + "rem"
```

```sass
// Interpolation with %
.progress
  width: #{$ratio * 100}%
```

```sass
// Inside a mixin
=responsive-width($count)
  width: #{$count * 120}px
```

```sass
// Inside a function return
@function to-rem($px)
  @return math.div($px, 16) + "rem"
```

## GOOD

```sass
// Multiply by a unit literal
.box
  width: $n * 1px
```

```sass
// Division then multiply by unit
.text
  font-size: math.div($base-size, 16) * 1rem
```

```sass
// Multiply with em
.heading
  font-size: $scale-factor * 1em
```

```sass
// Multiply with %
.progress
  width: $ratio * 100%
```

```sass
// Plain string concatenation (not a dimension)
.greeting
  content: "hello" + " world"
```

```sass
// Direct dimension literals
$padding: 16px
$gutter: 1.5rem
```

```sass
// Arithmetic between dimensioned values
.wrapper
  width: $total-width - $sidebar-width
  padding: $base-padding + 4px
```

```sass
// Interpolation in selectors is fine — only values are flagged
.col-#{$i}
  flex: 0 0 $i * 1%
```
