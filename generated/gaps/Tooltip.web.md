# Gaps reported while generating Tooltip for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:34 — round 1

- Tooltip: composition maps the `text` anatomy part to Text, but Text's `tone` enum has no value for the locked `color.inverse.foreground` token — using it would force restyling a child (forbidden), so the text renders as a plain `<span data-part="text">` instead.
- Tooltip: `delay: default` is documented as only 'roughly 600ms' (motion.duration.base × 3) with no exact number, and the toolbar 'warm' effect names no duration at all; hardcoded DEFAULT_DELAY_MS=600 and reused it for the warm window since nothing else is given.
- Tooltip: WCAG 1.4.13 'hoverable' requires the pointer be able to cross the `offset` gap onto the popup without it hiding, but no grace period is specified; added an internal 100ms close-grace timer (not a token, not configurable).
- Tooltip: `children` is typed `ReactElement` rather than `ReactNode` (unlike other `content`-typed props) because exactly one element must be cloned to attach aria-describedby/labelledby and hover/focus handlers; if that child already carries its own `ref`, cloning replaces it since there's no ref-merge helper in the package for an arbitrary external ref.
- Tooltip: the doc calls a non-focusable child 'an error' but there is no runtime way to verify focusability of an arbitrary passed element; only a dev warning fires when `children` isn't exactly one element.
- Tooltip: `start`/`end` placement is treated as logical (inline-start/inline-end, flipping physical side by `getComputedStyle(trigger).direction`) since the doc doesn't say how placement interacts with RTL.
- Tooltip: the canonical generated gate test (generated/behavior/Tooltip.web.test.tsx) calls `getByRole('tooltip')` on an unconditioned render with no hover/focus, expecting the popup to always be in the DOM — this contradicts the documented hover/focus-triggered visibility. The already-merged Menu component fails the identical `getByRole('menu')` check for the same reason, so this looks like a pre-existing tools/behavior_tests.py limitation for hover/click-revealed overlays, not something introduced here.

## 2026-09-10 02:16 — round 1

- Tooltip: schema gives no explicit duration for `motion.duration.base` or the toolbar 'warm' window length, so the existing implementation hardcodes DEFAULT_DELAY_MS=600ms (matching the doc's 'roughly 600ms') and reuses that same value for WARM_WINDOW_MS, plus an unspecified 100ms CLOSE_GRACE_MS to let the pointer cross the offset gap onto the popup — none of these three constants are backed by a token.
- Tooltip: schema's `keyboard` block only lists Escape; the web notes also imply hide-on-blur/pointerleave which are not in the `keyboard` table, so those are treated as pointer/focus behavior rather than keyboard actions, per 'implement every key → action exactly as listed and nothing else'.
- Tooltip: anatomy names `trigger` and `popup` as parts, but only `text` gets a `data-part` hook — the trigger is the caller's own cloned element (not an owned node) and the popup is the root itself (already identified by `data-ds="Tooltip"`), so no additional `data-part` was added for either.

## 2026-09-10 18:00 — round 1

- Tooltip: the schema's platforms.web attribute list (role=tooltip, id) reads as belonging to the single portaled popup div, but a later prose note requires the description to be 'always in the accessibility tree' via a separate visually-hidden copy distinct from 'a second copy' (the visible popup). I split these into two nodes (persistent hidden span carrying id+role=tooltip; portaled popup now aria-hidden and copy-only) since the terse attribute list and the prose note are only reconcilable this way — flagging in case the intended architecture was instead a single always-mounted node whose visibility is toggled with CSS rather than mount/unmount.
- Tooltip: no dedicated icon exists in the shared Icon set for 'bold'/'italic'/'underline' toolbar-style demos, so the icon-only story reuses `Icon name="check"` as a placeholder glyph, matching the existing convention in Toolbar.stories.tsx rather than a semantically accurate icon.
- Tooltip: WARM_WINDOW_MS and CLOSE_GRACE_MS (toolbar 'warm' window and hover-to-popup grace period) are not backed by a schema token — the doc names the effects but not durations, so these reuse the default show-delay length and an arbitrary 100ms respectively (pre-existing choice, left unchanged).

## 2026-09-16 05:54 — round 1

- Tooltip: platforms.web says the `<div role="tooltip" id>` is the popup, but Behavior says the visually-hidden span carries the id and role=tooltip and the bubble is aria-hidden. I followed Behavior; the web platform note should be brought into line.
- Tooltip: the popup is the root carrying data-ds, but it is only mounted while shown, so a closed tooltip has no data-ds node at all. The `renders` scenarios therefore assert the always-present role=tooltip span; the doc should say what `renders` finds while closed.
- Tooltip: `open` is controlled but there is no open-change event, yet the Keyboard rule expects Escape to close the tooltip, including in the Keyboard story that renders it with open=true. I made Escape a dismissal that overrides `open` until the prop changes or the trigger loses hover and focus; the doc should say whether that is right.
- Tooltip: the `delay` description says the warm window lasts one motion.duration.loop, but constant `warmWindow` says motion.duration.base. I used the constant (base).
- Tooltip: it is unclear whether the warm window also skips the delay for `delay: default` tooltips, or whether only `delay: none` is instant. I apply warm to every tooltip, and `none` is always instant.
- Tooltip: overlay.layer is `tooltip` but the `layer` style binding and platform notes say layer.toast. I used --layer-toast.
- Tooltip: fontFamily/fontSize/lineHeight style the composed Text, but the override contract puts every binding as a hook on the root. I declare the root hooks and also forward those three overrides to Text's `overrides`, with Text `size="sm"`. Consumer CSS setting --ds-tooltip-font-size cannot reach Text, and the doc should name the forward.
- Tooltip: maxWidth is `computed: times 3`, but it is unclear whether an override replaces the whole value or the base that is multiplied. The ×3 stays in the rule, so an override sets the base (`calc(var(--ds-tooltip-max-width) * 3)`).
- Tooltip: logic must read hoverDelay/warmWindow/pointerGrace and `offset` through their token expressions, but the doc does not say how on web. I resolve them at the moment they are needed by setting the expression on a hidden probe span and reading its computed style; jsdom resolves them to 0.
- Tooltip: nothing says whether Escape on a tooltip inside a Dialog should also close the Dialog. I stop propagation in the capture phase while the tooltip is visible, so the first Escape only hides the tooltip.
- Tooltip: the examples name icons (bold, italic, copy link) that tools/icon-paths.json does not have. The stories use `list`, `dash` and `external` as stand-ins; the glyph table needs those icons, or the examples need different ones.
- Tooltip: the `enter` binding says 'Fade in' and gives no exit motion or slide. I used an opacity fade only, with `exit` as the fade-out duration, and none under reduced motion.
- Tooltip: the doc gives no rule for touch focus: 'Never shown on touch' conflicts with 'shows on focus of any kind' when a tap focuses the trigger. Hover is suppressed on touch/coarse pointers, but focus still shows it.

## 2026-09-17 09:52 — round 1

- Tooltip: the generator rules say every component takes `ref` on its root, but the Behavior section says Tooltip exposes no `ref`; I followed the Behavior section and dropped the prop.
- Tooltip: the rules say the override hooks `--ds-tooltip-*` go on the component root, and the root (`data-ds`) is now the visually-hidden span. The bubble is rendered in a portal, so hooks set on the span would never reach it. I kept the hooks, the `ds-tooltip` class and inline overrides on the popup element, and gave the hidden span the element class `ds-tooltip__description`. The doc should say which element carries the class and the hooks when `data-ds` and the styled surface are different nodes.
- Tooltip: `children` has type `content` (ReactNode), but the notes require exactly one element that gets cloned. I typed it `ReactElement` so the clone type-checks; the doc could state that on web the slot is a single element.
- Tooltip: the composed Text part is given `data-part="text"` and an `overrides` object. The composition lists only `element` and `size` as props, and 'receives exactly the listed props' does not say whether the data-part hook and forwarded overrides count as props.
- Tooltip: `open` has no default and no change event. I read 'stays hidden until the `open` prop next changes' as: an Escape dismissal is cleared only by a change to `open` while controlled, and by losing hover and focus while uncontrolled. The doc does not say what happens to a dismissed uncontrolled tooltip that is re-hovered before the pointer leaves; I chose to keep it hidden.
- Tooltip: the `enter` and `exit` fades need the bubble to stay mounted while it fades out, but the notes say the bubble is 'rendered through a portal only while shown'. I keep it mounted until the exit duration ends, which is 0 under reduced motion.
- Tooltip: the offset gap is read by resolving `var(--ds-tooltip-offset)` through a hidden probe's `padding-left`. The notes say to resolve constants 'through getComputedStyle' but do not say which property to use for a length.
