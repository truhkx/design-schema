# Gaps reported while generating Meter for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:02 — round 1

- Meter (lit): the schema's overrides contract (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition) and the package's data-ds testability hook were present in every other lit component but missing from the pre-existing Meter.ts; added the --ds-meter-* CSS hooks, the `overrides` property/applyOverrides wiring, and `data-ds="Meter"` in connectedCallback to match convention, and exported the new MeterOverridableBinding type from index.ts.
- Meter (lit): the internal gap between the label and the value text within the label row has no named binding in the schema (only partGap, described as the label-row-to-track gap, is listed) — left it as a fixed var(--space-2), not overridable.

## 2026-09-10 17:47 — round 1

- Meter: `labelGap` (space.2, horizontal gap between label and value text) was in the overridable-bindings list but missing from the existing implementation — the `.row` gap was hardcoded to `var(--space-2)` instead of a `--ds-meter-label-gap` hook; added the hook and wired it into `overrides`/HOOKS/default styles.

## 2026-09-16 05:25 — round 1

- Meter: `labelGap` is bound to part `label` but is described as the gap between the label and the value text; neither part can carry a gap without a margin, and the label row is not in the anatomy. Chose: flex `gap` on an unnamed row wrapper around label and valueText.
- Meter: `radius`, `valueSize`, `valueColor`, `partGap`, `fontFamily`, `lineHeight` and `transition` have no `part`. Chose: radius on track (clipping the fill with overflow hidden), valueSize/valueColor on valueText, partGap/fontFamily/lineHeight on container, transition on the fill's inline-size.
- Meter: `value` and `label` are required with no default, but a Lit accessor must hold a value. Chose `value = 0` and `label = ''`, with no development warning when either is missing (the doc asks for none).
- Meter: 'Omit valueText to show and announce the percentage' does not say whether aria-valuetext should carry the percentage (RN notes say text is omitted and the platform reads the number). Chose: aria-valuetext is always set, to valueText or the rounded percentage.
- Meter: the percentage string ('32%') has no copy entry and no locale rule. Chose Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }) on the fill fraction.
- Meter: the doc does not say whether the fill width uses the rounded or the exact percentage. Chose the exact fraction for the width and rounding only for the displayed and announced text.
- Meter: missing or unparseable min/max attributes (Lit's Number converter yields null/NaN) are unspecified. Chose to fall back to the defaults 0 and 100.
- Meter: the web notes say the label is a Text element (span) but give no Text size, weight or tone, and the label bindings (labelSize, labelWeight, labelColor) duplicate Text's own. Chose `<ds-text element="span" size="sm" weight="medium" tone="default">`, with the meter's label hooks forwarded to --ds-text-font-size/-font-weight/-font-family/-line-height; the value text stays a plain span as the notes say.
- Meter: `hideValue` is not in platforms.lit.reflect, but the prose calls it a boolean attribute. Chose: attribute `hide-value`, not reflected.
- Meter: the has-accessible-name / label scenarios depend on aria-labelledby resolving to a `display: contents` ds-text host inside the shadow root; the test passes in Chromium, but the doc does not say whether the labelled element may be a composed Text host.
