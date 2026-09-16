# Generate: Accordion as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Accordion.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Accordion.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: AccordionVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
- Each event is dispatched as a `CustomEvent` named by its `platforms.lit` value with `bubbles: true, composed: true` so it crosses the shadow boundary.
- Styles live in `static override styles: CSSResult = css\`…\`` and read ONLY token custom properties (`var(--color-…)`), which inherit through the shadow root. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes an attribute selector per enum value, e.g. `:host([variant="primary"]) { background: var(--color-action-primary-background); }`.
- Implement every item in `a11y.requires` inside the shadow DOM using a native element (e.g. a real `<button>`), and use `delegatesFocus: true` in `static override shadowRootOptions: ShadowRootInit` so focusing the host focuses the inner element.
- `accessible-name`: forward `label` to visible text or `aria-label` on the inner element.
- `focus-visible`: style `:focus-visible` on the inner element with `--color-border-focus` / `--border-width-focus`.
- `heading-hierarchy`: render the matching `<h1>`–`<h6>` inside the shadow root based on the level prop.
- Support light and dark by relying on token variables only.
- Form ownership is DOM-tree based: slotted light-DOM children are not owned by a `<form>` inside a shadow root. Follow the platform notes for how ds-form and ds-input cooperate by `name`.
- Events named like native events (`focus`, `blur`) are the native retargeted events — do not dispatch a CustomEvent with the same name.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard`, removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Accordion.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element in the shadow root), only in its `state` (`:hover`, `:focus-visible`, the reflected state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated property, event, value or element keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development (`import.meta.env.DEV`) naming `use`.
- A `type: integer` prop accepts whole numbers only: type it `number` and never produce a fraction.

## Component schema

```yaml
component:
  name: Accordion
  category: container
  status: review
  apg: accordion
  anatomy:
  - list
  - item
  - trigger
  - triggerIcon
  - panel
  composition:
    item: Disclosure
  props:
    items:
      type: array
      required: true
      shape: '{ id: string; summary: string; content: ReactNode; disabled?: boolean
        }[]'
      description: The sections in order. `content` is the panel body (a slot per
        item on Lit).
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      default: '3'
      description: Heading level for every trigger, so sections appear in the page
        outline.
    exclusive:
      type: boolean
      default: false
      description: 'Opening one section closes the others. Off by default: users usually
        want to compare, and forced-closing is a common frustration.'
    value:
      type: union
      description: 'Controlled open ids: always an array (zero or one entry when `exclusive`);
        `onChange` reports the same shape.'
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initially open ids.
      shape: string | string[]
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
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: openIds
        type: array
        shape: string[]
        description: The ids of every open section.
      fires:
      - user
    onOpenChange:
      description: 'Fired per section as it opens or closes, with `{ id, open, reason
        }` (`reason`: `trigger`, `keyboard`, `exclusive` when another section closed
        it, `controlled`). The per-item trigger for analytics, lazy loading of a panel''s
        content, or scrolling the opened section into view; `onChange` remains the
        set-level event for state.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: id
        type: string
        description: The section whose state changed.
      - name: open
        type: boolean
        description: Its new state.
      - name: reason
        type: enum
        values:
        - trigger
        - keyboard
        - exclusive
        - controlled
      reasons:
        trigger: the section trigger was activated by pointer
        keyboard: the section was toggled from the keyboard
        exclusive: another section opened and closed this one
        controlled: the consumer changed the value prop
      fires:
      - user
      - controlled
  keyboard:
  - keys:
    - Enter
    - ' '
    action: Toggles the focused section.
    from: first
    expect: toggles
  - keys:
    - ArrowDown
    action: Moves focus to the next trigger; wraps.
    from: first
    expect: focus-next
  - keys:
    - ArrowUp
    action: Moves focus to the previous trigger; wraps.
    from: last
    expect: focus-prev
  - keys:
    - ArrowDown
    action: From the last trigger wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Home
    action: First trigger.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last trigger.
    from: first
    expect: focus-last
  - keys:
    - Tab
    action: Ordinary tab order — every trigger is a tab stop (the APG recommends this
      so panel content stays reachable).
    from: first
    expect: focus-next
  styles:
    divider:
      token: color.border
      locked: false
    dividerWidth:
      token: border.width.thin
      locked: false
    itemGap:
      token: layout.gap.none
      part: item
      description: Items touch; the divider separates them.
      locked: false
    triggerPaddingBlock:
      token: space.md
      part: trigger
      description: Roomier than a lone Disclosure, since accordion triggers are section
        headings.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    triggerFontSize:
      token: font.size.md
      part: trigger
      locked: false
    triggerFontWeight:
      token: font.weight.medium
      part: trigger
      locked: false
    minTarget:
      token: size.target.min
      description: The composed Disclosure's own minimum; the accordion's triggerPaddingBlock
        override raises the row to the comfortable size.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  a11y:
    role: none
    requires:
    - heading-hierarchy
    - expanded-state
    - arrow-navigation
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - data-ds=Accordion
      notes: A <div> of Disclosures rendered with headingLevel and shared padding
        overrides; Accordion adds the arrow-key handler on the container (keydown
        from a trigger moves focus among triggers) and the exclusive logic. Every
        trigger stays a tab stop — no roving tabindex — per the APG accordion pattern.
    lit:
      tag: ds-accordion
      reflect:
      - exclusive
      - prop: divided
        attribute: no-divided
      - heading-level
      notes: Light-DOM <ds-disclosure> children are the items (slot), so their content
        stays in the document; ds-accordion sets heading-level and keep-mounted on
        them, listens for their `toggle` to enforce exclusive, and handles arrow keys
        via keydown bubbling from the slotted triggers. `items` as a property is also
        accepted and renders <ds-disclosure> elements itself.
    rn:
      element: View
      props: []
      notes: A View of Disclosures with dividers; exclusive logic and headingLevel
        passed through. Arrow keys apply only with a hardware keyboard on react-native-web.
    swiftui:
      element: VStack
      props:
      - Disclosure
      - Heading
      - Button
      - .accessibilityValue=expanded
      - .focusSection
      - .onMoveCommand
      - '@FocusState'
      notes: A `VStack` of items, each a `Heading` at `headingLevel` wrapping the
        package trigger `Button` (`.accessibilityValue` expanded/collapsed) and its
        panel; `multiple`/`collapsible` per the doc; ArrowUp/Down/Home/End move between
        triggers on iPad via `@FocusState`. Panels animate with `transition` unless
        reduced motion. Composes Disclosure's engine, not `DisclosureGroup`.
  behavior:
  - name: click-on-a-trigger-reports-the-open-set
    description: onChange carries the open ids; onOpenChange reports the one section
      whose state changed.
    when:
      click: trigger
    then:
    - event: onChange
    - event: onOpenChange
    - attribute: aria-expanded
      is: 'true'
      'on': trigger
      platforms:
      - web
      - lit
  - name: exclusive-still-reports-both-events
    description: With exclusive, opening one section closes the others; the set-level
      onChange and the per-section onOpenChange both still fire.
    given:
      exclusive: true
    when:
      click: trigger
    then:
    - event: onChange
    - event: onOpenChange
  examples:
  - name: faq
    description: A list of questions, several of which can be open at once.
    given:
      items:
      - id: cancel
        summary: What happens if I cancel?
        content: You keep access until the end of the billing period.
      - id: refunds
        summary: Do you offer refunds?
        content: Within 14 days of a charge, in full.
  - name: one-open-at-a-time
    description: A comparison list where opening a section closes the rest.
    given:
      exclusive: true
      items:
      - id: free
        summary: Free
        content: One project and community support.
      - id: pro
        summary: Pro
        content: Unlimited projects and email support.
  - name: form-sections
    description: Form sections whose panels stay mounted so the Form still collects
      the fields inside.
    given:
      keepMounted: true
      headingLevel: '2'
      items:
      - id: contact
        summary: Contact details
        content: Name and email fields.
      - id: billing
        summary: Billing address
        content: Street and city fields.
  - name: undivided
    description: Sections without the hairline, for an accordion that already sits
      inside a Card.
    given:
      divided: false
      items:
      - id: shipping
        summary: Shipping
        content: Orders ship within two business days.
      - id: returns
        summary: Returns
        content: Items can be returned within 30 days.
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `openIds: string[]`
  - fires on: user
- `onOpenChange`: emit `open-change`
  - payload, the keys of `CustomEvent.detail`: `id: string`, `open: boolean`, `reason: 'trigger' | 'keyboard' | 'exclusive' | 'controlled'`
  - reasons: `trigger` (the section trigger was activated by pointer); `keyboard` (the section was toggled from the keyboard); `exclusive` (another section opened and closed this one); `controlled` (the consumer changed the value prop)
  - fires on: user, controlled

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

## Style bindings

- `itemGap`: token `layout.gap.none`; part `item`
- `triggerPaddingBlock`: token `space.md`; part `trigger`
- `triggerFontSize`: token `font.size.md`; part `trigger`
- `triggerFontWeight`: token `font.weight.medium`; part `trigger`

## Constants and examples

- example `faq`, story `Faq`: given `items: [{"id":"cancel","summary":"What happens if I cancel?","content":"You keep access until the end of the billing period."},{"id":"refunds","summary":"Do you offer refunds?","content":"Within 14 days of a charge, in full."}]`; A list of questions, several of which can be open at once.
- example `one-open-at-a-time`, story `OneOpenAtATime`: given `exclusive: true`, `items: [{"id":"free","summary":"Free","content":"One project and community support."},{"id":"pro","summary":"Pro","content":"Unlimited projects and email support."}]`; A comparison list where opening a section closes the rest.
- example `form-sections`, story `FormSections`: given `keepMounted: true`, `headingLevel: "2"`, `items: [{"id":"contact","summary":"Contact details","content":"Name and email fields."},{"id":"billing","summary":"Billing address","content":"Street and city fields."}]`; Form sections whose panels stay mounted so the Form still collects the fields inside.
- example `undivided`, story `Undivided`: given `divided: false`, `items: [{"id":"shipping","summary":"Shipping","content":"Orders ship within two business days."},{"id":"returns","summary":"Returns","content":"Items can be returned within 30 days."}]`; Sections without the hairline, for an accordion that already sits inside a Card.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `divider`, `dividerWidth`, `itemGap`, `triggerPaddingBlock`, `fontFamily`, `triggerFontSize`, `triggerFontWeight`
Locked (accessibility-bearing, never overridable): `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-a-trigger-reports-the-open-set
  description: onChange carries the open ids; onOpenChange reports the one section
    whose state changed.
  when:
    click: trigger
  then:
  - event: onChange
  - event: onOpenChange
  - attribute: aria-expanded
    is: 'true'
    'on': trigger
- name: exclusive-still-reports-both-events
  description: With exclusive, opening one section closes the others; the set-level
    onChange and the per-section onOpenChange both still fire.
  given:
    exclusive: true
  when:
    click: trigger
  then:
  - event: onChange
  - event: onOpenChange
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-5
  given:
    headingLevel: '5'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-6
  given:
    headingLevel: '6'
  then:
  - renders: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-accordion
reflect:
- exclusive
- prop: divided
  attribute: no-divided
- heading-level
notes: Light-DOM <ds-disclosure> children are the items (slot), so their content stays
  in the document; ds-accordion sets heading-level and keep-mounted on them, listens
  for their `toggle` to enforce exclusive, and handles arrow keys via keydown bubbling
  from the slotted triggers. `items` as a property is also accepted and renders <ds-disclosure>
  elements itself.
```

## Guidance

## Overview

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
