---
title: Switch
description: An on/off control whose change takes effect immediately, with a visible label and an optional description.
component:
  name: Switch
  category: input
  status: review
  apg: switch
  anatomy: [track, thumb, label, description]
  props:
    label:
      type: string
      required: true
      description: Visible label naming the thing being turned on or off. Also the accessible name.
      a11y: Associated with the control (label/for on web, accessibilityLabel on native).
    name:
      type: string
      description: 'Optional field name. When inside a Form the state is collected as a boolean on every platform; most switches are not in forms. A Switch never validates and never appears in an error summary.'
    checked:
      type: boolean
      description: Controlled state. Omit for an uncontrolled control.
      controls:
        event: onChange
        default: defaultChecked
        state: checked
    defaultChecked:
      type: boolean
      default: false
      description: Initial state for an uncontrolled control.
    disabled:
      type: boolean
      default: false
      description: Cannot be toggled. Stays visible, readable and focusable.
    description:
      type: string
      description: Persistent helper text below the label explaining the effect.
      a11y: Linked with aria-describedby / accessibilityHint.
    labelPosition:
      type: enum
      values: [start, end]
      default: start
      description: 'Where the label sits relative to the track. `start` (label, then switch at the row end) is the settings-list convention; `end` matches Checkbox.'
  events:
    onChange:
      description: Fired when the state changes, with the new boolean. The change is already in effect; there is nothing to submit.
      platforms: { web: onChange, lit: change, rn: onValueChange, swiftui: onChange }
      payload:
        - { name: checked, type: boolean, description: The new state. }
      fires: [user]
      timing: { phase: after-change }
  styles:
    trackOff: { token: color.control.trackOff, part: track }
    trackOn: { token: color.control.selectedBackground, part: track }
    thumb: { token: color.control.selectedForeground, part: thumb, description: 'Thumb color in both states.' }
    trackWidth: { token: space.10, part: track }
    trackHeight: { token: space.6, part: track }
    thumbSize: { token: space.5, part: thumb, description: 'Thumb diameter; it travels trackWidth − thumbSize − 2 × thumbInset.' }
    thumbInset: { token: space.1, part: thumb, description: 'Gap between the thumb and the track edge; split evenly on the short axis.' }
    radius: { token: radius.full }
    gap: { token: space.3, description: Gap between track and label. }
    partGap: { token: space.1, description: Vertical gap between label and description. }
    labelColor: { token: color.foreground, part: label }
    labelSize: { token: font.size.md, part: label }
    labelWeight: { token: font.weight.regular, part: label }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted, part: description }
    fontFamily: { token: font.family.body }
    lineHeight: { token: font.lineHeight.normal }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus, description: 'Drawn around the track, offset by focusRingWidth like every other control.' }
    minTarget: { token: size.target.comfortable, description: 'Minimum row height; the whole row toggles.' }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Thumb travel and track color, with motion.easing.standard; travel is instant under reduced motion.' }
  a11y:
    role: switch
    requires: [accessible-name, label-association, focus-visible, keyboard-operable, target-24px, contrast-aa, reduced-motion]
    contrast:
      - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA, nonText: true, state: checked }
      - { foreground: color.control.selectedForeground, background: color.control.trackOff, level: AA, nonText: true }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
      - { foreground: color.control.trackOff, background: color.background, level: AA, nonText: true }
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
  form:
    role: field
    value: checked
    valueType: boolean
    name: name
    discovery: context
  platforms:
    web:
      element: input
      attributes: [type=checkbox, role=switch, id, name, aria-describedby, aria-checked]
      notes: 'A native <input type="checkbox" role="switch"> styled with appearance: none. Keeps label association, Space toggling and form participation for free; role=switch makes screen readers say "on/off" instead of "checked". The track and thumb are drawn in CSS on the input itself.'
    lit:
      tag: ds-switch
      reflect: [disabled, label-position]
      notes: 'Form-associated like ds-checkbox: the native form value is "on" or null (native semantics) while ds-form collects `currentValue` as a boolean. Shadow root with delegatesFocus; the native change is not composed, so re-dispatch a composed `change` CustomEvent with detail { checked }. `checked` is not reflected (attribute = initial state).'
    rn:
      element: Switch
      props: [accessibilityRole=switch, accessibilityLabel, accessibilityHint, accessibilityState, trackColor, thumbColor, ios_backgroundColor]
      notes: 'Uses the native Switch for platform-native feel; trackOn/trackOff map to trackColor {true, false} and thumb to thumbColor; ios_backgroundColor = trackOff. Platform limits: track and thumb sizes, radius, thumb travel and the focus ring are the OS values (trackWidth, trackHeight, thumbSize, thumbInset, radius, focusRing*, transition are not applied); a disabled native Switch is not focusable. The label row is a Pressable wrapping the Switch so the whole row toggles. The native Switch draws its own track and thumb, so trackWidth/trackHeight/thumbSize/thumbInset/radius are not overridable on native; the gap and text bindings are.'
    swiftui:
      element: Toggle
      props: [Toggle, .toggleStyle=custom, .accessibilityValue, .labelsHidden, Animation]
      notes: 'A `Toggle` with a package `ToggleStyle`: the track and thumb are drawn from the tokens (`trackOn`/`trackOff`/`thumb`) — not the system switch, which cannot take the theme — with the thumb travel animated over the `transition` binding unless reduced motion. VoiceOver reads it as a switch with on/off (`.accessibilityValue`), the label from the label view; `hideLabel` uses `.labelsHidden()`. `checkedLabel`/`uncheckedLabel` copy becomes the value text.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/focusable ones from the schema.
    - name: click-on-track-toggles-on
      when: { click: track }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
    - name: click-on-label-toggles
      when: { click: label }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
    - name: click-on-description-toggles
      description: The whole row is the target; the description is not inside the label but forwards its click.
      given: { description: 'Sends a daily summary at 9:00.' }
      when: { click: description }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
    - name: space-toggles
      when: { key: Space }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
      platforms: [web, lit]
    - name: enter-is-ignored
      description: Enter is neither intercepted nor used to toggle.
      when: { key: Enter }
      then:
        - { event: onChange, fired: false }
        - { state: checked, is: false }
      platforms: [web, lit]
    - name: toggles-back-off
      given: { defaultChecked: true }
      when: { click: track }
      then:
        - { event: onChange, with: false }
        - { state: checked, is: false }
    - name: disabled-does-not-toggle
      given: { disabled: true }
      when: { click: track }
      then:
        - { event: onChange, fired: false }
        - { state: checked, is: false }
        - { state: disabled, is: true }
    - name: disabled-stays-focusable
      description: Disabled switches are visible, readable and focusable (aria-disabled, not the native attribute). The native React Native Switch is the documented exception.
      given: { disabled: true }
      then:
        - { focusable: true }
      platforms: [web, lit]
    - name: controlled-follows-prop
      description: With `checked` provided the switch reports the change but does not flip on its own. Not Lit; there the `checked` property is the live state, like a native input, and only the attribute is initial.
      given: { checked: false }
      when: { click: track }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: false }
      platforms: [web, rn]
    - name: controlled-updates-on-set
      given: { checked: false }
      when: { set: { checked: true } }
      then:
        - { state: checked, is: true }
    - name: description-is-rendered
      given: { description: 'Sends a daily summary at 9:00.' }
      then:
        - { text: 'Sends a daily summary at 9:00.' }
    - name: label-at-the-end-still-toggles-the-row
      description: labelPosition changes the order of the row, not its target; the whole row toggles either way.
      given: { labelPosition: 'end' }
      when: { click: label }
      then:
        - { event: onChange, with: true }
        - { state: checked, is: true }
  examples:
    - name: settings-row
      description: The settings-list convention, with the label at the start and the switch at the row end.
      given: { label: 'Email notifications', labelPosition: 'start' }
    - name: with-description
      description: A switch whose effect is stated in one sentence under the label.
      given: { label: 'Daily summary', description: 'Sends a daily summary at 9:00.' }
    - name: checkbox-aligned
      description: The Checkbox-aligned form, with the switch before its label.
      given: { label: 'Show archived', labelPosition: 'end' }
    - name: disabled
      description: A setting that cannot be changed here, still visible, readable and focusable.
      given: { label: 'Two-factor authentication', disabled: true }
---

A switch is a light switch: flip it and the thing happens. That immediacy is what separates it from a Checkbox, which records a choice to be submitted later. Every switch answers the question "is this on?" and the label names what "this" is.

## When to use

Use a Switch for a binary setting that applies as soon as it changes and can be undone by flipping it back: notifications, dark mode, Wi‑Fi, "show archived". Use it in settings lists and preference panels, with `labelPosition: start` so the labels line up and the switches sit at the row end.

## When not to use

Do not use a Switch for a choice that is only applied on Save or Submit; use Checkbox, so the user is not misled into thinking the change is already live. If a form of switches must have a Save button, the switches are checkboxes. Do not use a Switch for two named options ("Metric / Imperial"); that is a RadioGroup or a SegmentedControl (planned). Do not use a Switch where turning it on triggers a flow (a confirmation dialog, a sign-in): use a Button, because a switch that jumps back to off when the flow is cancelled is confusing.

## Behavior

Clicking or tapping the row, or pressing Space on the control, flips the state, moves the thumb, and fires `onChange` with the new boolean. Enter is neither intercepted nor used to toggle. The row is full width: with `labelPosition: start` the label is at the start and the switch at the row's end; with `end` the switch comes first and the label follows it. The consumer applies the effect immediately; if it can fail asynchronously, the switch should be controlled and flipped back with an error message elsewhere — the switch itself has no error state by design. Uncontrolled unless `checked` is provided. `disabled` switches are visible, readable and focusable (`aria-disabled`), and do not toggle. Thumb travel is animated with `transition`, and is instant when the user prefers reduced motion. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street").

## Content guidelines

The label names the thing, not the state ("Email notifications", not "Turn on email notifications" or "Enabled"): the state is announced by the control and shown by its position. Do not add "On/Off" text next to the track; it is redundant for sighted users and read twice by screen readers. Descriptions state the effect in one sentence ("Sends a daily summary at 9:00").

## Accessibility

The switch has role `switch` and its state is exposed as `aria-checked` / `accessibilityState.checked`, so screen readers announce "on" or "off" (WCAG 4.1.2). The label is visible and associated (1.3.1, 3.3.2). State is not conveyed by color alone: the thumb position changes (1.4.1). The on track meets 3:1 against the page background and the thumb meets 3:1 against both track states (1.4.11); the build checks these as non-text pairs. Focus is visible around the track (2.4.7). Space toggles the switch (2.1.1); Enter is left alone. The row meets the 44px comfortable target (2.5.8). The thumb animation respects `prefers-reduced-motion` (2.3.3).

## Platform notes

### Web
Render `<input type="checkbox" role="switch">` with `appearance: none`, sized `trackWidth × trackHeight`, and draw the thumb with a pseudo-element translated by `trackWidth − thumbSize − 2 × thumbInset` when checked. Set `aria-checked` explicitly to mirror the checked state (track it in component state when uncontrolled), since some screen readers do not derive it from a checkbox carrying `role="switch"`. For disabled, `aria-disabled` plus `preventDefault()` on `click` and `change`. Mirror the thumb travel under `[dir=rtl]`. Label with `<label for>`; the `labelPosition` prop changes flex order only.

### Lit
`<ds-switch>` is form-associated so a `name` inside a native `<form>` or `<ds-form>` contributes `"on"` when checked. The inner input is in the shadow root with `delegatesFocus: true`; re-dispatch a composed `change` CustomEvent with `detail: { checked }`. Reflect `checked` (initial), `disabled` and `label-position`.

### React Native
Use the native `Switch` with `accessibilityRole="switch"`, `accessibilityLabel`, `accessibilityHint={description}`, `accessibilityState={{ checked, disabled }}`, `trackColor={{ false: trackOff, true: trackOn }}`, `thumbColor={thumb}` and `ios_backgroundColor={trackOff}`. Wrap the row in a `Pressable` that toggles the value so the label is part of the target, with `accessible={false}` on the wrapper so the Switch is the single focusable element. The track and thumb dimensions come from the OS; the size tokens are documented but not applied here.

## Related

Checkbox, RadioGroup, Form.
