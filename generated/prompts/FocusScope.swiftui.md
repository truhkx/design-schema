# Generate: FocusScope for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/FocusScope.swift` declaring `public struct FocusScope: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/FocusScopeBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+FocusScope.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("FocusScope") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

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
- Testability hooks: `.accessibilityIdentifier("FocusScope")` on the root and `"FocusScope.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
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
  name: FocusScope
  category: primitive
  status: review
  anatomy:
  - scope
  props:
    children:
      type: content
      required: true
      description: The confined content. The scope renders no element of its own beyond
        a wrapper that is not focusable and not announced.
    trapped:
      type: boolean
      default: true
      description: Tab and Shift+Tab wrap within the scope's focusable descendants,
        and focus that lands outside is pulled back in. False turns the scope into
        a plain "move focus in and restore on exit" helper, for non-modal panels.
    autoFocus:
      type: enum
      values:
      - first
      - last
      - container
      - none
      default: first
      description: 'Where focus goes on mount: the first focusable descendant, the
        last, the scope''s own wrapper (made focusable with tabindex -1, for reading-first
        dialogs), or nowhere.'
    restoreFocus:
      type: boolean
      default: true
      description: On unmount, focus returns to the element that was focused when
        the scope mounted, or to the next focusable element in the document if that
        one is gone.
    returnFocusTo:
      type: object
      shape: RefObject<HTMLElement | View>
      description: Explicit element to restore focus to instead of the recorded opener.
        Required on native when the opener is not a TextInput (React Native exposes
        no generic "currently focused element"), so every overlay passes its trigger
        ref.
    active:
      type: boolean
      default: true
      description: Pause the scope without unmounting it — used while a nested scope
        (a Menu inside a Dialog) is open, so the innermost active scope owns Tab.
  events:
    onEscapeAttempt:
      description: Fired when trapped focus would have left the scope (Tab from the
        last element, Shift+Tab from the first) just before it wraps, with the direction.
        Diagnostic; components do not need it.
      platforms:
        web: onEscapeAttempt
        lit: escape-attempt
        rn: onEscapeAttempt
        swiftui: onEscapeAttempt
      payload:
      - name: direction
        type: enum
        values:
        - forward
        - backward
        description: forward for Tab from the last element, backward for Shift+Tab
          from the first.
      fires:
      - user
      timing:
        phase: before-change
  keyboard:
  - keys:
    - Tab
    action: From the last focusable descendant, wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Shift+Tab
    action: From the first focusable descendant, wraps to the last.
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Tab
    action: Ordinary forward movement inside the scope.
    from: first
    expect: focus-next
  styles: {}
  a11y:
    role: none
    requires:
    - focus-trap
    - focus-restore
    - keyboard-operable
  platforms:
    web:
      element: div
      attributes:
      - tabindex=-1
      - data-focus-scope
      notes: 'A <div data-focus-scope> wrapper. Focusable descendants are collected
        in DOM order including across open shadow roots and assigned slot nodes (the
        same walker the keyboard gate uses); disabled and aria-hidden subtrees are
        excluded, as are elements with tabindex=-1 except the container itself. Keydown
        on Tab at the edges calls preventDefault and focuses the other edge. A focusin
        listener on document pulls focus back to the last focused descendant if it
        leaves while trapped and active. Elements are not tested for visibility: one
        hidden by CSS but neither aria-hidden nor inert still counts as focusable,
        which keeps the walker cheap and matches what the browser does with tabindex.
        Two sentinel elements (tabindex=0, visually hidden, data-focus-sentinel so
        the keyboard gate ignores them) at each end catch focus arriving from the
        browser chrome; each continues the direction of travel rather than wrapping
        — the start sentinel sends focus to the first descendant, the end sentinel
        to the last, since wrapping is the Tab handler''s job at the real edges. Restoring
        to "the next focusable element" when the opener is gone needs the opener''s
        old position, so the scope leaves an invisible marker node beside it on mount
        and restores to the first focusable element after that marker. Nested scopes
        register in a module-level stack and only the top is effective; `active: false`
        additionally pauses a scope wherever it sits in that stack. The wrapper is
        `display: block`, not `display: contents`, because `autoFocus: container`
        needs a real box to carry tabindex — so the scope always adds one element
        to the layout. A trapped scope with no focusable descendants warns in development,
        since that is an inescapable trap.'
    lit:
      tag: ds-focus-scope
      reflect:
      - prop: trapped
        attribute: no-trapped
      - prop: active
        attribute: no-active
      notes: 'The host is the wrapper (display: contents is NOT used — it breaks focus
        delegation; the host is display: block). Same walker; slotted light-DOM children
        are included via assignedElements({ flatten: true }). `escape-attempt` is
        a composed CustomEvent. `delegatesFocus` would send a `focus()` on the host
        into the first focusable descendant, so `autoFocus: container` targets an
        invisible tabindex=-1 anchor rendered first in the shadow root: focus lands
        there, nothing interactive is announced, and the host stays out of the tab
        order.'
    rn:
      element: View
      props:
      - accessibilityViewIsModal
      notes: 'There is no Tab order to confine on native. trapped maps to accessibilityViewIsModal
        on the wrapper View (VoiceOver/TalkBack ignore siblings). There is no way
        to walk arbitrary children for a focusable descendant, so `first`, `last`
        and `container` all call AccessibilityInfo.setAccessibilityFocus on the wrapper
        View and only `none` differs — the screen reader then reads the scope from
        its top, which is the intended result for all three. restoreFocus can only
        capture an opener that is a TextInput (TextInput.State.currentlyFocusedInput
        is the one "what is focused" native exposes), which is why `returnFocusTo`
        is required here for every other kind of trigger. onEscapeAttempt never fires
        on this platform: nothing can attempt to leave a Tab order that does not exist.
        Hardware-keyboard Tab wrapping is not implemented; that is a platform limit.'
    swiftui:
      element: VStack
      props:
      - '@FocusState'
      - '@AccessibilityFocusState'
      - .focusSection
      - .focusScope
      - .onExitCommand
      - .accessibilityAddTraits=isModal
      notes: 'The engine in `Support/FocusScope.swift`: `.focusSection()` bounds Tab/Shift+Tab
        on iPad keyboards inside the scope (`trap`), `@AccessibilityFocusState` moves
        VoiceOver focus to `autoFocus`''s target on appear and back to `returnFocusTo`
        (or the element that opened the scope) on disappear, and `.accessibilityAddTraits(.isModal)`
        tells VoiceOver to ignore siblings while a modal scope is up. Escape reaches
        the scope through `.onExitCommand`; `onEscapeAttempt` fires when the scope
        is asked to close and the owner decides. Wrapping is done by tracking the
        first/last focusable identifiers the children register through a preference.'
  behavior:
  - name: auto-focus-container-focuses-the-wrapper
    description: autoFocus container makes the wrapper focusable with tabindex -1
      and puts focus on it, for reading-first dialogs.
    given:
      autoFocus: container
    then:
    - focused: scope
    platforms:
    - web
    - lit
  - name: auto-focus-none-moves-focus-nowhere
    description: autoFocus none leaves focus where it was; the scope never takes it
      on its own.
    given:
      autoFocus: none
    then:
    - focused: none
    platforms:
    - web
    - lit
  - name: the-wrapper-is-not-focusable
    description: The scope renders no element of its own beyond a wrapper that is
      not focusable, unless autoFocus is container.
    given:
      autoFocus: none
    then:
    - focusable: false
    platforms:
    - web
    - lit
  - name: the-scope-adds-no-role
    description: The scope adds no role and no name; assistive technology never perceives
      it.
    then:
    - attribute: role
      is: null
  examples:
  - name: modal-takeover
    description: A new modal surface the system does not have yet, trapped with an
      Escape handler of its own.
    given:
      children: A full-screen onboarding overlay with its own close Button
      trapped: true
      autoFocus: first
  - name: non-modal-drawer
    description: A panel that moves focus in and restores it on close while leaving
      the page usable.
    given:
      children: A slide-in filter drawer
      trapped: false
      autoFocus: first
  - name: reading-first
    description: A dialog whose text should be read from the top, so focus lands on
      the container rather than a control.
    given:
      children: A long terms-of-service body with Accept and Decline Buttons
      autoFocus: container
  - name: paused-outer-scope
    description: The outer scope of a nested pair, inactive while a Menu inside owns
      Tab.
    given:
      children: A dialog body with a Menu open inside it
      active: false
```

## Events

- `onEscapeAttempt`: emit `onEscapeAttempt`
  - payload, positional, in this order: `direction: 'forward' | 'backward'`
  - fires on: user
  - timing: before-change

## Constants and examples

- example `modal-takeover`, story `ModalTakeover`: given `children: "A full-screen onboarding overlay with its own close Button"`, `trapped: true`, `autoFocus: "first"`; A new modal surface the system does not have yet, trapped with an Escape handler of its own.
- example `non-modal-drawer`, story `NonModalDrawer`: given `children: "A slide-in filter drawer"`, `trapped: false`, `autoFocus: "first"`; A panel that moves focus in and restores it on close while leaving the page usable.
- example `reading-first`, story `ReadingFirst`: given `children: "A long terms-of-service body with Accept and Decline Buttons"`, `autoFocus: "container"`; A dialog whose text should be read from the top, so focus lands on the container rather than a control.
- example `paused-outer-scope`, story `PausedOuterScope`: given `children: "A dialog body with a Menu open inside it"`, `active: false`; The outer scope of a nested pair, inactive while a Menu inside owns Tab.

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Platform notes (swiftui)

```yaml
element: VStack
props:
- '@FocusState'
- '@AccessibilityFocusState'
- .focusSection
- .focusScope
- .onExitCommand
- .accessibilityAddTraits=isModal
notes: 'The engine in `Support/FocusScope.swift`: `.focusSection()` bounds Tab/Shift+Tab
  on iPad keyboards inside the scope (`trap`), `@AccessibilityFocusState` moves VoiceOver
  focus to `autoFocus`''s target on appear and back to `returnFocusTo` (or the element
  that opened the scope) on disappear, and `.accessibilityAddTraits(.isModal)` tells
  VoiceOver to ignore siblings while a modal scope is up. Escape reaches the scope
  through `.onExitCommand`; `onEscapeAttempt` fires when the scope is asked to close
  and the owner decides. Wrapping is done by tracking the first/last focusable identifiers
  the children register through a preference.'
```

## Guidance

## Overview

FocusScope is the smallest possible answer to the hardest accessibility bug: focus that escapes a modal, or never comes back from one. It has no appearance and no opinion about what is inside it. It moves focus in, keeps Tab inside, and puts focus back — and because it exists once, every overlay that composes it gets those three behaviors right by construction rather than by re-implementation.

## When to use

Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it in their composition, and that is where it should live. Render it yourself only when building a new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay), with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal panel that should still move focus in and restore it on close (a slide-in filter drawer that keeps the page usable).

## When not to use

Do not trap focus in anything that is not modal: a sidebar, a form section, a sticky toolbar. A user who cannot Tab past your panel to the rest of the page is trapped in the WCAG sense, which is a failure, not a feature. Do not use it to make a composite (a menu, a tab list); those use a roving tabindex and let Tab leave. Do not nest it inside a native `<dialog>` that already does the same work unless you are the Dialog component — one scope per modal.

## Behavior

On mount, the scope records `document.activeElement` (the opener), collects its focusable descendants, and focuses per `autoFocus`. While `trapped` and `active`, Tab from the last descendant wraps to the first and Shift+Tab from the first wraps to the last, firing `onEscapeAttempt` first; focus arriving outside the scope from any cause is returned to the last focused descendant. When a nested scope mounts, the outer one becomes inactive until the inner unmounts. On unmount with `restoreFocus`, the opener is focused if it is still in the document; otherwise the next focusable element after its former position. The scope never handles Escape and never makes anything inert — the overlay owns both.

## Content guidelines

None; the scope renders nothing visible.

## Accessibility

A modal must keep keyboard focus within it while open and must provide a way out (WCAG 2.1.2 No Keyboard Trap: Escape, provided by the composing overlay, and the overlay's close controls); FocusScope implements the confinement half and the overlay the exit. Focus moves into the overlay on open and returns on close so sequential navigation remains meaningful (2.4.3 Focus Order). Focus is never left on `body` or on an element that has been removed. The scope adds no role and no name; assistive technology never perceives it. The `Keyboard` story and the keyboard gate verify the wrap in both directions.

## Platform notes

### Web
Render `<div data-focus-scope tabindex={autoFocus === 'container' ? -1 : undefined}>` with two visually hidden sentinels (`<span tabindex="0" data-focus-sentinel>`) at the start and end; a sentinel receiving focus redirects to the opposite edge, which handles focus arriving from browser chrome. Keydown handler for Tab/Shift+Tab at the edges. `document.addEventListener('focusin')` while active and trapped, pulling focus back if `!scope.contains(deepActiveElement)`. The focusable walker descends open shadow roots and includes slot-assigned nodes, and skips `[inert]`, `[aria-hidden="true"]` subtrees, `disabled` and `tabindex="-1"` (except the container). Module-level scope stack for nesting.

### Lit
`<ds-focus-scope trapped>`; the host is a block wrapper with a default slot; walker uses `assignedElements({ flatten: true })` plus shadow-root descent. Sentinels live in the shadow root. Composed `escape-attempt`. `active` is reflected so the outer scope of a nested pair can be styled if needed (it usually is not).

### React Native
A `View` with `accessibilityViewIsModal={trapped}`; on mount, `setAccessibilityFocus` on the first accessible descendant found by walking refs (or the wrapper when `autoFocus: container`); on unmount, `setAccessibilityFocus` on the stored opener handle. No Tab handling; `onEscapeAttempt` never fires on native.

## Related

Dialog, AlertDialog, BottomSheet, ActionSheet, Menu.

## Behavior scenarios (6)

One test per scenario, in this order.

```yaml
- name: the-scope-adds-no-role
  description: The scope adds no role and no name; assistive technology never perceives
    it.
  then:
  - attribute: role
    is: null
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-auto-focus-first
  given:
    autoFocus: first
  then:
  - renders: true
  derived: true
- name: renders-auto-focus-last
  given:
    autoFocus: last
  then:
  - renders: true
  derived: true
- name: renders-auto-focus-container
  given:
    autoFocus: container
  then:
  - renders: true
  derived: true
- name: renders-auto-focus-none
  given:
    autoFocus: none
  then:
  - renders: true
  derived: true
```
