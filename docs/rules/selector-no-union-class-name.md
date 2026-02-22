# sass/selector-no-union-class-name

Disallow using the parent selector (`&`) to construct union class names like `&-suffix` or
`&_suffix`. These create class names that cannot be searched in the codebase because the final name
(e.g. `.block-element`) never appears literally in the source.

**Default**: `true`
**Fixable**: No

## Why?

When `&` is concatenated with a string (e.g. `&-item` inside `.nav`), the compiled output is
`.nav-item`. A developer searching the codebase for `.nav-item` will never find it because the
class name is split across two lines. This makes refactoring, debugging, and onboarding harder.

Legitimate uses of `&` that do **not** form union class names -- such as `&:hover` (pseudo-class),
`&.is-active` (compound selector), `& .child` (descendant), or `& + .sibling` (combinator) -- are
allowed because they do not obscure searchable class names.

## Configuration

```json
{
  "sass/selector-no-union-class-name": true
}
```

## BAD

```sass
// Union with hyphen -- .nav-item can't be found via search
.nav
  &-item
    display: inline-block
```

```sass
// Union with underscore -- .card_header is unsearchable
.card
  &_header
    font-weight: bold
```

```sass
// CamelCase concatenation -- .btnPrimary is unsearchable
.btn
  &Primary
    background: blue
```

```sass
// BEM modifier -- .btn--disabled is unsearchable
.btn
  &--disabled
    opacity: 0.5
    pointer-events: none
```

```sass
// Deep nesting compounds the problem
// Produces .nav-list-item -- completely opaque
.nav
  &-list
    margin: 0
    &-item
      display: inline
```

## GOOD

```sass
// Descendant selector -- & is followed by a space
.nav
  & .item
    display: inline-block
```

```sass
// Compound selector -- appends a class, not a string
.btn
  &.is-active
    background: green
```

```sass
// Pseudo-class -- not concatenation
.link
  &:hover
    text-decoration: underline
```

```sass
// Pseudo-element -- not concatenation
.icon
  &::before
    content: ""
    display: block
```

```sass
// Standalone class -- the name is searchable as-is
.nav-item
  display: inline-block
```

```sass
// Adjacent sibling combinator -- not concatenation
.card
  & + .card
    margin-top: 16px
```
