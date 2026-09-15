---
title: Box
description: The surface primitive. A block with token-valued padding, background, border and radius — the only way a layout gets a background or an inset without a component of its own.
component:
  name: Box
  category: layout
  status: review
  anatomy: [surface]
  props:
    children:
      type: content
      required: true
      description: Any content. Box does not space its children; put a Stack inside for that.
    inset:
      type: enum
      values: [none, sm, md, lg, xl]
      default: none
      description: Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ.
    insetBlock:
      type: enum
      values: [none, sm, md, lg, xl]
      description: Vertical padding, overriding `inset` on that axis. Defaults to `inset`.
    insetInline:
      type: enum
      values: [none, sm, md, lg, xl]
      description: Horizontal padding, overriding `inset` on that axis. Defaults to `inset`.
    surface:
      type: enum
      values: [none, default, subtle, strong]
      default: none
      description: 'Background. `none` is transparent; `default` is the page background (use to lift content off a subtle parent); `subtle` and `strong` step up.'
    border:
      type: boolean
      default: false
      description: A thin default border.
    radius:
      type: enum
      values: [none, sm, md, lg, full]
      default: none
      description: Corner radius from the theme's presets.
    element:
      type: enum
      values: [div, section, article, aside, header, footer, main, nav]
      default: div
      description: Element to render. Sectioning elements only when the box is a semantic region; prefer Landmark for page regions.
      platforms: [web, lit]
  styles:
    paddingBlock: { token: 'layout.inset.{inset}' }
    paddingInline: { token: 'layout.inset.{inset}' }
    background: { token: 'color.background.{surface}', description: '`none` renders transparent; the token binding covers the other three values.' }
    border: { token: color.border }
    borderWidth: { token: border.width.thin }
    radius: { token: 'radius.{radius}' }
  a11y:
    role: none
    requires: [contrast-aa]
    contrast:
      - { foreground: color.foreground, background: color.background.subtle, level: AA }
      - { foreground: color.foreground, background: color.background.strong, level: AA }
      - { foreground: color.foreground.muted, background: color.background.subtle, level: AA }
      - { foreground: color.foreground.muted, background: color.background.strong, level: AA }
      - { foreground: color.link, background: color.background.subtle, level: AA }
      - { foreground: color.link, background: color.background.strong, level: AA }
  platforms:
    web:
      element: div
      attributes: []
      notes: 'A plain element with classes for each enum value; `surface: none` sets no background. insetBlock/insetInline modifiers win over inset. No margin, ever.'
    lit:
      tag: ds-box
      reflect: [inset, inset-block, inset-inline, surface, border, radius]
      notes: 'The host is the box (`:host { display: block }`) with a default slot, so children stay in the light DOM. `element` swaps nothing in the shadow root — the host is the element, so `element` is accepted for API parity and sets `role` via ElementInternals only for sectioning values (article, aside, header, footer, main, nav map to their implicit roles; div and section set none).'
    rn:
      element: View
      props: []
      notes: 'View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor, borderRadius from the token object. `element` does not apply.'
    swiftui:
      element: VStack
      props: [.padding, .background, .overlay=border, .clipShape, .frame=maxWidth, .accessibilityElement=contain]
      notes: 'A layout container: `padding` from the inset token on all edges, `.background(RoundedRectangle)` in the surface color (nothing for `none`), a stroked overlay for `border`, `.clipShape` for radius. Children are laid out by the caller''s stack; Box itself is a single-child wrapper (`VStack(spacing: 0)`) and never spaces siblings. No accessibility semantics unless the doc says the role is a landmark (then see Landmark).'
---

Box is the thing you reach for when a group of content needs a surface: padding around it, a background under it, a border, rounded corners. It has no opinions about what is inside and no spacing between its children — that is Stack's job — so the two compose without overlap: a Box for the inset, a Stack for the gaps.

## When to use

Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md` for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's rhythm decide the numbers.

## When not to use

Do not use a Box to add space between two components; put them in a Stack. Do not use it as a page container; Container owns gutters and measure. Do not nest surfaces more than two deep (`subtle` on `default`, `strong` on `subtle`) — a third level reads as clutter and the contrast math is only checked two deep. Do not use `surface` to signal status; that is Alert's tinted background.

## Behavior

Box renders its children in a block with the requested padding, background, border and radius, and nothing else. It adds no role of its own (`a11y.role: none`); when `element` is `section`, `article`, `aside` or `nav`, the native element carries that semantics on web, and Lit sets the matching ElementInternals role. It never scrolls, never clips (`radius` does not imply `overflow: hidden`; a child that should be clipped clips itself), and never carries margin. `insetBlock` and `insetInline` override `inset` per axis. `surface: none` sets no background at all, so the parent's shows through.

## Content guidelines

None; Box has no text of its own.

## Accessibility

Box is invisible to assistive technology unless `element` gives it a sectioning role, in which case Landmark is usually the right component instead. Text on a `subtle` or `strong` surface must remain readable: the build checks body, muted and link foreground against both surfaces in both modes (WCAG 1.4.3), which is what makes "two levels deep" a safe rule rather than a hope. A border, when present, is decorative; nothing relies on it to identify content (1.4.11 does not apply).

## Platform notes

### Web
Render the `element` with classes `ds-box`, `ds-box--inset-{value}`, `ds-box--inset-block-{value}`, `ds-box--inset-inline-{value}`, `ds-box--surface-{value}`, `ds-box--border`, `ds-box--radius-{value}`. Padding uses logical properties (`padding-block`, `padding-inline`). Axis modifiers are declared after the all-sides modifier so they win.

### Lit
`<ds-box inset="md" surface="subtle" radius="md">`. The host is the box; `:host` carries the padding, background, border and radius from reflected attributes (`:host([inset="md"])`). Children are slotted. `element` maps to a role on the host through `ElementInternals` for the sectioning values and is otherwise inert.

### React Native
`View` with `paddingVertical`/`paddingHorizontal` from `layout.inset.*`, `backgroundColor` from `color.background.*` (undefined for `none`), `borderWidth`/`borderColor` when `border`, `borderRadius` from `radius.*`. No `element`.

## Related

Stack, Card, Container, Landmark.
