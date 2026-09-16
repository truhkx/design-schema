---
title: Stack
description: The layout primitive. Lays out children in one direction with a token-based gap, so spacing is never hand-typed.
component:
  name: Stack
  category: layout
  status: review
  anatomy: [container, item]
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
      description: 'Main-axis distribution. It only shows where the main axis is larger than the content — a vertical Stack needs a bounded height for it to mean anything, and Stack has no size of its own, so that is the caller''s to give. The four values are the whole set: `around` and `evenly` are deliberately left out, since a rhythm system should not offer four ways to divide leftover space.'
    wrap:
      type: boolean
      default: false
      description: 'Allow horizontal stacks to wrap onto new lines instead of overflowing. It is set whatever the direction — on a column it is inert unless the block size is bounded — rather than being silently ignored on a vertical Stack.'
      a11y: 'Prefer wrapping over horizontal scrolling so content reflows at 320px and 400% zoom. Native has neither viewport width nor browser zoom: the equivalent is that a wrapped row still fits when the platform''s text size is turned up.'
    element:
      type: enum
      values: [div, section, nav, ul, ol]
      default: div
      description: 'Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li` that is `display: contents`, so the children stay the flex items and the gap is unchanged; the wrapper carries `role="listitem"` and the list `role="list"`, because dropping `list-style` removes list semantics in some browsers. One `li` per child as the platform counts children: a fragment holding two elements is one child, so pass an array. React Native has no counterpart for either value — a native list has no accessibility role to claim — so a navigation region there is Landmark and a list is a plain View whose rows carry their own semantics.'
      platforms: [web, lit]
  styles:
    gap: { token: 'layout.gap.{gap}', description: '`gap: none` resolves `layout.gap.none`, a real token that is zero, and makes `overrides.gap` a no-op, per the presence rule. It is read as a token on every platform — none of them writes a bare 0.' }
  a11y:
    role: none
    requires: []
  platforms:
    web:
      element: div
      attributes: []
      notes: 'Flexbox. `gap` maps to the CSS gap property with the layout.gap token; no margins on children. The root is the `container` part; the `li` wrappers for `ul`/`ol` are the `item` part. Stack merges a consumer `className` and `style` onto the root, as Box and Text do, because composites give it layout-only classes.'
    lit:
      tag: ds-stack
      reflect: [direction, gap, align, justify, wrap]
      notes: 'The host is the flex container (`:host { display: flex }`) with a default slot, so children stay in the light DOM and keep their own semantics. The host is the `container` part and carries no `part` attribute, since a host cannot; for `ul`/`ol` the shadow root renders the list and one `li` per child, each `display: contents` and marked `part="item"`. Keep the light DOM where it is: use manual slot assignment and rebuild the wrappers from a childList observer rather than moving children into them, which would re-fire slotchange forever.'
    rn:
      element: View
      props: [style]
      notes: Flexbox with `gap` (RN ≥ 0.71). Children are not wrapped. `element` is not applicable; use `accessibilityRole` on the content instead.
    swiftui:
      element: VStack
      props: [HStack, spacing, alignment, .frame, ViewThatFits, .accessibilityElement=contain]
      notes: '`VStack`/`HStack` with `spacing` from the gap token and `alignment` from `align`; `wrap` uses a `Layout`-conforming `FlowLayout` in `Support/` (SwiftUI has no flex-wrap). There is no `responsive` direction and no `divider` prop — the two the notes used to describe were never in `props`, and a row that becomes a column is two Stacks the caller chooses between.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: nav-element-is-a-navigation-landmark
      description: 'Choose element when the group has meaning - nav for navigation - so the structure is exposed to assistive technology.'
      given: { element: nav }
      then:
        - { role: navigation, platforms: [web, lit] }
    - name: list-element-is-a-list
      description: 'For ul, each child is wrapped in an li, so assistive technology announces the group as a list and counts its items.'
      given: { element: ul }
      then:
        - { role: list, platforms: [web, lit] }
  examples:
    - name: form-fields
      description: The usual vertical rhythm between fields in a form.
      given: { direction: vertical, gap: normal, children: 'The form fields' }
    - name: button-row
      description: A row of actions at the end of a form or card, tightly spaced and pushed to the end.
      given: { direction: horizontal, gap: tight, justify: end, children: 'A submit Button and a Cancel Button' }
    - name: page-sections
      description: The section rhythm between the regions of a page.
      given: { direction: vertical, gap: section, children: 'The regions of the page' }
    - name: wrapping-filters
      description: A horizontal group that reflows onto new lines on narrow viewports instead of overflowing.
      given: { direction: horizontal, gap: tight, wrap: true, children: 'A row of filters' }
---

Stack is how things get spaced. Instead of margins on individual components, a Stack owns the gap between its children, using one of the theme's rhythm presets (`layout.gap.*`) rather than a raw number, so a theme with `layout.rhythm: loose` opens up every screen at once. Almost every screen is stacks inside stacks.

## When to use

Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is exposed to assistive technology.

## When not to use

Do not use Stack for two-dimensional layouts (use Grid, planned) or for positioning a single element (use spacing tokens on the parent). Do not set gaps between children by adding margins to the children; that defeats the purpose.

A wrapped Stack is not a card grid, and `wrap` should not be asked to be one. Flex items are sized by their content, so a row of four prose cards shrinks toward its longest word and never reaches the width where it would break: at phone width the four render as four one-word columns. The missing piece is a preferred item width, which is a property of the item, and Stack has no per-item prop, no `columns` and no `itemBasis` — and should not grow one. The answer is the planned Grid (`minItemWidth`, `gap`, one `repeat(auto-fit, minmax(…))` rule), which also fixes the ragged last row a flex wrap leaves. Until it exists, a page that needs the shape sets `flex` on the children from its own stylesheet and says so. The same section wants a token for "the narrowest a card of prose should be", which the scale does not have: a `layout.column.*` group beside `layout.maxWidth.*` would let Grid state its minimum in tokens like every other layout decision.

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
