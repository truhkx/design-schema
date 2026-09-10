# Gaps reported while generating ProgressBar for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:10 — round 1

- ProgressBar: formatValue's shape is `(value: number, max: number) => string` with no `min` parameter, so the default percentage implementation (`Math.round((value/max)*100)`) ignores `min` entirely. This matches the common case since `min` defaults to 0, but for a non-zero `min` the default percentage would be wrong; consumers must supply their own `formatValue` in that case. Chose not to widen the signature since the schema says to use the shape verbatim.
- ProgressBar: the schema defines `copy.indeterminate` ('{label}: in progress') but the platform notes for `announce` only mention `copy.progress`/`copy.complete` being used for milestone/completion announcements, never describing when `copy.indeterminate` fires. I announce it once via the live region when the bar first becomes indeterminate (gated by `announce !== 'none'`, matching the enum's general on/off semantics), since otherwise the string would be dead code.
- ProgressBar: `announce: 'milestones'` behavior for re-entrant/decreasing values (e.g. a retried upload whose `value` resets lower) isn't specified. I track the highest milestone crossed via a ref and never re-announce a lower milestone, so a value that drops back down won't re-trigger 25%/50% announcements on the way back up. This wasn't tested by the given scenarios (none exercise multiple value changes) so it's an assumption, not a verified behavior.
- ProgressBar: the docs describe an `aria-live="polite"` region 'next to the bar' but don't specify its accessible role. I gave it `role="status"` (matching Alert's and Combobox's live-region convention in this package) since the schema doesn't name one explicitly.
