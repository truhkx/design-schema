# Generate: Menu for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Menu.swift` declaring `public struct Menu: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/MenuBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Menu.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Menu") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- Controlled/uncontrolled pairs (`value`/`defaultValue`, `open`/`defaultOpen`) become a `Binding<T>?` parameter plus a `default` initial value, with `@State` holding the uncontrolled value.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Menu")` on the root and `"Menu.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

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
    onOpenChange:
      description: 'Fired when the menu opens or closes, with `{ open, reason }` —
        reason: `trigger`, `escape`, `outside`, `action` (an item was chosen; fired
        before onAction), `controlled`.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
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
    expect: focus-trigger
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
      description: Inset around the list so item hover backgrounds do not touch the
        border.
      locked: false
    popupOffset:
      token: space.1
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
      description: Popup is at least this wide (space.20 × 2.5, i.e. 200px at comfortable
        density — the generator multiplies; no new token) and at least the trigger
        width.
      locked: false
    itemPaddingBlock:
      token: space.sm
      locked: false
    itemPaddingInline:
      token: space.md
      locked: false
    itemGap:
      token: layout.gap.normal
      locked: false
    itemRadius:
      token: radius.sm
      locked: false
    itemHover:
      token: color.background.subtle
      description: Pointer hover and keyboard focus share this highlight.
      locked: true
    itemColor:
      token: color.foreground
      locked: true
    itemDangerColor:
      token: color.foreground.danger
      locked: true
    groupLabelColor:
      token: color.foreground.muted
      locked: true
    groupLabelSize:
      token: font.size.xs
      locked: false
    groupLabelWeight:
      token: font.weight.semibold
      locked: false
    shortcutColor:
      token: color.foreground.muted
      locked: true
    shortcutSize:
      token: font.size.sm
      locked: false
    separator:
      token: color.border
      locked: false
    separatorMargin:
      token: space.1
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `shadow`, `radius`, `popupPadding`, `popupOffset`, `typeaheadReset`, `maxHeight`, `minWidth`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `itemRadius`, `groupLabelSize`, `groupLabelWeight`, `shortcutSize`, `separator`, `separatorMargin`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`
Locked (accessibility-bearing, never overridable): `surface`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: Menu
props:
- Menu
- .menuStyle
- .menuOrder
- Button
- Divider
- .accessibilityLabel
- .contextMenu
notes: "SwiftUI `Menu(label:)` \u2014 the system menu is the native pattern, keyboard-navigable\
  \ on iPad, VoiceOver-native, and it takes the theme through `.tint` and `.menuStyle`\
  \ for the trigger only (the popup's surface is the system's; the doc's popup bindings\
  \ are no-ops on iOS, noted in the gallery). Items are `Button`s (destructive via\
  \ `role: .destructive`), groups `Section`s with a header, separators `Divider`;\
  \ disabled items `.disabled(true)` (the system menu skips them, matching the doc).\
  \ `onOpenChange` fires from the label's press and the menu's dismissal via `.onChange`\
  \ of a presentation binding on the wrapper. `trigger: contextMenu` uses `.contextMenu`."
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

## Behavior scenarios (12)

One test per scenario, in this order.

```yaml
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
```
