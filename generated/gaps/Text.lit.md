# Gaps reported while generating Text for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:42 — round 1

- (model did not return the JSON report block)

## 2026-09-16 01:58 — round 1

- Text: `color` is locked, but three components need Text on an inverse surface (Toast message, Tooltip popup, Slider value bubble) where the binding is `color.inverse.foreground`, and `tone` has no `inverse` value. `onAction` is not a substitute: in dark mode `--color-foreground-on-action` is neutral-0 while `--color-inverse-foreground` is neutral-900, so swapping it would put white text on a light inverse surface. Chose to drop the color forward in those three and re-scope `--color-foreground: var(--color-inverse-foreground)` on the parent's container, which keeps the pixels and touches no part of the child. Text's `tone` should gain an `inverse` value (or those three should own their text).
- Text: the overrides contract says locked bindings are 'not in the type and are ignored', but those two clauses conflict — excluding `color` from `TextOverridableBinding` makes a forwarded `{ color: … }` a compile error, not a silent no-op. That is exactly how the three components above broke. Chose 'not in the type'; the doc should say which one wins for composed parents.
- Text: `platforms.lit.notes` asks the host to be `display: contents` for `span` and block otherwise, but `element` is not in `platforms.lit.reflect`, so the display can only be set as an inline style on the host. An inline `display: contents` beats `:host([hidden]) { display: none }`, so `hidden` does not hide a `<ds-text element="span">`. Chose the inline style (and removed it for `p`); the doc should either add `element` to `reflect` so a `:host([element='span'])` rule can do it, or drop the `display: contents` requirement.
- Text: the doc does not say how `truncate` behaves with `element: span`. A one-line ellipsis needs a block-ish box, so chose `display: inline-block; max-inline-size: 100%; vertical-align: bottom` for the truncated span — which means the clipping width comes from the parent's box, not from the span's inline run.
- Text: `truncate` says the full text goes to `title` 'when children is a plain string; otherwise the consumer passes `title`'. A Lit slot has no 'plain string' state — chose to derive `title` from the host's flattened `textContent` on `slotchange` (whitespace-collapsed) and to omit `title` when that is empty, so a slot containing elements still gets a `title`, unlike web. Worth stating for lit explicitly.
- Text: the `truncated-text-keeps-the-full-string-reachable` scenario is scoped `platforms: [web]`, so no lit test asserts it, even though `ds-text` is a web platform and implements `title` identically. Left untested rather than inventing a scenario; the doc should add `lit` to that scenario's platforms if the assertion is meant to hold here.
- Text: `children` is a required `content` prop, which on lit is the default slot and cannot be an arg. The stories model it as a separate `text` arg and the behavior-test harness skips that key when assigning properties — so the derived scenarios never exercise slot content. A slot-content convention for `content` props would make these tests mean something.

## 2026-09-17 03:54 — round 1

- Text: the Lit platform note says to render `part="text"`, the Lit guidance says it is 'for outside styling', but the package rule is that no `::part` is exposed for styling. I kept `part="text"` as an anatomy name only and ship no part-based styling; the guidance sentence should drop 'for outside styling'.
- Text: the behavior scenario `truncated-text-keeps-the-full-string-reachable` is limited to `platforms: [web]`, but the `truncate` description gives Lit its own title rule (flattened, whitespace-collapsed textContent, omitted when empty). So Lit has no test for a behavior it is required to have. I implemented it and wrote no test; the scenario should list `lit` too.
- Text: the spec says `title` comes from the host's textContent but not when it must update. `slotchange` does not fire when the text inside an existing node changes. I added a MutationObserver (childList + characterData, subtree) that only updates state; the doc should say the title follows live text edits.
- Text: `align` says start/end follow writing direction and describes Native's I18nManager limitation, but says nothing for Lit. I used CSS `text-align: start|end`, which follows `dir` live.
- Text: `styles.color` is interpolated (`color.foreground.{tone}`) and locked, but the doc doesn't give a hook name or say that `default` resolves to the bare `--color-foreground` custom property, the one inverse surfaces re-scope. I read the token directly with no `--ds-text-color` hook, and `default` reads `var(--color-foreground)`.
- Text: the doc doesn't say how `onAction` maps to a CSS custom property. I used `--color-foreground-on-action` (camelCase to kebab-case).
