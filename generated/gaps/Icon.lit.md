# Gaps reported while generating Icon for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 18:13 — round 1

- Icon: the styles section says filled glyphs (status shapes, ellipsis) have no stroke, but the web platform note says status shapes are a filled circle/polygon 'plus a stroke'. Chose no stroke: outlined ring plus inner mark drawn entirely as fill, reusing the existing Alert path data so the shapes match.
- Icon: the schema describes `danger` as octagon-x, but the existing Alert glyph is an octagon with an exclamation mark. Followed the schema (octagon with an x); Alert will change shape when it is regenerated to compose ds-icon.
- Icon: the strokeWidth binding lists only check, chevrons, close, plus and minus as line glyphs. `dash`, `external`, `search`, `arrow-right` and `arrow-left` are unclassified; drew them as stroked line glyphs too.
- Icon: `dash` and `minus` are both a horizontal line with no stated difference. Drew `dash` shorter (4–12, the indeterminate-checkbox mark) and `minus` full width (3–13, matching `plus`).
- Icon: 'stroke thickness is border.width.focus' is ambiguous between 2 user units on the 16-grid (scaling with size) and 2 CSS px at every size. Chose fixed px via vector-effect: non-scaling-stroke because the a11y section says the focus-ring width keeps glyphs legible at xs.
- Icon: the general rules ask for delegatesFocus for every a11y.requires item, but accessible-name here is met by the svg itself and the icon must never receive focus (focusable=false). Omitted delegatesFocus.
- Icon: no guidance on what to render for an unknown or missing `name`. Rendered an empty svg and logged a console.warn under import.meta.env.DEV.
- Icon: no `hidden` behaviour or csspart is specified. Followed package convention: :host([hidden]) { display: none } and part="glyph" on the svg.
- Icon: an empty-string `label` is treated as no label (decorative), since the schema only distinguishes set vs omitted.
