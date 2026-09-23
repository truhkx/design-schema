# Generate: Form for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Form.tsx` exporting a typed React function component named `Form`, plus `Form.stories.tsx` covering every enum value of every enum prop.

**When the files already exist.** Read the existing component, CSS, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Form({ ref, …rest }: FormProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- Testability hooks for the gates: the component root carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the component's own navigation (roving or activedescendant) whether or not they are tab stops; an overlay with a fixed set of controls renders that set. The story uses no decorators that add other focusable elements.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Form> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Form.test.tsx`.
- Add a short JSDoc block that includes the "When to use" guidance verbatim.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for web; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: call each handler under its emitted name with exactly the listed arguments, in order, and type `reason` as the union of its reasons. A `cancelable` event skips the default action when the handler returns `false` or calls `preventDefault()` on the event it receives. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the prop is provided, uncontrolled from the default otherwise (local state), unless the prop has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change. The event fires in every mode; a controlled component shows the new state only once the prop changes.
- **Parts and slots**: render each slot only under its resolved prop (`children` for the default slot). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other. Wiring is not a prop choice and is always allowed: ids and `aria-*` references, refs, `tabIndex` for roving focus, event handlers, and copy strings the parent owns.
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
  name: Form
  category: container
  status: review
  anatomy:
  - container
  - fields
  - errorSummary
  - actions
  parts:
    fields:
      kind: slot
      slot:
        default: true
        prop: children
        required: true
    actions:
      kind: slot
      slot:
        prop: actions
        required: true
  props:
    children:
      type: content
      required: true
      description: Fields (Input etc.) and layout (Stack). The action row goes in
        `actions`. The examples describe children and actions in words; their stories
        render the named Inputs in a Stack at its default gap (`normal`) and the named
        Button bare in `actions`.
    actions:
      type: content
      required: true
      description: 'The action row: at least one Button with `type: submit`, primary
        first (Form''s action-order rule). Rendered after the fields with the form
        gap; a named slot on Lit and the `actions` anatomy part on every platform.
        A single action renders bare; two or more go in a horizontal Stack the consumer
        supplies. The actions part aligns its content to the inline start, so a single
        bare action keeps its natural width rather than stretching.'
    name:
      type: string
      description: Identifier for the form, used for analytics and as the base of
        generated ids. React Native has no ids and focuses by ref, so it is inert
        there and exists for parity. An unnamed form bases its ids on a generated
        unique id (useId on web); two forms given the same `name` on one page is an
        authoring error Form does not detect.
    label:
      type: string
      a11yRole: accessible-name
      description: Accessible name for the form landmark, e.g. "Sign in". Required
        when a page has more than one form and `labelledBy` is not set. Nothing enforces
        this at runtime and no dev warning is emitted.
      a11y: Rendered as aria-label so the form is a named region.
    labelledBy:
      type: string
      description: Id of a visible Heading that names the form. Wins over `label`
        when both are set.
      a11y: Rendered as aria-labelledby.
      platforms:
      - web
      - lit
    validate:
      type: enum
      values:
      - submit
      - blur
      - change
      default: submit
      description: 'When field-level validation runs. `submit` is the least noisy;
        `blur` is the usual choice for longer forms. `change` validates on change
        only, not also on blur; after a failed submission every mode re-validates
        on blur and change, until a successful submission resets that state. Form
        owns the rule: on web and rn the context carries `submitFailed` beside `validateMode`,
        and a field validates on blur when the mode is `blur` or `submitFailed` is
        true, and on change when the mode is `change` or `submitFailed` is true; on
        Lit ds-form listens itself and calls the field''s `checkValidity()`, and the
        field renders its own error.'
    disabled:
      type: boolean
      default: false
      description: Disables every field and action inside. Use while submitting. Each
        field and action dims itself with its own disabled style; the Form container
        applies no opacity of its own (it would compound) and only exposes the disabled
        state (accessibilityState.disabled on RN). Web and Lit put no disabled attribute
        on the form element (aria-disabled is not valid on role form); each field
        and action reports its own.
    errorSummary:
      type: boolean
      default: true
      description: When submission fails validation, render a summary of errors above
        the fields that links to each field. Each item's text is the field's own message
        verbatim (a field's own required message already names the field, "Email is
        required."), never prefixed with the label; a field that is invalid with an
        empty message shows its `label` instead, and its `name` when the label is
        empty too. Every field's registration carries its `label` for that fallback,
        on all three platforms. The summary appears only after a failed submission
        (not for errors that blur or change validation finds before one), shrinks
        as fields are fixed, and is removed by a successful submission. Items follow
        document order at the failed submit; an error found later by blur or change
        validation is appended at the end. An entry whose field has since unregistered
        (a Disclosure closed after the failed submit) stays as plain danger Text with
        no Link until the next validation replaces the errors. The plural locale is
        read at the failed submit. The summary box is a column with a solid border.
        A `FailedSubmit` story on web and Lit submits the sign-in example empty in
        its play function, so the summary's markup and contrast pair are checked.
      a11y: The summary receives focus and is announced, so users find every error
        without hunting.
  events:
    onSubmit:
      description: 'Fired when the form is submitted and every field is valid. Receives
        the collected values keyed by field name: `Record<string, string | number
        | boolean | string[] | [number, number]>` on every platform — Input and RadioGroup
        contribute strings, Switch a boolean, Checkbox its `value` when checked, NumberInput
        and Slider a number, multi-select Listbox, Select and Combobox a string array,
        a range Slider or DatePicker a pair; an unchecked Checkbox, an unselected
        RadioGroup, an empty field (a null, empty-string or empty-array value) and
        a disabled field contribute no key at all.'
      platforms:
        web: onSubmit
        lit: submit
        rn: onSubmit
        swiftui: onSubmit
      payload:
      - name: values
        type: object
        shape: Record<string, string | number | boolean | string[] | [number, number]>
        description: The collected values keyed by field name.
      fires:
      - user
    onInvalid:
      description: Fired when submission is blocked by validation. Receives the errors
        keyed by field name.
      platforms:
        web: onInvalid
        lit: invalid
        rn: onInvalid
        swiftui: onInvalid
      payload:
      - name: errors
        type: object
        shape: Record<string, string>
        description: The validation errors keyed by field name.
      fires:
      - user
  styles:
    gap:
      token: layout.gap.loose
      description: Vertical gap between the direct children of the fields part and
        between fields and actions — the rhythm preset, so a theme's `layout.rhythm`
        reaches every form. A Stack given as children spaces its own fields with its
        own gap; Form does not reach inside it.
      locked: false
    errorSummaryBorder:
      token: color.border.danger
      part: errorSummary
      locked: false
    errorSummaryText:
      token: color.foreground.danger
      part: errorSummary
      locked: true
    errorSummaryBackground:
      token: color.background.subtle
      part: errorSummary
      locked: true
    errorSummaryBorderWidth:
      token: border.width.thin
      part: errorSummary
      locked: false
    errorSummaryRadius:
      token: radius.md
      part: errorSummary
      locked: false
    errorSummaryLineHeight:
      token: font.lineHeight.normal
      part: errorSummary
      locked: true
      description: Line height of the summary box, inherited by the item Links. Without
        it they take the document's `normal` and each link's box falls under the 24px
        target floor — Form may not give the Links a target of their own, so the box
        sets the body line height instead and the Links inherit it. Locked because
        it is the only thing keeping those targets reachable.
    errorSummaryPadding:
      token: space.md
      part: errorSummary
      description: Inset on all four sides of the summary box.
      locked: false
    errorSummaryGap:
      token: layout.gap.tight
      part: errorSummary
      description: 'Gap between the heading and the list and between list items. Inside
        the errorSummary box a Stack holds the heading and the list, and the list
        is a second Stack (element ul on web and Lit) with no markers and no indent;
        Form forwards this binding to both Stacks'' `overrides.gap` (the `overrides`
        property on Lit) and has no --ds-form-* hook for it, as Input''s helperSize
        has none. The item Links are passed to the list Stack bare: Stack wraps each
        child in its own `li`. Having no hook of its own, it is the one binding a
        consumer cannot reach from their own CSS — they size it through the Stacks''
        own hooks, as with Fieldset''s fieldsGap.'
      locked: false
  copy:
    summaryHeading:
      plural:
        by: count
        one: 1 problem with this form
        other: '{count} problems with this form'
      params:
        count:
          type: number
          description: How many fields failed validation.
    summaryHeadingOne: 1 problem with this form
    invalidSummary: This form has errors.
  a11y:
    role: form
    requires:
    - focus-visible
    - contrast-aa
    contrast:
    - foreground: color.foreground.danger
      background: color.background.subtle
      level: AA
  form:
    role: container
    discovery: context
  platforms:
    web:
      element: form
      attributes:
      - novalidate
      - aria-label
      - aria-labelledby
      notes: 'Native submit semantics — Enter in a field submits, and a Button with
        type=submit triggers it. `novalidate` is set so the system''s own error UI
        is used instead of browser bubbles. Fields register through React context
        (`discovery: context`); the `data-ds-field` attribute on each field element
        is used only to sort the registered fields into document order: Form finds
        each field''s host as getElementById(registered id).closest(''[data-ds-field]''),
        and fields with no such host go last in registration order. A field inside
        a closed Disclosure is left out because it unmounted and unregistered; Form
        does no Disclosure check of its own (web and rn). The locked summary bindings
        are errorSummaryText and errorSummaryBackground — the contrast pair — and
        they get no `--ds-form-*` hook on web or Lit; their rules read the token directly.
        errorSummaryBorder is not one of them: it keeps its hook and stays overridable,
        since the border is decoration, not the proof. The React context is `{ disabled,
        validateMode, submitFailed, errorSummary, validate, idBase, errors, order,
        register, validateField, reportValidity }`, where `register` takes `{ name,
        id, label, getValue, isDisabled, validate, focus }` and returns its own unregister;
        `errorSummary` is in it so a field can stay silent while the Form announces,
        and `order` is what gives a field its "next" key. It lives in its own FormContext
        module beside the component. `gap` must space the direct children of the fields
        part, so that part is `display: contents`: the element exists for the anatomy
        and for tests, has no box, and can never carry a style binding of its own.
        The summary is a sibling rendered before the fields part, whatever order the
        anatomy list is written in. `a11y.role` is `form`, but a native form exposes
        that role only when it has a name, so a Form with neither `label` nor `labelledBy`
        is deliberately not a landmark and nothing warns about it — give any form
        that shares a page with another one a label. `name` is also rendered as the
        form element''s `name` attribute, since it is the analytics identifier as
        well as the id base. The summary heading is a Text with `element: p` (not
        a Heading), and the summary box carries `{idBase}-error-summary` as its id.
        Ids are opaque: a generated id base can contain characters that are not URL-safe,
        and the summary''s `href="#<field id>"` works only because the click default
        is prevented and focus goes through the registration — never treat these ids
        as real fragments.'
    lit:
      tag: ds-form
      reflect:
      - disabled
      notes: 'Wraps a native <form novalidate> in the shadow root, but form ownership
        is DOM-tree based, so slotted light-DOM ds-inputs are NOT owned by it. ds-form
        therefore collects its fields itself, by the `data-ds-field` attribute every
        field component sets on its host — never by a tag list, so a new field type
        needs no change here. This attribute discovery over the light-DOM subtree
        is the Lit form of `discovery: context`. A field with no useful blur moment
        (Checkbox, Switch) sets `data-ds-field="change"` and validates on change under
        `validate: blur`; every other field sets it empty. It submits on a composed
        `press` from a ds-button[type=submit] and on Enter in any `data-ds-field`
        field, except when the keydown originates in a textarea, a button or a link,
        and propagates `disabled` to the fields it found and to every ds-button slotted
        into `actions` (remembering which it disabled). `errorSummary` defaults to
        true, so its attribute is the negated `no-error-summary`. A field missing
        an `id` is given `{name}-{field.name}` at submit time so the error summary
        can link to it. Dispatches `submit` with `{ values }` and `invalid` with `{
        errors }` in detail. Never nest inside a native form. The summary reuses the
        web markup: role="alert" and tabindex="-1" on the errorSummary box, and each
        item Link has href="#<field id>" with the click default prevented, so the
        hash never changes. The landmark is the host: `role="form"` and the name (aria-label
        or aria-labelledby) sit on ds-form, and the shadow <form> is unnamed, so it
        is not a second landmark. The `submit` and `invalid` CustomEvents keep their
        native names: the shadow <form>''s native submit is non-composed and prevented,
        and a field''s native `invalid` does not bubble, so the only `submit` and
        `invalid` a ds-form listener sees are Form''s own. ds-form exposes a public
        `submit()` method so a story or a consumer can submit imperatively; both events
        stay non-cancelable. An unnamed form takes its id base from a module-level
        counter, `ds-form-<n>`, the Lit equivalent of the generated id web uses. The
        default slot keeps its UA `display: contents`, so assigned nodes are flex
        items of the container directly — which is what makes "a Stack given as children
        spaces its own fields with its own gap" true — while the actions slot is `display:
        flex; align-items: flex-start` so one bare action keeps its natural width.
        While `disabled`, a childList MutationObserver re-runs propagation so a field
        added later is disabled too, and re-enabling touches only the controls in
        the remembered set, never one the consumer disabled itself. A `focusout` from
        a field whose `relatedTarget` is that field''s host or inside it is not a
        blur, which is how a RadioGroup validates when focus leaves the whole group
        rather than on every arrow press. `validate` is not reflected: it changes
        nothing visible and is not a styling surface. Nesting inside a native form
        is forbidden and warns once in development when an ancestor form or ds-form
        is found.'
    rn:
      element: View
      props:
      - accessibilityLabel
      notes: 'No native form on iOS/Android. Form provides a context { register, unregister,
        submit, errors, validateMode, submitFailed, errorSummary, disabled, order,
        focusField, reportValidity }; fields call register(name, { label, getValue,
        isDisabled, validate, focus }) in mount order (name is the argument, not a
        handle property); a Button with type=submit calls submit(). `order` is what
        gives a field its return key: non-last fields get returnKeyType="next" (focusField),
        the last gets "done" (submit). A disabled field stays registered and reports
        `isDisabled()`, and the Form leaves it out of the values and out of `order`,
        so the previous field''s "next" skips past it. On failed submit the summary
        is announced (accessibilityLiveRegion="assertive" on Android, announceForAccessibility
        on iOS) and focus moves to the summary when errorSummary is on, otherwise
        to the first invalid field — same as web. The iOS announcement is the summary
        heading followed by each item, joined with ''. '', once per failed submit
        (not again as the summary shrinks). The plural locale is `new Intl.PluralRules().resolvedOptions().locale`,
        captured at the failed submit. Form itself omits a null, empty-string or empty-array
        value from `onSubmit`, so fields need not normalise. The summary View is not
        itself `accessible`, so each item Link stays separately focusable, and accessibility
        focus moves to the summary heading Text. Each item Link has the field''s `name`
        as its href and an onPress that focuses the field and returns false, so nothing
        opens; each Link is nested in a `Text tone="danger"`, which is how the danger
        color reaches a `tone: inherit` Link on native. The View keeps role="form",
        which only has landmark meaning on react-native-web; iOS and Android have
        no form landmark, so accessibilityLabel naming the group is the native alternative
        — and it is assertable, which is why the label scenario covers this platform
        too. If every invalid field has unregistered by the time a failed submit renders,
        no summary box is drawn at all: onInvalid still fires and accessibility focus
        stays where it was rather than moving to a heading that does not exist.'
    swiftui:
      element: VStack
      props:
      - .onSubmit
      - .submitLabel
      - '@FocusState'
      - FormContext=environment
      - AccessibilityNotification
      notes: A `VStack` providing `FormContext` through the environment (`\.dsForm`);
        fields register on appear and unregister on disappear. Submit is the submit
        `Button` or the keyboard's return on the last field (`.onSubmit`); validation
        runs registered validators in order, the first failing field receives `@AccessibilityFocusState`
        focus and `copy.invalidSummary` is announced. `onInvalid` receives the failures;
        `onSubmit` the value map (`String | Bool | Double | [String] | ClosedRange<Double>`).
        Not SwiftUI's `Form` (a grouped-list style that fights the tokens).
  behavior:
  - name: label-names-the-form-landmark
    description: The form is a named landmark when label is given, which is what a
      page with more than one form needs (WCAG 1.3.1, 2.4.1).
    given:
      label: Sign in
    then:
    - role: form
      platforms:
      - web
      - lit
    - name: Sign in
      platforms:
      - web
      - lit
    - attribute: accessibilityLabel
      is: Sign in
      platforms:
      - rn
  examples:
  - name: sign-in
    description: The smallest real form - two fields and one submit action, validated
      on submit.
    given:
      name: sign-in
      label: Sign in
      children: A required Input name=email label=Email type=email and a required
        Input name=password label=Password type=password, in a Stack
      actions: A submit Button labelled Sign in
  - name: long-form-validated-on-blur
    description: A longer form where feedback per field as focus leaves it beats one
      report at the end.
    given:
      name: profile
      label: Profile details
      validate: blur
      children: A Stack of required Inputs name=fullName label=Full name, name=email
        label=Email type=email, name=phone label=Phone type=tel, name=city label=City
      actions: A submit Button labelled Save profile
  - name: submitting
    description: A form while its request is in flight - every field and action disabled,
      so it cannot be submitted twice.
    given:
      name: sign-in
      label: Sign in
      disabled: true
      children: A required Input name=email label=Email type=email and a required
        Input name=password label=Password type=password, in a Stack
      actions: A submit Button labelled Sign in
  - name: without-a-summary
    description: A short form that reports errors at the fields alone, moving focus
      to the first invalid one.
    given:
      name: rename
      label: Rename file
      errorSummary: false
      children: A required Input name=fileName label=File name
      actions: A submit Button labelled Rename
```

## Events

- `onSubmit`: emit `onSubmit`
  - payload, positional, in this order: `values: Record<string, string | number | boolean | string[] | [number, number]>`
  - fires on: user
- `onInvalid`: emit `onInvalid`
  - payload, positional, in this order: `errors: Record<string, string>`
  - fires on: user

## Parts and slots

- `container`: element
- `fields`: slot, prop `children`, required
- `errorSummary`: element
- `actions`: slot, prop `actions`, required

## Style bindings

- `errorSummaryBorder`: token `color.border.danger`; part `errorSummary`
- `errorSummaryText`: token `color.foreground.danger`; part `errorSummary`; locked
- `errorSummaryBackground`: token `color.background.subtle`; part `errorSummary`; locked
- `errorSummaryBorderWidth`: token `border.width.thin`; part `errorSummary`
- `errorSummaryRadius`: token `radius.md`; part `errorSummary`
- `errorSummaryLineHeight`: token `font.lineHeight.normal`; part `errorSummary`; locked
- `errorSummaryPadding`: token `space.md`; part `errorSummary`
- `errorSummaryGap`: token `layout.gap.tight`; part `errorSummary`

## Form and overlay

```yaml
form:
  role: container
  discovery: context
```

## Copy

- `summaryHeading`: "{count} problems with this form"; params `count` (number); plural by `count`: one "1 problem with this form", other "{count} problems with this form"
- `summaryHeadingOne`: "1 problem with this form"
- `invalidSummary`: "This form has errors."

## Constants and examples

- example `sign-in`, story `SignIn`: given `name: "sign-in"`, `label: "Sign in"`, `children: "A required Input name=email label=Email type=email and a required Input name=password label=Password type=password, in a Stack"`, `actions: "A submit Button labelled Sign in"`; The smallest real form - two fields and one submit action, validated on submit.
- example `long-form-validated-on-blur`, story `LongFormValidatedOnBlur`: given `name: "profile"`, `label: "Profile details"`, `validate: "blur"`, `children: "A Stack of required Inputs name=fullName label=Full name, name=email label=Email type=email, name=phone label=Phone type=tel, name=city label=City"`, `actions: "A submit Button labelled Save profile"`; A longer form where feedback per field as focus leaves it beats one report at the end.
- example `submitting`, story `Submitting`: given `name: "sign-in"`, `label: "Sign in"`, `disabled: true`, `children: "A required Input name=email label=Email type=email and a required Input name=password label=Password type=password, in a Stack"`, `actions: "A submit Button labelled Sign in"`; A form while its request is in flight - every field and action disabled, so it cannot be submitted twice.
- example `without-a-summary`, story `WithoutASummary`: given `name: "rename"`, `label: "Rename file"`, `errorSummary: false`, `children: "A required Input name=fileName label=File name"`, `actions: "A submit Button labelled Rename"`; A short form that reports errors at the fields alone, moving focus to the first invalid one.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed, but they still declare their hook: `locked` closes the override API, not the styling hook. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so, and for a locked binding it is the only way it can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`, `errorSummaryBorder`, `errorSummaryBorderWidth`, `errorSummaryRadius`, `errorSummaryPadding`, `errorSummaryGap`
Locked (accessibility-bearing, never overridable): `errorSummaryText`, `errorSummaryBackground`, `errorSummaryLineHeight`

## Behavior scenarios (5)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: label-names-the-form-landmark
  description: The form is a named landmark when label is given, which is what a page
    with more than one form needs (WCAG 1.3.1, 2.4.1).
  given:
    label: Sign in
  then:
  - role: form
  - name: Sign in
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-validate-submit
  given:
    validate: submit
  then:
  - renders: true
  derived: true
- name: renders-validate-blur
  given:
    validate: blur
  then:
  - renders: true
  derived: true
- name: renders-validate-change
  given:
    validate: change
  then:
  - renders: true
  derived: true
```

## Platform notes (web)

```yaml
element: form
attributes:
- novalidate
- aria-label
- aria-labelledby
notes: "Native submit semantics \u2014 Enter in a field submits, and a Button with\
  \ type=submit triggers it. `novalidate` is set so the system's own error UI is used\
  \ instead of browser bubbles. Fields register through React context (`discovery:\
  \ context`); the `data-ds-field` attribute on each field element is used only to\
  \ sort the registered fields into document order: Form finds each field's host as\
  \ getElementById(registered id).closest('[data-ds-field]'), and fields with no such\
  \ host go last in registration order. A field inside a closed Disclosure is left\
  \ out because it unmounted and unregistered; Form does no Disclosure check of its\
  \ own (web and rn). The locked summary bindings are errorSummaryText and errorSummaryBackground\
  \ \u2014 the contrast pair \u2014 and they get no `--ds-form-*` hook on web or Lit;\
  \ their rules read the token directly. errorSummaryBorder is not one of them: it\
  \ keeps its hook and stays overridable, since the border is decoration, not the\
  \ proof. The React context is `{ disabled, validateMode, submitFailed, errorSummary,\
  \ validate, idBase, errors, order, register, validateField, reportValidity }`, where\
  \ `register` takes `{ name, id, label, getValue, isDisabled, validate, focus }`\
  \ and returns its own unregister; `errorSummary` is in it so a field can stay silent\
  \ while the Form announces, and `order` is what gives a field its \"next\" key.\
  \ It lives in its own FormContext module beside the component. `gap` must space\
  \ the direct children of the fields part, so that part is `display: contents`: the\
  \ element exists for the anatomy and for tests, has no box, and can never carry\
  \ a style binding of its own. The summary is a sibling rendered before the fields\
  \ part, whatever order the anatomy list is written in. `a11y.role` is `form`, but\
  \ a native form exposes that role only when it has a name, so a Form with neither\
  \ `label` nor `labelledBy` is deliberately not a landmark and nothing warns about\
  \ it \u2014 give any form that shares a page with another one a label. `name` is\
  \ also rendered as the form element's `name` attribute, since it is the analytics\
  \ identifier as well as the id base. The summary heading is a Text with `element:\
  \ p` (not a Heading), and the summary box carries `{idBase}-error-summary` as its\
  \ id. Ids are opaque: a generated id base can contain characters that are not URL-safe,\
  \ and the summary's `href=\"#<field id>\"` works only because the click default\
  \ is prevented and focus goes through the registration \u2014 never treat these\
  \ ids as real fragments."
```

## Guidance

## Overview

Form is the container that makes fields behave as a group. It knows which fields exist, collects their values, runs validation at the configured moment, shows errors in a consistent way, and only calls `onSubmit` when everything is valid.

## When to use

Use Form whenever two or more fields are submitted together, and for any single field whose submission has consequences (sign-in, search with side effects). Place actions (submit, cancel) at the end in a Stack. Give the form a `label` when the page contains more than one.

## When not to use

Do not use Form for instant-apply settings (a Switch that saves on change) — those are not submitted. Do not nest forms. Do not use Form as a generic layout container; use Stack.

## Behavior

Submission is triggered by a Button with `type: submit`, by pressing Enter in a single-line field on web, or by the keyboard's done key on native. On submit, the form validates every field: `required` fields must have a value, fields with an `error` prop are invalid, and `invalid` fields are invalid. If anything fails, focus moves to the error summary (or the first invalid field when `errorSummary` is off), `onInvalid` fires with the errors, and `onSubmit` does not. Under `validate: submit`, nothing validates before the first submission; after a failed submission, fields re-validate on blur and change so errors clear as they are fixed. When a Form has an error summary, the Form announces errors and Inputs stay silent; a standalone Input announces its own error. If everything passes, `onSubmit` fires with values keyed by each field's `name` (see the event for the value contract). Fields are Input, Checkbox, Switch and RadioGroup — anything that registers with the Form. Each field owns its own messages: the Form renders a field's `copy.required` and never composes a message of its own. Under `validate: blur`, controls with no useful blur moment (Checkbox, Switch) validate on change, and RadioGroup validates when focus leaves the whole group. A field inside a closed Disclosure is not collected unless the Disclosure has `keepMounted`. Setting `disabled` while the request is in flight prevents double submission and is reflected on every field and action: a submit attempted while disabled is cancelled early and fires neither `onSubmit` nor `onInvalid`. Validating sets each failing field's `invalid` and clears only the flags the Form itself set, so an `invalid` the consumer set survives re-validation; `onInvalid` carries each field's raw `validationMessage`, empty string included, and the label fallback is presentation for the summary only. "Empty" means null, an empty string or an empty array: `false` from a Switch and `0` from a NumberInput are values and are submitted, while an unchecked Checkbox contributes nothing. A submit with no registered fields still fires `onSubmit` with an empty value map. If a field has unregistered since it failed, the summary falls back to the label from the last registration the Form saw under that name. The plural locale for the summary heading is resolved once per failed submit and reused as the summary shrinks, since the heading is announced once; if the nearest `lang` is a tag `Intl.PluralRules` rejects, the runtime default locale is used instead of throwing.

## Content guidelines

Name the submit action after the outcome ("Create account", not "Submit"). Order actions by importance in reading order on every platform: the primary submit Button first, then at most one `secondary` alternative such as "Cancel", so keyboard and screen-reader focus reaches the main action first and the two never compete visually. A destructive action ("Delete account") does not belong in the same Stack as Save; give it its own section further down. Never present Cancel as `ghost` next to a primary — the pairing reads as one real button and one afterthought. The error summary heading uses `copy.summaryHeading`, choosing the plural form by count in the locale of the nearest `lang` ancestor (web and Lit), falling back to the runtime default locale (and always the runtime default on RN); `copy.summaryHeadingOne` and `copy.invalidSummary` are not rendered on web, Lit or RN. Each item is a Link (`tone: inherit`, so the summary's danger text color reaches it) whose text is the field's own message, so users can act from the summary alone; activating it moves focus to the field and never navigates or changes the URL hash. The Link keeps its own focus ring and target size; Form adds none. Write any consumer `error` text so it names the field, as `copy.required` does. The heading is rendered as Text with `weight: semibold` and `tone: danger`, not a Heading, so it never disturbs the page outline.

## Accessibility

The form is a named landmark when `label` is given (WCAG 1.3.1, 2.4.1). Errors are identified in text at the field and, by default, in a summary that receives focus and links to each field (3.3.1, 3.3.3). Required fields are indicated in the label text, not only by color or an asterisk alone (1.4.1, 3.3.2). Validation on `submit` avoids interrupting users mid-entry; `blur` validation is available when earlier feedback is better. Everything is keyboard operable, including submission with Enter (2.1.1). No time limits are imposed by the form itself.

## Platform notes

### Web
Renders `<form novalidate>` and handles the native `submit` event, preventing default. The error summary is a `<div role="alert" tabindex="-1">` that receives focus on failed submission and contains links to each invalid field's id.

### Lit
`<ds-form label="Sign in">` wraps a native `<form>` in its shadow root with a default slot for fields and a named `actions` slot, but form ownership is DOM-tree based, so the slotted fields are not owned by it. The field value contract is `string | number | boolean | string[] | [number, number]` (numbers from NumberInput and Slider, arrays from multi-select Listbox, Select and Combobox, a pair from a range Slider or DatePicker), absent when empty. Form discovers fields by the `data-ds-field` attribute every field element carries (web and Lit), never by a tag list, so new field components are collected without touching Form. The field interface (`DsFormField`) has `error` and `validationMessage` as optional strings: a field that never validates (Switch) omits them, and Form treats absence as valid. Every field handle also carries its `label`, which the error summary shows when an invalid field has an empty message, on all three platforms (the RN `FormFieldHandle` includes `label` too). `DsFormField.currentValue` uses the same value contract. Each collected field implements the exported `DsFormField` interface — `name`, `label`, `required`, `disabled`, `error`, `currentValue`, `id`, `focus()`, `checkValidity()`, `validationMessage` (the field's own copy string, which the summary renders) — and Form skips fields without a `name` and fields inside a closed `ds-disclosure` without `keep-mounted`. Submits on a composed `press` from a `ds-button[type=submit]` and on Enter in any field unless the keydown originates in a textarea, a button or a link (it listens for `keydown` on the host, never for a CustomEvent named after a native event; blur validation uses `focusout`). Fields must validate synchronously: setting `error` updates `invalid` and the ElementInternals validity at once, so `checkValidity()` is correct immediately afterwards. Dispatches composed `submit` (`detail.values`, same contract as web) and `invalid` CustomEvents; the component never navigates.

### React Native
There is no form element. Form renders a `View` with `accessibilityLabel` and provides a React context; each field calls `register(name, { label, getValue, validate, focus })` on mount; `getValue` returns a value from the `onSubmit` contract (string, number, boolean, string array or number pair) or `undefined` (omitted from the values). A Switch always validates as valid. A Button with `type: submit` calls `submit()` from the context. The last Input gets `returnKeyType="done"` and `onSubmitEditing` wired to submit. The error summary uses `accessibilityLiveRegion="assertive"` on Android and `AccessibilityInfo.announceForAccessibility` on iOS, then moves focus with `AccessibilityInfo.setAccessibilityFocus` to the summary when `errorSummary` is on, otherwise to the first invalid field.

## Related

Input, Button, Stack, Link, Text.
