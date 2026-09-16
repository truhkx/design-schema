---
title: Tabs
description: One region, several panels, one visible at a time — chosen from a tab list that is a single tab stop with arrow-key movement, per the APG tabs pattern.
component:
  name: Tabs
  category: navigation
  status: review
  apg: tabs
  anatomy: [tablist, tab, tabLabel, tabIcon, tabBadge, indicator, panel]
  composition:
    tabIcon: Icon
  props:
    tabs:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; disabled?: boolean; badge?: string }[]'
      description: 'The tabs in order. `badge` is a short count or status shown after the label ("3", "New").'
    children:
      type: content
      required: true
      description: 'One panel per tab, in the same order, each wrapped in the exported `TabPanel` (or `<ds-tab-panel>`) with a matching `id`. Only the selected panel is rendered unless `keepMounted`.'
    label:
      type: string
      required: true
      description: 'Accessible name of the tab list ("Account sections"). Not shown visually.'
    value:
      type: string
      description: Controlled selected tab id. Omit for uncontrolled.
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: Initially selected tab id. Defaults to the first enabled tab.
    activation:
      type: enum
      values: [automatic, manual]
      default: automatic
      description: '`automatic` selects a tab as arrow keys move to it (fine when panels are cheap); `manual` moves focus only and selects on Enter/Space (use when a panel loads data).'
    orientation:
      type: enum
      values: [horizontal, vertical]
      default: horizontal
      description: Vertical tab lists sit beside their panels and use Up/Down arrows.
    fit:
      type: enum
      values: [start, fill]
      default: start
      description: '`start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs).'
    keepMounted:
      type: boolean
      default: false
      description: Keep unselected panels in the tree (hidden) so their state survives switching.
  events:
    onChange:
      description: Fired when the selected tab changes, with the new id.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: value, type: string, description: The id of the selected tab. }
      fires: [user]
  keyboard:
    - { keys: [Tab], action: 'Moves focus to the selected tab, then out of the tab list into the panel (the list is one tab stop).', from: any, expect: manual }
    - { keys: [ArrowRight], action: 'Moves to the next tab, wrapping; selects it under automatic activation.', when: horizontal, from: first, expect: focus-next }
    - { keys: [ArrowLeft], action: 'Moves to the previous tab, wrapping.', when: horizontal, from: last, expect: focus-prev }
    - { keys: [ArrowDown], action: 'Moves to the next tab, wrapping; selects it under automatic activation.', when: vertical, from: first, given: { orientation: vertical }, expect: focus-next }
    - { keys: [ArrowUp], action: 'Moves to the previous tab, wrapping.', when: vertical, from: last, given: { orientation: vertical }, expect: focus-prev }
    - { keys: [ArrowRight], action: From the last tab wraps to the first., when: horizontal, from: last, expect: focus-wraps-to-first }
    - { keys: [Home], action: First tab., from: last, expect: focus-first }
    - { keys: [End], action: Last tab., from: first, expect: focus-last }
    - { keys: [Enter, ' '], action: Selects the focused tab (manual activation)., when: manual, from: first, expect: selects }
  styles:
    tabColor: { token: color.foreground.muted, part: tab }
    tabSelectedColor: { token: color.foreground.strong, part: tab }
    tabHoverBackground: { token: color.background.subtle, part: tab, state: hover }
    tabPaddingBlock: { token: space.sm, part: tab }
    tabPaddingInline: { token: space.md, part: tab }
    tabGap: { token: layout.gap.tight, part: tab, description: 'Between icon, label and badge inside a tab.' }
    listGap: { token: layout.gap.none, description: Tabs touch; the indicator separates them. }
    indicator: { token: color.control.selectedBackground, part: indicator, description: 'The selected tab''s underline (horizontal, flush against the list border at the bottom edge) or side bar (vertical, flush against the inline-end edge next to the panels) — the selected-control fill, which is chosen per mode to meet 3:1 on the page (the primary button fill is not).' }
    indicatorThickness: { token: border.width.focus, part: indicator }
    listBorder: { token: color.border, description: The rule under the whole tab list. }
    listBorderWidth: { token: border.width.thin }
    panelGap: { token: layout.gap.loose, part: panel, description: Between the tab list and the panel. }
    badgeColor: { token: color.foreground.muted }
    badgeSize: { token: font.size.xs }
    fontFamily: { token: font.family.body }
    fontSize: { token: font.size.md }
    fontWeight: { token: font.weight.medium }
    lineHeight: { token: font.lineHeight.normal }
    radius: { token: radius.sm, description: On the tab's hover background and focus ring. }
    minTarget: { token: size.target.comfortable }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    transition: { token: motion.duration.fast, description: 'Indicator movement, with motion.easing.standard; instant under reduced motion.' }
    disabledOpacity: { token: opacity.disabled }
  copy:
    position:
      text: '{index} of {total}'
      params:
        index: { type: number, description: The tab's position in the tab list. }
        total: { type: number, description: How many tabs the tab list has. }
  a11y:
    role: tablist
    requires: [accessible-name, selected-state, arrow-navigation, roving-tabindex, keyboard-operable, focus-visible, contrast-aa, target-24px, reduced-motion]
    contrast:
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.strong, background: color.background, level: AA }
      - { foreground: color.foreground.strong, background: color.background.subtle, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
  platforms:
    web:
      element: div
      attributes: [role=tablist, aria-label, aria-orientation, role=tab, aria-selected, aria-controls, tabindex, role=tabpanel, aria-labelledby]
      notes: '<div role="tablist" aria-label> of <button role="tab" aria-selected aria-controls tabindex={0|-1}>; panels are <div role="tabpanel" aria-labelledby tabindex="0"> (focusable so Tab from the list lands on the panel content region). The indicator is a pseudo-element or an absolutely positioned bar animated between tabs. The tab list scrolls horizontally with overflow when tabs exceed the width, with the selected tab scrolled into view.'
    lit:
      tag: ds-tabs
      reflect: [value, orientation, activation, fit]
      notes: '`tabs` is a property. Panels are slotted <ds-tab-panel id> light-DOM elements; ds-tabs sets hidden/aria-labelledby on them from slotchange and renders the tab list in its shadow root. Panels are never moved, detached or re-appended: `keepMounted: false` is expressed only by toggling the `hidden` attribute on the slotted panel, so there is no detached-panel map. A slotchange handler must never call appendChild, insertBefore or remove on its own slotted children - re-inserting a node that is already a child re-fires slotchange and spins the renderer until the tab is killed. `change` is a composed CustomEvent with detail { value }. Roving tabindex over shadow tabs.'
    rn:
      element: View
      props: [accessibilityRole=tablist, accessibilityRole=tab, accessibilityState]
      notes: 'A horizontal ScrollView (or View with fill) of Pressables with accessibilityRole="tab" and accessibilityState={{ selected }}; panels are Views. Arrow keys apply with a hardware keyboard only; each tab is its own accessibility stop, as on native. Indicator animated with Animated.'
    swiftui:
      element: VStack
      props: [.accessibilityElement=contain, Button, .accessibilityAddTraits=isSelected, .focusable, .onMoveCommand, '@FocusState', ScrollView, ScrollViewReader]
      notes: 'Not `TabView` (bottom tab bar semantics). The tab list is an `HStack` in a horizontal `ScrollView` (scrolls when tabs overflow; `ScrollViewReader` keeps the selected tab visible) of `Button`s with `.isSelected` on the current one and `.accessibilityValue(copy.position)`; the list is one focus section and arrows move the roving `@FocusState` per `activation` (automatic selects on move, manual on Enter/Space). Panels are the package''s own views shown by selection, each `.accessibilityElement(children: .contain)` labelled by its tab. `orientation: vertical` swaps the stacks. Indicator and borders from the tokens with the `transition` animation.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: click-selects-a-tab
      description: Clicking a tab that is not the selected one changes the selection and reports the new id.
      given: { defaultValue: activity }
      when: { click: tab }
      then:
        - { event: onChange }
    - name: clicking-the-selected-tab-changes-nothing
      description: onChange fires when the selected tab changes; re-pressing the current tab is not a change.
      given: { defaultValue: overview }
      when: { click: tab }
      then:
        - { event: onChange, fired: false }
    - name: the-selected-tab-is-marked-selected
      description: Selection is carried by aria-selected on the tab, which is what a screen reader reports.
      given: { defaultValue: overview }
      then:
        - { attribute: aria-selected, is: 'true', 'on': tab }
      platforms: [web]
    - name: arrow-selects-under-automatic-activation
      description: automatic selects a tab as arrow keys move to it (keyboard rule, ArrowRight).
      given: { activation: automatic }
      when: { key: ArrowRight }
      then:
        - { event: onChange }
      platforms: [web, lit]
    - name: manual-activation-does-not-select-on-arrow
      description: manual moves focus only and selects on Enter/Space.
      given: { activation: manual }
      when: { key: ArrowRight }
      then:
        - { event: onChange, fired: false }
      platforms: [web, lit]
    - name: a-disabled-tab-cannot-be-selected
      description: A tab marked disabled in the tabs array is visible but selects nothing when pressed.
      given: { tabs: [{ id: overview, label: Overview, disabled: true }, { id: activity, label: Activity }], defaultValue: activity }
      when: { click: tab }
      then:
        - { event: onChange, fired: false }
  examples:
    - name: account-sections
      description: The default horizontal tab list over one panel per section.
      given: { label: Account sections, tabs: [{ id: profile, label: Profile }, { id: billing, label: Billing }, { id: security, label: Security }], children: 'One TabPanel per tab, matching ids' }
    - name: manual-activation-for-expensive-panels
      description: Panels that fetch on open, so arrows move focus and Enter selects.
      given: { label: Report sections, tabs: [{ id: summary, label: Summary }, { id: details, label: Details }], activation: manual, children: 'One TabPanel per tab, matching ids' }
    - name: vertical-tabs-beside-their-panels
      description: A vertical tab list for a settings page, moved through with Up and Down.
      given: { label: Settings sections, tabs: [{ id: general, label: General }, { id: members, label: Members }], orientation: vertical, children: 'One TabPanel per tab, matching ids' }
    - name: filled-tabs-with-a-badge
      description: Two tabs stretched across a phone-width layout, one carrying a count, with both panels kept mounted.
      given: { label: Inbox sections, tabs: [{ id: inbox, label: Inbox, badge: '3' }, { id: archive, label: Archive }], fit: fill, keepMounted: true, children: 'One TabPanel per tab, matching ids' }
---

Tabs let one region of a screen show one of several views. The tab list is a single stop in the tab order — arrow keys move between tabs — and the selected panel follows immediately. They are for views of equal standing that the user switches between often; not for steps, and not for navigation between pages.

## When to use

Use Tabs to split a region's content into two to about seven views that are alternatives of each other: the sections of a settings page, "Overview / Activity / Files" on a record, code and preview. Use `manual` activation when a panel is expensive to show. Use `vertical` when there are many tabs and horizontal room is short. Use `fill` on phones for two to four tabs.

## When not to use

Do not use Tabs for navigation to different pages — that is a nav Landmark of Links, styled as tabs if you like, but with real links so the URL changes. Do not use them for a sequence (Stepper, planned) or a comparison where the user needs to see several panels at once (put them side by side or in an Accordion). Do not put a tab list inside a Card header for one or two tabs; a SegmentedControl is lighter.

## Behavior

The selected tab is the list's single tab stop. Arrow keys along the orientation move focus between enabled tabs and wrap; with `automatic` activation the moved-to tab is selected and its panel shown, with `manual` the user presses Enter or Space. Home and End jump. Tab from a tab moves into the selected panel. Disabled tabs are visible, announced disabled and skipped. Only the selected panel is rendered unless `keepMounted`, in which case unselected panels are hidden. The indicator animates to the selected tab. When tabs overflow horizontally, the list scrolls and the selected tab is kept in view. Disabled tabs are `aria-disabled`, skipped by the arrow keys and not tab stops (a disabled tab has nothing to reach); they remain visible and readable. `fit: fill` stretches tabs along the orientation axis in both orientations. Badges are read as part of the tab's name ("Inbox, 3"). A tab without a matching panel, or a panel without a tab, is a development warning and is not rendered — on Lit an orphan panel is a consumer's own light-DOM child that cannot be refused, so "not rendered" there means forced `hidden`. On Lit, panels are light-DOM children, so `keepMounted: false` hides inactive panels with the `hidden` attribute rather than removing them.

## Content guidelines

Tab labels are one or two words, sentence case, nouns ("Activity", "Members"), never verbs. Badges are short counts or a single status word. The tab list `label` names what the tabs divide ("Project sections"). Order tabs by frequency of use, not alphabetically, and never reorder them at runtime.

## Accessibility

Role `tablist` with a name, `tab`s with `aria-selected` and `aria-controls`, panels with `tabpanel` and `aria-labelledby` (WCAG 4.1.2; APG tabs). One tab stop with arrow movement (roving-tabindex, arrow-navigation), so a screen full of tabs is not a screen full of stops. Selection is conveyed by `aria-selected`, the indicator and the stronger text color — not color alone (1.4.1). Panels are focusable so keyboard users land in the content. Targets meet 44px; the indicator meets 3:1 on the page (1.4.11). The indicator animation respects reduced motion.

## Platform notes

### Web
Render `<div role="tablist" aria-label aria-orientation>` of `<button role="tab" id aria-selected aria-controls tabindex>`, with the indicator as an absolutely positioned bar whose `inset-inline-start` and `inline-size` update from the selected tab's offset (transitioned with `transition`). Panels: `<div role="tabpanel" id aria-labelledby tabindex="0" hidden>`. Keydown on the list implements the keyboard table for the orientation. `overflow-x: auto; scrollbar-width: none` on the list with `scrollIntoView({ inline: 'nearest' })` on selection. Export `TabPanel` as the wrapper for children.

### Lit
`<ds-tabs label="Project sections" .tabs=${tabs}><ds-tab-panel id="overview">…</ds-tab-panel>…</ds-tabs>`. Tab list in the shadow root; panels are light-DOM `<ds-tab-panel>` elements that ds-tabs manages (`hidden`, `role="tabpanel"`, `aria-labelledby` pointing at a shadow tab requires the tab id to be exposed — set `aria-labelledby` to a light-DOM proxy text or use `aria-label={tab label}` on the panel instead, since IDREFs do not cross shadow boundaries). Composed `change`.

### React Native
`ScrollView horizontal` (or a `View` with `flexDirection: 'row'` for `fill`) of `Pressable accessibilityRole="tab" accessibilityState={{ selected, disabled }}`; the indicator is an `Animated.View` positioned from the measured tab layout; panels are `View`s rendered when selected. Vertical: a column of tabs beside the panel. Arrow keys through `onKeyDown` are web-only (react-native-web); on native every tab is an accessibility stop.

## Related

SegmentedControl, Accordion, Disclosure, Link, Stepper (planned).
