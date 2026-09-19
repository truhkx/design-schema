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

## 2026-09-18 20:58 — round 1

- Input: the generic rule says `disabled` sets accessibilityState.disabled 'in addition to `disabled`', but TextInput has no `disabled` prop and the rn notes prescribe `editable={false}`; chose editable={false} + accessibilityState.disabled, so the field is not focusable on native as the notes say.
- Input: the rn behavior test 'disabled-stays-focusable-and-is-announced' asserts only accessibilityState.disabled (plus RNTL's toBeDisabled, which reads editable={false}); the scenario name still says 'stays focusable', which is false on native. The rn narrowing is only in the description.
- Input: the doc says the Form's context entry (errors[name]) is treated 'exactly as a Form-set invalid' yet also that the error slot shows 'the Form's context entry' second in order; chose to display the entry's string as the message (between `error` and the invalid-derived copy) rather than recomputing copy.invalid/copy.required from it.
- Input: `validate()` ignores the Form's own errors[name] mark (otherwise a Form-set mark would never clear itself); the doc's precedence list (error → required → invalid) doesn't say whether the Form's mark counts as `invalid` inside validation.
- Input: the Form context's `disabled` (form?.disabled) is also honoured alongside FieldsetContext's; the doc names only Fieldset as a source of group-disabled on native.
- Input: returnKeyType/submitBehavior/onSubmitEditing (Enter moves to the next Form field or submits on the last) are not in the schema's rn props or keyboard block; kept from the existing Form contract. The doc should say whether Enter-to-advance is Input's or Form's responsibility.
- Input: autoCapitalize='none' and autoCorrect={false} for email/password/url are not in the schema (SwiftUI's props list .textInputAutocapitalization/.autocorrectionDisabled but rn's does not); kept as the obvious type mapping.
- Input: TEXT_CONTENT_TYPE for number/search/text is 'none' and search keeps keyboardType 'default' ('web-search' exists on iOS); the doc's keyboardType mapping lists only email/number/tel/url.
- Input: labelWeight is realised through Text weight='medium' with the override forwarded as Text's fontWeight, and the label Text follows `size`; the schema gives labelWeight part: label but doesn't say that on native the label is a composed Text (it says so only for description/error).
- Input: the iOS announcement and the Android live region are suppressed when the Form has an error summary (form.errorSummary), to avoid a double announcement; the Input doc doesn't mention this interaction.

## 2026-09-18 21:04 — round 2

- Input: the rn rules say disabled is conveyed by `accessibilityState.disabled`, but react-native-web 0.21 ignores accessibilityState, so on the Storybook/axe surface the dimmed label and value read as enabled text and fail color-contrast (Disabled story, light). Chose to mirror the state as `aria-disabled` on the TextInput and on the root group View (the disabledOpacity group); axe treats text under an aria-disabled ancestor as disabled. The doc's rn notes should say the aria-* mirror is required on react-native-web and that it sits on the group, not just the field.
- Input: `aria-disabled` on the root group is a generic element carrying a deprecated-on-generic ARIA 1.2 attribute; axe allows it as global. The doc names the group as the disabledOpacity target but doesn't say whether the group itself carries the disabled state.
- Input: the axe gate prints only violation counts, so the two failing nodes (assumed: label text and field value) could not be confirmed; running the browser script needed approval that wasn't available in this session.
- NumberInput (not this job): its Disabled story fails the same color-contrast check for the same reason and needs the same aria-disabled mirror.

## 2026-09-18 21:09 — round 3

- Input: no Input story remains in the axe-rn failure list after round 2's aria-disabled mirror; the gate still fails on other components (Toolbar, Tree, TreeGrid, DataGrid, NumberInput/Search/DatePicker Disabled, Fieldset Disabled and Disabled Group, Demo/Preferences, Patterns/SettingsPage), which are outside this job.
- Fieldset (affects Input's composition story): Fieldset Disabled and Disabled Group each still have 1 color-contrast node in light mode, most likely the legend: Fieldset dims the legend/description with opacity.disabled but, like Input before round 2, conveys disabled only through accessibilityState, which react-native-web 0.21 ignores. The docs should require the aria-disabled mirror on the dimmed group for every component that dims with opacity.disabled (Input, NumberInput, Search, DatePicker, Fieldset).
- Input: the rn notes and generic rules name `accessibilityState.disabled` as the way to convey disabled, but on react-native-web only the aria-* form reaches the DOM; the doc doesn't say this, so every dimmed disabled story fails axe color-contrast until the component mirrors it by hand.
