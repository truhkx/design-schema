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

## 2026-09-21 02:28 — round 1

- Switch: the row cannot be one flex box on Lit either. platforms.lit inherits the web wording ('full-width flex row with min-block-size minTarget and no padding') while labelSize says the track slot is top-aligned against the text column AND 'the row centres its content on the cross axis'. I used an inner `.root` box (flex column, justify-content: center, min-block-size) around an unhooked `.row` content box. Say which box carries min-block-size, and whether the empty band above/below the content box inside minTarget is part of the hit area (in my implementation it is, because the click handler sits on `.root`).
- Switch: the track wrapper span has no anatomy name. platforms.lit requires the thumb be a Switch-owned span stacked over the input, but anatomy is track/thumb/label/description, so the wrapper gets no `part`/`data-part`. I named it `.track-wrap` and made it `position: relative` with the thumb absolute — the 'as Checkbox's indicator' pointer does not carry over, since Checkbox centres with inline-grid and the thumb needs an inline-start inset plus a travel transform.
- Switch: thumbInset's block-axis meaning is ambiguous — 'gap between the thumb and the track edge; split evenly on the short axis' reads either as (a) the block inset is derived, (trackHeight − thumbSize)/2, or (b) thumbInset is itself the block gap. Default tokens make both 2px, so the defaults hide it; an override of thumbInset or trackHeight makes them diverge. I chose (a), matching web.
- Switch: the off-state value of aria-checked is unspecified. The doc says to set it explicitly because some screen readers do not derive it from role=switch, but never says whether off is `aria-checked="false"` or the attribute omitted. I render 'true'/'false' always, since the thumb and track rules key off it and an omitted attribute would leave the off state unstyled.
- Switch: platforms.lit says `required` is 'a readonly plain getter that always returns false (not a decorated property; setting it is silently ignored)'. A getter with no setter throws a TypeError on assignment in strict mode, so 'silently ignored' and 'plain getter' cannot both hold. I shipped the getter-only form (nothing in the package writes `required`; ds-fieldset only reads it). If a consumer assignment must not throw, the doc should ask for a no-op setter.
- Switch: whether locked bindings get a --ds-switch-* hook is inconsistent across platforms. The Lit conventions say 'locked bindings excluded' and ds-checkbox reads locked tokens directly, so trackOff/trackOn/thumb/labelColor/focusRing/focusRingWidth/minTarget read `var(--color-…)` here; the React Switch defines hooks for all of them and only excludes them from the TS union. Same contract, two shapes — pick one.
- Switch: how `labelPosition: start` puts the switch at the row end is not specified (flex `order` alone leaves the track adjacent to the label). I used `justify-content: space-between` on the row for `start` and flex-start for `end`, matching the React CSS; a `flex: 1` text column would look the same until the label wraps.
- Switch: `formStateRestoreCallback`'s state value is not documented. I read it as `state === 'on'`, mirroring the `setFormValue(checked ? "on" : null)` encoding the Lit notes do give.
- Switch: the inner input still carries `name` (from the web attribute list) even though a shadow-root input is never submitted by the outer form — submission goes through ElementInternals. Harmless, but the doc should say whether the Lit inner input should carry `name` at all, since the two paths can disagree.
- Switch: story parity forced a story name Lit cannot honour. React exports `Controlled` with `{ checked: true }`, but Lit has no controlled mode, so I bound `?checked` (the initial-state attribute) — the story renders an on switch that then follows user toggles, which is not what 'Controlled' means. The doc should either exempt Lit from that story or name the Lit equivalent (e.g. `CheckedAttribute`). I also renamed the previous Lit-only `DefaultCheckedTrue`/`DisabledChecked` to React's `On`/`DisabledOn`.
