# Generate: ProgressBar as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/ProgressBar.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `ProgressBar.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ProgressBarVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `ProgressBar.test.ts`.

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
  name: ProgressBar
  category: feedback
  status: review
  anatomy:
  - container
  - label
  - valueText
  - track
  - fill
  composition:
    label: Text
    valueText: Text
  props:
    label:
      type: string
      required: true
      description: What is progressing ("Uploading photos", "Importing contacts").
        Visible unless `hideLabel`.
      a11y: The accessible name (aria-labelledby / accessibilityLabel).
    value:
      type: number
      description: Progress so far, between `min` and `max`. Omit for an indeterminate
        bar (the end is unknown).
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
      description: Renders the value text ("42%", "3 of 12 files"). Defaults to a
        percentage.
    showValue:
      type: boolean
      default: true
      description: Show the value text beside the label. Ignored when indeterminate.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name). For bars
        inside a Card whose heading already says what is happening.
    tone:
      type: enum
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
        every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`.'
  events: {}
  styles:
    track:
      token: color.background.strong
      locked: false
    fill:
      token: color.control.selectedBackground
      description: Neutral fill. The selected-control color is guaranteed 3:1 against
        the page.
      locked: true
    fillSuccess:
      token: color.status.success.icon
      locked: true
    fillDanger:
      token: color.status.danger.icon
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
    transition:
      token: motion.duration.base
      description: Fill width change with motion.easing.standard; instant under reduced
        motion.
      locked: false
    indeterminateLoop:
      token: motion.duration.loop
      description: 'The indeterminate sweep: a fill one third of the track width travelling
        start to end and repeating. Under reduced motion the fill is replaced by a
        static, half-opacity track (opacity.disabled) — no motion at all.'
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
      large: true
    - foreground: color.status.success.icon
      background: color.background
      level: AA
      large: true
    - foreground: color.status.danger.icon
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
      - role=progressbar
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      - aria-busy
      notes: 'A <div role="progressbar"> with aria-valuenow/min/max and aria-valuetext
        from formatValue; an indeterminate bar omits aria-valuenow and sets aria-busy="true"
        on itself. Announcements go through a visually-hidden aria-live="polite" region
        next to the bar, updated per `announce`. Not <progress>: it cannot be themed
        consistently and its indeterminate animation ignores reduced motion in some
        browsers.'
    lit:
      tag: ds-progress-bar
      reflect:
      - tone
      - hide-label
      - announce
      notes: ElementInternals role="progressbar" with ariaValueNow/Min/Max/Text on
        the host; the live region is in the shadow root.
    rn:
      element: View
      props:
      - accessibilityRole=progressbar
      - accessibilityLabel
      - accessibilityValue
      notes: Drawn with Views (Animated.View width for the fill; the indeterminate
        sweep is an Animated loop that is not started under reduced motion). accessibilityValue={{
        min, max, now, text }}; announcements via AccessibilityInfo.announceForAccessibility
        per `announce`.
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
        driven by `TimelineView`, replaced by the static half-opacity track under
        reduced motion). VoiceOver gets the label and `.accessibilityValue(formatValue)`
        from the style''s configuration; announcements per `announce` (milestones/complete/indeterminate
        copy) through `AccessibilityNotification.Announcement`. `tone` recolors the
        fill only.'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `transition`, `indeterminateLoop`
Locked (accessibility-bearing, never overridable): `fill`, `fillSuccess`, `fillDanger`, `labelColor`, `valueColor`

## Behavior scenarios (8)

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

## Platform notes (lit)

```yaml
tag: ds-progress-bar
reflect:
- tone
- hide-label
- announce
notes: ElementInternals role="progressbar" with ariaValueNow/Min/Max/Text on the host;
  the live region is in the shadow root.
```

## Guidance

## Overview

A progress bar answers "how much longer": it moves as the work moves, and it ends. If the value is a measurement that could go up or down — storage used, signal strength — it is a Meter, not a progress bar.

## When to use

Use a ProgressBar for a task the interface started and can see through to the end: uploads, downloads, imports, multi-step processing, a wizard's overall completion. Give it a `value` whenever the total is known; use the indeterminate form only until the total is known, then switch. Set `announce: milestones` for long tasks the user may leave and come back to; `complete` (the default) is right for anything under a minute.

## When not to use

Do not use it for a measured quantity (Meter), for a value the user sets (Slider), or for a brief wait of a second or two where a busy state on the Button that started it is enough. Do not use an indeterminate bar for longer than a few seconds without text saying what is happening. Do not stack several bars for one task; show the current step's bar and the overall step count in text.

## Behavior

The fill width follows `value` as a fraction of the range, animated over `transition`. Indeterminate bars sweep continuously and expose `aria-busy`. When `value` reaches `max` the bar stays full and, if `announce` is not `none`, `copy.complete` is announced once; milestones announce at 25/50/75/100. Changing `tone` to `success` or `danger` recolors the fill only — the containing view is responsible for the text that says the task finished or failed. The bar itself is never focusable. `copy.indeterminate` is announced once each time the bar becomes indeterminate. Milestone and completion announcements reset when the value moves backward (a retried task announces its milestones again). The live region is `role="status"` (plain attributes on Lit, not ElementInternals) and is not an anatomy part.

## Content guidelines

Labels name the task in progress with a verb ("Uploading 12 photos"), and the value text says how far in the units people think in — files, steps, or percent — via `formatValue`. When the task fails, keep the bar (at `danger`) and put the error in an Alert beside it, not in the bar's label.

## Accessibility

The bar is a `progressbar` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` (WCAG 4.1.2; APG progressbar), named by its label even when the label is visually hidden. Because the bar is not focusable, screen-reader users only learn about progress through the live region, which is why `announce` exists and defaults to completion (4.1.3). Motion is the fill's width change and the indeterminate sweep; both stop under reduced motion (2.3.3). Tone is reinforced by text elsewhere, never color alone (1.4.1); the fill meets 3:1 against the page (1.4.11).

## Platform notes

### Web
Render the label row (`Text` with id; value `Text` when `showValue` and determinate), the track `<div>` and fill `<div>` with `inline-size` from the value, and the `role="progressbar"` on the track with `aria-labelledby`, `aria-valuenow/min/max/text` (omit `aria-valuenow` and set `aria-busy="true"` when indeterminate). A visually-hidden `<div aria-live="polite">` receives `copy.progress` at milestones or `copy.complete`. The indeterminate sweep is a CSS keyframe on the fill (`translateX` from -100% to 300% over `indeterminateLoop`), replaced under `prefers-reduced-motion` by a static fill at `opacity.disabled` covering the whole track.

### Lit
`<ds-progress-bar label="Uploading" value="42"></ds-progress-bar>`; `ElementInternals` role and aria values on the host; live region in the shadow root; `tone` reflected for styling.

### React Native
`View` track with an `Animated.View` fill whose width animates to the fraction (`useNativeDriver: false` for width; duration from `transition`, zero under reduced motion). Indeterminate: an `Animated.loop` translating a one-third-width fill, not started when `useReducedMotion()`; instead the fill is drawn full-width at `opacity.disabled`. `accessibilityRole="progressbar"`, `accessibilityValue`, and `AccessibilityInfo.announceForAccessibility` per `announce`.

## Related

Meter, Alert, Button, Toast.
