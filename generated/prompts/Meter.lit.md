# Generate: Meter as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Meter.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Meter.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: MeterVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Meter.test.ts`.

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
  name: Meter
  category: data
  status: review
  apg: meter
  anatomy:
  - container
  - label
  - valueText
  - track
  - fill
  props:
    value:
      type: number
      required: true
      description: The current measurement. Clamped to `min`…`max` for the bar; the
        accessible value is the clamped number too.
    min:
      type: number
      default: 0
      description: Lower bound of the range.
    max:
      type: number
      default: 100
      description: Upper bound of the range. Must be greater than `min`.
    label:
      type: string
      required: true
      description: Visible label naming the measurement ("Storage used"). Also the
        accessible name.
      a11y: Associated with the meter as its accessible name (aria-labelledby / accessibilityLabel).
    valueText:
      type: string
      description: Human-readable value shown at the end of the label row and announced
        instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and
        announce the percentage, rounded to a whole number ("32%").
      a11y: Rendered as aria-valuetext / accessibilityValue.text.
    tone:
      type: enum
      values:
      - info
      - success
      - warning
      - danger
      default: info
      description: Fill color. `info` is the neutral brand fill; the consumer sets
        `success`/`warning`/`danger` from thresholds it owns — the meter does not
        decide what is "too full".
    hideValue:
      type: boolean
      default: false
      description: Hides the visible value text (a boolean attribute can only turn
        things on, so the flag is the hiding one). The accessible value is always
        exposed.
  styles:
    track:
      token: color.background.strong
      locked: true
    fill:
      token: color.status.{tone}.icon
      description: The icon step of each status hue is the one guaranteed 3:1 against
        the page background, which makes it the right non-text fill.
      locked: true
    trackHeight:
      token: space.2
      locked: false
    radius:
      token: radius.full
      locked: false
    labelColor:
      token: color.foreground
      locked: true
    labelSize:
      token: font.size.sm
      locked: false
    labelWeight:
      token: font.weight.medium
      locked: false
    valueColor:
      token: color.foreground.muted
      locked: true
    valueSize:
      token: font.size.sm
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between the label row and the track.
      locked: false
    labelGap:
      token: space.2
      description: Horizontal gap between the label and the value text in the label
        row.
      locked: false
    transition:
      token: motion.duration.base
      description: Fill width change, with motion.easing.standard; instant under reduced
        motion.
      locked: false
  a11y:
    role: meter
    requires:
    - accessible-name
    - contrast-aa
    - reduced-motion
    contrast:
    - foreground: color.status.{tone}.icon
      background: color.background.strong
      level: AA
      large: true
    - foreground: color.status.{tone}.icon
      background: color.background
      level: AA
      large: true
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
      - role=meter
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      notes: 'A <div role="meter"> per the APG rather than <meter>: the native element
        is inconsistently announced, hard to style across browsers, and cannot take
        our tone colors reliably. The label is a real element referenced by aria-labelledby;
        the track and fill are plain divs.'
    lit:
      tag: ds-meter
      reflect:
      - tone
      - value
      - min
      - max
      notes: The meter role is set on the inner element in the shadow root, labelled
        by the shadow label element. Numeric attributes reflect as strings; parse
        them. No events.
    rn:
      element: View
      props:
      - role=meter
      - accessibilityLabel
      - accessibilityValue
      notes: RN 0.73+ has role="meter" (react-native-web renders role=meter; iOS/Android
        map it to the nearest trait or a plain value). The container is `accessible`
        so label and value announce as one element, with accessibilityValue={{ min,
        max, now, text }} where text is valueText when given and omitted otherwise
        (the platform then reads the number). The fill animates in measured pixels
        from onLayout — a percentage width cannot be interpolated — and snaps on first
        layout and on resize.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=combine
      - .accessibilityValue
      - GeometryReader
      - Rectangle
      - .accessibilityAddTraits=updatesFrequently
      notes: 'Label row (`Text`s) and a track `Rectangle` with the fill `Rectangle`
        sized by `GeometryReader` to the fraction, colors per the tone thresholds.
        One accessibility element (`.combine`) named by the label with `.accessibilityValue(formatValue(value))`;
        iOS has no meter role, so the value text carries min/max words from copy.
        No animation: a meter reflects a measurement.'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `labelGap`, `transition`
Locked (accessibility-bearing, never overridable): `track`, `fill`, `labelColor`, `valueColor`

## Behavior scenarios (6)

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
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-meter
reflect:
- tone
- value
- min
- max
notes: The meter role is set on the inner element in the shadow root, labelled by
  the shadow label element. Numeric attributes reflect as strings; parse them. No
  events.
```

## Guidance

## Overview

A meter shows how much of something there is against a known scale. Its shape is a bar because people read fullness at a glance, but its meaning is the number, which is why the label and value are always exposed to assistive technology and, by default, shown.

## When to use

Use a Meter for a measurement with a fixed range: storage or quota used, battery, password strength, a score out of ten, a budget consumed. Let the consumer decide the tone from thresholds it understands ("over 90% is `danger`"); the meter just paints. Provide `valueText` whenever the raw percentage is not what a person would say.

## When not to use

Do not use a Meter for the progress of a task — uploads, loading, multi-step flows — because progress moves toward completion and has different semantics; use ProgressBar (planned). Do not use it for a value without a meaningful range, or as a decorative bar chart; use a chart component. Do not use tone to encode a category (blue for A, green for B): tones mean status.

## Behavior

The fill width is `(value − min) / (max − min)` of the track, clamped to 0–100%; a non-finite `value` is treated as `min`. Changes to `value` animate the fill width over `transition`, instantly under reduced motion. Nothing is interactive; the meter has no focus, no events, and no hover. If `max ≤ min` the component renders an empty track, exposes `valuenow = min` with the given bounds, and warns in development.

## Content guidelines

Labels name the measurement as a noun phrase ("Storage used", "Password strength"). Value text is what a person would say aloud: "3.2 GB of 10 GB", "Strong", "7 of 10" — not "32%" unless percent is how people think about it. Never put instructions in the meter; if the user must act on the value, put an Alert or helper Text beside it.

## Accessibility

The meter exposes role `meter` with the current, minimum and maximum values, and a text alternative when `valueText` is set (WCAG 1.3.1, 4.1.2; APG meter). Its accessible name is the visible label (2.5.3). The fill meets 3:1 against both the track and the page background, so the filled portion is legible as a graphic (1.4.11); the build checks all four tones in both modes. The empty track is deliberately low-contrast: WCAG 1.4.11 exempts a boundary that is not needed to identify the component, and here the label and value text identify it — an empty meter reads as "0%" from its text, not from a faint bar. The tone is never the only signal — the value text is the primary information, and consumers that change tone at a threshold should say why in the value text ("9.5 GB of 10 GB"). Width animation respects reduced motion (2.3.3).

## Platform notes

### Web
Render a wrapper containing a label row (a `Text element="span"` with `id={labelId}` and, unless `hideValue`, a `<span>` with the value text in `valueColor`) and `<div role="meter" aria-labelledby={labelId} aria-valuenow aria-valuemin aria-valuemax aria-valuetext>` as the track, containing the fill `<div>` with `width: N%`. Use `overflow: hidden` and `radius` on the track so the fill clips to the rounded ends. Transition `width` over `transition`, wrapped in `@media (prefers-reduced-motion: no-preference)`.

### Lit
`<ds-meter label="Storage used" value="32" value-text="3.2 GB of 10 GB" tone="warning">` renders the same structure in its shadow root; `aria-labelledby` works within one shadow root. Reflect `tone`, `value`, `min` and `max` as attributes (numbers as strings; convert with `Number`). Expose no events.

### React Native
Render an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and `accessibilityValue={{ min, max, now: clamped, text: valueText }}`, containing a label row of two `Text` elements and a track `View` with `overflow: 'hidden'` and the fill `View`. Measure the track with `onLayout` and animate the fill's pixel width with `Animated` over `transition` (`useNativeDriver: false` — layout properties, and react-native-web has no native driver), skipped when `useReducedMotion()` is true.

## Related

ProgressBar (planned), Alert, Text.
