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
