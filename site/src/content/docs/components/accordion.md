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
    item: { component: Disclosure, forwards: { triggerPaddingBlock: triggerPaddingBlock, fontFamily: triggerFontFamily, triggerFontSize: triggerFontSize, triggerFontWeight: triggerFontWeight } }
  props:
    items:
      type: array
      required: true
      shape: '{ id: string; summary: string; content: ReactNode; disabled?: boolean }[]'
      description: 'The sections in order. `content` is the panel body; on Lit it is dropped from the item type and the body is a light-DOM child slotted by the item id (`<div slot="faq-1">`); light-DOM children that are neither a `<ds-disclosure>` nor slotted by an item id are not rendered, and only child additions and removals are observed (changing an existing child''s `slot` attribute later is not). The optional field follows the package convention for optional properties (`disabled?: boolean | undefined`). `disabled` forwards to the Disclosure''s own `disabled`: the section cannot be toggled, and its trigger stays focusable and a tab stop (`aria-disabled`, not `disabled`), so arrow keys and Home/End skip it on web and Lit. On React Native, which has no arrow navigation, a disabled item differs only in that its trigger does not respond to a press and carries `accessibilityState.disabled`.'
    headingLevel:
      type: enum
      values: ['2', '3', '4', '5', '6']
      default: '3'
      description: Heading level for every trigger, so sections appear in the page outline.
    exclusive:
      type: boolean
      default: false
      description: 'Opening one section closes the others. Off by default: users usually want to compare, and forced-closing is a common frustration. Turning it on while several sections are open trims the open set to the first open id without firing any event. The development warning is about a declared set, not about a trim: it fires whenever `exclusive` is on and the resolved `value`/`defaultValue` holds more than one id — a standing controlled `value` is such a declaration and keeps warning (once per distinct id list) as long as it holds several ids — and never fires for the trim of sections a user opened while uncontrolled. "First" is array order: the order of `value`/`defaultValue`, and for uncontrolled state the order the sections were opened, not item order. Uncontrolled, the trim changes state for good, so turning `exclusive` off again does not reopen the trimmed sections; controlled, the trim only affects what is shown, so turning `exclusive` off shows the full `value` again, still without events. Toggling `exclusive` does not consume a pending just-emitted set (see Behavior).'
    value:
      type: union
      description: 'Controlled open ids. A bare `string` is accepted as shorthand for a one-id array; an empty array or an empty string means nothing is open. Events always report an array, with zero or one entry when `exclusive`.'
      shape: 'string | string[]'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: 'Initially open ids; the same shapes as `value`. Given both, `value` controls and `defaultValue` is ignored, with no warning.'
      shape: 'string | string[]'
    divided:
      type: boolean
      default: true
      description: A hairline between items.
    keepMounted:
      type: boolean
      default: false
      description: 'Passed to every Disclosure; required when panels contain form fields. Accordion-wide, like `headingLevel`: the `items` shape carries no per-item override for either, so an accordion cannot keep only some panels mounted.'
  events:
    onChange:
      description: 'Fired when the set of open sections changes, with the open ids — always an array, even under `exclusive`, where it carries zero or one entry.'
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: openIds, type: array, shape: 'string[]', description: The ids of every open section. }
      fires: [user]
      timing: { phase: after-change, before: [onOpenChange] }
    onOpenChange:
      description: 'Fired per section as it opens or closes, with `{ id, open, reason }` (`reason`: `trigger`, `keyboard`, `exclusive` when another section closed it, `controlled`). The per-item trigger for analytics, lazy loading of a panel''s content, or scrolling the opened section into view; `onChange` remains the set-level event for state.'
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: id, type: string, description: The section whose state changed. }
        - { name: open, type: boolean, description: Its new state. }
        - { name: reason, type: enum, values: [trigger, keyboard, exclusive, controlled] }
      reasons:
        trigger: 'the section trigger was activated by pointer — Disclosure''s `pointer` reason maps to `trigger`'
        keyboard: 'the section was toggled from the keyboard — web and Lit pass through the activation method Disclosure reports on its own toggle, so the two reasons must not be collapsed there; React Native has no such signal and reports `trigger` for every activation'
        exclusive: another section opened and closed this one
        controlled: 'the `value` prop changed to a set the accordion did not itself just emit. The accordion computes `exclusive` and `controlled` itself: a Disclosure `onToggle` with reason `controlled` is the echo of the accordion setting that Disclosure''s `open`, and is ignored, so nothing is reported twice'
      fires: [user, controlled]
      timing: { phase: after-change }
  keyboard:
    - { keys: [Enter, ' '], action: Toggles the focused section., from: first, expect: toggles }
    - { keys: [ArrowDown], action: Moves focus to the next trigger; wraps., from: first, expect: focus-next }
    - { keys: [ArrowUp], action: Moves focus to the previous trigger; wraps., from: last, expect: focus-prev }
    - { keys: [ArrowDown], action: From the last trigger wraps to the first., from: last, expect: focus-wraps-to-first }
    - { keys: [Home], action: First trigger., from: last, expect: focus-first }
    - { keys: [End], action: Last trigger., from: first, expect: focus-last }
    - { keys: [Tab], action: Ordinary tab order — every trigger is a tab stop (the APG recommends this so panel content stays reachable)., from: first, expect: focus-next }
  styles:
    divider: { token: color.border, description: 'Passed to each composed Divider as its `color` override (always, even when it equals Divider''s default); Accordion writes no divider rule of its own. The Divider keeps its default `spacing: none`: `itemGap` is the only space around it, and its default `semantic: false`, so the dividers are decorative and the accordion reads as a list of headings. Like `dividerWidth` and `fontFamily`, this is an overridable hook even though it names no `part`: all seven bindings are overridable, whether or not they carry one.' }
    dividerWidth: { token: border.width.thin, description: 'Passed to each composed Divider as its `thickness` override.' }
    itemGap: { token: layout.gap.none, part: list, description: 'Items touch; the divider separates them. Applied as the gap of the `list` container (flex `gap` on web and Lit, the `gap` style on React Native), never on the Disclosure itself, so when `divided` the gap also falls between each item and its Divider — intended: the divider sits centred in the space between items. At the default `layout.gap.none` that space is zero, so the centring is only observable through an `itemGap` override.' }
    triggerPaddingBlock: { token: space.md, part: trigger, description: 'Roomier than a lone Disclosure, since accordion triggers are section headings. Forwarded to Disclosure''s `triggerPaddingBlock`, like `fontFamily`, `triggerFontSize` and `triggerFontWeight` (see `composition`); the accordion does not style the trigger itself.' }
    fontFamily: { token: font.family.body, part: trigger, description: 'Forwarded to Disclosure''s `triggerFontFamily`. Like `divider` and `dividerWidth`, it is an overridable hook even though Accordion writes no rule for it.' }
    triggerFontSize: { token: font.size.md, part: trigger }
    triggerFontWeight: { token: font.weight.medium, part: trigger }
    minTarget: { token: size.target.min, description: 'The composed Disclosure''s own minimum, applied by Disclosure; Accordion adds no rule for it (nor for `focusRing`/`focusRingWidth`). The `triggerPaddingBlock` forward makes the row roomier but does not guarantee a 44px target.' }
    focusRing: { token: color.border.focus, description: Applied by the composed Disclosure's trigger; Accordion adds no rule. }
    focusRingWidth: { token: border.width.focus, description: Applied by the composed Disclosure's trigger; Accordion adds no rule. }
  a11y:
    role: none
    requires: [heading-hierarchy, expanded-state, arrow-navigation, keyboard-operable, focus-visible, contrast-aa, target-24px]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
  platforms:
    web:
      element: div
      attributes: [data-ds=Accordion]
      notes: 'A <div> of Disclosures rendered with headingLevel and shared padding overrides; Accordion adds the arrow-key handler on the container (keydown from a trigger moves focus among triggers) and the exclusive logic. Every trigger stays a tab stop — no roving tabindex — per the APG accordion pattern. The root <div> is the `list` part (`data-part="list"`). Each trigger is Disclosure''s own inline trigger, so its hit area ends at the summary rather than spanning the row; Accordion does not stretch it (a full-width trigger needs a Disclosure prop). Every forwarded binding reaches the child through its `overrides` prop, not through a rule the accordion writes into the child, so `--ds-accordion-item-gap` is the only hook a consumer can set from CSS; the other six are settable only through Accordion''s own `overrides`.'
    lit:
      tag: ds-accordion
      reflect: [exclusive, { prop: divided, attribute: no-divided }, heading-level, keep-mounted]
      notes: 'Light-DOM <ds-disclosure> children are the items (slot), so their content stays in the document; ds-accordion sets heading-level and keep-mounted on them, listens for their `toggle` to enforce exclusive, and handles arrow keys via keydown bubbling from the slotted triggers. `items` as a property is also accepted and renders <ds-disclosure> elements itself. The shadow root''s flex container is the `list` part (`data-part="list"` and `part="list"`). Light-DOM disclosures are assigned manually, one slot per disclosure, with <ds-divider> rendered between the slots in the shadow root, so on Lit the Dividers are not light-DOM siblings of the items (address an item as `ds-accordion > ds-disclosure`). Forwarded bindings reach each Disclosure as its `--ds-disclosure-*` hook set from the accordion''s own hook (`--ds-disclosure-trigger-padding-block: var(--ds-accordion-trigger-padding-block)`), so a consumer''s CSS override of the accordion hook still arrives; the Dividers get `--ds-divider-color`/`--ds-divider-thickness` the same way. A slotted disclosure''s composed `toggle` is left to reach the page (the consumer owns those elements), including its `reason: ''controlled''` echoes whenever `exclusive` or a `value` change opens or closes it, so a page listening to slotted children sees those as well as the accordion''s `open-change`; the `toggle` of disclosures rendered from `items` is stopped at the accordion, which reports `change`/`open-change` instead. The trigger hit area ends at the summary, as on web. The `ds-accordion > ds-disclosure` address holds for the slotted form only: in `items` mode the disclosures live in the accordion''s shadow root, so address them as `ds-accordion`''s `shadowRoot.querySelectorAll(''ds-disclosure'')`. `change` is not stopped from bubbling out of panel content either, so a page listening on `<ds-accordion>` also receives the composed `change` of a field inside a panel; the accordion''s own event is the one whose `detail` carries `openIds`, and a listener that cares must check for it rather than assume every `change` is the accordion''s. The generated keyboard gate runs against the `items` form (its story passes `items`, matching the React story''s args), not the slotted form.'
    rn:
      element: View
      props: []
      notes: 'A View of Disclosures with dividers; exclusive logic and headingLevel passed through. Native has no key events on Pressable, so ArrowUp/Down/Home/End are not implemented and `reason` is never `keyboard`; every trigger is an ordinary accessibility focus stop reached by swipe, which is the native equivalent of the arrow shortcut. No web-only key handler is added either, so arrow keys do nothing on react-native-web too. Native has no heading levels: `headingLevel` only gives each Disclosure summary `accessibilityRole="header"`, so every heading-level scenario renders the same tree and RN tests check the header role, not a level. The `list` part is the root View (the root `testID="Accordion"`, with no `Accordion.list` hook) and `itemGap` is its `gap` style; the `item` part is each composed Disclosure root, and `trigger`, `triggerIcon` and `panel` keep Disclosure''s own testIDs — Accordion adds no `Accordion.*` testID for any inherited part. `keyboard` stays in the `onOpenChange` reason union for parity with the other platforms but is never emitted here, and no keyboard scenario is generated for this platform.'
    swiftui:
      element: VStack
      props: [Disclosure, Heading, Button, .accessibilityValue=expanded, .focusSection, .onMoveCommand, '@FocusState']
      notes: 'A `VStack` of items, each a `Heading` at `headingLevel` wrapping the package trigger `Button` (`.accessibilityValue` expanded/collapsed) and its panel; `multiple`/`collapsible` per the doc; ArrowUp/Down/Home/End move between triggers on iPad via `@FocusState`. Panels animate with `transition` unless reduced motion. Composes Disclosure''s engine, not `DisclosureGroup`.'
  behavior:
    # Authored scenarios; the parser adds renders/enum ones from the schema.
    - name: click-on-a-trigger-reports-the-open-set
      description: 'onChange carries the open ids; onOpenChange reports the one section whose state changed. With nothing open, clicking the first trigger fires onChange([firstId]) and then onOpenChange(firstId, true, trigger).'
      when: { click: trigger }
      then:
        - { event: onChange }
        - { event: onOpenChange }
        - { attribute: 'aria-expanded', is: 'true', 'on': trigger, platforms: [web, lit] }
    - name: exclusive-still-reports-both-events
      description: 'With exclusive, opening one section closes the others; the set-level onChange and the per-section onOpenChange both still fire. With `pro` open, clicking the first trigger (`free`) fires onChange([free]), then onOpenChange(free, true, trigger), then onOpenChange(pro, false, exclusive).'
      given:
        exclusive: true
        defaultValue: 'pro'
        items:
          - { id: 'free', summary: 'Free', content: 'One project and community support.' }
          - { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' }
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
    - name: initially-open
      description: An accordion that starts with one section open, uncontrolled from there.
      given:
        defaultValue: 'setup'
        items:
          - { id: 'setup', summary: 'Getting set up', content: 'Install the package and add the provider.' }
          - { id: 'upgrade', summary: 'Upgrading', content: 'Read the migration notes before bumping a major.' }
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

Each item is a Disclosure with a heading. Enter or Space toggles the focused item; with `exclusive`, opening one closes the others (closing does not open anything). Arrow keys, Home and End move focus among the triggers and wrap; Tab moves through triggers and open panel content in document order, since every trigger remains a tab stop. `onChange` receives the open ids. Disabled items are visible and skipped by arrows: arrow keys, Home and End never land on a disabled trigger, but they still work when focus starts on one (it remains a tab stop). `onOpenChange` reasons come from Disclosure's `onToggle(open, reason)` — `pointer` becomes `trigger`, `keyboard` stays `keyboard`, and Disclosure's `controlled` (the echo of the accordion setting `open`) is ignored — so `keyboard` is distinguishable from `trigger` on web and Lit (native always reports `trigger`). One toggle fires, in order: `onChange` with the new set, then `onOpenChange` for the toggled section, then one `onOpenChange(id, false, 'exclusive')` per section `exclusive` closed, in item order. With `exclusive` and several ids in `value`/`defaultValue`, the first is opened and a development warning notes the rest, once per distinct id list; the warning is a development aid, not copy, so its wording is not contract — only the condition and the frequency are. Arrow keys, Home and End are live only when the event target is one of the triggers, so a key pressed inside an open panel is left to the page; when every item is disabled the key is left unhandled too, rather than trapping focus. Because a disabled trigger stays focusable, a keyboard scenario must not include disabled items — the `from: first`/`from: last` index would otherwise count one. Items are identified by `id` (on Lit, the slotted `<ds-disclosure>`'s `id` attribute). The `item` part is the composed Disclosure root itself — Accordion does not add a `data-part="item"` hook and must not wrap items in an extra element to carry one, since Dividers are direct siblings of the items (on web and React Native; on Lit they sit between per-item slots in the shadow root, see its notes); address an item as `[data-ds="Accordion"] > [data-ds="Disclosure"]`. The `trigger`, `triggerIcon` and `panel` parts are tagged by Disclosure. Nothing open is `[]` or `''`, never `undefined`. `reason: 'controlled'` is reported when `value` arrives holding a set the accordion did not itself just emit; a controlled parent that answers a trigger with some other set therefore sees `controlled`, which is the intended reading. The just-emitted set is compared only with the next `value` change and then cleared, as Disclosure does for `open`: a parent that ignores `onChange` leaves it pending until `value` next changes, and a change caused only by toggling `exclusive` does not consume it. A `controlled` `value` change fires `onOpenChange` only for sections whose open state actually changed, in item order; a `value` that resolves to the set already shown (for example several ids trimmed back to the same one under `exclusive`) fires nothing. That is one pass over `items`: opens and closes are not grouped by direction, they interleave in item order. An id in `value`/`defaultValue` that matches no item is silently ignored — it reports nothing and opens nothing — and duplicate ids in `items` are not detected; neither warns. Only a `value` change is diffed, so replacing `items` while controlled reports nothing, even for an added id whose open state differs. Replacing `items` never prunes the open set either: an id whose section is gone stays in it, matching nothing, and opens that section again if the item returns. Events fire from the toggle handler with the new set as the payload, in controlled and uncontrolled mode alike; they do not wait for the re-render. Every forward (to Disclosure and to Divider) always carries the resolved token — the consumer's override, else the Accordion default — even when it equals the child's own default. An item's `id` is the accordion's key, not a DOM id: on web and React Native each Disclosure generates its own element ids, so two accordions with the same item ids never collide. On Lit, `value`/`defaultValue` are the only source of the open set: a slotted `<ds-disclosure>`'s own `open` or `default-open` attribute is overwritten, not read.

## Content guidelines

Summaries are section titles — noun phrases or questions in sentence case, parallel across the list. Panel content starts with the answer, not a restatement of the heading. For FAQs, order by frequency, not alphabetically.

## Accessibility

Each trigger is a button inside a heading of the given level with `aria-expanded` and `aria-controls` (WCAG 4.1.2, 2.4.6; APG accordion), so the accordion reads as a list of headings in the rotor. Arrow keys are a convenience, not a replacement for Tab: every trigger is in the tab order so no panel content is stranded (2.1.1). Expanded state is visible (chevron) and announced. Targets meet the 24px minimum through Disclosure's `minTarget`; the accordion's `space.md` block padding makes rows roomier but does not guarantee 44px, and the hit area ends at the summary text rather than spanning the row.

## Platform notes

### Web
Render `<div data-ds="Accordion">` containing a `Disclosure` per item with `headingLevel`, `keepMounted`, `open` controlled by the accordion's state, and `overrides` carrying the forwarded `triggerPaddingBlock`, `triggerFontFamily` (from `fontFamily`), `triggerFontSize` and `triggerFontWeight`; a `Divider` between items when `divided`, with `overrides` `color` (from `divider`) and `thickness` (from `dividerWidth`). Keydown on the container: when the event target is one of the triggers, handle ArrowUp/Down/Home/End by focusing the sibling trigger. `exclusive` maps each `onToggle` to the new open set.

### Lit
`<ds-accordion exclusive heading-level="3"><ds-disclosure summary="…">…</ds-disclosure>…</ds-accordion>`. On `slotchange`, set `heading-level` and `keep-mounted` on each slotted `ds-disclosure` (the forwarded bindings arrive as hooks, see the notes); listen for their composed `toggle` to enforce `exclusive` and dispatch `change`; handle arrow keys from bubbling keydown whose composed path includes a slotted trigger.

### React Native
`View` of `Disclosure`s with `Divider`s; the accordion owns the open set and passes `open`/`onToggle` to each. No arrow keys on native.

## Related

Disclosure, Tabs, Divider, Heading.
