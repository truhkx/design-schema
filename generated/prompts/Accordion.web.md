# Generate: Accordion for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Accordion.tsx` exporting a typed React function component named `Accordion`, plus `Accordion.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Accordion({ ref, …rest }: AccordionProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
- Render the element and attributes declared under `platforms.web`. Map each event to its `platforms.web` name.
- Style ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`, `--font-…`, `--radius-…`). Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `var(--color-action-${variant}-background)`.
- Implement every item in `a11y.requires`:
  - `accessible-name`: the `label` prop is rendered as visible text or `aria-label`; never both empty.
  - `focus-visible`: a `:focus-visible` outline using `--color-border-focus` and `--border-width-focus`. Never remove the outline without replacing it.
  - `keyboard-operable`: native element semantics (do not build interactive elements from `<div>`).
  - `target-24px` / `target-44px`: `min-inline-size`/`min-block-size` from `--size-target-min` / `--size-target-comfortable`.
  - `heading-hierarchy`: render the heading level as the matching `<h1>`–`<h6>`; do not pick the element by visual size.
- `disabled` uses `aria-disabled="true"` and keeps the element focusable (WCAG-friendly) unless the schema says otherwise. On native checkable inputs (checkbox, radio, switch) `readOnly` has no effect, so guard with `preventDefault()` in both `click` and `change`.
- Visually hidden text (for accessible-name suffixes) uses the standard clip pattern — absolute, 1px box, `clip-path: inset(50%)`, `white-space: nowrap` — the one sanctioned use of pixel literals.
- Support light and dark by relying on the token variables only — no theme logic in the component.
- `disabled` uses `opacity.disabled`; transitions use `motion.duration.fast` + `motion.easing.standard` and are removed under `prefers-reduced-motion`.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children, no decorators that add other focusable elements.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system component. Overlays: render into a portal at `document.body` (a `container` prop may override), lock body scroll while open, make the rest of the page `inert` for modal dialogs (`focus-trap` + `inert-background`), restore focus to the opener on close (`focus-restore`), position non-modal popups with `position: fixed` from the trigger's `getBoundingClientRect()` and flip when they would overflow the viewport, and put them on the right stacking layer with `z-index: var(--layer-<name>)`.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`; title `'<Name>/React'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Accordion> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Accordion.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles its `part` (the `data-part` element), only in its `state` (`:hover`, `:focus-visible`, the ARIA state attribute), with the token listed for each `by` value; write `computed` as the given `calc()`. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those args from the story URL shown.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once in development naming `use`.
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
    item:
      component: Disclosure
      forwards:
        triggerPaddingBlock: triggerPaddingBlock
        fontFamily: triggerFontFamily
        triggerFontSize: triggerFontSize
        triggerFontWeight: triggerFontWeight
  props:
    items:
      type: array
      required: true
      shape: '{ id: string; summary: string; content: ReactNode; disabled?: boolean
        }[]'
      description: 'The sections in order. `content` is the panel body; on Lit it
        is dropped from the item type and the body is a light-DOM child slotted by
        the item id (`<div slot="faq-1">`); light-DOM children that are neither a
        `<ds-disclosure>` nor slotted by an item id are not rendered, and only child
        additions and removals are observed (changing an existing child''s `slot`
        attribute later is not). The optional field follows the package convention
        for optional properties (`disabled?: boolean | undefined`).'
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
        want to compare, and forced-closing is a common frustration. Turning it on
        while several sections are open trims the open set to the first open id without
        firing any event (the same as several ids in `value`/`defaultValue`).'
    value:
      type: union
      description: Controlled open ids. A bare `string` is accepted as shorthand for
        a one-id array; an empty array or an empty string means nothing is open. Events
        always report an array, with zero or one entry when `exclusive`.
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initially open ids; the same shapes as `value`.
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
      description: Fired when the set of open sections changes, with the open ids
        — always an array, even under `exclusive`, where it carries zero or one entry.
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
      timing:
        phase: after-change
        before:
        - onOpenChange
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
        trigger: the section trigger was activated by pointer — Disclosure's `pointer`
          reason maps to `trigger`
        keyboard: the section was toggled from the keyboard — web and Lit pass through
          the activation method Disclosure reports on its own toggle, so the two reasons
          must not be collapsed there; React Native has no such signal and reports
          `trigger` for every activation
        exclusive: another section opened and closed this one
        controlled: 'the `value` prop changed to a set the accordion did not itself
          just emit. The accordion computes `exclusive` and `controlled` itself: a
          Disclosure `onToggle` with reason `controlled` is the echo of the accordion
          setting that Disclosure''s `open`, and is ignored, so nothing is reported
          twice'
      fires:
      - user
      - controlled
      timing:
        phase: after-change
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
      description: Passed to each composed Divider as its `color` override; Accordion
        writes no divider rule of its own.
      locked: false
    dividerWidth:
      token: border.width.thin
      description: Passed to each composed Divider as its `thickness` override.
      locked: false
    itemGap:
      token: layout.gap.none
      part: list
      description: 'Items touch; the divider separates them. Applied as the gap of
        the `list` container (flex `gap` on web and Lit, the `gap` style on React
        Native), never on the Disclosure itself, so when `divided` the gap also falls
        between each item and its Divider — intended: the divider sits centred in
        the space between items.'
      locked: false
    triggerPaddingBlock:
      token: space.md
      part: trigger
      description: Roomier than a lone Disclosure, since accordion triggers are section
        headings. Forwarded to Disclosure's `triggerPaddingBlock`, like `fontFamily`,
        `triggerFontSize` and `triggerFontWeight` (see `composition`); the accordion
        does not style the trigger itself.
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
      description: The composed Disclosure's own minimum, applied by Disclosure; Accordion
        adds no rule for it (nor for `focusRing`/`focusRingWidth`). The `triggerPaddingBlock`
        forward makes the row roomier but does not guarantee a 44px target.
      locked: true
    focusRing:
      token: color.border.focus
      description: Applied by the composed Disclosure's trigger; Accordion adds no
        rule.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Applied by the composed Disclosure's trigger; Accordion adds no
        rule.
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
        The root <div> is the `list` part (`data-part="list"`). Each trigger is Disclosure's
        own inline trigger, so its hit area ends at the summary rather than spanning
        the row; Accordion does not stretch it (a full-width trigger needs a Disclosure
        prop).
    lit:
      tag: ds-accordion
      reflect:
      - exclusive
      - prop: divided
        attribute: no-divided
      - heading-level
      notes: 'Light-DOM <ds-disclosure> children are the items (slot), so their content
        stays in the document; ds-accordion sets heading-level and keep-mounted on
        them, listens for their `toggle` to enforce exclusive, and handles arrow keys
        via keydown bubbling from the slotted triggers. `items` as a property is also
        accepted and renders <ds-disclosure> elements itself. The shadow root''s flex
        container is the `list` part (`data-part="list"` and `part="list"`). Light-DOM
        disclosures are assigned manually, one slot per disclosure, with <ds-divider>
        rendered between the slots in the shadow root, so on Lit the Dividers are
        not light-DOM siblings of the items (address an item as `ds-accordion > ds-disclosure`).
        Forwarded bindings reach each Disclosure as its `--ds-disclosure-*` hook set
        from the accordion''s own hook (`--ds-disclosure-trigger-padding-block: var(--ds-accordion-trigger-padding-block)`),
        so a consumer''s CSS override of the accordion hook still arrives; the Dividers
        get `--ds-divider-color`/`--ds-divider-thickness` the same way. A slotted
        disclosure''s composed `toggle` is left to reach the page (the consumer owns
        those elements); the `toggle` of disclosures rendered from `items` is stopped
        at the accordion, which reports `change`/`open-change` instead. The trigger
        hit area ends at the summary, as on web.'
    rn:
      element: View
      props: []
      notes: 'A View of Disclosures with dividers; exclusive logic and headingLevel
        passed through. Native has no key events on Pressable, so ArrowUp/Down/Home/End
        are not implemented and `reason` is never `keyboard`; every trigger is an
        ordinary accessibility focus stop reached by swipe, which is the native equivalent
        of the arrow shortcut. No web-only key handler is added either, so arrow keys
        do nothing on react-native-web too. Native has no heading levels: `headingLevel`
        only gives each Disclosure summary `accessibilityRole="header"`, so every
        heading-level scenario renders the same tree and RN tests check the header
        role, not a level. The `list` part is the root View, and `itemGap` is its
        `gap` style.'
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
      whose state changed. With nothing open, clicking the first trigger fires onChange([firstId])
      and then onOpenChange(firstId, true, trigger).
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
      onChange and the per-section onOpenChange both still fire. With `pro` open,
      clicking the first trigger (`free`) fires onChange([free]), then onOpenChange(free,
      true, trigger), then onOpenChange(pro, false, exclusive).
    given:
      exclusive: true
      defaultValue: pro
      items:
      - id: free
        summary: Free
        content: One project and community support.
      - id: pro
        summary: Pro
        content: Unlimited projects and email support.
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

- `onChange`: emit `onChange`
  - payload, positional, in this order: `openIds: string[]`
  - fires on: user
  - timing: after-change, fired before `onOpenChange`
- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `id: string`, `open: boolean`, `reason: 'trigger' | 'keyboard' | 'exclusive' | 'controlled'`
  - reasons: `trigger` (the section trigger was activated by pointer — Disclosure's `pointer` reason maps to `trigger`); `keyboard` (the section was toggled from the keyboard — web and Lit pass through the activation method Disclosure reports on its own toggle, so the two reasons must not be collapsed there; React Native has no such signal and reports `trigger` for every activation); `exclusive` (another section opened and closed this one); `controlled` (the `value` prop changed to a set the accordion did not itself just emit. The accordion computes `exclusive` and `controlled` itself: a Disclosure `onToggle` with reason `controlled` is the echo of the accordion setting that Disclosure's `open`, and is ignored, so nothing is reported twice)
  - fires on: user, controlled
  - timing: after-change

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Parts and slots

- `list`: element
- `item`: component `Disclosure`; forwards `triggerPaddingBlock` → `overrides.triggerPaddingBlock`, `fontFamily` → `overrides.triggerFontFamily`, `triggerFontSize` → `overrides.triggerFontSize`, `triggerFontWeight` → `overrides.triggerFontWeight`
- `trigger`: element
- `triggerIcon`: element
- `panel`: element

## Style bindings

- `itemGap`: token `layout.gap.none`; part `list`
- `triggerPaddingBlock`: token `space.md`; part `trigger`
- `triggerFontSize`: token `font.size.md`; part `trigger`
- `triggerFontWeight`: token `font.weight.medium`; part `trigger`

## Constants and examples

- example `faq`, story `Faq`: given `items: [{"id":"cancel","summary":"What happens if I cancel?","content":"You keep access until the end of the billing period."},{"id":"refunds","summary":"Do you offer refunds?","content":"Within 14 days of a charge, in full."}]`; A list of questions, several of which can be open at once.
- example `one-open-at-a-time`, story `OneOpenAtATime`: given `exclusive: true`, `items: [{"id":"free","summary":"Free","content":"One project and community support."},{"id":"pro","summary":"Pro","content":"Unlimited projects and email support."}]`; A comparison list where opening a section closes the rest.
- example `form-sections`, story `FormSections`: given `keepMounted: true`, `headingLevel: "2"`, `items: [{"id":"contact","summary":"Contact details","content":"Name and email fields."},{"id":"billing","summary":"Billing address","content":"Street and city fields."}]`; Form sections whose panels stay mounted so the Form still collects the fields inside.
- example `undivided`, story `Undivided`: given `divided: false`, `items: [{"id":"shipping","summary":"Shipping","content":"Orders ship within two business days."},{"id":"returns","summary":"Returns","content":"Items can be returned within 30 days."}]`; Sections without the hairline, for an accordion that already sits inside a Card.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `divider`, `dividerWidth`, `itemGap`, `triggerPaddingBlock`, `fontFamily`, `triggerFontSize`, `triggerFontWeight`
Locked (accessibility-bearing, never overridable): `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-a-trigger-reports-the-open-set
  description: onChange carries the open ids; onOpenChange reports the one section
    whose state changed. With nothing open, clicking the first trigger fires onChange([firstId])
    and then onOpenChange(firstId, true, trigger).
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
    onChange and the per-section onOpenChange both still fire. With `pro` open, clicking
    the first trigger (`free`) fires onChange([free]), then onOpenChange(free, true,
    trigger), then onOpenChange(pro, false, exclusive).
  given:
    exclusive: true
    defaultValue: pro
    items:
    - id: free
      summary: Free
      content: One project and community support.
    - id: pro
      summary: Pro
      content: Unlimited projects and email support.
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

## Platform notes (web)

```yaml
element: div
attributes:
- data-ds=Accordion
notes: "A <div> of Disclosures rendered with headingLevel and shared padding overrides;\
  \ Accordion adds the arrow-key handler on the container (keydown from a trigger\
  \ moves focus among triggers) and the exclusive logic. Every trigger stays a tab\
  \ stop \u2014 no roving tabindex \u2014 per the APG accordion pattern. The root\
  \ <div> is the `list` part (`data-part=\"list\"`). Each trigger is Disclosure's\
  \ own inline trigger, so its hit area ends at the summary rather than spanning the\
  \ row; Accordion does not stretch it (a full-width trigger needs a Disclosure prop)."
```

## Guidance

## Overview

An accordion is a list of Disclosures that know about each other: consistent headings, arrow keys to move between them, and optionally the rule that opening one closes the rest. It is the right shape for FAQs, settings groups and long forms broken into sections.

## When to use

Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a settings page grouped by topic, a multi-part form where each part is optional. Set `headingLevel` to fit the page outline. Leave `exclusive` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose one plan to see details").

## When not to use

Do not use an Accordion for content most users need — show it. Do not use it as navigation or as tabs (Tabs replace content; an accordion adds it). Do not nest accordions. Do not use one for a single section; that is a Disclosure.

## Behavior

Each item is a Disclosure with a heading. Enter or Space toggles the focused item; with `exclusive`, opening one closes the others (closing does not open anything). Arrow keys, Home and End move focus among the triggers and wrap; Tab moves through triggers and open panel content in document order, since every trigger remains a tab stop. `onChange` receives the open ids. Disabled items are visible and skipped by arrows: arrow keys, Home and End never land on a disabled trigger, but they still work when focus starts on one (it remains a tab stop). `onOpenChange` reasons come from Disclosure's `onToggle(open, reason)` — `pointer` becomes `trigger`, `keyboard` stays `keyboard`, and Disclosure's `controlled` (the echo of the accordion setting `open`) is ignored — so `keyboard` is distinguishable from `trigger` on web and Lit (native always reports `trigger`). One toggle fires, in order: `onChange` with the new set, then `onOpenChange` for the toggled section, then one `onOpenChange(id, false, 'exclusive')` per section `exclusive` closed, in item order. With `exclusive` and several ids in `value`/`defaultValue`, the first is opened and a development warning notes the rest. Items are identified by `id` (on Lit, the slotted `<ds-disclosure>`'s `id` attribute). The `item` part is the composed Disclosure root itself — Accordion does not add a `data-part="item"` hook and must not wrap items in an extra element to carry one, since Dividers are direct siblings of the items (on web and React Native; on Lit they sit between per-item slots in the shadow root, see its notes); address an item as `[data-ds="Accordion"] > [data-ds="Disclosure"]`. The `trigger`, `triggerIcon` and `panel` parts are tagged by Disclosure. Nothing open is `[]` or `''`, never `undefined`. `reason: 'controlled'` is reported when `value` arrives holding a set the accordion did not itself just emit; a controlled parent that answers a trigger with some other set therefore sees `controlled`, which is the intended reading. The just-emitted set is compared only with the next `value` change and then cleared, as Disclosure does for `open`: a parent that ignores `onChange` leaves it pending until `value` next changes.

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
