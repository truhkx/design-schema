# Gaps reported while generating FocusScope for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 22:37 — round 1

- FocusScope: 'autoFocus: container' asks to focus 'the scope's own wrapper (made focusable with tabindex -1)', but the host has delegatesFocus:true, so calling this.focus() on the host would redirect into the shadow tree's first focusable element (the start sentinel) rather than staying on the host. Added a dedicated invisible tabindex=-1 anchor as the shadow tree's first descendant so delegatesFocus lands there instead, approximating 'focus stays on the wrapper, nothing interactive is announced' — not literally focusing the host element, since that's not reachable through delegatesFocus.
- FocusScope: sentinel focus handling isn't specified beyond 'catch focus arriving from the browser chrome'. Implemented as pass-through: focus arriving at the start sentinel moves to the first focusable descendant, end sentinel to the last, rather than wrapping to the opposite edge — treated as continuing the user's tab direction rather than another wrap (which is already handled by the Tab/Shift+Tab keydown interception at the real edges).
- FocusScope: restoreFocus's 'next focusable element in the document if [the opener] is gone' has no defined ordering source. Implemented via a focusable-elements snapshot of document.body taken at mount time, restoring to the next surviving entry after the opener's original position (falling back to the previous one) — a best-effort approximation since the live DOM may have changed by unmount.
- FocusScope: added an untested dev-only console.warn (import.meta.env.DEV) when a trapped scope has no focusable descendants, since that would create an inescapable trap; not in the spec's explicit behavior list but consistent with the package's existing dev-warning convention (e.g. Landmark.ts) and the focus-trap/keyboard-operable a11y requirements.
- FocusScope: 'active' pausing nested scopes is described both as an explicit consumer-set prop ('Pause the scope... used while a nested scope is open') and, in the web platform notes, as automatic via a 'module-level scope stack... only the top is active'. Implemented both: a module-level stack determines which trapped+active scope is innermost/effective, and the explicit `active` prop can additionally pause a scope regardless of stack position — not spelled out as a combination anywhere in the schema.

## 2026-09-10 02:15 — round 1

- FocusScope: schema lists no styles and 'Overridable: none / Locked: none', so no `overrides` property was added — only visually-hidden sentinel styling exists, which is token-exempt by convention.
- FocusScope: 'container' autoFocus relies on `delegatesFocus` redirecting `this.focus()` to the shadow tree's tabindex=-1 anchor node standing in for the host, since the host itself carries no tabindex; this satisfies 'focus goes to the scope's own wrapper' without making the host part of the natural tab order.
