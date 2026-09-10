# Gaps reported while generating ProgressBar for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 11:12 — round 1

- ProgressBar: platform notes say role/aria-value* go through ElementInternals on the host, but the package convention (established by Toast.ts's own comment) is that ElementInternals.role/ariaLabel aren't visible to the accessible-name/value computation the test suite uses — only real attributes are. I set role, aria-valuemin/max/now/text and aria-label as plain host attributes instead (kept real AT compatibility, since plain ARIA attributes work identically to ElementInternals for actual assistive tech), and skipped ElementInternals entirely.
- ProgressBar: formatValue's shape is `(value: number, max: number) => string` — it omits `min`. The default percentage formatter therefore computes `value / max` (ignoring `min`), which is only equivalent to the fill's min–max-based percentage when `min` is 0 (the default). aria-valuenow/aria-valuemin/aria-valuemax and the fill width still use the full min–max range; only the *displayed/announced text* from the default formatter ignores `min`, per the given signature.
- ProgressBar: the doc doesn't specify when `copy.indeterminate` fires (only `copy.progress`/`copy.complete` are tied to explicit behavior — milestones and reaching max). I announce it once via the live region each time the bar transitions into the indeterminate state (when `announce` is not `none`), analogous to `copy.complete` firing once on reaching `max`.
- ProgressBar: milestone/complete re-announcement behavior when `value` moves backward (e.g. a retried or reset task) isn't specified. I reset the tracked 25%-tier/complete flags whenever the computed tier changes in either direction, so progress that regresses below a previously-announced tier can re-announce that tier going forward; this is an assumption, not a documented rule.
- ProgressBar: the live region element itself isn't a named anatomy part (anatomy lists only container/label/valueText/track/fill), so it renders without a `part` attribute — an implementation detail, not a styling hook.
