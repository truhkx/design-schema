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
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
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
    value:
      type: number
      required: true
      description: The current measurement. Clamped to `min`…`max` for the bar; the
        accessible value is the clamped number too, exact and unrounded (aria-valuenow="3.14159";
        only the percentage text is rounded). Lit starts the property at 0, with no
        development warning.
    min:
      type: number
      default: 0
      description: Lower bound of the range. On Lit a missing or unparseable attribute
        falls back to 0; on every platform a non-finite `min` (NaN, Infinity) is treated
        as 0, and it is the substituted bound that is exposed — aria-valuemin is always
        a finite number, never "NaN". The reflected `min` attribute still carries
        whatever was set, so the property and the announced range can differ; the
        clamp lives in the getters, not in a normaliser that rewrites the attribute.
    max:
      type: number
      default: 100
      description: Upper bound of the range. Must be greater than `min`. On Lit a
        missing or unparseable attribute falls back to 100; on every platform a non-finite
        `max` (NaN, Infinity) is treated as 100, and the substituted bound is the
        one exposed, as for `min`. An invalid range warns once per distinct min/max
        pair for the life of the process — a module-level record, so a second Meter
        with the same bad range is silent and a remount never repeats it. The warning
        text is a development diagnostic; the backticks it is written with here are
        this document's formatting, not characters in the emitted string.
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: Visible label naming the measurement ("Storage used"). Also the
        accessible name. Lit starts the property as an empty string, with no development
        warning.
      a11y: Associated with the meter as its accessible name (aria-labelledby / accessibilityLabel).
    valueText:
      type: string
      description: 'Human-readable value shown at the end of the label row and announced
        instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and
        announce the percentage, rounded to a whole number ("32%"): `Intl.NumberFormat(undefined,
        { style: ''percent'', maximumFractionDigits: 0 })` of the fill fraction. Meter
        has no locale prop: every platform uses the runtime (browser, server or device)
        default locale, and the same formatter produces the "0%" of an invalid range
        (so "0 %" in fr). Rounding is for the text only; the fill width uses the exact
        fraction. For the same locale, the announced string is the same on every platform.
        Lit attribute `value-text`, not reflected.'
      a11y: 'Always rendered, as aria-valuetext (web, Lit) and accessibilityValue.text
        (React Native): valueText when given, else the formatted percentage.'
    tone:
      type: enum
      enumRef: tone
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
        things on, so the flag is the hiding one). The header row stays — the label
        is always visible — and only the value text and its wrapper are omitted. The
        accessible value is always exposed. Lit attribute `hide-value`, not reflected.
  styles:
    track:
      token: color.background.strong
      part: track
      locked: true
    fill:
      token: color.status.{tone}.icon
      part: fill
      description: The icon step of each status hue is the one guaranteed 3:1 against
        the page background, which makes it the right non-text fill.
      locked: true
    trackHeight:
      token: space.2
      part: track
      locked: false
    radius:
      token: radius.full
      part: track
      description: 'Rounds the track and the fill ends: the track clips the fill (overflow
        hidden) and the fill carries the same radius on every platform, so the leading
        end of a partial fill is rounded too. There is deliberately no separate fill
        radius — the fill reads the same hook, and an override moves both ends together.'
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
      description: Forwarded to the value Text's fontSize override. The value text
        weight is Text's regular and is not a binding.
      locked: false
    fontFamily:
      token: font.family.body
      part: header
      description: 'Forwarded to both Texts'' fontFamily overrides; never styles them
        directly. `part: header` only says it covers both Texts in the header row:
        the header element itself takes no style and no hook from it.'
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: header
      description: 'Forwarded to both Texts'' lineHeight overrides; never styles them
        directly. `part: header` only says it covers both Texts in the header row:
        the header element itself takes no style and no hook from it.'
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
      description: 'Fill inline-size change, with motion.easing.standard; instant
        under reduced motion. The rule that a width change coming only from layout
        (first layout, a resize) snaps is a React Native rule: there the fill is measured
        pixels, so layout moves the animated value. On web and Lit the fill is a percentage,
        so a resize never changes the declared width and nothing animates — the rule
        holds there without any code. On native a fraction change arriving in the
        same commit as a resize is indistinguishable from a pure resize, so it snaps
        too.'
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
      nonText: true
    - foreground: color.status.{tone}.icon
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
      - role=meter
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      notes: 'A <div role="meter"> per the APG rather than <meter>: the native element
        is inconsistently announced, hard to style across browsers, and cannot take
        our tone colors reliably. The label is a real element referenced by aria-labelledby;
        the track and fill are plain divs. role=meter and every aria-value* attribute
        sit on the track, while data-ds sits on the root wrapper: they are different
        elements. aria-valuetext is always set (valueText, else the formatted percentage).
        Besides their listed composition props, the composed Texts receive only `id={labelId}`
        on the label: the `label` and `valueText` parts are Meter-owned spans around
        them, carrying `data-part` (and, on Lit, `part`), exactly as React Native
        wraps them in Views. Those wrappers are where the header''s shrink rules live
        — `flex-shrink: 1` on the label so a long label wraps inside the row, `flex-shrink:
        0` on the value so the value text never wraps — which is how the row is laid
        out without restyling a composed child. Locked bindings keep their hooks:
        `--ds-meter-track` and `--ds-meter-fill` exist in CSS and are absent from
        the overrides type, so `overrides` cannot reach them and document CSS still
        can. The forwarded-only bindings (labelSize, labelWeight, valueSize, fontFamily,
        lineHeight) get no `--ds-meter-*` hook and no CSS rule of their own: they
        reach the Texts only through the Texts'' `overrides`, and only when the consumer
        overrides them, since their default tokens are the ones the Text props already
        resolve to.'
    lit:
      tag: ds-meter
      reflect:
      - tone
      - value
      - min
      - max
      notes: 'The meter role and aria-value* attributes are plain attributes on the
        track element in the shadow root; data-ds is on the root wrapper, a different
        element. aria-valuetext is always set. aria-labelledby points at the composed
        ds-text host of the label inside the same shadow root, which is a valid target.
        Numeric attributes reflect as strings; parse them, falling back to 0/100 when
        missing or unparseable. `hideValue` is the attribute `hide-value` and `valueText`
        the attribute `value-text`, neither reflected. No events. As on web, the forwarded-only
        bindings (labelSize, labelWeight, valueSize, fontFamily, lineHeight) get no
        `--ds-meter-*` hook on :host and the shadow CSS never sets `--ds-text-*` hooks:
        the child ds-text receives them only through its `overrides` property, when
        the consumer overrides them. The locked `track` and `fill` do keep their `:host`
        hooks, as on web — locked means out of the overrides type, not out of CSS
        — and the part names sit on the Meter-owned wrappers, not on the ds-text hosts,
        so no `::part` styling of a composed child is implied. The reflected `value`,
        `min` and `max` carry the raw property, so `<ds-meter value="150">` keeps
        that attribute while the track reports the clamped aria-valuenow.'
    rn:
      element: View
      props:
      - role=meter
      - accessibilityLabel
      - accessibilityValue
      notes: 'RN 0.73+ has role="meter" (react-native-web renders role=meter; iOS/Android
        map it to the nearest trait or a plain value). The container is `accessible`
        so label and value announce as one element, with accessibilityValue={{ min,
        max, now, text }} where text is always set: valueText when given, else the
        same formatted percentage web and Lit announce. The fill animates in measured
        pixels from onLayout — a percentage width cannot be interpolated — and snaps
        with no animation before the width is known, on first layout and on resize.
        The composition''s `element: span` is not passed (native Text has no `element`).
        Text takes no testID, so the label and value Texts each sit in a plain View
        the Meter owns, carrying `testID="Meter.label"` and `testID="Meter.valueText"`;
        the label''s wrapper View has `flexShrink: 1` so a long label wraps inside
        the header row. react-native-web does not forward the object form of accessibilityValue,
        and role=meter requires aria-valuenow, so the root carries the flattened `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext`
        props beside it. The bar is not focusable: `focusable={false}`, as on ProgressBar
        — neither bar is a control. The `container` part has no testID of its own;
        the root keeps `testID="Meter"`, as elsewhere on this platform. RN tests check
        the name through accessibilityLabel and the visible text; accessibilityValue
        is not asserted by the scenarios.'
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
  behavior:
  - name: the-meter-reports-its-value-and-range
    description: The meter exposes the current, minimum and maximum values on its
      role=meter element.
    given:
      value: 25
      min: 0
      max: 50
    then:
    - role: meter
    - attribute: aria-valuenow
      is: '25'
    - attribute: aria-valuemin
      is: '0'
    - attribute: aria-valuemax
      is: '50'
    platforms:
    - web
    - lit
  - name: a-value-above-the-maximum-is-clamped
    description: The bar and the accessible value are both clamped to min..max.
    given:
      value: 150
      min: 0
      max: 100
    then:
    - attribute: aria-valuenow
      is: '100'
    platforms:
    - web
    - lit
  - name: value-text-is-shown-and-announced
    description: valueText is shown at the end of the label row and announced instead
      of the raw number.
    given:
      valueText: 3.2 GB of 10 GB
    then:
    - text: 3.2 GB of 10 GB
    - attribute: aria-valuetext
      is: 3.2 GB of 10 GB
      platforms:
      - web
      - lit
  - name: the-label-names-the-measurement
    description: The visible label is the accessible name and is always rendered.
    given:
      label: Password strength
    then:
    - text: Password strength
  examples:
  - name: storage-quota
    description: A quota whose value text is what a person would say aloud, not a
      percentage.
    given:
      label: Storage used
      value: 32
      valueText: 3.2 GB of 10 GB
  - name: nearly-full
    description: The consumer raises the tone from a threshold it owns and says why
      in the value text.
    given:
      label: Storage used
      value: 95
      tone: danger
      valueText: 9.5 GB of 10 GB
  - name: password-strength
    description: A word rather than a number, on a short scale of its own.
    given:
      label: Password strength
      value: 3
      min: 0
      max: 4
      valueText: Strong
      tone: success
  - name: bar-only
    description: A meter in a dense row, where the value text would repeat the copy
      beside it.
    given:
      label: Battery
      value: 64
      hideValue: true
```

## Parts and slots

- `container`: element
- `header`: element
- `label`: component `Text`; props `element` = "span", `size` = "sm", `weight` = "medium", `tone` = "default"; forwards `labelSize` → `overrides.fontSize`, `labelWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `valueText`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "muted"; forwards `valueSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `track`: element
- `fill`: element

## Style bindings

- `track`: token `color.background.strong`; part `track`; locked
- `fill`: token `color.status.{tone}.icon`; part `fill`; locked
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

## Constants and examples

- example `storage-quota`, story `StorageQuota`: given `label: "Storage used"`, `value: 32`, `valueText: "3.2 GB of 10 GB"`; A quota whose value text is what a person would say aloud, not a percentage.
- example `nearly-full`, story `NearlyFull`: given `label: "Storage used"`, `value: 95`, `tone: "danger"`, `valueText: "9.5 GB of 10 GB"`; The consumer raises the tone from a threshold it owns and says why in the value text.
- example `password-strength`, story `PasswordStrength`: given `label: "Password strength"`, `value: 3`, `min: 0`, `max: 4`, `valueText: "Strong"`, `tone: "success"`; A word rather than a number, on a short scale of its own.
- example `bar-only`, story `BarOnly`: given `label: "Battery"`, `value: 64`, `hideValue: true`; A meter in a dense row, where the value text would repeat the copy beside it.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `trackHeight`, `radius`, `labelSize`, `labelWeight`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `labelGap`, `transition`
Locked (accessibility-bearing, never overridable): `track`, `fill`, `labelColor`, `valueColor`

## Behavior scenarios (10)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-meter-reports-its-value-and-range
  description: The meter exposes the current, minimum and maximum values on its role=meter
    element.
  given:
    value: 25
    min: 0
    max: 50
  then:
  - role: meter
  - attribute: aria-valuenow
    is: '25'
  - attribute: aria-valuemin
    is: '0'
  - attribute: aria-valuemax
    is: '50'
  platforms:
  - web
  - lit
- name: a-value-above-the-maximum-is-clamped
  description: The bar and the accessible value are both clamped to min..max.
  given:
    value: 150
    min: 0
    max: 100
  then:
  - attribute: aria-valuenow
    is: '100'
  platforms:
  - web
  - lit
- name: value-text-is-shown-and-announced
  description: valueText is shown at the end of the label row and announced instead
    of the raw number.
  given:
    valueText: 3.2 GB of 10 GB
  then:
  - text: 3.2 GB of 10 GB
  - attribute: aria-valuetext
    is: 3.2 GB of 10 GB
- name: the-label-names-the-measurement
  description: The visible label is the accessible name and is always rendered.
  given:
    label: Password strength
  then:
  - text: Password strength
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
notes: "The meter role and aria-value* attributes are plain attributes on the track\
  \ element in the shadow root; data-ds is on the root wrapper, a different element.\
  \ aria-valuetext is always set. aria-labelledby points at the composed ds-text host\
  \ of the label inside the same shadow root, which is a valid target. Numeric attributes\
  \ reflect as strings; parse them, falling back to 0/100 when missing or unparseable.\
  \ `hideValue` is the attribute `hide-value` and `valueText` the attribute `value-text`,\
  \ neither reflected. No events. As on web, the forwarded-only bindings (labelSize,\
  \ labelWeight, valueSize, fontFamily, lineHeight) get no `--ds-meter-*` hook on\
  \ :host and the shadow CSS never sets `--ds-text-*` hooks: the child ds-text receives\
  \ them only through its `overrides` property, when the consumer overrides them.\
  \ The locked `track` and `fill` do keep their `:host` hooks, as on web \u2014 locked\
  \ means out of the overrides type, not out of CSS \u2014 and the part names sit\
  \ on the Meter-owned wrappers, not on the ds-text hosts, so no `::part` styling\
  \ of a composed child is implied. The reflected `value`, `min` and `max` carry the\
  \ raw property, so `<ds-meter value=\"150\">` keeps that attribute while the track\
  \ reports the clamped aria-valuenow."
```

## Guidance

## Overview

A meter shows how much of something there is against a known scale. Its shape is a bar because people read fullness at a glance, but its meaning is the number, which is why the label and value are always exposed to assistive technology and, by default, shown.

## When to use

Use a Meter for a measurement with a fixed range: storage or quota used, battery, password strength, a score out of ten, a budget consumed. Let the consumer decide the tone from thresholds it understands ("over 90% is `danger`"); the meter just paints. Provide `valueText` whenever the raw percentage is not what a person would say.

## When not to use

Do not use a Meter for the progress of a task — uploads, loading, multi-step flows — because progress moves toward completion and has different semantics; use ProgressBar (planned). Do not use it for a value without a meaningful range, or as a decorative bar chart; use a chart component. Do not use tone to encode a category (blue for A, green for B): tones mean status.

## Behavior

The fill width is `(value − min) / (max − min)` of the track, clamped to 0–100%; a non-finite `value` is treated as `min`, and a non-finite `min` or `max` as its default (0, 100). Any change of `value`, `min` or `max` that moves the fill fraction animates the fill width over `transition`, in whichever direction it moves, instantly under reduced motion; a width change that comes only from layout (first layout, resize) snaps, and an update where both happen at once snaps. Nothing is interactive; the meter has no focus, no events, and no hover. If `max ≤ min` the component renders an empty track, exposes `valuenow = min` with the given bounds, shows and announces "0%" (unless `valueText` is given) from the same locale formatter as any percentage, and warns in development with the developer-facing message ``Meter: `max` (<max>) must be greater than `min` (<min>).`` — not a copy key, since it is never shown to users — once per distinct invalid `min`/`max` pair.

The header row places the label at the start and the value text at the end (space-between), aligned on their text baseline. A long label wraps onto more lines inside the row; neither text is truncated.

## Content guidelines

Labels name the measurement as a noun phrase ("Storage used", "Password strength"). Value text is what a person would say aloud: "3.2 GB of 10 GB", "Strong", "7 of 10" — not "32%" unless percent is how people think about it. Never put instructions in the meter; if the user must act on the value, put an Alert or helper Text beside it.

## Accessibility

The meter exposes role `meter` with the current, minimum and maximum values, and a text alternative — `valueText`, or the rounded percentage when it is omitted (WCAG 1.3.1, 4.1.2; APG meter). Its accessible name is the visible label (2.5.3). The fill meets 3:1 against both the track and the page background, so the filled portion is legible as a graphic (1.4.11); the build checks all four tones in both modes. The empty track is deliberately low-contrast: WCAG 1.4.11 exempts a boundary that is not needed to identify the component, and here the label and value text identify it — an empty meter reads as "0%" from its text, not from a faint bar. The tone is never the only signal — the value text is the primary information, and consumers that change tone at a threshold should say why in the value text ("9.5 GB of 10 GB"). Width animation respects reduced motion (2.3.3).

## Platform notes

### Web
Render a root wrapper (`data-ds`, gap `partGap`) containing the header row (`data-part="header"`, a flex row with gap `labelGap`) — a `Text element="span" size="sm" weight="medium" tone="default"` with `id={labelId}` and, unless `hideValue`, a `Text element="span" size="sm" tone="muted"` with the value text, each receiving its forwarded overrides — and `<div role="meter" aria-labelledby={labelId} aria-valuenow aria-valuemin aria-valuemax aria-valuetext>` as the track, containing the fill `<div>` with `inline-size: N%` from the exact fraction. Use `overflow: hidden` and `radius` on the track so the fill clips to the rounded ends. Transition `inline-size` over `transition`, wrapped in `@media (prefers-reduced-motion: no-preference)`.

### Lit
`<ds-meter label="Storage used" value="32" value-text="3.2 GB of 10 GB" tone="warning">` renders the same structure in its shadow root, with composed `ds-text` elements for the label and value; `aria-labelledby` works within one shadow root and may point at the label's `ds-text` host. Reflect `tone`, `value`, `min` and `max` as attributes (numbers as strings; convert with `Number`). Expose no events.

### React Native
Render an `accessible` `View` with `role="meter"`, `accessibilityLabel={label}` and `accessibilityValue={{ min, max, now: clamped, text: valueText ?? formattedPercent }}`, containing a header row of two `Text` elements and a track `View` with `overflow: 'hidden'` and the fill `View`. Measure the track with `onLayout` and animate the fill's pixel width with `Animated` over `transition` (`useNativeDriver: false` — layout properties, and react-native-web has no native driver), skipped when `useReducedMotion()` is true.

## Related

ProgressBar (planned), Alert, Text.
