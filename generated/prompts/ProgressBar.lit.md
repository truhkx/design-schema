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
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
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
        for an indeterminate bar (the end is unknown); generated code types it `number
        | null | undefined`. Clamped to `min`…`max` for the fill, the accessible value,
        `formatValue`'s argument and the announcement tiers; a non-finite number (NaN,
        Infinity) is treated as `min`.
    min:
      type: number
      default: 0
      description: Start of the range. A non-finite number is treated as the default,
        0.
    max:
      type: number
      default: 100
      description: End of the range. A non-finite number is treated as the default,
        100.
    formatValue:
      type: function
      shape: '(value: number, min: number, max: number) => string'
      description: 'Renders the value text ("42%", "3 of 12 files"). Defaults to a
        percentage over the whole range — `(value − min) / (max − min)` — the same
        arithmetic the fill uses, so a non-zero `min` reads correctly without a custom
        formatter, rounded to a whole number: `Intl.NumberFormat(undefined, { style:
        ''percent'', maximumFractionDigits: 0 })` (the runtime or device default locale;
        there is no locale prop), as Meter does (99.5% of the way shows "100%" before
        completion; completion is only the clamped value reaching `max`). Called with
        the clamped value. Rounding is for the text only; the fill uses the exact
        fraction. A `max` at or below `min` is not a range: the bar renders empty,
        exposes aria-valuenow / accessibilityValue.now = `min` with the given bounds,
        shows and exposes "0%" unless a custom formatter says otherwise, makes no
        progress or completion announcements, and warns in development.'
    showValue:
      type: boolean
      default: true
      description: Show the value text at the end of the label row. Ignored when indeterminate.
        Lit attribute is the negated boolean `hide-value` (reflected), since an attribute
        can only turn things on.
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name). For
        bars inside a Card whose heading already says what is happening. The value
        text, when shown, stays at the inline end of the row (the header switches
        to end alignment, since the hidden label leaves the flow). When there is no
        visible value text either, the label row takes no space and `partGap` is not
        applied: on web and Lit the header element stays, with its data-part and the
        label inside it, and is itself visually hidden (out of flow), so web''s aria-labelledby
        still resolves. On React Native a hidden label is not rendered at all; the
        name lives in accessibilityLabel and the `label` part has no native home while
        hidden, as Input.'
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
        reduced motion. An override changes the duration only; the easing is read
        from the token and has no hook (the sweep's easing is `sweepEasing`).
      locked: false
    indeterminateLoop:
      token: motion.duration.loop
      part: fill
      description: 'The indeterminate sweep: a fill one third of the track width (the
        one-third ratio is geometry, not a token; a literal is allowed for it) travelling
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
        is not an anatomy part and takes no `part`. The forwarded bindings (labelSize,
        labelWeight, valueSize, fontFamily, lineHeight) reach the ds-text children
        only through their `overrides` property; they have no --ds-progress-bar-*
        CSS hook, since nothing in the shadow root could read one without restyling
        the child.'
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
        via AccessibilityInfo.announceForAccessibility per `announce`. The accessibility
        props (accessible, focusable={false}, accessibilityRole, Label, Value, State)
        sit on the root View, so the name and value announce together, as Meter. The
        label and valueText Texts carry their testIDs (`ProgressBar.label`, `ProgressBar.valueText`)
        on wrapper Views, since Text takes none. The sweeping fill is anchored at
        the inline start and translates toward the inline end, negative x when I18nManager.isRTL.'
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

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `labelGap`, `transition`, `indeterminateLoop`, `sweepEasing`
Locked (accessibility-bearing, never overridable): `fill`, `fillSuccess`, `fillDanger`, `labelColor`, `valueColor`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-bar-is-never-focusable
  description: Progress is learned from the live region, not by focusing the bar.
  then:
  - focusable: false
  platforms:
  - web
  - lit
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

## Platform notes (lit)

```yaml
tag: ds-progress-bar
reflect:
- tone
- hide-label
- prop: showValue
  attribute: hide-value
- announce
notes: "role=\"progressbar\" and aria-valuenow/min/max/text are plain reflected attributes\
  \ on the host, not ElementInternals \u2014 the accessible-value tooling reads attributes,\
  \ and real assistive technology treats the two identically. The host is named by\
  \ aria-label mirrored from `label` (aria-labelledby cannot reach the label inside\
  \ the shadow root); an empty label removes aria-label. Indeterminate: aria-valuemin/max\
  \ stay, aria-valuenow and aria-valuetext are removed, aria-busy=\"true\". `showValue`\
  \ is the negated attribute `hide-value`. The sweep mirrors its keyframes under :host(:dir(rtl)).\
  \ The live region is in the shadow root and carries role=\"status\" beside aria-live=\"\
  polite\"; it is not an anatomy part and takes no `part`. The forwarded bindings\
  \ (labelSize, labelWeight, valueSize, fontFamily, lineHeight) reach the ds-text\
  \ children only through their `overrides` property; they have no --ds-progress-bar-*\
  \ CSS hook, since nothing in the shadow root could read one without restyling the\
  \ child."
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
- **Indeterminate.** Entering the indeterminate state resets the record to tier 0 and re-arms `copy.complete`, so the first known value afterwards announces its tier under `milestones`. "Announced once after mount" means once the live region has rendered empty: web and Lit set the message on the next animation frame, since text already in a newly inserted region is often not read.
- **Invalid range.** With `max ≤ min` no progress or completion is announced and no tier is recorded; `copy.indeterminate` still is. When the range becomes valid, the tier and completion it arrives at are recorded silently, as at mount.

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
