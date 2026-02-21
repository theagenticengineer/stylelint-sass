<!-- markdownlint-disable MD024 -->

# sass/no-duplicate-mixins

Disallow duplicate mixin definitions within the same scope. Duplicate
definitions silently override the first, making behavior unpredictable.

**Default**: `true`
**Fixable**: No

---

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

## BAD

```sass
// Duplicate with = shorthand
=reset
  margin: 0

=reset
  margin: 0
  padding: 0
```

## BAD

```sass
// Duplicate using @mixin syntax
@mixin card
  border: 1px solid #ccc

@mixin card
  border: 1px solid #ddd
  border-radius: 8px
```

## BAD

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

## GOOD

```sass
// Same name in different scopes (file-level vs namespaced via @use)
// In _buttons.sass:
=reset
  all: unset

// In _forms.sass:
=reset
  margin: 0
```

## GOOD

```sass
// Single mixin definition
@mixin respond-to($bp)
  @media (min-width: $bp)
    @content
```
