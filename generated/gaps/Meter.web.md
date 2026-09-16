# Gaps reported while generating Meter for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:02 — round 1

- Meter: the platform notes said the label row uses a `Text element="span"` but the value text is a plain `<span>` in `valueColor`. I used the Text component for both (element="span", tone="muted" for value) since valueColor/labelColor are locked tokens that already match Text's default/`muted` tones, and Text's own `overrides` prop is the sanctioned way to expose `labelSize`/`labelWeight`/`valueSize`/`fontFamily`/`lineHeight` per-instance without restyling a child (following the Alert precedent of delegating a binding — `iconSize` — into a composed child's own override contract) rather than duplicating Text's typography CSS on Meter's own hooks.
- Meter: pre-existing Meter.tsx/css/stories in the tree predated the `overrides`/`OverridableBinding`/`data-ds`+`data-part` conventions (visible in Switch, Alert, Card). Regenerated all three plus the index.ts export to add `MeterOverridableBinding` (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition), `data-ds="Meter"`/`data-part` hooks on container/label/valueText/track/fill, since the task said to add these hooks to any file touched.

## 2026-09-10 17:52 — round 1

- Meter: index.ts already exported Meter/MeterProps/MeterTone/MeterOverridableBinding and Meter.tsx/Meter.css/Meter.stories.tsx already existed from a prior generation pass, matching the spec closely — treated this as a completion/fix pass rather than a from-scratch generation.
- Meter: the schema's `labelGap` binding (space.2, horizontal gap between label and value in the header row) was implemented in CSS as a bare `gap: var(--space-2)` with no override hook and was missing from `MeterOverridableBinding` — added `--ds-meter-label-gap` and included `labelGap` in the overridable union so it matches the other overridable bindings.
- Meter: no `src/Meter.test.tsx` existed for the 6 behavior scenarios (only the auto-generated `generated/behavior/Meter.web.test.tsx` did) — added one following the Alert/Button/Carousel `has-accessible-name` pattern (`screen.getByRole('meter', { name })`), matching this package's now-broad test-rollout convention (21+ components already have adopted `<Name>.test.tsx` files, well beyond what the stale memory note tracked).

## 2026-09-16 05:22 — round 1

- Meter: the `labelGap` binding says `part: label`, but it is the gap between the label and the value text, which belongs to the label row. The anatomy has no row part, so I set the hook on the root and applied it as `gap` on an unnamed header div (no data-part).
- Meter: `valueColor`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `radius` and `transition` have no `part`. I styled the valueText part with value*, both Text elements with fontFamily/lineHeight, the root gap with partGap, and the track and fill ends with radius.
- Meter: the web notes give the label as `Text element="span"` and the value as a plain `<span>` in valueColor, but composition rules forbid restyling a child and the literal/token rules favour Text. I rendered the value as `Text tone="muted" size="sm"`, which gives color.foreground.muted, and forwarded labelSize/labelWeight/valueSize/fontFamily/lineHeight into each Text's `overrides` (fontSize/fontWeight/fontFamily/lineHeight). Text's size/weight enums fix the defaults at `sm`/`medium`, which match the binding tokens only by name.
- Meter: the doc doesn't say what `aria-valuetext` should be when `valueText` is omitted. 'Omit to show and announce the percentage' means I always set aria-valuetext to the rounded percentage. RN omits text in that case, so the platforms differ.
- Meter: when `max <= min` the doc says 'renders an empty track, exposes valuenow = min with the given bounds' but doesn't say what the value text shows. I show and announce '0%'.
- Meter: nothing names a root element for the meter role. I put role=meter and the aria-value* attributes on the track (per the web notes) and data-ds on the wrapper, so `data-ds` and `role` are on different elements.
- Meter: the scenario `has-accessible-name` doesn't say how the name is checked. I query `getByRole('meter', { name: label })`, which proves aria-labelledby resolves.
- Meter: the doc's web notes say to transition `width`. I used logical `inline-size` for both the inline fill size and the transition property, which is equivalent in horizontal writing modes.
- Meter: the package digest says `...rest` never forwards `style`/`className`, but most existing components (ProgressBar, Button, Text) still merge them. I left both out of MeterProps and strip them at runtime, so Meter is stricter than its neighbours until they are regenerated.
