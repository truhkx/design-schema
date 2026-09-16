# Generate: Fieldset for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Fieldset.swift` declaring `public struct Fieldset: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/FieldsetBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Fieldset.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Fieldset") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Fieldset")` on the root and `"Fieldset.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Fieldset
  category: input
  status: review
  anatomy:
  - group
  - legend
  - description
  - fields
  - errorMessage
  composition:
    legend: Text
    description: Text
    fields: Stack
  props:
    legend:
      type: string
      required: true
      description: The group's name — what the fields together describe ("Shipping
        address", "Notification preferences"). Always visible.
      a11y: The accessible name of the group; screen readers read it before each field
        inside.
    children:
      type: content
      required: true
      description: The fields, usually a Stack of Inputs, Checkboxes or Switches.
    description:
      type: string
      description: Persistent helper text under the legend.
      a11y: Linked with aria-describedby on the group.
    error:
      type: string
      description: A group-level error (cross-field validation such as "End date must
        be after start date"). Field-level errors stay on the fields.
      a11y: Rendered once under the group with role=alert and linked with aria-describedby;
        while set, the group carries aria-invalid="true" (accessibilityState invalid
        is not available on native, so the error text alone identifies it there).
    disabled:
      type: boolean
      default: false
      description: Disables every field inside. Fields keep their own `disabled` for
        finer control.
    gap:
      type: enum
      values:
      - tight
      - normal
      - loose
      default: normal
      description: Gap between the fields, from the layout rhythm. Fieldset renders
        the Stack itself; children are the raw fields.
  styles:
    legendColor:
      token: color.foreground
      locked: true
    legendSize:
      token: font.size.md
      locked: false
    legendWeight:
      token: font.weight.medium
      locked: false
    descriptionText:
      token: color.foreground.muted
      locked: true
    helperSize:
      token: font.size.sm
      locked: false
    errorText:
      token: color.foreground.danger
      locked: true
    partGap:
      token: layout.gap.tight
      description: Vertical gap between legend, description, fields and error.
      locked: false
    fieldsGap:
      token: layout.gap.{gap}
      description: The composed Stack's gap. An `overrides.fieldsGap` is forwarded
        to the Stack's own `overrides.gap`; Fieldset never styles the Stack itself.
      locked: false
    disabledOpacity:
      token: opacity.disabled
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
  copy:
    requiredIndicator: ' (required)'
  a11y:
    role: group
    requires:
    - accessible-name
    - label-association
    - error-identification
    - contrast-aa
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
  platforms:
    web:
      element: fieldset
      attributes:
      - aria-describedby
      - aria-disabled
      notes: A native <fieldset> with a <legend>. No border and no padding (the browser
        defaults are reset); the group is structure, not a box — wrap it in a Box
        or Card for a surface. `disabled` uses aria-disabled on the fieldset plus
        each field's own disabled handling (the native disabled attribute on fieldset
        would remove fields from the tab order). A <legend> does not participate in
        flex gap, so partGap below it is a margin. With `error` set, the <fieldset>
        carries aria-invalid="true" and aria-describedby the error id (the group is
        the invalid thing; fields inside keep their own state).
    lit:
      tag: ds-fieldset
      reflect:
      - disabled
      - gap
      notes: Shadow root with a <fieldset><legend> and a default slot for the fields,
        which stay in the light DOM so ds-form still collects them. The group error
        is rendered in the shadow root. `disabled` is propagated to slotted ds-* fields
        via their `disabled` property on slotchange and reverted when cleared (remembering
        which it set), the same way ds-form does.
    rn:
      element: View
      props:
      - accessibilityRole
      - accessibilityLabel
      - accessibilityHint
      notes: A View that is NOT `accessible` (so children stay individually reachable).
        The legend is plain Text — not a header trait, which would put it in the headings
        rotor — and each child field receives the legend as a prefix in its accessibilityLabel
        through a FieldsetContext ("Shipping address, Street"), which is how VoiceOver
        and TalkBack users learn the grouping on native. The group error is announced
        as in Input.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Stack
      - FieldsetContext=environment
      notes: 'A `.accessibilityElement(children: .contain)` labelled by the legend
        (`Heading` or `Text` per `legendLevel`) wrapping a `Stack` of fields with
        `gap` forwarded through `overrides`. Provides `FieldsetContext` (`disabled`,
        legend) through the environment so fields prefix their accessibility label
        with the legend (''Shipping address, Street'') — the iOS way to say what `<fieldset>`
        says.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `legendSize`, `legendWeight`, `helperSize`, `partGap`, `fieldsGap`, `disabledOpacity`, `fontFamily`, `lineHeight`
Locked (accessibility-bearing, never overridable): `legendColor`, `descriptionText`, `errorText`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .accessibilityElement=contain
- .accessibilityLabel
- Stack
- FieldsetContext=environment
notes: "A `.accessibilityElement(children: .contain)` labelled by the legend (`Heading`\
  \ or `Text` per `legendLevel`) wrapping a `Stack` of fields with `gap` forwarded\
  \ through `overrides`. Provides `FieldsetContext` (`disabled`, legend) through the\
  \ environment so fields prefix their accessibility label with the legend ('Shipping\
  \ address, Street') \u2014 the iOS way to say what `<fieldset>` says."
```

## Guidance

## Overview

A fieldset is how a form says "these belong together." A screen-reader user tabbing into "Street" hears "Shipping address, Street" and knows where they are; a sighted user sees the legend and the fields indented under it by nothing more than rhythm. It is the container RadioGroup builds on, offered for any set of fields: an address, a date range, a set of notification switches.

## When to use

Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather than on one field.

## When not to use

Do not wrap a whole form in a Fieldset; the Form's `label` names the form. Do not use it for a single field. Do not use it for visual grouping without a shared meaning — that is a Box or a Card — and do not use it as a page section (Landmark, Heading with `section` spacing). RadioGroup already is a fieldset; do not nest one inside it.

## Behavior

Renders the legend, optional description, the fields in a Stack with `gap`, and an optional error. `disabled` disables every field inside while keeping them visible and focusable per each field's own rule. Inside a Form, the group itself is not a field; its children register individually, and the group `error` is set by the consumer from `onInvalid` or its own cross-field check. The `requiredIndicator` is appended to the legend when every field inside is required, so the indicator is not repeated on each. The required indicator is derived: it appears when every direct child field has `required` (fields wrapped in a consumer's own container are not inspected — put fields directly inside the Fieldset). `disabled` and the legend reach the fields through `FieldsetContext`, which Input, Checkbox, Switch and RadioGroup read: they render disabled, and on native prefix their accessibility label with the legend; until a field reads the context, Fieldset also clones direct children with `disabled`. On React Native the group uses the `role="group"` prop (RN ≥ 0.74), not the legacy accessibilityRole.

## Content guidelines

Legends are short noun phrases in sentence case ("Shipping address") or, for a set of choices, the question ("Which days should we deliver?"). Descriptions state a rule in one sentence. Group errors name the relationship that failed ("End date must be after start date"), not the field.

## Accessibility

A native group with a name means the relationship between fields is programmatically determinable (WCAG 1.3.1) and each field's accessible context includes the group (3.3.2). Description and error are linked from the group with `aria-describedby`, the group carries `aria-invalid` while an error is set, and the error announces when it appears (3.3.1). No color-only signals; text meets AA in both modes.

## Platform notes

### Web
`<fieldset aria-describedby>` with `<legend>` and a `Stack` for the children; reset the browser's border, padding and `min-inline-size`. Render the description and error as `Text` with ids; the error has `role="alert"`. For `disabled`, set `aria-disabled` on the fieldset and pass `disabled` down through a `FieldsetContext` that Input, Checkbox, Switch and RadioGroup read (add the context read to those components when they regenerate; until then, the fieldset clones direct children with `disabled`).

### Lit
`<ds-fieldset legend="Shipping address" gap="normal">` with a shadow `<fieldset><legend>` and a default slot. Propagate `disabled` to slotted `ds-*` fields on `slotchange` and on change, remembering which elements it disabled so clearing does not enable a field that was disabled on its own.

### React Native
`View` (not `accessible`) with the legend and description as `Text`; provide a `FieldsetContext` with the legend that Input, Checkbox, Switch and RadioGroup prefix into their `accessibilityLabel`. The group error uses the same announcement mechanism as Input. `disabled` flows through the same context.

## Related

Form, Input, Checkbox, RadioGroup, Stack, Box.

## Behavior scenarios (6)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-gap-tight
  given:
    gap: tight
  then:
  - renders: true
  derived: true
- name: renders-gap-normal
  given:
    gap: normal
  then:
  - renders: true
  derived: true
- name: renders-gap-loose
  given:
    gap: loose
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  derived: true
```
