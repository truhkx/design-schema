# Gaps reported while generating Feed for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 16:45 — round 1

- FeedItem.content/actions are typed `ReactNode` in the schema; Lit has no equivalent, so they're typed `unknown` (any lit-html-renderable value: string, TemplateResult, Node), matching the precedent of DataGrid's `render?: (row) => unknown`.
- aria-labelledby for each article is not set directly by Feed: the article is a <ds-card>, and Card already labels itself via ElementInternals.ariaLabelledByElements pointing at its own internally-rendered heading (cross-shadow-root, Chromium-only best effort, documented in Card.ts). A plain aria-labelledby attribute on <ds-card> couldn't reference that heading's id anyway, since it lives in Card's own shadow root, a different tree scope.
- The anatomy lists a distinct `articleHeader` part, but composing Card means the heading row is entirely Card's own internal `header` part (heading text only, no room for the timestamp) — Feed exposes `articleBody` (timestamp + content) and `articleActions` (footer) parts but no `articleHeader` part of its own.
- copy.position ('{index} of {total}') is rendered as a visually-hidden span reinforcing aria-posinset/aria-setsize, but only when `hasMore` is false (i.e. `total`/setsize is actually known); when `hasMore` is true, aria-setsize is -1 (unknown per the web platform notes) and the position text is omitted rather than showing '{index} of -1'. Not specified in the doc either way.
- newItemsOffset ('space above the new-items button when it appears') is implemented as padding-block-start on the button's own sticky wrapper rather than a margin, since there is no prior sibling to space against (the button is always first) and the styling rules forbid inter-sibling margins.
- Ctrl+End when `hasMore` only dispatches `load-more` and does not move focus ('first triggers a load so the end is real'); the doc doesn't specify whether the user must press Ctrl+End again once loading finishes and `hasMore` becomes false, or whether Feed should auto-escape once that happens — implemented as 'press again after it loads'.
- Ctrl+Home/Ctrl+End escaping outside the feed walks `document.body` for focusable elements (shadow-piercing, same technique as FocusScope.ts's private helpers, reimplemented locally since they aren't exported) — this assumes a single top-level document and won't follow focus into iframes.
- The empty state (`items.length === 0`) shows the loading indicator instead of `copy.empty` while `loading` is true, on the assumption that mid-initial-fetch shouldn't claim 'Nothing here yet.'; not specified in the doc.

## 2026-09-10 19:15 — round 1

- Feed: FeedItem's `content`/`actions` are typed `unknown` per lit notes ("any lit-html renderable") rather than a stricter TemplateResult union — the doc gives no exact type, so `unknown` was kept as the existing stand-in for ReactNode.
- Feed: `endMessage` prop's default fallback text (copy.end) is applied at render time (`this.endMessage ?? COPY_END`) rather than as the property's default value, since `undefined` must be distinguishable from an explicit empty string; not stated either way in the spec.
- Feed: on Ctrl+End with `hasMore`, the doc says 'press again once it has loaded and hasMore is false' to escape the feed — implemented by simply re-checking live `hasMore` on each Ctrl+End press (no explicit retry/debounce state), since the spec doesn't describe what happens if the caller never flips `hasMore` to false.
