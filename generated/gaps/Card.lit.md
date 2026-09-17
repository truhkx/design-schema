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

## 2026-09-10 01:26 — round 1

- Card: spec's Lit notes say the interactive hit-area class is applied via 'a small global rule from the package' but doesn't say where that stylesheet lives given the light-DOM link may be in an arbitrary ancestor tree (page or another shadow root); existing implementation injects a scoped <style> into whichever root the slotted element resolves in (ensureHitAreaStyle), tracked per-root via a WeakSet to avoid duplicate injection.
- Card: spec doesn't say what happens when zero or more than one interactive child is slotted for `interactive`; existing implementation leaves the card non-interactive (no hit-area class applied) and logs a DEV-only console.warn.
- Card: header Heading size isn't specified beyond 'so a card heading reads smaller than a page heading' (web notes say size: lg, but existing Lit implementation uses size="md"); kept as previously generated since no reflected size mismatch was flagged elsewhere.

## 2026-09-10 17:28 — round 1

- Card: `focusable` is a boolean prop but is absent from `platforms.lit.reflect` (which lists only inset, surface, interactive, heading-level), unlike `interactive` which is boolean and reflected. Followed the explicit reflect list literally and left `focusable` non-reflecting (still a real boolean attribute via the default Lit boolean converter, just not reflected back to the DOM), but this is inconsistent with the general 'booleans get reflect: true' convention stated elsewhere and may be a doc omission.
- Card: a11y.role is declared as `none` at the schema level, but platforms.web notes require an `article` role labelled by the heading when `heading` is set. Implemented per the web notes (role toggles article/none via ElementInternals) since platform notes are more specific than the generic a11y block; flagging in case `role: none` was meant to apply uniformly.
- Card: no behavior scenario exercises `focusable` (all 11 scenarios only cover renders/headingLevel/inset/surface), so its tabindex/:focus-visible behavior has no generated test coverage — only a manual `FocusableTrue` story was added.

## 2026-09-16 04:26 — round 1

- Card: in Lit the enlarged hit area is drawn on the ds-link/ds-button host element, so a click there never reaches the native <a>/<button> inside its shadow root and nothing happens. The doc doesn't say how to activate the child. I chose to forward the click by calling click() on the child's inner a[href]/button, which reaches into the child's shadow root. Link and Button could instead expose a public activate() method.
- Card: 'An interactive card always reserves border.width.focus, transparent until focused' means a surface=default interactive card loses its visible border. The doc doesn't say whether the border colour should stay at the wider width. I followed React: transparent border, focus colour on :focus-within.
- Card: the doc doesn't say whether header actions and footer controls on an interactive card stay clickable above the enlarged hit area (only the RN notes say they keep their own target). I lifted the header-actions and footer rows with position: relative and z-index: 1.
- Card: the Lit notes say to find 'the single ds-link/ds-button in the default slot', but children are usually wrapped in a Stack, so the doc doesn't say whether to search only direct children or all descendants. I search all descendants of the slotted elements, matching ds-link, ds-button, a[href] and button (the web guidance).
- Card: the focus ring for an interactive card is described as ':focus-within', which also shows it on mouse focus. The focus-visible requirement suggests keyboard focus only, but :focus-visible can't be seen across the slot from the host. I used :host([interactive]:focus-within).
- Card: a focusable card with delegatesFocus would pass scripted focus on to its first focusable child. The Lit convention says to use delegatesFocus 'for anything focusable', which conflicts with this. I left delegatesFocus off.
- Card: the anatomy lists body/headerActions/footer as slots and header/footer gaps as parts, but doesn't say which element carries data-part for the footer (the slot or the row around it). I put data-part='footer' on the row div and data-part='body'/'headerActions' on the slot elements.
- Card: the doc gives a Heading size of 'lg' only in the prose platform notes, not in a parts/props contract. I used size='lg' (the old Lit element used 'md').
- Card: the Default story needs a heading so the HeadingLevel stories show something, but examples use 'exactly their given', so DenseGridCard (no heading in given) inherits Default's heading. The doc doesn't define a Default args set. I kept heading 'Notification settings' in Default.
- Card: the example given 'children: A Link to the invoice' is prose describing content, not a value. I render children as a ds-link label when interactive is true, and as ds-text otherwise.
- Card: the behavior scenario 'a-card-with-a-heading-is-an-article' and the tabindex half of 'focusable-takes-scripted-focus-only' are marked web-only, so they aren't in the Lit list. The element still implements both (role='article' plus aria-label, and tabindex='-1').
- Card: the React guidance says aria attributes passed through ...rest (role, aria-posinset…) land on the root, but for Lit the doc doesn't say how a consumer's role interacts with the card's own role='article'. I set role only when the consumer hasn't set one, and remove only a role the card itself wrote.

## 2026-09-17 04:41 — round 1

- Card: `interactive` says a disabled child disables the card, but not what counts as disabled on Lit (ds-link has no `disabled`, a raw a[href] cannot be disabled). Chose: a `disabled` attribute or aria-disabled="true" on the target, watched by a MutationObserver that writes nothing back.
- Card: the lit notes name only the `target-focus` custom state; the 'no hover background without a single target' and 'disabled target' rules need a selector too. Chose: extra custom states `has-target` and `target-disabled` for the hover rules.
- Card: 'warns once in development' for zero/several interactive children doesn't say when to judge 'zero' if the body is added after connection. Chose: no warning on the first update; the check runs again, with a warning, on the body's slotchange and when `interactive` changes later.
- Card: `focusable` says 'draws its ring as an outline … no offset' but not on which element; the host has no radius. Chose: outline on the surface part while the host matches :focus-visible, with the host's own outline removed.
- Card: the Behavior section says aria attributes passed through `...rest` land on the root, and the lit notes protect a consumer's role; neither says whether a consumer's aria-label survives a heading. Chose: the card writes and removes only an aria-label it set itself.
- Card: the lit notes put header-actions/footer rows at position: relative; z-index: 1 without saying whether that's only for interactive cards (the web notes tie it to the hit area). Chose: only under [interactive], to avoid a stacking context on plain cards.
- Card: the scenario `a-card-with-a-heading-is-an-article` expects role article 'labelled by that heading', but on Lit the name is aria-label (ids don't cross the shadow root). Test checks role="article" plus aria-label equal to the heading text.
- Card: the anatomy lists `heading` as a part but Behavior says it keeps the Heading's own hook and carries no data-part; the prior Lit output put data-part="heading" on ds-heading. Chose the Behavior rule (no data-part on the heading).
