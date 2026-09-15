# Generate: Link as a Lit web component

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/lit/src/Link.ts` defining the custom element tag declared under `platforms.lit.tag` (a `LitElement` subclass), exporting the class and registering it with `customElements.define`. Add a `Link.stories.ts` covering every enum value of every enum prop.

## Rules

- Lit 3.3 with standard (TC39) decorators: each schema prop becomes a `@property()` auto-accessor — `@property({ type: String, reflect: true }) accessor variant: LinkVariant = 'primary'` — never a plain decorated field (`experimentalDecorators` is off). Props listed under `platforms.lit.reflect` use `reflect: true` so they can be styled from outside with attribute selectors. Boolean props are boolean attributes (`type: Boolean`). Internal state is `@state() private accessor open = false`.
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
- Tests run on Vitest 5 browser mode over Vite 8 (Playwright, Chromium; helpers from `vitest/browser`); the behavior scenarios below become `Link.test.ts`.

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
        text.'
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
      description: Fired when the link is activated. On web the default navigation
        still happens unless the consumer prevents it; on native the consumer must
        navigate (the system opens URLs with Linking when no handler is given).
      platforms:
        web: onClick
        lit: click (native, retargeted — no CustomEvent)
        rn: onPress
        swiftui: action
  styles:
    color:
      token: color.link
      locked: true
    colorHover:
      token: color.link.hover
      description: Pointer hover and active state.
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
      description: 'Gap before the trailing icon, which is 1em of the surrounding
        font size (no token: it scales with the text).'
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
    focusRingRadius:
      token: radius.sm
      locked: true
    transition:
      token: motion.duration.fast
      description: Color transition on hover, with motion.easing.standard.
      locked: false
  copy:
    externalSuffix: ' (opens in new tab)'
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
      notes: A native <a href>. `external` sets target="_blank" and rel="noopener
        noreferrer". The visible label stays as-is; the external suffix is added in
        visually hidden text, not aria-label, so the accessible name still starts
        with the visible text.
    lit:
      tag: ds-link
      reflect:
      - tone
      - external
      - download
      notes: 'Wraps a native <a> in the shadow root with delegatesFocus. No custom
        event: the native click bubbles and retargets to the host. Consumers who intercept
        navigation call preventDefault on that click. A ds-link inside a ds-text paragraph
        is inline by default (display: inline).'
    rn:
      element: Text
      props:
      - accessibilityRole=link
      - accessibilityLabel
      - onPress
      notes: 'Renders Text with accessibilityRole="link" so it is inline inside a
        parent Text. The external mark is `Icon name="external" inline` colored with
        the link color (with `tone: inherit` it takes the parent Text''s color from
        TextStyleContext); it swaps color instantly on press while the label crossfades.
        Of the override bindings only `transition` has an effect on native (Text cannot
        set underline thickness/offset). Activation calls `onPress(href)` when provided,
        otherwise Linking.openURL(href). `external` always uses Linking. No hover
        or visited state; the pressed state uses colorHover. On react-native-web this
        becomes a real anchor. Forwards `accessibilityHint`, `accessibilityLabel`
        (when set by a parent such as Tooltip), `onHoverIn`, `onHoverOut`, `onFocus`,
        `onBlur` and `onLongPress` to the native element, so Tooltip can attach to
        it.'
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
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on `:host`, named `--ds-<tag-without-prefix>-<binding>` (kebab-case), defaulting to its token: `:host {{ --ds-button-padding-inline: var(--space-md) }}` and rules read `var(--ds-button-padding-inline)`, never the token directly. Interpolated bindings set the hook per reflected attribute (`:host([variant="primary"]) {{ --ds-button-background: var(--color-action-primary-background) }}`). Because document styles on the host beat `:host` rules, consumers can override from CSS (`ds-button.hero {{ --ds-button-padding-inline: var(--space-lg) }}`) — that is the sanctioned escape hatch.

The element also has an `overrides` property (`attribute: false`, `Partial<Record<OverridableBinding, TokenRef>>`, `TokenRef` from `@design-schema/tokens`) that sets the hooks with `this.style.setProperty(hook, 'var(--<token-kebab>)')`. Locked bindings are not in the type and are ignored. No `::part` is exposed for styling.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `underlineThickness`, `underlineOffset`, `externalIconGap`, `transition`
Locked (accessibility-bearing, never overridable): `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth`, `focusRingRadius`

## Behavior scenarios (5)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
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

## Platform notes (lit)

```yaml
tag: ds-link
reflect:
- tone
- external
- download
notes: 'Wraps a native <a> in the shadow root with delegatesFocus. No custom event:
  the native click bubbles and retargets to the host. Consumers who intercept navigation
  call preventDefault on that click. A ds-link inside a ds-text paragraph is inline
  by default (display: inline).'
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

Activation with pointer, Enter, or assistive technology navigates to `href`. `onPress` fires first; on web the consumer may prevent the default to route client-side, and on native the consumer's handler is the navigation. With `external`, web opens a new tab and native hands the URL to the system. `download` asks the browser to save rather than open and does nothing on native. The link is never disabled: a destination that is not available is not rendered as a link.

## Content guidelines

Link text describes the destination and makes sense out of context, because screen-reader users navigate by pulling up a list of links: "View the billing history", not "click here" or "more". Keep links short and do not link whole sentences. When an external link's text is a product name, that is enough — the external suffix already says it leaves. Do not repeat "(opens in new tab)" in the visible text; the component adds it to the accessible name.

## Accessibility

The accessible name is the visible text (WCAG 2.4.4, 2.5.3), plus `copy.externalSuffix` for external links. Links are distinguishable from surrounding text by the underline, not by color alone (1.4.1). Link color meets 4.5:1 on the page background in both modes for the rest, hover and visited colors (1.4.3); the build checks all three. Focus is visible with the focus ring (2.4.7); because links are inline, the ring uses `focusRingRadius` and follows the text box rather than the line box. Links are keyboard operable with Enter (2.1.1). Opening a new tab is a change of context that the user is warned about in advance (3.2.5).

## Platform notes

### Web
Render `<a href>` with the visible label as content. For `external`, render, in order: the label, a visually hidden `<span>` containing `copy.externalSuffix`, then the decorative icon (an inline 1em SVG with `aria-hidden`). The visually hidden span uses the standard clip pattern (absolute, 1px box, clip-path inset 50%, white-space nowrap) — the one place where 1px literals are sanctioned. `font: inherit` on the anchor. Prefer `text-underline-offset` and `text-decoration-thickness` from the tokens over border tricks so the underline behaves in wrapped text.

### Lit
`<ds-link>` hosts a shadow root with `delegatesFocus: true` and a native `<a>` inside. Do not dispatch a CustomEvent named `click`; the native click retargets to the host and consumers listen for it there. The host defaults to `display: inline` so it can sit inside a `<ds-text>` paragraph; reflect `tone` and `external` so consumers can style from outside.

### React Native
Render `Text` with `accessibilityRole="link"` and `accessibilityLabel` (label plus the external suffix when `external`). Nested inside a parent `Text` it flows inline; standalone it is its own line. `onPress(href)` is the navigation when provided; otherwise call `Linking.openURL(href)` — never both. Standalone, the Link sets the body typography (`font.size.md`, `font.weight.regular`, `font.lineHeight.normal` via Text's helpers) since there is no cascade; nested in the system Text it inherits, which Text signals through an exported `TextNestingContext` — inside a raw RN Text the Link is standalone. Put a single space before the external glyph, since nested Text ignores margins. Platform limits, all acknowledged: no visited state (`colorVisited` unused), no hover (`colorHover` is the pressed color), no underline offset or thickness, and no focus events on `Text`, so the focus ring is the platform's own — `focusRing*` bindings are not applied.

## Related

Button, Text, Breadcrumb.
