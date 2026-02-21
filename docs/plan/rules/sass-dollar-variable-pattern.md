<!-- markdownlint-disable MD024 -->

# sass/dollar-variable-pattern

Enforce a naming pattern for `$variable` declarations. Default enforces `kebab-case`.

**Default**: `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"`
**Fixable**: No
**Options**: A regex string pattern

---

## BAD (default: kebab-case)

```sass
// camelCase
$fontSize: 16px
```

## BAD

```sass
// snake_case
$font_size: 16px
```

## BAD

```sass
// PascalCase
$FontSize: 16px
```

## BAD

```sass
// SCREAMING_CASE
$FONT_SIZE: 16px
```

## BAD

```sass
// Starting with number
$1st-color: red
```

## BAD

```sass
// Double hyphens
$font--size: 16px
```

## BAD

```sass
// Inside a rule
.component
  $myColor: blue
  color: $myColor
```

## GOOD

```sass
// kebab-case
$font-size: 16px
$primary-color: #036
$border-radius-sm: 4px
```

## GOOD

```sass
// Single word
$spacing: 8px
```

## GOOD

```sass
// Variable with number
$heading-2: 24px
$z-index-100: 100
```

## GOOD

```sass
// Inside a rule
.component
  $local-color: blue
  color: $local-color
```

---

## Custom configuration example

Allow SCREAMING_SNAKE_CASE for constants:

```json
{
  "sass/dollar-variable-pattern": "/^[a-z][a-z0-9]*(-[a-z0-9]+)*$|^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/"
}
```
