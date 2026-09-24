# Gaps reported while generating Meter for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:02 — round 1

- Meter: the platform notes said the label row uses a `Text element="span"` but the value text is a plain `<span>` in `valueColor`. I used the Text component for both (element="span", tone="muted" for value) since valueColor/labelColor are locked tokens that already match Text's default/`muted` tones, and Text's own `overrides` prop is the sanctioned way to expose `labelSize`/`labelWeight`/`valueSize`/`fontFamily`/`lineHeight` per-instance without restyling a child (following the Alert precedent of delegating a binding — `iconSize` — into a composed child's own override contract) rather than duplicating Text's typography CSS on Meter's own hooks.
- Meter: pre-existing Meter.tsx/css/stories in the tree predated the `overrides`/`OverridableBinding`/`data-ds`+`data-part` conventions (visible in Switch, Alert, Card). Regenerated all three plus the index.ts export to add `MeterOverridableBinding` (trackHeight, radius, labelSize, labelWeight, valueSize, fontFamily, lineHeight, partGap, transition), `data-ds="Meter"`/`data-part` hooks on container/label/valueText/track/fill, since the task said to add these hooks to any file touched.

## 2026-09-10 17:52 — round 1

- Meter: index.ts already exported Meter/MeterProps/MeterTone/MeterOverridableBinding and Meter.tsx/Meter.css/Meter.stories.tsx already existed from a prior generation pass, matching the spec closely — treated this as a completion/fix pass rather than a from-scratch generation.
- Meter: the schema's `labelGap` binding (space.2, horizontal gap between label and value in the header row) was implemented in CSS as a bare `gap: var(--space-2)` with no override hook and was missing from `MeterOverridableBinding` — added `--ds-meter-label-gap` and included `labelGap` in the overridable union so it matches the other overridable bindings.
- Meter: no `src/Meter.test.tsx` existed for the 6 behavior scenarios (only the auto-generated `generated/behavior/Meter.web.test.tsx` did) — added one following the Alert/Button/Carousel `has-accessible-name` pattern (`screen.getByRole('meter', { name })`), matching this package's now-broad test-rollout convention (21+ components already have adopted `<Name>.test.tsx` files, well beyond what the stale memory note tracked).

## 2026-09-16 05:22 — round 1

- Meter: the `labelGap` binding says `part: label`, but it is the gap between the label and the value text, which belongs to the label row. The anatomy has no row part, so I set the hook on the root and applied it as `gap` on an unnamed header div (no data-part).
- Meter: `valueColor`, `valueSize`, `fontFamily`, `lineHeight`, `partGap`, `radius` and `transition` have no `part`. I styled the valueText part with value*, both Text elements with fontFamily/lineHeight, the root gap with partGap, and the track and fill ends with radius.
- Meter: the web notes give the label as `Text element="span"` and the value as a plain `<span>` in valueColor, but composition rules forbid restyling a child and the literal/token rules favour Text. I rendered the value as `Text tone="muted" size="sm"`, which gives color.foreground.muted, and forwarded labelSize/labelWeight/valueSize/fontFamily/lineHeight into each Text's `overrides` (fontSize/fontWeight/fontFamily/lineHeight). Text's size/weight enums fix the defaults at `sm`/`medium`, which match the binding tokens only by name.
- Meter: the doc doesn't say what `aria-valuetext` should be when `valueText` is omitted. 'Omit to show and announce the percentage' means I always set aria-valuetext to the rounded percentage. RN omits text in that case, so the platforms differ.
- Meter: when `max <= min` the doc says 'renders an empty track, exposes valuenow = min with the given bounds' but doesn't say what the value text shows. I show and announce '0%'.
- Meter: nothing names a root element for the meter role. I put role=meter and the aria-value* attributes on the track (per the web notes) and data-ds on the wrapper, so `data-ds` and `role` are on different elements.
- Meter: the scenario `has-accessible-name` doesn't say how the name is checked. I query `getByRole('meter', { name: label })`, which proves aria-labelledby resolves.
- Meter: the doc's web notes say to transition `width`. I used logical `inline-size` for both the inline fill size and the transition property, which is equivalent in horizontal writing modes.
- Meter: the package digest says `...rest` never forwards `style`/`className`, but most existing components (ProgressBar, Button, Text) still merge them. I left both out of MeterProps and strip them at runtime, so Meter is stricter than its neighbours until they are regenerated.

## 2026-09-17 05:29 — round 1

- Meter: valueText says to format with `Intl.NumberFormat(locale, …)`, but there is no `locale` prop or locale source in the schema; I passed `undefined` (the runtime default locale), so the text may differ between a server and a browser with different locales.
- Meter: the parts list says a composed part receives 'exactly the listed props', but the web platform notes need `id={labelId}` on the label Text so aria-labelledby can point at it, and the anatomy needs `data-part` on both Texts; I pass `id` and `data-part` as well and nothing else.
- Meter: `fontFamily` and `lineHeight` are bound to part `header`, but their descriptions say they are only forwarded to the Texts and never style anything directly; I gave them no hook or CSS rule on the header, so a consumer who sets `--ds-meter-font-family` in their own CSS changes nothing, even though the overrides section calls consumer-set hooks the sanctioned escape hatch.
- Meter: the forwarded bindings (labelSize, labelWeight, valueSize) default to the same tokens as the Text size/weight props, so I forward them only when set; the doc doesn't say whether the default token should also be forwarded.
- Meter: the Behavior section says a non-finite `value` is treated as `min`, but says nothing about a non-finite `min` or `max` (NaN, Infinity); I don't guard them, so a NaN bound makes `max > min` false and the meter renders empty with a warning.
- Meter: the development warning for `max ≤ min` has no copy string in the schema; I wrote the developer-facing text myself (``Meter: `max` (x) must be greater than `min` (y).``). It fires again whenever min or max change while the range stays invalid, which is not strictly 'once'.
- Meter: the percent formatting keeps full precision in aria-valuenow (e.g. 3.14159), and the doc doesn't say whether aria-valuenow should be rounded; I left it exact because the scenarios only test integers.
- Meter: the doc doesn't say whether the fill has its own border-radius or relies on the track clipping it ('the track clips the fill'); I kept the radius on both so the leading edge of a partial fill is rounded too.

## 2026-09-21 03:49 — round 1

- Meter: the guidance says a long label wraps inside the header row and neither text is truncated, but the web platform note allows the composed Texts to receive only `data-part` and `id` plumbing, and the 'never restyle a child' rule bars CSS targeting their hosts — so web has no way to give the label flex-shrink:1 and the value flex-shrink:0 the way the RN note explicitly grants wrapper Views for. Chose plain default flex shrink on both, which wraps a long label but also lets a long valueText wrap.
- Meter: the doc says a non-finite min/max is 'treated as' 0/100, but never says whether aria-valuemin/aria-valuemax report the given value or the substituted one — and the invalid-range rule separately says it exposes 'the given bounds'. Chose to apply the substitution everywhere, so the exposed range is always finite (min={NaN} renders aria-valuemin="0"); aria-valuemin="NaN" is not a valid ARIA value.
- Meter: 'warns once per distinct invalid min/max pair' does not say what the scope of 'once' is — per instance, per mount, or per module. Chose a module-level Set, so two Meters with the same bad range warn once in total and remounting never repeats it; this makes the warning unobservable to a test that renders twice.
- Meter: the overrides contract says every style binding becomes a root CSS hook, and also that locked bindings are excluded from the type — it does not resolve whether an accessibility-bearing locked binding should get a hook at all, since a hook is itself a settable escape hatch that defeats the lock. Chose to keep --ds-meter-track and --ds-meter-fill as CSS hooks (consumer-CSS settable, per the sanctioned escape hatch) while excluding both from MeterOverridableBinding.
- Meter: the doc's distinction between an animated fraction change and a snapped layout-only change (first layout, resize, or both at once) has no web expression — the fill width is declared as a percentage, so CSS transitions fire only when the fraction changes and layout-only changes snap for free. Implemented as no code; the rule reads as written for RN's measured-pixel Animated width, not for web.
- Meter: the doc names no notable states beyond the four examples. Kept the previous round's Empty (value 0), Full (value 100) and AboveMaximum (value 150) stories as the conventions' 'plus notable states', and did not add an invalid-range story, since it would emit the dev warning into every Storybook-wide gate run.

## 2026-09-23 15:04 — round 1

- Meter: the invalid-range warning's `<max>`/`<min>` placeholders and the 'distinct min/max pair' key don't say whether they use the raw props or the substituted finite bounds (NaN → 0/100). I used the substituted bounds for both, so min=NaN, max=0 and min=0, max=0 count as the same pair and warn once.
- Meter: the web notes give the `label` and `valueText` wrappers only `flex-shrink`. I also added `min-inline-size: 0` on the label wrapper, since a flex item won't shrink below its content without it, and `white-space: nowrap` on the value wrapper so its text really doesn't wrap. The spec should say whether these are intended.
- Meter: the spec doesn't say which class names the wrapper spans get. I used `ds-meter__label` and `ds-meter__value-text`, making the camelCase part name kebab-case like other components do (e.g. `ds-bottom-sheet__title-row`).
- Meter: the spec doesn't say whether the root wrapper should carry `data-part="container"` as well as `data-ds`. I kept `data-part="container"` on the root, because the `container` part (partGap) has no other element.

## 2026-09-23 15:05 — round 2

- Meter: the spec says `labelColor` and `valueColor` are 'Realised by the label Text's tone default; no hook of its own' (and 'tone muted' for the value), but both are locked and not forwarded. The package convention and tools/check_hooks.ts say every locked, non-forwarded binding keeps a `--ds-<component>-<binding>` hook. I followed the convention: `--ds-meter-label-color` and `--ds-meter-value-color` are declared on `.ds-meter`, and each part wrapper span sets the token its Text's tone reads (`--color-foreground` on `.ds-meter__label`, `--color-foreground-muted` on `.ds-meter__value-text`) to that hook. This is the same inverse-surface pattern Toast and Tooltip use. The doc should drop 'no hook of its own' and describe this re-scope, or list these two bindings under composition forwards if Text gains a color override (Text's `color` is locked, so today it can't be forwarded).
- Meter: the invalid-range warning's `<max>`/`<min>` placeholders and the 'distinct min/max pair' key don't say whether they use the raw props or the substituted finite bounds (NaN → 0/100). I used the substituted bounds for both.
- Meter: the web notes give the `label` and `valueText` wrappers only `flex-shrink`. I also added `min-inline-size: 0` on the label wrapper, since a flex item won't shrink below its content without it, and `white-space: nowrap` on the value wrapper so its text really doesn't wrap.
- Meter: the spec doesn't say which class names the wrapper spans get. I used `ds-meter__label` and `ds-meter__value-text` (the camelCase part name made kebab-case).

## 2026-09-23 19:05 — round 1

- Meter: the doc says labelColor/valueColor have 'no hook of its own', but the overrides section says every locked binding keeps its hook and the web notes list only track and fill as locked hooks. I followed the binding descriptions and dropped --ds-meter-label-color and --ds-meter-value-color (and the --color-foreground re-scope on the wrappers). Say plainly whether locked, Text-realised bindings get a hook; the Lit build still declares them.
- Meter: 'warns once per distinct min/max pair for the life of the process' is implemented as a module-level Set checked in a useEffect. Under React StrictMode or SSR the warning fires only on the client after mount; the doc does not say whether server render should warn.

## 2026-09-23 19:06 — round 2

- Meter: the doc says labelColor/valueColor have 'no hook of its own' (and the web notes list only track and fill as locked hooks), but the hooks gate requires every locked binding to declare a --ds-meter-<binding> hook read by the rules. I kept the hooks, realised by re-scoping --color-foreground / --color-foreground-muted on the label and value wrappers so the Texts stay unrestyled. Reconcile the binding descriptions with the gate: either say these bindings carry hooks, or exempt Text-tone-realised locked bindings in check_hooks.
