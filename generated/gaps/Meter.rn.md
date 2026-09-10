# Gaps reported while generating Meter for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:00 — round 1

- Meter: existing Meter.tsx was missing the overrides prop (and MeterOverridableBinding type) required by the schema's overrides contract, plus the testID="Meter" testability hook — added both, mapping trackHeight/radius/labelSize/labelWeight/valueSize/fontFamily/lineHeight/partGap/transition to overrides and keeping track/fill/labelColor/valueColor locked, and exported MeterOverridableBinding from index.ts.
