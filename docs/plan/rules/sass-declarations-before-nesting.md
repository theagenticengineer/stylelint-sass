<!-- markdownlint-disable MD024 -->

# sass/declarations-before-nesting

Property declarations must appear before nested rules within a rule block.
This enforces a predictable ordering: extends, then mixins, then
declarations, then nested rules.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// Nested rule before declaration
.card
  .title
    font-weight: bold
  padding: 16px
```

## BAD

```sass
// Mixed ordering
.nav
  color: white
  .item
    display: inline-block
  background: navy
```

## BAD

```sass
// Pseudo-selector nesting before declaration
.link
  &:hover
    text-decoration: underline
  color: blue
```

## BAD

```sass
// Parent selector nesting before declaration
.btn
  &--primary
    background: blue
  padding: 8px 16px
```

## GOOD

```sass
// Declarations before nested rules
.card
  padding: 16px
  background: white

  .title
    font-weight: bold

  .body
    line-height: 1.5
```

## GOOD

```sass
// Full ordering: extends → mixins → declarations → nested
.card
  @extend %rounded
  +shadow(2)
  padding: 16px
  background: white

  .title
    font-weight: bold
```

## GOOD

```sass
// Pseudo-selectors after declarations
.link
  color: blue
  text-decoration: none

  &:hover
    text-decoration: underline

  &:focus
    outline: 2px solid blue
```

## GOOD

```sass
// BEM modifier after declarations
.btn
  padding: 8px 16px
  border: none

  &--primary
    background: blue

  &--secondary
    background: gray
```
