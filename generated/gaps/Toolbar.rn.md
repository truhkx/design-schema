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

## 2026-09-16 10:47 — round 1

- Toolbar: platforms.rn.notes says `menu` 'also works and opens an ActionSheet on phones through Menu', but Guidance says native renders `menu` as `scroll` with a dev warning and the overflowButton/overflowMenu parts have no element. I followed Guidance (scroll plus a one-time __DEV__ warning, horizontal only, since vertical treats menu as scroll by design).
- Toolbar: platforms.rn.notes says 'overflow defaults to scroll on native', but the schema default is `menu`. I kept `menu` as the default, so every default native Toolbar hits the fallback warning. The warning fires once per module to avoid log floods.
- Toolbar: platforms.rn.element is `View`, but notes and Guidance say 'Horizontal ScrollView'. The root is a View (role, label, testID) that wraps a ScrollView for scroll/menu and a plain wrapping View for `wrap`.
- Toolbar: native grouping is 'a Divider between clusters', but it isn't said who renders the Divider or with what orientation. I chose: the consumer places Divider children; Toolbar splits groups at them, lays each in a `Toolbar.separator` box sized by separatorLength, and supplies `orientation` (across the toolbar axis) only when the Divider sets none. Leading, trailing and repeated Dividers are dropped. Divider has no length binding, so separatorLength sizes the wrapper, not the child.
- Toolbar: groupGap 'replaces itemGap either side of a separator' has no gap-only native form for a flat list. I nested each cluster in a `Toolbar.group` View (gap = itemGap) inside a row with gap = groupGap.
- Toolbar: `itemGap` is bound by density, but the overrides contract doesn't say whether an override applies to both densities. I chose to replace the value for both densities.
- Toolbar: `size` is 'applied by cloning direct children that have a size prop', but RN can't tell whether a component accepts `size`. I clone it onto every non-Divider element child whose `size` is undefined (fragments flattened), including e.g. Switch, which ignores it.
- Toolbar: `fadeWidth` says 'edges faded' without saying whether a fade shows when nothing is scrolled past that edge. I draw each fade only while content is hidden past it (tracked from onLayout, onContentSizeChange and onScroll), using a react-native-svg LinearGradient from background to transparent.
- Toolbar: keyboard rules (roving focus, Arrow/Home/End, one tab stop) can't be done on native, and Guidance says arrows apply on react-native-web only, without saying how. I implemented no arrow handling; RN Pressable has no key events. The Keyboard story renders the default formatting controls; the three web-only behavior scenarios are not tests on rn.
- Toolbar: the example `children` values are prose ('Bold, Italic and Underline buttons', 'A SegmentedControl and two Selects'), not args. Each example story sets exactly the given props as args and renders those children in `render`. The icon table has no bold/italic/draw glyphs, so buttons are text ghost buttons rather than iconOnly. Select requires `name`, which the example doesn't give (used 'owner'/'sort').
- Toolbar: focusRing/focusRingWidth are locked bindings that Guidance says Toolbar applies nowhere on any platform. They are not applied and not in the overrides type.
