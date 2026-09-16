# Generate: ProgressBar for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/ProgressBar.tsx` exporting a typed React Native function component named `ProgressBar`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `ProgressBarProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof ProgressBar> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `ProgressBar.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: ProgressBar
  category: feedback
  status: review
  anatomy:
  - container
  - header
  - label
  - valueText
  - track
  - fill
  composition:
    label:
      component: Text
      props:
        element: span
        size: sm
        weight: medium
        tone: default
      forwards:
        labelSize: fontSize
        labelWeight: fontWeight
        fontFamily: fontFamily
        lineHeight: lineHeight
    valueText:
      component: Text
      props:
        element: span
        size: sm
        tone: muted
      forwards:
        valueSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
  props:
    label:
      type: string
      required: true
      description: What is progressing ("Uploading photos", "Importing contacts").
        Visible unless `hideLabel`.
      a11y: 'The accessible name: aria-labelledby on web, aria-label on the Lit host
        (ids do not cross the shadow root), accessibilityLabel on React Native. An
        empty label leaves the bar unnamed, with no development warning.'
    value:
      type: number
      description: Progress so far, between `min` and `max`. Omit (undefined or null)
        for an indeterminate bar (the end is unknown). Clamped to `min`…`max` for
        the fill, the accessible value, `formatValue`'s argument and the announcement
        tiers; a non-finite number (NaN, Infinity) is treated as `min`.
    min:
      type: number
      default: 0
      description: Start of the range.
    max:
      type: number
      default: 100
      description: End of the range.
    formatValue:
      type: function
      shape: '(value: number, min: number, max: number) => string'
      description: 'Renders the value text ("42%", "3 of 12 files"). Defaults to a
        percentage over the whole range — `(value − min) / (max − min)` — the same
        arithmetic the fill uses, so a non-zero `min` reads correctly without a custom
        formatter, rounded to a whole number: `Intl.NumberFormat(locale, { style:
        ''percent'', maximumFractionDigits: 0 })`, as Meter does (99.5% of the way
        shows "100%" before completion; completion is only the clamped value reaching
        `max`). Called with the clamped value. Rounding is for the text only; the
        fill uses the exact fraction. A `max` at or below `min` is not a range: the
        bar renders empty, exposes aria-valuenow / accessibilityValue.now = `min`
        with the given bounds, shows and exposes "0%" unless a custom formatter says
        otherwise, makes no progress or completion announcements, and warns in development.'
    showValue:
      type: boolean
      default: true
      description: Show the value text at the end of the label row. Ignored when indeterminate.
        Lit attribute is the negated boolean `hide-value` (reflected), since an attribute
        can only turn things on.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name). For bars
        inside a Card whose heading already says what is happening. The value text,
        when shown, stays at the end of the row; when there is no visible value text
        either, the label row takes no space and `partGap` is not applied.
    tone:
      type: enum
      enumRef: tone
      values:
      - neutral
      - success
      - danger
      default: neutral
      description: 'Neutral while running; `success` at completion, `danger` when
        the task failed part-way. Paired with a text status elsewhere: the color is
        never the only signal.'
    announce:
      type: enum
      values:
      - none
      - milestones
      - complete
      default: complete
      description: 'What a screen reader hears without focusing the bar: nothing,
        every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`,
        and `copy.indeterminate` is announced once each time the bar enters the indeterminate
        state. A value that moves backward resets the tiers already announced, so
        a retried task announces its progress again on the way up. The full announcement
        rules are under Behavior.'
  events: {}
  styles:
    track:
      token: color.background.strong
      part: track
      locked: false
    fill:
      token: color.control.selectedBackground
      part: fill
      description: Neutral fill. The selected-control color is guaranteed 3:1 against
        the page.
      locked: true
    fillSuccess:
      token: color.status.success.icon
      part: fill
      locked: true
    fillDanger:
      token: color.status.danger.icon
      part: fill
      locked: true
    trackHeight:
      token: space.2
      part: track
      locked: false
    radius:
      token: radius.full
      part: track
      description: Rounds the track and the fill ends; the track clips the fill (overflow
        hidden).
      locked: false
    labelColor:
      token: color.foreground
      part: label
      description: Realised by the label Text's tone default; no hook of its own.
      locked: true
    labelSize:
      token: font.size.sm
      part: label
      description: Forwarded to the label Text's fontSize override.
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text's fontWeight override.
      locked: false
    valueColor:
      token: color.foreground.muted
      part: valueText
      description: Realised by the value Text's tone muted; no hook of its own.
      locked: true
    valueSize:
      token: font.size.sm
      part: valueText
      description: Forwarded to the value Text's fontSize override.
      locked: false
    fontFamily:
      token: font.family.body
      part: header
      description: Forwarded to both Texts' fontFamily overrides; never styles them
        directly.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: header
      description: Forwarded to both Texts' lineHeight overrides; never styles them
        directly.
      locked: false
    partGap:
      token: space.1
      part: container
      description: Vertical gap between the label row (header) and the track.
      locked: false
    labelGap:
      token: space.2
      part: header
      description: Horizontal gap between the label and the value text in the header
        row.
      locked: false
    transition:
      token: motion.duration.base
      part: fill
      description: Fill inline-size change with motion.easing.standard; instant under
        reduced motion.
      locked: false
    indeterminateLoop:
      token: motion.duration.loop
      part: fill
      description: 'The indeterminate sweep: a fill one third of the track width travelling
        from the inline start to the inline end (right to left in RTL) and repeating,
        starting and ending wholly outside the track. Under reduced motion there is
        no sweep: the fill is drawn static and full-width at opacity.disabled, keeping
        its tone color.'
      locked: false
    sweepEasing:
      token: motion.easing.standard
      part: fill
      description: Easing of each indeterminate sweep on every platform. The fill
        is off the track at both ends of the loop, so the eased restart has no visible
        seam.
      locked: false
  copy:
    progress: '{label}: {value}'
    complete: '{label}: complete'
    indeterminate: '{label}: in progress'
  a11y:
    role: progressbar
    requires:
    - accessible-name
    - contrast-aa
    - live-region
    - reduced-motion
    contrast:
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.status.success.icon
      background: color.background
      level: AA
      nonText: true
    - foreground: color.status.danger.icon
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=progressbar
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      - aria-busy
      notes: 'role="progressbar" sits on the track <div>, with aria-labelledby (the
        label Text''s id), aria-valuenow/min/max and aria-valuetext from formatValue;
        data-ds sits on the root wrapper, a plain container with no role — they are
        different elements. An indeterminate bar keeps aria-valuemin/max, omits aria-valuenow
        and aria-valuetext, and sets aria-busy="true" on the track. The indeterminate
        sweep mirrors its keyframes under :dir(rtl). Announcements go through a visually-hidden
        `role="status" aria-live="polite"` region next to the bar, updated per `announce`.
        Not <progress>: it cannot be themed consistently and its indeterminate animation
        ignores reduced motion in some browsers.'
    lit:
      tag: ds-progress-bar
      reflect:
      - tone
      - hide-label
      - prop: showValue
        attribute: hide-value
      - announce
      notes: 'role="progressbar" and aria-valuenow/min/max/text are plain reflected
        attributes on the host, not ElementInternals — the accessible-value tooling
        reads attributes, and real assistive technology treats the two identically.
        The host is named by aria-label mirrored from `label` (aria-labelledby cannot
        reach the label inside the shadow root); an empty label removes aria-label.
        Indeterminate: aria-valuemin/max stay, aria-valuenow and aria-valuetext are
        removed, aria-busy="true". `showValue` is the negated attribute `hide-value`.
        The sweep mirrors its keyframes under :host(:dir(rtl)). The live region is
        in the shadow root and carries role="status" beside aria-live="polite"; it
        is not an anatomy part and takes no `part`.'
    rn:
      element: View
      props:
      - accessibilityRole=progressbar
      - accessibilityLabel
      - accessibilityValue
      notes: 'Drawn with Views (Animated.View width for the fill; the indeterminate
        sweep is an Animated loop that is not started under reduced motion — the fill
        is then drawn full-width at opacity.disabled — and eases with `sweepEasing`
        via Easing.bezier; it runs toward the left when I18nManager.isRTL). No disabled
        state and no keyboard interaction: the bar is never focusable (focusable={false}),
        and screen-reader users learn progress from the announcements. accessibilityValue={{
        min, max, now, text }} — an indeterminate bar carries min and max only, never
        a `now` or a `text` that would name a progress it does not know, and sets
        accessibilityState={{ busy: true }}, the native form of aria-busy. Announcements
        via AccessibilityInfo.announceForAccessibility per `announce`.'
    swiftui:
      element: ProgressView
      props:
      - ProgressView
      - .progressViewStyle=custom
      - .accessibilityValue
      - .accessibilityLabel
      - AccessibilityNotification
      - TimelineView
      notes: '`ProgressView(value:total:)` with a package `ProgressViewStyle` drawing
        the track and fill from the tokens (indeterminate when `value` is nil: a sweep
        driven by `TimelineView`, replaced under reduced motion by the fill drawn
        static and full-width at opacity.disabled). VoiceOver gets the label and `.accessibilityValue(formatValue)`
        from the style''s configuration; announcements per `announce` (milestones/complete/indeterminate
        copy) through `AccessibilityNotification.Announcement`. `tone` recolors the
        fill only.'
  behavior:
  - name: the-bar-reports-its-value-and-range
    description: A determinate bar exposes aria-valuenow, aria-valuemin and aria-valuemax
      on its progressbar element.
    given:
      value: 42
      min: 0
      max: 100
    then:
    - role: progressbar
    - attribute: aria-valuenow
      is: '42'
    - attribute: aria-valuemin
      is: '0'
    - attribute: aria-valuemax
      is: '100'
    platforms:
    - web
  - name: the-bar-is-never-focusable
    description: Progress is learned from the live region, not by focusing the bar.
    then:
    - focusable: false
    platforms:
    - web
    - lit
  - name: a-hidden-label-is-still-the-accessible-name
    description: hideLabel takes the label out of view, not out of the accessibility
      tree.
    given:
      hideLabel: true
    then:
    - name: true
    platforms:
    - web
    - rn
  - name: the-label-names-the-task
    description: The label says what is progressing, with a verb.
    given:
      label: Importing contacts
    then:
    - text: Importing contacts
  examples:
  - name: upload
    description: A determinate bar with the value text beside the label.
    given:
      label: Uploading photos
      value: 42
  - name: long-import
    description: A long task that announces every 25%, for a user who may leave and
      come back.
    given:
      label: Importing contacts
      value: 10
      announce: milestones
  - name: finished
    description: A completed bar recolored to success, with the text that says so
      beside it.
    given:
      label: Export
      value: 100
      tone: success
  - name: in-a-card
    description: A bar whose Card heading already says what is happening, so the label
      is hidden and the value left off.
    given:
      label: Rendering preview
      value: 60
      hideLabel: true
      showValue: false
```

## Parts and slots

- `container`: element
- `header`: element
- `label`: component `Text`; props `element` = "span", `size` = "sm", `weight` = "medium", `tone` = "default"; forwards `labelSize` → `overrides.fontSize`, `labelWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `valueText`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "muted"; forwards `valueSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `track`: element
- `fill`: element

## Style bindings

- `track`: token `color.background.strong`; part `track`
- `fill`: token `color.control.selectedBackground`; part `fill`; locked
- `fillSuccess`: token `color.status.success.icon`; part `fill`; locked
- `fillDanger`: token `color.status.danger.icon`; part `fill`; locked
- `trackHeight`: token `space.2`; part `track`
- `radius`: token `radius.full`; part `track`
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelSize`: token `font.size.sm`; part `label`
- `labelWeight`: token `font.weight.medium`; part `label`
- `valueColor`: token `color.foreground.muted`; part `valueText`; locked
- `valueSize`: token `font.size.sm`; part `valueText`
- `fontFamily`: token `font.family.body`; part `header`
- `lineHeight`: token `font.lineHeight.normal`; part `header`
- `partGap`: token `space.1`; part `container`
- `labelGap`: token `space.2`; part `header`
- `transition`: token `motion.duration.base`; part `fill`
- `indeterminateLoop`: token `motion.duration.loop`; part `fill`
- `sweepEasing`: token `motion.easing.standard`; part `fill`

## Constants and examples

- example `upload`, story `Upload`: given `label: "Uploading photos"`, `value: 42`; A determinate bar with the value text beside the label.
- example `long-import`, story `LongImport`: given `label: "Importing contacts"`, `value: 10`, `announce: "milestones"`; A long task that announces every 25%, for a user who may leave and come back.
- example `finished`, story `Finished`: given `label: "Export"`, `value: 100`, `tone: "success"`; A completed bar recolored to success, with the text that says so beside it.
- example `in-a-card`, story `InACard`: given `label: "Rendering preview"`, `value: 60`, `hideLabel: true`, `showValue: false`; A bar whose Card heading already says what is happening, so the label is hidden and the value left off.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `track`, `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `labelGap`, `transition`, `indeterminateLoop`, `sweepEasing`
Locked (accessibility-bearing, never overridable): `fill`, `fillSuccess`, `fillDanger`, `labelColor`, `valueColor`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: a-hidden-label-is-still-the-accessible-name
  description: hideLabel takes the label out of view, not out of the accessibility
    tree.
  given:
    hideLabel: true
  then:
  - name: true
  platforms:
  - web
  - rn
- name: the-label-names-the-task
  description: The label says what is progressing, with a verb.
  given:
    label: Importing contacts
  then:
  - text: Importing contacts
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-neutral
  given:
    tone: neutral
  then:
  - renders: true
  derived: true
- name: renders-tone-success
  given:
    tone: success
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-announce-none
  given:
    announce: none
  then:
  - renders: true
  derived: true
- name: renders-announce-milestones
  given:
    announce: milestones
  then:
  - renders: true
  derived: true
- name: renders-announce-complete
  given:
    announce: complete
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityRole=progressbar
- accessibilityLabel
- accessibilityValue
notes: "Drawn with Views (Animated.View width for the fill; the indeterminate sweep\
  \ is an Animated loop that is not started under reduced motion \u2014 the fill is\
  \ then drawn full-width at opacity.disabled \u2014 and eases with `sweepEasing`\
  \ via Easing.bezier; it runs toward the left when I18nManager.isRTL). No disabled\
  \ state and no keyboard interaction: the bar is never focusable (focusable={false}),\
  \ and screen-reader users learn progress from the announcements. accessibilityValue={{\
  \ min, max, now, text }} \u2014 an indeterminate bar carries min and max only, never\
  \ a `now` or a `text` that would name a progress it does not know, and sets accessibilityState={{\
  \ busy: true }}, the native form of aria-busy. Announcements via AccessibilityInfo.announceForAccessibility\
  \ per `announce`."
```

## Guidance

## Overview

A progress bar answers "how much longer": it moves as the work moves, and it ends. If the value is a measurement that could go up or down — storage used, signal strength — it is a Meter, not a progress bar.

## When to use

Use a ProgressBar for a task the interface started and can see through to the end: uploads, downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value` whenever the total is known; use the indeterminate form only until the total is known, then switch. Set `announce: milestones` for long tasks the user may leave and come back to; `complete` (the default) is right for anything under a minute.

## When not to use

Do not use it for a measured quantity (Meter), for a value the user sets (Slider), or for a brief wait of a second or two where a busy state on the Button that started it is enough. Do not use an indeterminate bar for longer than a few seconds without text saying what is happening. Do not stack several bars for one task; show the current step's bar and the overall step count in text.

## Behavior

The fill width follows the clamped `value` as a fraction of the range, animated over `transition`. Indeterminate bars sweep continuously (inline start to inline end, mirrored in RTL) and expose `aria-busy`. When `value` reaches `max` the bar stays full and, if `announce` is not `none`, `copy.complete` is announced once. Changing `tone` to `success` or `danger` recolors the fill only — the containing view is responsible for the text that says the task finished or failed. The bar itself is never focusable. The live region is `role="status"` (plain attributes on Lit, not ElementInternals) and is not an anatomy part.

The label row (header) is a horizontal row with the label at the inline start and the value text at the inline end, `labelGap` apart. `hideLabel` hides the label visually but the value text stays at the end; with no visible label and no visible value text the row takes no space.

Announcements follow these rules on every platform:

- **Tiers.** The tier is `floor(fraction × 4)` of the clamped value (74.6% is tier 2, 75% is tier 3); tier 4 is `max`. Tiers are tracked for every `announce` value, including `none`, so switching `announce` mid-task never replays tiers already passed.
- **Milestones.** With `milestones`, entering a higher tier 1–3 announces `copy.progress` once. An update that crosses several tiers makes one announcement for the highest, with the current value. Reaching `max` announces `copy.complete`, never `copy.progress` with "100%"; `complete` announces only that.
- **`{value}`** is the formatted value text — `formatValue(clamped, min, max)`, the same string as aria-valuetext / accessibilityValue.text — not the raw number.
- **Mount.** The tier and completion reached at mount are recorded silently: a bar that mounts at 60% or at `max` announces nothing. A bar that mounts indeterminate has entered that state, so `copy.indeterminate` is announced once after mount (unless `announce` is `none`), as it is each later time `value` becomes undefined.
- **Backward.** A value that moves to a lower tier resets the record to the new value's tier: moving from 80% to 60% makes 75% and completion announceable again without re-announcing 50%. Dropping below `max` re-arms `copy.complete`.
- **Repeats.** An announcement is spoken even when its text equals the previous one (indeterminate twice, a retried task completing again): web and Lit replace the live region's message node rather than setting the same text; React Native calls `announceForAccessibility` again.
- **Invalid range.** With `max ≤ min` no progress or completion is announced; `copy.indeterminate` still is.

## Content guidelines

Labels name the task in progress with a verb ("Uploading 12 photos"), and the value text says how far in the units people think in — files, steps, or percent — via `formatValue`. When the task fails, keep the bar (at `danger`) and put the error in an Alert beside it, not in the bar's label.

## Accessibility

The bar is a `progressbar` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (WCAG 4.1.2; APG progressbar), named by its label even when the label is visually hidden. Because the bar is not focusable, screen-reader users only learn about progress through the live region, which is why `announce` exists and defaults to completion (4.1.3). Motion is the fill's width change and the indeterminate sweep; both stop under reduced motion (2.3.3). Tone is reinforced by text elsewhere, never color alone (1.4.1); the fill meets 3:1 against the page (1.4.11).

## Platform notes

### Web
Render a root wrapper (`data-ds`, no role, gap `partGap`) containing the header row (`data-part="header"`, flex row, `justify-content: space-between`, gap `labelGap`) — a `Text element="span" size="sm" weight="medium" tone="default"` with id (visually hidden under `hideLabel`) and, when `showValue` and determinate, a `Text element="span" size="sm" tone="muted"` with the value text, each receiving its forwarded overrides — then the track `<div>` and fill `<div>` with `inline-size` from the clamped fraction. `role="progressbar"` sits on the track, never the root, with `aria-labelledby`, `aria-valuenow/min/max/text` (when indeterminate keep `aria-valuemin/max`, omit `aria-valuenow` and `aria-valuetext`, and set `aria-busy="true"`). A visually-hidden `<div role="status" aria-live="polite">` beside the bar receives the announcements described under Behavior. The indeterminate sweep is a CSS keyframe on the fill (`translateX` from -100% to 300% over `indeterminateLoop` with `sweepEasing`, reversed under `:dir(rtl)`), replaced under `prefers-reduced-motion` by a static fill at `opacity.disabled` covering the whole track.

### Lit
`<ds-progress-bar label="Uploading" value="42"></ds-progress-bar>`; `role="progressbar"`, `aria-label` (from `label`) and the aria values as plain attributes on the host, not `ElementInternals`; the same header, track and fill structure as web in the shadow root, with composed `ds-text` elements; live region in the shadow root; `tone`, `hide-label`, `hide-value` and `announce` reflected.

### React Native
`View` track with an `Animated.View` fill whose width animates to the fraction (`useNativeDriver: false` for width; duration from `transition`, zero under reduced motion). Header row: a `View` with `flexDirection: 'row'`, `justifyContent: 'space-between'` and gap `labelGap` holding the two `Text`s. Indeterminate: an `Animated.loop` translating a one-third-width fill with `sweepEasing`, not started when `useReducedMotion()`; instead the fill is drawn full-width at `opacity.disabled`. `accessibilityRole="progressbar"`, `accessibilityValue`, and `AccessibilityInfo.announceForAccessibility` per `announce`.

## Related

Meter, Alert, Button, Toast.
