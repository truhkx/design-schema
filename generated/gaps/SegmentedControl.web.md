# Gaps reported while generating SegmentedControl for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:31 — round 1

- SegmentedControl: no list/grid glyphs exist in IconName, so the IconOnly story stands in with 'dash'/'ellipsis' for the doc's canonical list/grid example — real usage will need those icons added to the shared set.
- SegmentedControl: docs say size is 'toolbar (sm) or standard (md) height', but the styles block only interpolates fontSize by {size} (no per-size padding/height token). I kept strictly to the schema — height differs only via font-size against the shared locked minTarget floor — rather than inventing a padding token; if a visibly taller md is wanted, the schema needs a sized padding binding.
- SegmentedControl: iconOnly wraps each segment in Tooltip per the web platform notes, but Tooltip's internal cloneElement overwrites any ref passed to its child, so a segment's DOM node can't be tracked via a callback ref while wrapped. Worked around by giving each segment button a generated id and looking it up with document.getElementById for roving focus and pill-indicator measurement (works whether or not iconOnly wraps it in a Tooltip) — flagging since it's a deviation from the ref-based pattern used by Tabs/RadioGroup.
- SegmentedControl: the schema has no orientation prop (unlike Tabs), so I built it horizontal-only, matching the RN platform note's 'row' description and the keyboard table's single left/right + up/down pairing (both pairs do the same thing, since there's only one axis).

## 2026-09-16 08:04 — round 1

- SegmentedControl: `form: { role: field, value: value, valueType: string, discovery: context }` contradicts platforms.web.notes ("not a form field and has no name/value to submit") and the Lit note ("Not form-associated by design"); the schema also has no `name` prop, which FormContext registration requires. Chose: no FormContext registration and no `data-ds-field`; the doc should either drop the form block or add a `name` prop.
- SegmentedControl: the Keyboard section of the prompt lists only the arrow rules, while the schema's keyboard block also has the ArrowRight wrap rule plus Home and End. Chose: implement the schema's full table (Home/End move to and select the first/last enabled segment).
- SegmentedControl: the options `shape` (`icon?: IconName; disabled?: boolean`) has no `| undefined`, so under exactOptionalPropertyTypes callers can't pass `icon: undefined`, which goes against the package's optional-prop convention. Chose: use the shape verbatim, as the rules say.
- SegmentedControl: the behavior scenarios' `when: click: segment` doesn't say which segment. Chose: the first `[data-part="segment"]`, which makes click-selects report `list` and hits the disabled segment in disabled-segment-is-not-selectable.
- SegmentedControl: the arrow scenarios don't say where focus starts. Chose: focus the selected segment (the tab stop) before pressing ArrowRight.
- SegmentedControl: the doc doesn't cover a `value`/`defaultValue` that matches no option or a disabled option. Chose: the tab stop falls back to the first enabled segment and no pill is drawn when nothing matches; arrows then start from that position.
- SegmentedControl: `segmentSpacing` (space.0) has part `segment`, but spacing between siblings has to be a gap on the group. Chose: apply it as `gap` on the group root.
- SegmentedControl: `segmentSelectedBackground` and `segmentShadow` name part `segment`, but the web notes draw them on a separate absolutely positioned pill, and `indicator` is an anatomy part with no bindings of its own. Chose: put them on `data-part="indicator"`, which also uses `segmentRadius` and `transition`.
- SegmentedControl: `paddingBlockSm` says 'md uses paddingBlock', but there is no `paddingBlock` binding. Chose: md uses `segmentPaddingBlock`.
- SegmentedControl: `selectedWeight`, `paddingBlockSm`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `minTarget`, `focusRing`, `focusRingWidth`, `transition` and `disabledOpacity` have no `part`. Chose: set the hooks on the group root; the font, target, focus and disabled rules apply to segments and `transition` to the indicator.
- SegmentedControl: for `iconOnly`, the doc says to wrap in Tooltip with `describes: false` (Tooltip supplies aria-labelledby) and also that 'labels become accessible names'; it doesn't say whether the button carries its own label. Chose: add `aria-label={option.label}` as a fallback while keeping Tooltip's labelledby.
- SegmentedControl: the doc doesn't say what the pill does when a disabled segment is selected (e.g. `defaultValue` names a disabled option). Chose: the pill still sits under it and it shows aria-checked=true, but arrow navigation skips it.
