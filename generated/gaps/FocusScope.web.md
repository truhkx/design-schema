# Gaps reported while generating FocusScope for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 22:31 — round 1

- onEscapeAttempt payload shape wasn't specified beyond 'with the direction' — typed it as `(direction: 'forward' | 'backward') => void` and exported `FocusScopeEscapeDirection`; a different payload shape (e.g. an object, or a cancelable event) would be a breaking change.
- restoreFocus's 'next focusable element in the document if that one is gone' fallback requires knowing the opener's former DOM position after it's removed. Implemented by inserting an invisible marker Comment node next to the opener on mount and, at unmount, finding the first focusable element after that marker in document order; not spec-verbatim, just the only way to satisfy the requirement.
- The sentinel focus redirect direction (start→first, end→last) is my interpretation of 'catch focus arriving from the browser chrome' as distinct from Tab-key wrap-around (already handled by the keydown handler at real edges). A focus-trap library reading the wrap semantics into the sentinels themselves would redirect the opposite way; behavior is unverified against a reference implementation.
- The wrapper renders as a plain display:block div (matching Landmark's unstyled-wrapper pattern) rather than display:contents, because `autoFocus: 'container'` requires the div itself to be focusable via tabindex, which display:contents defeats in most browsers. This means FocusScope always inserts one extra box into the DOM/layout that a zero-footprint wrapper would avoid.
- No explicit visibility (display:none/offsetParent) filtering in the focusable walker beyond aria-hidden/inert/disabled/tabindex<0 — the schema doesn't call it out, so hidden-but-attached elements with a positive tabindex would be treated as focusable.

## 2026-09-10 02:15 — round 1

- FocusScope: the derived 'control-is-focusable' scenario assumes a focusable root control, but FocusScope's root is tabindex=-1 (programmatically focusable only, never Tab-reachable itself) — interpreted 'focusable' as 'accepts .focus() calls', not 'reachable by Tab'.
- FocusScope: the keyboard rule 'Tab, from: first, expect: focus-next' (ordinary forward movement) has no explicit handler — it's satisfied by native browser Tab order since the component only intercepts Tab at the trapped edges, which may or may not be what the keyboard gate expects to see as an explicit code path.

## 2026-09-10 17:56 — round 1

- FocusScope: the schema's returnFocusTo shape is written cross-platform as `RefObject<HTMLElement | View>`, but `View` is a React Native type with no web equivalent — typed it as `RefObject<HTMLElement>` for this platform and wired it into the unmount restore logic (preferred over the recorded opener, which still wins over the next-focusable fallback) since the existing FocusScope.tsx (present since the initial commit) was otherwise complete but had never implemented this prop at all.
