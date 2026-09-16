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
