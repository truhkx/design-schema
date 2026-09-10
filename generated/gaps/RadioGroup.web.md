# Gaps reported while generating RadioGroup for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:46 — round 1

- RadioGroup.tsx/.css pre-existed but predated the overrides/data-ds/data-part conventions now required across the package; brought it in line: added RadioGroupOverridableBinding (the 16 non-locked bindings from styles), an overrides prop wired through cssVar()/OVERRIDE_HOOK the same way Checkbox/Switch do, data-ds="RadioGroup" on the fieldset root, and data-part on description, radio, radioLabel, radioDescription, and errorMessage (group/legend/radioIndicator left without data-part since they're reachable via role or are pseudo-elements, matching the Checkbox/Switch precedent).
- CSS previously read design tokens directly instead of through --ds-radio-group-<binding> hooks; rewrote it so every schema binding (locked and overridable) is a custom-property hook on .ds-radio-group, mirroring Checkbox.css/Switch.css, so overrides actually take effect.
- helperSize/descriptionText/errorText were only applied via the shared Text component's size/tone props, not as CSS hooks on the wrapper classes; added explicit font-size/color rules on .ds-radio-group__description, __option-description, and __error keyed to the hooks (same pattern as Checkbox) so the overridable helperSize binding has an effect and locked descriptionText/errorText are hooks rather than baked-in token references.
