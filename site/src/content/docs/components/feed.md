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
      description: 'What the feed contains ("Activity", "Notifications"). There is no default; an empty label warns in development.'
      a11y: aria-label on the feed.
    items:
      type: array
      required: true
      shape: 'FeedItem[] where FeedItem = { id: string; heading: string; timestamp: string; content: ReactNode; actions?: ReactNode; unread?: boolean }'
      description: 'Articles, newest first. `heading` names the article (a Heading inside the Card); `timestamp` is ISO and rendered relative from the copy strings (`justNow` under a minute, `minutesAgo` under an hour, `hoursAgo` under a day, `daysAgo` under seven days, else the absolute date from Intl.DateTimeFormat in the user''s locale) with the absolute time as its title on web (native shows the relative string only); `unread` marks items the user has not seen. Relative counts are floored (90 seconds is `1 min ago`); a future timestamp shows `justNow`; the absolute date is `Intl.DateTimeFormat(undefined, { dateStyle: ''medium'' })` and the title adds `timeStyle: ''short''`; an unparseable timestamp is shown as given with no title. Relative text is computed at render and does not tick. On React Native the component wraps string or number `content` in the package `Text` (as Disclosure does); other content renders as given.'
    hasMore:
      type: boolean
      default: false
      description: 'More items exist beyond the last; the feed asks for them with `onLoadMore` as the end approaches, and whenever `items` is empty and not `loading` — on mount and again if the caller clears `items` — so an empty feed fetches its first page itself. While the last article stays in view it asks at most once per change of `items`, `hasMore` or `loading`, and never while `loading`.'
    loading:
      type: boolean
      default: false
      description: More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`.
    newItemsCount:
      type: integer
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
      description: 'Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore` and not `loading`; plain End is not a feed command).'
      platforms: { web: onLoadMore, lit: load-more, rn: onEndReached, swiftui: onLoadMore }
      fires: [user]
      timing: { phase: request }
    onShowNew:
      description: 'Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`. Focus moves to the first article once the first item''s id changes; if nothing is prepended, focus stays on the button.'
      platforms: { web: onShowNew, lit: show-new, rn: onShowNew, swiftui: onShowNew }
      fires: [user]
      timing: { phase: request }
    onItemVisible:
      description: 'Fired with an item id when it has been substantially visible for a moment (mark as read). Fires once per item id per mount; an item that scrolls out and back does not fire again.'
      platforms: { web: onItemVisible, lit: item-visible, rn: onViewableItemsChanged, swiftui: onItemVisible }
      payload:
        - { name: id, type: string, description: The item that became visible. }
      fires: [user]
  keyboard:
    - { keys: [Tab], action: 'Moves through interactive content inside the current article and on to the next article''s content in reading order; articles themselves are focusable so the feed commands below work.', from: any, expect: focus-next }
    - { keys: [PageDown], action: 'Moves focus to the next article (the APG feed command).', from: inside, expect: manual }
    - { keys: [PageUp], action: Moves focus to the previous article., from: inside, expect: manual }
    - { keys: [Control+End], action: 'Moves focus to the first focusable element after the feed in the document; with `hasMore`, instead triggers a load, or does nothing while `loading` (press again once it has loaded and `hasMore` is false). Feed commands act only from inside an article, not from the new-items button.', from: inside, expect: manual }
    - { keys: [Control+Home], action: 'Moves focus to the new-items button when shown, else to the last focusable element before the feed in the document.', from: inside, expect: manual }
  styles:
    itemGap: { token: layout.gap.normal }
    articleInset: { token: layout.inset.md, part: article, description: 'Each Card keeps `inset="md"`; the value is forwarded to the Card''s `overrides.paddingBlock` and `overrides.paddingInline` (Card''s `inset` is an sm/md/lg choice and takes no token).' }
    articleBodyGap: { token: layout.gap.tight, part: articleBody, description: 'Between the runs of articleBody (unread word, timestamp, position, content); articleBody is a Stack and this is forwarded as its `overrides.gap`.' }
    unreadBorder: { token: color.control.selectedBackground, part: article, description: 'Start-edge bar on unread articles, paired with the visually-hidden "unread" word. The `article` part is a Feed-owned wrapper around each Card, and the bar is drawn by that wrapper over the Card''s start edge (mirrored in RTL); the Card itself is not restyled.' }
    unreadBorderWidth: { token: border.width.focus, part: article }
    timestampColor: { token: color.foreground.muted, part: timestamp, description: 'Expressed as the composed Text''s `tone="muted"`, not a colour set on the Text.' }
    timestampSize: { token: font.size.xs, part: timestamp, description: 'The composed Text''s `size="xs"`; an override is forwarded to the Text''s `overrides.fontSize`.' }
    newItemsOffset: { token: space.3, description: 'Padding-block-start of the sticky new-items row (it is the first child, so padding, not a margin). On React Native the row is a View above the FlatList, not a sticky header inside it, so it never scrolls away.' }
    newItemsLayer: { token: layer.raised, part: newItemsButton, description: 'Stacking order of the sticky new-items row over the scrolling articles (web and Lit).' }
    loadingInset: { token: layout.inset.md, part: loadingIndicator, description: 'Padding of the Feed-owned loadingIndicator wrapper around the ProgressBar.' }
    endMessageInset: { token: layout.inset.md, part: endMessage, description: 'Padding of the Feed-owned endMessage wrapper around the Text; the wrapper carries the part hook.' }
    endMessageColor: { token: color.foreground.muted, part: endMessage, description: 'Expressed as the composed Text''s `tone="muted"`.' }
    endMessageSize: { token: font.size.sm, part: endMessage, description: 'The composed Text''s `size="sm"`; an override is forwarded to the Text''s `overrides.fontSize`.' }
    emptyStateInset: { token: layout.inset.md, part: emptyState, description: 'Padding of the Feed-owned emptyState wrapper around the Text, as endMessageInset.' }
    emptyStateColor: { token: color.foreground.muted, part: emptyState, description: 'Expressed as the composed Text''s `tone="muted"`.' }
    emptyStateSize: { token: font.size.sm, part: emptyState, description: 'The composed Text''s `size="sm"`; an override is forwarded to the Text''s `overrides.fontSize`.' }
    fontFamily: { token: font.family.body, description: 'The root font (a CSS hook inherited by caller content on web and Lit), also forwarded to the `overrides.fontFamily` of every composed Text (timestamp, end message, empty state, hidden runs, wrapped string content on native) and of the new-items Button. Card''s heading keeps Card''s own font.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  copy:
    showNew:
      text: 'Show {count} new'
      params:
        count: { type: number, description: How many newer items are available above. }
    loading: Loading more
    end: You are all caught up.
    unread: unread
    position:
      text: '{index} of {total}'
      params:
        index: { type: number, description: The article's position in the feed. }
        total: { type: number, description: How many articles the feed holds. }
    empty: Nothing here yet.
    justNow: just now
    minutesAgo:
      text: '{n} min ago'
      params:
        n: { type: number, description: Minutes since the item's timestamp. }
    hoursAgo:
      text: '{n} hr ago'
      params:
        n: { type: number, description: Hours since the item's timestamp. }
    daysAgo:
      text: '{n} d ago'
      params:
        n: { type: number, description: Days since the item's timestamp. }
  a11y:
    role: feed
    requires: [accessible-name, heading-hierarchy, keyboard-operable, focus-visible, contrast-aa, live-region, reduced-motion]
    contrast:
      - { foreground: color.foreground, background: color.background, level: AA }
      - { foreground: color.foreground.muted, background: color.background, level: AA }
      - { foreground: color.control.selectedBackground, background: color.background, level: AA, nonText: true }
  platforms:
    web:
      element: div
      attributes: [role=feed, aria-label, aria-busy, role=article, aria-labelledby, aria-describedby, aria-posinset, aria-setsize, tabindex=-1]
      notes: 'A <div role="feed" aria-label aria-busy> of Cards (`focusable`, so each is an <article tabindex="-1"> that draws its own ring) given role="article" aria-describedby={timestampId} aria-posinset aria-setsize={total or -1 when hasMore} through rest props; Card labels itself by its heading. copy.position is a visually-hidden span rendered only when the total is known (hasMore false). The heading row is Card''s own header; Feed''s articleBody holds, in order, the visually-hidden copy.unread (when unread), the timestamp, the visually-hidden copy.position, then the content; articleActions is the footer row. The hidden runs are plain spans with Feed''s visually-hidden class (Text has no visually-hidden option). The timestamp is a <time dateTime title> carrying data-part="timestamp" and the aria-describedby id, inside a `Text tone="muted" size="xs"` span. Card and Button write their own data-part, so `article` is a Feed-owned wrapper div around each Card and `newItemsButton` is the sticky row wrapping the Button (a test clicks the button inside it). The new-items row is always rendered as role="status" (padded only while shown) so the button''s count is announced when it appears; the end message and loading indicator are not live, aria-busy covers loading. Articles are focusable so PageUp/PageDown and screen-reader browse mode land on them; the feed handles those keys when focus is within an article. An IntersectionObserver on the last article triggers onLoadMore with rootMargin of one viewport; another at 50% visibility for a second drives onItemVisible. New items are never inserted at the top automatically: the newItemsButton (Button secondary, sm) is sticky at the top and its press prepends and moves focus to the first new article. The loading indicator is an indeterminate ProgressBar with label copy.loading, aria-busy on the feed while loading. Under reduced motion no scroll animation.'
    lit:
      tag: ds-feed
      reflect: [has-more, loading, heading-level, new-items-count]
      notes: '`items` as a property (`content` and `actions` typed as any lit-html renderable); articles rendered in the shadow root as <ds-card focusable> with slotted content templates; Card labels itself with aria-label from its heading (ids do not cross shadow roots), so Feed sets no aria-labelledby. Parts, run order, the always-present role="status" new-items row and aria-busy on the host follow the web notes. Ctrl+Home/End walk the document for focusables (shadow-piercing, as FocusScope). Composed `load-more`, `show-new`, `item-visible`.'
    rn:
      element: FlatList
      props: [accessibilityRole=list, accessibilityLabel, accessibilityState.busy, onEndReached, onEndReachedThreshold, onViewableItemsChanged, ListFooterComponent, maintainVisibleContentPosition]
      notes: 'A FlatList newest-first with onEndReached (threshold 1 screen) for onLoadMore, ListFooterComponent for the loading indicator / end message, maintainVisibleContentPosition so prepending via onShowNew does not jump, and the new-items Button rendered above the list. `accessibilityState.busy` follows `loading`. The outer View (new-items row and list) carries testID `Feed` and the FlatList `Feed.container`. There is no status role: the new-items row is `accessibilityLiveRegion="polite"`, which Android announces; iOS does not, and VoiceOver users reach the button at the top of the feed. Articles are Cards left un-collapsed (no `accessible` on the Card: collapsing would hide the action Buttons and Links from focus), with visually-hidden Text runs for copy.unread and, when the total is known, copy.position. Card takes a heading string and a footer slot with nothing between them, so those runs sit before the Card rather than after the heading; the reading order still puts them ahead of the body. Text and Card take no testID, so the timestamp, articleBody and articleActions parts are wrapping Views that carry theirs. There is no hardware-keyboard feed model on native (no Page or Ctrl keys); screen readers use their own browse gestures. The absolute time is not exposed on native. onViewableItemsChanged with 50% for one second drives onItemVisible.'
    swiftui:
      element: ScrollView
      props: [ScrollView, LazyVStack, Card, .accessibilityElement=contain, .accessibilityLabel, .accessibilityAddTraits=updatesFrequently, .onScrollTargetVisibilityChange, ProgressBar, Button, AccessibilityNotification, ScrollViewReader]
      notes: 'A `ScrollView` + `LazyVStack` of `Card focusable` articles inside a `.contain` element labelled by `label` with `.updatesFrequently`; each Card gets `.accessibilityValue(copy.position)` when the total is known and the hidden `unread` word. Load-more fires from `.onScrollTargetVisibilityChange` on the last article (threshold one screen) and once on appear when empty with `hasMore`; visibility for `onItemVisible` from the same observer with a one-second timer. New items are never inserted automatically: the sticky new-items `Button` prepends and `ScrollViewReader` scrolls to the first new article, which receives VoiceOver focus. PageUp/PageDown/Ctrl+Home/End on iPad move `@AccessibilityFocusState`/`@FocusState` between articles; VoiceOver users get the rotor. Relative time from the copy strings; the absolute date is the article''s `accessibilityHint`.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name ones from the schema.
    - name: an-empty-feed-asks-for-its-first-page
      description: With hasMore and no items there is no last article to observe, so the feed fires onLoadMore once on mount.
      given: { items: [], hasMore: true, loading: false }
      then:
        - { event: onLoadMore }
    - name: pressing-show-new-asks-for-the-newer-items
      description: The feed never inserts newer items itself; the button asks, and the caller prepends.
      given: { newItemsCount: 3, items: [{ id: a1, heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' }] }
      when: { click: newItemsButton }
      then:
        - { event: onShowNew }
    - name: the-end-message-shows-when-there-is-nothing-more
      given: { hasMore: false, items: [{ id: a1, heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' }] }
      then:
        - { copy: end }
    - name: a-custom-end-message-replaces-the-default
      given: { hasMore: false, endMessage: 'That is everything from this week.', items: [{ id: a1, heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' }] }
      then:
        - { text: 'That is everything from this week.' }
    - name: an-empty-feed-that-is-not-loading-says-so
      given: { items: [], hasMore: false, loading: false }
      then:
        - { copy: empty }
    - name: loading-marks-the-feed-busy
      description: The feed is aria-busy while more items are being fetched.
      given: { loading: true, hasMore: true }
      then:
        - { attribute: aria-busy, is: 'true' }
      platforms: [web, lit]
  examples:
    - name: activity-stream
      description: The default stream of activity, newest first, with more to load below.
      given: { label: Activity, hasMore: true, items: [{ id: a1, heading: 'Ana commented on Invoice 42', timestamp: '2026-09-15T09:00:00Z', content: 'Looks right to me.' }, { id: a2, heading: 'Bo approved Invoice 41', timestamp: '2026-09-14T16:20:00Z', content: 'Approved for payment.' }] }
    - name: notifications-with-unread-items
      description: Notifications where unread items are marked and three newer ones are waiting above.
      given: { label: Notifications, newItemsCount: 3, items: [{ id: n1, heading: 'Your export is ready', timestamp: '2026-09-15T08:00:00Z', content: 'The March export finished.', unread: true }, { id: n2, heading: 'Invoice 42 was paid', timestamp: '2026-09-14T11:00:00Z', content: 'Payment received.' }] }
    - name: caught-up
      description: The end of a finite stream, with its own closing message.
      given: { label: Activity, hasMore: false, endMessage: 'That is everything from this week.', items: [{ id: a1, heading: 'Bo approved Invoice 41', timestamp: '2026-09-14T16:20:00Z', content: 'Approved for payment.' }] }
    - name: loading-the-next-page
      description: A feed fetching its next page under headings that fit a page whose outline starts at level 2.
      given: { label: Audit events, hasMore: true, loading: true, headingLevel: '2', items: [{ id: e1, heading: 'Role changed for Ana', timestamp: '2026-09-15T07:00:00Z', content: 'Editor to Admin.' }] }
---

A feed is a list that never quite ends: it grows as you reach the bottom, and newer things arrive at the top. The APG feed pattern exists because this breaks the assumptions of screen readers (content appears while you are reading) and keyboards (Tab through a hundred cards is not navigation), so the feed gives them article-level movement and control over when new items appear.

## When to use

Use a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.

## When not to use

Do not use a Feed for a finite list that fits on a page (a Stack of Cards), for records with comparable fields (Table), or for a chat thread where newest is at the bottom and the user is a participant (a different pattern). Do not use it for content that must be complete on load for legal or accessibility reasons; paginate instead.

## Behavior

Items render newest first; when the last is within a screen of view and `hasMore`, `onLoadMore` fires and a loading indicator appears; when `hasMore` is false the end message shows. PageDown/PageUp move focus between articles, Ctrl+Home/End leave the feed at either end (End loads instead if there is more; press again after). While `loading` with no items the loading indicator shows, not `copy.empty`; `copy.empty` shows only with no items, not `loading` and `hasMore` false, so an empty feed about to fetch stays blank rather than flashing it. New items are announced by the button count, prepended only on request, and focus moves to the first new one. Unread items show a start-edge bar and an "unread" word for assistive technology; `onItemVisible` lets the caller clear it.

## Content guidelines

Headings say what happened, with the actor first ("Ana commented on Invoice 42"). Keep each item's body to a few lines with a Link to the full thing; actions are at most two Buttons. Timestamps are relative with the absolute time available. The end message is friendly and short.

## Accessibility

The container is a `feed` with a name and `aria-busy` while loading (APG feed; WCAG 4.1.2), and each item an `article` labelled by its heading, described by its timestamp, and positioned with `aria-posinset`/`aria-setsize` so a reader knows where they are (1.3.1). Articles are focusable so PageUp/PageDown move article by article, and Ctrl+Home/End escape the feed without tabbing through everything (2.1.1, 2.4.3). New content never moves under the reader; it is offered by a button (2.2.2, 3.2.5). Headings follow the page outline (2.4.6). Unread state is bar plus text, not color alone (1.4.1).

## Platform notes

### Web
Render `<div role="feed" aria-label aria-busy data-ds="Feed">` with the sticky `newItemsButton` when `newItemsCount > 0`, then a `Card focusable heading headingLevel role="article" aria-describedby aria-posinset aria-setsize` per item (Card renders the `<article>`, its heading and the ring) whose body holds a `<time dateTime title>` inside `Text tone="muted" size="xs"`, the content, and an actions row (`Stack` horizontal, `gap: tight`); a visually-hidden span "unread" and the `unreadBorder` bar on the Feed-owned article wrapper when `unread`. Keydown on the feed implements the table when the event target is inside an article. `IntersectionObserver`s for load-more (`rootMargin: '100% 0px'`) and visibility (`threshold: 0.5`, one-second timer). Footer: indeterminate `ProgressBar label={copy.loading} hideLabel` inside `loadingInset` while `loading`, else the end message `Text` inside `endMessageInset` when `!hasMore`. On mount with no items, `hasMore` and not `loading`, fire `onLoadMore` once (there is no last article to observe).

### Lit
`<ds-feed label="Activity" .items=${items} has-more @load-more=${load}></ds-feed>`; shadow articles as `ds-card`; composed events.

### React Native
`FlatList` with `keyExtractor` by id, `onEndReached`, `onEndReachedThreshold={1}`, `maintainVisibleContentPosition={{ minIndexForVisible: 0 }}`, `ListFooterComponent` (ProgressBar or end Text), `onViewableItemsChanged` with `viewabilityConfig { itemVisiblePercentThreshold: 50, minimumViewTime: 1000 }`; items are `Card`s left un-collapsed (no `accessible`, so their Buttons and Links stay focusable) preceded by visually-hidden `Text` runs for unread and position; the new-items `Button` above the list.

## Related

Card, Heading, ProgressBar, Table, Toast.
