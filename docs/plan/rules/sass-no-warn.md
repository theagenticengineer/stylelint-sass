<!-- markdownlint-disable MD024 -->

# sass/no-warn

Disallow `@warn` statements. Warnings clutter build output and may indicate incomplete migrations.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// @warn at root level
@warn "Deprecated stylesheet loaded"
```

## BAD

```sass
// @warn inside mixin
=old-clearfix
  @warn "Use modern clearfix instead"
  overflow: hidden
```

## BAD

```sass
// @warn inside function
@function to-rem($px)
  @warn "to-rem() is deprecated, use math.div()"
  @return $px / 16 * 1rem
```

## BAD

```sass
// @warn inside conditional
=spacing($size)
  @if $size == "small"
    @warn "Use 'sm' token instead of 'small'"
  padding: $size
```

## GOOD

```sass
// No @warn anywhere
=clearfix
  &::after
    content: ""
    display: table
    clear: both
```

## GOOD

```sass
// @error is allowed (different purpose)
@function require-unit($val)
  @if unitless($val)
    @error "Expected value with unit, got #{$val}"
  @return $val
```

## GOOD

```sass
// @debug is allowed (separate rule)
@debug "loaded theme"
```
