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

## 2026-09-21 16:18 — round 1

- ProgressBar: the `has-accessible-name` scenario cannot pass on Lit as generated. platforms.lit says role="progressbar" and aria-label are plain attributes on the *host*, but the generated probe searches `el.shadowRoot` for `[role="progressbar"]` and falls back to `[part="container"]` — an unnamed div. Kept the role on the host per the platform note (the hand-written src/ProgressBar.test.ts, which reads the host, passes 10/10). Naming the container div instead would need aria-label on a role-less div, which axe flags as aria-prohibited-attr. Either the probe needs a host fallback, or the doc needs to say which element in a shadow-root platform is the named one.
- ProgressBar: the doc never says how often the invalid-range development warning fires. Chose once per distinct min:max pair, matching Meter and the React regen, rather than once per element or once per bounds change.
- ProgressBar: 'Announced once after mount' pins the rAF deferral to the mount-time indeterminate announcement, but does not say whether later announcements also defer. Chose to defer only the first (the live region is already in the tree afterwards), matching React.
- ProgressBar: the doc does not say what an unparseable `value` *attribute* means on Lit (`value="abc"` → NaN, which is neither undefined nor null). Chose determinate-at-`min` per 'a non-finite number (NaN, Infinity) is treated as min'; only a removed/absent attribute or an explicit null/undefined property is indeterminate.
- ProgressBar: hideLabel with visible value text — the doc says the label is visually hidden but not whether the hiding styles go on the `label` part itself or a wrapper. Chose a wrapper span so the `label` part stays a clean ds-text with no layout styles of its own (matching React); the `label` data-part is therefore not the visually-hidden element.
- ProgressBar: the reduced-motion indeterminate fill is specified in prose as 'opacity.disabled' but there is no style binding for it, so it is not overridable and has no hook. Used `var(--opacity-disabled)` directly. Same for the one-third sweep width, which the doc explicitly exempts as geometry.
- ProgressBar: `formatValue` has no attribute form on Lit (it is a function, `attribute: false`), so it is property-only — unreachable from static HTML. The doc's Lit notes do not mention this; the Lit `CustomFormatValue` story has to use a `.formatValue` property binding.

## 2026-09-23 15:17 — round 1

- ProgressBar: formatValue says a max ≤ min range 'exposes "0%" as aria-valuetext and shows it', but also says formatValue is 'called with the clamped value' and doesn't say whether a custom formatter is used when the range is invalid. I chose to always show and expose the default-formatted "0%" and not call a custom formatter.
- ProgressBar: fill, fillSuccess and fillDanger are three separate locked bindings on the same part, chosen by tone. The doc doesn't say whether that means three hooks or one hook reassigned per tone, which is what Meter does with --ds-meter-fill. I declared three hooks (--ds-progress-bar-fill, -fill-success, -fill-danger), one per binding, and picked between them with :host([tone]) selectors.
- ProgressBar: labelGap says the label's wrapper shrinks but says nothing about the value text. I set flex-shrink: 0 on the valueText ds-text from the parent's CSS so the value never wraps, as Meter does. That is a layout rule on a composed child.
- ProgressBar: the Lit notes say role and the aria-value* attributes sit on the host, but the web notes put role=progressbar on the track and data-ds on a root with no role. On Lit, role=progressbar and data-ds are both on the host, so the rule that they sit on different elements can't hold on Lit and needs a Lit exception in the doc.
- ProgressBar: the behavior scenario the-bar-reports-its-value-and-range is listed for web only, although the Lit notes require the same attributes on the host. It is covered by a package test here; it could list lit as well.
- ProgressBar: the Behavior 'Mount' rule (announce indeterminate on the next frame) doesn't say what happens if the value changes again before that frame fires. The current code announces the message worked out at the first render, even if the state changed within that frame.

## 2026-09-23 15:18 — round 2

- ProgressBar: the styles section says labelColor and valueColor are 'Realised by the label/value Text's tone … no hook of its own', but the hooks gate requires every locked binding to declare --ds-<component>-<binding>. I followed the gate and Meter: --ds-progress-bar-label-color and --ds-progress-bar-value-color are declared on :host, and the colours still come from the composed Texts' tones. The doc should say these bindings keep a declared hook for the page-CSS override and naming tooling.
- ProgressBar: because labelColor and valueColor go through the Texts' tones, no shadow rule reads their hooks, so setting --ds-progress-bar-label-color from page CSS does nothing unless it is passed on to the ds-text child. That child hook (--ds-text-color or similar) is outside this component's contract, so I left it unwired. The doc should say whether the escape hatch has to work for these two bindings and, if so, through which Text hook.
- ProgressBar: formatValue says a max ≤ min range 'exposes "0%" as aria-valuetext and shows it' but doesn't say whether a custom formatter is used then. I chose to always show and expose the default-formatted "0%" and not call the formatter.
- ProgressBar: fill, fillSuccess and fillDanger are three separate locked bindings on one part, chosen by tone. I declared three hooks and picked between them with :host([tone]), where Meter reassigns one --ds-meter-fill per tone. The doc doesn't say which pattern is intended.
- ProgressBar: the web notes say role=progressbar and data-ds are on different elements, but on Lit both are on the host. The doc should state a Lit exception.
- ProgressBar: the behavior scenario the-bar-reports-its-value-and-range is listed for web only, although the Lit notes require the same host attributes. It is covered by a package test here; it could list lit as well.
