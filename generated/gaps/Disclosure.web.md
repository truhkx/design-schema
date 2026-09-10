# Gaps reported while generating Disclosure for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:48 — round 1

- Disclosure: file already existed from a prior generation but predated the overrides/testability-hook conventions (no `overrides` prop, no `data-ds`/`data-part` hooks, CSS used raw tokens instead of `--ds-disclosure-*` hooks). Brought it in line with Button/Card: added `DisclosureOverridableBinding` + `overrides` prop, rewrote CSS to define all style-binding hooks (including locked ones) on `.ds-disclosure` and read from the hooks, added `data-ds="Disclosure"` on the root and `data-part` on `triggerIcon` and `panel` (the `trigger` button itself is reachable by role+accessible name so it was left without a `data-part`, matching Menu's trigger).
- Disclosure: overrides are consumer-facing style hooks on the root `<div>`, but the pre-existing `DisclosureProps` type extends `ComponentPropsWithoutRef<'button'>` (since `ref`/`...rest` target the inner trigger button, per the spec's `useImperativeHandle`). This means a consumer-supplied `style` prop is typed as button CSSProperties but is applied to the wrapper div, not the button — same shape either way in practice, so left as-is rather than widening the prop surface.
