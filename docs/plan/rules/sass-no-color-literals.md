<!-- markdownlint-disable MD024 -->

# sass/no-color-literals

Disallow color literals (hex, named colors, rgb/hsl) used directly in
property declarations. Colors should be stored in variables or accessed
via design tokens for consistency and maintainability.

**Default**: `"warning"`
**Fixable**: No
**Options**:

- `allowInVariables: true` — allow color literals in `$variable`
  assignments (default: true)
- `allowInFunctions: true` — allow color literals as function
  arguments (default: false)
- `allowedColors: ["transparent", "currentColor", "inherit"]` —
  colors exempt from the rule

---

## BAD

```sass
// Hex in property
.header
  background: #336699
```

## BAD

```sass
// Named color in property
.error
  color: red
```

## BAD

```sass
// Short hex in property
.link
  color: #036
```

## BAD

```sass
// rgb() in property
.overlay
  background: rgb(0, 0, 0)
```

## BAD

```sass
// hsl() in property
.accent
  color: hsl(210, 100%, 50%)
```

## BAD

```sass
// rgba() in property
.modal-backdrop
  background: rgba(0, 0, 0, 0.5)
```

## BAD

```sass
// Color in shorthand
.card
  border: 1px solid #ccc
```

## GOOD

```sass
// Variable reference
$primary: #036

.link
  color: $primary
```

## GOOD

```sass
// Color in variable declaration (allowInVariables: true)
$error-color: red
$primary: #336699
$overlay-bg: rgba(0, 0, 0, 0.5)
```

## GOOD

```sass
// Allowed color keywords
.hidden
  color: transparent

.icon
  fill: currentColor

.reset
  color: inherit
```

## GOOD

```sass
// Namespaced color functions with variables
@use "sass:color"

$primary: #036

.link
  &:hover
    color: color.adjust($primary, $lightness: -10%)
```

## GOOD

```sass
// Design token map
$colors: (primary: #036, secondary: #963, error: #c00)

.alert
  color: map-get($colors, error)
```
