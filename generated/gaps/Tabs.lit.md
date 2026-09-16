# Gaps reported while generating Tabs for lit

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:28 — round 1

- Tabs: anatomy lists tablist/tab/tabLabel/tabIcon/indicator/panel but omits a badge part even though tabs[].badge and the badgeColor/badgeSize style bindings exist; rendered the badge as a visible span inside the tab but did not give it a `part` (parts must be anatomy names verbatim), so it can't be targeted via ::part.
- Tabs: the keyboard table only lists ArrowRight/ArrowLeft 'when: horizontal' with no explicit vertical equivalents, even though orientation='vertical' and the prose ('use Up/Down arrows') require them; implemented ArrowDown/ArrowUp as the vertical analogues of ArrowRight/ArrowLeft (same wrap/skip-disabled logic) since the doc is otherwise internally inconsistent.
- Tabs: 'Only the selected panel is rendered unless keepMounted' is written for a virtual-DOM platform; ds-tab-panel elements are literal light-DOM children already parsed by the browser, so I implemented it by physically detaching (panel.remove()) non-selected, non-keepMounted panels and reattaching them on reselection, caching the element reference in between. This destroys/recreates nested DOM state on every switch (matching 'state does not survive' for the default case) but is a materially different mechanism than framework unmounting and isn't spelled out for this platform.
- Tabs: platforms.web.attributes lists aria-controls on the tab pointing at the panel id, and the Lit platform notes only call out the analogous aria-labelledby-crosses-shadow-boundary problem for the panel side. I set aria-controls on the shadow-root tab button to the panel's id anyway (as literally specified) even though this IDREF cannot resolve across the shadow boundary any more than aria-labelledby can; the tab↔panel association for assistive tech instead relies on the panel's aria-label (set from the tab's label) plus role=tabpanel.
- Tabs: the indicator's 'absolutely positioned bar animated between tabs' is only described in the Web platform notes, not the Lit ones; implemented it as a shadow-DOM span whose position/size is measured from the selected tab's offsetLeft/offsetTop/offsetWidth/offsetHeight and re-measured via a ResizeObserver on the tablist, since the schema doesn't specify a measurement mechanism for Lit.

## 2026-09-10 18:21 — round 1

- Tabs: aria-controls on the shadow-root <button role="tab"> points at the light-DOM <ds-tab-panel> id, but IDREFs don't cross the shadow boundary (the same limitation the doc calls out for the panel's aria-labelledby, which is why panels use aria-label instead). The doc doesn't offer a workaround for this direction; kept aria-controls as specified since it's the literal attribute the platform notes require, but it will not resolve for assistive tech across the boundary.

## 2026-09-12 05:07 — round 1

- Tabs: the existing Tabs.ts implemented `keepMounted: false` by removing/re-appending unselected light-DOM `<ds-tab-panel>` children via a detached-panel map — exactly the anti-pattern the package conventions and platform notes forbid (re-inserting an already-slotted child re-fires slotchange and can spin the renderer). Rewrote syncPanels() to never move/detach/append a panel, only toggling `hidden`; as a direct consequence `keepMounted` has no observable effect on Lit (panels are consumer-owned light DOM and are never unmounted either way), unlike on platforms that actually remove unselected panels from the tree. Documented this on the property and in the class doc rather than inventing new behavior not in the schema.
- Tabs: schema's a11y/behavior text says 'a tab without a matching panel, or a panel without a tab, is a development warning and is not rendered' — since Lit can't refuse to render a consumer's slotted light-DOM child, implemented 'not rendered' as forcing `hidden` on an orphan panel, plus added the two missing dev warnings (tab→panel and panel→tab) that the prior implementation never emitted.
- Tabs: anatomy part `tabBadge` had no `part` attribute on the badge span in the prior implementation; added `part="tab-badge"` for consistency with the other anatomy parts (tab-label, tab-icon) and the @csspart doc block.

## 2026-09-16 07:58 — round 1

- Tabs: platforms.lit.notes says ds-tabs sets `aria-labelledby` on panels, but the Lit guidance says an IDREF cannot cross the shadow boundary and to use `aria-label`; element reflection (ariaLabelledByElements) also cannot point from light DOM into a descendant shadow root. Chose `aria-label` = the tab's label; the notes should drop aria-labelledby.
- Tabs: web attributes list `aria-controls` on the tab, but a shadow-DOM tab's IDREF cannot resolve a light-DOM panel id. Chose `ariaControlsElements = [panel]` (element reflection, allowed toward the host's tree) and no attribute where unsupported; the doc should say so.
- Tabs: `copy.position` ("{index} of {total}") is only placed by the SwiftUI notes (accessibilityValue); nothing says where web/Lit use it, and role=tab already exposes set size/position. Not rendered on Lit; the doc should mark it SwiftUI-only or name a web placement.
- Tabs: `keepMounted` has no observable effect on Lit, since panels are the consumer's light-DOM children and `keepMounted: false` is already expressed with `hidden`. Kept as a non-reflected `keep-mounted` property for parity; the doc should state it is a no-op on Lit.
- Tabs: 'A tab without a matching panel ... is not rendered' conflicts with Lit panels arriving by slotchange after the first render (filtering tabs would flicker and reorder focus). Chose to render the tab and warn in development; orphan panels are forced hidden.
- Tabs: the keyboard table says only ArrowRight/ArrowDown and not ArrowLeft/ArrowUp/Home/End select under automatic activation; APG selects on every move. Chose to select on every focus move under automatic activation.
- Tabs: badge accessible name — guidance says it reads as part of the name ("Inbox, 3") but gives no copy for the separator. Chose aria-labelledby on the label and badge spans (joined with a space: "Inbox 3").
- Tabs: `panelGap` has part `panel`, but the gap sits between the list and the panel on the host's flex layout; applied as the host `gap` rather than on the panel part.
- Tabs: `listGap`, `listBorder`, `listBorderWidth`, `badgeColor`, `badgeSize`, font and radius bindings declare no `part`; applied to tablist (list*), tabBadge (badge*) and tab (font*, radius).
- Tabs: `minTarget` (size.target.comfortable) does not say whether it applies to block size only or both axes; applied as min block and inline size on the tab.
- Tabs: the Keyboard story's activation is unspecified while the Enter/Space rule needs `manual` and the ArrowRight rule mentions automatic selection; chose `activation: manual` with three enabled tabs, orientation from the URL.
- Tabs: `click: tab` in the scenarios does not say which tab; tests click the first tab (a non-selected one when defaultValue is 'activity').
