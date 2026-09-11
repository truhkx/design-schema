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
