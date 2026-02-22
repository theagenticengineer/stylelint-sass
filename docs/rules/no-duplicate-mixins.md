# sass/no-duplicate-mixins

Disallow duplicate mixin definitions within the same scope.

**Default**: `true`
**Fixable**: No

## Why?

In Sass, mixins are defined with `@mixin` (or the `=` shorthand in indented syntax). If you define
two mixins with the same name in the same scope, the second silently overrides the first — Sass
does not warn you:

```sass
=button
  padding: 8px 16px
  border: none

// ...200 lines later...

=button
  padding: 12px 24px
  border-radius: 4px
```

Now every `+button` call gets only the second definition. The first is completely lost, and there
is no error or warning at compile time. This is especially dangerous in large codebases where
mixins may be defined far apart.

This rule catches duplicate mixin names within the same scope, regardless of whether they use
`@mixin` or `=` syntax, and regardless of whether the parameter lists differ (Sass does not
support mixin overloading — the last definition always wins).

Note that the same mixin name in _different files_ is fine — Sass's module system (`@use`)
namespaces them automatically.

## Configuration

```json
{
  "sass/no-duplicate-mixins": true
}
```

## BAD

```sass
// Duplicate mixin at root scope
=button
  padding: 8px 16px
  border: none

=button
  padding: 12px 24px
  border-radius: 4px
```

```sass
// Duplicate with = shorthand
=reset
  margin: 0

=reset
  margin: 0
  padding: 0
```

```sass
// Duplicate using @mixin syntax
@mixin card
  border: 1px solid #ccc

@mixin card
  border: 1px solid #ddd
  border-radius: 8px
```

```sass
// Duplicate with different parameters (still same name)
=spacing($size)
  padding: $size

=spacing($size, $direction: all)
  padding: $size
```

## GOOD

```sass
// Unique mixin names
=button-base
  padding: 8px 16px
  border: none

=button-primary
  +button-base
  background: blue
  color: white
```

```sass
// Single mixin definition
@mixin respond-to($bp)
  @media (min-width: $bp)
    @content
```
