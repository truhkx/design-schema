---
title: Stepper
description: Shows where the user is in a multi-step flow — checkout, onboarding, a wizard — as an ordered list of steps with the current one marked, and lets them go back to steps they have completed.
component:
  name: Stepper
  category: navigation
  status: review
  anatomy: [list, step, indicator, connector, label, description]
  composition:
    label: Text
    description: Text
  props:
    label:
      type: string
      description: 'Accessible name of the navigation landmark. Defaults to `copy.navLabel`.'
    steps:
      type: array
      required: true
      shape: '{ id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[]'
      description: 'The steps in order. `status` is derived from `current` when omitted: before it complete, after it upcoming.'
    current:
      type: string
      required: true
      description: The id of the current step.
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width.
    navigable:
      type: enum
      values: [none, completed, all]
      default: completed
      description: 'Which steps are Buttons: none (display only), completed steps (the usual — you can go back, not skip ahead), or all (a settings-style flow where order does not matter).'
    compact:
      type: boolean
      default: false
      description: 'Show only the current step''s label and "Step 2 of 5"; the indicators stay. Automatic on narrow viewports for horizontal steppers.'
  events:
    onStepSelect:
      description: Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself.
      platforms: { web: onStepSelect, lit: step-select, rn: onStepSelect, swiftui: onStepSelect }
      payload:
        - { name: id, type: string, description: The id of the chosen step. }
      fires: [user]
      timing: { phase: request }
  keyboard:
    - { keys: [Tab], action: 'Moves between navigable steps in order; non-navigable steps are not focusable.', from: first, expect: focus-next }
    - { keys: [Enter, ' '], action: Selects the focused step., from: first, expect: manual, native: true }
  styles:
    indicatorSize: { token: space.6, part: indicator }
    indicatorBackground: { token: color.control.background, part: indicator }
    indicatorBorder: { token: color.border.strong, part: indicator }
    indicatorBorderWidth: { token: border.width.focus, part: indicator }
    indicatorCompleteBackground: { token: color.control.selectedBackground, part: indicator }
    indicatorCompleteForeground: { token: color.control.selectedForeground, part: indicator }
    indicatorCurrentBorder: { token: color.control.selectedBackground, part: indicator }
    indicatorErrorBackground: { token: color.status.danger.background, part: indicator }
    indicatorErrorForeground: { token: color.status.danger.foreground, part: indicator }
    indicatorErrorBorder: { token: color.status.danger.icon, part: indicator, description: 'The ring; the danger icon step is the one guaranteed 3:1 against the page.' }
    indicatorFontSize: { token: font.size.sm, part: indicator }
    indicatorFontWeight: { token: font.weight.semibold, part: indicator }
    connector: { token: color.border, part: connector }
    connectorComplete: { token: color.control.selectedBackground, part: connector }
    connectorWidth: { token: border.width.focus, part: connector }
    labelColor: { token: color.foreground, part: label }
    labelUpcomingColor: { token: color.foreground.muted, part: label }
    labelWeight: { token: font.weight.medium, part: label }
    labelCurrentWeight: { token: font.weight.semibold, part: label }
    labelSize: { token: font.size.sm, part: label }
    descriptionColor: { token: color.foreground.muted, part: description }
    descriptionSize: { token: font.size.xs, part: description }
    indicatorColor: { token: color.foreground, part: indicator, description: 'Numeral or glyph on current and upcoming steps.' }
    stepHover: { token: color.action.ghost.backgroundHover, part: step, state: hover, description: 'Hover and press background of a navigable step.' }
    stepRadius: { token: radius.sm, part: step }
    stepGap: { token: layout.gap.normal, part: step, description: 'Between steps along the orientation axis (the connector fills it).' }
    partGap: { token: space.2, description: Between the indicator and its label. }
    fontFamily: { token: font.family.body }
    minTarget: { token: size.target.min }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast }
  copy:
    navLabel: Progress
    stepOf:
      text: 'Step {current} of {total}'
      params:
        current: { type: number, description: The current step's position in the flow. }
        total: { type: number, description: How many steps the flow has. }
    complete: completed
    current: current step
    error: has an error
    stepLabel:
      text: 'Step {n}: {label}'
      params:
        n: { type: number, description: The step's position in the flow. }
        label: { type: string, description: The step's own label. }
  a11y:
    role: none
    requires: [accessible-name, keyboard-operable, focus-visible, contrast-aa, target-24px, selected-state]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
      - { foreground: color.status.danger.foreground, background: color.status.danger.background, level: AA }
      - { foreground: color.status.danger.icon, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  platforms:
    web:
      element: ol
      attributes: [aria-label, aria-current=step, data-ds=Stepper]
      notes: 'A <nav aria-label="Progress"> wrapping an <ol>; each <li> holds either a Button (ghost, navigable) or a <div> with the same content. aria-current="step" on the current item''s control. The indicator shows the step number, a check Icon when complete, or the danger Icon on error, with a visually-hidden status word from copy so the state is not conveyed by color or shape alone. Below layout.maxWidth.prose the horizontal stepper switches to `compact` via a container query.'
    lit:
      tag: ds-stepper
      reflect: [orientation, navigable, compact, current]
      notes: '`steps` as a property; shadow <nav><ol>; composed `step-select`. Container query on :host for the compact switch.'
    rn:
      element: View
      props: [accessibilityRole=list, accessibilityLabel]
      notes: 'A View with accessibilityRole="list"; each step a Pressable (navigable) or View with accessibilityState={{ selected: current }} and an accessibilityLabel built from copy.stepLabel plus the status word. Horizontal steppers use `compact` on phones; vertical is preferred for long flows.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Button, .accessibilityAddTraits=isSelected, .accessibilityValue, Icon, ViewThatFits]
      notes: 'A `.contain` element labelled `copy.navLabel` holding the ordered steps (`HStack`/`VStack` by `orientation`): navigable steps are `Button`s whose accessibility label is `copy.stepLabel` plus the status word, the current step carries `.isSelected` and `.accessibilityValue(copy.current)`; non-navigable steps are plain elements with the same label. Indicators draw the number or the `check`/`danger` Icon; `compact` switches through `ViewThatFits` below the prose width. Not SwiftUI''s `Stepper` (a numeric control).'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    # The indicator is inside the step's control, so clicking it is how a step is activated.
    - name: click-on-a-completed-step-reports-it
      description: A navigable step fires onStepSelect with its id; the container decides whether to move.
      given:
        navigable: 'completed'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
          - { id: 'confirm', label: 'Confirmation' }
      when: { click: indicator }
      then:
        - { event: onStepSelect, with: 'shipping' }
    - name: the-current-step-is-not-navigable
      description: navigable completed means every step before the current one, so the current step itself reports nothing.
      given:
        navigable: 'completed'
        current: 'shipping'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
      when: { click: indicator }
      then:
        - { event: onStepSelect, fired: false }
    - name: display-only-steps-report-nothing
      description: With navigable none the steps are inert text.
      given:
        navigable: 'none'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
      when: { click: indicator }
      then:
        - { event: onStepSelect, fired: false }
    - name: step-status-is-said-in-words
      description: The status is carried by a word from copy, not by color or glyph alone.
      given:
        navigable: 'none'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
      then:
        - { copy: complete, platforms: [web, lit] }
        - { copy: current, platforms: [web, lit] }
    - name: an-errored-step-says-so
      description: A step marked error is named with copy.error, so the danger glyph is not the only signal.
      given:
        navigable: 'none'
        current: 'review'
        steps:
          - { id: 'shipping', label: 'Shipping address', status: 'complete' }
          - { id: 'payment', label: 'Payment', status: 'error' }
          - { id: 'review', label: 'Review order' }
      then:
        - { copy: error, platforms: [web, lit] }
    - name: compact-shows-the-step-count
      description: Below the prose width the stepper shows only the current label and "Step n of m".
      given:
        compact: true
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
          - { id: 'confirm', label: 'Confirmation' }
      then:
        - { text: 'Step 2 of 4' }
  examples:
    - name: checkout
      description: The usual horizontal flow, where a completed step can be revisited.
      given:
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
    - name: onboarding-with-descriptions
      description: A vertical stepper whose steps each need a line of explanation.
      given:
        orientation: 'vertical'
        current: 'verify'
        steps:
          - { id: 'account', label: 'Create account', description: 'Takes about a minute.' }
          - { id: 'verify', label: 'Verify identity', description: 'Takes about 2 minutes.' }
          - { id: 'plan', label: 'Choose a plan', description: 'Compare features and pricing.' }
    - name: display-only
      description: A flow the user cannot jump around in.
      given:
        navigable: 'none'
        current: 'payment'
        steps:
          - { id: 'shipping', label: 'Shipping address' }
          - { id: 'payment', label: 'Payment' }
          - { id: 'review', label: 'Review order' }
    - name: a-step-with-an-error
      description: Validation failed on a step the user has already left.
      given:
        current: 'review'
        steps:
          - { id: 'shipping', label: 'Shipping address', status: 'complete' }
          - { id: 'payment', label: 'Payment', status: 'error' }
          - { id: 'review', label: 'Review order' }
---

A stepper is a map of a journey with a "you are here". It sets expectations (five steps, not fifteen), shows progress without a bar, and gives people a way back to a step they finished. It is navigation, not a form control; the number-stepping field is NumberInput.

## When to use

Use a Stepper for a flow with three to about seven ordered steps that each fit on a screen: checkout, account setup, a report builder, a multi-part application. Vertical with descriptions for flows that need explanation ("Verify your identity — takes about 2 minutes"); horizontal for short, familiar ones. Leave `navigable: completed` so people can correct earlier answers without losing later ones (the container keeps the later steps' state).

## When not to use

Do not use a Stepper for two steps (a Button that says "Continue" is enough) or for more than about eight (group them). Do not use it as Tabs — steps have an order and a current position, tabs do not. Do not use it to show task progress (ProgressBar) or to let users jump anywhere in a settings area (a `nav` of Links).

## Behavior

Steps before `current` render complete (check), the current one is marked, later ones are upcoming. A step can be marked `error` explicitly (validation failed on a step the user left). Navigable steps are Buttons that fire `onStepSelect`; the container decides whether to move. Non-navigable steps are inert text. Below the prose width a horizontal stepper shows only the current label and "Step n of m" (`compact`), keeping the row of indicators so the count is still visible. A navigable step is its own native `<button>` (Pressable on native) owned by Stepper — not the Button component, whose single-label API cannot hold an indicator, label and description — with the accessible name from `copy.stepLabel` plus the status word set as `aria-label`. Label and description colors are passed to the composed Text as `tone`/overrides. `navigable: completed` means every step before the current one, including one marked `error`. `compact` applies to horizontal steppers only.

## Content guidelines

Labels are two or three words in sentence case naming the step's content ("Shipping address", "Review order"), parallel across the list. Descriptions, when used, say what happens or how long it takes. Number the steps only through the indicator; never write "Step 1:" in the label — the component adds it for assistive technology.

## Accessibility

The stepper is a `nav` (named "Progress" or by the flow) containing an ordered list, and the current step carries `aria-current="step"` (WCAG 1.3.1, 4.1.2). Each step's name includes its number and status from copy, so a screen-reader user hears "Step 2: Payment, current step" (1.3.3). State is conveyed by the check/number/danger glyph and the status word, not by color alone (1.4.1), and the indicator ring meets 3:1 (1.4.11). Navigable steps are Buttons with visible focus and 24px targets; non-navigable ones are not focusable so Tab does not stop on decoration (2.4.3).

## Platform notes

### Web
Render `<nav aria-label={label ?? "Progress"} data-ds="Stepper"><ol>` with an `<li>` per step containing the indicator `<span aria-hidden>` (number, `Icon name="check"`, or `Icon name="danger"`), a connector `<span aria-hidden>` after all but the last, and the label/description `Text`s wrapped in a `Button variant="ghost"` when navigable (with `aria-current="step"` for the current step) or a `<div>` otherwise. A visually-hidden `<span>` inside the control adds the status word. `@container (max-width: <prose px>)` switches to compact for horizontal orientation (breakpoint read from the built token JSON, `literal-ok: breakpoint from layout.maxWidth.prose`).

### Lit
`<ds-stepper current="payment" .steps=${steps}></ds-stepper>`; shadow `<nav><ol>`; `step-select` composed; `container-type: inline-size` on the host for the compact switch.

### React Native
`View` (`accessibilityRole="list"`) laid out in a row or column; each step a `Pressable` (navigable) or `View` with `accessible`, `accessibilityLabel` from `copy.stepLabel` + status word, `accessibilityState.selected` for the current step. Connectors are `View`s with `connectorWidth`. Use `compact` on phones for horizontal steppers (decided by the screen width against `layout.maxWidth.prose`).

## Related

ProgressBar, Tabs, Breadcrumb, Form, Button.
