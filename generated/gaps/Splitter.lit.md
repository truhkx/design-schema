# Gaps reported while generating Splitter for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 16:37 — round 1

- Splitter: minSize's description references a `collapseThreshold` that is not declared anywhere as a prop — I treated `minSize` itself as the collapse threshold (dragging or arrowing below `minSize` collapses when `collapsible`; otherwise clamps at `minSize`).
- Splitter: the doc doesn't say whether `size-change-end` also fires after a keyboard-driven change (only 'Fired once when a drag ends' is specified). I chose to fire it only on pointer drag end, not after arrow/Home/End/Enter key presses, since each keypress is already a discrete, non-continuous commit.
- Splitter: `collapsed` has no `default` in the schema (unlike `size`, which is paired with `defaultSize` for the controlled/uncontrolled split). Since the platform notes require it to be a reflected attribute, I implemented it as a plain two-way boolean property (default `false`, mutated directly, like `<details open>`) rather than a Slider-style controlled/uncontrolled pair — there is no `defaultCollapsed`.
- Splitter: `collapseButtonOffset`'s reference point ('offset') isn't specified precisely. I positioned the collapse button centered on the separator's cross axis, offset from the separator's start edge along the main axis by that token.
- Splitter: `paneMinTarget` ('a pane never shrinks below this on the drag axis before collapsing') is implemented as a CSS `min-inline-size`/`min-block-size` floor on both panes (lifted only on the primary pane once actually collapsed), rather than a JS pixel-clamp during drag — this is a presentational floor, not a computed collapse trigger (that's `minSize`, per the gap above).
- Splitter: F6 pane-cycling focus target when a pane has no focusable content — I fall back to focusing the pane wrapper `<div>` itself (given `tabindex="-1"` for this purpose), since the doc doesn't specify a fallback.
- Splitter: the grip mark's exact geometry (a 'short centered grip mark') isn't dimensioned beyond `gripLength`; I rendered it as a rounded bar matching the separator's thickness for the cross-axis dimension.
