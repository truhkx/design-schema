# Gaps reported while generating Switch for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:45 — round 1

- Switch: the pre-existing Switch.ts had no overrides mechanism (no --ds-switch-* hooks, no SwitchOverridableBinding/overrides property) despite the spec's Overrides section requiring one; added it following the Checkbox.ts pattern, mapping trackWidth/trackHeight/thumbSize/thumbInset/radius/gap/partGap/labelSize/labelWeight/helperSize/fontFamily/lineHeight/disabledOpacity/transition to hooks and leaving trackOff/trackOn/thumb/labelColor/descriptionText/focusRing/focusRingWidth/minTarget as raw locked tokens.
- Switch: the pre-existing file also lacked the data-ds="Switch" testability attribute; added it in connectedCallback per package convention, no spec ambiguity.

## 2026-09-10 01:45 — round 2

- Switch: no new spec gap — the literals gate flagged `fontFamily: '--ds-switch-font-family'` in the HOOKS map as a font-stack literal (a regex false positive on the key name, not the value); fixed by using a backtick string like Checkbox.ts does for the same binding.

## 2026-09-16 04:51 — round 1

- Switch: the Controlled state contract says a controlled element shows the new state only once the property changes, but the lit platform note and the controlled-follows-prop scenario say that on Lit `checked` is the live state and only the attribute is initial. Chose the native-input model, as ds-checkbox does: the `checked` property follows user toggles and falls back to `defaultChecked`.
- Switch: the Lit guidance says to reflect `checked` (initial), but platforms.lit.notes says `checked` is not reflected. Followed the notes and did not reflect it.
- Switch: the web notes draw the thumb as a pseudo-element on the input, but anatomy lists `thumb` as a part with overridable thumbSize/thumbInset, and a pseudo-element part has no hook. Rendered the thumb as a real `<span data-part="thumb">` laid over the track.
- Switch: the DsFormField interface requires `required` and optional `error`/`validationMessage`, but the doc says a Switch never validates. Exposed `readonly required = false`, an empty `validationMessage`, and `checkValidity()`/`reportValidity()` that always return true, with no `error` property.
- Switch: `form.discovery: context` isn't defined for Lit, where Form finds fields by `data-ds-field`. Set `data-ds-field` on the host.
- Switch: `radius` has no part. Applied it to both the track and the thumb.
- Switch: `gap`, `partGap`, `helperSize`, `fontFamily` and `lineHeight` have no part. `helperSize` is forwarded to the description Text's `fontSize` override along with fontFamily/lineHeight; `descriptionText` (locked, color.foreground.muted) relies on ds-text `tone="muted"` rather than a hook.
- Switch: the doc doesn't say how the track lines up with a label that wraps or has a description under it. Put the track at the top of the row and centered on the label's first line with a calc from labelSize × lineHeight, as Checkbox does.
- Switch: the Guidance says 'Inside a Fieldset the field reads FieldsetContext' but Lit has no context mechanism named. Only native `formDisabledCallback` (form/fieldset disabled) is honored.
- Switch: a native form uses the host's `name` attribute, but `name` isn't in platforms.lit.reflect, so a name set only as a property isn't submitted by a native `<form>`. Left it unreflected, matching ds-checkbox.

## 2026-09-17 05:05 — round 1

- Switch: the `checked` attribute is described as 'the initial state only', but Lit's Boolean property converter applies later attribute changes to the live property too (a native input does this only until the user changes it). Chose Lit's default: every attribute change sets the property, and form reset reads the attribute.
- Switch: `disabled` is aria-disabled only (the switch stays focusable), so nothing stops a native <form> from submitting it; the spec says only that 'the Form's disabled-field rule applies'. Chose native semantics: setFormValue(null) while disabled or form-disabled.
- Switch: the spec says the thumb is the input's ::before 'with no hook', but thumbSize, thumbInset and transition are overridable bindings on part `thumb`. Chose to keep the :host hooks (--ds-switch-thumb-size, --ds-switch-thumb-inset, --ds-switch-transition) and read them in the input's ::before rules; 'no hook' is taken to mean no part/data-part.
- Switch: ::before on an appearance:none <input> draws in Chromium and WebKit but not in Firefox, so the thumb would be invisible there. The spec requires the pseudo-element anyway; no fallback element was added.
- Switch: helperSize 'has no --ds-switch-* hook', so a consumer can change the description size only through the `overrides` property, not from CSS, unlike every other overridable binding. Followed the spec.
- Switch: the behaviour `controlled-updates-on-set` (given checked: false; set checked: true) still runs on Lit, where there is no controlled mode; tested as a plain property write updating the live state.
- Switch: DsFormField lists `required`; the Lit note says it is always false. Implemented as a readonly plain field (not a decorated accessor), so setting it has no effect and nothing reports that.
