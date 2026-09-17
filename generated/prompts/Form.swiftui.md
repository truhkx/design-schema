# Generate: Form for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Form.swift` declaring `public struct Form: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/FormBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Form.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Form") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("Form")` on the root and `"Form.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: Form
  category: container
  status: review
  anatomy:
  - container
  - fields
  - errorSummary
  - actions
  parts:
    fields:
      kind: slot
      slot:
        default: true
        prop: children
        required: true
    actions:
      kind: slot
      slot:
        prop: actions
        required: true
  props:
    children:
      type: content
      required: true
      description: Fields (Input etc.) and layout (Stack). The action row goes in
        `actions`.
    actions:
      type: content
      required: true
      description: 'The action row: at least one Button with `type: submit`, primary
        first (Form''s action-order rule). Rendered after the fields with the form
        gap; a named slot on Lit and the `actions` anatomy part on every platform.
        A single action renders bare; two or more go in a horizontal Stack the consumer
        supplies.'
    name:
      type: string
      description: Identifier for the form, used for analytics and as the base of
        generated ids. React Native has no ids and focuses by ref, so it is inert
        there and exists for parity. An unnamed form bases its ids on a generated
        unique id (useId on web); two forms given the same `name` on one page is an
        authoring error Form does not detect.
    label:
      type: string
      description: Accessible name for the form landmark, e.g. "Sign in". Required
        when a page has more than one form and `labelledBy` is not set. Nothing enforces
        this at runtime and no dev warning is emitted.
      a11y: Rendered as aria-label so the form is a named region.
    labelledBy:
      type: string
      description: Id of a visible Heading that names the form. Wins over `label`
        when both are set.
      a11y: Rendered as aria-labelledby.
      platforms:
      - web
      - lit
    validate:
      type: enum
      values:
      - submit
      - blur
      - change
      default: submit
      description: When field-level validation runs. `submit` is the least noisy;
        `blur` is the usual choice for longer forms. `change` validates on change
        only, not also on blur; after a failed submission every mode re-validates
        on blur and change.
    disabled:
      type: boolean
      default: false
      description: Disables every field and action inside. Use while submitting. Each
        field and action dims itself with its own disabled style; the Form container
        applies no opacity of its own (it would compound) and only exposes the disabled
        state (accessibilityState.disabled on RN). Web and Lit put no disabled attribute
        on the form element (aria-disabled is not valid on role form); each field
        and action reports its own.
    errorSummary:
      type: boolean
      default: true
      description: When submission fails validation, render a summary of errors above
        the fields that links to each field. Each item's text is the field's own message
        verbatim (a field's own required message already names the field, "Email is
        required."), never prefixed with the label; a field that is invalid with an
        empty message shows its `label` instead, and its `name` when the label is
        empty too. Every field's registration carries its `label` for that fallback,
        on all three platforms. The summary appears only after a failed submission
        (not for errors that blur or change validation finds before one), shrinks
        as fields are fixed, and is removed by a successful submission. Items follow
        document order at the failed submit; an error found later by blur or change
        validation is appended at the end. The plural locale is read at the failed
        submit.
      a11y: The summary receives focus and is announced, so users find every error
        without hunting.
  events:
    onSubmit:
      description: 'Fired when the form is submitted and every field is valid. Receives
        the collected values keyed by field name: `Record<string, string | number
        | boolean | string[] | [number, number]>` on every platform — Input and RadioGroup
        contribute strings, Switch a boolean, Checkbox its `value` when checked, NumberInput
        and Slider a number, multi-select Listbox, Select and Combobox a string array,
        a range Slider or DatePicker a pair; an unchecked Checkbox, an unselected
        RadioGroup, an empty field (a null, empty-string or empty-array value) and
        a disabled field contribute no key at all.'
      platforms:
        web: onSubmit
        lit: submit
        rn: onSubmit
        swiftui: onSubmit
      payload:
      - name: values
        type: object
        shape: Record<string, string | number | boolean | string[] | [number, number]>
        description: The collected values keyed by field name.
      fires:
      - user
    onInvalid:
      description: Fired when submission is blocked by validation. Receives the errors
        keyed by field name.
      platforms:
        web: onInvalid
        lit: invalid
        rn: onInvalid
        swiftui: onInvalid
      payload:
      - name: errors
        type: object
        shape: Record<string, string>
        description: The validation errors keyed by field name.
      fires:
      - user
  styles:
    gap:
      token: layout.gap.loose
      description: Vertical gap between the direct children of the fields part and
        between fields and actions — the rhythm preset, so a theme's `layout.rhythm`
        reaches every form. A Stack given as children spaces its own fields with its
        own gap; Form does not reach inside it.
      locked: false
    errorSummaryBorder:
      token: color.border.danger
      part: errorSummary
      locked: false
    errorSummaryText:
      token: color.foreground.danger
      part: errorSummary
      locked: true
    errorSummaryBackground:
      token: color.background.subtle
      part: errorSummary
      locked: true
    errorSummaryBorderWidth:
      token: border.width.thin
      part: errorSummary
      locked: false
    errorSummaryRadius:
      token: radius.md
      part: errorSummary
      locked: false
    errorSummaryPadding:
      token: space.md
      part: errorSummary
      description: Inset on all four sides of the summary box.
      locked: false
    errorSummaryGap:
      token: layout.gap.tight
      part: errorSummary
      description: Gap between the heading and the list and between list items. Inside
        the errorSummary box a Stack holds the heading and the list, and the list
        is a second Stack (element ul on web and Lit) with no markers and no indent;
        Form forwards this binding to both Stacks' `overrides.gap` (the `overrides`
        property on Lit) and has no --ds-form-* hook for it, as Input's helperSize
        has none.
      locked: false
  copy:
    summaryHeading:
      plural:
        by: count
        one: 1 problem with this form
        other: '{count} problems with this form'
      params:
        count:
          type: number
          description: How many fields failed validation.
    summaryHeadingOne: 1 problem with this form
    invalidSummary: This form has errors.
  a11y:
    role: form
    requires:
    - focus-visible
    - contrast-aa
    contrast:
    - foreground: color.foreground.danger
      background: color.background.subtle
      level: AA
  form:
    role: container
    discovery: context
  platforms:
    web:
      element: form
      attributes:
      - novalidate
      - aria-label
      - aria-labelledby
      notes: 'Native submit semantics — Enter in a field submits, and a Button with
        type=submit triggers it. `novalidate` is set so the system''s own error UI
        is used instead of browser bubbles. Fields register through React context
        (`discovery: context`); the `data-ds-field` attribute on each field element
        is used only to sort the registered fields into document order: Form finds
        each field''s host as getElementById(registered id).closest(''[data-ds-field]''),
        and fields with no such host go last in registration order. A field inside
        a closed Disclosure is left out because it unmounted and unregistered; Form
        does no Disclosure check of its own (web and rn).'
    lit:
      tag: ds-form
      reflect:
      - disabled
      notes: 'Wraps a native <form novalidate> in the shadow root, but form ownership
        is DOM-tree based, so slotted light-DOM ds-inputs are NOT owned by it. ds-form
        therefore collects its fields itself, by the `data-ds-field` attribute every
        field component sets on its host — never by a tag list, so a new field type
        needs no change here. This attribute discovery over the light-DOM subtree
        is the Lit form of `discovery: context`. A field with no useful blur moment
        (Checkbox, Switch) sets `data-ds-field="change"` and validates on change under
        `validate: blur`; every other field sets it empty. It submits on a composed
        `press` from a ds-button[type=submit] and on Enter in any `data-ds-field`
        field, except when the keydown originates in a textarea, a button or a link,
        and propagates `disabled` to the fields it found and to every ds-button slotted
        into `actions` (remembering which it disabled). `errorSummary` defaults to
        true, so its attribute is the negated `no-error-summary`. A field missing
        an `id` is given `{name}-{field.name}` at submit time so the error summary
        can link to it. Dispatches `submit` with `{ values }` and `invalid` with `{
        errors }` in detail. Never nest inside a native form. The summary reuses the
        web markup: role="alert" and tabindex="-1" on the errorSummary box, and each
        item Link has href="#<field id>" with the click default prevented, so the
        hash never changes.'
    rn:
      element: View
      props:
      - accessibilityLabel
      notes: 'No native form on iOS/Android. Form provides a context { register, unregister,
        submit, errors, validateMode, disabled, focusField }; fields call register(name,
        { label, getValue, validate, focus }) in mount order (name is the argument,
        not a handle property); a Button with type=submit calls submit(). Non-last
        fields get returnKeyType="next" (focusField), the last gets "done" (submit).
        Disabled Inputs do not register. On failed submit the summary is announced
        (accessibilityLiveRegion="assertive" on Android, announceForAccessibility
        on iOS) and focus moves to the summary when errorSummary is on, otherwise
        to the first invalid field — same as web. The iOS announcement is the summary
        heading followed by each item. The summary View is not itself `accessible`,
        so each item Link stays separately focusable, and accessibility focus moves
        to the summary heading Text. Each item Link has the field''s `name` as its
        href and an onPress that focuses the field and returns false, so nothing opens;
        each Link is nested in a `Text tone="danger"`, which is how the danger color
        reaches a `tone: inherit` Link on native. The View keeps role="form", which
        only has landmark meaning on react-native-web; iOS and Android have no form
        landmark, so accessibilityLabel naming the group is the native alternative.'
    swiftui:
      element: VStack
      props:
      - .onSubmit
      - .submitLabel
      - '@FocusState'
      - FormContext=environment
      - AccessibilityNotification
      notes: A `VStack` providing `FormContext` through the environment (`\.dsForm`);
        fields register on appear and unregister on disappear. Submit is the submit
        `Button` or the keyboard's return on the last field (`.onSubmit`); validation
        runs registered validators in order, the first failing field receives `@AccessibilityFocusState`
        focus and `copy.invalidSummary` is announced. `onInvalid` receives the failures;
        `onSubmit` the value map (`String | Bool | Double | [String] | ClosedRange<Double>`).
        Not SwiftUI's `Form` (a grouped-list style that fights the tokens).
  behavior:
  - name: label-names-the-form-landmark
    description: The form is a named landmark when label is given, which is what a
      page with more than one form needs (WCAG 1.3.1, 2.4.1).
    given:
      label: Sign in
    then:
    - role: form
      platforms:
      - web
      - lit
    - name: Sign in
      platforms:
      - web
      - lit
  examples:
  - name: sign-in
    description: The smallest real form - two fields and one submit action, validated
      on submit.
    given:
      name: sign-in
      label: Sign in
      children: A required Input name=email label=Email type=email and a required
        Input name=password label=Password type=password, in a Stack
      actions: A submit Button labelled Sign in
  - name: long-form-validated-on-blur
    description: A longer form where feedback per field as focus leaves it beats one
      report at the end.
    given:
      name: profile
      label: Profile details
      validate: blur
      children: A Stack of required Inputs name=fullName label=Full name, name=email
        label=Email type=email, name=phone label=Phone type=tel, name=city label=City
      actions: A submit Button labelled Save profile
  - name: submitting
    description: A form while its request is in flight - every field and action disabled,
      so it cannot be submitted twice.
    given:
      name: sign-in
      label: Sign in
      disabled: true
      children: A required Input name=email label=Email type=email and a required
        Input name=password label=Password type=password, in a Stack
      actions: A submit Button labelled Sign in
  - name: without-a-summary
    description: A short form that reports errors at the fields alone, moving focus
      to the first invalid one.
    given:
      name: rename
      label: Rename file
      errorSummary: false
      children: A required Input name=fileName label=File name
      actions: A submit Button labelled Rename
```

## Events

- `onSubmit`: emit `onSubmit`
  - payload, positional, in this order: `values: Record<string, string | number | boolean | string[] | [number, number]>`
  - fires on: user
- `onInvalid`: emit `onInvalid`
  - payload, positional, in this order: `errors: Record<string, string>`
  - fires on: user

## Parts and slots

- `container`: element
- `fields`: slot, `@ViewBuilder` parameter `children`, required
- `errorSummary`: element
- `actions`: slot, `@ViewBuilder` parameter `actions`, required

## Style bindings

- `errorSummaryBorder`: token `color.border.danger`; part `errorSummary`
- `errorSummaryText`: token `color.foreground.danger`; part `errorSummary`; locked
- `errorSummaryBackground`: token `color.background.subtle`; part `errorSummary`; locked
- `errorSummaryBorderWidth`: token `border.width.thin`; part `errorSummary`
- `errorSummaryRadius`: token `radius.md`; part `errorSummary`
- `errorSummaryPadding`: token `space.md`; part `errorSummary`
- `errorSummaryGap`: token `layout.gap.tight`; part `errorSummary`

## Form and overlay

```yaml
form:
  role: container
  discovery: context
```

## Copy

- `summaryHeading`: "{count} problems with this form"; params `count` (number); plural by `count`: one "1 problem with this form", other "{count} problems with this form"
- `summaryHeadingOne`: "1 problem with this form"
- `invalidSummary`: "This form has errors."

## Constants and examples

- example `sign-in`, story `SignIn`: given `name: "sign-in"`, `label: "Sign in"`, `children: "A required Input name=email label=Email type=email and a required Input name=password label=Password type=password, in a Stack"`, `actions: "A submit Button labelled Sign in"`; The smallest real form - two fields and one submit action, validated on submit.
- example `long-form-validated-on-blur`, story `LongFormValidatedOnBlur`: given `name: "profile"`, `label: "Profile details"`, `validate: "blur"`, `children: "A Stack of required Inputs name=fullName label=Full name, name=email label=Email type=email, name=phone label=Phone type=tel, name=city label=City"`, `actions: "A submit Button labelled Save profile"`; A longer form where feedback per field as focus leaves it beats one report at the end.
- example `submitting`, story `Submitting`: given `name: "sign-in"`, `label: "Sign in"`, `disabled: true`, `children: "A required Input name=email label=Email type=email and a required Input name=password label=Password type=password, in a Stack"`, `actions: "A submit Button labelled Sign in"`; A form while its request is in flight - every field and action disabled, so it cannot be submitted twice.
- example `without-a-summary`, story `WithoutASummary`: given `name: "rename"`, `label: "Rename file"`, `errorSummary: false`, `children: "A required Input name=fileName label=File name"`, `actions: "A submit Button labelled Rename"`; A short form that reports errors at the fields alone, moving focus to the first invalid one.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`, `errorSummaryBorder`, `errorSummaryBorderWidth`, `errorSummaryRadius`, `errorSummaryPadding`, `errorSummaryGap`
Locked (accessibility-bearing, never overridable): `errorSummaryText`, `errorSummaryBackground`

## Platform notes (swiftui)

```yaml
element: VStack
props:
- .onSubmit
- .submitLabel
- '@FocusState'
- FormContext=environment
- AccessibilityNotification
notes: A `VStack` providing `FormContext` through the environment (`\.dsForm`); fields
  register on appear and unregister on disappear. Submit is the submit `Button` or
  the keyboard's return on the last field (`.onSubmit`); validation runs registered
  validators in order, the first failing field receives `@AccessibilityFocusState`
  focus and `copy.invalidSummary` is announced. `onInvalid` receives the failures;
  `onSubmit` the value map (`String | Bool | Double | [String] | ClosedRange<Double>`).
  Not SwiftUI's `Form` (a grouped-list style that fights the tokens).
```

## Guidance

## Overview

Form is the container that makes fields behave as a group. It knows which fields exist, collects their values, runs validation at the configured moment, shows errors in a consistent way, and only calls `onSubmit` when everything is valid.

## When to use

Use Form whenever two or more fields are submitted together, and for any single field whose submission has consequences (sign-in, search with side effects). Place actions (submit, cancel) at the end in a Stack. Give the form a `label` when the page contains more than one.

## When not to use

Do not use Form for instant-apply settings (a Switch that saves on change) — those are not submitted. Do not nest forms. Do not use Form as a generic layout container; use Stack.

## Behavior

Submission is triggered by a Button with `type: submit`, by pressing Enter in a single-line field on web, or by the keyboard's done key on native. On submit, the form validates every field: `required` fields must have a value, fields with an `error` prop are invalid, and `invalid` fields are invalid. If anything fails, focus moves to the error summary (or the first invalid field when `errorSummary` is off), `onInvalid` fires with the errors, and `onSubmit` does not. Under `validate: submit`, nothing validates before the first submission; after a failed submission, fields re-validate on blur and change so errors clear as they are fixed. When a Form has an error summary, the Form announces errors and Inputs stay silent; a standalone Input announces its own error. If everything passes, `onSubmit` fires with values keyed by each field's `name` (see the event for the value contract). Fields are Input, Checkbox, Switch and RadioGroup — anything that registers with the Form. Each field owns its own messages: the Form renders a field's `copy.required` and never composes a message of its own. Under `validate: blur`, controls with no useful blur moment (Checkbox, Switch) validate on change, and RadioGroup validates when focus leaves the whole group. A field inside a closed Disclosure is not collected unless the Disclosure has `keepMounted`. Setting `disabled` while the request is in flight prevents double submission and is reflected on every field and action.

## Content guidelines

Name the submit action after the outcome ("Create account", not "Submit"). Order actions by importance in reading order on every platform: the primary submit Button first, then at most one `secondary` alternative such as "Cancel", so keyboard and screen-reader focus reaches the main action first and the two never compete visually. A destructive action ("Delete account") does not belong in the same Stack as Save; give it its own section further down. Never present Cancel as `ghost` next to a primary — the pairing reads as one real button and one afterthought. The error summary heading uses `copy.summaryHeading`, choosing the plural form by count in the locale of the nearest `lang` ancestor (web and Lit), falling back to the runtime default locale (and always the runtime default on RN); `copy.summaryHeadingOne` and `copy.invalidSummary` are not rendered on web, Lit or RN. Each item is a Link (`tone: inherit`, so the summary's danger text color reaches it) whose text is the field's own message, so users can act from the summary alone; activating it moves focus to the field and never navigates or changes the URL hash. The Link keeps its own focus ring and target size; Form adds none. Write any consumer `error` text so it names the field, as `copy.required` does. The heading is rendered as Text with `weight: semibold` and `tone: danger`, not a Heading, so it never disturbs the page outline.

## Accessibility

The form is a named landmark when `label` is given (WCAG 1.3.1, 2.4.1). Errors are identified in text at the field and, by default, in a summary that receives focus and links to each field (3.3.1, 3.3.3). Required fields are indicated in the label text, not only by color or an asterisk alone (1.4.1, 3.3.2). Validation on `submit` avoids interrupting users mid-entry; `blur` validation is available when earlier feedback is better. Everything is keyboard operable, including submission with Enter (2.1.1). No time limits are imposed by the form itself.

## Platform notes

### Web
Renders `<form novalidate>` and handles the native `submit` event, preventing default. The error summary is a `<div role="alert" tabindex="-1">` that receives focus on failed submission and contains links to each invalid field's id.

### Lit
`<ds-form label="Sign in">` wraps a native `<form>` in its shadow root with a default slot for fields and a named `actions` slot, but form ownership is DOM-tree based, so the slotted fields are not owned by it. The field value contract is `string | number | boolean | string[] | [number, number]` (numbers from NumberInput and Slider, arrays from multi-select Listbox, Select and Combobox, a pair from a range Slider or DatePicker), absent when empty. Form discovers fields by the `data-ds-field` attribute every field element carries (web and Lit), never by a tag list, so new field components are collected without touching Form. The field interface (`DsFormField`) has `error` and `validationMessage` as optional strings: a field that never validates (Switch) omits them, and Form treats absence as valid. Every field handle also carries its `label`, which the error summary shows when an invalid field has an empty message, on all three platforms (the RN `FormFieldHandle` includes `label` too). `DsFormField.currentValue` uses the same value contract. Each collected field implements the exported `DsFormField` interface — `name`, `label`, `required`, `disabled`, `error`, `currentValue`, `id`, `focus()`, `checkValidity()`, `validationMessage` (the field's own copy string, which the summary renders) — and Form skips fields without a `name` and fields inside a closed `ds-disclosure` without `keep-mounted`. Submits on a composed `press` from a `ds-button[type=submit]` and on Enter in any field unless the keydown originates in a textarea, a button or a link (it listens for `keydown` on the host, never for a CustomEvent named after a native event; blur validation uses `focusout`). Fields must validate synchronously: setting `error` updates `invalid` and the ElementInternals validity at once, so `checkValidity()` is correct immediately afterwards. Dispatches composed `submit` (`detail.values`, same contract as web) and `invalid` CustomEvents; the component never navigates.

### React Native
There is no form element. Form renders a `View` with `accessibilityLabel` and provides a React context; each field calls `register(name, { label, getValue, validate, focus })` on mount; `getValue` returns a value from the `onSubmit` contract (string, number, boolean, string array or number pair) or `undefined` (omitted from the values). A Switch always validates as valid. A Button with `type: submit` calls `submit()` from the context. The last Input gets `returnKeyType="done"` and `onSubmitEditing` wired to submit. The error summary uses `accessibilityLiveRegion="assertive"` on Android and `AccessibilityInfo.announceForAccessibility` on iOS, then moves focus with `AccessibilityInfo.setAccessibilityFocus` to the summary when `errorSummary` is on, otherwise to the first invalid field.

## Related

Input, Button, Stack, Link, Text.

## Behavior scenarios (4)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-validate-submit
  given:
    validate: submit
  then:
  - renders: true
  derived: true
- name: renders-validate-blur
  given:
    validate: blur
  then:
  - renders: true
  derived: true
- name: renders-validate-change
  given:
    validate: change
  then:
  - renders: true
  derived: true
```
