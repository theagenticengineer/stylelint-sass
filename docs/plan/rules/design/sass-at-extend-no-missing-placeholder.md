<!-- markdownlint-disable MD024 -->

# sass/at-extend-no-missing-placeholder

`@extend` should only be used with `%placeholder` selectors, not classes or
other selectors. Extending non-placeholder selectors leads to unexpected
selector bloat in compiled CSS.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// Extending a class
.error
  color: red

.alert
  @extend .error
```

## BAD

```sass
// Extending an element
.nav-item
  @extend a
```

## BAD

```sass
// Extending an ID
.widget
  @extend #main
```

## BAD

```sass
// Extending a compound selector
.btn-primary
  @extend .btn.large
```

## BAD

```sass
// Extending a class inside a nested rule
.card
  .header
    @extend .title
```

## GOOD

```sass
// Extending a placeholder
%visually-hidden
  position: absolute
  width: 1px
  height: 1px
  clip: rect(0 0 0 0)
  overflow: hidden

.sr-only
  @extend %visually-hidden
```

## GOOD

```sass
// Multiple placeholder extends
%reset-list
  margin: 0
  padding: 0
  list-style: none

%inline-items
  display: flex

.nav
  @extend %reset-list
  @extend %inline-items
```

## GOOD

```sass
// Placeholder extend inside nested rule
%text-truncate
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.card
  .title
    @extend %text-truncate
```
