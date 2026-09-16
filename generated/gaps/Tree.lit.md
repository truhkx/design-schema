# Gaps reported while generating Tree for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 14:34 — round 1

- showGuides defaults to true, but platforms.lit.reflect literally names the attribute 'show-guides'; per this package's own negated-boolean-attribute convention (a true-default boolean can't be a positively-named attribute) I implemented it as 'hide-guides' instead, following the doc's own 'showValue -> hide-value' precedent — this contradicts the schema's literal reflect-list entry.
- labelSelectedWeight and badgeSize are declared overridable, but the composed <ds-text> label/badge expose only fixed enum props (weight, size), not free TokenRef overrides, so Tree's overrides prop can't actually push an arbitrary token into their rendered font-weight/font-size. The CSS custom-property hooks exist on the host (the documented 'escape hatch'), and the correct default appearance is produced via Text's own weight/size props, but the override path is inert until Text.ts gains a matching override binding.
- The multiple-mode 'Checkbox glyph' (doc: 'not the Checkbox component: the treeitem itself is the control') has no dedicated style binding for its box size/border/fill in the schema's styles list. I reused the locked iconColor token for the unchecked border, color.control.selectedBackground (same token as rowSelectedBorder) for the checked fill, and rowRadius for its corner radius.
- Mouse click semantics are unspecified (the doc only defines keyboard behavior and 'double-click' for activate). I chose: single click focuses + selects/toggles per selectable mode (mirroring Enter/Space), double-click activates.
- composition only lists expandButton: Button, icon: Icon, label: Text, omitting Link even though href nodes require composing it (per anatomy/platform notes), and omitting an explicit mapping for the badge anatomy part (rendered with Text, consistent with label).
- The empty state (nodes: [], copy.empty) is rendered as a single <li role="presentation"> inside role="tree" since the ARIA treeview pattern has no defined 'empty' treeitem shape; role=presentation keeps it out of the accessibility tree rather than exposing an invalid owned child.
- ArrowRight into an open parent's 'first child': when the literal first child is disabled, focus lands on the next non-disabled descendant instead (via the disabled-skipping navigable list), since the doc's 'first child' rule and its separate 'disabled nodes ... skipped by arrows' rule aren't reconciled.
- Shift+ArrowDown/Up ('extends selection to the next/previous node') is implemented as adding both the currently-focused and the newly-focused node to the existing selection, not a full anchor-based contiguous range, since the doc doesn't specify exact range semantics beyond that phrase.

## 2026-09-10 19:10 — round 1

- Tree: schema names both a `label` and a `link` anatomy part but never distinguishes when each applies; inferred that `label` is the ds-text-rendered node label (no `href`) and `link` is the ds-link-rendered one (`href` set), and split the previously-shared `part="label"` accordingly.
- Tree: `labelSelectedWeight` is documented as forwarded to the label Text's `overrides.fontWeight`, but ds-link (used for `href` nodes) exposes no font-weight override hook at all, so a selected navigation node's label cannot be bolded via this binding — only non-href (ds-text) labels respond to `--ds-tree-label-selected-weight`.
- Tree: `headingSize` says it's 'forwarded as overrides.fontSize' to the composed Heading; implemented by setting ds-heading's own `--ds-heading-font-size` custom property from the Tree's `--ds-tree-heading-size` hook (CSS-level forwarding) rather than calling the Heading's `overrides` prop with a TokenRef, since the latter would freeze the value and defeat runtime CSS overriding of the hook — same pattern already used by Divider for its composed Text.

## 2026-09-16 12:27 — round 1

- Tree: event payloads say `ids`/`id` keys (and the declared contract says detail has exactly the listed keys) but each description says 'as a bare array'; chose detail = the bare array / bare id string, matching TreeGrid in the same batch.
- Tree: timing order of `expand` vs `expand-change` on first expand of a lazy node is not given; chose expand first, then expand-change (as TreeGrid).
- Tree: label Text composition forwards only labelSelectedWeight, but Text defaults to size md, which would override the tree's own fontSize binding (font.size.sm); chose to also forward the tree's fontSize to the label Text's overrides.fontSize.
- Tree: expandButtonSize (size.target.min, locked) targets a composed Button that has no size override; chose a min-inline-size layout floor on the ds-button host and left its internals to Button.
- Tree: checkboxGap is 'between the checkbox and the label' but rowGap already separates every row child, and the icon may sit between them; chose margin-inline-end = checkboxGap - rowGap on the checkbox so the effective gap equals checkboxGap.
- Tree: Enter on an href node — spec says it 'follows href' and web notes say 'Enter activates it'; chose to programmatically click the composed ds-link's anchor (so consumer click routing still sees it) and not fire `activate`; with single it also selects first.
- Tree: the loading placeholder is 'a placeholder item with copy.loading' but its role is not specified; chose `li role=none` (not a focusable treeitem) inside the group, with aria-busy on the parent treeitem, and no Text composition since emptyState is the only listed Text for status copy.
- Tree: selectedCount live region — when it announces is not stated beyond 'in multiple mode the count is announced'; chose to announce on every user selection change in multiple mode only, and not to announce expand/collapse.
- Tree: Control+a — spec says Control only; Meta+A (macOS) is not listed, so it is not handled.
- Tree: type-ahead is listed as a-z; digits and other printable characters are ignored even though labels may start with them.
- Tree: ArrowLeft 'moves to the parent' does not say what happens when the parent is disabled (disabled nodes are 'skipped by arrows'); chose to stay put.
- Tree: `*` 'opens every sibling' does not say whether disabled siblings open; chose to skip disabled siblings.
- Tree: whether disabled nodes can be expanded by pointer is unstated; the chevron is disabled and clicks on a disabled row do nothing.
- Tree: in multiple mode with selectChildren, whether a parent's own id is kept in `selected` is unstated; chose to add a parent id when all its descendants are selected and remove it (and all ancestor ids) when any descendant is unchecked, deriving the parent's aria-checked from its descendants.
- Tree: whether the selected fill/bar applies to aria-checked nodes in multiple mode is unstated; chose to apply it to aria-checked=true as well.
- Tree: the tree element itself (ul role=tree) has no anatomy name (container is the wrapping div), so tests and styles cannot address it by data-part; tests query [role=tree].
- Tree: emptyState Text props (tone, element) are not given; chose default Text with no props.
- Tree: forwarded bindings (labelSelectedWeight, headingSize, badgeSize) reach children only via the `overrides` property; a consumer setting the --ds-tree-* hook from CSS for those three does not reach the child, since child overrides accept TokenRef only.
