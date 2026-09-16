# Gaps reported while generating ProgressBar for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 19:09 — round 1

- ProgressBar: rn platform props list only names accessibilityRole/accessibilityLabel/accessibilityValue, but the web build sets aria-busy for indeterminate; I added accessibilityState={{ busy: true }} as the RN analog since RN's accessibilityState does support 'busy' — flagging in case the doc wants this made explicit.
- ProgressBar: for indeterminate accessibilityValue, I omit both `now` and `text` (only min/max) rather than reporting a misleading 0%/unknown value text; the doc only says web omits aria-valuenow, not aria-valuetext, so this is a judgment call.
- ProgressBar: the indeterminate sweep's easing isn't specified (the `transition` binding's motion.easing.standard is described only for the determinate width change); I used Easing.linear for the continuous loop since a standard ease-in-out would visibly hitch at the loop seam — worth confirming or adding an explicit easing note to indeterminateLoop.
- ProgressBar: added a non-finite-value/max<=min dev warning and clamp, mirroring Meter's documented robustness behavior, even though the ProgressBar schema doesn't spell this out explicitly.
- ProgressBar: 'moved backward resets announcements' is implemented as reset-on-any-decrease of the rounded percent, and additionally reset whenever the bar re-enters indeterminate (a restart signal); the doc only describes the value-decrease case, so the indeterminate-reset behavior is an inference.

## 2026-09-16 09:39 — round 1

- ProgressBar: `copy.indeterminate` is announced 'each time the bar enters the indeterminate state' — unclear whether mounting without a value counts as entering; chose yes (announced on mount), which may be noisy for bars that mount indeterminate.
- ProgressBar: milestone tiers are unspecified at the boundaries — whether 74.6% counts as the 75% milestone (rounding) or not (floor), and whether a single jump across several tiers announces each one; chose floor of fraction×4 and a single announcement for the highest tier crossed.
- ProgressBar: 'a value that moves backward resets the tiers already announced' does not say reset to zero or to the current tier; chose the current tier, so dropping from 80% to 60% does not immediately re-announce 50%.
- ProgressBar: whether a bar that mounts already past a milestone (or at max) announces it is unspecified; chose yes — mount at 60% with milestones announces the 50% tier once, and mount at max announces completion.
- ProgressBar: `copy.progress` `{value}` is not defined as the formatted value text or the raw number; chose `formatValue(value, min, max)`, matching accessibilityValue.text.
- ProgressBar: `radius`, `valueColor`, `valueSize`, `fontFamily`, `lineHeight` bindings have no `part`; applied radius to both track and fill and forwarded the typography bindings to the label/value Text children's overrides (value Text uses tone=muted for valueColor).
- ProgressBar: whether `formatValue` receives the raw or the clamped value is unspecified; chose the clamped value (and `min` for a non-finite value), consistent with accessibilityValue.now.
- ProgressBar: the rn notes say the indeterminate fill under reduced motion is 'a static, half-opacity track' in the style description but 'the fill drawn full-width at opacity.disabled' in guidance; implemented the latter.
- ProgressBar: the platform rule says 'disabled sets accessibilityState' and 'keyboard' stories, neither applies; the scenario `the-bar-is-never-focusable` is web/lit only, but focusable={false} is set on the rn root anyway.
