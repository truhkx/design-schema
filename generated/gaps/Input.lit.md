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
