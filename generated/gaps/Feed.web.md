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

## 2026-09-16 12:57 — round 1

- Feed: Card writes its own data-part="surface" after spreading rest props, so `data-part="article"` cannot sit on the article; it is on a Feed-owned wrapper div around each Card. The articleInset binding (part: article) is forwarded to Card's paddingBlock/paddingInline overrides, since Card's `inset` is an sm|md|lg enum rather than a token hook.
- Feed: Button also writes its own data-part, so `data-part="newItemsButton"` is on the sticky row that wraps the Button; a behavior test clicking the part must click the button inside it.
- Feed: Card has no unread prop and children must not be restyled, so the locked unreadBorder/unreadBorderWidth bar is a ::before on Feed's item wrapper, laid over the Card's start edge. The doc should say where the bar is drawn, or Card should grow a start-edge accent.
- Feed: the visually-hidden "unread" and position runs are plain <span>s with Feed's clip class. The web notes ask for a visually-hidden Text, but Text has no visually-hidden option.
- Feed: the doc gives no position for the "unread" word; it comes first in articleBody, then the timestamp, then the position run, then the content.
- Feed: `timestamp` is a composed Text, but Text only renders p|span, so a <time dateTime title> (carrying data-part="timestamp" and the aria-describedby id) sits inside a Text span with tone muted, size xs; timestampSize is forwarded to that Text's fontSize.
- Feed: onLoadMore's description says "End / Ctrl+End" but the keyboard table lists only Control+End; only Ctrl+End is implemented, per 'implement every key exactly as listed and nothing else'.
- Feed: when the empty state shows is underspecified with hasMore true and loading false (the moment before the first page is requested). copy.empty shows only when items are empty, not loading and hasMore is false, so an empty feed about to fetch stays blank rather than flashing 'Nothing here yet.'
- Feed: emptyState has no style bindings (no inset, color or size), so it is a default Text with no padding; only fontFamily is forwarded to it.
- Feed: the live-region requirement names no element. The new-items row is an always-rendered role=status (so the button's count is announced when it appears) with padding only while shown; the end message and loading indicator are not live, and aria-busy covers loading.
- Feed: fontFamily is both a root hook (--ds-feed-font-family, inherited by caller content) and forwarded to the composed Text (timestamp, end message, empty state) and Button overrides, since those set their own font family.
- Feed: onItemVisible fires once per item id per mount (the observer stops watching after it fires); the doc does not say whether an item that leaves and comes back should fire again.
- Feed: relative timestamps are computed at render and do not tick over time; the doc does not say whether 'just now' should refresh. Future timestamps are clamped to 'just now', and an unparseable timestamp renders as-is with no title.
- Feed: the absolute date formats are not specified; the fallback after 7 days uses Intl.DateTimeFormat(undefined, {dateStyle: 'medium'}) and the title uses {dateStyle: 'medium', timeStyle: 'short'}.
- Feed: the sticky new-items row needs a stacking layer the doc does not name; it uses var(--layer-raised) as DataGrid/TreeGrid do.
- Feed: after onShowNew, 'moves focus to the first new article' is implemented as focusing the new first Card once the first item's id changes, then scrollIntoView (smooth, or auto under reduced motion); the doc does not say what happens if the caller prepends nothing.
- Feed: the Keyboard story's `given` args and URL are not declared for Feed, so Keyboard is Default plus newItemsCount: 2 (a new-items button plus two article Buttons and a Link as focusable children).
