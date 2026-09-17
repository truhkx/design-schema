# Gaps reported while generating RadioGroup for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:47 — round 1

- RadioGroup: part names use simplified kebab-case (`radio-label`, `radio-description`, `error`) rather than the schema's exact anatomy strings (`radioLabel`, `radioDescription`, `errorMessage`); this pre-existing choice matches the convention already used by Checkbox/Switch in this package, so I kept it for consistency rather than diverging.
- RadioGroup: `radioIndicator` (the centre dot) is a `::after` pseudo-element and cannot carry a `part` attribute; no separate element exists for it, consistent with Checkbox's indicator.

## 2026-09-10 01:48 — round 2

- RadioGroup: the `literals` gate's font-stack regex (`fontFamily\s*:\s*['"]`) false-positives on the HOOKS map entry `fontFamily: '--ds-radio-group-font-family'` — that's a CSS custom-property name, not a hard-coded font stack. Marked it `literal-ok` rather than renaming the binding key (which would break the established override-hook naming convention shared with Checkbox/Switch).

## 2026-09-16 04:58 — round 1

- RadioGroup: platforms.web.notes says shadow parts are the anatomy names in kebab-case (`radio-label`, `radio-description`, `error-message`), but the Lit package convention (and React's data-part, and Lit Checkbox's `errorMessage`) uses the anatomy names verbatim; I used the verbatim camelCase names (`radioLabel`, `radioDescription`, `errorMessage`) for both `part` and `data-part`.
- RadioGroup: copy.position ('{index} of {total}') has no use on web/Lit — native radios sharing a name already announce their position — so it is not rendered; the doc should say which platforms use it (it reads as SwiftUI-only).
- RadioGroup: option ids are `${groupId}-${value}` but the doc never defines groupId for Lit; inside the shadow root I used `name` (falling back to 'radio-group').
- RadioGroup: the spacing between an option's label and its description is not bound to any style; I reused partGap.
- RadioGroup: the Tab keyboard rule says focus enters on the selected radio, or the first when none is selected, but delegatesFocus on host.focus() goes to the first focusable radio in tree order even when a later one is selected; I overrode focus() to target the checked radio, then the first enabled one. The doc should state this for Lit.
- RadioGroup: the group-disabled model ('aria-disabled plus preventDefault guards') does not say whether arrow keys and Space must also be guarded, since native radios move and select on arrows regardless of aria-disabled; I preventDefault those keys on the fieldset while the group is disabled.
- RadioGroup: whether aria-invalid goes only on the fieldset or also on each radio is unstated (web attributes list it on the group; React also puts it on the radios); Lit sets it on the fieldset only.
- RadioGroup: `disabledOpacity` does not say what it dims for a disabled group (whole fieldset or option rows); I dimmed the option rows only, keeping the legend, description and error at full opacity.
- RadioGroup: the indicator is an ::after on an appearance:none <input>, which Chromium renders but some engines have not historically; the doc mandates it with no fallback.
- RadioGroup: the Keyboard story's required 'at least three focusable children' conflicts with the one-tab-stop model (three radios, one tab stop); the Keyboard story renders the Default three-option group.
- RadioGroup: scenario disabled-group-is-inert limits `state: disabled` to web, though Lit reflects `disabled` too; the Lit test asserts the reflected attribute and the fieldset's aria-disabled anyway.

## 2026-09-17 05:10 — round 1

- RadioGroup: the error order is `error`, then the Form's message, then copy.required/copy.invalid, but `form.discovery: context` has no Lit channel. ds-form finds fields by `[data-ds-field]`, keeps its errors to itself (summary and `invalid` event) and never sends a message back to the field. Chose: the group shows `error`, then copy.required/copy.invalid while `invalid`; there is no Form-message step.
- RadioGroup: a required group that ds-form validates fails `checkValidity()`, but nothing sets `invalid` on it. So in Lit the prose 'shows copy.required once it is marked invalid by Form validation' never happens unless the app sets `invalid` or `error`. The doc should say whether ds-form sets `invalid` on failing fields.
- RadioGroup: `optionPaddingBlock` is declared with `part: radio`, but its description says it pads the option row wrapper, which is not an anatomy part. Chose the row, as the description says. The part should be dropped or the row named.
- RadioGroup: the `focusRing` description says the border 'becomes focusRingWidth', so the border gets thicker on focus. With box-sizing border-box the control keeps its size and the space inside shrinks a little. Chose border-box and removed the outline. The doc doesn't say whether the control's outer size may change.
- RadioGroup: `radio` and `legend` are anatomy parts, but the Lit notes list only group, radioLabel, radioDescription and errorMessage for `part`/`data-part`. Chose `part` and `data-part` of `radio` and `legend` on the input and legend as well.
- RadioGroup: the Lit notes don't say whether `defaultValue` is also an attribute. Chose attribute `default-value`, which the stories use.
- RadioGroup: the Keyboard story gate asks for 'at least three focusable children', but a native radio group is one tab stop. Chose the Default args (three radios), reached by arrow keys. The doc should say whether three arrow-reachable radios count.
