<!-- markdownlint-disable MD024 -->

# sass/selector-no-union-class-name

Disallow using the parent selector (`&`) to construct union class names
like `&-suffix` or `&_suffix`. These create class names that cannot be
searched in the codebase because the final name (e.g. `.block-element`)
never appears literally in the source.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// Union with hyphen — .nav-item can't be found via search
.nav
  &-item
    display: inline-block
```

## BAD

```sass
// Union with underscore — .card_header is unsearchable
.card
  &_header
    font-weight: bold
```

## BAD

```sass
// CamelCase concatenation — .btnPrimary is unsearchable
.btn
  &Primary
    background: blue
```

## BAD

```sass
// BEM modifier — .btn--disabled is unsearchable
.btn
  &--disabled
    opacity: 0.5
    pointer-events: none
```

## BAD

```sass
// Deep nesting compounds the problem
// Produces .nav-list-item — completely opaque
.nav
  &-list
    margin: 0
    &-item
      display: inline
```

## GOOD

```sass
// Descendant selector — & is followed by a space
.nav
  & .item
    display: inline-block
```

## GOOD

```sass
// Compound selector — appends a class, not a string
.btn
  &.is-active
    background: green
```

## GOOD

```sass
// Pseudo-class — not concatenation
.link
  &:hover
    text-decoration: underline
```

## GOOD

```sass
// Pseudo-element — not concatenation
.icon
  &::before
    content: ""
    display: block
```

## GOOD

```sass
// Standalone class — the name is searchable as-is
.nav-item
  display: inline-block
```

## GOOD

```sass
// Adjacent sibling combinator — not concatenation
.card
  & + .card
    margin-top: 16px
```
