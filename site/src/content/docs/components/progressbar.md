---
title: ProgressBar
description: Shows how far a task has come — an upload, a multi-step import, a page load — as a labelled bar with a known or unknown end. Meter's sibling for things that are happening rather than things that are measured.
component:
  name: ProgressBar
  category: feedback
  status: review
  apg: progressbar
  anatomy: [container, label, valueText, track, fill]
  composition:
    label: Text
    valueText: Text
  props:
    label:
      type: string
      required: true
      description: What is progressing ("Uploading photos", "Importing contacts"). Visible unless `hideLabel`.
      a11y: The accessible name (aria-labelledby / accessibilityLabel).
    value:
      type: number
      description: Progress so far, between `min` and `max`. Omit for an indeterminate bar (the end is unknown).
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
      description: Renders the value text ("42%", "3 of 12 files"). Defaults to a percentage.
    showValue:
      type: boolean
      default: true
      description: Show the value text beside the label. Ignored when indeterminate.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name). For bars inside a Card whose heading already says what is happening.
    tone:
      type: enum
      values: [neutral, success, danger]
      default: neutral
      description: 'Neutral while running; `success` at completion, `danger` when the task failed part-way. Paired with a text status elsewhere: the color is never the only signal.'
    announce:
      type: enum
      values: [none, milestones, complete]
      default: complete
      description: 'What a screen reader hears without focusing the bar: nothing, every 25%, or only completion. Each announcement uses `copy.progress` / `copy.complete`.'
  events: {}
  styles:
    track: { token: color.background.strong }
    fill: { token: color.control.selectedBackground, description: 'Neutral fill. The selected-control color is guaranteed 3:1 against the page.' }
    fillSuccess: { token: color.status.success.icon }
    fillDanger: { token: color.status.danger.icon }
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
    transition: { token: motion.duration.base, description: 'Fill width change with motion.easing.standard; instant under reduced motion.' }
    indeterminateLoop: { token: motion.duration.loop, description: 'The indeterminate sweep: a fill one third of the track width travelling start to end and repeating. Under reduced motion the fill is replaced by a static, half-opacity track (opacity.disabled) — no motion at all.' }
  copy:
    progress: '{label}: {value}'
    complete: '{label}: complete'
    indeterminate: '{label}: in progress'
  a11y:
    role: progressbar
    requires: [accessible-name, contrast-aa, live-region, reduced-motion]
    contrast:
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, large: true }
      - { foreground: color.status.success.icon, background: color.background, level: AA, large: true }
      - { foreground: color.status.danger.icon, background: color.background, level: AA, large: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [role=progressbar, aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext, aria-labelledby, aria-busy]
      notes: 'A <div role="progressbar"> with aria-valuenow/min/max and aria-valuetext from formatValue; an indeterminate bar omits aria-valuenow and sets aria-busy="true" on itself. Announcements go through a visually-hidden aria-live="polite" region next to the bar, updated per `announce`. Not <progress>: it cannot be themed consistently and its indeterminate animation ignores reduced motion in some browsers.'
    lit:
      tag: ds-progress-bar
      reflect: [tone, hide-label, announce]
      notes: 'ElementInternals role="progressbar" with ariaValueNow/Min/Max/Text on the host; the live region is in the shadow root.'
    rn:
      element: View
      props: [accessibilityRole=progressbar, accessibilityLabel, accessibilityValue]
      notes: 'Drawn with Views (Animated.View width for the fill; the indeterminate sweep is an Animated loop that is not started under reduced motion). accessibilityValue={{ min, max, now, text }}; announcements via AccessibilityInfo.announceForAccessibility per `announce`.'
---

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
