# Gaps reported while generating Meter for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:02 — round 1

- Meter: the platform notes said the label row uses a `Text element="span"` but the value text is a plain `<span>` in `valueColor`. I used the Text component for both (element="span", tone="muted" for value) since valueColor/labelColor are locked tokens that already match Text's default/`muted` tones, and Text's own `overrides` prop is the sanctioned way to expose `labelSize`/`labelWeight`/`valueSize`/`fontFamily`/`lineHeight` per-instance without restyling a child (following the Alert precedent of delegating a binding — `iconSize` — into a composed child's own override contract) rather than duplicating Text's typography CSS on Meter's own hooks.
- Meter: pre-existing Meter.tsx/css/stories in the tree predated the `overrides`/`OverridableBinding`/`data-ds`+`data-part` conventions (visible in Switch, Alert, Card). Regenerated all three plus the index.ts export to add `MeterOverridableBinding` (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition), `data-ds="Meter"`/`data-part` hooks on container/label/valueText/track/fill, since the task said to add these hooks to any file touched.
