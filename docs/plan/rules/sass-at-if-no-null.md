# sass/at-if-no-null

Disallow explicit `null` comparisons in `@if` conditions, since Sass
truthiness checks already handle `null` implicitly.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// unnecessary != null check; use @if $x instead
@if $x != null
  color: red
```

```sass
// use @if not $x instead of comparing to null
@if $x == null
  @warn "x is not set"
```

```sass
// verbose null guard on a realistic variable
@if $color != null
  background-color: $color
@else
  background-color: transparent
```

```sass
// verbose null guard on a map variable
@if $map != null
  $value: map-get($map, key)
  font-size: $value
```

```sass
// reversed operand order is equally unnecessary
@if null != $x
  display: block
```

## GOOD

```sass
// truthiness check — already false when $x is null
@if $x
  color: red
```

```sass
// falsy check — covers null without explicit comparison
@if not $x
  @warn "x is not set"
```

```sass
// explicit false check is a different intent, not flagged
@if $x == false
  @error "x was explicitly set to false"
```

```sass
// numeric comparison, not a null check
@if $x > 0
  margin-top: $x
```

```sass
// boolean combination using truthiness
@if $x and $y
  border: 1px solid $x
```

```sass
// type check — not a null comparison
@if type-of($x) == "number"
  font-size: $x * 1px
```
