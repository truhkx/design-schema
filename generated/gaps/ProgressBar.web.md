# Gaps reported while generating ProgressBar for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:10 — round 1

- ProgressBar: formatValue's shape is `(value: number, max: number) => string` with no `min` parameter, so the default percentage implementation (`Math.round((value/max)*100)`) ignores `min` entirely. This matches the common case since `min` defaults to 0, but for a non-zero `min` the default percentage would be wrong; consumers must supply their own `formatValue` in that case. Chose not to widen the signature since the schema says to use the shape verbatim.
- ProgressBar: the schema defines `copy.indeterminate` ('{label}: in progress') but the platform notes for `announce` only mention `copy.progress`/`copy.complete` being used for milestone/completion announcements, never describing when `copy.indeterminate` fires. I announce it once via the live region when the bar first becomes indeterminate (gated by `announce !== 'none'`, matching the enum's general on/off semantics), since otherwise the string would be dead code.
- ProgressBar: `announce: 'milestones'` behavior for re-entrant/decreasing values (e.g. a retried upload whose `value` resets lower) isn't specified. I track the highest milestone crossed via a ref and never re-announce a lower milestone, so a value that drops back down won't re-trigger 25%/50% announcements on the way back up. This wasn't tested by the given scenarios (none exercise multiple value changes) so it's an assumption, not a verified behavior.
- ProgressBar: the docs describe an `aria-live="polite"` region 'next to the bar' but don't specify its accessible role. I gave it `role="status"` (matching Alert's and Combobox's live-region convention in this package) since the schema doesn't name one explicitly.

## 2026-09-10 18:56 — round 1

- ProgressBar: default formatValue and the value-text computation don't guard against max <= min (an invalid range); behavior when min/max are misconfigured is unspecified in the doc, so it falls back to treating the bar as empty rather than warning, matching Meter's non-throwing behavior but without Meter's dev-mode console warning (the ProgressBar doc doesn't request one).

## 2026-09-16 09:35 — round 1

- ProgressBar: platforms.web.notes says 'A <div role="progressbar">' (reads as the root) while Guidance > Web puts role=progressbar on the track; chose the track, with the root as a plain container.
- ProgressBar: whether the initial state is announced on mount is unspecified; chose: copy.indeterminate is announced when the bar mounts indeterminate (it 'enters' that state), but milestone tiers and completion already reached at mount are recorded silently, so a bar that mounts at 100 does not announce complete.
- ProgressBar: 'a value that moves backward resets the tiers already announced' does not say reset to zero or to the new value's tier; chose the new value's tier (moving back from 80 to 60 makes 75 and complete announceable again, without re-announcing 50 right away).
- ProgressBar: with announce: milestones the doc says milestones announce at 25/50/75/100 and also that reaching max announces copy.complete once; chose copy.complete at 100 (not copy.progress with '100%'), and copy.progress with the formatted value for 25/50/75.
- ProgressBar: copy.progress {value} is not defined as the raw number or the formatValue output; chose the formatValue text (aria-valuetext).
- ProgressBar: the default percentage's rounding is unspecified; chose Math.round (like Meter), which can show '100%' at 99.5% before completion.
- ProgressBar: value outside min..max is not addressed; chose to clamp for the fill, aria-valuenow and formatValue's argument.
- ProgressBar: an indeterminate bar's aria-valuemin/max are not stated for web (the RN notes keep min and max); chose to keep aria-valuemin/max and omit aria-valuenow and aria-valuetext.
- ProgressBar: invalid range (max <= min) doesn't say what aria-valuenow/value text show; chose aria-valuenow = min, the default text '0%', and no determinate announcements.
- ProgressBar: no style binding for the gap between label and value text in the label row (Meter has labelGap); used var(--space-2) directly, not overridable.
- ProgressBar: the radius binding has no part; applied it to both track and fill.
- ProgressBar: the sweep easing is unspecified for web (RN says linear so the loop has no seam); used motion.easing.standard, since the fill is off the track at both ends of each loop, and a direction-reversed keyframe under :dir(rtl).
- ProgressBar: hideLabel with showValue true leaves the value text as the only visible item in the label row, and it sits at the start, not the end; the doc doesn't say where it goes.
- ProgressBar: valueSize/fontFamily/lineHeight/valueColor have no part; applied them to the composed valueText (and label for fontFamily/lineHeight) through Text's overrides, as Meter does.
- ProgressBar: the live region re-reading an identical message (e.g. indeterminate twice) needs the node replaced; implemented by keying the message span, not specified in the doc.
