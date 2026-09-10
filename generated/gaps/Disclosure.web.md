# Gaps reported while generating Disclosure for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:48 — round 1

- Disclosure: file already existed from a prior generation but predated the overrides/testability-hook conventions (no `overrides` prop, no `data-ds`/`data-part` hooks, CSS used raw tokens instead of `--ds-disclosure-*` hooks). Brought it in line with Button/Card: added `DisclosureOverridableBinding` + `overrides` prop, rewrote CSS to define all style-binding hooks (including locked ones) on `.ds-disclosure` and read from the hooks, added `data-ds="Disclosure"` on the root and `data-part` on `triggerIcon` and `panel` (the `trigger` button itself is reachable by role+accessible name so it was left without a `data-part`, matching Menu's trigger).
- Disclosure: overrides are consumer-facing style hooks on the root `<div>`, but the pre-existing `DisclosureProps` type extends `ComponentPropsWithoutRef<'button'>` (since `ref`/`...rest` target the inner trigger button, per the spec's `useImperativeHandle`). This means a consumer-supplied `style` prop is typed as button CSSProperties but is applied to the wrapper div, not the button — same shape either way in practice, so left as-is rather than widening the prop surface.

## 2026-09-10 17:45 — round 1

- Disclosure: the schema's onToggle event description says it fires with 'the new boolean open and a reason: pointer, keyboard, or controlled (Accordion relies on it)', but the pre-existing implementation (and the Lit/RN versions) dropped the reason entirely, passing only `open`. Restored it for web: pointer/keyboard is inferred from the native click's `event.detail === 0` heuristic (0 means keyboard-dispatched), and `controlled` is detected by watching the `open` prop for external changes not already reported via the trigger's own click (guarded with a self-echo ref so a controlled consumer that updates `open` in response to its own onToggle doesn't get double-fired). Lit and RN still lack this parameter — flagging for whoever generates those next since it's the same schema event.
- Disclosure: DisclosureProps still extends ComponentPropsWithoutRef<'button'> even though overrides/style/data-ds apply to the wrapper <div>, not the trigger button (pre-existing from the last generation round, left as-is — same CSSProperties shape either way, and widening the prop surface wasn't asked for).
