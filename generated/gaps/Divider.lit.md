# Gaps reported while generating Divider for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:31 — round 1

- Divider: schema says label is 'optional text in the middle of a horizontal divider' but doesn't forbid it on a vertical divider or define layout for that case; I render label between two line segments in a flex column for vertical too, same as horizontal, rather than rejecting the combination.
- Divider: the `semantic` prop and `label` both drive the same role/aria-orientation exposure (guidance text says a labelled divider 'becomes semantic'); I implemented `effectiveSemantic = semantic || Boolean(label)` since the schema gives no separate visual/AT toggle for a labelled-but-not-announced divider.
- Divider: labelSize/fontFamily overrides are wired into the composed `<ds-text>` by targeting its own public override hooks (`--ds-text-font-size`, `--ds-text-font-family`) from a `.label` class rule in Divider's shadow styles, rather than passing Text's `overrides` property object, since that avoids fighting Lit's property/attribute timing and stays within Text's documented CSS-variable contract; labelColor is left to Text's own locked `tone="muted"` default since it's excluded from Divider's overridable set.
- Divider: no keyboard model, form-field interface, or events apply to this component (purely presentational/APG separator), so none were implemented — confirming there was nothing ambiguous there, just absent by design.
