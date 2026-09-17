---
title: Fieldset
description: Groups related fields under a legend so the relationship is announced, with an optional description and a group-level error — the container RadioGroup uses internally, exposed for any set of fields.
component:
  name: Fieldset
  category: input
  status: review
  anatomy: [group, legend, description, fields, errorMessage]
  composition:
    legend: { component: Text, props: { tone: default, size: md, weight: medium, element: span }, forwards: { legendSize: fontSize, legendWeight: fontWeight, fontFamily: fontFamily, lineHeight: lineHeight } }
    description: { component: Text, props: { tone: muted, size: sm, element: span }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
    errorMessage: { component: Text, props: { tone: danger, size: sm, element: span }, forwards: { helperSize: fontSize, fontFamily: fontFamily, lineHeight: lineHeight } }
    fields: { component: Stack, forwards: { fieldsGap: gap } }
  props:
    legend:
      type: string
      required: true
      description: 'The group''s name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible.'
      a11y: The accessible name of the group; screen readers read it before each field inside.
    children:
      type: content
      required: true
      description: The fields as direct children, usually Inputs, Checkboxes or Switches; Fieldset renders the Stack around them.
    description:
      type: string
      description: Persistent helper text under the legend. An empty string counts as unset (no part rendered, no link, no accessibilityHint).
      a11y: Linked with aria-describedby on the group.
    error:
      type: string
      description: A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields. An empty string counts as unset (no part, no aria-invalid, no announcement).
      a11y: Rendered once under the group, only while set (no empty live region; inserting the role=alert region announces it), and linked with aria-describedby; while set, the group carries aria-invalid="true" (accessibilityState invalid is not available on native, so the error text alone identifies it there).
    disabled:
      type: boolean
      default: false
      description: Disables every field inside. Fields keep their own `disabled` for finer control.
    gap:
      type: enum
      values: [tight, normal, loose]
      default: normal
      description: Gap between the fields, from the layout rhythm. Fieldset renders the Stack itself; children are the raw fields.
  styles:
    legendColor: { token: color.foreground, part: legend, description: 'Realised by the composed legend Text''s `default` tone; no --ds-fieldset-* hook.' }
    legendSize: { token: font.size.md, part: legend, description: 'Reaches the legend Text only through its `overrides.fontSize`; no --ds-fieldset-* hook.' }
    legendWeight: { token: font.weight.medium, part: legend, description: 'Reaches the legend Text only through its `overrides.fontWeight`; no --ds-fieldset-* hook.' }
    descriptionText: { token: color.foreground.muted, part: description, description: 'Realised by the composed description Text''s `muted` tone; no --ds-fieldset-* hook.' }
    helperSize: { token: font.size.sm, part: description, description: 'Description and error text size. Reaches both Texts only through their `overrides.fontSize`; no --ds-fieldset-* hook.' }
    errorText: { token: color.foreground.danger, part: errorMessage, description: 'Realised by the composed error Text''s `danger` tone; no --ds-fieldset-* hook.' }
    partGap: { token: layout.gap.tight, part: group, description: 'Vertical gap between legend, description, fields and error, set on the group root. On web and Lit the <legend> does not take part in flex gap, so below the legend it is a margin. One of the two bindings with a --ds-fieldset-* hook (--ds-fieldset-part-gap), because Fieldset''s own elements read it.' }
    fieldsGap: { token: 'layout.gap.{gap}', part: fields, description: 'The composed Stack''s gap. It reaches the Stack only as a token path through the Stack''s own `overrides.gap`, always sent (the override, else layout.gap.{gap}), and the Stack gets no `gap` prop or attribute. No --ds-fieldset-* hook (a Fieldset hook would not reach the Stack), and Fieldset does not set the Stack''s CSS hooks (--ds-stack-gap) either; page CSS sizes the gap through the Stack''s own hooks.' }
    disabledOpacity: { token: opacity.disabled, part: legend, description: 'Dims the legend and description only while `disabled`, applied as opacity on the Fieldset-owned legend and description elements (web/Lit wrappers, RN `Fieldset.legend` and `Fieldset.description` Views), never on the Texts. The group error is never dimmed, and the fields dim themselves, so the group root and the fields wrapper are never dimmed. One of the two bindings with a --ds-fieldset-* hook (--ds-fieldset-disabled-opacity).' }
    fontFamily: { token: font.family.body, part: legend, description: 'Reaches the legend, description and error Texts only through their `overrides.fontFamily` (`part` names the first; the composition `forwards` decide where it goes); no --ds-fieldset-* hook.' }
    lineHeight: { token: font.lineHeight.normal, part: legend, description: 'Reaches the legend, description and error Texts only through their `overrides.lineHeight` (`part` names the first; the composition `forwards` decide where it goes); no --ds-fieldset-* hook.' }
  copy:
    requiredIndicator: ' (required)'
  a11y:
    role: group
    requires: [accessible-name, label-association, error-identification, contrast-aa]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
  platforms:
    web:
      element: fieldset
      attributes: [aria-describedby, aria-disabled, aria-invalid]
      notes: 'A native <fieldset> with a <legend>. No border and no padding (the browser defaults are reset); the group is structure, not a box — wrap it in a Box or Card for a surface. `disabled` uses aria-disabled on the fieldset and passes `disabled` to its direct child fields (fragments flattened; the native disabled attribute on fieldset would remove fields from the tab order). No React FieldsetContext is exported, and no field (NumberInput included) reads one: a field nested deeper than a direct child is not disabled by the group, so pass it `disabled` yourself. Before render a "field" is any component element or a native input, select, textarea, button or fieldset element; plain DOM elements such as <p> are left alone, and the same rule decides which children count for the required indicator. The description part is a <div data-part="description"> with the description id around the muted Text. The `fields` part is a <div data-part="fields"> wrapper Fieldset owns around the Stack; the Stack keeps its own data-part. The errorMessage part is a <div role="alert" data-part="errorMessage"> with the error id around the danger Text. A <legend> does not participate in flex gap, so partGap below it is a margin. With `error` set, the <fieldset> carries aria-invalid="true" and aria-describedby the error id (the group is the invalid thing; fields inside keep their own state).'
    lit:
      tag: ds-fieldset
      reflect: [disabled, gap]
      notes: 'Shadow root with a <fieldset><legend> and a default slot for the fields, which stay in the light DOM so ds-form still collects them. The group error is rendered in the shadow root, and the <fieldset> carries aria-invalid="true" with it, as on web. The legend, description and error render their text through <ds-text> (element span) inside the native <legend>, a description wrapper and a role=alert wrapper (the description, fields and errorMessage wrappers are Fieldset-owned <div>s carrying both data-part and part, as on web), so legendSize, legendWeight, helperSize, fontFamily and lineHeight reach them only as Text overrides, never as Fieldset rules or by setting --ds-text-* hooks. `disabled` is set as the `disabled` property on direct light-DOM children carrying data-ds-field, on slotchange and whenever `disabled` changes, remembering which it set so clearing never enables a field disabled on its own. The required indicator is derived from those same direct data-ds-field children''s `required`, recomputed on slotchange and on their `required` attribute changes. The group''s role and accessible name come from the native <fieldset>/<legend> inside the shadow root; ids never cross the shadow boundary.'
    rn:
      element: View
      props: [role, accessibilityLabel, accessibilityHint]
      notes: 'A View with `role="group"` (not the legacy accessibilityRole) that is NOT `accessible` (so children stay individually reachable). Its accessibilityLabel is the legend plus copy.requiredIndicator when shown; `description` maps to its accessibilityHint. The legend is plain Text — not a header trait, which would put it in the headings rotor — and FieldsetContext carries `disabled` and the legend, which Input, Checkbox, Switch and RadioGroup read: they render disabled and prefix their accessibilityLabel with the legend ("Shipping address, Street"), which is how VoiceOver and TalkBack users learn the grouping on native. There is no clone fallback. A non-field child (plain Text, a custom control) gets no legend association on native; that is acceptable, since the legend is still read in order before it. The legend, description, fields Stack and error sit in plain Views carrying `Fieldset.legend`, `Fieldset.description`, `Fieldset.fields` and `Fieldset.errorMessage` testIDs, because Text and Stack take none. A non-accessible View exposes no state, so `disabled` is not asserted on the group; RN tests check the legend text and toHaveAccessibleName on the group view; the name check lives in the derived accessible-name scenario, so `the-legend-names-the-group` checks text only on native. The composition''s `element: span` is not passed to the Texts (RN Text has no `element` prop). The visible legend Text includes copy.requiredIndicator when shown, but FieldsetContext carries the bare legend, so fields read "Shipping address, Street". The group error is announced as in Input: the Android live region sits on the `Fieldset.errorMessage` wrapper View (role=alert has no native equivalent), which is why `a-group-error-is-announced` is web/Lit only.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Stack, FieldsetContext=environment]
      notes: 'A `.accessibilityElement(children: .contain)` labelled by the legend (`Heading` or `Text` per `legendLevel`) wrapping a `Stack` of fields with `gap` forwarded through `overrides`. Provides `FieldsetContext` (`disabled`, legend) through the environment so fields prefix their accessibility label with the legend (''Shipping address, Street'') — the iOS way to say what `<fieldset>` says.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/error-identified ones from the schema.
    - name: the-legend-names-the-group
      description: The legend is always visible and is the group's accessible name.
      given: { legend: 'Delivery window' }
      then:
        - { text: 'Delivery window' }
        - { name: 'Delivery window', platforms: [web, lit] }
    - name: the-description-is-rendered
      description: Persistent helper text under the legend, linked to the group.
      given: { description: 'We only ship within the EU.' }
      then:
        - { text: 'We only ship within the EU.' }
    - name: a-group-error-is-announced
      description: The group error is rendered once under the group with role=alert.
      given: { error: 'End date must be after start date.' }
      then:
        - { role: alert, platforms: [web, lit] }
    - name: a-disabled-group-is-marked-disabled
      description: aria-disabled on the fieldset; the fields inside stay visible and focusable by their own rule.
      given: { disabled: true }
      then:
        - { state: disabled, is: true, platforms: [web, lit] }
  examples:
    - name: shipping-address
      description: Two related Inputs, labelled Street and City, as direct children under one legend.
      given: { legend: 'Shipping address', children: 'An Input name=street label=Street and an Input name=city label=City' }
    - name: notification-preferences
      description: Three Checkboxes, labelled Email, SMS and Push, with the rule that governs them under the legend.
      given: { legend: 'Notification preferences', description: 'You can change these at any time.', children: 'A Checkbox name=email label=Email, a Checkbox name=sms label=SMS and a Checkbox name=push label=Push', gap: 'tight' }
    - name: date-range-with-a-group-error
      description: Cross-field validation reported on the group rather than on one field, across two text Inputs labelled Start date and End date.
      given: { legend: 'Reporting period', error: 'End date must be after start date.', children: 'An Input name=startDate label=Start date and an Input name=endDate label=End date' }
    - name: disabled-group
      description: Every field inside disabled while the section does not apply - two Inputs labelled Street and City.
      given: { legend: 'Billing address', disabled: true, children: 'An Input name=street label=Street and an Input name=city label=City' }
---

A fieldset is how a form says "these belong together." A screen-reader user tabbing into "Street" hears "Shipping address, Street" and knows where they are; a sighted user sees the legend and the fields indented under it by nothing more than rhythm. It is the container RadioGroup builds on, offered for any set of fields: an address, a date range, a set of notification switches.

## When to use

Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather than on one field.

## When not to use

Do not wrap a whole form in a Fieldset; the Form's `label` names the form. Do not use it for a single field. Do not use it for visual grouping without a shared meaning — that is a Box or a Card — and do not use it as a page section (Landmark, Heading with `section` spacing). RadioGroup already is a fieldset; do not nest one inside it.

## Behavior

Renders the legend, optional description, the fields in a Stack with `gap`, and the error only while `error` is set. `disabled` disables every field inside while keeping them visible and focusable per each field's own rule. How it reaches them differs by platform: on web, Fieldset passes `disabled` to its direct child fields (fragments flattened; no React FieldsetContext is exported); on Lit, ds-fieldset sets the `disabled` property on direct children carrying data-ds-field on slotchange and whenever `disabled` changes, remembering which it set; on React Native and SwiftUI, `FieldsetContext` carries `disabled` and the legend, and Input, Checkbox, Switch and RadioGroup read it (there is no clone fallback). Inside a Form, the group itself is not a field; its children register individually, and the group `error` is set by the consumer from `onInvalid` or its own cross-field check. The `requiredIndicator` is appended inside the legend when every field inside is required, so the indicator is not repeated on each. It is plain text appended to the legend string inside the legend Text (no separate span or styling), so it inherits the legend Text's styling and is part of the group's accessible name on every platform ("Shipping address (required)"; on React Native the group's accessibilityLabel includes it). The required indicator is derived: it appears when every direct child field has `required` — the property or the attribute, either counts — and a group with no fields shows no indicator (fragments are flattened and count as direct on web and React Native; fields wrapped in a consumer's own container are not inspected — put fields directly inside the Fieldset). On Lit it is recomputed on slotchange and when a direct data-ds-field child's `required` attribute changes. On React Native the group uses the `role="group"` prop (RN ≥ 0.74), not the legacy accessibilityRole.

CSS hooks on web and Lit: only the bindings Fieldset's own elements read declare a --ds-fieldset-* hook — `partGap` (--ds-fieldset-part-gap) and `disabledOpacity` (--ds-fieldset-disabled-opacity). Bindings that only forward to a composed child (`legendSize`, `legendWeight`, `helperSize`, `fontFamily`, `lineHeight`, `fieldsGap`) and the tone-realised colors declare no hook; they are always sent as the resolved token (the override, else the binding's default token) through the child's own `overrides`.

## Content guidelines

Legends are short noun phrases in sentence case ("Shipping address") or, for a set of choices, the question ("Which days should we deliver?"). Descriptions state a rule in one sentence. Group errors name the relationship that failed ("End date must be after start date"), not the field.

## Accessibility

A native group with a name means the relationship between fields is programmatically determinable (WCAG 1.3.1) and each field's accessible context includes the group (3.3.2). Description and error are linked from the group with `aria-describedby`, the group carries `aria-invalid` while an error is set, and the error announces when it appears (3.3.1). No color-only signals; text meets AA in both modes.

## Platform notes

### Web
`<fieldset aria-describedby>` with `<legend>` and a `Stack` for the children inside a `data-part="fields"` wrapper Fieldset owns; reset the browser's border, padding and `min-inline-size`. Render the legend, description and error as `Text` (element span) inside Fieldset-owned elements carrying the parts and ids; the error wrapper has `role="alert"` and exists only while `error` is set. For `disabled`, set `aria-disabled` on the fieldset and pass `disabled` to its direct child fields, flattening fragments. Fieldset exports no FieldsetContext on web.

### Lit
`<ds-fieldset legend="Shipping address" gap="normal">` with a shadow `<fieldset><legend>` and a default slot. Set the `disabled` property on direct children carrying `data-ds-field` on `slotchange` and whenever `disabled` changes, remembering which elements it disabled so clearing does not enable a field that was disabled on its own. Derive the required indicator from the same children's `required` on `slotchange` and on their `required` attribute changes.

### React Native
`View` (not `accessible`) with `role="group"`, an accessibilityLabel of the legend plus the required indicator, and `description` as its accessibilityHint; the legend, description and error are `Text` inside plain Views carrying `Fieldset.<part>` testIDs. Provide a `FieldsetContext` carrying `disabled` and the legend; Input, Checkbox, Switch and RadioGroup read it, render disabled and prefix the legend into their `accessibilityLabel`. Fieldset does not clone children. The group error uses the same announcement mechanism as Input. Tests check the legend text and toHaveAccessibleName on the group view; a non-accessible View exposes no disabled state, so disabled is not asserted there.

## Related

Form, Input, Checkbox, RadioGroup, Stack, Box.
