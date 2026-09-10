# Gaps reported while generating FocusScope for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 22:42 — round 1

- FocusScope: the prompt's behavior-scenarios block was left as an unfilled placeholder ({{BEHAVIOR_COUNT}}/{{BEHAVIOR_YAML}}), so no real scenarios were provided — I did not fabricate a FocusScope.test.tsx rather than rubber-stamp untested behavior; add one once real scenarios exist.
- FocusScope (rn): autoFocus 'first'/'last'/'container' are indistinguishable on native — RN has no public API to walk arbitrary `children` for focusable descendants without adding ref-forwarding to every composed component (Button, Input, etc.), which is out of scope for this file. I made all three (everything but 'none') focus the wrapper View via setAccessibilityFocus; this only matches the doc's explicit fallback for 'container', not a real 'first'/'last' distinction.
- FocusScope (rn): restoreFocus's 'opener's node handle' has no capture mechanism on native since there's no opener ref prop and RN exposes no generic 'currently focused view' getter. I used TextInput.State.currentlyFocusedInput() as the only available proxy, so restoration only works when the opener was a TextInput — a Button/Pressable opener (the common case for a trigger that opens a dialog) will not get focus restored on unmount.
- FocusScope: onEscapeAttempt's payload type isn't specified beyond 'with the direction' in prose; I typed it as `'forward' | 'backward'`.
- FocusScope: the component has no open/trigger concept of its own (unlike Dialog), so the required 'Keyboard' story wraps it in local demo state (a trigger Button that mounts the scope) to satisfy the 'rendered open with its trigger and three focusable children' testability rule.
