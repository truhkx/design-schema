# Gaps reported while generating Checkbox for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:41 — round 1

- Checkbox: the file already existed from an earlier generation pass without the overrides contract (--ds-checkbox-* hooks, `overrides` prop) or data-ds/data-part testability hooks that Input.tsx and Card.tsx now use; I retrofitted Checkbox.tsx/.css to match that established pattern rather than leaving it stale.
- Checkbox: the `indicator` binding's description ('controlSize minus 2 × space.1') references space.1 as a fixed layout detail of that binding, not the `partGap` override binding (which is semantically the vertical gap between label/description/error) — kept the indicator inset as the literal `var(--space-1)` token so overriding `partGap` doesn't resize the checkmark.
- Checkbox: anatomy lists `indicator` as a part, but per the web platform notes it's drawn as a CSS ::before pseudo-element on the control, not a real DOM node, so it has no element to carry `data-part="indicator"`; only `description` and `errorMessage` got the attribute (control and label are already reachable by role/label).
