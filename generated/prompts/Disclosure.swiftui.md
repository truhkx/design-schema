# Generate: Disclosure for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Disclosure.swift` declaring `public struct Disclosure: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/DisclosureBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Disclosure.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Disclosure") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Disclosure")` on the root and `"Disclosure.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Disclosure
  category: container
  status: review
  apg: disclosure
  anatomy:
  - trigger
  - triggerIcon
  - panel
  props:
    summary:
      type: string
      required: true
      a11yRole: accessible-name
      description: The trigger's label. Also the trigger's accessible name. Says what
        will be revealed.
    children:
      type: content
      required: true
      description: The content of the panel. Rendered only while open (not merely
        hidden), so heavy content is not laid out until asked for.
    open:
      type: boolean
      description: Controlled open state. Omit for an uncontrolled disclosure.
      controls:
        event: onToggle
        default: defaultOpen
        state: open
    defaultOpen:
      type: boolean
      default: false
      description: Initial state for an uncontrolled disclosure.
    disabled:
      type: boolean
      default: false
      description: The trigger cannot be activated. Stays focusable and is announced
        as disabled; the panel keeps its current state.
    keepMounted:
      type: boolean
      default: false
      description: Keep the panel in the tree while closed (hidden, not unmounted).
        Required when the panel contains form fields, so the Form still collects them
        while the disclosure is closed.
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      description: When set, the trigger is wrapped in a heading of this level so
        the disclosure appears in the document outline — use for FAQ and accordion
        sections.
  events:
    onToggle:
      description: 'Fired after the state changes, with the new boolean `open` and
        a reason: `pointer`, `keyboard`, or `controlled` (Accordion relies on it).
        Web and Lit read the activation method from the native click (`event.detail
        === 0` means keyboard); Pressable reports nothing of the kind, so native always
        says `pointer` and Accordion derives its own reasons there.'
      platforms:
        web: onToggle
        lit: toggle
        rn: onToggle
        swiftui: onToggle
      payload:
      - name: open
        type: boolean
        description: The new state.
      - name: reason
        type: enum
        values:
        - pointer
        - keyboard
        - controlled
      reasons:
        pointer: the trigger was clicked or tapped
        keyboard: Enter or Space on the trigger
        controlled: the consumer changed the open prop
      fires:
      - user
      - controlled
      timing:
        phase: after-change
  styles:
    triggerColor:
      token: color.foreground
      part: trigger
      locked: true
    triggerBackgroundHover:
      token: color.background.subtle
      part: trigger
      state: hover
      description: Pointer hover and pressed state of the trigger.
      locked: true
    triggerPaddingBlock:
      token: space.sm
      part: trigger
      locked: false
    triggerPaddingInline:
      token: space.sm
      part: trigger
      locked: false
    triggerGap:
      token: space.2
      part: trigger
      description: Gap between icon and summary.
      locked: false
    triggerFontFamily:
      token: font.family.body
      part: trigger
      locked: false
    triggerFontSize:
      token: font.size.md
      part: trigger
      locked: false
    triggerFontWeight:
      token: font.weight.medium
      part: trigger
      locked: false
    triggerRadius:
      token: radius.md
      part: trigger
      locked: false
    icon:
      token: color.foreground.muted
      description: The chevron is `Icon name="chevron-right" inline` rotated 90° when
        open, so it follows the trigger's font size (including a `triggerFontSize`
        override). Mirrored in right-to-left writing on every platform (`[dir=rtl]`
        on web; `I18nManager.isRTL` → `chevron-left` on native).
      locked: true
    panelPaddingBlock:
      token: space.sm
      part: panel
      locked: false
    panelPaddingInline:
      token: space.sm
      part: panel
      locked: false
    panelColor:
      token: color.foreground
      part: panel
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    minTarget:
      token: size.target.min
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.base
      description: Chevron rotation, with motion.easing.standard; instant under reduced
        motion. The panel itself does not animate height.
      locked: false
  copy:
    expanded: Expanded
    collapsed: Collapsed
  a11y:
    role: button
    requires:
    - accessible-name
    - expanded-state
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    - reduced-motion
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - type=button
      - aria-expanded
      - aria-controls
      - aria-disabled
      - hidden
      notes: A wrapping <div> (so the optional heading and the panel are siblings)
        containing a native <button aria-expanded aria-controls> and a panel <div
        id> rendered only while open (or `hidden` while closed with keepMounted);
        aria-controls is set only while the panel exists — the APG pattern rather
        than <details>, so the state is controllable, the trigger can sit inside a
        heading, and the panel can be unmounted. Chevron is an inline SVG with aria-hidden.
    lit:
      tag: ds-disclosure
      reflect:
      - open
      - disabled
      - keep-mounted
      notes: Shadow root with delegatesFocus; the summary is a property, the panel
        content is the default slot, and the slot is rendered only while open (with
        keep-mounted the slot is always rendered and its wrapper gets `hidden` while
        closed). Light-DOM children exist either way, so ds-form skips fields inside
        a closed ds-disclosure that lacks keep-mounted, matching the other platforms.
        `toggle` is a composed CustomEvent with detail { open }. `open` is reflected
        so it can be styled and set from markup; the resolved state is readable as
        `currentOpen` (ds-form reads `currentOpen` and `keepMounted` to skip hidden
        fields); `heading-level` is an attribute.
    rn:
      element: Pressable
      props:
      - accessibilityRole=button
      - accessibilityLabel
      - accessibilityState
      - accessibilityHint
      notes: 'Pressable trigger with accessibilityState={{ expanded: open, disabled
        }} and the panel conditionally rendered below. Screen readers read "expanded/collapsed"
        from the state; there is no aria-controls equivalent. `headingLevel` sets
        accessibilityRole="header" on the trigger text instead of a level. The chevron
        is the system Icon, mirrored to `chevron-left` under `I18nManager.isRTL` with
        the open rotation reversed to match, and its `overrides.size` receives the
        same token as `triggerFontSize` so the glyph tracks the trigger text. Native
        has no notion of focus within a subtree, so a panel that closes while something
        inside it held focus cannot hand focus back to the trigger; the screen reader
        falls to the next element, which is the trigger itself.'
    swiftui:
      element: VStack
      props:
      - Button
      - .accessibilityValue=expanded
      - Icon
      - withAnimation
      - .accessibilityAction
      notes: A `Button` trigger (the package Button, `ghost`, chevron Icon rotated
        when open) with `.accessibilityValue(copy.expanded / copy.collapsed)` — SwiftUI
        has no expanded trait, the value carries it — above the content, which is
        inserted/removed with the `transition` animation (none under reduced motion).
        Not `DisclosureGroup` (its chevron and spacing are uncontrollable). `defaultOpen`/`open`
        per the controlled rule.
  behavior:
  - name: click-on-trigger-expands
    when:
      click: trigger
    then:
    - event: onToggle
    - state: expanded
      is: true
  - name: open-disclosure-collapses-on-click
    given:
      defaultOpen: true
    when:
      click: trigger
    then:
    - event: onToggle
    - state: expanded
      is: false
  - name: disabled-trigger-does-not-toggle
    description: The trigger cannot be activated; the panel keeps its current state.
    given:
      disabled: true
    when:
      click: trigger
    then:
    - event: onToggle
      fired: false
    - state: expanded
      is: false
    - state: disabled
      is: true
  - name: disabled-trigger-stays-focusable
    description: Announced as disabled, not removed from the tab order.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  examples:
  - name: faq-answer
    description: A question whose trigger sits in a heading, so it appears in the
      document outline.
    given:
      summary: What happens if I cancel?
      children: You keep access until the end of the current billing period.
      headingLevel: '3'
  - name: advanced-options
    description: Secondary settings most users never open.
    given:
      summary: Advanced options
      children: Retry limit, timeout and proxy settings.
  - name: open-with-form-fields
    description: A disclosure that starts open and keeps its panel mounted so a Form
      still collects the fields inside.
    given:
      summary: Billing address
      children: Street, city and postcode fields.
      defaultOpen: true
      keepMounted: true
  - name: disabled
    description: A trigger that cannot be activated yet, still focusable and announced
      as disabled.
    given:
      summary: Shipping details
      children: Choose a delivery address first.
      disabled: true
```

## Events

- `onToggle`: emit `onToggle`
  - payload, positional, in this order: `open: boolean`, `reason: 'pointer' | 'keyboard' | 'controlled'`
  - reasons: `pointer` (the trigger was clicked or tapped); `keyboard` (Enter or Space on the trigger); `controlled` (the consumer changed the open prop)
  - fires on: user, controlled
  - timing: after-change

## Controlled state

- `open` is controlled when given, uncontrolled from `defaultOpen` when omitted; changes reported by `onToggle` (emit `onToggle`); drives state `open`

## Style bindings

- `triggerColor`: token `color.foreground`; part `trigger`; locked
- `triggerBackgroundHover`: token `color.background.subtle`; part `trigger`; state `hover`; locked
- `triggerPaddingBlock`: token `space.sm`; part `trigger`
- `triggerPaddingInline`: token `space.sm`; part `trigger`
- `triggerGap`: token `space.2`; part `trigger`
- `triggerFontFamily`: token `font.family.body`; part `trigger`
- `triggerFontSize`: token `font.size.md`; part `trigger`
- `triggerFontWeight`: token `font.weight.medium`; part `trigger`
- `triggerRadius`: token `radius.md`; part `trigger`
- `panelPaddingBlock`: token `space.sm`; part `panel`
- `panelPaddingInline`: token `space.sm`; part `panel`
- `panelColor`: token `color.foreground`; part `panel`; locked

## Constants and examples

- example `faq-answer`, story `FaqAnswer`: given `summary: "What happens if I cancel?"`, `children: "You keep access until the end of the current billing period."`, `headingLevel: "3"`; A question whose trigger sits in a heading, so it appears in the document outline.
- example `advanced-options`, story `AdvancedOptions`: given `summary: "Advanced options"`, `children: "Retry limit, timeout and proxy settings."`; Secondary settings most users never open.
- example `open-with-form-fields`, story `OpenWithFormFields`: given `summary: "Billing address"`, `children: "Street, city and postcode fields."`, `defaultOpen: true`, `keepMounted: true`; A disclosure that starts open and keeps its panel mounted so a Form still collects the fields inside.
- example `disabled`, story `Disabled`: given `summary: "Shipping details"`, `children: "Choose a delivery address first."`, `disabled: true`; A trigger that cannot be activated yet, still focusable and announced as disabled.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `triggerPaddingBlock`, `triggerPaddingInline`, `triggerGap`, `triggerFontFamily`, `triggerFontSize`, `triggerFontWeight`, `triggerRadius`, `panelPaddingBlock`, `panelPaddingInline`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `triggerColor`, `triggerBackgroundHover`, `icon`, `panelColor`, `focusRing`, `focusRingWidth`, `minTarget`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- Button
- .accessibilityValue=expanded
- Icon
- withAnimation
- .accessibilityAction
notes: "A `Button` trigger (the package Button, `ghost`, chevron Icon rotated when\
  \ open) with `.accessibilityValue(copy.expanded / copy.collapsed)` \u2014 SwiftUI\
  \ has no expanded trait, the value carries it \u2014 above the content, which is\
  \ inserted/removed with the `transition` animation (none under reduced motion).\
  \ Not `DisclosureGroup` (its chevron and spacing are uncontrollable). `defaultOpen`/`open`\
  \ per the controlled rule."
```

## Guidance

## Overview

A disclosure is a button that reveals content beneath it. It is deliberately plain: no border, no card, no animation of the panel. The pattern's job is to keep long pages scannable by hiding detail until it is wanted — FAQ answers, advanced options, "show more".

## When to use

Use a Disclosure to hide secondary content that some users need and most do not: optional settings, long explanations, a list of details behind a summary count. Stack several to make an accordion — each is independent; nothing in this component closes its siblings. Set `headingLevel` when the summaries are section titles so they appear in the outline and screen-reader heading lists.

## When not to use

Do not use a Disclosure to hide content that most users need to see or that is required to complete a task; show it. Do not use it for navigation menus (use Menu, planned) or for content that should take over the screen (use Dialog or BottomSheet, planned). Do not use it as a fake tab set; tabs replace content, disclosures add to it.

## Behavior

Activating the trigger with pointer, Enter, Space, or assistive technology flips the state and fires `onToggle` with the new value. When open, the panel is rendered directly after the trigger in reading order and focus stays on the trigger; users move into the panel themselves. When closed, the panel is removed from the tree (or hidden, with `keepMounted`), so focus inside it must be moved to the trigger first; the component does this when it closes while focus is within, whether the close came from the trigger or from a controlled `open` change. A closed panel's form fields are not collected by a Form unless `keepMounted` is set, so any Disclosure that holds fields must set it. Uncontrolled unless `open` is provided. The chevron rotates over `transition`; the panel appears and disappears without animation, so nothing reflows under the user's pointer.

## Content guidelines

The summary is the name of what is hidden, not an instruction: "Advanced options", "Shipping details", "What happens if I cancel?" — never "Click to expand" or "More". Do not put the state in the label ("Show" / "Hide"); the expanded state is announced and shown by the chevron. If a count helps, put it in the summary ("3 attachments").

## Accessibility

The trigger is a real button with the summary as its accessible name (WCAG 4.1.2) and exposes `aria-expanded` / `expanded` so the state is announced (4.1.2, APG disclosure). The panel is associated with `aria-controls` on web and follows the trigger in DOM order on every platform, so sequential navigation reaches it next (1.3.2, 2.4.3). Enter and Space toggle; there are no arrow-key semantics, because a lone disclosure is not a composite (2.1.1). Focus is visible on the trigger (2.4.7) and the trigger meets the 24px target (2.5.8). Nothing is hidden with CSS alone: a closed panel is either not in the tree or carries the `hidden` attribute, so it is not in the accessibility tree either way. The chevron animation is disabled under reduced motion (2.3.3).

## Platform notes

### Web
Render `<button type="button" aria-expanded={open} aria-controls={panelId}>` containing the chevron (`aria-hidden`) and the summary text; wrap it in `<h{headingLevel}>` when set (the heading has no styling of its own — the button carries it). Render `<div id={panelId}>` after the button only while open, or with the `hidden` attribute while closed when `keepMounted` is set; set `aria-controls` only while the panel exists, so there is never a dangling reference. Use `aria-disabled` rather than `disabled` so the trigger stays discoverable. Mirror the chevron under `[dir=rtl]`. `headingLevel` also accepts a number. Do not use `<details>`: its open state cannot be controlled without side effects, its summary cannot be inside a heading, and browsers differ on how they announce it.

### Lit
`<ds-disclosure summary="…" open>` renders the trigger in the shadow root and the panel as a default `<slot>` that exists only while open. The light-DOM children still exist in the document when closed, but children not assigned to any slot are neither rendered nor in the accessibility tree, so omitting the slot is sufficient — do not add `hidden` to the consumer's nodes. Dispatch a composed `toggle` CustomEvent with `detail: { open }`. Reflect `open` and `disabled`.

### React Native
Render a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel={summary}` and `accessibilityState={{ expanded: open, disabled }}`, containing the chevron and a `Text`; render the children in a `View` below it only while open (or with `display: 'none'` while closed when `keepMounted` is set). Moving focus back to the trigger on close is not possible on native (no notion of focus-within), a platform limit. When `headingLevel` is set, mark the summary `Text` with `accessibilityRole="header"` — native has no heading levels. Rotate the chevron with `Animated` over `transition`, or set it directly when `AccessibilityInfo.isReduceMotionEnabled()` is true.

## Related

Button, Heading, Accordion (planned), Dialog (planned).

## Behavior scenarios (11)

One test per scenario, in this order.

```yaml
- name: click-on-trigger-expands
  when:
    click: trigger
  then:
  - event: onToggle
  - state: expanded
    is: true
- name: open-disclosure-collapses-on-click
  given:
    defaultOpen: true
  when:
    click: trigger
  then:
  - event: onToggle
  - state: expanded
    is: false
- name: disabled-trigger-does-not-toggle
  description: The trigger cannot be activated; the panel keeps its current state.
  given:
    disabled: true
  when:
    click: trigger
  then:
  - event: onToggle
    fired: false
  - state: expanded
    is: false
  - state: disabled
    is: true
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
- name: renders-heading-level-5
  given:
    headingLevel: '5'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-6
  given:
    headingLevel: '6'
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
