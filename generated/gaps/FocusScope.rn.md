# Gaps reported while generating FocusScope for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 22:42 — round 1

- FocusScope: the prompt's behavior-scenarios block was left as an unfilled placeholder ({{BEHAVIOR_COUNT}}/{{BEHAVIOR_YAML}}), so no real scenarios were provided — I did not fabricate a FocusScope.test.tsx rather than rubber-stamp untested behavior; add one once real scenarios exist.
- FocusScope (rn): autoFocus 'first'/'last'/'container' are indistinguishable on native — RN has no public API to walk arbitrary `children` for focusable descendants without adding ref-forwarding to every composed component (Button, Input, etc.), which is out of scope for this file. I made all three (everything but 'none') focus the wrapper View via setAccessibilityFocus; this only matches the doc's explicit fallback for 'container', not a real 'first'/'last' distinction.
- FocusScope (rn): restoreFocus's 'opener's node handle' has no capture mechanism on native since there's no opener ref prop and RN exposes no generic 'currently focused view' getter. I used TextInput.State.currentlyFocusedInput() as the only available proxy, so restoration only works when the opener was a TextInput — a Button/Pressable opener (the common case for a trigger that opens a dialog) will not get focus restored on unmount.
- FocusScope: onEscapeAttempt's payload type isn't specified beyond 'with the direction' in prose; I typed it as `'forward' | 'backward'`.
- FocusScope: the component has no open/trigger concept of its own (unlike Dialog), so the required 'Keyboard' story wraps it in local demo state (a trigger Button that mounts the scope) to satisfy the 'rendered open with its trigger and three focusable children' testability rule.

## 2026-09-10 02:14 — round 1

- FocusScope: RN has no API to walk arbitrary children for the first/last focusable descendant, so autoFocus values 'first', 'last', and 'container' all resolve to focusing the wrapper View; only 'none' differs — documented as an acknowledged platform limit in the component's JSDoc.
- FocusScope: restoreFocus captures the opener via TextInput.State.currentlyFocusedInput(), the only 'currently focused element' RN exposes generically — an opener that isn't a TextInput (e.g. a Pressable button) cannot be captured, so focus restoration silently no-ops in that case.
- FocusScope: onEscapeAttempt is accepted as a prop for API parity with web/lit but can never fire on native since there is no Tab order to confine.
- FocusScope: keyboard-operable/focus-trap requirements are only partially met — trapped only maps to accessibilityViewIsModal (screen-reader swipe confinement); a hardware keyboard's Tab key is not confined at all, a stated platform limit rather than an implementation gap.

## 2026-09-10 18:04 — round 1

- FocusScope: the file already existed from a prior generation but was missing the `returnFocusTo` prop entirely (schema lists it as a top-level prop, and platform notes say it's required on native when the opener isn't a TextInput). Added it: React.RefObject<View>, read at unmount (not captured at mount, since it names a stable trigger) and preferred over the captured TextInput fallback when present. Added a `ReturnFocusTo` story demonstrating it, since it's not an enum and so wasn't covered by the existing 'one story per enum value' set.
- FocusScope: several existing consumers (Dialog, Popover, Menu, Select, SidePanel) already set `restoreFocus={false}` on their composed FocusScope and reimplement restore-focus-to-trigger manually via their own triggerRef + AccessibilityInfo.setAccessibilityFocus, presumably because `returnFocusTo` didn't exist yet when they were generated. Those components are out of scope for this task (only FocusScope itself was requested) but are now candidates to simplify by passing `returnFocusTo={triggerRef}` instead of hand-rolling the restore.
- FocusScope: schema shape for returnFocusTo is platform-neutral (`RefObject<HTMLElement | View>`); typed it as `React.RefObject<View>` on RN to match this package's existing trigger-ref convention (Menu.tsx, Popover.tsx, SidePanel.tsx, Select.tsx all use `React.useRef<View>(null)` for trigger refs).
