# Generate: Combobox for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Combobox.tsx` exporting a typed React function component named `Combobox`, plus `Combobox.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Combobox({ ref, …rest }: ComboboxProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Combobox> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Combobox.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Component schema

```yaml
component:
  name: Combobox
  category: input
  status: review
  apg: combobox
  anatomy:
  - label
  - description
  - field
  - chips
  - chip
  - chipRemove
  - input
  - clearButton
  - toggleButton
  - popup
  - listbox
  - status
  - errorMessage
  composition:
    label: Text
    description: Text
    chipRemove: Button
    clearButton: Button
    toggleButton: Button
    listbox: Listbox
  props:
    label:
      type: string
      required: true
      description: Visible label. Always rendered.
      a11y: label/for on the input; accessibilityLabel on native.
    name:
      type: string
      required: true
      description: Field name for the Form.
    options:
      type: array
      required: true
      shape: ListboxOption[] (flat or grouped, as Listbox)
      description: The full option set, or the current page of results when `filter`
        is `async`. Passed through to the Listbox after filtering.
    value:
      type: union
      description: Controlled selected value(s). With `multiple`, an array. With `allowCustom`,
        a value not in `options` is a custom entry.
      shape: string | string[]
    defaultValue:
      type: union
      description: Initial value(s).
      shape: string | string[]
    open:
      type: boolean
      description: Controlled popup state, for programmatic use and for stories and
        tests. Omit for the typing-driven default.
    inputValue:
      type: string
      description: Controlled text of the input (what the user has typed). Usually
        uncontrolled; controlled by consumers driving `async` filtering.
    multiple:
      type: boolean
      default: false
      description: 'Pick many: selected options appear as chips before the input,
        each removable; the list stays open while toggling; Backspace in an empty
        input removes the last chip. Uses the same Listbox engine as Select.'
    allowCustom:
      type: boolean
      default: false
      description: Typed text that matches no option can be committed as a value (tags,
        emails). Enter or a separator (comma) commits it; the list shows `copy.addCustom`
        as the first row.
    filter:
      type: enum
      values:
      - startsWith
      - contains
      - none
      - async
      default: contains
      description: 'How typing narrows `options`: by prefix, by substring (default),
        not at all (the list is a picker; typing is type-ahead — it opens the list
        and moves the active option to the first label starting with the typed characters,
        without filtering), or by the consumer (`async`: the component shows `copy.loading`
        and the consumer updates `options` from `onInputChange`).'
    placeholder:
      type: string
      description: Example input shown while empty. Never the only description.
    description:
      type: string
      description: Helper text under the label.
    required:
      type: boolean
      default: false
      description: Must have a value to submit.
    disabled:
      type: boolean
      default: false
      description: Not editable, not submitted, still readable and focusable.
    invalid:
      type: boolean
      default: false
      description: Marks the field invalid.
    error:
      type: string
      description: Error message; implies invalid.
    loading:
      type: boolean
      default: false
      description: 'For `async`: show the loading row and announce it. The consumer
        sets it around its request.'
    clearable:
      type: boolean
      default: true
      description: Show a clear button when there is a value or text.
  events:
    onChange:
      description: Fired when the selected value(s) change (array with `multiple`;
        custom entries included when `allowCustom`).
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
    onInputChange:
      description: Fired on every keystroke with the input text. The hook for `async`
        filtering.
      platforms:
        web: onInputChange
        lit: input-change
        rn: onInputChange
        swiftui: onInputChange
    onOpenChange:
      description: Fired when the list opens or closes.
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
  keyboard:
  - keys:
    - ArrowDown
    action: Opens the list (if closed) and moves the active option down; focus stays
      in the input.
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: Opens the list and moves the active option up.
    from: first
    expect: manual
  - keys:
    - Enter
    action: 'Commits the active option (single: closes; multiple: toggles and stays
      open); with allowCustom and no active option, commits the typed text.'
    when: list open
    from: first
    expect: manual
  - keys:
    - Escape
    action: Closes the list if open; if closed and clearable, clears the input text.
    when: list open
    from: first
    expect: closes
  - keys:
    - Tab
    action: Closes the list and moves focus on. Under single-select a highlighted
      option is NOT committed by Tab (typing intent is ambiguous).
    when: list open
    from: first
    expect: closes
  - keys:
    - Backspace
    action: In an empty input with chips, removes the last chip.
    when: multiple
    from: first
    expect: manual
  - keys:
    - Home
    - End
    action: Move the text caret (input semantics), never the list.
    from: first
    expect: manual
  - keys:
    - ','
    action: With allowCustom, commits the typed text as a custom value (as Enter does)
      and clears the input.
    when: allowCustom
    from: first
    expect: manual
  - keys:
    - Alt+ArrowDown
    action: Opens the list without moving the active option.
    from: first
    expect: manual
  styles:
    fieldBackground:
      token: color.background
      locked: true
    fieldBorder:
      token: color.border.strong
      locked: true
    fieldBorderFocus:
      token: color.border.focus
      locked: true
    fieldBorderInvalid:
      token: color.border.danger
      locked: false
    fieldBorderWidth:
      token: border.width.thin
      locked: false
    fieldRadius:
      token: radius.md
      locked: false
    fieldPaddingInline:
      token: space.md
      locked: false
    fieldPaddingBlock:
      token: space.sm
      locked: false
    fieldGap:
      token: layout.gap.tight
      description: Between chips, input text and the buttons.
      locked: false
    inputColor:
      token: color.foreground
      locked: true
    placeholderColor:
      token: color.foreground.muted
      locked: true
    chipBackground:
      token: color.background.strong
      locked: true
    chipColor:
      token: color.foreground
      locked: true
    chipRadius:
      token: radius.full
      locked: false
    chipPaddingInline:
      token: space.2
      locked: false
    chipPaddingBlock:
      token: space.0
      locked: false
    chipGap:
      token: layout.gap.tight
      description: Between chip label and its remove button.
      locked: false
    iconColor:
      token: color.foreground.muted
      description: Toggle chevron and clear icon.
      locked: true
    partGap:
      token: space.1
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
      token: font.size.md
      locked: false
    chipSize:
      token: font.size.sm
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    disabledOpacity:
      token: opacity.disabled
      locked: false
    enter:
      token: motion.duration.fast
      locked: false
  copy:
    empty: No matches
    loading: Loading…
    addCustom: Add "{value}"
    clearLabel: Clear
    toggleLabel: Show options
    removeChip: Remove {label}
    resultCount: '{count} results available'
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
    - live-region
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
    - foreground: color.foreground
      background: color.background.strong
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
      element: input
      attributes:
      - role=combobox
      - aria-autocomplete=list
      - aria-expanded
      - aria-controls
      - aria-activedescendant
      - aria-haspopup=listbox
      - aria-describedby
      - aria-invalid
      - aria-required
      - autocomplete=off
      notes: 'The APG editable combobox with list autocomplete: <input role="combobox"
        aria-autocomplete="list" aria-expanded aria-controls aria-activedescendant>;
        the popup is a portal with the Listbox; keydown on the input is forwarded
        to the Listbox handler so DOM focus never leaves the input. A visually hidden
        <div role="status" aria-live="polite"> announces copy.resultCount, loading
        and empty states after a short debounce. Chips are <span> with a ds Button
        (ghost, sm, iconOnly, close icon) labelled copy.removeChip; chips are not
        focus stops themselves. Hidden <input name> per value for native forms.'
    lit:
      tag: ds-combobox
      reflect:
      - multiple
      - allow-custom
      - filter
      - required
      - disabled
      - invalid
      - loading
      notes: Form-associated (FormData for multiple). <ds-listbox> lives in the same
        shadow root so aria-activedescendant resolves. Composed `change`, `input-change`,
        `open-change`. Popup via the Popover API when available.
    rn:
      element: TextInput
      props:
      - accessibilityRole=combobox
      - accessibilityLabel
      - accessibilityHint
      - accessibilityState
      - accessibilityValue
      notes: On phones the popup is a BottomSheet with the TextInput at its top (keyboard-avoiding)
        and the Listbox below — typing on a phone with a floating list under the keyboard
        is unusable. Tablets and react-native-web use the anchored popup. Chips render
        before the input inside the field; each chip has a remove Button. Result counts
        are announced with announceForAccessibility. Form registration as Input.
    swiftui:
      element: TextField
      props:
      - TextField
      - Listbox
      - .popover
      - .accessibilityValue
      - .onKeyPress
      - .onMoveCommand
      - '@FocusState'
      - .autocorrectionDisabled
      - AccessibilityNotification
      notes: An Input-shaped `TextField` (`.autocorrectionDisabled`, `.textInputAutocapitalization(.never)`)
        with the `Listbox embedded` rendered inline below the field on phones (the
        keyboard is up; a popover would fight it) and as a `.popover` on regular width.
        The active option is tracked by index (not focus — focus stays in the field)
        and announced through `AccessibilityNotification.Announcement` with `copy.activeOption`;
        the count is announced when the list opens. Arrows/Home/End/Enter/Escape per
        the keyboard table via `.onKeyPress` on the field. `allowCustom`, `multiple`
        (chips as `Button`s with `close` Icons) as documented.
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `fieldBorderInvalid`, `fieldBorderWidth`, `fieldRadius`, `fieldPaddingInline`, `fieldPaddingBlock`, `fieldGap`, `chipRadius`, `chipPaddingInline`, `chipPaddingBlock`, `chipGap`, `partGap`, `labelWeight`, `helperSize`, `popupSurface`, `popupBorder`, `popupShadow`, `popupRadius`, `popupOffset`, `layer`, `fontFamily`, `fontSize`, `chipSize`, `lineHeight`, `disabledOpacity`, `enter`
Locked (accessibility-bearing, never overridable): `fieldBackground`, `fieldBorder`, `fieldBorderFocus`, `inputColor`, `placeholderColor`, `chipBackground`, `chipColor`, `iconColor`, `descriptionText`, `errorText`, `minTarget`, `focusRingWidth`

## Behavior scenarios (8)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-filter-starts-with
  given:
    filter: startsWith
  then:
  - renders: true
  derived: true
- name: renders-filter-contains
  given:
    filter: contains
  then:
  - renders: true
  derived: true
- name: renders-filter-none
  given:
    filter: none
  then:
  - renders: true
  derived: true
- name: renders-filter-async
  given:
    filter: async
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
element: input
attributes:
- role=combobox
- aria-autocomplete=list
- aria-expanded
- aria-controls
- aria-activedescendant
- aria-haspopup=listbox
- aria-describedby
- aria-invalid
- aria-required
- autocomplete=off
notes: 'The APG editable combobox with list autocomplete: <input role="combobox" aria-autocomplete="list"
  aria-expanded aria-controls aria-activedescendant>; the popup is a portal with the
  Listbox; keydown on the input is forwarded to the Listbox handler so DOM focus never
  leaves the input. A visually hidden <div role="status" aria-live="polite"> announces
  copy.resultCount, loading and empty states after a short debounce. Chips are <span>
  with a ds Button (ghost, sm, iconOnly, close icon) labelled copy.removeChip; chips
  are not focus stops themselves. Hidden <input name> per value for native forms.'
```

## Guidance

## Overview

A combobox is an input that helps you finish. You type, it narrows the list, you pick — or, when the thing you want does not exist yet, you keep what you typed. It is the right field whenever a Select's list would be too long to scan, and it is the multi-select of choice when picks should be visible as chips.

## When to use

Use a Combobox for long lists (fifty-plus: people, cities, products), for values that can be typed faster than found (dates, codes), for `async` search against a server, and for multi-value fields where chips make the selection legible (recipients, tags, filters). Use `allowCustom` when new values are legitimate (tags, invitees by email) and never when the value must exist (a customer id). Use `filter: none` when the list is short but chips are wanted.

## When not to use

Do not use a Combobox for fewer than about ten options that never grow — use Select. Do not use it as a search box that navigates to results (that is a search form with a Listbox of suggestions, planned as Search). Do not use it to pick a date (DatePicker, planned). Do not disable typing to get a Select; use Select.

## Behavior

Typing filters `options` per `filter` and opens the list with no active option (so Enter commits typed text only when `allowCustom`); ArrowDown activates the first match without moving DOM focus from the input; Enter commits the active option, fires `onChange`, and — single — closes and shows the label in the input, or — multiple — adds a chip, clears the text and keeps the list open. Escape closes the list, then clears text if pressed again. Tab closes without committing an active option. Clicking the toggle button opens the full list; the clear button empties value and text. In `multiple`, Backspace on an empty input removes the last chip, and each chip's remove button removes that one; `onChange` receives the array in selection order. With `async`, the component shows `copy.loading` while `loading`, calls `onInputChange` on each keystroke, and renders whatever `options` the consumer supplies. Result counts, loading and "no matches" are announced politely. Validation and Form behavior are as Input; the value collected is the option value(s), or the custom string(s). Filtering is case- and diacritic-insensitive on every platform. The result-count announcement is debounced by `motion.duration.base × 2` everywhere. The toggle button opens the full, unfiltered list for that opening; the next keystroke filters again. After a commit the input shows the selected option's label (single) or clears (multiple); a controlled `inputValue` is expected to follow the same rule. The composed Listbox is `embedded`, gets `loading` while an async filter runs, and with `allowCustom` is given a synthetic first option carrying `copy.addCustom`. On phones the chips render at the top of the sheet body.

## Content guidelines

The label names the field ("Assignees"); the placeholder shows an example or a verb ("Search people"). Option labels are unique and short; descriptions carry the disambiguation (email under a name). The custom-entry row uses `copy.addCustom` verbatim so users learn the pattern. Chips show the option label, truncated with an ellipsis past about twenty characters, never the value.

## Accessibility

The input is a `combobox` with `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, and the popup a `listbox` (WCAG 4.1.2; APG editable combobox). DOM focus stays in the input while the list is navigated, so screen readers announce the active option through activedescendant and sighted users keep the caret. The number of results, loading and empty states are announced through a polite live region (4.1.3). Escape closes the list before it clears text, so a keystroke never destroys input unexpectedly (3.2.2). Chips are removable by keyboard through their buttons and by Backspace (2.1.1), each remove button named for its chip. Required and invalid are conveyed in text and attributes (1.4.1, 3.3.1). The field reaches 44px (2.5.8); the border meets 3:1 (1.4.11); text meets AA on the field and on chips.

## Platform notes

### Web
Render the label, the field wrapper (styled as Input's border and focus ring via `:focus-within`), chips, `<input role="combobox" aria-autocomplete="list" aria-expanded aria-controls={listboxId} aria-activedescendant={activeId} autocomplete="off">`, the clear and toggle Buttons (`ghost`, `sm`, `iconOnly`), the description and error, a hidden `<div role="status" aria-live="polite">` for `copy.resultCount` / loading / empty (debounced ~500ms via `motion.duration.base × 2`), and hidden inputs for the value(s). The popup is a portal (`position: fixed`, from the field rect, flip on overflow, `min-inline-size` = field width, `layer.dropdown`) containing `<Listbox labelledBy={labelId}>` with `selectionFollowsFocus={false}`; forward the input's keydown to `useListbox`'s handler; close on outside `pointerdown` and on `focusout` to outside. Filtering is case- and diacritic-insensitive.

### Lit
`<ds-combobox label="Assignees" name="assignees" multiple .options=${…}>`; form-associated; `<ds-listbox>` in the shadow root; chips and buttons composed from `<ds-button>` and `<ds-icon>`; composed `change`, `input-change`, `open-change`.

### React Native
Phones: the field is a `Pressable` summary (chips + placeholder) that opens a `BottomSheet height="full"` containing a `TextInput` (`accessibilityRole="combobox"`, autofocus) and the `Listbox`; committing closes the sheet (single) or updates chips in the sheet header (multiple) with a Done action in the footer. Tablets / react-native-web: `TextInput` in the field with an anchored popup `Modal`. Announce counts with `AccessibilityInfo.announceForAccessibility`. Form registration as Input.

## Related

Listbox, Select, Input, Button, BottomSheet.
