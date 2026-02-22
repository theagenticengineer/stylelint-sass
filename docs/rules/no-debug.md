# sass/no-debug

Disallow `@debug` statements. Debug output should not ship to production.

**Default**: `true`
**Fixable**: No

## BAD

```sass
// debug output leaks to build logs
@debug "should not ship"
```

```sass
// variable inspection left over from development
@debug $variable
```

```sass
=my-mixin
  // nested @debug is still flagged
  @debug "inside mixin"
```

## GOOD

```sass
=my-mixin
  // removed @debug — use a test or breakpoint instead
  color: $color
```

```sass
@function double($n)
  // pure logic, no debug output
  @return $n * 2
```
