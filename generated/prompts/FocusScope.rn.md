# Generate: FocusScope for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/FocusScope.tsx` exporting a typed React Native function component named `FocusScope`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `FocusScopeProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof FocusScope> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `FocusScope.test.tsx`.

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
      description: 'Explicit element to restore focus to instead of the recorded opener.
        Required on native when the opener is not a TextInput (React Native exposes
        no generic "currently focused element"), so every overlay passes its trigger
        ref. The shape names the platforms together; each types it with its own instance:
        `RefObject<HTMLElement | null>` on web, `HTMLElement | Ref<HTMLElement>` (lit/directives/ref.js)
        as a non-attribute property on Lit, `RefObject<ViewInstance | null>` on React
        Native.'
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
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Shift+Tab
    action: From the first focusable descendant, wraps to the last.
    from: first
    expect: focus-wraps-to-last
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Tab
    action: Ordinary forward movement inside the scope; native focus order, no handler.
    from: first
    expect: focus-next
    platforms:
    - web
    - lit
    - rn
    - swiftui
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
        excluded, as are elements with tabindex=-1 except the container itself. "Disabled"
        means elements matching `:disabled` (which already covers form controls inside
        a `fieldset[disabled]` outside its first legend, while links and tabindex
        elements there stay in, as the browser keeps them focusable), plus `inert`
        subtrees; `aria-disabled` elements stay in, because the system keeps them
        focusable. The wrapper carries tabindex=-1 only while `autoFocus` is `container`;
        otherwise it has no tabindex. Keydown on Tab at the edges calls preventDefault
        and focuses the other edge. A focusin listener on document pulls focus back
        to the last focused descendant if it leaves while trapped and active; if that
        descendant is gone, to the first focusable descendant, then to the wrapper
        when `autoFocus` is `container`. Elements are not tested for visibility: one
        hidden by CSS but neither aria-hidden nor inert still counts as focusable,
        which keeps the walker cheap and matches what the browser does with tabindex.
        Two sentinel elements (tabindex=0, visually hidden, data-focus-sentinel so
        the keyboard gate ignores them) at each end catch focus arriving from the
        browser chrome; each continues the direction of travel rather than wrapping
        — the start sentinel sends focus to the first descendant, the end sentinel
        to the last, since wrapping is the Tab handler''s job at the real edges. The
        sentinels carry tabindex=0 only while the scope is trapped, active and top
        of the stack, and tabindex=-1 otherwise, so an untrapped or paused scope adds
        no tab stops; the Tab handler and the focusin pull-back likewise do nothing
        unless the scope is trapped, active and on top. With nothing to pull focus
        back to (no focusable descendant and `autoFocus` not `container`), focus is
        left where it went and the development warning below covers it. Restoring
        to "the next focusable element" when the opener is gone needs the opener''s
        old position, so the scope leaves an invisible marker node beside it on mount
        and restores to the first focusable element after that marker; if the marker
        was removed with the opener''s parent, it restores to the first focusable
        element after the nearest of the opener''s recorded ancestors still in the
        document. Nested scopes register in a module-level stack and only the top
        is effective; `active: false` additionally pauses a scope wherever it sits
        in that stack. Stack order follows tree nesting first, then activation order:
        a scope always sits above every stacked scope that contains it and below every
        stacked scope it contains, so an outer scope mounted in the same commit as
        its inner one registers below it (the parent link travels through context),
        and a scope whose `active` turns back on moves above every scope that is not
        its descendant but stays below its own active descendants. Only active scopes
        count when picking the top. The wrapper is `display: block`, not `display:
        contents`, because `autoFocus: container` needs a real box to carry tabindex
        — so the scope always adds one element to the layout. A trapped scope with
        no focusable descendants warns in development, since that is an inescapable
        trap — including under `autoFocus: container`, where focus can rest on the
        wrapper but Tab still has nowhere to go.'
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
        invisible anchor rendered first in the shadow root, which carries tabindex=-1
        only while `autoFocus` is `container` (as the web wrapper does): focus lands
        there, nothing interactive is announced, and the host stays out of the tab
        order. This is a stated exception to the rule that focusable Lit components
        use `delegatesFocus`: the host does not use it, so `host.focus()` does nothing.
        That anchor also carries `part` and `data-part="scope"`, since the host itself
        is outside the shadow root the test locator searches. `restoreFocus` is the
        non-reflected negated attribute `no-restore-focus`; `autoFocus` is the attribute
        `auto-focus`. Composing overlays set `trapped`, `active` and `restoreFocus`
        as properties (`.active=${open}`), never as boolean attributes, which cannot
        turn off a true default. Because slotted system children render their focusable
        internals after the scope''s first update, `autoFocus` (and the empty-scope
        warning) waits for the `updateComplete` of the slotted elements and of every
        custom element in their light-DOM subtrees (not elements inside those elements''
        own shadow roots), and the scope''s own `updateComplete` includes that wait.
        There is no context on Lit, so the stack''s containment test walks the composed
        tree (parentNode, then a shadow root''s host) from the mounting scope. `active`
        reflects as the negated `no-active`, so a paused scope is styled with `[no-active]`.'
    rn:
      element: View
      props:
      - accessibilityViewIsModal
      notes: 'There is no Tab order to confine on native. `trapped && active` maps
        to accessibilityViewIsModal on the wrapper View (VoiceOver/TalkBack ignore
        siblings), so a paused outer scope does not hide a nested Menu from the screen
        reader. There is no way to walk arbitrary children for a focusable descendant,
        so `first`, `last` and `container` all call AccessibilityInfo.setAccessibilityFocus
        on the wrapper View (collapsable={false}, and not `accessible`, which would
        merge the children) and only `none` differs — the screen reader then reads
        the scope from its top, which is the intended result for all three. iOS VoiceOver
        may ignore focus on a non-accessible View; that is a platform limit, and accessibilityViewIsModal,
        which moves VoiceOver into the modal content when it appears, is the accessibility
        alternative. restoreFocus can only capture an opener that is a TextInput (TextInput.State.currentlyFocusedInput
        is the one "what is focused" native exposes), captured during the first render,
        before children mount (a child TextInput with autoFocus would otherwise be
        recorded as the opener), which is why `returnFocusTo` is required here for
        every other kind of trigger; it points at the trigger''s ref, or at a `View
        collapsable={false}` wrapping the trigger when the trigger takes no ref. There
        is no document order on native, so when the opener is gone nothing is restored.
        On react-native-web the wrapper omits accessibilityViewIsModal (it would render
        aria-modal on a role-less div; the composing overlay''s own dialog carries
        aria-modal). The `scope` part is the root and carries the bare testID "FocusScope".
        onEscapeAttempt never fires on this platform: nothing can attempt to leave
        a Tab order that does not exist. Hardware-keyboard Tab wrapping is not implemented;
        that is a platform limit, so the two wrap keyboard rules exclude rn (on react-native-web
        Tab is not confined either), and screen-reader users are kept inside by accessibilityViewIsModal
        instead. Neither `role` nor `accessibilityRole` nor `accessibilityLabel` is
        set on the wrapper.'
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

## Keyboard

- `Tab` (Ordinary forward movement inside the scope; native focus order, no handler.): expect focus-next
- 2 rule(s) in the schema do not apply on rn; implement none of them

## Constants and examples

- example `modal-takeover`, story `ModalTakeover`: given `children: "A full-screen onboarding overlay with its own close Button"`, `trapped: true`, `autoFocus: "first"`; A new modal surface the system does not have yet, trapped with an Escape handler of its own.
- example `non-modal-drawer`, story `NonModalDrawer`: given `children: "A slide-in filter drawer"`, `trapped: false`, `autoFocus: "first"`; A panel that moves focus in and restores it on close while leaving the page usable.
- example `reading-first`, story `ReadingFirst`: given `children: "A long terms-of-service body with Accept and Decline Buttons"`, `autoFocus: "container"`; A dialog whose text should be read from the top, so focus lands on the container rather than a control.
- example `paused-outer-scope`, story `PausedOuterScope`: given `children: "A dialog body with a Menu open inside it"`, `active: false`; The outer scope of a nested pair, inactive while a Menu inside owns Tab.

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (6)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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

## Platform notes (rn)

```yaml
element: View
props:
- accessibilityViewIsModal
notes: "There is no Tab order to confine on native. `trapped && active` maps to accessibilityViewIsModal\
  \ on the wrapper View (VoiceOver/TalkBack ignore siblings), so a paused outer scope\
  \ does not hide a nested Menu from the screen reader. There is no way to walk arbitrary\
  \ children for a focusable descendant, so `first`, `last` and `container` all call\
  \ AccessibilityInfo.setAccessibilityFocus on the wrapper View (collapsable={false},\
  \ and not `accessible`, which would merge the children) and only `none` differs\
  \ \u2014 the screen reader then reads the scope from its top, which is the intended\
  \ result for all three. iOS VoiceOver may ignore focus on a non-accessible View;\
  \ that is a platform limit, and accessibilityViewIsModal, which moves VoiceOver\
  \ into the modal content when it appears, is the accessibility alternative. restoreFocus\
  \ can only capture an opener that is a TextInput (TextInput.State.currentlyFocusedInput\
  \ is the one \"what is focused\" native exposes), captured during the first render,\
  \ before children mount (a child TextInput with autoFocus would otherwise be recorded\
  \ as the opener), which is why `returnFocusTo` is required here for every other\
  \ kind of trigger; it points at the trigger's ref, or at a `View collapsable={false}`\
  \ wrapping the trigger when the trigger takes no ref. There is no document order\
  \ on native, so when the opener is gone nothing is restored. On react-native-web\
  \ the wrapper omits accessibilityViewIsModal (it would render aria-modal on a role-less\
  \ div; the composing overlay's own dialog carries aria-modal). The `scope` part\
  \ is the root and carries the bare testID \"FocusScope\". onEscapeAttempt never\
  \ fires on this platform: nothing can attempt to leave a Tab order that does not\
  \ exist. Hardware-keyboard Tab wrapping is not implemented; that is a platform limit,\
  \ so the two wrap keyboard rules exclude rn (on react-native-web Tab is not confined\
  \ either), and screen-reader users are kept inside by accessibilityViewIsModal instead.\
  \ Neither `role` nor `accessibilityRole` nor `accessibilityLabel` is set on the\
  \ wrapper."
```

## Guidance

## Overview

FocusScope is the smallest possible answer to the hardest accessibility bug: focus that escapes a modal, or never comes back from one. It has no appearance and no opinion about what is inside it. It moves focus in, keeps Tab inside, and puts focus back — and because it exists once, every overlay that composes it gets those three behaviors right by construction rather than by re-implementation.

## When to use

Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it in their composition, and that is where it should live. Render it yourself only when building a new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay), with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal panel that should still move focus in and restore it on close (a slide-in filter drawer that keeps the page usable).

## When not to use

Do not trap focus in anything that is not modal: a sidebar, a form section, a sticky toolbar. A user who cannot Tab past your panel to the rest of the page is trapped in the WCAG sense, which is a failure, not a feature. Do not use it to make a composite (a menu, a tab list); those use a roving tabindex and let Tab leave. Do not nest it inside a native `<dialog>` that already does the same work unless you are the Dialog component — one scope per modal.

## Behavior

On mount, the scope records `document.activeElement` (the opener), collects its focusable descendants, and focuses per `autoFocus`. While `trapped` and `active`, Tab from the last descendant wraps to the first and Shift+Tab from the first wraps to the last, firing `onEscapeAttempt` first; focus arriving outside the scope from any cause is returned to the last focused descendant. When a nested scope mounts, the outer one becomes inactive until the inner unmounts. On unmount with `restoreFocus`, the opener is focused if it is still in the document; otherwise the next focusable element after its former position. The scope never handles Escape and never makes anything inert — the overlay owns both. `autoFocus` runs once on mount and restore once on unmount; later changes to `active`, `trapped` or `autoFocus` do not re-run either. With `autoFocus: container`, while the scope is trapped, active and on top, Tab from the wrapper goes to the first descendant and fires nothing, and Shift+Tab from it wraps to the last, firing `onEscapeAttempt` with `backward`; an untrapped or paused scope leaves both to the browser. The wrapper is the root, carries the `scope` part, and is exposed through `ref`; FocusScope's own `data-part="scope"` wins, and a composing overlay puts its own part on an element it owns. The Default story is a trapped scope around a Text ("Confirm your changes") and two Buttons, "Cancel" and "Continue", passed as `children` in its args. The Keyboard story uses three Buttons, "First", "Second" and "Third". Example `children` are descriptions: their stories render the description as Text followed by Buttons for the controls it names — "Close" (modal-takeover), "Apply filters" (non-modal-drawer), "Accept" and "Decline" (reading-first), "Options" (paused-outer-scope).

## Content guidelines

None; the scope renders nothing visible.

## Accessibility

A modal must keep keyboard focus within it while open and must provide a way out (WCAG 2.1.2 No Keyboard Trap: Escape, provided by the composing overlay, and the overlay's close controls); FocusScope implements the confinement half and the overlay the exit. Focus moves into the overlay on open and returns on close so sequential navigation remains meaningful (2.4.3 Focus Order). Focus is never left on `body` or on an element that has been removed. The scope adds no role and no name; assistive technology never perceives it. The `Keyboard` story and the keyboard gate verify the wrap in both directions.

## Platform notes

### Web
Render `<div data-focus-scope tabindex={autoFocus === 'container' ? -1 : undefined}>` with two visually hidden sentinels (`<span tabindex="0" data-focus-sentinel>`) at the start and end; a sentinel receiving focus continues the direction of travel (start sentinel → first descendant, end sentinel → last), which handles focus arriving from browser chrome. Keydown handler for Tab/Shift+Tab at the edges. `document.addEventListener('focusin')` while active and trapped, pulling focus back if `!scope.contains(deepActiveElement)`. The focusable walker descends open shadow roots and includes slot-assigned nodes, and skips `[inert]`, `[aria-hidden="true"]` subtrees, `disabled` and `tabindex="-1"` (except the container). Module-level scope stack for nesting.

### Lit
`<ds-focus-scope trapped>`; the host is a block wrapper with a default slot; walker uses `assignedElements({ flatten: true })` plus shadow-root descent. Sentinels live in the shadow root. Composed `escape-attempt`. `active` is reflected as `no-active`, so the outer scope of a nested pair can be styled with `[no-active]` if needed (it usually is not).

### React Native
A `View` with `accessibilityViewIsModal={trapped}`; on mount, `setAccessibilityFocus` on the wrapper for `first`, `last` and `container` alike (children cannot be walked); on unmount, `setAccessibilityFocus` on `returnFocusTo` or the stored TextInput opener. No Tab handling; `onEscapeAttempt` never fires on native.

## Related

Dialog, AlertDialog, BottomSheet, ActionSheet, Menu.
