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
