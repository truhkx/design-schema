# Gaps reported while generating Tabs for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:26 — round 1

- Tabs: the keyboard table only lists ArrowRight/ArrowLeft (when: horizontal); there is no explicit row for vertical orientation, even though the orientation prop and the guidance prose ('Vertical tab lists ... use Up/Down arrows') require it. I mirrored the same next/prev/wrap logic onto ArrowDown/ArrowUp when orientation=vertical rather than leaving vertical tab lists unnavigable.
- Tabs: the schema gives no guidance on what happens when `tabs[]` and the `TabPanel` children in `children` are out of sync (a tab with no matching panel id, or a panel with no matching tab). I render whatever panels exist that match a tab id and silently skip the rest, with no dev warning.
- Tabs: indicator placement (underline vs. side bar, which edge, whether it sits on top of or replaces the list border) isn't pixel-specified. I placed it flush against the list border edge (bottom for horizontal, inline-end for vertical) and measure its offset/size from the selected tab button via getBoundingClientRect-equivalent offsetLeft/offsetWidth (or offsetTop/offsetHeight), recomputed on selection, orientation, fit and tabs changes plus window resize.
- Tabs: `fit: fill` behavior for vertical orientation is undocumented (the doc only mentions it for phones/horizontal). I applied the same flex:1 stretch to tabs regardless of orientation rather than special-casing or ignoring it when vertical.
- Tabs: disabled tabs use aria-disabled (per the general convention) but, unlike Switch/RadioGroup's 'disabled stays focusable' rule, disabled tabs never receive the roving tabindex (they're excluded from the enabled-tabs array used for Home/End/arrow targets and the initial/default selection), so they are never a Tab-key stop — this follows the APG tabs pattern's roving-tabindex requirement over the generic aria-disabled-stays-focusable rule, but the schema doesn't call out the conflict explicitly.

## 2026-09-10 18:28 — round 1

- Tabs: the doc says 'a tab without a matching panel, or a panel without a tab, is a development warning and is not rendered' — the existing implementation did neither; added isDev console.warn for each orphaned tab/panel and filtered both from rendering, matching the style of existing components' dev warnings (e.g. Card, DataGrid).
- Tabs.stories.tsx composed multiple TabPanel children via a JSX Fragment (`<>...</>`) assigned to `children` in args — React.Children.toArray does not flatten Fragments (only real arrays), so panels were never matched to tabs and silently never rendered even before this pass. The doc doesn't specify how to author multi-element `content` props for Storybook args (vs. direct JSX nesting where Babel already produces an array), so I chose to pass an array of TabPanel elements instead; note the sibling Carousel.stories.tsx has the identical Fragment pattern and is very likely subject to the same bug, but that's out of scope for this task.
- Tabs.tsx called `tabEl.scrollIntoView(...)` unguarded; jsdom/older environments don't implement it. Added the same `typeof tabEl.scrollIntoView === 'function'` guard already used in Carousel.tsx.

## 2026-09-16 07:54 — round 1

- Tabs: copy.position '{index} of {total}' has no web use (the web platform notes only use it on SwiftUI as accessibilityValue). Screen readers already announce the position of role=tab, so visible or hidden text would be read twice; I set aria-posinset/aria-setsize and did not render the string.
- Tabs: the Web notes say to call scrollIntoView({ inline: 'nearest' }) on selection, but that also scrolls the page (including on first render). I set the tab list's scrollLeft directly so only the list scrolls.
- Tabs: the guidance says badges are read as part of the name ('Inbox, 3'), but a comma separator would be user-facing text not in copy. I put a plain space before the badge, so the name is 'Inbox 3'.
- Tabs: with keepMounted false, unselected panels are not in the DOM, so aria-controls would point at a missing id. The spec lists aria-controls on every tab; I set it only when the panel is mounted.
- Tabs: TabPanel ids are the raw tab ids ('overview'), which can collide with other ids on the page; the spec requires matching ids, so I kept them unprefixed. Tab ids use useId.
- Tabs: the behavior scenarios' 'click: tab' and 'key: ArrowRight' don't say which tab; from the givens it has to be the first tab, and the key scenarios assume focus starts on it. The disabled-tab scenario replaces tabs with two items while the Default story's children still hold four panels, so two orphan panels trigger the dev warning during that test.
- Tabs: the web tabpanel notes list no styling for panel text; I kept the existing panel font-size/line-height from the tabs' fontSize/lineHeight bindings and color from --color-foreground, which no binding names.
- Tabs: the `tabs` shape is used verbatim, except optional fields also take `| undefined` for exactOptionalPropertyTypes (exported as TabsItem).
- Tabs: `fit: fill` stretches tabs along the orientation axis in both orientations, but a vertical list is only as tall as its content, so fill has no visible effect when vertical.
