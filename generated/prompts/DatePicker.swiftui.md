# Generate: DatePicker for SwiftUI (iOS)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/swiftui/Sources/DesignSchema/DatePicker.swift` declaring `public struct DatePicker: View` with a public initializer whose parameters are the schema's props **in the schema's order** (doc defaults as default arguments), then the event closures in the schema's order, then `overrides:`; nested `public enum`s for enum props (`String` raw values equal to the doc values, case names the values camel-cased — `icon-only` → `iconOnly` — with leading digits moved to the end, `2xl` → `xl2`, since nothing else is a Swift identifier); `public struct`s for `array`/`object` shapes named from the shape; closures for events named per `platforms.swiftui`; and `#Preview` blocks. That order and those names are a contract: `tools/behavior_tests.ts` writes `Tests/DesignSchemaTests/Generated/DatePickerBehaviorTests.swift` from the doc's `behavior` block and calls this initializer directly. Beside it write `packages/swiftui/Sources/DesignSchema/Gallery+DatePicker.swift`: `public extension Gallery { static var <name>Screen: GalleryEntry { GalleryEntry("DatePicker") { … } } }`, one gallery screen showing the component in its states, where `<name>Screen` is the component name with a lower-case first letter. Never edit `Support/Gallery+Generated.swift` — the generator rewrites that list from the screen files.

## Rules

- Render the SwiftUI view declared under `platforms.swiftui.element` with the modifiers listed under `platforms.swiftui.props`. Map each event to its `platforms.swiftui` name.
- Read tokens from `@Environment(\.dsTheme)` (`DesignSchemaTokens`). Colors are `Color`, dimensions `CGFloat` points, durations `TimeInterval`, easings `Animation`, font weights `Font.Weight`, line heights unitless multipliers. Never hard-code a color, size, font or duration. A style binding like `color.action.{variant}.background` becomes a lookup keyed by the enum value.
- Implement every item in `a11y.requires` with SwiftUI's accessibility API:
  - `accessible-name`: `.accessibilityLabel(label)`; a visually hidden label is still the label.
  - `keyboard-operable` / `focus-visible`: `.focusable()` where the doc's keyboard table applies, `@FocusState` for the roving index, `.dsOnKeyPress` (the package's own wrapper around `.onKeyPress(keys:)`, so the behavior gate can reach the same handler) / `.onMoveCommand` / `.onExitCommand` for the keys, and the focus ring drawn from `focusRing`/`focusRingWidth` only for keyboard focus.
  - `target-24px` / `target-44px`: `.frame(minWidth: theme.sizeTargetMin, minHeight: …)` (or `sizeTargetComfortable`) plus `.contentShape(Rectangle())`.
  - `heading-hierarchy`: `.accessibilityAddTraits(.isHeader)`; `.accessibilityHeading(.h1…h6)` from the level prop.
  - `live-region`: `AccessibilityNotification.Announcement`.
  - `reduced-motion`: `@Environment(\.accessibilityReduceMotion)` disables every animation the doc names.
  - `selected-state` / `expanded-state`: `.isSelected` trait or `.accessibilityValue("expanded"/"collapsed")`.
  - `gesture-alternative`: every gesture has a visible control and an `.accessibilityAction`.
- `disabled` uses `opacity.disabled` on the whole element, `.accessibilityRespondsToUserInteraction(false)` and a press guard; never `.disabled(true)` unless the doc says the control leaves the focus order.
- Controlled/uncontrolled pairs (`value`/`defaultValue`, `open`/`defaultOpen`) become a `Binding<T>?` parameter plus a `default` initial value, with `@State` holding the uncontrolled value.
- `content` props are `@ViewBuilder` generic closures. Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept `Int` as well.
- Use every `copy.*` string verbatim through `String(localized:)`-ready constants; do not write your own user-facing text.
- Testability hooks: `.accessibilityIdentifier("DatePicker")` on the root and `"DatePicker.<part>"` on every anatomy part, names verbatim. The generated behavior tests find everything through them and assert against the accessibility tree, so a state the doc names has to be visible there: `expanded` as `.accessibilityValue("expanded")`/`("collapsed")`, `selected` as `.isSelected`, `disabled` as an element that reports itself not enabled.
- `keyboard` rules describe the web keyboard model; implement the subset an iPad hardware keyboard can reach and expose everything else through accessibility actions and visible controls. Overlays follow the conventions (sheet / fullScreenCover / popover / confirmationDialog / Menu).
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; translate it to a Swift `struct`/closure type with the same member names. `ReactNode` is a `@ViewBuilder` closure or `AnyView`.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; a resolved path ending in `.default` drops that segment; an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components reuse the system's existing views (`Button`, `Link`, `Text`, `Heading`, `Icon`, `Stack`) from the package rather than re-implementing them, and never restyle a child: if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings use `#if DEBUG`.
- Previews are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`).
- Icons: use `Icon(name:)` for every glyph the docs name; never draw a glyph inline and never use SF Symbols.
- Swift 6 strict concurrency: value-type views, `@MainActor` only around UIKit calls, no `@unchecked Sendable`.

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

## Overrides (per-instance styling contract)

The component accepts `overrides: [Binding: TokenRef] = [:]` where `Binding` is a nested `public enum Binding: String, CaseIterable` listing the overridable bindings below and `TokenRef` is the token-name enum generated into `DesignSchemaTokens`. Resolve each entry with `theme[ref]` and use the typed result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no style modifier parameter, so a screen cannot drift from the system by passing points. Locked bindings are not cases of `Binding`.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderInvalid`, `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `paddingBlockSm`, `paddingInlineSm`, `calendarInset`, `calendarGap`, `dayGap`, `dayRadius`, `dayHover`, `weekdaySize`, `weekdayWeight`, `monthTitleSize`, `monthTitleWeight`, `partGap`, `fieldGap`, `dayFontSize`, `fontFamily`, `lineHeight`, `labelWeight`, `helperSize`, `disabledOpacity`, `transition`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `border`, `borderFocus`, `rangeSeparatorColor`, `calendarSurface`, `daySize`, `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`, `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`, `weekdayColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRing`, `focusRingWidth`

## Platform notes (swiftui)

```yaml
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
notes: "Input's wrapper with the text field parsed against `Locale.current`'s pattern\
  \ (`DateFormatter`, `Calendar.current` for weeks and week numbers) and the calendar\
  \ `Button` opening the package's own calendar `Grid` \u2014 not SwiftUI's `DatePicker`,\
  \ whose wheel/graphical styles cannot take the theme or ranges \u2014 in a `.sheet`\
  \ (`.presentationDetents([.height(measured)])`) on phones and a `.popover` on regular\
  \ width. Day cells are `Button`s with `.isSelected`, `.accessibilityValue(copy.today\
  \ / selected / disabled)` and the full date as the label; month/year `Select`s at\
  \ `size: sm`; arrows/PageUp/PageDown/Home/End on iPad per the table via `@FocusState`\
  \ over the grid; range selection as documented. Dates are `YYYY-MM-DD` strings computed\
  \ with `Calendar` in UTC, never `Date()` string parsing."
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

## Behavior scenarios (5)

One test per scenario, in this order.

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
