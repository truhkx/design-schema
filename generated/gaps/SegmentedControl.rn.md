# Gaps reported while generating SegmentedControl for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:31 — round 1

- SegmentedControl: a11y.requires lists arrow-navigation/roving-tabindex, but RN's Pressable has no generic key-event API — chose the same acknowledged limit already documented on RadioGroup/Tabs: every segment is its own accessibility stop, Home/End/arrows are a web-only model, and touch/Enter selects immediately.
- SegmentedControl: guidance says iconOnly toolbars should pair with Tooltips, but the schema's `composition` only names Icon and platforms.rn notes only say iconOnly sets accessibilityLabel — so no Tooltip wrapping was added on RN; the label is exposed only via accessibilityLabel, not visually.
- SegmentedControl: minTarget's description says 'Each segment; 44px on touch via the group height' but no separate token produces that 44px — implemented segment minWidth/minHeight as size.target.min and let stacked segmentPaddingBlock + groupPadding approximate the comfortable height rather than inventing a size token.
- SegmentedControl: no style binding covers spacing between adjacent segments (segmentGap is only icon-to-label within one segment), so segments render directly abutting with the pill sliding underneath — chose this over guessing an unlisted gap token.
