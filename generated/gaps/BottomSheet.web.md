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

## 2026-09-10 20:50 — round 1

- BottomSheet: the existing generated file predated the current schema (props were named `title`/`hideTitle`/`draggable`); renamed to `heading`/`hideHeading`/`dragToDismiss` to match the schema and Dialog's own naming, including the composed Dialog forwarding, CSS classes/data-part, and the dev warning. index.ts already exported the current type names so no change was needed there.
- BottomSheet: the drag velocity threshold in the existing code was 0.5 px/ms; corrected to the schema's 'faster than 1.5 px/ms'.
- BottomSheet: initial-focus fallback was body-first-control → close button → the native <dialog> itself; the guidance says the third fallback is the heading, so added a `headingRef` (tabIndex -1, focus-visible styled, matching Dialog's own heading-focus pattern) and used it ahead of the dialog element.
- BottomSheet: target-44px is required because sheets are used one-handed, but the composed Button defaults its min target to `size.target.min` (24px); added an explicit `.ds-bottom-sheet__close { min-inline-size/min-block-size: var(--size-target-comfortable) }` rule (same pattern ActionSheet uses for its rows) rather than growing Button's own contract. Footer/body content is consumer-supplied, so 44px there isn't something this component can enforce.
- BottomSheet: FocusScope didn't carry `data-part="focusScope"` even though it's a named anatomy part; added it (Dialog already does this).
