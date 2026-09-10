# Gaps reported while generating Breadcrumb for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:58 — round 1

- Breadcrumb: the previously-generated file predated the data-ds/data-part/overrides conventions (no testability hooks, no overrides prop, and an inline hand-drawn SVG for the ellipsis instead of the system Icon component). Brought it up to current convention: added data-ds="Breadcrumb", data-part on nav/list/item/link/current, an overrides prop for the non-locked bindings (gap, fontFamily, fontSize, fontWeight, lineHeight), CSS hooks (--ds-breadcrumb-*) for every binding including the locked ones, and swapped the inline SVG for <Icon name="ellipsis" inline />.
- Breadcrumb: the schema's `styles` block gives a token only for the current-page text (color.foreground, locked as currentColor) and the separator (color.foreground.muted); it says nothing about the color of an ancestor item that has no href and renders as plain (non-link) text. Kept the existing choice of reusing currentColor (color.foreground) for that plain-text case, since it isn't the current page but is also not decorative punctuation like the separator.
