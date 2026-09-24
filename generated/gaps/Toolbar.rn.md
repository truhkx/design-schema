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

## 2026-09-17 13:24 — round 1

- Toolbar: `size` accepts sm|md but Search's size union is md|lg — the spec lists Search as a sized child without saying what `sm` maps to; chose to pass `md` through and leave Search at its own default when the toolbar is `sm` (web clones `sm` onto Search regardless).
- Toolbar: ToolbarGroup's props on React Native are not specified beyond `label` and `children` (no ref, no testID, no role) — chose `ref?: Ref<ViewInstance>`, `role="group"` and the part hook `testID="Toolbar.group"`; the rn notes say only 'accessibilityLabel from label'.
- Toolbar: ToolbarGroup's orientation, wrapping and itemGap come from the parent Toolbar, but the spec doesn't say how the group reads them — chose a private context carrying the group style, with a __DEV__ warning when a ToolbarGroup renders outside a Toolbar; it is also unstated whether a group nested inside a fragment or another wrapper counts (fragments are expanded; any other wrapper is treated as a bare control).
- Toolbar: the rn notes say only an explicitly passed `overflow="menu"` warns, while the `overflow` description says a vertical toolbar treats `menu` as `scroll` on every platform — it is unclear whether an explicit `menu` on a vertical toolbar should still warn on native; chose to warn for any explicit `menu`, following the rn note literally.
- Toolbar: example `compact-actions-with-overflow` says 'each with the same overflowLabel' — ambiguous between one shared string and each Button's overflowLabel matching its own label; chose overflowLabel equal to each Button's label.
- Toolbar: example `scrolling-filter-row` doesn't say whether the Selects' labels are visible; chose `hideLabel` to keep the row at toolbar height.
- Toolbar: behavior scenarios are all render/name checks; there is no scenario for the separator appearing only between adjacent groups, for groupGap's clamped padding, or for size by identity, so none of the new grouping contract is tested on React Native.

## 2026-09-21 18:40 — round 1

- Toolbar: platforms.rn.notes spells the group's role as `accessibilityRole="group"`, but the package convention says prefer the `role` prop on RN >= 0.73 wherever the web semantic exists, and 'group' is in RN's `Role` union. Chose `role="group"`, matching Fieldset and Menu in the same package; the two map to the same ARIA role on react-native-web.
- Toolbar: `copy.more` is the only copy string and has no consumer on React Native — the overflow Menu does not exist here, so nothing renders 'More'. Left unused rather than inventing a place for it.
- Toolbar: the rule that a component with a `keyboard` block ships a `Keyboard` story 'rendering it open with its trigger' does not fit a Toolbar — there is no trigger and nothing to open. Shipped `Keyboard` as three ghost Buttons across two groups (the three focusable children the rule also asks for), for the axe gate.
- Toolbar: orientation is unobservable on native — there is no `aria-orientation` equivalent and the doc's two orientation behaviors are scoped to web/lit — so `renders-orientation-vertical` asserts only that it renders. The vertical axis exists solely in style (flexDirection, separator geometry, ScrollView axis). No test can distinguish a broken vertical layout from a working one.
- Toolbar: `overflow: wrap` is described as wrapping 'onto more rows'; the vertical case is unspecified. Chose `flexWrap: 'wrap'` on the column, which requires a bounded height from the parent to do anything and is otherwise identical to nowrap.
- Toolbar: the fade is specified as going 'from the toolbar background to transparent', so it is painted in `color.background.subtle` (the locked `background` binding). Unlike web's `mask-image`, this is a second painted layer, so it is wrong if a consumer ever puts the toolbar on a different surface — there is no token for 'whatever is behind'.
- Toolbar: `fadeWidth` is documented under `overflow: scroll` only, but `menu` renders as `scroll` on this platform. Chose to fade in the menu-as-scroll case too, since it is scrolling; `wrap` never fades.
- Toolbar: the doc does not say whether the fade covers the toolbar's `paddingInline`/`paddingBlock`. Chose to position it over the ScrollView only, inside the padding, so the border and padding stay unclouded.
- Toolbar: `separatorLength` makes the separator shorter than the toolbar, but the doc does not say how it aligns across the axis. Chose `alignSelf: 'center'`, matching the web CSS.
- Toolbar: `size` is documented as applying 'to direct children and to the children of each ToolbarGroup'. Took that as exactly one level — a control inside an arbitrary wrapper (which the doc says 'makes what it holds one bare control') is not reached into, and neither is a group nested inside a group. Matches web's identity check on `element.type`.
- Toolbar: the doc says a Divider is drawn 'between two adjacent groups'. Chose top-level adjacency only — a ToolbarGroup nested inside another ToolbarGroup gets no separator handling, just the inherited layout context. The doc never says whether nesting groups is legal.

## 2026-09-23 14:49 — round 1

- Toolbar: the anatomy's `container` part has no stated element on React Native (the root View carries testID="Toolbar"); I followed Lit, where `container` is the scrollable row inside the host, and put testID="Toolbar.container" on the inner row View (wrap) or the ScrollView (scroll/menu).
- Toolbar: the rn notes list only accessibilityRole=toolbar and accessibilityLabel on the root; RN has no `role="toolbar"` preference stated (unlike ToolbarGroup, which is told to use `role="group"`), so the root keeps accessibilityRole and mirrors the label as aria-label.
- Toolbar: the doc says a ToolbarGroup outside a Toolbar gets 'a development warning' but not whether it fires once per process, once per instance or on every render; I warn once per mounted instance.
- Toolbar: the Keyboard story's pinned `overflow: wrap` exists so that `menu` does not collapse controls on web; on React Native `menu` never collapses anything (it renders as scroll), so pinning it here only keeps the stories identical across platforms.
- Toolbar: the example `compact-actions-with-overflow` passes `overflow: menu` explicitly, so on React Native this story always triggers the once-per-process dev warning and renders as scroll; the doc does not say whether the example should be adjusted for RN, so I kept its args exactly as given.
- Toolbar: fadeWidth's 're-checked on scroll and on size changes' has no threshold; I treat an edge as hidden when content extends more than 1 point past it, to absorb rounding.

## 2026-09-23 14:49 — round 1

- Toolbar: the a11y section lists roving-tabindex and arrow-navigation as required, but the rn notes rule out roving focus and arrow/Home/End handling (Pressable has no key events). I followed the rn notes and implemented neither, so every control is its own stop.
- Toolbar: the rn element props say accessibilityRole=toolbar, while the package digest prefers the `role` prop where a web role exists (Role includes 'toolbar'). I kept accessibilityRole as platforms.rn.props says, and ToolbarGroup uses role="group" as its notes require. The doc should say whether the root should switch to `role`.
- Toolbar: the rn notes don't mention the 'container' anatomy part. On web and Lit it names the scrollable row, so I put testID "Toolbar.container" on the ScrollView (scroll/menu) or the wrapping row View (wrap), not on the root, which keeps testID "Toolbar".
- Toolbar: behavior scenarios have `given` apply on top of the Default story's args, but they don't say whether Default pins `overflow`. Default leaves it unset (the schema default `menu`, rendered as `scroll` with no warning), so only renders-overflow-menu triggers the one-time dev warning.
- Toolbar: `size` recognises Button/SegmentedControl/Select/Search by component identity, but a consumer's wrapper component around one of them is not reached into (the one-level rule). The doc doesn't say whether that should come with a dev warning; none is emitted.
- Toolbar: the fade gradient is drawn from `background` (colorBackgroundSubtle) as the spec says, but a `border` override does not affect it, and the doc doesn't say whether the fade should also clip under the border radius. It sits inside the padding, so the radius is never reached.

## 2026-09-23 19:24 — round 1

- Toolbar: the FormattingToolbar and VerticalToolPalette examples give three Buttons with no overflowLabel, while Default and Keyboard give each an overflowLabel; on React Native the label is never used (no overflow Menu), so I left it off the examples and kept it on Default and Keyboard.
- Toolbar: the 'has-accessible-name' scenario has no rn-specific check; I assert accessibilityRole, accessibilityLabel and aria-label on the root, because the spec doesn't say which name the test should read on native.
- Toolbar: the fade's hiding props are not stated for the decorative gradient View; I applied the package's three-prop convention (aria-hidden, accessibilityElementsHidden, importantForAccessibility=no), which the doc could name.
- Toolbar: the spec asks the Keyboard story to exercise keyboard rules, but on RN there is no roving focus or arrow handling; Keyboard is Default with overflow: wrap and only exercises Tab order and activation.
