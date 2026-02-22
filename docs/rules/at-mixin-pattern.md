# sass/at-mixin-pattern

Enforce a naming pattern for mixin names in `@mixin` declarations. Default enforces `kebab-case`.

**Default**: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
**Fixable**: No

## Why?

Mixins are one of the most-used Sass abstractions — they encapsulate reusable blocks of CSS that can
accept arguments and be included anywhere. In a large codebase, mixins form a shared API surface: any
developer should be able to guess a mixin's name without searching.

Inconsistent naming conventions (`=flexCenter`, `=FlexCenter`, `=flex_center`) make that impossible.
Enforcing a single pattern (kebab-case by default) aligns mixin names with CSS's own convention
(all-lowercase, hyphen-separated) and ensures discoverability across the project.

Sass treats `_` and `-` as interchangeable in identifiers, so the parser normalizes underscores to
hyphens. The `=` shorthand for `@mixin` is also normalized by sass-parser, so both `=flex-center`
and `@mixin flex-center` are checked by this rule.

## Configuration

```json
{
  "sass/at-mixin-pattern": ["/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"]
}
```

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
