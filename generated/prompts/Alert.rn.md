# Generate: Alert for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Alert.tsx` exporting a typed React Native function component named `Alert`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `AlertProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Alert> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Alert.test.tsx`.

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
      description: 'What kind of message this is. Sets the colors and the icon, which
        together convey the tone without relying on color. There is deliberately no
        `neutral` tone: every value here says something about urgency, and a message
        that says nothing about urgency is not an Alert.'
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
      description: Body text. It reaches a string body directly; a body composed of
        Text or Link children keeps its own sizing, since a composite never restyles
        a child.
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
        where supported and aria-label with the text otherwise — ids never cross the
        shadow root, so a literal aria-label is the fallback, not an idref. Shadow
        parts carry the anatomy names in kebab-case (`dismiss-button`, not `dismiss`).'
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
        text. The dismiss button is the system Button. Native cannot move focus to
        an arbitrary element, so the focus-onward step the web and Lit builds perform
        on dismiss is skipped here; the dismiss Button is inside the alert and its
        own removal returns focus to the enclosing screen, which is the native equivalent.
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
- `body`: slot, prop `children`, required
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

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `border`, `borderWidth`, `radius`, `padding`, `gap`, `partGap`, `iconSize`, `headingSize`, `headingWeight`, `fontFamily`, `fontSize`, `lineHeight`, `dismissMargin`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `bodyColor`, `icon`

## Behavior scenarios (11)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityRole=alert
- accessibilityLiveRegion
- accessibilityLabel
notes: "live=alert \u2192 accessibilityRole=\"alert\" and accessibilityLiveRegion=\"\
  assertive\"; status \u2192 accessibilityLiveRegion=\"polite\"; off \u2192 neither.\
  \ iOS ignores live regions, so with live\u2260off call AccessibilityInfo.announceForAccessibility\
  \ on mount and again whenever heading or body change (a changed message is a new\
  \ message). The label is heading + body when body is a string; otherwise heading\
  \ only \u2014 a body that is not plain text should carry its own accessible text.\
  \ The dismiss button is the system Button. Native cannot move focus to an arbitrary\
  \ element, so the focus-onward step the web and Lit builds perform on dismiss is\
  \ skipped here; the dismiss Button is inside the alert and its own removal returns\
  \ focus to the enclosing screen, which is the native equivalent."
```

## Guidance

## Overview

An alert is the system speaking to the user inside the page: "this saved", "this failed", "this is about to expire". It stays where it is until the user has dealt with it or dismissed it, unlike a Toast (planned), which leaves on its own. Its tone is set by color, by an icon, and by the announcement role, so no single channel carries the meaning.

## When to use

Use an Alert for a message that relates to the current view and should stay visible: a failed save above the form, an expiring trial at the top of a screen, a success confirmation after submit, a note that some features are unavailable offline. Choose `tone` by what the user should do: `info` to know, `success` to relax, `warning` to be careful, `danger` to fix something. Use `dismissible` for messages the user can safely put away; leave persistent problems undismissable.

## When not to use

Do not use an Alert for field-level validation; Input and the form controls render their own errors, and Form renders the summary. Do not use it for transient confirmations that need no action; use Toast (planned). Do not use it as a callout for general prose ("Tip: …") in documentation; that is a Note (planned) with no live semantics. A toneless statement of fact — "this component is not generated yet" — is that same Note; until Note exists use `info` and accept that it reads as information, rather than reaching for a `neutral` tone Alert does not have. Do not stack more than two alerts in a view; combine or prioritise.

## Behavior

An Alert rendered with `live: status` or `alert` is announced by screen readers when it appears in the tree, without moving focus. An Alert present at load with `live: off` is read in sequence like any content. The dismiss button fires `onDismiss` and the consumer removes the alert. Because activation happens inside the alert, the component first moves focus to the next focusable element after the alert in reading order (or to the previous one when there is none), so focus is never lost when the alert disappears; if nothing outside the alert is focusable, focus is left alone. On native, focus cannot be moved programmatically to an arbitrary element, an acknowledged limit. Alerts never auto-dismiss and never animate in — a message that fades or slides is a Toast.

## Content guidelines

The heading says what happened in a few words ("Changes saved", "Payment failed"); the body says what it means and what to do next, in one or two sentences, with a Link if there is somewhere to go. Do not restate the tone in the heading ("Error: …", "Warning!") — the icon and role carry it, and screen readers already announce `alert` as an alert. Do not use exclamation marks. `danger` alerts are the only ones where the body may start with the cause.

## Accessibility

The message is announced when it appears, politely for `status` and immediately for `alert` (WCAG 4.1.3 Status Messages), and it is never used to move focus (3.2.1). Tone is conveyed by the icon shape and the heading, not only by color (1.4.1). Heading, body, links, the dismiss button and icon meet contrast on the tinted background in both modes — 4.5:1 for text and 3:1 for the icon (1.4.3, 1.4.11); the build checks every tone. The region is named by its own content — `aria-labelledby` the heading when there is one, otherwise the body element (on native, `accessibilityLabel`) — so the alert has a name in the accessibility tree without inventing one that repeats the tone. The dismiss button has an accessible name from `copy.dismissLabel`, visible focus, and a 24px target (2.4.7, 2.5.8). Only `danger` and blocking `warning` alerts use `live: alert`; interrupting for good news is a real cost to screen-reader users.

## Platform notes

### Web
Render `<div role={live === 'off' ? undefined : live}>` — `role="status"` implies `aria-live="polite"` and `role="alert"` implies assertive, so set only the role. Inside: the icon (`aria-hidden` inline SVG), a content column with the heading as a `<p>` in `headingWeight` and `foreground` (a raw element, not Text, which has no status tones; and not a heading element, so it does not disturb the outline) and the body, and, when dismissible, the system Button (`ghost`, `size: sm`, `iconOnly`, label `copy.dismissLabel`, a 1em × glyph as `leadingIcon`) pulled into the corner with `dismissMargin`. The `heading` prop must not be forwarded as the native `title` attribute. Colors come from the `{tone}` bindings; use `border` on all sides at `borderWidth`.

### Lit
`<ds-alert tone="danger" live="alert" heading="Payment failed">` sets `role` on the host via `ElementInternals` so the live region is the host itself, which assistive technology sees in the light DOM. The body is the default slot and `heading` is a property (or a named `heading` slot for rich headings). Dispatch a composed `dismiss` CustomEvent (stop the inner `press`); the consumer removes the element. The dismiss `<ds-button>` is used unchanged — no `::part` restyling. Reflect `tone`, `live` and `dismissible`.

### React Native
Render a `View` with `accessibilityRole="alert"` when `live` is `alert`, `accessibilityLiveRegion="assertive"` or `"polite"` by `live`, and `accessibilityLabel` = heading + body (when body is a string) so the whole message is one announcement. iOS does not honour live regions: in an effect on mount, when `live !== 'off'`, call `AccessibilityInfo.announceForAccessibility()` with the heading and body joined by a full stop, and again whenever they change. Apply `background`, `border` and `radius` from the tone tokens; render the icon with the `icon` color and `accessibilityElementsHidden`. The dismiss button is the system Button (`ghost`, `sm`, `iconOnly`, with a × glyph as `leadingIcon`), pulled into the corner with `dismissMargin`.

## Related

Form, Toast (planned), Note (planned), Dialog (planned).
