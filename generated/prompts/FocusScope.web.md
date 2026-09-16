# Generate: FocusScope for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/FocusScope.tsx` exporting a typed React function component named `FocusScope`, plus `FocusScope.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function FocusScope({ ref, …rest }: FocusScopeProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof FocusScope> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `FocusScope.test.tsx`.
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
        excluded, as are elements with tabindex=-1 except the container itself. "Disabled"
        means native `:disabled` controls and everything inside a `fieldset[disabled]`,
        plus `inert` subtrees; `aria-disabled` elements stay in, because the system
        keeps them focusable. The wrapper carries tabindex=-1 only while `autoFocus`
        is `container`; otherwise it has no tabindex. Keydown on Tab at the edges
        calls preventDefault and focuses the other edge. A focusin listener on document
        pulls focus back to the last focused descendant if it leaves while trapped
        and active. Elements are not tested for visibility: one hidden by CSS but
        neither aria-hidden nor inert still counts as focusable, which keeps the walker
        cheap and matches what the browser does with tabindex. Two sentinel elements
        (tabindex=0, visually hidden, data-focus-sentinel so the keyboard gate ignores
        them) at each end catch focus arriving from the browser chrome; each continues
        the direction of travel rather than wrapping — the start sentinel sends focus
        to the first descendant, the end sentinel to the last, since wrapping is the
        Tab handler''s job at the real edges. The sentinels carry tabindex=0 only
        while the scope is trapped, active and top of the stack, and tabindex=-1 otherwise,
        so an untrapped or paused scope adds no tab stops; the Tab handler and the
        focusin pull-back likewise do nothing unless the scope is trapped, active
        and on top. With nothing to pull focus back to (no focusable descendant and
        `autoFocus` not `container`), focus is left where it went and the development
        warning below covers it. Restoring to "the next focusable element" when the
        opener is gone needs the opener''s old position, so the scope leaves an invisible
        marker node beside it on mount and restores to the first focusable element
        after that marker. Nested scopes register in a module-level stack and only
        the top is effective; `active: false` additionally pauses a scope wherever
        it sits in that stack. Stack order follows tree nesting, not effect order:
        an outer scope mounted in the same commit as its inner one registers below
        it (the parent link travels through context). Only active scopes count when
        picking the top, and a scope whose `active` turns back on moves to the top.
        The wrapper is `display: block`, not `display: contents`, because `autoFocus:
        container` needs a real box to carry tabindex — so the scope always adds one
        element to the layout. A trapped scope with no focusable descendants warns
        in development, since that is an inescapable trap.'
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
        order. This is a stated exception to the rule that focusable Lit components
        use `delegatesFocus`: the host does not use it, so `host.focus()` does nothing.
        That anchor also carries `part` and `data-part="scope"`, since the host itself
        is outside the shadow root the test locator searches. `restoreFocus` is the
        non-reflected negated attribute `no-restore-focus`; `autoFocus` is the attribute
        `auto-focus`. Composing overlays set `trapped`, `active` and `restoreFocus`
        as properties (`.active=${open}`), never as boolean attributes, which cannot
        turn off a true default. Because slotted system children render their focusable
        internals after the scope''s first update, `autoFocus` (and the empty-scope
        warning) waits for the slotted elements'' `updateComplete`, and the scope''s
        own `updateComplete` includes that wait.'
    rn:
      element: View
      props:
      - accessibilityViewIsModal
      notes: 'There is no Tab order to confine on native. `trapped && active` maps
        to accessibilityViewIsModal on the wrapper View (VoiceOver/TalkBack ignore
        siblings), so a paused outer scope does not hide a nested Menu from the screen
        reader. There is no way to walk arbitrary children for a focusable descendant,
        so `first`, `last` and `container` all call AccessibilityInfo.setAccessibilityFocus
        on the wrapper View and only `none` differs — the screen reader then reads
        the scope from its top, which is the intended result for all three. restoreFocus
        can only capture an opener that is a TextInput (TextInput.State.currentlyFocusedInput
        is the one "what is focused" native exposes), which is why `returnFocusTo`
        is required here for every other kind of trigger. onEscapeAttempt never fires
        on this platform: nothing can attempt to leave a Tab order that does not exist.
        Hardware-keyboard Tab wrapping is not implemented; that is a platform limit,
        so the two wrap keyboard rules exclude rn (on react-native-web Tab is not
        confined either), and screen-reader users are kept inside by accessibilityViewIsModal
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

- `Tab` (From the last focusable descendant, wraps to the first.): expect focus-wraps-to-first
- `Shift+Tab` (From the first focusable descendant, wraps to the last.): expect focus-wraps-to-last

## Constants and examples

- example `modal-takeover`, story `ModalTakeover`: given `children: "A full-screen onboarding overlay with its own close Button"`, `trapped: true`, `autoFocus: "first"`; A new modal surface the system does not have yet, trapped with an Escape handler of its own.
- example `non-modal-drawer`, story `NonModalDrawer`: given `children: "A slide-in filter drawer"`, `trapped: false`, `autoFocus: "first"`; A panel that moves focus in and restores it on close while leaving the page usable.
- example `reading-first`, story `ReadingFirst`: given `children: "A long terms-of-service body with Accept and Decline Buttons"`, `autoFocus: "container"`; A dialog whose text should be read from the top, so focus lands on the container rather than a control.
- example `paused-outer-scope`, story `PausedOuterScope`: given `children: "A dialog body with a Menu open inside it"`, `active: false`; The outer scope of a nested pair, inactive while a Menu inside owns Tab.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: none
Locked (accessibility-bearing, never overridable): none

## Behavior scenarios (9)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: auto-focus-container-focuses-the-wrapper
  description: autoFocus container makes the wrapper focusable with tabindex -1 and
    puts focus on it, for reading-first dialogs.
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
  description: The scope renders no element of its own beyond a wrapper that is not
    focusable, unless autoFocus is container.
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

## Platform notes (web)

```yaml
element: div
attributes:
- tabindex=-1
- data-focus-scope
notes: "A <div data-focus-scope> wrapper. Focusable descendants are collected in DOM\
  \ order including across open shadow roots and assigned slot nodes (the same walker\
  \ the keyboard gate uses); disabled and aria-hidden subtrees are excluded, as are\
  \ elements with tabindex=-1 except the container itself. \"Disabled\" means native\
  \ `:disabled` controls and everything inside a `fieldset[disabled]`, plus `inert`\
  \ subtrees; `aria-disabled` elements stay in, because the system keeps them focusable.\
  \ The wrapper carries tabindex=-1 only while `autoFocus` is `container`; otherwise\
  \ it has no tabindex. Keydown on Tab at the edges calls preventDefault and focuses\
  \ the other edge. A focusin listener on document pulls focus back to the last focused\
  \ descendant if it leaves while trapped and active. Elements are not tested for\
  \ visibility: one hidden by CSS but neither aria-hidden nor inert still counts as\
  \ focusable, which keeps the walker cheap and matches what the browser does with\
  \ tabindex. Two sentinel elements (tabindex=0, visually hidden, data-focus-sentinel\
  \ so the keyboard gate ignores them) at each end catch focus arriving from the browser\
  \ chrome; each continues the direction of travel rather than wrapping \u2014 the\
  \ start sentinel sends focus to the first descendant, the end sentinel to the last,\
  \ since wrapping is the Tab handler's job at the real edges. The sentinels carry\
  \ tabindex=0 only while the scope is trapped, active and top of the stack, and tabindex=-1\
  \ otherwise, so an untrapped or paused scope adds no tab stops; the Tab handler\
  \ and the focusin pull-back likewise do nothing unless the scope is trapped, active\
  \ and on top. With nothing to pull focus back to (no focusable descendant and `autoFocus`\
  \ not `container`), focus is left where it went and the development warning below\
  \ covers it. Restoring to \"the next focusable element\" when the opener is gone\
  \ needs the opener's old position, so the scope leaves an invisible marker node\
  \ beside it on mount and restores to the first focusable element after that marker.\
  \ Nested scopes register in a module-level stack and only the top is effective;\
  \ `active: false` additionally pauses a scope wherever it sits in that stack. Stack\
  \ order follows tree nesting, not effect order: an outer scope mounted in the same\
  \ commit as its inner one registers below it (the parent link travels through context).\
  \ Only active scopes count when picking the top, and a scope whose `active` turns\
  \ back on moves to the top. The wrapper is `display: block`, not `display: contents`,\
  \ because `autoFocus: container` needs a real box to carry tabindex \u2014 so the\
  \ scope always adds one element to the layout. A trapped scope with no focusable\
  \ descendants warns in development, since that is an inescapable trap."
```

## Guidance

## Overview

FocusScope is the smallest possible answer to the hardest accessibility bug: focus that escapes a modal, or never comes back from one. It has no appearance and no opinion about what is inside it. It moves focus in, keeps Tab inside, and puts focus back — and because it exists once, every overlay that composes it gets those three behaviors right by construction rather than by re-implementation.

## When to use

Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it in their composition, and that is where it should live. Render it yourself only when building a new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay), with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal panel that should still move focus in and restore it on close (a slide-in filter drawer that keeps the page usable).

## When not to use

Do not trap focus in anything that is not modal: a sidebar, a form section, a sticky toolbar. A user who cannot Tab past your panel to the rest of the page is trapped in the WCAG sense, which is a failure, not a feature. Do not use it to make a composite (a menu, a tab list); those use a roving tabindex and let Tab leave. Do not nest it inside a native `<dialog>` that already does the same work unless you are the Dialog component — one scope per modal.

## Behavior

On mount, the scope records `document.activeElement` (the opener), collects its focusable descendants, and focuses per `autoFocus`. While `trapped` and `active`, Tab from the last descendant wraps to the first and Shift+Tab from the first wraps to the last, firing `onEscapeAttempt` first; focus arriving outside the scope from any cause is returned to the last focused descendant. When a nested scope mounts, the outer one becomes inactive until the inner unmounts. On unmount with `restoreFocus`, the opener is focused if it is still in the document; otherwise the next focusable element after its former position. The scope never handles Escape and never makes anything inert — the overlay owns both. `autoFocus` runs once on mount and restore once on unmount; later changes to `active`, `trapped` or `autoFocus` do not re-run either. With `autoFocus: container`, Tab from the wrapper goes to the first descendant and Shift+Tab from it wraps to the last, firing `onEscapeAttempt` with `backward`. The wrapper is the root, carries the `scope` part, and is exposed through `ref`; FocusScope's own `data-part="scope"` wins, and a composing overlay puts its own part on an element it owns. The Default story is a trapped scope around a Text ("Confirm your changes") and two Buttons, "Cancel" and "Continue".

## Content guidelines

None; the scope renders nothing visible.

## Accessibility

A modal must keep keyboard focus within it while open and must provide a way out (WCAG 2.1.2 No Keyboard Trap: Escape, provided by the composing overlay, and the overlay's close controls); FocusScope implements the confinement half and the overlay the exit. Focus moves into the overlay on open and returns on close so sequential navigation remains meaningful (2.4.3 Focus Order). Focus is never left on `body` or on an element that has been removed. The scope adds no role and no name; assistive technology never perceives it. The `Keyboard` story and the keyboard gate verify the wrap in both directions.

## Platform notes

### Web
Render `<div data-focus-scope tabindex={autoFocus === 'container' ? -1 : undefined}>` with two visually hidden sentinels (`<span tabindex="0" data-focus-sentinel>`) at the start and end; a sentinel receiving focus continues the direction of travel (start sentinel → first descendant, end sentinel → last), which handles focus arriving from browser chrome. Keydown handler for Tab/Shift+Tab at the edges. `document.addEventListener('focusin')` while active and trapped, pulling focus back if `!scope.contains(deepActiveElement)`. The focusable walker descends open shadow roots and includes slot-assigned nodes, and skips `[inert]`, `[aria-hidden="true"]` subtrees, `disabled` and `tabindex="-1"` (except the container). Module-level scope stack for nesting.

### Lit
`<ds-focus-scope trapped>`; the host is a block wrapper with a default slot; walker uses `assignedElements({ flatten: true })` plus shadow-root descent. Sentinels live in the shadow root. Composed `escape-attempt`. `active` is reflected so the outer scope of a nested pair can be styled if needed (it usually is not).

### React Native
A `View` with `accessibilityViewIsModal={trapped}`; on mount, `setAccessibilityFocus` on the wrapper for `first`, `last` and `container` alike (children cannot be walked); on unmount, `setAccessibilityFocus` on `returnFocusTo` or the stored TextInput opener. No Tab handling; `onEscapeAttempt` never fires on native.

## Related

Dialog, AlertDialog, BottomSheet, ActionSheet, Menu.
