# Gaps reported while generating Splitter for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 16:37 — round 1

- Splitter: `minSize`'s description references a `collapseThreshold` distinct from `minSize` ("Below collapseThreshold the pane collapses instead"), but no such prop exists in the schema. I treated `minSize` itself as the collapse threshold: with `collapsible`, dragging past `minSize` collapses instead of clamping at it; without `collapsible`, `minSize` is the hard clamp floor as usual.
- Splitter: the F6 keyboard rule says 'from the separator to the secondary; from a pane to the next' but doesn't fully specify the cycle for all three regions. I implemented a 3-way cycle primaryPane → separator → secondaryPane → primaryPane (wrapping), focusing the first focusable descendant of the target region (or the region itself as a tabIndex=-1 fallback).
- Splitter: `stackBelow` and the a11y note about 'a phone has no room for two panes side by side' only mention stacking for a horizontal splitter. I made stacking apply only when `orientation === 'horizontal'`; a vertical splitter never stacks regardless of `stackBelow`/container width — not stated explicitly either way.
- Splitter: no behavior is specified for a pointer drag that starts, or continues, while the pane is already collapsed. I made the separator ignore pointermove entirely while collapsed (only Enter or the collapse button restores it) rather than treating a drag as an implicit restore.
- Splitter: Home/End/Arrow keys are not specified to have any effect while collapsed. I made them no-ops while collapsed (only Enter toggles), rather than implicitly restoring the pane first.
- Splitter: `paneMinTarget` ('a pane never shrinks below this on the drag axis before collapsing') is enforced via a CSS `minmax()` floor on the grid track, layered underneath the JS percent clamp (`minSize`/`maxSize`) — so a very narrow container can force the pane visually wider than the requested percent. The collapsed state explicitly drops this floor (grid track literal `0`) so collapse still reaches true zero width, per the web notes' 'inline-size 0'.
- Splitter: 'the separator becomes inert' when stacked was implemented as `display: none` (plus `role="presentation"`, no `tabIndex`) rather than merely non-interactive-but-visible; the doc doesn't say whether the thin line should stay visible when stacked.
- Splitter: used a real per-element container query (ResizeObserver on the splitter's own inline size, breakpoint read at runtime from the `layout.maxWidth.*` token) rather than a viewport `matchMedia`, since the doc calls it a 'container query' and nesting is explicitly supported (Splitter-in-a-pane). Guarded for environments without `ResizeObserver` (jsdom), matching the existing Toolbar.tsx pattern.

## 2026-09-10 19:24 — round 1

- Splitter: platform notes say the separator 'is not rendered' below stackBelow, but the existing implementation keeps it in the DOM with role="presentation" and display:none rather than omitting the node — kept as-is since it's already inert to AT and pointer input and all behavior scenarios pass.

## 2026-09-16 12:45 — round 1

- Splitter: the web notes put the collapse Button on the separator, but role=separator has presentational children in ARIA 1.2, so a Button inside it is hidden from AT. Chose a wrapper grid item (ds-splitter__track) holding the separator and a sibling collapseButton wrapper positioned over the line.
- Splitter: collapseButton is a composed Button, and Button writes its own data-part="container", so the part hook can't sit on the button. Used a span[data-part=collapseButton] wrapper that forwards clicks to the Button, as BottomSheet/Carousel do.
- Splitter: 'stepping below it collapses instead of clamping' is ambiguous when size - step < minSize but size > minSize (e.g. 11 - 2 with min 10). Chose: clamp to minSize first; shrinking again from minSize collapses. Home sets minSize and never collapses.
- Splitter: 'Enter again restores the last size' doesn't define the last size after a drag-collapse. Chose the last committed size before the pointer crossed minSize (the size state is never zeroed; collapse is a separate flag). The collapse itself fires onSizeChangeEnd with that size because the drag ends there.
- Splitter: aria-valuenow/valuemin while collapsed aren't specified. Chose valuenow 0, valuemin 0 and valuetext '0%' so the value stays in range; valuemin goes back to minSize on restore.
- Splitter: the guidance says the stackBelow breakpoint is 'read from the built token JSON', but the React package has no theme-neutral JSON import (the exports are per theme) and theming is external. Read the loaded --layout-max-width-* custom property instead (px, rem or em), as SidePanel/BottomSheet do; without tokens, or without ResizeObserver, it never stacks.
- Splitter: collapsed without collapsible (collapsed=true, collapsible=false) is undefined. Chose to ignore collapsed unless collapsible is true.
- Splitter: whether onSizeChange/onSizeChangeEnd fire when a key press doesn't change the size (End at maxSize) isn't stated. Chose to fire neither; a drag always fires onSizeChangeEnd once on pointerup.
- Splitter: in RTL the table still says ArrowRight grows a horizontal splitter even though the primary pane is on the right. Kept the keys as written; dragging does map the pointer mirrored in RTL.
- Splitter: F6 lists only a forward cycle, so Shift+F6 does nothing. A collapsed (inert) primary pane is skipped, and when stacked the cycle is primary to secondary.
- Splitter: the transition binding covers collapse/restore but not keyboard steps. Chose to animate only when the collapsed state changes (a ds-splitter--animate modifier cleared by any key or drag resize), through @property --ds-splitter-primary-size.
- Splitter: the grip is 'a rounded bar' with no radius token named. Used radius.full; the bar is separatorSize wide, so any smaller radius would look the same.
- Splitter: the composition for collapseButton gives variant/size/iconOnly/chevron Icon but no state semantics (aria-expanded/aria-controls). Added none, so the only state cue is the Collapse/Expand label copy.
- Splitter: the separatorActive state is 'dragging' but the description says 'While dragging or focused'. Styled both :focus and the ds-splitter--dragging root modifier.
- Splitter: a vertical splitter needs a definite height, which the doc doesn't mention. The stories use a non-focusable decorator frame sized to var(--layout-max-width-prose); the component itself fills its parent with block-size: 100%.
