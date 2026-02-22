# sass/at-if-no-null

Disallow explicit `null` comparisons in `@if` conditions. Sass truthiness checks already handle
`null` implicitly, so `@if $x != null` can be replaced with `@if $x` and `@if $x == null` can be
replaced with `@if not $x`.

**Default**: `true`
**Fixable**: No

## Why?

In Sass, `null` is a falsy value — it behaves like `false` in boolean contexts. This means explicit
comparisons against `null` are always redundant:

- `@if $x != null` is equivalent to `@if $x`, because `$x` is already truthy when it holds any
  non-null, non-false value.
- `@if $x == null` is equivalent to `@if not $x`, because `not $x` evaluates to `true` when `$x` is
  `null` (or `false`).

```sass
// Verbose — the != null check adds nothing
@if $color != null
  background: $color

// Idiomatic — relies on Sass truthiness
@if $color
  background: $color
```

Removing explicit `null` comparisons makes conditions shorter, more readable, and consistent with
Sass's own truthiness model. It also avoids a common pitfall where developers assume `null` needs
special handling, when Sass already treats it identically to `false` in conditionals.

## Configuration

```json
{
  "sass/at-if-no-null": true
}
```

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
