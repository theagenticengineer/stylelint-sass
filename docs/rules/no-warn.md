# sass/no-warn

Disallow `@warn` statements. Warnings clutter build output and may indicate incomplete migrations.

**Default**: `true`
**Fixable**: No

## BAD

```sass
// runtime warnings clutter CI output
@warn "Deprecated stylesheet loaded"
```

```sass
=old-clearfix
  // migration notice should be enforced by a lint rule, not @warn
  @warn "Use modern clearfix instead"
  overflow: hidden
```

```sass
@function to-rem($px)
  // deprecation warnings belong in documentation, not build output
  @warn "to-rem() is deprecated, use math.div()"
  @return $px / 16 * 1rem
```

## GOOD

```sass
=old-clearfix
  // removed @warn — use stylelint to catch deprecated mixin usage instead
  overflow: hidden
```

```sass
@function to-rem($px)
  // no runtime warning — deprecation documented in CHANGELOG
  @return $px / 16 * 1rem
```
