<!-- markdownlint-disable MD024 -->

# sass/percent-placeholder-pattern

Enforce a naming pattern for `%placeholder` selectors. Default enforces `kebab-case`.

**Default**: `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"`
**Fixable**: No
**Options**: A regex string pattern

---

## BAD (default: kebab-case)

```sass
// camelCase
%visuallyHidden
  position: absolute
```

## BAD

```sass
// snake_case
%visually_hidden
  position: absolute
```

## BAD

```sass
// PascalCase
%VisuallyHidden
  position: absolute
```

## BAD

```sass
// Starting with uppercase
%Hidden
  display: none
```

## GOOD

```sass
// kebab-case
%visually-hidden
  position: absolute
  width: 1px
  height: 1px
```

## GOOD

```sass
// Single word
%clearfix
  &::after
    content: ""
    display: table
    clear: both
```

## GOOD

```sass
// Multiple words
%reset-list
  margin: 0
  padding: 0
  list-style: none
```
