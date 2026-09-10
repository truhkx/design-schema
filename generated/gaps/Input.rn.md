# Gaps reported while generating Input for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:18 — round 1

- Input: the schema's Overrides contract (borderFocus, borderInvalid, borderWidth, radius, paddingInline, paddingBlock, partGap, fontFamily, fontSize, labelWeight, helperSize, lineHeight, disabledOpacity) was missing from the existing implementation — added it, resolving values locally for the field's own View/TextInput styles and forwarding the same raw TokenRef for fontFamily/fontSize/labelWeight/lineHeight/helperSize through to the composed Text label/description/error via Text's own `overrides` prop rather than resolving twice.
- Input: the spec doesn't say whether `disabledOpacity` dims only the field or the whole label/description/field/error group; the prose rule '`disabled` uses `opacity.disabled` on the whole element' (and Button's precedent of dimming the entire control) led me to apply it to the outer container rather than just the TextInput.
- Input: `fontSize`/`fontFamily`/`lineHeight` are single bindings with no separate label-vs-field size in the schema; I applied them uniformly to the label and field (both default font.size.md) and let `helperSize` cover description/error (font.size.sm), since that's the only split the schema names.
- Input: added the `testID="Input"` root hook per the package's testability convention; the existing file predated that convention and lacked it.

## 2026-09-10 17:29 — round 1

- Input: the existing file predated size (sm/md) and hideLabel; added InputSize type, per-size padding/target/fontSize token swapping (paddingBlockSm=space.1, paddingInlineSm=space.2, minTargetSm=size.target.min, fontSize=font.size.{size}), and hideLabel (omits the visible Text label but keeps it as the TextInput's accessibilityLabel, since RN has no DOM-based visually-hidden technique separate from accessibilityLabel).
- Input: guidance says the field should read FieldsetContext for disabled and legend-prefixing ('Shipping address, Street'), but no other RN component in the package (Checkbox, Switch, RadioGroup) reads it yet — Fieldset only applies a disabled clone fallback. I wired Input to read useFieldsetContext() directly since the spec calls it out explicitly for Input, but this makes Input inconsistent with sibling form components until they're updated too.
- Input: 'keyboard' testability-hook story requirement doesn't apply — this schema has no `keyboard` block.
- Input: `autocomplete` is web/lit-only per the schema's `platforms` restriction on that prop, so it's intentionally omitted from the RN props.
