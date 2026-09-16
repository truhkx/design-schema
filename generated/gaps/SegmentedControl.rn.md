# Gaps reported while generating SegmentedControl for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:31 — round 1

- SegmentedControl: a11y.requires lists arrow-navigation/roving-tabindex, but RN's Pressable has no generic key-event API — chose the same acknowledged limit already documented on RadioGroup/Tabs: every segment is its own accessibility stop, Home/End/arrows are a web-only model, and touch/Enter selects immediately.
- SegmentedControl: guidance says iconOnly toolbars should pair with Tooltips, but the schema's `composition` only names Icon and platforms.rn notes only say iconOnly sets accessibilityLabel — so no Tooltip wrapping was added on RN; the label is exposed only via accessibilityLabel, not visually.
- SegmentedControl: minTarget's description says 'Each segment; 44px on touch via the group height' but no separate token produces that 44px — implemented segment minWidth/minHeight as size.target.min and let stacked segmentPaddingBlock + groupPadding approximate the comfortable height rather than inventing a size token.
- SegmentedControl: no style binding covers spacing between adjacent segments (segmentGap is only icon-to-label within one segment), so segments render directly abutting with the pill sliding underneath — chose this over guessing an unlisted gap token.

## 2026-09-10 18:35 — round 1

- The file already existed from a prior generation pass but had drifted from the schema; brought it into line rather than a full rewrite: added the three missing overridable bindings (segmentSpacing, selectedWeight, paddingBlockSm) that were declared in the schema's Overridable list but absent from the type union and implementation.
- minTarget used t.sizeTargetMin, but the schema note says touch platforms (RN is always touch) bump the group height to size.target.comfortable so segments reach 44px — changed to t.sizeTargetComfortable, matching the sibling RadioGroup/Tabs implementations.
- selectedWeight (font.weight.semibold) was not applied anywhere — the selected segment's label now uses it instead of the shared fontWeight, per the schema description 'The selected segment's label; unselected use fontWeight.'
- paddingBlockSm vs segmentPaddingBlock: both default to the same token (space.1) so there was no visible bug, but they are separate override hooks per the schema (sm-size padding overridable independently of md-size padding) — segmentPaddingBlock is now picked by size instead of applied uniformly.
- segmentSpacing (space.0, locked: false) had no code path at all; added `gap: segmentSpacing` on the group row so an override can space out segments — default remains 0 so the pill-under-abutting-segments look is unchanged.
- iconOnly segments are not wrapped in Tooltip on RN per the doc's own platform note ('on native the label is the accessibility label') even though `tooltip` appears in the schema's composition/anatomy — kept accessibilityLabel-only, no Tooltip import, consistent with that note.

## 2026-09-16 08:09 — round 1

- SegmentedControl: `form` declares role field, discovery context, value `value`, but the schema has no `name` prop (FormContext.register needs one) and the web/Lit notes say it is not a form field and not form-associated by design; chose not to register with FormContext and invented no `name` prop.
- SegmentedControl: `anatomy`/`composition` list `tooltip: Tooltip`, and the rules say tooltips on RN become accessibilityHint on long-press, but the Guidance says native uses the label as the accessibility label only; chose no Tooltip and no hint on RN (iconOnly label → accessibilityLabel).
- SegmentedControl: `paddingBlockSm` says 'md uses paddingBlock', but no `paddingBlock` binding exists; took it to mean `segmentPaddingBlock`. Both default to space.1, so `size` changes only the font size (font.size.{size}) on RN, where both sizes reach size.target.comfortable per `minTarget`. 'Toolbar (sm) height' is therefore not visibly shorter on native.
- SegmentedControl: `segmentShadow`, `segmentRadius` and `segmentSelectedBackground` are bound to part `segment`, but the description and platform notes put them on the pill (`indicator` in the anatomy); applied them to the indicator Animated.View, not to the Pressable.
- SegmentedControl: the anatomy names `indicator` and the notes call it 'the pill', with no statement on whether it's hidden from assistive technology; hid it (accessibilityElementsHidden / importantForAccessibility=no), the same way Tabs handles its indicator.
- SegmentedControl: the keyboard section lists ArrowRight/ArrowDown as 'next' with no RTL rule; on RN web, ArrowLeft is 'next' under I18nManager.isRTL (ArrowDown/ArrowUp unchanged), matching Tabs.
- SegmentedControl: the keyboard rules are a web model and RN iOS/Android deliver no key events to View/Pressable; implemented them on react-native-web only (onKeyDown on the group, roving `focusable`), with every segment its own stop on native. The arrow-moves-and-selects and arrow-wraps-from-the-last-segment scenarios are web/lit-only and have no RN test.
- SegmentedControl: `defaultValue` naming a disabled option, or a controlled `value` matching no option, is not addressed; the given value is kept as-is (no pill is drawn for an unknown value, and a disabled default stays selected).
- SegmentedControl: `iconOnly` requires every option to have an icon but doesn't say what happens when one is missing; RN warns under __DEV__ and renders that segment empty.
- SegmentedControl: the options count ('Two to five') has no stated enforcement; no warning added.
- SegmentedControl: the `segmentGap` part is `segment`, but that is the icon-to-label gap; with `iconOnly` there's only one child, so it has no effect.
