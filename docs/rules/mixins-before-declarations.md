# sass/mixins-before-declarations

Enforce that `@include` (or `+` shorthand) statements appear before property declarations within a
rule block.

**Default**: `true`
**Fixable**: No

## Why?

Sass mixins (`@include` or `+` shorthand) inject a reusable block of styles into a rule. They can
set any number of properties, so their effect on the final output depends on where they appear
relative to explicit declarations. Placing mixins before declarations makes the rule block read
top-down: "apply these shared patterns, then set these specific properties."

```sass
// Hard to read — does +rounded override padding, or does padding override +rounded?
.card
  padding: 16px
  +rounded
  background: white
```

When mixins come first, the intent is unambiguous — explicit declarations always win because they
come last:

```sass
// Clear — apply shared mixin, then set specific properties
.card
  +rounded
  padding: 16px
  background: white
```

Some mixins like responsive wrappers (`+respond-to`) use `@content` and naturally belong near the
declarations they affect. Use the `ignore` option to exempt these from the ordering requirement.

## Configuration

```json
{
  "sass/mixins-before-declarations": true
}
```

### Options

#### `ignore: string[]`

Exempt specific mixin names from the ordering requirement. Useful for responsive or conditional
mixins that wrap `@content` and belong near the declarations they affect.

```json
{
  "sass/mixins-before-declarations": [true, { "ignore": ["respond-to"] }]
}
```

## BAD

```sass
// +include shorthand after declaration
.card
  padding: 16px
  +rounded
```

```sass
// @include after declaration
.card
  padding: 16px
  @include rounded
```

```sass
// Mixin between declarations
.hero
  display: flex
  +respond-to(md)
    flex-direction: row
  color: white
```

```sass
// Multiple mixins, some after declarations
.btn
  +reset
  background: blue
  +hover-state
```

## GOOD

```sass
// Mixins before declarations
.card
  +rounded
  padding: 16px
  background: white
```

```sass
// Multiple mixins before declarations
.btn
  +reset
  +hover-state
  background: blue
  padding: 8px
```

```sass
// @include syntax before declarations
.card
  @include rounded
  @include shadow(2)
  padding: 16px
```

```sass
// With ignore: ["respond-to"] — responsive mixin wrapping @content is exempt
.grid
  +flex-layout
  display: grid
  gap: 16px
  +respond-to(md)
    grid-template-columns: repeat(2, 1fr)
```

```sass
// Only mixins, no declarations
.icon
  +size(24px)
  +center
```
