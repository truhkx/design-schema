# Generate: Disclosure as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Disclosure.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Disclosure.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: DisclosureVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Disclosure.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

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
        a reason: `pointer`, `keyboard`, or `controlled` (Accordion relies on it).'
      platforms:
        web: onToggle
        lit: toggle
        rn: onToggle
        swiftui: onToggle
  styles:
    triggerColor:
      token: color.foreground
      locked: true
    triggerBackgroundHover:
      token: color.background.subtle
      description: Pointer hover and pressed state of the trigger.
      locked: true
    triggerPaddingBlock:
      token: space.sm
      locked: false
    triggerPaddingInline:
      token: space.sm
      locked: false
    triggerGap:
      token: space.2
      description: Gap between icon and summary.
      locked: false
    triggerFontFamily:
      token: font.family.body
      locked: false
    triggerFontSize:
      token: font.size.md
      locked: false
    triggerFontWeight:
      token: font.weight.medium
      locked: false
    triggerRadius:
      token: radius.md
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
      locked: false
    panelPaddingInline:
      token: space.sm
      locked: false
    panelColor:
      token: color.foreground
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
        accessibilityRole="header" on the trigger text instead of a level.'
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
```

## Controlled state

- `open` is controlled when given, uncontrolled from `defaultOpen` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `triggerPaddingBlock`, `triggerPaddingInline`, `triggerGap`, `triggerFontFamily`, `triggerFontSize`, `triggerFontWeight`, `triggerRadius`, `panelPaddingBlock`, `panelPaddingInline`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `triggerColor`, `triggerBackgroundHover`, `icon`, `panelColor`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (lit)

```yaml
tag: ds-disclosure
reflect:
- open
- disabled
- keep-mounted
notes: Shadow root with delegatesFocus; the summary is a property, the panel content
  is the default slot, and the slot is rendered only while open (with keep-mounted
  the slot is always rendered and its wrapper gets `hidden` while closed). Light-DOM
  children exist either way, so ds-form skips fields inside a closed ds-disclosure
  that lacks keep-mounted, matching the other platforms. `toggle` is a composed CustomEvent
  with detail { open }. `open` is reflected so it can be styled and set from markup;
  the resolved state is readable as `currentOpen` (ds-form reads `currentOpen` and
  `keepMounted` to skip hidden fields); `heading-level` is an attribute.
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
