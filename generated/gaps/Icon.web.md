# Gaps reported while generating Icon for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 18:09 — round 1

- Icon: the styles say status shapes are 'filled ... plus a stroke' but also that 'filled glyphs have no stroke'. A currentColor stroke on a currentColor fill would be invisible, so I drew the inner mark (i, check, !, x) as an evenodd hole in a single filled path with no stroke. The doc should say which it means.
- Icon: strokeWidth binds border.width.focus (2px) but does not say whether that is 2 user units on the 16-grid (scales with size) or 2 screen pixels at every size. 'Stays legible at xs' reads as screen pixels, so I used vector-effect: non-scaling-stroke. This also makes line glyphs heavier than the 1.5-unit strokes the existing components draw; confirm the intended weight.
- Icon: the web note says to render `width height` on the svg, but attributes cannot take a CSS custom property. I render width/height as 1em and set font-size from font.size.{size} in CSS (inline mode inherits font-size). Document this or drop the attribute mention.
- Icon: vertical alignment of a non-inline icon is unspecified for web (Lit says inline-flex host). I used display: inline-block; vertical-align: middle.
- Icon: `dash` and `minus` are both horizontal lines and the doc does not distinguish them. I drew dash shorter (4–12) for the indeterminate-checkbox mark and minus full width (3–13) to pair with plus. Say what the difference is, or merge them.
- Icon: the paths table is told to be exported from Icon.tsx but Lit says it is 'imported by no one else'. I export it from the module (per the web note) and not from the package index. Confirm whether it belongs in the public API.
- Icon: label='' is treated as no label (decorative). The doc should say whether an empty string is an error or decorative.
- Icon: no explicit glyph geometry is given. I reused the existing Disclosure/Link/Breadcrumb/Alert paths for chevrons, external, ellipsis and close so the planned swap is visually neutral; the other shapes are my own drawings on the 16-grid and may need design review.
- Icon: type-check could not be run (no node_modules in the workspace); the files were reviewed by hand against @types/react SVG typings.

## 2026-09-09 18:10 — round 2

- Icon: no Icon changes were needed; both typecheck failures were pre-existing in Landmark and the Preferences demo. The Icon gaps from round one still stand (filled-plus-stroke contradiction on status shapes, screen-pixel vs user-unit stroke width, width/height attributes vs CSS sizing, unspecified vertical alignment, dash vs minus, public export of the paths table, empty-string label).
- Alert: the Preferences demo used a `title` prop but the Alert schema names it `heading`. I changed the demo to `heading`; the demo doc or the Alert schema should agree on the name.
- Landmark: the doc does not say how the web element is chosen at the type level. The forwarded ref is typed HTMLElement; I render through createElement<HTMLAttributes<HTMLElement>, HTMLElement> so a union of tag names does not intersect ref types. Consider stating that the ref is HTMLElement, not the specific element for `as`.

## 2026-09-10 00:37 — round 1

- Icon.tsx/css/stories.tsx pre-existed but lacked `calendar` (added to the enum after this generation was authored), the `data-ds="Icon"` testability hook, and the `overrides` contract; I brought them in line with the current schema/conventions rather than treating the files as already-generated.
- calendar has no path data in any existing component to reuse (unlike chevrons/close/external/ellipsis, which came from Disclosure/Link/Breadcrumb/Alert) — drew a plain outlined rectangle with a header rule and two top tabs on the 16x16 grid as a new line glyph.
- The override contract says overrides change values, never presence, and apply only where the binding is in effect: `inline` sets `font-size: inherit` directly rather than reading `--ds-icon-size`, so an `overrides.size` entry is a documented no-op while `inline` is true — chose to leave the hook set for consistency rather than deleting it in that case.

## 2026-09-10 17:12 — round 1

- Icon: `list`'s dots (x=2, r=1) and `pause`'s bars (3×12) have exact pixel geometry left to interpretation from a verbal description ('a dot at x=2 on each', '3x12 bars') — chose r=1 circles and literal 3×12 rects on the stated coordinates.
- Icon: `folder`/`file` outlines are closed paths (Z) even though the spec calls them 'line glyphs' like open strokes (chevrons, arrows) — closing them is necessary for a recognizable outline shape, but the spec's line/filled dichotomy doesn't explicitly address closed-but-unfilled paths; rendered with fill=none (inherited) so they're outline-only.
- Icon: the pre-existing `styles.strokeWidth` description text lists which glyphs get the focus-ring stroke width but wasn't updated for this generation to mention list/grid/folder/file (menu was already there) — left the schema text as-is since docs are out of scope, but the component code applies the same stroke behavior to all of them via CSS (`path, rect { vector-effect: non-scaling-stroke }`), consistent with them being line glyphs.
- Icon: added the dev-only 'unknown name warns' behavior from the spec, which was missing from the file that existed before this session (it only had 19 of the 26 enum values) — added `isDev` using this package's established `declare const process` shim pattern (seen in Card.tsx, Dialog.tsx, etc.) rather than an ad-hoc inline check.
- Icon: no test file exists yet for this component (per memory, the behavior-scenarios test rollout is progressing target-by-target and hadn't reached Icon) — the 33 behavior scenarios in the prompt are all satisfiable by the current implementation (render + accessible-name via label) but no `.test.tsx` was added since that rollout is tracked as a separate initiative.
