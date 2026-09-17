# Gaps reported while generating Disclosure for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:48 — round 1

- Disclosure: file already existed from a prior generation but predated the overrides/testability-hook conventions (no `overrides` prop, no `data-ds`/`data-part` hooks, CSS used raw tokens instead of `--ds-disclosure-*` hooks). Brought it in line with Button/Card: added `DisclosureOverridableBinding` + `overrides` prop, rewrote CSS to define all style-binding hooks (including locked ones) on `.ds-disclosure` and read from the hooks, added `data-ds="Disclosure"` on the root and `data-part` on `triggerIcon` and `panel` (the `trigger` button itself is reachable by role+accessible name so it was left without a `data-part`, matching Menu's trigger).
- Disclosure: overrides are consumer-facing style hooks on the root `<div>`, but the pre-existing `DisclosureProps` type extends `ComponentPropsWithoutRef<'button'>` (since `ref`/`...rest` target the inner trigger button, per the spec's `useImperativeHandle`). This means a consumer-supplied `style` prop is typed as button CSSProperties but is applied to the wrapper div, not the button — same shape either way in practice, so left as-is rather than widening the prop surface.

## 2026-09-10 17:45 — round 1

- Disclosure: the schema's onToggle event description says it fires with 'the new boolean open and a reason: pointer, keyboard, or controlled (Accordion relies on it)', but the pre-existing implementation (and the Lit/RN versions) dropped the reason entirely, passing only `open`. Restored it for web: pointer/keyboard is inferred from the native click's `event.detail === 0` heuristic (0 means keyboard-dispatched), and `controlled` is detected by watching the `open` prop for external changes not already reported via the trigger's own click (guarded with a self-echo ref so a controlled consumer that updates `open` in response to its own onToggle doesn't get double-fired). Lit and RN still lack this parameter — flagging for whoever generates those next since it's the same schema event.
- Disclosure: DisclosureProps still extends ComponentPropsWithoutRef<'button'> even though overrides/style/data-ds apply to the wrapper <div>, not the trigger button (pre-existing from the last generation round, left as-is — same CSSProperties shape either way, and widening the prop surface wasn't asked for).

## 2026-09-16 05:02 — round 1

- Disclosure: the conventions say `ref` goes on the root element (the wrapping <div>), but Accordion (packages/react/src/Accordion.tsx) passes `ref` expecting the trigger HTMLButtonElement for its arrow-key focus movement; kept `Ref<HTMLButtonElement>` on the trigger and documented it in the JSDoc. The doc should say which element `ref` resolves to for a component whose root is not its interactive element.
- Disclosure: platforms.web.notes say 'Chevron is an inline SVG with aria-hidden', contradicting the `icon` style binding ('the chevron is `Icon name="chevron-right" inline`') and the rule against hand-drawn SVGs; used the system Icon (decorative, so aria-hidden) inside a `triggerIcon` wrapper span that carries the color and rotation.
- Disclosure: the `icon` binding has no `part`; applied it to the `triggerIcon` anatomy part (a wrapper span setting currentColor, which Icon inherits) rather than to the Icon itself, so the child is not restyled. Web has no Icon `overrides.size` forward (native does); inline Icon already tracks the trigger font size.
- Disclosure: `focusRing`, `focusRingWidth`, `minTarget`, `disabledOpacity` and `transition` have no `part`; applied focus ring, min target and disabled opacity to the trigger, and transition to the chevron rotation per its description.
- Disclosure: `triggerBackgroundHover` says 'hover and pressed' but its state is only `hover`; styled both :hover and :active, and suppressed it while aria-disabled.
- Disclosure: the web props base is not specified (root is a <div>, but the native attributes belong to the button); kept `extends ComponentPropsWithoutRef<'button'>` with rest forwarded to the trigger, omitting className/style/type/disabled/aria-expanded/aria-controls/aria-disabled/onClick/onToggle.
- Disclosure: controlled-mode reason `controlled` — the doc does not say whether a consumer's `open` change that merely echoes a user toggle already reported as `pointer`/`keyboard` should fire again; chose to suppress the echo and fire `controlled` only for changes the component did not report. Nor does it say whether `onToggle` fires with `controlled` on initial mount (chose no).
- Disclosure: the `disabled-trigger-does-not-toggle` scenario checks `state: disabled`; with aria-disabled (not the native attribute) this is asserted as aria-disabled="true" and the button not being :disabled.
- Disclosure: 'focus inside the panel moves to the trigger on close' does not define what counts as focus-within once focus has left for a non-focusable area (relatedTarget null); chose to restore only when the flag is set and document.activeElement is body/null or still inside the hidden panel.
- Disclosure: renders-heading-level-* scenarios only say `renders: true`; the test also asserts the heading of that level contains the trigger, since that is what headingLevel means.

## 2026-09-17 05:12 — round 1

- Disclosure: the `onToggle` timing is `after-change`, but in controlled mode the state only changes when the consumer passes back `open`. So a user toggle can only be reported as a request before the change, not after it. Chose: controlled mode fires in the click handler, uncontrolled mode fires after the new state is committed. The doc should say that controlled `after-change` means 'the component's request', not 'the committed state'.
- Disclosure: 'a pending request that is never echoed is cleared at the next `open` change' leaves open what happens when the user clicks twice before the consumer echoes either click. Chose: only the latest request is remembered, so an echo of the first click counts as `controlled`.
- Disclosure: the schema gives the trigger no line-height binding. Chose: `var(--font-line-height-normal)` directly, with no override hook.
- Disclosure: the web notes list which button attributes the component owns but leave out `children`, which the schema redefines as panel content. Chose: `children` is also omitted from the button props and goes to the panel.
- Disclosure: the spec doesn't say where a consumer's `id` goes. Chose: `id` goes on the trigger button (it sits in the button's props), and the panel id is `<id>-panel`, generated with `useId()` when `id` isn't given.
- Disclosure: the `transition` binding and the RTL mirroring both use `transform` on the same `triggerIcon` wrapper. Chose: the mirror and rotation are combined in one transform (`scaleX(-1) rotate(90deg)`), so under RTL the chevron animates from the mirrored state and doesn't jump.
