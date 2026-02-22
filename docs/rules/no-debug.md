# sass/no-debug

Disallow `@debug` statements. Debug output should not ship to production.

**Default**: `true`
**Fixable**: No

## Why?

`@debug` prints the value of an expression to the standard error stream during compilation. It is
useful while developing — for instance, inspecting a variable's value or verifying a function's
return:

```sass
@debug math.div(100px, 3)
// Prints: 33.3333333333px
```

However, `@debug` statements left in production code pollute build logs with noise that obscures
real warnings and errors. Unlike `@warn` (which signals an intentional message to consumers),
`@debug` has no audience beyond the developer who wrote it. Shipping `@debug` statements is
almost always accidental.

This rule flags every `@debug` so they are caught before code is merged.

## Configuration

```json
{
  "sass/no-debug": true
}
```

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
