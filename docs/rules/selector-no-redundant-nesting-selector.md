# sass/selector-no-redundant-nesting-selector

Disallow redundant nesting selectors (`&`) that don't add meaning. A lone `&` at the start of a
selector that doesn't concatenate or use pseudo-classes/elements produces the same output as omitting
it.

**Default**: `true`
**Fixable**: Yes (removes the redundant `&`)

## Why?

In Sass nesting, the parent selector `&` is implicitly prepended to nested selectors. Writing
`& .child` inside `.parent` compiles to `.parent .child` -- exactly the same as just writing
`.child`. The explicit `&` adds visual noise without changing the output.

The `&` is only meaningful when it concatenates directly with another token (BEM modifiers like
`&--primary`, pseudo-classes like `&:hover`, pseudo-elements like `&::before`, or compound selectors
like `&.is-active`), or when it appears in a non-first position (`.parent &`).

```sass
// Redundant -- the & adds nothing
.nav
  & li
    display: inline

// Clean -- same compiled output
.nav
  li
    display: inline
```

Removing redundant `&` selectors keeps stylesheets concise and easier to scan.

## Configuration

```json
{
  "sass/selector-no-redundant-nesting-selector": true
}
```

## BAD

```sass
// Redundant & with descendant
.parent
  & .child
    color: red
```

```sass
// Redundant & with child combinator (space after &)
.parent
  & > .child
    color: red
```

```sass
// Redundant & before element selector
.nav
  & li
    display: inline
```

## GOOD

```sass
// No & needed -- simple nesting
.parent
  .child
    color: red
```

```sass
// & for concatenation (BEM)
.btn
  &--primary
    background: blue

  &__icon
    margin-right: 8px
```

```sass
// & for pseudo-class
.link
  &:hover
    text-decoration: underline

  &:focus-visible
    outline: 2px solid blue
```

```sass
// & for pseudo-element
.icon
  &::before
    content: ""
    display: block
```

```sass
// & in compound selector
.card
  &.is-active
    border-color: blue
```

```sass
// & after another selector (parent reference in non-first position)
.child
  .parent &
    color: red
```

```sass
// & at root of @at-root
.component
  @at-root #{&}-wrapper
    display: block
```
