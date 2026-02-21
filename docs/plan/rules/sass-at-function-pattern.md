<!-- markdownlint-disable MD024 -->

# sass/at-function-pattern

Enforce a naming pattern for `@function` names. Default enforces `kebab-case`.

**Default**: `"/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/"`
**Fixable**: No
**Options**: A regex string pattern

---

## BAD (default: kebab-case)

```sass
// camelCase
@function toRem($px)
  @return math.div($px, 16) * 1rem
```

## BAD

```sass
// snake_case
@function to_rem($px)
  @return math.div($px, 16) * 1rem
```

## BAD

```sass
// PascalCase
@function ToRem($px)
  @return math.div($px, 16) * 1rem
```

## BAD

```sass
// Starting with underscore
@function _private-helper($val)
  @return $val * 2
```

## GOOD

```sass
// kebab-case
@function to-rem($px)
  @return math.div($px, 16) * 1rem
```

## GOOD

```sass
// Single word
@function spacing($multiplier)
  @return $multiplier * 8px
```

## GOOD

```sass
// With numbers
@function z-index-above($layer)
  @return map-get($z-layers, $layer) + 1
```
