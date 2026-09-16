# Generate: Form as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Form.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Form.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: FormVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Form.test.ts`.

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
  name: Form
  category: container
  status: review
  anatomy:
  - container
  - fields
  - errorSummary
  - actions
  props:
    children:
      type: content
      required: true
      description: Fields (Input etc.) and layout (Stack). The action row goes in
        `actions`.
    actions:
      type: content
      required: true
      description: 'The action row: at least one Button with `type: submit`, primary
        first (Form''s action-order rule). Rendered after the fields with the form
        gap; a named slot on Lit and the `actions` anatomy part on every platform.'
    name:
      type: string
      description: Identifier for the form, used for analytics and as the base of
        generated ids.
    label:
      type: string
      description: Accessible name for the form landmark, e.g. "Sign in". Required
        when a page has more than one form and `labelledBy` is not set.
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
      description: When field-level validation runs. `submit` is the least noisy;
        `blur` is the usual choice for longer forms.
    disabled:
      type: boolean
      default: false
      description: Disables every field and action inside. Use while submitting.
    errorSummary:
      type: boolean
      default: true
      description: When submission fails validation, render a summary of errors above
        the fields that links to each field.
      a11y: The summary receives focus and is announced, so users find every error
        without hunting.
  events:
    onSubmit:
      description: 'Fired when the form is submitted and every field is valid. Receives
        the collected values keyed by field name: `Record<string, string | boolean>`
        — Input and RadioGroup contribute strings, Switch a boolean, Checkbox its
        `value` when checked; an unchecked Checkbox, an unselected RadioGroup and
        a disabled field contribute no key at all.'
      platforms:
        web: onSubmit
        lit: submit
        rn: onSubmit
        swiftui: onSubmit
    onInvalid:
      description: Fired when submission is blocked by validation. Receives the errors
        keyed by field name.
      platforms:
        web: onInvalid
        lit: invalid
        rn: onInvalid
        swiftui: onInvalid
  styles:
    gap:
      token: layout.gap.loose
      description: Vertical gap between fields and between fields and actions — the
        rhythm preset, so a theme's `layout.rhythm` reaches every form.
      locked: false
    errorSummaryBorder:
      token: color.border.danger
      locked: false
    errorSummaryText:
      token: color.foreground.danger
      locked: true
    errorSummaryBackground:
      token: color.background.subtle
      locked: true
  copy:
    summaryHeading: '{count} problems with this form'
    summaryHeadingOne: 1 problem with this form
  a11y:
    role: form
    requires:
    - focus-visible
    - contrast-aa
    contrast:
    - foreground: color.foreground.danger
      background: color.background.subtle
      level: AA
  platforms:
    web:
      element: form
      attributes:
      - novalidate
      - aria-label
      - aria-labelledby
      notes: Native submit semantics — Enter in a field submits, and a Button with
        type=submit triggers it. `novalidate` is set so the system's own error UI
        is used instead of browser bubbles.
    lit:
      tag: ds-form
      reflect:
      - disabled
      notes: Wraps a native <form novalidate> in the shadow root, but form ownership
        is DOM-tree based, so slotted light-DOM ds-inputs are NOT owned by it. ds-form
        therefore collects ds-input children by `name` via querySelectorAll, submits
        on a composed `press` from a ds-button[type=submit] and on Enter in a ds-input,
        and propagates `disabled` to children (remembering which it disabled). Dispatches
        `submit` with `{ values }` and `invalid` with `{ errors }` in detail. Never
        nest inside a native form.
    rn:
      element: View
      props:
      - accessibilityLabel
      notes: No native form on iOS/Android. Form provides a context { register, unregister,
        submit, errors, validateMode, disabled, focusField }; Inputs register { name,
        getValue, validate, focus } in mount order; a Button with type=submit calls
        submit(). Non-last fields get returnKeyType="next" (focusField), the last
        gets "done" (submit). Disabled Inputs do not register. On failed submit the
        summary is announced (accessibilityLiveRegion="assertive" on Android, announceForAccessibility
        on iOS) and focus moves to the summary when errorSummary is on, otherwise
        to the first invalid field — same as web.
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `gap`, `errorSummaryBorder`
Locked (accessibility-bearing, never overridable): `errorSummaryText`, `errorSummaryBackground`

## Behavior scenarios (4)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (lit)

```yaml
tag: ds-form
reflect:
- disabled
notes: Wraps a native <form novalidate> in the shadow root, but form ownership is
  DOM-tree based, so slotted light-DOM ds-inputs are NOT owned by it. ds-form therefore
  collects ds-input children by `name` via querySelectorAll, submits on a composed
  `press` from a ds-button[type=submit] and on Enter in a ds-input, and propagates
  `disabled` to children (remembering which it disabled). Dispatches `submit` with
  `{ values }` and `invalid` with `{ errors }` in detail. Never nest inside a native
  form.
```

## Guidance

## Overview

Form is the container that makes fields behave as a group. It knows which fields exist, collects their values, runs validation at the configured moment, shows errors in a consistent way, and only calls `onSubmit` when everything is valid.

## When to use

Use Form whenever two or more fields are submitted together, and for any single field whose submission has consequences (sign-in, search with side effects). Place actions (submit, cancel) at the end in a Stack. Give the form a `label` when the page contains more than one.

## When not to use

Do not use Form for instant-apply settings (a Switch that saves on change) — those are not submitted. Do not nest forms. Do not use Form as a generic layout container; use Stack.

## Behavior

Submission is triggered by a Button with `type: submit`, by pressing Enter in a single-line field on web, or by the keyboard's done key on native. On submit, the form validates every field: `required` fields must have a value, fields with an `error` prop are invalid, and `invalid` fields are invalid. If anything fails, focus moves to the error summary (or the first invalid field when `errorSummary` is off), `onInvalid` fires with the errors, and `onSubmit` does not. Under `validate: submit`, nothing validates before the first submission; after a failed submission, fields re-validate on blur and change so errors clear as they are fixed. When a Form has an error summary, the Form announces errors and Inputs stay silent; a standalone Input announces its own error. If everything passes, `onSubmit` fires with values keyed by each field's `name` (see the event for the value contract). Fields are Input, Checkbox, Switch and RadioGroup — anything that registers with the Form. Each field owns its own messages: the Form renders a field's `copy.required` and never composes a message of its own. Under `validate: blur`, controls with no useful blur moment (Checkbox, Switch) validate on change, and RadioGroup validates when focus leaves the whole group. A field inside a closed Disclosure is not collected unless the Disclosure has `keepMounted`. Setting `disabled` while the request is in flight prevents double submission and is reflected on every field and action.

## Content guidelines

Name the submit action after the outcome ("Create account", not "Submit"). Order actions by importance in reading order on every platform: the primary submit Button first, then at most one `secondary` alternative such as "Cancel", so keyboard and screen-reader focus reaches the main action first and the two never compete visually. A destructive action ("Delete account") does not belong in the same Stack as Save; give it its own section further down. Never present Cancel as `ghost` next to a primary — the pairing reads as one real button and one afterthought. The error summary heading uses `copy.summaryHeading` and each item is a link reading "Label: error text" so users can act from the summary alone. The heading is rendered as strong Text, not a Heading, so it never disturbs the page outline.

## Accessibility

The form is a named landmark when `label` is given (WCAG 1.3.1, 2.4.1). Errors are identified in text at the field and, by default, in a summary that receives focus and links to each field (3.3.1, 3.3.3). Required fields are indicated in the label text, not only by color or an asterisk alone (1.4.1, 3.3.2). Validation on `submit` avoids interrupting users mid-entry; `blur` validation is available when earlier feedback is better. Everything is keyboard operable, including submission with Enter (2.1.1). No time limits are imposed by the form itself.

## Platform notes

### Web
Renders `<form novalidate>` and handles the native `submit` event, preventing default. The error summary is a `<div role="alert" tabindex="-1">` that receives focus on failed submission and contains links to each invalid field's id.

### Lit
`<ds-form label="Sign in">` wraps a native `<form>` in its shadow root with a default slot for fields and a named `actions` slot, but form ownership is DOM-tree based, so the slotted fields are not owned by it. The field value contract is `string | number | boolean | string[] | [number, number]` (numbers from NumberInput and Slider, arrays from multi-select Listbox, Select and Combobox, a pair from a range Slider or DatePicker), absent when empty. Form discovers fields by the `data-ds-field` attribute every field element carries (web and Lit), never by a tag list, so new field components are collected without touching Form. The field interface (`DsFormField`) has `error` and `validationMessage` as optional strings: a field that never validates (Switch) omits them, and Form treats absence as valid. Every field handle also carries its `label`, so the error summary can read "Label: message" on all three platforms (the RN `FormFieldHandle` includes `label` too). Instead it collects light-DOM fields by tag (`ds-input, ds-checkbox, ds-switch, ds-radio-group`) that implement the exported `DsFormField` interface — `name`, `label`, `required`, `disabled`, `error`, `currentValue`, `id`, `focus()`, `checkValidity()`, `validationMessage` (the field's own copy string, which the summary renders) — skipping fields without a `name` and fields inside a closed `ds-disclosure` without `keep-mounted`. Submits on a composed `press` from a `ds-button[type=submit]` and on Enter in any field (it listens for `keydown` on the host, never for a CustomEvent named after a native event; blur validation uses `focusout`). Fields must validate synchronously: setting `error` updates `invalid` and the ElementInternals validity at once, so `checkValidity()` is correct immediately afterwards. Dispatches composed `submit` (`detail.values`, same contract as web) and `invalid` CustomEvents; the component never navigates.

### React Native
There is no form element. Form renders a `View` with `accessibilityLabel` and provides a React context; each field registers `{ name, label, getValue, validate, focus }` on mount; `getValue` may return a string, a boolean, or `undefined` (omitted from the values). A Switch always validates as valid. A Button with `type: submit` calls `submit()` from the context. The last Input gets `returnKeyType="done"` and `onSubmitEditing` wired to submit. The error summary uses `accessibilityLiveRegion="assertive"` on Android and `AccessibilityInfo.announceForAccessibility` on iOS, then focuses the first invalid field with `AccessibilityInfo.setAccessibilityFocus`.

## Related

Input, Button, Stack.
