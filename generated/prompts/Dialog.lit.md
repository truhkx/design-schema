# Generate: Dialog as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Dialog.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Dialog.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: DialogVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Story render shape: the render that applies to a story (its own `render`, else the meta's) is written inline and returns one `html`` template directly — never a call (`render: (args) => renderBox(args)`) and never a bare identifier (`render: divider`). The docs site reads that template for the Lit code sample, and anything else leaves every story in the module without one. Interpolate helper fragments into the template rather than wrapping it.
- Story parity: every story the React package exports has a Lit story with the same export name and args, including each example named above.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — `protected override render(): TemplateResult` (`TemplateResult | typeof nothing` when a branch renders nothing), typed static members, public methods with return types, `const meta: Meta = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Dialog.test.ts`.

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
  name: Dialog
  category: overlay
  status: review
  apg: dialog-modal
  anatomy:
  - scrim
  - surface
  - focusScope
  - header
  - heading
  - description
  - body
  - footer
  - closeButton
  composition:
    focusScope: FocusScope
    heading:
      component: Heading
      props:
        level: '2'
    description:
      component: Text
      props:
        tone: muted
    closeButton:
      component: Button
      props:
        variant: ghost
        size: sm
        iconOnly: true
    body:
      component: Box
      forwards:
        inset: paddingInline
    footer:
      component: Stack
      props:
        direction: horizontal
        justify: end
        wrap: true
      forwards:
        footerGap: gap
  props:
    open:
      type: boolean
      required: true
      description: Controlled only — there is no uncontrolled mode and no initial-state
        prop; the consumer owns `open` and the dialog never closes itself, it requests
        changes through `onClose`.
      controls:
        event: onClose
        state: open
    heading:
      type: string
      a11yRole: accessible-name
      required: true
      description: The dialog's title, rendered as a level-2 Heading and used as the
        accessible name. Says what the task is ("Rename project").
      a11y: aria-labelledby the heading; native accessibilityLabel on the Modal content.
    description:
      type: string
      description: One sentence under the title explaining the task or consequence.
        Becomes the accessible description.
      a11y: aria-describedby.
    children:
      type: content
      required: true
      description: The body — a Form, Text, or controls. Scrolls inside the surface
        when taller than the viewport; header and footer stay put.
    footer:
      type: content
      description: The action row. Primary action first, then one secondary; follows
        Form's action-order rule. A dialog with no footer must be dismissable from
        its body.
    hideHeading:
      type: boolean
      default: false
      description: Visually hide the heading while it remains the accessible name
        (BottomSheet forwards its own hideHeading here above the breakpoint).
    size:
      type: enum
      enumRef: size
      values:
      - sm
      - md
      - lg
      default: md
      description: Surface width on wide viewports. Full-width below the content measure
        on every size.
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button and a scrim click all request close.
        Set false for a dialog that must be answered (then provide the answers in
        the footer): the close button is not rendered and the scrim does nothing;
        Escape still fires `onClose` with reason `escape` so the consumer can decide.'
    initialFocus:
      type: enum
      values:
      - first
      - title
      - close
      default: first
      description: 'Where focus lands on open: the first focusable control (default),
        the title (for long or reading dialogs), or the close button. `first` looks
        in the body, then the footer, then the close button, then the heading (tabindex
        -1); `close` with no close button rendered (not dismissible) takes the same
        order without the close button.'
      a11y: Focus must move into the dialog on open and never rest on the scrim or
        the page behind.
  events:
    onClose:
      description: 'Fired when the user requests to close, with a reason: `escape`,
        `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or
        not).'
      platforms:
        web: onClose
        lit: close
        rn: onClose
        swiftui: onClose
      payload:
      - name: reason
        type: enum
        values:
        - escape
        - close-button
        - scrim
        - action
      reasons:
        escape: Escape pressed while open
        close-button: the close button was activated
        scrim: the scrim was clicked
        action: something inside the dialog asked to close — a footer action reusing
          this same handler, or on Lit a slotted form submitted with method="dialog"
          (a light-DOM form has no <dialog> ancestor, so a host `submit` listener
          catches a form or submitter whose method is `dialog`, prevents default and
          fires `close` with `action`). Dialog never raises it on its own; the three
          dismiss affordances have their own reasons.
      fires:
      - user
      timing:
        phase: request
    onOpened:
      description: Fired after the open transition ends and focus has moved in. When
        there is no transition to wait for (reduced motion, or a zero computed duration),
        it fires on the next frame (requestAnimationFrame on every platform) after
        focus moves in. It does not fire when `open` becomes false before the enter
        transition finishes — including on that reduced-motion path, where the pending
        frame is cancelled. Use to start work that needs the dialog visible.
      platforms:
        web: onOpened
        lit: opened
        rn: onOpened
        swiftui: onOpened
      timing:
        phase: after-change
  keyboard:
  - keys:
    - Escape
    action: Requests close with reason escape (even when not dismissible).
    from: inside
    expect: closes
  - keys:
    - Tab
    action: Moves to the next focusable element inside the dialog.
    from: first
    expect: focus-next
  - keys:
    - Tab
    action: From the last element, wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Shift+Tab
    action: From the first element, wraps to the last.
    from: first
    expect: focus-wraps-to-last
  styles:
    scrim:
      token: color.overlay.scrim
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
      locked: true
    border:
      token: color.border
      description: Hairline; the only edge in a flat theme.
      locked: false
    borderWidth:
      token: border.width.thin
      locked: false
    shadow:
      token: shadow.overlay
      locked: false
    radius:
      token: radius.lg
      locked: false
    inset:
      token: layout.inset.lg
      description: 'Inline padding of header, body and footer, plus the block padding
        of the surface column that holds them (once at the top, once at the bottom),
        so nothing doubles between parts. The header and the footer wrapper apply
        the inline padding themselves; the body Box receives it as `overrides.paddingInline`
        and keeps zero block padding. The forward always reaches the Box: on web and
        Lit through the stylesheet setting the Box''s `--ds-box-padding-inline` to
        `--ds-dialog-inset` — that hook is the whole delivery, since an element-level
        `overrides.paddingInline` would only set the same custom property again; on
        rn the Box takes `inset="none"` and the token path (the override, else `layout.inset.lg`)
        in `overrides.paddingInline`, a path and never a resolved value, since a parent
        does not resolve a token for its child.'
      locked: false
    partGap:
      token: layout.gap.loose
      description: Gap between header, body and footer, and the only space between
        them.
      locked: false
    gutter:
      token: layout.gutter
      description: 'Minimum space between the surface and the viewport edge: web and
        Lit cap the surface at `100vw - 2 × gutter` wide and `100dvh - 2 × gutter`
        tall — never the <dialog>, which fills the viewport and holds the scrim, so
        capping it would pull the scrim off the edges; rn pads the centring container
        horizontally with it (never a margin) and caps the surface at the window height
        − 2 × gutter.'
      locked: false
    headerGap:
      token: layout.gap.normal
      part: header
      description: Between title/description and the close button.
      locked: false
    footerGap:
      token: layout.gap.tight
      part: footer
      description: 'Between footer actions; forwarded to the footer Stack as `overrides.gap`.
        On web and Lit the CSS hook reaches the Stack too: the footer wrapper''s stylesheet
        sets the Stack''s own `--ds-stack-gap` hook on the Stack element to `--ds-dialog-footer-gap`,
        so either route changes the gap. The footer row is end-aligned (Form''s action-row
        rule), unlike Card''s start-aligned footer.'
      locked: false
    descriptionGap:
      token: layout.gap.tight
      part: header
      description: 'Between the heading and the description: the flex gap of the titles
        group, a Dialog-owned element inside the header that wraps heading and description.
        The group is not an anatomy part and carries no data-part or testID.'
      locked: false
    widthSm:
      token: layout.maxWidth.prose
      description: Surface width for size sm.
      locked: false
    widthMd:
      token: layout.maxWidth.content
      computed:
        times: 0.75
      description: 'Surface width for size md: layout.maxWidth.content × 0.75, not
        a new token. An override replaces the base; the × 0.75 stays in the rule,
        and the rule multiplies the hook (`--ds-dialog-width-md`, itself defaulting
        to the token) rather than the raw token, or an override would never reach
        it.'
      locked: false
    widthLg:
      token: layout.maxWidth.content
      description: Surface width for size lg.
      locked: false
    layer:
      token: layer.dialog
      description: 'Kept as the hook, but it has no effect inside the browser top
        layer or a native Modal window; it applies to a non-top-layer fallback (position:
        fixed) only. On rn it is still written as zIndex on the centring container,
        as AlertDialog, BottomSheet and SidePanel do, so the override is not dead
        code on that platform — a Modal window simply ignores it.'
      locked: false
    enter:
      token: motion.duration.base
      description: 'Scrim fade and surface fade-and-rise, motion.easing.standard:
        the surface starts space.2 below its resting place (translateY +space.2 →
        0) and rises into it; the scrim fades in with the same duration and easing.
        Runs also when the dialog mounts already open. Instant under reduced motion.'
      locked: false
    exit:
      token: motion.duration.fast
      description: Fade only, with motion.easing.exit; the scrim fades out with the
        same duration and easing as the surface.
      locked: false
    focusRing:
      token: color.border.focus
      part: heading
      description: 'The ring on the heading when it holds focus (tabindex -1), drawn
        by the Dialog-owned heading wrapper with `:has(:focus-visible)` — Heading
        has no focus style of its own. `:focus-visible` is the intent, not an accident
        of the programmatic focus: a dialog opened from the keyboard shows the ring,
        one opened by mouse does not, which is the same rule every other control follows.
        Web and Lit only: rn draws no ring, the platform''s screen-reader focus indicator
        stands in.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: heading
      locked: true
  copy:
    closeLabel: Close
  overlay:
    layer: modal
    open: open
    closeEvent: onClose
    dismiss:
    - escape
    - scrim
    - close-button
    modal: true
  a11y:
    role: dialog
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - scroll-lock
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
    requiresOn:
      scroll-lock:
      - web
      - lit
      - swiftui
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
    - foreground: color.link
      background: color.overlay.surface
      level: AA
    - foreground: color.action.ghost.foreground
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: dialog
      attributes:
      - aria-modal
      - aria-labelledby
      - aria-describedby
      notes: 'A native <dialog> opened with showModal(), which gives the top layer,
        Escape (cancel event → onClose reason escape, preventDefault always, since
        the consumer owns `open`), and background inertness for free. Where the browser
        fires a non-cancelable `cancel` (Chromium without user activation) and closes
        the native dialog anyway, still report `escape`, then call showModal() again
        and move focus back in per `initialFocus` if the consumer has not set `open`
        false. A close watcher can also close the <dialog> with no `cancel` at all
        (repeated Escape): a native `close` event while `open` is still true that
        no `cancel` announced is reported as `escape` too, so each Escape is reported
        exactly once, and the dialog is reopened the same way. Rendered through a
        portal into document.body. The <dialog> fills the viewport with a transparent
        ::backdrop; the scrim is a real element inside it (`data-part="scrim"`, behind
        the surface, fading with the surface), and a click whose target is that element
        is the scrim click. Heading, Button and Stack write their own data-part, so
        the heading, closeButton and footer parts are Dialog-owned wrapper elements
        around those components (the heading wrapper does the visual hiding for `hideHeading`
        and draws the focus ring); Text keeps a passed data-part, so the description
        carries it itself. The body part is a Dialog-owned scroll container (overflow:
        auto, the only element that scrolls) holding the Box, since Box never scrolls.
        FocusScope writes its own `data-part="scope"`, so the focusScope part is a
        Dialog-owned element directly inside FocusScope wrapping the surface. The
        footer wrapper is not rendered when there is no footer. The ref resolves to
        the <dialog> element, null while closed. Focus trap: showModal() traps by
        inertness, and FocusScope (trapped) implements the Tab wrap the browser would
        otherwise let leave to the URL bar; Dialog adds no Tab handler of its own.
        Body scroll locked with overflow: hidden on <html> while open, compensating
        for scrollbar width via scrollbar-gutter. Focus restore to document.activeElement
        at open time. `container?: HTMLElement` (default document.body) is the portal
        target — a platform prop every portaled overlay accepts, not a schema prop.
        FocusScope has no autoFocus value for `title` or `close`, so Dialog sets it
        to `none` and places initial focus itself, right after showModal() (and after
        a native re-open), while FocusScope keeps ownership of capturing and restoring
        the opener. `initialFocus: close` on a non-dismissible dialog has no close
        button to land on and falls back in the `initialFocus` description''s order.
        The heading takes `tabindex="-1"` for `initialFocus: title` and whenever it
        is the last fallback of `first` or `close`, and keeps it when `hideHeading`
        is set — a visually hidden heading is still a focus target and still announced.'
    lit:
      tag: ds-dialog
      reflect:
      - open
      - size
      - prop: dismissible
        attribute: no-dismiss
      - prop: initialFocus
        attribute: initial-focus
      notes: 'Wraps a native <dialog> in the shadow root; the top layer works from
        inside shadow DOM. `open` is a reflected property the consumer sets; the element
        calls showModal()/close() in updated(). `close` is a composed CustomEvent
        with detail { reason }; `opened` likewise. Slots: default (body), `footer`.
        Title and description are properties rendered as <ds-heading level="2"> and
        <ds-text>. The close button is a <ds-button variant="ghost" size="sm" icon-only>
        with <ds-icon name="close">. Accessible name: ids do not cross the shadow
        boundary, so the shadow <dialog> carries aria-label={heading} (and aria-description
        from the description text) rather than aria-labelledby. The heading happens
        to share the shadow root, so an idref would resolve — the literal text is
        still used, so the name does not depend on where the heading is rendered,
        as in AlertDialog. The scrim, the part wrappers, the `cancel`/`close` escape
        handling, initial focus and the Tab wrap are as on web: a real scrim element
        in a full-viewport <dialog> with a transparent ::backdrop, and wrapper elements
        carrying the heading, closeButton and footer parts. On Lit the description
        and body parts are Dialog-owned wrappers too: `data-part="body"` is the scroll
        container around the <ds-box>, which overwrites its own data-part with `surface`,
        and the description wrapper holds <ds-text> for symmetry with AlertDialog''s
        Lit shape — <ds-text> would keep a passed data-part, so this is a choice,
        not a workaround. Lit exposes no ref-like property. A Lit property cannot
        be required: `open` defaults to false and `heading` to the empty string, with
        a dev-only warning when an open dialog has no heading. `opened` carries no
        detail at all (its payload is `void`), not an empty object. For `initialFocus:
        title` and the heading fallback, `tabindex="-1"` goes on the <ds-heading>
        itself, so the heading wrapper''s `:has(:focus-visible)` ring matches. The
        footer is present when a light-DOM element child has `slot="footer"` (watched
        with a MutationObserver over children and their slot attribute); footer content
        must be elements, a bare text node is not a footer. While closed (and not
        animating out) the shadow root renders nothing — no <dialog> and no element
        children.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - animationType=none
      - onRequestClose
      - statusBarTranslucent
      - accessibilityViewIsModal
      notes: 'Native Modal with transparent background; the scrim is an Animated.View
        carrying color.overlay.scrim and the fading opacity, with a full-bleed Pressable
        (accessible={false}) inside it carrying `testID="Dialog.scrim"` — RN has no
        animated Pressable without wrapping one, and the scrim element must exist
        even when `dismissible` is false (the press handler is then inert, since the
        non-dismissible-scrim-click-does-nothing scenario presses it). The shadow
        and the matching radius sit on that animated wrapper around the surface, because
        the surface needs `overflow: hidden` to clip the scrolling body and would
        clip its own shadow. With no footer, the body''s bottom spacing is the surface
        column''s own block padding and no part sits below it. `description` has no
        native aria-describedby: it is the surface''s accessibilityHint, which screen
        readers announce after a pause. Of the keyboard block only rule 1 (Escape,
        via Android back and onAccessibilityEscape) has a native expression — there
        is no Tab order to confine, and `trapped` maps only to accessibilityViewIsModal,
        so the wrap rules are exercised on react-native-web alone. The surface is
        a View with accessibilityViewIsModal so VoiceOver/TalkBack ignore the page
        behind. onRequestClose (Android back) → onClose reason escape. Focus: AccessibilityInfo.setAccessibilityFocus
        on the title or first control after the enter animation. Keyboard avoidance
        with a KeyboardAvoidingView wrapping the whole centring container, so the
        footer as well as a Form in the body stays above the keyboard. Enter/exit
        animated with Animated (opacity + translateY; the scrim is an Animated.View
        whose opacity follows the same value), skipped under reduce motion. Size maps
        to maxWidth from the same tokens; on phones the surface is full-width inside
        the centring container''s `gutter` padding. The surface carries the RN >=
        0.74 `role="dialog"` prop (as Landmark and Fieldset use `role`), alongside
        accessibilityViewIsModal; the legacy accessibilityRole union has no dialog
        value. Scroll lock has no native meaning and is not implemented. `accessibilityViewIsModal`
        goes on the surface View, not on Modal, which does not accept it. testIDs
        are the root plus scrim, header, body and footer; heading, description, closeButton
        and focusScope are reached through their own roles and names and take none,
        as in AlertDialog. The root testID `Dialog` sits on the surface View (with
        the role and name), since a closed Modal renders no content. Stack and Box
        write their own testIDs, so the footer and body testIDs sit on wrapping Views;
        the body wrapper holds the ScrollView and is also the setAccessibilityFocus
        target for the body. On rn `initialFocus: first` therefore always lands on
        the body wrapper (children is required, so a body is always present). iOS
        has no hardware-Escape hook, so the surface View also handles `onAccessibilityEscape`
        (the VoiceOver two-finger scrub) as onClose reason escape, even when not dismissible.
        RN has no visually hidden primitive: with `hideHeading` the Heading is not
        rendered, the surface''s accessibilityLabel stays the name, and `initialFocus:
        title` focuses the surface View. The Dialog is rooted in a native Modal and
        exposes no ref; callers ref their trigger. Native has no descendant walker,
        so `initialFocus` calls setAccessibilityFocus on the View wrapping the title,
        the close button or the body, not on a literal first focusable descendant,
        and there is no visible focus ring on those targets.'
    swiftui:
      element: sheet
      props:
      - .sheet
      - .fullScreenCover
      - .popover
      - .interactiveDismissDisabled
      - .presentationBackground
      - .accessibilityAddTraits=isModal
      - FocusScope
      - .onExitCommand
      notes: 'Presented with `.sheet` on compact width and `.popover` (regular width,
        iPad); the `size` enum is sm, md and lg only — there is no `full` value —
        and `.fullScreenCover` is used for `lg` on compact width, where a sheet would
        otherwise leave a sliver of the page. The dialog surface, heading (`Heading`,
        the `.accessibilityLabel` of the container), body and actions are the package''s
        own views inside the presentation with `.presentationBackground(color.overlay.surface)`
        and `.presentationDragIndicator(.hidden)`. `dismissOnScrim: false` → `.interactiveDismissDisabled()`.
        FocusScope handles initial and return focus; Escape via `.onExitCommand`;
        VoiceOver''s two-finger scrub triggers the same close through `.accessibilityAction(.escape)`.
        `onOpened` fires from `.onAppear` of the content.'
  behavior:
  - name: close-button-fires-on-close
    description: The close button requests close; the dialog never closes itself,
      the consumer flips `open`.
    given:
      open: true
    when:
      click: closeButton
    then:
    - event: onClose
  - name: non-dismissible-still-reports-escape
    description: Escape requests close with reason escape even when not dismissible
      (keyboard rule 1), because trapping a keyboard user with no way out is never
      acceptable.
    given:
      open: true
      dismissible: false
    when:
      key: Escape
    then:
    - event: onClose
    platforms:
    - web
    - lit
  - name: non-dismissible-scrim-click-does-nothing
    description: With `dismissible` false the scrim does nothing, so a stray click
      cannot abandon the task.
    given:
      open: true
      dismissible: false
    when:
      click: scrim
    then:
    - event: onClose
      fired: false
  - name: initial-focus-lands-on-the-close-button
    description: initialFocus close puts focus on the close button rather than the
      first body control.
    given:
      open: true
      initialFocus: close
    then:
    - focused: closeButton
    platforms:
    - web
    - lit
  - name: hidden-heading-is-still-the-accessible-name
    description: hideHeading removes the title from view, not from the accessible
      name.
    given:
      open: true
      hideHeading: true
    then:
    - name: true
  - name: closed-dialog-renders-nothing
    description: 'Closed and not animating out, the dialog renders nothing: null on
      web, an empty shadow root on Lit, no Modal content on rn.'
    given:
      open: false
    then:
    - renders: false
  examples:
  - name: rename-project
    description: The short single-field task a dialog is for, with the completing
      action named after it.
    given:
      open: true
      heading: Rename project
      children: A labelled text Input holding the current name
      footer: Rename and Cancel Buttons
  - name: invite-people
    description: A small form in the narrow size, where the footer restates the task.
    given:
      open: true
      heading: Invite people
      children: An email Input and a role Select
      footer: Send invites and Cancel Buttons
      size: sm
  - name: must-be-answered
    description: A dialog with no way out but its own actions; Escape still reports
      so the consumer can decide.
    given:
      open: true
      heading: Choose a plan
      description: You need a plan before you can invite anyone.
      children: A RadioGroup of plans
      footer: Continue Button
      dismissible: false
  - name: reading-dialog
    description: A long reading dialog that starts focus on the title so the text
      is read from the top.
    given:
      open: true
      heading: Terms of service
      children: Several paragraphs of Text
      size: lg
      initialFocus: title
```

## Events

- `onClose`: emit `close`
  - payload, the keys of `CustomEvent.detail`: `reason: 'escape' | 'close-button' | 'scrim' | 'action'`
  - reasons: `escape` (Escape pressed while open); `close-button` (the close button was activated); `scrim` (the scrim was clicked); `action` (something inside the dialog asked to close — a footer action reusing this same handler, or on Lit a slotted form submitted with method="dialog" (a light-DOM form has no <dialog> ancestor, so a host `submit` listener catches a form or submitter whose method is `dialog`, prevents default and fires `close` with `action`). Dialog never raises it on its own; the three dismiss affordances have their own reasons.)
  - fires on: user
  - timing: request
- `onOpened`: emit `opened`
  - timing: after-change

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `close`); drives state `open`

## Parts and slots

- `scrim`: element
- `surface`: element
- `focusScope`: component `FocusScope`
- `header`: element
- `heading`: component `Heading`; props `level` = "2"
- `description`: component `Text`; props `tone` = "muted"
- `body`: component `Box`; forwards `inset` → `overrides.paddingInline`
- `footer`: component `Stack`; props `direction` = "horizontal", `justify` = "end", `wrap` = true; forwards `footerGap` → `overrides.gap`
- `closeButton`: component `Button`; props `variant` = "ghost", `size` = "sm", `iconOnly` = true

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `headerGap`: token `layout.gap.normal`; part `header`
- `footerGap`: token `layout.gap.tight`; part `footer`
- `descriptionGap`: token `layout.gap.tight`; part `header`
- `widthMd`: token `layout.maxWidth.content`; computed `calc(var(--layout-max-width-content) * 0.75)`
- `focusRing`: token `color.border.focus`; part `heading`; locked
- `focusRingWidth`: token `border.width.focus`; part `heading`; locked

## Form and overlay

```yaml
overlay:
  layer: modal
  open: open
  closeEvent: onClose
  dismiss:
  - escape
  - scrim
  - close-button
  modal: true
```

`overlay.closeEvent` emits `close`.

## Constants and examples

- example `rename-project`, story `RenameProject`: given `open: true`, `heading: "Rename project"`, `children: "A labelled text Input holding the current name"`, `footer: "Rename and Cancel Buttons"`; The short single-field task a dialog is for, with the completing action named after it.
- example `invite-people`, story `InvitePeople`: given `open: true`, `heading: "Invite people"`, `children: "An email Input and a role Select"`, `footer: "Send invites and Cancel Buttons"`, `size: "sm"`; A small form in the narrow size, where the footer restates the task.
- example `must-be-answered`, story `MustBeAnswered`: given `open: true`, `heading: "Choose a plan"`, `description: "You need a plan before you can invite anyone."`, `children: "A RadioGroup of plans"`, `footer: "Continue Button"`, `dismissible: false`; A dialog with no way out but its own actions; Escape still reports so the consumer can decide.
- example `reading-dialog`, story `ReadingDialog`: given `open: true`, `heading: "Terms of service"`, `children: "Several paragraphs of Text"`, `size: "lg"`, `initialFocus: "title"`; A long reading dialog that starts focus on the title so the text is read from the top.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `border`, `borderWidth`, `shadow`, `radius`, `inset`, `partGap`, `gutter`, `headerGap`, `footerGap`, `descriptionGap`, `widthSm`, `widthMd`, `widthLg`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `focusRing`, `focusRingWidth`

## Behavior scenarios (15)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: close-button-fires-on-close
  description: The close button requests close; the dialog never closes itself, the
    consumer flips `open`.
  given:
    open: true
  when:
    click: closeButton
  then:
  - event: onClose
- name: non-dismissible-still-reports-escape
  description: Escape requests close with reason escape even when not dismissible
    (keyboard rule 1), because trapping a keyboard user with no way out is never acceptable.
  given:
    open: true
    dismissible: false
  when:
    key: Escape
  then:
  - event: onClose
  platforms:
  - web
  - lit
- name: non-dismissible-scrim-click-does-nothing
  description: With `dismissible` false the scrim does nothing, so a stray click cannot
    abandon the task.
  given:
    open: true
    dismissible: false
  when:
    click: scrim
  then:
  - event: onClose
    fired: false
- name: initial-focus-lands-on-the-close-button
  description: initialFocus close puts focus on the close button rather than the first
    body control.
  given:
    open: true
    initialFocus: close
  then:
  - focused: closeButton
  platforms:
  - web
  - lit
- name: hidden-heading-is-still-the-accessible-name
  description: hideHeading removes the title from view, not from the accessible name.
  given:
    open: true
    hideHeading: true
  then:
  - name: true
- name: closed-dialog-renders-nothing
  description: 'Closed and not animating out, the dialog renders nothing: null on
    web, an empty shadow root on Lit, no Modal content on rn.'
  given:
    open: false
  then:
  - renders: false
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
- name: renders-size-lg
  given:
    size: lg
  then:
  - renders: true
  derived: true
- name: renders-initial-focus-first
  given:
    initialFocus: first
  then:
  - renders: true
  derived: true
- name: renders-initial-focus-title
  given:
    initialFocus: title
  then:
  - renders: true
  derived: true
- name: renders-initial-focus-close
  given:
    initialFocus: close
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: escape-fires-on-close
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onClose
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```

## Platform notes (lit)

```yaml
tag: ds-dialog
reflect:
- open
- size
- prop: dismissible
  attribute: no-dismiss
- prop: initialFocus
  attribute: initial-focus
notes: "Wraps a native <dialog> in the shadow root; the top layer works from inside\
  \ shadow DOM. `open` is a reflected property the consumer sets; the element calls\
  \ showModal()/close() in updated(). `close` is a composed CustomEvent with detail\
  \ { reason }; `opened` likewise. Slots: default (body), `footer`. Title and description\
  \ are properties rendered as <ds-heading level=\"2\"> and <ds-text>. The close button\
  \ is a <ds-button variant=\"ghost\" size=\"sm\" icon-only> with <ds-icon name=\"\
  close\">. Accessible name: ids do not cross the shadow boundary, so the shadow <dialog>\
  \ carries aria-label={heading} (and aria-description from the description text)\
  \ rather than aria-labelledby. The heading happens to share the shadow root, so\
  \ an idref would resolve \u2014 the literal text is still used, so the name does\
  \ not depend on where the heading is rendered, as in AlertDialog. The scrim, the\
  \ part wrappers, the `cancel`/`close` escape handling, initial focus and the Tab\
  \ wrap are as on web: a real scrim element in a full-viewport <dialog> with a transparent\
  \ ::backdrop, and wrapper elements carrying the heading, closeButton and footer\
  \ parts. On Lit the description and body parts are Dialog-owned wrappers too: `data-part=\"\
  body\"` is the scroll container around the <ds-box>, which overwrites its own data-part\
  \ with `surface`, and the description wrapper holds <ds-text> for symmetry with\
  \ AlertDialog's Lit shape \u2014 <ds-text> would keep a passed data-part, so this\
  \ is a choice, not a workaround. Lit exposes no ref-like property. A Lit property\
  \ cannot be required: `open` defaults to false and `heading` to the empty string,\
  \ with a dev-only warning when an open dialog has no heading. `opened` carries no\
  \ detail at all (its payload is `void`), not an empty object. For `initialFocus:\
  \ title` and the heading fallback, `tabindex=\"-1\"` goes on the <ds-heading> itself,\
  \ so the heading wrapper's `:has(:focus-visible)` ring matches. The footer is present\
  \ when a light-DOM element child has `slot=\"footer\"` (watched with a MutationObserver\
  \ over children and their slot attribute); footer content must be elements, a bare\
  \ text node is not a footer. While closed (and not animating out) the shadow root\
  \ renders nothing \u2014 no <dialog> and no element children."
```

## Guidance

## Overview

A dialog interrupts. It takes the whole screen's attention for one task and gives it back when the task is done or abandoned. Everything about it — the scrim, the trapped focus, the inert page behind, Escape, focus returning to where it was — exists to make that interruption safe and reversible. Anything that does not need the interruption should not be a dialog.

## When to use

Use a Dialog for a short task that must complete before the user continues and needs its own space: rename, create-with-a-few-fields, choose from options with consequences, confirm something reversible with a form attached. Keep it to one screen of content; a dialog that scrolls much is a page. Give it a `heading` that names the task and a `footer` with the completing action first.

## When not to use

Do not use a Dialog for a message that needs no decision (Alert or Toast), for a destructive confirmation (AlertDialog — it asserts and does not dismiss on scrim click), for content that benefits from the page context staying visible (Popover or Disclosure), for navigation menus (Menu), or on a phone for anything the thumb should reach (BottomSheet). Do not open a dialog on page load or without a user action; users cannot tell what interrupted them. Do not nest dialogs.

## Behavior

Setting `open` true renders the dialog in the top layer with the scrim, moves focus in per `initialFocus`, locks page scroll and makes the page behind inert. Tab and Shift+Tab cycle within the dialog. Escape, the close button and a scrim click each call `onClose` with a reason; the dialog does not close itself — the consumer flips `open`, so an unsaved form can ask first. When `dismissible` is false, the close button is not rendered, the scrim does nothing and Escape still reports (the consumer decides), because trapping a keyboard user with no way out is never acceptable. On close, the exit animation runs, scroll and inertness are restored, and focus returns to the element that opened the dialog (or the next focusable element if it is gone). The body scrolls independently when content exceeds the viewport; header and footer are always visible.

The parts nest as: the scrim and a FocusScope side by side, the FocusScope wrapping the surface, and the surface holding the header (the titles group of heading and description, then the close button), the body and the footer. The Default story is open, with the rename-project example's args; stories that need to start open render through a wrapper that owns `open` (starting true) and writes `onClose` back, acting as the consumer. Example stories read as if they started from blank args: Storybook merges `meta.args` into every story, so each example sets every prop its `given` names and restates the ones it relies on being at their default (reading-dialog's `footer`, which is absent, so that dialog has no footer). The field values inside an example's body are initial values, not controlled bindings — the uncontrolled route on every platform (`defaultValue`, not `value`), or the field could not be typed in. The stories are Default, one per `size` and `initialFocus` value, the examples, `Closed` (`open: false`) and Keyboard on every platform; a platform adds none of its own.

`open` is controlled only; there is no uncontrolled mode. Focus restore runs when `open` becomes false, at the start of the exit transition. Beyond the listed composition props, the Heading's id, ref and tabindex, the close Button's label (`copy.closeLabel`), its `close` Icon as `leadingIcon` and its press handler are wiring every platform passes, not composition props.

## Content guidelines

Titles are short verb phrases naming the task ("Rename project", "Invite people"), not questions or "Dialog". The description, if any, is one sentence of consequence or context. Footer actions restate the task ("Rename", "Send invites") with "Cancel" as the secondary — never "OK"/"Yes". The close button's name is `copy.closeLabel`.

## Accessibility

The dialog has role `dialog`, `aria-modal`, an accessible name from the title and a description from `description` (WCAG 4.1.2, APG modal dialog). Focus moves into it on open and is trapped until close (2.4.3, 2.1.2: no keyboard trap *without an exit* — Escape is the exit), then returns to the opener (focus-restore). The page behind is inert to assistive technology and pointer (inert-background). Escape always reports, even for non-dismissible dialogs. Text on the overlay surface meets 4.5:1 in both modes; the build checks body, muted, link and ghost-button text. Motion respects reduced-motion (2.3.3). The close button is at least 24px (2.5.8) — it is Dialog's only control, and the floor is the composed Button's own `size: sm` target, so Dialog sets no minimum of its own. Nothing inside relies on hover.

## Platform notes

### Web
Render through a portal into `document.body`: `<dialog aria-labelledby aria-describedby>` containing the surface. Call `showModal()` when `open` becomes true and `close()` when false; listen to `cancel` (Escape) and call `preventDefault()` on it always, reporting through `onClose('escape')` — the consumer owns `open`. Leave `::backdrop` transparent and render the scrim as a real element inside the full-viewport `<dialog>`, styled with the scrim token and `@media (prefers-reduced-motion: no-preference)` transitions. Detect a scrim click as a `click` whose target is the scrim element. Tab wrapping comes from FocusScope (`trapped`); add no handler of your own. Lock scroll with a class on `<html>` (`overflow: hidden; scrollbar-gutter: stable`). Store `document.activeElement` on open; on close, focus it if still connected. Size classes set `inline-size` from the width tokens with `max-inline-size: calc(100vw - 2 * var(--layout-gutter))`.

### Lit
`<ds-dialog open heading="Rename project">` with a `<dialog>` in the shadow root; `showModal()` works from a shadow root and the element is placed in the top layer. The light-DOM slotted content is part of the dialog's focus order, so the Tab wrap (FocusScope's walker) covers both the shadow root and assigned slot nodes. Dispatch composed `close` and `opened`. Reflect `open` so `ds-dialog[open]` can be styled. Compose `<ds-heading>`, `<ds-text>`, `<ds-button>`, `<ds-icon>`, `<ds-box>`, `<ds-stack>`.

### React Native
`Modal` with `transparent`, `animationType="none"` (the component animates itself), `onRequestClose` → `onClose('escape')`, `statusBarTranslucent`. Inside: an `Animated.View` scrim (`Pressable` for the scrim click, `accessible={false}`), and the surface `View` with `accessibilityViewIsModal`, `accessibilityLabel={heading}`, `accessibilityHint={description}`. Wrap the body in `ScrollView`, and the whole centring container in `KeyboardAvoidingView`. After the enter animation, `setAccessibilityFocus` on the title (or first control). Size uses `maxWidth` from the width tokens, with `paddingHorizontal` of `gutter` on the centring container and `maxHeight` of the window height − 2 × `gutter` on the surface; below the content measure the surface is full width. The close button is the system `Button` with `leadingIcon` an `Icon name="close"`.

## Related

AlertDialog, BottomSheet, Toast, Form, Button, Heading.
