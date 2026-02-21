<!-- markdownlint-disable MD024 -->

# sass/at-use-no-redundant-alias

Disallow `@use` rules where the `as` alias matches the default namespace.
Sass already defaults the namespace to the last segment of the URL (without
extension or leading underscore), so an explicit alias that matches adds
noise without changing behavior.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// alias matches filename — redundant
@use "colors" as colors
```

## BAD

```sass
// alias matches last path segment — redundant
@use "src/utils/helpers" as helpers
```

## BAD

```sass
// alias matches built-in module name — redundant
@use "sass:math" as math
```

## BAD

```sass
// another built-in with redundant alias
@use "sass:color" as color
```

## BAD

```sass
// alias matches filename without leading underscore — redundant
@use "_variables" as variables
```

## GOOD

```sass
// no alias, uses default namespace
@use "colors"

.link
  color: colors.$primary
```

## GOOD

```sass
// short alias, different from default namespace
@use "colors" as c

.link
  color: c.$primary
```

## GOOD

```sass
// built-in with default namespace
@use "sass:math"

.half
  width: math.div($width, 2)
```

## GOOD

```sass
// built-in with short alias
@use "sass:math" as m

.half
  width: m.div($width, 2)
```

## GOOD

```sass
// alias differs from default namespace
@use "variables" as vars

.link
  color: vars.$primary
```

## GOOD

```sass
// unnamespaced — separate rule (at-use-no-unnamespaced) handles this
@use "colors" as *
```

## GOOD

```sass
// @forward is NOT flagged — different semantics
@forward "colors" as colors
```
