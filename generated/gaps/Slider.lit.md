# Gaps reported while generating Slider for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 10:51 — round 1

- Slider: `step` has a schema default of 1, so a Lit property can't distinguish 'step omitted' from 'step explicitly 1' to satisfy 'marks... snap to marks when step is omitted' during pointer drag/click. Implemented: step always governs drag/click snapping; when `marks` is set, PageUp/PageDown jump to the next/previous mark instead of ±10 steps (that part of the spec is unambiguous).
- Slider: `value`/`defaultValue` are typed `number | [number, number]` (shape given but base `type: number`, not `array`/`object`). Implemented as `@property({ attribute: false })` per the array/object convention, so they are JS-only properties, not settable as HTML attributes — flag if attribute-level control is expected.
- Slider: range mode's aria-labelledby uses hidden spans whose text is the full `copy.minimumLabel`/`copy.maximumLabel` template evaluated with `label` (e.g. 'Volume minimum'), rather than concatenating the visible label element with a bare 'minimum' node. This satisfies both 'aria-labelledby on each thumb' and 'use copy.* verbatim', but the doc doesn't show the exact DOM shape, so it's a judgment call.
- Slider: no format is specified for the beside-label/bubble text of a range's *combined* display (each thumb's own aria-valuetext/bubble is per-thumb and unambiguous). Chose `formatValue(lo) – formatValue(hi)` (en dash) for the `showValue: always` row; not in the spec.
- Slider: `ds-form` (Form.ts) collects fields via a hardcoded `FIELD_SELECTOR`/`FIELD_TAGS` list (`ds-input, ds-checkbox, ds-switch, ds-radio-group`) that does not include `ds-slider`, and `DsFormField.currentValue` is typed `string | boolean | null` vs. Slider's `number | [number, number]`. Slider is form-associated via `ElementInternals` directly (native `<form>` sees it, `FormData` gets two entries under `name` for a range), but `<ds-form>` won't auto-collect/validate it without a separate change to Form.ts, which is out of this generation's scope.
- Slider: schema has no `required` prop (unlike Input/RadioGroup), so it doesn't fully implement `DsFormField` (missing `required`). Kept the schema's prop set exactly; didn't invent a `required` prop.
- Slider: the bubble's corner radius (`radius.sm`) has no declared style binding in the schema (only `bubbleSurface`/`bubbleText` are defined) — used a fixed, non-overridable `--radius-sm` purely for shape, matching Tooltip's popup shape.
- Slider: pointer-drag value math (`positionToValue`) is LTR-only (`clientX - rect.left`), matching the pattern of other components in this package that don't special-case `:dir(rtl)` for pointer math (only Switch handles RTL, purely via a CSS transform on a discrete thumb, not continuous drag).
- Slider: the package-wide testability rule requires a `Keyboard` story with 'at least three focusable children' — Slider's `range` mode tops out at two thumbs (its whole APG model), so the `Keyboard` story renders the range+marks configuration with two thumbs; a third focusable child isn't structurally possible for this component.

## 2026-09-10 18:40 — round 1

- Slider: platforms.web.attributes doesn't list aria-required, but copy.required implies a required state must be identified — added aria-required on each thumb to match the pattern used by other required form fields (Input, RadioGroup) in this package.
- Slider: 'must have a value other than the default to submit' doesn't define what 'the default' is when defaultValue is unset — chose the same fallback the value prop itself documents (min, or [min, max]) so required and value share one notion of default.
- Slider: platforms.lit.reflect lists only range/disabled/show-value, so required and snapToMarks are plain (non-reflected) boolean properties, consistent with the explicit list rather than the broader convention some other fields use.

## 2026-09-16 09:16 — round 1

- Slider: form.valueType is number-range and the doc says a Form value is a number or [low, high], but the Lit DsFormField interface types currentValue as string | boolean | null; chose currentValue: number | [number, number] and did not declare `implements DsFormField` (ds-form collects it at runtime by data-ds-field).
- Slider: `marks` says 'Values snap to marks when `step` is omitted' while `step` has `default: 1`, so omission is undetectable from the default; chose a getter/setter that tracks whether step was set, snapping drag/click to marks when it was not (keys still use 1).
- Slider: the marks shape `{ value: number; label?: string }[]` used verbatim conflicts with exactOptionalPropertyTypes (a `label: undefined` entry is rejected); typed it as the exported SliderMark[] with `label?: string | undefined`.
- Slider: `errorText` is overridable, but errorMessage is not in `composition` and the Lit convention says error text is Text, whose colour binding is locked; rendered ds-text tone=danger inside the role=alert errorMessage part and routed the hook by re-scoping --color-foreground-danger on that wrapper (the bubble does the same for bubbleText via --color-foreground). The doc should say how a parent's colour binding reaches a composed Text.
- Slider: `mark`, `markSize`, `markLabelColor`, `markLabelSize`, `valueColor`, `valueSize`, `partGap`, `fontFamily`, `fontSize`, `helperSize`, `errorText`, `minTarget`, `focusRing`, `focusRingWidth`, `disabledOpacity` and `transition` have no `part`; applied them to tickMarks, valueText, the label row, host, description/error text, the thumb hit area, the thumb's focus ring and the track area by judgment.
- Slider: the bubble has no position or padding tokens (offset above the thumb, inline/block padding); chose thumbSize above the track centre and space.1/space.2 padding.
- Slider: no token says how far mark labels sit below the track or how much room they need; used trackPaddingBlock for both and add markLabelSize when any mark has a label.
- Slider: a11y.requires lists label-association, but the thumbs are divs, which cannot take a native <label for>; the Lit convention asks for a native label on fields, yet composition says label is Text. Used a ds-text label with an id and aria-labelledby on the thumb (a range points at hidden minimum/maximum copy spans).
- Slider: the label is Text, but no Text size is named for it (fontSize is font.size.md with labelWeight medium); used size=md weight=medium and forwarded fontFamily/fontSize/labelWeight to it.
- Slider: `required` gives no validity flag, and validation order (required, then invalid) differs from which message the error region shows; valueMissing carries copy.required, but the visible region shows only `error` or copy.invalid, never copy.required, until a Form reports it.
- Slider: 'disabled sliders are readable and focusable but inert' is not stated for a slider disabled by a form or fieldset (formDisabledCallback); treated both the same and submit no value while disabled.
- Slider: whether change-end fires when a key or drag leaves the value unchanged (at a bound) is not stated; it fires once per interaction regardless.
- Slider: the Keyboard story's Tab rule targets a range, but the doc gives no range args for it; used the price-range example's args (range, defaultValue [20, 80]).
