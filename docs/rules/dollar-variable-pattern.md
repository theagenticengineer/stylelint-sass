# sass/dollar-variable-pattern

Enforce a naming pattern for `$variable` declarations. Default enforces `kebab-case`.

**Default**: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
**Fixable**: No

## Why?

Sass variables are the primary way to share values across a stylesheet — colors, spacing, font
stacks, breakpoints. In a large codebase, inconsistent naming conventions make variables hard to
discover and easy to duplicate:

```sass
// Which one is the "right" primary color?
$primaryColor: #036
$primary-color: #036
$PRIMARY_COLOR: #036
```

Enforcing a single naming pattern (kebab-case by default) eliminates ambiguity. When every variable
follows the same convention, developers can predict a variable's name without searching and
code-review diffs become easier to scan.

Note that Sass treats `_` and `-` as interchangeable in identifiers, so `$font_size` and
`$font-size` refer to the same variable. The parser normalizes underscores to hyphens, which is why
the default pattern uses `-`.

## Configuration

```json
{
  "sass/dollar-variable-pattern": ["/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"]
}
```

## Options

A regex pattern (string or RegExp) that variable names must match.

## BAD

```sass
// camelCase
$fontSize: 16px
```

```sass
// PascalCase
$FontSize: 16px
```

```sass
// SCREAMING_CASE
$FONT_SIZE: 16px
```

```sass
// Double hyphens
$font--size: 16px
```

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

```sass
// Single word
$spacing: 8px
```

```sass
// Variable with number
$heading-2: 24px
$z-index-100: 100
```

```sass
// Inside a rule
.component
  $local-color: blue
  color: $local-color
```

## Notes

Sass treats `_` and `-` as interchangeable in identifiers. The parser normalizes all underscores to
hyphens, so `$font_size` is seen as `$font-size`. Custom patterns should use `-`, not `_`.

## Custom configuration

Also allow `SCREAMING_SNAKE_CASE` for constants (the pattern uses `-` because Sass normalizes `_`
to `-` in identifiers — see Notes above):

```json
{
  "sass/dollar-variable-pattern": "/^[a-z][a-z0-9]*(-[a-z0-9]+)*$|^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/"
}
```
