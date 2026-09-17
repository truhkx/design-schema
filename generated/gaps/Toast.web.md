# Gaps reported while generating Toast for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:30 — round 1

- Escape-dismiss has no matching value in the `onDismiss` reason enum (timeout/dismiss-button/action/replaced); mapped Escape to reason 'dismiss-button' as the closest semantic match.
- dismissColor (color.inverse.foreground) can't be independently expressed: both action and dismiss buttons are composed via Button's `inverse` ghost variant, which always renders ghost text in color.inverse.link (Button has no foreground-color override slot), so per the 'never restyle a child' rule both buttons end up the same color rather than dismiss reading as the more neutral color.inverse.foreground.
- focusRing/focusRingWidth (locked, color.border.focus/border.width.focus) have no locus of application: Toast's own root isn't focusable, and its only focusable children (the composed Buttons) already use focusRingInverse via Button's `inverse` prop, so these two bindings are declared in the schema but not wired to any CSS.
- duration's schema default stays `short` even though the guidance says persistent is 'required' when there's an action or tone is danger; rather than silently overriding the documented default, added a dev-only console.warn nudging the consumer instead.
- Same-id replacement and 3-toast overflow eviction remove the old/evicted entry synchronously from the store and call its onDismiss('replaced') immediately, without playing that toast's own exit transition (only UI-triggered dismissal — timeout/button/action — waits for the fade-out).
- short/long duration timings (~5s/~10s, 'computed from motion.duration.loop × 6/×12 so themes without motion still get sensible times') are hardcoded ms constants (5000/10000) rather than read from the active theme at runtime, since a component has no way to measure a resolved CSS custom property synchronously (same precedent as Tooltip's DEFAULT_DELAY_MS) — exact timing won't track a theme's actual motion.duration.loop value.
- The `id` prop on a directly-rendered `<Toast>` (outside the `toast()`/`ToastRegion` store) is just the native DOM id attribute; the 'same id replaces the previous toast' de-duplication only happens inside the store, so standalone Toast usage gets no replace semantics from `id` alone.
- F6 focus-restore keeps only one `previousFocusRef` at the ToastRegion level; if focus moves around by mouse between an F6 entry and a second F6 press, 'return to where focus was' returns to the most recent F6-recorded origin rather than tracking arbitrary intermediate focus changes.

## 2026-09-10 18:04 — round 1

- Toast: `duration` prop was named per spec, but the persistent-override rule ('action or danger tone forces persistent regardless of `duration`') was previously only a dev warning — the auto-dismiss timer still used the raw prop. Fixed by computing an `effectiveDuration` (forced to 'persistent' when `actionLabel` is set or `tone === 'danger'`) and using it for both the timer and `showDismiss`.
- Toast: the identity prop was implemented as `id` (and reused as the DOM `id` attribute) instead of the schema's `toastId`; renamed to `toastId` throughout (ToastProps, ToastOptions, ToastRegion wiring) to match the schema literally, since platform prop names aren't remapped the way events are.
- Schema doesn't specify whether the DOM `id` attribute should still be set from `toastId` (platforms.web attributes list doesn't include `id`); kept the existing convenience of `id={toastId}` on the root since nothing else in the doc claims that attribute and it's harmless.

## 2026-09-16 06:05 — round 1

- Toast: `stackGap`, `regionInset` and `layer` are listed as overridable on the component, but their description says they belong to the region and are not overridable on a toast. Chose: `ToastOverridableBinding` leaves them out and `ToastRegionOverridableBinding` (hooks `--ds-toast-stack-gap`, `--ds-toast-region-inset`, `--ds-toast-layer`) carries them on `ToastRegion`.
- Toast: the message part is Text, but Text has no inverse tone, and its `color` binding is locked. Text's default color would fail contrast on `color.inverse.surface`. Toast's `fontFamily`/`fontSize`/`lineHeight` bindings also have no declared forward to Text. Chose: the Toast CSS sets Text's public hooks (`--ds-text-color`/`font-*`/`line-height`) from `.ds-toast [data-part='message']`. That is close to restyling a child. Text's schema probably needs an `inverse` tone and the part needs declared forwards.
- Toast: the composition gives the buttons only `variant: ghost` and `inverse: true`, but the web platform notes say `size="sm"`. Chose the contract: no `size`, so Button's default applies.
- Toast: Button writes its own `data-part="container"` over a passed `data-part`, so `actionButton`/`dismissButton` can't be the Button element. Chose wrapper spans that carry the part, as Alert does.
- Toast: the `icon` binding is locked and interpolated (`color.inverse.status.{tone}`) on a composed Icon, and the parts section declares no forward. Chose: pass the resolved token to Icon's `color` override (as Alert does). Icon `size` is unspecified; the default is used.
- Toast: durations must be computed from the resolved `motion.duration.loop` and never hard-coded, but the spec doesn't say what happens when the token can't be resolved (no theme CSS, jsdom). Chose: no timer, so the toast stays until dismissed. There is no dev warning because it would be noisy in tests.
- Toast: the Behavior section says `toast()` returns a promise that resolves to `{ reason }`; the web platform notes only show `toast({ message })`. Chose the promise. There is also no imperative way to dismiss a toast programmatically, although `onDismiss` lists `programmatic` among its sources. None was added.
- Toast: `toastId` on a directly rendered `<Toast>` has no defined meaning (replacing only makes sense in the region), and it must not become the DOM `id`. Chose: accepted and ignored on the component; `toast()` and the region use it to replace.
- Toast: 'Escape ... returns focus' and 'the dismiss button sends it back' don't say where focus goes when the toast was reached without F6. Chose: the element focus came from via F6 or Tab, or else the next focusable element after the toast (the previous one if there is none). The same restore is used for the action button.
- Toast: the dev warning ('a dev warning notes the override') doesn't say whether the default `duration: short` counts. Chose: warn only when `duration` is passed explicitly as non-persistent on an action or danger toast. 'When `action` is set' is read as `actionLabel` being present, since there is no `action` prop.
- Toast: `onDismiss` is `after-change` and the exit transition is `exit`, but whether it fires after the exit animation or on dismissal isn't stated. Chose: after the resolved `--ds-toast-exit` time, or immediately under reduced motion or when the value can't be resolved. After that a directly rendered Toast renders nothing.
- Toast: the region's placement ('bottom-start on wide screens, bottom center on phones') has no breakpoint token. Chose the existing 960px media query, marked literal-ok to match Container's threshold. The safe-area offset uses `env(safe-area-inset-bottom, 0px)`, also marked literal-ok.
- Toast: the `Keyboard` story needs toasts in the region, but there is no API to clear them, so they stay in the module-level store across stories. Chose fixed `toastId`s so re-renders replace rather than stack.
- Toast: `has-accessible-name` is derived, but a `role=status` toast has no name source in the spec (the region has `copy.regionLabel`; the toast itself has none). Chose to assert that the status carries the visible message and the dismiss button is named `Dismiss`.

## 2026-09-17 10:00 — round 1

- Toast: the spec never names the region component or the dismiss function's export; kept the existing `ToastRegion` and `toast`, and added `dismiss(toastId?: string): void` beside them.
- Toast: `dismiss(toastId)` has no stated animation; the doc only says `replaced` skips the exit transition, so programmatic dismissals play the exit transition and fire onDismiss afterwards. With no region mounted they settle immediately.
- Toast: a programmatic dismissal needs to reach a toast rendered by the region, but the schema props have no channel for it; used a private context (not a prop) so the public API stays as specified.
- Toast: `fontFamily`/`fontSize`/`lineHeight` are forwarded to Text, yet the Overrides section says every binding is a `--ds-toast-*` hook on the root; forwarded bindings get no root hook, following the 'forward to the child, never CSS on the child' rule.
- Toast: `stackGap`, `regionInset` and `layer` are listed as Toast overridables but described as region-only; they are typed on `ToastRegionProps.overrides` only, not on `ToastProps.overrides`.
- Toast: the `text` binding names `part: message`, but its description says to re-scope `--color-foreground` on the container; set it on the toast root (like Tooltip), not on the message part.
- Toast: the exit transition's direction isn't specified (only enter 'rise and fade'); exit reverses enter, sinking by `enterOffset` while fading over `exit`.
- Toast: 'wide' is layout.maxWidth.content resolved at generation time; used 960px to match Container's existing breakpoint, without re-reading the theme.
- Toast: the spec doesn't say whether the dev warning fires once per instance or on every change; it fires when `duration`, `actionLabel` or `tone` changes into the override case.
- Toast: the `escape-dismisses-the-focused-toast` scenario has no `given` or focus step; the test focuses the dismiss button first, since Escape only acts when focus is inside a toast.
- Toast: with toast() auto-mounting the region in its own React root, the enter frame between region creation and the first push is a requestAnimationFrame; the spec doesn't say how long the empty live region must exist before content.
