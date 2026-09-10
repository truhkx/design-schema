# Gaps reported while generating BottomSheet for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 03:06 — round 1

- BottomSheet: above the maxWidth breakpoint the spec says to render Dialog directly ('composition, not duplication'), so the mounted root there carries data-ds="Dialog" instead of data-ds="BottomSheet" — the testability hook differs by viewport; there's no way to satisfy both the composition instruction and a stable root hook at once.
- BottomSheet: hideTitle has no effect in the wide/Dialog presentation, since Dialog's schema has no hidden-title mode and the rule forbids restyling/reaching into composed children. The title is always visible there.
- BottomSheet: overrides (the per-instance token hooks) only apply to the bottom-edge presentation; above the breakpoint the sheet renders as Dialog, which has its own distinct overridable-binding set, so BottomSheet overrides are silently unused in that mode. Not stated in the doc.
- BottomSheet: a11y.requires lists target-44px, but the close button is a composed Button, whose schema only exposes size sm/md/lg (no 'comfortable target' variant), and the rules forbid restyling a child's internals. Used size="md" (the largest available) but can't guarantee the rendered target actually reaches 44px — the gap is in Button's schema, not something this generator can fix without growing it.
- BottomSheet: the exit token's description says a drag dismiss 'continues at the drag velocity'; implemented the standard exit transition (same as a non-drag close) instead of momentum-preserving physics, since the schema gives no numeric spec for how velocity should map to animation.
- BottomSheet: the wide/narrow breakpoint is read at runtime via getComputedStyle(--layout-max-width-prose) rather than hard-coded, so it can't reflect a per-instance overrides.maxWidth (that hook only exists on the mounted sheet element, which doesn't exist yet when the presentation decision is made).
- BottomSheet: schema has no initialFocus prop (unlike Dialog), so default focus-on-open always targets the first focusable body control, falling back to the close button — this mirrors Dialog's 'first' default but isn't explicitly specified for BottomSheet.
