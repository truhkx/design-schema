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
