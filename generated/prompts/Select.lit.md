# Generate: Select as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Select.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Select.stories.ts` covering every enum value of every enum prop.

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
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and at least three focusable children.
- `keyboard` rules are the keyboard model: implement every key → action exactly as listed and nothing else; `composition` parts must render the named system element. Overlays: a modal dialog uses a native `<dialog>` inside the shadow root opened with `showModal()` (native focus trap, `inert` background and top layer); non-modal popups use the Popover API (`popover="manual"`, `showPopover()`) when available and a `position: fixed` fallback, positioned from the trigger and flipped at the viewport edge; body scroll is locked while a modal is open; focus returns to the opener on close; stacking uses `z-index: var(--layer-<name>)` inside the top layer.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/web-components-vite` and `html` from lit; title `'<Name>/Lit'`; one story per enum value plus Default.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Select.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), the event fired in both modes; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
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
    label: Text
    description: Text
    chevron: Icon
    listbox: Listbox
  props:
    label:
      type: string
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
      shape: ListboxOption[] (flat or grouped, as Listbox)
      description: The options, passed through to the Listbox.
    value:
      type: union
      description: Controlled value (array with `multiple`).
      shape: string | string[]
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
      description: Not openable and not submitted. Stays visible and focusable.
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
        too (forms that must work without JS); `never` forces the popup everywhere.'
  events:
    onChange:
      description: Fired when the value changes (array with `multiple`).
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
    onOpenChange:
      description: Fired when the popup opens or closes.
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
    expect: closes
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
      locked: true
    triggerBorder:
      token: color.border.strong
      locked: true
    triggerBorderFocus:
      token: color.border.focus
      locked: true
    triggerBorderInvalid:
      token: color.border.danger
      locked: false
    triggerBorderWidth:
      token: border.width.thin
      locked: false
    triggerRadius:
      token: radius.md
      locked: false
    triggerPaddingInline:
      token: space.md
      locked: false
    triggerPaddingBlock:
      token: space.sm
      locked: false
    triggerPaddingBlockSm:
      token: space.1
      description: Vertical padding of the trigger at size sm.
      locked: false
    triggerGap:
      token: layout.gap.normal
      description: Between value and chevron.
      locked: false
    valueColor:
      token: color.foreground
      locked: true
    placeholderColor:
      token: color.foreground.muted
      locked: true
    chevron:
      token: color.foreground.muted
      locked: true
    partGap:
      token: space.1
      description: Between label, description, trigger and error.
      locked: false
    labelWeight:
      token: font.weight.medium
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      locked: true
    errorText:
      token: color.foreground.danger
      locked: true
    popupSurface:
      token: color.overlay.surface
      locked: false
    popupBorder:
      token: color.border
      locked: false
    popupShadow:
      token: shadow.overlay
      locked: false
    popupRadius:
      token: radius.md
      locked: false
    popupOffset:
      token: space.1
      locked: false
    layer:
      token: layer.dropdown
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.{size}
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The trigger height floor at size sm. The popup is unchanged.
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Replaces the border width when focused; padding shrinks by the
        difference.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    enter:
      token: motion.duration.fast
      description: Popup fade; instant under reduced motion.
      locked: false
  copy:
    placeholder: Select…
    selectedCount: '{count} selected'
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
      large: true
  platforms:
    web:
      element: button
      attributes:
      - role=combobox
      - aria-haspopup=listbox
      - aria-expanded
      - aria-controls
      - aria-labelledby
      - aria-describedby
      - aria-invalid
      - aria-required
      notes: 'The APG select-only combobox: the trigger is a <button role="combobox"
        aria-haspopup="listbox" aria-expanded aria-controls> showing the value; the
        popup is a portal with the Listbox, positioned below (flipping above) the
        trigger at least as wide as it, on layer.dropdown. Keys on the trigger are
        forwarded to the Listbox''s handler while open. A hidden <input name> carries
        the value(s) for native form submission. `native: always` renders <select>
        (and <select multiple>) with the same label/description/error wiring and no
        popup.'
    lit:
      tag: ds-select
      reflect:
      - multiple
      - required
      - disabled
      - invalid
      - native
      notes: Form-associated with setFormValue (FormData for multiple). Composes <ds-listbox>
        inside its shadow root so aria-activedescendant works; the popup uses the
        Popover API when available. Composed `change` and `open-change`. Implements
        the DsFormField interface. aria-activedescendant cannot reference an option
        inside the composed <ds-listbox>'s shadow root, so the trigger exposes the
        active option's text through aria-describedby on a live element instead, and
        aria-controls points at the popup wrapper. ds-form collects ds-select, ds-listbox
        and ds-combobox like other fields; DsFormField.currentValue is `string | boolean
        | string[] | null`.
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
        use the popup. accessibilityValue.text is the selected label(s). No hidden
        input; Form registration as Input.'
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
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `triggerBorderInvalid`, `triggerBorderWidth`, `triggerRadius`, `triggerPaddingInline`, `triggerPaddingBlock`, `triggerPaddingBlockSm`, `triggerGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `triggerBackground`, `triggerBorder`, `triggerBorderFocus`, `valueColor`, `placeholderColor`, `chevron`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRingWidth`

## Behavior scenarios (9)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

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
- required
- disabled
- invalid
- native
notes: Form-associated with setFormValue (FormData for multiple). Composes <ds-listbox>
  inside its shadow root so aria-activedescendant works; the popup uses the Popover
  API when available. Composed `change` and `open-change`. Implements the DsFormField
  interface. aria-activedescendant cannot reference an option inside the composed
  <ds-listbox>'s shadow root, so the trigger exposes the active option's text through
  aria-describedby on a live element instead, and aria-controls points at the popup
  wrapper. ds-form collects ds-select, ds-listbox and ds-combobox like other fields;
  DsFormField.currentValue is `string | boolean | string[] | null`.
```

## Guidance

## Overview

A select is the field for "one of these" (or "any of these") when the list is longer than a RadioGroup should show and typing is not the natural way in. It looks like an Input, opens a Listbox, and returns to being a field. On phones it becomes a sheet, because that is what a thumb expects.

## When to use

Use a Select for a form field with about seven to fifty options that people recognise on sight — country, role, status, time zone from a short list, a category. Use `multiple` for tags or memberships when a set of Checkboxes would be too long. Use `native: always` on web for forms that must work without JavaScript. Use Combobox instead when the list is long enough that typing to filter is faster than scrolling, or when free text is allowed.

## When not to use

Do not use a Select for two to six options; use a RadioGroup so every option is visible. Do not use it for actions (Menu), for switching modes (SegmentedControl), or for on/off (Switch). Do not put a Select inside a Menu or a Tooltip.

## Behavior

The trigger shows the selected option's label (or the count / labels for `multiple`, or the placeholder). Activating it, or pressing Enter, Space or an arrow, opens the popup with the Listbox and the selected option active; the Listbox's keyboard model applies while focus visually stays on the trigger. Enter commits and closes (single) or toggles (multiple); Escape closes without changing the value; Tab commits and moves on; clicking outside closes. On close, focus returns to the trigger and `onChange` has fired if the value changed. Validation, `required`, `disabled` and errors work exactly as Input; the Form collects the value or array by `name`. The composed Listbox is `embedded`, receives `selectionFollowsFocus: false` (arrows move the active option; Enter commits) and `defaultActiveValue` set to the current selection so the popup opens with it active. With `multiple` and more than two selections the trigger shows `copy.selectedCount`; two or fewer are joined with a comma and a space. The popup's surface, border, radius and shadow are the popup wrapper's bindings; the Listbox draws none. The phone/tablet switch uses `layout.maxWidth.prose`, and the phone sheet's footer button is `copy.done`.

## Content guidelines

The label names the field ("Country"); the placeholder is `copy.placeholder` unless a more specific prompt helps ("Choose a role"). Options follow Listbox's rules. With `multiple`, the trigger shows up to two labels joined by commas, then `copy.selectedCount`.

## Accessibility

The trigger is a `combobox` (select-only pattern) with `aria-haspopup="listbox"`, `aria-expanded`, its label association and description/error links, and the popup is a `listbox` (WCAG 4.1.2; APG select-only combobox). The full Listbox keyboard model applies; Escape closes and focus is restored (2.1.2, 2.4.3). Required and invalid are in text and attributes, not color alone (1.4.1, 3.3.1). The trigger meets 44px (2.5.8) and its border 3:1 (1.4.11). On phones the sheet is modal with the same guarantees as BottomSheet.

## Platform notes

### Web
Render the label (`<label for>`), description, `<button type="button" role="combobox" id aria-haspopup="listbox" aria-expanded aria-controls={listboxId} aria-labelledby={labelId + valueId} aria-describedby aria-invalid aria-required>` containing the value span and `<Icon name="chevron-down">`, the error region, and a hidden `<input name>` per selected value. The popup is a portal (`position: fixed`, from the trigger rect, flip on overflow, `min-inline-size` = trigger width, `layer.dropdown`) containing `<Listbox>` with `labelledBy={labelId}`; forward keydown from the trigger to the Listbox's handler while open; close on `pointerdown` outside and on `focusout` to outside. `native: always`: `<select>`/`<select multiple>` with the same wrapper and `appearance: none` styling plus the chevron.

### Lit
`<ds-select label="Country" name="country" .options=${…}>`; form-associated (`DsFormField`); `<ds-listbox>` in the shadow root; popup via `popover="manual"` when available; composed `change`, `open-change`.

### React Native
`Pressable` with `accessibilityRole="combobox"`, `accessibilityLabel={label}`, `accessibilityHint={description}`, `accessibilityState={{ expanded, disabled }}`, `accessibilityValue={{ text }}`; opens `BottomSheet` (phones) or a positioned popup `Modal` (tablets/web) containing `Listbox`; the sheet's footer has a Done button for `multiple`. Form registration as Input.

## Related

Listbox, Combobox, RadioGroup, Input, BottomSheet.
