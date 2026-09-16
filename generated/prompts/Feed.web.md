# Generate: Feed for React (web)

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/react/src/Feed.tsx` exporting a typed React function component named `Feed`, plus `Feed.stories.tsx` covering every enum value of every enum prop.

## Rules

- React 19: `ref` is a prop; no forwardRef; `useId`; Actions are not used by components. Type the component as `function Feed({ ref, …rest }: FeedProps & { ref?: Ref<HTMLElement> })` (the root element's type in place of `HTMLElement`) and attach `ref` to the root; generated ids come from `useId()`; never `useActionState`, `useFormStatus`, or a form `action` prop.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `ReactElement` (`ReactElement | null` when it can render nothing), exported constants, contexts and helpers are annotated, and `const meta: Meta<typeof Feed> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Vitest 5 over Vite 8 (jsdom, `@testing-library/react`); the behavior scenarios below become `Feed.test.tsx`.
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
  name: Feed
  category: container
  status: review
  apg: feed
  anatomy:
  - container
  - article
  - timestamp
  - articleBody
  - articleActions
  - loadingIndicator
  - endMessage
  - newItemsButton
  - emptyState
  composition:
    article: Card
    timestamp: Text
    newItemsButton: Button
    loadingIndicator: ProgressBar
    emptyState: Text
    endMessage: Text
  props:
    label:
      type: string
      required: true
      description: What the feed contains ("Activity", "Notifications").
      a11y: aria-label on the feed.
    items:
      type: array
      required: true
      shape: 'FeedItem[] where FeedItem = { id: string; heading: string; timestamp:
        string; content: ReactNode; actions?: ReactNode; unread?: boolean }'
      description: Articles, newest first. `heading` names the article (a Heading
        inside the Card); `timestamp` is ISO and rendered relative from the copy strings
        (`justNow` under a minute, `minutesAgo` under an hour, `hoursAgo` under a
        day, `daysAgo` under seven days, else the absolute date from Intl.DateTimeFormat
        in the user's locale) with the absolute time as its title on web (native shows
        the relative string only); `unread` marks items the user has not seen.
    hasMore:
      type: boolean
      default: false
      description: More items exist beyond the last; the feed asks for them with `onLoadMore`
        as the end approaches, and once on mount when `items` is empty and not `loading`
        (so an empty feed fetches its first page itself).
    loading:
      type: boolean
      default: false
      description: More items are being fetched; a loading indicator is shown after
        the last article and the feed is `aria-busy`.
    newItemsCount:
      type: number
      description: Number of newer items available above (from polling or a socket).
        The feed does not insert them — that would shift what the reader is looking
        at — it shows a "Show {count} new" button at the top which prepends and scrolls.
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '3'
      description: Heading level for article headings, matching the page outline.
    endMessage:
      type: string
      description: Shown after the last item when `hasMore` is false (and `items`
        is not empty). Defaults to `copy.end`.
  events:
    onLoadMore:
      description: Fired when the last rendered article is within one screen of view
        (or on End / Ctrl+End with `hasMore`).
      platforms:
        web: onLoadMore
        lit: load-more
        rn: onEndReached
        swiftui: onLoadMore
    onShowNew:
      description: Fired when the new-items button is pressed; the caller prepends
        the items and clears `newItemsCount`.
      platforms:
        web: onShowNew
        lit: show-new
        rn: onShowNew
        swiftui: onShowNew
    onItemVisible:
      description: Fired with an item id when it has been substantially visible for
        a moment (mark as read).
      platforms:
        web: onItemVisible
        lit: item-visible
        rn: onViewableItemsChanged
        swiftui: onItemVisible
  keyboard:
  - keys:
    - Tab
    action: Moves through interactive content inside the current article and on to
      the next article's content in reading order; articles themselves are focusable
      so the feed commands below work.
    from: any
    expect: focus-next
  - keys:
    - PageDown
    action: Moves focus to the next article (the APG feed command).
    from: inside
    expect: manual
  - keys:
    - PageUp
    action: Moves focus to the previous article.
    from: inside
    expect: manual
  - keys:
    - Control+End
    action: Moves focus to the first focusable element after the feed in the document;
      with `hasMore`, instead triggers a load (press again once it has loaded and
      `hasMore` is false).
    from: inside
    expect: manual
  - keys:
    - Control+Home
    action: Moves focus to the new-items button when shown, else to the last focusable
      element before the feed in the document.
    from: inside
    expect: manual
  styles:
    itemGap:
      token: layout.gap.normal
      locked: false
    articleInset:
      token: layout.inset.md
      description: Passed to each Card as its inset.
      locked: false
    unreadBorder:
      token: color.control.selectedBackground
      description: Start-edge bar on unread articles, paired with the visually-hidden
        "unread" word.
      locked: true
    unreadBorderWidth:
      token: border.width.focus
      locked: true
    timestampColor:
      token: color.foreground.muted
      locked: true
    timestampSize:
      token: font.size.xs
      locked: false
    newItemsOffset:
      token: space.3
      description: Padding-block-start of the sticky new-items row (it is the first
        child, so padding, not a margin).
      locked: false
    loadingInset:
      token: layout.inset.md
      description: Padding around the loading indicator.
      locked: false
    endMessageInset:
      token: layout.inset.md
      description: Padding around the end message.
      locked: false
    endMessageColor:
      token: color.foreground.muted
      locked: true
    endMessageSize:
      token: font.size.sm
      locked: false
    fontFamily:
      token: font.family.body
      locked: false
    focusRing:
      token: color.border.focus
      locked: true
    focusRingWidth:
      token: border.width.focus
      locked: true
  copy:
    showNew: Show {count} new
    loading: Loading more
    end: You are all caught up.
    unread: unread
    position: '{index} of {total}'
    empty: Nothing here yet.
    justNow: just now
    minutesAgo: '{n} min ago'
    hoursAgo: '{n} hr ago'
    daysAgo: '{n} d ago'
  a11y:
    role: feed
    requires:
    - accessible-name
    - heading-hierarchy
    - keyboard-operable
    - focus-visible
    - contrast-aa
    - live-region
    - reduced-motion
    contrast:
    - foreground: color.foreground
      background: color.background
      level: AA
    - foreground: color.foreground.muted
      background: color.background
      level: AA
    - foreground: color.control.selectedBackground
      background: color.background
      level: AA
      large: true
  platforms:
    web:
      element: div
      attributes:
      - role=feed
      - aria-label
      - aria-busy
      - role=article
      - aria-labelledby
      - aria-describedby
      - aria-posinset
      - aria-setsize
      - tabindex=-1
      notes: 'A <div role="feed" aria-label aria-busy> of Cards (`focusable`, so each
        is an <article tabindex="-1"> that draws its own ring) given role="article"
        aria-describedby={timestampId} aria-posinset aria-setsize={total or -1 when
        hasMore} through rest props; Card labels itself by its heading. copy.position
        is a visually-hidden span rendered only when the total is known (hasMore false).
        The heading row is Card''s own header; Feed''s articleBody holds the timestamp
        then the content, articleActions the footer row. Articles are focusable so
        PageUp/PageDown and screen-reader browse mode land on them; the feed handles
        those keys when focus is within an article. An IntersectionObserver on the
        last article triggers onLoadMore with rootMargin of one viewport; another
        at 50% visibility for a second drives onItemVisible. New items are never inserted
        at the top automatically: the newItemsButton (Button secondary, sm) is sticky
        at the top and its press prepends and moves focus to the first new article.
        The loading indicator is an indeterminate ProgressBar with label copy.loading,
        aria-busy on the feed while loading. Under reduced motion no scroll animation.'
    lit:
      tag: ds-feed
      reflect:
      - has-more
      - loading
      - heading-level
      - new-items-count
      notes: '`items` as a property (`content` and `actions` typed as any lit-html
        renderable); articles rendered in the shadow root as <ds-card focusable> with
        slotted content templates; Card labels itself. Ctrl+Home/End walk the document
        for focusables (shadow-piercing, as FocusScope). Composed `load-more`, `show-new`,
        `item-visible`.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityLabel
      - onEndReached
      - onEndReachedThreshold
      - onViewableItemsChanged
      - ListFooterComponent
      - maintainVisibleContentPosition
      notes: 'A FlatList newest-first with onEndReached (threshold 1 screen) for onLoadMore,
        ListFooterComponent for the loading indicator / end message, maintainVisibleContentPosition
        so prepending via onShowNew does not jump, and the new-items Button rendered
        above the list. Articles are Cards left un-collapsed (no `accessible` on the
        Card: collapsing would hide the action Buttons and Links from focus), with
        visually-hidden Text runs for copy.unread and, when the total is known, copy.position
        after the heading. There is no hardware-keyboard feed model on native (no
        Page or Ctrl keys); screen readers use their own browse gestures. The absolute
        time is not exposed on native. onViewableItemsChanged with 50% for one second
        drives onItemVisible.'
    swiftui:
      element: ScrollView
      props:
      - ScrollView
      - LazyVStack
      - Card
      - .accessibilityElement=contain
      - .accessibilityLabel
      - .accessibilityAddTraits=updatesFrequently
      - .onScrollTargetVisibilityChange
      - ProgressBar
      - Button
      - AccessibilityNotification
      - ScrollViewReader
      notes: 'A `ScrollView` + `LazyVStack` of `Card focusable` articles inside a
        `.contain` element labelled by `label` with `.updatesFrequently`; each Card
        gets `.accessibilityValue(copy.position)` when the total is known and the
        hidden `unread` word. Load-more fires from `.onScrollTargetVisibilityChange`
        on the last article (threshold one screen) and once on appear when empty with
        `hasMore`; visibility for `onItemVisible` from the same observer with a one-second
        timer. New items are never inserted automatically: the sticky new-items `Button`
        prepends and `ScrollViewReader` scrolls to the first new article, which receives
        VoiceOver focus. PageUp/PageDown/Ctrl+Home/End on iPad move `@AccessibilityFocusState`/`@FocusState`
        between articles; VoiceOver users get the rotor. Relative time from the copy
        strings; the absolute date is the article''s `accessibilityHint`.'
```

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `itemGap`, `articleInset`, `timestampSize`, `newItemsOffset`, `loadingInset`, `endMessageInset`, `endMessageSize`, `fontFamily`
Locked (accessibility-bearing, never overridable): `unreadBorder`, `unreadBorderWidth`, `timestampColor`, `endMessageColor`, `focusRing`, `focusRingWidth`

## Behavior scenarios (5)

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
- name: has-accessible-name
  then:
  - name: true
  derived: true
```

## Platform notes (web)

```yaml
element: div
attributes:
- role=feed
- aria-label
- aria-busy
- role=article
- aria-labelledby
- aria-describedby
- aria-posinset
- aria-setsize
- tabindex=-1
notes: 'A <div role="feed" aria-label aria-busy> of Cards (`focusable`, so each is
  an <article tabindex="-1"> that draws its own ring) given role="article" aria-describedby={timestampId}
  aria-posinset aria-setsize={total or -1 when hasMore} through rest props; Card labels
  itself by its heading. copy.position is a visually-hidden span rendered only when
  the total is known (hasMore false). The heading row is Card''s own header; Feed''s
  articleBody holds the timestamp then the content, articleActions the footer row.
  Articles are focusable so PageUp/PageDown and screen-reader browse mode land on
  them; the feed handles those keys when focus is within an article. An IntersectionObserver
  on the last article triggers onLoadMore with rootMargin of one viewport; another
  at 50% visibility for a second drives onItemVisible. New items are never inserted
  at the top automatically: the newItemsButton (Button secondary, sm) is sticky at
  the top and its press prepends and moves focus to the first new article. The loading
  indicator is an indeterminate ProgressBar with label copy.loading, aria-busy on
  the feed while loading. Under reduced motion no scroll animation.'
```

## Guidance

## Overview

A feed is a list that never quite ends: it grows as you reach the bottom, and newer things arrive at the top. The APG feed pattern exists because this breaks the assumptions of screen readers (content appears while you are reading) and keyboards (Tab through a hundred cards is not navigation), so the feed gives them article-level movement and control over when new items appear.

## When to use

Use a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.

## When not to use

Do not use a Feed for a finite list that fits on a page (a Stack of Cards), for records with comparable fields (Table), or for a chat thread where newest is at the bottom and the user is a participant (a different pattern). Do not use it for content that must be complete on load for legal or accessibility reasons; paginate instead.

## Behavior

Items render newest first; when the last is within a screen of view and `hasMore`, `onLoadMore` fires and a loading indicator appears; when `hasMore` is false the end message shows. PageDown/PageUp move focus between articles, Ctrl+Home/End leave the feed at either end (End loads instead if there is more; press again after). While `loading` with no items the loading indicator shows, not `copy.empty`. New items are announced by the button count, prepended only on request, and focus moves to the first new one. Unread items show a start-edge bar and an "unread" word for assistive technology; `onItemVisible` lets the caller clear it.

## Content guidelines

Headings say what happened, with the actor first ("Ana commented on Invoice 42"). Keep each item's body to a few lines with a Link to the full thing; actions are at most two Buttons. Timestamps are relative with the absolute time available. The end message is friendly and short.

## Accessibility

The container is a `feed` with a name and `aria-busy` while loading (APG feed; WCAG 4.1.2), and each item an `article` labelled by its heading, described by its timestamp, and positioned with `aria-posinset`/`aria-setsize` so a reader knows where they are (1.3.1). Articles are focusable so PageUp/PageDown move article by article, and Ctrl+Home/End escape the feed without tabbing through everything (2.1.1, 2.4.3). New content never moves under the reader; it is offered by a button (2.2.2, 3.2.5). Headings follow the page outline (2.4.6). Unread state is bar plus text, not color alone (1.4.1).

## Platform notes

### Web
Render `<div role="feed" aria-label aria-busy data-ds="Feed">` with the sticky `newItemsButton` when `newItemsCount > 0`, then a `Card focusable heading headingLevel role="article" aria-describedby aria-posinset aria-setsize` per item (Card renders the `<article>`, its heading and the ring) whose body holds a `<time dateTime title>` `Text tone="muted" size="xs"`, the content, and an actions row (`Stack` horizontal, `gap: tight`); a visually-hidden `Text` "unread" and the `unreadBorder` bar when `unread`. Keydown on the feed implements the table when the event target is inside an article. `IntersectionObserver`s for load-more (`rootMargin: '100% 0px'`) and visibility (`threshold: 0.5`, one-second timer). Footer: indeterminate `ProgressBar label={copy.loading} hideLabel` inside `loadingInset` while `loading`, else the end message `Text` inside `endMessageInset` when `!hasMore`. On mount with no items, `hasMore` and not `loading`, fire `onLoadMore` once (there is no last article to observe).

### Lit
`<ds-feed label="Activity" .items=${items} has-more @load-more=${load}></ds-feed>`; shadow articles as `ds-card`; composed events.

### React Native
`FlatList` with `keyExtractor` by id, `onEndReached`, `onEndReachedThreshold={1}`, `maintainVisibleContentPosition={{ minIndexForVisible: 0 }}`, `ListFooterComponent` (ProgressBar or end Text), `onViewableItemsChanged` with `viewabilityConfig { itemVisiblePercentThreshold: 50, minimumViewTime: 1000 }`; items are `Card`s with `accessible` and a composed `accessibilityLabel`; the new-items `Button` above the list.

## Related

Card, Heading, ProgressBar, Table, Toast.
