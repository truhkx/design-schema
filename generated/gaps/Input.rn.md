# Gaps reported while generating Input for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:18 — round 1

- Input: the schema's Overrides contract (borderFocus, borderInvalid, borderWidth, radius, paddingInline, paddingBlock, partGap, fontFamily, fontSize, labelWeight, helperSize, lineHeight, disabledOpacity) was missing from the existing implementation — added it, resolving values locally for the field's own View/TextInput styles and forwarding the same raw TokenRef for fontFamily/fontSize/labelWeight/lineHeight/helperSize through to the composed Text label/description/error via Text's own `overrides` prop rather than resolving twice.
- Input: the spec doesn't say whether `disabledOpacity` dims only the field or the whole label/description/field/error group; the prose rule '`disabled` uses `opacity.disabled` on the whole element' (and Button's precedent of dimming the entire control) led me to apply it to the outer container rather than just the TextInput.
- Input: `fontSize`/`fontFamily`/`lineHeight` are single bindings with no separate label-vs-field size in the schema; I applied them uniformly to the label and field (both default font.size.md) and let `helperSize` cover description/error (font.size.sm), since that's the only split the schema names.
- Input: added the `testID="Input"` root hook per the package's testability convention; the existing file predated that convention and lacked it.
