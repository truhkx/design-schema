---
title: Fieldset
description: Groups related fields under a legend so the relationship is announced, with an optional description and a group-level error — the container RadioGroup uses internally, exposed for any set of fields.
component:
  name: Fieldset
  category: input
  status: review
  anatomy: [group, legend, description, fields, errorMessage]
  composition:
    legend: Text
    description: Text
    fields: Stack
  props:
    legend:
      type: string
      required: true
      description: 'The group''s name — what the fields together describe ("Shipping address", "Notification preferences"). Always visible.'
      a11y: The accessible name of the group; screen readers read it before each field inside.
    children:
      type: content
      required: true
      description: The fields, usually a Stack of Inputs, Checkboxes or Switches.
    description:
      type: string
      description: Persistent helper text under the legend.
      a11y: Linked with aria-describedby on the group.
    error:
      type: string
      description: A group-level error (cross-field validation such as "End date must be after start date"). Field-level errors stay on the fields.
      a11y: Rendered once under the group with role=alert and linked with aria-describedby; while set, the group carries aria-invalid="true" (accessibilityState invalid is not available on native, so the error text alone identifies it there).
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
    legendColor: { token: color.foreground }
    legendSize: { token: font.size.md }
    legendWeight: { token: font.weight.medium }
    descriptionText: { token: color.foreground.muted }
    helperSize: { token: font.size.sm }
    errorText: { token: color.foreground.danger }
    partGap: { token: layout.gap.tight, description: 'Vertical gap between legend, description, fields and error.' }
    fieldsGap: { token: 'layout.gap.{gap}', description: 'The composed Stack''s gap. An `overrides.fieldsGap` is forwarded to the Stack''s own `overrides.gap`; Fieldset never styles the Stack itself.' }
    disabledOpacity: { token: opacity.disabled }
    fontFamily: { token: font.family.body }
    lineHeight: { token: font.lineHeight.normal }
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
      attributes: [aria-describedby, aria-disabled]
      notes: 'A native <fieldset> with a <legend>. No border and no padding (the browser defaults are reset); the group is structure, not a box — wrap it in a Box or Card for a surface. `disabled` uses aria-disabled on the fieldset plus each field''s own disabled handling (the native disabled attribute on fieldset would remove fields from the tab order). A <legend> does not participate in flex gap, so partGap below it is a margin. With `error` set, the <fieldset> carries aria-invalid="true" and aria-describedby the error id (the group is the invalid thing; fields inside keep their own state).'
    lit:
      tag: ds-fieldset
      reflect: [disabled, gap]
      notes: 'Shadow root with a <fieldset><legend> and a default slot for the fields, which stay in the light DOM so ds-form still collects them. The group error is rendered in the shadow root. `disabled` is propagated to slotted ds-* fields via their `disabled` property on slotchange and reverted when cleared (remembering which it set), the same way ds-form does.'
    rn:
      element: View
      props: [accessibilityRole, accessibilityLabel, accessibilityHint]
      notes: 'A View that is NOT `accessible` (so children stay individually reachable). The legend is plain Text — not a header trait, which would put it in the headings rotor — and each child field receives the legend as a prefix in its accessibilityLabel through a FieldsetContext ("Shipping address, Street"), which is how VoiceOver and TalkBack users learn the grouping on native. The group error is announced as in Input.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, .accessibilityLabel, Stack, FieldsetContext=environment]
      notes: 'A `.accessibilityElement(children: .contain)` labelled by the legend (`Heading` or `Text` per `legendLevel`) wrapping a `Stack` of fields with `gap` forwarded through `overrides`. Provides `FieldsetContext` (`disabled`, legend) through the environment so fields prefix their accessibility label with the legend (''Shipping address, Street'') — the iOS way to say what `<fieldset>` says.'
---

A fieldset is how a form says "these belong together." A screen-reader user tabbing into "Street" hears "Shipping address, Street" and knows where they are; a sighted user sees the legend and the fields indented under it by nothing more than rhythm. It is the container RadioGroup builds on, offered for any set of fields: an address, a date range, a set of notification switches.

## When to use

Use a Fieldset whenever two or more fields share a name a user would say aloud — an address, a card, "Which days?" as a set of Checkboxes, a start and end date. Give it a `description` when the group needs a rule ("We only ship within the EU") and put cross-field errors on the group rather than on one field.

## When not to use

Do not wrap a whole form in a Fieldset; the Form's `label` names the form. Do not use it for a single field. Do not use it for visual grouping without a shared meaning — that is a Box or a Card — and do not use it as a page section (Landmark, Heading with `section` spacing). RadioGroup already is a fieldset; do not nest one inside it.

## Behavior

Renders the legend, optional description, the fields in a Stack with `gap`, and an optional error. `disabled` disables every field inside while keeping them visible and focusable per each field's own rule. Inside a Form, the group itself is not a field; its children register individually, and the group `error` is set by the consumer from `onInvalid` or its own cross-field check. The `requiredIndicator` is appended to the legend when every field inside is required, so the indicator is not repeated on each. The required indicator is derived: it appears when every direct child field has `required` (fields wrapped in a consumer's own container are not inspected — put fields directly inside the Fieldset). `disabled` and the legend reach the fields through `FieldsetContext`, which Input, Checkbox, Switch and RadioGroup read: they render disabled, and on native prefix their accessibility label with the legend; until a field reads the context, Fieldset also clones direct children with `disabled`. On React Native the group uses the `role="group"` prop (RN ≥ 0.74), not the legacy accessibilityRole.

## Content guidelines

Legends are short noun phrases in sentence case ("Shipping address") or, for a set of choices, the question ("Which days should we deliver?"). Descriptions state a rule in one sentence. Group errors name the relationship that failed ("End date must be after start date"), not the field.

## Accessibility

A native group with a name means the relationship between fields is programmatically determinable (WCAG 1.3.1) and each field's accessible context includes the group (3.3.2). Description and error are linked from the group with `aria-describedby`, the group carries `aria-invalid` while an error is set, and the error announces when it appears (3.3.1). No color-only signals; text meets AA in both modes.

## Platform notes

### Web
`<fieldset aria-describedby>` with `<legend>` and a `Stack` for the children; reset the browser's border, padding and `min-inline-size`. Render the description and error as `Text` with ids; the error has `role="alert"`. For `disabled`, set `aria-disabled` on the fieldset and pass `disabled` down through a `FieldsetContext` that Input, Checkbox, Switch and RadioGroup read (add the context read to those components when they regenerate; until then, the fieldset clones direct children with `disabled`).

### Lit
`<ds-fieldset legend="Shipping address" gap="normal">` with a shadow `<fieldset><legend>` and a default slot. Propagate `disabled` to slotted `ds-*` fields on `slotchange` and on change, remembering which elements it disabled so clearing does not enable a field that was disabled on its own.

### React Native
`View` (not `accessible`) with the legend and description as `Text`; provide a `FieldsetContext` with the legend that Input, Checkbox, Switch and RadioGroup prefix into their `accessibilityLabel`. The group error uses the same announcement mechanism as Input. `disabled` flows through the same context.

## Related

Form, Input, Checkbox, RadioGroup, Stack, Box.
