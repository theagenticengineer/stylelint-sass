<!-- markdownlint-disable MD024 -->

# sass/selector-no-redundant-nesting-selector

Disallow redundant nesting selectors (`&`) that don't add meaning.
A lone `&` at the start of a selector that doesn't concatenate or use
pseudo-classes/elements produces the same output as omitting it.

**Default**: `true`
**Fixable**: Yes (remove the `&`<!-- markdownlint-disable-line MD038 --> )

---

## BAD

```sass
// Redundant & with descendant
.parent
  & .child
    color: red
```

## BAD

```sass
// Redundant & with child combinator (space after &)
.parent
  & > .child
    color: red
```

## BAD

```sass
// Redundant & before element selector
.nav
  & li
    display: inline
```

## GOOD

```sass
// No & needed — simple nesting
.parent
  .child
    color: red
```

## GOOD

```sass
// & for concatenation (BEM)
.btn
  &--primary
    background: blue

  &__icon
    margin-right: 8px
```

## GOOD

```sass
// & for pseudo-class
.link
  &:hover
    text-decoration: underline

  &:focus-visible
    outline: 2px solid blue
```

## GOOD

```sass
// & for pseudo-element
.icon
  &::before
    content: ""
    display: block
```

## GOOD

```sass
// & in compound selector
.card
  &.is-active
    border-color: blue
```

## GOOD

```sass
// & after another selector (parent reference in non-first position)
.child
  .parent &
    color: red
```

## GOOD

```sass
// & at root of @at-root
.component
  @at-root #{&}-wrapper
    display: block
```
