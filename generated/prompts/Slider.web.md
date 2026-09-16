# Generate: Slider for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Slider.tsx` exporting a typed React function component named `Slider`, plus `Slider.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Slider({ ref, …rest }: SliderProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Slider> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Slider.test.tsx`.
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
  name: Slider
  category: input
  status: review
  apg: slider-multithumb
  anatomy:
  - label
  - track
  - fill
  - thumb
  - valueText
  - bubble
  - tickMarks
  - description
  - errorMessage
  composition:
    label: Text
    description: Text
    valueText: Text
  props:
    label:
      type: string
      required: true
      description: Visible label naming the quantity ("Volume", "Price range").
      a11y: aria-labelledby on each thumb; a range slider's thumbs are named "{label}
        minimum" / "{label} maximum" via copy.
    name:
      type: string
      required: true
      description: Field name for the Form. A range contributes `[min, max]`.
    min:
      type: number
      default: 0
      description: Lower bound.
    max:
      type: number
      default: 100
      description: Upper bound.
    step:
      type: number
      default: 1
      description: Arrow-key increment and snapping granularity for drag, click and
        keys.
    snapToMarks:
      type: boolean
      default: false
      description: With `marks`, snap drag and click to the marks instead of `step`
        (keys still move by step, PageUp/Down by mark).
    required:
      type: boolean
      default: false
      description: Must have a value other than the default to submit (`copy.required`).
    invalid:
      type: boolean
      default: false
      description: Marks the slider invalid (`copy.invalid` when no `error`).
    value:
      type: union
      description: Controlled value; for a range, a two-number array.
      shape: number | [number, number]
    defaultValue:
      type: union
      description: Initial value (or pair). Defaults to `min` (or `[min, max]`).
      shape: number | [number, number]
    range:
      type: boolean
      default: false
      description: Two thumbs choosing a minimum and a maximum; the thumbs cannot
        cross.
    formatValue:
      type: function
      shape: '(value: number) => string'
      description: Renders the displayed and announced value ("$40", "3 h 20 min").
        Defaults to the number.
    showValue:
      type: enum
      values:
      - always
      - hover
      - never
      default: always
      description: 'Where the value text appears: always beside the label, only while
        dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput
        beside the slider shows it).'
    marks:
      type: array
      shape: '{ value: number; label?: string }[]'
      description: Tick marks on the track, optionally labelled. Values snap to marks
        when `step` is omitted.
    disabled:
      type: boolean
      default: false
      description: Not adjustable, still readable.
    description:
      type: string
      description: Helper text.
    error:
      type: string
      description: Error message.
  events:
    onChange:
      description: Fired on every value change while dragging or with keys (number
        or pair).
      platforms:
        web: onChange
        lit: change
        rn: onValueChange
        swiftui: onChange
    onChangeEnd:
      description: Fired once when the interaction ends (pointer up, key released).
        Use for expensive effects.
      platforms:
        web: onChangeEnd
        lit: change-end
        rn: onSlidingComplete
        swiftui: onChangeEnd
  keyboard:
  - keys:
    - ArrowRight
    - ArrowUp
    action: Increases by `step`.
    from: first
    expect: manual
  - keys:
    - ArrowLeft
    - ArrowDown
    action: Decreases by `step`.
    from: first
    expect: manual
  - keys:
    - PageUp
    - PageDown
    action: Changes by ten steps (or to the next mark).
    from: first
    expect: manual
  - keys:
    - Home
    action: Sets the minimum.
    from: first
    expect: manual
  - keys:
    - End
    action: Sets the maximum.
    from: first
    expect: manual
  - keys:
    - Tab
    action: Moves between the two thumbs of a range slider; each thumb is a tab stop.
    when: range
    from: first
    expect: focus-next
  styles:
    track:
      token: color.background.strong
      locked: false
    fill:
      token: color.control.selectedBackground
      locked: true
    trackHeight:
      token: space.1
      locked: false
    trackRadius:
      token: radius.full
      locked: false
    thumb:
      token: color.control.background
      locked: false
    thumbBorder:
      token: color.control.selectedBackground
      locked: true
    thumbBorderWidth:
      token: border.width.focus
      locked: true
    thumbSize:
      token: space.5
      locked: false
    thumbShadow:
      token: shadow.raised
      locked: false
    thumbActiveScale:
      token: opacity.disabled
      description: Not a scale — the pressed thumb shows a halo of the fill color
        at this opacity, thumbSize larger on each side (space.2). No literal scale
        factor exists.
      locked: false
    mark:
      token: color.border.strong
      locked: false
    markSize:
      token: space.1
      locked: false
    markLabelColor:
      token: color.foreground.muted
      locked: true
    markLabelSize:
      token: font.size.xs
      locked: false
    valueColor:
      token: color.foreground
      locked: true
    valueSize:
      token: font.size.sm
      locked: false
    bubbleSurface:
      token: color.inverse.surface
      description: The hover/drag value bubble uses the inverse surface, like Tooltip.
      locked: true
    bubbleText:
      token: color.inverse.foreground
      locked: true
    bubbleRadius:
      token: radius.sm
      description: 'The bubble is its own part (not the valueText Text): an inverse-surface
        pill above the active thumb.'
      locked: false
    labelWeight:
      token: font.weight.medium
      locked: false
    partGap:
      token: space.1
      locked: false
    trackPaddingBlock:
      token: space.3
      description: Vertical space around the track so the thumb and its halo have
        room and the touch target reaches the comfortable size.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      locked: true
    errorText:
      token: color.foreground.danger
      locked: false
    minTarget:
      token: size.target.comfortable
      description: The thumb's hit area.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: Halo and bubble appearance; the thumb itself follows the pointer
        with no transition.
      locked: false
  copy:
    minimumLabel: '{label} minimum'
    maximumLabel: '{label} maximum'
    rangeText: '{low} – {high}'
    required: '{label} is required.'
    invalid: '{label} is not valid.'
  a11y:
    role: slider
    requires:
    - accessible-name
    - label-association
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-44px
    - gesture-alternative
    - error-identification
    - reduced-motion
    contrast:
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - role=slider
      - tabindex=0
      - aria-valuenow
      - aria-valuemin
      - aria-valuemax
      - aria-valuetext
      - aria-labelledby
      - aria-describedby
      - aria-orientation
      - aria-disabled
      notes: Custom thumbs (<div role="slider" tabindex="0">) on a track rather than
        <input type="range">, because a range slider needs two thumbs on one track
        and the native element cannot be themed consistently. Pointer Events with
        setPointerCapture on the track and thumbs; the track click moves the nearest
        thumb. aria-valuetext from formatValue. A hidden <input name> (two for a range)
        carries the value for native forms.
    lit:
      tag: ds-slider
      reflect:
      - range
      - disabled
      - show-value
      notes: Form-associated (FormData with two entries for a range). Composed `change`
        (detail { value }) and `change-end`. Thumbs are shadow elements with role="slider".
    rn:
      element: View
      props:
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityValue
      - accessibilityActions
      - onAccessibilityAction
      notes: 'Drawn with Views and a PanResponder per thumb (no new dependency; the
        community Slider has no range support and would not take tokens). accessibilityRole="adjustable"
        with accessibilityActions increment/decrement handled in onAccessibilityAction
        (VoiceOver swipe up/down, TalkBack volume keys), accessibilityValue={{ min,
        max, now, text }}. A range renders two adjustable elements. The drag gesture
        is additive: the adjustable actions are the non-gesture path.'
    swiftui:
      element: ZStack
      props:
      - GeometryReader
      - DragGesture
      - .accessibilityAdjustableAction
      - .accessibilityValue
      - .accessibilityElement
      - .focusable
      - .onMoveCommand
      - .onKeyPress
      - '@FocusState'
      - Capsule
      notes: Drawn from the tokens (track `Capsule`, fill, thumb `Circle`s) with a
        `DragGesture` per thumb in a `GeometryReader` — not SwiftUI's `Slider` (single
        value, untinted thumb). Each thumb is an accessibility element (`.accessibilityLabel(thumbLabel)`,
        `.accessibilityValue(formatValue)`, `.accessibilityAdjustableAction` stepping
        by `step`, Shift-step = `largeStep` via the increment/decrement with `.accessibilityAdjustableAction`'s
        direction only — the large step is a separate custom action); on iPad each
        thumb is `.focusable()` and arrows/PageUp/PageDown/Home/End follow the keyboard
        table. Range mode keeps thumbs ordered and swaps focus at the crossover. Marks
        and the value bubble per the doc; ticks from the tokens.
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `trackRadius`, `thumb`, `thumbSize`, `thumbShadow`, `thumbActiveScale`, `mark`, `markSize`, `markLabelSize`, `valueSize`, `bubbleRadius`, `labelWeight`, `partGap`, `trackPaddingBlock`, `fontFamily`, `fontSize`, `helperSize`, `errorText`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `fill`, `thumbBorder`, `thumbBorderWidth`, `markLabelColor`, `valueColor`, `bubbleSurface`, `bubbleText`, `descriptionText`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (7)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-show-value-always
  given:
    showValue: always
  then:
  - renders: true
  derived: true
- name: renders-show-value-hover
  given:
    showValue: hover
  then:
  - renders: true
  derived: true
- name: renders-show-value-never
  given:
    showValue: never
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

## Platform notes (web)

```yaml
element: div
attributes:
- role=slider
- tabindex=0
- aria-valuenow
- aria-valuemin
- aria-valuemax
- aria-valuetext
- aria-labelledby
- aria-describedby
- aria-orientation
- aria-disabled
notes: Custom thumbs (<div role="slider" tabindex="0">) on a track rather than <input
  type="range">, because a range slider needs two thumbs on one track and the native
  element cannot be themed consistently. Pointer Events with setPointerCapture on
  the track and thumbs; the track click moves the nearest thumb. aria-valuetext from
  formatValue. A hidden <input name> (two for a range) carries the value for native
  forms.
```

## Guidance

## Overview

A slider is for values you feel rather than type: volume, brightness, a price range, a zoom level. Its thumb sits on the value, the fill shows how much, and arrow keys move it by exact steps so keyboard and screen-reader users get the same precision the pointer gets by drag.

## When to use

Use a Slider for a bounded numeric value where approximate is fine and immediate feedback matters, and where the scale has meaning across its whole width. Use `range` for "between" filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry also matters.

## When not to use

Do not use a Slider for a value that must be exact or is usually typed (quantity, age): use NumberInput. Do not use it for more than about a hundred steps without marks or a paired input — fine control by drag is poor. Do not use it for two or three discrete choices (SegmentedControl). Do not use a vertical slider unless the metaphor is vertical (volume in a mixer); horizontal is the default and the only orientation in this version.

## Behavior

Dragging a thumb, or clicking the track, sets the value snapped to `step` (or to marks); arrow keys move by `step`, PageUp/Down by ten steps, Home/End to the bounds. `onChange` fires continuously; `onChangeEnd` once per interaction. In a `range`, each thumb is its own tab stop, the thumbs cannot cross (the lower is clamped to the upper and vice versa), and the value is `[min, max]`. The value text shows per `showValue`; the drag bubble follows the active thumb. `disabled` sliders are readable and focusable but inert. A range's beside-label text is `copy.rangeText`; each thumb's `aria-valuemin`/`aria-valuemax` reflect the live constraint from the other thumb. Pointer math is logical (mirrored in right-to-left). The Keyboard story renders the range form (two thumbs are the whole model; the three-focusable rule does not apply). The Form value is a number, or `[low, high]` for a range.

## Content guidelines

The label names the quantity, not the control ("Volume", not "Volume slider"). `formatValue` should produce what a person would say, with units ("$40", "70%"). Mark labels are short ("Min", "1 h", "Max"). A range's thumbs are named from `copy.minimumLabel` / `copy.maximumLabel`.

## Accessibility

Each thumb is a `slider` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` from `formatValue`, named by the label (WCAG 4.1.2; APG slider and multi-thumb slider). Keyboard operation covers every value the pointer can reach (2.1.1), and on native the `adjustable` role with increment/decrement actions replaces the drag (2.5.1 gesture-alternative). Thumbs reach 44px (2.5.8) and the fill and thumb border meet 3:1 against the page (1.4.11). The fill is not checked against the track: the thumb position and the value text carry the state, and the track is a passive rail (the same 1.4.11 exemption Meter uses), so the fill-on-track ratio in dark mode (about 2.2:1) is acceptable. The value is always available as text, never as position alone (1.3.3). Motion is limited to the halo and bubble and respects reduced motion.

## Platform notes

### Web
Render the label row (label `Text` with id, and the value `Text` when `showValue: always`), the track `<div>` with the fill `<div>` sized from the value(s), marks as `<span aria-hidden>` with optional labels, and one or two `<div role="slider" tabindex="0" aria-valuenow aria-valuemin aria-valuemax aria-valuetext aria-labelledby aria-orientation="horizontal">` thumbs positioned by percentage. Pointer Events: `pointerdown` on the track picks the nearest thumb and captures the pointer; `pointermove` maps clientX to a snapped value. Keydown on a thumb implements the table. Hidden inputs carry the value(s). The bubble is a portal-free absolutely positioned element above the active thumb.

### Lit
`<ds-slider label="Price range" name="price" range min="0" max="500" step="10">`; form-associated; thumbs in the shadow root; composed `change` and `change-end`.

### React Native
`View` track with `PanResponder` per thumb; each thumb `View` has `accessible`, `accessibilityRole="adjustable"`, `accessibilityLabel`, `accessibilityValue={{ min, max, now, text }}`, `accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}` and `onAccessibilityAction` applying `step`. `onSlidingComplete` maps to `onChangeEnd`. The bubble is a `View` above the active thumb. Form registration as Input; a range registers one field with the pair.

## Related

NumberInput, Meter, Input, SegmentedControl.
