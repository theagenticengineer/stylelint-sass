# sass/declarations-before-nesting

Property declarations must appear before nested rules within a rule block. This enforces a
predictable ordering: extends, then mixins, then declarations, then nested rules — making it clear
where base styles end and nested scopes begin.

**Default**: `true`
**Fixable**: No

## Why?

Sass's indented syntax makes it easy to interleave property declarations with nested selectors. When
declarations are scattered between nested blocks, scanning a rule for its own styles requires reading
through every child — including unrelated descendants and modifiers:

```sass
// Hard to scan — where are .card's own styles?
.card
  .title
    font-weight: bold
  padding: 16px
  &:hover
    opacity: 0.9
  background: white
```

Grouping all declarations together before any nested rules creates a clear visual boundary: the top
section is _what this selector looks like_, the bottom section is _how its children and states
behave_:

```sass
// Easy to scan — .card's styles are all in one place
.card
  padding: 16px
  background: white

  .title
    font-weight: bold

  &:hover
    opacity: 0.9
```

This rule is part of a three-rule ordering convention (`extends-before-declarations` →
`mixins-before-declarations` → `declarations-before-nesting`) that together enforce a predictable
structure inside every rule block.

## Configuration

```json
{
  "sass/declarations-before-nesting": true
}
```

## BAD

```sass
// Nested rule before declaration
.card
  .title
    font-weight: bold
  padding: 16px
```

```sass
// Mixed ordering
.nav
  color: white
  .item
    display: inline-block
  background: navy
```

```sass
// Pseudo-selector nesting before declaration
.link
  &:hover
    text-decoration: underline
  color: blue
```

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

```sass
// Full ordering (extends → mixins → declarations → nested)
.card
  @extend %rounded
  +shadow(2)
  padding: 16px
  background: white

  .title
    font-weight: bold
```

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
