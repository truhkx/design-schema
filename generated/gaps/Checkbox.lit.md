# Gaps reported while generating Checkbox for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:43 — round 1

- Checkbox: Checkbox.ts and Checkbox.stories.ts already existed, fully implementing props/events/forms/behavior/a11y, but predated the overrides-hook convention — added the CheckboxOverridableBinding type, --ds-checkbox-* CSS hooks on :host, the `overrides` property, applyOverrides(), and the data-ds="Checkbox" testability attribute, mirroring Button.ts's pattern (many other components in the package — Switch, Alert, RadioGroup, Disclosure, Meter, Breadcrumb, Landmark, FocusScope — are still missing this and weren't in scope to fix here).
- Checkbox: the indicator's check-mark/dash inset math ('controlSize minus 2 × space.1') isn't tied to any named overridable binding — partGap is documented specifically as the vertical gap between label/description/error, a different anatomy target, even though it shares space.1 as a default. Left the inset as a non-overridable literal var(--space-1) rather than repurposing partGap's hook for an unrelated part.
