# Gaps reported while generating Menu for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 23:52 — round 1

- Menu: schema lists `popup` and `list` as separate anatomy parts, but the web platform notes literally describe one `<div role="menu">` serving both (position/surface + the item list). I collapsed them into a single element (data-part="popup", role="menu") rather than inventing a second nested wrapper the notes don't mention.
- Menu: no `container` prop exists in the schema's props list (unlike the generic overlay guidance which mentions one), so the popup always portals to `document.body` with no override point. Flagged in case the docs intend one.
- Menu: chose not to lock body scroll while open, unlike Dialog/AlertDialog. The schema's a11y.requires has no modal-lock item for Menu and the web notes explicitly say to 'reposition on scroll and resize while open,' which only makes sense if the page can still scroll — so scroll-lock was treated as a Dialog/AlertDialog-only pattern, not a blanket overlay rule.
- Menu: clicking the trigger while already open closes the menu (toggle). The keyboard/behavior tables only specify what opens it from a closed state; toggle-on-click is the conventional menu-button behavior and doesn't contradict anything given, but it's an inference.
- Menu: `shortcut` is passed verbatim into `aria-keyshortcuts` per the web notes ('Shortcuts are display-only (aria-keyshortcuts)'), but display strings like '⌘S' don't match the ARIA attribute's expected token format ('Meta+S'). Followed the schema literally since it names the attribute explicitly; flagging the mismatch for anyone tightening `aria-keyshortcuts` later.
- Menu: the single `itemGap` token is reused both for spacing between rows/groups in the list and for the internal icon–label–shortcut gap inside one item, since the schema defines only one gap binding for the whole item anatomy.
- Menu: `minWidth`'s '× 2.5' multiplier (space.20 → ~200px) is applied at the CSS use-site via `calc(var(--ds-menu-min-width) * 2.5)` so a per-instance override still scales proportionally, per the schema's 'the generator multiplies' note.

## 2026-09-10 02:45 — round 1

- Menu: `open` is documented as "controlled open state" with no explicit uncontrolled-close mechanism when using it purely as a boolean toggle from outside (no onOpenChange-driven two-way binding helper) — implemented as fully controlled-if-present (parent must flip `open` itself on onOpenChange), matching Dialog/AlertDialog convention in this package.
- Menu: minWidth token math ("space.20 × 2.5, i.e. 200px") is described in prose, not as a generator-computed literal — implemented as calc(var(--ds-menu-min-width) * 2.5) in CSS to avoid a hard-coded px value, since the doc explicitly says 'no new token'.
- Menu: spec's keyboard table marks ArrowDown-from-trigger and ArrowUp-from-trigger as `expect: manual` — verified via the Keyboard story (open:true) rather than an automated scenario, per the doc's own scenario list which only covers `renders-*` and `has-accessible-name`.

## 2026-09-10 20:00 — round 1

- Menu: `anchor` is typed `RefObject<HTMLElement | View>` in the schema shape (cross-platform), but web has no `View`; narrowed to `RefObject<HTMLElement>` for this platform.
- Menu: schema gives no explicit rule for whether disabled items are still rendered with `aria-disabled` vs. removed from the roving tabindex sequence — chose to keep them in the DOM, skip them in arrow/typeahead/Home/End traversal, and mark `aria-disabled="true"`, consistent with the 'visible, announced disabled, skipped' behavior description.
- Menu: `minWidth` token doc says 'space.20 × 2.5 ... the generator multiplies; no new token' — implemented as a CSS `calc(var(--ds-menu-min-width) * 2.5)` at render time rather than a build-time multiplied constant, since overrides must still be able to swap the base token.
- Menu: the `controlled` onOpenChange reason is documented but has no trigger in the schema's own event flow (parent-driven); the component never emits it itself, only documents it for forwarding — flagged in case the intent was for the component to emit it when `open` changes while controlled.

## 2026-09-16 06:40 — round 1

- Menu: onOpenChange's description says it receives `{ open, reason }` (an object) but the Events contract lists positional `open, reason`; I followed the contract (positional), which changed the signature ActionSheet consumed, so ActionSheet.tsx's handler was updated.
- Menu: the reasons have no value for Tab/Shift+Tab, focus-out or the window losing focus (all listed dismissals or described behavior); I report them as `outside`.
- Menu: Shift+Tab 'moves focus to the previous tabbable element after the trigger' is self-contradictory; I focus the tabbable element before the trigger in document order (Tab: the one after it).
- Menu: the overrides contract puts hooks on the component root, but the popup is portaled out of the root, so hooks set there never reach it; hooks default and inline overrides are applied on the popup (data-part=popup) instead.
- Menu: minWidth is `computed: times 2.5` but an override replaces the hook with a plain token; I keep the hook as `var(--space-20)` and multiply in the rule, so an override is also multiplied by 2.5. The doc should say whether the override replaces the computed result or the base token.
- Menu: the data-part for the trigger cannot be set — Button writes its own `data-part="container"` after spreading rest props; the trigger part has no hook on web.
- Menu: `iconOnly` Button only shows `leadingIcon`, while triggerIcon is described as a trailing icon; with iconOnly I pass the glyph as leadingIcon, otherwise as trailingIcon.
- Menu: `items` shape `icon?: IconName` etc. is used with exactOptionalPropertyTypes, where callers (ActionSheet) pass `icon: undefined`; MenuAction declares each optional field `| undefined` rather than the shape verbatim, and items is typed `MenuItem[]`.
- Menu: typeaheadReset is a token read at runtime via getComputedStyle; with no stylesheet (jsdom) it resolves to nothing, and the doc gives no fallback — I clear the buffer on each keypress in that case rather than hard-coding the token's current value.
- Menu: the root element for web is declared `button`, but with `anchor` there is no trigger; I kept a wrapper `<div data-ds="Menu">` as the root (ref type HTMLDivElement) in both modes.
- Menu: the doc says the window losing focus closes (Behavior) but overlay.dismiss lists only escape, outside-press and focus-out; I implemented the window blur close as well, reason `outside`.
- Menu: the enter description says 'a space.1 rise' but the rise has no binding of its own; it uses var(--space-1) directly rather than the popupOffset hook, so overriding popupOffset does not change the rise.
- Menu: groups may contain separators per the recursive shape but the doc only says groups 'hold action items only'; separators inside a group are rendered, nested groups are dropped.

## 2026-09-17 10:34 — round 1

- Menu: `anchor` mode — Escape/action 'return focus to the trigger', but there is no trigger; chose the element that was focused when the menu opened, and for Tab/Shift+Tab used the anchor's document position (first tabbable following it / last preceding it, excluding the anchor's own descendants), since the anchor itself need not be tabbable.
- Menu: a controlled menu closed by the consumer (open → false with no close the menu requested) — doc says it 'returns focus to the trigger' but not whether that applies when focus was already elsewhere; chose to restore only when focus was inside the popup.
- Menu: which reasons move focus is only stated for escape, action and tab-out; chose no focus move for `outside`, `focus-out` and `trigger` (focus already went where the user put it).
- Menu: popupOffset — 'the flip check includes it' but not how a token (possibly rem) is resolved for the check; chose to apply it as the popup's block margin on both sides and read the resolved margin-block-start in px.
- Menu: the behavior scenarios with `open: true` pass `open` as a prop, which makes the menu controlled; Escape then only 'closes and returns focus' if something writes onOpenChange back. Followed the Behavior section's 'wrapper that owns open' for the Keyboard story and those tests; the scenario format itself doesn't say this.
- Menu: aria-controls is set on the trigger only while open (the popup id does not exist in the DOM while closed); spec lists aria-controls without saying whether it may dangle.
- Menu: the ref resolves to the popup, but `...rest` goes to the wrapper root; the doc does not say which element receives pass-through div props (id, data-*, event handlers) — chose the root wrapper.
- Menu: `enter` (motion.duration.fast) also drives the item hover background transition, since no item transition binding exists; spec names `enter` for the popup only.
- Menu: typeahead `a-z` — only ASCII letters are matched (no digits or non-Latin labels); spec lists 'a-z' literally.
