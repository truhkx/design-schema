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

## 2026-09-21 03:39 — round 1

- Breadcrumb: `focusRing` and `focusRingWidth` are declared `locked: true`, but the overrides contract states every style binding becomes a `--ds-breadcrumb-*` hook on `:host`. Locked bindings are excluded from the `overrides` type, so the two rules contradict. I followed the package convention and read `--color-border-focus` / `--border-width-focus` directly with no hook, matching how `currentColor`, `itemColor`, `separatorColor` and `minTarget` are already written.
- Breadcrumb: the focus-fallback ring is specified as `:focus-visible` on the `<li>`, but that element is focused programmatically via `.focus()` after the ellipsis is pressed. Chromium only matches `:focus-visible` on a programmatically focused non-input element when the preceding interaction was keyboard, so a mouse press on the ellipsis reveals the items and moves focus but draws no ring. The doc does not say whether the ring should be forced in that case; I kept native `:focus-visible` semantics rather than adding a `:focus` fallback.
- Breadcrumb: `copy.current` ("current page") is defined but the lit platform note says it is not rendered because `aria-current="page"` announces it, which conflicts with the rule that every `copy.*` string is used verbatim. I followed the platform note, so the string is unused on Lit and the constant is not emitted.
- Breadcrumb: the doc says the `tabindex="-1"` focus fallback is "left in place afterwards, also across `items` changes", and that the fallback is index 1. Lit reuses list-item DOM nodes positionally, so the attribute stays on whichever item later occupies index 1 rather than following the originally focused item. I read that as the intended behaviour (it keeps the item out of the tab order) and did not clear it on an `items` change, but which of the two the doc means is ambiguous.
- Breadcrumb: the examples list names four stories, and no story is specified for the `Default` args or for the boolean `collapse`. React ships `CollapseTrue`, `CollapseFalse` and `AncestorWithoutHref`, and its meta args are the settings trail. I mirrored React's meta args and added those three stories for parity; the doc should name them if they are meant to be part of the contract.
- Breadcrumb: the doc does not state what focus should do when `collapse` is on, the trail is expanded, and every revealed item lacks an `href` and `items` then changes to a shorter trail such that index 1 no longer exists. I take no action in that case (the stale `tabindex` simply disappears with the element), and focus is never re-targeted after the reveal update.

## 2026-09-23 14:16 — round 1

- Breadcrumb: example `ancestor-without-href` gives items Docs/Reference/Tokens/Color, but the React story `AncestorWithoutHref` (and the previous Lit one) uses Docs/Guides/Theming. Lit follows the example; React is out of parity until it is regenerated.
- Breadcrumb: `collapse` is a boolean, not an enum, so 'one story per enum value' does not apply. Kept `CollapseTrue`/`CollapseFalse` only because React exports them; the doc never says whether boolean props get per-value stories.
- Breadcrumb: the separator's `content` value lives in a hook named `--ds-breadcrumb-separator`, while `separatorColor` would by the naming rule also start with `--ds-breadcrumb-separator` (`-color`). Chose `--ds-breadcrumb-separator` for the copy string and `--ds-breadcrumb-separator-color` for the colour; the doc should say whether that name is reserved for the copy string.
- Breadcrumb: the focus-fallback ring's `outline-offset` is not specified. Used `focusRingWidth` as the offset, the same as the web version.
- Breadcrumb: composition says the `link` part gets exactly `{ tone: default }` and `expand` gets `{ variant, size, iconOnly }`, but Link also needs `href` and `label` and Button needs `label` (copy.expandLabel) plus the `ellipsis` icon in its `leading-icon` slot. Passed those as necessary data; the composition block should list them.
- Breadcrumb: 'more than four items' is read from `COLLAPSE_ABOVE = 4` with no token or constant expression in the doc, so the number is hard-coded.
