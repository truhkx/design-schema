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
      description: 'What the feed contains ("Activity", "Notifications"). There is
        no default; an empty or whitespace-only label warns once per mount in development,
        with the wording "Feed: label is the accessible name of the feed and must
        not be empty."'
      a11y: aria-label on the feed.
    items:
      type: array
      required: true
      shape: 'FeedItem[] where FeedItem = { id: string; heading: string; timestamp:
        string; content: ReactNode; actions?: ReactNode; unread?: boolean }'
      description: 'Articles, newest first. `heading` names the article (a Heading
        inside the Card); `timestamp` is ISO and rendered relative from the copy strings
        (`justNow` under a minute, `minutesAgo` under an hour, `hoursAgo` under a
        day, `daysAgo` under seven days — strictly under, so at exactly seven days
        the absolute date shows — else the absolute date from Intl.DateTimeFormat
        in the user''s locale) with the absolute time as its title on web (native
        shows the relative string only); `unread` marks items the user has not seen.
        Relative counts are floored (90 seconds is `1 min ago`); a future timestamp
        shows `justNow`; the absolute date is `Intl.DateTimeFormat(undefined, { dateStyle:
        ''medium'' })` and the title adds `timeStyle: ''short''`; an unparseable timestamp
        is shown as given with no title. Relative text is computed at render and does
        not tick. On React Native the component wraps string or number `content` in
        the package `Text` (as Disclosure does); other content renders as given.'
    hasMore:
      type: boolean
      default: false
      description: More items exist beyond the last; the feed asks for them with `onLoadMore`
        as the end approaches, and whenever `items` is empty and not `loading` — on
        mount and again if the caller clears `items` — so an empty feed fetches its
        first page itself. While the last article stays in view it asks at most once
        per change of the last item's id, `hasMore` or `loading`, and never while
        `loading`; a prepend from `onShowNew` leaves the last id unchanged, so it
        does not ask again. A `loading` cycle that ends with the same last id re-arms
        the request, so a page that failed can be asked for again while the reader
        is still at the end.
    loading:
      type: boolean
      default: false
      description: More items are being fetched; a loading indicator is shown after
        the last article and the feed is `aria-busy`.
    newItemsCount:
      type: integer
      description: 'Number of newer items available above (from polling or a socket).
        The feed does not insert them — that would shift what the reader is looking
        at — it shows a "Show {count} new" button at the top which prepends and scrolls.
        Undefined, zero or a negative count shows no button; the live row stays in
        the DOM unpadded so the count is announced the moment it first appears. A
        fractional count is the caller''s error, not the component''s to repair: it
        is interpolated into `copy.showNew` as given, with no truncation.'
    headingLevel:
      type: enum
      values:
      - '2'
      - '3'
      - '4'
      default: '3'
      description: Heading level for article headings, matching the page outline.
        React Native has no heading levels and Card renders every article heading
        at one size, so the level is passed to Card for parity and changes nothing
        a user or a test can see there.
    endMessage:
      type: string
      description: Shown after the last item when `hasMore` is false (and `items`
        is not empty). Defaults to `copy.end`.
  events:
    onLoadMore:
      description: Fired when the last rendered article is within one screen of view
        (or on Ctrl+End with `hasMore` and not `loading`; plain End is not a feed
        command).
      platforms:
        web: onLoadMore
        lit: load-more
        rn: onEndReached
        swiftui: onLoadMore
      fires:
      - user
      timing:
        phase: request
    onShowNew:
      description: 'Fired when the new-items button is pressed; the caller prepends
        the items and clears `newItemsCount`. Focus moves to the first article once
        the first item''s id changes; if nothing is prepended, focus stays on the
        button. The pending focus request lives until the next change of `items` —
        a change of the item ids in order, not of the array''s identity, so a caller
        that re-renders a fresh array with the same ids keeps the request — and no
        further: that change moves focus when it puts a new id first, and otherwise
        drops the request, so an unrelated later prepend never steals focus. The move
        is web, Lit and SwiftUI only — nothing can focus a View by script on iOS or
        Android, so React Native relies on `maintainVisibleContentPosition` and leaves
        focus on the button.'
      platforms:
        web: onShowNew
        lit: show-new
        rn: onShowNew
        swiftui: onShowNew
      fires:
      - user
      timing:
        phase: request
    onItemVisible:
      description: 'Fired with an item id when it has been substantially visible for
        a moment (mark as read). Fires once per item id per mount; an item that scrolls
        out and back does not fire again, nor does an id removed from `items` and
        added back. The dedupe is the component''s, not the observer''s: React Native
        applies it on top of `onViewableItemsChanged`, which re-fires on every re-entry.'
      platforms:
        web: onItemVisible
        lit: item-visible
        rn: onViewableItemsChanged
        swiftui: onItemVisible
      payload:
      - name: id
        type: string
        description: The item that became visible.
      fires:
      - user
  keyboard:
  - keys:
    - Tab
    action: Moves through interactive content inside the current article and on to
      the next article's content in reading order; articles are focusable but never
      tab stops (Card `focusable` renders `tabindex="-1"`, so a hundred cards are
      not a hundred stops), and focus reaches one by pointer, by Ctrl+Home/End returning,
      or through a screen reader's browse mode — the feed commands below act from
      there.
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
      with `hasMore`, instead triggers a load, or does nothing while `loading` (press
      again once it has loaded and `hasMore` is false). Feed commands act only from
      inside an article, not from the new-items button. The key is always consumed
      there, the `loading` case included, so a feed command never falls through to
      the browser's scroll to the end of the document.
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
      part: article
      description: Each Card keeps `inset="md"`; the value is forwarded to the Card's
        `overrides.paddingBlock` and `overrides.paddingInline` (Card's `inset` is
        an sm/md/lg choice and takes no token).
      locked: false
    articleBodyGap:
      token: layout.gap.tight
      part: articleBody
      description: Between the runs of articleBody (unread word, timestamp, position,
        content); articleBody is a Stack and this is forwarded as its `overrides.gap`.
      locked: false
    unreadBorder:
      token: color.control.selectedBackground
      part: article
      description: Start-edge bar on unread articles, paired with the visually-hidden
        "unread" word. The `article` part is a Feed-owned wrapper around each Card,
        and the bar is drawn by that wrapper over the Card's start edge (mirrored
        in RTL); the Card itself is not restyled. On React Native there is no overlay
        without a negative offset, so the wrapper draws a start border instead, which
        insets the Card by the bar's width. Read articles reserve nothing in its place,
        so on that platform an unread row's Card starts `unreadBorderWidth` further
        in than a read one; the shift is accepted rather than padded away, since padding
        every read row would inset the whole feed for the sake of a few marks.
      locked: true
    unreadBorderWidth:
      token: border.width.focus
      part: article
      locked: true
    articleRadius:
      token: radius.lg
      part: article
      description: 'Corner radius of the Feed-owned article wrapper, matching Card''s
        own default radius. It matters where the wrapper draws something of its own:
        on Lit the wrapper is the article and draws the focus ring, which would otherwise
        be a square around a rounded Card; on web and React Native it only rounds
        the ends of the unread bar.'
      locked: false
    timestampColor:
      token: color.foreground.muted
      part: timestamp
      description: Expressed as the composed Text's `tone="muted"`, not a colour set
        on the Text.
      locked: true
    timestampSize:
      token: font.size.xs
      part: timestamp
      description: The composed Text's `size="xs"`; an override is forwarded to the
        Text's `overrides.fontSize`. The `timestamp` part hook sits on the `<time>`
        element inside that Text, so the size applies to the wrapping Text rather
        than to the part element — as the endMessage and emptyState sizes apply to
        the Text inside their part wrapper. On React Native the part hook sits on
        a wrapping View instead (Text takes no testID) and both `size="xs"` and the
        override go to the Text inside it, so the part element is again not the styled
        one.
      locked: false
    newItemsOffset:
      token: space.3
      description: Padding-block-start of the sticky new-items row (it is the first
        child, so padding, not a margin). On React Native the row is a View above
        the FlatList, not a sticky header inside it, so it never scrolls away.
      locked: false
    newItemsLayer:
      token: layer.raised
      part: newItemsButton
      description: Stacking order of the sticky new-items row over the scrolling articles
        (web and Lit). On React Native the row is a sibling View above the FlatList
        with nothing to overlap, so the value changes nothing there; it is still applied
        as `zIndex`, which under react-native-web does stack, so an override resolves.
      locked: false
    loadingInset:
      token: layout.inset.md
      part: loadingIndicator
      description: Padding of the Feed-owned loadingIndicator wrapper around the ProgressBar.
      locked: false
    endMessageInset:
      token: layout.inset.md
      part: endMessage
      description: Padding of the Feed-owned endMessage wrapper around the Text; the
        wrapper carries the part hook.
      locked: false
    endMessageColor:
      token: color.foreground.muted
      part: endMessage
      description: Expressed as the composed Text's `tone="muted"`.
      locked: true
    endMessageSize:
      token: font.size.sm
      part: endMessage
      description: The composed Text's `size="sm"`; an override is forwarded to the
        Text's `overrides.fontSize`.
      locked: false
    emptyStateInset:
      token: layout.inset.md
      part: emptyState
      description: Padding of the Feed-owned emptyState wrapper around the Text, as
        endMessageInset.
      locked: false
    emptyStateColor:
      token: color.foreground.muted
      part: emptyState
      description: Expressed as the composed Text's `tone="muted"`.
      locked: true
    emptyStateSize:
      token: font.size.sm
      part: emptyState
      description: The composed Text's `size="sm"`; an override is forwarded to the
        Text's `overrides.fontSize`.
      locked: false
    fontFamily:
      token: font.family.body
      description: The root font (a CSS hook inherited by caller content on web and
        Lit), also forwarded to the `overrides.fontFamily` of every composed Text
        (timestamp, end message, empty state, hidden runs, wrapped string content
        on native) and of the new-items Button. Card's heading keeps Card's own font.
      locked: false
    focusRing:
      token: color.border.focus
      description: 'Child-owned on web and React Native: the article ring is drawn
        by the composed Card and the button ring by the composed Button, and the binding
        only names the token a theme has to keep in step. On Lit the article wrapper
        is itself the focus target (the Card cannot be `focusable` there), so Feed
        draws that ring — an outline in this colour over `articleRadius` corners,
        with no offset, mirroring Card''s own focus treatment.'
      locked: true
    focusRingWidth:
      token: border.width.focus
      description: 'Width of that ring, on the same elements: child-owned on web and
        React Native, the wrapper''s outline width on Lit.'
      locked: true
  copy:
    showNew:
      text: Show {count} new
      params:
        count:
          type: number
          description: How many newer items are available above.
    loading: Loading more
    end: You are all caught up.
    unread: unread
    position:
      text: '{index} of {total}'
      params:
        index:
          type: number
          description: The article's position in the feed.
        total:
          type: number
          description: How many articles the feed holds.
    empty: Nothing here yet.
    justNow: just now
    minutesAgo:
      text: '{n} min ago'
      params:
        n:
          type: number
          description: Minutes since the item's timestamp.
    hoursAgo:
      text: '{n} hr ago'
      params:
        n:
          type: number
          description: Hours since the item's timestamp.
    daysAgo:
      text: '{n} d ago'
      params:
        n:
          type: number
          description: Days since the item's timestamp.
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
      nonText: true
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
        The heading row is Card''s own header; Feed''s articleBody holds, in order,
        the visually-hidden copy.unread (when unread), the timestamp, the visually-hidden
        copy.position, then the content; articleActions is the footer row. The hidden
        runs are plain spans with Feed''s visually-hidden class (Text has no visually-hidden
        option). The timestamp is a <time dateTime title> carrying data-part="timestamp"
        and the aria-describedby id, inside a `Text tone="muted" size="xs"` span.
        Card, Button and Stack all write their own data-part, so `article` is a Feed-owned
        wrapper div around each Card, `newItemsButton` is the sticky row wrapping
        the Button (a test clicks the button inside it), and `articleBody`/`articleActions`
        are Feed-owned wrappers with `display: contents` around their Stack (the gap
        still reaches the Stack). The `article` part element is therefore the wrapper,
        not the role="article" Card inside it: the wrapper carries the part and the
        unread bar, the Card carries the role, aria-posinset/aria-setsize and aria-describedby.
        The empty state is a Feed-owned wrapper after the feed element, like the end
        message, and is not a live region — only the new-items row is role="status",
        and aria-busy covers loading. The new-items row is always rendered as role="status"
        (padded only while shown) so the button''s count is announced when it appears;
        the end message and loading indicator are not live, aria-busy covers loading.
        Articles are focusable so PageUp/PageDown and screen-reader browse mode land
        on them; the feed handles those keys when focus is within an article. An IntersectionObserver
        on the last article triggers onLoadMore with rootMargin of one viewport; another
        at 50% visibility for a second drives onItemVisible. New items are never inserted
        at the top automatically: the newItemsButton (Button secondary, sm) is sticky
        at the top and its press prepends and moves focus to the first new article.
        The loading indicator is an indeterminate ProgressBar with label copy.loading,
        aria-busy on the feed while loading. Under reduced motion no scroll animation.
        role="feed" goes on the element whose direct children are the article wrappers,
        not on an ancestor: ARIA requires a feed to own its article children. A wrapper
        that has no role, no global aria attribute and no tabindex is descended through
        — axe''s aria-required-children looks past the Feed-owned article wrapper
        and finds the Card''s role="article" — while any child whose own role is something
        else is reported as unallowed. So the items column itself carries role="feed"
        with the label and aria-busy and is the `container` part, its only children
        are the article wrappers, and every piece of chrome is a sibling outside it:
        the role="status" new-items row, the loading indicator (a progressbar), the
        end message and the empty state (a Text, so a paragraph) would each be an
        unallowed child. data-ds="Feed", the override hooks and the keydown handler
        sit on the Feed-owned outer shell around the column. An empty feed cannot
        own an article and `feed` is not in axe''s reviewEmpty list, so the column
        carries role/aria-label/aria-busy only when it holds at least one article
        or is `loading`; with neither it is a plain container holding copy.empty,
        and the feed has no named region until it has something to own.'
    lit:
      tag: ds-feed
      reflect:
      - has-more
      - loading
      - heading-level
      - new-items-count
      notes: '`items` as a property (`content` and `actions` typed as any lit-html
        renderable); articles rendered in the shadow root as Feed-owned wrappers around
        <ds-card> with slotted content templates. The wrapper is the article on this
        platform, not the Card: a negative tabindex on a shadow host takes the host''s
        whole flat-tree subtree out of sequential focus navigation, so a <ds-card
        focusable> would make every Link and Button inside an article unreachable
        by Tab (a WCAG 2.1.1 failure). The wrapper therefore carries role="article",
        tabindex="-1", aria-label copied from the item heading (ids do not cross shadow
        roots, so the name is copied rather than referenced), aria-describedby for
        the timestamp (which lives in the same shadow root), aria-posinset/aria-setsize,
        and draws the focus ring; the ds-card takes role="none" and is not `focusable`.
        role="feed", the label and aria-busy go on the items column in the shadow
        root and never on the host, which nothing walking the column can see. Stack
        and Card write their own data-part inside their own shadow roots, so `articleBody`
        and `articleActions` sit directly on the ds-stack hosts and need none of the
        web display:contents wrappers — that rationale is web-only, and only `article`
        and `newItemsButton` are Feed-owned here. Run order, the always-present role="status"
        new-items row, the chrome-as-siblings rule and the empty-feed role drop follow
        the web notes. Ctrl+Home/End walk the document for focusables (shadow-piercing,
        as FocusScope). No `shadowRootOptions.delegatesFocus`: the host is not focusable
        and delegating would pull focus into the first article on any click in the
        feed''s whitespace — the package declares it for focusable hosts only. After
        `show-new` the first new article is scrolled into view (smooth normally, instant
        under `prefers-reduced-motion`), which is the feed''s only motion on this
        platform. Composed `load-more`, `show-new`, `item-visible`.'
    rn:
      element: FlatList
      props:
      - accessibilityRole=list
      - accessibilityLabel
      - accessibilityState.busy
      - onEndReached
      - onEndReachedThreshold
      - onViewableItemsChanged
      - ListFooterComponent
      - maintainVisibleContentPosition
      notes: 'A FlatList newest-first with onEndReached (threshold 1 screen) for onLoadMore,
        ListFooterComponent for the loading indicator / end message, maintainVisibleContentPosition
        so prepending via onShowNew does not jump, and the new-items Button rendered
        above the list. `accessibilityState.busy` follows `loading`. The outer View
        (new-items row and list) carries testID `Feed` and the FlatList `Feed.container`.
        React Native has no `feed` role — neither `AccessibilityRole` nor `Role` carries
        one — so `list` is the substitute and a feed is announced here as a plain
        list named by `accessibilityLabel`, without the APG feed semantics; a test
        looks for `list`, never `feed`. A list owns list items, so the Feed-owned
        `article` wrapper carries `role="listitem"` (there is no article role either),
        and so do the `ListFooterComponent` loading and end wrappers and the `ListEmptyComponent`
        wrapper: they render inside the FlatList and cannot leave it without leaving
        the scrolling area, so on this platform the loading row, the end message and
        the empty state are counted as rows of the list, where web and Lit keep them
        outside the feed element. There is no status role: the new-items row is always
        rendered with `accessibilityLiveRegion="polite"` and padded only while shown,
        as the web row is — a region that mounts together with its text is not reliably
        announced on Android. Android announces it; iOS does not, and VoiceOver users
        reach the button at the top of the feed. Articles are Cards left un-collapsed
        (no `accessible` on the Card: collapsing would hide the action Buttons and
        Links from focus), with visually-hidden Text runs for copy.unread and, when
        the total is known, copy.position. Card takes a heading string and a footer
        slot with nothing between them, so those runs sit before the Card rather than
        after the heading; the reading order still puts them ahead of the body. Text
        and Card take no testID, so the timestamp, articleBody and articleActions
        parts are wrapping Views that carry theirs. There is no hardware-keyboard
        feed model on native (no Page or Ctrl keys); screen readers use their own
        browse gestures, so the Keyboard story the rules require is a visual and axe
        fixture here rather than a keyboard one — none of the four feed commands exists
        on this platform. The absolute time is not exposed on native. onViewableItemsChanged
        with 50% for one second drives onItemVisible, deduped once per id per mount
        as the event describes.'
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
  behavior:
  - name: an-empty-feed-asks-for-its-first-page
    description: With hasMore and no items there is no last article to observe, so
      the feed fires onLoadMore once on mount.
    given:
      items: []
      hasMore: true
      loading: false
    then:
    - event: onLoadMore
  - name: pressing-show-new-asks-for-the-newer-items
    description: The feed never inserts newer items itself; the button asks, and the
      caller prepends.
    given:
      newItemsCount: 3
      items:
      - id: a1
        heading: Ana commented on Invoice 42
        timestamp: '2026-09-15T09:00:00Z'
        content: Looks right to me.
    when:
      click: newItemsButton
    then:
    - event: onShowNew
  - name: the-end-message-shows-when-there-is-nothing-more
    given:
      hasMore: false
      items:
      - id: a1
        heading: Ana commented on Invoice 42
        timestamp: '2026-09-15T09:00:00Z'
        content: Looks right to me.
    then:
    - copy: end
  - name: a-custom-end-message-replaces-the-default
    given:
      hasMore: false
      endMessage: That is everything from this week.
      items:
      - id: a1
        heading: Ana commented on Invoice 42
        timestamp: '2026-09-15T09:00:00Z'
        content: Looks right to me.
    then:
    - text: That is everything from this week.
  - name: an-empty-feed-that-is-not-loading-says-so
    given:
      items: []
      hasMore: false
      loading: false
    then:
    - copy: empty
  - name: loading-marks-the-feed-busy
    description: The feed is aria-busy while more items are being fetched.
    given:
      loading: true
      hasMore: true
    then:
    - attribute: aria-busy
      is: 'true'
    platforms:
    - web
    - lit
  examples:
  - name: activity-stream
    description: The default stream of activity, newest first, with more to load below.
    given:
      label: Activity
      hasMore: true
      items:
      - id: a1
        heading: Ana commented on Invoice 42
        timestamp: '2026-09-15T09:00:00Z'
        content: Looks right to me.
      - id: a2
        heading: Bo approved Invoice 41
        timestamp: '2026-09-14T16:20:00Z'
        content: Approved for payment.
  - name: notifications-with-unread-items
    description: Notifications where unread items are marked and three newer ones
      are waiting above.
    given:
      label: Notifications
      newItemsCount: 3
      items:
      - id: n1
        heading: Your export is ready
        timestamp: '2026-09-15T08:00:00Z'
        content: The March export finished.
        unread: true
      - id: n2
        heading: Invoice 42 was paid
        timestamp: '2026-09-14T11:00:00Z'
        content: Payment received.
  - name: caught-up
    description: The end of a finite stream, with its own closing message.
    given:
      label: Activity
      hasMore: false
      endMessage: That is everything from this week.
      items:
      - id: a1
        heading: Bo approved Invoice 41
        timestamp: '2026-09-14T16:20:00Z'
        content: Approved for payment.
  - name: loading-the-next-page
    description: A feed fetching its next page under headings that fit a page whose
      outline starts at level 2.
    given:
      label: Audit events
      hasMore: true
      loading: true
      headingLevel: '2'
      items:
      - id: e1
        heading: Role changed for Ana
        timestamp: '2026-09-15T07:00:00Z'
        content: Editor to Admin.
```

## Events

- `onLoadMore`: emit `onLoadMore`
  - fires on: user
  - timing: request
- `onShowNew`: emit `onShowNew`
  - fires on: user
  - timing: request
- `onItemVisible`: emit `onItemVisible`
  - payload, positional, in this order: `id: string`
  - fires on: user

## Style bindings

- `articleInset`: token `layout.inset.md`; part `article`
- `articleBodyGap`: token `layout.gap.tight`; part `articleBody`
- `unreadBorder`: token `color.control.selectedBackground`; part `article`; locked
- `unreadBorderWidth`: token `border.width.focus`; part `article`; locked
- `articleRadius`: token `radius.lg`; part `article`
- `timestampColor`: token `color.foreground.muted`; part `timestamp`; locked
- `timestampSize`: token `font.size.xs`; part `timestamp`
- `newItemsLayer`: token `layer.raised`; part `newItemsButton`
- `loadingInset`: token `layout.inset.md`; part `loadingIndicator`
- `endMessageInset`: token `layout.inset.md`; part `endMessage`
- `endMessageColor`: token `color.foreground.muted`; part `endMessage`; locked
- `endMessageSize`: token `font.size.sm`; part `endMessage`
- `emptyStateInset`: token `layout.inset.md`; part `emptyState`
- `emptyStateColor`: token `color.foreground.muted`; part `emptyState`; locked
- `emptyStateSize`: token `font.size.sm`; part `emptyState`

## Copy

- `showNew`: "Show {count} new"; params `count` (number)
- `loading`: "Loading more"
- `end`: "You are all caught up."
- `unread`: "unread"
- `position`: "{index} of {total}"; params `index` (number), `total` (number)
- `empty`: "Nothing here yet."
- `justNow`: "just now"
- `minutesAgo`: "{n} min ago"; params `n` (number)
- `hoursAgo`: "{n} hr ago"; params `n` (number)
- `daysAgo`: "{n} d ago"; params `n` (number)

## Constants and examples

- example `activity-stream`, story `ActivityStream`: given `label: "Activity"`, `hasMore: true`, `items: [{"id":"a1","heading":"Ana commented on Invoice 42","timestamp":"2026-09-15T09:00:00Z","content":"Looks right to me."},{"id":"a2","heading":"Bo approved Invoice 41","timestamp":"2026-09-14T16:20:00Z","content":"Approved for payment."}]`; The default stream of activity, newest first, with more to load below.
- example `notifications-with-unread-items`, story `NotificationsWithUnreadItems`: given `label: "Notifications"`, `newItemsCount: 3`, `items: [{"id":"n1","heading":"Your export is ready","timestamp":"2026-09-15T08:00:00Z","content":"The March export finished.","unread":true},{"id":"n2","heading":"Invoice 42 was paid","timestamp":"2026-09-14T11:00:00Z","content":"Payment received."}]`; Notifications where unread items are marked and three newer ones are waiting above.
- example `caught-up`, story `CaughtUp`: given `label: "Activity"`, `hasMore: false`, `endMessage: "That is everything from this week."`, `items: [{"id":"a1","heading":"Bo approved Invoice 41","timestamp":"2026-09-14T16:20:00Z","content":"Approved for payment."}]`; The end of a finite stream, with its own closing message.
- example `loading-the-next-page`, story `LoadingTheNextPage`: given `label: "Audit events"`, `hasMore: true`, `loading: true`, `headingLevel: "2"`, `items: [{"id":"e1","heading":"Role changed for Ana","timestamp":"2026-09-15T07:00:00Z","content":"Editor to Admin."}]`; A feed fetching its next page under headings that fit a page whose outline starts at level 2.

## Overrides (per-instance styling contract)

Every style binding above becomes a CSS custom-property hook on the component root, named `--ds-<component>-<binding>` (kebab-case), defaulting to its token: `.ds-button {{ --ds-button-padding-inline: var(--space-md); padding-inline: var(--ds-button-padding-inline); }}`. Interpolated bindings set the hook per modifier class (`.ds-button--primary {{ --ds-button-background: var(--color-action-primary-background) }}`). Rules always read the hook, never the token directly.

The component accepts `overrides?: Partial<Record<OverridableBinding, TokenRef>>` where `OverridableBinding` is the union of the overridable bindings below and `TokenRef` is the token-name union exported by `@design-schema/tokens` (`import type {{ TokenRef }} from '@design-schema/tokens'`). Each entry sets the hook inline as `var(--<token-kebab>)`. Locked bindings are not in the type and are ignored if passed. Consumers may also set the hooks from their own CSS; that is the sanctioned escape hatch and the docs say so.

Overrides change values, never presence: a prop that turns a part off (`surface: none`, `border: false`, `radius: none`) makes the matching overrides no-ops; apply an override only where the binding is in effect.

Overridable: `itemGap`, `articleInset`, `articleBodyGap`, `articleRadius`, `timestampSize`, `newItemsOffset`, `newItemsLayer`, `loadingInset`, `endMessageInset`, `endMessageSize`, `emptyStateInset`, `emptyStateSize`, `fontFamily`
Locked (accessibility-bearing, never overridable): `unreadBorder`, `unreadBorderWidth`, `timestampColor`, `endMessageColor`, `emptyStateColor`, `focusRing`, `focusRingWidth`

## Behavior scenarios (11)

Each scenario below becomes one test. They are platform-neutral: `given` are prop overrides on the `Default` story's args, `when` is one interaction, `then` is a list of expectations. Scenarios marked `derived` were produced by the parser from the schema; the rest were written in the doc. Render every scenario; never skip one because the component does not satisfy it. A scenario the code fails is a failing test, and a scenario that cannot be expressed on this platform is a gap to report, not a test to delete.

```yaml
- name: an-empty-feed-asks-for-its-first-page
  description: With hasMore and no items there is no last article to observe, so the
    feed fires onLoadMore once on mount.
  given:
    items: []
    hasMore: true
    loading: false
  then:
  - event: onLoadMore
- name: pressing-show-new-asks-for-the-newer-items
  description: The feed never inserts newer items itself; the button asks, and the
    caller prepends.
  given:
    newItemsCount: 3
    items:
    - id: a1
      heading: Ana commented on Invoice 42
      timestamp: '2026-09-15T09:00:00Z'
      content: Looks right to me.
  when:
    click: newItemsButton
  then:
  - event: onShowNew
- name: the-end-message-shows-when-there-is-nothing-more
  given:
    hasMore: false
    items:
    - id: a1
      heading: Ana commented on Invoice 42
      timestamp: '2026-09-15T09:00:00Z'
      content: Looks right to me.
  then:
  - copy: end
- name: a-custom-end-message-replaces-the-default
  given:
    hasMore: false
    endMessage: That is everything from this week.
    items:
    - id: a1
      heading: Ana commented on Invoice 42
      timestamp: '2026-09-15T09:00:00Z'
      content: Looks right to me.
  then:
  - text: That is everything from this week.
- name: an-empty-feed-that-is-not-loading-says-so
  given:
    items: []
    hasMore: false
    loading: false
  then:
  - copy: empty
- name: loading-marks-the-feed-busy
  description: The feed is aria-busy while more items are being fetched.
  given:
    loading: true
    hasMore: true
  then:
  - attribute: aria-busy
    is: 'true'
  platforms:
  - web
  - lit
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
notes: "A <div role=\"feed\" aria-label aria-busy> of Cards (`focusable`, so each\
  \ is an <article tabindex=\"-1\"> that draws its own ring) given role=\"article\"\
  \ aria-describedby={timestampId} aria-posinset aria-setsize={total or -1 when hasMore}\
  \ through rest props; Card labels itself by its heading. copy.position is a visually-hidden\
  \ span rendered only when the total is known (hasMore false). The heading row is\
  \ Card's own header; Feed's articleBody holds, in order, the visually-hidden copy.unread\
  \ (when unread), the timestamp, the visually-hidden copy.position, then the content;\
  \ articleActions is the footer row. The hidden runs are plain spans with Feed's\
  \ visually-hidden class (Text has no visually-hidden option). The timestamp is a\
  \ <time dateTime title> carrying data-part=\"timestamp\" and the aria-describedby\
  \ id, inside a `Text tone=\"muted\" size=\"xs\"` span. Card, Button and Stack all\
  \ write their own data-part, so `article` is a Feed-owned wrapper div around each\
  \ Card, `newItemsButton` is the sticky row wrapping the Button (a test clicks the\
  \ button inside it), and `articleBody`/`articleActions` are Feed-owned wrappers\
  \ with `display: contents` around their Stack (the gap still reaches the Stack).\
  \ The `article` part element is therefore the wrapper, not the role=\"article\"\
  \ Card inside it: the wrapper carries the part and the unread bar, the Card carries\
  \ the role, aria-posinset/aria-setsize and aria-describedby. The empty state is\
  \ a Feed-owned wrapper after the feed element, like the end message, and is not\
  \ a live region \u2014 only the new-items row is role=\"status\", and aria-busy\
  \ covers loading. The new-items row is always rendered as role=\"status\" (padded\
  \ only while shown) so the button's count is announced when it appears; the end\
  \ message and loading indicator are not live, aria-busy covers loading. Articles\
  \ are focusable so PageUp/PageDown and screen-reader browse mode land on them; the\
  \ feed handles those keys when focus is within an article. An IntersectionObserver\
  \ on the last article triggers onLoadMore with rootMargin of one viewport; another\
  \ at 50% visibility for a second drives onItemVisible. New items are never inserted\
  \ at the top automatically: the newItemsButton (Button secondary, sm) is sticky\
  \ at the top and its press prepends and moves focus to the first new article. The\
  \ loading indicator is an indeterminate ProgressBar with label copy.loading, aria-busy\
  \ on the feed while loading. Under reduced motion no scroll animation. role=\"feed\"\
  \ goes on the element whose direct children are the article wrappers, not on an\
  \ ancestor: ARIA requires a feed to own its article children. A wrapper that has\
  \ no role, no global aria attribute and no tabindex is descended through \u2014\
  \ axe's aria-required-children looks past the Feed-owned article wrapper and finds\
  \ the Card's role=\"article\" \u2014 while any child whose own role is something\
  \ else is reported as unallowed. So the items column itself carries role=\"feed\"\
  \ with the label and aria-busy and is the `container` part, its only children are\
  \ the article wrappers, and every piece of chrome is a sibling outside it: the role=\"\
  status\" new-items row, the loading indicator (a progressbar), the end message and\
  \ the empty state (a Text, so a paragraph) would each be an unallowed child. data-ds=\"\
  Feed\", the override hooks and the keydown handler sit on the Feed-owned outer shell\
  \ around the column. An empty feed cannot own an article and `feed` is not in axe's\
  \ reviewEmpty list, so the column carries role/aria-label/aria-busy only when it\
  \ holds at least one article or is `loading`; with neither it is a plain container\
  \ holding copy.empty, and the feed has no named region until it has something to\
  \ own."
```

## Guidance

## Overview

A feed is a list that never quite ends: it grows as you reach the bottom, and newer things arrive at the top. The APG feed pattern exists because this breaks the assumptions of screen readers (content appears while you are reading) and keyboards (Tab through a hundred cards is not navigation), so the feed gives them article-level movement and control over when new items appear.

## When to use

Use a Feed for a stream of similar, time-ordered items whose total is unknown or large: activity, notifications, comments, posts, audit events. Each item is a Card with a heading and a time. Use `newItemsCount` with `onShowNew` for live streams rather than inserting items while the reader is looking; use `onItemVisible` to mark things read.

## When not to use

Do not use a Feed for a finite list that fits on a page (a Stack of Cards), for records with comparable fields (Table), or for a chat thread where newest is at the bottom and the user is a participant (a different pattern). Do not use it for content that must be complete on load for legal or accessibility reasons; paginate instead.

## Behavior

Items render newest first; when the last is within a screen of view and `hasMore`, `onLoadMore` fires and a loading indicator appears; when `hasMore` is false the end message shows. PageDown/PageUp move focus between articles, Ctrl+Home/End leave the feed at either end (End loads instead if there is more; press again after). While `loading` with no items the loading indicator shows, not `copy.empty`; `copy.empty` shows only with no items, not `loading` and `hasMore` false, so an empty feed about to fetch stays blank rather than flashing it. The footer is one slot with a fixed precedence: `loading` wins over everything; then an empty feed with `hasMore` shows nothing; then an empty feed without `hasMore` shows `copy.empty`; then a feed with items and without `hasMore` shows the end message, which is suppressed whenever `items` is empty. New items are announced by the button count, prepended only on request, and focus moves to the first new one. Unread items show a start-edge bar and an "unread" word for assistive technology; `onItemVisible` lets the caller clear it. An item without `actions` renders no footer row, so the `articleActions` part is absent rather than empty. The Keyboard fixture renders the feed with no `newItemsCount`: the new-items row is a sibling outside the feed element, so its button would be the first tab stop in the document while sitting outside the feed the gate walks — which leaves Ctrl+Home's new-items target and Ctrl+End's escape target unexercised there.

## Content guidelines

Headings say what happened, with the actor first ("Ana commented on Invoice 42"). Keep each item's body to a few lines with a Link to the full thing; actions are at most two Buttons. Timestamps are relative with the absolute time available. The end message is friendly and short.

## Accessibility

The container is a `feed` with a name and `aria-busy` while loading (APG feed; WCAG 4.1.2), and each item an `article` labelled by its heading, described by its timestamp, and positioned with `aria-posinset`/`aria-setsize` so a reader knows where they are (1.3.1). Articles are focusable so PageUp/PageDown move article by article, and Ctrl+Home/End escape the feed without tabbing through everything (2.1.1, 2.4.3); no article ever takes `tabindex="0"`, since putting one in the tab order is the thing the pattern exists to avoid. A feed owns articles: with none and not `loading` the container drops the `feed` role and its name rather than claiming an empty region. New content never moves under the reader; it is offered by a button (2.2.2, 3.2.5). Headings follow the page outline (2.4.6). Unread state is bar plus text, not color alone (1.4.1).

## Platform notes

### Web
Render `<div role="feed" aria-label aria-busy data-ds="Feed">` with the sticky `newItemsButton` when `newItemsCount > 0`, then a `Card focusable heading headingLevel role="article" aria-describedby aria-posinset aria-setsize` per item (Card renders the `<article>`, its heading and the ring) whose body holds a `<time dateTime title>` inside `Text tone="muted" size="xs"`, the content, and an actions row (`Stack` horizontal, `gap: tight`); a visually-hidden span "unread" and the `unreadBorder` bar on the Feed-owned article wrapper when `unread`. Keydown on the feed implements the table when the event target is inside an article. `IntersectionObserver`s for load-more (`rootMargin: '100% 0px'`) and visibility (`threshold: 0.5`, one-second timer). Footer: indeterminate `ProgressBar label={copy.loading} hideLabel` inside `loadingInset` while `loading`, else the end message `Text` inside `endMessageInset` when `!hasMore`. On mount with no items, `hasMore` and not `loading`, fire `onLoadMore` once (there is no last article to observe). `role="feed"` sits on the items column — the element whose direct children are the article wrappers — and never on an ancestor with the new-items row inside it: a feed must own its articles directly, or `aria-required-children` fails on every story. The sticky `newItemsButton` row is a sibling of the feed element, not a child, and so are the loading indicator, the end message and the empty state: only the article wrappers are children of the feed element.

### Lit
`<ds-feed label="Activity" .items=${items} has-more @load-more=${load}></ds-feed>`; shadow articles as `ds-card`; composed events.

### React Native
`FlatList` with `keyExtractor` by id, `onEndReached`, `onEndReachedThreshold={1}`, `maintainVisibleContentPosition={{ minIndexForVisible: 0 }}`, `ListFooterComponent` (ProgressBar or end Text), `onViewableItemsChanged` with `viewabilityConfig { itemVisiblePercentThreshold: 50, minimumViewTime: 1000 }`; items are `Card`s left un-collapsed (no `accessible`, so their Buttons and Links stay focusable) preceded by visually-hidden `Text` runs for unread and position; the new-items `Button` above the list.

## Related

Card, Heading, ProgressBar, Table, Toast.
