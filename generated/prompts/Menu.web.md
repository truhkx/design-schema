# Generate: Menu for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Menu.tsx` exporting a typed React function component named `Menu`, plus `Menu.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Menu({ ref, …rest }: MenuProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Menu> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Menu.test.tsx`.
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
  name: Menu
  category: overlay
  status: review
  apg: menu-button
  anatomy:
  - trigger
  - popup
  - list
  - group
  - groupLabel
  - item
  - itemIcon
  - itemShortcut
  - separator
  composition:
    trigger: Button
    itemIcon: Icon
  props:
    label:
      type: string
      required: true
      description: The trigger's label and the menu's accessible name ("More actions",
        "Sort by").
      a11y: 'The accessible name of the trigger, and of the menu: in trigger mode
        the popup is named `aria-labelledby` the trigger (which this string names),
        and in `anchor` mode — and on Lit, where an idref cannot reach a slotted trigger
        — it is this string as the popup''s `aria-label`. The two agree as long as
        the trigger keeps a name of its own, which an `iconOnly` Button takes from
        this prop.'
    items:
      type: array
      required: true
      shape: '({ id: string; label: string; icon?: IconName; shortcut?: string; tone?:
        "default" | "danger"; disabled?: boolean } | { group: string; items: MenuItem[]
        } | { separator: true })[]'
      description: 'Actions, optionally grouped with a label or divided by separators.
        Groups render their label as a non-interactive heading row and hold action
        items only — the shape is recursive but a group inside a group is not a shape
        this component draws: a nested group or a separator inside a group is dropped
        without a development warning.'
    triggerVariant:
      type: enum
      values:
      - ghost
      - secondary
      - primary
      default: ghost
      description: Variant of the trigger Button.
    triggerIcon:
      type: enum
      values:
      - ellipsis
      - chevron-down
      - none
      default: chevron-down
      description: 'Trailing icon on the trigger: `ellipsis` for an icon-only overflow
        button (the label becomes the accessible name), `chevron-down` for a labelled
        dropdown, `none`. With `iconOnly` the glyph is passed as the Button''s `leadingIcon`
        (an icon-only Button shows only that); otherwise as its `trailingIcon`.'
    iconOnly:
      type: boolean
      default: false
      description: 'Render the trigger as an icon-only Button using `triggerIcon`;
        `label` is still required. With `triggerIcon: none` there would be nothing
        visible to press, so that pairing warns in development (once), unless `anchor`
        is set (there is no trigger then). It is the only development warning Menu
        issues — no warning for empty items, a missing label or an uncontrolled anchor.'
    placement:
      type: enum
      values:
      - bottom-start
      - bottom-end
      - top-start
      - top-end
      default: bottom-start
      description: Preferred position of the popup relative to the trigger (or `anchor`).
        Only the block side flips (bottom and top swap) when the popup would overflow
        the viewport; `start` and `end` never flip. They resolve against the layout
        direction read from the trigger itself — `getComputedStyle(trigger ?? anchor).direction`
        on web and Lit, I18nManager.isRTL on rn — so a menu inside a right-to-left
        subtree of a left-to-right page resolves against its own trigger, not the
        page (in right-to-left `start` is the right edge). The popup is shifted inline
        instead so it stays `gutter` away from the side edges; when the popup is wider
        than the viewport minus 2 × gutter the two constraints cannot both hold and
        the leading edge wins, clamped to `gutter` on the start side.
    open:
      type: boolean
      description: Controlled open state (the parent flips it from onOpenChange).
        Omit for an uncontrolled menu, which starts closed; there is no defaultOpen.
        A controlled menu hides only when `open` becomes false — a parent that never
        flips it keeps the menu open. Focus on close follows the reason (Behavior);
        a close the menu did not request moves focus to the trigger only when focus
        is inside the popup at that moment.
      controls:
        event: onOpenChange
        state: open
    anchor:
      type: object
      shape: RefObject<HTMLElement | View>
      description: 'Position the popup relative to this element instead of rendering
        a trigger; the trigger part is omitted and `open` must be controlled — an
        uncontrolled `anchor` menu has nothing that can open it, and that pairing
        does not warn (`iconOnly` is Menu''s only development warning). Used by ActionSheet
        above its breakpoint and by context menus. The shape is per platform: web
        a `RefObject<HTMLElement | null>`; Lit an `anchor` property holding the element
        itself (`HTMLElement | undefined`, not an attribute); rn a ref to the host
        View instance (`RefObject<React.ComponentRef<typeof View> | null>`), measured
        with measureInWindow(). The anchor stands in for the trigger: a pointerdown
        on it is not `outside` and focus moving onto it is not `focus-out` (the consumer
        toggles `open` from it), and focus that would return to the trigger returns
        to the element that had focus when the menu opened — when nothing had focus
        (ActionSheet''s wide presentation opens from a fresh render) focus is left
        where it is rather than moved to the anchor, which need not be focusable.
        React Native has no previously-focused-element query, so there accessibility
        focus returns to the anchor View itself, which the consumer must make focusable
        for it to land.'
  events:
    onAction:
      description: An item was chosen; receives its `id`. The menu closes itself first.
      platforms:
        web: onAction
        lit: action
        rn: onAction
        swiftui: onAction
      payload:
      - name: id
        type: string
        description: The id of the chosen item.
      fires:
      - user
    onOpenChange:
      description: 'Fired when the menu opens or closes, with positional arguments
        `(open, reason)` (Lit: detail `{ open, reason }`) — reason: `trigger`, `escape`,
        `outside`, `action` (an item was chosen; fired before onAction), `controlled`,
        `tab-out`, `focus-out`. overlay.dismiss is the shared category vocabulary;
        it maps to reasons as escape → `escape`, outside-press → `outside`, and focus-out
        → `tab-out` (Tab/Shift+Tab) or `focus-out` (any other focus loss, including
        the window losing focus).'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
      payload:
      - name: open
        type: boolean
        description: The new state of the menu.
      - name: reason
        type: enum
        values:
        - trigger
        - escape
        - outside
        - action
        - controlled
        - tab-out
        - focus-out
      reasons:
        trigger: the trigger was activated
        escape: Escape pressed while open
        outside: a pointer press landed outside the menu
        action: an item was chosen
        controlled: the consumer changed the open prop — the menu never raises this
          itself, and changing `open` fires nothing; it exists so a composing component
          can forward its own reason through
        tab-out: Tab or Shift+Tab pressed while open
        focus-out: focus moved outside the menu and trigger by other means, or the
          window lost focus; a window blur and the focusout it causes are one focus
          loss and report once
      fires:
      - user
      - controlled
      timing:
        phase: after-change
        before:
        - onAction
  keyboard:
  - keys:
    - Enter
    - ' '
    - ArrowDown
    action: Opens the menu and focuses the first item (ArrowDown on an already open
      menu just focuses the first item).
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - ArrowUp
    action: Opens the menu and focuses the last item (on an already open menu it just
      focuses the last item).
    when: focus on trigger
    from: trigger
    expect: manual
  - keys:
    - ArrowDown
    action: Moves to the next enabled item.
    when: menu open
    from: first
    expect: focus-next
  - keys:
    - ArrowDown
    action: From the last item wraps to the first.
    when: menu open
    from: last
    expect: focus-wraps-to-first
  - keys:
    - ArrowUp
    action: From the first item wraps to the last.
    when: menu open
    from: first
    expect: focus-wraps-to-last
  - keys:
    - Home
    action: First enabled item.
    when: menu open
    from: inside
    expect: focus-first
  - keys:
    - End
    action: Last enabled item.
    when: menu open
    from: inside
    expect: focus-last
  - keys:
    - Enter
    - ' '
    action: Activates the focused item and closes.
    when: menu open
    from: first
    expect: closes
  - keys:
    - Escape
    action: Closes and returns focus to the trigger; pressed on the trigger while
      the menu is open it also closes (reason `escape`) and focus stays there. The
      key is prevented and its propagation stopped in both places, so a Menu inside
      a Dialog closes only the menu.
    when: menu open
    from: inside
    expect:
    - closes
    - focus-trigger
  - keys:
    - Tab
    - Shift+Tab
    action: 'Closes; Tab moves focus to the tabbable element after the trigger, Shift+Tab
      to the one before it, in document order (the anchor stands in for the trigger
      when there is none). The key is not prevented: the menu sets every item to tabindex
      -1 and moves focus to the trigger, so the browser''s own Tab continues from
      there and a popup a controlled parent still shows holds no tab stop (web and
      Lit alike) — that is a suppression state of its own, not a roving 0 parked somewhere,
      and the next open starts from the first item again. The focusout this parking
      causes is part of the Tab: it reports `tab-out` only, never a second `focus-out`.
      With `anchor`, focus is parked on the anchor when it is focusable; otherwise
      the menu prevents the key and focuses the first tabbable after (Tab) or the
      last before (Shift+Tab) the anchor in document order, excluding its descendants.'
    when: menu open
    from: inside
    expect: closes
  - keys:
    - a-z
    action: Typeahead — moves to the next enabled item whose label starts with the
      typed characters. Any single printable character counts (letters of any script
      and digits, not only a–z), compared case-insensitively; Space stays activation,
      and keys held with Ctrl, Meta or Alt are ignored.
    when: menu open
    from: first
    expect: manual
  styles:
    surface:
      token: color.overlay.surface
      part: popup
      locked: true
    border:
      token: color.border
      part: popup
      locked: false
    borderWidth:
      token: border.width.thin
      part: popup
      description: The popup border, and also the thickness of each separator line.
      locked: false
    shadow:
      token: shadow.overlay
      part: popup
      locked: false
    radius:
      token: radius.md
      part: popup
      locked: false
    popupPadding:
      token: space.1
      part: popup
      description: Inset around the list so item hover backgrounds do not touch the
        border.
      locked: false
    popupOffset:
      token: space.1
      part: popup
      description: Gap between trigger and popup, on the side facing the trigger;
        the flip check includes it, and a flipped popup keeps the same gap on its
        new side. On web and Lit the token length is read in px from the popup's resolved
        hook when the popup opens and repositions (rem × root font size), and an unresolvable
        value is 0 — the popup then sits flush against the trigger rather than at
        a hard-coded fallback; rn uses the resolved theme value.
      locked: false
    typeaheadReset:
      token: motion.duration.loop
      part: popup
      description: How long typed characters accumulate before the typeahead buffer
        clears; read at runtime from the popup. An unresolvable value clears the buffer
        after every keypress, degrading typeahead to single characters rather than
        letting it accumulate forever.
      locked: false
    maxHeight:
      token: layout.maxWidth.prose
      part: popup
      description: 'The popup''s block size never exceeds the viewport height minus
        `gutter` at each edge (2 × gutter), nor this token; beyond that the list scrolls.
        The cap is on the popup itself, so its border and `popupPadding` are inside
        it (rn: the popup View, with the ScrollView inside). The token is a measure,
        not a height: it is reused deliberately so a popup is never taller than a
        comfortable reading measure, which also means retheming `layout.maxWidth.prose`
        moves this cap and `phoneBreakpoint` together.'
      locked: false
    gutter:
      token: layout.gutter
      part: popup
      description: 'Space kept between the popup and each viewport edge: it caps maxHeight
        (viewport height − 2 × gutter), bounds the inline shift, and is kept from
        the block edges too, so a flipped popup anchored to a trigger near the top
        or bottom is clamped rather than sitting against the edge. Read in px the
        same way as popupOffset.'
      locked: false
    minWidth:
      token: space.20
      computed:
        times: 2.5
      part: popup
      description: 'Popup is at least this wide (200px at comfortable density) and
        at least the trigger width. An override replaces the base; the × 2.5 stays
        in the rule. The trigger width is only known at runtime, so it is measured
        when the popup opens and repositions and the popup gets `max(<the × 2.5 rule>,
        <trigger width>px)` — on web and Lit the measurement is published as a platform-private
        custom property (`--ds-menu-trigger-width`, `0px` in `anchor` mode) that the
        `min-inline-size` rule maxes against; it is not an overridable binding and
        is not in the overrides type. With `anchor` there is no trigger-width floor,
        and the anchor''s own width is not one either: the popup falls back to the
        × 2.5 rule. On rn the width is known only from onLayout, so the popup is held
        at opacity 0 until the measurement and the layout have both reported, rather
        than being placed from the floor for one frame and jumping when an `end` placement
        learns its real width.'
      locked: false
    phoneBreakpoint:
      token: layout.maxWidth.prose
      locked: true
      description: 'rn only: a window width at or below this presents as ActionSheet,
        above it as the anchored popup; the breakpoint is read from the theme token,
        not per instance.'
    itemPaddingBlock:
      token: space.sm
      part: item
      description: Also pads the groupLabel row so the label lines up with the items.
      locked: false
    itemPaddingInline:
      token: space.md
      part: item
      description: Also pads the groupLabel row so the label lines up with the items.
      locked: false
    itemGap:
      token: layout.gap.normal
      part: item
      locked: false
    itemRadius:
      token: radius.sm
      part: item
      locked: false
    itemHover:
      token: color.background.subtle
      part: item
      state: hover
      description: Pointer hover and keyboard focus share this highlight, and on rn
        so does press (hover tracked with onHoverIn/onHoverOut).
      locked: true
    itemColor:
      token: color.foreground
      part: item
      locked: true
    itemDangerColor:
      token: color.foreground.danger
      part: item
      locked: true
    groupLabelColor:
      token: color.foreground.muted
      part: groupLabel
      locked: true
    groupLabelSize:
      token: font.size.xs
      part: groupLabel
      locked: false
    groupLabelWeight:
      token: font.weight.semibold
      part: groupLabel
      locked: false
    shortcutColor:
      token: color.foreground.muted
      part: itemShortcut
      locked: true
    shortcutSize:
      token: font.size.sm
      part: itemShortcut
      locked: false
    separator:
      token: color.border
      part: separator
      locked: false
    separatorMargin:
      token: space.1
      part: separator
      locked: false
    fontFamily:
      token: font.family.body
      part: popup
      locked: false
    fontSize:
      token: font.size.md
      part: popup
      locked: false
    lineHeight:
      token: font.lineHeight.normal
      part: popup
      locked: false
    minTarget:
      token: size.target.min
      part: item
      locked: true
    layer:
      token: layer.dropdown
      part: popup
      description: 'z-index of the position: fixed popup (web portal, Lit fallback);
        it has no effect inside the browser top layer (Lit popover="manual") or a
        native Modal window, where it is still written on the popup for parity rather
        than dropped.'
      locked: false
    enter:
      token: motion.duration.fast
      part: popup
      description: 'Fade and an enterDistance slide from the side facing the trigger
        after any flip, with motion.easing.standard; instant under reduced motion.
        A popup placed below starts `enterDistance` above its resting place and settles
        down into it; one placed above starts that far below and rises. Popup only:
        the item highlight changes instantly — `itemHover` carries `state: hover`
        but is exempt from the transition every other hover binding gets, because
        the highlight also tracks keyboard focus.'
      locked: false
    enterDistance:
      token: space.1
      part: popup
      description: How far the popup slides in on enter; separate from popupOffset,
        so overriding the gap does not change the slide.
      locked: false
    focusRing:
      token: color.border.focus
      part: item
      locked: true
    focusRingWidth:
      token: border.width.focus
      part: item
      locked: true
  overlay:
    layer: popover
    anchor: trigger
    placement: placement
    collision: flip
    open: open
    closeEvent: onOpenChange
    dismiss:
    - escape
    - outside-press
    - focus-out
    modal: false
  a11y:
    role: menu
    requires:
    - accessible-name
    - expanded-state
    - arrow-navigation
    - roving-tabindex
    - escape-dismiss
    - focus-restore
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - reduced-motion
    - target-24px
    - no-hover-only
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
    - foreground: color.foreground.danger
      background: color.background.subtle
      level: AA
    - foreground: color.foreground.muted
      background: color.overlay.surface
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - aria-haspopup=menu
      - aria-expanded
      - aria-controls
      - role=menu
      - role=menuitem
      - role=group
      - role=separator
      - aria-labelledby
      - tabindex
      notes: 'Trigger is the system Button with aria-haspopup="menu", aria-expanded
        and aria-controls (aria-controls is set only while open, so it never names
        a popup that is not in the DOM). The popup is rendered through a portal with
        position: fixed, placed from the trigger''s getBoundingClientRect() and flipped
        on overflow; z-index layer.dropdown. Outside click (pointerdown outside popup
        and trigger) closes. Items are <div role="menuitem" tabindex="-1"> with one
        roving tabindex; the menu uses real focus (not aria-activedescendant) so screen
        readers follow. Keyboard-focused and hovered items share the itemHover style;
        hover moves the roving focus so the two never diverge. Shortcuts are display-only
        and aria-hidden — the menu does not bind them, and it does not put them in
        `aria-keyshortcuts` either, since a display string like "⌘S" is not that attribute''s
        syntax. One element carries `data-part="popup"` and the `role="menu"` list:
        the popup and list parts are the same node, as the markup here shows. Disabled
        items stay in the DOM with `aria-disabled="true"` and are skipped by the arrows,
        Home/End and typeahead. `container?: HTMLElement` (default document.body)
        is the portal target — a platform prop, not a schema prop. Page scroll is
        not locked: a menu is not modal, and the popup repositions on scroll. Clicking
        the trigger while the menu is open closes it. The root is a wrapper `<div
        data-ds="Menu">` in both modes: it holds the trigger, or nothing when `anchor`
        is given. Button writes its own `data-part`, so the trigger part lives on
        an overlay-owned `<span data-part="trigger">` inside the root, wrapping the
        Button; aria-haspopup, aria-expanded and aria-controls still reach the Button''s
        element. The popup is portaled out of the root, so the override hooks and
        inline overrides are applied on the popup (`data-part="popup"`), not on the
        root. The forwarded ref resolves to the popup element and is null while closed;
        pass-through div props (id, data-*, event handlers) go on the root wrapper,
        not the popup. A `window` blur while open closes with reason `focus-out`.'
    lit:
      tag: ds-menu
      reflect:
      - open
      - placement
      - icon-only
      notes: 'Uses the Popover API (popover="manual", showPopover()) for top-layer
        rendering without a portal, with a position: fixed fallback; anchor positioning
        is computed from the trigger rect. `items` is a property. Composed `action`
        (detail { id }) and `open-change` (detail { open, reason }, the same payload
        as every other platform — the reason is not dropped here). The trigger is
        a <ds-button> in the shadow root; focus delegation lands on it. The menu surface
        is named with aria-label from the trigger''s text (or the `label` property
        when given): aria-labelledby cannot reach a slotted trigger from the shadow
        root. `<ds-button>` forwards only `expanded` to its inner <button>, and an
        IDREF cannot cross its shadow root, so on Lit the trigger exposes aria-expanded
        only — aria-haspopup and aria-controls are waived here; the popup''s role="menu"
        and its aria-label carry the relationship. As on web, one element is both
        parts: `role="menu"` with `data-part="popup"` and `part="popup list"`. That
        is the only `part` attribute, and deliberately so: trigger, group, groupLabel,
        item, itemIcon, itemShortcut and separator carry `data-part` only, because
        Menu''s internals are styled through the override hooks rather than `::part()`.
        The trigger part is an overlay-owned wrapper element carrying `data-part="trigger"`
        around the ds-button. `anchor` is a property (the element), not an attribute,
        handed over with the `ref` directive or set imperatively after first render.
        `open` reflects the controlled property only: an uncontrolled menu keeps its
        state internally and never writes the attribute, so `ds-menu[open]` matches
        controlled menus alone — reflecting the internal state would write back into
        the property and turn every menu controlled. Focus leaving the host, or the
        window losing focus, closes with reason `focus-out`.'
    rn:
      element: Modal
      props:
      - visible
      - transparent
      - onRequestClose
      notes: 'Menus on touch are ActionSheets: on phones Menu renders an ActionSheet
        with the same items (flattened, as below); on tablets and react-native-web
        it renders a transparent Modal with an absolutely positioned popup measured
        from the trigger via measureInWindow(). Items are Pressables with accessibilityRole="menuitem";
        the trigger Button carries accessibilityState.expanded. Typeahead and arrow
        keys apply only when a hardware keyboard is present. The popup uses the RN
        >= 0.74 `role="menu"` prop and items `role="menuitem"`; the trigger Button
        receives `expanded` so accessibilityState.expanded is exposed. On phones the
        Menu renders ActionSheet (composition, now that it exists), and the phone/tablet
        split is the `phoneBreakpoint` binding (window width <= layout.maxWidth.prose
        is phone), the same threshold Select and Combobox use; the anchored dropdown
        is the tablet and react-native-web presentation. ActionSheet takes a flat
        action list, so in the phone presentation groups are flattened and their labels,
        the separators and the shortcut hints are dropped — a touch surface has no
        keyboard to hint at, and a heading faked as an inert row would misread. ActionSheet''s
        close reasons map to this component''s: `escape` stays, and `scrim`, `cancel`
        and `drag` all become `outside`. Pressable has no key events, so there are
        no arrows, no Home/End and no typeahead; each item is its own focus stop,
        and `typeaheadReset` has nothing to reset here — it stays in the overrides
        union for cross-platform parity and is simply inert, as `layer` is. The Modal
        takes `statusBarTranslucent` so its coordinate space matches measureInWindow()''s,
        which includes the status bar area; without it the popup is offset by the
        status bar height on Android. Opening cannot tell ArrowUp from Enter on the
        trigger Button, so every open focuses the first enabled item. The list scrolls
        within maxHeight: popup and list are two nodes here — the popup View (`testID="Menu.popup"`,
        role="menu") and a ScrollView inside it (`testID="Menu.list"`). Button writes
        its own testID, so the trigger part is a wrapping View with `testID="Menu.trigger"`,
        which is also the node measured. The transparent Modal cannot honour `modal:
        false`: it intercepts every touch behind it and holds screen-reader focus
        while open, so non-modal here means only that tapping the backdrop closes
        (`outside`) and focus is not trapped (no FocusScope trap, no accessibilityViewIsModal).
        onRequestClose (hardware back, or Escape on a hardware keyboard) closes with
        `escape` and returns accessibility focus to the trigger with AccessibilityInfo.setAccessibilityFocus.
        Native has no Tab key event and no focus-out signal, so `tab-out` and `focus-out`
        never fire on this platform — the backdrop and back are the ways out. Hover
        is tracked with onHoverIn/onHoverOut (Pressable''s style callback reports
        only `pressed`), and hover, focus and press share itemHover. Menu exposes
        no ref on rn. In the phone presentation the ActionSheet gets `heading` = `label`
        (the same accessible name), and Menu itself returns accessibility focus to
        its trigger after either presentation closes — unconditionally, since native
        cannot read where accessibility focus is: the `open` prose''s "only when focus
        is inside the popup" qualifier is web and Lit only. The backdrop Pressable
        is transparent and takes `testID="Menu.backdrop"` (it is not a scrim: a non-modal
        menu has no scrim colour, and color.overlay.scrim is not applied), and it
        is not an anatomy part.'
    swiftui:
      element: Menu
      props:
      - Menu
      - .menuStyle
      - .menuOrder
      - Button
      - Divider
      - .accessibilityLabel
      - .contextMenu
      notes: 'SwiftUI `Menu(label:)` — the system menu is the native pattern, keyboard-navigable
        on iPad, VoiceOver-native, and it takes the theme through `.tint` and `.menuStyle`
        for the trigger only (the popup''s surface is the system''s; the doc''s popup
        bindings are no-ops on iOS, noted in the gallery). Items are `Button`s (destructive
        via `role: .destructive`), groups `Section`s with a header, separators `Divider`;
        disabled items `.disabled(true)` (the system menu skips them, matching the
        doc). `onOpenChange` fires from the label''s press and the menu''s dismissal
        via `.onChange` of a presentation binding on the wrapper. `trigger: contextMenu`
        uses `.contextMenu`.'
  behavior:
  - name: choosing-an-item-reports-the-action-and-the-close
    description: Activating an item closes the menu and fires onAction; onOpenChange
      precedes it with reason action.
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
    when:
      click: item
    then:
    - event: onAction
    - event: onOpenChange
  - name: a-disabled-item-does-nothing
    description: 'Disabled items are visible and announced disabled, and do nothing
      on click; `click: item` presses the first item, which is the disabled one.'
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
        disabled: true
      - id: duplicate
        label: Duplicate
    when:
      click: item
    then:
    - event: onAction
      fired: false
  - name: escape-closes-without-choosing
    description: Escape closes and returns focus to the trigger without activating
      anything (keyboard rule 9).
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
    when:
      key: Escape
    then:
    - event: onAction
      fired: false
    platforms:
    - web
    - lit
  - name: the-popup-is-a-menu
    description: The popup is a menu of menuitems named by the trigger (APG menu button),
      not a list of buttons.
    given:
      open: true
      label: More actions
      items:
      - id: rename
        label: Rename
    then:
    - role: menu
  examples:
  - name: row-overflow
    description: The icon-only overflow button on a row, with the destructive action
      last after a separator.
    given:
      label: More actions
      iconOnly: true
      triggerIcon: ellipsis
      items:
      - id: rename
        label: Rename
      - id: duplicate
        label: Duplicate
      - separator: true
      - id: delete
        label: Delete file
        tone: danger
  - name: sort-by
    description: A labelled dropdown of view options, anchored under a secondary trigger.
    given:
      label: Sort by
      triggerVariant: secondary
      triggerIcon: chevron-down
      items:
      - id: name
        label: Name
      - id: modified
        label: Last modified
      - id: size
        label: Size
  - name: grouped-account-menu
    description: More than about six items, so they are grouped with labels; aligned
      to the end of the trigger.
    given:
      label: Account
      placement: bottom-end
      items:
      - group: Account
        items:
        - id: profile
          label: Profile
        - id: billing
          label: Billing
      - group: Workspace
        items:
        - id: members
          label: Members
        - id: settings
          label: Settings
      - separator: true
      - id: sign-out
        label: Sign out
  - name: with-shortcuts
    description: Display-only shortcut hints beside the items the app binds elsewhere.
    given:
      label: Edit
      items:
      - id: undo
        label: Undo
        shortcut: Ctrl+Z
      - id: redo
        label: Redo
        shortcut: Ctrl+Shift+Z
```

## Events

- `onAction`: emit `onAction`
  - payload, positional, in this order: `id: string`
  - fires on: user
- `onOpenChange`: emit `onOpenChange`
  - payload, positional, in this order: `open: boolean`, `reason: 'trigger' | 'escape' | 'outside' | 'action' | 'controlled' | 'tab-out' | 'focus-out'`
  - reasons: `trigger` (the trigger was activated); `escape` (Escape pressed while open); `outside` (a pointer press landed outside the menu); `action` (an item was chosen); `controlled` (the consumer changed the open prop — the menu never raises this itself, and changing `open` fires nothing; it exists so a composing component can forward its own reason through); `tab-out` (Tab or Shift+Tab pressed while open); `focus-out` (focus moved outside the menu and trigger by other means, or the window lost focus; a window blur and the focusout it causes are one focus loss and report once)
  - fires on: user, controlled
  - timing: after-change, fired before `onAction`

## Controlled state

- `open` is controlled when given, uncontrolled from its initial state when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`

## Style bindings

- `surface`: token `color.overlay.surface`; part `popup`; locked
- `border`: token `color.border`; part `popup`
- `borderWidth`: token `border.width.thin`; part `popup`
- `shadow`: token `shadow.overlay`; part `popup`
- `radius`: token `radius.md`; part `popup`
- `popupPadding`: token `space.1`; part `popup`
- `popupOffset`: token `space.1`; part `popup`
- `typeaheadReset`: token `motion.duration.loop`; part `popup`
- `maxHeight`: token `layout.maxWidth.prose`; part `popup`
- `gutter`: token `layout.gutter`; part `popup`
- `minWidth`: token `space.20`; part `popup`; computed `calc(var(--space-20) * 2.5)`
- `itemPaddingBlock`: token `space.sm`; part `item`
- `itemPaddingInline`: token `space.md`; part `item`
- `itemGap`: token `layout.gap.normal`; part `item`
- `itemRadius`: token `radius.sm`; part `item`
- `itemHover`: token `color.background.subtle`; part `item`; state `hover`; locked
- `itemColor`: token `color.foreground`; part `item`; locked
- `itemDangerColor`: token `color.foreground.danger`; part `item`; locked
- `groupLabelColor`: token `color.foreground.muted`; part `groupLabel`; locked
- `groupLabelSize`: token `font.size.xs`; part `groupLabel`
- `groupLabelWeight`: token `font.weight.semibold`; part `groupLabel`
- `shortcutColor`: token `color.foreground.muted`; part `itemShortcut`; locked
- `shortcutSize`: token `font.size.sm`; part `itemShortcut`
- `separator`: token `color.border`; part `separator`
- `separatorMargin`: token `space.1`; part `separator`
- `fontFamily`: token `font.family.body`; part `popup`
- `fontSize`: token `font.size.md`; part `popup`
- `lineHeight`: token `font.lineHeight.normal`; part `popup`
- `minTarget`: token `size.target.min`; part `item`; locked
- `layer`: token `layer.dropdown`; part `popup`
- `enter`: token `motion.duration.fast`; part `popup`
- `enterDistance`: token `space.1`; part `popup`
- `focusRing`: token `color.border.focus`; part `item`; locked
- `focusRingWidth`: token `border.width.focus`; part `item`; locked

## Keyboard

- `Escape` (Closes and returns focus to the trigger; pressed on the trigger while the menu is open it also closes (reason `escape`) and focus stays there. The key is prevented and its propagation stopped in both places, so a Menu inside a Dialog closes only the menu.): expect closes, then focus-trigger

## Form and overlay

```yaml
overlay:
  layer: popover
  anchor: trigger
  placement: placement
  collision: flip
  open: open
  closeEvent: onOpenChange
  dismiss:
  - escape
  - outside-press
  - focus-out
  modal: false
```

`overlay.closeEvent` emits `onOpenChange`.

## Constants and examples

- example `row-overflow`, story `RowOverflow`: given `label: "More actions"`, `iconOnly: true`, `triggerIcon: "ellipsis"`, `items: [{"id":"rename","label":"Rename"},{"id":"duplicate","label":"Duplicate"},{"separator":true},{"id":"delete","label":"Delete file","tone":"danger"}]`; The icon-only overflow button on a row, with the destructive action last after a separator.
- example `sort-by`, story `SortBy`: given `label: "Sort by"`, `triggerVariant: "secondary"`, `triggerIcon: "chevron-down"`, `items: [{"id":"name","label":"Name"},{"id":"modified","label":"Last modified"},{"id":"size","label":"Size"}]`; A labelled dropdown of view options, anchored under a secondary trigger.
- example `grouped-account-menu`, story `GroupedAccountMenu`: given `label: "Account"`, `placement: "bottom-end"`, `items: [{"group":"Account","items":[{"id":"profile","label":"Profile"},{"id":"billing","label":"Billing"}]},{"group":"Workspace","items":[{"id":"members","label":"Members"},{"id":"settings","label":"Settings"}]},{"separator":true},{"id":"sign-out","label":"Sign out"}]`; More than about six items, so they are grouped with labels; aligned to the end of the trigger.
- example `with-shortcuts`, story `WithShortcuts`: given `label: "Edit"`, `items: [{"id":"undo","label":"Undo","shortcut":"Ctrl+Z"},{"id":"redo","label":"Redo","shortcut":"Ctrl+Shift+Z"}]`; Display-only shortcut hints beside the items the app binds elsewhere.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed, but they still declare their hook: `locked` closes the override API, not the styling hook. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so, and for a locked binding it is the only way it can be re-themed or renamed. A binding forwarded to a composed child's `overrides` is the exception — the child carries it, so the parent declares no hook.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `border`, `borderWidth`, `shadow`, `radius`, `popupPadding`, `popupOffset`, `typeaheadReset`, `maxHeight`, `gutter`, `minWidth`, `itemPaddingBlock`, `itemPaddingInline`, `itemGap`, `itemRadius`, `groupLabelSize`, `groupLabelWeight`, `shortcutSize`, `separator`, `separatorMargin`, `fontFamily`, `fontSize`, `lineHeight`, `layer`, `enter`, `enterDistance`
Locked (accessibility-bearing, never overridable): `surface`, `phoneBreakpoint`, `itemHover`, `itemColor`, `itemDangerColor`, `groupLabelColor`, `shortcutColor`, `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (17)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: choosing-an-item-reports-the-action-and-the-close
  description: Activating an item closes the menu and fires onAction; onOpenChange
    precedes it with reason action.
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
    - id: duplicate
      label: Duplicate
  when:
    click: item
  then:
  - event: onAction
  - event: onOpenChange
- name: a-disabled-item-does-nothing
  description: 'Disabled items are visible and announced disabled, and do nothing
    on click; `click: item` presses the first item, which is the disabled one.'
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
      disabled: true
    - id: duplicate
      label: Duplicate
  when:
    click: item
  then:
  - event: onAction
    fired: false
- name: escape-closes-without-choosing
  description: Escape closes and returns focus to the trigger without activating anything
    (keyboard rule 9).
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
    - id: duplicate
      label: Duplicate
  when:
    key: Escape
  then:
  - event: onAction
    fired: false
  platforms:
  - web
  - lit
- name: the-popup-is-a-menu
  description: The popup is a menu of menuitems named by the trigger (APG menu button),
    not a list of buttons.
  given:
    open: true
    label: More actions
    items:
    - id: rename
      label: Rename
  then:
  - role: menu
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-trigger-variant-ghost
  given:
    triggerVariant: ghost
  then:
  - renders: true
  derived: true
- name: renders-trigger-variant-secondary
  given:
    triggerVariant: secondary
  then:
  - renders: true
  derived: true
- name: renders-trigger-variant-primary
  given:
    triggerVariant: primary
  then:
  - renders: true
  derived: true
- name: renders-trigger-icon-ellipsis
  given:
    triggerIcon: ellipsis
  then:
  - renders: true
  derived: true
- name: renders-trigger-icon-chevron-down
  given:
    triggerIcon: chevron-down
  then:
  - renders: true
  derived: true
- name: renders-trigger-icon-none
  given:
    triggerIcon: none
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-start
  given:
    placement: bottom-start
  then:
  - renders: true
  derived: true
- name: renders-placement-bottom-end
  given:
    placement: bottom-end
  then:
  - renders: true
  derived: true
- name: renders-placement-top-start
  given:
    placement: top-start
  then:
  - renders: true
  derived: true
- name: renders-placement-top-end
  given:
    placement: top-end
  then:
  - renders: true
  derived: true
- name: has-accessible-name
  then:
  - name: true
  derived: true
- name: escape-fires-on-open-change
  given:
    open: true
  when:
    key: Escape
  then:
  - event: onOpenChange
  platforms:
  - lit
  - swiftui
  - web
  derived: true
```

## Platform notes (web)

```yaml
element: div
attributes:
- aria-haspopup=menu
- aria-expanded
- aria-controls
- role=menu
- role=menuitem
- role=group
- role=separator
- aria-labelledby
- tabindex
notes: "Trigger is the system Button with aria-haspopup=\"menu\", aria-expanded and\
  \ aria-controls (aria-controls is set only while open, so it never names a popup\
  \ that is not in the DOM). The popup is rendered through a portal with position:\
  \ fixed, placed from the trigger's getBoundingClientRect() and flipped on overflow;\
  \ z-index layer.dropdown. Outside click (pointerdown outside popup and trigger)\
  \ closes. Items are <div role=\"menuitem\" tabindex=\"-1\"> with one roving tabindex;\
  \ the menu uses real focus (not aria-activedescendant) so screen readers follow.\
  \ Keyboard-focused and hovered items share the itemHover style; hover moves the\
  \ roving focus so the two never diverge. Shortcuts are display-only and aria-hidden\
  \ \u2014 the menu does not bind them, and it does not put them in `aria-keyshortcuts`\
  \ either, since a display string like \"\u2318S\" is not that attribute's syntax.\
  \ One element carries `data-part=\"popup\"` and the `role=\"menu\"` list: the popup\
  \ and list parts are the same node, as the markup here shows. Disabled items stay\
  \ in the DOM with `aria-disabled=\"true\"` and are skipped by the arrows, Home/End\
  \ and typeahead. `container?: HTMLElement` (default document.body) is the portal\
  \ target \u2014 a platform prop, not a schema prop. Page scroll is not locked: a\
  \ menu is not modal, and the popup repositions on scroll. Clicking the trigger while\
  \ the menu is open closes it. The root is a wrapper `<div data-ds=\"Menu\">` in\
  \ both modes: it holds the trigger, or nothing when `anchor` is given. Button writes\
  \ its own `data-part`, so the trigger part lives on an overlay-owned `<span data-part=\"\
  trigger\">` inside the root, wrapping the Button; aria-haspopup, aria-expanded and\
  \ aria-controls still reach the Button's element. The popup is portaled out of the\
  \ root, so the override hooks and inline overrides are applied on the popup (`data-part=\"\
  popup\"`), not on the root. The forwarded ref resolves to the popup element and\
  \ is null while closed; pass-through div props (id, data-*, event handlers) go on\
  \ the root wrapper, not the popup. A `window` blur while open closes with reason\
  \ `focus-out`."
```

## Guidance

## Overview

A menu hides a handful of actions behind one button so a toolbar or a row stays quiet. It is the desktop counterpart of ActionSheet — anchored to what was clicked, gone with a click elsewhere, fully driveable from the keyboard, with typeahead for long lists.

## When to use

Use a Menu for secondary actions on an item or a view that do not deserve their own buttons: overflow ("More actions"), sort or view options, account menus. Group related items with a `group` label when there are more than about six; separate a danger action with a `separator`. On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is "pick an action" and let the platform decide the surface.

## When not to use

Do not use a Menu for navigation between pages; use Links in a nav Landmark (a "navigation menu" in the ARIA sense is not this pattern). Do not use it to pick a value that stays selected (that is Select, planned, or a RadioGroup); menu items are actions, not state. Do not put inputs, switches or long text in a menu. Do not use a menu with one item; make it a button.

## Behavior

Activating the trigger opens the popup at `placement` (flipped if it would overflow) with focus on the first item; ArrowUp from the trigger opens with the last item focused. Arrow keys move through enabled items and wrap; Home and End jump; typing letters moves to the next matching label; Enter or Space activates the focused item, which closes the menu, returns focus to the trigger and fires `onAction(id)`. Escape closes without action and returns focus. Tab closes and lets focus move on (reason `tab-out`). A pointer click outside closes (`outside`); focus leaving otherwise, or the window losing focus, closes (`focus-out`). Focus on close follows the reason: `escape` and `action` return it to the trigger, `tab-out` follows the Tab rule, `trigger` leaves it on the trigger, and `outside` and `focus-out` do not move it — except that whenever the popup hides with focus still inside it (including a controlled close the menu did not request), focus goes to the trigger so it never drops to the page body. That exception wins over the per-reason rule: an outside press that lands on non-focusable ground returns focus to the trigger. With `anchor`, "the trigger" here is the element that had focus when the menu opened. An uncontrolled menu starts closed; stories that need it open (the Keyboard story, scenarios with `open: true`) render through a wrapper that owns `open`, starting true, and writes onOpenChange back, acting as the consumer. Example stories read as if they started from blank args: Storybook merges `meta.args` into every story, so each example restates the props its `given` names and the ones it relies on being at their default (an example with no `open` renders closed). The four `Placement*` stories are the exception and render open on every platform, through the same wrapper: a closed story shows nothing of the one rule it exists to illustrate. Hovering an item moves the roving focus to it so keyboard and pointer never highlight two things. DOM focus, not the roving state, is authoritative: the arrows, Home/End, typeahead and activation all start from the focused item, and the roving tabindex follows focus through a focus handler on each item — so a click, a screen reader or a test that focuses an item directly moves the origin with it. That is the rule for every roving-tabindex component, not just this one. Disabled items are visible, announced disabled, skipped by arrows and typeahead, and do nothing on click; they may still take focus from a click, and an arrow pressed while one holds focus goes to the first enabled item (ArrowDown) or the last (ArrowUp) rather than to its neighbour.

## Content guidelines

The trigger label names the set ("More actions", "Sort by"), not "Menu". Items are verbs or short noun phrases, sentence case, no trailing punctuation; a shortcut hint uses the platform's key names ("⌘S", "Ctrl+S") and is display-only. Group labels are one or two words in the same case as headings. Danger items say what they destroy and sit last, after a separator.

## Accessibility

The trigger is a button with `aria-haspopup="menu"` and `aria-expanded`; the popup has role `menu` with an accessible name from the trigger, items are `menuitem`s (WCAG 4.1.2; APG menu button and menu). One tab stop, arrows to move (roving-tabindex, arrow-navigation), typeahead, Home/End. Escape closes and restores focus to the trigger; Tab closes and focus moves on in document order (2.4.3, 2.1.2). The highlighted item is shown with a background change *and* is the focused element, so the highlight is never hover-only (no-hover-only; 1.4.13 for content on hover does not apply because the menu is opened by activation, not hover). Items reach 24px (2.5.8); on touch presentations the ActionSheet's 44px applies. Contrast is checked for normal, danger and muted text on the surface and on the highlight.

## Platform notes

### Web
Trigger: the system `Button` with `aria-haspopup="menu"`, `aria-expanded`, `aria-controls={popupId}`, `trailingIcon={<Icon name={triggerIcon} />}` (or `iconOnly`). Popup: a portal into `document.body`, `position: fixed`, `top/left` from the trigger rect for `placement` with a flip when the popup would cross the viewport edge, `z-index: var(--layer-dropdown)`, `min-inline-size: max(trigger width, minWidth)`. `<div role="menu" aria-labelledby={triggerId}>` containing `<div role="group" aria-labelledby>` for groups, `<div role="separator">`, and `<div role="menuitem" tabindex={-1|0} aria-disabled>`. Keydown handler on the menu implements the keyboard table; a `pointerdown` listener on `document` closes on outside clicks; `focusout` to outside and `window` blur close with `focus-out`; Tab and Shift+Tab close with `tab-out`. Reposition on scroll and resize while open.

### Lit
`<ds-menu label="More actions" .items=${items} icon-only>`. The popup uses `popover="manual"` when `HTMLElement.prototype.showPopover` exists (top layer, no z-index juggling) and otherwise `position: fixed` with `layer.dropdown`; position from `this.trigger.getBoundingClientRect()`. Composed `action` and `open-change`. Roving tabindex over shadow-root items; hover moves focus.

### React Native
Phones (window width <= `phoneBreakpoint`): render `ActionSheet` with `open` driven by the trigger and the items flattened — group labels, separators and shortcut hints are dropped. Tablets and react-native-web: a transparent `Modal` whose backdrop `Pressable` closes on tap, with the popup `View` positioned from `triggerRef.measureInWindow()` and flipped when it would overflow `useWindowDimensions()`. Items are `Pressable accessibilityRole="menuitem"` with `accessibilityState={{ disabled }}`. The trigger `Button` gets `accessibilityState={{ expanded }}`.

## Related

ActionSheet, Button, Icon, Tooltip, Select (planned).
