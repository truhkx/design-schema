# Generate: Accordion for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Accordion.swift` declaring `public struct Accordion: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/AccordionBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Accordion.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Accordion") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Accordion")` on the root and `"Accordion.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Accordion
  category: container
  status: review
  apg: accordion
  anatomy:
  - list
  - item
  - trigger
  - triggerIcon
  - panel
  composition:
    item: Disclosure
  props:
    items:
      type: array
      required: true
      shape: '{ id: string; summary: string; content: ReactNode; disabled?: boolean
        }[]'
      description: The sections in order. `content` is the panel body; on Lit it is
        dropped from the item type and the body is a light-DOM child slotted by the
        item id (`<div slot="faq-1">`).
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      default: '3'
      description: Heading level for every trigger, so sections appear in the page
        outline.
    exclusive:
      type: boolean
      default: false
      description: 'Opening one section closes the others. Off by default: users usually
        want to compare, and forced-closing is a common frustration.'
    value:
      type: union
      description: Controlled open ids. A bare `string` is accepted as shorthand for
        a one-id array; an empty array or an empty string means nothing is open. Events
        always report an array, with zero or one entry when `exclusive`.
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initially open ids; the same shapes as `value`.
      shape: string | string[]
    divided:
      type: boolean
      default: true
      description: A hairline between items.
    keepMounted:
      type: boolean
      default: false
      description: Passed to every Disclosure; required when panels contain form fields.
  events:
    onChange:
      description: Fired when the set of open sections changes, with the open ids
        — always an array, even under `exclusive`, where it carries zero or one entry.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: openIds
        type: array
        shape: string[]
        description: The ids of every open section.
      fires:
      - user
    onOpenChange:
      description: 'Fired per section as it opens or closes, with `{ id, open, reason
        }` (`reason`: `trigger`, `keyboard`, `exclusive` when another section closed
        it, `controlled`). The per-item trigger for analytics, lazy loading of a panel''s
        content, or scrolling the opened section into view; `onChange` remains the
        set-level event for state.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: id
        type: string
        description: The section whose state changed.
      - name: open
        type: boolean
        description: Its new state.
      - name: reason
        type: enum
        values:
        - trigger
        - keyboard
        - exclusive
        - controlled
      reasons:
        trigger: the section trigger was activated by pointer
        keyboard: the section was toggled from the keyboard — web and Lit pass through
          the activation method Disclosure reports on its own toggle, so the two reasons
          must not be collapsed there; React Native has no such signal and reports
          `trigger` for every activation
        exclusive: another section opened and closed this one
        controlled: the `value` prop changed to a set the accordion did not itself
          just emit
      fires:
      - user
      - controlled
  keyboard:
  - keys:
    - Enter
    - ' '
    action: Toggles the focused section.
    from: first
    expect: toggles
  - keys:
    - ArrowDown
    action: Moves focus to the next trigger; wraps.
    from: first
    expect: focus-next
  - keys:
    - ArrowUp
    action: Moves focus to the previous trigger; wraps.
    from: last
    expect: focus-prev
  - keys:
    - ArrowDown
    action: From the last trigger wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Home
    action: First trigger.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last trigger.
    from: first
    expect: focus-last
  - keys:
    - Tab
    action: Ordinary tab order — every trigger is a tab stop (the APG recommends this
      so panel content stays reachable).
    from: first
    expect: focus-next
  styles:
    divider:
      token: color.border
      locked: false
    dividerWidth:
      token: border.width.thin
      locked: false
    itemGap:
      token: layout.gap.none
      part: item
      description: Items touch; the divider separates them.
      locked: false
    triggerPaddingBlock:
      token: space.md
      part: trigger
      description: Roomier than a lone Disclosure, since accordion triggers are section
        headings.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    triggerFontSize:
      token: font.size.md
      part: trigger
      locked: false
    triggerFontWeight:
      token: font.weight.medium
      part: trigger
      locked: false
    minTarget:
      token: size.target.min
      description: The composed Disclosure's own minimum; the accordion's triggerPaddingBlock
        override raises the row to the comfortable size.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  a11y:
    role: none
    requires:
    - heading-hierarchy
    - expanded-state
    - arrow-navigation
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - data-ds=Accordion
      notes: A <div> of Disclosures rendered with headingLevel and shared padding
        overrides; Accordion adds the arrow-key handler on the container (keydown
        from a trigger moves focus among triggers) and the exclusive logic. Every
        trigger stays a tab stop — no roving tabindex — per the APG accordion pattern.
    lit:
      tag: ds-accordion
      reflect:
      - exclusive
      - prop: divided
        attribute: no-divided
      - heading-level
      notes: Light-DOM <ds-disclosure> children are the items (slot), so their content
        stays in the document; ds-accordion sets heading-level and keep-mounted on
        them, listens for their `toggle` to enforce exclusive, and handles arrow keys
        via keydown bubbling from the slotted triggers. `items` as a property is also
        accepted and renders <ds-disclosure> elements itself.
    rn:
      element: View
      props: []
      notes: A View of Disclosures with dividers; exclusive logic and headingLevel
        passed through. Native has no key events on Pressable, so ArrowUp/Down/Home/End
        are not implemented and `reason` is never `keyboard`; every trigger is an
        ordinary accessibility focus stop reached by swipe, which is the native equivalent
        of the arrow shortcut. Arrow keys apply only with a hardware keyboard on react-native-web.
    swiftui:
      element: VStack
      props:
      - Disclosure
      - Heading
      - Button
      - .accessibilityValue=expanded
      - .focusSection
      - .onMoveCommand
      - '@FocusState'
      notes: A `VStack` of items, each a `Heading` at `headingLevel` wrapping the
        package trigger `Button` (`.accessibilityValue` expanded/collapsed) and its
        panel; `multiple`/`collapsible` per the doc; ArrowUp/Down/Home/End move between
        triggers on iPad via `@FocusState`. Panels animate with `transition` unless
        reduced motion. Composes Disclosure's engine, not `DisclosureGroup`.
  behavior:
  - name: click-on-a-trigger-reports-the-open-set
    description: onChange carries the open ids; onOpenChange reports the one section
      whose state changed.
    when:
      click: trigger
    then:
    - event: onChange
    - event: onOpenChange
    - attribute: aria-expanded
      is: 'true'
      'on': trigger
      platforms:
      - web
      - lit
  - name: exclusive-still-reports-both-events
    description: With exclusive, opening one section closes the others; the set-level
      onChange and the per-section onOpenChange both still fire.
    given:
      exclusive: true
    when:
      click: trigger
    then:
    - event: onChange
    - event: onOpenChange
  examples:
  - name: faq
    description: A list of questions, several of which can be open at once.
    given:
      items:
      - id: cancel
        summary: What happens if I cancel?
        content: You keep access until the end of the billing period.
      - id: refunds
        summary: Do you offer refunds?
        content: Within 14 days of a charge, in full.
  - name: one-open-at-a-time
    description: A comparison list where opening a section closes the rest.
    given:
      exclusive: true
      items:
      - id: free
        summary: Free
        content: One project and community support.
      - id: pro
        summary: Pro
        content: Unlimited projects and email support.
  - name: form-sections
    description: Form sections whose panels stay mounted so the Form still collects
      the fields inside.
    given:
      keepMounted: true
      headingLevel: '2'
      items:
      - id: contact
        summary: Contact details
        content: Name and email fields.
      - id: billing
        summary: Billing address
        content: Street and city fields.
  - name: undivided
    description: Sections without the hairline, for an accordion that already sits
      inside a Card.
    given:
      divided: false
      items:
      - id: shipping
        summary: Shipping
        content: Orders ship within two business days.
      - id: returns
        summary: Returns
        content: Items can be returned within 30 days.
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `openIds: string[]`
  - fires on: user
- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `id: string`, `open: boolean`, `reason: 'trigger' | 'keyboard' | 'exclusive' | 'controlled'`
  - reasons: `trigger` (the section trigger was activated by pointer); `keyboard` (the section was toggled from the keyboard — web and Lit pass through the activation method Disclosure reports on its own toggle, so the two reasons must not be collapsed there; React Native has no such signal and reports `trigger` for every activation); `exclusive` (another section opened and closed this one); `controlled` (the `value` prop changed to a set the accordion did not itself just emit)
  - fires on: user, controlled

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Style bindings

- `itemGap`: token `layout.gap.none`; part `item`
- `triggerPaddingBlock`: token `space.md`; part `trigger`
- `triggerFontSize`: token `font.size.md`; part `trigger`
- `triggerFontWeight`: token `font.weight.medium`; part `trigger`

## Constants and examples

- example `faq`, story `Faq`: given `items: [{"id":"cancel","summary":"What happens if I cancel?","content":"You keep access until the end of the billing period."},{"id":"refunds","summary":"Do you offer refunds?","content":"Within 14 days of a charge, in full."}]`; A list of questions, several of which can be open at once.
- example `one-open-at-a-time`, story `OneOpenAtATime`: given `exclusive: true`, `items: [{"id":"free","summary":"Free","content":"One project and community support."},{"id":"pro","summary":"Pro","content":"Unlimited projects and email support."}]`; A comparison list where opening a section closes the rest.
- example `form-sections`, story `FormSections`: given `keepMounted: true`, `headingLevel: "2"`, `items: [{"id":"contact","summary":"Contact details","content":"Name and email fields."},{"id":"billing","summary":"Billing address","content":"Street and city fields."}]`; Form sections whose panels stay mounted so the Form still collects the fields inside.
- example `undivided`, story `Undivided`: given `divided: false`, `items: [{"id":"shipping","summary":"Shipping","content":"Orders ship within two business days."},{"id":"returns","summary":"Returns","content":"Items can be returned within 30 days."}]`; Sections without the hairline, for an accordion that already sits inside a Card.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `divider`, `dividerWidth`, `itemGap`, `triggerPaddingBlock`, `fontFamily`, `triggerFontSize`, `triggerFontWeight`
Locked (accessibility-bearing, never overridable): `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- Disclosure
- Heading
- Button
- .accessibilityValue=expanded
- .focusSection
- .onMoveCommand
- '@FocusState'
notes: A `VStack` of items, each a `Heading` at `headingLevel` wrapping the package
  trigger `Button` (`.accessibilityValue` expanded/collapsed) and its panel; `multiple`/`collapsible`
  per the doc; ArrowUp/Down/Home/End move between triggers on iPad via `@FocusState`.
  Panels animate with `transition` unless reduced motion. Composes Disclosure's engine,
  not `DisclosureGroup`.
```

## Guidance

## Overview

An accordion is a list of Disclosures that know about each other: consistent headings, arrow keys to move between them, and optionally the rule that opening one closes the rest. It is the right shape for FAQs, settings groups and long forms broken into sections.

## When to use

Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a settings page grouped by topic, a multi-part form where each part is optional. Set `headingLevel` to fit the page outline. Leave `exclusive` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose one plan to see details").

## When not to use

Do not use an Accordion for content most users need — show it. Do not use it as navigation or as tabs (Tabs replace content; an accordion adds it). Do not nest accordions. Do not use one for a single section; that is a Disclosure.

## Behavior

Each item is a Disclosure with a heading. Enter or Space toggles the focused item; with `exclusive`, opening one closes the others (closing does not open anything). Arrow keys, Home and End move focus among the triggers and wrap; Tab moves through triggers and open panel content in document order, since every trigger remains a tab stop. `onChange` receives the open ids. Disabled items are visible and skipped by arrows. `onOpenChange` reasons come from Disclosure's `onToggle(open, reason)`, so `keyboard` is distinguishable from `trigger` on web and Lit (native always reports `trigger`). With `exclusive` and several ids in `value`/`defaultValue`, the first is opened and a development warning notes the rest. Items are identified by `id` (on Lit, the slotted `<ds-disclosure>`'s `id` attribute). The `item` part is the composed Disclosure root itself — Accordion does not add a `data-part="item"` hook and must not wrap items in an extra element to carry one, since Dividers are direct siblings of the items; address an item as `[data-ds="Accordion"] > [data-ds="Disclosure"]`. The `trigger`, `triggerIcon` and `panel` parts are tagged by Disclosure. Nothing open is `[]` or `''`, never `undefined`. `reason: 'controlled'` is reported when `value` arrives holding a set the accordion did not itself just emit; a controlled parent that answers a trigger with some other set therefore sees `controlled`, which is the intended reading.

## Content guidelines

Summaries are section titles — noun phrases or questions in sentence case, parallel across the list. Panel content starts with the answer, not a restatement of the heading. For FAQs, order by frequency, not alphabetically.

## Accessibility

Each trigger is a button inside a heading of the given level with `aria-expanded` and `aria-controls` (WCAG 4.1.2, 2.4.6; APG accordion), so the accordion reads as a list of headings in the rotor. Arrow keys are a convenience, not a replacement for Tab: every trigger is in the tab order so no panel content is stranded (2.1.1). Expanded state is visible (chevron) and announced. Targets meet 44px in the accordion form.

## Platform notes

### Web
Render `<div data-ds="Accordion">` containing a `Disclosure` per item with `headingLevel`, `keepMounted`, `open` controlled by the accordion's state, and `overrides={{ triggerPaddingBlock: 'space.md' }}`; a `Divider` between items when `divided`. Keydown on the container: when the event target is one of the triggers, handle ArrowUp/Down/Home/End by focusing the sibling trigger. `exclusive` maps each `onToggle` to the new open set.

### Lit
`<ds-accordion exclusive heading-level="3"><ds-disclosure summary="…">…</ds-disclosure>…</ds-accordion>`. On `slotchange`, set `heading-level`, `keep-mounted` and the padding override on each slotted `ds-disclosure`; listen for their composed `toggle` to enforce `exclusive` and dispatch `change`; handle arrow keys from bubbling keydown whose composed path includes a slotted trigger.

### React Native
`View` of `Disclosure`s with `Divider`s; the accordion owns the open set and passes `open`/`onToggle` to each. No arrow keys on native.

## Related

Disclosure, Tabs, Divider, Heading.

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: click-on-a-trigger-reports-the-open-set
  description: onChange carries the open ids; onOpenChange reports the one section
    whose state changed.
  when:
    click: trigger
  then:
  - event: onChange
  - event: onOpenChange
- name: exclusive-still-reports-both-events
  description: With exclusive, opening one section closes the others; the set-level
    onChange and the per-section onOpenChange both still fire.
  given:
    exclusive: true
  when:
    click: trigger
  then:
  - event: onChange
  - event: onOpenChange
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
```
