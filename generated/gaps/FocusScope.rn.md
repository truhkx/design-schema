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

## 2026-09-16 05:50 — round 1

- FocusScope: the rn platform notes say `first`, `last` and `container` all focus the wrapper because children can't be walked, but the Guidance 'React Native' section says to focus 'the first accessible descendant found by walking refs'. These contradict each other; I followed the platform notes (wrapper for all three) and treat the Guidance paragraph as stale.
- FocusScope: `returnFocusTo` shape is `RefObject<HTMLElement | View>`, but `View` is a component type and strict RN refs take instance types. I typed it `React.RefObject<ViewInstance | null>`. The shape should name a per-platform instance type, or rn should get its own shape.
- FocusScope: the rn notes don't say whether `accessibilityViewIsModal` should also depend on `active`. I kept `trapped && active`, so a paused outer scope doesn't hide the inner Menu from the screen reader.
- FocusScope: nothing says whether `autoFocus` and restore run again when `active` flips or props change after mount. I run them only on mount and unmount.
- FocusScope: the example `given.children` values are prose descriptions, not content. The stories show each description as the panel's Text, next to demo Buttons that aren't in the spec.
- FocusScope: children is required, but the Default story's args have no `children`, so the behavior scenarios have no content to render. The test setup adds a single Button as a child.
- FocusScope: the scenario `the-scope-adds-no-role` checks `attribute: role is null`, but RN has two role props. The test checks that `role`, `accessibilityRole` and `accessibilityLabel` are all undefined.
- FocusScope: the `keyboard` rules (Tab wrap) can't be implemented on native, and the notes list hardware-keyboard wrapping as a platform limit. The Keyboard story is kept for the react-native-web axe gate, but on react-native-web Tab is not confined, so a keyboard gate that checks the wrap will fail on rn. The keyboard block should mark those rules as excluded for rn.
- FocusScope: the ref convention says a component exposing its root declares `ref`, but the spec doesn't say whether FocusScope exposes its wrapper. I added `ref?: React.Ref<ViewInstance>` and pass it the internal wrapper ref through useImperativeHandle.

## 2026-09-17 09:50 — round 1

- FocusScope: the rn notes call setAccessibilityFocus on the wrapper View for first/last/container, but that View cannot be marked `accessible` (it would merge its children into one element), and iOS VoiceOver generally won't focus a non-accessible container, so the call may do nothing on iOS. I kept the documented call and added collapsable={false} so a native view exists; the doc should say what happens on iOS, or name a child to receive focus.
- FocusScope: restoreFocus says to fall back to 'the next focusable element in the document if that one is gone'; React Native has no document order to walk, so if the opener is gone nothing is restored. The rn notes don't mention this limit.
- FocusScope: the rn notes don't say when the TextInput opener is captured. The web text says 'on mount', but a child TextInput with autoFocus focuses before the parent's effect runs, so I capture it on the first render, before children mount.
- FocusScope: the `scope` part is the root, but the rn conventions put testID="FocusScope" on the root and testID="<Name>.<part>" on parts; one View can carry only one testID. I kept testID="FocusScope" (the rn locator falls back to the root); the doc should say the root part uses the bare name on rn.
- FocusScope: on react-native-web, accessibilityViewIsModal may render as aria-modal on a div with no role, even though the doc says 'the scope adds no role' and on web 'never makes anything inert'. What the rn wrapper should output under react-native-web is not stated; I left the prop as the notes specify.
- FocusScope: the Default story content (Text 'Confirm your changes', Buttons 'Cancel' and 'Continue') is in the guidance prose, not in `examples`, so it is not in the generated args. I put it in meta.args.children. For the four examples, whose `children` is a text description, I show the description as Text above the same two Buttons; the examples don't say what real content to render.
- FocusScope: returnFocusTo's shape is RefObject<ViewInstance | null>, but a system Button doesn't take a ref, so stories wrap the trigger in a <View collapsable={false} ref>. Overlay triggers will need the same wrapper until Button exposes a ref.

## 2026-09-21 04:55 — round 1

- FocusScope (rn): the component has no open/trigger concept, but `returnFocusTo` and `restoreFocus` need a trigger that outlives the scope and a way to unmount it. Every story therefore wraps the scope in demo state: an 'Open panel' trigger (in a `View collapsable={false}`, since Button takes no ref) plus a 'Close panel' Button inside the scope. Neither control is in the spec, so the Default and example stories render one more Button than the doc's content list.
- FocusScope (rn): the Keyboard story is required to render 'open with its trigger and at least three focusable children', but the doc's three Buttons (First, Second, Third) are all inert. I attached the close action to 'Third' so the story can be dismissed; the doc does not say which, if any, of the three should do anything.
- FocusScope (rn): the guidance names the example Buttons but not their variants. I gave 'Accept' `variant="primary"` to match the React story and left the rest default; nothing in the spec decides this.
- FocusScope (rn): the platform note says to omit `accessibilityViewIsModal` on react-native-web but not how to detect it. I used `Platform.OS === 'web'`, which means the Jest suite (preset OS 'ios') never exercises the web branch, and no behavior scenario covers it.
- FocusScope (rn): the web notes require a __DEV__ warning for a trapped scope with no focusable descendants. The rn notes are silent, and children cannot be walked on native, so no warning is emitted — the one case where a trapped rn scope is as inescapable as the web one goes unreported.
- FocusScope (rn): scenario `the-scope-adds-no-role` asserts `attribute: role is null`, which has no single rn spelling. The test asserts `role`, `accessibilityRole` and `accessibilityLabel` are all undefined, following the notes' 'neither is set on the wrapper'.
- FocusScope (rn): the two Tab-wrap keyboard rules now exclude rn, but the Keyboard story still ships for the axe gate — so on react-native-web the story renders a scope that a keyboard user can Tab straight out of, and nothing in the gates records that as expected rather than broken.

## 2026-09-23 14:02 — round 1

- FocusScope: Guidance says 'every rn story renders one Button more than its children describe', but the same paragraph asks for two extra controls: an 'Open panel' Button outside the scope and a 'Close panel' Button inside it. That is two more Buttons in every story except Keyboard, where 'Third' closes the panel so only 'Open panel' is added. I kept both controls; the count in the sentence should be corrected.
- FocusScope: The spec doesn't say whether a later change to `restoreFocus` or `returnFocusTo` counts at unmount. 'restore once on unmount; later changes do not re-run' covers the timing, not which values are used. I kept `restoreFocus` as it was at mount and read `returnFocusTo.current` at unmount, since that ref names a trigger that outlives the scope.
- FocusScope: `onEscapeAttempt` is a declared prop that never fires on rn. It is still in `FocusScopeProps` so the API matches other platforms, and it is left unused with a lint suppression. The doc could say whether native should omit it from the type.
- FocusScope: The RN notes don't say whether `autoFocus` should call `setAccessibilityFocus` straight away or after a frame or interaction delay; iOS often drops focus requests made during a Modal's presentation. I call it synchronously in the mount effect.
- FocusScope: `the-scope-adds-no-role` asserts `attribute: role is null`, and on rn I test that `role`, `accessibilityRole` and `accessibilityLabel` are all undefined, as the notes ask. The scenario's single `role` expectation doesn't state that mapping itself.

## 2026-09-23 14:02 — round 1

- FocusScope: restoreFocus on native only moves screen-reader focus (setAccessibilityFocus), as the rn notes prescribe. A captured TextInput opener could also get keyboard focus back through .focus(), but the spec doesn't say to, so hardware-keyboard focus is not restored. Chose the spec's setAccessibilityFocus only.
- FocusScope: returnFocusTo usually points at a `View collapsable={false}` wrapping a Button, because Button takes no ref. That wrapper is not `accessible`, so iOS VoiceOver may ignore focus sent to it on restore. The notes state this limit only for autoFocus, not for restore. Left as is and not reported at runtime.
- FocusScope: onEscapeAttempt is part of the props type but can never fire on rn. The spec doesn't say whether rn should omit it from the type or keep it for cross-platform parity. Kept it typed and unused, with a doc comment saying it never fires here.
- FocusScope: the scenario the-scope-adds-no-role asserts `attribute: role is null`, but rn has no single `role` spelling. Following the notes, the test checks that role, accessibilityRole and accessibilityLabel are all undefined.
- FocusScope: the example `children` are prose descriptions. The stories keep the description string as the `children` arg and render it as Text plus the Buttons it names, plus the rn-only Open/Close panel controls. So the story's children arg doesn't match what renders; the guidance allows this, but the example contract ('exactly its given as args') doesn't mention render overrides.
- FocusScope: the Keyboard story uses "Third" as its close control instead of adding a separate "Close panel" Button. The guidance says both that 'every rn story renders one Button more than its children describe' and that 'Third closes the panel'. Chose Third-closes, so the Keyboard story's only extra Button is "Open panel".

## 2026-09-23 19:05 — round 1

- FocusScope: the `the-scope-adds-no-role` scenario says `attribute: role is null`, but the rn notes say the test must assert role, accessibilityRole and accessibilityLabel are all absent. I asserted all three undefined, following the notes.
- FocusScope: the spec says `ref` exposes the wrapper root, while the conventions say to pass `ref` straight through. The wrapper needs an internal ref for setAccessibilityFocus, so I used useImperativeHandle rather than attaching the caller's ref directly.
- FocusScope: the `Platform.OS === 'web'` branch that omits accessibilityViewIsModal has no test, because Jest runs under `ios`. The spec says as much, so I left it uncovered.
