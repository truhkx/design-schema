# Gaps reported while generating BottomSheet for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 03:01 — round 1

- BottomSheet: the drag gesture's threshold ("released past the threshold") and velocity aren't quantified in the spec; I chose 25% of measured sheet height (matching web's stated 25%) and a 1.5 px/ms release velocity, and used `Animated.decay` for the post-release motion since the spec's "continues at the drag velocity" has no native-specific guidance on the mechanism.
- BottomSheet: the RN notes say the ScrollView's scrollY-at-0 'hands the gesture to the pan responder,' implying the body itself can also initiate a drag-dismiss when scrolled to top. I implemented drag only on the header/handle (the PanResponder is not attached to the ScrollView) since arbitrating responder ownership between a ScrollView and a PanResponder without a new gesture dependency is unreliable; dragging must start on the header, not from within scrolled-to-top body content.
- BottomSheet: no `initialFocus` prop exists on this component (unlike Dialog), so focus placement on open relies entirely on FocusScope's default `autoFocus="first"`, which on native resolves to the scope's own wrapper (not a real first-focusable descendant) — the same acknowledged limit FocusScope documents for itself.
- BottomSheet: when rendered as `Dialog` above `maxWidth` (tablet/wide), `hideTitle` has no effect since Dialog always shows its title — the title is visually present in the wide presentation even when `hideTitle` is true, though it remains the accessible name either way.
- BottomSheet: `scroll-lock` (a11y.requires) has no native equivalent — there's no page scroll for a modal `Modal` to suppress — so it isn't implemented, matching Dialog's existing documented limitation.
- BottomSheet: `accessibilityRole="dialog"` (a11y.role) is not set explicitly on the surface, matching the existing Dialog/AlertDialog implementations in this package, which rely on `accessibilityViewIsModal` plus the native `Modal` instead — following established precedent rather than the schema's literal `role: dialog` value, since RN's `accessibilityRole` enum support for 'dialog' is inconsistent across versions.
