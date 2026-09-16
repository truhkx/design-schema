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

## 2026-09-10 19:50 — round 1

- Icon: color binding's doc default is `color.foreground`, but the component behavior described in guidance is `currentColor` inheritance with `color.foreground` only as what inheritance resolves to at the root — implemented the hook with no default set (falls back to `inherit`) rather than defaulting the hook to `var(--color-foreground)`, since a hard default would break free color inheritance from Button/Link/Alert.
- Icon: calendar glyph's hanger-tick geometry uses y=2 to y=5 (to align with the rounded-rect header at y=6.5) instead of the guidance's literal y=1 to y=4, since the literal coordinates would float above the rounded rectangle's top edge.

## 2026-09-12 05:10 — round 1

- Icon: Icon.ts, Icon.stories.ts and Icon.test.ts already existed (Icon predates tools/icon-paths.json, per the package conventions' note that Lit 'redraws several glyphs' today). Only Icon.ts's glyph table needed regenerating to match the JSON verbatim — stories and tests already matched the schema's enum/scenario list and needed no changes.
- Icon: the schema's own 'Content guidelines' section hand-describes different geometry for play/pause/folder/file/list/grid than tools/icon-paths.json (e.g. folder/file paths differ in coordinates, list/grid differ in whether dots/squares are separate filled shapes vs. one stroked path). Per the explicit instruction that icon-paths.json is 'the one table every platform draws from,' I used the JSON's `d` strings verbatim and ignored the schema's prose geometry where they conflict.
- Icon: the JSON's filled-glyph description ('each is one evenodd path whose inner mark is a hole') implies `fill-rule: evenodd` on `.filled`, which the previously-existing Icon.ts CSS omitted; added it since it's required for the status-shape holes (info/success ring, warning triangle, danger octagon) to render correctly with the JSON's single-path data.

## 2026-09-16 01:35 — round 1

- Icon: the package convention says role and aria-label must be plain attributes on the host so the accessible-name tests can read them, but generated/behavior/Icon.lit.test.ts asserts el.shadowRoot.querySelector('[role="img"]') and reads aria-hidden off the shadow glyph. The two cannot both hold. Put them on the <svg> (the gate wins); the host has no role and no aria. The doc should say where a shadow-rendering primitive's role and name live on Lit.
- Icon: anatomy names one part, `glyph`, and the platforms disagree about which element carries it — the web note/React pass put data-part="glyph" on the <path>, the lit note says part="glyph" on the <svg>. Put both part and data-part on the <svg> for Lit, so the same anatomy name resolves to a different element per platform.
- Icon: the overrides contract says every style binding becomes a hook defaulting to its token, but the `color` binding's own description says the default is inherit (currentColor) — and defaulting --ds-icon-color to var(--color-foreground) breaks the documented inheritance inside ds-button/ds-link/ds-alert. Chose `--ds-icon-color: currentColor`; the doc should state the hook default explicitly.
- Icon: the previous Lit generation exposed `strokeWidth` in IconOverridableBinding even though the styles block marks it locked. Removed it from the union and the hook table per the overrides contract (the --ds-icon-stroke-width custom property still exists in the CSS). This narrows a shipped public type; the doc should say whether a locked binding's hook is meant to remain settable from consumer CSS.
- Icon: the lit platform note gives box sizing only for the `inline` case (inline-size/block-size: 1em) and says the host is display: inline-flex, while the `size` binding says font-size on the element and the guidance says non-inline icons are inline-block with vertical-align middle. Chose inline-flex + vertical-align: middle + font-size: var(--ds-icon-size), with a 1em <svg>, matching the web mechanism. Say which of the two the host uses.
- Icon: the Content guidelines still disagree with tools/icon-paths.json, the stated source of truth — the doc names only the four status shapes and `ellipsis` as filled where the JSON also marks `play` and `pause`, its stroke list omits `list`, `grid`, `folder` and `file`, and it describes `list`'s bullets as dots where the JSON draws them as zero-length round-capped strokes. Followed the JSON everywhere, as instructed.
- Icon: the prop description says a label counts 'when set (non-empty)' but the a11y line only distinguishes set from omitted. Treated label="" as decorative (no role, aria-hidden="true"); the doc should say whether an empty string is decorative or an authoring error.
- Icon: 'an unknown `name` renders an empty svg and warns in development' is unreachable from TypeScript (`name` is a required enum) and the doc does not say whether the warning is per render or once per name. Warns on every render, no dedupe.
- Icon: the derived scenario `has-accessible-name` carries no `given`, and the Default story's args are decorative, so nothing would have a name. Set label: 'Accessible name' to exercise the mechanism — the same value the generated gate picks.
- Icon: the examples `decorative-beside-a-label` and `inline-in-running-text` only read as themselves next to text, so those two stories take exactly their `given` as args but add a render that wraps them in a <ds-text>. The doc gives no way to express 'this example needs surrounding text', and the examples contract reads as args-only.
