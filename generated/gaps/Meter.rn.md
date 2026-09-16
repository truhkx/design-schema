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
