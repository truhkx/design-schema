# Generate: Tooltip for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Tooltip.tsx` exporting a typed React Native function component named `Tooltip`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `TooltipProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Tooltip> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Tooltip.test.tsx`.

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
  name: Tooltip
  category: overlay
  status: review
  apg: tooltip
  anatomy:
  - trigger
  - popup
  - text
  composition:
    text: Text
  parts:
    trigger:
      kind: slot
      slot:
        default: true
        prop: children
        required: true
  props:
    content:
      type: string
      required: true
      description: The tooltip text. One short phrase or sentence; no markup, no links,
        no line breaks.
    children:
      type: content
      required: true
      description: Exactly one focusable element (a Button, Link, Input). The tooltip
        attaches to it; a non-focusable child is an error, because keyboard users
        could never see the tooltip.
      a11y: The child must be focusable so hover and focus are equivalent (WCAG 1.4.13,
        2.1.1).
    placement:
      type: enum
      values:
      - top
      - bottom
      - start
      - end
      default: top
      description: Preferred side; flips when it would overflow the viewport (on native,
        measured with measureInWindow like Popover). `start`/`end` are logical and
        mirror in right-to-left writing.
    describes:
      type: boolean
      default: true
      description: '`true`: the tooltip is supplementary and becomes the child''s
        accessible description (aria-describedby). `false`: the tooltip IS the child''s
        name (an icon-only button whose label equals the tooltip) and is linked as
        aria-labelledby instead — set this when the child has no visible text and
        its `label` equals `content`, to avoid announcing it twice.'
    open:
      type: boolean
      description: 'Controlled visibility, for stories and tests only (the Keyboard
        story renders the tooltip open with it). Product code never sets it: a tooltip
        is hover and focus driven.'
    delay:
      type: enum
      values:
      - default
      - none
      default: default
      description: 'Hover delay before showing: `default` uses `motion.duration.base`
        × 3 (roughly 600ms, so casual mouse movement does not flash tooltips); `none`
        for toolbars where a sibling tooltip is already open (a shared "warm" state
        so moving along a toolbar shows tooltips instantly: after a tooltip hides,
        siblings show with no delay for one motion.duration.loop; the pointer may
        cross to the tooltip within one motion.duration.fast before it hides).'
  keyboard:
  - keys:
    - Escape
    action: Hides the tooltip without moving focus.
    when: tooltip visible
    from: trigger
    expect:
    - closes
    - focus-unchanged
  styles:
    surface:
      token: color.inverse.surface
      description: 'Inverted: the tooltip is dark on light mode and light on dark
        mode, so it reads as a label, not a panel.'
      locked: true
    text:
      token: color.inverse.foreground
      part: text
      description: Text's `color` is locked and its tones have no inverse value, so
        the bubble re-scopes the foreground on its own container and composes Text
        unchanged — the mechanism Text's own color binding names, not an override
        and not a restyle.
      locked: true
    radius:
      token: radius.sm
      locked: false
    paddingBlock:
      token: space.1
      locked: false
    paddingInline:
      token: space.2
      locked: false
    offset:
      token: space.1
      description: Gap between trigger and tooltip.
      locked: false
    maxWidth:
      token: space.20
      computed:
        times: 3
      description: Longer text wraps.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.sm
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    shadow:
      token: shadow.raised
      locked: false
    layer:
      token: layer.toast
      description: Tooltips sit above everything, including dialogs, because they
        describe controls inside them.
      locked: false
    enter:
      token: motion.duration.fast
      description: Fade in; instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
  constants:
    hoverDelay:
      description: Delay before a hovered trigger shows its tooltip, when `delay`
        is `default`.
      token: motion.duration.base
      multiply: 3
      unit: ms
    warmWindow:
      description: How long after one tooltip hides the next sibling still shows with
        no delay — the "warm" toolbar window.
      token: motion.duration.base
      unit: ms
    pointerGrace:
      description: How long the tooltip stays while the pointer crosses the `offset`
        gap between the trigger and the bubble, so a hoverable tooltip can be reached
        (WCAG 1.4.13).
      token: motion.duration.fast
      unit: ms
  overlay:
    layer: tooltip
    anchor: trigger
    placement: placement
    collision: flip
    open: open
    dismiss:
    - escape
    modal: false
  a11y:
    role: tooltip
    requires:
    - escape-dismiss
    - keyboard-operable
    - contrast-aa
    - reduced-motion
    - no-hover-only
    contrast:
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=tooltip
      - id
      - aria-describedby
      - aria-labelledby
      notes: 'The child is cloned with aria-describedby (or aria-labelledby) pointing
        at the tooltip id and with mouseenter/mouseleave/focus/blur handlers merged.
        The tooltip <div role="tooltip"> is rendered through a portal, position: fixed
        from the trigger rect, flipped on overflow, on layer.toast. It stays open
        while the pointer is over the tooltip itself (1.4.13 hoverable) and hides
        on Escape (dismissable) or when the trigger loses hover and focus. Never shown
        on touch (no hover); the description is still in the accessibility tree. The
        description is always in the accessibility tree: `content` is rendered in
        a visually-hidden element that aria-describedby points at, and the visible
        popup is a second copy — so the Popover API''s display:none while closed does
        not remove the description.'
    lit:
      tag: ds-tooltip
      reflect:
      - placement
      - prop: describes
        attribute: no-describes
      notes: Wraps the slotted trigger; because aria-describedby cannot cross the
        shadow boundary, the tooltip element is rendered in the light DOM as a sibling
        of the trigger (appended to the host, not the shadow root) so the ID reference
        resolves. Positioning via the Popover API (popover="manual") with a fixed
        fallback. As on web, aria-describedby targets a visually-hidden copy of the
        content that is always present; the popover is the visible copy.
    rn:
      element: View
      props:
      - accessibilityHint
      - accessibilityLabel
      notes: 'There is no hover on touch, so no tooltip surface is shown by default:
        `content` becomes the child''s accessibilityHint (or accessibilityLabel when
        describes=false). On long-press the text is shown in a small transient View
        above the child for the duration of the press, as a sighted-user aid. On react-native-web,
        hover and focus behave as on web. This is the acknowledged platform difference;
        the information is never hover-only anywhere. The child must accept `accessibilityHint`/`accessibilityLabel`
        and the `onHoverIn`/`onHoverOut`/`onFocus`/`onBlur`/`onLongPress` handlers
        Tooltip clones onto it; the system Button, Link and Input forward these to
        their native element. Placement flips using measureInWindow.'
    swiftui:
      element: Group
      props:
      - .accessibilityHint
      - .onLongPressGesture
      - .popover
      - .onHover
      - .accessibilityHidden
      notes: There is no tooltip on iOS. The `content` is forwarded to the trigger
        as `.accessibilityHint` (VoiceOver reads it after the label), and the bubble
        itself shows on long-press (touch) and pointer hover (iPad) as a `.popover`
        with `.presentationCompactAdaptation(.popover)` so it never becomes a sheet,
        positioned by `placement`, dismissed on release/leave or Escape. The bubble
        is `.accessibilityHidden(true)` — the hint already carries the text. Delays
        from the timing tokens; none under reduced motion.
  behavior:
  - name: the-visible-tooltip-carries-the-tooltip-role
    description: When shown, the bubble is a role=tooltip element linked to the trigger
      (APG tooltip).
    given:
      open: true
    then:
    - role: tooltip
    platforms:
    - web
    - lit
  - name: the-text-stays-in-the-tree-while-hidden
    description: The description is always in the accessibility tree, so a screen-reader
      user gets the text without hovering; the visible popup is a second copy.
    given:
      open: false
    then:
    - role: tooltip
    platforms:
    - web
    - lit
  examples:
  - name: icon-only-button-name
    description: The tooltip is the control's name, not a second announcement, so
      it is linked as the label.
    given:
      content: Bold
      children: An icon-only Button with the bold Icon
      describes: false
  - name: column-header-hint
    description: A clarification on a labelled control in dense UI.
    given:
      content: Includes archived items
      children: A table column header Button
  - name: warm-toolbar
    description: A toolbar where a sibling tooltip is already open, so the next one
      shows instantly.
    given:
      content: Italic
      children: An icon-only Button inside a Toolbar
      delay: none
  - name: below-the-trigger
    description: A trigger at the top of the page, where the bubble reads better underneath.
    given:
      content: Copy link
      children: An icon-only Button in the page header
      placement: bottom
```

## Parts and slots

- `trigger`: slot, prop `children`, required
- `popup`: element
- `text`: component `Text`

## Style bindings

- `text`: token `color.inverse.foreground`; part `text`; locked
- `maxWidth`: token `space.20`; computed `t.space20 * 3`

## Keyboard

- `Escape` (Hides the tooltip without moving focus.): expect closes, then focus-unchanged

## Form and overlay

```yaml
overlay:
  layer: tooltip
  anchor: trigger
  placement: placement
  collision: flip
  open: open
  dismiss:
  - escape
  modal: false
```

## Constants and examples

- constant `hoverDelay`: `t.motionDurationBase * 3` (`motion.duration.base` × 3) ms
- constant `warmWindow`: `t.motionDurationBase` (`motion.duration.base`) ms
- constant `pointerGrace`: `t.motionDurationFast` (`motion.duration.fast`) ms
- example `icon-only-button-name`, story `IconOnlyButtonName`: given `content: "Bold"`, `children: "An icon-only Button with the bold Icon"`, `describes: false`; The tooltip is the control's name, not a second announcement, so it is linked as the label.
- example `column-header-hint`, story `ColumnHeaderHint`: given `content: "Includes archived items"`, `children: "A table column header Button"`; A clarification on a labelled control in dense UI.
- example `warm-toolbar`, story `WarmToolbar`: given `content: "Italic"`, `children: "An icon-only Button inside a Toolbar"`, `delay: "none"`; A toolbar where a sibling tooltip is already open, so the next one shows instantly.
- example `below-the-trigger`, story `BelowTheTrigger`: given `content: "Copy link"`, `children: "An icon-only Button in the page header"`, `placement: "bottom"`; A trigger at the top of the page, where the bubble reads better underneath.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `radius`, `paddingBlock`, `paddingInline`, `offset`, `maxWidth`, `fontFamily`, `fontSize`, `lineHeight`, `shadow`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `text`

## Behavior scenarios (7)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-placement-top
  given:
    placement: top
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom
  given:
    placement: bottom
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
- name: renders-delay-default
  given:
    delay: default
  then:
  - renders: true
  derived: true
- name: renders-delay-none
  given:
    delay: none
  then:
  - renders: true
  derived: true
```

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityHint
- accessibilityLabel
notes: 'There is no hover on touch, so no tooltip surface is shown by default: `content`
  becomes the child''s accessibilityHint (or accessibilityLabel when describes=false).
  On long-press the text is shown in a small transient View above the child for the
  duration of the press, as a sighted-user aid. On react-native-web, hover and focus
  behave as on web. This is the acknowledged platform difference; the information
  is never hover-only anywhere. The child must accept `accessibilityHint`/`accessibilityLabel`
  and the `onHoverIn`/`onHoverOut`/`onFocus`/`onBlur`/`onLongPress` handlers Tooltip
  clones onto it; the system Button, Link and Input forward these to their native
  element. Placement flips using measureInWindow.'
```

## Guidance

## Overview

A tooltip is the smallest overlay: a label that appears when you point at or focus a control and disappears when you leave. It exists to name icon-only buttons and to add a hint to a control whose label cannot carry everything. It must never be the only home of information a user needs, because a touchscreen user will never see it.

## When to use

Use a Tooltip on an icon-only Button to show its name on hover and focus (with `describes: false` so it is the accessible name, not a second announcement), or on a labelled control to add a short clarification ("Includes archived items"). Use it in toolbars, table headers and dense UI where visible labels do not fit. Keep it to a phrase.

## When not to use

Do not put essential instructions, error messages or any content the user must read in a tooltip; use helper text (Input `description`), an Alert, or a Disclosure. Do not put links or buttons in it — a tooltip is not interactive, and an interactive overlay is a Popover (planned). Do not attach it to a non-focusable element (an icon, a span): keyboard users could never open it. Do not use it on touch-first screens to explain controls; on native the text becomes a hint and is not visible.

## Behavior

The tooltip shows after `delay` when the pointer rests on the trigger, or immediately when the trigger receives focus of any kind (keyboard-origin focus cannot be told apart reliably across composed triggers, and a focused control showing its tooltip is never wrong), positioned at `placement` (flipped at the viewport edge). It hides when the pointer leaves both trigger and tooltip, when focus leaves the trigger, or on Escape — which hides it without moving focus, so a user can dismiss a tooltip that covers something. Moving the pointer from one warm toolbar item to the next shows the next tooltip with no delay. The tooltip never takes focus and never blocks pointer events on anything but itself. `start` and `end` are logical on every platform, resolved from the trigger's writing direction. The description lives in two nodes: a visually-hidden span carrying the id and `role="tooltip"`, always in the accessibility tree, and the positioned bubble, which is `aria-hidden` and only a visible copy — that is the only way "always announced" and "shown on hover" hold at once. Of the anatomy, only `text` takes a `data-part`: the trigger is the caller's own element, and the popup is the root, already found by `data-ds`. On native there is no viewport measurement, so top and bottom do not flip; Escape exists only under react-native-web, where a real browser does.

## Content guidelines

Tooltip text is a short phrase in sentence case with no trailing period: the control's name ("Bold"), or a clarification ("Includes archived items"). No shortcut hints inside the text; use the Menu's `shortcut` field or `aria-keyshortcuts` on the control. Never repeat the visible label verbatim; if there is nothing to add, there is no tooltip.

## Accessibility

Content that appears on hover or focus must be dismissable without moving the pointer, hoverable, and persistent until dismissed (WCAG 1.4.13): Escape hides it, the pointer can move onto it, and it stays while hovered or focused. It is linked to the trigger with `aria-describedby`, or `aria-labelledby` when it is the name (4.1.2; APG tooltip), so screen-reader users get the text without hovering. Focus shows it, so it is never hover-only (2.1.1). The inverted surface meets 4.5:1 in both modes. It never receives focus and contains nothing interactive.

## Platform notes

### Web
Clone the single child with `aria-describedby={id}` (or `aria-labelledby`) and merged `onPointerEnter`, `onPointerLeave`, `onFocus`, `onBlur` handlers. Render `<div role="tooltip" id={id}>` through a portal, `position: fixed`, positioned from the trigger rect with `offset`, flipped when overflowing, `z-index: var(--layer-toast)`, `max-inline-size` from the computed maxWidth. A module-level "warm until" timestamp implements the toolbar behavior. `pointer: coarse` media query disables showing on hover (the description remains).

### Lit
`<ds-tooltip content="Bold"><ds-button icon-only label="Bold">…</ds-button></ds-tooltip>`. On `slotchange`, take the single assigned element as the trigger, set `aria-describedby` on it, and append the tooltip element to the host in the light DOM so the ID resolves across the boundary; position with the Popover API when available.

### React Native
Render the child with `accessibilityHint={content}` (or `accessibilityLabel` when `describes` is false). On `onLongPress`, show a transient `View` with the inverted surface above the child until `onPressOut`. On react-native-web, attach hover/focus handlers as on web.

## Related

Button, Icon, Menu, Popover (planned).
