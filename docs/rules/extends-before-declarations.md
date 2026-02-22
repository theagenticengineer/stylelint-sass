# sass/extends-before-declarations

Enforce that `@extend` statements appear before property declarations within a rule block.

**Default**: `true`
**Fixable**: No

## Why?

Sass `@extend` pulls in styles from another selector (typically a `%placeholder`). When you read a
rule block, seeing `@extend` first tells you _what this selector inherits_ before you see _what it
overrides_. Mixing the two makes the relationship ambiguous:

```sass
// Hard to read — what does .alert inherit vs. define?
.alert
  color: red
  @extend %message-base
  padding: 16px
```

When extends come first, the rule block reads top-down like a contract: "inherit these base styles,
then apply these overrides."

```sass
// Clear — inherits base, then overrides color and padding
.alert
  @extend %message-base
  color: red
  padding: 16px
```

This ordering is especially helpful in larger codebases where a rule block may extend multiple
placeholders and declare many properties. A consistent structure makes it easier to scan for
inherited styles without reading the entire block.

## Configuration

```json
{
  "sass/extends-before-declarations": true
}
```

## BAD

```sass
// @extend after declaration
.alert
  color: red
  @extend %message-base
```

```sass
// @extend between declarations
.card
  display: flex
  @extend %rounded
  padding: 16px
```

```sass
// Multiple @extends, some after declarations
.btn-primary
  @extend %btn-base
  background: blue
  @extend %text-white
```

## GOOD

```sass
// @extend before all declarations
.alert
  @extend %message-base
  color: red
```

```sass
// Multiple @extends before declarations
.btn-primary
  @extend %btn-base
  @extend %text-white
  background: blue
  padding: 8px 16px
```

```sass
// @extend before declarations and nesting
.card
  @extend %rounded
  padding: 16px
  background: white

  .title
    font-weight: bold
```

```sass
// Rule with only @extend (no declarations)
.sr-only
  @extend %visually-hidden
```
