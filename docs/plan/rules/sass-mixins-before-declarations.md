<!-- markdownlint-disable MD024 -->

# sass/mixins-before-declarations

`@include` (or `+` shorthand) statements must appear before property
declarations within a rule block. This enforces a predictable ordering so
mixin outputs are clearly separated from local overrides.

**Default**: `true`
**Fixable**: No
**Options**:

- `ignore: ["mixin-name"]` — exempt specific mixins
  (e.g., media query mixins often wrap content)

---

## BAD

```sass
// +include after declaration
.card
  padding: 16px
  +rounded
```

## BAD

```sass
// @include after declaration
.card
  padding: 16px
  @include rounded
```

## BAD

```sass
// Mixin between declarations
.hero
  display: flex
  +respond-to(md)
    flex-direction: row
  color: white
```

## BAD

```sass
// Multiple mixins, some after declarations
.btn
  +reset
  background: blue
  +hover-state
```

## GOOD

```sass
// Mixins before declarations
.card
  +rounded
  padding: 16px
  background: white
```

## GOOD

```sass
// Multiple mixins before declarations
.btn
  +reset
  +hover-state
  background: blue
  padding: 8px
```

## GOOD

```sass
// @include syntax before declarations
.card
  @include rounded
  @include shadow(2)
  padding: 16px
```

## GOOD (with `ignore: ["respond-to"]`)

```sass
// Responsive mixin wrapping @content is exempt
.grid
  +flex-layout
  display: grid
  gap: 16px
  +respond-to(md)
    grid-template-columns: repeat(2, 1fr)
```

## GOOD

```sass
// Only mixins, no declarations
.icon
  +size(24px)
  +center
```
