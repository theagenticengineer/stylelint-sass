# sass/no-duplicate-dollar-variables

Disallow duplicate `$variable` declarations within the same scope.

**Default**: `true`
**Fixable**: No

## Why?

Sass variables declared with `$name: value` are mutable — if you declare the same variable twice
in the same scope, the second silently overrides the first with no warning:

```sass
$spacing: 8px
$primary: blue
$spacing: 12px   // silently overrides the 8px above
```

This makes the final value of `$spacing` depend on which declaration the reader notices last, which
is error-prone in large stylesheets. In most cases the duplicate is either a mistake (copy-paste
artifact) or a sign that the variables should have different names.

Note that Sass **scoping** means a variable declared inside a rule block is a _different_ variable
from one with the same name at the root. This rule only flags duplicates within the **same** scope:

```sass
$color: red         // root scope

.component
  $color: blue      // different scope — no conflict
  color: $color
```

### `!default` declarations

The `!default` flag is a deliberate Sass pattern for providing fallback values that consumers can
override. When `ignoreDefaults: true` is set, a `!default` declaration followed by a regular
declaration is not flagged.

## Configuration

```json
{
  "sass/no-duplicate-dollar-variables": true
}
```

### Options

#### `ignoreDefaults: true`

Ignore `$variable: value !default` declarations when checking for duplicates.

```json
{
  "sass/no-duplicate-dollar-variables": [true, { "ignoreDefaults": true }]
}
```

#### `ignoreInside: ["if-else"]`

Ignore duplicate declarations inside `@if` / `@else` blocks (conditional assignment pattern).

```json
{
  "sass/no-duplicate-dollar-variables": [true, { "ignoreInside": ["if-else"] }]
}
```

#### `ignoreInside: ["at-rule"]`

Ignore duplicate declarations inside any at-rule.

```json
{
  "sass/no-duplicate-dollar-variables": [true, { "ignoreInside": ["at-rule"] }]
}
```

## BAD

```sass
// Duplicate at root scope
$color: red
$color: blue
```

```sass
// Duplicate inside same rule block
.component
  $size: 16px
  $size: 20px
  font-size: $size
```

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

```sass
// Same name in different scopes
$color: red

.component
  $color: blue
  color: $color
```

```sass
// Different variables
$font-family: sans-serif
$font-size: 16px
$font-weight: 400
```

```sass
// !default re-declaration (with ignoreDefaults: true)
$primary: blue !default
$primary: red
```

```sass
// Conditional assignment (with ignoreInside: ["if-else"])
$theme: light

@if $theme == dark
  $bg: #111
@else
  $bg: #fff
```
