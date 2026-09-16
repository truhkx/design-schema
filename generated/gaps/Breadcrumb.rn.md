# Gaps reported while generating Breadcrumb for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:59 — round 1

- Breadcrumb (rn): the schema says the nav's fontSize binding is inherited by nested Links ('Set on the nav; the Links inherit it'), but ancestor items wrap Link in `<Text size="sm">`, a fixed enum prop, so a `fontSize` override changes the nav's own text (current page, separators, ellipsis glyph) but not the ancestor Links' inherited size — Link has no way to receive an arbitrary token override for inherited typography. Left as-is since fixing it would mean adding a new prop to Link, which the instructions say grows only via the child's own schema.

## 2026-09-10 17:58 — round 1

- Breadcrumb (rn): focus-after-expand targets the View wrapping the first revealed item via AccessibilityInfo.setAccessibilityFocus, not the Link/Text itself — RN Text-based links have no reliable native focus target, so the container View is used as the closest available proxy; acceptable given the docs' acknowledged limit that Text/Link has no focus events on native, but flagging the choice.
- Breadcrumb (rn): onNavigate's third `event` parameter from the schema's platform-neutral description does not exist on native (schema explicitly says 'on native there is no event, the handler is the navigation'), so the RN signature is (item, index) only — not a discrepancy, just noting the platform divergence is intentional per spec.

## 2026-09-16 05:21 — round 1

- Breadcrumb: anatomy lists separate `nav` and `list` parts, but the rn notes render one wrapping View; both are that single root (testID="Breadcrumb"), and there is no `Breadcrumb.nav`/`Breadcrumb.list` testID.
- Breadcrumb: anatomy `link` part cannot carry `testID="Breadcrumb.link"` because Link accepts no testID prop; the wrapping item View carries `Breadcrumb.item` for both linked and plain ancestors.
- Breadcrumb: `copy.current` ('current page') has no stated use on rn (SwiftUI appends it to the label; rn notes use only accessibilityState.selected, which screen readers announce as 'selected'). Left unused on rn — the doc should say whether the rn current item's accessibilityLabel appends it.
- Breadcrumb: onNavigate is `cancelable: true`, but on native the handler already replaces Link's Linking fallback, so returning false changes nothing observable; typed as `boolean | void` and passed through to Link.onPress.
- Breadcrumb: the web event signature is `(item, index, event)`; on native there is no event, so the handler is `(item, index)` and the test asserts those two arguments.
- Breadcrumb: `gap` is 'on both sides of the separator', but the convention forbids margins; implemented as `columnGap` on the wrapping row, which also puts gap between the ellipsis Button and its separators. The row gap between wrapped lines is unspecified (left 0).
- Breadcrumb: only `fontSize` is forwarded to the Text wrapping each Link; `fontFamily`, `fontWeight` and `lineHeight` overrides reach plain ancestors, the current item and separators but not the Links, which take Text's defaults. The doc should say whether those bindings forward too.
- Breadcrumb: the ellipsis glyph is not named; used Icon `ellipsis` with color `colorActionGhostForeground` (the ghost Button foreground), since there is no currentColor.
- Breadcrumb: `size: sm` for the ellipsis Button is in the web notes but not in the rn notes (rn says only ghost, iconOnly); used sm on rn too.
- Breadcrumb: the focus target after expanding is described as 'the revealed items' container', but there is no such container in a flat row; focus goes to the first revealed item's View (index 1).
- Breadcrumb: `collapse` is boolean, not an enum; stories CollapseTrue/CollapseFalse use the deep trail so the difference is visible, and DeepTrailCollapsed duplicates CollapseTrue by design (the example must be its own story).
- Breadcrumb: behavior `click: link` does not say which link; the test presses the first ancestor and expects `(items[0], 0)`.
- Breadcrumb: the rules require declaring `ref` for a component exposing its root, but the schema lists no ref prop; added `ref?: React.Ref<ViewInstance>` on the root View.
