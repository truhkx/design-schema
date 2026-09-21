# Generate: Link for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Link.tsx` exporting a typed React function component named `Link`, plus `Link.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Link({ ref, …rest }: LinkProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Link> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Link.test.tsx`.
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
  name: Link
  category: navigation
  status: review
  apg: link
  anatomy:
  - anchor
  - label
  - externalIcon
  props:
    href:
      type: string
      required: true
      description: The destination. A URL on web; a URL or app route on native, resolved
        by `onPress` when the consumer provides it.
    label:
      type: string
      required: true
      description: The link text. Also the accessible name. Says where the link goes,
        not "click here".
    external:
      type: boolean
      default: false
      description: Opens the destination in a new tab or the system browser and appends
        `copy.externalSuffix` to the accessible name, with a decorative trailing icon.
      a11y: Users are told the link leaves the current context before they activate
        it (WCAG 3.2.5 advisory, G201).
    tone:
      type: enum
      values:
      - default
      - inherit
      default: default
      description: '`default` uses the link colors. `inherit` takes the surrounding
        text color and relies on the underline alone — for links inside muted or on-action
        text. Under `inherit` the color, colorHover and colorVisited bindings are
        not applied: rest, hover, visited and (on native) pressed all resolve to the
        inherited color (currentColor on web and Lit, the enclosing TextStyleContext
        color on native), and the underline and the external icon follow that same
        color, so an inherited link has no hover or visited color change by design.
        On web the root takes `color: inherit`, and the color, :visited and :hover
        rules are scoped to the `tone: default` modifier. On native Link sets no textDecorationColor
        under either tone (the underline takes the Text color, so it follows the animated
        label colour), and under `inherit` the label runs no press animation, since
        rest and pressed resolve to the same colour; a standalone inherit link outside
        any system Text has nothing to inherit, so its label and icon both use color.foreground.'
    download:
      type: boolean
      default: false
      description: Downloads the resource instead of navigating, under the server's
        file name (a custom file name is out of scope). Web only.
      platforms:
      - web
      - lit
  events:
    onPress:
      description: 'Fired when the link is activated. On web the default navigation
        still happens unless the consumer prevents it; on native the consumer must
        navigate (the system opens URLs with Linking when no handler is given). On
        Lit the name is the native anchor''s own `click`, retargeted out of the shadow
        root — Link emits no `press` CustomEvent. Cancelling: on web the handler receives
        the click event and cancels navigation with preventDefault or by returning
        `false` (typed `(event) => void | boolean`; Link calls preventDefault on `false`);
        on Lit the consumer calls preventDefault on the click; on native the handler
        receives `href` and returning `false` cancels the Linking hand-off, the only
        default action native has. `fires: [user]` means Link never dispatches it
        itself; on web and Lit a script calling `.click()` on the anchor still fires
        it, as on any link, and Link does not try to filter that out.'
      platforms:
        web: onClick
        lit: click
        rn: onPress
        swiftui: action
      cancelable: true
      fires:
      - user
  styles:
    color:
      token: color.link
      locked: true
    colorHover:
      token: color.link.hover
      state: hover
      description: 'Pointer hover only on web and Lit (not :active), as a plain `:hover`
        rule with no `@media (hover: hover)` guard; a sticky hover color after a tap
        is an accepted, proven pair. On native, which has no hover, the pressed color.'
      locked: true
    colorVisited:
      token: color.link.visited
      description: Web and Lit only; native has no visited state.
      locked: true
    underlineThickness:
      token: border.width.thin
      description: Text-decoration thickness; the underline is always present at rest.
      locked: false
    underlineOffset:
      token: space.1
      locked: false
    externalIconGap:
      token: space.1
      part: externalIcon
      description: 'Gap before the trailing icon, applied as margin-inline-start on
        Link''s own `externalIcon` wrapper span (inline text has no Stack to use),
        never on the Icon inside it. The icon is 1em of the surrounding font size
        (no token: it scales with the text). On React Native nested Text ignores margins,
        so the gap is a single literal space and this binding is not applied. An override
        of it is written only while `external` is true, the only time the binding
        is in effect.'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    focusRingRadius:
      token: radius.sm
      description: Applied (as border-radius) only under :focus-visible, so a resting
        inline anchor is not rounded.
      locked: true
    focusRingOffset:
      token: border.width.focus
      description: outline-offset of the focus ring on web and Lit, deliberately the
        same token as its width, so the two are indistinguishable at every theme until
        one of them is given a token of its own. Not applied on native, where the
        ring is the platform's own.
      locked: true
    transition:
      token: motion.duration.fast
      description: Color transition on hover, with motion.easing.standard. Only `color`
        transitions; the underline follows it through currentColor.
      locked: false
  copy:
    externalSuffix: ' (opens in new tab)'
    external: opens in new tab
  a11y:
    role: link
    requires:
    - accessible-name
    - focus-visible
    - keyboard-operable
    - contrast-aa
    contrast:
    - foreground: color.link
      background: color.background
      level: AA
    - foreground: color.link.hover
      background: color.background
      level: AA
    - foreground: color.link.visited
      background: color.background
      level: AA
  platforms:
    web:
      element: a
      attributes:
      - href
      - target
      - rel
      - download
      notes: 'A native <a href>. `external` sets target="_blank" and rel="noopener
        noreferrer". The visible label stays as-is; the external suffix is added in
        visually hidden text, not aria-label, so the accessible name still starts
        with the visible text. Link accepts no `className` or `style`: a composite
        that shows a link inside its own row uses `tone: inherit` and keeps the underline.
        The root <a> carries `data-ds="Link"` and `data-part="anchor"`, and those
        win: a parent never stamps its own `data-part` onto Link''s root, it puts
        its part on a wrapper element it owns. The `label` part is a `<span data-part="label">`
        holding the visible text inside the anchor (web and Lit); on native the root
        Text is the anchor and the label is its string content, with no element of
        its own. Lit shadow elements carry `part` as well as `data-part`, both the
        anatomy names: they are names tests read, not a styling surface. Locked bindings
        (the three colours and the focus ring bindings, which carry contrast and focus
        guarantees) get no `--ds-link-*` hook on web or Lit: their rules read the
        token directly, so consumer CSS cannot swap an accessibility-bearing colour.
        The visually hidden span that carries copy.externalSuffix is deliberately
        not an anatomy part: it is a naming device, not a visual piece, so it takes
        no data-part, no part and no hook on any platform, and nothing needs to address
        it. The external glyph is composed with no forwarded override at all: it takes
        its colour from the text around it (currentColor on web and Lit, the enclosing
        Text''s colour on native), which is the one case in the package where a composed
        child is given nothing and inherits instead. Link never sets `aria-current`,
        but it does pass one through `...rest`: a navigation that marks its own current
        page is the consumer''s to state. `external` writes its modifier class or
        attribute on both web and Lit even though no rule reads it, so the two platforms
        expose the same state to a consumer''s own selectors. Example stories take
        their `given` as args over meta args that hold the schema defaults — and,
        since `href` and `label` are required with no default, those two as well;
        that still counts as exactly the `given`. `ToneDefault` renders standalone,
        with no surrounding paragraph: only `ToneInherit`, `InlineInAParagraph` and
        `InsideMutedText` are specified inside a sentence.'
    lit:
      tag: ds-link
      reflect:
      - tone
      - external
      - download
      notes: 'Wraps a native <a> in the shadow root with delegatesFocus. No custom
        event: the native click bubbles and retargets to the host. Consumers who intercept
        navigation call preventDefault on that click. A ds-link inside a ds-text paragraph
        is inline by default (display: inline). `href` and `label` are required but
        a property needs an initial value, so both start as '''' and Link does not
        warn; an empty href is the consumer''s authoring error (render Text instead).
        ds-link has no slot: the text comes only from `label`, so `<ds-link href>text</ds-link>`
        renders an unnamed anchor. An empty `href` still renders `href=""` on the
        anchor rather than omitting the attribute, which would make it a non-link
        and drop it from the focus order. The tone colour rules are scoped `:host(:not([tone=''inherit'']))`,
        not `:host([tone=''default''])`, so a link is coloured before the attribute
        reflects and for any value that is not `inherit`. `:host([hidden]) { display:
        none }` overrides the inline default, as elsewhere in the package.'
    rn:
      element: Text
      props:
      - accessibilityRole=link
      - accessibilityLabel
      - onPress
      notes: 'Renders Text with accessibilityRole="link" so it is inline inside a
        parent Text. The external mark is `Icon name="external" inline`, preceded
        by a single literal space (nested Text ignores margins, so `externalIconGap`
        is not applied). With `tone: default` Link passes the link color to Icon''s
        `color` prop, and it swaps instantly on press while the label crossfades;
        with `tone: inherit` Link passes no `color`, so Icon takes the enclosing TextStyleContext
        color when nested in a system Text and color.foreground otherwise. Of the
        override bindings only `transition` has an effect on native (Text cannot set
        underline thickness/offset, and the gap is a space), so the native LinkOverridableBinding
        type is `transition` alone. Activation calls `onPress(href)` first when provided,
        and returning `false` from it cancels any Linking hand-off. For a non-external
        link that handler is the navigation and Linking.openURL(href) is only the
        fallback when there is no handler; an `external` link hands off to Linking.openURL(href)
        after the handler as well, because a consumer''s own router cannot open the
        system browser. `accessibilityLabel` is the label plus `copy.externalSuffix`
        verbatim when `external`: one suffix string on every platform, kept even though
        native opens the system browser rather than a tab; `copy.external` is unused
        on native. No hover or visited state; the pressed state uses colorHover, and
        `colorVisited` and the four focusRing bindings have no native effect at all
        — Text has no visited state and no focus events, so `focus-visible` is met
        here only under react-native-web, where the real anchor takes the browser''s
        own outline. None of the three anatomy names carries a hook on native: one
        element takes one testID, so the root Text keeps `testID="Link"` and is the
        `anchor`; `label` is bare string content by design; and `externalIcon` cannot
        be stamped without a wrapper View that would break inline text flow. `textDecorationLine`
        is set on the whole root Text, so the underline runs under the separating
        space and the external glyph too — splitting the label into a nested Text
        to avoid that would contradict the label having no element of its own. `copy.externalSuffix`
        is also exported as a package-internal constant, because Card moves a composed
        Link''s accessible name onto its own pressable and has to append the same
        string; it is not part of the public entry point. On react-native-web Link
        forwards `href` to the Text (through an untyped prop bag, since native Text
        types have no `href`) so it renders a real <a>, plus `hrefAttrs` { target:
        _blank, rel: noopener noreferrer } when `external`; there the browser navigates
        as on web, Linking is not called, and a handler returning `false` calls preventDefault.
        A rejected `Linking.openURL` (unsupported scheme, unhandled route) is swallowed
        silently. The forwarded focus and hover handlers are typed `(event: unknown)
        => void` and passed through the same untyped bag, since native Text types
        do not declare them. Each platform''s own test file mocks Linking to cover
        the fallback and the external hand-off, which the scenario cannot express.
        Forwards `accessibilityHint`, `accessibilityLabel` (when set by a parent such
        as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`, `onBlur` and `onLongPress`
        to the native element, so Tooltip can attach to it through those props; Link
        exposes no `ref` prop and no ref to its Text root.'
    swiftui:
      element: Link
      props:
      - Link
      - Button
      - .accessibilityAddTraits=isLink
      - openURL
      - .underline
      - .accessibilityHint
      notes: 'SwiftUI `Link(destination:)` for `href` (opens through `@Environment(\.openURL)`,
        so an app can intercept in-app routes); a `Button` with `.isLink` trait when
        only `action` is given. Underline from the `underline` token via `.underline(true,
        pattern: .solid, color:)`; `external` appends the `external` Icon inline and
        `copy.external` to the accessibility label. Inline links inside `Text` render
        as `Text` concatenation with `.link` attribute for the URL, so a paragraph
        with a link is one accessibility element with the link as a rotor item.'
  behavior:
  - name: click-fires-on-press
    description: Activation with pointer, Enter, or assistive technology navigates
      to href; onPress fires first. On web and Lit the test cancels the click with
      preventDefault so the test page does not navigate.
    when:
      click: anchor
    then:
    - event: onPress
  - name: external-link-announces-that-it-leaves
    description: The accessible name is the visible text plus copy.externalSuffix,
      so users are told the link leaves the current context before they activate it.
      On web and Lit the `copy` expectation reads the anchor's text content, where
      the suffix sits in visually hidden text; the name is reached through the shadow
      root on Lit and is the accessibilityLabel on native.
    given:
      external: true
      label: View the billing history
    then:
    - copy: externalSuffix
      platforms:
      - web
      - lit
    - name: View the billing history (opens in new tab)
      platforms:
      - web
      - lit
      - rn
  - name: external-link-opens-a-new-tab
    description: external sets target="_blank" and rel="noopener noreferrer" on web
      and Lit.
    given:
      external: true
    then:
    - attribute: target
      is: _blank
      platforms:
      - web
      - lit
    - attribute: rel
      is: noopener noreferrer
      platforms:
      - web
      - lit
  - name: download-asks-the-browser-to-save
    description: download asks the browser to save rather than open (web and Lit only);
      the attribute is present and valueless.
    given:
      download: true
    then:
    - attribute: download
      is: ''
      platforms:
      - web
      - lit
  examples:
  - name: inline-in-a-paragraph
    description: The default link inside body text, underlined and taking the paragraph's
      typography. The story renders it inside a default Text paragraph reading "Invoices
      from the last twelve months are kept. " followed by the link and a full stop.
      Its href and label are also the Default story's args, so the derived renders
      and accessible-name scenarios run against them.
    given:
      href: /billing/history
      label: View the billing history
  - name: external-destination
    description: A link that leaves the product, so the name says so before it is
      activated. This example is the `external` state story (and downloadable-file
      the `download` one); no separate External or Download story is added. Both render
      standalone, not inside a Text paragraph.
    given:
      href: https://status.example.com
      label: Status page
      external: true
  - name: inside-muted-text
    description: 'A link in muted or on-action text, where the color is inherited
      and the underline alone marks it. The story renders it inside a Text with `tone:
      muted` reading "For how charges are calculated, read " followed by the link
      and a full stop. The `tone: inherit` enum story uses the same muted wrapper
      and sentence with the Default href and label, so the inherited color is visible.'
    given:
      href: /help/billing
      label: the billing guide
      tone: inherit
  - name: downloadable-file
    description: A link to a file the browser should save rather than open.
    given:
      href: /invoices/2026-09.pdf
      label: Download the September invoice
      download: true
    platforms:
    - web
    - lit
```

## Events

- `onPress`: emit `onClick`
  - cancelable: yes
  - fires on: user

## Style bindings

- `colorHover`: token `color.link.hover`; state `hover`; locked
- `externalIconGap`: token `space.1`; part `externalIcon`

## Constants and examples

- example `inline-in-a-paragraph`, story `InlineInAParagraph`: given `href: "/billing/history"`, `label: "View the billing history"`; The default link inside body text, underlined and taking the paragraph's typography. The story renders it inside a default Text paragraph reading "Invoices from the last twelve months are kept. " followed by the link and a full stop. Its href and label are also the Default story's args, so the derived renders and accessible-name scenarios run against them.
- example `external-destination`, story `ExternalDestination`: given `href: "https://status.example.com"`, `label: "Status page"`, `external: true`; A link that leaves the product, so the name says so before it is activated. This example is the `external` state story (and downloadable-file the `download` one); no separate External or Download story is added. Both render standalone, not inside a Text paragraph.
- example `inside-muted-text`, story `InsideMutedText`: given `href: "/help/billing"`, `label: "the billing guide"`, `tone: "inherit"`; A link in muted or on-action text, where the color is inherited and the underline alone marks it. The story renders it inside a Text with `tone: muted` reading "For how charges are calculated, read " followed by the link and a full stop. The `tone: inherit` enum story uses the same muted wrapper and sentence with the Default href and label, so the inherited color is visible.
- example `downloadable-file`, story `DownloadableFile`: given `href: "/invoices/2026-09.pdf"`, `label: "Download the September invoice"`, `download: true`; A link to a file the browser should save rather than open.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `underlineThickness`, `underlineOffset`, `externalIconGap`, `transition`
Locked (accessibility-bearing, never overridable): `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth`, `focusRingRadius`, `focusRingOffset`

## Behavior scenarios (9)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: click-fires-on-press
  description: Activation with pointer, Enter, or assistive technology navigates to
    href; onPress fires first. On web and Lit the test cancels the click with preventDefault
    so the test page does not navigate.
  when:
    click: anchor
  then:
  - event: onPress
- name: external-link-announces-that-it-leaves
  description: The accessible name is the visible text plus copy.externalSuffix, so
    users are told the link leaves the current context before they activate it. On
    web and Lit the `copy` expectation reads the anchor's text content, where the
    suffix sits in visually hidden text; the name is reached through the shadow root
    on Lit and is the accessibilityLabel on native.
  given:
    external: true
    label: View the billing history
  then:
  - copy: externalSuffix
  - name: View the billing history (opens in new tab)
- name: external-link-opens-a-new-tab
  description: external sets target="_blank" and rel="noopener noreferrer" on web
    and Lit.
  given:
    external: true
  then:
  - attribute: target
    is: _blank
  - attribute: rel
    is: noopener noreferrer
- name: download-asks-the-browser-to-save
  description: download asks the browser to save rather than open (web and Lit only);
    the attribute is present and valueless.
  given:
    download: true
  then:
  - attribute: download
    is: ''
- name: renders
  then:
  - renders: true
  derived: true
- name: renders-tone-default
  given:
    tone: default
  then:
  - renders: true
  derived: true
- name: renders-tone-inherit
  given:
    tone: inherit
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
element: a
attributes:
- href
- target
- rel
- download
notes: "A native <a href>. `external` sets target=\"_blank\" and rel=\"noopener noreferrer\"\
  . The visible label stays as-is; the external suffix is added in visually hidden\
  \ text, not aria-label, so the accessible name still starts with the visible text.\
  \ Link accepts no `className` or `style`: a composite that shows a link inside its\
  \ own row uses `tone: inherit` and keeps the underline. The root <a> carries `data-ds=\"\
  Link\"` and `data-part=\"anchor\"`, and those win: a parent never stamps its own\
  \ `data-part` onto Link's root, it puts its part on a wrapper element it owns. The\
  \ `label` part is a `<span data-part=\"label\">` holding the visible text inside\
  \ the anchor (web and Lit); on native the root Text is the anchor and the label\
  \ is its string content, with no element of its own. Lit shadow elements carry `part`\
  \ as well as `data-part`, both the anatomy names: they are names tests read, not\
  \ a styling surface. Locked bindings (the three colours and the focus ring bindings,\
  \ which carry contrast and focus guarantees) get no `--ds-link-*` hook on web or\
  \ Lit: their rules read the token directly, so consumer CSS cannot swap an accessibility-bearing\
  \ colour. The visually hidden span that carries copy.externalSuffix is deliberately\
  \ not an anatomy part: it is a naming device, not a visual piece, so it takes no\
  \ data-part, no part and no hook on any platform, and nothing needs to address it.\
  \ The external glyph is composed with no forwarded override at all: it takes its\
  \ colour from the text around it (currentColor on web and Lit, the enclosing Text's\
  \ colour on native), which is the one case in the package where a composed child\
  \ is given nothing and inherits instead. Link never sets `aria-current`, but it\
  \ does pass one through `...rest`: a navigation that marks its own current page\
  \ is the consumer's to state. `external` writes its modifier class or attribute\
  \ on both web and Lit even though no rule reads it, so the two platforms expose\
  \ the same state to a consumer's own selectors. Example stories take their `given`\
  \ as args over meta args that hold the schema defaults \u2014 and, since `href`\
  \ and `label` are required with no default, those two as well; that still counts\
  \ as exactly the `given`. `ToneDefault` renders standalone, with no surrounding\
  \ paragraph: only `ToneInherit`, `InlineInAParagraph` and `InsideMutedText` are\
  \ specified inside a sentence."
```

## Guidance

## Overview

Links take people somewhere. Buttons do things. That distinction is the whole reason this component exists: assistive technology lists links separately, users expect middle-click and open-in-new-tab to work on them, and the browser's history, visited state and find-in-page all depend on the element being a real link.

## When to use

Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to an external site, or to a downloadable file. Use it inline inside body text (it renders inline by default) and standalone in navigation lists. Use `external` whenever the destination leaves the product, so people are warned before they lose their place.

## When not to use

Do not use a Link to trigger an action — submitting, opening a dialog, toggling a setting — even if it looks lighter than a Button. Use the `ghost` Button variant for that. Do not remove the underline; underline-free links in body text are a WCAG 1.4.1 failure unless the link color contrasts 3:1 with the surrounding text *and* changes on hover, which no theme in this system promises. Do not render a Link with an empty `href` as a placeholder; render Text.

## Behavior

A Link has no typography of its own: it inherits font family, size, weight and line height from the text it sits in, so it looks right inside a paragraph, a caption, or a breadcrumb without configuration. Standalone, it inherits from the page body.

Activation with pointer, Enter, or assistive technology navigates to `href`. `onPress` fires first; on web the consumer may prevent the default to route client-side, and on native the consumer's handler is the navigation (an `external` link still hands off to the system afterwards unless the handler returns `false`). With `external`, web opens a new tab and native hands the URL to the system. `download` asks the browser to save rather than open and does nothing on native. The link is never disabled: a destination that is not available is not rendered as a link. Link has no current-page state and forwards no `aria-current`; the current item of a navigation (Breadcrumb''s last item, a drawer''s current page) is rendered as Text, not as a Link.

## Content guidelines

Link text describes the destination and makes sense out of context, because screen-reader users navigate by pulling up a list of links: "View the billing history", not "click here" or "more". Keep links short and do not link whole sentences. When an external link's text is a product name, that is enough — the external suffix already says it leaves. Do not repeat "(opens in new tab)" in the visible text; the component adds it to the accessible name.

## Accessibility

The accessible name is the visible text (WCAG 2.4.4, 2.5.3), plus `copy.externalSuffix` for external links. Links are distinguishable from surrounding text by the underline, not by color alone (1.4.1). Link color meets 4.5:1 on the page background in both modes for the rest, hover and visited colors (1.4.3); the build checks all three. Focus is visible with the focus ring (2.4.7); because links are inline, the ring uses `focusRingRadius` and follows the text box rather than the line box. Links are keyboard operable with Enter (2.1.1), which the native anchor does on every platform — there is no `keyboard` block, because there is nothing for a generator to write. Link declares no minimum target and is exempt from the 24px floor (2.5.8): a link is inline text sized by its own words, and WCAG's inline exception covers exactly that case. Where a link is the whole of an interactive row rather than a word in a sentence — an error-summary entry, a card target — the container owns the target, not the Link. Opening a new tab is a change of context that the user is warned about in advance (3.2.5).

## Platform notes

### Web
Render `<a href>` with the visible label as content. For `external`, render, in order: the label, a visually hidden `<span>` containing `copy.externalSuffix`, then the decorative icon: a `<span data-part="externalIcon">` wrapper carrying the `externalIconGap` margin, containing the system `<Icon name="external" inline />` with no label (so it hides itself). Icon's `inline` sizes it at 1em of the surrounding text, and its color is currentColor, so it follows the anchor's rest, hover and visited colors; no hand-drawn SVG. The visually hidden span uses the standard clip pattern (position absolute, 1px box, margin -1px, overflow hidden, border 0, clip-path inset(50%), white-space nowrap; no legacy clip: rect) — the one place where 1px literals are sanctioned. `font: inherit` on the anchor. Prefer `text-underline-offset` and `text-decoration-thickness` from the tokens over border tricks so the underline behaves in wrapped text.

### Lit
`<ds-link>` hosts a shadow root with `delegatesFocus: true` and a native `<a>` inside. Do not dispatch a CustomEvent named `click`; the native click retargets to the host and consumers listen for it there. The host defaults to `display: inline` so it can sit inside a `<ds-text>` paragraph; reflect `tone` and `external` so consumers can style from outside.

### React Native
Render `Text` with `accessibilityRole="link"` and `accessibilityLabel` (label plus the external suffix when `external`). Nested inside a parent `Text` it flows inline; standalone it is its own line. `onPress(href)` is the navigation when provided; otherwise call `Linking.openURL(href)`. The one exception is `external`: after the handler runs, Link still calls `Linking.openURL(href)` unless the handler returned `false`. Standalone, the Link sets the body typography (`font.size.md`, `font.weight.regular`, `font.lineHeight.normal` via Text's helpers) since there is no cascade; nested in the system Text it inherits, which Text signals through its exported `TextStyleContext` (its `nested` field; there is no `TextNestingContext`) — inside a raw RN Text the Link is standalone. Put a single space before the external glyph, since nested Text ignores margins. Platform limits, all acknowledged: no visited state (`colorVisited` unused), no hover (`colorHover` is the pressed color), no underline offset or thickness, and no focus events on `Text`, so the focus ring is the platform's own — `focusRing*` bindings are not applied.

## Related

Button, Text, Breadcrumb.
