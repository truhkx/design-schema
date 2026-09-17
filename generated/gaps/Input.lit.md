# Gaps reported while generating Input for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:14 — round 1

- Input: existing Input.ts had no overrides contract (no data-ds attribute, no --ds-input-* CSS hooks, no `overrides` property). Added the full contract for the 13 overridable bindings, matching Button.ts's pattern, since the spec's 'Overrides' section applies to every component.
- Input: `focusRingWidth` (locked) says it 'replaces borderWidth when focused; padding shrinks by the difference so the field does not shift' — implemented as border-width swap + calc() padding compensation on `.field:focus-visible`, replacing the previous outline-based focus ring, since the outline approach didn't match that description.
- Input: precedence between borderInvalid and borderFocus when a field is both invalid and focused isn't specified. Chose to keep the invalid (danger) border color visible even while focused, so the error state stays communicated during editing; a focus-visible outline/ring is not used here so this is purely a border-color choice.
- Input: the Behavior guidance says disabled fields must be 'focusable (aria-disabled + readOnly on web — never the native disabled attribute)', but the pre-existing implementation used the native `disabled` attribute on the inner `<input>`, which removes it from the tab order. Fixed to use `aria-disabled` + `readonly` + a `.disabled` class for styling, and excluded disabled fields from ElementInternals form submission/validation manually (since native `disabled` no longer does that for us).

## 2026-09-10 17:22 — round 1

- Input: platforms.lit.reflect lists only [type, required, disabled, invalid], omitting `size` — but the `size` prop drives interpolated bindings (fontSize: font.size.{size}) and swaps paddingBlock/paddingInline/minTarget for their Sm variants, which the doc's own convention expresses as `:host([attr=...])` CSS selectors. Reflected `size` anyway (as Search.ts already does for its own `size` prop) so the sm/md variants are actually stylable; flagging the missing reflect-list entry as a doc gap.
- Input: `hideLabel` has no doc default of `true`, so it does not fall under the 'booleans that default to true → negated attribute' rule; implemented as a normal boolean property/attribute `hide-label` (visually-hidden clip pattern on the `<label>`, label stays in the DOM as the accessible name via `for`).

## 2026-09-10 19:53 — round 1

- Input: `size` is not listed under `platforms.lit.reflect` (only type, required, disabled, invalid are), but the size variants are expressed as CSS attribute selectors elsewhere in the package (e.g. Search), so it is reflected anyway — flagging the reflect list as incomplete rather than deviating from established Lit convention.
- Input: schema gives no explicit rule for how a disabled field should behave in ElementInternals form submission; chose to omit disabled fields from setFormValue/validity (matching native <input disabled> semantics) while keeping the field focusable/readonly per the doc's explicit 'never the native disabled attribute' instruction.
- Input: no `keyboard` block and no overlay/composition behavior in this schema, so no Keyboard story was required — noting only because the generator's general instructions mention it for components that have one.

## 2026-09-16 04:08 — round 1

- Input: guidance says the error slot renders copy.required / copy.invalid in precedence order, but not when — showing 'X is required.' on every empty required field would flag it before the user types. Chose: the slot shows `error`, else (only while `invalid` is true) copy.required for an empty required field, else copy.invalid; validationMessage/validity always follow error → required → invalid → native type validity.
- Input: Lit `ds-form` does not set `error`/`invalid` on fields (it only builds its summary from validationMessage), so the in-field copy.required/copy.invalid message never appears under ds-form validation. The contract between Form and field for showing field-level messages is unspecified for Lit.
- Input: conventions say fields are discovered by `data-ds-field`, but Lit Form.ts still discovers by tag (FIELD_TAGS). Added `data-ds-field` to the host anyway.
- Input: the lit notes say `value` behaves like a native input, but a native `value` attribute is the default value. Chose `value` as property-only (`attribute: false`) and `default-value` as the attribute; the doc does not say whether `value` has an attribute.
- Input: the controlled contract (show the new value only once the property changes) conflicts with a native-feeling input. A consumer who rebinds `.value` asynchronously sees the text snap back for a frame, and the caret moves. Implemented the revert with `live()`; the doc should say whether Lit's controlled mode reverts.
- Input: helperSize, fontFamily and lineHeight must reach the description/error `<ds-text>`, which has its own hooks. Forwarded them only through the Text `overrides` property (fontSize/fontFamily/lineHeight). Setting `--ds-input-helper-size` from document CSS does not reach the Text, so the CSS-hook escape hatch is incomplete for that binding. The doc names no child-binding forward for these.
- Input: whether copy.requiredIndicator is part of the accessible name is unspecified; with aria-required it is read as 'required' twice. Kept it as plain label text (not aria-hidden), matching web.
- Input: `platforms.lit.reflect` omits `hideLabel` and the doc gives no attribute name; used `hide-label`, not reflected.
- Input: locked bindings (border, borderFocus, placeholder, minTarget, minTargetSm, focusRingWidth, errorText, descriptionText) get no `--ds-input-*` hook, since 'every style binding becomes a hook' contradicts 'locked bindings excluded'; they read their tokens directly.
- Input: the Overview/Guidance mention FieldsetContext (a group's `disabled` applies to the field); Lit has no such context in the spec, so only the native `formDisabledCallback` (form/fieldset ancestor) is honoured.
- Input: anatomy has no root part, but disabledOpacity applies to 'the whole field group'; added an unnamed wrapper div (the grid carrying partGap), with no part name.

## 2026-09-17 04:25 — round 1

- Input: the `transition` binding became overridable, but its description doesn't say whether an override changes the duration only or the easing too; chose duration only (`--ds-input-transition` defaults to motion.duration.fast, easing stays motion.easing.standard).
- Input: setting `error` implies `invalid`, and clearing `error` 'removes the invalid state', but the doc doesn't say what happens when the Form had set `invalid` separately before `error` was set and cleared; chose to clear `invalid` whenever a non-empty `error` is cleared, relying on the Form to set it again on its next validation.
- Input: the constant `longPressDelay` is native-only and has no meaning on Lit; not used.
- Input: `formResetCallback` isn't specified beyond the Forms convention; chose to restore the uncontrolled value to `defaultValue` and leave `invalid`/`error` untouched (the Form owns `invalid`, the consumer owns `error`).
- Input: the scenario `disabled-stays-focusable-and-is-announced` expects `state: disabled` to be true but doesn't say which observable carries it on Lit; the test checks `aria-disabled="true"` on the inner input, plus that it has no native `disabled` attribute.
