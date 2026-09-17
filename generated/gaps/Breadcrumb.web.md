# Gaps reported while generating Breadcrumb for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:58 — round 1

- Breadcrumb: the previously-generated file predated the data-ds/data-part/overrides conventions (no testability hooks, no overrides prop, and an inline hand-drawn SVG for the ellipsis instead of the system Icon component). Brought it up to current convention: added data-ds="Breadcrumb", data-part on nav/list/item/link/current, an overrides prop for the non-locked bindings (gap, fontFamily, fontSize, fontWeight, lineHeight), CSS hooks (--ds-breadcrumb-*) for every binding including the locked ones, and swapped the inline SVG for <Icon name="ellipsis" inline />.
- Breadcrumb: the schema's `styles` block gives a token only for the current-page text (color.foreground, locked as currentColor) and the separator (color.foreground.muted); it says nothing about the color of an ancestor item that has no href and renders as plain (non-link) text. Kept the existing choice of reusing currentColor (color.foreground) for that plain-text case, since it isn't the current page but is also not decorative punctuation like the separator.

## 2026-09-10 17:49 — round 1

- Breadcrumb: `itemColor` (color.foreground.muted, for an ancestor without href) was previously wired to the same CSS hook as `currentColor` (color.foreground); added a separate `--ds-breadcrumb-item-color` hook so the two locked bindings are independently themeable/contrast-checkable as the schema lists them distinctly.
- Breadcrumb: spec doesn't say whether the ellipsis button needs its own override-hook-bearing class; kept the existing `ds-breadcrumb__expand` marker class with no CSS rules (Button styles itself), since giving it real rules would count as restyling a composed child.

## 2026-09-16 05:17 — round 1

- Breadcrumb: the component already existed with the index.ts export in place; it was rewritten rather than created, and index.ts was left unchanged.
- Breadcrumb: anatomy lists `link` as a part, but the composed Link already sets its own `data-part="anchor"`. I passed `data-part="link"` through Link's rest props, which replaces Link's hook on that element. The spec should say whether a composed part's data-part goes on the child or on a wrapper.
- Breadcrumb: the `itemColor` binding names part `item` (the <li>) but describes only an ancestor without `href`. I set the colour on the <li>, so it reaches plain-text ancestors; Link and current set their own colours. The binding could name a dedicated part (e.g. `text`) instead.
- Breadcrumb: `gap` is 'gap on both sides of the separator', but the rules forbid margins between siblings. I used list `column-gap` (before the separator) plus <li> `gap` (after it). Row gap on wrap is unspecified and left at 0.
- Breadcrumb: `copy.current` ('current page') has no stated use on web, where aria-current="page" already announces it. It is not rendered on web; the doc should say it is SwiftUI/RN-only.
- Breadcrumb: the ellipsis glyph is described only as 'a three-dot glyph'; I used Icon name `ellipsis` from tools/icon-paths.json. The doc should name it.
- Breadcrumb: 'moves focus to the first revealed link' doesn't cover a revealed item with no href (plain text). I focus the first revealed item that is a link, and focus nothing if none is.
- Breadcrumb: it is unspecified whether an empty-string `href` counts as missing; I render it as plain text, like a missing href.
- Breadcrumb: `onNavigate` is cancelable, but the doc only mentions `event.preventDefault()`. I also cancel when the handler returns `false`, to match Link's onClick and the cancelable-event rule.
- Breadcrumb: collapse with exactly 5 items hides only one middle item behind the ellipsis, which saves no space. The rule says 'more than four'; I followed it literally.
- Breadcrumb: an empty `items` array, or a single item, isn't covered. It renders an empty <ol> or a lone current item, with no dev warning (the doc calls a single-item trail noise but asks for no warning).
- Breadcrumb: `BreadcrumbItem` uses the schema shape verbatim (`href?: string`); under exactOptionalPropertyTypes callers can't pass `href: undefined` explicitly, unlike the `| undefined` convention for props.
- Breadcrumb: no enum props, so the 'one story per enum value' rule has nothing to apply to. I added CollapseTrue/CollapseFalse for the boolean alongside the four example stories.

## 2026-09-17 05:25 — round 1

- Breadcrumb: the focus fallback puts tabindex=-1 on the first revealed <li>, but the doc says Breadcrumb adds no focus ring (Link and Button bring their own). A focusable <li> with no visible focus would fail focus-visible, so I added a :focus-visible outline on the item. The doc should say whether this outline is intended.
- Breadcrumb: 'first revealed item' is ambiguous. I read the revealed range as indices 1 to length-3, taken when the ellipsis is pressed, and the fallback item as index 1. The doc doesn't say what happens if `items` changes between the press and the focus move.
- Breadcrumb: the anatomy has no part for a plain-text ancestor (an item without href). I rendered it as a <span> with no data-part, and it takes its colour from the item's itemColor.
- Breadcrumb: the web notes don't say whether the `link`/`expand` wrapper spans need a display value. I left them inline, so the Link and Button lay out inside the item's inline-flex row.
- Breadcrumb: the doc gives no story for the no-href focus fallback or for an ancestor without href. I kept the existing AncestorWithoutHref story and added no story for the fallback.
