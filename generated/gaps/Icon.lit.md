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

## 2026-09-10 00:39 — round 1

- Icon: the schema's Overrides section lists `color` as overridable defaulting to `color.foreground`, but the component's own styles.color description says the default is `currentColor`/inherit (so a Button/Link/Alert colors the icon for free) and `color.foreground` is only the eventual fallback once inheritance resolves to the root. Implemented `color: var(--ds-icon-color, inherit)` (hook unset by default, so ambient inheritance wins) rather than defaulting the hook to `var(--color-foreground)`, which would have broken composition inside colored ancestors.
- Icon: `name` was previously missing the `calendar` enum value and its glyph (present in this schema's `name.values` and behavior scenarios but absent from the existing implementation) — added a simple line-glyph calendar (body + two top tabs + header rule) on the 16×16 grid; no reference design was given for its exact strokes.
- Icon: scenario `has-accessible-name` has no `given`, but the Default story's args are decorative (`label: undefined`), so asserting an accessible name against the defaults would fail. Set `label: 'Warning: over quota'` (the Labelled story's value) explicitly in the test to exercise the a11y.requires mechanism instead.
- Icon: the general package convention requires `data-ds="<Name>"` and an `overrides` property/hooks on every component touched; the existing Icon.ts predated that convention (no `data-ds`, no CSS custom-property hooks, no `overrides`). Added `data-ds="Icon"`, hooks `--ds-icon-size`/`--ds-icon-color`/`--ds-icon-stroke-width`, and the `overrides` property/`IconOverridableBinding` type to bring it in line — this touches more of the file than the schema diff alone (just `calendar`) would require.

## 2026-09-10 17:12 — round 1

- Icon: 'list' item dots and 'grid' squares/'pause' bars aren't explicitly marked line vs. filled in the content guidelines — rendered the dots and pause bars as filled (class="filled") since a stroked 1px-radius circle/thin rect would be nearly invisible at xs, and grid squares as unfilled outlines (consistent with 'outlined squares' wording) but this choice wasn't stated for list/pause explicitly, only inferred from 'filled' precedent (ellipsis dots, status shapes).
