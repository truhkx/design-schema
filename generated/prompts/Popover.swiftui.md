# Generate: Popover for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Popover.swift` declaring `public struct Popover: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/PopoverBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Popover.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Popover") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Popover")` on the root and `"Popover.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

## Component schema

```yaml
component:
  name: Popover
  category: overlay
  status: review
  apg: disclosure
  anatomy:
  - trigger
  - panel
  - focusScope
  - heading
  - body
  - closeButton
  - arrow
  composition:
    focusScope: FocusScope
    heading: Heading
    closeButton: Button
    body: Box
  parts:
    trigger:
      kind: slot
      slot:
        prop: trigger
        required: true
  props:
    trigger:
      type: content
      required: true
      description: Exactly one focusable element — usually a Button — that opens the
        popover; typed as a single element, since it is cloned with aria-expanded/aria-controls
        (Button's `expanded` prop on native) and the toggle handler.
    children:
      type: content
      required: true
      description: The panel content. May contain controls, links and a short Form;
        keep it to what fits without scrolling.
    heading:
      type: string
      description: Optional heading at the top of the panel, also the accessible name.
        Without it, the panel is named by the trigger.
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '3'
      description: Heading level of the panel heading, so it fits the page outline
        (a popover usually sits under a level-2 section).
    open:
      type: boolean
      description: Controlled open state. Omit for uncontrolled (the trigger toggles
        it).
      controls:
        event: onOpenChange
        state: open
    placement:
      type: enum
      values:
      - bottom-start
      - bottom
      - bottom-end
      - top-start
      - top
      - top-end
      - start
      - end
      default: bottom
      description: 'Preferred side and alignment; flips and shifts to stay in the
        viewport. All eight values are logical: `start`/`end` and the `-start`/`-end`
        alignments mirror in right-to-left writing (the same rule as Tooltip and Menu).'
    modal:
      type: boolean
      default: false
      description: 'False (default): the page stays interactive; clicking outside
        closes; focus moves in but is not trapped, and Tab out closes. True: behaves
        as a small Dialog anchored to the trigger — focus trapped, background inert
        — for content that must be finished (a required form).'
    showArrow:
      type: boolean
      default: false
      description: A small pointer toward the trigger. Off by default; Calm & precise
        prefers a plain edge.
    dismissible:
      type: boolean
      default: true
      description: Show the close button. Escape and outside click work regardless
        (non-modal).
  events:
    onOpenChange:
      description: 'Fired when the popover opens or closes, with the new state and
        a reason: `trigger`, `escape`, `outside`, `close-button`, `tab-out`.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the popover.
      - name: reason
        type: enum
        values:
        - trigger
        - escape
        - outside
        - close-button
        - tab-out
      reasons:
        trigger: the trigger was activated
        escape: Escape pressed while open
        outside: a pointer press landed outside the popover
        close-button: the close button was activated
        tab-out: Tab moved focus past the end of the popover
      fires:
      - user
      timing:
        phase: after-change
  keyboard:
  - keys:
    - Enter
    - ' '
    action: Toggles the popover from the trigger.
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes and returns focus to the trigger.
    when: open
    from: inside
    expect:
    - closes
    - focus-trigger
  - keys:
    - Tab
    action: 'Non-modal: after the last element in the panel, closes and moves focus
      to the element after the trigger. Modal: wraps within the panel.'
    when: open
    from: last
    given:
      modal: false
    expect: closes
  - keys:
    - Shift+Tab
    action: 'Non-modal: from the first element in the panel, returns focus to the
      trigger and closes.'
    when: open
    from: first
    expect:
    - focus-trigger
    - closes
  styles:
    surface:
      token: color.overlay.surface
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.md
      locked: false
    inset:
      token: layout.inset.md
      locked: false
    partGap:
      token: layout.gap.normal
      description: Between heading and body.
      locked: false
    offset:
      token: space.2
      description: Gap between trigger and panel.
      locked: false
    arrowSize:
      token: space.2
      part: arrow
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      locked: false
    layer:
      token: layer.dropdown
      locked: false
    enter:
      token: motion.duration.fast
      description: Fade and a space.1 slide from the trigger side; instant under reduced
        motion.
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    closeLabel: Close
  overlay:
    layer: popover
    anchor: trigger
    placement: placement
    collision: flip-shift
    open: open
    closeEvent: onOpenChange
    dismiss:
    - escape
    - outside-press
    - close-button
    - focus-out
    modal: false
  a11y:
    role: dialog
    requires:
    - accessible-name
    - expanded-state
    - escape-dismiss
    - focus-restore
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.link
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=dialog
      - aria-labelledby
      - aria-modal
      - aria-expanded
      - aria-controls
      notes: 'The trigger is cloned with aria-expanded and aria-controls. The panel
        is <div role="dialog" aria-labelledby={heading or trigger}> rendered through
        a portal with position: fixed from the trigger rect (flip and shift to stay
        within the viewport, repositioned on scroll/resize), on layer.dropdown, wrapped
        in FocusScope (trapped only when modal; autoFocus first). Non-modal: a document
        pointerdown outside panel+trigger closes; focusout to outside closes; Tab
        past the last element closes and lets focus continue. Modal: uses a native
        <dialog> with showModal() positioned at the trigger. Use the Popover API (popover="manual")
        where available for top-layer rendering. Non-modal popovers never lock page
        scroll and use only the pointerdown-outside listener for dismissal (Tab/Shift+Tab
        handlers own the keyboard exits; no focusout listener). The arrow, when shown,
        is centered on the panel edge, not on the trigger.'
    lit:
      tag: ds-popover
      reflect:
      - open
      - placement
      - modal
      - show-arrow
      - prop: dismissible
        attribute: no-dismiss
      - heading-level
      notes: 'Slots: `trigger` and default. The panel renders in the shadow root with
        the Popover API (top layer, no z-index issues) or a fixed fallback. aria-controls
        cannot cross the shadow boundary, so aria-expanded is set on the slotted trigger
        and the panel is named by `heading` (aria-label) or the trigger''s text copied
        into aria-label. Composed `open-change`.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      notes: 'Phones: a BottomSheet with height content (a floating panel over a phone
        page is hard to dismiss and easy to lose). Tablets and react-native-web: a
        transparent Modal with the panel positioned from measureInWindow() of the
        trigger and a backdrop Pressable that closes. modal=true adds a scrim.'
    swiftui:
      element: popover
      props:
      - .popover
      - attachmentAnchor
      - arrowEdge
      - .presentationCompactAdaptation
      - FocusScope
      - .onExitCommand
      notes: '`.popover(isPresented:attachmentAnchor:arrowEdge:)` with `.presentationCompactAdaptation(.popover)`
        so a phone shows a real popover, not a sheet; `placement` maps to `arrowEdge`.
        `modal` composes FocusScope with `trap`; non-modal popovers leave focus with
        the trigger and close on outside tap (system behavior). The panel is the package
        surface with `color.overlay.surface` through `.presentationBackground`. Heading
        names the panel.'
  behavior:
  - name: close-button-fires-on-open-change
    description: The close button reports the close; the consumer owns `open` when
      it is controlled.
    given:
      open: true
    when:
      click: closeButton
    then:
    - event: onOpenChange
  - name: escape-closes-a-modal-popover
    description: A modal popover is a small Dialog — Escape and the close button are
      the only ways out, and Escape always works (keyboard rule 2).
    given:
      open: true
      modal: true
    when:
      key: Escape
    then:
    - event: onOpenChange
    platforms:
    - web
    - lit
  - name: the-panel-is-named-by-its-heading
    description: With a heading the panel is a dialog named by it rather than by the
      trigger.
    given:
      open: true
      heading: Filters
    then:
    - name: Filters
  examples:
  - name: filter-panel
    description: A compact panel of controls behind a Filters button, aligned to the
      start of the trigger.
    given:
      trigger: A Filters Button
      children: A Form of filter controls
      heading: Filters
      placement: bottom-start
  - name: date-picker-panel
    description: A picker anchored under a date field, the case the panel exists for.
    given:
      trigger: A date field Button showing the current date
      children: A DatePicker calendar
  - name: required-step
    description: A short form that must be submitted or cancelled, so the panel traps
      focus like a Dialog.
    given:
      trigger: An Add member Button
      children: An email Input and a Save Button
      heading: Add member
      modal: true
  - name: contextual-help
    description: A help note with a link, pointed at its trigger.
    given:
      trigger: An icon-only help Button
      children: One sentence of help ending in a Link to the guide
      showArrow: true
      placement: end
```

## Events

- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `open: boolean`, `reason: 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out'`
  - reasons: `trigger` (the trigger was activated); `escape` (Escape pressed while open); `outside` (a pointer press landed outside the popover); `close-button` (the close button was activated); `tab-out` (Tab moved focus past the end of the popover)
  - fires on: user
  - timing: after-change

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`

## Parts and slots

- `trigger`: slot, `@ViewBuilder` parameter `trigger`, required
- `panel`: element
- `focusScope`: component `FocusScope`
- `heading`: component `Heading`
- `body`: component `Box`
- `closeButton`: component `Button`
- `arrow`: element

## Style bindings

- `arrowSize`: token `space.2`; part `arrow`

## Keyboard

- `Escape` (Closes and returns focus to the trigger.): expect closes, then focus-trigger
- `Tab` (Non-modal: after the last element in the panel, closes and moves focus to the element after the trigger. Modal: wraps within the panel.): expect closes; given `modal: false`
- `Shift+Tab` (Non-modal: from the first element in the panel, returns focus to the trigger and closes.): expect focus-trigger, then closes

## Form and overlay

```yaml
overlay:
  layer: popover
  anchor: trigger
  placement: placement
  collision: flip-shift
  open: open
  closeEvent: onOpenChange
  dismiss:
  - escape
  - outside-press
  - close-button
  - focus-out
  modal: false
```

`overlay.closeEvent` emits `onOpenChange`.

## Constants and examples

- example `filter-panel`, story `FilterPanel`: given `trigger: "A Filters Button"`, `children: "A Form of filter controls"`, `heading: "Filters"`, `placement: "bottom-start"`; A compact panel of controls behind a Filters button, aligned to the start of the trigger.
- example `date-picker-panel`, story `DatePickerPanel`: given `trigger: "A date field Button showing the current date"`, `children: "A DatePicker calendar"`; A picker anchored under a date field, the case the panel exists for.
- example `required-step`, story `RequiredStep`: given `trigger: "An Add member Button"`, `children: "An email Input and a Save Button"`, `heading: "Add member"`, `modal: true`; A short form that must be submitted or cancelled, so the panel traps focus like a Dialog.
- example `contextual-help`, story `ContextualHelp`: given `trigger: "An icon-only help Button"`, `children: "One sentence of help ending in a Link to the guide"`, `showArrow: true`, `placement: "end"`; A help note with a link, pointed at its trigger.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `offset`, `arrowSize`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: popover
props:
- .popover
- attachmentAnchor
- arrowEdge
- .presentationCompactAdaptation
- FocusScope
- .onExitCommand
notes: '`.popover(isPresented:attachmentAnchor:arrowEdge:)` with `.presentationCompactAdaptation(.popover)`
  so a phone shows a real popover, not a sheet; `placement` maps to `arrowEdge`. `modal`
  composes FocusScope with `trap`; non-modal popovers leave focus with the trigger
  and close on outside tap (system behavior). The panel is the package surface with
  `color.overlay.surface` through `.presentationBackground`. Heading names the panel.'
```

## Guidance

## Overview

A popover is a small panel that appears next to the thing you clicked and stays out of the way of everything else. It is for content that needs interaction but not the whole screen: pick a date, choose a color, adjust two settings, read a help note with a link. Unlike a Tooltip it can contain controls; unlike a Dialog it does not take over the page.

## When to use

Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date field, a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help with a link. Use `modal` when the panel contains a required step (a short form that must be submitted or cancelled). Use `heading` when the content is not obvious from the trigger.

## When not to use

Do not use a Popover for text-only hints (Tooltip), for a list of actions (Menu), for a list of options (Select/Combobox), or for anything that needs more than a small panel's worth of content or must be completed before continuing (Dialog). Do not nest popovers. Do not open one on hover.

## Behavior

The trigger toggles the popover; opening positions the panel at `placement`, flipping or shifting to stay in view, moves focus to the first control (or the heading, if there are none), and marks the trigger expanded. Non-modal: the page stays live; Escape, the close button, a click outside, and tabbing past the last element close it; Shift+Tab from the first element returns to the trigger and closes. Modal: the panel is a small Dialog — trapped focus, inert page, Escape and close only. Closing returns focus to the trigger. The panel repositions on scroll and resize while open.

## Content guidelines

Headings are short noun phrases naming the panel's purpose ("Filters", "Pick a color"). Content fits without scrolling; a popover that scrolls is a Dialog or a page. Keep one primary action, placed last.

## Accessibility

The panel is a `dialog` named by its heading or trigger, and the trigger exposes `aria-expanded` and `aria-controls` (WCAG 4.1.2; APG non-modal dialog guidance). Focus moves in on open and back to the trigger on close (2.4.3); Escape always closes (2.1.2). Non-modal popovers do not trap focus — Tab leaves them — so keyboard users are never stuck, and modal ones use FocusScope with the inert page like Dialog. Contrast on the overlay surface is checked in both modes; motion respects reduced-motion; the close button meets 24px.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls={panelId}` and an `onClick` toggle. Render the panel through a portal: `<div role="dialog" id aria-labelledby>` with `position: fixed`, computed from the trigger's rect for `placement` (flip when overflowing, shift along the cross axis), `z-index: var(--layer-dropdown)`, `max-inline-size` from the token, wrapped in `FocusScope trapped={modal} autoFocus="first" restoreFocus`. Non-modal: `pointerdown` on document outside panel and trigger closes; `focusout` whose `relatedTarget` is outside closes; keydown Tab on the last focusable element closes and lets focus continue; Shift+Tab on the first focuses the trigger and closes. Modal: render inside a `<dialog>` opened with `showModal()` and positioned at the trigger. Optional arrow as a rotated square `<span aria-hidden>` on the trigger side.

### Lit
`<ds-popover placement="bottom-start"><ds-button slot="trigger" label="Filters"></ds-button><div>…</div></ds-popover>`; the panel uses `popover="manual"` and `showPopover()` with fixed positioning as fallback; composes `<ds-focus-scope>`, `<ds-heading>`, `<ds-button>`; composed `open-change`.

### React Native
Phones: render `BottomSheet` with `height="content"`, `title={heading ?? trigger label}`. Tablets / react-native-web: a transparent `Modal` whose backdrop `Pressable` closes and whose panel `View` is positioned from `measureInWindow()`, wrapped in `FocusScope`. The trigger `Button` gets `accessibilityState={{ expanded }}`.

## Related

Tooltip, Dialog, Menu, BottomSheet, FocusScope.

## Behavior scenarios (16)

One test per scenario, in this order.

```yaml
- name: close-button-fires-on-open-change
  description: The close button reports the close; the consumer owns `open` when it
    is controlled.
  given:
    open: true
  when:
    click: closeButton
  then:
  - event: onOpenChange
- name: the-panel-is-named-by-its-heading
  description: With a heading the panel is a dialog named by it rather than by the
    trigger.
  given:
    open: true
    heading: Filters
  then:
  - name: Filters
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-start
  given:
    placement: bottom-start
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom
  given:
    placement: bottom
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-end
  given:
    placement: bottom-end
  then:
  - renders: true
  derived: true
- name: renders-placement-top-start
  given:
    placement: top-start
  then:
  - renders: true
  derived: true
- name: renders-placement-top
  given:
    placement: top
  then:
  - renders: true
  derived: true
- name: renders-placement-top-end
  given:
    placement: top-end
  then:
  - renders: true
  derived: true
- name: renders-placement-start
  given:
    placement: start
  then:
  - renders: true
  derived: true
- name: renders-placement-end
  given:
    placement: end
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: escape-fires-on-open-change
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
