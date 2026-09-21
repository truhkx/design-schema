# Generate: Checkbox for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Checkbox.tsx` exporting a typed React function component named `Checkbox`, plus `Checkbox.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Checkbox({ ref, …rest }: CheckboxProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Checkbox> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Checkbox.test.tsx`.
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
  name: Checkbox
  category: input
  status: review
  apg: checkbox
  anatomy:
  - control
  - indicator
  - label
  - description
  - errorMessage
  composition:
    indicator:
      component: Icon
      props:
        size: xs
      forwards:
        indicator: color
    description:
      component: Text
      props:
        size: sm
        tone: muted
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
    errorMessage:
      component: Text
      props:
        size: sm
        tone: danger
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
        lineHeight: lineHeight
  props:
    label:
      type: string
      required: true
      description: Visible label. Clicking or tapping it toggles the control.
      a11y: Programmatically associated with the control (label/for on web, accessibilityLabel
        on native).
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name): a selection
        column in a Table, where the row name is the label.'
    name:
      type: string
      required: true
      description: Field name used by the enclosing Form when collecting values.
    value:
      type: string
      default: 'on'
      description: What a native HTML <form> submits under `name` when checked (web
        and Lit only). The enclosing Form (React, React Native, ds-form) ignores it
        and collects the boolean `checked`. Checkboxes sharing a `name` are not a
        multi-select under Form; give each its own name. React Native accepts it (default
        'on') for API parity and does nothing with it.
    checked:
      type: boolean
      description: Controlled checked state. Omit for an uncontrolled control.
      controls:
        event: onChange
        default: defaultChecked
        state: checked
    defaultChecked:
      type: boolean
      default: false
      description: Initial state for an uncontrolled control.
    indeterminate:
      type: boolean
      default: false
      description: Shows the mixed indicator, for a parent checkbox whose children
        are partly selected. Visual and announced only; the submitted value still
        follows `checked`. With `checked` also true, mixed wins for both the glyph
        and the announced state — a partly selected parent is mixed, whatever its
        own box would say — while the submitted value stays `checked`.
      a11y: Announced as "mixed" (aria-checked=mixed / accessibilityState checked
        "mixed").
    disabled:
      type: boolean
      default: false
      description: Cannot be toggled and is skipped by the Form. Stays visible, readable
        and focusable, which is why it is `aria-disabled` and not the native attribute
        — with the accepted consequence that a native HTML `<form>` still submits
        a disabled-but-checked box's `value`, since only the native attribute excludes
        it. Accessibility wins over that edge; the Form component, which collects
        fields itself, skips it either way.
    required:
      type: boolean
      default: false
      description: Must be checked to submit — for consent and agreement. Shown in
        the label, not only by color.
    invalid:
      type: boolean
      default: false
      description: Marks the control as failing validation. Usually set by the Form;
        can be set directly. While true with no `error` (and no Form message), the
        error slot renders copy.required (required and unchecked) or copy.invalid,
        with role=alert, so a bare `invalid` always shows a message.
    description:
      type: string
      description: Persistent helper text below the label.
      a11y: Linked with aria-describedby / accessibilityHint.
    error:
      type: string
      description: The error message. Setting it marks the control invalid. Say what
        to do ("Accept the terms to continue").
      a11y: Rendered in the error slot with aria-describedby and role=alert.
  events:
    onChange:
      description: Fired when the checked state changes, with the new boolean.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: checked
        type: boolean
        description: The new checked state.
      fires:
      - user
  styles:
    controlBackground:
      token: color.control.background
      part: control
      locked: false
    controlBorder:
      token: color.control.border
      part: control
      locked: true
    controlBorderWidth:
      token: border.width.thin
      part: control
      locked: false
    controlSelectedBackground:
      token: color.control.selectedBackground
      part: control
      description: Checked and indeterminate fill; the border takes the same color
        unless the box is invalid (see controlBorderInvalid).
      locked: true
    indicator:
      token: color.control.selectedForeground
      part: indicator
      description: 'The check mark (`Icon name="check"`, when checked) and the mixed
        dash (`Icon name="dash"`, when the mixed indicator shows) in this color, at
        `size: xs`, centered in the control; nothing is rendered when unchecked. The
        color reaches the Icon only through its `color` override (a token path); the
        Checkbox hook does not style the Icon. The web/Lit control is a void <input>,
        so the control and the indicator sit in a box wrapper span that stacks them
        in one cell: the input keeps `data-part="control"`, and the indicator is an
        aria-hidden span with `pointer-events: none` over the input holding the Icon,
        carrying `data-part="indicator"` (web) / `part="indicator"` and `data-part="indicator"`
        (Lit). On native the Icon sits inside the drawn control View.'
      locked: true
    indicatorStroke:
      token: border.width.focus
      part: indicator
      description: 'Stroke thickness of the check mark and dash. Locked, as Icon''s
        own strokeWidth is and on the same token, so the two already agree and nothing
        is forwarded into the composed Icon. It declares no --ds-checkbox-* hook on
        any platform: Icon already applies it.'
      locked: true
    pressedOverlay:
      token: opacity.disabled
      part: control
      state: pressed
      description: 'While pressed (web/Lit `:active`), an unchecked, not-mixed, enabled
        box shows controlSelectedBackground at this opacity over controlBackground;
        the border is unchanged. A checked or mixed box (already filled) and a disabled
        one show no overlay. Web/Lit: `color-mix(in srgb, <controlSelectedBackground>
        calc(<pressedOverlay> * 100%), <controlBackground>)` as the control background.
        Native: an absolutely filled overlay View inside the control, so the border
        does not fade. Sharing `opacity.disabled` with disabledOpacity is deliberate,
        not a placeholder: the theme has one "recede" opacity and both states use
        it, so a brand that retunes it moves the dim and the press tint together.'
      locked: false
    controlBorderInvalid:
      token: color.border.danger
      part: control
      description: 'Border color while invalid (`invalid` or `error`), in every state:
        it replaces controlBorder on an unchecked box and the controlSelectedBackground-colored
        border on a checked or mixed box (the fill stays controlSelectedBackground).
        Border color precedence: invalid, then selected, then rest. Focus never hides
        it: on web/Lit the focus ring is a separate outline; on native, where focus
        is drawn on the border, a focused invalid box keeps this color and only the
        width changes to focusRingWidth, as in Input.'
      locked: false
    controlSize:
      token: space.5
      part: control
      locked: false
    controlRadius:
      token: radius.sm
      part: control
      locked: false
    gap:
      token: space.2
      part: label
      description: 'Horizontal gap between control and label (the row''s flex gap).
        The gap is part of the hit area: a press on it toggles.'
      locked: false
    partGap:
      token: space.1
      part: description
      description: Vertical gap between label and description (the text column inside
        the row), and between the row and the error message below it (the root column's
        gap). The error message is indented by controlSize + gap on every platform,
        as padding-inline-start on the message itself, never a margin, so it lines
        up with the label rather than the control. The indent is unconditional, hideLabel
        included, so the message keeps the same inset whether or not a label is visible.
      locked: false
    labelColor:
      token: color.foreground
      part: label
      description: 'Web/Lit: the native <label>''s own rule. Native: the label Text''s
        `default` tone, no hook.'
      locked: true
    labelSize:
      token: font.size.md
      part: label
      description: 'Web/Lit: the native <label>''s own rule. Native: forwarded to
        the label Text as its `fontSize` override (Text `size: md`).'
      locked: false
    labelWeight:
      token: font.weight.regular
      part: label
      description: 'Web/Lit: the native <label>''s own rule. Native: forwarded to
        the label Text as its `fontWeight` override (Text `weight: regular`).'
      locked: false
    helperSize:
      token: font.size.sm
      part: description
      description: Description and error text size. Reaches the composed Texts only
        through their `fontSize` override, with fontFamily and lineHeight forwarded
        the same way; no --ds-checkbox-* hook, the documented exception to the rule
        that every binding gets one, because there is no element of Checkbox's own
        to hang it on. fontFamily and lineHeight do keep their hooks, since they are
        also the label's own rule.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone; no --ds-checkbox-*
        hook.
      locked: true
    errorText:
      token: color.foreground.danger
      part: errorMessage
      description: Realised by the composed Text's `danger` tone; no --ds-checkbox-*
        hook.
      locked: true
    fontFamily:
      token: font.family.body
      part: label
      description: The label's own rule on web/Lit (forwarded to the label Text on
        native), and forwarded to the description and error Texts.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: label
      description: 'As fontFamily: the label''s own rule on web/Lit, forwarded to
        every composed Text.'
      locked: false
    focusRing:
      token: color.border.focus
      part: control
      description: 'Web/Lit: an outline of focusRingWidth in this color around the
        control on :focus-visible. Native (hardware keyboard focus): the control''s
        border takes this color at focusRingWidth while focused (an invalid box keeps
        controlBorderInvalid and only the width changes); the box keeps its size,
        so the glyph area shrinks by the width difference. The focused width is never
        thinner than the rest width: it is the larger of focusRingWidth and controlBorderWidth,
        so a controlBorderWidth override wider than border.width.focus keeps its width
        on focus.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: control
      description: Width of the focus ring, and on web and Lit its outline-offset
        as well, so the ring clears the control's own border rather than sitting on
        it.
      locked: true
    minTarget:
      token: size.target.comfortable
      part: control
      description: 'Minimum height of the control + label row. It is the comfortable
        target, above the 24px floor `target-24px` asks for, so satisfying this binding
        satisfies the requirement everywhere. the whole row is the hit area, including
        the gap. The row aligns its children to the start of the cross axis, with
        paddingBlock max(0, (minTarget − labelSize × lineHeight) / 2) on each side
        — clamped at zero, so an override that makes the line box taller than the
        target grows the row instead of producing a negative padding — and minTarget
        as a minimum height, so a single-line row is exactly this tall. The control
        is not offset by a margin: its box is one label line box tall (labelSize ×
        lineHeight) with the control centred inside it, which is how it lands on the
        label''s first line, and a wrapping label or a description grows the row downwards
        without pulling it off that line (as Switch). The construction is the same
        with hideLabel — the hidden label still sets the line box, so the control
        stays centred and the row keeps its height — which is also why hideLabel together
        with a description puts the control on the empty label line, above the description''s
        first line rather than beside it. The error message sits below the row, outside
        the hit area.'
      locked: true
    disabledOpacity:
      token: opacity.disabled
      part: control
      description: 'Dims the control (with its indicator) and the label. The description
        and error stay at full opacity so they remain readable. The dimmed label does
        not meet AA on its own, and contrast-aa and this binding coexist only because
        a disabled control is exempt: the control must therefore always report its
        disabled state to the platform (aria-disabled on web and Lit, and mirrored
        onto the DOM node under react-native-web), or the dim becomes a real contrast
        failure.'
      locked: false
    transition:
      token: motion.duration.fast
      part: control
      description: 'The control''s background (fill) and border color transitions
        in every state, with motion.easing.standard — the invalid and focus border
        colors are part of it, so entering and leaving those states cross-fades like
        a check does rather than snapping. The indicator is not animated: the check
        and dash Icons are mounted and unmounted (nothing is rendered when unchecked),
        so they appear, disappear and swap check↔dash instantly. Instant under reduced
        motion.'
      locked: false
  copy:
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    requiredIndicator: ' (required)'
    checked: Checked
    unchecked: Unchecked
    mixed: Mixed
  a11y:
    role: checkbox
    requires:
    - label-association
    - error-identification
    - focus-visible
    - keyboard-operable
    - target-24px
    - contrast-aa
    contrast:
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      nonText: true
    - foreground: color.control.border
      background: color.background
      level: AA
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.foreground.danger
      background: color.background
      level: AA
  form:
    role: field
    value: checked
    valueType: boolean
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
      element: input
      attributes:
      - type=checkbox
      - id
      - name
      - value
      - aria-describedby
      - aria-invalid
      - aria-required
      - aria-checked
      notes: 'A native <input type="checkbox"> styled with appearance: none — never
        a visually hidden input under a fake box, so native form participation, click-on-label
        and Space all keep working. `indeterminate` is set as the DOM property (it
        has no attribute) and mirrored as aria-checked="mixed". The root is a wrapper
        div (data-ds), but the forwarded ref resolves to the <input>, the interactive
        native element, as in Input. A click whose target is the row itself (the gap),
        the text column itself (including the partGap between label and description)
        or the description is forwarded to the input. The <input> is never React-controlled:
        it gets `defaultChecked` and keeps its native checked state, and the component
        mirrors the live state in React only to render the indicator; with a controlled
        `checked` prop the component writes the prop back to the DOM `checked` property
        after reporting the change, so the box follows the prop. Fieldset''s group
        `disabled` arrives as the `disabled` prop Fieldset passes to its direct child
        fields; there is no React FieldsetContext. copy.checked, copy.unchecked and
        copy.mixed are not used (native checked state plus aria-checked=mixed). The
        Form''s message reaches the error slot through FormContext''s `errors[name]`,
        which is the only channel React has: the Form marks a failing field by setting
        `invalid` and cannot set a prop on a child it does not own.'
    lit:
      tag: ds-checkbox
      reflect:
      - indeterminate
      - disabled
      - required
      - invalid
      notes: 'Form-associated via ElementInternals: setFormValue(checked ? value :
        null). The internal <input> is in the shadow root with delegatesFocus, and
        its native `change` is not composed, so re-dispatch a composed `change` CustomEvent
        from the host. `checked` behaves like a native input: the `checked` attribute
        is the initial state only and the property tracks the live state, so `checked`
        is not reflected. The property starts from the `checked` attribute, else `defaultChecked`,
        and every toggle updates it; there is no controlled mode on Lit. It is a plain
        Boolean property, so a later change of the `checked` attribute also sets the
        live state; formResetCallback restores the `checked` attribute, else `defaultChecked`.
        The locally cleared mixed indicator is private state reset whenever the `indeterminate`
        property changes value; the reflected `indeterminate` attribute stays set
        while the dash is cleared, and re-setting the same value is not a change (set
        it false, then true, to show the dash again). ds-form marks a failing field
        only by setting `invalid`, so on Lit the error order is `error`, then the
        `invalid`-derived copy.required / copy.invalid. Native form value is `checked
        ? value : null` (native semantics); ds-form collects the boolean `checked`
        (`currentValue`, false when unchecked). Validity (ElementInternals) is error
        > required-and-unchecked (valueMissing) > invalid, whether or not `invalid`
        is set, as in Input; the rendered error still waits for `invalid` (see Behavior).
        The host''s discovery attribute carries a value, `data-ds-field="change"`:
        ds-form reads it to know the field revalidates on change, which is what `validate:
        blur` means for a checkbox. The inner input''s `name` and `value` attributes
        are inert on Lit — an input inside a shadow root is never submitted — and
        are kept only for parity with the web element; the real form value is the
        ElementInternals one. A form reset restores the mixed indicator along with
        `checked`, since a reset returns the field to its initial rendering. Group
        disabled: ds-fieldset sets the `disabled` property on its direct data-ds-field
        children (the host carries `data-ds-field`), and the field also honours formDisabledCallback
        from a native fieldset or form. Shadow parts use the anatomy names verbatim
        for both `part` and `data-part` (control, indicator, label, description, errorMessage).
        copy.checked, copy.unchecked and copy.mixed are not used.'
    rn:
      element: Pressable
      props:
      - accessibilityRole=checkbox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      notes: 'No native checkbox in core RN. Render Pressable (the row) containing
        a drawn control View and the text column (label Text, description Text); accessibilityState={{
        checked: indeterminate ? "mixed" : checked, disabled }}. Disabled uses accessibilityState.disabled
        and a press guard, never the Pressable `disabled` prop (it removes focus),
        so the row stays focusable. The label is a composed Text (`size: md`, `weight:
        regular`, tone default) with labelSize, labelWeight, fontFamily and lineHeight
        passed through its overrides. accessibilityLabel is the label plus copy.requiredIndicator
        when required, prefixed by the Fieldset legend from FieldsetContext (which
        also carries the group `disabled`) as ''<legend>, <label>''. The drawn control
        is hidden from accessibility (accessibilityElementsHidden, importantForAccessibility="no"),
        so the Pressable row is the one accessible element; RN tests check that instead
        of querying the control. The error Text renders below the Pressable, outside
        it (a tap on it does not toggle and it is not in the hint), separated by partGap.
        RN has no invalid accessibility state: invalid is shown by controlBorderInvalid
        and conveyed to assistive technology by the error text through accessibilityLiveRegion
        (Android) / AccessibilityInfo.announceForAccessibility (iOS), as in Input;
        inside a Form with `errorSummary` on, the summary is the announcement, so
        the error Text''s live region is "none" and iOS makes no announcement for
        it. Outside a Form the error still announces, but never on the first render:
        the announcement fires when the message appears or changes after mount, so
        a field that starts invalid is read in sequence instead of interrupting. react-native-web
        drops accessibilityState, so the role''s required states are mirrored for
        it — `aria-checked` as a prop and `aria-disabled` set on the DOM node in an
        effect, as Button does — without which the checkbox ships a role with no state
        and the dimmed label reads as a contrast failure. RN tests of the error check
        its text. copy.checked, copy.unchecked and copy.mixed are not used.'
    swiftui:
      element: Toggle
      props:
      - Toggle
      - .toggleStyle=custom
      - .accessibilityValue
      - .accessibilityAddTraits
      - .frame=minHeight
      - .contentShape
      - Icon
      notes: A `Toggle` with a package `ToggleStyle` that draws the box from tokens
        and a `check`/`dash` Icon — SwiftUI exposes a Toggle to VoiceOver as a switch
        with on/off; the style adds `.accessibilityValue(copy.checked / copy.unchecked
        / copy.mixed)` so the state is spoken as a checkbox state (these three copy
        strings are used on SwiftUI only), and `indeterminate` sets the mixed value
        and the dash glyph. The label is the Toggle's label view (`hideLabel` → `.labelsHidden()`
        with `.accessibilityLabel`). Description and error as Input. Registers with
        the Form environment; `disabled` per the conventions.
  behavior:
  - name: click-on-control-toggles-on
    when:
      click: control
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: click-on-label-toggles
    when:
      click: label
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: click-on-description-toggles
    description: The description is not inside the label (it would join the accessible
      name); a click on it is forwarded to the control.
    given:
      description: One email a month about new features.
    when:
      click: description
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
  - name: space-toggles
    when:
      key: Space
    then:
    - event: onChange
      with: true
    - state: checked
      is: true
    platforms:
    - web
    - lit
  - name: enter-is-ignored
    description: Enter submits the enclosing form on web; the component must not intercept
      it.
    when:
      key: Enter
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    platforms:
    - web
    - lit
  - name: toggles-back-off
    given:
      defaultChecked: true
    when:
      click: control
    then:
    - event: onChange
      with: false
    - state: checked
      is: false
  - name: indeterminate-is-announced-as-mixed
    given:
      indeterminate: true
    then:
    - state: checked
      is: mixed
  - name: disabled-does-not-toggle
    given:
      disabled: true
    when:
      click: control
    then:
    - event: onChange
      fired: false
    - state: checked
      is: false
    - state: disabled
      is: true
  - name: disabled-stays-focusable
    description: aria-disabled, not the native attribute, so the control stays in
      the tab order.
    given:
      disabled: true
    then:
    - focusable: true
    platforms:
    - web
    - lit
  - name: required-is-shown-in-the-label
    given:
      required: true
    then:
    - copy: requiredIndicator
  - name: error-marks-invalid-and-is-announced
    description: RN has no invalid accessibility state or alert role; there it checks
      the error text, which is announced through the live region / announcement.
    given:
      error: Accept the terms to continue.
    then:
    - text: Accept the terms to continue.
    - state: invalid
      is: true
      platforms:
      - web
      - lit
    - role: alert
      platforms:
      - web
      - lit
  - name: controlled-follows-prop
    description: With `checked` provided the checkbox reports the change but does
      not flip on its own. Not Lit; there the `checked` property is the live state,
      like a native input, and only the attribute is initial.
    given:
      checked: false
    when:
      click: control
    then:
    - event: onChange
      with: true
    - state: checked
      is: false
    platforms:
    - web
    - rn
  - name: hidden-label-is-still-the-accessible-name
    description: hideLabel removes the label from view, not from the accessible name.
    given:
      hideLabel: true
    then:
    - name: true
  examples:
  - name: consent
    description: A required consent checkbox whose label is the agreement itself.
    given:
      label: I accept the terms of service
      name: terms
      required: true
  - name: select-all-parent
    description: A "select all" parent showing the mixed indicator while only some
      children are checked.
    given:
      label: Select all
      name: selectAll
      indeterminate: true
  - name: with-description
    description: An option whose scope needs one line of explanation under the label.
    given:
      label: Send me product updates
      name: updates
      description: One email a month about new features.
  - name: selection-column
    description: A row selection checkbox in a Table, where the row name is the hidden
      label.
    given:
      label: Select row
      name: select
      hideLabel: true
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `checked: boolean`
  - fires on: user

## Controlled state

- `checked` is controlled when given, uncontrolled from `defaultChecked` when omitted; changes reported by `onChange` (emit `onChange`); drives state `checked`

## Parts and slots

- `control`: element
- `indicator`: component `Icon`; props `size` = "xs"; forwards `indicator` → `overrides.color`
- `label`: element
- `description`: component `Text`; props `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`
- `errorMessage`: component `Text`; props `size` = "sm", `tone` = "danger"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`, `lineHeight` → `overrides.lineHeight`

## Style bindings

- `controlBackground`: token `color.control.background`; part `control`
- `controlBorder`: token `color.control.border`; part `control`; locked
- `controlBorderWidth`: token `border.width.thin`; part `control`
- `controlSelectedBackground`: token `color.control.selectedBackground`; part `control`; locked
- `indicator`: token `color.control.selectedForeground`; part `indicator`; locked
- `indicatorStroke`: token `border.width.focus`; part `indicator`; locked
- `pressedOverlay`: token `opacity.disabled`; part `control`; state `pressed`
- `controlBorderInvalid`: token `color.border.danger`; part `control`
- `controlSize`: token `space.5`; part `control`
- `controlRadius`: token `radius.sm`; part `control`
- `gap`: token `space.2`; part `label`
- `partGap`: token `space.1`; part `description`
- `labelColor`: token `color.foreground`; part `label`; locked
- `labelSize`: token `font.size.md`; part `label`
- `labelWeight`: token `font.weight.regular`; part `label`
- `helperSize`: token `font.size.sm`; part `description`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `fontFamily`: token `font.family.body`; part `label`
- `lineHeight`: token `font.lineHeight.normal`; part `label`
- `focusRing`: token `color.border.focus`; part `control`; locked
- `focusRingWidth`: token `border.width.focus`; part `control`; locked
- `minTarget`: token `size.target.comfortable`; part `control`; locked
- `disabledOpacity`: token `opacity.disabled`; part `control`
- `transition`: token `motion.duration.fast`; part `control`

## Form and overlay

```yaml
form:
  role: field
  value: checked
  valueType: boolean
  name: name
  validation:
  - required
  - invalid
  messages:
    required: required
    invalid: invalid
  discovery: context
```

## Constants and examples

- example `consent`, story `Consent`: given `label: "I accept the terms of service"`, `name: "terms"`, `required: true`; A required consent checkbox whose label is the agreement itself.
- example `select-all-parent`, story `SelectAllParent`: given `label: "Select all"`, `name: "selectAll"`, `indeterminate: true`; A "select all" parent showing the mixed indicator while only some children are checked.
- example `with-description`, story `WithDescription`: given `label: "Send me product updates"`, `name: "updates"`, `description: "One email a month about new features."`; An option whose scope needs one line of explanation under the label.
- example `selection-column`, story `SelectionColumn`: given `label: "Select row"`, `name: "select"`, `hideLabel: true`; A row selection checkbox in a Table, where the row name is the hidden label.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `controlBackground`, `controlBorderWidth`, `pressedOverlay`, `controlBorderInvalid`, `controlSize`, `controlRadius`, `gap`, `partGap`, `labelSize`, `labelWeight`, `helperSize`, `fontFamily`, `lineHeight`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `controlBorder`, `controlSelectedBackground`, `indicator`, `indicatorStroke`, `labelColor`, `descriptionText`, `errorText`, `focusRing`, `focusRingWidth`, `minTarget`

## Behavior scenarios (16)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-on-control-toggles-on
  when:
    click: control
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: click-on-label-toggles
  when:
    click: label
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: click-on-description-toggles
  description: The description is not inside the label (it would join the accessible
    name); a click on it is forwarded to the control.
  given:
    description: One email a month about new features.
  when:
    click: description
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
- name: space-toggles
  when:
    key: Space
  then:
  - event: onChange
    with: true
  - state: checked
    is: true
  platforms:
  - web
  - lit
- name: enter-is-ignored
  description: Enter submits the enclosing form on web; the component must not intercept
    it.
  when:
    key: Enter
  then:
  - event: onChange
    fired: false
  - state: checked
    is: false
  platforms:
  - web
  - lit
- name: toggles-back-off
  given:
    defaultChecked: true
  when:
    click: control
  then:
  - event: onChange
    with: false
  - state: checked
    is: false
- name: indeterminate-is-announced-as-mixed
  given:
    indeterminate: true
  then:
  - state: checked
    is: mixed
- name: disabled-does-not-toggle
  given:
    disabled: true
  when:
    click: control
  then:
  - event: onChange
    fired: false
  - state: checked
    is: false
  - state: disabled
    is: true
- name: disabled-stays-focusable
  description: aria-disabled, not the native attribute, so the control stays in the
    tab order.
  given:
    disabled: true
  then:
  - focusable: true
  platforms:
  - web
  - lit
- name: required-is-shown-in-the-label
  given:
    required: true
  then:
  - copy: requiredIndicator
- name: error-marks-invalid-and-is-announced
  description: RN has no invalid accessibility state or alert role; there it checks
    the error text, which is announced through the live region / announcement.
  given:
    error: Accept the terms to continue.
  then:
  - text: Accept the terms to continue.
  - state: invalid
    is: true
  - role: alert
- name: controlled-follows-prop
  description: With `checked` provided the checkbox reports the change but does not
    flip on its own. Not Lit; there the `checked` property is the live state, like
    a native input, and only the attribute is initial.
  given:
    checked: false
  when:
    click: control
  then:
  - event: onChange
    with: true
  - state: checked
    is: false
  platforms:
  - web
  - rn
- name: hidden-label-is-still-the-accessible-name
  description: hideLabel removes the label from view, not from the accessible name.
  given:
    hideLabel: true
  then:
  - name: true
- name: renders
  then:
  - renders: true
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

## Platform notes (web)

```yaml
element: input
attributes:
- type=checkbox
- id
- name
- value
- aria-describedby
- aria-invalid
- aria-required
- aria-checked
notes: "A native <input type=\"checkbox\"> styled with appearance: none \u2014 never\
  \ a visually hidden input under a fake box, so native form participation, click-on-label\
  \ and Space all keep working. `indeterminate` is set as the DOM property (it has\
  \ no attribute) and mirrored as aria-checked=\"mixed\". The root is a wrapper div\
  \ (data-ds), but the forwarded ref resolves to the <input>, the interactive native\
  \ element, as in Input. A click whose target is the row itself (the gap), the text\
  \ column itself (including the partGap between label and description) or the description\
  \ is forwarded to the input. The <input> is never React-controlled: it gets `defaultChecked`\
  \ and keeps its native checked state, and the component mirrors the live state in\
  \ React only to render the indicator; with a controlled `checked` prop the component\
  \ writes the prop back to the DOM `checked` property after reporting the change,\
  \ so the box follows the prop. Fieldset's group `disabled` arrives as the `disabled`\
  \ prop Fieldset passes to its direct child fields; there is no React FieldsetContext.\
  \ copy.checked, copy.unchecked and copy.mixed are not used (native checked state\
  \ plus aria-checked=mixed). The Form's message reaches the error slot through FormContext's\
  \ `errors[name]`, which is the only channel React has: the Form marks a failing\
  \ field by setting `invalid` and cannot set a prop on a child it does not own."
```

## Guidance

## Overview

A checkbox is a single yes/no choice that the user makes and then submits, as opposed to a Switch, which takes effect the moment it is flipped. Groups of checkboxes are a multi-select; a single checkbox is consent, an agreement, or an option.

## When to use

Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`), or several, each with its own `name`, when the user may pick any number of items. Use `indeterminate` on a "select all" parent when only some of its children are checked.

## When not to use

Do not use a Checkbox for a setting that applies immediately without a submit step; use Switch. Do not use it to pick exactly one of several options; use RadioGroup. Do not use a lone checkbox as an on/off for something with a strong, immediate effect (sound, notifications) — that is a Switch even if it sits in a form.

## Behavior

Clicking or tapping anywhere on the row — control, label, or description — toggles the state and fires `onChange` with the new boolean. The description is not inside the label (it would join the accessible name); a click on it is forwarded to the control. Space toggles from the keyboard; Enter does not (it submits the enclosing form on web, and the component must not intercept that). The whole row is the hit area, including the gap between control and label and the gap between label and description; the error message below the row is not (a click on it does nothing). Uncontrolled unless `checked` is provided (on Lit the `checked` property is always the live state; see the Lit note). `onChange` fires only for a user toggle: nothing fires on mount, and a controlled `checked` catching up with a change already reported does not fire again. Toggling an `indeterminate` checkbox sets `checked` to `!checked` and clears the mixed indicator locally (aria-checked, the DOM property, the dash) until the `indeterminate` prop changes value again; a consumer that keeps passing `true` unchanged sees it cleared. Consumers who own the mixed state update `indeterminate` in `onChange`, and decide what happens to the children. `disabled` controls are visible, readable and focusable (`aria-disabled`, not the native attribute), and are skipped by the Form; `disabledOpacity` dims the control and label, not the description or error. `required` appends `copy.requiredIndicator` to the label and sets `aria-required`; the indicator is plain label text at the label's size and color (not aria-hidden) and is part of the accessible name on every platform, including the native accessibilityLabel. Error display: the error slot shows `error` when set, else the Form's message, else — only while `invalid` is true — `copy.required` if the box is required and unchecked, otherwise `copy.invalid`. Validity (`validationMessage`, ElementInternals, and the Form's `validate()`) always follows the full order whatever `invalid` is — `error`, then required-and-unchecked (`copy.required`, valueMissing), then `invalid` (`copy.invalid`) — the same as Input: a required, unchecked box fails Form validation without `invalid` being set, while the rendered message still waits for `invalid`. On Lit there is no Form-message step (ds-form only sets `invalid`). The Form marks a failing field by setting its `invalid` and never sets `error`. Inside a Form, `validate: blur` means "on change" for a checkbox; there is no useful blur moment. The Form (React, React Native, ds-form) collects the boolean `checked` under `name` — `false` when unchecked. `value` is only what a native HTML `<form>` submits when checked (web and Lit). Several checkboxes sharing a `name` are not a multi-select under Form: give each its own name. Inside a Fieldset the group's `disabled` applies as if set on the field — on web through the `disabled` prop Fieldset passes to its direct child fields, on Lit through the `disabled` property ds-fieldset sets on its direct data-ds-field children (or formDisabledCallback from a native fieldset/form), and on native through `FieldsetContext`, which also carries the legend that prefixes the accessibility label ("Shipping address, Street"). The label is a native `<label for>` on web/Lit, styled from Checkbox's label bindings, and a composed Text on native; description and error are Text.

## Content guidelines

Labels are short, positive statements of what checking does ("Send me product updates"), never negated ("Do not send me…") — a negated checkbox is a double negative when unchecked. Descriptions explain consequence or scope in one sentence. Errors say what to do, not what is wrong ("Accept the terms to create your account").

## Accessibility

The label is visible and associated with the control (WCAG 1.3.1, 3.3.2), so the accessible name is the label and the whole row is the target. The state is conveyed by the native checked state or `aria-checked`, including `mixed` (4.1.2), and the visual indicator is a shape — check mark, dash — not only a color change (1.4.1). Description and error are linked with `aria-describedby`, and the error uses `role="alert"` (3.3.1). Focus is visible on the control with the focus ring (2.4.7). The row is at least 44px tall on every platform and the control itself is 20px, inside the 24px minimum target when the row is the hit area (2.5.8). The selected fill and the rest border both meet 3:1 against the page background as UI component boundaries (1.4.11), and the indicator meets 4.5:1 on the selected fill; the build checks all pairs.

## Platform notes

### Web
Render `<input type="checkbox">` with `appearance: none` and draw the box in CSS using the control tokens; the check mark and dash are the composed Icon in the indicator span stacked over the input (see the `indicator` binding). Label it with `<label for>`, link description and error with `aria-describedby`. For disabled, set `aria-disabled` and call `preventDefault()` in both `click` and `change` handlers (checkboxes ignore `readOnly`) so the input stays focusable but does not toggle. `aria-checked` is set only to `"mixed"` when indeterminate; the native checked state covers the rest. Set `input.indeterminate = true` via the DOM property and add `aria-checked="mixed"`; browsers do not expose the property as an attribute.

### Lit
`<ds-checkbox>` is form-associated (`static formAssociated = true`) so a native `<form>` sees `name`/`value`, and inside `<ds-form>` it is collected by `name` like `ds-input`. The inner `<input>` lives in the shadow root with `delegatesFocus: true`; because the native `change` event is not composed, re-dispatch a composed `change` CustomEvent with `detail: { checked }`. Expose `checkValidity()` and `reportValidity()` for `required`.

### React Native
There is no checkbox in core React Native. Render a `Pressable` with `accessibilityRole="checkbox"`, `accessibilityLabel` (the label plus `copy.requiredIndicator` when required, legend-prefixed inside a Fieldset), `accessibilityHint={description}` and `accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}`, containing a `View` drawn with the control tokens and a `Text` label. The pressed state is an overlay View inside the unchecked box showing `controlSelectedBackground` at `pressedOverlay` opacity. Space on a hardware keyboard is handled by the platform when the role is set. Errors are announced as in Input.

## Related

Switch, RadioGroup, Form, Input.
