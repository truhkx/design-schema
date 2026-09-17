# Gaps reported while generating Alert for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:54 — round 1

- Alert: schema locks `icon` (color.status.{tone}.icon) but gives no mechanism to apply it — Icon's own CSS (`.ds-icon { color: var(--ds-icon-color) }`) always wins over any ancestor `color`, so a CSS hook on the wrapper span can't recolor it (this appears to be a real, pre-existing issue in AlertDialog.css, which sets `.ds-alert-dialog--tone-* .ds-alert-dialog__icon { color: ... }` with a comment claiming 'Icon draws in currentColor' — that rule has no effect given Icon.css as written). I used Icon's own public `overrides={{ color: 'color.status.{tone}.icon' }}` prop instead, which reliably wins via inline style; this differs from AlertDialog's approach and the two composites should probably be reconciled.
- Alert: `iconSize` override needed to reach both the Alert's own centering-math hook (`--ds-alert-icon-size`, used in the icon wrapper's margin calc) and Icon's own `size` override, since Icon owns its rendered dimensions independently of the wrapper's box. Forwarded the same TokenRef to both, following the precedent of Divider forwarding `labelSize`/`fontFamily` into Text's own `overrides`.
- Alert: anatomy names `container` for the root part; used `data-part="container"` alongside `data-ds="Alert"` on the same element, following Card's precedent of stacking `data-ds` and a root-level `data-part` (there it's `surface`).

## 2026-09-10 17:47 — round 1

- Alert: index.ts already exported Alert/AlertProps/AlertTone/AlertLive/AlertOverridableBinding from a prior generation round, so no index.ts change was needed this pass.
- Alert: the pre-existing Alert.tsx/Alert.css were missing the `headingSize` binding entirely (schema lists it as overridable, distinct from `fontSize` used by the body) — added the `--ds-alert-heading-size` hook and applied it to `.ds-alert__heading`.
- Alert: the pre-existing root had no `aria-labelledby`, so the region had no accessible name from the heading/body per the web platform note ('named by the heading when present, otherwise the body element') — added `useId()`-based ids on the heading and body and wired `aria-labelledby` on the root accordingly.
- Alert: `heading` is rendered as a `<p>` (not a heading element) per the web platform notes, so `a11y.requires: heading-hierarchy` from the generic ruleset doesn't apply here — the doc's own platform note overrides the generic rule and Alert's `a11y.requires` list doesn't include it either, so no gap in practice, just flagging the apparent tension.
- Alert: `target-24px` and `focus-visible` are satisfied by delegating to the composed system Button (ghost/sm/iconOnly) for the dismiss control rather than the Alert root itself having a target size or focus style of its own — the root has no interactive semantics.

## 2026-09-12 06:45 — job 506 (the component docs page)

- Alert: there is no `neutral` tone. `website-plan.md` asks the component page's "not yet generated" notice to be an `Alert(tone="neutral")`, and the schema's `tone` enum is `info | success | warning | danger` — every one of which says something about urgency that this notice does not mean. It is a statement of fact about the roadmap, not information, a success, a warning or a problem. The page uses `info` for now (`apps/website/src/pages/docs/components/[slug].astro`). Either the doc gains a `neutral` tone — it would need its own `color.status.neutral.*` group and an icon that reads as "note" rather than "!" — or the plan's wording should change, because a message with no tone is a thing product UI keeps wanting and the four current values cannot express it.

## 2026-09-16 05:08 — round 1

- Alert: `dismissButton` is a composed Button, but Button hard-codes `data-part="container"` after `...rest`, so the part name can't go on the button itself. I put `data-part="dismissButton"` on a wrapper span (also used for `dismissMargin`). A generic part locator that clicks the span does not activate the button, so the test clicks the `button` inside the part. The doc should say whether a composed part's data-part goes on a wrapper or is forwarded to the child.
- Alert: the `icon` binding names part `icon`, which is a composed Icon, and Icon renders no data-part. I put `data-part="icon"` on a layout wrapper span (the one that lines the icon up with the first line of text) and pass the color and size to the Icon via `overrides`. The doc doesn't say where the part hook goes for a composed child.
- Alert: `iconSize` is forwarded to Icon as `overrides.size`, so the default `font.size.lg` is always passed inline. A consumer who sets `--ds-alert-icon-size` in their own CSS changes the icon alignment math but not the Icon's size, because the inline override on the child wins. That contradicts the 'consumers may set the hooks from CSS' escape hatch for forwarded bindings.
- Alert: the web notes say the region is named by the body element when there is no heading, but the body may hold Links or other rich content, so `aria-labelledby` pointing at the body makes the whole body text the name. I followed the notes as written.
- Alert: the guidance says focus moves to the 'next focusable element' on dismiss but doesn't define focusable. I used a standard selector (links, buttons, form fields, `tabindex` ≥ 0, `contenteditable`), excluding elements with a `disabled` attribute. It does not check for hidden or `inert` elements.
- Alert: the Web platform notes say the icon is an '`aria-hidden` inline SVG' while the `icon` style binding says to render the system Icon. I used Icon, which hides itself from assistive technology when it has no label. The notes should drop 'inline SVG'.
- Alert: the dismiss glyph is described as 'a 1em × glyph'. I used `<Icon name="close" inline />`; the doc should name the icon `close` explicitly, as the SwiftUI notes do.
- Alert: the example stories must have 'exactly its given as args', but Storybook merges them over meta.args, so an example without `heading` would inherit a heading from the defaults. I left `heading` out of meta.args, so the Default story has no heading. The doc doesn't say what the Default story's args are.

## 2026-09-17 05:16 — round 1

- Alert: the `icon` binding is `locked: true`, yet its description says 'Override through `overrides.icon`'. Locked bindings are excluded from the overrides type, so I kept it locked and there is no `overrides.icon`; the Icon always gets `color.status.{tone}.icon`.
- Alert: the web note's next-focusable list says `a`, but an anchor without `href` cannot take focus. I used `a[href]`.
- Alert: 'elements that are not rendered (hidden or display none)' does not say whether `visibility: hidden` or zero-size elements count. I check only the `hidden` attribute and computed `display: none` on the element and its ancestors, which also works in jsdom (it has no layout, so `getClientRects` could not be used).
- Alert: 'skipping disabled elements' does not say whether descendants of a disabled `<fieldset>` count. I used `:disabled`, which includes them.
- Alert: the icon-box math needs to know if there is a heading. CSS has no prop for that, so I used `.ds-alert:has(> .ds-alert__content > .ds-alert__heading)`. The spec could name a mechanism (e.g. a modifier class).
- Alert: `fontSize` is on the `body` part, but the icon-box math needs it on the icon part, and `lineHeight` is on the container while the heading has no line-height binding of its own. All hooks are set on the root and inherited, so every part reads the same values; the heading inherits the container's `lineHeight`.
- Alert: `iconSize` says the `--ds-alert-icon-size` hook does not resize the Icon, yet the icon-box math reads that hook. A consumer who sets the hook in their own CSS instead of `overrides.iconSize` gets a box sized differently from the glyph. The spec could say whether the math should read only the forwarded token.
- Alert: no scenario covers moving focus on dismiss or the next/previous/none cases, so this behavior has no test; the doc could add scenarios for it.
- Alert: the web note says a consumer's `aria-labelledby` is replaced by the heading or body id, but does not say whether a consumer `aria-label` should win. Mine is forwarded through `...rest` and sits alongside `aria-labelledby`, which then takes precedence.
