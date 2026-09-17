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

## 2026-09-16 04:11 — round 1

- Input: platforms.rn says it forwards onHoverIn, onHoverOut and onLongPress to the native element, but in RN 0.87 TextInput has none of them. I mapped onHoverIn/onHoverOut to onPointerEnter/onPointerLeave and built onLongPress from onPressIn plus a 500 ms timer (Pressable's default delayLongPress, marked literal-ok, since no token exists). The doc should say how a TextInput-based field exposes long press and hover.
- Input: Tooltip also sets onPressOut on its child, but the Input rn notes don't list it. I forwarded it too.
- Input: description and a parent's accessibilityHint (Tooltip) both go to accessibilityHint, and the spec doesn't say how to combine them. I read the description first, then the forwarded hint, joined with a space.
- Input: a parent's accessibilityLabel replaces the label as the accessible name, and the Fieldset legend still goes in front. The spec doesn't say which comes first; I followed Button.
- Input: 'disabled stays focusable' applies to web and Lit only. On native, editable={false} makes an iOS TextInput unfocusable, and the doc doesn't say whether native should use editable={false} or stay focusable and block edits. I kept editable={false} with accessibilityState.disabled.
- Input: the size binding says sm uses font.size.sm, but it doesn't say whether that covers only the field text or the label too. I sized the label with `size` as well; description and error stay at helperSize.
- Input: minTargetSm is locked and there's no locked minTarget swap per size in the overrides list, so the sm height floor is always size.target.min.
- Input: hideLabel has no visually-hidden pattern in RN. I don't render the label Text and rely on accessibilityLabel.
- Input: the anatomy parts label and description are Text, which accepts no testID. I wrapped each in a View with testID=Input.<part>. Either Text should take a testID or the doc should name this wrapper.
- Input: the required-is-shown-in-the-label and error-is-announced scenarios check aria-required and role=alert on web only. RN has no required a11y state, so on native required is conveyed by the ' (required)' label text alone.
- Input: example stories need exactly their given args, but the old meta args (placeholder, description) would have leaked into them. I trimmed the meta args to label and name, and the test merges meta.args with Default.args.

## 2026-09-17 04:27 — round 1

- Input: platforms.rn.notes says the label, description and errorMessage parts are 'the composed Text with testID="Input.<part>" passed to it, not a wrapper View', but Text's schema has no testID prop (and no accessibilityLiveRegion for the error announcement). Chose to keep the wrapper Views carrying testID (and the live region on the error wrapper) rather than restyle or extend Text; Text's schema needs testID (and a live-region prop) before the note can be met.
- Input: the `transition` binding is overridable, but the rn note in its description says 'native swaps instantly'. Chose to accept `transition` in InputOverridableBinding and ignore it on native; the doc should say the override is a no-op on React Native, or remove it from the native override type.
- Input: onFocus/onBlur carry no payload per the events contract, but platforms.rn.notes says they are forwarded so Tooltip can attach, and Tooltip's chain() passes the event through. Chose `() => void` (the extra argument is harmless at runtime); the doc should confirm that forwarded handlers get no event on native.
- Input: the error-slot rule ('a message only while invalid is true: copy.required for an empty required field, else copy.invalid') doesn't say where the RN Form's per-field message (FormContext errors[name]) comes in the order. Chose error prop, then the Form's message, then the invalid-derived copy.
- Input: constant longPressDelay has no token expression, so 'logic reads each constant through its token expression' can't apply; kept a named module constant (500, marked literal-ok) matching Pressable's delayLongPress.
- Input: behavior scenario disabled-stays-focusable-and-is-announced keeps only `state: disabled` for rn, but the rn note says the field is not focusable on native (editable={false}). The test asserts accessibilityState.disabled and that RNTL treats the field as disabled; the scenario name contradicts native behavior and should be narrowed or renamed for rn.
