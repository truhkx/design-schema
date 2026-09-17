# Gaps reported while generating RadioGroup for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:46 — round 1

- RadioGroup.tsx/.css pre-existed but predated the overrides/data-ds/data-part conventions now required across the package; brought it in line: added RadioGroupOverridableBinding (the 16 non-locked bindings from styles), an overrides prop wired through cssVar()/OVERRIDE_HOOK the same way Checkbox/Switch do, data-ds="RadioGroup" on the fieldset root, and data-part on description, radio, radioLabel, radioDescription, and errorMessage (group/legend/radioIndicator left without data-part since they're reachable via role or are pseudo-elements, matching the Checkbox/Switch precedent).
- CSS previously read design tokens directly instead of through --ds-radio-group-<binding> hooks; rewrote it so every schema binding (locked and overridable) is a custom-property hook on .ds-radio-group, mirroring Checkbox.css/Switch.css, so overrides actually take effect.
- helperSize/descriptionText/errorText were only applied via the shared Text component's size/tone props, not as CSS hooks on the wrapper classes; added explicit font-size/color rules on .ds-radio-group__description, __option-description, and __error keyed to the hooks (same pattern as Checkbox) so the overridable helperSize binding has an effect and locked descriptionText/errorText are hooks rather than baked-in token references.

## 2026-09-10 17:42 — round 1

- RadioGroup: the implementation, styles, stories, and index.ts export already existed from a prior generation round and were verified to fully match this spec (overrides, data-ds/data-part hooks, per-hook CSS custom properties, disabled semantics, validation precedence) — no changes were needed there.
- RadioGroup: no test file existed for the 4 behavior scenarios in this prompt, unlike sibling components (Switch, Card, Box, Container) that already have one; added RadioGroup.test.tsx following that same convention (setup() from the Default story's args, one it() per scenario) and confirmed all 4 pass.
- RadioGroup: the fieldset root has no explicit role attribute, so it exposes the browser's native implicit role of 'group' rather than the schema's declared a11y.role: radiogroup (a <fieldset> has no native 'radiogroup' mapping) — left as-is to match the platform notes' instruction to rely on native <fieldset>/<legend> semantics and not add ARIA the schema doesn't call for explicitly, but this is a real mismatch between the declared role and what assistive tech will report; the error-is-identified test asserts the group via getByRole('group')/aria-invalid rather than getByRole('radiogroup').

## 2026-09-16 04:55 — round 1

- RadioGroup: the Guidance says the field reads `FieldsetContext` (group disabled applies to the field), but the React package has no FieldsetContext export; I read only FormContext and left Fieldset's disabled to whatever the native <fieldset> does.
- RadioGroup: `invalid-renders-the-invalid-copy` expects copy.invalid rendered with only `invalid` set, while `required` alone must not render copy.required until a failed submit; the doc does not say whether rendering is display precedence or validate() precedence. I display error prop → Form error → (invalid ? copy.invalid) and keep required → invalid inside validate().
- RadioGroup: `copy.position` ('{index} of {total}') has no web use (native radios sharing a name announce position); kept as an unused COPY constant. The doc should mark it native-only.
- RadioGroup: `radioIndicator` is described as a ::after pseudo-element in the platform notes, but nothing forbids ::before; I kept ::before, and the doc could say either is fine.
- RadioGroup: `descriptionText`/`errorText` are locked bindings with hooks, but the helper texts are composed Text (tone muted/danger), so the hooks are declared but not read by any rule; `helperSize` is forwarded to Text `fontSize`. The doc should state that these bindings forward to Text like Checkbox's.
- RadioGroup: the anatomy lists `group` (the root) but no platform note says whether the root carries data-part="group"; I added it.
- RadioGroup: the options `shape` is `description?: string; disabled?: boolean` verbatim, which under exactOptionalPropertyTypes rejects explicit `undefined` and differs from the convention `name?: T | undefined`; I used the shape verbatim for both the prop and RadioGroupOption.
- RadioGroup: `validate: change` — the convention says 'blur means on-change for toggles', but the Guidance says web RadioGroup validates on group blur; I validate on group focus-out for blur mode and on change only for change mode.
- RadioGroup: the Keyboard story rule asks for 'at least three focusable children', but native radios sharing a name are one tab stop; the story has three radios and relies on arrow movement.
- RadioGroup: the example stories must use 'exactly its given as args', but CSF3 merges meta.args (orientation/required/invalid/disabled defaults) into them; I left the default-valued meta args in place.

## 2026-09-17 05:08 — round 1

- RadioGroup: the conventions say every binding is a CSS hook on the root, but helperSize 'reaches the composed Text only through its fontSize override' and descriptionText/errorText 'declare no hook'. I dropped the root hooks --ds-radio-group-helper-size, -description-text and -error-text, so consumer CSS can't set helper text size; the overrides prop is the only way.
- RadioGroup: the conventions say ':focus-visible outline' but focusRing says the radio's border becomes focusRingWidth in the focus color and the row isn't outlined. I followed the binding (border-width and border-color) and added a transparent outline so forced-colors mode still shows a ring. The docs should say which rule wins for drawn controls.
- RadioGroup: the web notes say a disabled group uses 'preventDefault guards' but only list click/change. Native radios select on arrow keys regardless of aria-disabled, so I also preventDefault ArrowUp/Down/Left/Right and Space on the fieldset, the rule Lit's notes already state. The web note should list the keys.
- RadioGroup: the spec says validate() 'checks required then invalid, as Input does', while the displayed error puts the error prop first. I kept the error prop first in validate() too (error → required → invalid), matching the display order.
- RadioGroup: optionPaddingBlock names 'the row wrapper holding radio, radioLabel and radioDescription (not an anatomy part)' but gives part: radio. I put padding-block and min-block-size (minTarget) on that wrapper, not the radio. The binding's part field should say which is meant.
- RadioGroup: the indicator dot's diameter is 'controlSize minus 2 × space.1', but space.1 is neither a binding nor overridable. I read var(--space-1) directly, and radius.full directly for the dot's roundness. If controlRadius is overridden, the dot stays round.
- RadioGroup: when the focus ring is thicker than controlBorderWidth, the border-box shrinks the space inside while the dot keeps its size. It still fits at the default tokens (20 − 2×focus ≥ 12), but a small controlSize override could clip the dot. The spec doesn't say whether the dot should shrink.
