# Generate: Dialog for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Dialog.tsx` exporting a typed React function component named `Dialog`, plus `Dialog.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Dialog({ ref, …rest }: DialogProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Dialog> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Dialog.test.tsx`.
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
    footer:
      component: Stack
      forwards:
        footerGap: gap
  props:
    open:
      type: boolean
      required: true
      description: Controlled visibility. The consumer owns it; the dialog requests
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
          this same handler, or on Lit a slotted form submitted with method="dialog".
          Dialog never raises it on its own; the three dismiss affordances have their
          own reasons.
      fires:
      - user
      timing:
        phase: request
    onOpened:
      description: Fired after the open transition ends and focus has moved in. Use
        to start work that needs the dialog visible.
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
      description: Padding of header, body and footer.
      locked: false
    partGap:
      token: layout.gap.loose
      description: Gap between header, body and footer.
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Between title/description and the close button.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: Between footer actions; forwarded to the footer Stack as `overrides.gap`.
        The footer row is end-aligned (Form's action-row rule), unlike Card's start-aligned
        footer.
      locked: false
    descriptionGap:
      token: layout.gap.tight
      part: description
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
        Escape (cancel event → onClose reason escape, preventDefault when not dismissible),
        and background inertness for free. Rendered through a portal into document.body.
        ::backdrop is the scrim; a click on the dialog element outside its surface
        (event.target === dialog) is the scrim click. Focus trap: showModal() traps
        by inertness; Tab wrap is implemented explicitly because the browser lets
        Tab leave to the URL bar. Body scroll locked with overflow: hidden on <html>
        while open, compensating for scrollbar width via scrollbar-gutter. Focus restore
        to document.activeElement at open time. `container?: HTMLElement` (default
        document.body) is the portal target — a platform prop every portaled overlay
        accepts, not a schema prop. FocusScope has no autoFocus value for `title`
        or `close`, so Dialog sets it to `none` and places initial focus itself while
        FocusScope keeps ownership of capturing and restoring the opener. `initialFocus:
        close` on a non-dismissible dialog has no close button to land on and falls
        back to the first focusable in the body, then the heading. The heading takes
        `tabindex="-1"` for `initialFocus: title` and keeps it when `hideHeading`
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
        as in AlertDialog.'
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
        native meaning and is not implemented. `accessibilityViewIsModal` goes on
        the surface View, not on Modal, which does not accept it. testIDs are the
        root plus scrim, header, body and footer; heading, description, closeButton
        and focusScope are reached through their own roles and names and take none,
        as in AlertDialog. Native has no descendant walker, so `initialFocus` calls
        setAccessibilityFocus on the View wrapping the title, the close button or
        the body, not on a literal first focusable descendant, and there is no visible
        focus ring on those targets.'
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
      footer: Cancel and Rename Buttons
  - name: invite-people
    description: A small form in the narrow size, where the footer restates the task.
    given:
      open: true
      heading: Invite people
      children: An email Input and a role Select
      footer: Cancel and Send invites Buttons
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
  - reasons: `escape` (Escape pressed while open); `close-button` (the close button was activated); `scrim` (the scrim was clicked); `action` (something inside the dialog asked to close — a footer action reusing this same handler, or on Lit a slotted form submitted with method="dialog". Dialog never raises it on its own; the three dismiss affordances have their own reasons.)
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
- `heading`: component `Heading`
- `description`: component `Text`
- `body`: component `Box`
- `footer`: component `Stack`; forwards `footerGap` → `overrides.gap`
- `closeButton`: component `Button`

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `descriptionGap`: token `layout.gap.tight`; part `description`

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

- example `rename-project`, story `RenameProject`: given `open: true`, `heading: "Rename project"`, `children: "A labelled text Input holding the current name"`, `footer: "Cancel and Rename Buttons"`; The short single-field task a dialog is for, with the completing action named after it.
- example `invite-people`, story `InvitePeople`: given `open: true`, `heading: "Invite people"`, `children: "An email Input and a role Select"`, `footer: "Cancel and Send invites Buttons"`, `size: "sm"`; A small form in the narrow size, where the footer restates the task.
- example `must-be-answered`, story `MustBeAnswered`: given `open: true`, `heading: "Choose a plan"`, `description: "You need a plan before you can invite anyone."`, `children: "A RadioGroup of plans"`, `footer: "Continue Button"`, `dismissible: false`; A dialog with no way out but its own actions; Escape still reports so the consumer can decide.
- example `reading-dialog`, story `ReadingDialog`: given `open: true`, `heading: "Terms of service"`, `children: "Several paragraphs of Text"`, `size: "lg"`, `initialFocus: "title"`; A long reading dialog that starts focus on the title so the text is read from the top.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `headerGap`, `footerGap`, `descriptionGap`, `widthSm`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Behavior scenarios (15)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
- name: non-dismissible-still-reports-escape
  description: Escape requests close with reason escape even when not dismissible
    (keyboard rule 1), because trapping a keyboard user with no way out is never acceptable.
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
- name: initial-focus-lands-on-the-close-button
  description: initialFocus close puts focus on the close button rather than the first
    body control.
  given:
    open: true
    initialFocus: close
  then:
  - focused: closeButton
  platforms:
  - web
  - lit
- name: hidden-heading-is-still-the-accessible-name
  description: hideHeading removes the title from view, not from the accessible name.
  given:
    open: true
    hideHeading: true
  then:
  - name: true
- name: closed-dialog-renders-nothing
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

## Platform notes (web)

```yaml
element: dialog
attributes:
- aria-modal
- aria-labelledby
- aria-describedby
notes: "A native <dialog> opened with showModal(), which gives the top layer, Escape\
  \ (cancel event \u2192 onClose reason escape, preventDefault when not dismissible),\
  \ and background inertness for free. Rendered through a portal into document.body.\
  \ ::backdrop is the scrim; a click on the dialog element outside its surface (event.target\
  \ === dialog) is the scrim click. Focus trap: showModal() traps by inertness; Tab\
  \ wrap is implemented explicitly because the browser lets Tab leave to the URL bar.\
  \ Body scroll locked with overflow: hidden on <html> while open, compensating for\
  \ scrollbar width via scrollbar-gutter. Focus restore to document.activeElement\
  \ at open time. `container?: HTMLElement` (default document.body) is the portal\
  \ target \u2014 a platform prop every portaled overlay accepts, not a schema prop.\
  \ FocusScope has no autoFocus value for `title` or `close`, so Dialog sets it to\
  \ `none` and places initial focus itself while FocusScope keeps ownership of capturing\
  \ and restoring the opener. `initialFocus: close` on a non-dismissible dialog has\
  \ no close button to land on and falls back to the first focusable in the body,\
  \ then the heading. The heading takes `tabindex=\"-1\"` for `initialFocus: title`\
  \ and keeps it when `hideHeading` is set \u2014 a visually hidden heading is still\
  \ a focus target and still announced."
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
