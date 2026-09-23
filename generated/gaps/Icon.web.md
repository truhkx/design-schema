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

## 2026-09-16 01:21 — round 1

- Icon: the `color` binding says the default is "inherit (currentColor)" while the overrides contract says every hook defaults to its token — and defaulting `--ds-icon-color` to `var(--color-foreground)` (what the previous generation did) actively breaks the documented inheritance inside Button/Link/Alert. Chose `--ds-icon-color: currentColor` and documented color.foreground as what that resolves to at the root; the doc should state the hook default explicitly.
- Icon: the guidance's Content guidelines disagree with tools/icon-paths.json, the stated source of truth. The doc names only the four status shapes and `ellipsis` as filled, but the JSON also marks `play` and `pause` filled; the doc's stroke list omits `list`, `grid`, `folder` and `file`, which are line glyphs in the JSON; the doc describes `list`'s bullets as dots where the JSON draws them as zero-length round-capped strokes in the same path. Followed the JSON everywhere.
- Icon: anatomy names one part, `glyph`, but on web the root element IS the svg, and the Lit note puts part="glyph" on the svg because Lit's root is the host. Put `data-part="glyph"` on the `<path>` so the root keeps `data-ds="Icon"` alone; the doc should say which element carries the hook on web.
- Icon: the doc says `overrides.size` is a no-op under `inline` and "the hook is still set" but not how. Implemented by emitting the size modifier class alongside `ds-icon--inline` and ordering the inline rule last, so font-size comes from the surrounding text while the hook keeps its value.
- Icon: the package convention says `...rest` never forwards `className`/`style` to the root, but every existing component in the package accepts and merges both, and Tree.tsx passes `className` to `<Icon>` (a class override on a child, which the same convention forbids). Kept the package idiom — dropping it makes the package typecheck fail — so the convention and the generated package disagree until Tree is regenerated.
- Icon: the examples `decorative-beside-a-label` and `inline-in-running-text` only read as themselves next to text, so those two stories take exactly their `given` as args but add a `render` that wraps them in a Text. Docs tooling flags such stories as `decorated`; the doc gives no way to express "this example needs surrounding text".
- Icon: "An unknown `name` renders an empty svg and warns in development" is unreachable from TypeScript (`name` is a required enum), and the doc does not say whether the warning is per-render or once per name. Warns on every render with no dedupe.

## 2026-09-17 03:49 — round 1

- Icon: `inline` says the glyph falls back to font.size.md when it is 'not inside a Text', but the same prop is also for Link and Button labels, which are not Text. On web the font size is always inherited, so there is always surrounding text to read. I kept `font-size: inherit` for every inline icon and added no md fallback, so an inline icon inside a Link or Button still matches its label. The md fallback reads as React Native only; the prose should say which platforms it applies to.
- Icon: the Lit notes put font-size on the host through `var(--ds-icon-size)` and render the svg at 1em, but the Lit Guidance gives `:host([inline])` its own 1em inline-size/block-size and says nothing about font-size. Not a web issue, noted for the Lit pass.
- Icon: the React Native Guidance section still names `TextNestingContext`, but the rn platform notes say it does not exist and the real export is `TextStyleContext`. The Guidance prose is stale.
- Icon: the web Guidance lists the filled glyphs as 'the four status shapes and the ellipsis'. `tools/icon-paths.json` (and Content guidelines) also mark `play` and `pause` as filled. I followed the JSON.
- Icon: the spec says `...rest` never forwards `style` or `className`, but `IconProps` extends the svg props, which include both. I removed them from the props type. Sibling components such as Button still accept and merge them, so the package is inconsistent until those are regenerated.
- Icon: the 'renders' scenarios have nothing to check beyond the root existing, and none checks `data-part="glyph"` on the root, the unknown-name warning, or that an empty `label` is decorative. The web notes spell all three out, but no scenario covers them, so a regression there passes the gate.

## 2026-09-18 09:56 — round 1

- Icon: the conventions say to 'build its paths table from' tools/icon-paths.json, but the package can't import from tools/ at build time; I kept a verbatim copy of the `d` strings and `filled` flags in the JSON's order. The doc should say whether a copy or a build-time import is intended.
- Icon: the note 'the hook is still set, for consistency' for `overrides.size` under `inline` doesn't say whether the `ds-icon--{size}` modifier class should also stay applied when `inline`; I kept it, so the hook has its token default and `.ds-icon--inline` overrides font-size later in the cascade.
- Icon: the unknown-`name` warning text isn't in `copy`; I kept the existing developer-facing message (`Icon: unknown name "…"`), since dev warnings aren't user-facing copy.
- Icon: the spec says 'Transitions use motion.duration.fast' and 'focus-visible', but Icon has no transition and is never focusable; I added neither. The generic rules should say they don't apply to non-interactive primitives.
- Icon: DecorativeBesideALabel doesn't say what size the wrapping Text should be; I used `size="sm"` to match the icon's `size: sm`.

## 2026-09-18 10:03 — round 2

- Icon: the round-2 gate output (keyboard-run, axe) contains no Icon failure: Icon has no keyboard spec, and logs/playwright.json from this run lists axe violations only for Box, Carousel, Feed, Listbox, Menu, Slider, Splitter and Tabs. I changed no code. The gate harness sends every package-wide failure to each component's round, so a component can be sent back for failures it can't fix; the gate report should be filtered to the component under repair.
- Icon: I couldn't run axe on the Icon stories alone (the script, logs/icon-axe.mjs, needed an approval I didn't have); the no-violation conclusion comes from the full gate report, not a run scoped to Icon.

## 2026-09-18 10:10 — round 3

- Icon: round 3 repeats round 2's gate output word for word; logs/playwright.json (10:09:58) has no Icon/React failure and Icon has no keyboard spec, so there is nothing to fix in Icon. The repair loop keeps sending Icon back for failures in Box, Carousel, Feed, Listbox, Menu, Slider, Splitter and Tabs (axe) and ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip, Tree (keyboard); scope the gate verdict to the component's own stories and specs, or the loop will never end for components with no failures.

## 2026-09-19 01:58 — round 1

- Icon: the spec asks for `Icon.stories.tsx` to cover every enum value, but the Rules name stories `<Prop><Value>` with PascalCase only shown for simple values; for hyphenated names I used `NameChevronRight`, `NameArrowLeft` (hyphen segments capitalised and joined).
- Icon: the web note gives the warning text `Icon: unknown name "<name>"` but not whether anything may follow it; the previous file appended an explanation — I emit exactly the quoted string and the test asserts it verbatim.
- Icon: the spec does not say whether a JavaScript caller's `className`/`style` should be dropped or merged; following the package rule (`...rest` never forwards `style`/`className`), they are overwritten by the component's own class and the overrides style.
- Icon: `overrides.size` sets `--ds-icon-size` inline, which beats the `.ds-icon--{size}` modifier's hook declaration — the spec implies this ('rules read the hook') but never states that an inline override outranks the size modifier; that is what the file does.
- Icon: the inline story's Text element/size are unspecified ('a system Text reading "Read the release notes"'); I used Text's defaults, and `element="span" size="sm"` for DecorativeBesideALabel since the example says the Text is the same size (`sm`) but not which element.

## 2026-09-19 02:06 — round 2

- Icon: round-2 gate `keyboard-run` failed only on other components (Menu, RadioGroup, Search, SegmentedControl, SidePanel, Slider, Stepper, Table, Tabs, Toast, Toolbar, Tooltip, Tree); Icon declares no `keyboard` block and has no keyboard spec, so there is nothing in Icon to fix — left unchanged rather than editing unrelated components from an Icon job.
- Icon: round-2 gate `axe` failed with `Timed out waiting 120000ms from config.webServer`, i.e. Storybook did not start within the time limit before any story was visited (playwright.config.ts starts the react, lit and rn Storybooks together within 120s). Run alone, react Storybook started in time and all 35 Icon/React stories passed axe (wcag2a/2aa/22aa) in light and dark with exactly one `[data-ds=Icon][data-part=glyph]` each (logs/icon-axe.spec.ts). The gate's time limit is outside the component's files; no code change made.

## 2026-09-19 02:24 — round 3

- Icon: round-3 `keyboard-run` failed only on other components (Dialog, Feed, FocusScope, Listbox, Menu, RadioGroup, Search, SegmentedControl, Slider, Stepper, Table, Tabs, Toast, Toolbar, Tooltip, Tree), and the set differs from round 2 (Dialog/Feed/FocusScope/Listbox new; Menu Shift+Tab, Toolbar Home/End, Tree ArrowDown gone), which looks like flakiness. Icon declares no `keyboard` block, and its rendered output is unchanged from HEAD (the only Icon.tsx diff is the text of the dev-only unknown-name warning, now the spec's exact `Icon: unknown name "<name>"`), so composed Icons cannot have changed those results. No code change.
- Icon: round-3 `axe` timed out at 900s. That gate visits every story across the Storybooks, so its run time is the whole package's, not Icon's. Scoped to Icon/React (35 stories × light/dark, wcag2a/2aa/22aa via logs/icon-axe.spec.ts) it passes with zero violations. No code change; the gate's time limit is outside the component's files.

## 2026-09-23 13:40 — round 1

- Icon: the web note asks for `stroke-width: var(--border-width-focus)` and `vector-effect` on paths in CSS, while the strokeWidth binding asks for a `--ds-icon-stroke-width` hook; kept the hook (defaulting to the token) and read it in `stroke-width` on the root svg, which the paths inherit.
- Icon: the dev-warning guard needs a `declare const process` shim; if the bundler does not define `process`, the unknown-name warning is skipped entirely. The spec says 'warns on every render' without saying what to do when NODE_ENV cannot be read; chose to stay silent.
- Icon: the spec does not say whether IconName/IconSize/IconOverridableBinding are exported types; they are exported from index.ts (the `paths` table is not, as the note requires).
- Icon: `Object.hasOwn` guards a prototype key (`name="toString"`) as unknown; the spec's unknown-name rule does not mention prototype keys.
