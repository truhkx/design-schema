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

## 2026-09-17 12:37 — round 1

- ProgressBar: composition gives the label and valueText Texts `element: span`, but the RN Text has no `element` prop; I left it out.
- ProgressBar: the RN Text takes no testID, so the `label` and `valueText` parts are wrapper Views carrying `ProgressBar.label` / `ProgressBar.valueText`. The doc doesn't say where a composed part's testID goes when the child can't take one.
- ProgressBar: `hideLabel` on RN doesn't render the label Text at all; the root's accessibilityLabel stays the name. The doc says 'visually hide' but has no RN form for that (web uses a visually-hidden class). I chose not rendering it.
- ProgressBar: the doc puts `role=progressbar` on the track on web but lists only `element: View` for rn. I put accessibilityRole/Label/Value/State on the root View (accessible, focusable={false}) so the name and value announce together, as Meter does.
- ProgressBar: platforms.rn.props says `accessibilityRole=progressbar`, while the package digest prefers `role` where a Role exists (Meter uses role="meter"). I followed the component doc and kept accessibilityRole.
- ProgressBar: with `hideLabel` and a visible value text, `justify-content: space-between` alone would put the lone value at the start. The doc says it stays at the inline end, so the header switches to flex-end. The doc should state that alignment.
- ProgressBar: Behavior doesn't say whether passing through the indeterminate state resets the tier record. I keep the record through it, so going determinate again announces only tiers above the last recorded one. A bar that mounts indeterminate records tier 0, so its first determinate value announces normally rather than silently as a mount would.
- ProgressBar: under invalid range (max <= min) the doc says no progress or completion is announced, but not whether tiers are recorded meanwhile. I record nothing, and a bar that mounts with an invalid range keeps tier 0.
- ProgressBar: the one-third sweep width `trackWidth / 3` is a literal with no token (literal-ok comment). The doc could name it as a constant.
- ProgressBar: in RTL the doc says the sweep 'runs toward the left' but not how the fill is anchored. I anchor it at the inline start (alignSelf flex-start) and translate from +width to -trackWidth when I18nManager.isRTL. That assumes react-native-web mirrors flex-start the same way, which is unverified.
- ProgressBar: the default formatter's `Intl.NumberFormat(locale, …)` needs a locale, and the component has no locale prop or context. I pass `undefined` (device locale), as Meter does.
- ProgressBar: the doc says 'Omit (undefined or null)' for value, but the prop type is `number`. I typed it `number | null | undefined`.
- ProgressBar: behavior scenario `the-bar-is-never-focusable` is limited to web/lit, although rn notes require focusable={false}. It's implemented but has no rn test.
