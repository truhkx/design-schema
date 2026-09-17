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
    heading:
      component: Heading
      props:
        level: '2'
    description:
      component: Text
      props:
        tone: muted
    closeButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
    body:
      component: Box
      forwards:
        inset: paddingInline
    footer:
      component: Stack
      props:
        direction: horizontal
        justify: end
        wrap: true
      forwards:
        footerGap: gap
  props:
    open:
      type: boolean
      required: true
      description: Controlled only — there is no uncontrolled mode and no initial-state
        prop; the consumer owns `open` and the dialog never closes itself, it requests
        changes through `onClose`.
      controls:
        event: onClose
        state: open
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
      enumRef: size
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
      description: 'Where focus lands on open: the first focusable control (default),
        the title (for long or reading dialogs), or the close button. `first` looks
        in the body, then the footer, then the close button, then the heading (tabindex
        -1); `close` with no close button rendered (not dismissible) takes the same
        order without the close button.'
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
      payload:
      - name: reason
        type: enum
        values:
        - escape
        - close-button
        - scrim
        - action
      reasons:
        escape: Escape pressed while open
        close-button: the close button was activated
        scrim: the scrim was clicked
        action: something inside the dialog asked to close — a footer action reusing
          this same handler, or on Lit a slotted form submitted with method="dialog"
          (a light-DOM form has no <dialog> ancestor, so a host `submit` listener
          catches a form or submitter whose method is `dialog`, prevents default and
          fires `close` with `action`). Dialog never raises it on its own; the three
          dismiss affordances have their own reasons.
      fires:
      - user
      timing:
        phase: request
    onOpened:
      description: Fired after the open transition ends and focus has moved in. When
        there is no transition to wait for (reduced motion, or a zero computed duration),
        it fires on the next frame (requestAnimationFrame on every platform) after
        focus moves in. It does not fire when `open` becomes false before the enter
        transition finishes. Use to start work that needs the dialog visible.
      platforms:
        web: onOpened
        lit: opened
        rn: onOpened
        swiftui: onOpened
      timing:
        phase: after-change
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
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
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
      description: 'Inline padding of header, body and footer, plus the block padding
        of the surface column that holds them (once at the top, once at the bottom),
        so nothing doubles between parts. The header and the footer wrapper apply
        the inline padding themselves; the body Box receives it as `overrides.paddingInline`
        and keeps zero block padding. The forward always reaches the Box with the
        resolved value: on web and Lit through the stylesheet setting the Box''s `--ds-box-padding-inline`
        to `--ds-dialog-inset`, with `overrides.paddingInline` passed only when the
        caller overrides `inset`; on rn the resolved value is always passed.'
      locked: false
    partGap:
      token: layout.gap.loose
      description: Gap between header, body and footer, and the only space between
        them.
      locked: false
    gutter:
      token: layout.gutter
      description: 'Minimum space between the surface and the viewport edge: web and
        Lit cap the <dialog> at `100vw - 2 × gutter` wide and `100dvh - 2 × gutter`
        tall; rn pads the centring container horizontally with it (never a margin)
        and caps the surface at the window height − 2 × gutter.'
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Between title/description and the close button.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: 'Between footer actions; forwarded to the footer Stack as `overrides.gap`.
        On web and Lit the CSS hook reaches the Stack too: the footer wrapper''s stylesheet
        sets the Stack''s own `--ds-stack-gap` hook on the Stack element to `--ds-dialog-footer-gap`,
        so either route changes the gap. The footer row is end-aligned (Form''s action-row
        rule), unlike Card''s start-aligned footer.'
      locked: false
    descriptionGap:
      token: layout.gap.tight
      part: header
      description: 'Between the heading and the description: the flex gap of the titles
        group, a Dialog-owned element inside the header that wraps heading and description.
        The group is not an anatomy part and carries no data-part or testID.'
      locked: false
    widthSm:
      token: layout.maxWidth.prose
      description: Surface width for size sm.
      locked: false
    widthMd:
      token: layout.maxWidth.content
      computed:
        times: 0.75
      description: 'Surface width for size md: layout.maxWidth.content × 0.75, not
        a new token. An override replaces the base; the × 0.75 stays in the rule.'
      locked: false
    widthLg:
      token: layout.maxWidth.content
      description: Surface width for size lg.
      locked: false
    layer:
      token: layer.dialog
      description: 'Kept as the hook, but it has no effect inside the browser top
        layer or a native Modal window; it applies to a non-top-layer fallback (position:
        fixed) only. rn ignores it.'
      locked: false
    enter:
      token: motion.duration.base
      description: 'Scrim fade and surface fade-and-rise, motion.easing.standard:
        the surface starts space.2 below its resting place (translateY +space.2 →
        0) and rises into it; the scrim fades in with the same duration and easing.
        Runs also when the dialog mounts already open. Instant under reduced motion.'
      locked: false
    exit:
      token: motion.duration.fast
      description: Fade only, with motion.easing.exit; the scrim fades out with the
        same duration and easing as the surface.
      locked: false
    focusRing:
      token: color.border.focus
      part: heading
      description: 'The ring on the heading when it holds focus (tabindex -1), drawn
        by the Dialog-owned heading wrapper with `:has(:focus-visible)` — Heading
        has no focus style of its own. Web and Lit only: rn draws no ring, the platform''s
        screen-reader focus indicator stands in.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: heading
      locked: true
  copy:
    closeLabel: Close
  overlay:
    layer: modal
    open: open
    closeEvent: onClose
    dismiss:
    - escape
    - scrim
    - close-button
    modal: true
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
    requiresOn:
      scroll-lock:
      - web
      - lit
      - swiftui
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
        Escape (cancel event → onClose reason escape, preventDefault always, since
        the consumer owns `open`), and background inertness for free. Where the browser
        fires a non-cancelable `cancel` (Chromium without user activation) and closes
        the native dialog anyway, still report `escape`, then call showModal() again
        and move focus back in per `initialFocus` if the consumer has not set `open`
        false. A close watcher can also close the <dialog> with no `cancel` at all
        (repeated Escape): a native `close` event while `open` is still true that
        no `cancel` announced is reported as `escape` too, so each Escape is reported
        exactly once, and the dialog is reopened the same way. Rendered through a
        portal into document.body. The <dialog> fills the viewport with a transparent
        ::backdrop; the scrim is a real element inside it (`data-part="scrim"`, behind
        the surface, fading with the surface), and a click whose target is that element
        is the scrim click. Heading, Button and Stack write their own data-part, so
        the heading, closeButton and footer parts are Dialog-owned wrapper elements
        around those components (the heading wrapper does the visual hiding for `hideHeading`
        and draws the focus ring); Text keeps a passed data-part, so the description
        carries it itself. The body part is a Dialog-owned scroll container (overflow:
        auto, the only element that scrolls) holding the Box, since Box never scrolls.
        FocusScope writes its own `data-part="scope"`, so the focusScope part is a
        Dialog-owned element directly inside FocusScope wrapping the surface. The
        footer wrapper is not rendered when there is no footer. The ref resolves to
        the <dialog> element, null while closed. Focus trap: showModal() traps by
        inertness, and FocusScope (trapped) implements the Tab wrap the browser would
        otherwise let leave to the URL bar; Dialog adds no Tab handler of its own.
        Body scroll locked with overflow: hidden on <html> while open, compensating
        for scrollbar width via scrollbar-gutter. Focus restore to document.activeElement
        at open time. `container?: HTMLElement` (default document.body) is the portal
        target — a platform prop every portaled overlay accepts, not a schema prop.
        FocusScope has no autoFocus value for `title` or `close`, so Dialog sets it
        to `none` and places initial focus itself, right after showModal() (and after
        a native re-open), while FocusScope keeps ownership of capturing and restoring
        the opener. `initialFocus: close` on a non-dismissible dialog has no close
        button to land on and falls back in the `initialFocus` description''s order.
        The heading takes `tabindex="-1"` for `initialFocus: title` and whenever it
        is the last fallback of `first` or `close`, and keeps it when `hideHeading`
        is set — a visually hidden heading is still a focus target and still announced.'
    lit:
      tag: ds-dialog
      reflect:
      - open
      - size
      - prop: dismissible
        attribute: no-dismiss
      - initial-focus
      notes: 'Wraps a native <dialog> in the shadow root; the top layer works from
        inside shadow DOM. `open` is a reflected property the consumer sets; the element
        calls showModal()/close() in updated(). `close` is a composed CustomEvent
        with detail { reason }; `opened` likewise. Slots: default (body), `footer`.
        Title and description are properties rendered as <ds-heading level="2"> and
        <ds-text>. The close button is a <ds-button variant="ghost" size="sm" icon-only>
        with <ds-icon name="close">. Accessible name: ids do not cross the shadow
        boundary, so the shadow <dialog> carries aria-label={heading} (and aria-description
        from the description text) rather than aria-labelledby. The heading happens
        to share the shadow root, so an idref would resolve — the literal text is
        still used, so the name does not depend on where the heading is rendered,
        as in AlertDialog. The scrim, the part wrappers, the `cancel`/`close` escape
        handling, initial focus and the Tab wrap are as on web: a real scrim element
        in a full-viewport <dialog> with a transparent ::backdrop, and wrapper elements
        carrying the heading, closeButton and footer parts. On Lit the description
        and body parts are Dialog-owned wrappers too (ds-box overwrites its own data-part
        with `surface`, ds-text carries none): `data-part="body"` is the scroll container
        around the <ds-box>. Lit exposes no ref-like property. For `initialFocus:
        title` and the heading fallback, `tabindex="-1"` goes on the <ds-heading>
        itself, so the heading wrapper''s `:has(:focus-visible)` ring matches. The
        footer is present when a light-DOM element child has `slot="footer"` (watched
        with a MutationObserver over children and their slot attribute); footer content
        must be elements, a bare text node is not a footer. While closed (and not
        animating out) the shadow root renders nothing — no <dialog> and no element
        children.'
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
        with a KeyboardAvoidingView wrapping the whole centring container, so the
        footer as well as a Form in the body stays above the keyboard. Enter/exit
        animated with Animated (opacity + translateY; the scrim is an Animated.View
        whose opacity follows the same value), skipped under reduce motion. Size maps
        to maxWidth from the same tokens; on phones the surface is full-width inside
        the centring container''s `gutter` padding. The surface carries the RN >=
        0.74 `role="dialog"` prop (as Landmark and Fieldset use `role`), alongside
        accessibilityViewIsModal; the legacy accessibilityRole union has no dialog
        value. Scroll lock has no native meaning and is not implemented. `accessibilityViewIsModal`
        goes on the surface View, not on Modal, which does not accept it. testIDs
        are the root plus scrim, header, body and footer; heading, description, closeButton
        and focusScope are reached through their own roles and names and take none,
        as in AlertDialog. The root testID `Dialog` sits on the surface View (with
        the role and name), since a closed Modal renders no content. Stack and Box
        write their own testIDs, so the footer and body testIDs sit on wrapping Views;
        the body wrapper holds the ScrollView and is also the setAccessibilityFocus
        target for the body. On rn `initialFocus: first` therefore always lands on
        the body wrapper (children is required, so a body is always present). iOS
        has no hardware-Escape hook, so the surface View also handles `onAccessibilityEscape`
        (the VoiceOver two-finger scrub) as onClose reason escape, even when not dismissible.
        RN has no visually hidden primitive: with `hideHeading` the Heading is not
        rendered, the surface''s accessibilityLabel stays the name, and `initialFocus:
        title` focuses the surface View. The Dialog is rooted in a native Modal and
        exposes no ref; callers ref their trigger. Native has no descendant walker,
        so `initialFocus` calls setAccessibilityFocus on the View wrapping the title,
        the close button or the body, not on a literal first focusable descendant,
        and there is no visible focus ring on those targets.'
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
  behavior:
  - name: close-button-fires-on-close
    description: The close button requests close; the dialog never closes itself,
      the consumer flips `open`.
    given:
      open: true
    when:
      click: closeButton
    then:
    - event: onClose
  - name: non-dismissible-still-reports-escape
    description: Escape requests close with reason escape even when not dismissible
      (keyboard rule 1), because trapping a keyboard user with no way out is never
      acceptable.
    given:
      open: true
      dismissible: false
    when:
      key: Escape
    then:
    - event: onClose
    platforms:
    - web
    - lit
  - name: non-dismissible-scrim-click-does-nothing
    description: With `dismissible` false the scrim does nothing, so a stray click
      cannot abandon the task.
    given:
      open: true
      dismissible: false
    when:
      click: scrim
    then:
    - event: onClose
      fired: false
  - name: initial-focus-lands-on-the-close-button
    description: initialFocus close puts focus on the close button rather than the
      first body control.
    given:
      open: true
      initialFocus: close
    then:
    - focused: closeButton
    platforms:
    - web
    - lit
  - name: hidden-heading-is-still-the-accessible-name
    description: hideHeading removes the title from view, not from the accessible
      name.
    given:
      open: true
      hideHeading: true
    then:
    - name: true
  - name: closed-dialog-renders-nothing
    description: 'Closed and not animating out, the dialog renders nothing: null on
      web, an empty shadow root on Lit, no Modal content on rn.'
    given:
      open: false
    then:
    - renders: false
  examples:
  - name: rename-project
    description: The short single-field task a dialog is for, with the completing
      action named after it.
    given:
      open: true
      heading: Rename project
      children: A labelled text Input holding the current name
      footer: Rename and Cancel Buttons
  - name: invite-people
    description: A small form in the narrow size, where the footer restates the task.
    given:
      open: true
      heading: Invite people
      children: An email Input and a role Select
      footer: Send invites and Cancel Buttons
      size: sm
  - name: must-be-answered
    description: A dialog with no way out but its own actions; Escape still reports
      so the consumer can decide.
    given:
      open: true
      heading: Choose a plan
      description: You need a plan before you can invite anyone.
      children: A RadioGroup of plans
      footer: Continue Button
      dismissible: false
  - name: reading-dialog
    description: A long reading dialog that starts focus on the title so the text
      is read from the top.
    given:
      open: true
      heading: Terms of service
      children: Several paragraphs of Text
      size: lg
      initialFocus: title
```

## Events

- `onClose`: emit `onClose`
  - payload, positional, in this order: `reason: 'escape' | 'close-button' | 'scrim' | 'action'`
  - reasons: `escape` (Escape pressed while open); `close-button` (the close button was activated); `scrim` (the scrim was clicked); `action` (something inside the dialog asked to close — a footer action reusing this same handler, or on Lit a slotted form submitted with method="dialog" (a light-DOM form has no <dialog> ancestor, so a host `submit` listener catches a form or submitter whose method is `dialog`, prevents default and fires `close` with `action`). Dialog never raises it on its own; the three dismiss affordances have their own reasons.)
  - fires on: user
  - timing: request
- `onOpened`: emit `onOpened`
  - timing: after-change

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `onClose`); drives state `open`

## Parts and slots

- `scrim`: element
- `surface`: element
- `focusScope`: component `FocusScope`
- `header`: element
- `heading`: component `Heading`; props `level` = "2"
- `description`: component `Text`; props `tone` = "muted"
- `body`: component `Box`; forwards `inset` → `overrides.paddingInline`
- `footer`: component `Stack`; props `direction` = "horizontal", `justify` = "end", `wrap` = true; forwards `footerGap` → `overrides.gap`
- `closeButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `descriptionGap`: token `layout.gap.tight`; part `header`
- `widthMd`: token `layout.maxWidth.content`; computed `theme.layoutMaxWidthContent * 0.75`
- `focusRing`: token `color.border.focus`; part `heading`; locked
- `focusRingWidth`: token `border.width.focus`; part `heading`; locked

## Form and overlay

```yaml
overlay:
  layer: modal
  open: open
  closeEvent: onClose
  dismiss:
  - escape
  - scrim
  - close-button
  modal: true
```

`overlay.closeEvent` emits `onClose`.

## Constants and examples

- example `rename-project`, story `RenameProject`: given `open: true`, `heading: "Rename project"`, `children: "A labelled text Input holding the current name"`, `footer: "Rename and Cancel Buttons"`; The short single-field task a dialog is for, with the completing action named after it.
- example `invite-people`, story `InvitePeople`: given `open: true`, `heading: "Invite people"`, `children: "An email Input and a role Select"`, `footer: "Send invites and Cancel Buttons"`, `size: "sm"`; A small form in the narrow size, where the footer restates the task.
- example `must-be-answered`, story `MustBeAnswered`: given `open: true`, `heading: "Choose a plan"`, `description: "You need a plan before you can invite anyone."`, `children: "A RadioGroup of plans"`, `footer: "Continue Button"`, `dismissible: false`; A dialog with no way out but its own actions; Escape still reports so the consumer can decide.
- example `reading-dialog`, story `ReadingDialog`: given `open: true`, `heading: "Terms of service"`, `children: "Several paragraphs of Text"`, `size: "lg"`, `initialFocus: "title"`; A long reading dialog that starts focus on the title so the text is read from the top.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `gutter`, `headerGap`, `footerGap`, `descriptionGap`, `widthSm`, `widthMd`, `widthLg`, `layer`, `enter`, `exit`
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

Setting `open` true renders the dialog in the top layer with the scrim, moves focus in per `initialFocus`, locks page scroll and makes the page behind inert. Tab and Shift+Tab cycle within the dialog. Escape, the close button and a scrim click each call `onClose` with a reason; the dialog does not close itself — the consumer flips `open`, so an unsaved form can ask first. When `dismissible` is false, the close button is not rendered, the scrim does nothing and Escape still reports (the consumer decides), because trapping a keyboard user with no way out is never acceptable. On close, the exit animation runs, scroll and inertness are restored, and focus returns to the element that opened the dialog (or the next focusable element if it is gone). The body scrolls independently when content exceeds the viewport; header and footer are always visible.

The parts nest as: the scrim and a FocusScope side by side, the FocusScope wrapping the surface, and the surface holding the header (the titles group of heading and description, then the close button), the body and the footer. The Default story is open, with the rename-project example's args; stories that need to start open render through a wrapper that owns `open` (starting true) and writes `onClose` back, acting as the consumer. Example stories start from blank args, not Default's: a prop absent from an example's `given` (reading-dialog's `footer`) takes its default, so that dialog has no footer.

`open` is controlled only; there is no uncontrolled mode. Focus restore runs when `open` becomes false, at the start of the exit transition. Beyond the listed composition props, the Heading's id, ref and tabindex, the close Button's label (`copy.closeLabel`), its `close` Icon as `leadingIcon` and its press handler are wiring every platform passes, not composition props.

## Content guidelines

Titles are short verb phrases naming the task ("Rename project", "Invite people"), not questions or "Dialog". The description, if any, is one sentence of consequence or context. Footer actions restate the task ("Rename", "Send invites") with "Cancel" as the secondary — never "OK"/"Yes". The close button's name is `copy.closeLabel`.

## Accessibility

The dialog has role `dialog`, `aria-modal`, an accessible name from the title and a description from `description` (WCAG 4.1.2, APG modal dialog). Focus moves into it on open and is trapped until close (2.4.3, 2.1.2: no keyboard trap *without an exit* — Escape is the exit), then returns to the opener (focus-restore). The page behind is inert to assistive technology and pointer (inert-background). Escape always reports, even for non-dismissible dialogs. Text on the overlay surface meets 4.5:1 in both modes; the build checks body, muted, link and ghost-button text. Motion respects reduced-motion (2.3.3). The close button is at least 24px (2.5.8). Nothing inside relies on hover.

## Platform notes

### Web
Render through a portal into `document.body`: `<dialog aria-labelledby aria-describedby>` containing the surface. Call `showModal()` when `open` becomes true and `close()` when false; listen to `cancel` (Escape) and call `preventDefault()` on it always, reporting through `onClose('escape')` — the consumer owns `open`. Leave `::backdrop` transparent and render the scrim as a real element inside the full-viewport `<dialog>`, styled with the scrim token and `@media (prefers-reduced-motion: no-preference)` transitions. Detect a scrim click as a `click` whose target is the scrim element. Tab wrapping comes from FocusScope (`trapped`); add no handler of your own. Lock scroll with a class on `<html>` (`overflow: hidden; scrollbar-gutter: stable`). Store `document.activeElement` on open; on close, focus it if still connected. Size classes set `inline-size` from the width tokens with `max-inline-size: calc(100vw - 2 * var(--layout-gutter))`.

### Lit
`<ds-dialog open heading="Rename project">` with a `<dialog>` in the shadow root; `showModal()` works from a shadow root and the element is placed in the top layer. The light-DOM slotted content is part of the dialog's focus order, so the Tab wrap (FocusScope's walker) covers both the shadow root and assigned slot nodes. Dispatch composed `close` and `opened`. Reflect `open` so `ds-dialog[open]` can be styled. Compose `<ds-heading>`, `<ds-text>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`.

### React Native
`Modal` with `transparent`, `animationType="none"` (the component animates itself), `onRequestClose` → `onClose('escape')`, `statusBarTranslucent`. Inside: an `Animated.View` scrim (`Pressable` for the scrim click, `accessible={false}`), and the surface `View` with `accessibilityViewIsModal`, `accessibilityLabel={heading}`, `accessibilityHint={description}`. Wrap the body in `ScrollView`, and the whole centring container in `KeyboardAvoidingView`. After the enter animation, `setAccessibilityFocus` on the title (or first control). Size uses `maxWidth` from the width tokens, with `paddingHorizontal` of `gutter` on the centring container and `maxHeight` of the window height − 2 × `gutter` on the surface; below the content measure the surface is full width. The close button is the system `Button` with `leadingIcon` an `Icon name="close"`.

## Related

AlertDialog, BottomSheet, Toast, Form, Button, Heading.

## Behavior scenarios (13)

One test per scenario, in this order.

```yaml
- name: close-button-fires-on-close
  description: The close button requests close; the dialog never closes itself, the
    consumer flips `open`.
  given:
    open: true
  when:
    click: closeButton
  then:
  - event: onClose
- name: non-dismissible-scrim-click-does-nothing
  description: With `dismissible` false the scrim does nothing, so a stray click cannot
    abandon the task.
  given:
    open: true
    dismissible: false
  when:
    click: scrim
  then:
  - event: onClose
    fired: false
- name: hidden-heading-is-still-the-accessible-name
  description: hideHeading removes the title from view, not from the accessible name.
  given:
    open: true
    hideHeading: true
  then:
  - name: true
- name: closed-dialog-renders-nothing
  description: 'Closed and not animating out, the dialog renders nothing: null on
    web, an empty shadow root on Lit, no Modal content on rn.'
  given:
    open: false
  then:
  - renders: false
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
- name: escape-fires-on-close
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onClose
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```
