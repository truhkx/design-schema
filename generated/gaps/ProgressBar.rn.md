# Gaps reported while generating ProgressBar for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 19:09 — round 1

- ProgressBar: rn platform props list only names accessibilityRole/accessibilityLabel/accessibilityValue, but the web build sets aria-busy for indeterminate; I added accessibilityState={{ busy: true }} as the RN analog since RN's accessibilityState does support 'busy' — flagging in case the doc wants this made explicit.
- ProgressBar: for indeterminate accessibilityValue, I omit both `now` and `text` (only min/max) rather than reporting a misleading 0%/unknown value text; the doc only says web omits aria-valuenow, not aria-valuetext, so this is a judgment call.
- ProgressBar: the indeterminate sweep's easing isn't specified (the `transition` binding's motion.easing.standard is described only for the determinate width change); I used Easing.linear for the continuous loop since a standard ease-in-out would visibly hitch at the loop seam — worth confirming or adding an explicit easing note to indeterminateLoop.
- ProgressBar: added a non-finite-value/max<=min dev warning and clamp, mirroring Meter's documented robustness behavior, even though the ProgressBar schema doesn't spell this out explicitly.
- ProgressBar: 'moved backward resets announcements' is implemented as reset-on-any-decrease of the rounded percent, and additionally reset whenever the bar re-enters indeterminate (a restart signal); the doc only describes the value-decrease case, so the indeterminate-reset behavior is an inference.
