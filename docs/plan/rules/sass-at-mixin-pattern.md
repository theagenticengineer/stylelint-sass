<!-- markdownlint-disable MD024 -->

# sass/at-mixin-pattern

Enforce a naming pattern for mixin names in `@mixin` declarations. Default enforces `kebab-case`.

**Default**: `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"`
**Fixable**: No
**Options**: A regex string pattern

---

## BAD (default: kebab-case)

```sass
// camelCase
=flexCenter
  display: flex
  align-items: center
  justify-content: center
```

## BAD

```sass
// snake_case
=flex_center
  display: flex
```

## BAD

```sass
// PascalCase
=FlexCenter
  display: flex
```

## BAD

```sass
// camelCase with @mixin syntax
@mixin respondTo($bp)
  @media (min-width: $bp)
    @content
```

## GOOD

```sass
// kebab-case with = shorthand
=flex-center
  display: flex
  align-items: center
  justify-content: center
```

## GOOD

```sass
// kebab-case with @mixin syntax
@mixin respond-to($bp)
  @media (min-width: $bp)
    @content
```

## GOOD

```sass
// Single word
=clearfix
  &::after
    content: ""
    display: table
    clear: both
```

## GOOD

```sass
// With numbers
=heading-2
  font-size: 24px
  font-weight: bold
```
