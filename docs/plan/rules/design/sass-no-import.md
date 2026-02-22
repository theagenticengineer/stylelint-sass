<!-- markdownlint-disable MD024 -->

# sass/no-import

Disallow `@import`. The Sass team deprecated `@import` in Dart Sass 1.80
in favor of `@use` and `@forward`. Using `@import` causes global namespace
pollution and makes dependency tracking impossible.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// Single @import
@import "variables"
```

## BAD

```sass
// @import with path
@import "utils/mixins"
```

## BAD

```sass
// @import with extension
@import "theme.sass"
```

## BAD

```sass
// Multiple imports on separate lines
@import "variables"
@import "mixins"
@import "base"
```

## BAD

```sass
// @import with url()
@import url("https://fonts.googleapis.com/css?family=Roboto")
```

## GOOD

```sass
// @use replaces @import
@use "variables"
```

## GOOD

```sass
// @use with namespace
@use "utils/mixins" as mx
```

## GOOD

```sass
// @forward for re-exporting
@forward "theme"
```

## GOOD

```sass
// @use with configuration
@use "config" with ($primary: #036, $border-radius: 4px)
```

## GOOD

```sass
// Multiple @use statements
@use "sass:math"
@use "sass:color"
@use "variables" as vars
```
