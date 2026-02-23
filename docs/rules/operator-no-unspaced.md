# sass/operator-no-unspaced

Require spaces around math and comparison operators (`+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`,
`>`, `<=`, `>=`). Unspaced operators hurt readability and can be ambiguous (e.g., `$a-$b` could be
a subtraction or a variable name).

**Default**: `true`
**Fixable**: Yes (insert spaces around operators)

## Why?

Unspaced operators make expressions harder to read at a glance and introduce ambiguity. Sass allows
hyphens in identifiers, so `$total-$padding` is parsed as a single variable name rather than a
subtraction. Consistent spacing around operators prevents confusion and makes the intent explicit:

```sass
// Ambiguous — is this subtraction or a variable name?
.box
  width: $total-$padding

// Clear — obviously subtraction
.box
  width: $total - $padding
```

## Configuration

```json
{
  "sass/operator-no-unspaced": true
}
```

## BAD

```sass
// Unspaced addition
.box
  width: $a+$b
```

```sass
// Unspaced subtraction
.box
  width: $total-$padding
```

```sass
// Unspaced multiplication
.grid
  width: $columns*$col-width
```

```sass
// Unspaced division
.half
  width: $width/2
```

```sass
// Unspaced modulo
.alt-row
  @if $index%2==0
    background: $gray
```

```sass
// Unspaced comparison
@if $size>10
  font-size: 14px
```

```sass
// Unspaced equality
@if $theme=="dark"
  background: #111
```

```sass
// Partially spaced
.box
  margin: $a +$b
```

## GOOD

```sass
// Spaced addition
.box
  width: $a + $b
```

```sass
// Spaced subtraction
.box
  width: $total - $padding
```

```sass
// Spaced multiplication
.grid
  width: $columns * $col-width
```

```sass
// math.div (modern Sass)
@use "sass:math"

.half
  width: math.div($width, 2)
```

```sass
// Spaced comparison
@if $size > 10
  font-size: 14px
```

```sass
// Negative numbers (unary minus is fine)
.offset
  margin-left: -$spacing
```

```sass
// Minus in property value (not an operator)
.animation
  transition: all 0.3s ease-in-out
```

```sass
// Minus in variable name (not an operator)
$font-size-sm: 12px
```
