# Generate: Accordion for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Accordion.tsx` exporting a typed React Native function component named `Accordion`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `AccordionProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Accordion> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Accordion.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
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
        for optional properties (`disabled?: boolean | undefined`). `disabled` forwards
        to the Disclosure''s own `disabled`: the section cannot be toggled, and its
        trigger stays focusable and a tab stop (`aria-disabled`, not `disabled`),
        so arrow keys and Home/End skip it on web and Lit. On React Native, which
        has no arrow navigation, a disabled item differs only in that its trigger
        does not respond to a press and carries `accessibilityState.disabled`.'
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
        firing any event. The development warning is about a declared set, not about
        a trim: it fires whenever `exclusive` is on and the resolved `value`/`defaultValue`
        holds more than one id — a standing controlled `value` is such a declaration
        and keeps warning (once per distinct id list) as long as it holds several
        ids — and never fires for the trim of sections a user opened while uncontrolled.
        "First" is array order: the order of `value`/`defaultValue`, and for uncontrolled
        state the order the sections were opened, not item order. Uncontrolled, the
        trim changes state for good, so turning `exclusive` off again does not reopen
        the trimmed sections; controlled, the trim only affects what is shown, so
        turning `exclusive` off shows the full `value` again, still without events.
        Toggling `exclusive` does not consume a pending just-emitted set (see Behavior).'
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
      description: Initially open ids; the same shapes as `value`. Given both, `value`
        controls and `defaultValue` is ignored, with no warning.
      shape: string | string[]
    divided:
      type: boolean
      default: true
      description: A hairline between items.
    keepMounted:
      type: boolean
      default: false
      description: 'Passed to every Disclosure; required when panels contain form
        fields. Accordion-wide, like `headingLevel`: the `items` shape carries no
        per-item override for either, so an accordion cannot keep only some panels
        mounted.'
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
      description: 'Passed to each composed Divider as its `color` override (always,
        even when it equals Divider''s default); Accordion writes no divider rule
        of its own. The Divider keeps its default `spacing: none`: `itemGap` is the
        only space around it, and its default `semantic: false`, so the dividers are
        decorative and the accordion reads as a list of headings. Like `dividerWidth`
        and `fontFamily`, this is an overridable hook even though it names no `part`:
        all seven bindings are overridable, whether or not they carry one.'
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
        the space between items. At the default `layout.gap.none` that space is zero,
        so the centring is only observable through an `itemGap` override.'
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
      part: trigger
      description: Forwarded to Disclosure's `triggerFontFamily`. Like `divider` and
        `dividerWidth`, it is an overridable hook even though Accordion writes no
        rule for it.
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
        prop). Every forwarded binding reaches the child through its `overrides` prop,
        not through a rule the accordion writes into the child, so `--ds-accordion-item-gap`
        is the only hook a consumer can set from CSS; the other six are settable only
        through Accordion's own `overrides`.
    lit:
      tag: ds-accordion
      reflect:
      - exclusive
      - prop: divided
        attribute: no-divided
      - heading-level
      - keep-mounted
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
        those elements), including its `reason: ''controlled''` echoes whenever `exclusive`
        or a `value` change opens or closes it, so a page listening to slotted children
        sees those as well as the accordion''s `open-change`; the `toggle` of disclosures
        rendered from `items` is stopped at the accordion, which reports `change`/`open-change`
        instead. The trigger hit area ends at the summary, as on web. The `ds-accordion
        > ds-disclosure` address holds for the slotted form only: in `items` mode
        the disclosures live in the accordion''s shadow root, so address them as `ds-accordion`''s
        `shadowRoot.querySelectorAll(''ds-disclosure'')`. `change` is not stopped
        from bubbling out of panel content either, so a page listening on `<ds-accordion>`
        also receives the composed `change` of a field inside a panel; the accordion''s
        own event is the one whose `detail` carries `openIds`, and a listener that
        cares must check for it rather than assume every `change` is the accordion''s.
        The generated keyboard gate runs against the `items` form (its story passes
        `items`, matching the React story''s args), not the slotted form.'
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
        role, not a level. The `list` part is the root View (the root `testID="Accordion"`,
        with no `Accordion.list` hook) and `itemGap` is its `gap` style; the `item`
        part is each composed Disclosure root, and `trigger`, `triggerIcon` and `panel`
        keep Disclosure''s own testIDs — Accordion adds no `Accordion.*` testID for
        any inherited part. `keyboard` stays in the `onOpenChange` reason union for
        parity with the other platforms but is never emitted here, and no keyboard
        scenario is generated for this platform.'
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
  - name: initially-open
    description: An accordion that starts with one section open, uncontrolled from
      there.
    given:
      defaultValue: setup
      items:
      - id: setup
        summary: Getting set up
        content: Install the package and add the provider.
      - id: upgrade
        summary: Upgrading
        content: Read the migration notes before bumping a major.
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
- `fontFamily`: token `font.family.body`; part `trigger`
- `triggerFontSize`: token `font.size.md`; part `trigger`
- `triggerFontWeight`: token `font.weight.medium`; part `trigger`

## Constants and examples

- example `faq`, story `Faq`: given `items: [{"id":"cancel","summary":"What happens if I cancel?","content":"You keep access until the end of the billing period."},{"id":"refunds","summary":"Do you offer refunds?","content":"Within 14 days of a charge, in full."}]`; A list of questions, several of which can be open at once.
- example `one-open-at-a-time`, story `OneOpenAtATime`: given `exclusive: true`, `items: [{"id":"free","summary":"Free","content":"One project and community support."},{"id":"pro","summary":"Pro","content":"Unlimited projects and email support."}]`; A comparison list where opening a section closes the rest.
- example `form-sections`, story `FormSections`: given `keepMounted: true`, `headingLevel: "2"`, `items: [{"id":"contact","summary":"Contact details","content":"Name and email fields."},{"id":"billing","summary":"Billing address","content":"Street and city fields."}]`; Form sections whose panels stay mounted so the Form still collects the fields inside.
- example `initially-open`, story `InitiallyOpen`: given `defaultValue: "setup"`, `items: [{"id":"setup","summary":"Getting set up","content":"Install the package and add the provider."},{"id":"upgrade","summary":"Upgrading","content":"Read the migration notes before bumping a major."}]`; An accordion that starts with one section open, uncontrolled from there.
- example `undivided`, story `Undivided`: given `divided: false`, `items: [{"id":"shipping","summary":"Shipping","content":"Orders ship within two business days."},{"id":"returns","summary":"Returns","content":"Items can be returned within 30 days."}]`; Sections without the hairline, for an accordion that already sits inside a Card.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

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

## Platform notes (rn)

```yaml
element: View
props: []
notes: "A View of Disclosures with dividers; exclusive logic and headingLevel passed\
  \ through. Native has no key events on Pressable, so ArrowUp/Down/Home/End are not\
  \ implemented and `reason` is never `keyboard`; every trigger is an ordinary accessibility\
  \ focus stop reached by swipe, which is the native equivalent of the arrow shortcut.\
  \ No web-only key handler is added either, so arrow keys do nothing on react-native-web\
  \ too. Native has no heading levels: `headingLevel` only gives each Disclosure summary\
  \ `accessibilityRole=\"header\"`, so every heading-level scenario renders the same\
  \ tree and RN tests check the header role, not a level. The `list` part is the root\
  \ View (the root `testID=\"Accordion\"`, with no `Accordion.list` hook) and `itemGap`\
  \ is its `gap` style; the `item` part is each composed Disclosure root, and `trigger`,\
  \ `triggerIcon` and `panel` keep Disclosure's own testIDs \u2014 Accordion adds\
  \ no `Accordion.*` testID for any inherited part. `keyboard` stays in the `onOpenChange`\
  \ reason union for parity with the other platforms but is never emitted here, and\
  \ no keyboard scenario is generated for this platform."
```

## Guidance

## Overview

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
