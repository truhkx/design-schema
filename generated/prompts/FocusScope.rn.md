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
      notes: A <div data-focus-scope> wrapper. Focusable descendants are collected
        in DOM order including across open shadow roots and assigned slot nodes (the
        same walker the keyboard gate uses); disabled and aria-hidden subtrees are
        excluded, as are elements with tabindex=-1 except the container itself. Keydown
        on Tab at the edges calls preventDefault and focuses the other edge. A focusin
        listener on document pulls focus back to the last focused descendant if it
        leaves while trapped and active. Two sentinel elements (tabindex=0, visually
        hidden, data-focus-sentinel so the keyboard gate ignores them) at each end
        catch focus arriving from the browser chrome. Nested scopes register in a
        module-level stack; only the top is active.
    lit:
      tag: ds-focus-scope
      reflect:
      - trapped
      - active
      notes: 'The host is the wrapper (display: contents is NOT used — it breaks focus
        delegation; the host is display: block). Same walker; slotted light-DOM children
        are included via assignedElements({ flatten: true }). `escape-attempt` is
        a composed CustomEvent.'
    rn:
      element: View
      props:
      - accessibilityViewIsModal
      notes: There is no Tab order to confine on native. trapped maps to accessibilityViewIsModal
        on the wrapper View (VoiceOver/TalkBack ignore siblings); autoFocus calls
        AccessibilityInfo.setAccessibilityFocus on the first accessible descendant
        (or the wrapper) after mount; restoreFocus stores the opener's node handle
        and refocuses it on unmount. Hardware-keyboard Tab wrapping is not implemented;
        that is a platform limit.
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
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (5)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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
notes: There is no Tab order to confine on native. trapped maps to accessibilityViewIsModal
  on the wrapper View (VoiceOver/TalkBack ignore siblings); autoFocus calls AccessibilityInfo.setAccessibilityFocus
  on the first accessible descendant (or the wrapper) after mount; restoreFocus stores
  the opener's node handle and refocuses it on unmount. Hardware-keyboard Tab wrapping
  is not implemented; that is a platform limit.
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
