# Gaps reported while generating SegmentedControl for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:33 — round 1

- SegmentedControl: accessibility narrative says selection is shown by 'the stronger and heavier text' but only one fontWeight token (font.weight.medium) is defined in styles, with no separate selected/unselected weight pair (unlike segmentColor/segmentSelectedColor which do have a locked pair). I applied the documented fontWeight only to the selected segment and left unselected segments at font-weight-regular (not a listed binding, just the ambient base look) to satisfy the 'heavier text' cue described in Accessibility — flag if a distinct unselectedWeight binding was actually intended.
- SegmentedControl: the a11y section says icon-only segments must 'expose it visually through a Tooltip', and the Web platform notes wrap each icon-only segment in a Tooltip — but `composition` only lists `segmentIcon: Icon` and the Lit platform notes say nothing about Tooltip. I implemented iconOnly with `aria-label` for the accessible name only, with no Tooltip composition, matching what `composition`/lit notes actually declare; add `segmentTooltip: Tooltip` to composition if a Tooltip is required on this platform too.
- SegmentedControl: the keyboard table gives Home/End the actions 'First segment.'/'Last segment.' with expect `focus-first`/`focus-last`, distinct from the arrow rows which explicitly say 'Moves to and selects'. Since the component is documented as always having a selection and every other key changes selection immediately (radio semantics), I made Home/End select the jumped-to segment as well — but the schema's wording for Home/End doesn't explicitly say 'and selects' the way the arrow rows do, so a focus-only Home/End (leaving the current radio selected) is also a defensible reading.
- SegmentedControl: `options[].icon` is typed `IconName`, but the shared Icon glyph set (packages/lit/src/Icon.ts) has no 'list'/'grid' icons matching the doc's own View-mode example. Stories/demo use a 'Day/Week/Month' text example for Default and existing chevron/dash icons as stand-ins for the IconOnly story rather than domain-accurate glyphs.

## 2026-09-10 18:24 — round 1

- SegmentedControl: minTarget's description says 'on touch platforms the group height is size.target.comfortable so every segment reaches 44px', but CSS has no reliable 'is this a touch platform' query (only pointer:coarse, which also fires on hybrid laptops), and no other Lit component in this package gates size.target.comfortable behind a media query — they all use it unconditionally. Kept segments at the locked size.target.min (24px) unconditionally rather than guessing at a pointer-coarse media query; flagging since the touch-comfortable bump described in the schema isn't implemented.

## 2026-09-16 08:06 — round 1

- SegmentedControl: `form: { role: field, discovery: context }` contradicts platforms.lit.notes ('Not form-associated by design') and the web notes ('not a form field and has no name/value to submit'); there is also no `name` prop to submit under. Chose not form-associated and no `data-ds-field`; the form block should be removed or a `name` prop added.
- SegmentedControl: the declared Keyboard section lists only the arrow rules, while the schema's keyboard block also has Home, End and the wrap-from-last rule. Implemented all of the schema's rules.
- SegmentedControl: `segmentSelectedBackground` and `segmentShadow` name part `segment`, but the doc describes them as the sliding pill, which is the `indicator` anatomy part. Applied them (and `segmentRadius`) to `indicator`; the bindings should name part `indicator`.
- SegmentedControl: `paddingBlockSm` says 'md uses paddingBlock', but there is no `paddingBlock` binding. Chose `segmentPaddingBlock` for md; the same token (space.1) makes the sizes differ only by font size.
- SegmentedControl: `segmentSpacing` (between adjacent segments) names part `segment`, but spacing between siblings is never a margin here. Applied it as `gap` on `group`; the binding should name part `group`.
- SegmentedControl: `selectedWeight`, `paddingBlockSm`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `transition`, `disabledOpacity` and `minTarget` declare no `part`. Applied them to `segment` (transition to `indicator`).
- SegmentedControl: `tooltip` is an anatomy part composed as Tooltip, but the doc gives no Tooltip props besides `describes: false` (in web prose only). Chose `content` = option label, `no-describes`, and default placement and delay; the size sm toolbar case might want `delay: none`.
- SegmentedControl: with `iconOnly`, the doc doesn't say whether the segment's name comes from `aria-label` or from the Tooltip's aria-labelledby. Set both: `aria-label` for tests, with Tooltip `no-describes`.
- SegmentedControl: `defaultValue` naming a disabled or missing option is unspecified. The value is taken as given (no segment checked if missing), and the tab stop falls back to the first enabled segment.
- SegmentedControl: in controlled mode, the keyboard rules don't say where focus goes when the parent doesn't accept the change. Focus moves to the next segment while the checked state stays until `value` changes.
- SegmentedControl: `label` is required with no default. The Lit property defaults to '' and warns in development when empty.
- SegmentedControl: the `disabled-segment-is-not-selectable` scenario's description says arrow movement skips disabled segments, but its `when` is only a click, so skipping is implemented and not covered by a scenario.

## 2026-09-17 11:36 — round 1

- SegmentedControl: the resolved Keyboard section lists only the arrow rules, but the schema's keyboard block and the guidance also define Home/End (and ArrowRight wrap from last); kept Home/End as the schema says.
- SegmentedControl: under a controlled `value`, the guidance says arrows move focus and fire onChange while the checked state stays put, but not what the next arrow moves from (the focused segment or the still-checked one), nor whether moving back onto the checked value fires onChange; chose: move from the focused segment, and fire only when the target differs from the current value.
- SegmentedControl: iconOnly with an option lacking `icon` — the doc says that segment shows its label as text, but not whether it still gets the Tooltip and `aria-label`; chose no Tooltip and no aria-label (the visible text is the name).
- SegmentedControl: 'inside a Toolbar' is defined as a role="toolbar" ancestor found via composedPath/host ancestors, but composedPath exists only during an event and does not show where the element sits in the page; implemented as a parentElement/shadow-host walk at keydown time.
- SegmentedControl: the doc does not say which element's writing direction decides RTL for the arrows; used the host's computed `direction`.
- SegmentedControl: no behavior scenario covers RTL arrows, Home/End, the toolbar no-wrap rule, or controlled-mode arrows, so those paths are untested; the Keyboard story has no RTL or in-toolbar variant for the keyboard gate.
- SegmentedControl: `defaultValue` has no reflect entry and no attribute name is given; kept `default-value`.
