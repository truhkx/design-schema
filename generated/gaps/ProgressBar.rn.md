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

## 2026-09-21 16:24 — round 1

- ProgressBar: platforms.rn.props names `accessibilityRole=progressbar`, but the package convention (and Meter, which the notes say to follow) prefers the `role` prop on RN >= 0.87. Kept `accessibilityRole` because the declared-contract section wins; the schema should say which one it wants.
- ProgressBar: react-native-web 0.21 does not forward the composite `accessibilityValue` or `accessibilityState` objects at all (only `aria-valuenow/min/max/text` and `aria-busy` are in its forwardedProps list), so the schema's rn props alone leave the Storybook/RNW bar with role=progressbar and no exposed value or busy state. Added the aria-* aliases beside them, as Meter does; the rn props list should name them.
- ProgressBar: the indeterminate sweep's start and end offsets are not given, only 'starting and ending wholly outside the track'. Chose translateX from -sweepWidth to +trackWidth on a flex-start-anchored one-third-width fill, mirrored to +sweepWidth..-trackWidth under I18nManager.isRTL.
- ProgressBar: the spec does not say what the fill does before the track is measured or when the track resizes. Chose to snap (setValue) on the first layout, on resize, and under reduced motion, and to animate only a change in `value` — matching Meter. On native this means one frame at width 0 before the first onLayout.
- ProgressBar: 'warns in development' for max <= min does not say how often. Chose once per distinct min/max pair (Meter's precedent) rather than once per render or once per mount.
- ProgressBar: the announcement rules cover mount, backward, indeterminate and invalid-range separately but not their intersection — a bar that mounts with an invalid range and later gets a valid one. Treated it as a second silent record (the invalid-range rule's 'as at mount' read as re-arming the silent record each time the range is invalid).
- ProgressBar: `showValue` is 'ignored when indeterminate', so a custom `formatValue` still runs on every indeterminate render (with the clamped value, which is `min`) even though nothing shows or announces it. Left it called unconditionally; the doc should say whether formatValue may be skipped when indeterminate.
- ProgressBar: on RN, `hideLabel` with `showValue: false` leaves no header content, so the header View is not rendered at all and `testID="ProgressBar.header"` is absent in that configuration. The spec only states that the `label` part has no native home while hidden; it does not say whether `header` must still exist as a part.
- ProgressBar: nothing in the schema covers a label longer than the header row. Added `flexShrink: 1` on the label wrapper so it wraps instead of pushing the value text out — layout, no token involved, so it is invisible to the overrides contract.
- ProgressBar: the 10 behavior scenarios are 8 derived render/name checks plus two label checks — they gate none of the announcement tiers, the indeterminate copy, the backward reset, the invalid range, the non-finite bounds, or the reduced-motion fill, which is where all the real logic is. I verified those with a throwaway suite that I deleted; the doc needs scenarios for them or the next regeneration can silently lose the state machine.

## 2026-09-23 14:42 — round 1

- ProgressBar: the invalid-range rule says aria-valuetext is "0%", but formatValue says the formatter is called with the clamped value; it doesn't say whether a custom formatValue is used when max <= min. I always use the default percentage there ("0%" in the device locale) and never call the custom formatter.
- ProgressBar: 'Repeats' (announce again even if the text is the same) and 'Backward' only make sense when the value moves, but a re-render with the same value and a changed label or formatValue (so a new valueText) is not covered. Announcements run only when the tier changes, so a label change alone is silent.
- ProgressBar: Guidance › React Native says `accessibilityRole="progressbar"` while platforms.rn.notes says the `role="progressbar"` prop and not accessibilityRole. I followed the notes (role prop plus aria-label), as Meter does.
- ProgressBar: the 'transition' binding's easing is fixed to motion.easing.standard with no override hook, but sweepEasing is overridable. It isn't stated whether a sweepEasing override should also apply to the determinate fill. I kept it on the sweep only.
- ProgressBar: 'announced once after mount' is defined for web/Lit (next animation frame) but not for RN. I call announceForAccessibility from the mount effect, with no extra delay.
- ProgressBar: hideLabel with showValue still shows the value text at the end of the row, but the spec doesn't give RN alignItems for the header. I kept 'baseline', as Meter does.
- ProgressBar: the spec says the announcement state machine is covered by each platform package's own tests, but ProgressBar.test.tsx is meant to hold the behavior scenarios. I put those tests in a second describe block in the same file rather than a separate file.

## 2026-09-23 14:42 — round 1

- ProgressBar: the Guidance's React Native section says `accessibilityRole="progressbar"`, but platforms.rn.notes says to use the `role="progressbar"` prop and not accessibilityRole. I followed the notes (role prop); the Guidance line should be updated to match.
- ProgressBar: platforms.rn.props doesn't list `aria-label`, but the package convention says to mirror accessibilityLabel as aria-label. I added aria-label to the root beside accessibilityLabel; the rn props list could name it.
- ProgressBar: the composition props give `element: span` for both Texts, but the RN Text has no element concept. I left it out; the doc could say `element` is web/Lit-only.
- ProgressBar: the Invalid range rule says a bar that was invalid records its first valid value silently. It doesn't say what happens if the bar goes invalid → indeterminate → valid. Entering the indeterminate state re-arms announcing (per the Indeterminate rule), so here the first valid value announces its tier. The doc should say which rule wins.
- ProgressBar: it isn't stated what the determinate fill animates from when the bar switches from indeterminate to determinate (the old width, or 0). The code animates from the last determinate width, and snaps if the track hasn't been laid out yet.
- ProgressBar: the header's cross-axis alignment between label and value text isn't specified. I used alignItems 'baseline' (layout only, no token).
- ProgressBar: the value text's wrapping isn't specified. Its wrapper has flexShrink 0 so only the label wraps; Meter's doc could share the same wording.
- ProgressBar: formatValue for an invalid range must show "0%". The code always uses the default percentage formatter there, even when a custom formatValue is passed; the doc only implies this.

## 2026-09-23 19:19 — round 1

- ProgressBar: composition props `element: span` on the label and valueText Texts have no counterpart on the RN Text (it takes no `element`); ignored, and the wrapper Views carry the testIDs as the rn notes say.
- ProgressBar: the 'value: 1 fraction crosses tier 4 only when clamped === max' rule is implied by floor(fraction × 4); floating-point fractions just below 1 (e.g. 0.9999999) stay tier 3 — I relied on the fraction arithmetic and did not add an epsilon.
- ProgressBar: the a-hidden-label-is-still-the-accessible-name scenario says `name: true` without saying whether the visible label part must be absent on rn; the test asserts both the missing `ProgressBar.label` and the accessibilityLabel.
- ProgressBar: the spec does not say whether the determinate fill's animation easing is overridable; only `sweepEasing` is a binding, so the fill uses motion.easing.standard directly (as the transition binding text states).
