# sass/at-extend-no-missing-placeholder

Disallow `@extend` with non-placeholder selectors.

**Default**: `true`
**Fixable**: No

## Why?

Sass `@extend` lets one selector inherit the styles of another without duplicating declarations.
However, _what_ you extend matters:

- **Extending a class, element, or ID** (e.g. `@extend .btn`) rewrites every rule that mentions
  `.btn` anywhere in the stylesheet to also include the extending selector. The compiled CSS can
  grow with selectors you never wrote and never intended, especially in large codebases or when
  extending selectors from third-party libraries.

- **Extending a `%placeholder`** (e.g. `@extend %btn-base`) avoids this problem entirely.
  Placeholders are invisible in the compiled CSS on their own — they only produce output when
  extended, so the result is exactly the selectors you expect and nothing more.

```sass
// Extending a class — every rule that mentions .btn
// gets an extra .primary-btn selector in compiled CSS
.btn
  padding: 8px 16px
  border: 1px solid gray

.sidebar .btn
  font-size: 14px

.primary-btn
  @extend .btn
  background: blue
```

Compiled CSS:

```css
/* .primary-btn appears everywhere .btn was used */
.btn,
.primary-btn {
  padding: 8px 16px;
  border: 1px solid gray;
}

.sidebar .btn,
.sidebar .primary-btn {
  font-size: 14px;
}

.primary-btn {
  background: blue;
}
```

Using a placeholder keeps output predictable:

```sass
%btn-base
  padding: 8px 16px
  border: 1px solid gray

.btn
  @extend %btn-base

.primary-btn
  @extend %btn-base
  background: blue
```

Compiled CSS:

```css
/* only the selectors you wrote */
.btn,
.primary-btn {
  padding: 8px 16px;
  border: 1px solid gray;
}

.primary-btn {
  background: blue;
}
```

This rule enforces that every `@extend` targets a `%placeholder` selector.

## Configuration

```json
{
  "sass/at-extend-no-missing-placeholder": true
}
```

## BAD

```sass
// Extending a class
.error
  color: red

.alert
  @extend .error
```

```sass
// Extending an element
.nav-item
  @extend a
```

```sass
// Extending an ID
.widget
  @extend #main
```

```sass
// Extending a compound selector
.btn-primary
  @extend .btn.large
```

```sass
// Extending a class inside a nested rule
.card
  .header
    @extend .title
```

## GOOD

```sass
// Extending a placeholder
%visually-hidden
  position: absolute
  width: 1px
  height: 1px
  clip: rect(0 0 0 0)
  overflow: hidden

.sr-only
  @extend %visually-hidden
```

```sass
// Multiple placeholder extends
%reset-list
  margin: 0
  padding: 0
  list-style: none

%inline-items
  display: flex

.nav
  @extend %reset-list
  @extend %inline-items
```

```sass
// Placeholder extend inside nested rule
%text-truncate
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.card
  .title
    @extend %text-truncate
```
