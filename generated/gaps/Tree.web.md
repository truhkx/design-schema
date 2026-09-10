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
