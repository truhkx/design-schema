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
      description: 'Any content. Box does not space its children; put a Stack inside for that. A string given as `children` in an example is wrapped in the system Text by its story on every platform (`<ds-text>` on Lit, where slotted content cannot be an arg). The Default story uses the `highlighted-panel` props, since a Box at its schema defaults draws nothing.'
    inset:
      type: enum
      values: [none, sm, md, lg, xl]
      default: none
      description: Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ.
    insetBlock:
      type: enum
      values: [none, sm, md, lg, xl]
      description: 'Vertical padding, overriding `inset` on that axis. It has no default: unset means `inset` applies, which keeps an explicit `none` distinct from an absent value.'
    insetInline:
      type: enum
      values: [none, sm, md, lg, xl]
      description: 'Horizontal padding, overriding `inset` on that axis. Unset means `inset` applies, as with insetBlock.'
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
      description: 'Element to render. Sectioning elements only when the box is a semantic region; prefer Landmark for page regions. There is no native counterpart, so a screen that ports to React Native uses Landmark for the region instead of this prop.'
      platforms: [web, lit]
  styles:
    paddingBlock: { token: 'layout.inset.{inset}', description: 'An override applies at every value including `none`: `layout.inset.none` is a real token (a zero), not an absent part, so padding is not one of the bindings presence gates.' }
    paddingInline: { token: 'layout.inset.{inset}' }
    background: { token: 'color.background.{surface}', description: '`none` renders the literal transparent, not a token, written out explicitly (`background-color: transparent`) and not read through the hook, so neither `overrides.background` nor consumer CSS on `--ds-box-background` paints a `none` box; the token binding covers the other three values. Interpolated bindings like this one are locked — they keep their `--ds-box-*` hook, which is the consumer''s own-CSS escape hatch, but they are not members of the overrides type.' }
    border: { token: color.border, description: 'The border colour. It shares a name with the `border` boolean, which decides presence: an override recolours the border and never brings one into existence.' }
    borderWidth: { token: border.width.thin }
    radius: { token: 'radius.{radius}', description: '`radius: none` resolves `radius.none` and is written out, rather than leaving the property unset — every binding is applied explicitly, with no cascade. Unlike padding, radius is presence-gated: `none` means no rounded corners, so `overrides.radius` is ignored at `none` and applies at every other value.' }
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
      notes: 'A plain element with classes for each enum value; `surface: none` paints `transparent` and reads no hook. insetBlock/insetInline modifiers win over inset. No margin, ever. The root is the `surface` part and carries `data-part="surface"`, written before `...rest` so a composing parent can relabel it (Popover and BottomSheet pass `data-part="body"`). Box is the one primitive that merges a consumer `className` and `style` onto the root instead of dropping them, as Text does, because those same composites give it a layout-only class. Props are typed against `div` for every `element` value; Box is not polymorphic, and the ref is `Ref<HTMLElement>`.'
    lit:
      tag: ds-box
      reflect: [inset, inset-block, inset-inline, surface, border, radius]
      notes: 'The host is the box (`:host { display: block }`) with a default slot, so children stay in the light DOM. The host is also the `surface` part: it carries `data-part="surface"` alongside `data-ds`, and there is no `::part`, since `:host` cannot take one. `element` swaps nothing in the shadow root — the host is the element, so `element` is accepted for API parity (set by attribute or property, not reflected) and sets a plain `role` attribute on the host — not ElementInternals, which the accessible-role tests cannot read — only where the implicit role does not depend on ancestry: article, aside → complementary, main, nav → navigation. `div`, `section`, `header` and `footer` set no role, because a native `<header>` or `<footer>` is only a banner or contentinfo outside sectioning content and the element cannot see where it sits; a page-level banner is Landmark.'
    rn:
      element: View
      props: []
      notes: 'View with paddingVertical/paddingHorizontal, backgroundColor, borderWidth/borderColor, borderRadius from the token object. `element` does not apply — use Landmark for a region. The root view is both the component and its only part, so it carries `testID="Box"` and there is no `Box.surface`: when a component''s single anatomy part is the root, the root form wins. A string given as `children` in an example is illustrative; native requires it inside a Text. Resolved overrides are cast to the binding''s own type: number for padding, width and radius, string for the border colour.'
    swiftui:
      element: VStack
      props: [.padding, .background, .overlay=border, .clipShape, .frame=maxWidth, .accessibilityElement=contain]
      notes: 'A layout container: `padding` from the inset token on all edges, `.background(RoundedRectangle)` in the surface color (nothing for `none`), a stroked overlay for `border`, `.clipShape` for radius. Children are laid out by the caller''s stack; Box itself is a single-child wrapper (`VStack(spacing: 0)`) and never spaces siblings. No accessibility semantics unless the doc says the role is a landmark (then see Landmark).'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: nav-element-carries-navigation-semantics
      description: 'When element is article, aside, main or nav, the element carries that semantics on web and the host role carries it on Lit; Box adds no role of its own otherwise.'
      given: { element: nav }
      then:
        - { role: navigation, platforms: [web, lit] }
    - name: article-element-carries-article-semantics
      description: The same rule for the other sectioning values - the element is the semantics, and Box adds nothing else.
      given: { element: article }
      then:
        - { role: article, platforms: [web, lit] }
  examples:
    - name: highlighted-panel
      description: A panel lifted off the page with a tinted surface, rounded corners and the usual inset.
      given: { children: 'A panel of settings', inset: md, surface: subtle, radius: md }
    - name: bordered-row
      description: A dense row bounded by a thin border rather than a fill.
      given: { children: 'A row of data', inset: sm, border: true }
    - name: hero-band
      description: A full-width band with more vertical than horizontal padding, on the strongest surface.
      given: { children: 'A hero band', insetBlock: xl, insetInline: lg, surface: strong }
    - name: navigation-region
      description: A padded region whose element makes it a navigation landmark on web.
      given: { children: 'The sidebar links', element: nav, inset: md }
      platforms: [web, lit]
---

Box is the thing you reach for when a group of content needs a surface: padding around it, a background under it, a border, rounded corners. It has no opinions about what is inside and no spacing between its children — that is Stack's job — so the two compose without overlap: a Box for the inset, a Stack for the gaps.

## When to use

Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md` for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's rhythm decide the numbers.

## When not to use

Do not use a Box to add space between two components; put them in a Stack. Do not use it as a page container; Container owns gutters and measure. Do not nest surfaces more than two deep (`subtle` on `default`, `strong` on `subtle`) — a third level reads as clutter and the contrast math is only checked two deep. Do not use `surface` to signal status; that is Alert's tinted background.

## Behavior

Box renders its children in a block with the requested padding, background, border and radius, and nothing else. It adds no role of its own (`a11y.role: none`); on web the native element carries whatever semantics it has, which for `section`, `header` and `footer` depends on naming and ancestry as it does in plain HTML, and Lit sets an ElementInternals role only for the values whose role is unconditional (see the platform note). It never scrolls, never clips (`radius` does not imply `overflow: hidden`; a child that should be clipped clips itself), and never carries margin. `insetBlock` and `insetInline` override `inset` per axis. `surface: none` paints transparent, so the parent's background shows through.

## Content guidelines

None; Box has no text of its own.

## Accessibility

Box is invisible to assistive technology unless `element` gives it a sectioning role, in which case Landmark is usually the right component instead. Text on a `subtle` or `strong` surface must remain readable: the build checks body, muted and link foreground against both surfaces in both modes (WCAG 1.4.3), which is what makes "two levels deep" a safe rule rather than a hope. Box itself sets no foreground and establishes no colour context for its children, so these pairs are a guarantee about the tokens, not something the component implements or can enforce at runtime. A border, when present, is decorative; nothing relies on it to identify content (1.4.11 does not apply).

## Platform notes

### Web
Render the `element` with classes `ds-box`, `ds-box--inset-{value}`, `ds-box--inset-block-{value}`, `ds-box--inset-inline-{value}`, `ds-box--surface-{value}`, `ds-box--border`, `ds-box--radius-{value}`. Padding uses logical properties (`padding-block`, `padding-inline`). Axis modifiers are declared after the all-sides modifier so they win.

### Lit
`<ds-box inset="md" surface="subtle" radius="md">`. The host is the box; `:host` carries the padding, background, border and radius from reflected attributes (`:host([inset="md"])`). Children are slotted. `element` maps to a plain `role` attribute on the host for the values whose role is unconditional and is otherwise inert.

### React Native
`View` with `paddingVertical`/`paddingHorizontal` from `layout.inset.*`, `backgroundColor` from `color.background.*` (undefined for `none`), `borderWidth`/`borderColor` when `border`, `borderRadius` from `radius.*`. No `element`.

## Related

Stack, Card, Container, Landmark.
