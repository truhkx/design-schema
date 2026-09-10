# Gaps reported while generating Stepper for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 19:18 — round 1

- Stepper: schema has one `transition` binding but four discrete indicator states (complete/current/upcoming/error) plus a connector; animating all of it unambiguously wasn't specified, so only the connector cross-fades between `connector` and `connectorComplete` over `transition` — the indicator itself switches instantly, same as this package's other multi-state (not binary) indicators.
- Stepper: when a step's explicit `status: 'error'` overrides the position that equals `current`, the doc doesn't say whether accessibility 'selected' state and the compact single-label reveal should follow the id match or the derived status. Chose id match (`step.id === current`) for `accessibilityState.selected`/compact-reveal, and the derived `status` for indicator color/icon and the status word (so 'has an error' wins over 'current step' in that edge case).
- Stepper: automatic `compact` on narrow viewports reuses `layout.maxWidth.prose` per the platform notes, but the exact comparison (`<` vs `<=`) isn't specified; used `windowWidth < t.layoutMaxWidthProse`, matching Table/Tabs/Menu/Select's existing pattern in this package.
- Stepper: horizontal connector placement is approximated with a fixed `marginTop` (indicatorSize/2 - connectorWidth/2) since the connector is a decorative sibling, not a measured/absolute-positioned element; there's no CSS-cascade equivalent on native to align it exactly with the indicator's center for arbitrary label heights.
- Stepper: `stepHover` ('hover and press background of a navigable step') is applied only on Pressable's `pressed` state — there is no native hover, same acknowledged limit as Button/Tabs in this package.
- Stepper: the schema's anatomy lists `description` generally (not orientation-scoped), so it renders under the label in both `horizontal` (non-compact) and `vertical`, even though the guidance prose frames descriptions as mainly a vertical-stepper concern.
- Stepper: `copy.stepOf`/`copy.stepLabel` use `{n}`/`{total}`/`{label}` placeholder syntax in the doc; implemented as small formatting functions rather than literal template substitution, matching this package's existing convention for parameterized copy (e.g. RadioGroup's `COPY.required`).
