# Gaps reported while generating Stepper for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 19:18 — round 1

- Stepper: schema has one `transition` binding but four discrete indicator states (complete/current/upcoming/error) plus a connector; animating all of it unambiguously wasn't specified, so only the connector cross-fades between `connector` and `connectorComplete` over `transition` — the indicator itself switches instantly, same as this package's other multi-state (not binary) indicators.
- Stepper: when a step's explicit `status: 'error'` overrides the position that equals `current`, the doc doesn't say whether accessibility 'selected' state and the compact single-label reveal should follow the id match or the derived status. Chose id match (`step.id === current`) for `accessibilityState.selected`/compact-reveal, and the derived `status` for indicator color/icon and the status word (so 'has an error' wins over 'current step' in that edge case).
- Stepper: automatic `compact` on narrow viewports reuses `layout.maxWidth.prose` per the platform notes, but the exact comparison (`<` vs `<=`) isn't specified; used `windowWidth < t.layoutMaxWidthProse`, matching Table/Tabs/Menu/Select's existing pattern in this package.
- Stepper: horizontal connector placement is approximated with a fixed `marginTop` (indicatorSize/2 - connectorWidth/2) since the connector is a decorative sibling, not a measured/absolute-positioned element; there's no CSS-cascade equivalent on native to align it exactly with the indicator's center for arbitrary label heights.
- Stepper: `stepHover` ('hover and press background of a navigable step') is applied only on Pressable's `pressed` state — there is no native hover, same acknowledged limit as Button/Tabs in this package.
- Stepper: the schema's anatomy lists `description` generally (not orientation-scoped), so it renders under the label in both `horizontal` (non-compact) and `vertical`, even though the guidance prose frames descriptions as mainly a vertical-stepper concern.
- Stepper: `copy.stepOf`/`copy.stepLabel` use `{n}`/`{total}`/`{label}` placeholder syntax in the doc; implemented as small formatting functions rather than literal template substitution, matching this package's existing convention for parameterized copy (e.g. RadioGroup's `COPY.required`).

## 2026-09-16 09:48 — round 1

- Stepper: no binding sets the ring color of a complete indicator (there are complete background/foreground, current border and error border, but no complete border). I used `indicatorBorder` (color.border.strong) around the `indicatorCompleteBackground` fill; `indicatorCompleteBackground` as the ring may be what was meant.
- Stepper: `connectorComplete` has no rule for when it applies. I used position (every connector after a step before `current`), so the connector after an errored step that was already passed still shows as complete; the old code keyed it on the preceding step's status being `complete`.
- Stepper: the web renders a `nav` landmark around the list, but React Native has no nav role. The rn platform props only list `accessibilityRole=list` + `accessibilityLabel`, so the label (`copy.navLabel`) goes on the list View and there is no landmark.
- Stepper: `compact` says hidden labels are 'clipped, not removed, so they stay reachable by a screen reader'. On native each step's accessibilityLabel already carries the label, so the visible label Text is simply not rendered. The doc should say whether that satisfies the rule on rn.
- Stepper: in compact mode it's unclear whether 'Step n of m' replaces the current step's description or appears as well. I render it in the description position, replacing the description.
- Stepper: automatic compact on rn compares `useWindowDimensions().width` against `layout.maxWidth.prose`, but the stepper's own width isn't measured (the web version uses a container query). A narrow stepper inside a wide window won't collapse.
- Stepper: the only stated rule for combining the status word with the label is 'copy.stepLabel plus the status word'. There's no separator in copy and no pattern for joining them, so I join with ', ' ("Step 2: Payment, current step", as in the Accessibility prose). The doc should give a template or a join rule.
- Stepper: the status word for an explicit `status: 'current'` on a step whose id isn't `current` is unspecified. I gave it copy.current but no selected state. Upcoming steps get no status word, and copy has none for them.
- Stepper: `indicatorFontSize` sizes the numeral, but nothing says what sizes the check/danger Icon. I pass Icon size `sm` and forward an `indicatorFontSize` override to Icon's `size` override.
- Stepper: anatomy part `label`/`description` are composed Text, which takes no testID; to expose `Stepper.label`/`Stepper.description` I wrapped each in a View carrying the testID.
- Stepper: `stepHover` has state `hover` only, but its description says 'Hover and press'. I apply it on Pressable pressed or hovered (onHoverIn/onHoverOut).
- Stepper: the behavior scenario says `click: indicator` without saying which step's indicator. The tests press the first indicator; since it is aria-hidden, the query needs `includeHiddenElements: true`, and the press bubbles up to the step's Pressable.
- Stepper: `compact` is a boolean, and naming stories `<Prop><Value>` gives `CompactTrue`; I kept the existing name. The Keyboard story uses navigable all / current review so four steps can take focus, because the keyboard block gives no `given`.
