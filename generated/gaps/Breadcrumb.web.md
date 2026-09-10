# Gaps reported while generating Breadcrumb for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:58 — round 1

- Breadcrumb: the previously-generated file predated the data-ds/data-part/overrides conventions (no testability hooks, no overrides prop, and an inline hand-drawn SVG for the ellipsis instead of the system Icon component). Brought it up to current convention: added data-ds="Breadcrumb", data-part on nav/list/item/link/current, an overrides prop for the non-locked bindings (gap, fontFamily, fontSize, fontWeight, lineHeight), CSS hooks (--ds-breadcrumb-*) for every binding including the locked ones, and swapped the inline SVG for <Icon name="ellipsis" inline />.
- Breadcrumb: the schema's `styles` block gives a token only for the current-page text (color.foreground, locked as currentColor) and the separator (color.foreground.muted); it says nothing about the color of an ancestor item that has no href and renders as plain (non-link) text. Kept the existing choice of reusing currentColor (color.foreground) for that plain-text case, since it isn't the current page but is also not decorative punctuation like the separator.

## 2026-09-10 17:49 — round 1

- Breadcrumb: `itemColor` (color.foreground.muted, for an ancestor without href) was previously wired to the same CSS hook as `currentColor` (color.foreground); added a separate `--ds-breadcrumb-item-color` hook so the two locked bindings are independently themeable/contrast-checkable as the schema lists them distinctly.
- Breadcrumb: spec doesn't say whether the ellipsis button needs its own override-hook-bearing class; kept the existing `ds-breadcrumb__expand` marker class with no CSS rules (Button styles itself), since giving it real rules would count as restyling a composed child.
