# Gaps reported while generating ActionSheet for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 03:08 — round 1

- ActionSheet: spec says 'Above maxWidth: renders Menu anchored to the element that was focused when open became true' but the package's Menu always renders its own internal trigger Button and has no API to anchor to an externally-rendered element (ActionSheet has no trigger of its own — open is fully controlled). Composing Menu for this would require re-implementing its anchor/positioning logic, which the instructions forbid. Chose to always render the phone sheet presentation, on tablets too — the mirror image of the limitation Menu.tsx's own doc comment already acknowledges about ActionSheet. The `maxWidth` override is consequently a no-op on this platform.
- ActionSheet: the web keyboard model (ArrowUp/ArrowDown/Home/End roving-tabindex between actions) has no RN equivalent — `Pressable` exposes no generic key-event API. Implemented the acknowledged-limit convention already used by Menu/RadioGroup: each row is its own Tab/focus stop; Enter/Space work through the platform's native activation. Reported here since the keyboard scenarios describing arrow movement cannot be expressed as RN tests.
- ActionSheet: anatomy has no 'handle' part (unlike BottomSheet), but the platform notes say 'drag-to-dismiss on the header as BottomSheet.' Interpreted 'header' as the title area (present whether or not `title` is set) and attached the PanResponder there; no visual grab affordance is drawn since no handle bar exists in the anatomy.
- ActionSheet: no padding/vertical-rhythm binding is defined for the title/header area or the cancel row's own inset (only itemPaddingInline/itemPaddingBlock are bound, for action rows). Reused itemPaddingInline for both, and a plain `t.spaceSm` (not bound to any override) for the header's vertical padding, matching the precedent BottomSheet set for its own unbound header spacing.
- Menu.tsx's doc comment currently states 'there is no ActionSheet component in this package yet' — now stale now that ActionSheet exists. Left unedited since it's outside this generation's scope (only ActionSheet.tsx and index.ts were requested), but should be updated in a follow-up pass.
- ActionSheet: behavior scenario 'has-accessible-name' is satisfied via `accessibilityLabel` on the surface (title ?? copy.defaultLabel) rather than a native heading/aria mechanism, matching the a11y.role: menu contract; no gap in coverage, noted for completeness.

## 2026-09-10 18:28 — round 1

- ActionSheet: schema names the prop `heading` (anatomy `heading`, copy `defaultLabel`) but the file on disk had it as `title`, and Menu.tsx (which composes ActionSheet for its phone-width presentation) passed `title={label}`; renamed the prop and updated Menu.tsx's two references so the package still typechecks — this is a cross-file consistency fix beyond ActionSheet.tsx itself.
- ActionSheet: `dismissible` is a new prop in this spec pass with no prior implementation; gated scrim-tap, drag-to-dismiss, and the Cancel row (via Button's `disabled`, matching BottomSheet's close-button convention) on it, while Escape always reports through `onClose('escape')` regardless, per the prop's own description ('as in Dialog').
- ActionSheet: anatomy now lists `handle`, matching the platform notes' 'the sheet has BottomSheet's handle and header'; added a non-interactive handle bar (`space.10`/`space.1`/`radius.full`/`color.foreground.muted`, same fixed values BottomSheet uses) since no binding exposes it as overridable or locked in the schema's styles list.
- ActionSheet: added `headerPaddingBlock` (`space.sm`) as the schema now names it explicitly ('vertical padding of the header ... and of the cancel row'); applied it to both the header and the cancel row's vertical padding, replacing the previous ad hoc `t.spaceSm` comment.
- ActionSheet: the header's handle-to-heading gap and the header's horizontal alignment have no named binding in the schema (only `itemGap`, described as icon-to-label within a row); kept BottomSheet's own hardcoded `layoutGapTight` for that internal spacing, same as before.
- ActionSheet: wide-screen Menu presentation above `maxWidth` remains unimplemented on RN (acknowledged in the existing doc comment) since the package's Menu always renders its own trigger and can't anchor to an external element — `maxWidth` stays a no-op override, unchanged from the prior implementation.

## 2026-09-16 07:26 — round 1

- ActionSheet: 'Controlled state' says open is uncontrolled when omitted, but the schema marks `open` required; implemented controlled-only.
- ActionSheet: the `ref` rule (a component that exposes its root declares ref) conflicts with the web note that the ref is the sheet <dialog>; on rn no ref prop was added, matching BottomSheet; the doc should say whether rn exposes the surface.
- ActionSheet: `dismissible: false` says the cancel row does not request close, but not whether the row is hidden, disabled or silently inert (web keeps it enabled and drops the event); rn renders the Cancel Button disabled so the state is announced.
- ActionSheet: the behavior scenario `the-list-is-a-menu` (`role: menu`) cannot use RNTL's getByRole on rn: the menu container must not be `accessible` (that would merge its rows), so role queries skip it; the test asserts the `role` prop on testID ActionSheet instead.
- ActionSheet: which part carries the root testID is unstated (the Modal host, the scrim host or the surface); followed BottomSheet and put testID="ActionSheet" on the surface with the menu role and label, so there is no separate ActionSheet.surface id.
- ActionSheet: `focusScope` part: its FocusScope props are not listed; used trapped, restoreFocus, autoFocus="none", and moved accessibility focus to the first enabled action (the normal group first, then danger) after the enter transition.
- ActionSheet: `headerPaddingBlock` pads the cancel row too, but the cancel row's inline padding is unspecified; used itemPaddingInline.
- ActionSheet: `divider` is 'above the danger group' — unspecified when every action is danger; the divider is omitted when there is no normal group above it.
- ActionSheet: `titleColor`/`titleSize` have no part; applied through the composed Text (tone="muted", size="sm"), with titleSize forwarded as Text's fontSize override alongside fontFamily and lineHeight.
- ActionSheet: `shadow`, `radius`, `layer`, `enter`, `exit` carry no part; applied to the surface (top corners only), anchor zIndex and the slide transition; the exit easing is motion.easing.exit, following BottomSheet, although the rules name only motion.easing.standard.
- ActionSheet: the sheet's max height is unspecified (the web note references BottomSheet `height: content`); used 90% of the window as BottomSheet does.
- ActionSheet: the `itemHover` state is `hover`; rn has no hover on touch, so it also shows while pressed (react-native-web gets onHoverIn/Out).
- ActionSheet: the doc asks for dev warnings nowhere but says 'two to about eight actions'; added __DEV__ warnings for fewer than 2 and more than 8. The closed-sheet scenario's single-action `given` triggers the first.
- ActionSheet: the package digest gives `toLineHeight(t.fontLineHeightNormal, t.fontSizeMd)`, but theme.tsx's signature is (fontSize, multiplier); followed the code.

## 2026-09-17 11:09 — round 1

- ActionSheet: composition.heading sets `element: p`, but the RN Text has no `element` prop (Text.tsx says so); I left it out and passed only tone="muted" and size="sm".
- ActionSheet: the `actions` shape `{ icon?: IconName; tone?: ...; disabled?: boolean }` can't be used verbatim on RN: with exactOptionalPropertyTypes, Menu.tsx (which builds ActionSheetAction objects with explicit undefined values) fails to typecheck. I kept `?: T | undefined` on each field.
- ActionSheet: the `divider` binding description packs both dividers into one sentence (danger-group divider 'as a role=separator inside the menu', and the cancel divider 'decorative and hidden from assistive technology'), so it's unclear which rule covers which. I gave the danger divider role="separator" and hid the cancel divider from assistive tech.
- ActionSheet: with dismissible=false and no heading, the header would be an empty padded box, and the spec doesn't say whether to render it. I skip the header when it has neither a handle nor a heading.
- ActionSheet: the `heading` forwards (fontFamily, titleSize, lineHeight to Text overrides) don't say whether the default token is forwarded or only a caller override. I forward only the overrides the caller gives, so Text keeps its own size="sm" defaults otherwise.
- ActionSheet: dismissVelocity is 1.5 px/ms, but the spec doesn't say how to measure speed on RN. BottomSheet samples event timestamps; ActionSheet uses PanResponder's gestureState.vy (also px/ms, averaged by RN). The two sheets can disagree on borderline flicks.
- ActionSheet: 'no separate slop' plus a header-wide responder means any touch on the heading text claims the gesture. That's harmless today, since the header holds no pressables, but BottomSheet still uses a slop, so 'as BottomSheet' and 'no separate slop' conflict. I followed the ActionSheet spec.
- ActionSheet: platforms.rn.props lists `accessibilityViewIsModal` as a Modal prop, but it's a View prop. It's on the surface View, and Modal gets visible/transparent/onRequestClose.
- ActionSheet: the Behavior section asks for a wrapper that owns `open` but doesn't say whether it should also forward to the story's onAction/onClose args or render a trigger. The wrapper calls both arg handlers and renders a 'More actions' Button trigger (label taken from the When-to-use prose, since no copy key exists).
