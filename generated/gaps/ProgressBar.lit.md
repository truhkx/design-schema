# Gaps reported while generating ProgressBar for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:12 — round 1

- ProgressBar: platform notes say role/aria-value* go through ElementInternals on the host, but the package convention (established by Toast.ts's own comment) is that ElementInternals.role/ariaLabel aren't visible to the accessible-name/value computation the test suite uses — only real attributes are. I set role, aria-valuemin/max/now/text and aria-label as plain host attributes instead (kept real AT compatibility, since plain ARIA attributes work identically to ElementInternals for actual assistive tech), and skipped ElementInternals entirely.
- ProgressBar: formatValue's shape is `(value: number, max: number) => string` — it omits `min`. The default percentage formatter therefore computes `value / max` (ignoring `min`), which is only equivalent to the fill's min–max-based percentage when `min` is 0 (the default). aria-valuenow/aria-valuemin/aria-valuemax and the fill width still use the full min–max range; only the *displayed/announced text* from the default formatter ignores `min`, per the given signature.
- ProgressBar: the doc doesn't specify when `copy.indeterminate` fires (only `copy.progress`/`copy.complete` are tied to explicit behavior — milestones and reaching max). I announce it once via the live region each time the bar transitions into the indeterminate state (when `announce` is not `none`), analogous to `copy.complete` firing once on reaching `max`.
- ProgressBar: milestone/complete re-announcement behavior when `value` moves backward (e.g. a retried or reset task) isn't specified. I reset the tracked 25%-tier/complete flags whenever the computed tier changes in either direction, so progress that regresses below a previously-announced tier can re-announce that tier going forward; this is an assumption, not a documented rule.
- ProgressBar: the live region element itself isn't a named anatomy part (anatomy lists only container/label/valueText/track/fill), so it renders without a `part` attribute — an implementation detail, not a styling hook.

## 2026-09-10 18:43 — round 1

- ProgressBar: schema's `formatValue` shape is `(value, min, max) => string` but the on-disk file typed it as `(value, max) => string` and computed the default percentage as value/max instead of the range-aware (value-min)/(max-min) used by the fill itself — fixed both to match the schema and to stay consistent with the fill's own `percent` getter.
- ProgressBar: the Behavior section says the live region is `role="status"` on Lit (not ElementInternals) but the region lacked the role attribute — added `role="status"` alongside `aria-live="polite"`.
- ProgressBar: the class doc explains role/aria-value* are set as plain host attributes rather than via ElementInternals, deviating from the platform note's literal wording ('ElementInternals role="progressbar" with ariaValueNow/Min/Max/Text on the host') because the accessible-name/value test tooling only reads real attributes — left as-is since it was already a deliberate, documented choice in the existing code, but flagging it since it reads as a contradiction with the platform notes section verbatim.

## 2026-09-16 09:37 — round 1

- ProgressBar: platforms.web wants aria-labelledby, but on Lit the progressbar role is on the host and the label is inside the shadow root, so aria-labelledby cannot cross the boundary. Chose aria-label on the host, mirrored from `label`.
- ProgressBar: the Lit guidance prose says 'ElementInternals role and aria values on the host', which contradicts platforms.lit.notes (plain reflected attributes). Followed the notes.
- ProgressBar: reduced-motion indeterminate treatment disagrees. styles.indeterminateLoop says the fill is replaced by a static half-opacity track; the Web and RN guidance say a full-width fill at opacity.disabled. Chose the schema: hide the fill and set the track to opacity.disabled.
- ProgressBar: showValue defaults to true, so it is exposed as the negated `hide-value` attribute and reflected per package convention, but platforms.lit.reflect does not list it.
- ProgressBar: no binding covers the gap between label and value text in the label row (partGap is only the row-to-track gap). Chose <ds-stack direction=horizontal justify=between gap=tight>.
- ProgressBar: radius, valueColor, valueSize, fontFamily, lineHeight and partGap have no `part`. Chose: radius on track and fill, value* on valueText, fontFamily/lineHeight on the container and forwarded to both Text children, partGap on the container.
- ProgressBar: it is unspecified whether a bar that mounts already past a milestone, complete, or indeterminate announces on first render. Chose to announce (a live region filled at insertion is usually silent anyway).
- ProgressBar: 'milestones announce at 25/50/75/100' vs 'copy.complete at max'. Chose copy.progress for 25/50/75 and copy.complete (once) for 100. Several tiers crossed in one update produce a single announcement with the current value.
- ProgressBar: with announce: none it is unspecified whether tiers keep being tracked, so switching to milestones mid-task could replay past tiers. Chose to keep tracking silently.
- ProgressBar: `label` is required but has no fallback when empty. Chose to drop aria-label, so the bar is unnamed, with no dev warning.
- ProgressBar: the indeterminate sweep direction in RTL is unspecified. Chose to mirror the keyframes under :host(:dir(rtl)).
- ProgressBar: the the-bar-is-never-focusable scenario has no concrete assertion shape on Lit. Tested that host focus() does not move focus, tabIndex < 0, and the shadow root has no focusable descendants.

## 2026-09-17 12:35 — round 1

- ProgressBar: the rules don't say what happens to the recorded tier when a bar leaves the indeterminate state (value goes from undefined to 60 with announce: milestones). I reset the record to tier 0 on entering indeterminate, so the first known value announces its tier (e.g. 'Importing contacts: 60%'); keeping the old record would stay silent instead.
- ProgressBar: the forwarded bindings (labelSize, labelWeight, valueSize, fontFamily, lineHeight) only reach the child ds-text through its `overrides` property, so a CSS override of --ds-progress-bar-label-size etc. has no effect: nothing in the shadow root reads those hooks without restyling the child. I kept the hooks on :host for naming consistency and forward only through `overrides`; the doc should say whether a CSS hook exists for forwarded bindings.
- ProgressBar: a hidden label with no visible value text must 'take no space' and skip partGap, but the doc doesn't say how on Lit. I make the whole header visually hidden (out of flex flow), which keeps the label in the shadow tree; the name itself comes from the host's aria-label.
- ProgressBar: the default formatter's `Intl.NumberFormat(locale, …)` names no locale source on Lit. I use the runtime default (undefined), as Meter does.
- ProgressBar: 'copy.indeterminate is announced once after mount' doesn't say how long after. Text already in a newly inserted live region is often not read, so Lit renders the region empty and sets the message on the next animation frame.
- ProgressBar: `part` attributes are kept on container/header/label/valueText/track/fill because the anatomy names them, even though the package forbids ::part for styling; the doc could say whether Lit should expose `part` at all.
- ProgressBar: non-finite `min`/`max` are not covered (only a non-finite `value` is). They pass through Number() unchanged into aria-valuemin/max.
