# Gaps reported while generating Form for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:22 — round 1

- Form: the shared FormFieldHandle contract (register/getValue/validate/focus) used by Input/Checkbox/Switch/RadioGroup carries no field label, so the RN error-summary link's accessibilityLabel is just the error text, not "Label: error text" per the content guideline — matching web/Lit would require extending that shared handle across all field components, out of scope for a Form-only pass.
- Form: `name` has no functional use on RN (no DOM ids; focus is ref-based) — kept purely for prop parity with web/Lit's 'base of generated ids' description.

## 2026-09-10 17:33 — round 1

- Form: the spec's platforms.rn.notes describes the context shape as `{ register, unregister, submit, errors, validateMode, disabled, focusField }` but Input/Button/Checkbox/Switch/RadioGroup (pre-existing in the package) already call `form.reportValidity(name, error)` and read `form.order`/`form.errors[name]` directly rather than a plain `errors` object passed down — I added `reportValidity` and `order` to FormContextValue to match the already-shipped field components instead of the notes' shorter list, since rewriting five other components' contract was out of scope.
- Form: FormContext.tsx did not exist even though five components (Input, Button, Checkbox, Switch, RadioGroup, plus Form itself) already imported from it — I created it to match the exact shape those files already assume (FormFieldHandle = {getValue, validate, focus}), rather than inventing a new contract.
- Form: content guidance says each error-summary item should read 'Label: error text', but the field registration contract (FormFieldHandle) shared by Input/Checkbox/Switch/RadioGroup carries no `label`, only a validation message — those components would need to add `label` to their handle for this to be possible. I left the summary showing just the message text, consistent with the existing field components.
- Form: the `name` prop has no observable effect on React Native (no DOM ids to generate, unlike web/Lit) — kept for API parity per the platform notes, but it's inert here.
- Form: `errorSummary`'s View lacks a dedicated `errorSummaryText`/`errorSummaryBackground` binding constant in code — those locked tokens are applied via `Text tone="danger"` and `colorBackgroundSubtle` directly (matching Text's own token) rather than duplicated as separate style variables, since they're non-overridable and this avoids drift from Text's own danger-tone token.
