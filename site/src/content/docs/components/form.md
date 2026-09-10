---
title: Form
description: Groups fields, collects their values, and handles submission with consistent validation and error announcement on every platform.
component:
  name: Form
  category: container
  status: review
  anatomy: [container, fields, errorSummary, actions]
  props:
    children:
      type: content
      required: true
      description: 'Fields (Input etc.) and layout (Stack). The action row goes in `actions`.'
    actions:
      type: content
      required: true
      description: 'The action row: at least one Button with `type: submit`, primary first (Form''s action-order rule). Rendered after the fields with the form gap; a named slot on Lit and the `actions` anatomy part on every platform.'
    name:
      type: string
      description: Identifier for the form, used for analytics and as the base of generated ids.
    label:
      type: string
      description: Accessible name for the form landmark, e.g. "Sign in". Required when a page has more than one form and `labelledBy` is not set.
      a11y: Rendered as aria-label so the form is a named region.
    labelledBy:
      type: string
      description: Id of a visible Heading that names the form. Wins over `label` when both are set.
      a11y: Rendered as aria-labelledby.
      platforms: [web, lit]
    validate:
      type: enum
      values: [submit, blur, change]
      default: submit
      description: When field-level validation runs. `submit` is the least noisy; `blur` is the usual choice for longer forms.
    disabled:
      type: boolean
      default: false
      description: Disables every field and action inside. Use while submitting.
    errorSummary:
      type: boolean
      default: true
      description: When submission fails validation, render a summary of errors above the fields that links to each field.
      a11y: The summary receives focus and is announced, so users find every error without hunting.
  events:
    onSubmit:
      description: 'Fired when the form is submitted and every field is valid. Receives the collected values keyed by field name: `Record<string, string | boolean>` — Input and RadioGroup contribute strings, Switch a boolean, Checkbox its `value` when checked; an unchecked Checkbox, an unselected RadioGroup and a disabled field contribute no key at all.'
      platforms: { web: onSubmit, lit: submit, rn: onSubmit }
    onInvalid:
      description: Fired when submission is blocked by validation. Receives the errors keyed by field name.
      platforms: { web: onInvalid, lit: invalid, rn: onInvalid }
  styles:
    gap: { token: layout.gap.loose, description: 'Vertical gap between fields and between fields and actions — the rhythm preset, so a theme''s `layout.rhythm` reaches every form.' }
    errorSummaryBorder: { token: color.border.danger }
    errorSummaryText: { token: color.foreground.danger }
    errorSummaryBackground: { token: color.background.subtle }
  copy:
    summaryHeading: '{count} problems with this form'
    summaryHeadingOne: '1 problem with this form'
  a11y:
    role: form
    requires: [error-identification, keyboard-operable, focus-visible]
    contrast:
      - { foreground: color.foreground.danger, background: color.background.subtle, level: AA }
  platforms:
    web:
      element: form
      attributes: [novalidate, aria-label, aria-labelledby]
      notes: Native submit semantics — Enter in a field submits, and a Button with type=submit triggers it. `novalidate` is set so the system's own error UI is used instead of browser bubbles.
    lit:
      tag: ds-form
      reflect: [disabled]
      notes: 'Wraps a native <form novalidate> in the shadow root, but form ownership is DOM-tree based, so slotted light-DOM ds-inputs are NOT owned by it. ds-form therefore collects ds-input children by `name` via querySelectorAll, submits on a composed `press` from a ds-button[type=submit] and on Enter in a ds-input, and propagates `disabled` to children (remembering which it disabled). Dispatches `submit` with `{ values }` and `invalid` with `{ errors }` in detail. Never nest inside a native form.'
    rn:
      element: View
      props: [accessibilityLabel]
      notes: 'No native form on iOS/Android. Form provides a context { register, unregister, submit, errors, validateMode, disabled, focusField }; Inputs register { name, getValue, validate, focus } in mount order; a Button with type=submit calls submit(). Non-last fields get returnKeyType="next" (focusField), the last gets "done" (submit). Disabled Inputs do not register. On failed submit the summary is announced (accessibilityLiveRegion="assertive" on Android, announceForAccessibility on iOS) and focus moves to the summary when errorSummary is on, otherwise to the first invalid field — same as web.'
---

Form is the container that makes fields behave as a group. It knows which fields exist, collects their values, runs validation at the configured moment, shows errors in a consistent way, and only calls `onSubmit` when everything is valid.

## When to use

Use Form whenever two or more fields are submitted together, and for any single field whose submission has consequences (sign-in, search with side effects). Place actions (submit, cancel) at the end in a Stack. Give the form a `label` when the page contains more than one.

## When not to use

Do not use Form for instant-apply settings (a Switch that saves on change) — those are not submitted. Do not nest forms. Do not use Form as a generic layout container; use Stack.

## Behavior

Submission is triggered by a Button with `type: submit`, by pressing Enter in a single-line field on web, or by the keyboard's done key on native. On submit, the form validates every field: `required` fields must have a value, fields with an `error` prop are invalid, and `invalid` fields are invalid. If anything fails, focus moves to the error summary (or the first invalid field when `errorSummary` is off), `onInvalid` fires with the errors, and `onSubmit` does not. Under `validate: submit`, nothing validates before the first submission; after a failed submission, fields re-validate on blur and change so errors clear as they are fixed. When a Form has an error summary, the Form announces errors and Inputs stay silent; a standalone Input announces its own error. If everything passes, `onSubmit` fires with values keyed by each field's `name` (see the event for the value contract). Fields are Input, Checkbox, Switch and RadioGroup — anything that registers with the Form. Each field owns its own messages: the Form renders a field's `copy.required` and never composes a message of its own. Under `validate: blur`, controls with no useful blur moment (Checkbox, Switch) validate on change, and RadioGroup validates when focus leaves the whole group. A field inside a closed Disclosure is not collected unless the Disclosure has `keepMounted`. Setting `disabled` while the request is in flight prevents double submission and is reflected on every field and action.

## Content guidelines

Name the submit action after the outcome ("Create account", not "Submit"). Order actions by importance in reading order on every platform: the primary submit Button first, then at most one `secondary` alternative such as "Cancel", so keyboard and screen-reader focus reaches the main action first and the two never compete visually. A destructive action ("Delete account") does not belong in the same Stack as Save; give it its own section further down. Never present Cancel as `ghost` next to a primary — the pairing reads as one real button and one afterthought. The error summary heading uses `copy.summaryHeading` and each item is a link reading "Label: error text" so users can act from the summary alone. The heading is rendered as strong Text, not a Heading, so it never disturbs the page outline.

## Accessibility

The form is a named landmark when `label` is given (WCAG 1.3.1, 2.4.1). Errors are identified in text at the field and, by default, in a summary that receives focus and links to each field (3.3.1, 3.3.3). Required fields are indicated in the label text, not only by color or an asterisk alone (1.4.1, 3.3.2). Validation on `submit` avoids interrupting users mid-entry; `blur` validation is available when earlier feedback is better. Everything is keyboard operable, including submission with Enter (2.1.1). No time limits are imposed by the form itself.

## Platform notes

### Web
Renders `<form novalidate>` and handles the native `submit` event, preventing default. The error summary is a `<div role="alert" tabindex="-1">` that receives focus on failed submission and contains links to each invalid field's id.

### Lit
`<ds-form label="Sign in">` wraps a native `<form>` in its shadow root with a default slot for fields and a named `actions` slot, but form ownership is DOM-tree based, so the slotted fields are not owned by it. The field value contract is `string | boolean | string[]` (arrays from multi-select Listbox, Select and Combobox), absent when empty. The field interface (`DsFormField`) has `error` and `validationMessage` as optional strings: a field that never validates (Switch) omits them, and Form treats absence as valid. Every field handle also carries its `label`, so the error summary can read "Label: message" on all three platforms (the RN `FormFieldHandle` includes `label` too). Instead it collects light-DOM fields by tag (`ds-input, ds-checkbox, ds-switch, ds-radio-group`) that implement the exported `DsFormField` interface — `name`, `label`, `required`, `disabled`, `error`, `currentValue`, `id`, `focus()`, `checkValidity()`, `validationMessage` (the field's own copy string, which the summary renders) — skipping fields without a `name` and fields inside a closed `ds-disclosure` without `keep-mounted`. Submits on a composed `press` from a `ds-button[type=submit]` and on Enter in any field (it listens for `keydown` on the host, never for a CustomEvent named after a native event; blur validation uses `focusout`). Fields must validate synchronously: setting `error` updates `invalid` and the ElementInternals validity at once, so `checkValidity()` is correct immediately afterwards. Dispatches composed `submit` (`detail.values`, same contract as web) and `invalid` CustomEvents; the component never navigates.

### React Native
There is no form element. Form renders a `View` with `accessibilityLabel` and provides a React context; each field registers `{ name, label, getValue, validate, focus }` on mount; `getValue` may return a string, a boolean, or `undefined` (omitted from the values). A Switch always validates as valid. A Button with `type: submit` calls `submit()` from the context. The last Input gets `returnKeyType="done"` and `onSubmitEditing` wired to submit. The error summary uses `accessibilityLiveRegion="assertive"` on Android and `AccessibilityInfo.announceForAccessibility` on iOS, then focuses the first invalid field with `AccessibilityInfo.setAccessibilityFocus`.

## Related

Input, Button, Stack.
