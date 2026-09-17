import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Card.js';
import './Button.js';
import './ProgressBar.js';
import './Stack.js';
import './Text.js';

export type FeedHeadingLevel = '2' | '3' | '4';

/**
 * One article. `content` and `actions` are anything `lit-html` can render
 * (a string, a `TemplateResult`, a `Node`) — the platform's stand-in for
 * `ReactNode`. `timestamp` is ISO 8601 and rendered relative, with the
 * absolute time as the `<time>` element's `title`.
 */
export interface FeedItem {
  id: string;
  heading: string;
  timestamp: string;
  content: unknown;
  actions?: unknown;
  unread?: boolean | undefined;
}

/** Detail carried by the `item-visible` CustomEvent. */
export interface FeedItemVisibleDetail {
  id: string;
}

/**
 * Overridable style hooks; see the `overrides` property. `unreadBorder`,
 * `unreadBorderWidth`, `timestampColor`, `endMessageColor`, `emptyStateColor`,
 * `focusRing` and `focusRingWidth` are locked and excluded.
 */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'articleBodyGap'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'newItemsLayer'
  | 'loadingInset'
  | 'endMessageInset'
  | 'endMessageSize'
  | 'emptyStateInset'
  | 'emptyStateSize'
  | 'fontFamily';

const HOOKS: Record<FeedOverridableBinding, string> = {
  itemGap: '--ds-feed-item-gap',
  articleInset: '--ds-feed-article-inset',
  articleBodyGap: '--ds-feed-article-body-gap',
  timestampSize: '--ds-feed-timestamp-size',
  newItemsOffset: '--ds-feed-new-items-offset',
  newItemsLayer: '--ds-feed-new-items-layer',
  loadingInset: '--ds-feed-loading-inset',
  endMessageInset: '--ds-feed-end-message-inset',
  endMessageSize: '--ds-feed-end-message-size',
  emptyStateInset: '--ds-feed-empty-state-inset',
  emptyStateSize: '--ds-feed-empty-state-size',
  fontFamily: '--ds-feed-font-family',
};

/** copy.showNew */
const COPY_SHOW_NEW = (count: number): string => `Show ${count} new`;
/** copy.loading */
const COPY_LOADING = 'Loading more';
/** copy.end */
const COPY_END = 'You are all caught up.';
/** copy.unread */
const COPY_UNREAD = 'unread';
/** copy.position */
const COPY_POSITION = (index: number, total: number): string => `${index} of ${total}`;
/** copy.empty */
const COPY_EMPTY = 'Nothing here yet.';
/** copy.justNow */
const COPY_JUST_NOW = 'just now';
/** copy.minutesAgo */
const COPY_MINUTES_AGO = (n: number): string => `${n} min ago`;
/** copy.hoursAgo */
const COPY_HOURS_AGO = (n: number): string => `${n} hr ago`;
/** copy.daysAgo */
const COPY_DAYS_AGO = (n: number): string => `${n} d ago`;

const MINUTE_MS = 60_000;
/** How long an article must stay 50% visible before `item-visible` fires ("a moment"). */
const VISIBLE_DWELL_MS = 1000;

/**
 * justNow under a minute (and for a future timestamp), minutesAgo/hoursAgo/daysAgo
 * up to a week, else the absolute date in the user's locale. Counts are floored, so
 * 90 seconds is `1 min ago`. An unparseable timestamp is shown as given.
 */
function formatRelativeTime(iso: string): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) {
    return iso;
  }
  const minutes = Math.floor(Math.max(0, Date.now() - time) / MINUTE_MS);
  if (minutes < 1) {
    return COPY_JUST_NOW;
  }
  if (minutes < 60) {
    return COPY_MINUTES_AGO(minutes);
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return COPY_HOURS_AGO(hours);
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return COPY_DAYS_AGO(days);
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(time);
}

/** The `<time>` title; an unparseable timestamp gets no title. */
function formatAbsoluteTime(iso: string): string | undefined {
  const time = new Date(iso).getTime();
  return Number.isNaN(time)
    ? undefined
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(time);
}

/** Elements the Ctrl+Home/Ctrl+End feed commands can escape to. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null && Number(tabindex) < 0) {
    return false;
  }
  return el.matches(FOCUSABLE_SELECTOR);
}

/** Walks light DOM, slot assignments and open shadow roots in flat-tree order (as FocusScope does). */
function collectFocusable(node: Element, results: HTMLElement[]): void {
  if (node.hasAttribute('inert') || node.getAttribute('aria-hidden') === 'true') {
    return;
  }
  if (isFocusable(node)) {
    results.push(node);
  }
  if (node instanceof HTMLSlotElement) {
    for (const assigned of node.assignedElements({ flatten: true })) {
      collectFocusable(assigned, results);
    }
    return;
  }
  const scope = node.shadowRoot ?? node;
  for (const child of Array.from(scope.children)) {
    collectFocusable(child, results);
  }
}

/** The element's outermost ancestor host in the document tree (itself when it is already there). */
function documentHost(el: Element): Element {
  let current: Element = el;
  let root = current.getRootNode();
  while (root instanceof ShadowRoot) {
    current = root.host;
    root = current.getRootNode();
  }
  return current;
}

/**
 * `<ds-feed>` — Feed (category: container, APG pattern: feed).
 *
 * A `role="feed"` host (set as a plain attribute, along with `aria-label` and
 * `aria-busy`, so accessible-name tooling reads them) around a shadow root of
 * `<ds-card focusable>` articles built from `items`, newest first. Card gives
 * each article `role="article"`, its heading name, `tabindex="-1"` and its own
 * focus ring; Feed adds `aria-describedby` (the article's `<time>`, in the same
 * tree) and `aria-posinset`/`aria-setsize` (`-1` while `hasMore`). The `article`
 * part is a Feed-owned wrapper around each Card that draws the unread bar, and
 * `newItemsButton` is the sticky `role="status"` row around the Button — Card and
 * Button host their own anatomy.
 *
 * `IntersectionObserver`s drive `load-more` (the last article within one viewport,
 * while `hasMore` and not `loading`) and `item-visible` (50% visible for one
 * second, once per id per mount). An empty feed with `hasMore` that is not
 * `loading` asks for its first page itself — on mount and again whenever the
 * caller clears `items` — since there is no last article to observe. The
 * new-items row is always rendered so its count is announced when the button
 * appears; pressing it never inserts items, it fires `show-new`, and focus moves
 * to the first article once the caller's prepend changes the first item's id.
 * With focus inside an article, PageDown/PageUp move between articles, Ctrl+End
 * requests more when `hasMore` (nothing while `loading`, otherwise it leaves the
 * feed forward), and Ctrl+Home goes to the new-items button when shown, otherwise
 * leaves the feed backward.
 *
 * ## When to use
 *
 * Use a Feed for a stream of similar, time-ordered items whose total is
 * unknown or large: activity, notifications, comments, posts, audit events.
 * Use `newItemsCount` with `show-new` for live streams rather than inserting
 * items while the reader is looking; use `item-visible` to mark things read.
 *
 * ## When not to use
 *
 * Do not use a Feed for a finite list that fits on a page (a Stack of Cards),
 * for records with comparable fields (Table), or for a chat thread where newest
 * is at the bottom. Do not use it for content that must be complete on load;
 * paginate instead.
 *
 * @fires load-more - Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore` and not `loading`).
 * @fires show-new - Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`.
 * @fires item-visible - Fired with `{ id }` once an item has been substantially visible for a moment.
 */
@customElement('ds-feed')
export class DsFeed extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--ds-feed-font-family);
      --ds-feed-item-gap: var(--layout-gap-normal);
      --ds-feed-article-inset: var(--layout-inset-md);
      --ds-feed-article-body-gap: var(--layout-gap-tight);
      --ds-feed-unread-border: var(--color-control-selected-background);
      --ds-feed-unread-border-width: var(--border-width-focus);
      --ds-feed-timestamp-size: var(--font-size-xs);
      --ds-feed-new-items-offset: var(--space-3);
      --ds-feed-new-items-layer: var(--layer-raised);
      --ds-feed-loading-inset: var(--layout-inset-md);
      --ds-feed-end-message-inset: var(--layout-inset-md);
      --ds-feed-end-message-size: var(--font-size-sm);
      --ds-feed-empty-state-inset: var(--layout-inset-md);
      --ds-feed-empty-state-size: var(--font-size-sm);
      --ds-feed-font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    /* newItemsOffset / newItemsLayer: the live row is always rendered so the count is announced
       when the button appears, and takes space only while it is shown (padding, not a margin:
       the row is the first child). It stays over the scrolling articles. */
    .new-items-row {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--ds-feed-new-items-layer);
      display: flex;
      justify-content: center;
    }

    .new-items-row.shown {
      padding-block-start: var(--ds-feed-new-items-offset);
    }

    /* itemGap: layout.gap.normal, between the articles and the footer row */
    .items {
      display: flex;
      flex-direction: column;
      gap: var(--ds-feed-item-gap);
    }

    [data-part='article'] {
      position: relative;
    }

    /* articleInset: layout.inset.md, forwarded to the Card's own padding hooks rather than
       restyling its shadow tree (Card's inset is an sm/md/lg choice and takes no token) */
    [data-part='article'] > ds-card {
      --ds-card-padding-block: var(--ds-feed-article-inset);
      --ds-card-padding-inline: var(--ds-feed-article-inset);
    }

    /* unreadBorder / unreadBorderWidth (locked): a start-edge bar drawn by Feed's own wrapper over
       the Card's start edge (mirrored in RTL), paired with the visually-hidden "unread" word. */
    [data-part='article'][data-unread]::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      inline-size: var(--ds-feed-unread-border-width);
      background: var(--ds-feed-unread-border);
      pointer-events: none;
    }

    /* articleBodyGap: layout.gap.tight, forwarded to the body Stack's own gap hook */
    [data-part='articleBody'] {
      --ds-stack-gap: var(--ds-feed-article-body-gap);
    }

    /* timestampSize: font.size.xs through Text's hook; timestampColor is Text tone="muted" (locked) */
    .timestamp-text {
      --ds-text-font-size: var(--ds-feed-timestamp-size);
    }

    /* fontFamily: font.family.body, reaching every composed Text and the new-items Button
       through their own hooks; the hidden runs inherit it from :host */
    ds-text {
      --ds-text-font-family: var(--ds-feed-font-family);
    }

    ds-button {
      --ds-button-font-family: var(--ds-feed-font-family);
    }

    /* loadingInset: layout.inset.md around the ProgressBar */
    [data-part='loadingIndicator'] {
      padding: var(--ds-feed-loading-inset);
    }

    /* endMessageInset / endMessageSize; endMessageColor is Text tone="muted" (locked) */
    [data-part='endMessage'] {
      padding: var(--ds-feed-end-message-inset);
    }

    [data-part='endMessage'] > ds-text {
      --ds-text-font-size: var(--ds-feed-end-message-size);
    }

    /* emptyStateInset / emptyStateSize; emptyStateColor is Text tone="muted" (locked) */
    [data-part='emptyState'] {
      padding: var(--ds-feed-empty-state-inset);
    }

    [data-part='emptyState'] > ds-text {
      --ds-text-font-size: var(--ds-feed-empty-state-size);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** What the feed contains ("Activity", "Notifications"). The feed's accessible name; an empty label warns in development. */
  @property({ type: String }) accessor label = '';

  /** Articles, newest first. */
  @property({ attribute: false }) accessor items: FeedItem[] = [];

  /** More items exist beyond the last; the feed asks for them with `load-more` as the end approaches, and whenever `items` is empty and not `loading`. */
  @property({ type: Boolean, reflect: true, attribute: 'has-more' }) accessor hasMore = false;

  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Number of newer items available above. Shows a "Show {count} new" button; the feed never inserts them itself. */
  @property({ type: Number, reflect: true, attribute: 'new-items-count' }) accessor newItemsCount: number | undefined;

  /** Heading level for article headings, matching the page outline. */
  @property({ type: String, reflect: true, attribute: 'heading-level' }) accessor headingLevel: FeedHeadingLevel = '3';

  /** Shown after the last item when `hasMore` is false (and `items` is not empty). Defaults to `copy.end`. */
  @property({ type: String, attribute: 'end-message' }) accessor endMessage: string | undefined;

  /** Per-instance style overrides: `{ itemGap: 'layout.gap.loose' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<FeedOverridableBinding, TokenRef | undefined>>
    | undefined;

  private loadMoreObserver: IntersectionObserver | undefined;
  private visibilityObserver: IntersectionObserver | undefined;
  private readonly visibilityTimers = new Map<string, number>();
  private readonly reportedVisible = new Set<string>();
  /** The first item's id when `show-new` was fired; focus moves once the caller's prepend changes it. */
  private showNewFirstId: string | null = null;
  private mounted = false;
  private warnedLabel = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Feed');
    if (this.getAttribute('role') !== 'feed') this.setAttribute('role', 'feed');
    if (this.hasUpdated) this.syncObservers();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.teardownObservers();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('label') || changed.has('loading')) {
      this.syncHostAria();
    }
  }

  protected override render(): TemplateResult {
    const count = this.newItemsCount ?? 0;
    const shown = count > 0;

    return html`
      <div part="container" data-part="container" @keydown=${this.handleKeydown}>
        <div
          class=${shown ? 'new-items-row shown' : 'new-items-row'}
          part=${shown ? 'newItemsButton' : nothing}
          data-part=${shown ? 'newItemsButton' : nothing}
          role="status"
        >
          ${shown
            ? html`<ds-button
                variant="secondary"
                size="sm"
                label=${COPY_SHOW_NEW(count)}
                @press=${this.handleShowNewPress}
              ></ds-button>`
            : nothing}
        </div>
        <div class="items">
          ${repeat(
            this.items,
            (item) => item.id,
            (item, index) => this.renderArticle(item, index),
          )}
          ${this.renderFooter()}
        </div>
      </div>
    `;
  }

  protected override updated(changed: PropertyValues): void {
    const streamChanged = changed.has('items') || changed.has('hasMore') || changed.has('loading');
    if (streamChanged || !this.mounted) {
      this.syncObservers();
      // An empty feed has no last article to observe, so it asks for its first page itself.
      if (this.items.length === 0 && this.hasMore && !this.loading) {
        this.dispatchLoadMore();
      }
    }
    this.mounted = true;
    if (this.showNewFirstId !== null && changed.has('items') && this.items[0]?.id !== this.showNewFirstId) {
      // The caller prepended; the first new article takes focus. Nothing prepended, nothing to move to.
      this.showNewFirstId = null;
      this.getArticles()[0]?.focus();
    }
  }

  private renderArticle(item: FeedItem, index: number): TemplateResult {
    const timestampId = `feed-ts-${item.id}`;
    // The total is unknown while more may arrive; APG spells that aria-setsize="-1".
    const total = this.hasMore ? -1 : this.items.length;
    const absolute = formatAbsoluteTime(item.timestamp);
    return html`
      <div
        part="article"
        data-part="article"
        data-item-id=${item.id}
        ?data-unread=${item.unread === true}
      >
        <ds-card
          class="article-card"
          heading=${item.heading}
          heading-level=${this.headingLevel}
          inset="md"
          focusable
          aria-describedby=${timestampId}
          aria-posinset=${index + 1}
          aria-setsize=${total}
        >
          <ds-stack part="articleBody" data-part="articleBody" gap="tight">
            ${item.unread === true ? html`<span class="visually-hidden">${COPY_UNREAD}</span>` : nothing}
            <ds-text class="timestamp-text" element="span" tone="muted" size="xs"
              ><time
                id=${timestampId}
                part="timestamp"
                data-part="timestamp"
                datetime=${item.timestamp}
                title=${absolute ?? nothing}
                >${formatRelativeTime(item.timestamp)}</time
              ></ds-text
            >
            ${total !== -1 ? html`<span class="visually-hidden">${COPY_POSITION(index + 1, total)}</span>` : nothing}
            <div>${item.content}</div>
          </ds-stack>
          ${item.actions !== undefined && item.actions !== null
            ? html`<ds-stack
                slot="footer"
                part="articleActions"
                data-part="articleActions"
                direction="horizontal"
                gap="tight"
                >${item.actions}</ds-stack
              >`
            : nothing}
        </ds-card>
      </div>
    `;
  }

  /**
   * While `loading` the indicator shows rather than the empty state, so a feed
   * about to fetch never flashes `copy.empty`; an empty feed with more to come
   * stays blank for the same reason.
   */
  private renderFooter(): TemplateResult | typeof nothing {
    if (this.loading) {
      return html`
        <div part="loadingIndicator" data-part="loadingIndicator">
          <ds-progress-bar label=${COPY_LOADING} hide-label></ds-progress-bar>
        </div>
      `;
    }
    if (this.items.length === 0) {
      return this.hasMore
        ? nothing
        : html`
            <div part="emptyState" data-part="emptyState">
              <ds-text tone="muted" size="sm">${COPY_EMPTY}</ds-text>
            </div>
          `;
    }
    if (!this.hasMore) {
      return html`
        <div part="endMessage" data-part="endMessage">
          <ds-text tone="muted" size="sm">${this.endMessage ?? COPY_END}</ds-text>
        </div>
      `;
    }
    return nothing;
  }

  /** The focusable Cards, in document order. */
  private getArticles(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.article-card'));
  }

  /** The Feed-owned wrappers the observers watch. */
  private getArticleWrappers(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('[data-part="article"]'));
  }

  private get newItemsButtonEl(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>('.new-items-row ds-button');
  }

  private dispatchLoadMore(): void {
    this.dispatchEvent(new CustomEvent<void>('load-more', { bubbles: true, composed: true }));
  }

  private readonly handleShowNewPress = (event: Event): void => {
    // Feed announces its own request; the inner Button's press stays internal.
    event.stopPropagation();
    this.showNewFirstId = this.items[0]?.id ?? null;
    this.dispatchEvent(new CustomEvent<void>('show-new', { bubbles: true, composed: true }));
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const articles = this.getArticles();
    const current = event
      .composedPath()
      .find((el): el is HTMLElement => el instanceof HTMLElement && articles.includes(el));
    // The feed commands act only from inside an article, not from the new-items button.
    if (current === undefined) {
      return;
    }
    const index = articles.indexOf(current);
    if (event.key === 'PageDown' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      articles[index + 1]?.focus();
    } else if (event.key === 'PageUp' && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      articles[index - 1]?.focus();
    } else if (event.key === 'End' && event.ctrlKey) {
      event.preventDefault();
      if (this.hasMore) {
        // Nothing while a page is already on its way; press again once it has landed.
        if (!this.loading) {
          this.dispatchLoadMore();
        }
      } else {
        this.focusOutside(1);
      }
    } else if (event.key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      const button = this.newItemsButtonEl;
      if (button !== null) {
        button.focus();
      } else {
        this.focusOutside(-1);
      }
    }
  };

  /** Escapes the feed to the nearest focusable element in document order, before (`-1`) or after (`1`) it. */
  private focusOutside(direction: 1 | -1): void {
    const outer = documentHost(this);
    const candidates: HTMLElement[] = [];
    for (const child of Array.from(document.body.children)) {
      collectFocusable(child, candidates);
    }
    const outside = candidates.filter((el) => {
      const host = documentHost(el);
      return host !== outer && !outer.contains(host);
    });
    if (direction === 1) {
      outside
        .find((el) => (outer.compareDocumentPosition(documentHost(el)) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0)
        ?.focus();
    } else {
      const preceding = outside.filter(
        (el) => (outer.compareDocumentPosition(documentHost(el)) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
      );
      preceding[preceding.length - 1]?.focus();
    }
  }

  private syncHostAria(): void {
    if (this.label) {
      if (this.getAttribute('aria-label') !== this.label) this.setAttribute('aria-label', this.label);
    } else {
      this.removeAttribute('aria-label');
      if (import.meta.env.DEV && !this.warnedLabel) {
        this.warnedLabel = true;
        console.warn("<ds-feed>: `label` is required; it is the feed's accessible name.");
      }
    }
    if (this.loading) {
      this.setAttribute('aria-busy', 'true');
    } else {
      this.removeAttribute('aria-busy');
    }
  }

  /** (Re)builds the load-more and visibility observers against the current articles. */
  private syncObservers(): void {
    this.teardownObservers();
    const wrappers = this.getArticleWrappers();
    const last = wrappers[wrappers.length - 1];
    if (last === undefined) {
      return;
    }

    if (this.hasMore && !this.loading) {
      this.loadMoreObserver = new IntersectionObserver(this.handleLoadMoreIntersect, { rootMargin: '100% 0px' });
      this.loadMoreObserver.observe(last);
    }

    this.visibilityObserver = new IntersectionObserver(this.handleVisibilityIntersect, { threshold: 0.5 });
    for (const wrapper of wrappers) {
      if (!this.reportedVisible.has(wrapper.dataset.itemId ?? '')) {
        this.visibilityObserver.observe(wrapper);
      }
    }
  }

  private teardownObservers(): void {
    this.loadMoreObserver?.disconnect();
    this.loadMoreObserver = undefined;
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;
    for (const timer of this.visibilityTimers.values()) {
      clearTimeout(timer);
    }
    this.visibilityTimers.clear();
  }

  private readonly handleLoadMoreIntersect = (entries: IntersectionObserverEntry[]): void => {
    if (entries.some((entry) => entry.isIntersecting)) {
      // One request per approach: the observer is rebuilt when `items`, `hasMore` or `loading` change.
      this.loadMoreObserver?.disconnect();
      this.loadMoreObserver = undefined;
      this.dispatchLoadMore();
    }
  };

  private readonly handleVisibilityIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      const id = target.dataset.itemId;
      if (id === undefined || this.reportedVisible.has(id)) {
        continue;
      }
      const existing = this.visibilityTimers.get(id);
      if (existing !== undefined) {
        clearTimeout(existing);
        this.visibilityTimers.delete(id);
      }
      if (entry.isIntersecting) {
        const timer = window.setTimeout(() => {
          this.visibilityTimers.delete(id);
          // Once per id per mount: an item that scrolls out and back does not fire again.
          this.reportedVisible.add(id);
          this.visibilityObserver?.unobserve(target);
          this.dispatchEvent(
            new CustomEvent<FeedItemVisibleDetail>('item-visible', {
              detail: { id },
              bubbles: true,
              composed: true,
            }),
          );
        }, VISIBLE_DWELL_MS);
        this.visibilityTimers.set(id, timer);
      }
    }
  };

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as FeedOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-feed': DsFeed;
  }
}
