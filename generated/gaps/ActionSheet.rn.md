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

## 2026-09-21 09:47 — round 1

- ActionSheet: a11y.requires lists `focus-restore` and the composition sets FocusScope `restoreFocus: true`, but rn FocusScope documents that it can only restore to a TextInput unless given `returnFocusTo`, and the rn note says the sheet exposes no ref and 'callers ref their opener' — there is no prop to hand the scope the opener, so focus-restore is unimplementable on this platform. I passed `restoreFocus` anyway (it no-ops for a non-TextInput opener); the schema needs a trigger-ref prop or the requirement needs a native exclusion.
- ActionSheet: the rn note puts `role="menu"` and the accessible name on the surface, but the surface also holds the header/heading and the Cancel Button — so on native those are inside the menu role, unlike web where `role="menu"` wraps only the item list and Cancel sits outside it. I followed the note verbatim (role + testID="ActionSheet" on the surface, `ActionSheet.list` a plain container with no role); if the menu role should scope to the list, the note contradicts itself.
- ActionSheet: `heading` is both the menu's accessibleName and a visible `Text` row, and nothing says to hide the visible copy from assistive technology, so VoiceOver reads the title twice (once as the menu label, once as the Text). I left the Text exposed; web's `<p>` title has the same shape, so this may be intended, but it is not stated.
- ActionSheet: anatomy has one `divider` part but the doc describes two dividers with different semantics, so both carry `testID="ActionSheet.divider"` verbatim and a test must use `getAllByTestId`. Distinct part names (e.g. `groupDivider` / `cancelDivider`) would make them addressable.
- ActionSheet: the guidance says the story wrapper 'renders no trigger (there is no copy key for one)', but the platform testability rule requires a `Keyboard` story rendering the sheet 'open with its trigger'. I made the wrapper trigger-less by default and gave only `Keyboard` a trigger labelled 'More actions' (the label the guidance suggests for an opener, not a copy key).
- ActionSheet: no binding sizes the row glyph. `fontSize` styles the item label, so overriding it leaves `itemIcon` at Icon's default size and the row's type and glyph drift apart. I rendered `<Icon name color>` with no size; an `itemIcon` size binding or an `inline` rule would settle it.
- ActionSheet: the doc says danger actions 'are grouped last' without saying whether the component reorders them or the consumer must supply them last. I reorder (a default group then a danger group, whatever the array order), which is what makes the 'drawn only when there are both default and danger actions' divider rule well-defined.
- ActionSheet: the `list` part has no style binding and its scrolling is mentioned only in passing ('the list scrolls inside it', under the 90% cap). I made `ActionSheet.list` a `ScrollView` with flexGrow 0 / flexShrink 1 so the header and Cancel row stay pinned; no binding governs its own padding or scroll behaviour.
- ActionSheet: nothing says whether a sheet mounted already `open: true` plays the enter transition or appears in place. I play it, matching BottomSheet — which means the Default and example stories slide in on load.

## 2026-09-23 14:21 — round 1

- ActionSheet: not generated by this session. Session ds-regen-rn-d1 was already writing packages/rn/src/ActionSheet.tsx and ActionSheet.stories.tsx in the same worktree; writing too would clobber its work. ActionSheet.test.tsx was not updated and still looks for role/accessibilityLabel on the surface instead of ActionSheet.list.
- ActionSheet: the rn note puts accessibilityViewIsModal on the surface but gives it no role or aria-modal. aria-modal is not allowed on an element without a role, so mirroring it as aria-* would fail axe's aria-allowed-attr check. I would have left it off and relied on react-native-web's Modal, which renders role=dialog with aria-modal, but the spec does not say this.
- ActionSheet: role=menu and the accessible name go on the list, which is the ScrollView. A ScrollView is not an accessible element on iOS or Android, so VoiceOver/TalkBack may never read the menu's name there; the spec gives no native way to announce it.
- ActionSheet: the 90% height cap (BottomSheet's height: content cap) is mentioned in the guidance but is not a constant in this schema, so it becomes an undocumented literal-ok here.
- ActionSheet: the keyboard section's Tab trap between the menu and the Cancel row, and the arrow/Home/End rules, cannot be done natively (Pressable has no key events), so the Keyboard story only proves that a trigger and focusable rows render.
- ActionSheet: the Keyboard story's trigger is an iconOnly Button labelled 'More actions' with the 'ellipsis' glyph. Neither the glyph nor the Button variant is named in the spec.

## 2026-09-23 14:21 — round 1

- ActionSheet: the web <dialog> carries aria-modal and the same aria-label, but the rn note puts only accessibilityViewIsModal on the surface. aria-modal on a View with no role would fail axe's aria-allowed-attr under react-native-web, so the surface gets no role, no aria-modal and no name. Say whether rn should mirror web with role="dialog" + aria-modal + aria-label on the surface.
- ActionSheet: the rn note says 'a list View with role="menu"' while the Behavior section says 'the list is the scroll region'. I made the ScrollView itself the list (role, name and testID ActionSheet.list), so under react-native-web the menuitems sit inside ScrollView's inner content container.
- ActionSheet: the-list-is-a-menu and has-accessible-name cannot use RNTL getByRole('menu'), because RNTL 13 only matches `accessible` Views and making the list accessible would merge its rows. The tests check the list's role and accessibilityLabel props instead.
- ActionSheet: nothing is said about the bottom safe area. BottomSheet uses SafeAreaView, which RN 0.87 now warns is deprecated (it points to react-native-safe-area-context, which is a banned dependency), so no safe-area inset is applied and the Cancel row can sit under the iOS home indicator.
- ActionSheet: whether the Cancel Button fills the row's width is not specified. It renders at its natural width, start-aligned in a row padded with itemPaddingInline × headerPaddingBlock.
- ActionSheet: whether the header's vertical padding applies when only the handle or only the heading is shown is not specified. It always applies whenever the header renders.
- ActionSheet: the Keyboard story's trigger is described only as 'an overflow Button labelled More actions'. I used variant secondary, iconOnly, with Icon 'ellipsis' coloured colorActionSecondaryForeground; the glyph name and the variant are my choice.
- ActionSheet: the item hover paint has no transition on rn (the spec names one only for web and Lit), so the pressed and hover background switches instantly.
- ActionSheet: whether a disabled row keeps its focus border and pressed/hover paint is not specified. It keeps the focus border and gets no hover or pressed paint.
- ActionSheet: the danger-group divider is a role="separator" View; the spec doesn't say whether it needs an orientation or any aria-orientation mirror. None was added.

## 2026-09-23 19:11 — round 1

- ActionSheet: the spec says the composed heading Text gets `element: p`, but rn Text has no element prop; the note covers it and I passed only tone and size.
- ActionSheet: the item row label is a plain RN Text, not the system Text, because the rows need explicit fontFamily, fontSize, lineHeight and danger color from the sheet's own bindings. The spec does not say whether rows should compose Text.
- ActionSheet: the `non-dismissible-still-reports-escape` scenario is limited to web and Lit, so on rn Escape is only reachable through `onRequestClose`. I covered it with a `Modal` `onRequestClose` test, but the spec gives no rn scenario for it.
- ActionSheet: the spec gives no token for the `height: content` cap (90% of the viewport), so I kept a documented `literal-ok` module constant (`contentCap`).
- ActionSheet: the `Keyboard` story's arrow, Home and End rules describe the web Menu presentation and have no rn implementation. The note says so, but the `keyboard` block still requires the story.
