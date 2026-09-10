# Gaps reported while generating Feed for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 16:52 — round 1

- Anatomy declares a distinct `articleHeader` part, but composing Card means the heading row is entirely Card's own internal `header` part (heading text only, no room for a timestamp); Feed exposes its own `articleBody` and `articleActions` wrapper divs with those data-part hooks, but has no `articleHeader` hook of its own — mirrors the same gap already reported for the Lit generation.
- copy.position ('{index} of {total}') is rendered as a visually-hidden span reinforcing aria-posinset/aria-setsize, but only when `hasMore` is false (total/setsize known); when `hasMore` is true, aria-setsize is -1 and the position text is omitted rather than showing '{index} of -1'. Not specified either way in the doc.
- No copy.* token covers relative-time text ('3 min ago'). Used `Intl.RelativeTimeFormat('en', { numeric: 'auto' })` (matching the sibling Lit generation's locale choice) instead of inventing English strings, since the rule against un-tokenized user-facing text has no alternative here.
- Card's root always sets `data-part="surface"` (hardcoded after its own prop spread) and has no focus-visible treatment for a non-interactive root that becomes programmatically focusable. Feed's own declared `focusRing`/`focusRingWidth` bindings are applied via a CSS selector reaching into the composed Card (`[data-ds="Card"]:focus-visible`), since inline styles can't express pseudo-classes — flagged as a place Card's schema might grow a 'focusable' variant rather than Feed reaching in.
- newItemsOffset ('space above the new-items button when it appears') is implemented as padding-block-start on the button's own sticky wrapper rather than a margin, since the button is always the first child (no prior sibling to space against) and the styling rules forbid margins between siblings.
- Ctrl+End when `hasMore` only fires `onLoadMore` and does not move focus ('first triggers a load so the end is real'); the doc doesn't say whether the user must press Ctrl+End again once loading finishes and `hasMore` becomes false — implemented as 'press again after it loads', matching the Lit generation.
- With zero items there is no article to attach the load-more IntersectionObserver to, so an empty feed with `hasMore: true` never self-triggers its first load — the caller must fetch the first page independently (before rendering Feed, or via its own effect). Not specified in the doc.
- endMessage has no declared inset/padding binding of its own, so the `loadingInset` hook is reused for both the loading indicator's and the end message's surrounding padding — matches the sibling React Native generation's same choice absent a dedicated token.

## 2026-09-10 19:25 — round 1

- Feed: `newItemsOffset` is padding-block-start on the sticky button row rather than a margin, per the spacing rule (no margins between siblings) — the doc's own note confirms this choice.
- Feed: the spec gives `loadingInset` and `endMessageInset` the same token (`layout.inset.md`) but separate overridable bindings; a prior pass had collapsed them into one shared CSS hook, silently making `endMessageInset` a no-op override — split into `--ds-feed-loading-inset` and `--ds-feed-end-message-inset` so both bindings are independently overridable as the schema requires.
- Feed: 'once on mount when items is empty and not loading' (fires onLoadMore for an empty feed's first page) was missing from a prior pass — no IntersectionObserver target exists with zero articles, so this is a plain mount effect guarded by a ref so it fires once per empty-to-populated transition, not on every render.
- Feed: no `copy.*` string covers relative timestamps ('3 min ago'); used `Intl.RelativeTimeFormat` (locale 'en') rather than inventing English copy, matching the interval boundaries the schema names (minute/hour/day/week) — same choice as the existing Lit generation.
- Feed: `aria-setsize` while `hasMore` is `-1` per the platform notes; the visually-hidden `copy.position` span is rendered only once the total is known (`hasMore` false), which the schema states explicitly.
