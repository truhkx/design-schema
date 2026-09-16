# Generate: Dialog for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/Dialog.swift` declaring `public struct Dialog: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/DialogBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+Dialog.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("Dialog") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("Dialog")` on the root and `"Dialog.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for swiftui; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: each closure takes exactly the listed arguments, in order, and `reason` is a nested `enum` of its reasons. A `cancelable` closure returns `Bool`, and `false` skips the default action. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: every pair becomes a `Binding<T>?` parameter plus the default's initial value, with `@State` holding the uncontrolled value; the closure fires in both modes, and a bound view shows the new state only once the binding changes.
- **Parts and slots**: each slot is a `@ViewBuilder` parameter under its resolved label only (`content` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides:` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (`.onHover`, `@FocusState`, or the view's own state), with the token listed for each `by` value; write `computed` as the given multiplication of `theme` values. Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` applies when those props are set.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this picks among the conventions' overlay forms.
- **Copy**: interpolate only the listed `params` and props; select plural forms through `String(localized:)` with the entry's forms as its plural variations; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example becomes a `#Preview` with the name shown and exactly its `given`.
- **Lifecycle**: a deprecated parameter, closure, case or view keeps working, is marked `@available(*, deprecated, message:)` naming `use`, and warns once under `#if DEBUG` naming `use`.
- A `type: integer` prop is an `Int`: whole numbers only.

## Component schema

```yaml
component:
  name: Dialog
  category: overlay
  status: review
  apg: dialog-modal
  anatomy:
  - scrim
  - surface
  - focusScope
  - header
  - heading
  - description
  - body
  - footer
  - closeButton
  composition:
    focusScope: FocusScope
    heading: Heading
    description: Text
    closeButton: Button
    body: Box
    footer: Stack
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility. The consumer owns it; the dialog requests
        changes through `onClose`.
    heading:
      type: string
      required: true
      description: The dialog's title, rendered as a level-2 Heading and used as the
        accessible name. Says what the task is ("Rename project").
      a11y: aria-labelledby the heading; native accessibilityLabel on the Modal content.
    description:
      type: string
      description: One sentence under the title explaining the task or consequence.
        Becomes the accessible description.
      a11y: aria-describedby.
    children:
      type: content
      required: true
      description: The body — a Form, Text, or controls. Scrolls inside the surface
        when taller than the viewport; header and footer stay put.
    footer:
      type: content
      description: The action row. Primary action first, then one secondary; follows
        Form's action-order rule. A dialog with no footer must be dismissable from
        its body.
    hideHeading:
      type: boolean
      default: false
      description: Visually hide the heading while it remains the accessible name
        (BottomSheet forwards its own hideHeading here above the breakpoint).
    size:
      type: enum
      values:
      - sm
      - md
      - lg
      default: md
      description: Surface width on wide viewports. Full-width below the content measure
        on every size.
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button and a scrim click all request close.
        Set false for a dialog that must be answered (then provide the answers in
        the footer): the close button is not rendered and the scrim does nothing;
        Escape still fires `onClose` with reason `escape` so the consumer can decide.'
    initialFocus:
      type: enum
      values:
      - first
      - title
      - close
      default: first
      description: 'Where focus lands on open: the first focusable control in the
        body (default), the title (for long or reading dialogs), or the close button.'
      a11y: Focus must move into the dialog on open and never rest on the scrim or
        the page behind.
  events:
    onClose:
      description: 'Fired when the user requests to close, with a reason: `escape`,
        `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or
        not).'
      platforms:
        web: onClose
        lit: close
        rn: onClose
        swiftui: onClose
    onOpened:
      description: Fired after the open transition ends and focus has moved in. Use
        to start work that needs the dialog visible.
      platforms:
        web: onOpened
        lit: opened
        rn: onOpened
        swiftui: onOpened
  keyboard:
  - keys:
    - Escape
    action: Requests close with reason escape (even when not dismissible).
    from: inside
    expect: closes
  - keys:
    - Tab
    action: Moves to the next focusable element inside the dialog.
    from: first
    expect: focus-next
  - keys:
    - Tab
    action: From the last element, wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Shift+Tab
    action: From the first element, wraps to the last.
    from: first
    expect: focus-wraps-to-last
  styles:
    scrim:
      token: color.overlay.scrim
      locked: false
    surface:
      token: color.overlay.surface
      locked: true
    border:
      token: color.border
      description: Hairline; the only edge in a flat theme.
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.lg
      locked: false
    inset:
      token: layout.inset.lg
      description: Padding of header, body and footer.
      locked: false
    partGap:
      token: layout.gap.loose
      description: Gap between header, body and footer.
      locked: false
    headerGap:
      token: layout.gap.normal
      description: Between title/description and the close button.
      locked: false
    footerGap:
      token: layout.gap.tight
      description: Between footer actions; forwarded to the footer Stack as `overrides.gap`.
        The footer row is end-aligned (Form's action-row rule), unlike Card's start-aligned
        footer.
      locked: false
    descriptionGap:
      token: layout.gap.tight
      description: Between the heading and the description inside the header group.
      locked: false
    widthSm:
      token: layout.maxWidth.prose
      description: Surface width for size sm; md is 3/4 of content and lg is content
        — both derived from layout.maxWidth.content by the generator, not new tokens.
      locked: false
    layer:
      token: layer.dialog
      locked: false
    enter:
      token: motion.duration.base
      description: Scrim fade and surface fade-and-rise (translateY of space.2), motion.easing.standard;
        instant under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      description: With motion.easing.exit.
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    closeLabel: Close
  a11y:
    role: dialog
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - scroll-lock
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.link
      background: color.overlay.surface
      level: AA
    - foreground: color.action.ghost.foreground
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: dialog
      attributes:
      - aria-modal
      - aria-labelledby
      - aria-describedby
      notes: 'A native <dialog> opened with showModal(), which gives the top layer,
        Escape (cancel event → onClose reason escape, preventDefault when not dismissible),
        and background inertness for free. Rendered through a portal into document.body.
        ::backdrop is the scrim; a click on the dialog element outside its surface
        (event.target === dialog) is the scrim click. Focus trap: showModal() traps
        by inertness; Tab wrap is implemented explicitly because the browser lets
        Tab leave to the URL bar. Body scroll locked with overflow: hidden on <html>
        while open, compensating for scrollbar width via scrollbar-gutter. Focus restore
        to document.activeElement at open time. `container?: HTMLElement` (default
        document.body) is the portal target — a platform prop every portaled overlay
        accepts, not a schema prop.'
    lit:
      tag: ds-dialog
      reflect:
      - open
      - size
      - no-dismiss
      - initial-focus
      notes: 'Wraps a native <dialog> in the shadow root; the top layer works from
        inside shadow DOM. `open` is a reflected property the consumer sets; the element
        calls showModal()/close() in updated(). `close` is a composed CustomEvent
        with detail { reason }; `opened` likewise. Slots: default (body), `footer`.
        Title and description are properties rendered as <ds-heading level="2"> and
        <ds-text>. The close button is a <ds-button variant="ghost" size="sm" icon-only>
        with <ds-icon name="close">. Accessible name: ids do not cross the shadow
        boundary, so the shadow <dialog> carries aria-label={heading} (and aria-description
        from the description text) rather than aria-labelledby.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - animationType=none
      - onRequestClose
      - statusBarTranslucent
      - accessibilityViewIsModal
      notes: 'Native Modal with transparent background; the scrim is a full-screen
        Pressable (accessible={false}) in color.overlay.scrim; the surface is a View
        with accessibilityViewIsModal so VoiceOver/TalkBack ignore the page behind.
        onRequestClose (Android back) → onClose reason escape. Focus: AccessibilityInfo.setAccessibilityFocus
        on the title or first control after the enter animation. Keyboard avoidance
        with KeyboardAvoidingView so a Form in the body stays visible. Enter/exit
        animated with Animated (opacity + translateY), skipped under reduce motion.
        Size maps to maxWidth from the same tokens; on phones the surface is full-width
        with the gutter as margin. The surface carries the RN >= 0.74 `role="dialog"`
        prop (as Landmark and Fieldset use `role`), alongside accessibilityViewIsModal;
        the legacy accessibilityRole union has no dialog value. Scroll lock has no
        native meaning and is not implemented.'
    swiftui:
      element: sheet
      props:
      - .sheet
      - .fullScreenCover
      - .popover
      - .interactiveDismissDisabled
      - .presentationBackground
      - .accessibilityAddTraits=isModal
      - FocusScope
      - .onExitCommand
      notes: 'Presented with `.sheet` on compact width and `.popover` (regular width,
        iPad) when `size` is not `full`; `size: full` is `.fullScreenCover`. The dialog
        surface, heading (`Heading`, the `.accessibilityLabel` of the container),
        body and actions are the package''s own views inside the presentation with
        `.presentationBackground(color.overlay.surface)` and `.presentationDragIndicator(.hidden)`.
        `dismissOnScrim: false` → `.interactiveDismissDisabled()`. FocusScope handles
        initial and return focus; Escape via `.onExitCommand`; VoiceOver''s two-finger
        scrub triggers the same close through `.accessibilityAction(.escape)`. `onOpened`
        fires from `.onAppear` of the content.'
```

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `headerGap`, `footerGap`, `descriptionGap`, `widthSm`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
element: sheet
props:
- .sheet
- .fullScreenCover
- .popover
- .interactiveDismissDisabled
- .presentationBackground
- .accessibilityAddTraits=isModal
- FocusScope
- .onExitCommand
notes: "Presented with `.sheet` on compact width and `.popover` (regular width, iPad)\
  \ when `size` is not `full`; `size: full` is `.fullScreenCover`. The dialog surface,\
  \ heading (`Heading`, the `.accessibilityLabel` of the container), body and actions\
  \ are the package's own views inside the presentation with `.presentationBackground(color.overlay.surface)`\
  \ and `.presentationDragIndicator(.hidden)`. `dismissOnScrim: false` \u2192 `.interactiveDismissDisabled()`.\
  \ FocusScope handles initial and return focus; Escape via `.onExitCommand`; VoiceOver's\
  \ two-finger scrub triggers the same close through `.accessibilityAction(.escape)`.\
  \ `onOpened` fires from `.onAppear` of the content."
```

## Guidance

## Overview

A dialog interrupts. It takes the whole screen's attention for one task and gives it back when the task is done or abandoned. Everything about it — the scrim, the trapped focus, the inert page behind, Escape, focus returning to where it was — exists to make that interruption safe and reversible. Anything that does not need the interruption should not be a dialog.

## When to use

Use a Dialog for a short task that must complete before the user continues and needs its own space: rename, create-with-a-few-fields, choose from options with consequences, confirm something reversible with a form attached. Keep it to one screen of content; a dialog that scrolls much is a page. Give it a `heading` that names the task and a `footer` with the completing action first.

## When not to use

Do not use a Dialog for a message that needs no decision (Alert or Toast), for a destructive confirmation (AlertDialog — it asserts and does not dismiss on scrim click), for content that benefits from the page context staying visible (Popover or Disclosure), for navigation menus (Menu), or on a phone for anything the thumb should reach (BottomSheet). Do not open a dialog on page load or without a user action; users cannot tell what interrupted them. Do not nest dialogs.

## Behavior

Setting `open` true renders the dialog in the top layer with the scrim, moves focus in per `initialFocus`, locks page scroll and makes the page behind inert. Tab and Shift+Tab cycle within the dialog. Escape, the close button and a scrim click each call `onClose` with a reason; the dialog does not close itself — the consumer flips `open`, so an unsaved form can ask first. When `dismissible` is false, the close button and scrim do nothing and Escape still reports (the consumer decides), because trapping a keyboard user with no way out is never acceptable. On close, the exit animation runs, scroll and inertness are restored, and focus returns to the element that opened the dialog (or the next focusable element if it is gone). The body scrolls independently when content exceeds the viewport; header and footer are always visible.

## Content guidelines

Titles are short verb phrases naming the task ("Rename project", "Invite people"), not questions or "Dialog". The description, if any, is one sentence of consequence or context. Footer actions restate the task ("Rename", "Send invites") with "Cancel" as the secondary — never "OK"/"Yes". The close button's name is `copy.closeLabel`.

## Accessibility

The dialog has role `dialog`, `aria-modal`, an accessible name from the title and a description from `description` (WCAG 4.1.2, APG modal dialog). Focus moves into it on open and is trapped until close (2.4.3, 2.1.2: no keyboard trap *without an exit* — Escape is the exit), then returns to the opener (focus-restore). The page behind is inert to assistive technology and pointer (inert-background). Escape always reports, even for non-dismissible dialogs. Text on the overlay surface meets 4.5:1 in both modes; the build checks body, muted, link and ghost-button text. Motion respects reduced-motion (2.3.3). The close button is at least 24px (2.5.8). Nothing inside relies on hover.

## Platform notes

### Web
Render through a portal into `document.body`: `<dialog aria-labelledby aria-describedby>` containing the surface. Call `showModal()` when `open` becomes true and `close()` when false; listen to `cancel` (Escape) and call `preventDefault()` on it always, reporting through `onClose('escape')` — the consumer owns `open`. Style `::backdrop` with the scrim token and `@media (prefers-reduced-motion: no-preference)` transitions. Detect a scrim click as a `click` whose target is the `<dialog>` element itself. Implement Tab wrapping with a keydown handler over the dialog's focusable elements. Lock scroll with a class on `<html>` (`overflow: hidden; scrollbar-gutter: stable`). Store `document.activeElement` on open; on close, focus it if still connected. Size classes set `inline-size` from the width tokens with `max-inline-size: calc(100vw - 2 * var(--layout-gutter))`.

### Lit
`<ds-dialog open heading="Rename project">` with a `<dialog>` in the shadow root; `showModal()` works from a shadow root and the element is placed in the top layer. Because the light-DOM slotted content is not inside the shadow `<dialog>` in the composed tree only visually, the Tab-wrap handler must collect focusable elements from both the shadow root and assigned slot nodes. Dispatch composed `close` and `opened`. Reflect `open` so `ds-dialog[open]` can be styled. Compose `<ds-heading>`, `<ds-text>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`.

### React Native
`Modal` with `transparent`, `animationType="none"` (the component animates itself), `onRequestClose` → `onClose('escape')`, `statusBarTranslucent`. Inside: an `Animated.View` scrim (`Pressable` for the scrim click, `accessible={false}`), and the surface `View` with `accessibilityViewIsModal`, `accessibilityLabel={heading}`, `accessibilityHint={description}`. Wrap the body in `ScrollView` inside `KeyboardAvoidingView`. After the enter animation, `setAccessibilityFocus` on the title (or first control). Size uses `maxWidth` from the width tokens and `marginHorizontal: layout.gutter`; below the content measure the surface is full width. The close button is the system `Button` with `leadingIcon` an `Icon name="close"`.

## Related

AlertDialog, BottomSheet, Toast, Form, Button, Heading.

## Behavior scenarios (8)

One test per scenario, in this order.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-size-sm
  given:
    size: sm
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-initial-focus-first
  given:
    initialFocus: first
  then:
  - renders: true
  derived: true
- name: renders-initial-focus-title
  given:
    initialFocus: title
  then:
  - renders: true
  derived: true
- name: renders-initial-focus-close
  given:
    initialFocus: close
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```
