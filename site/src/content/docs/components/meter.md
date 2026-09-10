---
title: Meter
description: Shows a measured value within a known range — storage used, password strength, battery — as a labelled bar. Not a progress indicator.
component:
  name: Meter
  category: data
  status: review
  apg: meter
  anatomy: [container, label, valueText, track, fill]
  props:
    value:
      type: number
      required: true
      description: The current measurement. Clamped to `min`…`max` for the bar; the accessible value is the clamped number too.
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
      description: Visible label naming the measurement ("Storage used"). Also the accessible name.
      a11y: Associated with the meter as its accessible name (aria-labelledby / accessibilityLabel).
    valueText:
      type: string
      description: 'Human-readable value shown at the end of the label row and announced instead of the raw number ("3.2 GB of 10 GB", "Strong"). Omit to show and announce the percentage, rounded to a whole number ("32%").'
      a11y: Rendered as aria-valuetext / accessibilityValue.text.
    tone:
      type: enum
      values: [info, success, warning, danger]
      default: info
      description: 'Fill color. `info` is the neutral brand fill; the consumer sets `success`/`warning`/`danger` from thresholds it owns — the meter does not decide what is "too full".'
    hideValue:
      type: boolean
      default: false
      description: 'Hides the visible value text (a boolean attribute can only turn things on, so the flag is the hiding one). The accessible value is always exposed.'
  styles:
    track: { token: color.background.strong }
    fill: { token: 'color.status.{tone}.icon', description: 'The icon step of each status hue is the one guaranteed 3:1 against the page background, which makes it the right non-text fill.' }
    trackHeight: { token: space.2 }
    radius: { token: radius.full }
    labelColor: { token: color.foreground }
    labelSize: { token: font.size.sm }
    labelWeight: { token: font.weight.medium }
    valueColor: { token: color.foreground.muted }
    valueSize: { token: font.size.sm }
    fontFamily: { token: font.family.body }
    lineHeight: { token: font.lineHeight.normal }
    partGap: { token: space.1, description: Vertical gap between the label row and the track. }
    transition: { token: motion.duration.base, description: 'Fill width change, with motion.easing.standard; instant under reduced motion.' }
  a11y:
    role: meter
    requires: [accessible-name, contrast-aa, reduced-motion]
    contrast:
      - { foreground: 'color.status.{tone}.icon', background: color.background.strong, level: AA, large: true }
      - { foreground: 'color.status.{tone}.icon', background: color.background, level: AA, large: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=meter, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-labelledby]
      notes: 'A <div role="meter"> per the APG rather than <meter>: the native element is inconsistently announced, hard to style across browsers, and cannot take our tone colors reliably. The label is a real element referenced by aria-labelledby; the track and fill are plain divs.'
    lit:
      tag: ds-meter
      reflect: [tone, value, min, max]
      notes: 'The meter role is set on the inner element in the shadow root, labelled by the shadow label element. Numeric attributes reflect as strings; parse them. No events.'
    rn:
      element: View
      props: [role=meter, accessibilityLabel, accessibilityValue]
      notes: 'RN 0.73+ has role="meter" (react-native-web renders role=meter; iOS/Android map it to the nearest trait or a plain value). The container is `accessible` so label and value announce as one element, with accessibilityValue={{ min, max, now, text }} where text is valueText when given and omitted otherwise (the platform then reads the number). The fill animates in measured pixels from onLayout — a percentage width cannot be interpolated — and snaps on first layout and on resize.'
---

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
