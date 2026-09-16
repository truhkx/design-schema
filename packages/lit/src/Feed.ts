import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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
 * `unreadBorderWidth`, `timestampColor`, `endMessageColor`, `focusRing` and
 * `focusRingWidth` are locked and excluded.
 */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'loadingInset'
  | 'endMessageInset'
  | 'endMessageSize'
  | 'fontFamily';

const HOOKS: Record<FeedOverridableBinding, string> = {
  itemGap: '--ds-feed-item-gap',
  articleInset: '--ds-feed-article-inset',
  timestampSize: '--ds-feed-timestamp-size',
  newItemsOffset: '--ds-feed-new-items-offset',
  loadingInset: '--ds-feed-loading-inset',
  endMessageInset: '--ds-feed-end-message-inset',
  endMessageSize: '--ds-feed-end-message-size',
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

/** justNow under a minute, minutesAgo/hoursAgo/daysAgo up to a week, else the absolute date in the user's locale. */
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

function formatAbsoluteTime(iso: string): string {
  const time = new Date(iso).getTime();
  return Number.isNaN(time)
    ? iso
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
 * tree) and `aria-posinset`/`aria-setsize` (`-1` while `hasMore`).
 * `IntersectionObserver`s drive `load-more` (the last article within one
 * viewport, while `hasMore` and not `loading`) and `item-visible` (50% visible
 * for one second, once per id). An empty feed with `hasMore` that is not
 * `loading` fires `load-more` once on mount. The new-items button never
 * inserts items itself — pressing it fires `show-new`, and once the caller's
 * next `items` update lands focus moves to the new first article. With focus
 * inside an article, PageDown/PageUp move between articles, Ctrl+End requests
 * more when `hasMore` (otherwise leaves the feed forward), and Ctrl+Home goes to
 * the new-items button when shown, otherwise leaves the feed backward.
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
 * @fires load-more - Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore`).
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
      --ds-feed-timestamp-size: var(--font-size-xs);
      --ds-feed-new-items-offset: var(--space-3);
      --ds-feed-loading-inset: var(--layout-inset-md);
      --ds-feed-end-message-inset: var(--layout-inset-md);
      --ds-feed-end-message-size: var(--font-size-sm);
      --ds-feed-font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    /* itemGap: layout.gap.normal, between the rows of the feed */
    [data-part='container'] {
      display: flex;
      flex-direction: column;
      gap: var(--ds-feed-item-gap);
    }

    /* newItemsOffset: space.3, padding above the sticky button (it is the first child) */
    .new-items-row {
      display: flex;
      justify-content: center;
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      padding-block-start: var(--ds-feed-new-items-offset);
    }

    /* articleInset: layout.inset.md, forwarded through Card's documented padding hooks */
    [data-part='article'] {
      --ds-card-padding-block: var(--ds-feed-article-inset);
      --ds-card-padding-inline: var(--ds-feed-article-inset);
    }

    /* unreadBorder / unreadBorderWidth: locked start-edge bar, drawn on Feed's own row beside the Card */
    .article-row[data-unread] {
      border-inline-start: var(--border-width-focus) solid var(--color-control-selected-background);
    }

    /* timestampSize: font.size.xs through Text's documented hook; timestampColor is Text tone="muted" (locked) */
    [data-part='timestamp'] {
      --ds-text-font-size: var(--ds-feed-timestamp-size);
    }

    /* fontFamily: font.family.body, reaching composed Text through its documented hook */
    ds-text {
      --ds-text-font-family: var(--ds-feed-font-family);
    }

    /* loadingInset: layout.inset.md */
    [data-part='loadingIndicator'] {
      padding-block: var(--ds-feed-loading-inset);
      padding-inline: var(--ds-feed-loading-inset);
    }

    /* endMessageInset: layout.inset.md, around the end message */
    .end-message-row {
      padding-block: var(--ds-feed-end-message-inset);
      padding-inline: var(--ds-feed-end-message-inset);
    }

    /* endMessageSize: font.size.sm through Text's hook; endMessageColor is Text tone="muted" (locked) */
    [data-part='endMessage'] {
      --ds-text-font-size: var(--ds-feed-end-message-size);
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

  /** What the feed contains ("Activity", "Notifications"). The feed's accessible name. */
  @property({ type: String }) accessor label = '';

  /** Articles, newest first. */
  @property({ attribute: false }) accessor items: FeedItem[] = [];

  /** More items exist beyond the last; the feed asks for them with `load-more` as the end approaches, and once on mount when empty and not `loading`. */
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
  @property({ attribute: false }) accessor overrides: Partial<Record<FeedOverridableBinding, TokenRef | undefined>> | undefined;

  @query('[data-part="newItemsButton"]') private accessor newItemsButtonEl!: HTMLElement | null;

  private loadMoreObserver: IntersectionObserver | undefined;
  private visibilityObserver: IntersectionObserver | undefined;
  private readonly visibilityTimers = new Map<string, number>();
  private readonly reportedVisible = new Set<string>();
  private pendingShowNewFocus = false;
  private mounted = false;

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
    const isEmpty = this.items.length === 0;

    return html`
      <div part="container" data-part="container" @keydown=${this.handleKeydown}>
        ${count > 0
          ? html`
              <div class="new-items-row">
                <ds-button
                  part="newItemsButton"
                  data-part="newItemsButton"
                  variant="secondary"
                  size="sm"
                  label=${COPY_SHOW_NEW(count)}
                  @press=${this.handleShowNewPress}
                ></ds-button>
              </div>
            `
          : nothing}
        ${repeat(
          this.items,
          (item) => item.id,
          (item, index) => this.renderArticle(item, index),
        )}
        ${this.renderFooter(isEmpty)}
      </div>
    `;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('items') || changed.has('hasMore') || changed.has('loading')) {
      this.syncObservers();
    }
    if (!this.mounted) {
      this.mounted = true;
      // An empty feed has no last article to observe, so it fetches its first page itself.
      if (this.items.length === 0 && this.hasMore && !this.loading) {
        this.dispatchLoadMore();
      }
    }
    if (this.pendingShowNewFocus && changed.has('items')) {
      this.pendingShowNewFocus = false;
      this.getArticles()[0]?.focus();
    }
  }

  private renderArticle(item: FeedItem, index: number): TemplateResult {
    const timestampId = `feed-ts-${item.id}`;
    const total = this.hasMore ? -1 : this.items.length;
    return html`
      <div class="article-row" ?data-unread=${item.unread === true}>
        <ds-card
          part="article"
          data-part="article"
          data-item-id=${item.id}
          heading=${item.heading}
          heading-level=${this.headingLevel}
          inset="md"
          focusable
          aria-describedby=${timestampId}
          aria-posinset=${index + 1}
          aria-setsize=${total}
        >
          <ds-stack part="articleBody" data-part="articleBody" gap="tight">
            ${item.unread ? html`<span class="visually-hidden">${COPY_UNREAD}</span>` : nothing}
            ${total !== -1 ? html`<span class="visually-hidden">${COPY_POSITION(index + 1, total)}</span>` : nothing}
            <ds-text part="timestamp" data-part="timestamp" element="span" tone="muted" size="xs"
              ><time id=${timestampId} datetime=${item.timestamp} title=${formatAbsoluteTime(item.timestamp)}
                >${formatRelativeTime(item.timestamp)}</time
              ></ds-text
            >
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

  private renderFooter(isEmpty: boolean): TemplateResult | typeof nothing {
    if (this.loading) {
      return html`
        <div part="loadingIndicator" data-part="loadingIndicator">
          <ds-progress-bar label=${COPY_LOADING} hide-label></ds-progress-bar>
        </div>
      `;
    }
    if (isEmpty) {
      return html`<ds-text part="emptyState" data-part="emptyState" tone="muted">${COPY_EMPTY}</ds-text>`;
    }
    if (!this.hasMore) {
      return html`
        <div class="end-message-row">
          <ds-text part="endMessage" data-part="endMessage" tone="muted" size="sm"
            >${this.endMessage ?? COPY_END}</ds-text
          >
        </div>
      `;
    }
    return nothing;
  }

  private getArticles(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('[data-part="article"]'));
  }

  private dispatchLoadMore(): void {
    this.dispatchEvent(new CustomEvent<void>('load-more', { bubbles: true, composed: true }));
  }

  private readonly handleShowNewPress = (event: Event): void => {
    // Feed announces its own request; the inner Button's press stays internal.
    event.stopPropagation();
    this.pendingShowNewFocus = true;
    this.dispatchEvent(new CustomEvent<void>('show-new', { bubbles: true, composed: true }));
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const articles = this.getArticles();
    const current = event
      .composedPath()
      .find((el): el is HTMLElement => el instanceof HTMLElement && articles.includes(el));
    // The feed commands apply only while focus is within an article.
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
        this.dispatchLoadMore();
      } else {
        this.focusOutside(1);
      }
    } else if (event.key === 'Home' && event.ctrlKey) {
      event.preventDefault();
      if (this.newItemsButtonEl !== null) {
        this.newItemsButtonEl.focus();
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
      if (import.meta.env.DEV) {
        console.warn('<ds-feed>: `label` is required; it is the feed\'s accessible name.');
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
    const articles = this.getArticles();
    const last = articles[articles.length - 1];
    if (last === undefined) {
      return;
    }

    if (this.hasMore && !this.loading) {
      this.loadMoreObserver = new IntersectionObserver(this.handleLoadMoreIntersect, { rootMargin: '100% 0px' });
      this.loadMoreObserver.observe(last);
    }

    this.visibilityObserver = new IntersectionObserver(this.handleVisibilityIntersect, { threshold: 0.5 });
    for (const article of articles) {
      if (!this.reportedVisible.has(article.dataset.itemId ?? '')) {
        this.visibilityObserver.observe(article);
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
      // One request per approach: the observer is rebuilt when `items` or `loading` change.
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
