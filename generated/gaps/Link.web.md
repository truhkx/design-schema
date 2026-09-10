# Gaps reported while generating Link for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:10 — round 1

- Link: the package now has an Icon component with a documented 'external' glyph, but the schema instructions for this pass say 'there is no Icon component yet' and to draw an inline SVG. Kept the hand-drawn inline SVG (identical path data to Icon's 'external' glyph) instead of switching to <Icon>, because Icon.css hard-resets --ds-icon-color to color.foreground on the icon element itself, which would break the currentColor inheritance Link relies on for tone/hover/visited color changes on the external icon. Flagging in case Icon should later be fixed to accept ambient currentColor so composite components can use it directly.
- Link: pre-existing Link.tsx/.css predated the data-ds/data-part/overrides conventions now used by newer components (Button, Icon, etc.) — added data-ds="Link" on the root, data-part="externalIcon" on the decorative icon span, and a LinkOverridableBinding overrides mechanism (underlineThickness, underlineOffset, externalIconGap, transition hooked as --ds-link-*), leaving color/colorHover/colorVisited/focusRing/focusRingWidth/focusRingRadius locked as the schema specifies. No spec ambiguity here, just bringing the file current.
- Link.stories.tsx was already complete (Default, both tone values, external, download, inline-in-text) and needed no changes.

## 2026-09-10 17:23 — round 1

- Link already existed in the package (and index.ts already exported it) with props/tone/download/overrides/copy all matching the schema; the only defect was the external-mark icon being hand-drawn as an inline <svg> instead of composing the shared Icon component (the rules require Icon for every named glyph and forbid inline SVGs) — replaced `<svg>...</svg>` with `<Icon name="external" inline />` inside the existing `data-part="externalIcon"` wrapper, and simplified Link.css's `.ds-link__external-icon` rule since Icon's `inline` variant already handles 1em sizing and baseline alignment.
