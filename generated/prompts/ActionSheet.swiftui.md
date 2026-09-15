# Generate: ActionSheet for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/ActionSheet.swift` declaring `public struct ActionSheet: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/ActionSheetBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+ActionSheet.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("ActionSheet") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("ActionSheet")` on the root and `"ActionSheet.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: ActionSheet
  category: overlay
  status: review
  apg: menu-button
  anatomy:
  - scrim
  - surface
  - focusScope
  - handle
  - header
  - heading
  - list
  - item
  - itemIcon
  - cancelButton
  composition:
    focusScope: FocusScope
    heading: Text
    itemIcon: Icon
    cancelButton: Button
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility.
    heading:
      type: string
      description: What the actions apply to ("Photo.jpg"), shown muted above the
        list. Also the accessible name; when omitted the name is `copy.defaultLabel`.
    actions:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; tone?: "default" | "danger";
        disabled?: boolean }[]'
      description: Two to about eight actions. `danger` actions are visually distinct
        and grouped last.
    dismissible:
      type: boolean
      default: true
      description: Escape, the scrim, the cancel row and the drag all request close;
        Escape still reports through onClose when false, as in Dialog.
    cancelLabel:
      type: string
      description: Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`.
  events:
    onAction:
      description: An action was chosen; receives its `id`. The consumer performs
        it and closes.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
    onClose:
      description: 'Dismissed without choosing: reason `escape`, `scrim`, `cancel`,
        or `drag`.'
      platforms:
        web: onClose
        lit: close
        rn: onClose
        swiftui: onClose
  keyboard:
  - keys:
    - Escape
    action: Closes without choosing.
    from: inside
    expect: closes
  - keys:
    - ArrowDown
    action: Moves focus to the next action.
    from: first
    expect: focus-next
  - keys:
    - ArrowDown
    action: From the last action wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - ArrowUp
    action: From the first action wraps to the last.
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Home
    action: First action.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last action.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Chooses the focused action and closes.
    when: focus on an action
    from: first
    expect: closes
  - keys:
    - Tab
    action: Closes and moves focus on (a menu is not a tab stop container).
    when: wide-screen menu presentation
    from: first
    expect: manual
  styles:
    scrim:
      token: color.overlay.scrim
      locked: false
    surface:
      token: color.overlay.surface
      locked: true
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.lg
      locked: false
    itemPaddingBlock:
      token: space.sm
      locked: false
    itemPaddingInline:
      token: layout.inset.md
      locked: false
    itemGap:
      token: layout.gap.normal
      description: 'Between icon and label. Rows have no gap between them: their rhythm
        comes from itemPaddingBlock.'
      locked: false
    headerPaddingBlock:
      token: space.sm
      description: Vertical padding of the header (handle + heading) and of the cancel
        row.
      locked: false
    itemHover:
      token: color.background.subtle
      locked: true
    itemColor:
      token: color.foreground
      locked: true
    itemDangerColor:
      token: color.foreground.danger
      locked: true
    titleColor:
      token: color.foreground.muted
      locked: true
    titleSize:
      token: font.size.sm
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
    divider:
      token: color.border
      description: Above the danger group and above the cancel row.
      locked: false
    dividerWidth:
      token: border.width.thin
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    maxWidth:
      token: layout.maxWidth.prose
      description: Above this width, present as a Menu anchored to the trigger.
      locked: false
    layer:
      token: layer.sheet
      locked: false
    enter:
      token: motion.duration.base
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    cancelLabel: Cancel
    defaultLabel: Actions
  a11y:
    role: menu
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - arrow-navigation
    - roving-tabindex
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-44px
    - gesture-alternative
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
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: dialog
      attributes:
      - aria-modal
      - aria-label
      - role=menu
      - role=menuitem
      notes: 'Below maxWidth: a native <dialog> at the bottom edge (as BottomSheet)
        containing a <div role="menu" aria-label> of <button role="menuitem"> rows
        plus a separate Cancel <ds-button>. Above maxWidth: renders Menu anchored
        to the element that was focused when `open` became true. Roving tabindex over
        the items; first item focused on open.'
    lit:
      tag: ds-action-sheet
      reflect:
      - open
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close`
        (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet;
        the wide presentation renders <ds-menu>.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'A native Modal sheet: a View with accessibilityRole="menu" containing
        Pressable rows with accessibilityRole="menuitem" and a separate Cancel Button,
        drag-to-dismiss on the header as BottomSheet. iOS''s ActionSheetIOS is not
        used, so the look matches the theme on both platforms. On tablets above maxWidth,
        presents as Menu. The surface uses the RN >= 0.74 `role="menu"` prop with
        accessibilityViewIsModal; rows are `role="menuitem"`. Arrow keys do not exist
        on native; each row is its own focus stop.'
    swiftui:
      element: confirmationDialog
      props:
      - .confirmationDialog
      - Button
      - role=destructive
      - role=cancel
      - titleVisibility
      notes: '`.confirmationDialog(title, isPresented:, titleVisibility: .visible)`
        with one `Button` per action (`destructive` via `role: .destructive`, cancel
        via `role: .cancel` from copy) — the system action sheet is the pattern users
        expect and VoiceOver handles it natively; the doc''s surface bindings are
        no-ops here (the gallery notes it), `description` becomes the message. `onAction`
        with the action id, `onClose` on dismissal.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `headerPaddingBlock`, `titleSize`, `fontFamily`, `fontSize`, `lineHeight`, `divider`, `dividerWidth`, `maxWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `itemHover`, `itemColor`, `itemDangerColor`, `titleColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: confirmationDialog
props:
- .confirmationDialog
- Button
- role=destructive
- role=cancel
- titleVisibility
notes: "`.confirmationDialog(title, isPresented:, titleVisibility: .visible)` with\
  \ one `Button` per action (`destructive` via `role: .destructive`, cancel via `role:\
  \ .cancel` from copy) \u2014 the system action sheet is the pattern users expect\
  \ and VoiceOver handles it natively; the doc's surface bindings are no-ops here\
  \ (the gallery notes it), `description` becomes the message. `onAction` with the\
  \ action id, `onClose` on dismissal."
```

## Guidance

## Overview

An action sheet answers "what can I do with this?" — the long-press or overflow menu of mobile. It lists a handful of verbs, groups the dangerous one at the bottom, and adds an explicit Cancel because thumbs miss. On wide screens the same list is a Menu next to what was clicked.

## When to use

Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits without scrolling; more than eight actions means the item needs its own screen. Put destructive actions last with `tone: danger`.

## When not to use

Do not use it for navigation (Menu in a nav Landmark, or Links), for settings with state (a screen of Switches), for choosing a value (Select or RadioGroup in a BottomSheet), or for confirming — an ActionSheet's danger row opens an AlertDialog, it does not itself confirm. Do not put forms in it.

## Behavior

Opening presents the list with focus on the first action; arrow keys move between actions, Enter or Space chooses and fires `onAction(id)`, Escape, the scrim, the Cancel row, or a drag close it with `onClose`. Disabled actions are shown, skipped by arrow navigation, and announced as disabled. On wide screens the sheet becomes a Menu anchored to the opener: same actions, same events, no Cancel row (clicking outside closes). Focus returns to the opener on close in both presentations. On phones the sheet has BottomSheet''s handle and header, and the drag-to-dismiss gesture lives on them (the same 25% / 1.5 px/ms rule). Above the breakpoint it renders Menu with `anchor` set to the element that was focused when `open` became true (Menu renders no trigger in that mode), and maps Menu''s onOpenChange reasons to its own: `escape` → escape, `outside` → scrim, `action` → nothing (onAction fires instead).

## Content guidelines

Actions are verbs, one or two words, sentence case ("Rename", "Move to folder"). The title is the item's name, not "Options". Danger actions say what they destroy ("Delete photo"). Cancel is "Cancel".

## Accessibility

The list is a `menu` of `menuitem`s with an accessible name (WCAG 4.1.2, APG menu button). One tab stop; arrows move (roving-tabindex, arrow-navigation). Escape closes and focus returns to the opener (2.4.3). On phones the sheet is modal (inert background, focus trap) and every row meets 44px. The drag gesture is additive to Cancel and Escape (2.5.1). Danger rows are distinguished by color *and* position and an icon when given, never color alone (1.4.1). Contrast is checked for normal, danger and muted text on the surface and for the hover row.

## Platform notes

### Web
Below the breakpoint, reuse BottomSheet's `<dialog>` mechanics with `height: content`, a `<p>` title (muted, small), `<div role="menu" aria-label={heading ?? copy.defaultLabel}>` of `<button role="menuitem" tabindex={roving}>` rows (icon via `<Icon>`, label, `aria-disabled` for disabled), a divider before the danger group, and a separate Cancel `<Button variant="secondary">` under a divider. Above the breakpoint, render `<Menu>` with the same `actions`, anchored to `document.activeElement` at open time.

### Lit
`<ds-action-sheet open heading="Photo.jpg" .actions=${[...]}>`; shadow `<dialog>` or `<ds-menu>` by `matchMedia`; composed `action` and `close`.

### React Native
`Modal` sheet with `View accessibilityRole="menu"` of `Pressable accessibilityRole="menuitem"` rows (`accessibilityState={{ disabled }}`), a divider and a Cancel `Button`; drag-to-dismiss on the header via `PanResponder`; `onRequestClose` → `onClose('escape')`. On tablets above the breakpoint, `Menu`.

## Related

BottomSheet, Menu, Button, AlertDialog.

## Behavior scenarios (2)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
