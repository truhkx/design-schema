# Gaps reported while generating Dialog for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:11 — round 1

- Dialog: the schema names the title prop `title`, but `HTMLElement` already defines `title` as the native tooltip attribute (per this package's own rule for `role`/`title`). Renamed the JS property and attribute to `heading` (not just the JS name, since leaving the HTML attribute as `title` would trigger native browser tooltips on hover). The `initialFocus` enum value `'title'` was kept as-is since it's a literal, not a property name.
- Dialog: the 'action' close reason (distinct from escape/close-button/scrim) has no described trigger mechanism for the Lit platform. Inferred it from native <dialog> semantics: whenever the inner <dialog> fires its native `close` event without ds-dialog having driven it via the `open` property (e.g. a slotted form submitted with `formmethod="dialog"`), ds-dialog reports reason `action` and syncs `open` back to false. Not verified against a real form-in-dialog scenario.
- Dialog: footer action alignment (justify) isn't specified by the schema. Left it at Stack's default (start-aligned), matching Card's footer convention, rather than assuming a right-aligned action row — worth confirming against the intended visual.
- Dialog: enter/exit animation technique (opacity + translateY via CSS `@starting-style` and a `transitionend`-driven finish/dispatch, gated by `prefers-reduced-motion`) was chosen as the modern idiomatic approach for a native top-layer `<dialog>`; the schema doesn't prescribe an exact mechanism for Lit the way it does for RN's `Animated`.
- Dialog: when `dismissible` is false, the close button stays visible and focusable but its click/press handler is a no-op ('the close button and scrim do nothing' per the doc), rather than being disabled or hidden — flagging the literal reading in case a disabled/hidden affordance was actually intended.
- Dialog: `initialFocus: 'close'` or `'title'` is honored even when `dismissible` is false (the schema doesn't state a conflict rule), so a non-dismissible dialog can still be told to focus the close button, which is present but inert.
- Could not execute `vitest run` in this sandboxed session (the shell tool call required interactive approval that wasn't available here); typecheck (`tsc --noEmit`) passes, and the two non-trivial test assertions (`has-accessible-name`, `control-is-focusable`) were manually verified against Lit's `delegatesFocus`/shadow-retargeting semantics rather than run live.
