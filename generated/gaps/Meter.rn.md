# Gaps reported while generating Meter for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:00 — round 1

- Meter: existing Meter.tsx was missing the overrides prop (and MeterOverridableBinding type) required by the schema's overrides contract, plus the testID="Meter" testability hook — added both, mapping trackHeight/radius/labelSize/labelWeight/valueSize/fontFamily/lineHeight/partGap/transition to overrides and keeping track/fill/labelColor/valueColor locked, and exported MeterOverridableBinding from index.ts.

## 2026-09-16 05:26 — round 1

- Meter: the spec has no weight binding for the value text (valueColor and valueSize exist, no valueWeight); I kept font.weight.regular, not overridable.
- Meter: valueColor and valueSize have no `part`, though the anatomy lists `valueText`; I applied them to the valueText Text element.
- Meter: the valueText prop description says an omitted valueText announces the rounded percentage, but the rn notes say accessibilityValue.text is omitted so the platform reads the number; I followed the rn notes (visible text shows the percentage, accessibilityValue has no text), so the spoken form is platform-defined.
- Meter: the spec says the fill 'snaps on first layout and on resize' but does not say what happens before the first layout, when the width is 0; I snap there too, because an animation from 0 to 0 caused act() warnings in the tests.
- Meter: the value-text-is-shown-and-announced scenario only checks the visible text on rn; the 'announced' half (accessibilityValue.text) has no rn assertion in the scenario, so the test doesn't check it.
- Meter: the has-accessible-name scenario gives no way to check it on rn; I checked accessibilityLabel on testID Meter and getByLabelText(label).
- Meter: the Default story args are not given by the spec; I kept the existing ones (Storage used, 32, valueText '3.2 GB of 10 GB'), so the Default story already passes the valueText scenario before its given is applied.
- Meter: the rules list says a component that exposes its root takes a ref, but the spec doesn't say whether Meter does; I added ref?: React.Ref<ViewInstance> on the root.
- rn package digest: toLineHeight's argument order is shown as (lineHeight, fontSize), but theme.tsx declares toLineHeight(fontSize, multiplier); I followed the code.

## 2026-09-17 05:31 — round 1

- Meter: composition lists `element: span` for both Text parts, but the React Native Text has no `element` prop; I dropped it.
- Meter: `testID="Meter.label"` and `testID="Meter.valueText"` can't be set because the RN Text component takes no `testID` prop and Meter must not reach into it. Only header, track and fill carry part testIDs.
- Meter: valueText says to format with `Intl.NumberFormat(locale, …)`, but Meter has no `locale` prop and the doc names no locale source. I passed `undefined` (the device locale), so the announced percentage may differ between platforms, which contradicts 'the same on every platform'.
- Meter: the `radius` binding is on part `track`, but its description says it 'rounds the track and the fill ends'. On web only the track clips. On RN I put `borderRadius` on both the track and the fill so the fill's leading end is rounded too. Say whether the fill should carry the radius.
- Meter: the header row's layout isn't in any binding (value 'at the end of the label row'). I used `justifyContent: 'space-between'` and `alignItems: 'baseline'`. A long label can't shrink, because Meter can't style the child Text (no flexShrink), so label and value may overflow a narrow row. The doc doesn't say whether to wrap or truncate.
- Meter: the 'max <= min' behavior says to show and announce '0%', but it doesn't say whether that percent string also goes through Intl (locale-formatted, e.g. '0 %' in fr). I used the same Intl formatter.
- Meter: the transition's direction isn't stated. The doc says the fill snaps before the width is known and on resize, and animates only when `value` changes. I also snap when `min`/`max` change the width at the same time as a resize, but a `min`/`max` change without a resize animates like a value change.
- Meter: behavior scenario value-text-is-shown-and-announced can't assert 'announced' on RN (accessibilityValue is excluded from the scenarios), so the test only checks the visible text.

## 2026-09-21 03:54 — round 1

- Meter: the dev warning is written in the doc as ``Meter: `max` (<max>) must be greater than `min` (<min>).`` — unclear whether the backticks are markdown code formatting or part of the emitted string. Chose to emit them literally, matching how Accordion's RN warning quotes prop names.
- Meter: the doc says a non-finite `min`/`max` is treated as 0/100, but not whether accessibilityValue reports the raw props or the normalised bounds. Chose normalised, so min/max/now are always mutually consistent (a NaN max would otherwise be announced).
- Meter: the doc does not scope 'once per distinct invalid min/max pair' — per component instance or per process. Chose per instance (a ref keyed on the pair), so two meters with the same bad range each warn once.
- Meter: platforms.rn.props lists role/accessibilityLabel/accessibilityValue but says nothing about focusability. ProgressBar, the sibling non-interactive bar, sets `focusable={false}`; Meter's doc says only 'no focus'. Left `focusable` unset rather than inventing a prop the schema does not list — worth settling across both bars.
- Meter: 'a width change that comes only from layout snaps, and an update where both happen at once snaps' is implementable, but a fraction change that arrives in the same commit as a resize is indistinguishable from a pure resize, so it snaps. That matches the sentence as written; flagging that it means a value change during a rotation/resize never animates.
- Meter: the doc does not say whether the header row is dropped entirely when `hideValue` is true. Kept the header (the label is always visible per the label prop's description); only the value Text and its wrapper are omitted.
- Meter: `flexShrink` is specified only for the label wrapper. Left the valueText wrapper unshrinkable, so a long valueText pushes the label to wrap — unspecified which of the two should give way.
- Meter: anatomy names `container`, but the RN testability convention puts `testID="Meter"` on the root rather than `Meter.container`, so the `container` part has no part-scoped hook. Consistent with the other RN components, but the anatomy list and the testID convention disagree on paper.

## 2026-09-21 03:56 — round 2

- Meter: platforms.rn.props names `accessibilityValue`, but react-native-web 0.21 does not forward the object form — only the flattened `aria-value*` props reach the DOM. Since role=meter requires aria-valuenow, the root must carry both forms. The RN platform note should say so, and the same drop silently affects ProgressBar's value on web (it only escapes axe because role=progressbar has no required value attribute).
- Meter: the dev warning is written in the doc as ``Meter: `max` (<max>) must be greater than `min` (<min>).`` — unclear whether the backticks are markdown formatting or part of the emitted string. Chose to emit them literally, matching how Accordion's RN warning quotes prop names.
- Meter: the doc says a non-finite `min`/`max` is treated as 0/100 but not whether accessibilityValue (and now aria-valuemin/max) report the raw props or the normalised bounds. Chose normalised, so min/max/now are always mutually consistent rather than announcing a NaN bound.
- Meter: the doc does not scope 'once per distinct invalid min/max pair' — per component instance or per process. Chose per instance (a ref keyed on the pair), so two meters with the same bad range each warn once.
- Meter: platforms.rn.props says nothing about focusability. ProgressBar, the sibling non-interactive bar, sets `focusable={false}`; Meter's doc says only 'no focus'. Left `focusable` unset rather than inventing a prop the schema does not list — worth settling across both bars.
- Meter: 'a width change that comes only from layout snaps, and an update where both happen at once snaps' is implementable, but a fraction change arriving in the same commit as a resize is indistinguishable from a pure resize, so it snaps. That matches the sentence as written; flagging that it means a value change during a rotation or resize never animates.
- Meter: the doc does not say whether the header row is dropped entirely when `hideValue` is true. Kept the header (the label is always visible); only the value Text and its wrapper are omitted.
- Meter: `flexShrink` is specified only for the label wrapper. Left the valueText wrapper unshrinkable, so a long valueText makes the label wrap — unspecified which of the two should give way.
- Meter: anatomy names `container`, but the RN testability convention puts `testID="Meter"` on the root rather than `Meter.container`, so the `container` part has no part-scoped hook. Consistent with the other RN components, but the anatomy list and the testID convention disagree on paper.
