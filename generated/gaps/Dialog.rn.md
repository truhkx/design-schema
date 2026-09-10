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
