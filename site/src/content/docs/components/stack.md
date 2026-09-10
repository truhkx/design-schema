---
title: Stack
description: The layout primitive. Lays out children in one direction with a token-based gap, so spacing is never hand-typed.
component:
  name: Stack
  category: layout
  status: review
  anatomy: [container]
  props:
    children:
      type: content
      required: true
      description: Any components. Stack does not style its children; it only positions them.
    direction:
      type: enum
      values: [vertical, horizontal]
      default: vertical
      description: Main axis. `horizontal` follows writing direction (start→end), not left→right.
    gap:
      type: enum
      values: [none, tight, normal, loose, section]
      default: normal
      description: 'Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing scale: tight for related controls, normal for fields in a form, loose for groups, section between page sections. The only way to set spacing between siblings.'
    align:
      type: enum
      values: [start, center, end, stretch]
      default: stretch
      description: Cross-axis alignment.
    justify:
      type: enum
      values: [start, center, end, between]
      default: start
      description: Main-axis distribution.
    wrap:
      type: boolean
      default: false
      description: Allow horizontal stacks to wrap onto new lines instead of overflowing.
      a11y: Prefer wrapping over horizontal scrolling so content reflows at 320px and 400% zoom.
    element:
      type: enum
      values: [div, section, nav, ul, ol]
      default: div
      description: Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`.
      platforms: [web, lit]
  styles:
    gap: { token: 'layout.gap.{gap}' }
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: Flexbox. `gap` maps to the CSS gap property with the layout.gap token; no margins on children.
    lit:
      tag: ds-stack
      reflect: [direction, gap, align, justify, wrap]
      notes: 'The host is the flex container (`:host { display: flex }`) with a default slot, so children stay in the light DOM and keep their own semantics.'
    rn:
      element: View
      props: [style]
      notes: Flexbox with `gap` (RN ≥ 0.71). Children are not wrapped. `element` is not applicable; use `accessibilityRole` on the content instead.
---

Stack is how things get spaced. Instead of margins on individual components, a Stack owns the gap between its children, using one of the theme's rhythm presets (`layout.gap.*`) rather than a raw number, so a theme with `layout.rhythm: loose` opens up every screen at once. Almost every screen is stacks inside stacks.

## When to use

Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is exposed to assistive technology.

## When not to use

Do not use Stack for two-dimensional layouts (use Grid, planned) or for positioning a single element (use spacing tokens on the parent). Do not set gaps between children by adding margins to the children; that defeats the purpose.

## Behavior

Stack is purely presentational: no events, no state. `horizontal` stacks overflow by default; set `wrap` so content reflows on narrow viewports. `align: stretch` (the default) makes children fill the cross axis, which is what buttons in a vertical stack usually want; set `start` for natural widths.

## Accessibility

Stack has no role by default and adds nothing to the accessibility tree. When `element` is a landmark or list, the correct semantics are rendered (`nav`, `ul` with `li` children). Horizontal stacks should wrap rather than scroll so content reflows at 320px width and 400% zoom (WCAG 1.4.10). Spacing from the scale keeps interactive targets separated enough to meet 2.5.8 target spacing when the targets themselves are small.

## Platform notes

### Web
`display: flex` with `flex-direction`, `gap: var(--layout-gap-<preset>)`, `align-items`, `justify-content`, and `flex-wrap`. `between` maps to `space-between`.

### Lit
`<ds-stack direction="horizontal" gap="tight">`. The host itself is the flex container; children are slotted light-DOM nodes, so their semantics are untouched. `element="ul"` renders the slot inside a `<ul role="list">` and wraps each assigned node in an `<li>` via slotchange.

### React Native
`View` with `flexDirection`, `gap` from the RN token object, `alignItems`, `justifyContent`, `flexWrap`. `start`/`end` map to `flex-start`/`flex-end`.

## Related

Form, Button.
