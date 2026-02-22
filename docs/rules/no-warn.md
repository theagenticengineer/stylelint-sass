# sass/no-warn

Disallow `@warn` statements. Warnings clutter build output and may indicate incomplete migrations.

**Default**: `true`
**Fixable**: No

## Why?

`@warn` prints a message to the standard error stream during compilation. It is commonly used to
signal deprecations or flag suspect usage:

```sass
=old-clearfix
  @warn "old-clearfix is deprecated — use modern-clearfix instead"
  overflow: hidden
```

While the intent is helpful, `@warn` has several problems in practice:

- **Noisy CI logs** — warnings fire on every compilation, burying actionable output from other
  tools. A single deprecated mixin included in 50 files produces 50 identical warnings.
- **Wrong enforcement layer** — deprecation notices are better enforced by a lint rule (which fails
  the build) than by a runtime message (which is easy to ignore).
- **Migration debt** — `@warn` statements often linger long after the migration they announce has
  been completed, adding permanent noise.

This rule flags every `@warn` so that deprecation enforcement moves to the linter, where it belongs.

## Configuration

```json
{
  "sass/no-warn": true
}
```

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
