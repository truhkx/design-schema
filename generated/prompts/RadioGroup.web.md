# Generate: RadioGroup for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/RadioGroup.tsx` exporting a typed React function component named `RadioGroup`, plus `RadioGroup.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function RadioGroup({ ref, …rest }: RadioGroupProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof RadioGroup> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `RadioGroup.test.tsx`.
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
  name: RadioGroup
  category: input
  status: review
  apg: radio
  anatomy:
  - group
  - legend
  - description
  - radio
  - radioIndicator
  - radioLabel
  - radioDescription
  - errorMessage
  props:
    label:
      type: string
      required: true
      description: The group's legend — the question the options answer. Always visible.
      a11y: Rendered as the fieldset legend on web; as the group's accessibilityLabel
        on native.
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form. Also links the radios into
        one native group on web.
    options:
      type: array
      required: true
      shape: '{ value: string; label: string; description?: string; disabled?: boolean
        }[]'
      description: The options in display order. Two to about seven; more than that
        is a Select (planned). Values are short identifiers (letters, digits, dashes)
        — they become element ids. Export the item type as `RadioGroupOption`.
    value:
      type: string
      description: Controlled selected value. Omit for an uncontrolled group.
    defaultValue:
      type: string
      description: Initial selection for an uncontrolled group. Omit to start with
        nothing selected.
    orientation:
      type: enum
      values:
      - vertical
      - horizontal
      default: vertical
      description: Layout of the options. Horizontal only for two or three short labels;
        it wraps rather than overflows.
    required:
      type: boolean
      default: false
      description: An option must be selected to submit. Shown in the legend, not
        only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the group as failing validation. Usually set by the Form;
        can be set directly.
    disabled:
      type: boolean
      default: false
      description: Disables every option. Individual options use `options[].disabled`.
    description:
      type: string
      description: Persistent helper text under the legend.
      a11y: Linked to the group with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The group's error message. Setting it marks the group invalid.
      a11y: Rendered once under the group with role=alert and linked with aria-describedby
        on the group.
  events:
    onChange:
      description: Fired when the selection changes, with the new option value.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
  keyboard:
  - keys:
    - Tab
    action: Moves into the group, to the selected radio (the first when none is selected);
      from inside, leaves the group — one tab stop.
    from: any
    expect: manual
  - keys:
    - ArrowDown
    - ArrowRight
    action: Moves to and selects the next enabled radio, wrapping.
    from: first
    expect: focus-next
  - keys:
    - ArrowUp
    - ArrowLeft
    action: Moves to and selects the previous enabled radio, wrapping.
    from: last
    expect: focus-prev
  - keys:
    - ' '
    action: Selects the focused radio when the arrows did not already select it.
    from: inside
    expect: manual
  styles:
    controlBackground:
      token: color.control.background
      locked: true
    controlBorder:
      token: color.control.border
      locked: true
    controlBorderWidth:
      token: border.width.thin
      locked: false
    controlSelectedBackground:
      token: color.control.selectedBackground
      description: Selected border color; the fill stays controlBackground and the
        dot is drawn inside.
      locked: true
    indicator:
      token: color.control.selectedBackground
      description: The centre dot, controlSize minus 2 × space.1 in diameter.
      locked: true
    controlBorderInvalid:
      token: color.border.danger
      locked: false
    controlSize:
      token: space.5
      locked: false
    controlRadius:
      token: radius.full
      locked: false
    optionGap:
      token: space.2
      description: Horizontal gap between radio and its label.
      locked: false
    listGap:
      token: space.2
      description: Gap between options (vertical or horizontal).
      locked: false
    partGap:
      token: space.1
      description: Vertical gap between legend, description, list, and error.
      locked: false
    legendColor:
      token: color.foreground
      locked: true
    legendSize:
      token: font.size.md
      locked: false
    legendWeight:
      token: font.weight.medium
      locked: false
    labelColor:
      token: color.foreground
      locked: true
    labelSize:
      token: font.size.md
      locked: false
    labelWeight:
      token: font.weight.regular
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
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    minTarget:
      token: size.target.comfortable
      description: Minimum height of each option row; the whole row is the hit area.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      locked: false
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
  a11y:
    role: radiogroup
    requires:
    - label-association
    - arrow-navigation
    - roving-tabindex
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.control.selectedBackground
      background: color.control.background
      level: AA
      large: true
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
    - foreground: color.control.border
      background: color.background
      level: AA
      large: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
  platforms:
    web:
      element: fieldset
      attributes:
      - aria-describedby
      - aria-invalid
      - aria-required
      notes: 'A <fieldset> with a <legend>, containing native <input type="radio"
        name> elements styled with appearance: none. Native radios sharing a name
        already implement roving tabindex and arrow-key movement; do not reimplement
        it. A disabled option uses the real `disabled` attribute so native arrow movement
        skips it (the one place the system prefers `disabled` over aria-disabled);
        a disabled group uses aria-disabled on the fieldset and every radio plus preventDefault
        guards, so it stays focusable but inert. Each radio has its own <label for>;
        option descriptions are linked per radio with aria-describedby. The group
        error is linked from the fieldset.'
    lit:
      tag: ds-radio-group
      reflect:
      - orientation
      - required
      - disabled
      - invalid
      notes: Form-associated (setFormValue(value)). The radios are rendered inside
        the shadow root from the `options` property, so they share one root and native
        grouping by name works; the native change is not composed, so re-dispatch
        a composed `change` CustomEvent with detail { value }. `options` is a property,
        not an attribute.
    rn:
      element: View
      props:
      - accessibilityRole=radiogroup
      - accessibilityLabel
      - accessibilityHint
      notes: The group is a View with accessibilityRole="radiogroup"; each option
        is a Pressable with accessibilityRole="radio" and accessibilityState={{ checked,
        disabled }}. There is no roving tabindex or arrow movement on native — every
        radio is a stop for the screen reader and for hardware-keyboard focus. That
        is the platform convention, not a defect. Validation precedence is Input's
        (error → required → invalid with copy.invalid). Individually disabled options
        use accessibilityState.disabled and a press guard, never the Pressable `disabled`
        prop, so they stay reachable.
    swiftui:
      element: VStack
      props:
      - .accessibilityElement=contain
      - .accessibilityLabel
      - Button
      - .accessibilityAddTraits=isSelected
      - .focusable
      - .onMoveCommand
      - '@FocusState'
      notes: 'A container `.accessibilityElement(children: .contain)` named by the
        legend, holding one `Button` per option that draws the radio circle from the
        tokens and carries `.isSelected` for the checked option (VoiceOver: ''Email,
        selected, button, 1 of 3'' — the count is announced from `.accessibilityValue(copy.position)`).
        Arrow keys on iPad move the selection through `@FocusState` per the keyboard
        table (`.onMoveCommand`); the group is one focus section. `orientation` picks
        `VStack`/`HStack`. Registers with the Form environment as one field.'
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `controlBorderWidth`, `controlBorderInvalid`, `controlSize`, `controlRadius`, `optionGap`, `listGap`, `partGap`, `legendSize`, `legendWeight`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `controlBackground`, `controlBorder`, `controlSelectedBackground`, `indicator`, `legendColor`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (4)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-orientation-vertical
  given:
    orientation: vertical
  then:
  - renders: true
  derived: true
- name: renders-orientation-horizontal
  given:
    orientation: horizontal
  then:
  - renders: true
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

## Platform notes (web)

```yaml
element: fieldset
attributes:
- aria-describedby
- aria-invalid
- aria-required
notes: 'A <fieldset> with a <legend>, containing native <input type="radio" name>
  elements styled with appearance: none. Native radios sharing a name already implement
  roving tabindex and arrow-key movement; do not reimplement it. A disabled option
  uses the real `disabled` attribute so native arrow movement skips it (the one place
  the system prefers `disabled` over aria-disabled); a disabled group uses aria-disabled
  on the fieldset and every radio plus preventDefault guards, so it stays focusable
  but inert. Each radio has its own <label for>; option descriptions are linked per
  radio with aria-describedby. The group error is linked from the fieldset.'
```

## Guidance

## Overview

A radio group asks one question and takes one answer. Its strength is that every option is visible at once, so the user can compare before choosing; its cost is vertical space, which is why it suits short sets.

## When to use

Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.

## When not to use

Do not use a RadioGroup for more than about seven options or for options the user must scroll to see; use Select (planned). Do not use it for a yes/no; use Checkbox or Switch. Do not use it for an immediate mode switch in a toolbar; that is a SegmentedControl (planned). Do not let a user deselect: once a radio is chosen, one is always chosen.

## Behavior

Clicking or tapping an option row selects it and fires `onChange` with its value. From the keyboard, Tab moves into the group (to the selected radio, or the first when none is selected), arrow keys move the selection between enabled options and wrap around, and Space selects a focused radio that the arrows did not already select. Tab leaves the group. Individual disabled options are natively disabled and skipped by the arrows; they stay visible and readable but are not focus stops — a deliberate exception to the system's aria-disabled rule, because a radio that can be reached but not chosen is more confusing than one that is skipped. Uncontrolled unless `value` is provided. Disabled options are skipped by arrow movement and cannot be selected; a fully `disabled` group is focusable but inert. `required` appends `copy.requiredIndicator` to the legend and sets `aria-required` on the group; on a failed submit the Form renders `copy.required` as the group error. Validation precedence: `error` prop, then `required` (renders `copy.required`), then `invalid` (renders `copy.invalid`) — the same order as Input. Inside a Form, `validate: blur` runs when focus leaves the whole group, not when it moves between radios; the Form collects the selected value, or nothing (no key) when none is selected. Inside a Fieldset the field reads `FieldsetContext`: `disabled` from the group applies as if set on the field, and on native the legend prefixes the accessibility label ("Shipping address, Street").

## Content guidelines

The legend is a question or a noun phrase for what is being chosen ("Shipping method"). Option labels are parallel — all nouns or all short phrases — sentence case, and never end in a full stop. Put the recommended or most common option first, not the default; `defaultValue` marks the default. Option descriptions are one line: price, timing, consequence.

## Accessibility

The group is exposed with role `radiogroup` (native `fieldset`/`legend` on web) and its legend is the group's accessible name (WCAG 1.3.1, 3.3.2); each radio's name is its own label. Selection is exposed as checked state (4.1.2) and shown by the dot, not by color alone (1.4.1). The group follows the APG radio pattern for keyboard: one tab stop, arrows to move and select (2.1.1). Description and error are linked from the group (3.3.1), with the error announced when it appears. Each option row reaches the 44px target (2.5.8). Selected and rest control borders meet 3:1 on the page background (1.4.11); the build checks the pairs.

## Platform notes

### Web
Render `<fieldset>` with `<legend>` and, per option, `<input type="radio" name value id>` plus `<label for>`; style the input with `appearance: none` and draw the ring and dot with the control tokens. Native radios with a shared `name` provide roving tabindex and arrow movement, so do not add `tabindex` or key handlers. Link the group description and error to the `<fieldset>` with `aria-describedby`, and per-option descriptions to their radio. Per-option `disabled` is the native attribute; group `disabled` is `aria-disabled` on the fieldset and radios with `preventDefault()` guards. Option ids are `${groupId}-${value}`. A `<legend>` does not take part in the fieldset's flex gap, so `partGap` below it is a margin.

### Lit
`<ds-radio-group>` takes `options` as a property (`.options=${[...]}`) and renders the fieldset and radios inside its shadow root, where the shared `name` groups them natively. It is form-associated: `setFormValue(value)` on change, and `checkValidity()` / `reportValidity()` implement `required`. Re-dispatch a composed `change` CustomEvent with `detail: { value }`. Reflect `orientation`, `required`, `disabled` and `invalid`.

### React Native
Render a `View` with `accessibilityRole="radiogroup"`, `accessibilityLabel={label}` and `accessibilityHint={description}` — not `accessible`, or the radios would collapse into it; on iOS this means the legend reaches VoiceOver as the preceding `Text`, not as a group name (platform limit) — a `Text` legend, and one `Pressable` per option with `accessibilityRole="radio"`, `accessibilityLabel` (label plus description), and `accessibilityState={{ checked: value === option.value, disabled }}`. Arrow-key movement does not exist on native; every radio is its own focus stop, and there is no group-level blur, so `validate: blur` runs on change. On a failed submit the Form focuses the first enabled radio. The group error is announced as in Input.

## Related

Checkbox, Switch, Form, Select (planned).
