---
title: Feed
description: A scrolling list of articles that loads more as the reader reaches the end — an activity stream, notifications, a timeline — with the APG feed keyboard model so screen-reader users can move article by article and load more without losing their place.
component:
  name: Feed
  category: container
  status: review
  apg: feed
  anatomy: [container, article, timestamp, articleBody, articleActions, loadingIndicator, endMessage, newItemsButton, emptyState]
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
      shape: 'FeedItem[] where FeedItem = { id: string; heading: string; timestamp: string; content: ReactNode; actions?: ReactNode; unread?: boolean }'
      description: 'Articles, newest first. `heading` names the article (a Heading inside the Card); `timestamp` is ISO and rendered relative from the copy strings (`justNow` under a minute, `minutesAgo` under an hour, `hoursAgo` under a day, `daysAgo` under seven days, else the absolute date from Intl.DateTimeFormat in the user''s locale) with the absolute time as its title on web (native shows the relative string only); `unread` marks items the user has not seen.'
    hasMore:
      type: boolean
      default: false
      description: 'More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches, and once on mount when `items` is empty and not `loading` (so an empty feed fetches its first page itself).'
    loading:
      type: boolean
      default: false
      description: More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`.
    newItemsCount:
      type: number
      description: 'Number of newer items available above (from polling or a socket). The feed does not insert them — that would shift what the reader is looking at — it shows a "Show {count} new" button at the top which prepends and scrolls.'
    headingLevel:
      type: enum
      values: ['2', '3', '4']
      default: '3'
      description: Heading level for article headings, matching the page outline.
    endMessage:
      type: string
      description: 'Shown after the last item when `hasMore` is false (and `items` is not empty). Defaults to `copy.end`.'
  events:
    onLoadMore:
      description: 'Fired when the last rendered article is within one screen of view (or on End / Ctrl+End with `hasMore`).'
      platforms: { web: onLoadMore, lit: load-more, rn: onEndReached, swiftui: onLoadMore }
    onShowNew:
      description: Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`.
      platforms: { web: onShowNew, lit: show-new, rn: onShowNew, swiftui: onShowNew }
    onItemVisible:
      description: 'Fired with an item id when it has been substantially visible for a moment (mark as read).'
      platforms: { web: onItemVisible, lit: item-visible, rn: onViewableItemsChanged, swiftui: onItemVisible }
  keyboard:
    - { keys: [Tab], action: 'Moves through interactive content inside the current article and on to the next article''s content in reading order; articles themselves are focusable so the feed commands below work.', from: any, expect: focus-next }
    - { keys: [PageDown], action: 'Moves focus to the next article (the APG feed command).', from: inside, expect: manual }
    - { keys: [PageUp], action: Moves focus to the previous article., from: inside, expect: manual }
    - { keys: [Ctrl+End], action: 'Moves focus to the first focusable element after the feed in the document; with `hasMore`, instead triggers a load (press again once it has loaded and `hasMore` is false).', from: inside, expect: manual }
    - { keys: [Ctrl+Home], action: 'Moves focus to the new-items button when shown, else to the last focusable element before the feed in the document.', from: inside, expect: manual }
  styles:
    itemGap: { token: layout.gap.normal }
    articleInset: { token: layout.inset.md, description: Passed to each Card as its inset. }
    unreadBorder: { token: color.control.selectedBackground, description: 'Start-edge bar on unread articles, paired with the visually-hidden "unread" word.' }
    unreadBorderWidth: { token: border.width.focus }
    timestampColor: { token: color.foreground.muted }
    timestampSize: { token: font.size.xs }
    newItemsOffset: { token: space.3, description: 'Padding-block-start of the sticky new-items row (it is the first child, so padding, not a margin).' }
    loadingInset: { token: layout.inset.md, description: 'Padding around the loading indicator.' }
    endMessageInset: { token: layout.inset.md, description: 'Padding around the end message.' }
    endMessageColor: { token: color.foreground.muted }
    endMessageSize: { token: font.size.sm }
    fontFamily: { token: font.family.body }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    showNew: 'Show {count} new'
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
    requires: [accessible-name, heading-hierarchy, keyboard-operable, focus-visible, contrast-aa, live-region, reduced-motion]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, large: true }
  platforms:
    web:
      element: div
      attributes: [role=feed, aria-label, aria-busy, role=article, aria-labelledby, aria-describedby, aria-posinset, aria-setsize, tabindex=-1]
      notes: 'A <div role="feed" aria-label aria-busy> of Cards (`focusable`, so each is an <article tabindex="-1"> that draws its own ring) given role="article" aria-describedby={timestampId} aria-posinset aria-setsize={total or -1 when hasMore} through rest props; Card labels itself by its heading. copy.position is a visually-hidden span rendered only when the total is known (hasMore false). The heading row is Card''s own header; Feed''s articleBody holds the timestamp then the content, articleActions the footer row. Articles are focusable so PageUp/PageDown and screen-reader browse mode land on them; the feed handles those keys when focus is within an article. An IntersectionObserver on the last article triggers onLoadMore with rootMargin of one viewport; another at 50% visibility for a second drives onItemVisible. New items are never inserted at the top automatically: the newItemsButton (Button secondary, sm) is sticky at the top and its press prepends and moves focus to the first new article. The loading indicator is an indeterminate ProgressBar with label copy.loading, aria-busy on the feed while loading. Under reduced motion no scroll animation.'
    lit:
      tag: ds-feed
      reflect: [has-more, loading, heading-level, new-items-count]
      notes: '`items` as a property (`content` and `actions` typed as any lit-html renderable); articles rendered in the shadow root as <ds-card focusable> with slotted content templates; Card labels itself. Ctrl+Home/End walk the document for focusables (shadow-piercing, as FocusScope). Composed `load-more`, `show-new`, `item-visible`.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityLabel, onEndReached, onEndReachedThreshold, onViewableItemsChanged, ListFooterComponent, maintainVisibleContentPosition]
      notes: 'A FlatList newest-first with onEndReached (threshold 1 screen) for onLoadMore, ListFooterComponent for the loading indicator / end message, maintainVisibleContentPosition so prepending via onShowNew does not jump, and the new-items Button rendered above the list. Articles are Cards left un-collapsed (no `accessible` on the Card: collapsing would hide the action Buttons and Links from focus), with visually-hidden Text runs for copy.unread and, when the total is known, copy.position after the heading. There is no hardware-keyboard feed model on native (no Page or Ctrl keys); screen readers use their own browse gestures. The absolute time is not exposed on native. onViewableItemsChanged with 50% for one second drives onItemVisible.'
    swiftui:
      element: ScrollView
      props: [ScrollView, LazyVStack, Card, .accessibilityElement=contain, .accessibilityLabel, .accessibilityAddTraits=updatesFrequently, .onScrollTargetVisibilityChange, ProgressBar, Button, AccessibilityNotification, ScrollViewReader]
      notes: 'A `ScrollView` + `LazyVStack` of `Card focusable` articles inside a `.contain` element labelled by `label` with `.updatesFrequently`; each Card gets `.accessibilityValue(copy.position)` when the total is known and the hidden `unread` word. Load-more fires from `.onScrollTargetVisibilityChange` on the last article (threshold one screen) and once on appear when empty with `hasMore`; visibility for `onItemVisible` from the same observer with a one-second timer. New items are never inserted automatically: the sticky new-items `Button` prepends and `ScrollViewReader` scrolls to the first new article, which receives VoiceOver focus. PageUp/PageDown/Ctrl+Home/End on iPad move `@AccessibilityFocusState`/`@FocusState` between articles; VoiceOver users get the rotor. Relative time from the copy strings; the absolute date is the article''s `accessibilityHint`.'
---

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
