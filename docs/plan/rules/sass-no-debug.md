<!-- markdownlint-disable MD024 -->

# sass/no-debug

Disallow `@debug` statements. These are development helpers that should not ship to production.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// @debug with string
$width: 100px
@debug "width is #{$width}"
```

## BAD

```sass
// @debug with expression
$map: (a: 1, b: 2)
@debug map-get($map, a)
```

## BAD

```sass
// @debug inside mixin
=responsive($bp)
  @debug "breakpoint: #{$bp}"
  @media (min-width: $bp)
    @content
```

## BAD

```sass
// @debug inside function
@function double($n)
  @debug $n * 2
  @return $n * 2
```

## BAD

```sass
// @debug nested inside rule
.component
  @debug &
  color: red
```

## GOOD

```sass
// No @debug anywhere
$width: 100px

.container
  max-width: $width
```

## GOOD

```sass
// @warn is allowed (separate rule)
=deprecated-mixin
  @warn "This mixin is deprecated"
  display: block
```

## GOOD

```sass
// @error is allowed
@function require-positive($n)
  @if $n < 0
    @error "Expected positive number, got #{$n}"
  @return $n
```
