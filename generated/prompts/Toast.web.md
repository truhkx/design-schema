# Generate: Toast for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Toast.tsx` exporting a typed React function component named `Toast`, plus `Toast.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Toast({ ref, …rest }: ToastProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Toast> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Toast.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: Toast
  category: feedback
  status: review
  apg: alert
  anatomy:
  - region
  - toast
  - icon
  - message
  - actionButton
  - dismissButton
  composition:
    icon: Icon
    message: Text
    actionButton: Button
    dismissButton: Button
  props:
    message:
      type: string
      required: true
      description: One sentence saying what happened ("Message sent", "3 files deleted").
    tone:
      type: enum
      values:
      - neutral
      - success
      - warning
      - danger
      default: neutral
      description: Sets the leading icon; `neutral` has none. Toasts do not use tinted
        backgrounds — the icon and message carry the tone.
    actionLabel:
      type: string
      description: Label for a single action button ("Undo", "View"). When present
        the toast stays longer and pauses on hover and focus.
    duration:
      type: enum
      values:
      - short
      - long
      - persistent
      default: short
      description: '`short` ≈ 5s, `long` ≈ 10s (both computed from motion.duration.loop
        × 6 / × 12 so themes without motion still get sensible times), `persistent`
        until dismissed. When `action` is set or `tone` is danger the toast is persistent
        regardless of this prop (a dev warning notes the override). The two durations
        are computed at region mount from the resolved motion.duration.loop (getComputedStyle
        on the region on web/Lit; the token value on native), never hardcoded.'
    dismissible:
      type: boolean
      default: true
      description: Shows a dismiss button. Persistent toasts are always dismissible.
    toastId:
      type: string
      description: Stable identity; showing a toast with the same toastId replaces
        the previous one instead of stacking (named toastId so it does not collide
        with the DOM `id` on Lit).
  events:
    onAction:
      description: The action button was activated. The toast dismisses.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
    onDismiss:
      description: 'The toast left the screen: reason `timeout`, `dismiss-button`,
        `escape`, `action`, or `replaced` (a replaced or evicted toast leaves immediately,
        without its exit transition).'
      platforms:
        web: onDismiss
        lit: dismiss
        rn: onDismiss
        swiftui: onDismiss
  keyboard:
  - keys:
    - F6
    action: Moves focus into the toast region (the first toast's action or dismiss
      button) from anywhere; F6 again returns to where focus was.
    when: a toast is visible
    from: any
    expect: focus-first
  - keys:
    - Escape
    action: Dismisses the focused toast and returns focus.
    when: focus inside a toast
    from: first
    expect: closes
  - keys:
    - Tab
    action: Moves between the action and dismiss buttons, then out of the region.
    when: focus inside a toast
    from: first
    expect: focus-next
  styles:
    surface:
      token: color.inverse.surface
      description: 'Inverted like Tooltip: dark on light, light on dark, so it floats
        above any page surface.'
      locked: true
    text:
      token: color.inverse.foreground
      locked: true
    icon:
      token: color.inverse.status.{tone}
      description: '`neutral` renders no icon; the other tones use the status step
        chosen to read on the inverse surface.'
      locked: true
    actionColor:
      token: color.inverse.link
      description: The action and dismiss Buttons are rendered with Button's `inverse`
        prop (ghost variant), which is how a composite gets an on-inverse child without
        restyling it.
      locked: true
    dismissColor:
      token: color.inverse.link
      description: The dismiss and action Buttons are `ghost` + `inverse`, whose text
        is color.inverse.link; Toast never restyles them.
      locked: true
    focusRingInverse:
      token: color.inverse.focus
      description: Focus ring color on the inverse surface, replacing color.border.focus
        inside the toast.
      locked: true
    radius:
      token: radius.md
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    paddingInline:
      token: space.md
      locked: false
    gap:
      token: layout.gap.normal
      description: Between icon, message, action and dismiss.
      locked: false
    stackGap:
      token: layout.gap.tight
      description: Between stacked toasts in the region. stackGap, regionInset and
        layer belong to the region (ToastRegion / ToastProvider) and are overridable
        on it, not on a toast.
      locked: false
    regionInset:
      token: layout.gutter
      description: Distance of the region from the viewport edge (bottom-start on
        wide screens, bottom center on phones, above the safe area).
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
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
    minTarget:
      token: size.target.min
      locked: true
    layer:
      token: layer.toast
      locked: false
    enter:
      token: motion.duration.base
      description: Rise and fade; instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
  copy:
    dismissLabel: Dismiss
    regionLabel: Notifications
  a11y:
    role: status
    requires:
    - live-region
    - accessible-name
    - escape-dismiss
    - focus-visible
    - keyboard-operable
    - contrast-aa
    - reduced-motion
    - target-24px
    - no-hover-only
    contrast:
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.link
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.focus
      background: color.inverse.surface
      level: AA
      large: true
    - foreground: color.inverse.status.{tone}
      background: color.inverse.surface
      level: AA
      large: true
  platforms:
    web:
      element: div
      attributes:
      - role=region
      - aria-label
      - role=status
      - role=alert
      - aria-live
      notes: 'One persistent <div role="region" aria-label="Notifications" aria-live="polite">
        per document (created on first use, fixed at the region inset, layer.toast)
        holds the toasts; the region exists before content so announcements fire.
        Each toast is a <div role="status"> (danger: role="alert"). Timers pause on
        hover and on focus-within. F6 handler at document level moves focus into the
        region. Toasts are shown through an imperative API (`toast({ message })`)
        exposed alongside the component, since a notification is an event, not a place
        in the tree.'
    lit:
      tag: ds-toast
      reflect:
      - tone
      - duration
      notes: A <ds-toast-region> element (auto-created in document.body by the `toast()`
        function) holds <ds-toast> children in the light DOM so the live region is
        in the document tree. The region sets role/aria-live via ElementInternals.
        `dismiss` and `action` are composed CustomEvents.
    rn:
      element: View
      props:
      - accessibilityLiveRegion
      - accessibilityRole
      notes: 'A ToastProvider mounted once at the app root renders the region as an
        absolutely positioned View (layer.toast zIndex, above the bottom safe-area
        inset, centered). Android: accessibilityLiveRegion="polite" (danger: "assertive");
        iOS: AccessibilityInfo.announceForAccessibility on show. Timers pause while
        a toast is being touched. No F6; toasts are reached by swiping through the
        accessibility order. Android''s native ToastAndroid is not used, so actions
        and theming work. React Native has no `status` role: danger toasts use accessibilityRole="alert",
        others no role, with accessibilityLiveRegion (assertive/polite) and a one-time
        AccessibilityInfo announcement. Timers pause while a toast is touched; F6
        and Escape have no native equivalent.'
    swiftui:
      element: VStack
      props:
      - Portal
      - .zIndex
      - AccessibilityNotification
      - Button
      - withAnimation
      - .accessibilityElement=combine
      notes: 'Rendered through `Support/Portal` into the app''s top-level `ZStack`
        at `layer.toast` (the app installs `.dsPortalHost()` once at its root). Each
        toast is one combined element labelled by its text with the tone word; `role:
        status` posts a polite `Announcement`, `alert` an announcement with `.assertive`
        priority. Auto-dismiss pauses while VoiceOver focus is on the toast; the action
        `Button` and dismiss `Button` are inside the element as custom actions (`.accessibilityAction(named:)`)
        as well as visible controls. Enter/exit use the motion tokens; none under
        reduced motion.'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `radius`, `shadow`, `paddingBlock`, `paddingInline`, `gap`, `stackGap`, `regionInset`, `maxWidth`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse`, `minTarget`

## Behavior scenarios (9)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
- name: renders-duration-short
  given:
    duration: short
  then:
  - renders: true
  derived: true
- name: renders-duration-long
  given:
    duration: long
  then:
  - renders: true
  derived: true
- name: renders-duration-persistent
  given:
    duration: persistent
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (web)

```yaml
element: div
attributes:
- role=region
- aria-label
- role=status
- role=alert
- aria-live
notes: 'One persistent <div role="region" aria-label="Notifications" aria-live="polite">
  per document (created on first use, fixed at the region inset, layer.toast) holds
  the toasts; the region exists before content so announcements fire. Each toast is
  a <div role="status"> (danger: role="alert"). Timers pause on hover and on focus-within.
  F6 handler at document level moves focus into the region. Toasts are shown through
  an imperative API (`toast({ message })`) exposed alongside the component, since
  a notification is an event, not a place in the tree.'
```

## Guidance

## Overview

A toast says "done" and gets out of the way. It confirms an action just taken, offers one chance to undo it, and leaves without being asked. It is the reason most confirmations do not need an AlertDialog: if the action is reversible, do it and toast an Undo.

## When to use

Use a Toast to confirm a completed action that the user did not have to watch (sent, saved, deleted, copied), to offer Undo for a reversible action, or to report a background result ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever there is an action, and for `danger`, so nobody misses the one they needed.

## When not to use

Do not toast errors that need fixing (an Alert next to the problem), information the user must read (Alert or Dialog), or anything requiring more than one action. Do not toast on page load. Do not stack more than three; the region replaces the oldest. Do not use a toast to confirm every trivial change — a switch flipping does not need "Setting saved".

## Behavior

Toasts are shown through an imperative call, since a notification is an event: `toast({ message, tone, actionLabel, onAction })`, which returns a promise resolving to `{ reason }` when the toast leaves. Each appears in the notification region, is announced politely (assertively for `danger`), and dismisses after `duration`, when its action is used, when dismissed, or when a toast with the same `id` replaces it. Timers pause while the toast is hovered, focused or touched, and while the page is hidden. Focus never moves to a toast on its own; F6 brings it there when the user wants it, and Escape or the dismiss button sends it back. Up to three toasts stack, newest at the bottom on wide screens.

## Content guidelines

Messages are one short sentence in the past tense saying what happened, without exclamation ("Message sent", "Link copied", "3 files moved to Archive"). The action is one word when possible ("Undo", "View", "Retry"). No titles, no icons other than the tone's, no links in the message.

## Accessibility

The region is a landmark-like container with an accessible name and `aria-live="polite"` that exists before any toast, so each toast is announced as a status message without moving focus (WCAG 4.1.3, 3.2.1); `danger` toasts use `alert`. Anything with a time limit must be pausable or long enough (2.2.1): timers pause on hover, focus and touch, action toasts are persistent, and durations are never under five seconds. Keyboard users reach toasts with F6 and leave with Escape or Tab (2.1.1), so an Undo is never pointer-only. Text, action and icon meet contrast on the inverted surface in both modes; the build checks them. Motion respects reduced-motion.

## Platform notes

### Web
Export `toast(options)` and a `<ToastRegion>` that the app mounts once (or is auto-mounted on first call). Region: `<div role="region" aria-label={copy.regionLabel} aria-live="polite">` fixed at `inset-block-end: var(--layout-gutter)`, `inset-inline-start` on wide screens and centered below the content measure, `z-index: var(--layer-toast)`. Toast: `<div role={tone === 'danger' ? 'alert' : 'status'}>` with `<Icon name={tone}>`, the message, `<Button variant="ghost" size="sm">` for the action styled through the ghost variant on the inverted surface, and the dismiss Button (`iconOnly`, `copy.dismissLabel`). Pause timers on `pointerenter`, `focusin` and `visibilitychange`. Document-level `keydown` for F6 toggles focus between the region and the previously focused element.

### Lit
`toast()` creates `<ds-toast-region>` in `document.body` if absent and appends `<ds-toast>` elements as light-DOM children; the region sets `role="region"`, `aria-label` and `aria-live` through `ElementInternals`. Composed `action` and `dismiss` events bubble to the region for the imperative API's promise.

### React Native
`ToastProvider` at the root renders the region `View` with `zIndex: layerToast`, `position: 'absolute'`, `bottom: safeAreaBottom + layoutGutter`, and exposes `useToast()` / `toast()`. Each toast `View` has `accessibilityLiveRegion` (Android) and triggers `announceForAccessibility` (iOS) on mount; `Pressable` wrappers pause timers while pressed. The action is the system `Button` (`ghost`, `sm`), the dismiss is `Button iconOnly` with `Icon name="close"`.

## Related

Alert, AlertDialog, Button, Icon.
