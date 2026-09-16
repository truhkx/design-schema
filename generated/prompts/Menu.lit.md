# Generate: Menu as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Menu.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Menu.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: MenuVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Menu.test.ts`.

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
  name: Menu
  category: overlay
  status: review
  apg: menu-button
  anatomy:
  - trigger
  - popup
  - list
  - group
  - groupLabel
  - item
  - itemIcon
  - itemShortcut
  - separator
  composition:
    trigger: Button
    itemIcon: Icon
  props:
    label:
      type: string
      required: true
      description: The trigger's label and the menu's accessible name ("More actions",
        "Sort by").
      a11y: aria-label of the menu and the accessible name of its trigger.
    items:
      type: array
      required: true
      shape: '({ id: string; label: string; icon?: IconName; shortcut?: string; tone?:
        "default" | "danger"; disabled?: boolean } | { group: string; items: MenuItem[]
        } | { separator: true })[]'
      description: Actions, optionally grouped with a label or divided by separators.
        Groups render their label as a non-interactive heading row.
    triggerVariant:
      type: enum
      values:
      - ghost
      - secondary
      - primary
      default: ghost
      description: Variant of the trigger Button.
    triggerIcon:
      type: enum
      values:
      - ellipsis
      - chevron-down
      - none
      default: chevron-down
      description: 'Trailing icon on the trigger: `ellipsis` for an icon-only overflow
        button (the label becomes the accessible name), `chevron-down` for a labelled
        dropdown, `none`.'
    iconOnly:
      type: boolean
      default: false
      description: Render the trigger as an icon-only Button using `triggerIcon`;
        `label` is still required.
    placement:
      type: enum
      values:
      - bottom-start
      - bottom-end
      - top-start
      - top-end
      default: bottom-start
      description: Preferred position of the popup relative to the trigger; flips
        automatically when it would overflow the viewport.
    open:
      type: boolean
      description: Controlled open state (the parent flips it from onOpenChange).
        Omit for an uncontrolled menu.
      controls:
        event: onOpenChange
        state: open
    anchor:
      type: object
      shape: RefObject<HTMLElement | View>
      description: Position the popup relative to this element instead of rendering
        a trigger; the trigger part is omitted and `open` must be controlled. Used
        by ActionSheet above its breakpoint and by context menus.
  events:
    onAction:
      description: An item was chosen; receives its `id`. The menu closes itself first.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
      payload:
      - name: id
        type: string
        description: The id of the chosen item.
      fires:
      - user
    onOpenChange:
      description: 'Fired when the menu opens or closes, with `{ open, reason }` —
        reason: `trigger`, `escape`, `outside`, `action` (an item was chosen; fired
        before onAction), `controlled`.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the menu.
      - name: reason
        type: enum
        values:
        - trigger
        - escape
        - outside
        - action
        - controlled
      reasons:
        trigger: the trigger was activated
        escape: Escape pressed while open
        outside: a pointer press landed outside the menu
        action: an item was chosen
        controlled: the consumer changed the open prop
      fires:
      - user
      - controlled
      timing:
        phase: after-change
        before:
        - onAction
  keyboard:
  - keys:
    - Enter
    - ' '
    - ArrowDown
    action: Opens the menu and focuses the first item.
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - ArrowUp
    action: Opens the menu and focuses the last item.
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - ArrowDown
    action: Moves to the next enabled item.
    when: menu open
    from: first
    expect: focus-next
  - keys:
    - ArrowDown
    action: From the last item wraps to the first.
    when: menu open
    from: last
    expect: focus-wraps-to-first
  - keys:
    - ArrowUp
    action: From the first item wraps to the last.
    when: menu open
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Home
    action: First enabled item.
    when: menu open
    from: inside
    expect: focus-first
  - keys:
    - End
    action: Last enabled item.
    when: menu open
    from: inside
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Activates the focused item and closes.
    when: menu open
    from: first
    expect: closes
  - keys:
    - Escape
    action: Closes and returns focus to the trigger.
    when: menu open
    from: inside
    expect:
    - closes
    - focus-trigger
  - keys:
    - Tab
    - Shift+Tab
    action: Closes and moves focus to the next/previous tabbable element after the
      trigger.
    when: menu open
    from: inside
    expect: closes
  - keys:
    - a-z
    action: Typeahead — moves to the next item whose label starts with the typed characters.
    when: menu open
    from: first
    expect: manual
  styles:
    surface:
      token: color.overlay.surface
      locked: true
    border:
      token: color.border
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.md
      locked: false
    popupPadding:
      token: space.1
      part: popup
      description: Inset around the list so item hover backgrounds do not touch the
        border.
      locked: false
    popupOffset:
      token: space.1
      part: popup
      description: Gap between trigger and popup.
      locked: false
    typeaheadReset:
      token: motion.duration.loop
      description: How long typed characters accumulate before the typeahead buffer
        clears.
      locked: false
    maxHeight:
      token: layout.maxWidth.prose
      description: The popup never exceeds the viewport minus the gutter; beyond that
        the list scrolls (the token is the cap used on wide screens).
      locked: false
    minWidth:
      token: space.20
      computed:
        times: 2.5
      description: Popup is at least this wide (200px at comfortable density) and
        at least the trigger width.
      locked: false
    itemPaddingBlock:
      token: space.sm
      part: item
      locked: false
    itemPaddingInline:
      token: space.md
      part: item
      locked: false
    itemGap:
      token: layout.gap.normal
      part: item
      locked: false
    itemRadius:
      token: radius.sm
      part: item
      locked: false
    itemHover:
      token: color.background.subtle
      part: item
      state: hover
      description: Pointer hover and keyboard focus share this highlight.
      locked: true
    itemColor:
      token: color.foreground
      part: item
      locked: true
    itemDangerColor:
      token: color.foreground.danger
      part: item
      locked: true
    groupLabelColor:
      token: color.foreground.muted
      part: groupLabel
      locked: true
    groupLabelSize:
      token: font.size.xs
      part: groupLabel
      locked: false
    groupLabelWeight:
      token: font.weight.semibold
      part: groupLabel
      locked: false
    shortcutColor:
      token: color.foreground.muted
      locked: true
    shortcutSize:
      token: font.size.sm
      locked: false
    separator:
      token: color.border
      part: separator
      locked: false
    separatorMargin:
      token: space.1
      part: separator
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    layer:
      token: layer.dropdown
      locked: false
    enter:
      token: motion.duration.fast
      description: Fade and a space.1 rise; instant under reduced motion.
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  overlay:
    layer: popover
    anchor: trigger
    placement: placement
    collision: flip
    open: open
    closeEvent: onOpenChange
    dismiss:
    - escape
    - outside-press
    - focus-out
    modal: false
  a11y:
    role: menu
    requires:
    - accessible-name
    - expanded-state
    - arrow-navigation
    - roving-tabindex
    - escape-dismiss
    - focus-restore
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
    - no-hover-only
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.danger
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.danger
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: button
      attributes:
      - aria-haspopup=menu
      - aria-expanded
      - aria-controls
      - role=menu
      - role=menuitem
      - role=group
      - role=separator
      - aria-labelledby
      - tabindex
      notes: 'Trigger is the system Button with aria-haspopup="menu", aria-expanded
        and aria-controls. The popup is rendered through a portal with position: fixed,
        placed from the trigger''s getBoundingClientRect() and flipped on overflow;
        z-index layer.dropdown. Outside click (pointerdown outside popup and trigger)
        closes. Items are <div role="menuitem" tabindex="-1"> with one roving tabindex;
        the menu uses real focus (not aria-activedescendant) so screen readers follow.
        Keyboard-focused and hovered items share the itemHover style; hover moves
        the roving focus so the two never diverge. Shortcuts are display-only (aria-keyshortcuts)
        — the menu does not bind them.'
    lit:
      tag: ds-menu
      reflect:
      - open
      - placement
      - icon-only
      notes: 'Uses the Popover API (popover="manual", showPopover()) for top-layer
        rendering without a portal, with a position: fixed fallback; anchor positioning
        is computed from the trigger rect. `items` is a property. Composed `action`
        (detail { id }) and `open-change` (detail { open }). The trigger is a <ds-button>
        in the shadow root; focus delegation lands on it. The menu surface is named
        with aria-label from the trigger''s text (or the `label` property when given):
        aria-labelledby cannot reach a slotted trigger from the shadow root.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      notes: 'Menus on touch are ActionSheets: on phones Menu renders an ActionSheet
        with the same items (groups become dividers with a muted label); on tablets
        and react-native-web it renders a transparent Modal with an absolutely positioned
        popup measured from the trigger via measureInWindow(). Items are Pressables
        with accessibilityRole="menuitem"; the trigger Button carries accessibilityState.expanded.
        Typeahead and arrow keys apply only when a hardware keyboard is present. The
        popup uses the RN >= 0.74 `role="menu"` prop and items `role="menuitem"`;
        the trigger Button receives `expanded` so accessibilityState.expanded is exposed.
        On phones the Menu renders ActionSheet (composition, now that it exists);
        the anchored dropdown is the tablet and react-native-web presentation. The
        list scrolls within maxHeight.'
    swiftui:
      element: Menu
      props:
      - Menu
      - .menuStyle
      - .menuOrder
      - Button
      - Divider
      - .accessibilityLabel
      - .contextMenu
      notes: 'SwiftUI `Menu(label:)` — the system menu is the native pattern, keyboard-navigable
        on iPad, VoiceOver-native, and it takes the theme through `.tint` and `.menuStyle`
        for the trigger only (the popup''s surface is the system''s; the doc''s popup
        bindings are no-ops on iOS, noted in the gallery). Items are `Button`s (destructive
        via `role: .destructive`), groups `Section`s with a header, separators `Divider`;
        disabled items `.disabled(true)` (the system menu skips them, matching the
        doc). `onOpenChange` fires from the label''s press and the menu''s dismissal
        via `.onChange` of a presentation binding on the wrapper. `trigger: contextMenu`
        uses `.contextMenu`.'
  behavior:
  - name: choosing-an-item-reports-the-action-and-the-close
    description: Activating an item closes the menu and fires onAction; onOpenChange
      precedes it with reason action.
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
    when:
      click: item
    then:
    - event: onAction
    - event: onOpenChange
  - name: a-disabled-item-does-nothing
    description: Disabled items are visible and announced disabled, and do nothing
      on click.
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
        disabled: true
      - id: duplicate
        label: Duplicate
    when:
      click: item
    then:
    - event: onAction
      fired: false
  - name: escape-closes-without-choosing
    description: Escape closes and returns focus to the trigger without activating
      anything (keyboard rule 9).
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
    when:
      key: Escape
    then:
    - event: onAction
      fired: false
    platforms:
    - web
    - lit
  - name: the-popup-is-a-menu
    description: The popup is a menu of menuitems named by the trigger (APG menu button),
      not a list of buttons.
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
    then:
    - role: menu
  examples:
  - name: row-overflow
    description: The icon-only overflow button on a row, with the destructive action
      last after a separator.
    given:
      label: More actions
      iconOnly: true
      triggerIcon: ellipsis
      items:
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
      - separator: true
      - id: delete
        label: Delete file
        tone: danger
  - name: sort-by
    description: A labelled dropdown of view options, anchored under a secondary trigger.
    given:
      label: Sort by
      triggerVariant: secondary
      triggerIcon: chevron-down
      items:
      - id: name
        label: Name
      - id: modified
        label: Last modified
      - id: size
        label: Size
  - name: grouped-account-menu
    description: More than about six items, so they are grouped with labels; aligned
      to the end of the trigger.
    given:
      label: Account
      placement: bottom-end
      items:
      - group: Account
        items:
        - id: profile
          label: Profile
        - id: billing
          label: Billing
      - group: Workspace
        items:
        - id: members
          label: Members
        - id: settings
          label: Settings
      - separator: true
      - id: sign-out
        label: Sign out
  - name: with-shortcuts
    description: Display-only shortcut hints beside the items the app binds elsewhere.
    given:
      label: Edit
      items:
      - id: undo
        label: Undo
        shortcut: Ctrl+Z
      - id: redo
        label: Redo
        shortcut: Ctrl+Shift+Z
```

## Events

- `onAction`: emit `action`
  - payload, the keys of `CustomEvent.detail`: `id: string`
  - fires on: user
- `onOpenChange`: emit `open-change`
  - payload, the keys of `CustomEvent.detail`: `open: boolean`, `reason: 'trigger' | 'escape' | 'outside' | 'action' | 'controlled'`
  - reasons: `trigger` (the trigger was activated); `escape` (Escape pressed while open); `outside` (a pointer press landed outside the menu); `action` (an item was chosen); `controlled` (the consumer changed the open prop)
  - fires on: user, controlled
  - timing: after-change, fired before `action`

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `open-change`); drives state `open`

## Style bindings

- `popupPadding`: token `space.1`; part `popup`
- `popupOffset`: token `space.1`; part `popup`
- `minWidth`: token `space.20`; computed `calc(var(--space-20) * 2.5)`
- `itemPaddingBlock`: token `space.sm`; part `item`
- `itemPaddingInline`: token `space.md`; part `item`
- `itemGap`: token `layout.gap.normal`; part `item`
- `itemRadius`: token `radius.sm`; part `item`
- `itemHover`: token `color.background.subtle`; part `item`; state `hover`; locked
- `itemColor`: token `color.foreground`; part `item`; locked
- `itemDangerColor`: token `color.foreground.danger`; part `item`; locked
- `groupLabelColor`: token `color.foreground.muted`; part `groupLabel`; locked
- `groupLabelSize`: token `font.size.xs`; part `groupLabel`
- `groupLabelWeight`: token `font.weight.semibold`; part `groupLabel`
- `separator`: token `color.border`; part `separator`
- `separatorMargin`: token `space.1`; part `separator`

## Keyboard

- `Escape` (Closes and returns focus to the trigger.): expect closes, then focus-trigger

## Form and overlay

```yaml
overlay:
  layer: popover
  anchor: trigger
  placement: placement
  collision: flip
  open: open
  closeEvent: onOpenChange
  dismiss:
  - escape
  - outside-press
  - focus-out
  modal: false
```

`overlay.closeEvent` emits `open-change`.

## Constants and examples

- example `row-overflow`, story `RowOverflow`: given `label: "More actions"`, `iconOnly: true`, `triggerIcon: "ellipsis"`, `items: [{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"separator":true},{"id":"delete","label":"Delete file","tone":"danger"}]`; The icon-only overflow button on a row, with the destructive action last after a separator.
- example `sort-by`, story `SortBy`: given `label: "Sort by"`, `triggerVariant: "secondary"`, `triggerIcon: "chevron-down"`, `items: [{"id":"name","label":"Name"},{"id":"modified","label":"Last modified"},{"id":"size","label":"Size"}]`; A labelled dropdown of view options, anchored under a secondary trigger.
- example `grouped-account-menu`, story `GroupedAccountMenu`: given `label: "Account"`, `placement: "bottom-end"`, `items: [{"group":"Account","items":[{"id":"profile","label":"Profile"},{"id":"billing","label":"Billing"}]},{"group":"Workspace","items":[{"id":"members","label":"Members"},{"id":"settings","label":"Settings"}]},{"separator":true},{"id":"sign-out","label":"Sign out"}]`; More than about six items, so they are grouped with labels; aligned to the end of the trigger.
- example `with-shortcuts`, story `WithShortcuts`: given `label: "Edit"`, `items: [{"id":"undo","label":"Undo","shortcut":"Ctrl+Z"},{"id":"redo","label":"Redo","shortcut":"Ctrl+Shift+Z"}]`; Display-only shortcut hints beside the items the app binds elsewhere.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `shadow`, `radius`, `popupPadding`, `popupOffset`, `typeaheadReset`, `maxHeight`, `minWidth`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `itemRadius`, `groupLabelSize`, `groupLabelWeight`, `shortcutSize`, `separator`, `separatorMargin`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`
Locked (accessibility-bearing, never overridable): `surface`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: choosing-an-item-reports-the-action-and-the-close
  description: Activating an item closes the menu and fires onAction; onOpenChange
    precedes it with reason action.
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
    - id: duplicate
      label: Duplicate
  when:
    click: item
  then:
  - event: onAction
  - event: onOpenChange
- name: a-disabled-item-does-nothing
  description: Disabled items are visible and announced disabled, and do nothing on
    click.
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
      disabled: true
    - id: duplicate
      label: Duplicate
  when:
    click: item
  then:
  - event: onAction
    fired: false
- name: escape-closes-without-choosing
  description: Escape closes and returns focus to the trigger without activating anything
    (keyboard rule 9).
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
    - id: duplicate
      label: Duplicate
  when:
    key: Escape
  then:
  - event: onAction
    fired: false
  platforms:
  - web
  - lit
- name: the-popup-is-a-menu
  description: The popup is a menu of menuitems named by the trigger (APG menu button),
    not a list of buttons.
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
  then:
  - role: menu
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-trigger-variant-ghost
  given:
    triggerVariant: ghost
  then:
  - renders: true
  derived: true
- name: renders-trigger-variant-secondary
  given:
    triggerVariant: secondary
  then:
  - renders: true
  derived: true
- name: renders-trigger-variant-primary
  given:
    triggerVariant: primary
  then:
  - renders: true
  derived: true
- name: renders-trigger-icon-ellipsis
  given:
    triggerIcon: ellipsis
  then:
  - renders: true
  derived: true
- name: renders-trigger-icon-chevron-down
  given:
    triggerIcon: chevron-down
  then:
  - renders: true
  derived: true
- name: renders-trigger-icon-none
  given:
    triggerIcon: none
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-start
  given:
    placement: bottom-start
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-end
  given:
    placement: bottom-end
  then:
  - renders: true
  derived: true
- name: renders-placement-top-start
  given:
    placement: top-start
  then:
  - renders: true
  derived: true
- name: renders-placement-top-end
  given:
    placement: top-end
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: escape-fires-on-open-change
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-menu
reflect:
- open
- placement
- icon-only
notes: 'Uses the Popover API (popover="manual", showPopover()) for top-layer rendering
  without a portal, with a position: fixed fallback; anchor positioning is computed
  from the trigger rect. `items` is a property. Composed `action` (detail { id })
  and `open-change` (detail { open }). The trigger is a <ds-button> in the shadow
  root; focus delegation lands on it. The menu surface is named with aria-label from
  the trigger''s text (or the `label` property when given): aria-labelledby cannot
  reach a slotted trigger from the shadow root.'
```

## Guidance

## Overview

A menu hides a handful of actions behind one button so a toolbar or a row stays quiet. It is the desktop counterpart of ActionSheet — anchored to what was clicked, gone with a click elsewhere, fully driveable from the keyboard, with typeahead for long lists.

## When to use

Use a Menu for secondary actions on an item or a view that do not deserve their own buttons: overflow ("More actions"), sort or view options, account menus. Group related items with a `group` label when there are more than about six; separate a danger action with a `separator`. On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is "pick an action" and let the platform decide the surface.

## When not to use

Do not use a Menu for navigation between pages; use Links in a nav Landmark (a "navigation menu" in the ARIA sense is not this pattern). Do not use it to pick a value that stays selected (that is Select, planned, or a RadioGroup); menu items are actions, not state. Do not put inputs, switches or long text in a menu. Do not use a menu with one item; make it a button.

## Behavior

Activating the trigger opens the popup at `placement` (flipped if it would overflow) with focus on the first item; ArrowUp from the trigger opens with the last item focused. Arrow keys move through enabled items and wrap; Home and End jump; typing letters moves to the next matching label; Enter or Space activates the focused item, which closes the menu, returns focus to the trigger and fires `onAction(id)`. Escape closes without action and returns focus. Tab closes and lets focus move on. A pointer click outside, or the window losing focus, closes. Hovering an item moves the roving focus to it so keyboard and pointer never highlight two things. Disabled items are visible, announced disabled, skipped by arrows and typeahead, and do nothing on click.

## Content guidelines

The trigger label names the set ("More actions", "Sort by"), not "Menu". Items are verbs or short noun phrases, sentence case, no trailing punctuation; a shortcut hint uses the platform's key names ("⌘S", "Ctrl+S") and is display-only. Group labels are one or two words in the same case as headings. Danger items say what they destroy and sit last, after a separator.

## Accessibility

The trigger is a button with `aria-haspopup="menu"` and `aria-expanded`; the popup has role `menu` with an accessible name from the trigger, items are `menuitem`s (WCAG 4.1.2; APG menu button and menu). One tab stop, arrows to move (roving-tabindex, arrow-navigation), typeahead, Home/End. Escape and Tab close and restore focus (2.4.3, 2.1.2). The highlighted item is shown with a background change *and* is the focused element, so the highlight is never hover-only (no-hover-only; 1.4.13 for content on hover does not apply because the menu is opened by activation, not hover). Items reach 24px (2.5.8); on touch presentations the ActionSheet's 44px applies. Contrast is checked for normal, danger and muted text on the surface and on the highlight.

## Platform notes

### Web
Trigger: the system `Button` with `aria-haspopup="menu"`, `aria-expanded`, `aria-controls={popupId}`, `trailingIcon={<Icon name={triggerIcon} />}` (or `iconOnly`). Popup: a portal into `document.body`, `position: fixed`, `top/left` from the trigger rect for `placement` with a flip when the popup would cross the viewport edge, `z-index: var(--layer-dropdown)`, `min-inline-size: max(trigger width, minWidth)`. `<div role="menu" aria-labelledby={triggerId}>` containing `<div role="group" aria-labelledby>` for groups, `<div role="separator">`, and `<div role="menuitem" tabindex={-1|0} aria-disabled>`. Keydown handler on the menu implements the keyboard table; a `pointerdown` listener on `document` closes on outside clicks; `focusout` to outside closes. Reposition on scroll and resize while open.

### Lit
`<ds-menu label="More actions" .items=${items} icon-only>`. The popup uses `popover="manual"` when `HTMLElement.prototype.showPopover` exists (top layer, no z-index juggling) and otherwise `position: fixed` with `layer.dropdown`; position from `this.trigger.getBoundingClientRect()`. Composed `action` and `open-change`. Roving tabindex over shadow-root items; hover moves focus.

### React Native
Phones: render `ActionSheet` with `open` driven by the trigger, mapping groups to a divider plus a muted label row and `separator` to a divider. Tablets and react-native-web: a transparent `Modal` whose backdrop `Pressable` closes on tap, with the popup `View` positioned from `triggerRef.measureInWindow()` and flipped when it would overflow `useWindowDimensions()`. Items are `Pressable accessibilityRole="menuitem"` with `accessibilityState={{ disabled }}`. The trigger `Button` gets `accessibilityState={{ expanded }}`.

## Related

ActionSheet, Button, Icon, Tooltip, Select (planned).
