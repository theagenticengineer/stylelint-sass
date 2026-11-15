# sass/selector-no-adjacent-compounds

Disallow two compound selectors written next to each other without whitespace or a combinator,
such as `[class]a`. A compound selector is a run of simple selectors that all match one element:
a type selector first, then classes, IDs, attributes and pseudo-classes.

**Default**: `true`
**Fixable**: No

## Why?

CSS never allowed `[class]a`, and it is unclear whether it means `a[class]` or `[class] a`. Sass
used to read it as `[class] a`. Dart Sass 1.100.0 deprecates it, and Dart Sass 2.0.0 makes it an
error ([deprecation page](https://sass-lang.com/d/adjacent-compounds)).

sass-parser rewrites `[class]a` to `[class] a` in the parsed selector, so core Stylelint selector
rules see a descendant combinator. This rule reads the selector as written.

It reports what Dart Sass 1.108 reports: a type selector, written with or without a namespace,
right after `]` or `)`. Dart Sass accepts the universal selector there (`[x]*`), so the rule does
too. It skips interpolation and strings.

## Configuration

```json
{
  "sass/selector-no-adjacent-compounds": true
}
```

## BAD

```sass
// A type selector follows an attribute selector
[class]a
  color: red
```

```sass
// Inside a nested rule
.card
  &[data-x]span
    color: red
```

```sass
// A type selector follows a functional pseudo-class
.a:not(.b)p
  color: red
```

## GOOD

```sass
// The type selector comes first
a[class]
  color: red
```

```sass
// Whitespace makes it a descendant selector
[class] a
  color: red
```

```sass
// Classes, pseudo-classes and parent suffixes stay in one compound
.card
  &__title:hover
    color: red
```
