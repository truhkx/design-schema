Clear the small committed-code items the triage found still open, per logs/backlog-triage.md, section B.3 and section D runners-up 11 to 13. These are hand fixes to generated code, so each one is also folded back into the conventions so the next regeneration keeps it.

Verified still open on 2026-09-23 (re-check each before editing; skip and report any already fixed):

- **C28.** `packages/lit/src/AccordionTmpSlotted.test.ts` is committed scratch — `innerHTML` setup, three fixed `setTimeout` sleeps — and its coverage already lives in `packages/lit/src/Accordion.test.ts` (`describe('ds-accordion with slotted disclosures')`).
- **C17.** Under `validate: submit`, fields must read the Form context's `submitFailed` so their error clears once corrected. Checkbox, Input, NumberInput, RadioGroup, Slider and Select do; **Switch, Listbox, DatePicker and SegmentedControl** (packages/react/src) do not. Check lit and rn for the same four.
- **C10.** rn Icon puts `importantForAccessibility="no"` on its `<svg>` (an invalid DOM attribute on react-native-web) and produces no `aria-hidden`, so decorative glyphs are not hidden on web.
- **C11.** rn Tabs' panel View carries `accessibilityLabel` with no role — a role-less `<div aria-label>`; Patterns/SettingsPage fails axe `aria-prohibited-attr`.
- **C37 / C34.** Web Checkbox and Lit Select set `data-ds-field` unconditionally, so Table's selection checkboxes and controls internal to another component register as form fields; table.md says they are not.

1. **Delete** AccordionTmpSlotted.test.ts after confirming Accordion.test.ts covers the slotted case.
2. **submitFailed** in the four React components, following Input's pattern exactly; the same in lit/rn where missing.
3. **rn Icon**: decorative → `aria-hidden` (plus the native `accessibilityElementsHidden` / `importantForAccessibility` on the wrapping View, never on the svg).
4. **rn Tabs panel**: `role="tabpanel"` / `accessibilityRole` equivalent with `aria-labelledby` to its tab, or drop the label — whichever tabs.md specifies.
5. **Field registration opt-out**: a field registers only when it has a `name` and is not `embedded` (or whatever the doc calls "not a field"); Table passes the opt-out. Match the prop name to the docs; if no doc defines one, stop and report — that is a schema decision.
6. **Fold back.** For each of 2–5 add or sharpen the rule in the platform's prompts/conventions/ file (submitFailed under Forms; decorative glyph spelling under Accessibility; tab panel role; when a field registers). List each rule added.

Gate — all must pass:

    pnpm typecheck
    pnpm gates
    pnpm gates:behavior

axe on the Tabs rn stories and the SettingsPage pattern shows no `aria-prohibited-attr`; a Form story with `validate: submit` clears Switch's error after it is toggled.

Do not modify `prompts/templates/`, `tools/`, or any component doc. Do not touch Carousel's host `data-part` (C40) — it is an accepted precedent now that job 711 exists; leave it.
