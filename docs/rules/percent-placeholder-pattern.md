# sass/percent-placeholder-pattern

`%name` defines a placeholder selector — a rule block that only exists to be `@extend`ed. It never
outputs CSS on its own:

```sass
// Define a placeholder
%visually-hidden
  position: absolute
  width: 1px
  height: 1px
  overflow: hidden

// Use it via @extend
.sr-only
  @extend %visually-hidden
```

The key benefit over extending a regular class (like `@extend .visually-hidden`) is that
`%visually-hidden` doesn't appear in the output CSS unless something extends it — no unused CSS
bloat.

This rule enforces a naming pattern for `%placeholder` selectors. Default enforces `kebab-case`.

**Default**: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
**Fixable**: No

## Options

A regex pattern (string or RegExp) that placeholder names must match.

## BAD

```sass
// camelCase
%visuallyHidden
  display: none
```

```sass
// PascalCase
%VisuallyHidden
  display: none
```

```sass
// Starts with uppercase
%Hidden
  display: none
```

## GOOD

```sass
// kebab-case
%visually-hidden
  display: none
```

```sass
// Single word
%clearfix
  overflow: hidden
```

```sass
// Multiple words
%reset-list
  margin: 0
```

## Notes

Unlike `$variable` declarations, sass-parser does **not** normalize `_` to `-` in placeholder
selectors. `%visually_hidden` keeps the underscore and will fail the default kebab-case pattern.
Use `-` in placeholder names for consistency.

## Custom configuration

Allow `PascalCase` placeholders:

```json
{
  "sass/percent-placeholder-pattern": "/^[A-Z][a-zA-Z0-9]*$/"
}
```
