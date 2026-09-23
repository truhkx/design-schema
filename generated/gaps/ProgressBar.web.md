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

## 2026-09-17 12:33 — round 1

- ProgressBar: when a bar goes from indeterminate to determinate, the spec doesn't say whether the tier it arrives at counts as silently recorded (like at mount) or as newly entered. I kept whatever tier the bar had last recorded, so a bar that mounts indeterminate and later reports 30% announces the 25% milestone under `milestones`.
- ProgressBar: the spec doesn't say what happens when an invalid range (max ≤ min) becomes valid mid-task. I treat it like mount and record the tier and completion silently, so there is no burst of announcements.
- ProgressBar: `value` is described as 'Omit (undefined or null)', but the schema type is `number`. I typed the prop `number | null | undefined`.
- ProgressBar: the header's layout when `hideLabel` is set and the value text is visible isn't specified beyond 'stays at the end of the row'. I added a `ds-progress-bar__header--label-hidden` modifier with `justify-content: flex-end`, because the visually-hidden label is taken out of the flex flow.
- ProgressBar: when there is no visible label and no visible value text, the spec says the row 'takes no space' but not how. I kept the header element, with `data-part="header"` and the label Text inside it so aria-labelledby still resolves, and applied the visually-hidden clip to it. Because the header is absolutely positioned, `partGap` no longer applies.
- ProgressBar: the locale for the default `Intl.NumberFormat` isn't specified. I used the runtime default (`undefined`), as Meter does.
- ProgressBar: the `transition` binding describes the fill's size change using motion.easing.standard, while the indeterminate sweep has its own `sweepEasing` binding. I read the token directly for the size change (no hook) and put `sweepEasing` on its own hook.

## 2026-09-21 16:10 — round 1

- ProgressBar: the next-animation-frame rule is stated only under the Indeterminate bullet ('Announced once after mount means once the live region has rendered empty'), so it is unclear whether every announcement is deferred a frame or only the one made at mount. I deferred only the first announcement after mount and emit later ones synchronously, so progress and completion are not delayed.
- ProgressBar: with hideLabel true AND visible value text, the doc says the header 'switches to end alignment, since the hidden label leaves the flow' but never says how the label itself is hidden in that case — it describes hiding the whole header only for the both-hidden case. Since Text takes no className and restyling a child is forbidden, I wrapped the label Text in a visually-hidden <span> inside the header. That wrapper is an extra element inside the `header` part that is not in the anatomy; a `visuallyHidden` boolean on Text would remove it.
- ProgressBar: for an invalid range (max <= min) the doc says the bar 'shows and exposes 0%', but does not say whether showValue still governs the visible text. I kept showValue authoritative — '0%' is exposed via aria-valuetext always, and shown only when showValue is true.
- ProgressBar: the invalid-range rule says to expose 'the given bounds', so with max < min the track renders aria-valuemin greater than aria-valuemax, which is a malformed ARIA range that an audit tool may flag. I followed the doc literally rather than swapping or clamping the bounds; if the intent was to keep the exposed range coherent, the doc should say which bound wins.
- ProgressBar: the live region is described as 'next to the bar' / 'beside the bar' and explicitly not an anatomy part, which leaves open whether it is a sibling of the root or a child of it. I made it the last child of the root container (matching the Lit note that it lives inside the shadow root), so a single element is returned and the ref still lands on the root.
- ProgressBar: the doc states the bar is never focusable but does not say what happens if a caller passes tabIndex. I removed tabIndex from ProgressBarProps and strip it from the forwarded rest alongside className and style, which narrows the public type against the base div props; if callers must be able to make the root programmatically focusable, the doc should say so.

## 2026-09-23 16:09 — round 1

- ProgressBar: with max ≤ min, `formatValue` says the bar 'exposes "0%" as aria-valuetext and shows it', but it also says the formatter is 'called with the clamped value' and does not say whether a custom formatter is bypassed for an invalid range. I chose to always use the default percentage ("0%") for an invalid range and not call the custom formatter.
- ProgressBar: `labelGap` says 'the label's wrapper shrinks', but the web platform notes describe the header holding the label Text directly and only mention a wrapper for the hideLabel visually-hidden case. I always wrap the label Text in a span (ds-progress-bar__label, flex-shrink 1, min-inline-size 0) that also takes the visually-hidden clip when hideLabel is set and the value text shows.
- ProgressBar: the web Guidance says the live region sits 'beside the bar', while platforms.web.notes and Behavior say it is the last child inside the root container. I followed the notes: it is the root's last child.
- ProgressBar: the invalid-range rules say a bar that becomes valid records silently, but nothing covers an indeterminate bar with an invalid range that then gets a value in a valid range. I treat it as entering the range (silent record), not as the first known value after indeterminate (which would announce its tier under milestones).
- ProgressBar: the sweep's easing is overridable (`sweepEasing`), but the determinate `transition` easing is fixed to motion.easing.standard with no hook, as the spec says. Noting the asymmetry only; implemented as written.

## 2026-09-23 16:10 — round 2

- ProgressBar: the spec says `labelColor` and `valueColor` are 'realised by the label/value Text's tone … no hook of its own', but check_hooks requires every locked binding that is not forwarded to declare `--ds-progress-bar-<binding>`. They are not in `composition.forwards`, and Text's `color` is locked, so they can't be forwarded. I followed the gate: the root declares `--ds-progress-bar-label-color` / `--ds-progress-bar-value-color` (defaults `--color-foreground` / `--color-foreground-muted`). Wrapper spans around each Text re-set that token from the hook (the inverse-surface re-scoping Text.css documents), so the Text is never restyled. The doc should either drop 'no hook of its own' and describe this token re-scope, or have check_hooks exempt bindings the spec realises through a composed child's tone.
- ProgressBar: the spec doesn't say whether `fill`, `fillSuccess` and `fillDanger` are separate hooks or one interpolated per-tone hook. I declared three root hooks (`--ds-progress-bar-fill`, `-fill-success`, `-fill-danger`), and the tone modifier selects one into an internal `--ds-progress-bar-tone-fill`, so re-theming one tone from page CSS doesn't affect the others.
- ProgressBar: the value Text now sits in a wrapper span (`ds-progress-bar__value`) that carries the value-color hook. The web platform notes only mention the header holding the Text directly.
- ProgressBar (from round 1): with max ≤ min the value text is always the default "0%" and a custom formatValue is not called. The spec says both 'exposes "0%"' and 'called with the clamped value'.
- ProgressBar (from round 1): an indeterminate bar with an invalid range that later gets a value in a valid range records that value silently, as for a range becoming valid, instead of announcing its tier as the first known value after indeterminate.
