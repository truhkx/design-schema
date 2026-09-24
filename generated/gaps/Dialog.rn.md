# Gaps reported while generating Dialog for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:23 — round 1

- Dialog: `overrides.footerGap` can't reach Stack's internal gap (Stack's `gap` is a fixed `space.*` preset with no override hook), so the footer row is hardcoded to `gap="1"` (space.1 = layout.gap.tight, the default) and the override is a no-op — same gap already flagged in Dialog.web.md; Stack would need its own override escape hatch to close this.
- Dialog: composition doesn't name a component for `header`, so it renders as a plain `View` (Card precedent for uncomposed anatomy).
- Dialog: the gap between title and description inside the header's heading-group isn't named by any binding; used `layout.gap.tight` directly (a real token, but not an overridable one), matching Card's own header-gap precedent and the web generator's choice for this same seam.
- Dialog: native has no descendant walker, so `initialFocus` is implemented (like FocusScope documents for itself) by calling `AccessibilityInfo.setAccessibilityFocus` on a wrapping `View` around the title, the close button, or the body `ScrollView` — not the literal first focusable descendant for `initialFocus="first"`. Heading/Text don't forward refs, so 'title' targets a plain wrapping View rather than the Heading's own Text node.
- Dialog: `focusRing`/`focusRingWidth` are locked but Dialog introduces no directly-focusable element of its own beyond the composed `Button` (close button) and the ad-hoc focus targets above, which have no visible focus ring on native (no `:focus-visible` equivalent) — an acknowledged platform limit, same as web's note.
- Dialog: `a11y.requires` lists `scroll-lock`, which has no native equivalent (there is no page-level scroll for a modal window to suppress); left unimplemented rather than faked.
- Dialog: the RN platform notes list `accessibilityViewIsModal` as a prop passed to `Modal` itself, but RN's `Modal` doesn't accept that prop — only `View` does. Implemented it on the surface `View` (also documented in the notes prose) and rely on the composed `FocusScope`'s own wrapper `View` (which already sets `accessibilityViewIsModal={trapped && active}`) for the actual inert-background effect, rather than duplicating a Modal-level prop that doesn't exist.
- Dialog: whether the close button should be visually `disabled` or just a silent no-op when `dismissible=false` isn't specified; chose `disabled` (announced state) over a live-looking dead control, for the same reason Escape must always report — an unresponsive-but-enabled button is a worse a11y outcome than a disabled one.
- Dialog: `size="md"`'s width (3/4 of `layout.maxWidth.content`) is computed as `t.layoutMaxWidthContent * 0.75` per the spec's own description; not a new token, but not itself independently overridable (only `widthSm` is, per the Overridable list).

## 2026-09-10 02:42 — round 1

- Dialog: RN has no descendant walker for FocusScope, so `initialFocus` is implemented by hand via AccessibilityInfo.setAccessibilityFocus on wrapping Views (title group, close button, body) rather than the first real focusable descendant — same acknowledged limit FocusScope documents for itself.
- Dialog: scroll-lock has no native equivalent (no page scroll for a modal window to suppress), so it is intentionally not implemented on RN.
- Dialog: `overrides.footerGap` cannot reach Stack's internal `gap`, since Stack's gap is a fixed space.* preset with no override hook — the override is a no-op for the footer row, same gap the web generator flagged.
- Dialog: RN's typed accessibilityRole union has no 'dialog' value, so role is conveyed via accessibilityViewIsModal + accessibilityLabel/Hint rather than an explicit role.

## 2026-09-10 18:12 — round 1

- hideHeading: the spec only asks to keep the heading as 'the accessible name' while visually hiding it. On RN the accessible name is already carried by accessibilityLabel={heading} on the modal surface regardless of rendering, so I simply omit the visible Heading node when hideHeading is true rather than using an off-screen/visually-hidden style — there's no visual box left behind and no separate a11y-tree entry to hide.
- footerGap: the schema says it's 'forwarded to the footer Stack as overrides.gap'. The prior generated code had a comment claiming Stack's gap has 'no override hook' and treated the binding as a no-op, but Stack.tsx already accepts overrides?.gap — I wired overrides.footerGap straight through to the Stack's overrides prop and removed the stale comment. Flagging in case AlertDialog.tsx (same footerGap pattern, out of scope here) still carries the outdated no-op comment/behavior.
- BottomSheet.tsx:297 calls <Dialog title={title} .../>, which no longer compiles now that the prop is `heading` — tsc confirms this is the only remaining type error in packages/rn. Out of scope for this Dialog-only regen; BottomSheet needs its own pass to rename the forwarded prop (and decide whether to also forward its own hideHeading to Dialog's hideHeading, which the spec implies but BottomSheet's current code explicitly says has 'no Dialog equivalent').

## 2026-09-10 18:13 — round 2

- BottomSheet.tsx (rn): its wide-viewport path composes Dialog and previously forwarded title={title}; updated to heading={title} to match Dialog's schema-mandated prop rename. BottomSheet's own `hideTitle` is still not forwarded to Dialog's `hideHeading` — the existing docstring says 'hideTitle has no Dialog equivalent, so the title always renders in that presentation,' which is no longer strictly true now that Dialog has hideHeading; deciding whether BottomSheet should forward it is a BottomSheet-schema question, out of scope for this Dialog-only fix.

## 2026-09-10 20:18 — round 1

- Dialog: onClose reason 'action' is documented as existing for a consumer whose footer action wants to reuse the same callback, but the spec never says Dialog itself emits it — implementation never calls onClose('action') internally, leaving it entirely to the consumer's footer buttons.
- Dialog: size sm/md/lg widths — only widthSm has a named token (layout.maxWidth.prose); md/lg are described as '3/4 of' and 'equal to' layout.maxWidth.content but no distinct tokens exist for them, so md is computed as layoutMaxWidthContent * 0.75 (a literal-ok multiplier) rather than a token lookup.
- Dialog: anatomy lists scrim/surface/focusScope/header/heading/description/body/footer/closeButton as parts, but only scrim/header/body/footer plus the root got testIDs (matching AlertDialog's precedent) — heading, description, closeButton and focusScope have no individual testID.

## 2026-09-16 06:30 — round 1

- Dialog: composition.body lists no forwards, but the `inset` binding is 'Padding of header, body and footer'. The body is a composed Box, so the only way to apply an `inset` override there is to pass it to Box's `overrides.paddingBlock`/`paddingInline`, which 'add no other forward' forbids. Kept that forward; the spec should add `forwards: { inset: [paddingBlock, paddingInline] }` to body.
- Dialog: hideHeading on RN removes the Heading entirely and relies on the surface's accessibilityLabel for the name. The web notes keep a visually hidden heading as a focus target, but RN has no visually-hidden primitive, so `initialFocus: title` with `hideHeading` focuses the title-group View, which may be empty if there is no description. The spec should say what the focus target is on RN in that case.
- Dialog: the keyboard rule 'Escape requests close' has no hardware-Escape hook on iOS native; only Android's onRequestClose (back button/Escape) reports `escape`. Tab/Shift+Tab wrapping relies on FocusScope's trap. The spec does not say whether iOS needs an accessibilityEscape (VoiceOver two-finger scrub) handler; none was added.
- Dialog: example `rename-project` lists its footer as 'Cancel and Rename Buttons', but the guidance says primary first. The story renders Rename (primary) then Cancel. Examples with no `description` still inherit the Default story's description from meta args, since the spec doesn't say whether 'exactly its given' should clear the meta defaults.
- Dialog: md width is derived as 0.75 × layout.maxWidth.content with a literal-ok comment. Neither md nor lg is overridable (only widthSm is), and the spec doesn't say whether `widthSm` overrides should also scale md/lg; they don't.
- Dialog: the conventions ask components that expose their root to accept `ref`. The Dialog root is a native Modal and the spec names no ref target (surface?), so no `ref` prop was added.
- Dialog: `layer` (layer.dialog) is applied as zIndex inside the Modal, where it has no effect because Modal is its own window. The spec gives no RN meaning for it.

## 2026-09-17 10:23 — round 1

- Dialog: the Controlled state section says `open` is 'uncontrolled from its initial state when omitted', but props.open says it is controlled only with no uncontrolled mode and is required; I made it controlled only.
- Dialog: platforms.rn.notes says 'the body Box takes its testID directly', but the RN Box writes its own testID="Box" and has no testID prop, just like Stack; I put Dialog.body on a wrapping View, which is also the focus target for initialFocus first.
- Dialog: the notes say testIDs are 'the root plus scrim, header, body and footer' but do not say which element is the root: the Modal, the host View or the surface. I put testID="Dialog" on the surface View with role=dialog, because a closed Modal renders no content.
- Dialog: the `inset` binding says header, body and footer each apply the padding, and `partGap` separates them, so the space between parts is inset + partGap + inset. I matched web (full padding on each part plus the gap), but the doc doesn't say whether that doubling is intended.
- Dialog: initialFocus `first` gives an order (body, footer, close button, heading), but on RN focus goes to a wrapping View and children is required, so the body always wins and the rest of the order never applies on native. Not stated for rn.
- Dialog: `layer` has 'no effect inside a native Modal window' and RN has no non-Modal fallback; I still apply it as zIndex on the centring container (harmless). The doc could say rn ignores it.
- Dialog: focusRing/focusRingWidth are locked bindings on the heading part, but the rn notes say there is no visible focus ring on focus targets; not implemented on rn. The doc could exclude these bindings for rn explicitly.
- Dialog: the `enter` binding names motion.easing.standard and `exit` names motion.easing.exit, but neither is an overridable binding; I read both from the theme. The web wording about the scrim fading with the surface is kept: both use the same Animated value.
- Dialog: the `enter` rise is 'translateY of space.2'; the doc does not say whether the surface rises from below (+space.2 → 0) or drops from above. I used +t.space2 → 0 (moves up into place).
- Dialog: the rn notes say 'on phones the surface is full-width with the gutter as margin' and the guidance says `marginHorizontal: layout.gutter`; I used horizontal padding of layout.gutter on the centring container with width 100%, because a margin plus width 100% overflows. Also maxHeight 90% of the viewport is an unspecified literal (literal-ok) that keeps header and footer on screen.
- Dialog: the guidance says to wrap the body ScrollView inside KeyboardAvoidingView; I wrapped the whole centring container so the footer also stays above the keyboard. The doc doesn't say which is intended.
- Dialog: `onOpened` 'on the next frame' has no RN primitive named; I used requestAnimationFrame. It also fires only when the enter animation finishes (not when it is interrupted by closing), which the doc doesn't say.
- Dialog: the doc does not say whether the enter animation runs when the dialog mounts already open; I animate in on first mount too, which triggers React act() warnings in Jest (tests still pass).
- Dialog: the guidance says focus returns to the opener 'on close', but not whether that happens when the exit animation starts or ends; FocusScope is active while `open` is true, so focus is restored when the exit starts.
- Dialog: the scenarios non-dismissible-still-reports-escape and initial-focus-lands-on-the-close-button are scoped to web and lit, so they have no rn test, although rn implements both (onRequestClose/onAccessibilityEscape, and setAccessibilityFocus on the close button) and a test could check the escape part with fireEvent on onAccessibilityEscape.

## 2026-09-21 06:53 — round 1

- Dialog: the Controlled state section says `open` is "controlled when given, uncontrolled from its initial state when omitted", but the prop is `required: true` and its description says controlled-only with no initial-state prop. Implemented controlled-only, per the prop description.
- Dialog: styles.layer says "rn ignores it", yet `layer` is in the overridable list. AlertDialog, BottomSheet and SidePanel all apply `zIndex: layer` on rn, so I did too (on the centring container) rather than leave the override dead — but the schema prose still says rn ignores it.
- Dialog: the body forward is specified as "on rn the resolved value is always passed", but Box's `overrides` takes a TokenRef and the conventions forbid resolving a token on a child's behalf. Passed the token path (`overrides.inset ?? 'layout.inset.lg'`) into `overrides.paddingInline` and set `inset="none"` so the Box adds no block padding; the doc never states what the Box's block inset should be beyond "zero".
- Dialog: `inset` is 'the block padding of the surface column... once at the top, once at the bottom' — with no footer, the body's bottom spacing then comes only from that surface padding and no part sits below it. Assumed intended; the doc does not cover the footerless case.
- Dialog: the scrim is described both as 'a full-screen Pressable (accessible={false})' and as 'an Animated.View whose opacity follows the same value'. RN cannot be both without Animated.createAnimatedComponent(Pressable); rendered an Animated.View carrying the scrim color and opacity with a full-bleed Pressable inside it that carries testID="Dialog.scrim".
- Dialog: with `dismissible: false` the doc says 'the scrim does nothing'. Kept the scrim Pressable mounted with an inert press handler (the `non-dismissible-scrim-click-does-nothing` scenario presses testID `Dialog.scrim`, so it must exist) rather than omitting the element.
- Dialog: shadow.overlay and radius.lg are bound to the `surface` part, but the surface needs `overflow: 'hidden'` to clip the scrolling body, which would clip its own shadow. Put the shadow and a matching radius on the animated wrapper directly around the surface.
- Dialog: `onOpened` must not fire when `open` goes false before the enter transition finishes — handled via Animated's `finished` flag. Under reduced motion (or a zero enter duration) the doc specifies a requestAnimationFrame instead; I cancel that frame on cleanup, but the doc does not say whether an interrupted reduced-motion open should suppress `onOpened`.
- Dialog: `initialFocus: 'close'` on a non-dismissible dialog is documented to walk 'body, then footer, then close button, then heading', but the rn notes collapse every fallback to the body wrapper (children is required). The footer/close/heading steps of that order are unreachable on this platform.
- Dialog: keyboard rules 2–4 (Tab / Shift+Tab wrap) have no native expression — there is no Tab order to confine. FocusScope is passed `trapped`, which on rn only maps to accessibilityViewIsModal. Rule 1 (Escape) is Android back plus onAccessibilityEscape.
- Dialog: `description` is specified as the accessible description (aria-describedby on web). RN has no equivalent; used `accessibilityHint` on the surface, which screen readers announce after a pause and with different semantics.
- Dialog: the locked bindings `focusRing`/`focusRingWidth` are part-bound to `heading`, but the rn notes say rn draws no ring at all. They are absent from the overridable union and unused on this platform.
- Dialog: `a11y.requires` lists `target-24px`, but Dialog's only control is the composed close Button, whose target comes from Button's own `size: sm`. Dialog adds no minWidth/minHeight or hitSlop of its own — flagging in case the floor is meant to be asserted here.
- Dialog: the swiftui notes reference a `size: full` value that the `size` enum (sm | md | lg) does not contain.

## 2026-09-23 14:08 — round 1

- Dialog: the rn notes make `description` the surface's accessibilityHint, but the rule to mirror every accessibility prop as aria-* has no aria spelling for a hint, and RN's View types have no `aria-describedby`. So react-native-web exposes no accessible description. Chose: accessibilityHint only; the doc should say whether rn-web should put a nativeID on the description Text and point an aria-describedby at it.
- Dialog: `enter` says the surface fades and rises, and `exit` says fade only. One shared progress value can't do both, because interpolating the rise from it also plays the rise backwards on close. Chose: a second Animated.Value for the translateY, animated only on enter; the doc could say this outright for rn.
- Dialog: the rn notes don't say whether the surface should carry `aria-modal`. Chose: `aria-modal` next to accessibilityViewIsModal, because the web platform lists aria-modal among its attributes and the axe gate runs on react-native-web.
- Dialog: the Escape keyboard rule on react-native-web depends on RNW's Modal sending Escape to onRequestClose, which the doc never says. The non-dismissible-still-reports-escape scenario covers only web and lit, so rn has no test for Escape (Android back / onAccessibilityEscape).
- Dialog: initial-focus-lands-on-the-close-button covers only web and lit, so on rn `initialFocus: close` is only checked by the renders-initial-focus-close test. setAccessibilityFocus can't be observed under Jest's test renderer.

## 2026-09-23 14:09 — round 1

- Dialog: rn has no aria-describedby for an id-less description; the spec maps description to accessibilityHint only, and there is no aria-* mirror for a hint (RN has no aria-description prop), so on react-native-web the axe gate sees no accessible description. Chose accessibilityHint alone.
- Dialog: the exit is 'fade only' but the spec does not say what the rise does if the dialog reopens mid-exit. Chose: rise resets to space.2 only after the exit finishes and the content unmounts, so an interrupted reopen fades back in with no movement.
- Dialog: the enter reduced-motion path says 'on the next frame after focus moves in', but rn focus is setAccessibilityFocus on a wrapper View, which gives no signal that focus arrived. Chose: call setAccessibilityFocus, then requestAnimationFrame(onOpened), cancelled on close.
- Dialog: `footer` is content; the spec says the footer wrapper is 'not rendered when there is no footer' without saying whether null counts as no footer. Chose to skip it for both undefined and null.
- Dialog: 'Focus restore runs when `open` becomes false' is delegated to FocusScope (active={open}, restoreFocus); the spec does not say how FocusScope restores on native, where there is no focus to capture, so rn restore is only as good as FocusScope's.
- Dialog: the keyboard Tab-wrap rules and initial-focus-lands-on-the-close-button are web and Lit only; the Keyboard story exposes them on react-native-web, but Jest has no scenario that checks them.

## 2026-09-23 19:07 — round 1

- Dialog: no `aria-describedby` can be written on rn because the description has no id, and the spec says the description is only the surface's accessibilityHint. That leaves react-native-web with no accessible description, which conflicts with the rule to mirror every accessibility prop as aria-*. Kept the hint only, and no `aria-description` was added.
- Dialog: the spec says `initialFocus: first` looks in the body, then the footer, then the close button, then the heading. The rn note says it always lands on the body wrapper, since children is required. Followed the rn note, so the fallback order is dead code on rn.
- Dialog: the spec doesn't say what setAccessibilityFocus targets when `hideHeading` is true and `initialFocus` is `title`. Chose the surface View, following the rn note.
- Dialog: the spec doesn't say whether the close button wrapper View that receives focus should hide the composed Button's own accessibility. Left the Button labelled with copy.closeLabel, with no aria-hidden on the wrapper, per the no-hide-descendants rule.
- Dialog: the spec doesn't say how `reducedMotion` and a zero `enter` or `exit` duration interact with an override. Treated either one as instant, the same way the reduced-motion path works.
- Dialog: `layer` is written as zIndex on the centring container as the spec asks, but a Modal window ignores it, so no test can observe it.
