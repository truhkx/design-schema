# Gaps reported while generating Checkbox for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:43 — round 1

- Checkbox: Checkbox.ts and Checkbox.stories.ts already existed, fully implementing props/events/forms/behavior/a11y, but predated the overrides-hook convention — added the CheckboxOverridableBinding type, --ds-checkbox-* CSS hooks on :host, the `overrides` property, applyOverrides(), and the data-ds="Checkbox" testability attribute, mirroring Button.ts's pattern (many other components in the package — Switch, Alert, RadioGroup, Disclosure, Meter, Breadcrumb, Landmark, FocusScope — are still missing this and weren't in scope to fix here).
- Checkbox: the indicator's check-mark/dash inset math ('controlSize minus 2 × space.1') isn't tied to any named overridable binding — partGap is documented specifically as the vertical gap between label/description/error, a different anatomy target, even though it shares space.1 as a default. Left the inset as a non-overridable literal var(--space-1) rather than repurposing partGap's hook for an unrelated part.

## 2026-09-16 04:45 — round 1

- Checkbox: the Controlled state section says `checked` is controlled when set and uncontrolled from `defaultChecked` otherwise, but platforms.lit.notes and the controlled-follows-prop scenario say that on Lit `checked` is the live state and only the attribute sets the start. I followed the Lit notes: the property falls back to `defaultChecked` until set, then tracks toggles.
- Checkbox: what the Form collects is contradictory. form.valueType is boolean and the Lit notes say 'ds-form collects the boolean', but the Behavior prose says 'The Form collects `value` when checked and nothing (no key) when unchecked'. I made `currentValue` the boolean, so an unchecked box submits `false` and several checkboxes sharing a `name` overwrite each other in ds-form. The native form value is still `checked ? value : null`.
- Checkbox: the `indicator` binding says 'On web/Lit the Icon is inside the control element', but the control is an `<input>`, which can't have children. I wrapped the input and an absolutely positioned, pointer-events:none `<ds-icon>` in a `.box` span. `data-part=control` stays on the input, and the indicator has no data-part.
- Checkbox: `pressedOverlay` has no `part` and a state (`pressed`) that doesn't map to a CSS pseudo-class. I used `:active` on the control, drawing the selected fill mixed into the rest background at the overlay opacity with color-mix, only while unchecked and not disabled.
- Checkbox: `helperSize`, `errorText` and `partGap` have no part, and the description and error are `<ds-text>`, so the Lit conventions say not to restyle them. I rendered them as `ds-text size=sm tone=muted/danger` and forwarded helperSize, fontFamily and lineHeight through Text's `overrides`, as Input does. `descriptionText` and `errorText` are carried by Text's tone, not a hook.
- Checkbox: copy.checked, copy.unchecked and copy.mixed are only used by SwiftUI. Lit relies on native checked state plus aria-checked=mixed, so these strings go unused here.
- Checkbox: `required` requires copy.requiredIndicator in the label, but the doc doesn't say whether it should be part of the accessible name. I kept it inside the `<label>` text, so the name reads 'Label (required)', matching Input. aria-required is also set.
- Checkbox: `validationMessage` when `invalid` is set on a required, unchecked box. The precedence (error, required, invalid) gives copy.required. I applied the same order to both the rendered error and ElementInternals validity.
- Checkbox: the Behavior prose says a Fieldset's disabled applies via FieldsetContext, but the doc names no Lit mechanism. I only honour formDisabledCallback, from a native fieldset or form.

## 2026-09-17 05:00 — round 1

- Checkbox: the `transition` binding covers 'fill and indicator transitions', but the indicator must not be rendered when unchecked, so it cannot fade in or out; I transition only the control's background and border colour, and the indicator appears instantly.
- Checkbox: validity order vs rendered error disagree for required. Behavior says the error slot shows copy.required only while `invalid` is true, and validity 'follows the same order — the same as Input', but Input reports valueMissing whenever a required field is empty, invalid or not. I copied Input: validity is error > required-and-unchecked (valueMissing) > invalid; the rendered error still waits for `invalid`.
- Checkbox: 'clears the mixed indicator locally until the indeterminate prop changes value again' — on Lit a property set to the value it already has does not count as a change, so a consumer must set it to false and back to true to show the dash again. I used a private @state flag that resets when `indeterminate` changes; the reflected `indeterminate` attribute stays set while the dash is cleared.
- Checkbox: 'the checked attribute is the initial state only', but a Lit Boolean property also takes later attribute changes. I kept a plain `@property({type: Boolean})` setter, so changing the attribute after mount still updates the live state; formResetCallback goes back to the attribute, else defaultChecked.
- Checkbox: the doc doesn't say whether the Lit error message (shown below the row, outside the hit area) should say anything to a click; I added no handler, so clicks on it do nothing.
- Checkbox: the doc's 'Form's message' step in the error order has no Lit channel (ds-form only sets `invalid`), so on Lit the order is error > copy.required/copy.invalid.
- Checkbox: 'every enum value of every enum prop' — the component has no enum props, so the stories are Default, boolean states and the four examples (Consent, SelectAllParent, WithDescription, SelectionColumn).
