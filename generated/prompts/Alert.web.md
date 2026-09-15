# Generate: Alert for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Alert.tsx` exporting a typed React function component named `Alert`, plus `Alert.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Alert({ ref, …rest }: AlertProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Alert> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Alert.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

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
    icon: Icon
    dismissButton: Button
  props:
    tone:
      type: enum
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
      description: Body text keeps the page foreground so long messages read as text,
        not as colored emphasis.
      locked: true
    border:
      token: color.status.{tone}.border
      locked: false
    icon:
      token: color.status.{tone}.icon
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
      description: Forwarded to the Icon as `overrides.size`; Icon's `size` enum is
        not used here.
      locked: false
    headingSize:
      token: font.size.md
      description: The heading; body text uses `fontSize`.
      locked: false
    headingWeight:
      token: font.weight.semibold
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
      large: true
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `radius`, `padding`, `gap`, `partGap`, `iconSize`, `headingSize`, `headingWeight`, `fontFamily`, `fontSize`, `lineHeight`, `dismissMargin`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `bodyColor`, `icon`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (web)

```yaml
element: div
attributes:
- role
notes: "role=\"status\" | \"alert\" from `live` (each implies its aria-live; set only\
  \ the role); no role when off. Rendering the role on the component root is enough\
  \ for the announcement, since React mounts the element and its content together.\
  \ The dismiss button is the system Button (ghost, sm, iconOnly, label copy.dismissLabel)\
  \ unchanged \u2014 composites never restyle a child; the ghost foreground is checked\
  \ against every tone background. The region's accessible name is the heading (aria-labelledby)\
  \ when present, otherwise the body element, so an Alert always has a name even without\
  \ a heading."
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
