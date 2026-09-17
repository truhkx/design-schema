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

## 2026-09-16 05:44 — round 1

- FocusScope: platforms.web.attributes lists a static `tabindex=-1`, but the scenario the-wrapper-is-not-focusable and the Web guidance (`tabindex={autoFocus === 'container' ? -1 : undefined}`) make it conditional; chose conditional.
- FocusScope: the Web guidance says a sentinel 'redirects to the opposite edge', while platforms.web.notes says each sentinel continues the direction of travel (start → first, end → last); followed the notes.
- FocusScope: returnFocusTo shape `RefObject<HTMLElement | View>` names a React Native type; web types it `RefObject<HTMLElement | null>`.
- FocusScope: sentinels are described without saying whether they render when `trapped` is false (they would add two do-nothing tab stops); rendered them only while trapped.
- FocusScope: the doc doesn't say what a sentinel or the focusin pull-back does while the scope is paused (`active: false`) or not top of the stack; they do nothing, so focus can rest on a sentinel of a paused scope.
- FocusScope: the focusin pull-back has no target when the scope has no focusable descendants and autoFocus is not container (the wrapper has no tabindex); it leaves focus where it went, and relies on the development warning.
- FocusScope: 'Nested scopes register in a module-level stack' doesn't cover scopes mounted in the same commit, where child effects run before the parent's; added a context-held parent link so an outer scope inserts below its already-registered inner scope.
- FocusScope: 'disabled subtrees are excluded' is unspecified for aria-disabled (which the system keeps focusable); only native :disabled (including fieldset[disabled] descendants), inert and aria-hidden are excluded.
- FocusScope: the examples' `children` are prose descriptions ('A full-screen onboarding overlay with its own close Button'); the stories pass the string as args exactly and render it as Text plus the Buttons it names in a story render function.
- FocusScope: anatomy `scope` is the root; put data-part="scope" on it but let a composing overlay's own data-part (Dialog's `focusScope`) override it, since the doc doesn't say which wins.
- FocusScope: Shift+Tab from the wrapper itself (autoFocus container) isn't covered by the keyboard rules; it leaves the scope and the focusin pull-back returns focus to the first descendant.
- Dialog (found while verifying): Button writes data-part="container" after ...rest, so Dialog's data-part="closeButton" never reaches the DOM and the generated scenario initial-focus-lands-on-the-close-button compares focus against the dialog root; focus is correct, the part hook is lost.

## 2026-09-17 09:45 — round 1

- FocusScope: 'FocusScope's own data-part="scope" wins, and a composing overlay puts its own part on an element it owns' conflicts with Dialog, AlertDialog, BottomSheet, ActionSheet, Popover and SidePanel, which all pass data-part="focusScope" to FocusScope; I made scope win, so those overlays' focusScope part no longer shows up on the web until their docs/regens move the part to an element they own.
- FocusScope: 'everything inside a fieldset[disabled]' is excluded, but browsers keep links and tabindex elements inside a disabled fieldset focusable (and the first legend's controls stay enabled); I excluded the whole subtree as written, so the walker can disagree with the browser's real Tab order there.
- FocusScope: 'a scope whose active turns back on moves to the top' can raise an outer scope above a still-active inner scope (e.g. Popover active={open} nested in a Dialog, reopened while a deeper scope is up); I implemented it literally. The doc should say whether reactivation should respect tree nesting.
- FocusScope: the focusin pull-back target when the last focused descendant is gone is unspecified beyond 'last focused descendant'; I fall back to the first focusable descendant, then to the wrapper when autoFocus is container, else leave focus where it went.
- FocusScope: Tab (not Shift+Tab) from the wrapper under autoFocus container is said to go to the first descendant but not whether onEscapeAttempt fires; I fire nothing for it (only backward fires, as stated).
- FocusScope: the empty-scope dev warning says 'a trapped scope with no focusable descendants' but autoFocus container gives the wrapper as a pull-back target, so it is not strictly inescapable-without-target; I kept the warning for every trapped empty scope.
- FocusScope: the restore marker is placed as the opener's sibling, so if the opener was removed together with its parent the marker is gone too and nothing is restored; the doc doesn't cover that case, and I leave focus alone there.
- FocusScope: the example stories' `children` are prose descriptions ("A full-screen onboarding overlay with its own close Button"); I pass the text as args and render the named controls (Close, Apply filters, Accept/Decline, Options) in a custom render, which is more than 'exactly its given as args'.
