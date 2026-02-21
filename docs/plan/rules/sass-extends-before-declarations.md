<!-- markdownlint-disable MD024 -->

# sass/extends-before-declarations

`@extend` statements must appear before property declarations within a rule
block. This enforces a predictable ordering: extends first, then properties,
making it clear what base styles are inherited vs. overridden.

**Default**: `true`
**Fixable**: No

---

## BAD

```sass
// @extend after declaration
.alert
  color: red
  @extend %message-base
```

## BAD

```sass
// @extend between declarations
.card
  display: flex
  @extend %rounded
  padding: 16px
```

## BAD

```sass
// Multiple @extends, some after declarations
.btn-primary
  @extend %btn-base
  background: blue
  @extend %text-white
```

## GOOD

```sass
// @extend before all declarations
.alert
  @extend %message-base
  color: red
```

## GOOD

```sass
// Multiple @extends before declarations
.btn-primary
  @extend %btn-base
  @extend %text-white
  background: blue
  padding: 8px 16px
```

## GOOD

```sass
// @extend before declarations and nesting
.card
  @extend %rounded
  padding: 16px
  background: white

  .title
    font-weight: bold
```

## GOOD

```sass
// Rule with only @extend (no declarations)
.sr-only
  @extend %visually-hidden
```
