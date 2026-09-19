# Gaps reported while generating Link for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:15 — round 1

- Link (rn): the existing implementation predated the current overrides/testID conventions — added testID="Link" and an overrides prop, since the spec says overrides/testID apply regardless of whether platforms.rn.props lists them.
- Link (rn): of the four overridable bindings (underlineThickness, underlineOffset, externalIconGap, transition), only `transition` has any effect on native — RN Text can't set decoration thickness/offset, and nested Text ignores margins so the external-icon gap is a hardcoded single space, not a token. Narrowed LinkOverridableBinding to 'transition' only rather than including no-op bindings.
- Link (rn): implemented the `transition` binding as a real color crossfade (Animated.Value interpolating colorLink -> colorLinkHover on press, eased with motion.easing.standard, skipped under reduced motion), matching Button's pattern, since the previous version swapped colors instantly and the schema explicitly names a transition binding for hover/press color.
- Link (rn): replaced the ad-hoc Unicode '↗' glyph with the package's own <Icon name="external" inline> component, since Icon's own docs/stories name 'the external mark on a Link' as its intended use and the package rule says never to re-implement a shape a shared component already provides. Trade-off: Icon's inline mode always renders at font.size.md (an already-documented Icon limitation) rather than truly inheriting the surrounding Text's font size the way the old raw-glyph-in-Text did, so the icon can look mis-sized when a Link sits inside a Text of a non-md size.
- Link (rn): Icon has no animated-color support, so unlike the label's crossfade, the external icon's color still swaps instantly between colorLink/colorLinkHover on press.
- Link (rn): for tone="inherit" combined with external=true, the icon color falls back to Icon's own default (color.foreground) since there is no currentColor to inherit on native — the spec doesn't address this combination explicitly.

## 2026-09-10 17:26 — round 1

- Link: the schema's platforms.rn.notes says Link 'forwards accessibilityHint, accessibilityLabel (when set by a parent such as Tooltip), onHoverIn, onHoverOut, onFocus, onBlur and onLongPress to the native element' — the file previously in the repo didn't do this, and Tooltip.tsx's own docstring explicitly called it out as an acknowledged gap ('this package's own Button/Link/Input do not forward unrecognized props... out of scope here'). I added the passthrough props to LinkProps and forward them onto the underlying Animated.Text. RN's Text type has no onFocus/onBlur/onHoverIn/onHoverOut in its TS declarations (those are Pressable-only in @types), so those four are typed as (event: unknown) => void and spread through an untyped bag rather than passed as literal JSX attributes; onLongPress and accessibilityHint/accessibilityLabel are properly typed since Text does declare them. Tooltip.tsx's docstring is now stale for Link specifically (still true for Button/Input) but I left it untouched since Tooltip wasn't in scope for this generation pass.
- Link: the notes also say '`external` always uses Linking', which conflicts with the general onPress-vs-Linking rule ('never both') stated one sentence earlier and with the cross-platform events.onPress doc ('on native the consumer's handler is the navigation'). I resolved this as: `onPress(href)` always fires first if provided (per the Behavior section's 'onPress fires first'), and for `external` links `Linking.openURL(href)` then always performs the navigation regardless, since a consumer-side router can't hand off to the system browser; for non-external links, Linking is only used as a fallback when no `onPress` is given. The previous implementation didn't special-case `external` at all — it just used onPress-if-present, else Linking, unconditionally.

## 2026-09-16 04:01 — round 1

- Link: onPress is declared `cancelable: true`, but the rn notes and guidance never say what 'the default action' is on native or how a handler cancels it. I chose: returning `false` skips the Linking.openURL hand-off (the only default action native has); for a non-external link with a handler there is no default to skip.
- Link: the rn notes contradict themselves on the external icon under `tone: inherit`: 'takes the parent Text's color from TextStyleContext' versus 'there is no currentColor to inherit from, so the mark falls back to Icon's own default colour'. I chose: use TextStyleContext.color when nested in a system Text, and Icon's default otherwise.
- Link: the rn notes say '`onPress(href)` first ... an external link then always hands off to Linking.openURL(href) as well', but the React Native guidance says 'otherwise call Linking.openURL(href) — never both'. I kept the notes' version (external always opens through Linking) because Declared contracts win over prose.
- Link: the guidance says the RN platform notes name `TextNestingContext`, and so does the package digest, but the package exports `TextStyleContext` (with a `nested` field). I used TextStyleContext.
- Link: the digest's helper signature `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)` has the arguments in the wrong order; theme.tsx declares `toLineHeight(fontSize, multiplier)`. I followed the code.
- Link: the overrides contract lists underlineThickness, underlineOffset and externalIconGap as overridable, but the rn notes say only `transition` has an effect on native. LinkOverridableBinding stays `'transition'` alone rather than accepting keys that do nothing.
- Link: the `externalIconGap` binding (space.1, part externalIcon) cannot be applied, because nested Text ignores margins; the guidance says to use a single literal space, which I did. The Style bindings section lists it anyway, with no rn exception.
- Link: the rules say a component that exposes its root declares a `ref` prop, but the schema doesn't say whether Link exposes its Text root (Tooltip attaches through the forwarded handlers instead). I added no `ref` prop.
- Link: the has-accessible-name scenario only works for the default (non-external) args; the external name scenario is narrowed to web, so native never tests that the accessibilityLabel includes copy.externalSuffix.
- Link: `copy.externalSuffix` reads '(opens in new tab)', which is wrong on native, where the link opens the system browser. I used it verbatim as instructed; `copy.external` is unused on rn.

## 2026-09-17 04:23 — round 1

- Link: `tone: inherit` on native standalone (not inside a system Text) has no color to inherit; the spec only says Icon falls back to color.foreground, leaving the label's own color unstated (RN's default text color would differ from the icon). Chose color.foreground on the label as well.
- Link: `tone: inherit` says the underline follows the inherited color; nested in a system Text, Link sets no textDecorationColor and relies on RN inheriting color into the decoration. Not stated how that should be done explicitly.
- Link: no `given` story args for the ToneInherit story's surrounding text; the spec names the muted-text wrapper only for the InsideMutedText example. Chose to wrap ToneInherit in a muted Text too, so the inherited color is visible.
- Link: the rn package digest writes `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but theme.tsx's signature is `toLineHeight(fontSize, multiplier)`; followed the source.
- Link: the digest says Text provides `TextNestingContext`; the component doc correctly says `TextStyleContext` (`nested` field) — the digest is stale.
- Link: the spec says Link forwards `onFocus`, `onBlur`, `onHoverIn` and `onHoverOut` to Text, but RN 0.87's strict Text types do not declare them; passed them through an untyped props bag, as the previous file did.
- Link: the Default story args are not given by the spec; chose the inline-in-a-paragraph example's href/label.
- Link: the pressed color crossfades with Animated, which makes the press test log React act() warnings under Jest (tests still pass); the doc does not say whether the test should use fake timers or reduced motion.

## 2026-09-18 19:54 — round 1

- Link: the package digest writes `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but `theme.tsx` declares `toLineHeight(fontSize, multiplier)`; I followed the code (`toLineHeight(t.fontSizeMd, t.fontLineHeightNormal)`), so the digest's argument order needs fixing.
- Link: the digest names a `TextNestingContext`; Link's guidance says it doesn't exist and to use `TextStyleContext.nested`, which is what the code exports. I used `TextStyleContext`, so the package digest is stale.
- Link: the spec says only 'On native Link sets no textDecorationColor' inside the `tone: inherit` description, and doesn't say whether that also covers `tone: default`. I applied it to both tones, so the underline follows the animated text color. That also keeps the underline and the label from crossfading separately.
- Link: the spec says the Icon color 'swaps instantly on press while the label crossfades', but doesn't say whether the label animates at all under `tone: inherit`. I run no animation under `inherit`, since rest and pressed resolve to the same inherited color.
- Link: the forwarded `onFocus`/`onBlur`/`onHoverIn`/`onHoverOut` props have no event type in the spec, and RN's strict `Text` types don't declare them. I typed them `(event: unknown) => void` and spread them onto the Text through an untyped object. The spec should name the event types, or say they only apply on react-native-web.
- Link: the spec doesn't say what happens when `Linking.openURL` rejects (an unsupported scheme or an app route with no handler). I swallow the rejection silently.
- Link: the rules template lists `disabled` / `accessibilityState` handling, but Link has no `disabled` prop ('never disabled'). I added none; the template rule could say it applies only when the schema declares `disabled`.
- Link: the `click-fires-on-press` scenario says Link 'navigates to href', but the test can only assert that `onPress` fires with `href`. Nothing checks the `Linking` fallback or the external hand-off after the handler, and the scenarios could add both for native.

## 2026-09-18 20:01 — round 2

- Link: round 2 is unfixed and I have no verified result. The axe-rn run (bfvxftxcv) was stopped before it finished and left no report, and the sandbox wouldn't run `node logs/link-axe-rn.mjs` (a harness filtered to Link, left in logs/ and unused). None of the violations in the truncated log I was given name Link, so which Link story fails is still unknown.
- Link: the RN notes say 'On react-native-web this becomes a real anchor', but react-native-web 0.21 only renders a Text as <a> when it gets an `href` prop. Link passes none, so on web it renders <div role="link"> (<span> when nested). This is my main suspect for the axe failure, but I haven't confirmed it and haven't made the fix. The planned fix is to forward `href` to Text through the untyped prop bag (RN's native Text types have no `href`) and call `event.preventDefault()` in the press handler, so the browser doesn't navigate on top of `onPress`/`Linking.openURL`. The spec doesn't say whether Link should forward `href` on web, whether to preventDefault (which also blocks ctrl/middle-click open-in-new-tab), or whether `external` should set `hrefAttrs` (target _blank, rel noopener noreferrer) on react-native-web.
- Link: the package digest writes `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but `theme.tsx` declares `toLineHeight(fontSize, multiplier)`; the code follows theme.tsx.
- Link: the digest names a `TextNestingContext`; the code exports `TextStyleContext` (`nested` field), which Link's guidance also names. I used `TextStyleContext`.
- Link: 'On native Link sets no textDecorationColor' appears only in the `tone: inherit` description. I applied it to both tones, so the underline follows the animated text color.
- Link: the spec doesn't say whether the label animates under `tone: inherit`; I run no animation there, since rest and pressed resolve to the same inherited color.
- Link: the forwarded `onFocus`/`onBlur`/`onHoverIn`/`onHoverOut` props have no event type in the spec, and RN's strict `Text` types don't declare them. I typed them `(event: unknown) => void` and spread them through an untyped object.
- Link: the spec doesn't say what happens when `Linking.openURL` rejects (unsupported scheme or unhandled app route); the rejection is swallowed silently.
- Link: the rules template's `disabled` / `accessibilityState` rule doesn't apply, because Link is never disabled; I added nothing for it.
- Link: the `click-fires-on-press` scenario says 'navigates to href', but the RN test can only assert that `onPress(href)` fires. Nothing checks the Linking fallback or the external hand-off after the handler.
- Link: the press animation causes an act() warning in the RN tests (the tests still pass). The spec gives no guidance on testing the animated press color.
- (report recovered after a second request)

## 2026-09-18 20:06 — round 3

- Link: the axe gate names Link as the component under test but runs every RN story as one test per mode. The failures come from other components (Toolbar, Tree, TreeGrid, Listbox, Feed, Carousel, Checkbox, Combobox, Select, Meter, RadioGroup, SegmentedControl, Card, Tabs, Toast, DataGrid and the Preferences/Profile/SettingsPage demos). logs/playwright.json has no Link/React Native violation in light or dark mode, so no Link change can turn the gate green. I left Link's code unchanged.
- Link: the RN notes say 'On react-native-web this becomes a real anchor', but react-native-web 0.21 only renders Text as <a> when it gets an `href` prop, and RN's native Text types declare no `href`. Link doesn't forward it, so on web it renders <div role="link"> (<span> when nested). axe accepts that, so I didn't change it, to avoid an unverified behavior change. Forwarding `href` would also need a decision the spec doesn't make: whether to preventDefault the anchor click (stopping double navigation alongside onPress/Linking, but also blocking ctrl/middle-click), and whether `external` sets hrefAttrs target/rel on web.
- Link: the package digest writes `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but theme.tsx declares `toLineHeight(fontSize, multiplier)`; the code follows theme.tsx.
- Link: the digest names a `TextNestingContext`; the code exports `TextStyleContext` (`nested` field), which Link's guidance also names. I used `TextStyleContext`.
- Link: 'On native Link sets no textDecorationColor' appears only in the `tone: inherit` description. I applied it to both tones, so the underline follows the animated text color.
- Link: the spec doesn't say whether the label animates under `tone: inherit`; I run no animation there, since rest and pressed resolve to the same inherited color.
- Link: the forwarded onFocus/onBlur/onHoverIn/onHoverOut props have no event type in the spec, and RN's strict Text types don't declare them. I typed them `(event: unknown) => void` and spread them through an untyped object.
- Link: the spec doesn't say what happens when Linking.openURL rejects; the rejection is swallowed silently.
- Link: the rules template's `disabled` / accessibilityState rule doesn't apply, because Link is never disabled; I added nothing for it.
- Link: click-fires-on-press says 'navigates to href', but the RN test can only assert that onPress(href) fires. Nothing checks the Linking fallback or the external hand-off after the handler.
- Link: the press animation causes an act() warning in the RN Jest tests (they still pass). The spec gives no guidance on testing the animated press color.
