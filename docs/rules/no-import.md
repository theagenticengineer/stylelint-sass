# sass/no-import

Disallow `@import`. The Sass team deprecated `@import` in Dart Sass 1.80
in favor of `@use` and `@forward`. Using `@import` causes global namespace
pollution and makes dependency tracking impossible.

**Default**: `true`
**Fixable**: No

## BAD

```sass
// pollutes the global namespace
@import "variables"
```

```sass
// makes dependency tracking impossible
@import "utils/mixins"
```

```sass
// deprecated since Dart Sass 1.80
@import "theme.sass"
```

```sass
// URL imports are also flagged
@import url("https://fonts.googleapis.com/css?family=Roboto")
```

## GOOD

```sass
// module-scoped access to variables
@use "variables"
```

```sass
// namespaced import avoids collisions
@use "utils/mixins" as mx
```

```sass
// re-export for downstream consumers
@forward "theme"
```

```sass
// configure module defaults at load time
@use "config" with ($primary: #036, $border-radius: 4px)
```
