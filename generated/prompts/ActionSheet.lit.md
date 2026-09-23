# Generate: ActionSheet as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/ActionSheet.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `ActionSheet.stories.ts` covering every enum value of every enum prop.

**When the files already exist.** Read the existing element, stories, tests and index export first. The doc is authoritative: change what contradicts it, add what it requires, and keep what it does not mention unless a convention forbids it. Do not restyle or rename for taste. In your reply, before the report block, say what you changed and why.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: ActionSheetVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Testability hooks for the gates: the host carries `data-ds="<Name>"`; a component with a `keyboard` block ships a story exported as `Keyboard` that renders it open/present with its trigger (if any) and enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the element's own navigation (roving or activedescendant) whether or not they are tab stops; an overlay with a fixed set of controls renders that set.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `ActionSheet.test.ts`.

## Declared contracts

The sections between the schema and the overrides resolve what the schema declares for lit; a section is absent when the component declares none of it. Where one disagrees with prose or a rule above, the section wins.

- **Events**: dispatch each as a `CustomEvent` under its emitted name whose `detail` has exactly the listed keys, and type `reason` as the union of its reasons. A `cancelable` event is dispatched with `cancelable: true`, and the element skips the default action when `dispatchEvent` returns `false`. Fire only for the listed `fires` sources, in the `timing` order given.
- **Controlled state**: implement every pair: controlled when the property is set, uncontrolled from the default property otherwise (`@state`), unless the property has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change. The event fires in every mode; a controlled element shows the new state only once the property changes.
- **Parts and slots**: render each slot only as `<slot>` under its resolved name (the default slot unnamed). A composed part receives exactly the listed `props`, and each forward reaches the child's `overrides` under the child binding named; add no other. Wiring is not a prop choice and is always allowed: ids and `aria-*` references, refs, `tabindex` for roving focus, event listeners, and copy strings the parent owns.
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
  name: ActionSheet
  category: overlay
  status: review
  apg: menu-button
  anatomy:
  - scrim
  - surface
  - focusScope
  - handle
  - header
  - heading
  - list
  - item
  - itemIcon
  - divider
  - cancelButton
  composition:
    focusScope:
      component: FocusScope
      props:
        trapped: true
        restoreFocus: true
        autoFocus: none
        active:
          from: open
    heading:
      component: Text
      props:
        element: p
        tone: muted
        size: sm
      forwards:
        fontFamily: fontFamily
        titleSize: fontSize
        lineHeight: lineHeight
    itemIcon: Icon
    cancelButton:
      component: Button
      props:
        variant: secondary
  props:
    open:
      type: boolean
      required: true
      description: Controlled only — there is no uncontrolled mode; the consumer owns
        `open`, the sheet requests a dismissal through `onClose` and reports a choice
        through `onAction`, and the consumer sets `open` to false for both.
      controls:
        event: onClose
        state: open
    heading:
      type: string
      description: What the actions apply to ("Photo.jpg"), shown muted above the
        list. Also the accessible name; when omitted the name is `copy.defaultLabel`.
    actions:
      type: array
      required: true
      shape: '{ id: string; label: string; icon?: IconName; tone?: "default" | "danger";
        disabled?: boolean }[]'
      description: 'Two to about eight actions. `danger` actions are visually distinct
        and grouped last: the component does the grouping, so the consumer may pass
        them in any order — the default actions render in the order given, then the
        danger ones in the order given. The count is guidance, not enforced: no dev
        warning outside that range. Every optional field also accepts an explicit
        `undefined` (`icon?: IconName | undefined`, and so on) wherever the type is
        written out, since rn Menu builds these objects with explicit undefined values
        under exactOptionalPropertyTypes.'
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the scrim, the cancel row and the drag all request close.
        When false, as in Dialog: the Cancel row and the divider above it are not
        rendered, the drag handle is not rendered, the scrim and the drag do nothing,
        and Escape still reports through onClose; with no `heading` either, the header
        has nothing to show and is not rendered at all (no empty padded strip). It
        gates the sheet presentation only — the wide Menu presentation has no scrim,
        drag or cancel row, and clicking outside always closes it.'
    cancelLabel:
      type: string
      description: Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`.
  events:
    onAction:
      description: An action was chosen; receives its `id`. The consumer performs
        it and closes.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
      payload:
      - name: id
        type: string
        description: The id of the chosen action.
      fires:
      - user
      timing:
        phase: request
    onClose:
      description: 'Dismissed without choosing: reason `escape`, `scrim`, `cancel`,
        or `drag`.'
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
        - scrim
        - cancel
        - drag
      reasons:
        escape: Escape pressed while open
        scrim: the scrim was clicked
        cancel: the cancel action was chosen
        drag: the sheet was dragged past the dismiss threshold
      fires:
      - user
      timing:
        phase: request
  keyboard:
  - keys:
    - Escape
    action: Closes without choosing.
    from: inside
    expect: closes
  - keys:
    - ArrowDown
    action: Moves focus to the next action.
    from: first
    expect: focus-next
  - keys:
    - ArrowDown
    action: From the last action wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - ArrowUp
    action: From the first action wraps to the last.
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Home
    action: First action.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last action.
    from: first
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: 'Fires onAction for the focused action (nothing when it is disabled);
      the sheet does not close itself — the Keyboard story''s consumer closes on onAction,
      which is the close `expect: closes` observes. Implement the key as activation
      only: no close handler of the sheet''s own.'
    when: focus on an action
    from: first
    expect: closes
  - keys:
    - Tab
    action: 'Closes and moves focus on (a menu is not a tab stop container). No Tab
      handler is needed: the roving tabindex leaves one stop and the outside-close
      rule does the rest, which is why this rule is manual rather than asserted.'
    when: wide-screen menu presentation
    from: first
    expect: manual
  styles:
    scrim:
      token: color.overlay.scrim
      part: scrim
      locked: false
    surface:
      token: color.overlay.surface
      part: surface
      locked: true
    shadow:
      token: shadow.overlay
      part: surface
      locked: false
    radius:
      token: radius.lg
      part: surface
      description: Top corners only on the sheet.
      locked: false
    itemPaddingBlock:
      token: space.sm
      part: item
      locked: false
    itemPaddingInline:
      token: layout.inset.md
      part: item
      description: Inline padding of the rows, and also of the header and the cancel
        row, which have no inline binding of their own.
      locked: false
    itemGap:
      token: layout.gap.normal
      part: item
      description: 'Between icon and label. Rows have no gap between them: their rhythm
        comes from itemPaddingBlock.'
      locked: false
    headerPaddingBlock:
      token: space.sm
      part: header
      description: 'Vertical padding of the header (handle + heading) and of the cancel
        row; their inline padding is itemPaddingInline. When no header is rendered
        (not dismissible and no heading) nothing compensates for it: the first row''s
        own itemPaddingBlock is the top spacing.'
      locked: false
    headerGap:
      token: layout.gap.tight
      part: header
      description: Between the handle and the heading.
      locked: false
    handle:
      token: color.foreground.muted
      part: handle
      description: A pill (space.1 tall, space.10 wide) centered in the header, decorative
        and hidden from assistive technology, as BottomSheet.
      locked: true
    handleHeight:
      token: space.1
      part: handle
      locked: false
    handleWidth:
      token: space.10
      part: handle
      locked: false
    handleRadius:
      token: radius.full
      part: handle
      locked: false
    itemHover:
      token: color.background.subtle
      part: item
      state: hover
      description: 'Paint only: hovering a row does not move focus, which stays on
        the roving item. React Native has no hover on touch, so the pressed state
        paints it too (react-native-web also gets hover in/out). The paint change
        has no binding of its own: on web and Lit it transitions over motion.duration.fast
        with motion.easing.standard, removed under reduced motion.'
      locked: true
    itemColor:
      token: color.foreground
      part: item
      locked: true
    itemDangerColor:
      token: color.foreground.danger
      part: item
      locked: true
    titleColor:
      token: color.foreground.muted
      part: heading
      locked: true
      description: Realized by the composed heading Text's tone="muted"; Text owns
        its color, so this is not overridable.
    titleSize:
      token: font.size.sm
      part: heading
      description: 'The composed heading Text''s size="sm", forwarded to its fontSize
        override; no host hook of its own. The forward always reaches Text with ActionSheet''s
        resolved value: on web and Lit through Text''s CSS hook (`--ds-text-font-size`)
        set to `--ds-action-sheet-title-size` in the sheet''s stylesheet, with `overrides.fontSize`
        passed only when the caller set this override, so consumer CSS on the sheet
        hook still works; on rn the resolved value (the default token or the override)
        is always passed in Text''s `overrides`. Text sets that same hook on that
        same element from its own size rule, so the sheet''s declaration has to out-specify
        it and must target the composed Text node from the sheet''s stylesheet: on
        web `data-part="heading"` goes through Text''s rest spread and is selected
        with a two-class descendant selector, on Lit the outer-tree rule `.heading
        ds-text` beats Text''s own `:host([size])`.'
      locked: false
    fontFamily:
      token: font.family.body
      part: item
      description: Applied to each row (not the list) and forwarded to the composed
        heading Text as an override, since Text always sets its own family; delivered
        the way titleSize describes.
      locked: false
    fontSize:
      token: font.size.md
      part: item
      locked: false
    itemIconSize:
      token: font.size.md
      part: itemIcon
      description: Size of the row glyph, forwarded to the composed Icon as its `size`
        override so the glyph tracks the row's type instead of keeping Icon's own
        default; delivered the way titleSize describes.
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: item
      description: Applied to each row and forwarded to the composed heading Text
        as an override, as fontFamily is (delivered the way titleSize describes).
      locked: false
    divider:
      token: color.border
      part: divider
      description: 'Two dividers, two rules. The danger-group divider is drawn only
        when there are both default and danger actions; it sits inside the menu and
        is exposed as role="separator" (rn: a View with role="separator" among the
        rows). The cancel divider sits above the cancel row whenever that row is rendered,
        outside the menu; it is decorative and hidden from assistive technology (aria-hidden;
        rn: importantForAccessibility="no-hide-descendants" and accessibilityElementsHidden).
        Both carry the one `divider` part name; where a test has to address one of
        them they are in DOM order, the danger divider first and the cancel divider
        last.'
      locked: false
    dividerWidth:
      token: border.width.thin
      part: divider
      locked: false
    minTarget:
      token: size.target.comfortable
      locked: true
    maxWidth:
      token: layout.maxWidth.prose
      locked: true
      description: Above this width, present as a Menu anchored to the opener; the
        comparison is (width > token), so exactly the token width is the sheet (React
        Native has no wide presentation; see its note). The breakpoint is read from
        the theme token, not per instance. When the token cannot be resolved (no theme
        stylesheet yet, or jsdom) the sheet presentation is used; the comparison is
        retried while the document is still loading, so a late stylesheet corrects
        the presentation.
    layer:
      token: layer.sheet
      part: surface
      description: 'Stacking order. It has no effect inside the browser top layer
        or a native Modal window; it applies to the non-top-layer fallback (position:
        fixed) and the rn anchor view. On web and Lit it is written on the <dialog>
        itself rather than the surface: inside the top layer the surface cannot honour
        it, and the <dialog> is the element the fallback positions.'
      locked: false
    enter:
      token: motion.duration.base
      part: surface
      description: Slide up from the bottom edge with motion.easing.standard, the
        scrim fading with the same duration and easing; instant under reduced motion.
        A sheet that mounts already `open` plays it too, as BottomSheet does.
      locked: false
    exit:
      token: motion.duration.fast
      part: surface
      description: 'Slide down with motion.easing.exit, the scrim fading with the
        same duration and easing. A below-threshold drag release springs back with
        this duration and motion.easing.standard, instant under reduced motion. One
        duration hook serves both; the two easings are fixed tokens chosen per case,
        with no hooks of their own. After a dismissing release the surface holds the
        released offset until the consumer''s next render: `open` false plays this
        exit from there; `open` still true springs back (motion.easing.standard over
        this duration), and an interrupted enter animation is finished by that spring-back.'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  constants:
    dismissDistance:
      description: Fraction of the sheet height a downward drag must pass for release
        to dismiss it rather than spring back. No token expresses a ratio, so it stays
        a documented module constant marked `literal-ok`, the same value as BottomSheet.
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: 'Drag speed at release that dismisses the sheet whatever the distance
        travelled. Measured exactly as BottomSheet: between the last two move samples
        before release, from the event timestamps (web and Lit `event.timeStamp`,
        rn `nativeEvent.timestamp`, not PanResponder''s averaged `gestureState.vy`);
        only downward speed counts. A release with fewer than two move samples has
        no slope to measure and counts as 0, so only dismissDistance can dismiss it.
        No token expresses px/ms, so it stays a documented module constant marked
        `literal-ok`.'
      value: 1.5
      unit: px/ms
    dragSlop:
      description: Downward distance a pointer must move on the handle or header before
        the drag claims it, as BottomSheet; a shorter press is not a drag and nothing
        fires. The drag offset is measured from where the slop was crossed, so the
        surface does not jump. On web and Lit the length is read from the resolved
        custom property at gesture start and converted to px (rem × root font size);
        an unresolvable value is 0, as BottomSheet.
      token: space.1
      unit: px
  copy:
    cancelLabel: Cancel
    defaultLabel: Actions
  overlay:
    layer: sheet
    open: open
    closeEvent: onClose
    dismiss:
    - escape
    - scrim
    - close-button
    - swipe
    modal: true
  a11y:
    role: menu
    requires:
    - accessible-name
    - focus-trap
    - focus-restore
    - escape-dismiss
    - inert-background
    - arrow-navigation
    - roving-tabindex
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-44px
    - gesture-alternative
    contrast:
    - foreground: color.foreground
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.danger
      background: color.overlay.surface
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: dialog
      attributes:
      - aria-modal
      - aria-label
      - role=menu
      - role=menuitem
      notes: 'Below maxWidth: a native <dialog> at the bottom edge (as BottomSheet)
        containing a <div role="menu" aria-label> of <button role="menuitem"> rows
        plus a separate Cancel <ds-button>. Above maxWidth: renders Menu with its
        `anchor` prop set to a ref of the element that was focused when `open` became
        true (document.body when nothing had focus), with `open` controlled by the
        sheet; Menu then renders no trigger and returns focus to the opener itself.
        `container?: HTMLElement` (default document.body) is the portal target — a
        platform prop every portaled overlay accepts, not a schema prop, and it is
        forwarded to the wide Menu too. Roving tabindex over the items; first enabled
        item focused on open. The forwarded ref is the sheet presentation''s <dialog>,
        null while closed; in the wide presentation there is no equivalent node and
        the ref stays null. It is typed as the element (Ref<HTMLDialogElement>) and
        is null only at runtime — the null is not in the ref''s value type. A part
        realized by a composed Button lives on an overlay-owned wrapper: the Cancel
        row element carries `data-part="cancelButton"` and wraps the Button, and `itemIcon`
        is a span wrapping Icon. In the wide presentation Menu owns every part and
        its own hooks; no ActionSheet `data-part` values appear. The inert background
        is showModal()''s guarantee: where showModal() does not exist (jsdom), or
        where it exists but throws (an already-open or detached dialog), the `open`-attribute
        fallback exists only so tests can render, and makes nothing inert; it is not
        a supported browser path. Catch the failure rather than letting it unmount
        the sheet.'
    lit:
      tag: ds-action-sheet
      reflect:
      - open
      notes: '`actions` is a property. Composed `action` (detail { id }) and `close`
        (detail { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet;
        the wide presentation renders <ds-menu> with its `anchor` property set to
        the opener (document.body when nothing had focus), so it renders no trigger,
        as on web. The breakpoint media query is built from the theme token (maxWidth
        is locked). Lit exposes no ref-like property (no `dialog` getter); the web
        ref sentence is web-only. As on web, a part realized by a composed component
        lives on an overlay-owned wrapper carrying `data-part`: `[data-part="cancelButton"]`
        is the row wrapping the <ds-button>, `itemIcon` is a span wrapping <ds-icon>,
        and the heading is a wrapper around <ds-text> (ds-* hosts carry no data-part
        of their own). The heading is named by `aria-label` rather than an id reference,
        since ids do not cross the shadow root.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      - accessibilityViewIsModal
      notes: 'A native Modal sheet: a list View with accessibilityRole="menu" containing
        Pressable rows with accessibilityRole="menuitem" and a separate Cancel Button,
        drag-to-dismiss on the header as BottomSheet. iOS''s ActionSheetIOS is not
        used, so the look matches the theme on both platforms. There is no wide presentation
        on native: Menu renders its own trigger and cannot be anchored to an external
        element, so tablets above maxWidth get the sheet too and `maxWidth` has no
        effect here. Rooted in a native Modal, the sheet exposes no ref; callers ref
        their opener. That is also why `focus-restore` has no native implementation:
        nothing can hand FocusScope the opener, so `restoreFocus` no-ops and accessibility
        focus falls back to the screen behind the Modal when it unmounts — the accessible
        alternative is that the opener is still the first thing behind the sheet,
        and a caller who needs it exact moves focus itself in its `onClose`. The root
        testID `ActionSheet` is on the surface (there is no separate `ActionSheet.surface`),
        which carries accessibilityViewIsModal; the `role="menu"` and the accessible
        name sit on the `list` View, as on web, so the heading and the Cancel row
        are outside the menu; a part realized by a composed component sits in a wrapping
        View with `testID="ActionSheet.<part>"` (the Cancel Button in `ActionSheet.cancelButton`).
        After the enter transition, accessibility focus moves to the first enabled
        row in display order (the default group, then danger). The list uses the RN
        >= 0.74 `role="menu"` prop and the accessible name; the surface carries accessibilityViewIsModal;
        rows are `role="menuitem"`. `accessibilityViewIsModal` is a View prop set
        on the surface View; the Modal itself takes visible, transparent and onRequestClose.
        The heading Text gets tone="muted" and size="sm" only: `element: p` is web
        and Lit only, since rn Text has no element prop. Pressable has no key events,
        so there are no arrow keys, no Home/End and no roving tabindex; each row is
        its own accessibility focus stop reached by swipe, and Enter/Space are the
        platform''s own activation.'
    swiftui:
      element: confirmationDialog
      props:
      - .confirmationDialog
      - Button
      - role=destructive
      - role=cancel
      - titleVisibility
      notes: '`.confirmationDialog(title, isPresented:, titleVisibility: .visible)`
        with one `Button` per action (`destructive` via `role: .destructive`, cancel
        via `role: .cancel` from copy) — the system action sheet is the pattern users
        expect and VoiceOver handles it natively; the doc''s surface bindings are
        no-ops here (the gallery notes it), `description` becomes the message. `onAction`
        with the action id, `onClose` on dismissal.'
  behavior:
  - name: choosing-an-action-fires-on-action
    description: A row reports the chosen action; the consumer performs it and closes.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
      - id: delete
        label: Delete photo
        tone: danger
    when:
      click: item
    then:
    - event: onAction
  - name: the-cancel-row-fires-on-close
    description: The explicit Cancel row is a dismissal, not a choice, so onAction
      stays silent.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    when:
      click: cancelButton
    then:
    - event: onClose
    - event: onAction
      fired: false
  - name: non-dismissible-still-reports-escape
    description: As in Dialog, Escape reports through onClose even when `dismissible`
      is false.
    given:
      open: true
      heading: Photo.jpg
      dismissible: false
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    when:
      key: Escape
    then:
    - event: onClose
    platforms:
    - web
    - lit
  - name: the-cancel-row-is-named-from-copy
    description: With no cancelLabel the cancel row falls back to copy.cancelLabel.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    then:
    - copy: cancelLabel
  - name: the-list-is-a-menu
    description: The actions are a menu of menuitems (APG menu button), not a list
      of buttons.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
      - id: rename
        label: Rename
    then:
    - role: menu
  - name: closed-sheet-renders-nothing
    given:
      open: false
      actions:
      - id: share
        label: Share
    then:
    - renders: false
  examples:
  - name: photo-actions
    description: Contextual actions on an item, with the destructive one last.
    given:
      open: true
      heading: Photo.jpg
      actions:
      - id: share
        label: Share
        icon: external
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
      - id: delete
        label: Delete photo
        icon: danger
        tone: danger
  - name: unnamed-sheet
    description: A sheet with no heading, named by copy.defaultLabel for assistive
      technology.
    given:
      open: true
      actions:
      - id: copy
        label: Copy link
      - id: open
        label: Open in new tab
  - name: with-an-unavailable-action
    description: An action that is shown but cannot be used here, announced as disabled
      rather than hidden.
    given:
      open: true
      heading: Invoice 4821
      cancelLabel: Not now
      actions:
      - id: download
        label: Download
      - id: void
        label: Void invoice
        tone: danger
        disabled: true
```

## Events

- `onAction`: emit `action`
  - payload, the keys of `CustomEvent.detail`: `id: string`
  - fires on: user
  - timing: request
- `onClose`: emit `close`
  - payload, the keys of `CustomEvent.detail`: `reason: 'escape' | 'scrim' | 'cancel' | 'drag'`
  - reasons: `escape` (Escape pressed while open); `scrim` (the scrim was clicked); `cancel` (the cancel action was chosen); `drag` (the sheet was dragged past the dismiss threshold)
  - fires on: user
  - timing: request

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onClose` (emit `close`); drives state `open`

## Parts and slots

- `scrim`: element
- `surface`: element
- `focusScope`: component `FocusScope`; props `trapped` = true, `restoreFocus` = true, `autoFocus` = "none", `active` ← prop `open`
- `handle`: element
- `header`: element
- `heading`: component `Text`; props `element` = "p", `tone` = "muted", `size` = "sm"; forwards `fontFamily` → `overrides.fontFamily`, `titleSize` → `overrides.fontSize`, `lineHeight` → `overrides.lineHeight`
- `list`: element
- `item`: element
- `itemIcon`: component `Icon`
- `divider`: element
- `cancelButton`: component `Button`; props `variant` = "secondary"

## Style bindings

- `scrim`: token `color.overlay.scrim`; part `scrim`
- `surface`: token `color.overlay.surface`; part `surface`; locked
- `shadow`: token `shadow.overlay`; part `surface`
- `radius`: token `radius.lg`; part `surface`
- `itemPaddingBlock`: token `space.sm`; part `item`
- `itemPaddingInline`: token `layout.inset.md`; part `item`
- `itemGap`: token `layout.gap.normal`; part `item`
- `headerPaddingBlock`: token `space.sm`; part `header`
- `headerGap`: token `layout.gap.tight`; part `header`
- `handle`: token `color.foreground.muted`; part `handle`; locked
- `handleHeight`: token `space.1`; part `handle`
- `handleWidth`: token `space.10`; part `handle`
- `handleRadius`: token `radius.full`; part `handle`
- `itemHover`: token `color.background.subtle`; part `item`; state `hover`; locked
- `itemColor`: token `color.foreground`; part `item`; locked
- `itemDangerColor`: token `color.foreground.danger`; part `item`; locked
- `titleColor`: token `color.foreground.muted`; part `heading`; locked
- `titleSize`: token `font.size.sm`; part `heading`
- `fontFamily`: token `font.family.body`; part `item`
- `fontSize`: token `font.size.md`; part `item`
- `itemIconSize`: token `font.size.md`; part `itemIcon`
- `lineHeight`: token `font.lineHeight.normal`; part `item`
- `divider`: token `color.border`; part `divider`
- `dividerWidth`: token `border.width.thin`; part `divider`
- `layer`: token `layer.sheet`; part `surface`
- `enter`: token `motion.duration.base`; part `surface`
- `exit`: token `motion.duration.fast`; part `surface`

## Keyboard

- `Escape` (Closes without choosing.): expect closes
- `ArrowDown` (Moves focus to the next action.): expect focus-next
- `ArrowDown` (From the last action wraps to the first.): expect focus-wraps-to-first
- `ArrowUp` (From the first action wraps to the last.): expect focus-wraps-to-last
- `Home` (First action.): expect focus-first
- `End` (Last action.): expect focus-last
- `Enter`, ` ` (Fires onAction for the focused action (nothing when it is disabled); the sheet does not close itself — the Keyboard story's consumer closes on onAction, which is the close `expect: closes` observes. Implement the key as activation only: no close handler of the sheet's own.): expect closes
- `Tab` (Closes and moves focus on (a menu is not a tab stop container). No Tab handler is needed: the roving tabindex leaves one stop and the outside-close rule does the rest, which is why this rule is manual rather than asserted.): expect manual

## Form and overlay

```yaml
overlay:
  layer: sheet
  open: open
  closeEvent: onClose
  dismiss:
  - escape
  - scrim
  - close-button
  - swipe
  modal: true
```

`overlay.closeEvent` emits `close`.

## Constants and examples

- constant `dismissDistance`: 0.25 ratio
- constant `dismissVelocity`: 1.5 px/ms
- constant `dragSlop`: `var(--space-1)` (`space.1`) px
- example `photo-actions`, story `PhotoActions`: given `open: true`, `heading: "Photo.jpg"`, `actions: [{"id":"share","label":"Share","icon":"external"},{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"id":"delete","label":"Delete photo","icon":"danger","tone":"danger"}]`; Contextual actions on an item, with the destructive one last.
- example `unnamed-sheet`, story `UnnamedSheet`: given `open: true`, `actions: [{"id":"copy","label":"Copy link"},{"id":"open","label":"Open in new tab"}]`; A sheet with no heading, named by copy.defaultLabel for assistive technology.
- example `with-an-unavailable-action`, story `WithAnUnavailableAction`: given `open: true`, `heading: "Invoice 4821"`, `cancelLabel: "Not now"`, `actions: [{"id":"download","label":"Download"},{"id":"void","label":"Void invoice","tone":"danger","disabled":true}]`; An action that is shown but cannot be used here, announced as disabled rather than hidden.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored, but they still declare their hook on `:host`: `locked` closes the override API, not the styling hook, and the CSS escape hatch above is the only way a locked binding can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `scrim`, `shadow`, `radius`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `headerPaddingBlock`, `headerGap`, `handleHeight`, `handleWidth`, `handleRadius`, `titleSize`, `fontFamily`, `fontSize`, `itemIconSize`, `lineHeight`, `divider`, `dividerWidth`, `layer`, `enter`, `exit`
Locked (accessibility-bearing, never overridable): `surface`, `handle`, `itemHover`, `itemColor`, `itemDangerColor`, `titleColor`, `minTarget`, `maxWidth`, `focusRing`, `focusRingWidth`

## Behavior scenarios (9)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: choosing-an-action-fires-on-action
  description: A row reports the chosen action; the consumer performs it and closes.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
    - id: delete
      label: Delete photo
      tone: danger
  when:
    click: item
  then:
  - event: onAction
- name: the-cancel-row-fires-on-close
  description: The explicit Cancel row is a dismissal, not a choice, so onAction stays
    silent.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  when:
    click: cancelButton
  then:
  - event: onClose
  - event: onAction
    fired: false
- name: non-dismissible-still-reports-escape
  description: As in Dialog, Escape reports through onClose even when `dismissible`
    is false.
  given:
    open: true
    heading: Photo.jpg
    dismissible: false
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  when:
    key: Escape
  then:
  - event: onClose
  platforms:
  - web
  - lit
- name: the-cancel-row-is-named-from-copy
  description: With no cancelLabel the cancel row falls back to copy.cancelLabel.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  then:
  - copy: cancelLabel
- name: the-list-is-a-menu
  description: The actions are a menu of menuitems (APG menu button), not a list of
    buttons.
  given:
    open: true
    heading: Photo.jpg
    actions:
    - id: share
      label: Share
    - id: rename
      label: Rename
  then:
  - role: menu
- name: closed-sheet-renders-nothing
  given:
    open: false
    actions:
    - id: share
      label: Share
  then:
  - renders: false
- name: renders
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
tag: ds-action-sheet
reflect:
- open
notes: '`actions` is a property. Composed `action` (detail { id }) and `close` (detail
  { reason }) events. Presentation switches on matchMedia like ds-bottom-sheet; the
  wide presentation renders <ds-menu> with its `anchor` property set to the opener
  (document.body when nothing had focus), so it renders no trigger, as on web. The
  breakpoint media query is built from the theme token (maxWidth is locked). Lit exposes
  no ref-like property (no `dialog` getter); the web ref sentence is web-only. As
  on web, a part realized by a composed component lives on an overlay-owned wrapper
  carrying `data-part`: `[data-part="cancelButton"]` is the row wrapping the <ds-button>,
  `itemIcon` is a span wrapping <ds-icon>, and the heading is a wrapper around <ds-text>
  (ds-* hosts carry no data-part of their own). The heading is named by `aria-label`
  rather than an id reference, since ids do not cross the shadow root.'
```

## Guidance

## Overview

An action sheet answers "what can I do with this?" — the long-press or overflow menu of mobile. It lists a handful of verbs, groups the dangerous one at the bottom, and adds an explicit Cancel because thumbs miss. On wide screens the same list is a Menu next to what was clicked.

## When to use

Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits without scrolling; more than eight actions means the item needs its own screen. Put destructive actions last with `tone: danger`.

## When not to use

Do not use it for navigation (Menu in a nav Landmark, or Links), for settings with state (a screen of Switches), for choosing a value (Select or RadioGroup in a BottomSheet), or for confirming — an ActionSheet's danger row opens an AlertDialog, it does not itself confirm. Do not put forms in it.

## Behavior

Opening presents the list with focus on the first enabled action; arrow keys move between actions, Enter or Space chooses and fires `onAction(id)`, Escape, the scrim, the Cancel row, or a drag close it with `onClose`. Disabled actions are shown, skipped by arrow navigation, and announced as disabled. On wide screens the sheet becomes a Menu anchored to the opener: same actions, same events, no Cancel row (clicking outside closes). Focus returns to the opener on close in both presentations. `open` is controlled only; there is no uncontrolled mode. On phones the sheet has BottomSheet's handle and header, and the drag-to-dismiss gesture lives on them (the same 25% / 1.5 px/ms rule, the same `dragSlop`): a press on the header or handle becomes a drag only once it moves past `dragSlop`, so a tap is not a drag and nothing fires. After a dismissing release the sheet holds the released offset until the consumer's next render, as the `exit` binding describes. When `open` becomes false, the FocusScope is inactive from that moment (`active` follows `open`), so a mounted scope never pulls focus back during the exit, and the restore is attempted at the start of the exit; under `showModal()` the inert background refuses focus until `close()`, so on web and Lit it actually lands when the scope unmounts at the end of the exit — either moment satisfies the contract. React Native has no path for it at all: the sheet exposes no opener ref, so `restoreFocus` no-ops there (see its platform note). The sheet sizes to its content up to BottomSheet's `height: content` cap (90% of the viewport); the `list` is the scroll region, so the header and the Cancel row stay pinned while the actions scroll between them. In the sheet, the FocusScope traps Tab between the menu's single tab stop and the Cancel row (with `dismissible` false there is no Cancel row, so Tab stays on the menu). The `overlay.dismiss` values are the shared category vocabulary; the event reports its own reasons: `close-button` is the Cancel row, reported as `cancel`, and `swipe` is the drag, reported as `drag`.

Above the breakpoint it renders Menu through Menu's `anchor`, set to the element that was focused when `open` became true. That opener is captured exactly once, the moment `open` turns true, and reused for the whole of that opening — a presentation switch while open reuses it rather than re-reading focus, which by then is inside the sheet. It maps Menu's close reasons to its own: `escape` → escape, `outside`, `tab-out` and `focus-out` → scrim, `action` → nothing. The one exception is the `focus-out` Menu raises when the window itself loses focus: the user made no dismissal, so it reports nothing rather than a scrim tap. A close that accompanies a chosen action never fires `onClose` — `onAction` is the only event for a choice. Menu guarantees the order: `onOpenChange(false, 'action')` fires synchronously before `onAction`, in the same task. So ActionSheet needs no delay: the `action` reason (or `onAction`, whichever it sees first) marks the current opening as chosen, and every mapped close after it, including a later `focus-out`, is dropped until `open` next becomes true. Menu events ActionSheet does not have are not re-emitted. Only overridable shared bindings are forwarded, and only when the caller set that override (otherwise Menu keeps its own tokens, including its own layer): shadow, radius, itemPaddingBlock, itemPaddingInline, itemGap, fontFamily, fontSize, lineHeight, layer and enter go to Menu's `overrides`, plus `divider` → Menu's `separator`; the danger group gets a Menu separator under the same rule as the sheet's divider. Bindings locked by an accessibility guarantee (surface, itemHover, itemColor, itemDangerColor, minTarget, focusRing, focusRingWidth) are never forwarded. The rest (scrim, header, handle, title, dividerWidth, exit) have no effect there.

The Default story is open, with the photo-actions example's args. Stories that need the sheet open render through a wrapper that owns `open` (starting true) and sets it false on `onAction` and `onClose`, acting as the consumer; the wrapper first calls the story's own `onAction`/`onClose` args. Only the `Keyboard` story renders a trigger — an overflow Button labelled "More actions", which gives the wide presentation a real anchor; every other story renders none (there is no copy key for one). Example stories read as if they started from blank args: Storybook merges `meta.args` into every story, so each example instead restates every prop its `given` names *and* every prop it relies on being absent (`heading: undefined` for unnamed-sheet), which is the same rendered result. The component declares no enum props — `open` and `dismissible` are booleans — so the notable-state stories are `Closed` and `DismissibleFalse` alongside Default, the three examples and Keyboard. The authored behavior scenarios describe the sheet presentation; the browser keyboard gate loads the `Keyboard` story at a desktop viewport, so what it asserts is the wide Menu presentation's keyboard model, and the sheet's own model is covered by the unit tests. The wide Menu presentation is otherwise Menu's own contract. The accessible name (`heading`, else `copy.defaultLabel`) is on the `role="menu"` list, and the `<dialog>` carries the same `aria-label`; the Cancel row's name is its Button's label.

## Content guidelines

Actions are verbs, one or two words, sentence case ("Rename", "Move to folder"). The title is the item's name, not "Options". Danger actions say what they destroy ("Delete photo"). Cancel is "Cancel".

## Accessibility

The list is a `menu` of `menuitem`s with an accessible name (WCAG 4.1.2, APG menu button). One tab stop; arrows move (roving-tabindex, arrow-navigation). Escape closes and focus returns to the opener (2.4.3). On phones the sheet is modal (inert background, focus trap) and every row meets 44px. The drag gesture is additive to Cancel and Escape (2.5.1). Danger rows are distinguished by color *and* position, never color alone (1.4.1); the row glyph is decorative and hidden from assistive technology (the action shape has no label for it), so the distinction is carried by the label text and the grouping. The heading is both the menu's accessible name and a visible line of text, and the visible copy stays exposed, as web's `<p>` title is — a screen reader may read the title twice, which is accepted rather than hiding it. Contrast is checked for normal, danger and muted text on the surface and for the hover row.

## Platform notes

### Web
Below the breakpoint, reuse BottomSheet's `<dialog>` mechanics with `height: content`, a `<p>` title (muted, small), `<div role="menu" aria-label={heading ?? copy.defaultLabel}>` of `<button role="menuitem" tabindex={roving}>` rows (icon via `<Icon>`, label, `aria-disabled` for disabled), a divider before the danger group, and a separate Cancel `<Button variant="secondary">` under a divider. Above the breakpoint, render `<Menu>` with the same `actions` and `anchor` set to a ref of `document.activeElement` at open time.

### Lit
`<ds-action-sheet open heading="Photo.jpg" .actions=${[...]}>`; shadow `<dialog>` or `<ds-menu>` by `matchMedia`; composed `action` and `close`.

### React Native
`Modal` sheet with `View accessibilityRole="menu"` of `Pressable accessibilityRole="menuitem"` rows (`accessibilityState={{ disabled }}`), a divider and a Cancel `Button`; drag-to-dismiss on the header via `PanResponder`, with the decorative handle pill above the heading; `onRequestClose` → `onClose('escape')`. The sheet is the only presentation on native — see the platform note.

## Related

BottomSheet, Menu, Button, AlertDialog.
