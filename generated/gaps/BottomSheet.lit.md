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
