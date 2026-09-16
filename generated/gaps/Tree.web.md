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
