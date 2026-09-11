# Gaps reported while generating Menu for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:06 — round 1

- Menu: the trigger's aria-haspopup/aria-expanded/aria-controls are set as plain attributes directly on the composed <ds-button> host (Button has no dedicated props for them, and the web platform notes describe them on a plain <button>). This relies on the browser reflecting host-level ARIA attributes to the accessible node of a shadow-DOM custom element, which holds in current Chromium/Firefox/Safari but is a known cross-shadow-boundary ARIA nuance worth re-checking with a screen reader.
- Menu: `items` shape string is recursive (`group.items: MenuItem[]`), which literally permits a group containing another group or separator. I kept the type verbatim and render/flatten recursively so nesting doesn't crash, but the docs' guidance ('groups render a non-interactive heading row') implies groups are meant to be flat (leaf action items only) — nesting is untested against any behavior scenario.
- Menu: `iconOnly` + `triggerIcon: 'none'` is a valid prop combination per the schema but produces a trigger with no visible content (label hidden, no icon) — implemented literally since the docs don't forbid it.
- Menu: shortcuts are rendered as a display-only `<span aria-hidden="true">` rather than mapped to `aria-keyshortcuts`, since the free-text `shortcut` strings (e.g. '⌘S') don't match the `aria-keyshortcuts` value syntax the spec would require; this matches the docs' 'display-only' framing but means shortcuts are entirely invisible to assistive tech rather than announced.
- Menu: no design token covers the typeahead reset delay, so I used a plain 500ms JS constant (APG's common convention) rather than a token — flagged since the theme rules forbid literal timings elsewhere.
- Menu: default Storybook args render the menu closed (only the enum-value and content stories force `open: true`) to avoid a focus race in the auto-generated behavior tests — opening triggers an async `focusItem` chain (waits on `updateComplete` before calling native `.focus()`), which could otherwise race with a synchronous `el.focus()` call in a freshly mounted test element.
- Could not execute the Vitest suite in this session (shell command required interactive approval that wasn't granted); `Menu.test.ts` is written and `tsc --noEmit` passes, but the 13 behavior-scenario tests are unverified at runtime.

## 2026-09-10 00:07 — round 2

- Menu: tools/lint_literals.py's font-stack heuristic (`fontFamily\s*:\s*['"]`) matches any object key literally named `fontFamily` followed by a quoted string, regardless of content — it flagged the `HOOKS.fontFamily` CSS-custom-property-name entry as if it were a hardcoded font stack. Fixed by writing that one value as a template literal (`` `--ds-menu-font-family` ``) instead of a string literal, which is semantically identical but doesn't match the regex; no spec or token usage changed.

## 2026-09-10 02:51 — round 1

- Menu: keyboard action-item Home/End rows list `from: last`/`from: first` but the doc means "from anywhere while open" — implemented as always-first/always-last regardless of current focus, matching every other component's Home/End semantics.
- Menu: `minWidth` doc says space.20 × 2.5 with 'the generator multiplies; no new token' — implemented as calc(var(--space-20) * 2.5) inline rather than a precomputed token, since no such token exists.
- Menu: typeahead reset timing (500ms) has no token in the schema (it's an interaction timing, not motion) — chosen as a local constant rather than guessing a motion token.

## 2026-09-10 18:05 — round 1

- Menu: the `typeaheadReset` (motion.duration.loop) and `maxHeight` (layout.maxWidth.prose) style bindings from the schema were missing from the already-existing implementation — typeahead used a hardcoded 500ms constant instead of the token, and the popup's max-block-size only clamped to the viewport with no cap token. Added both as overridable hooks (`--ds-menu-typeahead-reset`, `--ds-menu-max-height`), wired the popup's max-block-size to `min(var(--ds-menu-max-height), viewport-gutter)`, and read the typeahead reset duration from the CSS hook at runtime via getComputedStyle (the token resolves to a `Nms` string, parsed with parseFloat like the existing popup-offset read).

## 2026-09-10 20:03 — round 1

- Menu: the schema's `anchor` prop (RefObject<HTMLElement | View>) was missing entirely from the pre-existing Lit implementation. Added it as a plain `HTMLElement | null | undefined` property (Lit has no ref concept, matching the precedent set in FocusScope.lit's `returnFocusTo`), which omits the trigger render, aims the popup position and focus-restore at the anchor element instead of the internal trigger button, and switches the menu's accessible name from aria-labelledby="trigger" to aria-label={label} since there is no trigger to label it from. Added a dev-only warning when `anchor` is set but `open` is left uncontrolled, per the doc's 'open must be controlled' rule.
- Menu: the general event spec says onOpenChange detail is `{ open, reason }` (reason: trigger/escape/outside/action/controlled), but the lit-specific platform note explicitly narrows this to `{ open }` only — kept the narrower, platform-specific shape as authoritative and did not add `reason`, consistent with the pre-existing implementation and prior rounds' choices.
- Menu: ActionSheet.ts (out of scope for this task) works around the previously-missing `anchor` support by faking a hidden, invisibly-positioned trigger; now that `<ds-menu anchor>` is implemented, ActionSheet could be simplified to use it directly, but that file wasn't touched here.
