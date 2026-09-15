# Generate: Accordion for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Accordion.tsx` exporting a typed React Native function component named `Accordion`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `AccordionProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
- Render the component declared under `platforms.rn.element` with the props listed under `platforms.rn.props`. Map each event to its `platforms.rn` name.
- Import tokens from `@design-schema/tokens/<theme-id>/rn/light` and `/dark` (flat ESM modules with `.d.ts`; the theme id is in the theme skill) and read the active mode from the package's `useTheme()` hook (`ThemeProvider` with mode light | dark | system). Dimensions and durations are numbers; `fontWeight` tokens are numbers and must be converted to RN's string union; `font.lineHeight.*` are unitless multipliers — multiply by the font size; `fontFamilyBody` is `"System"`. Never hard-code a color, size, or font. A style binding like `color.action.{variant}.background` becomes `tokens[\`colorAction${capitalize(variant)}Background\`]`.
- Implement every item in `a11y.requires` with React Native's accessibility API:
  - `accessible-name`: `accessibilityLabel={label}`.
  - `keyboard-operable` / `focus-visible`: rely on the native focus system; for `Pressable`, style the focused/pressed state via the `style` callback.
  - `target-24px` / `target-44px`: `minWidth`/`minHeight` from `tokens.sizeTargetMin` / `tokens.sizeTargetComfortable`, and `hitSlop` where the visual is smaller.
  - `heading-hierarchy`: RN has no heading levels — set `accessibilityRole="header"` and document that the `level` prop only controls typography.
- `disabled` sets `accessibilityState={{ disabled: true }}` in addition to `disabled`.
- There is no CSS cascade: every style must be explicit on the element.
- Enum props whose values are quoted digits (Heading `level`, Stack `gap`) accept both the string and the number.
- `disabled` uses `opacity.disabled` on the whole element; never invent a disabled color.
- Use every `copy.*` string verbatim; do not write your own user-facing text.
- Testability hooks: the root carries `testID="<Name>"` (react-native-web renders it as data-testid); a component with a `keyboard` block ships a story exported as `Keyboard` rendering it open with its trigger and at least three focusable children, for the axe gate and manual keyboard checks on react-native-web.
- `keyboard` rules describe the web keyboard model; on native implement the subset hardware keyboards can reach (Escape/back gesture = dismiss, Enter = activate) and expose everything else through accessibility actions and visible controls. Overlays: modal dialogs, sheets and action sheets use the native `Modal` (`accessibilityViewIsModal`, `onRequestClose` for the Android back button, `statusBarTranslucent`); the scrim is a `Pressable` with `color.overlay.scrim`; sheets animate from the bottom with `Animated` and support drag-to-dismiss ONLY as an addition to a visible close control (`gesture-alternative`); tooltips are not a native pattern — render the tooltip text as `accessibilityHint` and show it on long-press only; toasts use a portal-less `View` with `layer.toast` zIndex at the root.
- Props of type `array`, `object`, or `function` carry a `shape` string in TypeScript notation; use it verbatim as the type. Prop type `content` is `ReactNode` / a slot / `ReactNode` by platform.
- Interpolated style bindings (`color.status.{tone}.background`) resolve per enum value at render time; never enumerate them by hand where a lookup will do. A resolved path ending in `.default` drops that segment (`color.background.{surface}` with `default` is `color.background`, i.e. `--color-background` / `colorBackground`); an enum value of `none` for a background/border/max-width binding renders nothing rather than a token.
- Composite components (Breadcrumb, Alert, RadioGroup) reuse the system's existing components (Link, Button, Text) from the same package rather than re-implementing them, and never restyle a child (no class overrides, no `::part`, no style props reaching into it): if a child needs a variation, the child's schema grows.
- Transitions use the component's own `transition` binding (its token and description), with `motion.easing.standard`; `motion.duration.fast` is only the default when a component has no `transition` binding.
- Development-only warnings the docs ask for use the platform convention: `process.env.NODE_ENV !== 'production'` (React), `import.meta.env.DEV` (Lit), `__DEV__` (React Native).
- Stories are named after the prop and value in PascalCase (`ToneInfo`, `RoleBanner`); demo stories are titled `Demo/<Name>/<Platform>`.
- Icons: use the system `Icon` component for every glyph the docs name (`<Icon name="external" inline />`, `<ds-icon name="close">`, `<Icon name="check" color={…} />`); never draw an inline SVG or a Unicode glyph by hand. Decorative icons take no label; a glyph that carries meaning gets one.
- Stories: Storybook 10 CSF3 with `@storybook/react-vite`, run under react-native-web; title `'<Name>/React Native'`; one story per enum value plus Default; wrap in `ThemeProvider`.
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Accordion> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Accordion.test.tsx`.

## Component schema

```yaml
component:
  name: Accordion
  category: container
  status: review
  apg: accordion
  anatomy:
  - list
  - item
  - trigger
  - triggerIcon
  - panel
  composition:
    item: Disclosure
  props:
    items:
      type: array
      required: true
      shape: '{ id: string; summary: string; content: ReactNode; disabled?: boolean
        }[]'
      description: The sections in order. `content` is the panel body (a slot per
        item on Lit).
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      default: '3'
      description: Heading level for every trigger, so sections appear in the page
        outline.
    exclusive:
      type: boolean
      default: false
      description: 'Opening one section closes the others. Off by default: users usually
        want to compare, and forced-closing is a common frustration.'
    value:
      type: union
      description: 'Controlled open ids: always an array (zero or one entry when `exclusive`);
        `onChange` reports the same shape.'
      shape: string | string[]
    defaultValue:
      type: union
      description: Initially open ids.
      shape: string | string[]
    divided:
      type: boolean
      default: true
      description: A hairline between items.
    keepMounted:
      type: boolean
      default: false
      description: Passed to every Disclosure; required when panels contain form fields.
  events:
    onChange:
      description: Fired when the set of open sections changes, with the open ids.
      platforms:
        web: onChange
        lit: change
        rn: onChange
        swiftui: onChange
    onOpenChange:
      description: 'Fired per section as it opens or closes, with `{ id, open, reason
        }` (`reason`: `trigger`, `keyboard`, `exclusive` when another section closed
        it, `controlled`). The per-item trigger for analytics, lazy loading of a panel''s
        content, or scrolling the opened section into view; `onChange` remains the
        set-level event for state.'
      platforms:
        web: onOpenChange
        lit: open-change
        rn: onOpenChange
        swiftui: onOpenChange
  keyboard:
  - keys:
    - Enter
    - ' '
    action: Toggles the focused section.
    from: first
    expect: toggles
  - keys:
    - ArrowDown
    action: Moves focus to the next trigger; wraps.
    from: first
    expect: focus-next
  - keys:
    - ArrowUp
    action: Moves focus to the previous trigger; wraps.
    from: last
    expect: focus-prev
  - keys:
    - ArrowDown
    action: From the last trigger wraps to the first.
    from: last
    expect: focus-wraps-to-first
  - keys:
    - Home
    action: First trigger.
    from: last
    expect: focus-first
  - keys:
    - End
    action: Last trigger.
    from: first
    expect: focus-last
  - keys:
    - Tab
    action: Ordinary tab order — every trigger is a tab stop (the APG recommends this
      so panel content stays reachable).
    from: first
    expect: focus-next
  styles:
    divider:
      token: color.border
      locked: false
    dividerWidth:
      token: border.width.thin
      locked: false
    itemGap:
      token: layout.gap.none
      description: Items touch; the divider separates them.
      locked: false
    triggerPaddingBlock:
      token: space.md
      description: Roomier than a lone Disclosure, since accordion triggers are section
        headings.
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    triggerFontSize:
      token: font.size.md
      locked: false
    triggerFontWeight:
      token: font.weight.medium
      locked: false
    minTarget:
      token: size.target.min
      description: The composed Disclosure's own minimum; the accordion's triggerPaddingBlock
        override raises the row to the comfortable size.
      locked: true
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  a11y:
    role: none
    requires:
    - heading-hierarchy
    - expanded-state
    - arrow-navigation
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - target-24px
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
  platforms:
    web:
      element: div
      attributes:
      - data-ds=Accordion
      notes: A <div> of Disclosures rendered with headingLevel and shared padding
        overrides; Accordion adds the arrow-key handler on the container (keydown
        from a trigger moves focus among triggers) and the exclusive logic. Every
        trigger stays a tab stop — no roving tabindex — per the APG accordion pattern.
    lit:
      tag: ds-accordion
      reflect:
      - exclusive
      - divided
      - heading-level
      notes: Light-DOM <ds-disclosure> children are the items (slot), so their content
        stays in the document; ds-accordion sets heading-level and keep-mounted on
        them, listens for their `toggle` to enforce exclusive, and handles arrow keys
        via keydown bubbling from the slotted triggers. `items` as a property is also
        accepted and renders <ds-disclosure> elements itself.
    rn:
      element: View
      props: []
      notes: A View of Disclosures with dividers; exclusive logic and headingLevel
        passed through. Arrow keys apply only with a hardware keyboard on react-native-web.
    swiftui:
      element: VStack
      props:
      - Disclosure
      - Heading
      - Button
      - .accessibilityValue=expanded
      - .focusSection
      - .onMoveCommand
      - '@FocusState'
      notes: A `VStack` of items, each a `Heading` at `headingLevel` wrapping the
        package trigger `Button` (`.accessibilityValue` expanded/collapsed) and its
        panel; `multiple`/`collapsible` per the doc; ArrowUp/Down/Home/End move between
        triggers on iPad via `@FocusState`. Panels animate with `transition` unless
        reduced motion. Composes Disclosure's engine, not `DisclosureGroup`.
```

## Overrides (per-instance styling contract)

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

Overridable: `divider`, `dividerWidth`, `itemGap`, `triggerPaddingBlock`, `fontFamily`, `triggerFontSize`, `triggerFontWeight`
Locked (accessibility-bearing, never overridable): `minTarget`, `focusRing`, `focusRingWidth`

## Behavior scenarios (6)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-heading-level-2
  given:
    headingLevel: '2'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-3
  given:
    headingLevel: '3'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-4
  given:
    headingLevel: '4'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-5
  given:
    headingLevel: '5'
  then:
  - renders: true
  derived: true
- name: renders-heading-level-6
  given:
    headingLevel: '6'
  then:
  - renders: true
  derived: true
```

## Platform notes (rn)

```yaml
element: View
props: []
notes: A View of Disclosures with dividers; exclusive logic and headingLevel passed
  through. Arrow keys apply only with a hardware keyboard on react-native-web.
```

## Guidance

## Overview

An accordion is a list of Disclosures that know about each other: consistent headings, arrow keys to move between them, and optionally the rule that opening one closes the rest. It is the right shape for FAQs, settings groups and long forms broken into sections.

## When to use

Use an Accordion for a series of independent sections a user scans by heading and opens selectively: an FAQ, a settings page grouped by topic, a multi-part form where each part is optional. Set `headingLevel` to fit the page outline. Leave `exclusive` off unless the panels are heavy or mutually exclusive by nature (a wizard-like "choose one plan to see details").

## When not to use

Do not use an Accordion for content most users need — show it. Do not use it as navigation or as tabs (Tabs replace content; an accordion adds it). Do not nest accordions. Do not use one for a single section; that is a Disclosure.

## Behavior

Each item is a Disclosure with a heading. Enter or Space toggles the focused item; with `exclusive`, opening one closes the others (closing does not open anything). Arrow keys, Home and End move focus among the triggers and wrap; Tab moves through triggers and open panel content in document order, since every trigger remains a tab stop. `onChange` receives the open ids. Disabled items are visible and skipped by arrows. `onOpenChange` reasons come from Disclosure's `onToggle(open, reason)`, so `keyboard` is distinguishable from `trigger` on web and Lit (native always reports `trigger`). With `exclusive` and several ids in `value`/`defaultValue`, the first is opened and a development warning notes the rest. Items are identified by `id` (on Lit, the slotted `<ds-disclosure>`'s `id` attribute); Accordion adds `data-part="item"` to each Disclosure root it renders.

## Content guidelines

Summaries are section titles — noun phrases or questions in sentence case, parallel across the list. Panel content starts with the answer, not a restatement of the heading. For FAQs, order by frequency, not alphabetically.

## Accessibility

Each trigger is a button inside a heading of the given level with `aria-expanded` and `aria-controls` (WCAG 4.1.2, 2.4.6; APG accordion), so the accordion reads as a list of headings in the rotor. Arrow keys are a convenience, not a replacement for Tab: every trigger is in the tab order so no panel content is stranded (2.1.1). Expanded state is visible (chevron) and announced. Targets meet 44px in the accordion form.

## Platform notes

### Web
Render `<div data-ds="Accordion">` containing a `Disclosure` per item with `headingLevel`, `keepMounted`, `open` controlled by the accordion's state, and `overrides={{ triggerPaddingBlock: 'space.md' }}`; a `Divider` between items when `divided`. Keydown on the container: when the event target is one of the triggers, handle ArrowUp/Down/Home/End by focusing the sibling trigger. `exclusive` maps each `onToggle` to the new open set.

### Lit
`<ds-accordion exclusive heading-level="3"><ds-disclosure summary="…">…</ds-disclosure>…</ds-accordion>`. On `slotchange`, set `heading-level`, `keep-mounted` and the padding override on each slotted `ds-disclosure`; listen for their composed `toggle` to enforce `exclusive` and dispatch `change`; handle arrow keys from bubbling keydown whose composed path includes a slotted trigger.

### React Native
`View` of `Disclosure`s with `Divider`s; the accordion owns the open set and passes `open`/`onToggle` to each. No arrow keys on native.

## Related

Disclosure, Tabs, Divider, Heading.
