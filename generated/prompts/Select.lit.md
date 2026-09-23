# Generate: Select as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Select.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Select.stories.ts` covering every enum value of every enum prop.

**When the files already exist.** Read the existing element, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: SelectVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the element's own navigation (roving or activedescendant) whether or not they are tab stops; an overlay with a fixed set of controls renders that set.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Select.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), unless the property has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change. The event fires in every mode; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other. Wiring is not a prop choice and is always allowed: ids and `aria-*` references, refs, `tabindex` for roving focus, event listeners, and copy strings the parent owns.
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
  name: Select
  category: input
  status: review
  apg: combobox
  anatomy:
  - label
  - description
  - trigger
  - value
  - chevron
  - popup
  - listbox
  - errorMessage
  composition:
    label:
      component: Text
      props:
        weight: medium
        element: span
      forwards:
        labelWeight: fontWeight
        fontSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    description:
      component: Text
      props:
        tone: muted
        size: sm
        element: span
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    value:
      component: Text
      props:
        element: span
      forwards:
        fontSize: fontSize
        fontWeight: fontWeight
        fontFamily: fontFamily
        lineHeight: lineHeight
    chevron:
      component: Icon
      props:
        name: chevron-down
        size: sm
      forwards:
        chevron: color
    errorMessage:
      component: Text
      props:
        tone: danger
        size: sm
        element: span
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    listbox:
      component: Listbox
      props:
        label:
          from: label
        options:
          from: options
        multiple:
          from: multiple
        value:
          from: value
        embedded: true
        selectionFollowsFocus: false
      forwards:
        fontFamily: fontFamily
        lineHeight: lineHeight
  props:
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: Visible label. Always rendered.
      a11y: Associated with the trigger (label/for on web; accessibilityLabel on native).
    name:
      type: string
      required: true
      description: Field name for the Form.
    options:
      type: array
      required: true
      shape: ListboxItem[] (options and one level of groups, as Listbox)
      description: The options, passed through to the Listbox.
    value:
      type: union
      description: Controlled value (array with `multiple`).
      shape: string | string[]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value (array with `multiple`).
      shape: string | string[]
    placeholder:
      type: string
      description: Text shown in the trigger when nothing is selected. Defaults to
        `copy.placeholder`. Not a substitute for the label.
    hideLabel:
      type: boolean
      default: false
      description: Visually hide the label (it remains the accessible name), for compact
        pickers such as DatePicker's month and year.
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      default: md
      description: sm for pickers inside toolbars and calendar headers.
    open:
      type: boolean
      description: Controlled popup state, for programmatic opening and for stories
        and tests (the Keyboard story renders it open). Omit for the trigger-driven
        default.
      controls:
        event: onOpenChange
        state: open
    multiple:
      type: boolean
      default: false
      description: Pick any number. The trigger shows `copy.selectedCount` (or the
        labels when two or fewer); the popup stays open while toggling and closes
        on Escape or outside click.
    description:
      type: string
      description: Helper text under the label.
      a11y: aria-describedby / accessibilityHint.
    required:
      type: boolean
      default: false
      description: Must have a value to submit. Shown in the label, not only by color.
    disabled:
      type: boolean
      default: false
      description: 'Not openable and not submitted. Stays visible and focusable. Wins
        over a controlled `open`: a disabled Select never shows its popup — it forces
        the popup closed locally, reports `aria-expanded="false"` so it never announces
        an expansion the user cannot see, and fires no `onOpenChange` to correct the
        caller''s prop.'
    invalid:
      type: boolean
      default: false
      description: Marks the field invalid. Usually set by the Form.
    error:
      type: string
      description: Error message; implies invalid.
      a11y: role=alert region linked with aria-describedby.
    native:
      type: enum
      values:
      - auto
      - always
      - never
      default: auto
      description: 'Use the platform''s own picker instead of the popup Listbox: `auto`
        means never on web (the styled popup) and always on native phones (the OS
        wheel/dialog is what users expect); `always` forces a native <select> on web
        too (forms that must work without JS); `never` forces the popup everywhere.
        On web and Lit `auto` and `never` therefore render identically and only `always`
        differs, so two of the three derived stories carry no web signal — that is
        expected, not a gap.'
  events:
    onChange:
      description: Fired when the value changes (array with `multiple`).
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: value
        type: union
        shape: string | string[]
        description: The selected value, or every selected value with multiple.
      fires:
      - user
    onOpenChange:
      description: Fired when the popup opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the popup.
      fires:
      - user
  keyboard:
  - keys:
    - Enter
    - ' '
    - ArrowDown
    - ArrowUp
    action: Opens the popup with the selected (or first) option active.
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - Escape
    action: Closes the popup without changing the value and returns focus to the trigger.
    when: popup open
    from: inside
    expect:
    - closes
    - focus-trigger
    target: popup
  - keys:
    - Enter
    action: Commits the active option and closes (single); with `multiple`, toggles
      it and stays open.
    when: popup open
    from: first
    expect: manual
  - keys:
    - Tab
    action: Commits the active option (single) and closes; focus moves on.
    when: popup open
    from: inside
    expect: closes
    target: popup
  - keys:
    - ' '
    action: Commits the active option and closes (single); with `multiple`, toggles
      it and stays open. Listbox's own model, which Select forwards rather than suppresses.
    when: popup open
    from: first
    expect: manual
  - keys:
    - ArrowDown
    - ArrowUp
    - Home
    - End
    - a-z
    action: As Listbox.
    when: popup open
    from: first
    expect: manual
  styles:
    triggerBackground:
      token: color.background
      part: trigger
      locked: true
    triggerBorder:
      token: color.border.strong
      part: trigger
      locked: true
    triggerBorderFocus:
      token: color.border.focus
      part: trigger
      description: The border color while the trigger is keyboard-focused (:focus-visible).
        When the field is both invalid and focused the danger color stays and only
        the width changes (focusRingWidth), as Input, so the error is never hidden
        by focus.
      locked: true
    triggerBorderInvalid:
      token: color.border.danger
      part: trigger
      locked: false
    triggerBorderWidth:
      token: border.width.thin
      part: trigger
      locked: false
    triggerRadius:
      token: radius.md
      part: trigger
      locked: false
    triggerPaddingInline:
      token: space.md
      part: trigger
      locked: false
    triggerPaddingBlock:
      token: space.sm
      part: trigger
      by: size
      values:
        sm: space.1
      locked: false
    triggerGap:
      token: layout.gap.normal
      part: trigger
      description: Between value and chevron.
      locked: false
    valueColor:
      token: color.foreground
      part: value
      description: Realised by the composed value Text's `default` tone while an option
        is selected.
      locked: true
    placeholderColor:
      token: color.foreground.muted
      part: value
      description: The value Text while it shows the placeholder, realised by its
        `muted` tone.
      locked: true
    chevron:
      token: color.foreground.muted
      part: chevron
      description: Forwarded as the composed Icon's `overrides.color` (never its `color`
        prop, which would win over the override), always carrying this token; like
        the tone-realised colors it has no --ds-select-* hook.
      locked: true
    chevronReserve:
      token: font.size.sm
      part: trigger
      description: 'In effect wherever a native <select> is drawn with a chevron —
        `native: always` on web and Lit, single select only: the inline-end space
        it reserves for the chevron glyph (Icon `size: sm` is one font.size.sm wide),
        added to triggerPaddingInline and triggerGap. Elsewhere (popup mode, `multiple`,
        and all of React Native, where `always` means `auto`) it stays in the overridable
        union and is accepted with no runtime effect; the hook is always defined and
        read only in the native wrap.'
      locked: false
    partGap:
      token: space.1
      description: Between label, description, trigger and error, on the field group
        (the root wrapper, not an anatomy part — as Input).
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: Reaches the label only through the composed Text's `overrides`
        (fontWeight); no --ds-select-* hook, since a hook could not reach the child
        without restyling it.
      locked: false
    helperSize:
      token: font.size.sm
      description: Description and error text size, forwarded into the composed Text's
        `overrides` (fontSize); no --ds-select-* hook, as for labelWeight.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone.
      locked: true
    errorText:
      token: color.foreground.danger
      part: errorMessage
      description: Realised by the composed Text's `danger` tone.
      locked: true
    popupSurface:
      token: color.overlay.surface
      part: popup
      locked: false
    popupBorder:
      token: color.border
      part: popup
      locked: false
    popupBorderWidth:
      token: border.width.thin
      part: popup
      locked: false
    popupShadow:
      token: shadow.overlay
      part: popup
      locked: false
    popupRadius:
      token: radius.md
      part: popup
      locked: false
    popupOffset:
      token: space.1
      part: popup
      description: 'The gap between trigger and popup, on the side the popup opens
        (below, or above when flipped). Applied as the popup''s block margin on both
        sides (a position: fixed popup has no parent gap to use); only the side facing
        the trigger shows, and the flip test reads the resolved margin.'
      locked: false
    layer:
      token: layer.dropdown
      part: popup
      locked: false
    fontFamily:
      token: font.family.body
      description: Label, value and helper Text, and forwarded into the composed Listbox's
        own fontFamily override.
      locked: false
    fontSize:
      token: font.size.{size}
      description: 'The value text and the label, so both follow `size`; description
        and error use helperSize. Not forwarded to the Listbox: the popup does not
        follow `size`, so options keep Listbox''s own fontSize.'
      locked: false
    fontWeight:
      token: font.weight.regular
      part: value
      description: 'Weight of the trigger''s value text only. Not forwarded to Listbox''s
        `optionWeight`: like fontSize, the trigger''s value type does not reach the
        popup, so options keep Listbox''s own weights (optionWeight, optionSelectedWeight).
        It exists as an override seam for composites that set their own header type
        — DatePicker forwards its monthTitleWeight into it.'
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      description: Label, value and helper Text, and forwarded into the composed Listbox's
        own lineHeight override.
      locked: false
    minTarget:
      token: size.target.comfortable
      part: trigger
      locked: true
    minTargetSm:
      token: size.target.min
      part: trigger
      description: 'The trigger height floor at size sm. The popup is unchanged. This
        is the documented exception to the `target-44px` requirement, which applies
        at `md`: `sm` exists for toolbar and calendar-header pickers, where a 44px
        control would not fit, and it still meets the 24px floor.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: trigger
      description: Replaces triggerBorderWidth while the trigger is keyboard-focused
        (the border is the focus ring — no outline). Block and inline padding shrink
        by (focusRingWidth − the resolved triggerBorderWidth) so the trigger does
        not shift — `calc(padding - (focusRingWidth - triggerBorderWidth))`, the same
        unclamped rule Input uses, so the two fields agree and no zero literal is
        needed. On React Native, where Pressable focus cannot tell keyboard from touch,
        the width changes on any focus — and on a device it never changes at all,
        since Pressable receives no focus events outside react-native-web, so there
        is no focus ring there.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Applied to the whole field group (label, description, trigger,
        error), as Input.
      locked: false
    enter:
      token: motion.duration.fast
      part: popup
      description: 'Popup opacity fade with motion.easing.standard — no slide, no
        chevron rotation, no trigger border transition. Instant under reduced motion.
        Opening only: closing is instant on every platform — on web because the Popover
        API top layer has no exit transition without transitioning display, and elsewhere
        so that a popup, a sheet and a Modal all disappear the same way.'
      locked: false
  copy:
    placeholder: Select…
    selectedCount:
      text: '{count} selected'
      params:
        count:
          type: number
          description: How many options are selected.
    done: Done
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: combobox
    requires:
    - label-association
    - accessible-name
    - expanded-state
    - selected-state
    - arrow-navigation
    - escape-dismiss
    - focus-restore
    - error-identification
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-44px
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
    - foreground: color.border.strong
      background: color.background
      level: AA
      nonText: true
  form:
    role: field
    value: value
    valueType: string[]
    name: name
    validation:
    - required
    - invalid
    messages:
      required: required
      invalid: invalid
    discovery: context
  platforms:
    web:
      element: button
      attributes:
      - role=combobox
      - aria-haspopup=listbox
      - aria-expanded
      - aria-controls
      - aria-activedescendant
      - aria-labelledby
      - aria-describedby
      - aria-invalid
      - aria-required
      notes: 'The APG select-only combobox: the trigger is a <button role="combobox"
        aria-haspopup="listbox" aria-expanded aria-controls> showing the value; the
        popup is a portal with the Listbox, positioned below (flipping above when
        there is no room below) the trigger at least as wide as it, on layer.dropdown.
        aria-labelledby is the label id alone — the value is the button''s own text
        content, so it is not repeated in the name. aria-controls and aria-activedescendant
        are present only while open (the Listbox is unmounted while closed); aria-activedescendant
        is the active option''s id in Listbox''s option id format (`<listboxId>-option-<value>`),
        tracked through onActiveChange. Keys on the trigger are forwarded while open
        by replaying the KeyboardEvent on the Listbox ref (its wrapper, where Listbox
        handles keys) and copying its defaultPrevented back to the original event;
        Enter with `multiple` is not forwarded (Listbox''s Enter is a no-op there)
        but handled by Select, which toggles the active option. Focus never leaves
        the trigger, so Select drives the active option through Listbox''s controlled
        `activeValue`: the selected (or first) option on open, each value `onActiveChange`
        reports while open, and `null` on close. A hidden <input name> per selected
        value carries the value(s) for native form submission — none when nothing
        is selected or when disabled. `native: always` renders <select> (and <select
        multiple>) with the same label/description/error wiring and no popup, and
        is the one place the system uses the real `disabled` attribute rather than
        aria-disabled: that mode exists for forms that work without JavaScript, where
        aria alone would not stop interaction. In that mode a single select gets a
        first disabled <option value=""> showing the placeholder, and the chevron
        is drawn for single only (<select multiple> is a list box with no dropdown).
        `container?: HTMLElement` (default document.body) is the portal target — a
        platform prop, not a schema prop.'
    lit:
      tag: ds-select
      reflect:
      - multiple
      - size
      - required
      - disabled
      - invalid
      - native
      notes: 'Form-associated with setFormValue (FormData for multiple). Composes
        <ds-listbox> inside its shadow root so aria-activedescendant works; the popup
        uses the Popover API when available. Composed `change` and `open-change`.
        Implements the DsFormField interface. aria-activedescendant cannot reference
        an option inside the composed <ds-listbox>''s shadow root, so the trigger
        exposes the active option''s text through aria-describedby on a live element
        instead: one visually hidden span holding the active option''s label, referenced
        by the trigger''s aria-describedby and marked aria-live="polite". aria-controls
        points at the popup wrapper. Keys are forwarded to the composed ds-listbox
        through its `handleKey(event)` method, and its public `activeValue` is set
        to the selected (or first) option on open. `native: always` renders a native
        <select> inside the shadow root that still submits through setFormValue —
        a custom element cannot work without JavaScript, so on Lit the mode only swaps
        the picker UI; the value part has no element there, and the chevron is drawn
        for single only. setFormValue receives a string for single, a FormData with
        one entry per value for multiple, and null when nothing is selected or disabled.
        ds-form collects ds-select, ds-listbox and ds-combobox like other fields;
        DsFormField.currentValue is `string | boolean | string[] | null`. The composed
        ds-listbox is given no `name`, so it never associates with a form of its own.
        `labelWeight` and `helperSize` are forwarded into the composed ds-text''s
        own `overrides` property as token references, not written as CSS on the child.
        A long value is clipped on the value host (single line, overflow hidden) without
        an ellipsis, since `text-overflow` cannot reach into ds-text''s shadow tree;
        the clipping has no binding and is not overridable. `aria-controls` is present
        at all times here, unlike web, because the popup wrapper is always in the
        shadow root while web unmounts the Listbox when closed — the deliberate difference
        between the two notes.'
    rn:
      element: Pressable
      props:
      - accessibilityRole=combobox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - accessibilityValue
      notes: '`native: auto` opens a BottomSheet containing the Listbox on phones
        (the system''s own picker, not the OS wheel — consistent theming, multi-select
        and descriptions work, and the sheet is the platform idiom); tablets and react-native-web
        use the popup. `native: always` means the same thing here as `auto`: there
        is no OS picker to force without a dependency the package does not take, so
        only `never` differs. A window width at most layout.maxWidth.prose is a phone
        (BottomSheet); wider is a tablet (popup). accessibilityLabel is the visible
        label text, including copy.requiredIndicator when required; accessibilityValue.text
        is the selected label(s) (or copy.selectedCount), and — when nothing is selected
        — the text the trigger actually shows: the `placeholder` prop when given,
        copy.placeholder otherwise, so the announcement never contradicts the screen.
        `description` is both the description part and the trigger''s accessibilityHint,
        so a screen reader hears it twice; that is accepted here, as in Input. Under
        react-native-web the role=combobox needs real attributes to pass axe: `aria-expanded`
        is mirrored as a prop, and `aria-controls` (pointing at a nativeID on the
        popup) and `aria-disabled` are set on the DOM node in a web-only effect. `aria-haspopup="listbox"`
        is deliberately absent — RN 0.87 types no prop for it. No hidden input; Form
        registration as Input, with getValue returning a string for single and a string[]
        for multiple. Focus returns to the trigger by hand — FocusScope''s restore
        only recaptures a TextInput — and of the keyboard model only Escape (the Modal/BottomSheet
        onRequestClose: Android back, which keeps the value and restores focus), outside-tap
        and Enter-as-press exist, since Pressable sees no keys; Tab (commit and close)
        has no native form, and the Enter and Escape behavior scenarios are web and
        Lit only because a native test cannot send a key. testIDs: the root View is
        `Select`, the trigger `Select.trigger`, the popup `Select.popup`, the scrim
        `Select.scrim` — on phones the sheet surface belongs to BottomSheet, which
        Select neither restyles nor reaches into, so `Select.popup` there is a layout-only
        View around the Listbox inside the sheet body (and the aria-controls target),
        while `Select.scrim` exists only on the tablet/web popup, BottomSheet owning
        its own; label, description, value and errorMessage are the composed Text
        and chevron the composed Icon, each wrapped in a layout-only View carrying
        `testID="Select.<part>"` (Text and Icon take no testID), as Input. The parts''
        `element` prop is web and Lit only and is not passed on React Native. `hideLabel`
        does not render the label Text at all (the trigger''s accessibilityLabel stays
        the name), so `Select.label` is absent. The Listbox gets no `onActiveChange`
        here (there is no activedescendant to track). The tablet/web popup is modal:
        a transparent Modal with a scrim for outside-tap, `onRequestClose` for Android
        back, and a trapped FocusScope with `accessibilityViewIsModal`, so focus cannot
        leave while it is open and focus-out close has no native form either. `copy.selectedCount`
        is formatted with `Intl.NumberFormat()` in the runtime''s default locale,
        as on web and Lit.'
    swiftui:
      element: Button
      props:
      - Button
      - .popover
      - .sheet
      - Listbox
      - .accessibilityValue
      - .accessibilityAddTraits=isButton
      - .presentationCompactAdaptation
      - FocusScope
      notes: 'A trigger `Button` (label above, `hideLabel` per Input) showing the
        value text and the `chevron-down` Icon, with `.accessibilityValue(selected
        labels or copy.placeholder)`; the popup is `Listbox embedded` in a `.popover`
        on regular width and a `.sheet` with `.presentationDetents([.medium, .large])`
        on phones — the doc''s `native: always` maps to the sheet on every width.
        Selection closes the popup for single, stays open for `multiple`; the trigger
        keeps focus and the new value is announced. Registers with the Form environment;
        `size: sm` per the Sm bindings.'
  behavior:
  - name: the-trigger-opens-the-popup
    given:
      open: false
    when:
      click: trigger
    then:
    - event: onOpenChange
  - name: a-closed-select-is-not-expanded
    given:
      open: false
    then:
    - state: expanded
      is: false
  - name: an-open-select-reports-the-expanded-state
    description: The trigger is the combobox, so aria-expanded on it is what announces
      the popup.
    given:
      open: true
    then:
    - state: expanded
      is: true
  - name: enter-commits-the-active-option-and-closes
    description: Enter commits the active option and closes (single); the popup opens
      with the selected or first option active.
    given:
      open: true
    when:
      key: Enter
    then:
    - event: onChange
    - event: onOpenChange
    platforms:
    - web
    - lit
  - name: escape-closes-without-changing-the-value
    description: Escape closes the popup without changing the value and returns focus
      to the trigger.
    given:
      open: true
    when:
      key: Escape
    then:
    - event: onOpenChange
    - event: onChange
      fired: false
    platforms:
    - web
    - lit
  - name: the-placeholder-shows-when-nothing-is-selected
    given:
      open: false
    then:
    - copy: placeholder
  - name: a-custom-placeholder-replaces-the-default
    given:
      open: false
      placeholder: Choose a country
    then:
    - text: Choose a country
  - name: a-disabled-select-does-not-open
    description: Disabled selects stay visible and focusable but cannot be opened
      and are not submitted.
    given:
      open: false
      disabled: true
    when:
      click: trigger
    then:
    - event: onOpenChange
      fired: false
    - state: disabled
      is: true
      platforms:
      - web
      - lit
  - name: required-is-shown-in-the-label
    description: required is shown in the label, not only by color.
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: invalid-is-reported-on-the-trigger
    description: 'invalid without an `error` shows the derived message, as Input:
      the error region renders copy.invalid.'
    given:
      invalid: true
    then:
    - state: invalid
      is: true
      platforms:
      - web
      - lit
    - copy: invalid
  examples:
  - name: country-picker
    description: The everyday single-select field with a placeholder until something
      is chosen.
    given:
      label: Country
      name: country
      placeholder: Choose a country
      options:
      - value: ca
        label: Canada
      - value: fr
        label: France
      - value: jp
        label: Japan
  - name: multi-select-roles
    description: Picking any number, where the trigger counts what is selected and
      the popup stays open.
    given:
      label: Roles
      name: roles
      multiple: true
      options:
      - value: frontend
        label: Frontend
      - value: backend
        label: Backend
      - value: design
        label: Design
  - name: forced-native-picker
    description: A form that must work without JavaScript, so the platform's own select
      is rendered on web too.
    given:
      label: Country
      name: country
      native: always
      options:
      - value: ca
        label: Canada
      - value: us
        label: United States
  - name: compact-picker-in-a-header
    description: A small picker whose label is hidden, as in a calendar header.
    given:
      label: Month
      name: month
      hideLabel: true
      size: sm
      options:
      - value: '1'
        label: January
      - value: '2'
        label: February
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string | string[]`
  - fires on: user
- `onOpenChange`: emit `open-change`
  - payload, the keys of `CustomEvent.detail`: `open: boolean`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)
- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `open-change`); drives state `open`

## Parts and slots

- `label`: component `Text`; props `weight` = "medium", `element` = "span"; forwards `labelWeight` → `overrides.fontWeight`, `fontSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `description`: component `Text`; props `tone` = "muted", `size` = "sm", `element` = "span"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `trigger`: element
- `value`: component `Text`; props `element` = "span"; forwards `fontSize` → `overrides.fontSize`, `fontWeight` → `overrides.fontWeight`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `chevron`: component `Icon`; props `name` = "chevron-down", `size` = "sm"; forwards `chevron` → `overrides.color`
- `popup`: element
- `listbox`: component `Listbox`; props `label` ← prop `label`, `options` ← prop `options`, `multiple` ← prop `multiple`, `value` ← prop `value`, `embedded` = true, `selectionFollowsFocus` = false; forwards `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `errorMessage`: component `Text`; props `tone` = "danger", `size` = "sm", `element` = "span"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

## Style bindings

- `triggerBackground`: token `color.background`; part `trigger`; locked
- `triggerBorder`: token `color.border.strong`; part `trigger`; locked
- `triggerBorderFocus`: token `color.border.focus`; part `trigger`; locked
- `triggerBorderInvalid`: token `color.border.danger`; part `trigger`
- `triggerBorderWidth`: token `border.width.thin`; part `trigger`
- `triggerRadius`: token `radius.md`; part `trigger`
- `triggerPaddingInline`: token `space.md`; part `trigger`
- `triggerPaddingBlock`: token `space.sm`; part `trigger`; by `size`: sm → `space.1`, any other value → `space.sm`
- `triggerGap`: token `layout.gap.normal`; part `trigger`
- `valueColor`: token `color.foreground`; part `value`; locked
- `placeholderColor`: token `color.foreground.muted`; part `value`; locked
- `chevron`: token `color.foreground.muted`; part `chevron`; locked
- `chevronReserve`: token `font.size.sm`; part `trigger`
- `labelWeight`: token `font.weight.medium`; part `label`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `popupSurface`: token `color.overlay.surface`; part `popup`
- `popupBorder`: token `color.border`; part `popup`
- `popupBorderWidth`: token `border.width.thin`; part `popup`
- `popupShadow`: token `shadow.overlay`; part `popup`
- `popupRadius`: token `radius.md`; part `popup`
- `popupOffset`: token `space.1`; part `popup`
- `layer`: token `layer.dropdown`; part `popup`
- `fontWeight`: token `font.weight.regular`; part `value`
- `minTarget`: token `size.target.comfortable`; part `trigger`; locked
- `minTargetSm`: token `size.target.min`; part `trigger`; locked
- `focusRingWidth`: token `border.width.focus`; part `trigger`; locked
- `enter`: token `motion.duration.fast`; part `popup`

## Keyboard

- `Enter`, ` `, `ArrowDown`, `ArrowUp` (Opens the popup with the selected (or first) option active.): expect manual
- `Escape` (Closes the popup without changing the value and returns focus to the trigger.): expect closes, then focus-trigger; target part `popup`
- `Enter` (Commits the active option and closes (single); with `multiple`, toggles it and stays open.): expect manual
- `Tab` (Commits the active option (single) and closes; focus moves on.): expect closes; target part `popup`
- ` ` (Commits the active option and closes (single); with `multiple`, toggles it and stays open. Listbox's own model, which Select forwards rather than suppresses.): expect manual
- `ArrowDown`, `ArrowUp`, `Home`, `End`, `a-z` (As Listbox.): expect manual

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string[]
  name: name
  validation:
  - required
  - invalid
  messages:
    required: required
    invalid: invalid
  discovery: context
```

## Copy

- `placeholder`: "Select…"
- `selectedCount`: "{count} selected"; params `count` (number)
- `done`: "Done"
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `requiredIndicator`: " (required)"

## Constants and examples

- example `country-picker`, story `CountryPicker`: given `label: "Country"`, `name: "country"`, `placeholder: "Choose a country"`, `options: [{"value":"ca","label":"Canada"},{"value":"fr","label":"France"},{"value":"jp","label":"Japan"}]`; The everyday single-select field with a placeholder until something is chosen.
- example `multi-select-roles`, story `MultiSelectRoles`: given `label: "Roles"`, `name: "roles"`, `multiple: true`, `options: [{"value":"frontend","label":"Frontend"},{"value":"backend","label":"Backend"},{"value":"design","label":"Design"}]`; Picking any number, where the trigger counts what is selected and the popup stays open.
- example `forced-native-picker`, story `ForcedNativePicker`: given `label: "Country"`, `name: "country"`, `native: "always"`, `options: [{"value":"ca","label":"Canada"},{"value":"us","label":"United States"}]`; A form that must work without JavaScript, so the platform's own select is rendered on web too.
- example `compact-picker-in-a-header`, story `CompactPickerInAHeader`: given `label: "Month"`, `name: "month"`, `hideLabel: true`, `size: "sm"`, `options: [{"value":"1","label":"January"},{"value":"2","label":"February"}]`; A small picker whose label is hidden, as in a calendar header.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `triggerBorderInvalid`, `triggerBorderWidth`, `triggerRadius`, `triggerPaddingInline`, `triggerPaddingBlock`, `triggerGap`, `chevronReserve`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupBorderWidth`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `triggerBackground`, `triggerBorder`, `triggerBorderFocus`, `valueColor`, `placeholderColor`, `chevron`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Behavior scenarios (19)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-trigger-opens-the-popup
  given:
    open: false
  when:
    click: trigger
  then:
  - event: onOpenChange
- name: a-closed-select-is-not-expanded
  given:
    open: false
  then:
  - state: expanded
    is: false
- name: an-open-select-reports-the-expanded-state
  description: The trigger is the combobox, so aria-expanded on it is what announces
    the popup.
  given:
    open: true
  then:
  - state: expanded
    is: true
- name: enter-commits-the-active-option-and-closes
  description: Enter commits the active option and closes (single); the popup opens
    with the selected or first option active.
  given:
    open: true
  when:
    key: Enter
  then:
  - event: onChange
  - event: onOpenChange
  platforms:
  - web
  - lit
- name: escape-closes-without-changing-the-value
  description: Escape closes the popup without changing the value and returns focus
    to the trigger.
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  - event: onChange
    fired: false
  platforms:
  - web
  - lit
- name: the-placeholder-shows-when-nothing-is-selected
  given:
    open: false
  then:
  - copy: placeholder
- name: a-custom-placeholder-replaces-the-default
  given:
    open: false
    placeholder: Choose a country
  then:
  - text: Choose a country
- name: a-disabled-select-does-not-open
  description: Disabled selects stay visible and focusable but cannot be opened and
    are not submitted.
  given:
    open: false
    disabled: true
  when:
    click: trigger
  then:
  - event: onOpenChange
    fired: false
  - state: disabled
    is: true
- name: required-is-shown-in-the-label
  description: required is shown in the label, not only by color.
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: invalid-is-reported-on-the-trigger
  description: 'invalid without an `error` shows the derived message, as Input: the
    error region renders copy.invalid.'
  given:
    invalid: true
  then:
  - state: invalid
    is: true
  - copy: invalid
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
- name: renders-native-auto
  given:
    native: auto
  then:
  - renders: true
  derived: true
- name: renders-native-always
  given:
    native: always
  then:
  - renders: true
  derived: true
- name: renders-native-never
  given:
    native: never
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: control-is-focusable
  then:
  - focusable: true
  platforms:
  - lit
  - swiftui
  - web
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  - state: invalid
    is: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-select
reflect:
- multiple
- size
- required
- disabled
- invalid
- native
notes: "Form-associated with setFormValue (FormData for multiple). Composes <ds-listbox>\
  \ inside its shadow root so aria-activedescendant works; the popup uses the Popover\
  \ API when available. Composed `change` and `open-change`. Implements the DsFormField\
  \ interface. aria-activedescendant cannot reference an option inside the composed\
  \ <ds-listbox>'s shadow root, so the trigger exposes the active option's text through\
  \ aria-describedby on a live element instead: one visually hidden span holding the\
  \ active option's label, referenced by the trigger's aria-describedby and marked\
  \ aria-live=\"polite\". aria-controls points at the popup wrapper. Keys are forwarded\
  \ to the composed ds-listbox through its `handleKey(event)` method, and its public\
  \ `activeValue` is set to the selected (or first) option on open. `native: always`\
  \ renders a native <select> inside the shadow root that still submits through setFormValue\
  \ \u2014 a custom element cannot work without JavaScript, so on Lit the mode only\
  \ swaps the picker UI; the value part has no element there, and the chevron is drawn\
  \ for single only. setFormValue receives a string for single, a FormData with one\
  \ entry per value for multiple, and null when nothing is selected or disabled. ds-form\
  \ collects ds-select, ds-listbox and ds-combobox like other fields; DsFormField.currentValue\
  \ is `string | boolean | string[] | null`. The composed ds-listbox is given no `name`,\
  \ so it never associates with a form of its own. `labelWeight` and `helperSize`\
  \ are forwarded into the composed ds-text's own `overrides` property as token references,\
  \ not written as CSS on the child. A long value is clipped on the value host (single\
  \ line, overflow hidden) without an ellipsis, since `text-overflow` cannot reach\
  \ into ds-text's shadow tree; the clipping has no binding and is not overridable.\
  \ `aria-controls` is present at all times here, unlike web, because the popup wrapper\
  \ is always in the shadow root while web unmounts the Listbox when closed \u2014\
  \ the deliberate difference between the two notes."
```

## Guidance

## Overview

A select is the field for "one of these" (or "any of these") when the list is longer than a RadioGroup should show and typing is not the natural way in. It looks like an Input, opens a Listbox, and returns to being a field. On phones it becomes a sheet, because that is what a thumb expects.

## When to use

Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.

## When not to use

Do not use a Select for two to six options; use a RadioGroup so every option is visible. Do not use it for actions (Menu), for switching modes (SegmentedControl), or for on/off (Switch). Do not put a Select inside a Menu or a Tooltip.

## Behavior

The trigger shows the selected option's label (or the count / labels for `multiple`, or the placeholder). Activating it, or pressing Enter, Space or an arrow, opens the popup with the Listbox and the selected option active; the Listbox's keyboard model applies while focus visually stays on the trigger. Enter commits and closes (single) or toggles (multiple); Escape closes without changing the value; Tab commits and moves on; clicking outside closes. On close, focus returns to the trigger and `onChange` has fired if the value changed. Validation, `required`, `disabled` and errors work exactly as Input; the Form collects the value or array by `name`. The composed Listbox is `embedded`, receives `label` (Select's label, which Listbox requires even with `labelledBy`), `options`, `multiple`, `value`, `selectionFollowsFocus: false` (arrows move the active option; Enter commits), `initialActiveValue` set to the current selection — with `multiple` and several selected, the first value in the array's order — so the popup opens with it active, `labelledBy` the label's id (in effect on web only: Lit is passed it for parity and never resolves it, so the list is named by `label`), and Select's own `onChange`/`onActiveChange` handlers; on Lit Select also sets its `activeValue` on open. The composition's `props` lists the static ones; this sentence is the full set, and `disabled` is never passed (a disabled Select never opens). Where a static prop and a forward set the same thing (the label Text's `weight` and `labelWeight`, the helper Texts' `size` and `helperSize`), the forward is authoritative: it carries the resolved token, and the static prop is the semantic default it lands on. Every forward carries the resolved token — the consumer's override, else the Select default with `{size}` resolved (`font.size.md` or `font.size.sm`) — not only a consumer override, because the composed Text has no size prop of its own. That also makes the CSS escape hatch partial for the four forwarded bindings: `fontFamily`, `lineHeight`, `labelWeight` and `helperSize` are written into the child's own hook, so a document-level `--ds-select-font-family` no longer reaches the composed Text — the root hooks still drive the trigger, the native `<select>` and the popup. The value Text also takes `tone` (`default` with a selection, `muted` for the placeholder), which is how `valueColor` and `placeholderColor` are realised; bindings realised by a child's tone (`valueColor`, `placeholderColor`, `descriptionText`, `errorText`) and `chevron` declare no --ds-select-* hook, while `fontSize`, `fontFamily`, `lineHeight` and `fontWeight` keep root hooks, which the `native: always` <select> reads directly. The error region is the composed danger Text itself, which carries `role="alert"`, the id `aria-describedby` points at and `data-part="errorMessage"` — exactly as Input, with no extra wrapper element (the anatomy has none to name). The label's `data-part="label"` is on the composed Text, not on the wrapping `<label>`. A long value is truncated to one line with an ellipsis on web and React Native (Lit: see its notes). The embedded list is never a tab stop — focus stays on the trigger — so Tab leaves the Select even while a controlled `open` keeps the popup shown until the prop changes; Tab fires `onChange` (single, if the active option differs) and `onOpenChange(false)` and never prevents the default focus move. With `multiple` and more than two selections the trigger shows `copy.selectedCount` — one string with the count formatted for the locale and no plural variants, since it only ever shows three or more; two or fewer are joined with a literal comma and a space — not `Intl.ListFormat`, deliberately, since a two-item list needs no conjunction. The popup's surface, border, radius and shadow are the popup wrapper's bindings; the Listbox draws none. The phone/tablet switch uses `layout.maxWidth.prose` (at most is a phone), and the phone sheet's footer button is `copy.done` — only the native phone sheet renders it; web and Lit declare the copy key and never show it. Space commits in the open popup as well as opening it from the trigger: the popup is Listbox's own keyboard model, and this component does not suppress a key that model already handles. For a single select Space commits and closes, like Enter or a click on an option; with `multiple` it toggles and stays open. A toggled value lands in the array in Listbox's own order — option order, with values that match no option appended — so Enter, Space and a click all produce the same array. Re-picking the already-selected option (Enter, Space or click) closes a single select without firing `onChange`, since the value did not change. Clicking outside (pointerdown outside the trigger and popup) or moving focus outside closes without changing the value. Clicking the label focuses the trigger and does not open the popup: since a `<label for>` would turn the click into a button click, the label's click is `preventDefault`ed and the trigger focused by hand (except with `native: always`, where the label's own behavior is right). The chevron may sit in a layout-only wrapper element that positions it; the Icon itself is never restyled. The composed Listbox is given no `name`, so it never registers as a field of its own — Select is the field. Inside a Fieldset it behaves like every other field in the system: it takes `disabled` from the Fieldset and its accessible name is prefixed with the legend. The Keyboard story owns `open` on every platform — rendering open and writing `onOpenChange` back — and focuses the trigger before sending keys, since focus never leaves it and the popup is not a focusable target.

The Form value is a string for a single select and a string[] with `multiple` (`form.valueType` names the wider shape); an empty single select submits nothing and an empty multiple submits no entries. The error region (`role="alert"`, the composed danger Text) shows `error` when set, and `copy.invalid` when `invalid` is set without `error`, as Input.

## Content guidelines

The label names the field ("Country"); the placeholder is `copy.placeholder` unless a more specific prompt helps ("Choose a role"). Options follow Listbox's rules. With `multiple`, the trigger shows up to two labels joined by commas, then `copy.selectedCount`.

## Accessibility

The trigger is a `combobox` (select-only pattern) with `aria-haspopup="listbox"`, `aria-expanded`, its label association and description/error links, and the popup is a `listbox` (WCAG 4.1.2; APG select-only combobox). The full Listbox keyboard model applies; Escape closes and focus is restored (2.1.2, 2.4.3). Required and invalid are in text and attributes, not color alone (1.4.1, 3.3.1). The trigger meets 44px (2.5.8) and its border 3:1 (1.4.11). On phones the sheet is modal with the same guarantees as BottomSheet.

## Platform notes

### Web
Render the label (a native `<label for>` wrapping the label Text, on web and Lit; its text, with `copy.requiredIndicator` when required, is the accessible name), description, `<button type="button" role="combobox" id aria-haspopup="listbox" aria-expanded aria-controls={listboxId} aria-activedescendant aria-labelledby={labelId} aria-describedby aria-invalid aria-required>` containing the value Text and `<Icon name="chevron-down" size="sm">`, the error region, and a hidden `<input name>` per selected value. The popup is a portal (`position: fixed`, from the trigger rect, flip on overflow, `min-inline-size` = trigger width, `layer.dropdown`) containing `<Listbox>` with `labelledBy={labelId}`; forward keydown from the trigger to the Listbox's handler while open; close on `pointerdown` outside and on `focusout` to outside. `native: always`: `<select>`/`<select multiple>` with the same wrapper and `appearance: none` styling plus the chevron.

### Lit
`<ds-select label="Country" name="country" .options=${…}>`; form-associated (`DsFormField`); `<ds-listbox>` in the shadow root; popup via `popover="manual"` when available; composed `change`, `open-change`.

### React Native
`Pressable` with `accessibilityRole="combobox"`, `accessibilityLabel={label}`, `accessibilityHint={description}`, `accessibilityState={{ expanded, disabled }}`, `accessibilityValue={{ text }}`; opens `BottomSheet` (phones) or a positioned popup `Modal` (tablets/web) containing `Listbox`; the sheet's footer has a Done button for `multiple`. Form registration as Input.

## Related

Listbox, Combobox, RadioGroup, Input, BottomSheet.
