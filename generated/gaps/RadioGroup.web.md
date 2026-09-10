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
