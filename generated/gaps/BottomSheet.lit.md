# Gaps reported while generating BottomSheet for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 03:14 — round 1

- BottomSheet: the schema names the title prop `title`, but `title` is a native HTMLElement member (tooltip). Renamed to `heading` (property and attribute) to match the established Dialog/AlertDialog convention in this package rather than shadowing the native accessor; `hideTitle`/`hide-title` kept its schema name even though it now hides the `heading` field.
- BottomSheet: `draggable` also collides with the native global `draggable` HTML attribute/IDL property (HTML5 drag-and-drop, string-reflected). Kept the literal name since platforms.lit.reflect explicitly lists it, but this shadows the native accessor on instances of this element; harmless here since the gesture is handled via Pointer Events, not native DnD, but worth flagging since the general Lit convention calls out exactly this class of clash for `title`/`role`.
- BottomSheet: scoped the `content` variant's 90% viewport cap (`max-block-size: 90dvh`) to the `content` height only, removing it for `half`/`full`. The doc's platform note gives `full` an explicit `calc(100dvh - layout.gutter)` block-size that would otherwise be clamped by a globally-applied 90dvh cap, undermining 'near-full-screen'; the doc doesn't state this interaction explicitly.
- BottomSheet: no `initialFocus` prop exists (unlike Dialog). Guidance only says focus moves 'to the first control or the title', so I implemented Dialog's default 'first' behavior (first focusable in the body, else the close button, else the heading) with no way to configure it otherwise.
- BottomSheet: when rendered as `<ds-dialog>` above the `maxWidth` breakpoint, `hideTitle` has no effect since Dialog has no hidden-title variant in its own schema — the title always shows in that presentation.
- BottomSheet: behavior when the viewport crosses the `maxWidth` breakpoint while the sheet is `open` (a live resize mid-session) isn't specified. No animated hand-off between the sheet and Dialog presentations is implemented; the template swaps on the next render and scroll-lock/focus bookkeeping is only engaged while in the sheet presentation.
- BottomSheet: `drag-dismiss` has no described `detail` shape in the schema, so the CustomEvent carries none (mirrors `onDragDismiss?: () => void` in the already-generated React version).

## 2026-09-10 18:11 — round 1

- BottomSheet: platforms.lit.reflect lists `drag-to-dismiss` literally (non-negated), but `dragToDismiss` defaults to `true` — the package's own 'booleans that default to true' rule (used correctly for `dismissible` → `no-dismiss` right next to it in the same list) would call for `no-drag-to-dismiss` instead. Implemented the literal `drag-to-dismiss` form since it's explicit in the schema, but this means an author can't declaratively express `dragToDismiss=false` in static HTML (only via JS property or by omitting-then-toggling) — flagging the inconsistency rather than silently 'fixing' it.
- BottomSheet: no `initialFocus` prop (unlike Dialog). Guidance only says focus moves 'to the first control or the title'; implemented Dialog's default chain (first focusable in body, else close button, else heading) with no way to configure it otherwise.
- BottomSheet: the `content` height's 90dvh viewport cap is scoped off for `half`/`full` (which set an explicit block-size instead) since the doc's `full` formula (`calc(100dvh - layout.gutter)`) would otherwise be clamped by a globally-applied cap — this scoping isn't stated explicitly in the doc.
- BottomSheet: `drag-dismiss` has no described `detail` shape in the schema, so the CustomEvent carries none (`void`).
- BottomSheet: behavior when the viewport crosses the `maxWidth` breakpoint while `open` (a live resize mid-session) isn't specified — no animated hand-off between the sheet and Dialog presentations is implemented; the template swaps on next render and each presentation manages its own scroll-lock/focus independently.
