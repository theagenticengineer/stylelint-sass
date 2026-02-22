<!-- markdownlint-disable MD024 -->

# sass/no-duplicate-dollar-variables

Disallow duplicate `$variable` declarations within the same scope.
Duplicate declarations silently override, making values unpredictable.

**Default**: `true`
**Fixable**: No
**Options**:

- `ignoreInside: ["at-rule", "if-else"]` — ignore duplicates inside
  certain constructs
- `ignoreDefaults: true` — ignore variables using `!default`

---

## BAD

```sass
// Duplicate at root scope
$color: red
$color: blue
```

## BAD

```sass
// Duplicate inside same rule block
.component
  $size: 16px
  $size: 20px
  font-size: $size
```

## BAD

```sass
// Duplicate across declarations in same scope
$spacing: 8px
$primary: blue
$spacing: 12px
```

## GOOD

```sass
// Unique variable names
$spacing-sm: 4px
$spacing-md: 8px
$spacing-lg: 16px
```

## GOOD

```sass
// Same name in different scopes
$color: red

.component
  $color: blue
  color: $color
```

## GOOD (with `ignoreDefaults: true`)

```sass
// !default re-declaration is a pattern used for configuration
$primary: blue !default
$primary: red
```

## GOOD (with `ignoreInside: ["if-else"]`)

```sass
// Conditional assignment
$theme: light

@if $theme == dark
  $bg: #111
@else
  $bg: #fff
```

## GOOD

```sass
// Different variables
$font-family: sans-serif
$font-size: 16px
$font-weight: 400
```
