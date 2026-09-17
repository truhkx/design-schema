# Gaps reported while generating Tree for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 14:31 — round 1

- Tree: platform notes show `<ul role="tree" data-ds="Tree">` as the root, but `showLabel` needs a heading above the tree; used an outer wrapping `<div data-ds="Tree" data-part="container">` holding the optional Heading plus the ul, matching the 'root carries data-ds' convention and TreeGrid's own wrapper-div precedent rather than putting data-ds on the ul itself.
- Tree: a11y line says 'aria-label ... on the tree' unconditionally, but when `showLabel` renders a visible Heading, used `aria-labelledby` pointing to it instead (falling back to `aria-label` when the label is invisible) to avoid the name being announced twice.
- Tree: no `headingLevel`-style prop is given for the `showLabel` heading; hardcoded `level={2} size="md"`, the same choice TreeGrid makes for its own caption.
- Tree: the `styles` block gives no token for the decorative checkbox glyph's box in `multiple` mode (only `checkboxGap`, the gap beside it); reused the same control tokens Checkbox.tsx itself draws from (`color.control.border`/`background`/`selectedBackground`, `radius.sm`) since none were specified here.
- Tree: `IconName` has no folder/file-type glyphs even though the guidance's own example is 'icon consistently per node type (folder/file)'; `TreeNode.icon` is still typed as `IconName` verbatim per the schema shape, but the shared icon set can't express that guidance — stories mostly omit node icons as a result.
- Tree: platform notes specify a type-ahead buffer window of 'motion.duration.base × 5', which is a CSS token, not a value usable in a JS `setTimeout`; used a literal 500ms, matching Listbox's own precedent for the same problem.
- Tree: 'Ctrl+A selects all visible nodes' was read as the currently flattened, non-disabled, non-placeholder node list at the current expansion state (not every id in the full recursive tree).
- Tree: `selected`/`defaultSelected`/`onSelectionChange` are `string[]` per the schema even under `selectable: single`, so single-select still stores/reports a one-element array rather than a bare string; kept as specified.
- Tree: the schema's `keyboard` block has no mouse/pointer rules; added click-to-select/toggle, double-click-to-activate, and a chevron click that toggles expansion without changing selection, since a tree with no pointer behavior would be unusable — this is an inferred addition beyond the literal spec.

## 2026-09-10 19:22 — round 1

- Tree: platform notes show `<ul role="tree">` as the root, but `showLabel` needs a heading above the tree; used an outer wrapping `<div data-ds="Tree" data-part="container">` holding the optional Heading plus the `<ul>`, matching the 'root carries data-ds' convention and TreeGrid's own wrapper-div precedent rather than putting data-ds on the `<ul>` itself.
- Tree: a11y line says 'aria-label ... on the tree' unconditionally, but when `showLabel` renders a visible Heading, used `aria-labelledby` pointing to it instead (falling back to `aria-label` when the label is invisible) to avoid the name being announced twice.
- Tree: `labelSelectedWeight` is described as forwarded to 'the label Text' as `overrides.fontWeight`, but nodes with `href` render their label as a `Link`, which has no font-weight prop or overridable `fontWeight` binding at all; a selected href node's label therefore cannot pick up the weight change (non-href labels do, via `Text`'s `weight`/`overrides.fontWeight`). Left unstyled for the Link case rather than restyling it via className, per the 'never restyle a child' composition rule — Link's schema would need to grow a weight/emphasis lever to close this.
- Tree: 'Ctrl+A selects all visible nodes' was read as the currently flattened, non-disabled, non-placeholder node list at the current expansion state (not every id in the full recursive tree).
- Tree: `selected`/`defaultSelected`/`onSelectionChange` are `string[]` per the schema even under `selectable: single`, so single-select still stores/reports a one-element array rather than a bare string; kept as specified.

## 2026-09-16 12:21 — round 1

- Tree: `defaultExpanded: ["*"]` vs `onExpand` fires: user — expanding every node at mount would open lazy nodes that never get an onExpand and show 'Loading' forever. Chose: `*` opens every loaded parent only; lazy nodes stay closed until a user expands them.
- Tree: a lazy id listed in `defaultExpanded`/`expanded` renders the loading placeholder but, since onExpand fires only for user sources, never requests children. Chose to leave it so; the doc should say whether onExpand also fires for initially expanded lazy nodes.
- Tree: web attributes list `aria-activedescendant`, but the notes and guidance require roving tabindex with DOM focus on the item. Chose roving tabindex; aria-activedescendant is not rendered.
- Tree: `onSelectionChange` timing is unstated for no-op changes (Space on the already-selected node, selectOnFocus landing on the selected node). Chose to fire only when the id set actually changes.
- Tree: selectChildren cascade semantics are underspecified — whether a parent id belongs in `selected` when all its children are selected, whether disabled descendants are cascaded, and how lazy (unloaded) children count. Chose: toggling cascades to enabled loaded descendants; a parent is added to/removed from `selected` exactly when all its enabled children are selected; its checked state is derived from them (mixed when partial).
- Tree: order of ids in emitted arrays is unspecified. Chose document (tree) order for selection; expansion keeps insertion order.
- Tree: Shift+ArrowDown/Up with selectChildren — unclear whether 'adds it to the selection' cascades. Chose to cascade like Space. Outside `multiple`, Shift+arrows behave as plain arrows.
- Tree: Control+a — only Control is listed; Meta (macOS Cmd) is not handled. Chose ctrlKey only, per the table.
- Tree: disabled parents — 'skipped by arrows, not selectable' does not say whether they can expand. Chose: the chevron still toggles a disabled parent (without focusing it) so enabled children stay reachable; keyboard cannot reach it.
- Tree: `*` 'opens every sibling of the focused node' — chose to include the focused node itself and lazy siblings (which fire onExpand on first open).
- Tree: double-click fires two clicks first, which in multiple mode toggles selection twice before activating. Not specified; left as native event order.
- Tree: the lazy loading placeholder's role is unspecified. Chose an aria-disabled `treeitem` (a `group` must contain treeitems) that is not navigable and carries no data-part, with aria-busy on the parent.
- Tree: the ul role=tree has no anatomy part name (container is the outer div). Chose no data-part on it.
- Tree: `rowHeight`/`minTarget`/`expandButtonSize` are all size.target.min and locked, but Button `sm iconOnly` exposes no size override and composition lists no forwards to it. Chose a wrapper span data-part=expandButton sized to the target around an unmodified Button.
- Tree: Heading and Button overwrite `data-part` from `...rest`, so their part hooks (`heading`, `expandButton`) sit on a wrapper; Text and Link keep `data-part` on the composed element.
- Tree: spacing between the Heading and the tree has no binding (Heading's own marginBlockEnd applies, and composition forwards only headingSize). Left the Heading default.
- Tree: `checkboxGap` is 'between the checkbox and the label' while `rowGap` is between chevron, icon, label and badge. Chose nested flex groups: checkboxGap between checkbox and (icon + label), rowGap elsewhere.
- Tree: `iconColor` and `badgeColor` are locked with no forwards to Icon/Text. Chose iconColor via currentColor on the icon wrapper span and badgeColor via Text `tone="muted"`.
- Tree: `selectedCount` has no plural forms and no locale source. Chose plain `{count}` interpolation in a visually hidden role=status span rendered only in multiple mode.
- Tree: the RTL direction of the chevron and the start-edge selection bar is not specified. Chose to mirror both under :dir(rtl).
- Tree: Link.tsx still carries a comment that it accepts className 'because Tree passes one'; the regenerated Tree no longer passes a className to Link.

## 2026-09-17 15:11 — round 1

- Tree: `fontFamily`/`fontSize`/`lineHeight` appear both as root-level style bindings (no `part:` key, so they style the container) and as composition forwards to the label Text. The doc never says which wins. Chose both: root hooks set the container's font, and the resolved value (override or default token) is always forwarded to the label Text's `overrides`.
- Tree: the doc requires the href Link to nest inside the label Text, but Link renders its own inner `<span data-part="label">`. An href node therefore has two nested `[data-part="label"]` elements. Chose to keep the tree's Text as the outer one (a querySelector resolves to it first), but the part locator is ambiguous on navigation trees and Link's inner part name should probably change.
- Tree: a composed Link inside a treeitem is natively focusable, which breaks the documented 'one tab stop'. The doc never mentions the link's tabindex. Chose `tabIndex={-1}` on the composed Link so only the treeitem is tabbable and Enter clicks the anchor programmatically.
- Tree: Ctrl+A is 'Selects every visible, enabled node at the current expansion state' — it does not say whether nodes selected inside a collapsed branch are dropped. Chose a union (never deselects what is not visible), since deselecting invisible nodes is destructive and unrecoverable by the same key.
- Tree: type-ahead is 'any printable character' but `*` and Space are separate bindings that are also printable. Chose: `*` and Space keep their listed meanings and never enter the buffer; every other single-character key types.
- Tree: the doc does not say where type-ahead starts searching or whether a repeated first character cycles. Chose the Listbox rule: a fresh one-character buffer searches from the node *after* the focused one; a longer buffer may re-match the focused node.
- Tree: `copy.selectedCount` is 'announced on every user selection change' in multiple mode, but its text is derived from the selection, so the region also has content at mount. Chose a permanently rendered visually-hidden `role="status"` (multiple mode only) holding the count; nothing forces an announcement on mount. With `nodes: []` it reads '0 selected'.
- Tree: `expandButtonSize` is locked at `size.target.min` on the tree-owned wrapper, but the web guidance says the chevron Button is `size="sm"` — a sm Button is smaller than that. Chose the wrapper at `size.target.min` on both axes with the sm ghost Button centred inside it, so the 24px target is the wrapper, not the Button.
- Tree: `guideLine`/`guideLineWidth` give tokens but no geometry for the guide lines. Chose a `::before` on each `role="group"` positioned at `rowPaddingInline + indent * level + size.target.min / 2` (the parent chevron's centre), using a `--ds-tree-level` custom property inherited from the parent treeitem.
- Tree: `rowSelectedBorder` is 'drawn over the row (absolutely positioned at the logical start, mirrored in RTL)' but the anatomy declares no part for it and no `data-part` hook. Chose an inset `box-shadow` on the row, flipped under `:dir(rtl)` — visually identical, no extra element, but not literally an absolutely positioned box.
- Tree: a disabled parent's chevron is a disabled Button and ArrowLeft/Right are 'the keyboard path', but disabled nodes are also skipped by arrow navigation — so a disabled parent can never be expanded by any means. Implemented as written; the doc's only mitigation is the warning not to disable a parent whose children must stay reachable. Worth stating as a hard rule rather than advice.
- Tree: the doc does not say what the tab stop is after focus leaves the tree and returns. Chose to forget the last focused node on blur-out, so re-entry follows the documented Tab rule (the selected node, else the first) rather than restoring where the user was.
- Tree: `defaultExpanded: ["*"]` uses `"*"` as a sentinel, so a node whose id is literally `"*"` cannot be expanded by default. Chose to treat `"*"` as the sentinel unconditionally; the doc should either reserve the id or use a separate prop.
