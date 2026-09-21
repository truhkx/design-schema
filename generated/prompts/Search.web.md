# Generate: Search for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Search.tsx` exporting a typed React function component named `Search`, plus `Search.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Search({ ref, …rest }: SearchProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Search> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Search.test.tsx`.
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
  name: Search
  category: input
  status: review
  apg: combobox
  anatomy:
  - landmark
  - form
  - label
  - field
  - icon
  - input
  - clearButton
  - submitButton
  - suggestions
  composition:
    label:
      component: Text
      props:
        element: span
      forwards:
        labelWeight: fontWeight
        fontSize: fontSize
    icon:
      component: Icon
      forwards:
        iconColor: color
    clearButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
        leadingIcon: close
    submitButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
        leadingIcon: arrow-right
    suggestions:
      component: Listbox
      props:
        embedded: true
  props:
    label:
      type: string
      required: true
      description: The accessible name ("Search products", "Search this site"). Visually
        hidden by default — the glyph and placeholder are the visible cue.
      a11y: label/for on the input, visually hidden unless `showLabel`.
    showLabel:
      type: boolean
      default: false
      description: Show the label above the field, as in a search page rather than
        a header.
    name:
      type: string
      default: q
      description: Field name; the query key when the form submits to a URL.
    value:
      type: string
      description: 'Controlled query. When set, it is the query everything reads:
        submit, a chosen suggestion, the clear button and the Form value all use this
        prop, never stale typed text; clearing reports onChange("") and the field
        empties when the caller passes the new value.'
      controls:
        event: onChange
        default: defaultValue
    defaultValue:
      type: string
      description: Initial query.
    placeholder:
      type: string
      description: Example query, not a label ("Try "invoices from March"").
    action:
      type: string
      description: 'URL to submit to with GET (web and Lit); when omitted, `onSubmit`
        handles it and nothing navigates. The URL carries the same trimmed query `onSubmit`
        receives (the field value is trimmed before the native submit): the visible
        input carries no `name`; a hidden input named `name` is set to the trimmed
        query (the controlled value or chosen label, never stale DOM text) in the
        submit handler. Ignored, with a development warning, when Search sits inside
        a Form component: the enclosing Form owns submission.'
    suggestions:
      type: array
      shape: '{ value: string; label: string; description?: string }[]'
      description: 'Suggestions for the current query, shown in a Listbox under the
        field; choosing one fills the query with the suggestion''s `label` — what
        the user just read — and submits. Provide them from `onChange` (debounced
        by the caller). Setting the prop at all is what turns the field into a combobox,
        including an explicitly empty array after a fetch that found nothing, which
        shows `copy.noSuggestions`; leaving it undefined keeps a plain search field.
        With suggestions the field becomes a Combobox: same keys, `aria-activedescendant`
        on web (Lit uses a live span instead; see platforms.lit). `aria-controls`
        and `aria-activedescendant` are set only while the list is open, so neither
        ever points at an element that is not in the document. The composed Listbox
        gets `label` = Search''s `label`, `embedded`, `value: ""` (no persistent selection
        after a choice), the suggestions as options and, while empty, `emptyMessage`
        = `copy.noSuggestions` (or `copy.loading` while `loading`); Listbox''s own
        `loading` prop is never used. Wiring props the combobox pattern needs are
        passed too and are not part of that list: an `id` for aria-controls and option
        ids, `selectionFollowsFocus: false` so a highlight never selects, `onChange`/`onActiveChange`,
        and a key that remounts it to clear the highlight; `labelledBy` is not used.
        The list opens on typing (while `suggestions` is set) and on ArrowDown — never
        on focus alone, and a `suggestions` array arriving while the field is focused
        but untouched does not open it. It closes on Escape, on Tab (explicitly, even
        though Tab moves focus to the clear or submit Button, which is inside Search),
        on blur to an element outside Search (a blur with no new focus target, such
        as a window switch, does not close it), on a pointer press outside Search
        — the same scope as the blur rule, so a press on a shown label or on the submit
        Button does not close it — on a chosen suggestion, on clear, and on every
        submit attempt, including one an empty query refuses to send. ArrowDown on
        the last suggestion stays there (no wrap), as ArrowUp never wraps. The popup
        is at least as wide as the field (a `min-inline-size` from the field''s measured
        width, as Combobox) and a long suggestion label may widen it.'
    loading:
      type: boolean
      default: false
      description: Suggestions are being fetched; announced through `copy.loading`
        whenever `suggestions` is set and this is true, list open or not — a fetch
        the user triggered is worth hearing about. The count and `copy.noSuggestions`
        announce only while the list is open.
    landmark:
      type: boolean
      default: true
      description: 'Give the field the `search` landmark. Turn off when the Search
        sits inside another search landmark (a filter within a results page). It is
        `role="search"` on Search''s own form element, not a composed Landmark wrapping
        it: the landmark is one attribute on an element this component already renders,
        and a wrapper would add a second element and take the root''s testability
        hook. With a single search landmark on the page it needs no name of its own
        beyond the field''s label.'
    size:
      type: enum
      enumRef: size
      values:
      - md
      - lg
      default: md
      description: lg for a search page's hero field.
    disabled:
      type: boolean
      default: false
      description: 'Not editable, still readable and focusable: the input is read-only
        with aria-disabled (on native `editable={false}` with accessibilityState disabled,
        which as Input is not focusable on iOS), both Buttons are disabled (the clear
        Button still renders when there is text), every key in the keyboard table
        is inert, suggestions never open and an open list closes, no event fires,
        the component dims to `disabledOpacity`, and a disabled Search is not registered
        with (or submitted by) a Form — on Lit ds-form skips it as disabled and it
        sends setFormValue(null). A Form-level disabled (the Form''s own `disabled`,
        FormContext) unregisters it the same way, rather than registering and reporting
        itself disabled.'
  events:
    onChange:
      description: 'Fired on every keystroke with the query; the caller fetches suggestions
        here. Also fired whenever Search itself changes the text, so a controlled
        value can follow: with "" before `onClear` (clear button or Escape), and with
        the suggestion''s `label` before `onSubmit` when one is chosen.'
      platforms:
        web: onChange
        lit: change
        rn: onChangeText
        swiftui: onChange
      payload:
      - name: value
        type: string
        description: The query as typed.
      fires:
      - user
    onSubmit:
      description: Fired on Enter, the submit button, or choosing a suggestion, with
        the query.
      platforms:
        web: onSubmit
        lit: submit
        rn: onSubmitEditing
        swiftui: onSubmit
      payload:
      - name: value
        type: string
        description: 'The submitted query, trimmed; for a chosen suggestion its trimmed
          `label`. Never empty: an empty trimmed query does not fire.'
      fires:
      - user
    onClear:
      description: Fired when the field is emptied — by the clear button, or by the
        Escape that clears it when no suggestions are open. Either route reports.
      platforms:
        web: onClear
        lit: clear
        rn: onClear
        swiftui: onClear
      fires:
      - user
  keyboard:
  - keys:
    - Enter
    action: Submits the query (or the highlighted suggestion).
    from: first
    expect: manual
  - keys:
    - Escape
    action: Closes suggestions if open; otherwise clears the field. On an already-empty
      field with no list open it does nothing and fires no onClear.
    from: first
    expect: manual
  - keys:
    - ArrowDown
    action: Opens suggestions and highlights the first; then moves down.
    when: suggestions
    from: first
    expect: manual
  - keys:
    - ArrowUp
    action: 'Moves up; from the first suggestion, back to the input with no highlight.
      With no highlight to begin with it is a no-op: it neither opens the list nor
      changes one that is open.'
    when: suggestions
    from: first
    expect: manual
  - keys:
    - Tab
    action: 'Leaves the field: to the clear button when the field has text, then the
      submit button.'
    from: first
    expect: focus-next
  styles:
    background:
      token: color.control.background
      locked: true
    foreground:
      token: color.foreground
      locked: true
    placeholder:
      token: color.foreground.muted
      locked: true
    iconColor:
      token: color.foreground.muted
      part: icon
      description: 'The leading search glyph only, forwarded to that Icon''s own `color`
        override. The clear and submit glyphs keep their ghost Buttons'' own colors;
        nothing is forwarded into a Button. The glyph''s size is not a binding on
        purpose: it is derived from `size` (sm at md, md at lg) so the glyph always
        tracks the text, and is not independently themeable.'
      locked: true
    border:
      token: color.border.strong
      locked: true
    borderFocus:
      token: color.border.focus
      description: 'The field wrapper''s border while the input itself has focus (web
        and Lit: `:has(input:focus-visible)`, not `:focus-within`, so a focused clear
        or submit Button shows only its own ring). The input draws no outline of its
        own.'
      locked: true
    borderWidth:
      token: border.width.thin
      locked: false
    radius:
      token: radius.full
      description: 'A pill: the one place the system uses the full radius on a field,
        so search reads as search.'
      locked: false
    paddingInline:
      token: space.md
      locked: false
    paddingBlock:
      token: space.sm
      by: size
      values:
        lg: space.md
      locked: false
    affixGap:
      token: layout.gap.tight
      description: Between the glyph, the input and the buttons.
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
    suggestionsOffset:
      token: space.1
      part: suggestions
      description: Gap between the field and the popup. It is folded into the fixed
        popup's own position calculation — exactly the mechanism ds-combobox uses
        — not applied as a margin afterwards, which would position the popup and then
        shift it again.
      locked: false
    popupSurface:
      token: color.overlay.surface
      locked: false
    popupBorder:
      token: color.border
      locked: false
    popupBorderWidth:
      token: border.width.thin
      locked: false
    popupRadius:
      token: radius.md
      locked: false
    popupShadow:
      token: shadow.overlay
      locked: false
    layer:
      token: layer.dropdown
      description: 'Stacking of the suggestions popup on web and Lit, placed below
        the field and flipped above it when the viewport has no room, as Combobox.
        Unused on native, where the list is inline: it stays in the native overridable
        set for parity and an override of it there is accepted and does nothing.'
      locked: false
    partGap:
      token: space.1
      description: Between the visible label and the field.
      locked: false
    labelWeight:
      token: font.weight.medium
      part: label
      description: Forwarded to the label Text's own `fontWeight` override; the label's
        size follows `fontSize`, forwarded as its `fontSize` override, so a shown
        label tracks `size` as Input's does. Both forwards always carry the binding's
        token (`font.size.{size}` when not overridden). Forwarded bindings (this,
        fontSize to the label, iconColor) reach the child only through its `overrides`;
        they have no --ds-search-* CSS hook, and none is defined on :host either —
        an unread custom property would look like a working one. They are reachable
        through the `overrides` prop and nowhere else, which is the exception to the
        "every binding is also a custom property" rule.
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: Replaces borderWidth on the field wrapper while the input is focused
        (the field border, in borderFocus, is the focus ring, as Input and Combobox);
        paddingInline and paddingBlock shrink by the difference so the content does
        not shift. No separate outline.
      locked: true
    disabledOpacity:
      token: opacity.disabled
      description: 'Applied to the label, glyph and input of a disabled Search, not
        to an element containing the Buttons, which receive `disabled` and dim once
        through their own style (as NumberInput''s steppers). The field frame (border,
        background) is not dimmed, so the dimmed text sits on an undimmed control
        background and falls below the `a11y.contrast` figures: those pairs describe
        the enabled state, and the disabled state relies on the WCAG 1.4.3 exemption
        for inactive components, made machine-visible by `aria-disabled="true"` on
        the dimmed root as well as the input (on React Native the root View beside
        accessibilityState.disabled, since react-native-web drops the object form).'
      locked: false
  constants:
    statusDebounce:
      description: 'How long the suggestion-count, loading and no-suggestions announcements
        wait before the live region updates (or, on native, before announcing), so
        the count settles while the caller refetches. Not motion: computed from the
        theme''s standard `motion.duration.base` value, never from a reduced-motion
        override that zeroes the token. Web and Lit read the computed `--motion-duration-base`
        (token stylesheets never zero it; reduced motion is handled in component CSS),
        and update at once when it cannot be read (no theme loaded, jsdom); React
        Native reads the theme token, which is never zeroed (reduced motion is the
        separate useReducedMotion), as Combobox.'
      token: motion.duration.base
      multiply: 2
      unit: ms
  copy:
    clear: Clear search
    submit: Search
    loading: Loading suggestions
    suggestionsCount:
      plural:
        by: count
        one: '{count} suggestion available'
        other: '{count} suggestions available'
      params:
        count:
          type: number
          description: The number of suggestions in the list.
    noSuggestions: No suggestions
  a11y:
    role: searchbox
    requires:
    - label-association
    - accessible-name
    - landmark-role
    - keyboard-operable
    - arrow-navigation
    - focus-visible
    - contrast-aa
    - target-24px
    - live-region
    - escape-dismiss
    contrast:
    - foreground: color.foreground
      background: color.control.background
      level: AA
    - foreground: color.foreground.muted
      background: color.control.background
      level: AA
    - foreground: color.border.strong
      background: color.background
      level: AA
      nonText: true
  form:
    role: field
    value: value
    valueType: string
    name: name
    discovery: context
  platforms:
    web:
      element: form
      attributes:
      - role=search
      - type=search
      - enterkeyhint=search
      - autocomplete=off
      - aria-controls
      - aria-expanded
      - aria-activedescendant
      notes: 'A <form role="search"> (the Landmark) with a visually-hidden <label>,
        a decorative Icon "search", <input type="search" enterkeyhint="search" autocomplete="off">
        with the browser''s own clear button suppressed (::-webkit-search-cancel-button
        { display: none }) in favor of the system Button (ghost, sm, iconOnly, "close"
        Icon), and a submit Button (ghost, sm, iconOnly, "arrow-right" Icon) — always
        rendered, on every platform, since Enter is not reachable from every on-screen
        keyboard and the Tab order names it. On every platform the glyph Icon is `size:
        sm` at `size: md` and `size: md` at `size: lg`, so it keeps its proportion
        to the text. `a11y.role` (searchbox) is the role without suggestions, and
        it is written out as an explicit `role` rather than left implicit in `<input
        type="search">`, so the role is observable to the name and role tests. With
        `suggestions` the input takes role="combobox" aria-autocomplete="list" — a
        conditional role the schema has no field for; `combobox` wins whenever the
        prop is set — and composes Listbox — `embedded`, so Search''s own popup bindings
        own the surface, border, radius and shadow — with aria-activedescendant exactly
        as Combobox does; a visually-hidden live region announces the count. ArrowUp
        from the first suggestion, or before any has been highlighted, clears the
        highlight and leaves focus in the input rather than wrapping to the last.
        While suggestions are loading, Search passes no options and `emptyMessage:
        copy.loading` (never Listbox''s `loading` prop), so the verbatim string is
        what shows. The `landmark` and `form` parts are one element (the root <form>,
        carrying data-part="form"); with `landmark` off it is a plain <form>. Inside
        a Form component (FormContext present) the root is a <div role="search"> instead,
        so no <form> nests in a <form>: Search handles Enter itself, the submit Button
        is type="button", `onSubmit` fires, `action` is ignored, and the enclosing
        Form is not submitted by Search. Form registration (React, Lit ds-form, React
        Native): the value is the trimmed query ("" when empty, never omitted), validation
        always passes (no required or invalid state), and a disabled Search is not
        registered.'
    lit:
      tag: ds-search
      reflect:
      - size
      - show-label
      - prop: landmark
        attribute: no-landmark
      - disabled
      - loading
      notes: 'The <form> lives in the shadow root; when `action` is set, submit navigates
        via a light-DOM form the element creates on demand (shadow forms do not participate
        in the page). Composed `submit`, `change`, `clear`. Suggestions in a <ds-listbox>
        inside the shadow root, but its option rows render in ds-listbox''s own shadow
        root, which neither an aria-activedescendant IDREF nor ariaActiveDescendantElement
        can reach; as ds-combobox does, the input carries no aria-activedescendant
        and the highlighted suggestion''s label is written to a polite live span linked
        by aria-describedby. That span is the live one; the status region (count,
        loading, no-suggestions) is role="status" and is not linked by aria-describedby,
        so the two announcement queues never compete over one link. Clearing the highlight
        is `activeValue = null` on the ds-listbox, not a keyed remount — Lit has no
        keyed remount for a custom element, and re-creating the popup on every highlight
        change would thrash it. The composed ds-listbox''s own `change` and `active-change`
        events are stopped at the shadow boundary and never re-dispatched: without
        that, a listener on <ds-search> would hear two `change` events per keystroke
        and could not tell them apart. The shadow <form> is both the `landmark` and
        `form` part and never nests in a light-DOM form, but inside <ds-form> `action`
        is still ignored, as on web. For ds-form discovery the element exposes `required`
        (always false), `validationMessage` (always "") and `checkValidity()` (always
        true), and submits the trimmed query with setFormValue; `reportValidity()`
        is also always true, and formResetCallback restores `defaultValue` without
        firing `change` or `clear`. The label is a `<label for>` wrapping `<ds-text
        element="span">`; data-part="label" goes on the ds-text and the visually-hidden
        class on the `<label>`. Inside-a-Form detection walks up the composed tree
        (crossing shadow roots through getRootNode().host) for a ds-form, not closest()
        alone.'
    rn:
      element: TextInput
      props:
      - returnKeyType=search
      - clearButtonMode=never
      - accessibilityRole=search
      - role=searchbox
      - accessibilityLabel
      notes: 'TextInput with returnKeyType="search" and onSubmitEditing; the system
        clear Button rather than clearButtonMode so it matches across platforms; a
        search glyph Icon before the input; the submit Button always rendered. Events
        map to native prop names with no aliases: `onChange` is the `onChangeText`
        prop, `onSubmit` is `onSubmitEditing`, `onClear` stays `onClear`; the old
        onChange/onSubmit prop names are not kept. Suggestions render as a Listbox
        below the field in a View (no overlay: on a phone the list takes the space
        under the field), opened by typing while the field has focus and `suggestions`
        is set, or by ArrowDown from a hardware keyboard or react-native-web (onKeyPress;
        no row is highlighted), and closed on blur — except while a touch or pointer
        press is in progress inside the list (react-native-web blurs the input on
        pointerdown), after which it closes if focus did not return. A press lasts
        from touch start or pointerdown until its release plus one tick; a long press
        or a scroll inside the list counts as in progress. The clear and submit Buttons
        take `leadingIcon` as an `<Icon>` element at the Icon''s default size coloured
        with the ghost Button''s foreground (color.action.ghost.foreground), as Dialog
        does; the leading glyph takes iconColor through its `overrides.color`, not
        the `color` prop. keyboardShouldPersistTaps="handled" belongs on the caller''s
        ScrollView; Search has none of its own. accessibilityRole="search" goes on
        the container View only when `landmark` is on (that View is both the `landmark`
        and `form` part; native has no form element), never on the TextInput, which
        on react-native-web would become a second search landmark. The label Text,
        when shown, is hidden from accessibility because the TextInput already carries
        accessibilityLabel. There is no visually-hidden primitive, so the count, loading
        and no-suggestions announcements have no element: they go through AccessibilityInfo.announceForAccessibility
        after `statusDebounce`. Escape arrives only from a hardware keyboard (or react-native-web)
        through onKeyPress; the clear Button is the accessible path. React Native''s
        accessibilityRole list has no `searchbox`, so the TextInput takes the `role="searchbox"`
        prop instead (RN maps it to the iOS search-field trait and react-native-web
        passes it through as the ARIA role); `accessibilityRole="search"` stays on
        the container View. `name` is the Form registration key here as everywhere
        — only `action` is inert on native (a GET target has no meaning), accepted
        for parity and warned about in development. The composition''s `element: span`
        on the label is not passed (native Text has no `element`); only labelWeight
        and fontSize are forwarded, as its overrides. The Tab rule has no native equivalent
        and on react-native-web falls out of DOM order, so nothing implements it;
        Escape and ArrowDown likewise reach the field only from a hardware keyboard
        through onKeyPress. Of the combobox wiring the web list needs, native passes
        only `label`, the options, `value: ""`, `embedded`, `selectionFollowsFocus:
        false` and `emptyMessage`: there is no id for aria-controls or option ids,
        no `onActiveChange` and no remount key, because touch rows carry no highlight
        to track or clear. Listbox rows are touch Pressables with no key events, so
        there is no arrow-key highlight: a tap chooses a suggestion and Enter always
        submits the typed query.'
    swiftui:
      element: TextField
      props:
      - TextField
      - .submitLabel=search
      - .keyboardType
      - .autocorrectionDisabled
      - Button
      - Listbox
      - .accessibilityElement=contain
      - .accessibilityAddTraits=isSearchField
      - AccessibilityNotification
      notes: 'Not `.searchable` (navigation-bar bound). A `.contain` element labelled
        by `label` holding the `search` Icon, a `TextField` with `.isSearchField`,
        `.submitLabel(.search)`, `.autocorrectionDisabled`, the clear `Button` when
        there is text, and the submit `Button`; `onSubmit` from `.onSubmit`. Suggestions:
        `Listbox embedded` inline below the field (the keyboard is up), active index
        tracked and announced as Combobox; the count announced on open. `landmark`
        registers a ''Search'' rotor entry through Landmark. `action` has no meaning
        on iOS (no form navigation) and is ignored with a debug note.'
  behavior:
  - name: typing-fires-onchange-with-the-query
    description: Typing fires onChange on every keystroke; the caller fetches suggestions
      there.
    when:
      type: invoices
    then:
    - event: onChange
  - name: enter-submits-the-query
    given:
      defaultValue: invoices
    when:
      key: Enter
    then:
    - event: onSubmit
    platforms:
    - web
    - lit
  - name: an-empty-query-is-not-submitted
    description: The field never submits an empty query.
    when:
      key: Enter
    then:
    - event: onSubmit
      fired: false
    platforms:
    - web
    - lit
  - name: the-submit-button-submits-the-query
    description: The submit button submits the same query Enter does; with `action`
      it is the same native GET form submit.
    given:
      defaultValue: invoices
      action: /search
    when:
      click: submitButton
    then:
    - event: onSubmit
  - name: the-clear-button-empties-the-field
    description: The clear button appears when there is text, empties the field and
      fires onClear.
    given:
      defaultValue: invoices
    when:
      click: clearButton
    then:
    - event: onClear
  - name: escape-clears-the-field-when-no-list-is-open
    description: Escape closes suggestions if open; otherwise it clears the field,
      and onClear fires for that too.
    given:
      defaultValue: invoices
    when:
      key: Escape
    then:
    - event: onClear
    platforms:
    - web
    - lit
  - name: the-field-is-inside-the-search-landmark
    description: The one primary search is wrapped in the search landmark so it can
      be jumped to.
    then:
    - role: search
    platforms:
    - web
    - rn
  examples:
  - name: header-search
    description: The site header's field - label hidden, glyph and placeholder as
      the visible cue.
    given:
      label: Search this site
      placeholder: Search products and orders
  - name: search-page-hero
    description: A search page's main field, larger and with its label shown.
    given:
      label: Search orders
      showLabel: true
      size: lg
  - name: with-suggestions
    description: Completions offered under the field, where choosing one fills the
      query and submits.
    given:
      label: Search products
      suggestions:
      - value: invoices-march
        label: Invoices from March
      - value: invoices-april
        label: Invoices from April
  - name: filter-within-a-results-page
    description: A second search field inside a results page, with the landmark off
      so there is only one.
    given:
      label: Filter results
      landmark: false
      name: filter
```

## Events

- `onChange`: emit `onChange`
  - payload, positional, in this order: `value: string`
  - fires on: user
- `onSubmit`: emit `onSubmit`
  - payload, positional, in this order: `value: string`
  - fires on: user
- `onClear`: emit `onClear`
  - fires on: user

## Controlled state

- `value` is controlled when given, uncontrolled from `defaultValue` when omitted; changes reported by `onChange` (emit `onChange`)

## Parts and slots

- `landmark`: element
- `form`: element
- `label`: component `Text`; props `element` = "span"; forwards `labelWeight` → `overrides.fontWeight`, `fontSize` → `overrides.fontSize`
- `field`: element
- `icon`: component `Icon`; forwards `iconColor` → `overrides.color`
- `input`: element
- `clearButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true, `leadingIcon` = "close"
- `submitButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true, `leadingIcon` = "arrow-right"
- `suggestions`: component `Listbox`; props `embedded` = true

## Style bindings

- `iconColor`: token `color.foreground.muted`; part `icon`; locked
- `paddingBlock`: token `space.sm`; by `size`: lg → `space.md`, any other value → `space.sm`
- `suggestionsOffset`: token `space.1`; part `suggestions`
- `labelWeight`: token `font.weight.medium`; part `label`

## Form and overlay

```yaml
form:
  role: field
  value: value
  valueType: string
  name: name
  discovery: context
```

## Copy

- `clear`: "Clear search"
- `submit`: "Search"
- `loading`: "Loading suggestions"
- `suggestionsCount`: "{count} suggestions available"; params `count` (number); plural by `count`: one "{count} suggestion available", other "{count} suggestions available"
- `noSuggestions`: "No suggestions"

## Constants and examples

- constant `statusDebounce`: `calc(var(--motion-duration-base) * 2)` (`motion.duration.base` × 2) ms
- example `header-search`, story `HeaderSearch`: given `label: "Search this site"`, `placeholder: "Search products and orders"`; The site header's field - label hidden, glyph and placeholder as the visible cue.
- example `search-page-hero`, story `SearchPageHero`: given `label: "Search orders"`, `showLabel: true`, `size: "lg"`; A search page's main field, larger and with its label shown.
- example `with-suggestions`, story `WithSuggestions`: given `label: "Search products"`, `suggestions: [{"value":"invoices-march","label":"Invoices from March"},{"value":"invoices-april","label":"Invoices from April"}]`; Completions offered under the field, where choosing one fills the query and submits.
- example `filter-within-a-results-page`, story `FilterWithinAResultsPage`: given `label: "Filter results"`, `landmark: false`, `name: "filter"`; A second search field inside a results page, with the landmark off so there is only one.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `borderWidth`, `radius`, `paddingInline`, `paddingBlock`, `affixGap`, `fontFamily`, `fontSize`, `lineHeight`, `suggestionsOffset`, `popupSurface`, `popupBorder`, `popupBorderWidth`, `popupRadius`, `popupShadow`, `layer`, `partGap`, `labelWeight`, `disabledOpacity`
Locked (accessibility-bearing, never overridable): `background`, `foreground`, `placeholder`, `iconColor`, `border`, `borderFocus`, `minTarget`, `focusRingWidth`

## Behavior scenarios (12)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: typing-fires-onchange-with-the-query
  description: Typing fires onChange on every keystroke; the caller fetches suggestions
    there.
  when:
    type: invoices
  then:
  - event: onChange
- name: enter-submits-the-query
  given:
    defaultValue: invoices
  when:
    key: Enter
  then:
  - event: onSubmit
  platforms:
  - web
  - lit
- name: an-empty-query-is-not-submitted
  description: The field never submits an empty query.
  when:
    key: Enter
  then:
  - event: onSubmit
    fired: false
  platforms:
  - web
  - lit
- name: the-submit-button-submits-the-query
  description: The submit button submits the same query Enter does; with `action`
    it is the same native GET form submit.
  given:
    defaultValue: invoices
    action: /search
  when:
    click: submitButton
  then:
  - event: onSubmit
- name: the-clear-button-empties-the-field
  description: The clear button appears when there is text, empties the field and
    fires onClear.
  given:
    defaultValue: invoices
  when:
    click: clearButton
  then:
  - event: onClear
- name: escape-clears-the-field-when-no-list-is-open
  description: Escape closes suggestions if open; otherwise it clears the field, and
    onClear fires for that too.
  given:
    defaultValue: invoices
  when:
    key: Escape
  then:
  - event: onClear
  platforms:
  - web
  - lit
- name: the-field-is-inside-the-search-landmark
  description: The one primary search is wrapped in the search landmark so it can
    be jumped to.
  then:
  - role: search
  platforms:
  - web
  - rn
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-size-md
  given:
    size: md
  then:
  - renders: true
  derived: true
- name: renders-size-lg
  given:
    size: lg
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
```

## Platform notes (web)

```yaml
element: form
attributes:
- role=search
- type=search
- enterkeyhint=search
- autocomplete=off
- aria-controls
- aria-expanded
- aria-activedescendant
notes: "A <form role=\"search\"> (the Landmark) with a visually-hidden <label>, a\
  \ decorative Icon \"search\", <input type=\"search\" enterkeyhint=\"search\" autocomplete=\"\
  off\"> with the browser's own clear button suppressed (::-webkit-search-cancel-button\
  \ { display: none }) in favor of the system Button (ghost, sm, iconOnly, \"close\"\
  \ Icon), and a submit Button (ghost, sm, iconOnly, \"arrow-right\" Icon) \u2014\
  \ always rendered, on every platform, since Enter is not reachable from every on-screen\
  \ keyboard and the Tab order names it. On every platform the glyph Icon is `size:\
  \ sm` at `size: md` and `size: md` at `size: lg`, so it keeps its proportion to\
  \ the text. `a11y.role` (searchbox) is the role without suggestions, and it is written\
  \ out as an explicit `role` rather than left implicit in `<input type=\"search\"\
  >`, so the role is observable to the name and role tests. With `suggestions` the\
  \ input takes role=\"combobox\" aria-autocomplete=\"list\" \u2014 a conditional\
  \ role the schema has no field for; `combobox` wins whenever the prop is set \u2014\
  \ and composes Listbox \u2014 `embedded`, so Search's own popup bindings own the\
  \ surface, border, radius and shadow \u2014 with aria-activedescendant exactly as\
  \ Combobox does; a visually-hidden live region announces the count. ArrowUp from\
  \ the first suggestion, or before any has been highlighted, clears the highlight\
  \ and leaves focus in the input rather than wrapping to the last. While suggestions\
  \ are loading, Search passes no options and `emptyMessage: copy.loading` (never\
  \ Listbox's `loading` prop), so the verbatim string is what shows. The `landmark`\
  \ and `form` parts are one element (the root <form>, carrying data-part=\"form\"\
  ); with `landmark` off it is a plain <form>. Inside a Form component (FormContext\
  \ present) the root is a <div role=\"search\"> instead, so no <form> nests in a\
  \ <form>: Search handles Enter itself, the submit Button is type=\"button\", `onSubmit`\
  \ fires, `action` is ignored, and the enclosing Form is not submitted by Search.\
  \ Form registration (React, Lit ds-form, React Native): the value is the trimmed\
  \ query (\"\" when empty, never omitted), validation always passes (no required\
  \ or invalid state), and a disabled Search is not registered."
```

## Guidance

## Overview

Search is the field people look for first. It is an Input shaped so nobody has to read a label — a magnifier glyph, a pill, a clear button — and it submits on Enter like every search field they have used.

## When to use

Use Search for free-text search over a site, an app, or a large dataset: the header search, a search page's main field, a "filter the list" field over more than a couple of dozen rows. Add `suggestions` when the backend can offer completions or recent queries; keep `landmark` on for the one primary search so screen-reader users can jump to it.

## When not to use

Do not use Search for a field that takes a specific value (an order number: Input), for choosing from a known list (Select or Combobox), or for a filter that applies instantly to a short list already on screen (an Input labelled "Filter" is honest about what it does). Do not put two search landmarks on a page.

## Behavior

Typing fires `onChange`; the clear button appears when there is text and empties the field, returns focus to it and fires `onClear`. Enter or the submit button fires `onSubmit` with the trimmed query (and navigates to `action` on web when set, carrying the same trimmed query). With suggestions, typing or ArrowDown opens the list (focus alone does not) and ArrowDown moves the highlight, stopping at the last, while focus stays in the input; Enter fills and submits the highlighted suggestion's `label`, exactly as clicking it does; Escape closes the list first, then clears. `loading` is announced, and while the list is open with no options its empty row shows `copy.loading`. The Keyboard story renders the closed field with `defaultValue: 'invoices'` and the `with-suggestions` example's suggestions (there is no `open` prop, and focus alone never opens the list); the first ArrowDown in it opens the list. The field never submits an empty query. Choosing a suggestion fills the query with its `label` (the display text). With `action`, submission is a native GET form submit (Enter, the submit button and a chosen suggestion all submit the same form), never a scripted navigation. The submit button is always rendered. Suggestions mode starts when the `suggestions` prop is set at all (an empty array shows the empty/loading row). `onClear` fires for the clear button and for an Escape that empties the field. ArrowUp with no highlight is a no-op. Clearing fires `onChange("")` then `onClear`; choosing a suggestion fires `onChange(label)` then `onSubmit` with that trimmed label — in controlled mode the field goes on showing the caller's `value` until the caller accepts the new one, and the submitted query is the label either way. Focus is moved by exactly one route: clear returns it to the input. After a submit, and after choosing a suggestion, focus stays where it is. The live region is emptied when the list closes, so the count, loading and no-suggestions text is only ever current; the plural form of `copy.suggestionsCount` is selected with `Intl.PluralRules` in the locale of the nearest `[lang]` ancestor, falling back to the runtime locale (`navigator.language` on web and Lit, the device locale on native). A disabled Search is readable and focusable but inert. The landmark is `role="search"` on Search's own root element (not a composed Landmark), needing no name beyond the field's label; the popup bindings style the wrapper and the Listbox is `embedded`.

## Content guidelines

The label says what is searched ("Search orders"); the placeholder, if any, shows an example query rather than repeating the label. Suggestion labels show the completion with the typed part not highlighted (the system does not bold matches; the list is short enough to read). Keep suggestions to eight.

## Accessibility

The form is the page's `search` landmark (WCAG 1.3.6; APG landmarks) and the input a `searchbox` with an associated label that is visually hidden but present (1.3.1, 2.4.6). With suggestions the field follows the combobox pattern with `aria-activedescendant`, so focus never leaves the input and the count is announced (4.1.2, 4.1.3). The clear and submit buttons are real Buttons with names from copy and 24px targets. Escape closes the list before clearing, so it never destroys typed text unexpectedly (2.1.2).

## Platform notes

### Web
Render `<form role="search" data-ds="Search" onSubmit>` containing a visually-hidden `<label>`, the field wrapper (pill from `radius`, border, background) with `Icon name="search"` (decorative), `<input type="search" enterkeyhint="search" autocomplete="off">`, the clear `Button` when `value` is non-empty, and the submit `Button`, always. Suggestions: reuse Combobox's list rendering — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `Listbox` in a portal positioned under the field on `layer.dropdown`. Suppress the native cancel button via the WebKit pseudo-element.

### Lit
`<ds-search label="Search products" action="/search"></ds-search>`; shadow `<form>`; for navigation create a light-DOM `<form method="get" action>` with a hidden input and submit it; composed events; Listbox inside the shadow root.

### React Native
`View accessibilityRole="search"` (when `landmark`) containing `Icon`, `TextInput` (`returnKeyType="search"`, `onSubmitEditing`), the clear `Button` and the submit `Button`. Suggestions: `Listbox` below the field, inline. The caller's ScrollView needs `keyboardShouldPersistTaps="handled"` so a tap on a suggestion is not swallowed by keyboard dismissal; Search has no ScrollView to set it on.

## Related

Input, Combobox, Listbox, Landmark, Button.
