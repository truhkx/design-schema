# Gaps reported while generating Meter for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:02 — round 1

- Meter (lit): the schema's overrides contract (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition) and the package's data-ds testability hook were present in every other lit component but missing from the pre-existing Meter.ts; added the --ds-meter-* CSS hooks, the `overrides` property/applyOverrides wiring, and `data-ds="Meter"` in connectedCallback to match convention, and exported the new MeterOverridableBinding type from index.ts.
- Meter (lit): the internal gap between the label and the value text within the label row has no named binding in the schema (only partGap, described as the label-row-to-track gap, is listed) — left it as a fixed var(--space-2), not overridable.

## 2026-09-10 17:47 — round 1

- Meter: `labelGap` (space.2, horizontal gap between label and value text) was in the overridable-bindings list but missing from the existing implementation — the `.row` gap was hardcoded to `var(--space-2)` instead of a `--ds-meter-label-gap` hook; added the hook and wired it into `overrides`/HOOKS/default styles.
