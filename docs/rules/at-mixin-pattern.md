# sass/at-mixin-pattern

Enforce a naming pattern for mixin names in `@mixin` declarations. Default enforces `kebab-case`.

**Default**: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
**Fixable**: No

## Options

A regex pattern (string or RegExp) that mixin names must match.

## BAD

```sass
// camelCase with = shorthand
=flexCenter
  display: flex
```

```sass
// PascalCase with = shorthand
=FlexCenter
  display: flex
```

```sass
// camelCase with @mixin syntax
@mixin respondTo($bp)
  @content
```

## GOOD

```sass
// kebab-case with = shorthand
=flex-center
  display: flex
```

```sass
// kebab-case with @mixin syntax
@mixin respond-to($bp)
  @content
```

```sass
// Single word
=clearfix
  display: block
```

```sass
// With numbers
=heading-2
  font-weight: bold
```

## Notes

Sass treats `_` and `-` as interchangeable in identifiers. The parser normalizes all underscores to
hyphens, so `=flex_center` is seen as `=flex-center`. Custom patterns should use `-`, not `_`.

The `=` shorthand for `@mixin` is normalized by sass-parser, so both syntaxes are checked by this
rule.

## Custom configuration

Allow PascalCase mixin names (e.g. for component mixins):

```json
{
  "sass/at-mixin-pattern": "/^[A-Z][a-zA-Z0-9]*$/"
}
```
