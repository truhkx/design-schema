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

## 2026-09-17 05:30 — round 1

- Meter: the Parts section says forwarded bindings reach the child Text's `overrides` property, but the overrides contract also makes every binding a `--ds-meter-*` hook on :host that CSS consumers can override; forwarding only through `overrides` would leave a CSS-level `--ds-meter-label-size` override dead. Chose both: the child's `overrides` receives the meter's `overrides` refs, and the meter's shadow CSS sets the child's documented `--ds-text-*` hooks from the `--ds-meter-*` hooks. The doc should say which path (or both) is canonical.
- Meter: `valueText` percentage formatting names `Intl.NumberFormat(locale, …)` but Meter has no `locale` prop and the doc does not say where Lit gets the locale; used the runtime default (`undefined`).
- Meter: `fontFamily` and `lineHeight` bind to part `header`, but their descriptions say they are forwarded to the Texts and never style anything directly, so the `header` part itself carries no style from them; it is unclear what `part: header` means for these two bindings. Applied them only through the Text forwards.
- Meter: `value` and `label` are `required: true` while the Lit notes give them starting values (0, empty string) with no warning; the Default story args are not specified by the doc, so the existing Default (`label: Storage used`, `value: 32`) was kept for the scenarios that override only one prop.
- Meter: the doc does not say whether `value-text` (not reflected) is the attribute name for `valueText` on Lit; the Lit guidance example uses `value-text`, which was kept.

## 2026-09-21 03:52 — round 1

- Meter: the overrides contract says every style binding becomes a `--ds-meter-*` hook on :host, but the lit platform note only exempts the five forwarded-only bindings — it is silent on the locked `track` and `fill`. I read their tokens directly with no hook (so document CSS cannot recolour them, which is what 'locked, accessibility-bearing' implies), while the React package ships `--ds-meter-track` / `--ds-meter-fill` hooks in Meter.css; the two platforms now differ on whether a locked binding is reachable from CSS.
- Meter: `radius` is declared with `part: track`, but its description says the fill carries the same radius. I gave the fill `border-radius: var(--ds-meter-radius)` — the same hook — so a `radius` override moves both ends; the binding table has no fill radius of its own, so there is no way to round the track without rounding the fill.
- Meter: the guidance says a width change that comes only from layout (first layout, resize) snaps, and an update where both happen at once snaps. On Lit the fill width is a percentage, so a container resize never changes the specified value and no transition fires — the rule holds for free and I wrote no code for it. It is only implementable (and only meaningful) on RN's measured pixels; the doc states it as a cross-platform rule.
- Meter: 'warns once per distinct invalid min/max pair' does not say whether the scope is the element or the module. I used a module-level Set, matching React, so a second `<ds-meter>` with the same bad pair is silent.
- Meter: the doc clamps the accessible value but says nothing about the reflected attributes. `value`, `min` and `max` reflect the raw property, so `<ds-meter value="150">` keeps `value="150"` while the track reports `aria-valuenow="100"`, and a non-finite property reflects as `value="NaN"` while the bar renders at `min`. The parse/clamp fallback lives in the getters, not in a property normaliser.
- Meter: the header is space-between with baseline alignment, but the doc does not say whether the value text may shrink or wrap when the label is long. I gave it neither `flex-shrink: 0` nor `text-align: end` (parity with React's Meter.css), so a long label pushes the value text into wrapping, start-aligned.
- Meter: story parity forced three exports the doc's examples do not name — React exports `Empty`, `Full` and `AboveMaximum` as notable states, which I mirrored. Doing so dropped the Lit-only `EmptyRange` story, so the documented `max <= min` state (empty track, '0%', dev warning) now has no story on any platform.
- Meter: the web note says the composed Texts receive only `data-part` and `id` besides their composition props. The Lit element also sets `part="label"` / `part="valueText"` on the `ds-text` hosts, per the package's anatomy convention, even though `::part` styling is not a sanctioned escape hatch — the doc does not say whether composed children should expose a part name.
