# Generate: DatePicker for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/DatePicker.tsx` exporting a typed React Native function component named `DatePicker`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `DatePickerProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof DatePicker> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `DatePicker.test.tsx`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for rn; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler prop under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), the event fired in both modes; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only through its resolved `ReactNode` prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other.
- **Style bindings**: a binding styles the view for its `part`, only in its `state` (the `Pressable` style callback's `pressed`/`hovered`/`focused`, or the component's own state), with the token listed for each `by` value; write `computed` as the given multiplication of theme values (`t`). Never introduce a literal: the literal gate still applies.
- **Keyboard**: implement the listed rules as written and none the section excludes; `target` is the part that opens or closes, `repeat` the presses, and a `native` rule needs no code. A rule with `given` needs the `Keyboard` story to accept those props as Storybook args.
- **Form and overlay**: a field registers through the one form contract `discovery` names, submitting `value` as `valueType` under `name` and running `validation` in order with the `messages` copy. An overlay anchors to `anchor`, reads `placement`, handles overflow by `collision`, dismisses exactly by `dismiss` through `closeEvent`, and is modal only when `modal` is true; this replaces the overlay defaults above.
- **Copy**: interpolate only the listed `params` and props; select a plural form with `new Intl.PluralRules(locale).select(count)`; never concatenate a count into a sentence.
- **Constants and examples**: logic reads each constant through its token expression, never the number it resolves to today. Every example is a story with the name shown and exactly its `given` as args.
- **Lifecycle**: a deprecated prop, event, value or component keeps working, carries a `@deprecated` JSDoc tag naming `use`, and warns once under `__DEV__` naming `use`.
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
    label: Text
    description: Text
    calendarButton: Button
    popover: Popover
    prevMonthButton: Button
    nextMonthButton: Button
    monthSelect: Select
    yearSelect: Select
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
        (`2026-09-10`) or, for a range, `{ start, end }` of them. Never a Date object:
        a calendar date has no time zone.'
    value:
      type: union
      shape: 'string | { start: string; end: string }'
      description: Controlled value (ISO date, or a range).
    defaultValue:
      type: union
      shape: 'string | { start: string; end: string }'
      description: Initial value.
    open:
      type: boolean
      description: Controlled calendar state, for programmatic use and for stories
        and tests. Omit for the button-driven default.
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
        are shown, not hidden, and are skipped by keyboard movement.
    locale:
      type: string
      description: BCP 47 locale for month and weekday names, the first day of the
        week, and the typed format. Defaults to the document/device locale.
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
        for a field whose context already names it: a DataGrid cell editor, a Search.'
    size:
      type: enum
      values:
      - sm
      - md
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height,
        tighter padding, small type.'
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
        with the ISO value; with undefined when cleared.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
    onOpenChange:
      description: Fired when the calendar opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
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
    expect: focus-trigger
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
    action: 'Cycles within the calendar: month/year controls, the grid (one tab stop,
      roving over days), Today, Clear.'
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
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    paddingBlockSm:
      token: space.1
      description: Vertical padding at size sm.
      locked: false
    paddingInlineSm:
      token: space.2
      description: Horizontal padding at size sm.
      locked: false
    rangeSeparatorColor:
      token: color.foreground.muted
      description: The en dash between start and end inputs.
      locked: true
    calendarSurface:
      token: color.overlay.surface
      description: Realized by the composed Popover's surface; forwarded as its `overrides.surface`.
      locked: true
    calendarInset:
      token: layout.inset.md
      locked: false
    calendarGap:
      token: layout.gap.normal
      description: Between header, grid and footer.
      locked: false
    daySize:
      token: size.target.comfortable
      description: Every day cell is a comfortable square target.
      locked: true
    dayGap:
      token: space.0
      description: Cells touch, so a range reads as one bar; the selected day's radius
        gives it shape.
      locked: false
    dayRadius:
      token: radius.md
      locked: false
    dayHover:
      token: color.action.ghost.backgroundHover
      locked: false
    daySelectedBackground:
      token: color.control.selectedBackground
      locked: true
    daySelectedForeground:
      token: color.control.selectedForeground
      locked: true
    dayInRangeBackground:
      token: color.background.strong
      locked: true
    dayTodayBorder:
      token: color.control.selectedBackground
      locked: true
    dayTodayBorderWidth:
      token: border.width.focus
      locked: true
    dayOutsideMonthColor:
      token: color.foreground.muted
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
    monthTitleSize:
      token: font.size.md
      description: Forwarded to the month and year Selects as `overrides.fontSize`.
      locked: false
    monthTitleWeight:
      token: font.weight.semibold
      description: Forwarded to the Selects as `overrides.fontWeight`.
      locked: false
    partGap:
      token: space.1
      description: Between label, description, field and error.
      locked: false
    fieldGap:
      token: space.2
      description: Between the input(s) and the calendar button in the field row.
      locked: false
    dayFontSize:
      token: font.size.sm
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    lineHeight:
      token: font.lineHeight.normal
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
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    transition:
      token: motion.duration.fast
      description: Day-cell hover and selection states; a month change is instant.
        Instant under reduced motion.
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
    gridLabel: '{label}, {month} {year}'
    selected: selected
    todayLabel: today
    startLabel: Start date
    endLabel: End date
    required: '{label} is required.'
    invalid: '{label} must be a valid date ({pattern}).'
    tooEarly: '{label} must be on or after {min}.'
    tooLate: '{label} must be on or before {max}.'
    rangeOrder: End date must be after the start date.
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
      large: true
    - foreground: color.border.strong
      background: color.background
      level: AA
      large: true
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
        placement bottom-start, composes FocusScope) containing: header with prev/next
        Buttons and month/year Selects; a <table role="grid" aria-labelledby> with
        <th scope="col" abbr> weekday headers and <td role="gridcell"> days — each
        a <button tabindex=-1|0> in a roving tabindex, aria-selected for selected
        days, aria-current="date" for today, aria-disabled for min/max/isDateDisabled;
        a footer with Today and Clear. Days outside the month are rendered muted and
        selectable. Week starts from Intl.Locale.prototype.getWeekInfo() where available,
        else Sunday. Selecting a day writes the formatted text into the input and
        fires onChange with the ISO string; typing a complete valid date moves the
        calendar to it.'
    lit:
      tag: ds-date-picker
      reflect:
      - range
      - required
      - disabled
      - invalid
      - show-week-numbers
      - locale
      notes: 'Form-associated: setFormValue with the ISO string (two entries for a
        range, name and name-end). Implements DsFormField. Calendar in a <ds-popover>
        in the shadow root; grid as above. Composed `change` and `open-change`.'
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
        so the calendar stays the system''s own grid on every platform.'
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
```

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; paired by name, so no event is declared

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `paddingBlockSm`, `paddingInlineSm`, `calendarInset`, `calendarGap`, `dayGap`, `dayRadius`, `dayHover`, `weekdaySize`, `weekdayWeight`, `monthTitleSize`, `monthTitleWeight`, `partGap`, `fieldGap`, `dayFontSize`, `fontFamily`, `lineHeight`, `labelWeight`, `helperSize`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `rangeSeparatorColor`, `calendarSurface`, `daySize`, `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`, `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`, `weekdayColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRing`, `focusRingWidth`

## Behavior scenarios (5)

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
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: error-is-identified
  given:
    error: Fix this before continuing.
  then:
  - text: Fix this before continuing.
  derived: true
```

## Platform notes (rn)

```yaml
element: TextInput
props:
- keyboardType=number-pad
- accessibilityLabel
- accessibilityHint
notes: 'No core date picker on RN, so the same calendar grid renders in a BottomSheet
  (height content) opened by the calendar Button; each day a Pressable with accessibilityRole="button",
  accessibilityState={{ selected, disabled }}, accessibilityLabel from the full formatted
  date plus "today"/"selected". The header month is announced on change. Typing is
  supported in the TextInput with the locale pattern. The community datetimepicker
  is deliberately not used (decision 2026-09-10: react-native-svg is the only native
  dependency) because it cannot take tokens, so the calendar stays the system''s own
  grid on every platform.'
```

## Guidance

## Overview

A date picker gives two ways to say the same date: type it, or find it on a calendar. People who know the date type it; people who need to see the week pick it. Both produce a plain ISO date — `2026-09-10` — and never a timestamp, because a delivery date or a birthday has no time zone to get wrong.

## When to use

Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever they exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is possible instead of validating after the fact.

## When not to use

Do not use it for a date-and-time (a DateTimePicker is planned; until then, pair with a Select of times), for a month or year alone (Select), or for relative choices ("next 7 days": SegmentedControl or Select). Do not use the calendar alone as a display of events; that is a Calendar view, not a picker.

## Behavior

Typing parses the locale pattern leniently (separators optional, two-digit years refused) and fires `onChange` once the date is complete and valid; the calendar, when open, follows the typed date. The calendar opens from its button or ArrowDown in the input on the selected month (or today's), with focus on the selected day (or today). Arrow keys move by day and week, PageUp/Down by month (with Shift, by year), Home/End to the week's ends; moving past the month's edge turns the page. Enter or click selects: for a single date it closes and returns focus to the calendar button; for a range the first pick sets the start (clearing any old range), the second sets the end and closes, and picking before the start restarts. Today and Clear act immediately. Escape closes without changes. Validation follows Input's precedence plus `tooEarly`, `tooLate` and `rangeOrder`. The month and year Selects are `hideLabel` and `size: sm`. The year Select spans the `min`/`max` years when given, else the current year − 100 to + 10. `onChange` fires only for a complete value (a date, or both ends of a range) and on Clear; a partial range or partial typed date changes nothing. In a range, Today acts like clicking today's cell and Clear wipes both ends; reopening focuses the start date's cell (the end's when opened from the end input). Validation order: `error`, `invalid`, `required`, unparseable (`copy.invalid`), `tooEarly`, `tooLate`, `rangeOrder`; the `{min}`/`{max}` placeholders are formatted with the locale, not ISO. A range registers two Form fields, `name` and `name-end`. The label is a native `<label for>`. The week-number column shows the ISO week of the row's first visible day.

## Content guidelines

Labels name the date's meaning ("Check-in", "Due date"), not "Date". Use `description` for format or constraint hints when they are not obvious ("Must be at least 18 years ago"). The placeholder is the locale pattern; do not replace it with an example date that might be read as a default.

## Accessibility

The input is labelled and described like Input (WCAG 1.3.1, 3.3.2), and typing is always available so nobody is forced into the grid (2.1.1). The calendar is a `grid` named with the month and year, using a roving tabindex so it is one tab stop, with the full APG date-picker key model (APG date picker dialog); each day's name is its full date plus "today" or "selected" (4.1.2). Selected and today states use both color and shape (fill vs ring) and are announced (1.4.1). Days are 44px targets (2.5.8). Focus returns to the calendar button on close (2.4.3), Escape always closes (2.1.2), and month changes respect reduced motion.

## Platform notes

### Web
Render Input's wrapper (label, description, field, error) with the text input(s), the `Button variant="ghost" iconOnly` calendar trigger (label from copy), and `Popover placement="bottom-start"` whose panel contains the header (`Button`s prev/next with chevron Icons; `Select`s for month and year, `size: sm`), `<table role="grid" aria-labelledby={gridLabelId}>` with `<thead>` of `<th scope="col" abbr={fullName}>` and `<tbody>` rows of `<td role="gridcell">` each containing a `<button>` with `tabIndex` roving, `aria-selected`, `aria-current="date"`, `aria-disabled`, `aria-label={fullDate + status}`, and a footer `Stack` with Today and Clear `Button`s (`ghost`, `sm`). Keydown on the grid implements the table, moving the roving index and changing month when needed; focus follows. Dates are computed with plain `Date.UTC` arithmetic on `YYYY-MM-DD` parts; never `new Date(string)`.

### Lit
`<ds-date-picker label="Due date" name="due" min="2026-01-01"></ds-date-picker>`; form-associated with ISO value; shadow `<ds-popover>` and grid; `DsFormField`; composed `change`, `open-change`.

### React Native
`TextInput` with the locale pattern and `keyboardType="number-pad"`, the calendar `Button`, and a `BottomSheet` (`height="content"`, `title={label}`) holding the same header, a 7-column grid of `Pressable` days (`daySize` squares), and the footer. Form registration as Input, returning the ISO string or `{ start, end }`.

## Related

Input, Popover, Select, Button, BottomSheet, NumberInput.
