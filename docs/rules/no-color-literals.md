# sass/no-color-literals

Disallow color literals (hex, named colors, rgb/hsl) used directly in property declarations. Colors
should be stored in variables.

**Default**: `"warning"`
**Fixable**: No

## Why?

Hard-coded color values scattered across stylesheets make themes difficult to maintain. When a brand
color changes, you must hunt through every file for every occurrence of `#336699` or `red`. If
colors are stored in variables (or a design-token map), a single change propagates everywhere:

```sass
// Hard-coded — change requires find-and-replace across the whole project
.header
  background: #336699

// Variable — one change updates every usage
$primary: #336699
.header
  background: $primary
```

This rule flags color literals in property declarations so they are caught during linting. Variable
assignments are allowed by default (`allowInVariables: true`), since that is where design tokens are
defined.

## Configuration

```json
{
  "sass/no-color-literals": true
}
```

With options:

```json
{
  "sass/no-color-literals": [
    true,
    {
      "allowInVariables": true,
      "allowInFunctions": false,
      "allowedColors": ["transparent", "currentColor", "inherit"]
    }
  ]
}
```

### Options

- **`allowInVariables`** (`boolean`, default: `true`) --
  Allow color literals in `$variable` assignments.
- **`allowInFunctions`** (`boolean`, default: `false`) --
  Allow color literals as function arguments.
- **`allowedColors`** (`string[]`,
  default: `["transparent", "currentColor", "inherit"]`) --
  Colors exempt from the rule.

## BAD

```sass
// hex color in property declaration
.header
  background: #336699
```

```sass
// named color in property
.error
  color: red
```

```sass
// short hex color
.link
  color: #036
```

```sass
// rgb() function
.overlay
  background: rgb(0, 0, 0)
```

```sass
// hsl() function
.accent
  color: hsl(210, 100%, 50%)
```

```sass
// rgba() function
.modal-backdrop
  background: rgba(0, 0, 0, 0.5)
```

```sass
// color in shorthand property
.card
  border: 1px solid #ccc
```

## GOOD

```sass
// variable reference instead of literal
$primary: #036

.link
  color: $primary
```

```sass
// color literals in variable assignments (allowInVariables: true)
$error-color: red
$primary: #336699
$overlay-bg: rgba(0, 0, 0, 0.5)
```

```sass
// allowed colors (transparent, currentColor, inherit)
.hidden
  color: transparent

.icon
  fill: currentColor

.reset
  color: inherit
```

```sass
// namespaced function with variables
@use "sass:color"
$primary: #036

.adjusted
  color: color.adjust($primary, $lightness: -10%)
```

```sass
// design token map — colors in variable assignment
$colors: (primary: #036, error: red, success: green)

.link
  color: map-get($colors, error)
```
