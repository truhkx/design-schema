# Generate: DatePicker as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/DatePicker.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `DatePicker.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: DatePickerVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `DatePicker.test.ts`.

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
  name: DatePicker
  category: input
  status: review
  apg: grid
  anatomy:
  - label
  - description
  - field
  - input
  - calendarButton
  - popover
  - header
  - prevMonthButton
  - nextMonthButton
  - monthSelect
  - yearSelect
  - grid
  - weekdayHeader
  - weekNumber
  - day
  - footer
  - todayButton
  - clearButton
  - errorMessage
  composition:
    description: Text
    calendarButton: Button
    popover:
      component: Popover
      forwards:
        calendarInset: inset
    prevMonthButton: Button
    nextMonthButton: Button
    monthSelect:
      component: Select
      forwards:
        monthTitleSize: fontSize
        monthTitleWeight: fontWeight
    yearSelect:
      component: Select
      forwards:
        monthTitleSize: fontSize
        monthTitleWeight: fontWeight
    todayButton: Button
    clearButton: Button
  props:
    label:
      type: string
      required: true
      description: Visible label ("Start date", "Date of birth").
      a11y: label/for on the input; the grid is named "{label}, {month} {year}".
    name:
      type: string
      required: true
      description: 'Field name for the Form. The value is an ISO calendar date string
        (`2026-09-10`) or, for a range, `{ start, end }` of them in `value` and `onChange`.
        The Form holds strings only, so a range registers two fields, `name` (start)
        and `name-end` (end). Never a Date object: a calendar date has no time zone.'
    value:
      type: union
      shape: 'string | { start: string; end: string }'
      description: 'Controlled value (ISO date, or a range). Pass `''''` for a controlled
        empty field; `undefined` means uncontrolled. In a range the first pick is
        an internal draft shown only in the calendar: `value` and the inputs keep
        showing the old value until the end is picked, then onChange reports the range
        and the field returns to `value`.'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      shape: 'string | { start: string; end: string }'
      description: Initial value.
    open:
      type: boolean
      description: 'Controlled calendar state, for programmatic use and for stories
        and tests. Omit for the button-driven default. Every change to open, by the
        user or by the parent, aims the calendar at the value''s month (or today''s)
        and focuses the selected day (or today). Lit: a property only, not a reflected
        attribute, because an absent attribute cannot say controlled-closed; bind
        `.open`, and setting it to false keeps it controlled.'
      controls:
        event: onOpenChange
        state: open
    range:
      type: boolean
      default: false
      description: Pick a start and an end date in one calendar; two inputs in the
        field.
    min:
      type: string
      description: Earliest selectable date (ISO). Earlier days are disabled and the
        error uses `copy.tooEarly`.
    max:
      type: string
      description: Latest selectable date (ISO).
    isDateDisabled:
      type: function
      shape: '(isoDate: string) => boolean'
      description: Disable specific days (weekends, holidays, booked). Disabled days
        are shown, not hidden, and are skipped by the Arrow keys (moving on in the
        same direction to the next enabled day, turning pages, and staying put when
        none is left before min/max); Home, End, PageUp and PageDown land on the computed
        day even when it is disabled. A disabled day can take focus but not be selected.
    locale:
      type: string
      description: BCP 47 locale for month and weekday names, the first day of the
        week, and the typed format. Defaults to `document.documentElement.lang` when
        set (web, lit), then the `Intl.DateTimeFormat().resolvedOptions().locale`
        default (the device locale on rn). The typed pattern comes from `formatToParts`
        with 2-digit month and day and a numeric year, so en-US is MM/DD/YYYY.
    showWeekNumbers:
      type: boolean
      default: false
      description: An ISO week-number column at the start of each row.
    placeholder:
      type: string
      description: Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY").
    description:
      type: string
      description: Helper text.
    required:
      type: boolean
      default: false
      description: Must have a value to submit.
    hideLabel:
      type: boolean
      default: false
      description: 'Visually hide the label (it remains the accessible name). Only
        for a field whose context already names it: a DataGrid cell editor, a Search.
        Hidden with the visually-hidden clip pattern, so it needs no binding.'
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height,
        tighter padding, small type (`fontSize` at font.size.sm).'
    disabled:
      type: boolean
      default: false
      description: Not editable, still readable.
    error:
      type: string
      description: Error message; implies invalid.
  events:
    onChange:
      description: Fired when a complete valid date (or range) is typed or picked,
        with the ISO value; with undefined when cleared. Every pick fires, including
        re-picking the day already selected; typing text that parses to the current
        value does not. Clear fires undefined even when the field is already empty.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
      payload:
      - name: value
        type: union
        shape: 'string | { start: string; end: string } | undefined'
        description: The ISO date, or the ISO range with range; undefined when cleared.
      fires:
      - user
    onOpenChange:
      description: Fired when the calendar opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the calendar.
      fires:
      - user
  keyboard:
  - keys:
    - ArrowDown
    - Alt+ArrowDown
    action: From the input, opens the calendar with focus on the selected day (or
      today).
    when: focus in input
    from: first
    expect: manual
  - keys:
    - Enter
    - ' '
    action: On the calendar button, opens; on a day, selects it (and closes for a
      single date; for a range, selects the start then the end).
    from: inside
    expect: manual
  - keys:
    - Escape
    action: Closes the calendar without changing the value and returns focus to the
      calendar button.
    when: open
    from: inside
    expect:
    - closes
    - focus-trigger
    target: popover
  - keys:
    - ArrowRight
    action: Next day.
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - ArrowLeft
    action: Previous day.
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - ArrowDown
    action: Same weekday, next week.
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - ArrowUp
    action: Same weekday, previous week.
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - Home
    action: First day of the week.
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - End
    action: Last day of the week.
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - PageUp
    action: 'Same day, previous month (Shift: previous year).'
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - PageDown
    action: 'Same day, next month (Shift: next year).'
    when: focus on a day
    from: inside
    expect: manual
  - keys:
    - Tab
    action: 'Cycles within the calendar: previous month, month Select, year Select,
      next month, the grid (one tab stop, roving over days), Today, Clear, and back
      (Shift+Tab reverses). DatePicker traps Tab itself, because the non-modal Popover
      would close on Tab-out; Tab inside an open Select popup belongs to the Select.
      In the grid, keys held with Alt, Ctrl or Meta are ignored.'
    when: open
    from: inside
    expect: manual
  styles:
    background:
      token: color.background
      locked: true
    foreground:
      token: color.foreground
      locked: true
    placeholder:
      token: color.foreground.muted
      locked: true
    border:
      token: color.border.strong
      locked: true
    borderFocus:
      token: color.border.focus
      locked: true
    borderInvalid:
      token: color.border.danger
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.md
      locked: false
    paddingInline:
      token: space.md
      by: size
      values:
        sm: space.2
      description: The input's inline padding. An override replaces the value at both
        sizes.
      locked: false
    paddingBlock:
      token: space.sm
      by: size
      values:
        sm: space.1
      description: The input's block padding. An override replaces the value at both
        sizes.
      locked: false
    fontSize:
      token: font.size.{size}
      description: The field text and the label (font.size.md at md, font.size.sm
        at sm); description and error use helperSize.
      locked: false
    rangeSeparatorColor:
      token: color.foreground.muted
      description: The en dash between start and end inputs.
      locked: true
    calendarSurface:
      token: color.overlay.surface
      description: 'Not forwarded: Popover''s and BottomSheet''s surface is locked
        to this same token, so the composed overlay''s own surface realises it and
        an override has no effect.'
      locked: true
    calendarInset:
      token: layout.inset.md
      description: Forwarded to the composed Popover as `overrides.inset` (web, lit)
        and to the BottomSheet as `overrides.inset` (rn), so the sheet pads at this
        value rather than its own layout.inset.lg.
      locked: false
    calendarGap:
      token: layout.gap.normal
      description: Between header, grid and footer.
      locked: false
    headerGap:
      token: layout.gap.tight
      part: header
      description: Between the prev/next Buttons and the month and year Selects in
        the header row.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: Between the Today and Clear Buttons.
      locked: false
    daySize:
      token: size.target.comfortable
      part: day
      description: Every day cell is a comfortable square target.
      locked: true
    dayGap:
      token: space.0
      part: day
      description: Cells touch, so a range reads as one bar; the selected day's radius
        gives it shape.
      locked: false
    dayRadius:
      token: radius.md
      part: day
      locked: false
    dayHover:
      token: color.action.ghost.backgroundHover
      part: day
      state: hover
      locked: false
    daySelectedBackground:
      token: color.control.selectedBackground
      part: day
      locked: true
    daySelectedForeground:
      token: color.control.selectedForeground
      part: day
      locked: true
    dayInRangeBackground:
      token: color.background.strong
      part: day
      locked: true
    dayTodayBorder:
      token: color.control.selectedBackground
      part: day
      description: The today ring. On a selected or in-range today the ring stays
        and the selected (or in-range) fill takes the background; while the day has
        focus the focus ring replaces it.
      locked: true
    dayTodayBorderWidth:
      token: border.width.focus
      part: day
      locked: true
    dayOutsideMonthColor:
      token: color.foreground.muted
      part: day
      locked: true
    weekdayColor:
      token: color.foreground.muted
      locked: true
    weekdaySize:
      token: font.size.xs
      locked: false
    weekdayWeight:
      token: font.weight.medium
      locked: false
    weekNumberSize:
      token: font.size.xs
      part: weekNumber
      description: Week-number cells, in weekdayColor at the regular weight.
      locked: false
    monthTitleSize:
      token: font.size.md
      description: Forwarded to the month and year Selects as `overrides.fontSize`.
      locked: false
    monthTitleWeight:
      token: font.weight.semibold
      description: Forwarded to the month and year Selects as `overrides.fontWeight`.
      locked: false
    partGap:
      token: space.1
      description: Between label, description, field and error.
      locked: false
    fieldGap:
      token: space.2
      part: field
      description: Between the input(s) and the calendar button in the field row.
      locked: false
    dayFontSize:
      token: font.size.sm
      part: day
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      locked: false
    helperSize:
      token: font.size.sm
      locked: false
    descriptionText:
      token: color.foreground.muted
      part: description
      locked: true
    errorText:
      token: color.foreground.danger
      locked: true
    minTarget:
      token: size.target.comfortable
      locked: true
    minTargetSm:
      token: size.target.min
      description: The field height floor at size sm; the calendar Button becomes
        size sm. The calendar popup is unchanged.
      locked: true
    focusRing:
      token: color.border.focus
      description: The field's focus-visible ring and the focused day's ring, which
        replaces the today ring while that day has focus.
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: 'Day-cell hover and selection states animate background-color,
        border-color and color (rn: background color only); a month change is instant.
        Instant under reduced motion.'
      locked: false
  copy:
    open: Choose date
    openRange: Choose dates
    previousMonth: Previous month
    nextMonth: Next month
    month: Month
    year: Year
    today: Today
    clear: Clear
    weekNumber: Week
    gridLabel:
      text: '{label}, {month} {year}'
      params:
        month:
          type: string
          description: The displayed month's name in the locale.
        year:
          type: string
          description: The displayed year as the header shows it.
    selected: selected
    todayLabel: today
    startLabel: Start date
    endLabel: End date
    required: '{label} is required.'
    invalid:
      text: '{label} must be a valid date ({pattern}).'
      params:
        pattern:
          type: string
          description: The locale's date pattern shown in the placeholder.
    tooEarly: '{label} must be on or after {min}.'
    tooLate: '{label} must be on or before {max}.'
    rangeOrder: End date must be on or after the start date.
    requiredIndicator: ' (required)'
  a11y:
    role: none
    requires:
    - label-association
    - accessible-name
    - error-identification
    - keyboard-operable
    - arrow-navigation
    - roving-tabindex
    - focus-visible
    - focus-restore
    - escape-dismiss
    - contrast-aa
    - target-44px
    - selected-state
    - reduced-motion
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
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground
      background: color.background.strong
      level: AA
    - foreground: color.control.selectedForeground
      background: color.control.selectedBackground
      level: AA
    - foreground: color.control.selectedBackground
      background: color.overlay.surface
      level: AA
      nonText: true
    - foreground: color.border.strong
      background: color.background
      level: AA
      nonText: true
  form:
    role: field
    value: value
    valueType: date-range
    name: name
    validation:
    - required
    - invalid
    - range
    messages:
      required: required
      invalid: invalid
    discovery: context
  platforms:
    web:
      element: input
      attributes:
      - type=text
      - inputmode=numeric
      - autocomplete=off
      - aria-describedby
      - aria-invalid
      - aria-required
      - role=grid
      - role=gridcell
      - aria-selected
      - aria-current=date
      - aria-disabled
      notes: 'The field is Input''s wrapper with <input type="text" inputmode="numeric">
        (not type="date": its picker is unstyleable, its keyboard model differs per
        browser, and it cannot do ranges) parsed with the locale pattern from Intl.DateTimeFormat().formatToParts;
        a range shows two inputs joined by an en dash. The calendar Button (ghost,
        iconOnly, "calendar" Icon — add to Icon''s glyph set) opens a Popover (non-modal,
        placement bottom-start; its own FocusScope is the only one, DatePicker adds
        none and traps Tab itself; outside click closes without change, like Escape)
        containing: header with prev/next Buttons and month/year Selects; a <table
        role="grid" aria-labelledby> with <th scope="col" abbr> weekday headers and
        <td role="gridcell"> days — the <td> carries aria-selected (true for the selected
        day and, in a range, every day from start to end inclusive), and inside it
        a <button tabindex=-1|0> in a roving tabindex with aria-current="date" for
        today, aria-disabled for min/max/isDateDisabled, and aria-label = the full
        date from Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC"
        }) followed by ", {copy.todayLabel}" and/or ", {copy.selected}"; a footer
        with Today and Clear. With showWeekNumbers the header row starts with <th
        scope="col" abbr={copy.weekNumber}> holding visually hidden copy.weekNumber,
        and each row starts with <th scope="row" data-part="weekNumber"> (not focusable,
        not a gridcell). Days outside the month are rendered muted and selectable.
        Composed parts (calendarButton, prevMonthButton, nextMonthButton, monthSelect,
        yearSelect, todayButton, clearButton) carry their data-part on a <span> wrapper
        DatePicker owns, because Button and Select write their own data-part on their
        root; tests act on the control inside the wrapper. The Popover panel is portaled
        out of the root, so DatePicker declares the --ds-date-picker-* hook defaults
        and writes any overrides on the calendar content wrapper (data-part="popover"
        content) as well as on the root. Form: FormContext holds no objects, so a
        single date registers `name` with the ISO string and a range registers two
        string fields, `name` (start ISO) and `name-end` (end ISO); a disabled field
        submits nothing. Week starts from Intl.Locale.prototype.getWeekInfo() where
        available, else Sunday. Selecting a day writes the formatted text into the
        input and fires onChange with the ISO string; typing a complete valid date
        moves the calendar to it.'
    lit:
      tag: ds-date-picker
      reflect:
      - range
      - required
      - disabled
      - show-week-numbers
      - locale
      - size
      notes: 'Form-associated: setFormValue with the ISO string (a FormData with two
        entries for a range, name and name-end). Implements DsFormField for `name`
        (the start ISO string, or null until complete), and a range adds a second
        DsFormField entry for `name-end` (the end ISO string) that always validates
        clean; `name` reports the combined message. Calendar in a <ds-popover> in
        the shadow root; grid, week numbers, day labels and aria-selected placement
        as in web. Ids do not cross shadow roots, so the native <label for>, aria-describedby,
        aria-labelledby and the grid label all point at elements inside the same shadow
        root, and aria-invalid sits on the input(s). The month and year ds-selects
        live inside the shadow root, so ds-form never discovers them; they carry name="month"
        and name="year" only to satisfy ds-select. `open` is a property, not reflected
        (see the prop). The composed ds-popover focuses its first focusable on open,
        so DatePicker moves focus to the selected day (or today) after the popover
        has opened, and asks the popover to reposition once the grid has laid out.
        Composed `change` and `open-change`.'
    rn:
      element: TextInput
      props:
      - keyboardType=number-pad
      - accessibilityLabel
      - accessibilityHint
      notes: 'No core date picker on RN, so the same calendar grid renders in a BottomSheet
        (height content) opened by the calendar Button; each day a Pressable with
        accessibilityRole="button", accessibilityState={{ selected, disabled }}, accessibilityLabel
        from the full formatted date plus "today"/"selected". The header month is
        announced on change. Typing is supported in the TextInput with the locale
        pattern. The community datetimepicker is deliberately not used (decision 2026-09-10:
        react-native-svg is the only native dependency) because it cannot take tokens,
        so the calendar stays the system''s own grid on every platform. Native has
        no grid or gridcell role and no key events on Pressable, so there is no roving
        tabindex and no arrow, Page, Home or End handling: every day is its own focus
        stop reached by swipe, and the prev/next month Buttons stand in for PageUp/PageDown.
        `TextInputKeyPressEventData` carries no modifier flags, so Alt+ArrowDown is
        indistinguishable from ArrowDown and both simply open the calendar. Focus
        on open lands on the sheet''s first focusable element rather than the selected
        day, and focus on close returns through BottomSheet''s own FocusScope, since
        Button exposes no node handle to focus by hand. The popover part is the BottomSheet
        here, and `calendarSurface`/`calendarInset` are forwarded to its `surface`/`inset`
        overrides. The sheet''s `title` is `label`; `copy.gridLabel` is the accessibilityLabel
        of the grid View and is announced (AccessibilityInfo) when the month changes.
        The label is a Text, since RN has no <label>. RN has no invalid state: the
        error text is appended to the input''s accessibilityHint after the description,
        and is also rendered in an assertive live region (accessibilityLiveRegion="assertive",
        with an announcement on iOS) when it appears. Button and Select take no testID,
        so composed parts (calendarButton, prevMonthButton, nextMonthButton, monthSelect,
        yearSelect, todayButton, clearButton) and label, description and popover are
        each wrapped in a View DatePicker owns with testID="DatePicker.<part>"; the
        footer is one row View (testID="DatePicker.footer", spaced by footerGap) passed
        as the BottomSheet footer''s single child. Week-number cells are Text with
        accessibilityLabel "{copy.weekNumber} {n}".'
    swiftui:
      element: TextField
      props:
      - TextField
      - .keyboardType=numbersAndPunctuation
      - Button
      - .sheet
      - .popover
      - Grid
      - .accessibilityAddTraits=isSelected
      - .accessibilityValue
      - .onMoveCommand
      - '@FocusState'
      - DateFormatter
      - Calendar
      notes: 'Input''s wrapper with the text field parsed against `Locale.current`''s
        pattern (`DateFormatter`, `Calendar.current` for weeks and week numbers) and
        the calendar `Button` opening the package''s own calendar `Grid` — not SwiftUI''s
        `DatePicker`, whose wheel/graphical styles cannot take the theme or ranges
        — in a `.sheet` (`.presentationDetents([.height(measured)])`) on phones and
        a `.popover` on regular width. Day cells are `Button`s with `.isSelected`,
        `.accessibilityValue(copy.today / selected / disabled)` and the full date
        as the label; month/year `Select`s at `size: sm`; arrows/PageUp/PageDown/Home/End
        on iPad per the table via `@FocusState` over the grid; range selection as
        documented. Dates are `YYYY-MM-DD` strings computed with `Calendar` in UTC,
        never `Date()` string parsing.'
  behavior:
  - name: the-calendar-button-opens-the-calendar
    given:
      open: false
    when:
      click: calendarButton
    then:
    - event: onOpenChange
  - name: a-disabled-field-does-not-open-the-calendar
    given:
      open: false
      disabled: true
    when:
      click: calendarButton
    then:
    - event: onOpenChange
      fired: false
  - name: choosing-a-day-reports-the-iso-date-and-closes
    description: On a day, Enter or a press selects it and closes for a single date.
    given:
      open: true
    when:
      click: day
    then:
    - event: onChange
    - event: onOpenChange
  - name: the-today-button-selects-today
    given:
      open: true
    when:
      click: todayButton
    then:
    - event: onChange
  - name: the-clear-button-clears-the-value
    description: onChange fires with undefined when the value is cleared.
    given:
      open: true
      defaultValue: '2026-09-10'
    when:
      click: clearButton
    then:
    - event: onChange
  - name: arrow-down-in-the-input-opens-the-calendar
    description: From the input, ArrowDown opens the calendar with focus on the selected
      day (or today).
    given:
      open: false
    when:
      key: ArrowDown
    then:
    - event: onOpenChange
    platforms:
    - web
    - lit
  - name: the-calendar-is-a-month-grid
    description: The days are a grid of gridcells, which is what makes the two-dimensional
      arrow model announceable.
    given:
      open: true
    then:
    - role: grid
    platforms:
    - web
    - lit
  examples:
  - name: date-of-birth
    description: A single date in the past, typed or picked.
    given:
      label: Date of birth
      name: dob
      max: '2026-09-16'
  - name: stay-dates
    description: A start and an end date picked in one calendar, with two inputs in
      the field.
    given:
      label: Stay
      name: stay
      range: true
  - name: appointment-with-week-numbers
    description: A bookable date no earlier than today, with the ISO week-number column
      shown.
    given:
      label: Appointment
      name: appointment
      min: '2026-09-16'
      showWeekNumbers: true
  - name: compact-cell-editor
    description: A small field inside a grid cell, named by its column.
    given:
      label: Due date
      name: due
      size: sm
      hideLabel: true
```

## Events

- `onChange`: emit `change`
  - payload, the keys of `CustomEvent.detail`: `value: string | { start: string; end: string } | undefined`
  - fires on: user
- `onOpenChange`: emit `open-change`
  - payload, the keys of `CustomEvent.detail`: `open: boolean`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `change`)
- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `open-change`); drives state `open`

## Parts and slots

- `label`: element
- `description`: component `Text`
- `field`: element
- `input`: element
- `calendarButton`: component `Button`
- `popover`: component `Popover`; forwards `calendarInset` → `overrides.inset`
- `header`: element
- `prevMonthButton`: component `Button`
- `nextMonthButton`: component `Button`
- `monthSelect`: component `Select`; forwards `monthTitleSize` → `overrides.fontSize`, `monthTitleWeight` → `overrides.fontWeight`
- `yearSelect`: component `Select`; forwards `monthTitleSize` → `overrides.fontSize`, `monthTitleWeight` → `overrides.fontWeight`
- `grid`: element
- `weekdayHeader`: element
- `weekNumber`: element
- `day`: element
- `footer`: element
- `todayButton`: component `Button`
- `clearButton`: component `Button`
- `errorMessage`: element

## Style bindings

- `paddingInline`: token `space.md`; by `size`: sm → `space.2`, any other value → `space.md`
- `paddingBlock`: token `space.sm`; by `size`: sm → `space.1`, any other value → `space.sm`
- `headerGap`: token `layout.gap.tight`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `daySize`: token `size.target.comfortable`; part `day`; locked
- `dayGap`: token `space.0`; part `day`
- `dayRadius`: token `radius.md`; part `day`
- `dayHover`: token `color.action.ghost.backgroundHover`; part `day`; state `hover`
- `daySelectedBackground`: token `color.control.selectedBackground`; part `day`; locked
- `daySelectedForeground`: token `color.control.selectedForeground`; part `day`; locked
- `dayInRangeBackground`: token `color.background.strong`; part `day`; locked
- `dayTodayBorder`: token `color.control.selectedBackground`; part `day`; locked
- `dayTodayBorderWidth`: token `border.width.focus`; part `day`; locked
- `dayOutsideMonthColor`: token `color.foreground.muted`; part `day`; locked
- `weekNumberSize`: token `font.size.xs`; part `weekNumber`
- `fieldGap`: token `space.2`; part `field`
- `dayFontSize`: token `font.size.sm`; part `day`
- `labelWeight`: token `font.weight.medium`; part `label`
- `descriptionText`: token `color.foreground.muted`; part `description`; locked

## Keyboard

- `Escape` (Closes the calendar without changing the value and returns focus to the calendar button.): expect closes, then focus-trigger; target part `popover`

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: date-range
  name: name
  validation:
  - required
  - invalid
  - range
  messages:
    required: required
    invalid: invalid
  discovery: context
```

## Copy

- `open`: "Choose date"
- `openRange`: "Choose dates"
- `previousMonth`: "Previous month"
- `nextMonth`: "Next month"
- `month`: "Month"
- `year`: "Year"
- `today`: "Today"
- `clear`: "Clear"
- `weekNumber`: "Week"
- `gridLabel`: "{label}, {month} {year}"; params `month` (string), `year` (string)
- `selected`: "selected"
- `todayLabel`: "today"
- `startLabel`: "Start date"
- `endLabel`: "End date"
- `required`: "{label} is required."
- `invalid`: "{label} must be a valid date ({pattern})."; params `pattern` (string)
- `tooEarly`: "{label} must be on or after {min}."
- `tooLate`: "{label} must be on or before {max}."
- `rangeOrder`: "End date must be on or after the start date."
- `requiredIndicator`: " (required)"

## Constants and examples

- example `date-of-birth`, story `DateOfBirth`: given `label: "Date of birth"`, `name: "dob"`, `max: "2026-09-16"`; A single date in the past, typed or picked.
- example `stay-dates`, story `StayDates`: given `label: "Stay"`, `name: "stay"`, `range: true`; A start and an end date picked in one calendar, with two inputs in the field.
- example `appointment-with-week-numbers`, story `AppointmentWithWeekNumbers`: given `label: "Appointment"`, `name: "appointment"`, `min: "2026-09-16"`, `showWeekNumbers: true`; A bookable date no earlier than today, with the ISO week-number column shown.
- example `compact-cell-editor`, story `CompactCellEditor`: given `label: "Due date"`, `name: "due"`, `size: "sm"`, `hideLabel: true`; A small field inside a grid cell, named by its column.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `fontSize`, `calendarInset`, `calendarGap`, `headerGap`, `footerGap`, `dayGap`, `dayRadius`, `dayHover`, `weekdaySize`, `weekdayWeight`, `weekNumberSize`, `monthTitleSize`, `monthTitleWeight`, `partGap`, `fieldGap`, `dayFontSize`, `fontFamily`, `lineHeight`, `labelWeight`, `helperSize`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `rangeSeparatorColor`, `calendarSurface`, `daySize`, `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`, `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`, `weekdayColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRing`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-calendar-button-opens-the-calendar
  given:
    open: false
  when:
    click: calendarButton
  then:
  - event: onOpenChange
- name: a-disabled-field-does-not-open-the-calendar
  given:
    open: false
    disabled: true
  when:
    click: calendarButton
  then:
  - event: onOpenChange
    fired: false
- name: choosing-a-day-reports-the-iso-date-and-closes
  description: On a day, Enter or a press selects it and closes for a single date.
  given:
    open: true
  when:
    click: day
  then:
  - event: onChange
  - event: onOpenChange
- name: the-today-button-selects-today
  given:
    open: true
  when:
    click: todayButton
  then:
  - event: onChange
- name: the-clear-button-clears-the-value
  description: onChange fires with undefined when the value is cleared.
  given:
    open: true
    defaultValue: '2026-09-10'
  when:
    click: clearButton
  then:
  - event: onChange
- name: arrow-down-in-the-input-opens-the-calendar
  description: From the input, ArrowDown opens the calendar with focus on the selected
    day (or today).
  given:
    open: false
  when:
    key: ArrowDown
  then:
  - event: onOpenChange
  platforms:
  - web
  - lit
- name: the-calendar-is-a-month-grid
  description: The days are a grid of gridcells, which is what makes the two-dimensional
    arrow model announceable.
  given:
    open: true
  then:
  - role: grid
  platforms:
  - web
  - lit
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
- name: has-accessible-name
  then:
  - name: true
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
tag: ds-date-picker
reflect:
- range
- required
- disabled
- show-week-numbers
- locale
- size
notes: 'Form-associated: setFormValue with the ISO string (a FormData with two entries
  for a range, name and name-end). Implements DsFormField for `name` (the start ISO
  string, or null until complete), and a range adds a second DsFormField entry for
  `name-end` (the end ISO string) that always validates clean; `name` reports the
  combined message. Calendar in a <ds-popover> in the shadow root; grid, week numbers,
  day labels and aria-selected placement as in web. Ids do not cross shadow roots,
  so the native <label for>, aria-describedby, aria-labelledby and the grid label
  all point at elements inside the same shadow root, and aria-invalid sits on the
  input(s). The month and year ds-selects live inside the shadow root, so ds-form
  never discovers them; they carry name="month" and name="year" only to satisfy ds-select.
  `open` is a property, not reflected (see the prop). The composed ds-popover focuses
  its first focusable on open, so DatePicker moves focus to the selected day (or today)
  after the popover has opened, and asks the popover to reposition once the grid has
  laid out. Composed `change` and `open-change`.'
```

## Guidance

## Overview

A date picker gives two ways to say the same date: type it, or find it on a calendar. People who know the date type it; people who need to see the week pick it. Both produce a plain ISO date — `2026-09-10` — and never a timestamp, because a delivery date or a birthday has no time zone to get wrong.

## When to use

Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever they exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is possible instead of validating after the fact.

## When not to use

Do not use it for a date-and-time (a DateTimePicker is planned; until then, pair with a Select of times), for a month or year alone (Select), or for relative choices ("next 7 days": SegmentedControl or Select). Do not use the calendar alone as a display of events; that is a Calendar view, not a picker.

## Behavior

Typing parses the locale pattern leniently (separators optional, two-digit years refused) and fires `onChange` once the date is complete and valid; the calendar, when open, follows the typed date. The calendar opens from its button or ArrowDown in the input on the selected month (or today's), with focus on the selected day (or today). Arrow keys move by day and week, PageUp/Down by month (with Shift, by year), Home/End to the week's ends; moving past the month's edge turns the page. Enter or click selects: for a single date it closes and returns focus to the calendar button; for a range the first pick sets the start (clearing any old range), the second sets the end and closes, and picking before the start restarts; picking the start day again as the end makes a one-day range. The first range pick is pending: it shows only in the calendar, the inputs, `value` and `onChange` are untouched until the second pick, and closing discards it. Today and Clear act immediately. Clear empties the value (both ends in a range), fires `onChange(undefined)` even when already empty, and leaves the calendar open with focus on Clear. Today acts exactly like picking today's cell (so it closes for a single date) and is disabled (aria-disabled on web/lit, accessibilityState disabled on rn) when today is before `min`, after `max` or `isDateDisabled(today)`. Escape closes without changes. Validation follows Input's precedence plus `tooEarly`, `tooLate` and `rangeOrder`. The month and year Selects are `hideLabel` and `size: sm`. The year Select spans from the `min` year (else the current year − 100) to the `max` year (else the current year + 10), each bound falling back on its own, and is always widened to include the displayed year so the controlled Select has a matching option. `onChange` fires only for a complete value (a date, or both ends of a range) and on Clear; a partial range or partial typed date changes nothing. In a range, Today acts like clicking today's cell and Clear wipes both ends; reopening focuses the start date's cell (the end's when opened from the end input). Validation order: `error`; `required` only when every input is empty; unparseable (`copy.invalid`) when any non-empty input does not parse; `required` for a range with one end empty (without `required`, a partial range reports nothing); `tooEarly`, `tooLate`, `rangeOrder` (only end before start; end equal to start is valid) — there is no `invalid` prop on this field. `valueType: date-range` covers a single date too, and the `range` validation reports through `copy.tooEarly`, `copy.tooLate` and `copy.rangeOrder`. The `{min}`/`{max}` placeholders are the dates in the input's own numeric locale pattern (the placeholder's format), not ISO. A range registers two Form fields, `name` and `name-end`, and only `name` reports the combined message — `name-end` always validates clean, since one message must not be read twice. Typed text that parses to a real date commits even when it falls outside `min`/`max` or on an `isDateDisabled` day: the range bounds then surface as `tooEarly`/`tooLate`, and a disabled day typed directly is accepted, because the field has no message for it. The month and year Selects inside the calendar are internal controls, not fields: render them outside the enclosing form's field context so they never register with a Form. The label is a native `<label for>` on web and lit (not a Text; rn uses a Text), and the input — a textbox — carries the accessible name and, on web and lit, `aria-invalid`; the root has role none. The week-number column shows the ISO week of the row's first visible day. In a range every day from start to end is selected (aria-selected, and `copy.selected` in its label), but only the two ends get the selected fill; days between get `dayInRangeBackground`.

## Content guidelines

Labels name the date's meaning ("Check-in", "Due date"), not "Date". Use `description` for format or constraint hints when they are not obvious ("Must be at least 18 years ago"). The placeholder is the locale pattern; do not replace it with an example date that might be read as a default.

## Accessibility

The input is labelled and described like Input (WCAG 1.3.1, 3.3.2), and typing is always available so nobody is forced into the grid (2.1.1). The calendar is a `grid` named with the month and year, using a roving tabindex so it is one tab stop, with the full APG date-picker key model (APG date picker dialog); each day's name is its full date plus "today" or "selected" (4.1.2). Selected and today states use both color and shape (fill vs ring) and are announced (1.4.1). Days are 44px targets (2.5.8). Focus returns to the calendar button on close (2.4.3), Escape always closes (2.1.2), and month changes respect reduced motion.

## Platform notes

### Web
Render Input's wrapper (label, description, field, error) with the text input(s), the `Button variant="ghost" iconOnly` calendar trigger (label from copy), and `Popover placement="bottom-start"` whose panel contains the header (`Button`s prev/next with chevron Icons; `Select`s for month and year, `size: sm`), `<table role="grid" aria-labelledby={gridLabelId}>` with `<thead>` of `<th scope="col" abbr={fullName}>` and `<tbody>` rows of `<td role="gridcell">` (carrying `aria-selected`) each containing a `<button>` with `tabIndex` roving, `aria-current="date"`, `aria-disabled`, `aria-label={fullDate + status}`, and a footer `Stack` with Today and Clear `Button`s (`ghost`, `sm`). Keydown on the grid implements the table, moving the roving index and changing month when needed; focus follows. Dates are computed with plain `Date.UTC` arithmetic on `YYYY-MM-DD` parts; never `new Date(string)`.

### Lit
`<ds-date-picker label="Due date" name="due" min="2026-01-01"></ds-date-picker>`; form-associated with ISO value; shadow `<ds-popover>` and grid; `DsFormField`; composed `change`, `open-change`.

### React Native
`TextInput` with the locale pattern and `keyboardType="number-pad"`, the calendar `Button`, and a `BottomSheet` (`height="content"`, `title={label}`) holding the same header, a 7-column grid of `Pressable` days (`daySize` squares), and the footer. Form registration as Input with string values only: the ISO string for a single date; for a range two fields, `name` (start ISO) and `name-end` (end ISO), with `name` reporting the combined message.

## Related

Input, Popover, Select, Button, BottomSheet, NumberInput.
