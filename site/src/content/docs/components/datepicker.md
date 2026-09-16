---
title: DatePicker
description: A date field with a calendar in a Popover — type the date or pick it from a month grid navigated with arrow keys — for one date or a start–end range, with values as plain ISO dates so no timezone ever shifts a birthday.
component:
  name: DatePicker
  category: input
  status: review
  apg: grid
  anatomy: [label, description, field, input, calendarButton, popover, header, prevMonthButton, nextMonthButton, monthSelect, yearSelect, grid, weekdayHeader, weekNumber, day, footer, todayButton, clearButton, errorMessage]
  composition:
    label: Text
    description: Text
    calendarButton: Button
    popover: Popover
    prevMonthButton: Button
    nextMonthButton: Button
    monthSelect: { component: Select, forwards: { monthTitleSize: fontSize, monthTitleWeight: fontWeight } }
    yearSelect: { component: Select, forwards: { monthTitleSize: fontSize, monthTitleWeight: fontWeight } }
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
      description: 'Field name for the Form. The value is an ISO calendar date string (`2026-09-10`) or, for a range, `{ start, end }` of them. Never a Date object: a calendar date has no time zone.'
    value:
      type: union
      shape: 'string | { start: string; end: string }'
      description: Controlled value (ISO date, or a range).
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: union
      shape: 'string | { start: string; end: string }'
      description: Initial value.
    open:
      type: boolean
      description: 'Controlled calendar state, for programmatic use and for stories and tests. Omit for the button-driven default.'
      controls:
        event: onOpenChange
        state: open
    range:
      type: boolean
      default: false
      description: Pick a start and an end date in one calendar; two inputs in the field.
    min:
      type: string
      description: Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`.
    max:
      type: string
      description: Latest selectable date (ISO).
    isDateDisabled:
      type: function
      shape: '(isoDate: string) => boolean'
      description: Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by keyboard movement.
    locale:
      type: string
      description: 'BCP 47 locale for month and weekday names, the first day of the week, and the typed format. Defaults to the document/device locale.'
    showWeekNumbers:
      type: boolean
      default: false
      description: An ISO week-number column at the start of each row.
    placeholder:
      type: string
      description: 'Defaults to the locale''s pattern ("MM/DD/YYYY", "DD.MM.YYYY").'
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
      description: 'Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search.'
    size:
      type: enum
      enumRef: size
      values: [sm, md]
      default: md
      description: 'sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type.'
    disabled:
      type: boolean
      default: false
      description: Not editable, still readable.
    error:
      type: string
      description: Error message; implies invalid.
  events:
    onChange:
      description: Fired when a complete valid date (or range) is typed or picked, with the ISO value; with undefined when cleared.
      platforms: { web: onChange, lit: change, rn: onChange, swiftui: onChange }
      payload:
        - { name: value, type: union, shape: 'string | { start: string; end: string } | undefined', description: 'The ISO date, or the ISO range with range; undefined when cleared.' }
      fires: [user]
    onOpenChange:
      description: Fired when the calendar opens or closes.
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: open, type: boolean, description: The new state of the calendar. }
      fires: [user]
  keyboard:
    - { keys: [ArrowDown, Alt+ArrowDown], action: 'From the input, opens the calendar with focus on the selected day (or today).', when: focus in input, from: first, expect: manual }
    - { keys: [Enter, ' '], action: 'On the calendar button, opens; on a day, selects it (and closes for a single date; for a range, selects the start then the end).', from: inside, expect: manual }
    - { keys: [Escape], action: Closes the calendar without changing the value and returns focus to the calendar button., when: open, from: inside, expect: [closes, focus-trigger], target: popover }
    - { keys: [ArrowRight], action: Next day., when: focus on a day, from: inside, expect: manual }
    - { keys: [ArrowLeft], action: Previous day., when: focus on a day, from: inside, expect: manual }
    - { keys: [ArrowDown], action: 'Same weekday, next week.', when: focus on a day, from: inside, expect: manual }
    - { keys: [ArrowUp], action: 'Same weekday, previous week.', when: focus on a day, from: inside, expect: manual }
    - { keys: [Home], action: First day of the week., when: focus on a day, from: inside, expect: manual }
    - { keys: [End], action: Last day of the week., when: focus on a day, from: inside, expect: manual }
    - { keys: [PageUp], action: 'Same day, previous month (Shift: previous year).', when: focus on a day, from: inside, expect: manual }
    - { keys: [PageDown], action: 'Same day, next month (Shift: next year).', when: focus on a day, from: inside, expect: manual }
    - { keys: [Tab], action: 'Cycles within the calendar: month/year controls, the grid (one tab stop, roving over days), Today, Clear.', when: open, from: inside, expect: manual }
  styles:
    background: { token: color.background }
    foreground: { token: color.foreground }
    placeholder: { token: color.foreground.muted }
    border: { token: color.border.strong }
    borderFocus: { token: color.border.focus }
    borderInvalid: { token: color.border.danger }
    borderWidth: { token: border.width.thin }
    radius: { token: radius.md }
    paddingInline: { token: space.md, by: size, values: { sm: space.2 } }
    paddingBlock: { token: space.sm, by: size, values: { sm: space.1 } }
    rangeSeparatorColor: { token: color.foreground.muted, description: 'The en dash between start and end inputs.' }
    calendarSurface: { token: color.overlay.surface, description: 'Realized by the composed Popover''s surface, which is locked, so this binding records the value the calendar lands on rather than one the Popover can be given.' }
    calendarInset: { token: layout.inset.md }
    calendarGap: { token: layout.gap.normal, description: 'Between header, grid and footer.' }
    daySize: { token: size.target.comfortable, part: day, description: 'Every day cell is a comfortable square target.' }
    dayGap: { token: space.0, part: day, description: 'Cells touch, so a range reads as one bar; the selected day''s radius gives it shape.' }
    dayRadius: { token: radius.md, part: day }
    dayHover: { token: color.action.ghost.backgroundHover, part: day, state: hover }
    daySelectedBackground: { token: color.control.selectedBackground, part: day }
    daySelectedForeground: { token: color.control.selectedForeground, part: day }
    dayInRangeBackground: { token: color.background.strong, part: day }
    dayTodayBorder: { token: color.control.selectedBackground, part: day }
    dayTodayBorderWidth: { token: border.width.focus, part: day }
    dayOutsideMonthColor: { token: color.foreground.muted, part: day }
    weekdayColor: { token: color.foreground.muted }
    weekdaySize: { token: font.size.xs }
    weekdayWeight: { token: font.weight.medium }
    monthTitleSize: { token: font.size.md, description: 'Forwarded to the month and year Selects as `overrides.fontSize`.' }
    monthTitleWeight: { token: font.weight.semibold, description: 'Forwarded to the month and year Selects as `overrides.fontWeight`.' }
    partGap: { token: space.1, description: 'Between label, description, field and error.' }
    fieldGap: { token: space.2, part: field, description: 'Between the input(s) and the calendar button in the field row.' }
    dayFontSize: { token: font.size.sm, part: day }
    fontFamily: { token: font.family.body }
    lineHeight: { token: font.lineHeight.normal }
    labelWeight: { token: font.weight.medium, part: label }
    helperSize: { token: font.size.sm }
    descriptionText: { token: color.foreground.muted, part: description }
    errorText: { token: color.foreground.danger }
    minTarget: { token: size.target.comfortable }
    minTargetSm: { token: size.target.min, description: 'The field height floor at size sm; the calendar Button becomes size sm. The calendar popup is unchanged.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
    disabledOpacity: { token: opacity.disabled }
    transition: { token: motion.duration.fast, description: 'Day-cell hover and selection states; a month change is instant. Instant under reduced motion.' }
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
        month: { type: string, description: The displayed month's name in the locale. }
        year: { type: string, description: The displayed year as the header shows it. }
    selected: selected
    todayLabel: today
    startLabel: Start date
    endLabel: End date
    required: '{label} is required.'
    invalid:
      text: '{label} must be a valid date ({pattern}).'
      params:
        pattern: { type: string, description: The locale's date pattern shown in the placeholder. }
    tooEarly: '{label} must be on or after {min}.'
    tooLate: '{label} must be on or before {max}.'
    rangeOrder: 'End date must be after the start date.'
    requiredIndicator: ' (required)'
  a11y:
    role: none
    requires: [label-association, accessible-name, error-identification, keyboard-operable, arrow-navigation, roving-tabindex, focus-visible, focus-restore, escape-dismiss, contrast-aa, target-44px, selected-state, reduced-motion]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.foreground.danger, background: color.background, level: AA }
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground, background: color.background.strong, level: AA }
      - { foreground: color.control.selectedForeground, background: color.control.selectedBackground, level: AA }
      - { foreground: color.control.selectedBackground, background: color.overlay.surface, level: AA, nonText: true }
      - { foreground: color.border.strong, background: color.background, level: AA, nonText: true }
  form:
    role: field
    value: value
    valueType: date-range
    name: name
    validation: [required, invalid, range]
    messages: { required: required, invalid: invalid }
    discovery: context
  platforms:
    web:
      element: input
      attributes: [type=text, inputmode=numeric, autocomplete=off, aria-describedby, aria-invalid, aria-required, role=grid, role=gridcell, aria-selected, aria-current=date, aria-disabled]
      notes: 'The field is Input''s wrapper with <input type="text" inputmode="numeric"> (not type="date": its picker is unstyleable, its keyboard model differs per browser, and it cannot do ranges) parsed with the locale pattern from Intl.DateTimeFormat().formatToParts; a range shows two inputs joined by an en dash. The calendar Button (ghost, iconOnly, "calendar" Icon — add to Icon''s glyph set) opens a Popover (non-modal, placement bottom-start, composes FocusScope) containing: header with prev/next Buttons and month/year Selects; a <table role="grid" aria-labelledby> with <th scope="col" abbr> weekday headers and <td role="gridcell"> days — each a <button tabindex=-1|0> in a roving tabindex, aria-selected for selected days, aria-current="date" for today, aria-disabled for min/max/isDateDisabled; a footer with Today and Clear. Days outside the month are rendered muted and selectable. Week starts from Intl.Locale.prototype.getWeekInfo() where available, else Sunday. Selecting a day writes the formatted text into the input and fires onChange with the ISO string; typing a complete valid date moves the calendar to it.'
    lit:
      tag: ds-date-picker
      reflect: [range, required, disabled, show-week-numbers, locale, size, open]
      notes: 'Form-associated: setFormValue with the ISO string (two entries for a range, name and name-end). Implements DsFormField. Calendar in a <ds-popover> in the shadow root; grid as above. Composed `change` and `open-change`.'
    rn:
      element: TextInput
      props: [keyboardType=number-pad, accessibilityLabel, accessibilityHint]
      notes: 'No core date picker on RN, so the same calendar grid renders in a BottomSheet (height content) opened by the calendar Button; each day a Pressable with accessibilityRole="button", accessibilityState={{ selected, disabled }}, accessibilityLabel from the full formatted date plus "today"/"selected". The header month is announced on change. Typing is supported in the TextInput with the locale pattern. The community datetimepicker is deliberately not used (decision 2026-09-10: react-native-svg is the only native dependency) because it cannot take tokens, so the calendar stays the system''s own grid on every platform. Native has no grid or gridcell role and no key events on Pressable, so there is no roving tabindex and no arrow, Page, Home or End handling: every day is its own focus stop reached by swipe, and the prev/next month Buttons stand in for PageUp/PageDown. `TextInputKeyPressEventData` carries no modifier flags, so Alt+ArrowDown is indistinguishable from ArrowDown and both simply open the calendar. Focus on open lands on the sheet''s first focusable element rather than the selected day, and focus on close returns through BottomSheet''s own FocusScope, since Button exposes no node handle to focus by hand. `calendarSurface` is the BottomSheet''s own locked surface here, not a value this component forwards.'
    swiftui:
      element: TextField
      props: [TextField, .keyboardType=numbersAndPunctuation, Button, .sheet, .popover, Grid, .accessibilityAddTraits=isSelected, .accessibilityValue, .onMoveCommand, '@FocusState', DateFormatter, Calendar]
      notes: 'Input''s wrapper with the text field parsed against `Locale.current`''s pattern (`DateFormatter`, `Calendar.current` for weeks and week numbers) and the calendar `Button` opening the package''s own calendar `Grid` — not SwiftUI''s `DatePicker`, whose wheel/graphical styles cannot take the theme or ranges — in a `.sheet` (`.presentationDetents([.height(measured)])`) on phones and a `.popover` on regular width. Day cells are `Button`s with `.isSelected`, `.accessibilityValue(copy.today / selected / disabled)` and the full date as the label; month/year `Select`s at `size: sm`; arrows/PageUp/PageDown/Home/End on iPad per the table via `@FocusState` over the grid; range selection as documented. Dates are `YYYY-MM-DD` strings computed with `Calendar` in UTC, never `Date()` string parsing.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/error-identified ones from the schema.
    # The root declares role none, so assertions here are events and the calendar's own roles, not root state.
    - name: the-calendar-button-opens-the-calendar
      given: { open: false }
      when: { click: calendarButton }
      then:
        - { event: onOpenChange }
    - name: a-disabled-field-does-not-open-the-calendar
      given: { open: false, disabled: true }
      when: { click: calendarButton }
      then:
        - { event: onOpenChange, fired: false }
    - name: choosing-a-day-reports-the-iso-date-and-closes
      description: On a day, Enter or a press selects it and closes for a single date.
      given: { open: true }
      when: { click: day }
      then:
        - { event: onChange }
        - { event: onOpenChange }
    - name: the-today-button-selects-today
      given: { open: true }
      when: { click: todayButton }
      then:
        - { event: onChange }
    - name: the-clear-button-clears-the-value
      description: onChange fires with undefined when the value is cleared.
      given: { open: true, defaultValue: '2026-09-10' }
      when: { click: clearButton }
      then:
        - { event: onChange }
    - name: arrow-down-in-the-input-opens-the-calendar
      description: From the input, ArrowDown opens the calendar with focus on the selected day (or today).
      given: { open: false }
      when: { key: ArrowDown }
      then:
        - { event: onOpenChange }
      platforms: [web, lit]
    - name: the-calendar-is-a-month-grid
      description: The days are a grid of gridcells, which is what makes the two-dimensional arrow model announceable.
      given: { open: true }
      then:
        - { role: grid }
      platforms: [web, lit]
  examples:
    - name: date-of-birth
      description: A single date in the past, typed or picked.
      given: { label: Date of birth, name: dob, max: '2026-09-16' }
    - name: stay-dates
      description: A start and an end date picked in one calendar, with two inputs in the field.
      given: { label: Stay, name: stay, range: true }
    - name: appointment-with-week-numbers
      description: A bookable date no earlier than today, with the ISO week-number column shown.
      given: { label: Appointment, name: appointment, min: '2026-09-16', showWeekNumbers: true }
    - name: compact-cell-editor
      description: A small field inside a grid cell, named by its column.
      given: { label: Due date, name: due, size: sm, hideLabel: true }
---

A date picker gives two ways to say the same date: type it, or find it on a calendar. People who know the date type it; people who need to see the week pick it. Both produce a plain ISO date — `2026-09-10` — and never a timestamp, because a delivery date or a birthday has no time zone to get wrong.

## When to use

Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever they exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is possible instead of validating after the fact.

## When not to use

Do not use it for a date-and-time (a DateTimePicker is planned; until then, pair with a Select of times), for a month or year alone (Select), or for relative choices ("next 7 days": SegmentedControl or Select). Do not use the calendar alone as a display of events; that is a Calendar view, not a picker.

## Behavior

Typing parses the locale pattern leniently (separators optional, two-digit years refused) and fires `onChange` once the date is complete and valid; the calendar, when open, follows the typed date. The calendar opens from its button or ArrowDown in the input on the selected month (or today's), with focus on the selected day (or today). Arrow keys move by day and week, PageUp/Down by month (with Shift, by year), Home/End to the week's ends; moving past the month's edge turns the page. Enter or click selects: for a single date it closes and returns focus to the calendar button; for a range the first pick sets the start (clearing any old range), the second sets the end and closes, and picking before the start restarts. Today and Clear act immediately. Escape closes without changes. Validation follows Input's precedence plus `tooEarly`, `tooLate` and `rangeOrder`. The month and year Selects are `hideLabel` and `size: sm`. The year Select spans the `min`/`max` years when given, else the current year − 100 to + 10. `onChange` fires only for a complete value (a date, or both ends of a range) and on Clear; a partial range or partial typed date changes nothing. In a range, Today acts like clicking today's cell and Clear wipes both ends; reopening focuses the start date's cell (the end's when opened from the end input). Validation order: `error`, `required`, unparseable (`copy.invalid`), `tooEarly`, `tooLate`, `rangeOrder` — there is no `invalid` prop on this field, so nothing sits between `error` and `required`; the `{min}`/`{max}` placeholders are formatted with the locale, not ISO. A range registers two Form fields, `name` and `name-end`, and only `name` reports the combined message — `name-end` always validates clean, since one message must not be read twice. Typed text that parses to a real date commits even when it falls outside `min`/`max` or on an `isDateDisabled` day: the range bounds then surface as `tooEarly`/`tooLate`, and a disabled day typed directly is accepted, because the field has no message for it. The month and year Selects inside the calendar are internal controls, not fields: render them outside the enclosing form's field context so they never register with a Form. The label is a native `<label for>`. The week-number column shows the ISO week of the row's first visible day.

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
