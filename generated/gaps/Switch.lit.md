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
