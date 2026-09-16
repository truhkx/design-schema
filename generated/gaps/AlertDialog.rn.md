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
