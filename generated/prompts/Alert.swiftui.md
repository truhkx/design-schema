# Generate: Alert for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Alert.swift` declaring `public struct Alert: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/AlertBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Alert.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Alert") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Alert")` on the root and `"Alert.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Alert
  category: feedback
  status: review
  apg: alert
  anatomy:
  - container
  - icon
  - heading
  - body
  - dismissButton
  composition:
    icon:
      component: Icon
      forwards:
        icon: color
        iconSize: size
    dismissButton: Button
  parts:
    body:
      kind: slot
      slot:
        default: true
        prop: children
        required: true
  props:
    tone:
      type: enum
      enumRef: tone
      values:
      - info
      - success
      - warning
      - danger
      default: info
      description: What kind of message this is. Sets the colors and the icon, which
        together convey the tone without relying on color.
    heading:
      type: string
      description: A short bold first line for the message. Optional for one-line
        messages. Named `heading`, not `title`, because `title` is a native attribute
        (tooltip) on every platform element.
    children:
      type: content
      required: true
      description: The message body. Text and Links; no headings or form controls.
    live:
      type: enum
      values:
      - status
      - alert
      - 'off'
      default: status
      description: How the alert is announced when it appears. `status` is polite
        (most messages), `alert` interrupts (only for errors that block the user),
        `off` for alerts already present when the view loads.
      a11y: Maps to role=status, role=alert, or a plain region. Never use `alert`
        for success or info.
    dismissible:
      type: boolean
      default: false
      description: Shows a dismiss button at the end of the alert. Activating it fires
        `onDismiss`; the consumer removes the alert (the component is controlled by
        its presence in the tree).
  events:
    onDismiss:
      description: Fired when the user activates the dismiss button. The consumer
        removes the alert.
      platforms:
        web: onDismiss
        lit: dismiss
        rn: onDismiss
        swiftui: onDismiss
      fires:
      - user
      timing:
        phase: request
  styles:
    background:
      token: color.status.{tone}.background
      locked: true
    foreground:
      token: color.status.{tone}.foreground
      description: Heading color.
      locked: true
    bodyColor:
      token: color.foreground
      part: body
      description: Body text keeps the page foreground so long messages read as text,
        not as colored emphasis.
      locked: true
    border:
      token: color.status.{tone}.border
      locked: false
    icon:
      token: color.status.{tone}.icon
      part: icon
      description: 'Leading icon: info circle, check circle, warning triangle, or
        error octagon by tone, rendered with the system Icon (`info`, `success`, `warning`,
        `danger`) and colored by passing this token as `overrides.color` to the Icon
        — the sanctioned way to color a composed child. Decorative; the tone is also
        conveyed by the heading or role.'
      locked: true
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    padding:
      token: space.md
      locked: false
    gap:
      token: space.3
      description: Horizontal gap between icon, content, and dismiss button.
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between heading and body.
      locked: false
    iconSize:
      token: font.size.lg
      part: icon
      description: Forwarded to the Icon as `overrides.size`; Icon's `size` enum is
        not used here.
      locked: false
    headingSize:
      token: font.size.md
      part: heading
      description: The heading; body text uses `fontSize`.
      locked: false
    headingWeight:
      token: font.weight.semibold
      part: heading
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    dismissMargin:
      token: space.1
      description: Negative block/inline-end margin on the dismiss Button so its target
        sits in the corner without enlarging the padding; the Button keeps its own
        colors, radius and focus ring.
      locked: false
  copy:
    dismissLabel: Dismiss
  a11y:
    role: status
    requires:
    - live-region
    - contrast-aa
    - focus-visible
    - keyboard-operable
    - target-24px
    contrast:
    - foreground: color.status.{tone}.foreground
      background: color.status.{tone}.background
      level: AA
    - foreground: color.foreground
      background: color.status.{tone}.background
      level: AA
    - foreground: color.status.{tone}.icon
      background: color.status.{tone}.background
      level: AA
      nonText: true
    - foreground: color.link
      background: color.status.{tone}.background
      level: AA
    - foreground: color.action.ghost.foreground
      background: color.status.{tone}.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role
      notes: role="status" | "alert" from `live` (each implies its aria-live; set
        only the role); no role when off. Rendering the role on the component root
        is enough for the announcement, since React mounts the element and its content
        together. The dismiss button is the system Button (ghost, sm, iconOnly, label
        copy.dismissLabel) unchanged — composites never restyle a child; the ghost
        foreground is checked against every tone background. The region's accessible
        name is the heading (aria-labelledby) when present, otherwise the body element,
        so an Alert always has a name even without a heading.
    lit:
      tag: ds-alert
      reflect:
      - tone
      - live
      - dismissible
      notes: 'The role is set on the host element via ElementInternals so the live
        region is in the light DOM tree where assistive technology expects it. `dismiss`
        is a composed CustomEvent; the inner button''s `press` is stopped so consumers
        see one event. `heading` is a property (attribute `heading`) or the named
        slot `heading`; body is the default slot. Accessible name: the host is named
        by aria-labelledby the heading when present, else by the body text (a status
        region is named by its content), via ElementInternals ariaLabelledByElements
        where supported and aria-label with the text otherwise.'
    rn:
      element: View
      props:
      - accessibilityRole=alert
      - accessibilityLiveRegion
      - accessibilityLabel
      notes: live=alert → accessibilityRole="alert" and accessibilityLiveRegion="assertive";
        status → accessibilityLiveRegion="polite"; off → neither. iOS ignores live
        regions, so with live≠off call AccessibilityInfo.announceForAccessibility
        on mount and again whenever heading or body change (a changed message is a
        new message). The label is heading + body when body is a string; otherwise
        heading only — a body that is not plain text should carry its own accessible
        text. The dismiss button is the system Button.
    swiftui:
      element: HStack
      props:
      - .accessibilityElement=combine
      - .accessibilityAddTraits=updatesFrequently
      - AccessibilityNotification
      - Icon
      - Button
      notes: 'An `HStack` of the tone Icon (color forwarded through `overrides`),
        the text column (`Heading`/`Text`), and the dismiss `Button` (ghost, iconOnly,
        `close`). `role: alert` posts `AccessibilityNotification.Announcement` with
        heading + body when it appears; `status` is silent and combined into one element
        with the tone word from copy as the value; `banner`/`region` are `.contain`ed.
        Tone colors from the status tokens; never color alone — the tone word is in
        the accessibility label.'
  behavior:
  - name: dismiss-fires-on-dismiss
    description: Activating the dismiss button fires onDismiss; the consumer removes
      the alert.
    given:
      dismissible: true
    when:
      click: dismissButton
    then:
    - event: onDismiss
  - name: live-alert-renders-the-alert-role
    description: live=alert interrupts, and role=alert already implies aria-live=assertive.
    given:
      live: alert
    then:
    - role: alert
  - name: live-status-renders-the-status-role
    description: The default; role=status implies aria-live=polite, so the message
      is announced politely.
    given:
      live: status
    then:
    - role: status
      platforms:
      - web
      - lit
  - name: live-off-renders-no-role
    description: An alert already present when the view loads is read in sequence,
      with no live region at all.
    given:
      live: 'off'
    then:
    - attribute: role
      is: null
      platforms:
      - web
  - name: the-heading-is-rendered
    description: The heading is a short bold first line saying what happened.
    given:
      heading: Payment failed
    then:
    - text: Payment failed
  examples:
  - name: blocking-error
    description: An error that blocks the user, announced immediately above the form
      it belongs to.
    given:
      tone: danger
      live: alert
      heading: Payment failed
      children: Your card was declined. Try another card or contact your bank.
  - name: saved
    description: A polite success confirmation after a submit.
    given:
      tone: success
      heading: Changes saved
      children: Your notification preferences apply from the next digest.
  - name: dismissible-notice
    description: A message the user can safely put away.
    given:
      tone: info
      dismissible: true
      children: Some features are unavailable while you are offline.
  - name: present-at-load
    description: A warning already on the page when it loads, so it is read in sequence
      rather than announced.
    given:
      tone: warning
      live: 'off'
      heading: Trial ends in three days
      children: Add a payment method to keep your workspace.
```

## Events

- `onDismiss`: emit `onDismiss`
  - fires on: user
  - timing: request

## Parts and slots

- `container`: element
- `icon`: component `Icon`; forwards `icon` → `overrides.color`, `iconSize` → `overrides.size`
- `heading`: element
- `body`: slot, `@ViewBuilder` parameter `children`, required
- `dismissButton`: component `Button`

## Style bindings

- `bodyColor`: token `color.foreground`; part `body`; locked
- `icon`: token `color.status.{tone}.icon`; part `icon`; locked
- `iconSize`: token `font.size.lg`; part `icon`
- `headingSize`: token `font.size.md`; part `heading`
- `headingWeight`: token `font.weight.semibold`; part `heading`

## Constants and examples

- example `blocking-error`, story `BlockingError`: given `tone: "danger"`, `live: "alert"`, `heading: "Payment failed"`, `children: "Your card was declined. Try another card or contact your bank."`; An error that blocks the user, announced immediately above the form it belongs to.
- example `saved`, story `Saved`: given `tone: "success"`, `heading: "Changes saved"`, `children: "Your notification preferences apply from the next digest."`; A polite success confirmation after a submit.
- example `dismissible-notice`, story `DismissibleNotice`: given `tone: "info"`, `dismissible: true`, `children: "Some features are unavailable while you are offline."`; A message the user can safely put away.
- example `present-at-load`, story `PresentAtLoad`: given `tone: "warning"`, `live: "off"`, `heading: "Trial ends in three days"`, `children: "Add a payment method to keep your workspace."`; A warning already on the page when it loads, so it is read in sequence rather than announced.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `padding`, `gap`, `partGap`, `iconSize`, `headingSize`, `headingWeight`, `fontFamily`, `fontSize`, `lineHeight`, `dismissMargin`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `bodyColor`, `icon`

## Platform notes (swiftui)

```yaml
element: HStack
props:
- .accessibilityElement=combine
- .accessibilityAddTraits=updatesFrequently
- AccessibilityNotification
- Icon
- Button
notes: "An `HStack` of the tone Icon (color forwarded through `overrides`), the text\
  \ column (`Heading`/`Text`), and the dismiss `Button` (ghost, iconOnly, `close`).\
  \ `role: alert` posts `AccessibilityNotification.Announcement` with heading + body\
  \ when it appears; `status` is silent and combined into one element with the tone\
  \ word from copy as the value; `banner`/`region` are `.contain`ed. Tone colors from\
  \ the status tokens; never color alone \u2014 the tone word is in the accessibility\
  \ label."
```

## Guidance

## Overview

An alert is the system speaking to the user inside the page: "this saved", "this failed", "this is about to expire". It stays where it is until the user has dealt with it or dismissed it, unlike a Toast (planned), which leaves on its own. Its tone is set by color, by an icon, and by the announcement role, so no single channel carries the meaning.

## When to use

Use an Alert for a message that relates to the current view and should stay visible: a failed save above the form, an expiring trial at the top of a screen, a success confirmation after submit, a note that some features are unavailable offline. Choose `tone` by what the user should do: `info` to know, `success` to relax, `warning` to be careful, `danger` to fix something. Use `dismissible` for messages the user can safely put away; leave persistent problems undismissable.

## When not to use

Do not use an Alert for field-level validation; Input and the form controls render their own errors, and Form renders the summary. Do not use it for transient confirmations that need no action; use Toast (planned). Do not use it as a callout for general prose ("Tip: …") in documentation; that is a Note (planned) with no live semantics. Do not stack more than two alerts in a view; combine or prioritise.

## Behavior

An Alert rendered with `live: status` or `alert` is announced by screen readers when it appears in the tree, without moving focus. An Alert present at load with `live: off` is read in sequence like any content. The dismiss button fires `onDismiss` and the consumer removes the alert. Because activation happens inside the alert, the component first moves focus to the next focusable element after the alert in reading order (or to the previous one when there is none), so focus is never lost when the alert disappears; if nothing outside the alert is focusable, focus is left alone. On native, focus cannot be moved programmatically to an arbitrary element, an acknowledged limit. Alerts never auto-dismiss and never animate in — a message that fades or slides is a Toast.

## Content guidelines

The heading says what happened in a few words ("Changes saved", "Payment failed"); the body says what it means and what to do next, in one or two sentences, with a Link if there is somewhere to go. Do not restate the tone in the heading ("Error: …", "Warning!") — the icon and role carry it, and screen readers already announce `alert` as an alert. Do not use exclamation marks. `danger` alerts are the only ones where the body may start with the cause.

## Accessibility

The message is announced when it appears, politely for `status` and immediately for `alert` (WCAG 4.1.3 Status Messages), and it is never used to move focus (3.2.1). Tone is conveyed by the icon shape and the heading, not only by color (1.4.1). Heading, body, links, the dismiss button and icon meet contrast on the tinted background in both modes — 4.5:1 for text and 3:1 for the icon (1.4.3, 1.4.11); the build checks every tone. The region itself has no separate accessible name — a status or alert region is announced by its content, and naming it would be read twice. The dismiss button has an accessible name from `copy.dismissLabel`, visible focus, and a 24px target (2.4.7, 2.5.8). Only `danger` and blocking `warning` alerts use `live: alert`; interrupting for good news is a real cost to screen-reader users.

## Platform notes

### Web
Render `<div role={live === 'off' ? undefined : live}>` — `role="status"` implies `aria-live="polite"` and `role="alert"` implies assertive, so set only the role. Inside: the icon (`aria-hidden` inline SVG), a content column with the heading as a `<p>` in `headingWeight` and `foreground` (a raw element, not Text, which has no status tones; and not a heading element, so it does not disturb the outline) and the body, and, when dismissible, the system Button (`ghost`, `size: sm`, `iconOnly`, label `copy.dismissLabel`, a 1em × glyph as `leadingIcon`) pulled into the corner with `dismissMargin`. The `heading` prop must not be forwarded as the native `title` attribute. Colors come from the `{tone}` bindings; use `border` on all sides at `borderWidth`.

### Lit
`<ds-alert tone="danger" live="alert" heading="Payment failed">` sets `role` on the host via `ElementInternals` so the live region is the host itself, which assistive technology sees in the light DOM. The body is the default slot and `heading` is a property (or a named `heading` slot for rich headings). Dispatch a composed `dismiss` CustomEvent (stop the inner `press`); the consumer removes the element. The dismiss `<ds-button>` is used unchanged — no `::part` restyling. Reflect `tone`, `live` and `dismissible`.

### React Native
Render a `View` with `accessibilityRole="alert"` when `live` is `alert`, `accessibilityLiveRegion="assertive"` or `"polite"` by `live`, and `accessibilityLabel` = heading + body (when body is a string) so the whole message is one announcement. iOS does not honour live regions: in an effect on mount, when `live !== 'off'`, call `AccessibilityInfo.announceForAccessibility()` with the heading and body joined by a full stop, and again whenever they change. Apply `background`, `border` and `radius` from the tone tokens; render the icon with the `icon` color and `accessibilityElementsHidden`. The dismiss button is the system Button (`ghost`, `sm`, `iconOnly`, with a × glyph as `leadingIcon`), pulled into the corner with `dismissMargin`.

## Related

Form, Toast (planned), Note (planned), Dialog (planned).

## Behavior scenarios (11)

One test per scenario, in this order.

```yaml
- name: dismiss-fires-on-dismiss
  description: Activating the dismiss button fires onDismiss; the consumer removes
    the alert.
  given:
    dismissible: true
  when:
    click: dismissButton
  then:
  - event: onDismiss
- name: live-alert-renders-the-alert-role
  description: live=alert interrupts, and role=alert already implies aria-live=assertive.
  given:
    live: alert
  then:
  - role: alert
- name: the-heading-is-rendered
  description: The heading is a short bold first line saying what happened.
  given:
    heading: Payment failed
  then:
  - text: Payment failed
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-info
  given:
    tone: info
  then:
  - renders: true
  derived: true
- name: renders-tone-success
  given:
    tone: success
  then:
  - renders: true
  derived: true
- name: renders-tone-warning
  given:
    tone: warning
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-live-status
  given:
    live: status
  then:
  - renders: true
  derived: true
- name: renders-live-alert
  given:
    live: alert
  then:
  - renders: true
  derived: true
- name: renders-live-off
  given:
    live: 'off'
  then:
  - renders: true
  derived: true
```
