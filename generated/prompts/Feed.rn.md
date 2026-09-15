# Generate: Feed for React Native

You are generating a production component for the **Design Schema** design system. The component schema below is the source of truth. Do not invent props, events, or styles that are not in it, and do not omit any that are.

## Output

Write `packages/rn/src/Feed.tsx` exporting a typed React Native function component named `Feed`.

## Rules

- React Native 0.87 with its strict TypeScript API (the default): import instance types for refs (`ViewInstance`, `TextInputInstance`, `ScrollViewInstance`, `HostInstance`), whole event types (`TextInputFocusEvent`, `LayoutChangeEvent`), and treat `ViewStyle`/`TextStyle` as read-only.
- React 19: `ref` is a prop; no forwardRef; `useId`. A component that exposes its root declares `ref?: Ref<ViewInstance> | undefined` (the root's instance type) in `FeedProps` and attaches it to the root; never `React.forwardRef`, `useActionState` or `useFormStatus`.
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
- TypeScript 7 with `isolatedDeclarations`: every exported symbol carries an explicit type annotation and no export type is inferred — the component returns `React.JSX.Element` (`| null` when it can render nothing), exported constants, contexts and hooks are annotated, `const meta: Meta<typeof Feed> = …` in stories. `exactOptionalPropertyTypes` (`name?: T | undefined`), `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (`import type`) are on.
- Tests run on Jest 30 with `@react-native/jest-preset` and `@testing-library/react-native` 13 (synchronous `render`/`fireEvent`); the behavior scenarios below become `Feed.test.tsx`.

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

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (dotted names, e.g. `'space.lg'`). Resolve each entry through the theme with `resolveToken(t, ref)` — both `TokenRef` and `resolveToken` are imported from `@design-schema/tokens`, not from `./theme` (dotted → camelCase key), and use the result in place of the binding's default token. This is the ONLY per-instance styling surface: there is no `style` prop, so a screen cannot drift from the system by passing pixels. Locked bindings are not in the type and are ignored if passed.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

The `platforms.rn.props` list names the native props the schema cares about; `overrides` and `testID` apply to every component regardless of whether that list mentions them.

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

## Platform notes (rn)

```yaml
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
  so prepending via onShowNew does not jump, and the new-items Button rendered above
  the list. Articles are Cards left un-collapsed (no `accessible` on the Card: collapsing
  would hide the action Buttons and Links from focus), with visually-hidden Text runs
  for copy.unread and, when the total is known, copy.position after the heading. There
  is no hardware-keyboard feed model on native (no Page or Ctrl keys); screen readers
  use their own browse gestures. The absolute time is not exposed on native. onViewableItemsChanged
  with 50% for one second drives onItemVisible.'
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
