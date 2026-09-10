# Gaps reported while generating Tooltip for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:34 — round 1

- Tooltip: composition maps the `text` anatomy part to Text, but Text's `tone` enum has no value for the locked `color.inverse.foreground` token — using it would force restyling a child (forbidden), so the text renders as a plain `<span data-part="text">` instead.
- Tooltip: `delay: default` is documented as only 'roughly 600ms' (motion.duration.base × 3) with no exact number, and the toolbar 'warm' effect names no duration at all; hardcoded DEFAULT_DELAY_MS=600 and reused it for the warm window since nothing else is given.
- Tooltip: WCAG 1.4.13 'hoverable' requires the pointer be able to cross the `offset` gap onto the popup without it hiding, but no grace period is specified; added an internal 100ms close-grace timer (not a token, not configurable).
- Tooltip: `children` is typed `ReactElement` rather than `ReactNode` (unlike other `content`-typed props) because exactly one element must be cloned to attach aria-describedby/labelledby and hover/focus handlers; if that child already carries its own `ref`, cloning replaces it since there's no ref-merge helper in the package for an arbitrary external ref.
- Tooltip: the doc calls a non-focusable child 'an error' but there is no runtime way to verify focusability of an arbitrary passed element; only a dev warning fires when `children` isn't exactly one element.
- Tooltip: `start`/`end` placement is treated as logical (inline-start/inline-end, flipping physical side by `getComputedStyle(trigger).direction`) since the doc doesn't say how placement interacts with RTL.
- Tooltip: the canonical generated gate test (generated/behavior/Tooltip.web.test.tsx) calls `getByRole('tooltip')` on an unconditioned render with no hover/focus, expecting the popup to always be in the DOM — this contradicts the documented hover/focus-triggered visibility. The already-merged Menu component fails the identical `getByRole('menu')` check for the same reason, so this looks like a pre-existing tools/behavior_tests.py limitation for hover/click-revealed overlays, not something introduced here.

## 2026-09-10 02:16 — round 1

- Tooltip: schema gives no explicit duration for `motion.duration.base` or the toolbar 'warm' window length, so the existing implementation hardcodes DEFAULT_DELAY_MS=600ms (matching the doc's 'roughly 600ms') and reuses that same value for WARM_WINDOW_MS, plus an unspecified 100ms CLOSE_GRACE_MS to let the pointer cross the offset gap onto the popup — none of these three constants are backed by a token.
- Tooltip: schema's `keyboard` block only lists Escape; the web notes also imply hide-on-blur/pointerleave which are not in the `keyboard` table, so those are treated as pointer/focus behavior rather than keyboard actions, per 'implement every key → action exactly as listed and nothing else'.
- Tooltip: anatomy names `trigger` and `popup` as parts, but only `text` gets a `data-part` hook — the trigger is the caller's own cloned element (not an owned node) and the popup is the root itself (already identified by `data-ds="Tooltip"`), so no additional `data-part` was added for either.
