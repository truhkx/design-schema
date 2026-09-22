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
/** Relative text stops at seven days — strictly under, so day seven shows the absolute date. */
const RELATIVE_LIMIT_DAYS = 7;

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
  if (days < RELATIVE_LIMIT_DAYS) {
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

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
 * A shadow root of `<ds-card>` articles built from `items`, newest first. The
 * `article` part is a Feed-owned wrapper around each Card: it is the
 * `role="article"`, the scripted focus target (`tabindex="-1"`), the focus ring
 * and the unread bar, labelled by the item's heading and carrying
 * `aria-describedby` (the article's `<time>`, in the same tree) plus
 * `aria-posinset`/`aria-setsize` (`-1` while `hasMore`); the Card inside it is
 * the presentation. That split is forced on this platform: a negative tabindex
 * on a *shadow host* takes the host's whole flat-tree subtree out of sequential
 * focus navigation, so `<ds-card focusable>` would leave every link and button
 * inside an article unreachable by Tab. `newItemsButton` is the sticky
 * `role="status"` row around the Button — Card and Button host their own anatomy.
 *
 * `role="feed"` sits on the items column, the element whose direct children are
 * the articles: ARIA requires a feed to own its articles, and anything else
 * among them (the live row, a progressbar, the end message) is an unallowed
 * child. So the new-items row and every footer part are siblings of that
 * column, not children of it. A column owning no article carries no role at
 * all unless it is `loading`, which is `aria-busy` — the sanctioned way to own
 * nothing yet.
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

    /* The shell holds the live row, the role="feed" column and the footer chrome as siblings:
       a feed element's children may only be articles. */
    .shell {
      display: flex;
      flex-direction: column;
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

    /* itemGap: layout.gap.normal, between the articles */
    .items {
      display: flex;
      flex-direction: column;
      gap: var(--ds-feed-item-gap);
    }

    /* The article is Feed's own wrapper, not the Card: a negative tabindex on a shadow host takes
       that host's whole flat-tree subtree out of sequential focus navigation, so a focusable
       <ds-card> would make every link and button inside an article unreachable by Tab. A plain
       div does not, so the wrapper is the role="article", the focus target and the ring. */
    [data-part='article'] {
      position: relative;
      border-radius: var(--radius-lg);
      outline: none;
    }

    /* focusRing / focusRingWidth (locked): an outline of focusRingWidth in focusRing sitting on the
       card's edge, no offset — the treatment a composed Card draws for itself. */
    [data-part='article']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
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
  /** `lastId|hasMore|loading`: the feed asks at most once per change of these, so a prepend does not re-ask. */
  private loadMoreKey: string | null = null;
  private visibilityObserver: IntersectionObserver | undefined;
  private readonly visibilityTimers = new Map<string, number>();
  private readonly reportedVisible = new Set<string>();
  /** The joined item ids; a change of this is a change of `items`. */
  private itemsKey: string | null = null;
  private firstItemId: string | undefined;
  /** Armed by `show-new`, spent on the next change of `items` whether or not it moved focus. */
  private pendingShowNewFocus = false;
  /** An empty feed asks for its first page once, until the caller fills or clears `items` again. */
  private askedForFirstPage = false;
  private warnedLabel = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Feed');
    if (this.hasUpdated) {
      // Rebuild from scratch: disconnectedCallback dropped the observers.
      this.loadMoreKey = null;
      this.syncVisibilityObserver();
      this.syncLoadMoreObserver();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.teardownObservers();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('label')) {
      this.warnMissingLabel();
    }
  }

  protected override render(): TemplateResult {
    const count = this.newItemsCount ?? 0;
    const shown = count > 0;
    /* A feed has to own at least one article: with none, and nothing on its way, the column is a
       plain container rather than an unowned role="feed". While `loading` the role stays, with
       aria-busy, which is the sanctioned way to own nothing yet. */
    const isFeed = this.items.length > 0 || this.loading;

    return html`
      <div class="shell" @keydown=${this.handleKeydown}>
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
        <div
          class="items"
          part="container"
          data-part="container"
          role=${isFeed ? 'feed' : nothing}
          aria-label=${isFeed ? this.label : nothing}
          aria-busy=${isFeed ? String(this.loading) : nothing}
        >
          ${repeat(
            this.items,
            (item) => item.id,
            (item, index) => this.renderArticle(item, index),
          )}
        </div>
        ${this.renderFooter()}
      </div>
    `;
  }

  protected override updated(): void {
    const itemsKey = this.items.map((item) => item.id).join(' ');
    const itemsChanged = itemsKey !== this.itemsKey;
    this.itemsKey = itemsKey;

    if (itemsChanged) {
      this.syncVisibilityObserver();
    }
    this.syncLoadMoreObserver();
    this.askForFirstPage();
    if (itemsChanged) {
      this.moveFocusToFirstNewArticle();
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
        role="article"
        tabindex="-1"
        aria-label=${item.heading}
        aria-describedby=${timestampId}
        aria-posinset=${index + 1}
        aria-setsize=${total}
        data-item-id=${item.id}
        ?data-unread=${item.unread === true}
      >
        <ds-card
          role="none"
          heading=${item.heading}
          heading-level=${this.headingLevel}
          inset="md"
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
   * One slot with a fixed precedence: `loading` wins, then an empty feed with
   * `hasMore` shows nothing (so a feed about to fetch never flashes `copy.empty`),
   * then an empty feed without it shows `copy.empty`, then the end message. Every
   * one of these is a sibling of the `role="feed"` column: a progressbar and a
   * paragraph are not articles, so a feed may not own them.
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

  /** The `role="article"` wrappers — the focus targets and the observers' targets — in document order. */
  private getArticles(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('[data-part="article"]'));
  }

  private get newItemsButtonEl(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>('.new-items-row ds-button');
  }

  private dispatchLoadMore(): void {
    this.dispatchEvent(new CustomEvent('load-more', { bubbles: true, composed: true }));
  }

  private readonly handleShowNewPress = (event: Event): void => {
    // Feed announces its own request; the inner Button's press stays internal.
    event.stopPropagation();
    this.pendingShowNewFocus = true;
    this.dispatchEvent(new CustomEvent('show-new', { bubbles: true, composed: true }));
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

  /** `label` is the feed's only accessible name; there is no default. */
  private warnMissingLabel(): void {
    if (import.meta.env.DEV && this.label.trim() === '' && !this.warnedLabel) {
      this.warnedLabel = true;
      console.warn('Feed: `label` is the accessible name of the feed and must not be empty.');
    }
  }

  /** An empty feed has no last article to observe, so it asks for its first page itself, once. */
  private askForFirstPage(): void {
    if (this.items.length > 0) {
      this.askedForFirstPage = false;
      return;
    }
    if (this.hasMore && !this.loading && !this.askedForFirstPage) {
      this.askedForFirstPage = true;
      this.dispatchLoadMore();
    }
  }

  /**
   * After `show-new` the first new article takes focus and is scrolled into view
   * (instantly under reduced motion — the feed's only motion on this platform).
   * The request lives until the next change of `items` and no further: that change
   * takes it when it puts a new id first, and otherwise drops it, so an unrelated
   * later prepend never steals focus.
   */
  private moveFocusToFirstNewArticle(): void {
    const previous = this.firstItemId;
    const first = this.items[0]?.id;
    this.firstItemId = first;
    if (!this.pendingShowNewFocus) {
      return;
    }
    this.pendingShowNewFocus = false;
    if (first === undefined || first === previous) {
      return;
    }
    const article = this.getArticles()[0];
    if (article === undefined) {
      return;
    }
    article.focus({ preventScroll: true });
    article.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  /** Watches the last article, at most one ask per change of its id, `hasMore` or `loading`. */
  private syncLoadMoreObserver(): void {
    const lastId = this.items[this.items.length - 1]?.id;
    const key = `${lastId ?? ''}|${this.hasMore}|${this.loading}`;
    if (key === this.loadMoreKey) {
      return;
    }
    this.loadMoreKey = key;
    this.loadMoreObserver?.disconnect();
    this.loadMoreObserver = undefined;
    if (!this.hasMore || this.loading) {
      return;
    }
    const wrappers = this.getArticles();
    const last = wrappers[wrappers.length - 1];
    if (last === undefined) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }
      observer.disconnect();
      if (this.loadMoreObserver === observer) {
        this.loadMoreObserver = undefined;
      }
      this.dispatchLoadMore();
    }, { rootMargin: '100% 0px' });
    observer.observe(last);
    this.loadMoreObserver = observer;
  }

  /** Watches every article whose id has not reported yet; ids already reported stay reported. */
  private syncVisibilityObserver(): void {
    this.visibilityObserver?.disconnect();
    for (const timer of this.visibilityTimers.values()) {
      clearTimeout(timer);
    }
    this.visibilityTimers.clear();
    const observer = new IntersectionObserver(this.handleVisibilityIntersect, { threshold: 0.5 });
    for (const wrapper of this.getArticles()) {
      const id = wrapper.dataset.itemId;
      if (id !== undefined && !this.reportedVisible.has(id)) {
        observer.observe(wrapper);
      }
    }
    this.visibilityObserver = observer;
  }

  private teardownObservers(): void {
    this.loadMoreObserver?.disconnect();
    this.loadMoreObserver = undefined;
    this.loadMoreKey = null;
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;
    for (const timer of this.visibilityTimers.values()) {
      clearTimeout(timer);
    }
    this.visibilityTimers.clear();
  }

  private readonly handleVisibilityIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      const id = target.dataset.itemId;
      if (id === undefined || this.reportedVisible.has(id)) {
        continue;
      }
      const pending = this.visibilityTimers.get(id);
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        if (pending !== undefined) {
          continue;
        }
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
      } else if (pending !== undefined) {
        clearTimeout(pending);
        this.visibilityTimers.delete(id);
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
