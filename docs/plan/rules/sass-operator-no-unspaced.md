<!-- markdownlint-disable MD024 -->

# sass/operator-no-unspaced

Require spaces around math and comparison operators (`+`, `-`, `*`, `/`,
`%`, `==`, `!=`, `<`, `>`, `<=`, `>=`). Unspaced operators hurt
readability and can be ambiguous (e.g., `$a-$b` could be a subtraction
or a variable name).

**Default**: `true`
**Fixable**: Yes (insert spaces around operators)

---

## BAD

```sass
// Unspaced addition
.box
  width: $a+$b
```

## BAD

```sass
// Unspaced subtraction
.box
  width: $total-$padding
```

## BAD

```sass
// Unspaced multiplication
.grid
  width: $columns*$col-width
```

## BAD

```sass
// Unspaced division (math.div not needed for check)
.half
  width: $width/2
```

## BAD

```sass
// Unspaced modulo
.alt-row
  @if $index%2==0
    background: $gray
```

## BAD

```sass
// Unspaced comparison
@if $size>10
  font-size: 14px
```

## BAD

```sass
// Unspaced equality
@if $theme=="dark"
  background: #111
```

## BAD

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

## GOOD

```sass
// Spaced subtraction
.box
  width: $total - $padding
```

## GOOD

```sass
// Spaced multiplication
.grid
  width: $columns * $col-width
```

## GOOD

```sass
// math.div (modern Sass)
@use "sass:math"

.half
  width: math.div($width, 2)
```

## GOOD

```sass
// Spaced comparison
@if $size > 10
  font-size: 14px
```

## GOOD

```sass
// Negative numbers (unary minus is fine)
.offset
  margin-left: -$spacing
```

## GOOD

```sass
// Minus in property value (not an operator)
.animation
  transition: all 0.3s ease-in-out
```

## GOOD

```sass
// Minus in variable name (not an operator)
$font-size-sm: 12px
```
