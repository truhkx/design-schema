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

## 2026-09-17 05:28 — round 1

- Breadcrumb: the rn notes say 'the Text wrapping each Link carries Breadcrumb.link', but the system Text takes no testID (it always renders testID="Text"). I put testID `Breadcrumb.link` on a plain View around that Text. Either Text needs a testID prop, or the doc should name the wrapper View as the `link` part.
- Breadcrumb: the RN platform notes say the ellipsis Icon goes through Button's icon prop 'so Button colours it (no explicit color)', but Button's own doc says 'there is no cascade, so callers color glyphs with the variant's foreground themselves', and Button provides no colour context. Without a colour, Icon would fall back to its default. I kept `color={t.colorActionGhostForeground}` on the ellipsis Icon. Either Button needs to colour its icon slots, or the Breadcrumb doc should drop the 'no explicit color' line.
- Breadcrumb: the current page's accessibilityLabel is written as '<label>, <copy.current>', where `label` is also the name of the nav's own prop. I read it as the current item's label (`${item.label}, current page`). The doc should say `item.label`.
- Breadcrumb: the RN guidance says focus after expanding goes to 'the first revealed item's View (index 1)'. If that item has no href it is plain Text, and setAccessibilityFocus on its View is the only option. Web instead gives the `<li>` tabindex=-1. On native, hardware-keyboard focus can't land there, only screen-reader focus. That limit isn't stated for native.
- Breadcrumb: the behavior scenario `click-on-an-ancestor-reports-navigation` says `click: link`, but on RN the `link` part hook (`Breadcrumb.link`) is a wrapper. fireEvent.press on it bubbles up to ancestors, not down to the Link's onPress, so the test has to find the Link by role='link'. A locator that presses the part's testID would fail on native.
- Breadcrumb: `onNavigate` is declared `cancelable: true`, but on native returning false has nothing to cancel (the doc says so itself). I typed it `boolean | void` and pass it straight to Link's `onPress`. The Events contract ('skip the default action when the handler returns false') has no effect here, and the schema has no per-platform cancelable flag to express that.
- Breadcrumb: the `items` shape `{ label: string; href?: string }[]` is given verbatim, but under exactOptionalPropertyTypes the package convention is `href?: string | undefined`. I exported `BreadcrumbItem` with `| undefined` so callers can pass an href that may be undefined.
- Breadcrumb: the `gap` binding's part is `list`, but on RN it is also used inside each item between separator and content. The overrides contract doesn't say whether a `gap` override should apply in both places. I applied it in both, as the description says 'applied twice'.

## 2026-09-21 03:46 — round 1

- Breadcrumb: a11y.requires lists `focus-visible` and `keyboard-operable`, but the rn guidance itself says no focus ring is drawn on native and that hardware-keyboard focus cannot reach a Text-based Link — so two required items are satisfied only on react-native-web (browser outline on the real anchor). The doc should mark them web-only or state the native exemption in `requires` rather than only in prose.
- Breadcrumb: `minTarget` (target-24px) is a minHeight on the item View, which is not pressable; the actual touch target is the Link's Text at roughly lineHeight. Link exposes no hitSlop or target binding and may not be restyled by a parent, so the 24px floor is met visually but not as a press target on native. The doc should say whether Link grows a target binding or whether the item View should become the press target.
- Breadcrumb: the current page, plain ancestors and separators are raw React Native `Text`, not the system `Text`, because the system Text takes no testID/accessibilityState/accessibilityLabel and locks `color`. That sits against the 'compose, never re-implement Text' rule; the rn note ('a Text with no testID on native') only implies the resolution. The doc should say outright that these three use the platform Text and why.
- Breadcrumb: whether the ellipsis item carries a leading separator is not stated. I read 'the ellipsis sits in its own item like any other' as yes, so a collapsed trail reads `Docs / … / Breadcrumb / Keyboard`.
- Breadcrumb: focus-after-expand cannot be asserted on rn — verified that `findNodeHandle` returns null under react-test-renderer, so `AccessibilityInfo.setAccessibilityFocus` is never reached in Jest even though the ref attaches correctly. If this ever becomes a behavior scenario it needs a findNodeHandle mock; the doc should note it is untestable on this platform as written.
- Breadcrumb: nothing announces the reveal beyond the screen-reader focus move — no live region is specified for the items that appear when the ellipsis is activated. Left as the focus move alone.
- Breadcrumb: `label` has a prop default of 'Breadcrumb' and `copy.navLabel` is the same string. I used COPY.navLabel as the default; the doc should say which one is canonical so a translated copy block does not diverge from the prop default.
