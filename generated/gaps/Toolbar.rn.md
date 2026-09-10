# Gaps reported while generating Toolbar for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 12:46 — round 1

- Toolbar: `overflow: menu` has no RN equivalent — children are opaque ReactNode with no `overflowLabel` metadata and there's no ResizeObserver-equivalent to measure them, so `menu` renders the same scrollable row as `overflow: scroll` (with a __DEV__ warning); the `overflowButton`/`overflowMenu` anatomy parts (Button/Menu) are consequently not rendered on this platform.
- ToolbarGroup: named in the guidance and the web/Lit platform notes as the grouping wrapper, but has no schema of its own and isn't in the `composition` map (only separator/overflowButton/overflowMenu are). Implemented grouping instead as: placing a `Divider` child between clusters gets `groupGap` on both sides (vs. `itemGap`/`itemGapCompact` elsewhere) and is length-constrained to `separatorLength` via a wrapping View — no separate `ToolbarGroup` component was created.
- size: 'Passed to the child controls that accept it' has no defined mechanism for arbitrary ReactNode children, so `size` is injected via `React.cloneElement` on any child that doesn't already set its own `size` prop (same fallback pattern `Fieldset` uses for `disabled`); children with no `size` prop at all (e.g. `Switch`) silently receive and ignore it.
- keyboard model (roving tabindex, Arrow/Home/End navigation): RN's `Pressable` has no generic key-event API, so this is a web-only concern reachable through react-native-web, matching the same acknowledged limit already documented on `Tabs` and `Menu`. Native reachability is by swipe/scroll only.
- fadeWidth's 'gradient from the toolbar background to transparent' has no RN core primitive (no CSS mask-image); implemented with `react-native-svg`'s `LinearGradient` (the package's one sanctioned dependency, already used by `Icon`) rather than skipping the effect.
- paddingInline/paddingBlock are treated as fixed logical-CSS axes (inline = horizontal, block = vertical) independent of the `orientation` prop, matching Box's insetBlock/insetInline convention — the spec doesn't say whether they should rotate with a vertical toolbar's layout axis.

## 2026-09-10 19:38 — round 1

- Toolbar: overflow="menu" has no native equivalent — RN has no ResizeObserver and children are opaque ReactNodes with no overflowLabel metadata to build a collapsed Menu, so it renders the same scrollable row as overflow="scroll" (dev warning in __DEV__).
- Toolbar: no roving-tabindex/arrow-key/Home/End model exists on native Pressable (no generic key-event API), so that keyboard behavior is reachable only via react-native-web; on native every control is its own accessibility stop reached by swipe (same acknowledged limit as Tabs/Menu).
- ToolbarGroup: named in guidance and web/Lit platform notes but has no schema of its own, so RN has no dedicated wrapper component — grouping is expressed by placing a Divider between clusters of children instead.
