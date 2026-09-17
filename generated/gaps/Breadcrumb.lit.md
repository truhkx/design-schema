# Gaps reported while generating Breadcrumb for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:01 — round 1

- Breadcrumb (lit): schema lists no `overrides`-hook wiring explicitly, but the package convention requires every overridable style binding to be a `--ds-breadcrumb-*` CSS hook plus an `overrides` property; the pre-existing file had neither — added `BreadcrumbOverridableBinding` (gap, fontFamily, fontSize, fontWeight, lineHeight) with hooks, matching the pattern in RadioGroup.ts.
- Breadcrumb (lit): the pre-existing file lacked `data-ds="Breadcrumb"` and `shadowRootOptions.delegatesFocus`; the latter is required for the generated `control-is-focusable` behavior test to pass (calling `.focus()` on the host must delegate into the shadow tree while `document.activeElement` stays the host) — added both.
- Breadcrumb (lit): the ellipsis button used a hand-drawn inline `<svg>` three-dot glyph instead of the system `ds-icon`; swapped for `<ds-icon name="ellipsis" inline>`, which already exists in the shared icon set.

## 2026-09-10 17:46 — round 1

- Breadcrumb: platforms.lit.reflect lists `collapse` un-negated even though its default is `true`; the package-wide boolean convention says a true-default boolean should reflect a negated attribute (e.g. `no-collapse`) since a present boolean attribute can't express `false` via raw HTML. Followed the explicit spec (`reflect: - collapse`, 'never change the doc's prop name') and kept the property/attribute named `collapse`, but a consumer writing `<ds-breadcrumb collapse="false">` in static HTML (not a Lit template) will still get `collapse=true`. Flagging for the doc to reconcile.

## 2026-09-16 05:19 — round 1

- Breadcrumb: the `separator` anatomy part is a CSS pseudo-element (li + li::before) on web/lit, so it has no data-part element for the `separatorColor` binding to target; styled the ::before instead.
- Breadcrumb: `itemColor` binds part `item` (the <li>), but its description says it applies only to an ancestor without href; applied it to the li (ds-link and the current span set their own color), so a plain-text ancestor has no element of its own.
- Breadcrumb: the ellipsis button has no anatomy part (not in `anatomy`), so it carries no part/data-part; the doc should add e.g. `expand` if tests or overrides need to find it.
- Breadcrumb: 'moves focus to the first revealed link' does not say what happens when the first revealed item has no href (plain text); chose the first revealed item that is a link, and no focus move if none is.
- Breadcrumb: `gap` is 'gap on both sides of the separator' but the separator is part of the following item; implemented as column-gap between items plus gap inside the item after the ::before, so a wrapped line can start with a separator.
- Breadcrumb: the ellipsis glyph is not named in the doc ('a three-dot glyph'); used ds-icon name="ellipsis" from tools/icon-paths.json.
- Breadcrumb: `navigate` is cancelable per the Events contract while platform notes say cancel via detail.originalEvent.preventDefault(); both work — a cancelled navigate calls preventDefault on originalEvent.
- Breadcrumb: the doc does not say whether `expanded` resets when `items` changes; it stays expanded (one-way).
- Breadcrumb: `items` is required with no default; defaulted to [] so the element renders an empty nav before the property is set.
- Breadcrumb: scenario `an-uncollapsed-trail-shows-every-ancestor` expects `text: Components`, but ancestor labels render inside ds-link's own shadow root, so the test reads text across nested shadow roots.

## 2026-09-17 05:26 — round 1

- Breadcrumb: the item focused after expanding (when no revealed item has an href) gets tabindex=-1 but the doc gives it no focus-visible style; Link and Button bring their own rings and 'Breadcrumb adds none', so a focused plain <li> shows only the browser default outline. Chose to add no style.
- Breadcrumb: the doc does not say whether tabindex=-1 on the revealed <li> should be removed afterwards or when items change; chose to set it once when focus moves and leave it.
- Breadcrumb: the behavior scenario 'the-trail-is-a-named-navigation-landmark' is web-only, and the Lit test covers the name only through the derived has-accessible-name scenario (toHaveAccessibleName on the nav); the doc does not say whether Lit should also assert role=navigation from inside the shadow root.
- Breadcrumb: the Keyboard-story testability rule applies only to components with a keyboard block; Breadcrumb has none, though the doc requires keyboard-operable (met by the native link and button). No Keyboard story added.
- Breadcrumb: 'every enum value of every enum prop' has nothing to cover (no enum props), and the doc names no story for the collapse=false case other than the AlwaysInFull example; no extra stories added.
- Breadcrumb: the doc does not say which element the `navigate` event's preventDefault acts on when originalEvent was already prevented by the consumer before dispatch; the native click cancels either way, so the order does not matter here.
