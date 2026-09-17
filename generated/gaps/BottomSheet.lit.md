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

## 2026-09-16 07:11 — round 1

- BottomSheet: `dismissible: false` says 'only the footer actions close it', but Guidance says 'the close button is always visible' and swiftui says it 'is always rendered'. Chose Dialog's behaviour: no close button when not dismissible; scrim and drag do nothing; Escape still reports `escape`.
- BottomSheet: reason `action` ('a footer action asked to close') has no mechanism. Chose Dialog's: a slotted form submitted with method="dialog" fires close with reason `action`; footer buttons otherwise just close the sheet through the consumer.
- BottomSheet: `minTarget` (size.target.comfortable on closeButton) cannot reach Button's inner control: Button has no overridable binding for its minimum target and restyling the child is forbidden. Set min-inline-size/min-block-size on the ds-button host only; the tappable inner button keeps size.target.min. Button's schema needs a target binding.
- BottomSheet: `maxWidth` is listed as overridable, but its description says 'read once from the theme (the breakpoint is not per-instance overridable)'. The hook exists; matchMedia reads --layout-max-width-prose from the document root once on connect, so overriding it has no effect.
- BottomSheet: 'Above this viewport width' does not say whether the edge value is inclusive. Used `(width > <token>)`: exactly the token width stays a sheet.
- BottomSheet: no binding for the space above the handle or between the handle and the title row (no headerGap as Dialog has). Used layout.gap.tight for both, inset for the sides and bottom, and inset + env(safe-area-inset-bottom) below.
- BottomSheet: `shadow` has no part, and Behavior forwards only inset, radius, partGap and footerGap to Dialog. scrim, shadow, layer, enter and exit also exist on Dialog but are not forwarded in the wide presentation.
- BottomSheet: `enter` says 'the scrim fading' and `exit` says 'slide down', but not whether the scrim uses the exit duration. Both the scrim fade and the surface slide use exit + motion.easing.exit.
- BottomSheet: the anatomy has `focusScope` but Behavior says initial focus is 'FocusScope's first (first control in the body, else close button, else heading)', which excludes the footer, unlike FocusScope's own `first`. Composed ds-focus-scope with auto-focus=none and placed focus in that order; the heading takes tabindex=-1.
- BottomSheet: Behavior says the drag starts on the header 'when the body is at its scroll top', but dragToDismiss says the body never starts it. Only the handle/header start it, so the scroll-top condition is never checked.
- BottomSheet: `onDragDismiss` has `gesture: true` and there is no scenario or example that exercises the drag, so it is untested; the WCAG 2.5.1 alternative is covered only by the close-button scenarios.
- BottomSheet: examples give `children` and `footer` as prose descriptions, not content. The stories keep them as descriptive string args ('exactly its given') and render real content matching each description.
- BottomSheet: `controls` says open is uncontrolled when omitted, but `open` is required and Dialog is controlled-only. Kept controlled-only: the sheet never changes `open` itself.
- BottomSheet: the wide Dialog presentation emits `opened`, which is not in BottomSheet's events. Stopped it at the sheet.
- BottomSheet: `closed-sheet-renders-nothing` holds only below the breakpoint. Above it the shadow root keeps a `<ds-dialog>` element that itself renders nothing, so its exit transition can play.

## 2026-09-17 10:58 — round 1

- BottomSheet: platforms.web.notes says Button and Heading write their own data-part, but on Lit neither ds-heading nor ds-button sets data-part on its host, while ds-box sets data-part="surface" on itself (which would collide with the sheet's surface part). Chose sheet-owned wrapper divs for heading, closeButton, body (holding ds-box) and footer (holding ds-stack), as ds-dialog does.
- BottomSheet: minTarget says a click on the wrapper outside the Button 'clicks it', but on Lit that means reaching into ds-button's shadow root. Chose to focus the ds-button and dispatch close with reason close-button straight from the wrapper's click handler.
- BottomSheet: the close Button's size variant is not specified ('keeps its own size variant'). Chose size="sm" ghost icon-only to match Dialog, with the wrapper providing the 44px target.
- BottomSheet: headerGap and handleGap are both on the header part, but the header holds two layouts: a column (handle over heading row) and a row (heading and close button). Chose handleGap for the column gap and headerGap for the gap inside the heading row.
- BottomSheet: inset is 'block-end padding of the last part' but doesn't say whether header, body and footer get block-start padding besides the header's, or whether the body Box is padded through Box's overrides or by the sheet. Chose padding-inline on the sheet-owned body and footer wrappers (Box stays inset none), the part gap between parts, and block-end inset plus env(safe-area-inset-bottom) on the last rendered part.
- BottomSheet: dragSlop is a length token (space.1) with unit px, but a resolved custom property may be rem. Chose to read --space-1 from the host's computed style at gesture time and convert rem/em to px.
- BottomSheet: the drag-dismiss 'hold until the consumer's update renders' has no defined wait on Lit. Chose to wait for updateComplete plus one animation frame, then spring back if open is still true.
- BottomSheet: the drag translation starts from the pointerdown point, so once past dragSlop the surface jumps by the slop distance. The doc doesn't say whether to measure from pointerdown or from where the slop was crossed; chose pointerdown (the sheet tracks the finger).
- BottomSheet: the spec's accessible name is aria-labelledby (web) while ds-dialog now uses aria-label. Chose aria-labelledby pointing at the heading wrapper inside the shadow root (the has-accessible-name and hidden-heading tests pass). The doc could name one mechanism for Lit.
- BottomSheet: Dialog renders its footer part whenever a child has slot="footer", so forwarding an unconditional <slot name="footer" slot="footer"> would give a sheet with no footer an empty footer in the wide presentation. Chose to forward the footer slot only when the sheet has footer children.
- BottomSheet: Controlled state says 'uncontrolled from its initial state when omitted', but the open prop is controlled only. Followed the prop: no uncontrolled mode, open defaults to false.
