---
title: Meter
description: Shows a measured value within a known range — storage used, password strength, battery — as a labelled bar. Not a progress indicator.
component:
  name: Meter
  category: data
  status: review
  apg: meter
  anatomy: [container, header, label, valueText, track, fill]
  composition:
    label: { component: Text, props: { element: span, size: sm, weight: medium, tone: default }, forwards: { labelSize: fontSize, labelWeight: fontWeight, fontFamily: fontFamily, lineHeight: lineHeight } }
    valueText: { component: Text, props: { element: span, size: sm, tone: muted }, forwards: { valueSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
  props:
    value:
      type: number
      required: true
      description: 'The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too, exact and unrounded (aria-valuenow="3.14159"; only the percentage text is rounded). Lit starts the property at 0, with no development warning.'
    min:
      type: number
      default: 0
      description: 'Lower bound of the range. On Lit a missing or unparseable attribute falls back to 0; on every platform a non-finite `min` (NaN, Infinity) is treated as 0.'
    max:
      type: number
      default: 100
      description: 'Upper bound of the range. Must be greater than `min`. On Lit a missing or unparseable attribute falls back to 100; on every platform a non-finite `max` (NaN, Infinity) is treated as 100.'
    label:
      type: string
      required: true
      description: 'Visible label naming the measurement ("Storage used"). Also the accessible name. Lit starts the property as an empty string, with no development warning.'
      a11y: Associated with the meter as its accessible name (aria-labelledby / accessibilityLabel).
    valueText:
      type: string
      description: 'Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole number ("32%"): `Intl.NumberFormat(undefined, { style: ''percent'', maximumFractionDigits: 0 })` of the fill fraction. Meter has no locale prop: every platform uses the runtime (browser, server or device) default locale, and the same formatter produces the "0%" of an invalid range (so "0 %" in fr). Rounding is for the text only; the fill width uses the exact fraction. For the same locale, the announced string is the same on every platform. Lit attribute `value-text`, not reflected.'
      a11y: 'Always rendered, as aria-valuetext (web, Lit) and accessibilityValue.text (React Native): valueText when given, else the formatted percentage.'
    tone:
      type: enum
      enumRef: tone
      values: [info, success, warning, danger]
      default: info
      description: 'Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns — the meter does not decide what is "too full".'
    hideValue:
      type: boolean
      default: false
      description: 'Hides the visible value text (a boolean attribute can only turn things on, so the flag is the hiding one). The accessible value is always exposed. Lit attribute `hide-value`, not reflected.'
  styles:
    track: { token: color.background.strong, part: track }
    fill: { token: 'color.status.{tone}.icon', part: fill, description: 'The icon step of each status hue is the one guaranteed 3:1 against the page background, which makes it the right non-text fill.' }
    trackHeight: { token: space.2, part: track }
    radius: { token: radius.full, part: track, description: 'Rounds the track and the fill ends: the track clips the fill (overflow hidden) and the fill carries the same radius on every platform, so the leading end of a partial fill is rounded too.' }
    labelColor: { token: color.foreground, part: label, description: 'Realised by the label Text''s tone default; no hook of its own.' }
    labelSize: { token: font.size.sm, part: label, description: 'Forwarded to the label Text''s fontSize override.' }
    labelWeight: { token: font.weight.medium, part: label, description: 'Forwarded to the label Text''s fontWeight override.' }
    valueColor: { token: color.foreground.muted, part: valueText, description: 'Realised by the value Text''s tone muted; no hook of its own.' }
    valueSize: { token: font.size.sm, part: valueText, description: 'Forwarded to the value Text''s fontSize override. The value text weight is Text''s regular and is not a binding.' }
    fontFamily: { token: font.family.body, part: header, description: 'Forwarded to both Texts'' fontFamily overrides; never styles them directly. `part: header` only says it covers both Texts in the header row: the header element itself takes no style and no hook from it.' }
    lineHeight: { token: font.lineHeight.normal, part: header, description: 'Forwarded to both Texts'' lineHeight overrides; never styles them directly. `part: header` only says it covers both Texts in the header row: the header element itself takes no style and no hook from it.' }
    partGap: { token: space.1, part: container, description: 'Vertical gap between the label row (header) and the track.' }
    labelGap: { token: space.2, part: header, description: 'Horizontal gap between the label and the value text in the header row.' }
    transition: { token: motion.duration.base, part: fill, description: 'Fill inline-size change, with motion.easing.standard; instant under reduced motion.' }
  a11y:
    role: meter
    requires: [accessible-name, contrast-aa, reduced-motion]
    contrast:
      - { foreground: 'color.status.{tone}.icon', background: color.background.strong, level: AA, nonText: true }
      - { foreground: 'color.status.{tone}.icon', background: color.background, level: AA, nonText: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=meter, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-labelledby]
      notes: 'A <div role="meter"> per the APG rather than <meter>: the native element is inconsistently announced, hard to style across browsers, and cannot take our tone colors reliably. The label is a real element referenced by aria-labelledby; the track and fill are plain divs. role=meter and every aria-value* attribute sit on the track, while data-ds sits on the root wrapper: they are different elements. aria-valuetext is always set (valueText, else the formatted percentage). Besides their listed composition props, the composed Texts receive only anatomy plumbing: `data-part` on both and `id={labelId}` on the label. The forwarded-only bindings (labelSize, labelWeight, valueSize, fontFamily, lineHeight) get no `--ds-meter-*` hook and no CSS rule of their own: they reach the Texts only through the Texts'' `overrides`, and only when the consumer overrides them, since their default tokens are the ones the Text props already resolve to.'
    lit:
      tag: ds-meter
      reflect: [tone, value, min, max]
      notes: 'The meter role and aria-value* attributes are plain attributes on the track element in the shadow root; data-ds is on the root wrapper, a different element. aria-valuetext is always set. aria-labelledby points at the composed ds-text host of the label inside the same shadow root, which is a valid target. Numeric attributes reflect as strings; parse them, falling back to 0/100 when missing or unparseable. `hideValue` is the attribute `hide-value` and `valueText` the attribute `value-text`, neither reflected. No events. As on web, the forwarded-only bindings (labelSize, labelWeight, valueSize, fontFamily, lineHeight) get no `--ds-meter-*` hook on :host and the shadow CSS never sets `--ds-text-*` hooks: the child ds-text receives them only through its `overrides` property, when the consumer overrides them.'
    rn:
      element: View
      props: [role=meter, accessibilityLabel, accessibilityValue]
      notes: 'RN 0.73+ has role="meter" (react-native-web renders role=meter; iOS/Android map it to the nearest trait or a plain value). The container is `accessible` so label and value announce as one element, with accessibilityValue={{ min, max, now, text }} where text is always set: valueText when given, else the same formatted percentage web and Lit announce. The fill animates in measured pixels from onLayout — a percentage width cannot be interpolated — and snaps with no animation before the width is known, on first layout and on resize. The composition''s `element: span` is not passed (native Text has no `element`). Text takes no testID, so the label and value Texts each sit in a plain View the Meter owns, carrying `testID="Meter.label"` and `testID="Meter.valueText"`; the label''s wrapper View has `flexShrink: 1` so a long label wraps inside the header row. RN tests check the name through accessibilityLabel and the visible text; accessibilityValue is not asserted by the scenarios.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=combine, .accessibilityValue, GeometryReader, Rectangle, .accessibilityAddTraits=updatesFrequently]
      notes: 'Label row (`Text`s) and a track `Rectangle` with the fill `Rectangle` sized by `GeometryReader` to the fraction, colors per the tone thresholds. One accessibility element (`.combine`) named by the label with `.accessibilityValue(formatValue(value))`; iOS has no meter role, so the value text carries min/max words from copy. No animation: a meter reflects a measurement.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: the-meter-reports-its-value-and-range
      description: The meter exposes the current, minimum and maximum values on its role=meter element.
      given: { value: 25, min: 0, max: 50 }
      then:
        - { role: meter }
        - { attribute: 'aria-valuenow', is: '25' }
        - { attribute: 'aria-valuemin', is: '0' }
        - { attribute: 'aria-valuemax', is: '50' }
      platforms: [web, lit]
    - name: a-value-above-the-maximum-is-clamped
      description: The bar and the accessible value are both clamped to min..max.
      given: { value: 150, min: 0, max: 100 }
      then:
        - { attribute: 'aria-valuenow', is: '100' }
      platforms: [web, lit]
    - name: value-text-is-shown-and-announced
      description: valueText is shown at the end of the label row and announced instead of the raw number.
      given: { valueText: '3.2 GB of 10 GB' }
      then:
        - { text: '3.2 GB of 10 GB' }
        - { attribute: 'aria-valuetext', is: '3.2 GB of 10 GB', platforms: [web, lit] }
    - name: the-label-names-the-measurement
      description: The visible label is the accessible name and is always rendered.
      given: { label: 'Password strength' }
      then:
        - { text: 'Password strength' }
  examples:
    - name: storage-quota
      description: A quota whose value text is what a person would say aloud, not a percentage.
      given: { label: 'Storage used', value: 32, valueText: '3.2 GB of 10 GB' }
    - name: nearly-full
      description: The consumer raises the tone from a threshold it owns and says why in the value text.
      given: { label: 'Storage used', value: 95, tone: 'danger', valueText: '9.5 GB of 10 GB' }
    - name: password-strength
      description: A word rather than a number, on a short scale of its own.
      given: { label: 'Password strength', value: 3, min: 0, max: 4, valueText: 'Strong', tone: 'success' }
    - name: bar-only
      description: A meter in a dense row, where the value text would repeat the copy beside it.
      given: { label: 'Battery', value: 64, hideValue: true }
---

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
