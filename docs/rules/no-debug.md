# sass/no-debug

Disallow `@debug` statements. Debug output should not ship to production.

**Default**: `true`
**Fixable**: No

## BAD

```sass
@debug "should not ship"
```

```sass
@debug $variable
```

```sass
=my-mixin
  @debug "inside mixin"
```

## GOOD

```sass
=clearfix
  &::after
    content: ""
    display: table
    clear: both
```

```sass
$width: 100px

.container
  max-width: $width
```
