# Gaps reported while generating Form for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:24 — round 1

- Form: anatomy lists separate 'fields' and 'actions' parts, but `children` is a single content prop with no dedicated actions slot — implemented one `part="fields"` slot covering both fields and actions; there is no distinct DOM node for 'actions'.
- Form: the DsFormField interface (per doc) declares `error`/`validationMessage` as required strings, but the already-existing `ds-switch` (a field type Form must collect) has neither property since a switch never validates — kept the interface as documented and read both defensively (`?? ''`) at runtime via `as unknown as DsFormField` casts, since Switch can never satisfy the interface structurally.
- Form: 'blur' validation for ds-radio-group ('validates when focus leaves the whole group') isn't spelled out mechanically — implemented by comparing a focusout event's `relatedTarget === target`, since composed-event retargeting collapses both to the `ds-radio-group` host when focus moves between its own radios, but stays distinct when focus truly leaves the group; this is my interpretation, not something stated in the docs.
- Form: nothing requires a consumer's field to carry an `id`, but the error summary must link to one — used `name` as documented ('the base of generated ids') to auto-assign `${idBase}-${field.name}` to any field missing an id at submit time.
- Form: `labelledBy` (aria-labelledby across the shadow boundary) is wired through the newer `ElementInternals.ariaLabelledByElements`, feature-detected exactly like `Card.ts` already does — Chromium only today; there is no fallback for engines lacking it, so `labelledBy` currently has no effect there (same pre-existing gap as Card).
- Form: the 'control-is-focusable' scenario (derived, lit/web) doesn't fit cleanly — Form is a container of externally-slotted fields, not a single control, so its own shadow root has no focusable element unless the error summary is showing; relied on the browser's `delegatesFocus` fallback (focuses the host itself when no inner focusable target exists) to satisfy `el.focus()` moving `document.activeElement`.
