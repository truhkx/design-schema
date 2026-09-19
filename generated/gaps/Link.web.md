# Gaps reported while generating Link for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:10 — round 1

- Link: the package now has an Icon component with a documented 'external' glyph, but the schema instructions for this pass say 'there is no Icon component yet' and to draw an inline SVG. Kept the hand-drawn inline SVG (identical path data to Icon's 'external' glyph) instead of switching to <Icon>, because Icon.css hard-resets --ds-icon-color to color.foreground on the icon element itself, which would break the currentColor inheritance Link relies on for tone/hover/visited color changes on the external icon. Flagging in case Icon should later be fixed to accept ambient currentColor so composite components can use it directly.
- Link: pre-existing Link.tsx/.css predated the data-ds/data-part/overrides conventions now used by newer components (Button, Icon, etc.) — added data-ds="Link" on the root, data-part="externalIcon" on the decorative icon span, and a LinkOverridableBinding overrides mechanism (underlineThickness, underlineOffset, externalIconGap, transition hooked as --ds-link-*), leaving color/colorHover/colorVisited/focusRing/focusRingWidth/focusRingRadius locked as the schema specifies. No spec ambiguity here, just bringing the file current.
- Link.stories.tsx was already complete (Default, both tone values, external, download, inline-in-text) and needed no changes.

## 2026-09-10 17:23 — round 1

- Link already existed in the package (and index.ts already exported it) with props/tone/download/overrides/copy all matching the schema; the only defect was the external-mark icon being hand-drawn as an inline <svg> instead of composing the shared Icon component (the rules require Icon for every named glyph and forbid inline SVGs) — replaced `<svg>...</svg>` with `<Icon name="external" inline />` inside the existing `data-part="externalIcon"` wrapper, and simplified Link.css's `.ds-link__external-icon` rule since Icon's `inline` variant already handles 1em sizing and baseline alignment.

## 2026-09-16 03:58 — round 1

- Link: Tree (packages/react/src/Tree.tsx:627) passes className="ds-tree__label" to Link, and Tree.css sets text-decoration: none and color: inherit on it. That restyles a child, and the Link guidance says never to remove the underline. Removing className from LinkProps broke the typecheck, so Link still accepts className and merges it onto the root (style is no longer accepted). The Tree doc needs a sanctioned way to show an href node (no underline inside a tree row, or tone: inherit plus an underline exception), and then Link can drop className.
- Link: Tree also passes data-part="label" to Link, which clashes with Link's own `anchor` part on the same element. I let the parent's data-part win. The docs don't say which part name wins when a composed part is the child's root.
- Link: the cancelable onPress contract says the handler may return false, but the web event name is the native onClick, whose React type returns void. I typed it `(event) => void | boolean` and call preventDefault on false.
- Link: the `externalIcon` part is both a styled part (externalIconGap) and the Icon itself. I wrap Icon in a span carrying data-part="externalIcon" so the gap is a margin on Link's own element rather than on the child. The spec doesn't say whether the part is the Icon or a wrapper, and the rule that spacing between siblings is never a margin has no Stack to use inline.
- Link: the Web platform note says the icon is 'an inline 1em SVG with aria-hidden', but the rules say to use the system Icon. I used <Icon name="external" inline />, which hides itself because it has no label, so no hand-drawn SVG. Whether Icon's inline size is 1em of the surrounding text on web isn't confirmed by the Link doc.
- Link: the tone binding has no style-binding entry. `inherit` sets color, hover and visited to currentColor, so colorHover and colorVisited (locked) don't apply under inherit. The schema doesn't say the locked color bindings are turned off by tone: inherit.
- Link: the scenario `external-link-announces-that-it-leaves` has an expectation `copy: externalSuffix` with no matcher. I tested it as the anchor's textContent containing the suffix, alongside the accessible-name check.
- Link: examples `inline-in-a-paragraph` and `inside-muted-text` describe the link inside body or muted text, but `given` has only Link args. The stories wrap the link in <Text> / <Text tone="muted"> with filler sentence text that isn't schema copy, because the examples don't specify the surrounding content.
- Link: colorHover's description says 'Pointer hover and active state', but the binding's state is only `hover`. I applied it to :hover and :active.

## 2026-09-17 04:20 — round 1

- Link: web notes say Link's `data-part="anchor"` wins over a parent's, but Breadcrumb (`data-part="link"`) and Tree (`data-part="link"`, and Tree.tsx activated its link with `querySelector('[data-part="link"]')`) both stamp a part onto Link's root. I made Link's hooks win and changed Tree's lookup to `[data-ds="Link"]`; the Breadcrumb and Tree docs should name a wrapper element for their `link` part, or drop it.
- Link: web notes say Link accepts no `className`, but the old code kept `className` with a comment saying Tree passed one. Tree no longer does, so I removed it from the props type (`Omit`).
- Link: `colorHover` says 'pointer hover only (not :active)'. I used a plain `:hover` rule with no `@media (hover: hover)` guard, so touch browsers that apply sticky `:hover` after a tap will show the hover color. The doc doesn't say whether that guard is wanted.
- Link: `focusRingRadius` is a border radius on an inline anchor, but the doc gives no `outline-offset` for the ring. I used `outline-offset: var(--border-width-focus)`, the same token as the ring width.
- Link: `copy.external` ('opens in new tab') is only used on SwiftUI. On web it is kept only as a comment, and the doc doesn't say that web leaves it unused.
- Link: the Default story args are not given anywhere. I used the `inline-in-a-paragraph` values (href `/billing/history`, label `View the billing history`), so the has-accessible-name and renders scenarios run against those.
- Link: the `external` and `download` booleans get no story from the 'one story per enum value' rule. I added `External` and `Download` state stories alongside the `ExternalDestination` and `DownloadableFile` example stories, which cover the same states.

## 2026-09-18 19:13 — round 1

- Link: locked bindings (color, colorHover, colorVisited, focusRing*) — the overrides section says every binding becomes a `--ds-link-*` hook and rules read the hook, but it does not say whether locked bindings get hooks at all; chose to keep hooks for them (not settable through `overrides`, still settable from consumer CSS), which lets consumer CSS change an accessibility-bearing color. The doc should say whether locked bindings have hooks.
- Link: tone inherit — the spec says the color bindings are 'not applied' but not how the rest color is written on web; chose `color: inherit` on the root and scoped the color/:visited/:hover rules to `.ds-link--tone-default`, rather than setting the hooks to currentColor.
- Link: the `transition` binding says only 'Color transition on hover'; chose to transition `color` only (not text-decoration-color, which already follows currentColor).
- Link: externalIconGap override — 'apply an override only where the binding is in effect' was read as skipping the inline hook when `external` is false; the doc does not say this explicitly for Link.
- Link: example stories get their `given` as args, but Storybook merges meta.args (external: false, tone: default, download: false) underneath, so the stories do not have 'exactly' the given args; left the meta defaults in place since they match the schema defaults.

## 2026-09-18 19:20 — round 2

- Link: round-2 gate failures are all in other components (keyboard: ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip, Tree; axe: Feed, Listbox, Menu, Splitter, Tabs in the visible output). Link has no keyboard block and therefore no keyboard spec, and the axe output was truncated, so there is no evidence of a Link violation; no Link code was changed. The gate report should be filtered to the component under generation, or include the untruncated failure list, so a per-component round can act on it.
- Link: could not re-run axe on the Link stories in this session (running node requires approval); logs/link-axe.mjs runs the gate's axe options against Link/React stories only, for the owner to confirm.

## 2026-09-18 19:26 — round 3

- Link: rounds 2 and 3 were rejected by gates whose every failure is in another component. The complete axe lists in test-results/tests-gates-axe-*/error-context.md (light: Carousel, Feed, Listbox, Slider, Splitter; dark: Carousel, Feed, Listbox, Menu, Splitter, Tabs) and the 15 keyboard-web failures (ActionSheet, Combobox, DatePicker, Listbox, Menu, Search, Slider, Tabs, Toast, Tooltip, Tree) contain no Link story or spec, and Link has no keyboard block. No Link code changed. The repair loop should scope keyboard-run and axe failures to the component under generation (or diff against a pre-change baseline), otherwise a per-component round can never pass and keeps being retried.
