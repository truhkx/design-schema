# Gaps reported while generating Card for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-09 20:56 — round 1

- Card: the doc's Lit note says the interactive hit-area extension needs 'the consumer's stylesheet or a small global rule from the package' to draw the ::after on the slotted light-DOM link/button, since a shadow stylesheet can't reach slotted content. Rather than leaving that as an undocumented external dependency, Card.ts injects the rule itself via a <style> tag into the card's root node (document head, or the nearest ancestor ShadowRoot) the first time an interactive card is used there — a self-contained implementation of the same idea, but worth flagging since it wasn't spelled out as code.
- Card: labelling the host article by the shadow-rendered heading ('aria-labelledby the heading id') has no standard cross-shadow-boundary mechanism. Implemented as best-effort using ElementInternals.ariaLabelledByElements (feature-detected), which as of this writing is Chromium-only; other engines get an article with no accessible name from the heading.
- Card: 'size restrained per the theme' for the header ds-heading wasn't given a value — used the smallest available HeadingSize ('md'), leaning on the theme's 'hierarchy from weight, not size' guidance, fixed regardless of headingLevel.
- Card: none of the 11 given behavior scenarios exercise headerActions, footer, or interactive — all are plain 'renders: true' checks on heading-level/inset/surface. Those paths are covered by stories (WithHeaderActions, WithFooter, InteractiveTrue) but have no corresponding test, since the doc didn't include scenarios for them.

## 2026-09-09 21:47 — round 1

- Card: spec gives no explicit size for the rendered <ds-heading> (web notes only say 'restrained per the theme'); implementation fixes size="md" for every headingLevel so visual weight stays modest regardless of level, per the theme's 'hierarchy from weight over size' guidance.
- Card: cross-shadow-boundary aria-labelledby uses ElementInternals.ariaLabelledByElements, a Chromium-only, feature-detected API; in browsers without it the host gets role="article" but no programmatic accessible name from the heading — a platform gap the spec doesn't address.
- Card: headerGap/footerGap are layout.gap tokens (loose/normal/tight) but ds-stack's own `gap` property only exposes the space.{0-12} scale, so Card sets `style="gap: var(--ds-card-*-gap)"` directly on the composed <ds-stack> rather than using its gap attribute — reaching a style into a composed child, which the composition rule otherwise forbids; treated as an application of the Overrides section's sanctioned host-CSS-specificity escape hatch since Stack's schema doesn't yet expose layout.gap tokens.
- Card: the interactive hit-area selector was broadened to `ds-link, ds-button, a[href], button` instead of only `ds-link`/`ds-button`, so a raw slotted anchor or button button still gets the extended hit area even though the spec only names the two Lit components.

## 2026-09-09 21:49 — round 2

- Card: the `parse` gate failure (checkbox.md/switch.md rejecting an unrecognized `behavior` frontmatter key) is unrelated to Card and not caused by anything in packages/lit/src/Card.ts, Card.stories.ts, or index.ts — card.md is not among the failing docs. The real fix is either adding `behavior` to schema/component.schema.json or amending the two docs, both of which are outside my permitted edit paths (schema/, site/) this round, so I left Card's files untouched rather than papering over an unrelated, out-of-scope schema/doc mismatch.

## 2026-09-09 21:49 — round 3

- Card: the `parse` gate failure (checkbox.md/switch.md rejecting an unrecognized `behavior` frontmatter key) is identical to round 2's report and still does not implicate card.md or any file in packages/lit/src/Card.*  — the fix requires editing schema/component.schema.json or the two docs, both outside my permitted edit paths (schema/, site/) and unrelated to Card's implementation. If a Card-specific gate is actually failing, its output wasn't included here; I could not find one by inspection (no literals in Card.ts/Card.stories.ts, card.md parses cleanly).

## 2026-09-09 22:21 — round 1

- Card: schema lists `actionsGap` (layout.gap.tight, gap between header-actions controls) as both a style binding and overridable, but the existing implementation omitted it entirely (no hook, no CSS). Added `--ds-card-actions-gap` and styled `slot[name='header-actions']` as `display: flex; gap: var(--ds-card-actions-gap)` so slotted controls in that named slot lay out with the token gap; updated the WithHeaderActions story to include two controls (a Link and a ghost icon Button, per the anatomy note 'at most two') so the gap is visible.
- Card: spec doesn't say how a slot with multiple assigned elements should get gap applied across the shadow boundary; chose styling the `<slot>` element itself as a flex container (assigned nodes flow as its layout children), consistent with how the rest of the file already avoids `::slotted` for layout.
