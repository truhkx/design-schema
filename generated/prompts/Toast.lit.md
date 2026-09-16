# Generate: Toast as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Toast.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Toast.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ToastVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Toast.test.ts`.

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
  name: Toast
  category: feedback
  status: review
  apg: alert
  anatomy:
  - region
  - toast
  - icon
  - message
  - actionButton
  - dismissButton
  composition:
    icon:
      component: Icon
      forwards:
        icon: color
    message:
      component: Text
      props:
        element: span
        size: md
      forwards:
        fontFamily: fontFamily
        fontSize: fontSize
        lineHeight: lineHeight
    actionButton:
      component: Button
      props:
        variant: ghost
        inverse: true
        size: sm
    dismissButton:
      component: Button
      props:
        variant: ghost
        inverse: true
        size: sm
        iconOnly: true
  props:
    message:
      type: string
      required: true
      description: One sentence saying what happened ("Message sent", "3 files deleted").
    tone:
      type: enum
      enumRef: tone
      values:
      - neutral
      - success
      - warning
      - danger
      default: neutral
      description: Sets the leading icon; `neutral` has none. Toasts do not use tinted
        backgrounds — the icon and message carry the tone.
    actionLabel:
      type: string
      description: Label for a single action button ("Undo", "View"). When present
        the toast stays longer and pauses on hover and focus.
    duration:
      type: enum
      values:
      - short
      - long
      - persistent
      default: short
      description: '`short` ≈ 5s, `long` ≈ 10s (both computed from motion.duration.loop
        × 6 / × 12 so themes without motion still get sensible times), `persistent`
        until dismissed. When `actionLabel` is set or `tone` is danger the toast is
        persistent regardless of this prop (a dev warning notes the override only
        when `duration` was passed explicitly as `short` or `long` — on Lit, when
        the property or attribute was assigned; the default never warns). If motion.duration.loop
        resolves to 0 or cannot be resolved (no theme CSS, jsdom), both durations
        are treated as persistent. The two durations are computed at region mount
        from the resolved motion.duration.loop (getComputedStyle on the region on
        web/Lit; the token value on native), never hardcoded.'
    dismissible:
      type: boolean
      default: true
      description: Shows a dismiss button. Persistent toasts are always dismissible.
    toastId:
      type: string
      description: Stable identity; showing a toast with the same toastId replaces
        the previous one instead of stacking (named toastId so it does not collide
        with the DOM `id` on Lit). It never becomes the DOM `id`; on a directly rendered
        Toast outside the region it is accepted and has no effect.
  events:
    onAction:
      description: The action button was activated. The toast dismisses.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
      fires:
      - user
      timing:
        phase: before-change
        before:
        - onDismiss
    onDismiss:
      description: 'The toast left the screen: reason `timeout`, `dismiss-button`,
        `escape`, `action`, `replaced` (a replaced or evicted toast leaves immediately,
        without its exit transition), or `programmatic`. It fires after the exit transition
        ends and just before the toast is removed (so on Lit it still bubbles to the
        region); immediately under reduced motion or when the exit time cannot be
        resolved.'
      platforms:
        web: onDismiss
        lit: dismiss
        rn: onDismiss
        swiftui: onDismiss
      payload:
      - name: reason
        type: enum
        values:
        - timeout
        - dismiss-button
        - escape
        - action
        - replaced
        - programmatic
      reasons:
        timeout: the display duration elapsed
        dismiss-button: the dismiss button was activated
        escape: Escape pressed while the toast held focus
        action: the action button was activated
        replaced: the toast was replaced or evicted and left immediately
        programmatic: dismiss(toastId) was called, or dismiss() with no id cleared
          every toast
      fires:
      - user
      - programmatic
      timing:
        phase: after-change
  keyboard:
  - keys:
    - F6
    action: Moves focus into the toast region (the first toast's action or dismiss
      button) from anywhere; F6 again returns to where focus was.
    when: a toast is visible
    from: any
    expect: focus-first
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Escape
    action: Dismisses the focused toast and returns focus.
    when: focus inside a toast
    from: first
    expect: closes
    platforms:
    - web
    - lit
    - swiftui
  - keys:
    - Tab
    action: Moves between the action and dismiss buttons, then out of the region.
    when: focus inside a toast
    from: first
    expect: focus-next
  styles:
    surface:
      token: color.inverse.surface
      description: 'Inverted like Tooltip: dark on light, light on dark, so it floats
        above any page surface.'
      locked: true
    text:
      token: color.inverse.foreground
      part: message
      description: Text's `color` is locked and has no inverse tone, so the toast
        re-scopes the foreground on its own container (`--color-foreground` on web
        and Lit, TextForegroundContext on React Native) and composes Text unchanged,
        as Tooltip does.
      locked: true
    icon:
      token: color.inverse.status.{tone}
      part: icon
      description: '`neutral` renders no icon; the other tones render Icon `name={tone}`
        at its default size, with this token forwarded to Icon''s `overrides.color`,
        using the status step chosen to read on the inverse surface.'
      locked: true
    actionColor:
      token: color.inverse.link
      description: The action and dismiss Buttons are rendered with Button's `inverse`
        prop (ghost variant), which is how a composite gets an on-inverse child without
        restyling it.
      locked: true
    dismissColor:
      token: color.inverse.link
      description: The dismiss and action Buttons are `ghost` + `inverse`, whose text
        is color.inverse.link; Toast never restyles them.
      locked: true
    focusRingInverse:
      token: color.inverse.focus
      description: Focus ring color on the inverse surface, replacing color.border.focus
        inside the toast.
      locked: true
    radius:
      token: radius.md
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    paddingBlock:
      token: space.sm
      locked: false
    paddingInline:
      token: space.md
      locked: false
    gap:
      token: layout.gap.normal
      description: Between icon, message, action and dismiss.
      locked: false
    stackGap:
      token: layout.gap.tight
      description: Between stacked toasts in the region. stackGap, regionInset and
        layer belong to the region (ToastRegion / ds-toast-region / ToastProvider)
        and are overridable through the region's own `overrides`, not on a toast.
      locked: false
    regionInset:
      token: layout.gutter
      part: region
      description: Distance of the region from the viewport edge (bottom-start on
        wide screens, bottom center on phones; on web and Lit plus env(safe-area-inset-bottom)).
        "Wide" is the resolved px of layout.maxWidth.content read from the default
        theme at generation time and marked literal-ok, as Container does, since custom
        properties cannot be used in media queries.
      locked: false
    maxWidth:
      token: layout.maxWidth.prose
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    fontSize:
      token: font.size.md
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      locked: false
    minTarget:
      token: size.target.min
      locked: true
    layer:
      token: layer.toast
      locked: false
    enter:
      token: motion.duration.base
      description: Rise and fade; instant under reduced motion.
      locked: false
    enterOffset:
      token: space.2
      description: Distance the toast rises during `enter`; none under reduced motion.
      locked: false
    exit:
      token: motion.duration.fast
      locked: false
  constants:
    shortDuration:
      description: 'How long a toast with `duration: short` stays before it dismisses
        itself.'
      token: motion.duration.loop
      multiply: 6
      unit: ms
    longDuration:
      description: 'How long a toast with `duration: long` stays before it dismisses
        itself.'
      token: motion.duration.loop
      multiply: 12
      unit: ms
  copy:
    dismissLabel: Dismiss
    regionLabel: Notifications
  a11y:
    role: status
    requires:
    - live-region
    - accessible-name
    - escape-dismiss
    - focus-visible
    - keyboard-operable
    - contrast-aa
    - reduced-motion
    - target-24px
    - no-hover-only
    contrast:
    - foreground: color.inverse.foreground
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.link
      background: color.inverse.surface
      level: AA
    - foreground: color.inverse.focus
      background: color.inverse.surface
      level: AA
      nonText: true
    - foreground: color.inverse.status.{tone}
      background: color.inverse.surface
      level: AA
      nonText: true
  platforms:
    web:
      element: div
      attributes:
      - role=region
      - aria-label
      - role=status
      - role=alert
      - aria-live
      notes: 'One persistent <div role="region" aria-label="Notifications" aria-live="polite">
        per document (created on first use, fixed at the region inset, layer.toast)
        holds the toasts; the region exists before content so announcements fire.
        Each toast is a <div role="status"> (danger: role="alert"). Timers pause on
        hover and on focus-within. F6 handler at document level moves focus into the
        region. Toasts are shown through an imperative API (`toast({ message })`)
        exposed alongside the component, since a notification is an event, not a place
        in the tree.'
    lit:
      tag: ds-toast
      reflect:
      - tone
      - duration
      notes: A <ds-toast-region> element (auto-created in document.body by the `toast()`
        function) holds <ds-toast> children in the light DOM so the live region is
        in the document tree. The region sets `role`, `aria-label` and `aria-live`
        as plain attributes, and each toast a plain `role` attribute, because tests
        read them. `dismiss` and `action` are composed CustomEvents.
    rn:
      element: View
      props:
      - accessibilityLiveRegion
      - accessibilityRole
      notes: 'A ToastProvider mounted once at the app root renders the region as an
        absolutely positioned View (layer.toast zIndex, left/right/bottom at regionInset,
        toasts centered at every width). Core React Native has no safe-area inset
        API and the package takes no dependency, so there is no safe-area term; an
        app that needs one pads the provider. The API is `useToast()` / `toast()`
        returning `Promise<{ reason }>`, and `dismiss(toastId?)`. Timers also pause
        while AppState is not `active` (the native "page hidden"); Button exposes
        no focus events to a composer, so native pauses on touch and backgrounding,
        not focus. `escape` stays in the reason type for cross-platform handlers but
        never fires here; dismissal without Escape is the dismiss button, always shown
        for persistent toasts. The iOS announcement uses announceForAccessibilityWithOptions
        with `queue: true` for polite tones and plain announceForAccessibility (interrupting)
        for danger. The actionButton and dismissButton parts are wrapping Views that
        carry the testIDs; Button receives only its listed props. Android: accessibilityLiveRegion="polite"
        (danger: "assertive"); iOS: AccessibilityInfo.announceForAccessibility on
        show. Timers pause while a toast is being touched. No F6; toasts are reached
        by swiping through the accessibility order. Android''s native ToastAndroid
        is not used, so actions and theming work. React Native has no `status` role:
        danger toasts use accessibilityRole="alert", others no role, with accessibilityLiveRegion
        (assertive/polite) and a one-time AccessibilityInfo announcement. Timers pause
        while a toast is touched; F6 and Escape have no native equivalent.'
    swiftui:
      element: VStack
      props:
      - Portal
      - .zIndex
      - AccessibilityNotification
      - Button
      - withAnimation
      - .accessibilityElement=combine
      notes: 'Rendered through `Support/Portal` into the app''s top-level `ZStack`
        at `layer.toast` (the app installs `.dsPortalHost()` once at its root). Each
        toast is one combined element labelled by its text with the tone word; `role:
        status` posts a polite `Announcement`, `alert` an announcement with `.assertive`
        priority. Auto-dismiss pauses while VoiceOver focus is on the toast; the action
        `Button` and dismiss `Button` are inside the element as custom actions (`.accessibilityAction(named:)`)
        as well as visible controls. Enter/exit use the motion tokens; none under
        reduced motion.'
  behavior:
  - name: the-dismiss-button-fires-on-dismiss
    given:
      dismissible: true
    when:
      click: dismissButton
    then:
    - event: onDismiss
  - name: the-action-button-fires-on-action
    description: The single action reports and the toast dismisses; onAction is fired
      before onDismiss.
    given:
      actionLabel: Undo
    when:
      click: actionButton
    then:
    - event: onAction
  - name: escape-dismisses-the-focused-toast
    description: Keyboard users reach a toast with F6 and leave with Escape, so an
      Undo is never pointer-only (keyboard rule 2).
    when:
      key: Escape
    then:
    - event: onDismiss
    platforms:
    - web
    - lit
  - name: danger-toasts-are-announced-assertively
    description: A danger toast uses role alert rather than status, so it interrupts
      (WCAG 4.1.3).
    given:
      tone: danger
    then:
    - role: alert
  - name: the-message-is-rendered
    description: The message is the whole of a toast's content — one short sentence
      saying what happened.
    given:
      message: 3 files moved to Archive
    then:
    - text: 3 files moved to Archive
  examples:
  - name: undo-a-delete
    description: The reason most reversible actions need no AlertDialog; an action
      makes the toast persistent.
    given:
      message: 3 files moved to Archive
      actionLabel: Undo
      duration: persistent
  - name: saved
    description: The plain confirmation of something the user did not have to watch.
    given:
      message: Changes saved
      tone: success
  - name: background-result
    description: A result that arrived on its own, with one way to look at it.
    given:
      message: Export ready
      actionLabel: View
      duration: long
  - name: failed-upload
    description: A danger toast, persistent so nobody misses the one they needed.
    given:
      message: Upload failed
      tone: danger
      actionLabel: Retry
      duration: persistent
```

## Events

- `onAction`: emit `action`
  - fires on: user
  - timing: before-change, fired before `dismiss`
- `onDismiss`: emit `dismiss`
  - payload, the keys of `CustomEvent.detail`: `reason: 'timeout' | 'dismiss-button' | 'escape' | 'action' | 'replaced' | 'programmatic'`
  - reasons: `timeout` (the display duration elapsed); `dismiss-button` (the dismiss button was activated); `escape` (Escape pressed while the toast held focus); `action` (the action button was activated); `replaced` (the toast was replaced or evicted and left immediately); `programmatic` (dismiss(toastId) was called, or dismiss() with no id cleared every toast)
  - fires on: user, programmatic
  - timing: after-change

## Parts and slots

- `region`: element
- `toast`: element
- `icon`: component `Icon`; forwards `icon` → `overrides.color`
- `message`: component `Text`; props `element` = "span", `size` = "md"; forwards `fontFamily` → `overrides.fontFamily`, `fontSize` → `overrides.fontSize`, `lineHeight` → `overrides.lineHeight`
- `actionButton`: component `Button`; props `variant` = "ghost", `inverse` = true, `size` = "sm"
- `dismissButton`: component `Button`; props `variant` = "ghost", `inverse` = true, `size` = "sm", `iconOnly` = true

## Style bindings

- `text`: token `color.inverse.foreground`; part `message`; locked
- `icon`: token `color.inverse.status.{tone}`; part `icon`; locked
- `regionInset`: token `layout.gutter`; part `region`

## Keyboard

- `F6` (Moves focus into the toast region (the first toast's action or dismiss button) from anywhere; F6 again returns to where focus was.): expect focus-first
- `Escape` (Dismisses the focused toast and returns focus.): expect closes

## Constants and examples

- constant `shortDuration`: `calc(var(--motion-duration-loop) * 6)` (`motion.duration.loop` × 6) ms
- constant `longDuration`: `calc(var(--motion-duration-loop) * 12)` (`motion.duration.loop` × 12) ms
- example `undo-a-delete`, story `UndoADelete`: given `message: "3 files moved to Archive"`, `actionLabel: "Undo"`, `duration: "persistent"`; The reason most reversible actions need no AlertDialog; an action makes the toast persistent.
- example `saved`, story `Saved`: given `message: "Changes saved"`, `tone: "success"`; The plain confirmation of something the user did not have to watch.
- example `background-result`, story `BackgroundResult`: given `message: "Export ready"`, `actionLabel: "View"`, `duration: "long"`; A result that arrived on its own, with one way to look at it.
- example `failed-upload`, story `FailedUpload`: given `message: "Upload failed"`, `tone: "danger"`, `actionLabel: "Retry"`, `duration: "persistent"`; A danger toast, persistent so nobody misses the one they needed.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `radius`, `shadow`, `paddingBlock`, `paddingInline`, `gap`, `stackGap`, `regionInset`, `maxWidth`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`, `enterOffset`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse`, `minTarget`

## Behavior scenarios (14)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: the-dismiss-button-fires-on-dismiss
  given:
    dismissible: true
  when:
    click: dismissButton
  then:
  - event: onDismiss
- name: the-action-button-fires-on-action
  description: The single action reports and the toast dismisses; onAction is fired
    before onDismiss.
  given:
    actionLabel: Undo
  when:
    click: actionButton
  then:
  - event: onAction
- name: escape-dismisses-the-focused-toast
  description: Keyboard users reach a toast with F6 and leave with Escape, so an Undo
    is never pointer-only (keyboard rule 2).
  when:
    key: Escape
  then:
  - event: onDismiss
  platforms:
  - web
  - lit
- name: danger-toasts-are-announced-assertively
  description: A danger toast uses role alert rather than status, so it interrupts
    (WCAG 4.1.3).
  given:
    tone: danger
  then:
  - role: alert
- name: the-message-is-rendered
  description: The message is the whole of a toast's content — one short sentence
    saying what happened.
  given:
    message: 3 files moved to Archive
  then:
  - text: 3 files moved to Archive
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-neutral
  given:
    tone: neutral
  then:
  - renders: true
  derived: true
- name: renders-tone-success
  given:
    tone: success
  then:
  - renders: true
  derived: true
- name: renders-tone-warning
  given:
    tone: warning
  then:
  - renders: true
  derived: true
- name: renders-tone-danger
  given:
    tone: danger
  then:
  - renders: true
  derived: true
- name: renders-duration-short
  given:
    duration: short
  then:
  - renders: true
  derived: true
- name: renders-duration-long
  given:
    duration: long
  then:
  - renders: true
  derived: true
- name: renders-duration-persistent
  given:
    duration: persistent
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-toast
reflect:
- tone
- duration
notes: A <ds-toast-region> element (auto-created in document.body by the `toast()`
  function) holds <ds-toast> children in the light DOM so the live region is in the
  document tree. The region sets `role`, `aria-label` and `aria-live` as plain attributes,
  and each toast a plain `role` attribute, because tests read them. `dismiss` and
  `action` are composed CustomEvents.
```

## Guidance

## Overview

A toast says "done" and gets out of the way. It confirms an action just taken, offers one chance to undo it, and leaves without being asked. It is the reason most confirmations do not need an AlertDialog: if the action is reversible, do it and toast an Undo.

## When to use

Use a Toast to confirm a completed action that the user did not have to watch (sent, saved, deleted, copied), to offer Undo for a reversible action, or to report a background result ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever there is an action, and for `danger`, so nobody misses the one they needed.

## When not to use

Do not toast errors that need fixing (an Alert next to the problem), information the user must read (Alert or Dialog), or anything requiring more than one action. Do not toast on page load. Do not stack more than three; the region replaces the oldest. Do not use a toast to confirm every trivial change — a switch flipping does not need "Setting saved".

## Behavior

Toasts are shown through an imperative call, since a notification is an event: `toast({ message, tone, actionLabel, duration, dismissible, toastId, onAction })`, which returns a promise resolving to `{ reason }` when the toast leaves; `dismiss(toastId)` exported beside it removes one toast, and `dismiss()` with no id clears them all (stories call it on cleanup), both with reason `programmatic`. Each appears in the notification region, is announced politely (assertively for `danger`), and dismisses after `duration`, when its action is used, when dismissed, or when a toast with the same `toastId` replaces it. Timers pause while the toast is hovered, focused or touched, and while the page is hidden. Focus never moves to a toast on its own; F6 brings it there when the user wants it, and Escape, the dismiss button or the action sends it back: to the element focus came from when it entered the region (by F6 or by Tab), or, if that element is gone, to the next focusable element after the region (the previous one if there is none). Up to three toasts stack, newest at the bottom on wide screens; three is a fixed count, not a token. The `actionButton` and `dismissButton` parts are wrappers the toast owns around each Button, since Button keeps its own `data-part`; the action Button's label is `actionLabel`, and the dismiss Button's label is `copy.dismissLabel` with the system Icon `close` as its glyph.

## Content guidelines

Messages are one short sentence in the past tense saying what happened, without exclamation ("Message sent", "Link copied", "3 files moved to Archive"). The action is one word when possible ("Undo", "View", "Retry"). No titles, no icons other than the tone's, no links in the message.

## Accessibility

The region is a landmark-like container with an accessible name and `aria-live="polite"` that exists before any toast, so each toast is announced as a status message without moving focus (WCAG 4.1.3, 3.2.1); `danger` toasts use `alert`. Anything with a time limit must be pausable or long enough (2.2.1): timers pause on hover, focus and touch, action toasts are persistent, and durations are never under five seconds. Keyboard users reach toasts with F6 and leave with Escape or Tab (2.1.1), so an Undo is never pointer-only. Text, action and icon meet contrast on the inverted surface in both modes; the build checks them. Motion respects reduced-motion.

## Platform notes

### Web
Export `toast(options)` and a `<ToastRegion>` that the app mounts once (or is auto-mounted on first call). Region: `<div role="region" aria-label={copy.regionLabel} aria-live="polite">` fixed at `inset-block-end: var(--layout-gutter)`, `inset-inline-start` on wide screens and centered below the content measure, `z-index: var(--layer-toast)`. Toast: `<div role={tone === 'danger' ? 'alert' : 'status'}>` with `<Icon name={tone}>`, the message, `<Button variant="ghost" inverse size="sm">` for the action, and the dismiss Button (`iconOnly`, `copy.dismissLabel`). Pause timers on `pointerenter`, `focusin` and `visibilitychange`. Document-level `keydown` for F6 toggles focus between the region and the previously focused element.

### Lit
`toast()` creates `<ds-toast-region>` in `document.body` if absent and appends `<ds-toast>` elements as light-DOM children; the region sets `role="region"`, `aria-label` and `aria-live` as plain attributes. Composed `action` and `dismiss` events bubble to the region for the imperative API's promise.

### React Native
`ToastProvider` at the root renders the region `View` with `zIndex: layerToast`, `position: 'absolute'`, `left`, `right` and `bottom` at `regionInset`, and exposes `useToast()` / `toast()` / `dismiss()`. Each toast `View` has `accessibilityLiveRegion` (Android) and triggers `announceForAccessibility` (iOS) on mount; `Pressable` wrappers pause timers while pressed. The action is the system `Button` (`ghost`, `sm`), the dismiss is `Button iconOnly` with `Icon name="close"`.

## Related

Alert, AlertDialog, Button, Icon.
