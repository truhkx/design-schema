---
title: Accordion
description: A stack of Disclosures with headings, arrow-key movement between them, and an optional one-open-at-a-time rule — the APG accordion built from the system's disclosure.
component:
  name: Accordion
  category: container
  status: review
  apg: accordion
  anatomy: [list, item, trigger, triggerIcon, panel]
  composition:
    item: Disclosure
  props:
    items:
      type: array
      required: true
      shape: '{ id: string; summary: string; content: ReactNode; disabled?: boolean }[]'
      description: The sections in order. `content` is the panel body (a slot per item on Lit).
    headingLevel:
      type: enum
      values: ['2', '3', '4', '5', '6']
      default: '3'
      description: Heading level for every trigger, so sections appear in the page outline.
    exclusive:
      type: boolean
      default: false
      description: 'Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration.'
    value:
      type: union
      description: 'Controlled open ids: always an array (zero or one entry when `exclusive`); `onChange` reports the same shape.'
      shape: 'string | string[]'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initially open ids.
      shape: 'string | string[]'
    divided:
      type: boolean
      default: true
      description: A hairline between items.
    keepMounted:
      type: boolean
      default: false
      description: Passed to every Disclosure; required when panels contain form fields.
  events:
    onChange:
      description: Fired when the set of open sections changes, with the open ids.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: openIds, type: array, shape: 'string[]', description: The ids of every open section. }
      fires: [user]
    onOpenChange:
      description: 'Fired per section as it opens or closes, with `{ id, open, reason }` (`reason`: `trigger`, `keyboard`, `exclusive` when another section closed it, `controlled`). The per-item trigger for analytics, lazy loading of a panel''s content, or scrolling the opened section into view; `onChange` remains the set-level event for state.'
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: id, type: string, description: The section whose state changed. }
        - { name: open, type: boolean, description: Its new state. }
        - { name: reason, type: enum, values: [trigger, keyboard, exclusive, controlled] }
      reasons:
        trigger: the section trigger was activated by pointer
        keyboard: the section was toggled from the keyboard
        exclusive: another section opened and closed this one
        controlled: the consumer changed the value prop
      fires: [user, controlled]
  keyboard:
    - { keys: [Enter, ' '], action: Toggles the focused section., from: first, expect: toggles }
    - { keys: [ArrowDown], action: Moves focus to the next trigger; wraps., from: first, expect: focus-next }
    - { keys: [ArrowUp], action: Moves focus to the previous trigger; wraps., from: last, expect: focus-prev }
    - { keys: [ArrowDown], action: From the last trigger wraps to the first., from: last, expect: focus-wraps-to-first }
    - { keys: [Home], action: First trigger., from: last, expect: focus-first }
    - { keys: [End], action: Last trigger., from: first, expect: focus-last }
    - { keys: [Tab], action: Ordinary tab order — every trigger is a tab stop (the APG recommends this so panel content stays reachable)., from: first, expect: focus-next }
  styles:
    divider: { token: color.border }
    dividerWidth: { token: border.width.thin }
    itemGap: { token: layout.gap.none, part: item, description: Items touch; the divider separates them. }
    triggerPaddingBlock: { token: space.md, part: trigger, description: 'Roomier than a lone Disclosure, since accordion triggers are section headings.' }
    fontFamily: { token: font.family.body }
    triggerFontSize: { token: font.size.md, part: trigger }
    triggerFontWeight: { token: font.weight.medium, part: trigger }
    minTarget: { token: size.target.min, description: 'The composed Disclosure''s own minimum; the accordion''s triggerPaddingBlock override raises the row to the comfortable size.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  a11y:
    role: none
    requires: [heading-hierarchy, expanded-state, arrow-navigation, keyboard-operable, focus-visible, contrast-aa, target-24px]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [data-ds=Accordion]
      notes: 'A <div> of Disclosures rendered with headingLevel and shared padding overrides; Accordion adds the arrow-key handler on the container (keydown from a trigger moves focus among triggers) and the exclusive logic. Every trigger stays a tab stop — no roving tabindex — per the APG accordion pattern.'
    lit:
      tag: ds-accordion
      reflect: [exclusive, { prop: divided, attribute: no-divided }, heading-level]
      notes: 'Light-DOM <ds-disclosure> children are the items (slot), so their content stays in the document; ds-accordion sets heading-level and keep-mounted on them, listens for their `toggle` to enforce exclusive, and handles arrow keys via keydown bubbling from the slotted triggers. `items` as a property is also accepted and renders <ds-disclosure> elements itself.'
    rn:
      element: View
      props: []
      notes: 'A View of Disclosures with dividers; exclusive logic and headingLevel passed through. Arrow keys apply only with a hardware keyboard on react-native-web.'
    swiftui:
      element: VStack
      props: [Disclosure, Heading, Button, .accessibilityValue=expanded, .focusSection, .onMoveCommand, '@FocusState']
      notes: 'A `VStack` of items, each a `Heading` at `headingLevel` wrapping the package trigger `Button` (`.accessibilityValue` expanded/collapsed) and its panel; `multiple`/`collapsible` per the doc; ArrowUp/Down/Home/End move between triggers on iPad via `@FocusState`. Panels animate with `transition` unless reduced motion. Composes Disclosure''s engine, not `DisclosureGroup`.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: click-on-a-trigger-reports-the-open-set
      description: onChange carries the open ids; onOpenChange reports the one section whose state changed.
      when: { click: trigger }
      then:
        - { event: onChange }
        - { event: onOpenChange }
        - { attribute: 'aria-expanded', is: 'true', 'on': trigger, platforms: [web, lit] }
    - name: exclusive-still-reports-both-events
      description: With exclusive, opening one section closes the others; the set-level onChange and the per-section onOpenChange both still fire.
      given: { exclusive: true }
      when: { click: trigger }
      then:
        - { event: onChange }
        - { event: onOpenChange }
  examples:
    - name: faq
      description: A list of questions, several of which can be open at once.
      given:
        items:
          - { id: 'cancel', summary: 'What happens if I cancel?', content: 'You keep access until the end of the billing period.' }
          - { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days of a charge, in full.' }
    - name: one-open-at-a-time
      description: A comparison list where opening a section closes the rest.
      given:
        exclusive: true
        items:
          - { id: 'free', summary: 'Free', content: 'One project and community support.' }
          - { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' }
    - name: form-sections
      description: Form sections whose panels stay mounted so the Form still collects the fields inside.
      given:
        keepMounted: true
        headingLevel: '2'
        items:
          - { id: 'contact', summary: 'Contact details', content: 'Name and email fields.' }
          - { id: 'billing', summary: 'Billing address', content: 'Street and city fields.' }
    - name: undivided
      description: Sections without the hairline, for an accordion that already sits inside a Card.
      given:
        divided: false
        items:
          - { id: 'shipping', summary: 'Shipping', content: 'Orders ship within two business days.' }
          - { id: 'returns', summary: 'Returns', content: 'Items can be returned within 30 days.' }
---

An accordion is a list of Disclosures that know about each other: consistent headings, arrow keys to move between them, and optionally the rule that opening one closes the rest. It is the right shape for FAQs, settings groups and long forms broken into sections.

## When to use

Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a settings page grouped by topic, a multi-part form where each part is optional. Set `headingLevel` to fit the page outline. Leave `exclusive` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose one plan to see details").

## When not to use

Do not use an Accordion for content most users need — show it. Do not use it as navigation or as tabs (Tabs replace content; an accordion adds it). Do not nest accordions. Do not use one for a single section; that is a Disclosure.

## Behavior

Each item is a Disclosure with a heading. Enter or Space toggles the focused item; with `exclusive`, opening one closes the others (closing does not open anything). Arrow keys, Home and End move focus among the triggers and wrap; Tab moves through triggers and open panel content in document order, since every trigger remains a tab stop. `onChange` receives the open ids. Disabled items are visible and skipped by arrows. `onOpenChange` reasons come from Disclosure's `onToggle(open, reason)`, so `keyboard` is distinguishable from `trigger` on web and Lit (native always reports `trigger`). With `exclusive` and several ids in `value`/`defaultValue`, the first is opened and a development warning notes the rest. Items are identified by `id` (on Lit, the slotted `<ds-disclosure>`'s `id` attribute); Accordion adds `data-part="item"` to each Disclosure root it renders.

## Content guidelines

Summaries are section titles — noun phrases or questions in sentence case, parallel across the list. Panel content starts with the answer, not a restatement of the heading. For FAQs, order by frequency, not alphabetically.

## Accessibility

Each trigger is a button inside a heading of the given level with `aria-expanded` and `aria-controls` (WCAG 4.1.2, 2.4.6; APG accordion), so the accordion reads as a list of headings in the rotor. Arrow keys are a convenience, not a replacement for Tab: every trigger is in the tab order so no panel content is stranded (2.1.1). Expanded state is visible (chevron) and announced. Targets meet 44px in the accordion form.

## Platform notes

### Web
Render `<div data-ds="Accordion">` containing a `Disclosure` per item with `headingLevel`, `keepMounted`, `open` controlled by the accordion's state, and `overrides={{ triggerPaddingBlock: 'space.md' }}`; a `Divider` between items when `divided`. Keydown on the container: when the event target is one of the triggers, handle ArrowUp/Down/Home/End by focusing the sibling trigger. `exclusive` maps each `onToggle` to the new open set.

### Lit
`<ds-accordion exclusive heading-level="3"><ds-disclosure summary="…">…</ds-disclosure>…</ds-accordion>`. On `slotchange`, set `heading-level`, `keep-mounted` and the padding override on each slotted `ds-disclosure`; listen for their composed `toggle` to enforce `exclusive` and dispatch `change`; handle arrow keys from bubbling keydown whose composed path includes a slotted trigger.

### React Native
`View` of `Disclosure`s with `Divider`s; the accordion owns the open set and passes `open`/`onToggle` to each. No arrow keys on native.

## Related

Disclosure, Tabs, Divider, Heading.
