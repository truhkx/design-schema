# Gaps reported while generating Switch for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:43 — round 1

- Switch already had a Switch.tsx/css/stories/test set that predated the overrides/data-ds/data-part conventions (visible in Checkbox); I brought it up to that convention — added `SwitchOverridableBinding`, `overrides` prop, per-instance CSS hooks for every listed binding (locked bindings get hooks too, just excluded from the TS union), `data-ds="Switch"` on the root, and `data-part="description"` on the description Text — without touching the existing behavior logic, which already matched the schema's behavior scenarios and passed all 16 existing tests unchanged.
- The schema doesn't say whether the description's helper text size/color should be enforced by a local CSS rule or left to Text's own `size="sm" tone="muted"` props; followed Checkbox's precedent of setting both (Text props for the semantic class and a local rule reading the `--ds-switch-helper-size`/`--ds-switch-description-text` hooks) so the override hooks actually take effect.
