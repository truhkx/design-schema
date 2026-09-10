# Gaps reported while generating Link for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:15 — round 1

- Link (rn): the existing implementation predated the current overrides/testID conventions — added testID="Link" and an overrides prop, since the spec says overrides/testID apply regardless of whether platforms.rn.props lists them.
- Link (rn): of the four overridable bindings (underlineThickness, underlineOffset, externalIconGap, transition), only `transition` has any effect on native — RN Text can't set decoration thickness/offset, and nested Text ignores margins so the external-icon gap is a hardcoded single space, not a token. Narrowed LinkOverridableBinding to 'transition' only rather than including no-op bindings.
- Link (rn): implemented the `transition` binding as a real color crossfade (Animated.Value interpolating colorLink -> colorLinkHover on press, eased with motion.easing.standard, skipped under reduced motion), matching Button's pattern, since the previous version swapped colors instantly and the schema explicitly names a transition binding for hover/press color.
- Link (rn): replaced the ad-hoc Unicode '↗' glyph with the package's own <Icon name="external" inline> component, since Icon's own docs/stories name 'the external mark on a Link' as its intended use and the package rule says never to re-implement a shape a shared component already provides. Trade-off: Icon's inline mode always renders at font.size.md (an already-documented Icon limitation) rather than truly inheriting the surrounding Text's font size the way the old raw-glyph-in-Text did, so the icon can look mis-sized when a Link sits inside a Text of a non-md size.
- Link (rn): Icon has no animated-color support, so unlike the label's crossfade, the external icon's color still swaps instantly between colorLink/colorLinkHover on press.
- Link (rn): for tone="inherit" combined with external=true, the icon color falls back to Icon's own default (color.foreground) since there is no currentColor to inherit on native — the spec doesn't address this combination explicitly.
