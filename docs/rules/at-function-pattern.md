# sass/at-function-pattern

`@function` defines a reusable computation that takes arguments and returns a value via `@return`.
Unlike mixins (which output CSS), functions produce values you can use in any expression — property
values, variable assignments, other function calls, etc.

```sass
@function to-rem($px)
  @return math.div($px, 16) * 1rem

body
  font-size: to-rem(18)  // 1.125rem
```

This rule enforces a naming pattern for `@function` names. Default enforces `kebab-case`.

**Default**: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
**Fixable**: No

## Options

A regex pattern (string or RegExp) that function names must match.

## BAD

```sass
// camelCase
@function toRem($px)
  @return math.div($px, 16) * 1rem
```

```sass
// PascalCase
@function ToRem($px)
  @return math.div($px, 16) * 1rem
```

```sass
// Leading underscore (normalized to -)
@function _private-helper($val)
  @return $val * 2
```

## GOOD

```sass
// kebab-case
@function to-rem($px)
  @return math.div($px, 16) * 1rem
```

```sass
// Single word
@function spacing($multiplier)
  @return $multiplier * 8px
```

```sass
// Multi-word with hyphens
@function z-index-above($layer)
  @return $layer + 1
```

## Notes

Sass treats `_` and `-` as interchangeable in identifiers. The parser normalizes all underscores to
hyphens, so `@function to_rem` is seen as `@function to-rem`. Custom patterns should use `-`, not
`_`.

## Custom configuration

Allow `camelCase` function names:

```json
{
  "sass/at-function-pattern": "/^[a-zA-Z][a-zA-Z0-9]*$/"
}
```
