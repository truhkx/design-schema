# Generate: Slider as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Slider.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Slider.stories.ts` covering every enum value of every enum prop.

**When the files already exist.** Read the existing element, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: SliderVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Slider.test.ts`.

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
    label:
      component: Text
      props:
        element: span
        size: md
        weight: medium
        tone: default
      forwards:
        labelWeight: fontWeight
        fontSize: fontSize
        fontFamily: fontFamily
    description:
      component: Text
      props:
        element: span
        size: sm
        tone: muted
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
    valueText:
      component: Text
      props:
        element: span
        size: sm
        tone: default
      forwards:
        valueSize: fontSize
        fontFamily: fontFamily
    errorMessage:
      component: Text
      props:
        element: span
        size: sm
        tone: danger
      forwards:
        helperSize: fontSize
        fontFamily: fontFamily
  props:
    label:
      type: string
      a11yRole: accessible-name
      required: true
      description: Visible label naming the quantity ("Volume", "Price range").
      a11y: The label is a Text `<span>` with an id, not a native `<label for>` (which
        cannot name a `div role=slider`); a single thumb takes aria-labelledby pointing
        at it (on Lit the span is in the same shadow root, so the id reference holds).
        A range slider's thumbs are named with aria-label (accessibilityLabel on native)
        set to the resolved `copy.minimumLabel` / `copy.maximumLabel`, with no hidden
        spans.
    name:
      type: string
      required: true
      description: Field name for the Form. The form value types (web/rn FormContext,
        Lit DsFormField) have no number, so a single value registers as its decimal
        string (`String(value)`) and a range as two strings `[String(low), String(high)]`;
        native form submission gets one hidden input (web) or FormData entry (Lit)
        per string, all under this name. The registration id and the Form's focus-on-error
        target is the thumb, the low thumb for a range (its first tab stop); a consumer-supplied
        `id` lands there too, and the high thumb carries no id.
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
        keys. The step grid is anchored at `min` (`min + round((raw - min) / step)
        * step`); when `(max - min)` is not a whole number of steps the last partial
        step still snaps to `max`, so the maximum is reachable by drag and click and
        not only by End.
    snapToMarks:
      type: boolean
      default: false
      description: 'With `marks`, snap drag and click to the marks instead of `step`
        (arrow keys still move by step; PageUp/Down go to the next mark, and past
        the last mark to `max`/`min`). This is the only switch for mark snapping:
        omitting `step` changes nothing, since it defaults to 1. Set without any `marks`
        the flag is inert — drag and click fall back to the step grid and PageUp/Down
        to ten steps.'
    required:
      type: boolean
      default: false
      description: 'Must have a value other than the default to submit (`copy.required`).
        "The default" is `defaultValue` when set and otherwise what `value` itself
        falls back to — `min`, or `[min, max]` for a range — clamped to [min, max]
        before comparing, so required and value share one notion of it. For a range,
        a difference in either component of the pair satisfies it: moving one thumb
        is enough. The label takes no "(required)" suffix here: a slider always shows
        a value, so the suffix would say nothing about what is missing. Required is
        a validity flag (valueMissing, message `copy.required`) checked before invalid,
        but its message is not rendered standalone: the error region shows `error`,
        else the message a Form (or `validate`) has reported, else `copy.invalid`
        when `invalid`.'
    invalid:
      type: boolean
      default: false
      description: 'Marks the slider invalid (`copy.invalid` when no `error`). There
        is no invalid colour for the track: a slider has no text to recolour and no
        border of its own, so the state is carried by aria-invalid and the error message.
        `invalid` and `error` are independent: aria-invalid is true when either is
        set, and setting or clearing `error` never changes the `invalid` prop — so
        error identification is asserted on `aria-invalid="true"` on the thumb (the
        element carrying the role), never on the `invalid` prop.'
    value:
      type: union
      description: Controlled value; for a range, a two-number array.
      shape: number | [number, number]
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      description: Initial value (or pair). Defaults to `min` (or `[min, max]`).
      shape: number | [number, number]
    range:
      type: boolean
      default: false
      description: 'Two thumbs choosing a minimum and a maximum; the thumbs cannot
        cross. A mismatch between `range` and the shape of `value`/`defaultValue`
        (`range: true` with a number, or a pair without `range`) falls back silently
        to that mode''s default — `[min, max]` for a range, `min` for one thumb —
        with no development warning; only `max <= min` warns.'
    formatValue:
      type: function
      shape: '(value: number) => string'
      description: Renders the displayed and announced value ("$40", "3 h 20 min").
        Defaults to the number. `aria-valuetext` is always emitted, including in the
        default case where it repeats `aria-valuenow`.
    showValue:
      type: enum
      values:
      - always
      - hover
      - never
      default: always
      description: 'Where the value text appears: always beside the label, only while
        dragging or focused (as a bubble above the thumb), or not at all (when a NumberInput
        beside the slider shows it). Despite its name, `hover` means pressed or focused:
        plain pointer hover does not show the bubble, and touch platforms behave identically.
        Any focus counts (not only :focus-visible), including focus a pointer press
        moves to the thumb; on React Native a core View reports focus only under react-native-web,
        so on a device the bubble is press-only. The bubble element exists only under
        `hover` — `always` shows the value beside the label and never a drag bubble.
        A range renders one bubble per thumb, each shown only while its own thumb
        is pressed or focused; every bubble is aria-hidden (active or not), since
        the thumb''s aria-valuetext already announces the same value, and the inactive
        one stays rendered at opacity 0 so `transition` can fade it. The bubble sizes
        to its content on one line, centred on the thumb; it is not constrained by
        the thumb''s hit area and may overflow it.'
    marks:
      type: array
      shape: '{ value: number; label?: string | undefined }[]'
      description: 'Tick marks on the track, optionally labelled. Values snap to marks
        only with `snapToMarks`. Generated code exports the entry type as `SliderMark`.
        The dots are the `tickMarks` part (aria-hidden): a layer on the track centre
        line inside the track area. The labels sit in an unparted aria-hidden row
        below the track area (see `markLabelGap`); each label is a Text (size xs,
        tone muted, element span) centred under its mark by a 50% offset (mirrored
        in right-to-left). There is no collision handling and no clamping at the ends:
        labels on close marks may overlap, and the labels at `min` and `max` hang
        past the track. Presses on the label row do not move a thumb — the label row
        and the mark label row paint above the thumbs and take the press, which is
        also how the overlap with a thumb''s `minTarget` hit area is resolved.'
    disabled:
      type: boolean
      default: false
      description: 'Not adjustable, still readable: thumbs stay focusable but pointer,
        keys and accessibility actions are ignored, and no value is submitted (on
        Lit `currentValue` is null while disabled). A slider disabled by an enclosing
        Form or Fieldset (Lit formDisabledCallback) behaves the same. On React Native
        the thumb View keeps `accessible` and sets accessibilityState.disabled.'
    description:
      type: string
      description: Helper text.
    error:
      type: string
      description: 'Error message. `error` is not in `form.validation`, so it is reported
        as a custom validity (web `setCustomValidity`, Lit `setValidity({ customError:
        true }, error)`) and blocks submission like the listed flags; the validity
        message follows the precedence `error`, then `copy.required`, then `copy.invalid`.'
  events:
    onChange:
      description: Fired on every value change while dragging or with keys (number
        or pair); only when the value actually changed, so a key at a bound or a click
        on the thumb fires nothing. Within one interaction the comparison is against
        the last value emitted, not the displayed value, so a controlled owner that
        never updates `value` gets each new target once; the displayed value resets
        from the prop on render.
      platforms:
        web: onChange
        lit: change
        rn: onValueChange
        swiftui: onChange
      payload:
      - name: value
        type: union
        shape: number | [number, number]
        description: The new value, or the low and high values of a range.
      fires:
      - user
    onChangeEnd:
      description: Fired once when the interaction ends (pointer up, key released),
        and only if that interaction changed the value (End at max or a click on the
        thumb fires nothing). Use for expensive effects.
      platforms:
        web: onChangeEnd
        lit: change-end
        rn: onSlidingComplete
        swiftui: onChangeEnd
      payload:
      - name: value
        type: union
        shape: number | [number, number]
        description: The final value, or the low and high values of a range.
      fires:
      - user
      timing:
        phase: commit
  keyboard:
  - keys:
    - ArrowRight
    - ArrowUp
    action: Increases by `step`. ArrowRight is mirrored in a right-to-left layout
      (it decreases there), read from the thumb's — on Lit the host's — computed `direction`
      at keydown, as in Tabs and SegmentedControl; ArrowUp always increases.
    from: first
    expect: manual
  - keys:
    - ArrowLeft
    - ArrowDown
    action: Decreases by `step`. ArrowLeft is mirrored in a right-to-left layout (it
      increases there); ArrowDown always decreases.
    from: first
    expect: manual
  - keys:
    - PageUp
    - PageDown
    action: Changes by ten steps, clamped to the bounds (with `snapToMarks`, to the
      next mark, and to `max`/`min` past the last mark). Not mirrored in right-to-left.
    from: first
    expect: manual
  - keys:
    - Home
    action: Sets the minimum — for a range thumb the live constraint from the other
      thumb, not `min`, so the action can never cross the thumbs.
    from: first
    expect: manual
  - keys:
    - End
    action: Sets the maximum — for a range thumb the live constraint from the other
      thumb, not `max`.
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
      part: track
      locked: false
    fill:
      token: color.control.selectedBackground
      part: fill
      locked: true
    trackHeight:
      token: space.1
      part: track
      locked: false
    trackRadius:
      token: radius.full
      part: track
      locked: false
    thumb:
      token: color.control.background
      part: thumb
      locked: false
    thumbBorder:
      token: color.control.selectedBackground
      part: thumb
      locked: true
    thumbBorderWidth:
      token: border.width.focus
      part: thumb
      locked: true
    thumbSize:
      token: space.5
      part: thumb
      locked: false
    thumbShadow:
      token: shadow.raised
      part: thumb
      locked: false
    thumbActiveScale:
      token: opacity.disabled
      part: thumb
      description: Not a scale — the pressed thumb shows a circular halo of the fill
        color at this opacity, centred on the knob, with diameter thumbSize + 2 ×
        haloSpread. No literal scale factor exists. Focus alone never shows it. On
        React Native, where there is no hover and no press state distinct from a drag,
        the halo shows while a gesture owns that thumb (including a track press that
        grabbed it).
      locked: false
    haloSpread:
      token: space.2
      part: thumb
      description: How far the pressed-thumb halo extends beyond the knob on each
        side.
      locked: false
    mark:
      token: color.border.strong
      part: tickMarks
      description: Mark dot colour.
      locked: false
    markSize:
      token: space.2
      part: tickMarks
      description: Mark dot diameter. Deliberately larger than trackHeight so a mark
        reads as a tick standing proud of the rail rather than a bump on it.
      locked: false
    markLabelColor:
      token: color.foreground.muted
      part: tickMarks
      description: Realised by the mark label Text's tone muted; no hook of its own.
      locked: true
    markLabelSize:
      token: font.size.xs
      part: tickMarks
      description: Forwarded to each mark label Text's fontSize override (fontFamily
        is forwarded too); never styles the Text directly.
      locked: false
    markLabelGap:
      token: space.1
      part: tickMarks
      description: Gap between the bottom of the track area (after trackPaddingBlock)
        and the mark label row; `partGap` does not apply between them (on React Native,
        a column wraps the track area and the label row with this gap). The slider
        grows by the label line (markLabelSize × font.lineHeight.normal) only when
        some mark has a label.
      locked: false
    valueColor:
      token: color.foreground
      part: valueText
      description: Realised by the value Text's tone default; no hook of its own.
      locked: true
    valueSize:
      token: font.size.sm
      part: valueText
      description: Forwarded to the value Text's fontSize override, and to the bubble's
        Text the same way.
      locked: false
    bubbleSurface:
      token: color.inverse.surface
      part: bubble
      description: The hover/drag value bubble uses the inverse surface, like Tooltip.
      locked: true
    bubbleText:
      token: color.inverse.foreground
      part: bubble
      description: 'The bubble''s value is a Text (size sm, tone default) with valueSize
        forwarded. Its colour is not forwarded (Text color is locked): web and Lit
        re-scope `--color-foreground` on the bubble, React Native provides TextForegroundContext,
        as Text''s `color` binding describes.'
      locked: true
    bubblePaddingBlock:
      token: space.1
      part: bubble
      locked: false
    bubblePaddingInline:
      token: space.2
      part: bubble
      locked: false
    bubbleOffset:
      token: space.1
      part: bubble
      description: Gap between the bubble's bottom edge and the top of the active
        thumb's hit area (minTarget); the bubble is centred horizontally on the thumb.
      locked: false
    bubbleRadius:
      token: radius.sm
      part: bubble
      description: 'The bubble''s corners, the same shape as a Tooltip. The bubble
        is its own part (not the valueText Text): an inverse-surface pill above the
        active thumb.'
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text's fontWeight override.
      locked: false
    partGap:
      token: space.1
      description: Vertical gap on the slider root between the label row, the track
        area, and the description/error message.
      locked: false
    labelGap:
      token: space.2
      part: label
      description: Horizontal gap between the label and the value text in the label
        row.
      locked: false
    trackPaddingBlock:
      token: space.3
      part: track
      description: Vertical space around the track so the thumb and its halo have
        room and the touch target reaches the comfortable size. It pads the track
        area, an unparted wrapper around the track and thumbs that is also the pointer
        hit area, never the coloured rail itself (padding the rail would thicken it).
      locked: false
    fontFamily:
      token: font.family.body
      part: label
      description: Forwarded to every composed Text's fontFamily override (label,
        value, bubble, mark labels, description, error); never styles them directly.
      locked: false
    fontSize:
      token: font.size.md
      part: label
      description: Forwarded to the label Text's fontSize override.
      locked: false
    helperSize:
      token: font.size.sm
      part: description
      description: Forwarded to the description and error message Texts' fontSize
        overrides.
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      description: Realised by the composed Text's `muted` tone; no hook of its own.
      locked: true
    errorText:
      token: color.foreground.danger
      part: errorMessage
      locked: true
      description: Realised by the composed Text's `danger` tone; no hook of its own,
        since Text's colour is locked and a hook could not reach the child without
        restyling it (the same as Input). Locked means absent from the overridable
        type, not accepted and ignored.
    minTarget:
      token: size.target.comfortable
      part: thumb
      description: 'The thumb''s hit area, centred on the knob. It is taller than
        the track area (trackHeight + 2 × trackPaddingBlock) and is allowed to overflow
        it above and below rather than growing the row: nothing clips it, and the
        label row and mark label row paint above the thumbs and take any press that
        lands on them.'
      locked: true
    focusRing:
      token: color.border.focus
      part: thumb
      description: A circular ring around the visible knob (not the minTarget hit
        area), shown only while the thumb has keyboard focus.
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: thumb
      description: Ring thickness, drawn outside the knob's border and offset from
        it by the same width.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: Applied to the slider root (label row, track area, marks and messages)
        while disabled. The element that dims also carries `aria-disabled="true"`
        — the root as well as each thumb (on Lit the shadow-root wrapper, on React
        Native the root View beside `accessibilityState.disabled`) — so a contrast
        checker resolves the dimmed label and value text to an inactive component
        and applies the WCAG 1.4.3 exemption instead of reporting a failure. This
        holds for every component whose disabledOpacity dims text.
      locked: false
    transition:
      token: motion.duration.fast
      description: Halo (part thumb) and bubble (part bubble) appearance; the thumb
        itself follows the pointer with no transition.
      locked: false
  copy:
    minimumLabel: '{label} minimum'
    maximumLabel: '{label} maximum'
    rangeText:
      text: '{low} – {high}'
      params:
        low:
          type: string
          description: The lower thumb's value as formatValue renders it.
        high:
          type: string
          description: The upper thumb's value as formatValue renders it.
    required: '{label} is required.'
    invalid: '{label} is not valid.'
    pageUpAction: Increase by a page
    pageDownAction: Decrease by a page
    homeAction: Set to minimum
    endAction: Set to maximum
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
      nonText: true
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
  form:
    role: field
    value: value
    valueType: number-range
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
      - aria-invalid
      - aria-required
      notes: Custom thumbs (<div role="slider" tabindex="0">) on a track rather than
        <input type="range">, because a range slider needs two thumbs on one track
        and the native element cannot be themed consistently. Pointer Events with
        setPointerCapture on the track and thumbs; the track click moves the nearest
        thumb. aria-valuetext from formatValue. A hidden <input name> (two with the
        same name for a range) carries the decimal string(s) for native forms. The
        label, value, description and error Texts carry their own data-part, as the
        composition table says (no wrapper takes the part name); the error Text sits
        inside an unparted `<div role="alert">`, as on Lit. `copy.pageUpAction`, `pageDownAction`,
        `homeAction` and `endAction` are React Native action labels; web and Lit do
        not render them.
    lit:
      tag: ds-slider
      reflect:
      - range
      - disabled
      - show-value
      - required
      - invalid
      - snap-to-marks
      notes: 'Form-associated and implements DsFormField: `currentValue` is the decimal
        string, or `[low, high]` as two strings for a range, and setFormValue gets
        FormData with two entries of the same name for a range. Composed `change`
        (detail { value }, numbers) and `change-end`. Thumbs are shadow elements with
        role="slider"; the label ds-text and its id live in the same shadow root,
        so aria-labelledby resolves, and range thumbs use aria-label from the copy.
        `value` and `defaultValue` are unions no attribute converter can express,
        so both are `attribute: false` properties (`.value`, `.defaultValue`) with
        no attribute form — a plain-HTML author cannot set a starting value the way
        `default-value` allows on ds-number-input. A consumer''s `id` stays on the
        host and is never copied into the shadow root (ids do not cross shadow roots):
        the low thumb''s shadow id is always `thumb`, the high thumb carries none,
        and `focus()` reaches the low thumb through `delegatesFocus`. `formStateRestoreCallback`
        restores a single value from the one string and a range from the two same-name
        FormData entries, matching what setFormValue submits. The error message is
        a ds-text tone=danger carrying `part="errorMessage"` inside an unparted `<div
        role="alert">`, matching ds-input and ds-number-input. The Lit form contract
        has no interaction-end hook, so under `validate: blur` ds-slider is a plain
        `data-ds-field` and validates on focusout, not on pointer release.'
    rn:
      role: adjustable
      element: View
      props:
      - accessibilityRole=adjustable
      - accessibilityLabel
      - accessibilityHint
      - accessibilityValue
      - accessibilityActions
      - onAccessibilityAction
      notes: 'Drawn with Views and a PanResponder per thumb (no new dependency; the
        community Slider has no range support and would not take tokens). accessibilityRole="adjustable"
        with accessibilityActions increment/decrement handled in onAccessibilityAction
        (VoiceOver swipe up/down, TalkBack volume keys), accessibilityValue={{ min,
        max, now, text }}. react-native-web (which the axe and Storybook gates render
        through) forwards neither the composite `accessibilityValue` nor `accessibilityState`,
        so every thumb writes both spellings: `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
        and `aria-valuetext` beside accessibilityValue, and `aria-disabled` beside
        accessibilityState.disabled. Any component on this platform whose role is
        `adjustable` (Slider, Splitter) does the same, or it ships a role with no
        exposed value. A range renders two adjustable elements. The drag gesture is
        additive: the adjustable actions are the non-gesture path. An accessibility
        action is an atomic interaction with no separate end, so each increment, decrement,
        pageUp, pageDown, home or end action fires onValueChange and then onSlidingComplete,
        both only if the value changed. PageUp, PageDown, Home and End have no native
        gesture, so they are custom accessibilityActions alongside increment and decrement
        (a core View has no hardware-key hook, so the keyboard table has no key handlers
        on native; the actions are its equivalent); only those two get a direct swipe
        or volume-key binding, and the rest live in the platform''s Actions menu,
        labelled from `copy.pageUpAction`, `copy.pageDownAction`, `copy.homeAction`
        and `copy.endAction` (increment and decrement take no label; the platform
        names them). Their `accessibilityActions` names are `pageUp`, `pageDown`,
        `home` and `end`, beside the standard `increment` and `decrement`. A press
        or drag on the track area moves the nearest thumb, as on web, except when
        the press lands inside a thumb''s own hit area: the thumb''s PanResponder
        claims the gesture first, so it drags from its current value instead of jumping
        to the press position; when both range thumbs share a value, a press before
        it moves the low thumb, after it the high thumb, and exactly on it the low
        thumb (every platform). Disabled thumbs stay `accessible` with accessibilityState.disabled,
        and gestures and actions are ignored. Form registration uses the decimal string,
        or two strings for a range. The composed Texts carry their testID on wrapper
        Views the Slider owns. Each thumb''s accessibilityHint is the error message
        when one shows, else the description, which ties them to the thumb (label-association);
        the visible description and error Texts stay in the reading order as well,
        so that text is heard twice — accepted, since neither carrier can be dropped
        without losing the association or the visible message.'
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
  behavior:
  - name: arrow-increases-by-one-step
    description: Arrow keys move by step, so the keyboard gets the precision the pointer
      gets by drag.
    given:
      defaultValue: 50
      step: 5
    when:
      key: ArrowRight
    then:
    - event: onChange
      with: 55
    platforms:
    - web
    - lit
  - name: arrow-decreases-by-one-step
    given:
      defaultValue: 50
      step: 5
    when:
      key: ArrowLeft
    then:
    - event: onChange
      with: 45
    platforms:
    - web
    - lit
  - name: page-up-changes-by-ten-steps
    given:
      defaultValue: 50
    when:
      key: PageUp
    then:
    - event: onChange
      with: 60
    platforms:
    - web
    - lit
  - name: home-sets-the-minimum
    given:
      defaultValue: 50
      min: 0
      max: 100
    when:
      key: Home
    then:
    - event: onChange
      with: 0
    platforms:
    - web
    - lit
  - name: end-sets-the-maximum
    given:
      defaultValue: 50
      min: 0
      max: 100
    when:
      key: End
    then:
    - event: onChange
      with: 100
    platforms:
    - web
    - lit
  - name: a-key-press-is-a-complete-interaction
    description: onChangeEnd fires once when the interaction ends (pointer up, key
      released), for expensive effects.
    given:
      defaultValue: 50
    when:
      key: ArrowRight
    then:
    - event: onChangeEnd
      with: 51
    platforms:
    - web
    - lit
  - name: a-disabled-slider-does-not-move
    given:
      disabled: true
      defaultValue: 50
    when:
      key: ArrowRight
    then:
    - event: onChange
      fired: false
    platforms:
    - web
    - lit
  - name: the-thumb-reports-its-value-and-bounds
    description: The thumb carries valuenow/min/max, so a screen reader hears where
      the value sits on the scale.
    given:
      defaultValue: 4
      min: 0
      max: 10
    then:
    - attribute: aria-valuenow
      is: '4'
    - attribute: aria-valuemin
      is: '0'
    - attribute: aria-valuemax
      is: '10'
    platforms:
    - web
  - name: the-thumb-is-the-slider
    description: The thumb is the slider element, not the track - that is what takes
      focus and carries the value.
    then:
    - role: slider
    platforms:
    - web
    - lit
    - swiftui
  - name: invalid-renders-the-invalid-copy
    description: invalid marks the slider invalid and renders copy.invalid when there
      is no error.
    given:
      invalid: true
    then:
    - copy: invalid
  examples:
  - name: volume
    description: The everyday single-value slider, its value shown beside the label.
    given:
      label: Volume
      name: volume
      defaultValue: 30
  - name: price-range
    description: Two thumbs choosing a minimum and a maximum that cannot cross.
    given:
      label: Price range
      name: price
      range: true
      defaultValue:
      - 20
      - 80
  - name: effort-with-marks
    description: A short labelled scale that snaps to its marks.
    given:
      label: Effort
      name: effort
      min: 1
      max: 5
      marks:
      - value: 1
        label: Low
      - value: 3
        label: Medium
      - value: 5
        label: High
      snapToMarks: true
  - name: paired-with-a-number-input
    description: A zoom control whose value is shown by a NumberInput beside it, so
      the slider shows none.
    given:
      label: Zoom
      name: zoom
      min: 50
      max: 200
      step: 10
      defaultValue: 100
      showValue: never
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: number | [number, number]`
  - fires on: user
- `onChangeEnd`: emit `change-end`
  - payload, the keys of `CustomEvent.detail`: `value: number | [number, number]`
  - fires on: user
  - timing: commit

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)

## Parts and slots

- `label`: component `Text`; props `element` = "span", `size` = "md", `weight` = "medium", `tone` = "default"; forwards `labelWeight` → `overrides.fontWeight`, `fontSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`
- `track`: element
- `fill`: element
- `thumb`: element
- `valueText`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "default"; forwards `valueSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`
- `bubble`: element
- `tickMarks`: element
- `description`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "muted"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`
- `errorMessage`: component `Text`; props `element` = "span", `size` = "sm", `tone` = "danger"; forwards `helperSize` → `overrides.fontSize`, `fontFamily` → `overrides.fontFamily`

## Style bindings

- `track`: token `color.background.strong`; part `track`
- `fill`: token `color.control.selectedBackground`; part `fill`; locked
- `trackHeight`: token `space.1`; part `track`
- `trackRadius`: token `radius.full`; part `track`
- `thumb`: token `color.control.background`; part `thumb`
- `thumbBorder`: token `color.control.selectedBackground`; part `thumb`; locked
- `thumbBorderWidth`: token `border.width.focus`; part `thumb`; locked
- `thumbSize`: token `space.5`; part `thumb`
- `thumbShadow`: token `shadow.raised`; part `thumb`
- `thumbActiveScale`: token `opacity.disabled`; part `thumb`
- `haloSpread`: token `space.2`; part `thumb`
- `mark`: token `color.border.strong`; part `tickMarks`
- `markSize`: token `space.2`; part `tickMarks`
- `markLabelColor`: token `color.foreground.muted`; part `tickMarks`; locked
- `markLabelSize`: token `font.size.xs`; part `tickMarks`
- `markLabelGap`: token `space.1`; part `tickMarks`
- `valueColor`: token `color.foreground`; part `valueText`; locked
- `valueSize`: token `font.size.sm`; part `valueText`
- `bubbleSurface`: token `color.inverse.surface`; part `bubble`; locked
- `bubbleText`: token `color.inverse.foreground`; part `bubble`; locked
- `bubblePaddingBlock`: token `space.1`; part `bubble`
- `bubblePaddingInline`: token `space.2`; part `bubble`
- `bubbleOffset`: token `space.1`; part `bubble`
- `bubbleRadius`: token `radius.sm`; part `bubble`
- `labelWeight`: token `font.weight.medium`; part `label`
- `labelGap`: token `space.2`; part `label`
- `trackPaddingBlock`: token `space.3`; part `track`
- `fontFamily`: token `font.family.body`; part `label`
- `fontSize`: token `font.size.md`; part `label`
- `helperSize`: token `font.size.sm`; part `description`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked
- `errorText`: token `color.foreground.danger`; part `errorMessage`; locked
- `minTarget`: token `size.target.comfortable`; part `thumb`; locked
- `focusRing`: token `color.border.focus`; part `thumb`; locked
- `focusRingWidth`: token `border.width.focus`; part `thumb`; locked

## Keyboard

- `ArrowRight`, `ArrowUp` (Increases by `step`. ArrowRight is mirrored in a right-to-left layout (it decreases there), read from the thumb's — on Lit the host's — computed `direction` at keydown, as in Tabs and SegmentedControl; ArrowUp always increases.): expect manual
- `ArrowLeft`, `ArrowDown` (Decreases by `step`. ArrowLeft is mirrored in a right-to-left layout (it increases there); ArrowDown always decreases.): expect manual
- `PageUp`, `PageDown` (Changes by ten steps, clamped to the bounds (with `snapToMarks`, to the next mark, and to `max`/`min` past the last mark). Not mirrored in right-to-left.): expect manual
- `Home` (Sets the minimum — for a range thumb the live constraint from the other thumb, not `min`, so the action can never cross the thumbs.): expect manual
- `End` (Sets the maximum — for a range thumb the live constraint from the other thumb, not `max`.): expect manual
- `Tab` (Moves between the two thumbs of a range slider; each thumb is a tab stop.): expect focus-next

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: number-range
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

- `minimumLabel`: "{label} minimum"
- `maximumLabel`: "{label} maximum"
- `rangeText`: "{low} – {high}"; params `low` (string), `high` (string)
- `required`: "{label} is required."
- `invalid`: "{label} is not valid."
- `pageUpAction`: "Increase by a page"
- `pageDownAction`: "Decrease by a page"
- `homeAction`: "Set to minimum"
- `endAction`: "Set to maximum"

## Constants and examples

- example `volume`, story `Volume`: given `label: "Volume"`, `name: "volume"`, `defaultValue: 30`; The everyday single-value slider, its value shown beside the label.
- example `price-range`, story `PriceRange`: given `label: "Price range"`, `name: "price"`, `range: true`, `defaultValue: [20,80]`; Two thumbs choosing a minimum and a maximum that cannot cross.
- example `effort-with-marks`, story `EffortWithMarks`: given `label: "Effort"`, `name: "effort"`, `min: 1`, `max: 5`, `marks: [{"value":1,"label":"Low"},{"value":3,"label":"Medium"},{"value":5,"label":"High"}]`, `snapToMarks: true`; A short labelled scale that snaps to its marks.
- example `paired-with-a-number-input`, story `PairedWithANumberInput`: given `label: "Zoom"`, `name: "zoom"`, `min: 50`, `max: 200`, `step: 10`, `defaultValue: 100`, `showValue: "never"`; A zoom control whose value is shown by a NumberInput beside it, so the slider shows none.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `track`, `trackHeight`, `trackRadius`, `thumb`, `thumbSize`, `thumbShadow`, `thumbActiveScale`, `haloSpread`, `mark`, `markSize`, `markLabelSize`, `markLabelGap`, `valueSize`, `bubblePaddingBlock`, `bubblePaddingInline`, `bubbleOffset`, `bubbleRadius`, `labelWeight`, `partGap`, `labelGap`, `trackPaddingBlock`, `fontFamily`, `fontSize`, `helperSize`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `fill`, `thumbBorder`, `thumbBorderWidth`, `markLabelColor`, `valueColor`, `bubbleSurface`, `bubbleText`, `descriptionText`, `errorText`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (16)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: arrow-increases-by-one-step
  description: Arrow keys move by step, so the keyboard gets the precision the pointer
    gets by drag.
  given:
    defaultValue: 50
    step: 5
  when:
    key: ArrowRight
  then:
  - event: onChange
    with: 55
  platforms:
  - web
  - lit
- name: arrow-decreases-by-one-step
  given:
    defaultValue: 50
    step: 5
  when:
    key: ArrowLeft
  then:
  - event: onChange
    with: 45
  platforms:
  - web
  - lit
- name: page-up-changes-by-ten-steps
  given:
    defaultValue: 50
  when:
    key: PageUp
  then:
  - event: onChange
    with: 60
  platforms:
  - web
  - lit
- name: home-sets-the-minimum
  given:
    defaultValue: 50
    min: 0
    max: 100
  when:
    key: Home
  then:
  - event: onChange
    with: 0
  platforms:
  - web
  - lit
- name: end-sets-the-maximum
  given:
    defaultValue: 50
    min: 0
    max: 100
  when:
    key: End
  then:
  - event: onChange
    with: 100
  platforms:
  - web
  - lit
- name: a-key-press-is-a-complete-interaction
  description: onChangeEnd fires once when the interaction ends (pointer up, key released),
    for expensive effects.
  given:
    defaultValue: 50
  when:
    key: ArrowRight
  then:
  - event: onChangeEnd
    with: 51
  platforms:
  - web
  - lit
- name: a-disabled-slider-does-not-move
  given:
    disabled: true
    defaultValue: 50
  when:
    key: ArrowRight
  then:
  - event: onChange
    fired: false
  platforms:
  - web
  - lit
- name: the-thumb-is-the-slider
  description: The thumb is the slider element, not the track - that is what takes
    focus and carries the value.
  then:
  - role: slider
  platforms:
  - web
  - lit
  - swiftui
- name: invalid-renders-the-invalid-copy
  description: invalid marks the slider invalid and renders copy.invalid when there
    is no error.
  given:
    invalid: true
  then:
  - copy: invalid
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

## Platform notes (lit)

```yaml
tag: ds-slider
reflect:
- range
- disabled
- show-value
- required
- invalid
- snap-to-marks
notes: "Form-associated and implements DsFormField: `currentValue` is the decimal\
  \ string, or `[low, high]` as two strings for a range, and setFormValue gets FormData\
  \ with two entries of the same name for a range. Composed `change` (detail { value\
  \ }, numbers) and `change-end`. Thumbs are shadow elements with role=\"slider\"\
  ; the label ds-text and its id live in the same shadow root, so aria-labelledby\
  \ resolves, and range thumbs use aria-label from the copy. `value` and `defaultValue`\
  \ are unions no attribute converter can express, so both are `attribute: false`\
  \ properties (`.value`, `.defaultValue`) with no attribute form \u2014 a plain-HTML\
  \ author cannot set a starting value the way `default-value` allows on ds-number-input.\
  \ A consumer's `id` stays on the host and is never copied into the shadow root (ids\
  \ do not cross shadow roots): the low thumb's shadow id is always `thumb`, the high\
  \ thumb carries none, and `focus()` reaches the low thumb through `delegatesFocus`.\
  \ `formStateRestoreCallback` restores a single value from the one string and a range\
  \ from the two same-name FormData entries, matching what setFormValue submits. The\
  \ error message is a ds-text tone=danger carrying `part=\"errorMessage\"` inside\
  \ an unparted `<div role=\"alert\">`, matching ds-input and ds-number-input. The\
  \ Lit form contract has no interaction-end hook, so under `validate: blur` ds-slider\
  \ is a plain `data-ds-field` and validates on focusout, not on pointer release."
```

## Guidance

## Overview

A slider is for values you feel rather than type: volume, brightness, a price range, a zoom level. Its thumb sits on the value, the fill shows how much, and arrow keys move it by exact steps so keyboard and screen-reader users get the same precision the pointer gets by drag.

## When to use

Use a Slider for a bounded numeric value where approximate is fine and immediate feedback matters, and where the scale has meaning across its whole width. Use `range` for "between" filters (price, dates as numbers). Add `marks` when a few values are meaningful stops. Pair it with a NumberInput (`showValue: never`) when exact entry also matters.

## When not to use

Do not use a Slider for a value that must be exact or is usually typed (quantity, age): use NumberInput. Do not use it for more than about a hundred steps without marks or a paired input — fine control by drag is poor. Do not use it for two or three discrete choices (SegmentedControl). Do not use a vertical slider unless the metaphor is vertical (volume in a mixer); horizontal is the default and the only orientation in this version.

## Behavior

Dragging a thumb, or clicking the track (every platform, including React Native), sets the value snapped to `step` (or to marks with `snapToMarks`); arrow keys move by `step`, PageUp/Down by ten steps (by mark with `snapToMarks`), Home/End to the bounds. `onChange` fires continuously; `onChangeEnd` once per interaction; neither fires when the value did not change. A pointer-driven control has no meaningful blur, so on every platform `validate: blur` validates when an interaction ends (pointer or drag release, key-up), not when a thumb loses focus. Under `validate: change`, and in any mode once the Form reports `submitFailed`, every committed change validates instead — Input's current idiom. In a `range`, each thumb is its own tab stop, the thumbs cannot cross (the lower is clamped to the upper and vice versa), and the value is `[min, max]`. The value text shows per `showValue`; the drag bubble follows the active thumb. `disabled` sliders are readable and focusable but inert. A range's beside-label text is `copy.rangeText`; each thumb's `aria-valuemin`/`aria-valuemax` reflect the live constraint from the other thumb. Pointer math is logical (mirrored in right-to-left). The Keyboard story renders the range form with the `price-range` example's args (`range: true`, `defaultValue: [20, 80]`); two thumbs are the whole model, so the three-focusable rule does not apply. Events carry numbers, but the Form value is the decimal string, or `[low, high]` as two strings for a range (see `name`). The error region shows `error`, else a Form-reported message, else `copy.invalid` when `invalid`; `copy.required` appears only once validation reports it.

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
`View` track with `PanResponder` per thumb; each thumb `View` has `accessible`, `accessibilityRole="adjustable"`, `accessibilityLabel`, `accessibilityValue={{ min, max, now, text }}`, `accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}` and `onAccessibilityAction` applying `step`. `onSlidingComplete` maps to `onChangeEnd`. The bubble is a `View` above the active thumb. Form registration as Input, with the decimal string; a range registers one field with the two strings. PageUp/PageDown/Home/End are extra custom actions labelled from copy.

## Related

NumberInput, Meter, Input, SegmentedControl.
