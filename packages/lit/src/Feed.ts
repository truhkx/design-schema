import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Card.js';
import './Button.js';
import './ProgressBar.js';
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
  unread?: boolean;
}

/** Detail carried by the `item-visible` CustomEvent. */
export interface FeedItemVisibleDetail {
  id: string;
}

/** Overridable style hooks; see the `overrides` property. `unreadBorder`, `timestampColor`, `endMessageColor`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type FeedOverridableBinding =
  | 'itemGap'
  | 'articleInset'
  | 'unreadBorderWidth'
  | 'timestampSize'
  | 'newItemsOffset'
  | 'loadingInset'
  | 'endMessageSize'
  | 'fontFamily';

const HOOKS: Record<FeedOverridableBinding, string> = {
  itemGap: '--ds-feed-item-gap',
  articleInset: '--ds-feed-article-inset',
  unreadBorderWidth: '--ds-feed-unread-border-width',
  timestampSize: '--ds-feed-timestamp-size',
  newItemsOffset: '--ds-feed-new-items-offset',
  loadingInset: '--ds-feed-loading-inset',
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

const RELATIVE_TIME = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
];

function formatRelativeTime(iso: string): string {
  let duration = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_TIME.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return RELATIVE_TIME.format(Math.round(duration), 'years');
}

function formatAbsoluteTime(iso: string): string {
  return new Date(iso).toLocaleString();
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
  if (el.hasAttribute('inert') || el.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null && Number(tabindex) < 0) {
    return false;
  }
  return el.matches(FOCUSABLE_SELECTOR);
}

/** Walks light DOM, slot assignments and open shadow roots in tree order. */
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

function findFocusableInDocument(): HTMLElement[] {
  const results: HTMLElement[] = [];
  for (const child of Array.from(document.body.children)) {
    collectFocusable(child, results);
  }
  return results;
}

/**
 * `<ds-feed>` — Feed (category: container, APG pattern: feed).
 *
 * A `role="feed"` host (set as a plain attribute, along with `aria-label` and
 * `aria-busy`, so accessible-name tooling reads them) around a shadow root of
 * `<ds-card>` articles built from `items`, newest first. Each card carries
 * `tabindex="-1"`, `aria-posinset`/`aria-setsize` and `aria-describedby`
 * (pointing at its own `<time>`) as plain attributes; `role="article"` and
 * cross-root `aria-labelledby` come from `<ds-card>` itself once `heading` is
 * set, so Feed never duplicates that. `IntersectionObserver`s drive
 * `load-more` (root margin one viewport, only while `hasMore` and not already
 * `loading`) and `item-visible` (50% visible for one second). The
 * `newItemsCount` button never inserts items itself — pressing it fires
 * `show-new` and, once the caller's next `items` update lands, focus moves to
 * the new first article. PageDown/PageUp move focus between articles;
 * Ctrl+End requests more when `hasMore` (otherwise leaves the feed forward);
 * Ctrl+Home goes to the new-items button when shown, otherwise leaves the
 * feed backward.
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
 * Do not use a Feed for a finite list that fits on a page, for records with
 * comparable fields (Table), or for a chat thread. Do not use it for content
 * that must be complete on load; paginate instead.
 *
 * @fires load-more - Fired when the last rendered article is within one screen of view (or on Ctrl+End with `hasMore`).
 * @fires show-new - Fired when the new-items button is pressed; the caller prepends the items and clears `newItemsCount`.
 * @fires item-visible - Fired with `{ id }` once an item has been substantially visible for a moment.
 * @csspart container - The list wrapper (anatomy: container).
 * @csspart article - Each `<ds-card>` (anatomy: article).
 * @csspart articleBody - The timestamp/content wrapper inside an article (anatomy: articleBody).
 * @csspart articleActions - The actions row inside an article (anatomy: articleActions).
 * @csspart loadingIndicator - The `<ds-progress-bar>` shown while `loading` (anatomy: loadingIndicator).
 * @csspart endMessage - The end-of-feed message (anatomy: endMessage).
 * @csspart newItemsButton - The sticky new-items `<ds-button>` (anatomy: newItemsButton).
 * @csspart emptyState - The empty-state `<ds-text>` (anatomy: emptyState).
 */
@customElement('ds-feed')
export class DsFeed extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-feed-font-family);
      --ds-feed-item-gap: var(--layout-gap-normal);
      --ds-feed-article-inset: var(--layout-inset-md);
      --ds-feed-unread-border-width: var(--border-width-focus);
      --ds-feed-timestamp-size: var(--font-size-xs);
      --ds-feed-new-items-offset: var(--space-3);
      --ds-feed-loading-inset: var(--layout-inset-md);
      --ds-feed-end-message-size: var(--font-size-sm);
      --ds-feed-font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: var(--ds-feed-item-gap);
    }

    /* newItemsOffset: space.3, above the sticky button */
    .new-items-wrap {
      display: flex;
      justify-content: center;
      position: sticky;
      inset-block-start: 0;
      padding-block-start: var(--ds-feed-new-items-offset);
    }

    /* articleInset: layout.inset.md, forwarded to each Card's own padding hooks */
    .container ds-card {
      --ds-card-padding-block: var(--ds-feed-article-inset);
      --ds-card-padding-inline: var(--ds-feed-article-inset);
    }

    /* unreadBorder: color.control.selectedBackground, locked; unreadBorderWidth overridable */
    .container ds-card[data-unread] {
      border-inline-start: var(--ds-feed-unread-border-width) solid var(--color-control-selected-background);
    }

    /* focusRing/focusRingWidth: color.border.focus / border.width.focus, locked. The article host itself is the focus target (tabindex=-1). */
    .container ds-card:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .article-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    /* timestampColor: color.foreground.muted, locked; timestampSize overridable */
    .timestamp {
      display: block;
      color: var(--color-foreground-muted);
      font-size: var(--ds-feed-timestamp-size);
    }

    .visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
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

    /* loadingInset: layout.inset.md */
    .loading {
      padding-block: var(--ds-feed-loading-inset);
      padding-inline: var(--ds-feed-loading-inset);
    }

    /* endMessageColor: color.foreground.muted, locked; endMessageSize overridable */
    .end-message {
      color: var(--color-foreground-muted);
      font-size: var(--ds-feed-end-message-size);
    }
  `;

  /** What the feed contains ("Activity", "Notifications"). The feed's accessible name. */
  @property() label = '';

  /** Articles, newest first. */
  @property({ attribute: false }) items: FeedItem[] = [];

  /** More items exist beyond the last; the feed asks for them with `load-more` as the end approaches. */
  @property({ type: Boolean, reflect: true, attribute: 'has-more' }) hasMore = false;

  /** More items are being fetched; a loading indicator is shown after the last article and the feed is `aria-busy`. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Number of newer items available above. Shows a "Show {count} new" button that prepends and scrolls; the feed never inserts them itself. */
  @property({ type: Number, reflect: true, attribute: 'new-items-count' }) newItemsCount?: number;

  /** Heading level for article headings, matching the page outline. */
  @property({ reflect: true, attribute: 'heading-level' }) headingLevel: FeedHeadingLevel = '3';

  /** Shown after the last item when `hasMore` is false. Defaults to `copy.end`. */
  @property({ attribute: 'end-message' }) endMessage?: string;

  /** Per-instance style overrides: `{ itemGap: 'layout.gap.loose' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<FeedOverridableBinding, TokenRef>>;

  @query('.new-items-button') private readonly newItemsButtonEl?: HTMLElement;

  private loadMoreObserver?: IntersectionObserver;
  private visibilityObserver?: IntersectionObserver;
  private readonly visibilityTimers = new Map<string, number>();
  private pendingShowNewFocus = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Feed');
    this.setAttribute('role', 'feed');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.teardownObservers();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render() {
    const showNewItems = Boolean(this.newItemsCount && this.newItemsCount > 0);
    const isEmpty = this.items.length === 0;

    return html`
      <div class="container" part="container" @keydown=${this.handleKeydown}>
        ${showNewItems
          ? html`
              <div class="new-items-wrap">
                <ds-button
                  class="new-items-button"
                  part="newItemsButton"
                  variant="secondary"
                  size="sm"
                  label=${COPY_SHOW_NEW(this.newItemsCount ?? 0)}
                  @press=${this.handleShowNewPress}
                ></ds-button>
              </div>
            `
          : nothing}
        ${isEmpty
          ? this.loading
            ? this.renderLoading()
            : html`<ds-text part="emptyState">${COPY_EMPTY}</ds-text>`
          : html`
              ${repeat(
                this.items,
                (item) => item.id,
                (item, index) => this.renderArticle(item, index),
              )}
              ${this.loading ? this.renderLoading() : !this.hasMore ? this.renderEndMessage() : nothing}
            `}
      </div>
    `;
  }

  protected override updated(changed: PropertyValues): void {
    this.syncHostAria();
    if (changed.has('items') || changed.has('hasMore') || changed.has('loading')) {
      this.syncObservers();
    }
    if (this.pendingShowNewFocus && changed.has('items')) {
      this.pendingShowNewFocus = false;
      this.getArticles()[0]?.focus();
    }
  }

  private renderArticle(item: FeedItem, index: number) {
    const timestampId = `ts-${item.id}`;
    const setsize = this.hasMore ? -1 : this.items.length;
    return html`
      <ds-card
        part="article"
        data-item-id=${item.id}
        ?data-unread=${item.unread}
        heading=${item.heading}
        heading-level=${this.headingLevel}
        tabindex="-1"
        aria-describedby=${timestampId}
        aria-posinset=${index + 1}
        aria-setsize=${setsize}
      >
        <div class="article-body" part="articleBody">
          ${item.unread ? html`<span class="visually-hidden">${COPY_UNREAD}</span>` : nothing}
          <time class="timestamp" id=${timestampId} datetime=${item.timestamp} title=${formatAbsoluteTime(item.timestamp)}
            >${formatRelativeTime(item.timestamp)}</time
          >
          ${setsize !== -1 ? html`<span class="visually-hidden">${COPY_POSITION(index + 1, setsize)}</span>` : nothing}
          ${item.content}
        </div>
        ${item.actions !== undefined
          ? html`<div slot="footer" part="articleActions">${item.actions}</div>`
          : nothing}
      </ds-card>
    `;
  }

  private renderLoading() {
    return html`
      <div class="loading" part="loadingIndicator">
        <ds-progress-bar label=${COPY_LOADING} hide-label></ds-progress-bar>
      </div>
    `;
  }

  private renderEndMessage() {
    return html`<div class="end-message" part="endMessage">${this.endMessage ?? COPY_END}</div>`;
  }

  private getArticles(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('ds-card'));
  }

  private readonly handleShowNewPress = (): void => {
    this.pendingShowNewFocus = true;
    this.dispatchEvent(new CustomEvent<void>('show-new', { bubbles: true, composed: true }));
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'PageDown') {
      event.preventDefault();
      this.focusAdjacentArticle(1, event.composedPath());
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      this.focusAdjacentArticle(-1, event.composedPath());
    } else if (event.ctrlKey && event.key === 'End') {
      event.preventDefault();
      this.handleCtrlEnd();
    } else if (event.ctrlKey && event.key === 'Home') {
      event.preventDefault();
      this.handleCtrlHome();
    }
  };

  private focusAdjacentArticle(delta: 1 | -1, path: EventTarget[]): void {
    const articles = this.getArticles();
    const current = path.find((el): el is HTMLElement => el instanceof HTMLElement && el.tagName === 'DS-CARD');
    const index = current ? articles.indexOf(current) : -1;
    if (index === -1) {
      return;
    }
    articles[index + delta]?.focus();
  }

  private handleCtrlEnd(): void {
    if (this.hasMore) {
      this.dispatchEvent(new CustomEvent<void>('load-more', { bubbles: true, composed: true }));
      return;
    }
    this.focusOutside(1);
  }

  private handleCtrlHome(): void {
    if (this.newItemsCount) {
      this.newItemsButtonEl?.focus();
      return;
    }
    this.focusOutside(-1);
  }

  /** Escapes the feed to the nearest focusable element in document order, before (`-1`) or after (`1`) the host. */
  private focusOutside(direction: 1 | -1): void {
    const candidates = findFocusableInDocument().filter((el) => !this.contains(el));
    if (direction === 1) {
      const next = candidates.find((el) => (this.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
      next?.focus();
    } else {
      const preceding = candidates.filter(
        (el) => (this.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
      );
      preceding[preceding.length - 1]?.focus();
    }
  }

  private syncHostAria(): void {
    if (this.label) {
      this.setAttribute('aria-label', this.label);
    } else {
      this.removeAttribute('aria-label');
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
    if (articles.length === 0) {
      return;
    }

    if (this.hasMore && !this.loading) {
      this.loadMoreObserver = new IntersectionObserver(this.handleLoadMoreIntersect, { rootMargin: '100% 0px' });
      this.loadMoreObserver.observe(articles[articles.length - 1]);
    }

    this.visibilityObserver = new IntersectionObserver(this.handleVisibilityIntersect, { threshold: 0.5 });
    for (const article of articles) {
      this.visibilityObserver.observe(article);
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
      this.dispatchEvent(new CustomEvent<void>('load-more', { bubbles: true, composed: true }));
    }
  };

  private readonly handleVisibilityIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const id = (entry.target as HTMLElement).dataset.itemId;
      if (!id) {
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
          this.dispatchEvent(
            new CustomEvent<FeedItemVisibleDetail>('item-visible', {
              detail: { id },
              bubbles: true,
              composed: true,
            }),
          );
        }, 1000);
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
