# Gaps reported while generating AlertDialog for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:37 — round 1

- AlertDialog: `confirmDisabled` is described as 'aria-disabled, still focusable' (web ARIA convention), but the composed `Button` only supports native `disabled` (removes from focus/interaction per its own doc) — no restyle/reimplementation is allowed, so `confirmDisabled` maps to `Button`'s `disabled` prop as-is; a focusable-but-inert Confirm is not achievable without a Button API change.
- AlertDialog: `focusRing`/`focusRingWidth` are locked bindings but this component introduces no directly-focusable element of its own beyond the composed `Button`s, which draw their own focus ring internally — same acknowledged platform limit Dialog documents for the same reason.
- AlertDialog: a11y.role `alertdialog` has no native RN `accessibilityRole` equivalent; left unset and relies on `accessibilityViewIsModal` + `accessibilityLabel`/`accessibilityHint` on the surface, matching Dialog's precedent for `role=dialog`.
- AlertDialog: `overrides.footerGap` can't reach Stack's internal gap (no override hook on Stack's fixed `space.*` gap presets), so the footer row is hardcoded to `gap="1"` and the override is a no-op — same limit Dialog documents for its footer.
- AlertDialog: icon size for the tone glyph isn't specified; chose `size="lg"` since the a11y.contrast entry for the icon marks `large: true` (implying a large-text-equivalent presentation), consistent with the AA large-text contrast allowance.
- AlertDialog: composition lists `focusScope: FocusScope` but does not name a component for the icon+text wrapper or the outer surface/scrim; rendered as plain `View`s, matching Dialog's precedent for uncomposed anatomy parts.
- AlertDialog: initial focus targets a wrapping `View` around the title rather than the Heading's own Text node (Heading doesn't forward refs) — same native limit Dialog documents for `initialFocus="title"`.

## 2026-09-10 02:44 — round 1

- AlertDialog: confirmDisabled is described as 'aria-disabled, still focusable' but the composed Button only supports native disabled (removes focusability) — no restyle/reimplementation allowed, so confirmDisabled maps to Button's disabled as-is; a focusable-but-inert Confirm needs a Button API change.
- AlertDialog: a11y.role alertdialog has no native RN accessibilityRole equivalent; left unset, relying on accessibilityViewIsModal + accessibilityLabel/accessibilityHint on the surface, matching Dialog's precedent for role=dialog.
- AlertDialog: overrides.footerGap can't reach Stack's internal gap (no override hook on Stack's fixed space.* gap presets), so the footer row is hardcoded to gap="tight" and the override is a no-op — same limit Dialog documents for its footer.
- AlertDialog: icon size for the tone glyph isn't specified; chose size="lg" since the a11y.contrast entry for the icon marks large: true.
- AlertDialog: composition lists focusScope: FocusScope but names no component for the icon+text wrapper or outer surface/scrim; rendered as plain Views, matching Dialog's precedent.
- AlertDialog: initial focus targets a wrapping View around the title rather than the Heading's own Text node (Heading doesn't forward refs) — same native limit Dialog documents for initialFocus="title".

## 2026-09-10 18:14 — round 1

- AlertDialog: the existing implementation used a prop named `title` instead of the schema's `heading`; renamed the prop (and stories/test args) to `heading` to match the schema and the sibling components' convention (Dialog, Alert) of avoiding `title` since it collides with a native HTML/RN attribute name.
- AlertDialog: `iconSize` is listed as overridable in the schema but was missing from `AlertDialogOverridableBinding` and never forwarded to the tone Icon; added it and wired it through `Icon`'s `overrides.size`, following the exact pattern Alert.tsx uses for its own `iconSize` binding.
- AlertDialog: `footerGap` was declared in the overridable-binding type but a comment claimed Stack had 'no override hook' and the override was silently dropped; Stack does accept `overrides.gap` (used by Dialog.tsx for the same seam), so wired `overrides?.footerGap` through to the footer Stack's `overrides` prop and removed the inaccurate comment.

## 2026-09-10 20:20 — round 1

- AlertDialog (rn): platform notes require the surface to carry RN's role="alertdialog" prop (paralleling Dialog's role="dialog"), but the existing implementation only had accessibilityViewIsModal/accessibilityLabel/accessibilityHint. Added role="alertdialog" to the surface and to the doc comment.
- AlertDialog (rn): scroll-lock from a11y.requires has no native equivalent (no page scroll for a modal to suppress), same acknowledged limit as Dialog — not implemented.
- AlertDialog (rn): heading-hierarchy is satisfied only by Heading's own accessibilityRole="header"; RN has no heading levels so level=2 only sets the visual size, per the schema's own note.

## 2026-09-16 06:36 — round 1

- AlertDialog: parts `cancelButton`, `confirmButton`, `icon`, `heading`, `description` and `footer` are composed components (Button, Icon, Heading, Text, Stack) that accept no testID, so each is wrapped in a plain View carrying `testID="AlertDialog.<part>"`; tests reach the Button through `within(...).getByTestId('Button')`. The schema does not say whether a composed part's hook lives on a wrapper or on the child.
- AlertDialog: anatomy lists `surface` and the root testID convention says the root carries `testID="AlertDialog"`; as in Dialog, `AlertDialog` goes on the modal surface (the Modal has no testID) and `AlertDialog.surface` on the inner bordered view. The spec does not say which view is the root when the element is a Modal.
- AlertDialog: `focusScope` part (FocusScope) has no testID or forwarded props in the schema; composed as in Dialog (`trapped`, `restoreFocus`, `autoFocus="none"`, since initial focus is set by hand on the heading) with no hook.
- AlertDialog: the Rules require a `ref?: Ref<ViewInstance>` for a component that exposes its root, but neither the schema nor the sibling Dialog says whether an overlay exposes one; none was added, matching Dialog.
- AlertDialog: `the-cancel-button-is-named-from-copy` expects `copy: cancelLabel` but not where the label is read from; asserted as the text 'Cancel' inside the cancelButton part.
- AlertDialog: Default story args are the delete-files example, so the scenario `given` merges onto those; the `DeleteFiles` story is therefore identical to Default. The spec does not say whether that duplication is intended.
- AlertDialog: the scrim is a plain View per the rn notes, so `a-scrim-click-does-nothing` presses a view with no handler; the test passes trivially and cannot catch a regression to a Pressable that does nothing visible.
- AlertDialog: the icon is decorative on web (`aria-hidden`) but the rn notes don't say so; the Icon has no label (so Icon hides itself) and its wrapper also sets `accessibilityElementsHidden`/`importantForAccessibility="no"`.
- AlertDialog: the `exit` transition easing is not stated; kept `motion.easing.exit` as Dialog uses, while the Rules name only `motion.easing.standard` (used for enter).
- AlertDialog: the surface's small upward entry offset (`t.space2` translateY) and `maxHeight: 90%` are inherited from Dialog; the schema has no binding for either.

## 2026-09-17 10:30 — round 1

- AlertDialog: composition.footer lists only the footerGap forward and no props, yet the Stack must be horizontal to lay Cancel and Confirm in a row; the 'exactly the listed props' rule forbids direction/gap/justify. Chose direction="horizontal" gap="tight" justify="end" as in Dialog and the web platform note — the footer composition should list them.
- AlertDialog: composition.icon lists no `size` prop, and iconSize is 'forwarded as overrides.size' with default font.size.lg, but Icon's own `size` enum has an `lg` too. Chose to pass no `size` prop and always send overrides.size (the override or 'font.size.lg'), and likewise always send overrides.color = color.status.{tone}.icon; the doc should say whether the default token is forwarded or the Icon `size` prop is set.
- AlertDialog: rn notes put testID="AlertDialog" on 'the outermost View inside the Modal' but role/accessibilityLabel/accessibilityViewIsModal on 'the surface'; the derived has-accessible-name test finds the name by label, not on the root testID. Chose name and role on AlertDialog.surface; the doc should say which element has-accessible-name targets.
- AlertDialog: gutter says 'on rn, the horizontal margin and the max height', but spacing is never a margin in this package. Chose paddingHorizontal on the centering View and maxHeight = window height − 2 × gutter via useWindowDimensions.
- AlertDialog: escape is mapped only from onRequestClose in the notes; chose to also map the iOS VoiceOver escape gesture (onAccessibilityEscape on the surface) to onCancel('escape'), as Dialog does — the rn notes should list it.
- AlertDialog: the rn notes don't say whether the scrim fades during enter/exit (the enter/exit descriptions say 'scrim fade', and the scrim must have no responder). Chose an Animated.View with opacity driven by the animation and no press handler.
- AlertDialog: the Guidance says the Keyboard story 'exercises Tab wrap across those two' buttons, but the rn a11y rules say native implements only Escape/Enter; FocusScope trapped provides the wrap on react-native-web. No keyboard-wrap test exists for rn (the Tab rules have no behavior scenario), so it is unverified here.
- AlertDialog: the rules template asks for one story per enum value plus examples and says 'wrap in ThemeProvider'; the package uses the withTheme decorator. Kept ToneDanger/ToneWarning/ToneInfo and the four example stories; ToneDanger and DeleteFiles repeat Default, as the Guidance allows.

## 2026-09-21 07:13 — round 1

- AlertDialog: the guidance says "Focus lands on the Cancel button" and the behavior scenario focus-starts-on-the-cancel-button is scoped web+lit, while the rn platform note says initial accessibility focus goes on the title; I followed the rn note (setAccessibilityFocus on the View wrapping the Heading after the enter animation, immediately under reduced motion) — but then nothing on rn implements the WCAG 3.3.4 "Enter cancels by momentum" protection the Accessibility section justifies, since there is no native equivalent of DOM focus order. Worth stating explicitly in the doc which platform gets which.
- AlertDialog: the composition contract says a part receives exactly the listed props and no others, but FocusScope also needs `active={open}` so the trap and focus restore release while the exit animation still has the Modal mounted (Dialog does the same). Passed it; if `active` is meant to be part of the FocusScope composition it should be listed.
- AlertDialog: the `layer` binding is documented as having no effect on rn (native Modal window), yet it is in the overridable list. I still apply it as `zIndex` on the centering View for parity with Dialog rather than dropping it — an override of `layer` therefore changes a style that the doc says cannot matter.
- AlertDialog: the `gutter` binding says the surface maxWidth and maxHeight are "both set on the surface". On rn the sized box is the Animated wrapper that carries the shadow, radius, opacity and translateY, so width/maxWidth/maxHeight sit there and the surface takes `flexShrink: 1` — same result, different element from the one named.
- AlertDialog: `textGap` has no `part` in the styles block and no anatomy entry covers the heading+description group, so it lands on an unnamed wrapper View with no testID (the `heading` and `description` part wrappers are inside it). `inset`'s "inline edges of every part" likewise had to cover the unnamed icon-and-text row, otherwise the icon touches the surface edge.
- AlertDialog: a-scrim-click-does-nothing is not a real assertion on rn. The scrim is an Animated.View with no press handler, so `fireEvent.press` on it resolves to nothing and the test cannot distinguish "no handler" from "a handler that ignores the press" — it would pass even if the scrim were wired wrongly to a no-op. The only structural check available is that no Pressable exists at that testID.
- AlertDialog: the keyboard block's Tab / Shift+Tab wrap and Enter rules have no rn implementation — RN exposes no hardware key events on a Modal — so only Escape survives, via onRequestClose (Android back) and onAccessibilityEscape (VoiceOver scrub). The Keyboard story exists for react-native-web's axe gate only; on native it exercises nothing.
- AlertDialog: "Example stories start from blank args, never from Default's or the meta args" is not expressible in Storybook CSF3 — story args always merge over meta args. The example stories set every prop their `given` names, and the leftover inherited ones (`confirmDisabled: false`, no `cancelLabel`) equal the schema defaults, so the rendered result matches; but the args panel shows meta's values, not blank.

## 2026-09-23 14:11 — round 1

- AlertDialog: `partGap` and `inset` are bound to part `surface`, but since the surface must scroll itself on rn, the column carrying the block padding and the gap is the ScrollView's contentContainerStyle inside the surface View, not the surface View. The doc doesn't say where the scroll container sits relative to the `AlertDialog.surface` testID; I kept the role, label and testID on the outer bordered View.
- AlertDialog: the `rise` binding says 'translateY from rise to 0' on enter, and `exit` says the exit is a fade, but it doesn't say whether the surface stays in place or reverses the rise on exit. I made the exit a pure fade with a separate rise value, as in Dialog, so a reopen that interrupts the exit doesn't jump.
- AlertDialog: the heading prop's a11y says 'aria-labelledby the heading', and the aria-mirror rule asks for aria-labelledby/aria-describedby 'where an id exists'. It doesn't say whether rn should mint ids with useId and put them on the heading and description wrappers via nativeID. The file now has aria-labelledby and a web-only aria-describedby, but the ids aren't on any element (another writer's edit, left unfinished). The doc should say whether rn uses id references or relies only on aria-label and accessibilityHint.
- AlertDialog: the dev warning for an empty heading, description or confirmLabel gives no text. I wrote my own developer-facing message, since it isn't user copy.
- AlertDialog: the behavior scenario `has-accessible-name` doesn't say which element to query. The rn notes say the surface, so the existing test's getByLabelText(heading) relies on only the surface carrying that label. A trigger labelled with the heading text, as in the Keyboard story harness, would make that query ambiguous if the test rendered the harness.

## 2026-09-23 14:11 — round 1

- AlertDialog: the web a11y line says 'aria-labelledby the heading; aria-describedby', but RN has no aria-describedby and the rn notes use accessibilityHint instead. I set accessibilityLabel + aria-label + aria-labelledby (heading wrapper nativeID) and, on react-native-web only, aria-describedby (description wrapper nativeID), plus accessibilityHint. The doc should say whether rn mirrors aria-describedby on web or relies on the hint alone.
- AlertDialog: the `layer` binding is an override that does nothing inside a Modal; it is still applied as zIndex on the centring View as the gutter/layer text describes.
- AlertDialog: `gutter` says the surface scrolls itself when it is taller than the window, but the testID `AlertDialog.surface` is on the bordered View with role=alertdialog. I put a ScrollView holding the whole column (block padding, partGap, footer) inside that View, so the ScrollView has no part name. The doc should say whether the scroll container is the surface part or an unhooked child.
- AlertDialog: `partGap` names part `surface`, but with the scrolling column it lives on the ScrollView's contentContainerStyle, not the surface View itself.
- AlertDialog: `rise` says 'zero under reduced motion' and `exit` says the exit is a fade only. I implemented a separate translate value that animates on enter only and resets after unmount; the doc does not say what a reopen that interrupts the exit should do (I leave the surface at rest rather than dropping it back down).
- AlertDialog: the dev warning for an empty heading/description/confirmLabel says 'warns once' without saying once per instance or once per app; it is once per mounted instance (a ref).
- AlertDialog: the rn notes say initial focus goes to the title, while the keyboard rules and Guidance say Cancel on web. The Keyboard story still renders a trigger with only two focusable children in the dialog, which the Guidance says is intended; the Storybook 'at least three focusable children' rule contradicts it and was not followed.
- AlertDialog: the scrim scenario 'click: scrim' on native fires press on an Animated.View with no handler. RNTL's fireEvent.press on a View without onPress is a silent no-op, so the test passes whatever the component does and cannot fail.
