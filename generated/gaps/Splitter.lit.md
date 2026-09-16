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

## 2026-09-10 19:11 — round 1

- Splitter: the `transition` style binding's doc says it covers 'Collapse and restore, and the separator color' but the implementation only transitions the separator's background color — `--ds-splitter-primary-size` drives `grid-template-columns` and changes instantly on collapse/restore since animating a custom-property-valued grid track needs a global `@property` registration (`syntax: '<percentage>'`), which has inconsistent support when declared inside a shadow-root-adopted stylesheet; left unanimated rather than risk a silently-broken transition.

## 2026-09-16 12:50 — round 1

- Splitter: `collapsed` is a controlled boolean on a platform where a boolean attribute cannot express false; chose `collapsed: boolean | undefined` (reflect true), so controlled `false` is only expressible as a property, and the attribute's absence means uncontrolled.
- Splitter: 'While collapsed, … pointer drag do nothing' vs 'dragging past the minimum collapses' — the doc doesn't say whether a drag that collapsed the pane can bring it back in the same gesture; chose: a drag that starts while collapsed does nothing, but within the gesture that collapsed it, moving back above minSize restores it.
- Splitter: minSize says stepping below it with `collapsible` collapses, but the keyboard table says ArrowLeft only 'shrinks by step' and Home 'sets to minSize'; chose: an arrow step below minSize collapses (fires collapse-change only, no size events), Home clamps to minSize without collapsing.
- Splitter: the doc doesn't say whether size-change/size-change-end fire when a key press doesn't change the size (arrow at a bound, Home at min); chose not to fire.
- Splitter: the doc doesn't say what size a collapsed pane reports; chose aria-valuenow/valuetext 0 while collapsed, events carry the expanded size, and size-change-end after a drag reports 0 if the drag collapsed the pane.
- Splitter: F6 cycle when the primary pane is collapsed (inert, unfocusable) or stacked (no separator) isn't specified; chose to skip the unavailable zones, and Shift+F6 cycles in reverse (not listed; remove if the table means 'nothing else').
- Splitter: the collapse Button's focus position and F6 zone aren't specified; it sits between separator and secondary pane in tab order and counts as the separator zone for F6.
- Splitter: the 'pane wrapper itself (tabindex -1)' conflicts with delegatesFocus (a permanent tabindex=-1 wrapper becomes the host's focus delegate); chose to set tabindex=-1 only while F6 focuses the wrapper and remove it on blur.
- Splitter: collapseButton icon names aren't specified (web notes say 'chevron Icon'); chose chevron-left/right (horizontal) and chevron-up/down (vertical) by collapsed state, ignoring RTL.
- Splitter: the collapse button 'overlaps both panes' but a collapsed primary has no width, so a centered button would hang outside the container; chose to align it to the start edge while collapsed.
- Splitter: the `transition` binding animates a grid track through a registered custom property, but @property rules don't work inside shadow roots; chose CSS.registerProperty('--ds-splitter-primary-size', '<percentage>') at module load in try/catch, and the transition applies only on the render that collapses or restores. The web package may register the same name with a different syntax; the first registration wins.
- Splitter: stackBelow breakpoints (layout.maxWidth.prose 572, content 960) are duplicated as literal-ok constants because @container can't read custom properties; the guidance says 'read from the built token JSON', which the Lit package doesn't import anywhere.
- Splitter: `separatorActive` state `dragging` has no reflected attribute in platforms.lit.reflect; chose a `data-dragging` attribute on the separator part, plus :focus-visible per its 'while dragging or focused' description.
- Splitter: the `primary` and `secondary` content props become the `primary`/`secondary` slots, so the examples' string `given` values are rendered as slotted text in stories; args `primary`/`secondary` exist only in stories.
- Splitter: Lit behavior tests run in a real browser whose viewport is narrower than layout.maxWidth.prose, so every scenario without `stackBelow: never` would stack and render no separator; the test harness gives the element a 200vw inline size. Scenarios should state the width they assume (or set stackBelow: never).
- Splitter: web notes say grid-template-columns 'var(--ds-splitter-primary-size) auto 1fr', but separatorSize is 'the visible line'; chose var(--ds-splitter-separator-size) as the middle track, with paneMinTarget as a minmax() floor on both pane tracks.
