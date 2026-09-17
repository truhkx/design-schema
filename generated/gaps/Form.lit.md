# Gaps reported while generating Form for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:24 — round 1

- Form: anatomy lists separate 'fields' and 'actions' parts, but `children` is a single content prop with no dedicated actions slot — implemented one `part="fields"` slot covering both fields and actions; there is no distinct DOM node for 'actions'.
- Form: the DsFormField interface (per doc) declares `error`/`validationMessage` as required strings, but the already-existing `ds-switch` (a field type Form must collect) has neither property since a switch never validates — kept the interface as documented and read both defensively (`?? ''`) at runtime via `as unknown as DsFormField` casts, since Switch can never satisfy the interface structurally.
- Form: 'blur' validation for ds-radio-group ('validates when focus leaves the whole group') isn't spelled out mechanically — implemented by comparing a focusout event's `relatedTarget === target`, since composed-event retargeting collapses both to the `ds-radio-group` host when focus moves between its own radios, but stays distinct when focus truly leaves the group; this is my interpretation, not something stated in the docs.
- Form: nothing requires a consumer's field to carry an `id`, but the error summary must link to one — used `name` as documented ('the base of generated ids') to auto-assign `${idBase}-${field.name}` to any field missing an id at submit time.
- Form: `labelledBy` (aria-labelledby across the shadow boundary) is wired through the newer `ElementInternals.ariaLabelledByElements`, feature-detected exactly like `Card.ts` already does — Chromium only today; there is no fallback for engines lacking it, so `labelledBy` currently has no effect there (same pre-existing gap as Card).
- Form: the 'control-is-focusable' scenario (derived, lit/web) doesn't fit cleanly — Form is a container of externally-slotted fields, not a single control, so its own shadow root has no focusable element unless the error summary is showing; relied on the browser's `delegatesFocus` fallback (focuses the host itself when no inner focusable target exists) to satisfy `el.focus()` moving `document.activeElement`.

## 2026-09-10 17:25 — round 1

- Form: schema requires `actions` as a separate content prop with its own named slot and `actions` anatomy part, distinct from `children`/`fields` — the pre-existing Form.ts only had one default slot mixing fields and the button row. Added a named `actions` slot (`<slot name="actions" part="actions">`) and updated Form.stories.ts to slot the action row separately; the flex-column `gap` on the native `<form>` already applies uniformly between the fields slot and the actions slot, matching the styles.gap description ('between fields and between fields and actions').
- Form (lit platform notes) is self-contradictory about field discovery: it first states 'Form discovers fields by the data-ds-field attribute ... never by a tag list' (matching the package conventions doc's 'Form discovers fields by that attribute, never by a tag or component list'), then in the same paragraph says 'Instead it collects light-DOM fields by tag (ds-input, ds-checkbox, ds-switch, ds-radio-group)'. Kept the existing tag-based querySelectorAll implementation since the actual sibling field components (e.g. Input.ts) only set `data-ds` (component name), not `data-ds-field` — switching to attribute-based discovery would silently stop collecting every existing field until Input/Checkbox/Switch/RadioGroup are also updated, which is out of scope for a Form-only change.
- index.ts was missing the `FormOverridableBinding` type export (every sibling component exports its `<Name>OverridableBinding` type) even though Form.ts already defined and used it — added it to the type export list.

## 2026-09-16 04:15 — round 1

- Form: the lit notes require discovery by `data-ds-field` only, but in the Lit package only Input.ts sets that attribute; Checkbox, Switch, RadioGroup, Select, NumberInput and DatePicker do not, so a ds-form no longer collects them until they are regenerated with it. I followed the spec (attribute only) instead of keeping the old tag list.
- Form: `form.discovery: context` has no Lit counterpart; the lit notes describe attribute discovery over the light-DOM subtree, which is what I implemented.
- Form: the guidance says Checkbox/Switch validate on change under `blur`, but attribute-only discovery gives no way to tell a field's kind. I detect it from the event's origin (a native input[type=checkbox] or an element with role=switch); the docs should say how a field declares that it has no blur moment (e.g. a `data-ds-field="change"` value).
- Form: the lit notes say Enter submits 'in a ds-input', while the Lit guidance says 'on Enter in any field'. I chose any `data-ds-field` field, skipping a textarea, a native button or a link as the event's origin, since Enter should not submit from a multi-line field.
- Form: the notes say `disabled` goes to 'the fields it found', while the `submitting` example says 'every field and action disabled'. I disable found fields plus `ds-button` descendants (found by tag, since actions have no discovery attribute).
- Form: `copy.invalidSummary` ('This form has errors.') has no stated use on web or Lit (only SwiftUI announces it); the role=alert summary already announces the heading, so it is unused on Lit.
- Form: `copy.summaryHeadingOne` duplicates the `one` form of `copy.summaryHeading.plural`; I used it as that `one` form. The plural locale is not specified; I use the nearest [lang] ancestor, falling back to navigator.language.
- Form: `errorSummary` defaults true, so per convention its attribute is the negated `no-error-summary`; the doc names no attribute, and this breaks the old `error-summary` attribute.
- Form: the summary item is described as 'a link' but Link is not in Related. I composed ds-link with tone=inherit so the locked danger text color reaches it, and preventDefault its click to focus the field instead of changing the URL hash.
- Form: `DsFormField.currentValue` stays `string | boolean | null`, as the submit payload is `Record<string, string | boolean>`, but the Lit guidance widens the field value contract to `string | number | boolean | string[] | [number, number]`; the event payload and that contract disagree.
- Form: the four examples give `children`/`actions` as prose ('An email Input and a password Input'), which cannot be story args; I passed the scalar givens as args and built the described content in each story's render.
- Form: the behavior scenario `label-names-the-form-landmark` is web-only, so there is no Lit test for it, though the host does carry role=form and aria-label.
- Form: the error summary's internal padding, radius, border width and item spacing have no style bindings; I used space.md padding, radius.md, border-width.thin, layout.gap.tight between items and space.sm/space.lg list padding.

## 2026-09-17 04:31 — round 1

- Form: the package digest types `DsFormField.currentValue` as `string | boolean | null`, but the doc's Lit notes say it uses the full onSubmit value contract; I widened it to `string | number | boolean | string[] | [number, number] | null` (null = contributes no key). The digest should be updated.
- Form: 'an empty field contributes no key' does not define empty for a field; Form omits `null` and `''` but not an empty array, so an empty multi-select Listbox would submit `[]`. Chose field-reported null plus the empty string.
- Form: `errorSummaryGap` is 'gap between the heading and the list and between list items' with the list as a Stack, but Stack's gap is an enum and its override lives in Stack; I forwarded it by setting Stack's `--ds-stack-gap` hook from `--ds-form-error-summary-gap` on the composed `ds-stack`s. The doc should say which forwarding mechanism is sanctioned (the child's `overrides` property or its hook).
- Form: the summary's outer arrangement (heading + list) is not named as a part or element; I used a `<ds-stack gap=tight>` inside the `errorSummary` div.
- Form: `role="alert"`, `tabindex="-1"` and the Link `href` for summary items are given only in the Web notes; Lit reuses them (`href="#<field id>"`, with the click default prevented so the hash never changes). If there is no field id, the href is `#`.
- Form: in `validate: change` mode the doc does not say whether fields also validate on blur; I validate only on change (plus blur and change after a failed submission).
- Form: the doc gives no text for an item whose field has an empty message AND an empty `label`; I fall back to the field `name`.
- Form: the behavior scenario `label-names-the-form-landmark` is checked through host `role`/`aria-label` attributes rather than a computed accessible name; the lit tests have no accessible-name helper.
- Form: example `long-form-validated-on-blur` names the fields but not input types (phone/email); stories use the default Input type for them, following the `given` literally.
