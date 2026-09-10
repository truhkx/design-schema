import { LitElement, css, html, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './Link.js';
import './Button.js';

/** Shape of each entry in `items`. */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Detail carried by the `navigate` CustomEvent. `preventDefault()` on `originalEvent` cancels navigation. */
export interface BreadcrumbNavigateDetail {
  item: BreadcrumbItem;
  index: number;
  originalEvent: MouseEvent;
}

/** copy.separator — drawn with CSS so it is not in the accessibility tree. */
const COPY_SEPARATOR = '/';
/** copy.expandLabel */
const COPY_EXPAND_LABEL = 'Show all pages';

/** Trails longer than this collapse (first, ellipsis, last two). */
const COLLAPSE_ABOVE = 4;

/**
 * `<ds-breadcrumb>` — Breadcrumb (category: navigation, APG pattern: breadcrumb).
 *
 * `<ds-breadcrumb .items=${[{ label: 'Docs', href: '/docs' }, { label: 'Components' }]}>`
 * renders `<nav aria-label>` with an `<ol>` in its shadow root; landmarks
 * inside shadow roots are exposed normally. Each ancestor is a `<ds-link>`;
 * the last item is the current page, `<span aria-current="page">`. Separators
 * are CSS-generated. Activating an ancestor dispatches a composed `navigate`
 * CustomEvent with `{ item, index, originalEvent }` before the native click
 * reaches the consumer; calling `preventDefault()` on `originalEvent` (the
 * retargeted native click) cancels navigation. The ellipsis is a ghost `sm`
 * icon-only `<ds-button>`, used unchanged, whose `press` is stopped so
 * consumers see only `navigate`. An ancestor without an `href` renders as
 * plain text.
 *
 * ## When to use
 *
 * Use a Breadcrumb on pages three or more levels deep in a hierarchy —
 * documentation, catalogues, settings sub-pages — placed above the page title
 * at the top of `main`. It shows the site's hierarchy, not the user's history,
 * and never replaces the primary navigation or Back.
 *
 * @fires navigate - Fired when a non-current item is activated with `{ item, index, originalEvent }` in `detail`. The link still navigates unless the consumer calls `preventDefault()` on `originalEvent`.
 * @csspart nav - The `<nav>` landmark (anatomy: nav).
 * @csspart list - The `<ol>` (anatomy: list).
 * @csspart item - Each `<li>` (anatomy: item).
 * @csspart link - Each ancestor `<ds-link>` (anatomy: link).
 * @csspart current - The current page `<span>` (anatomy: current).
 * @csspart expand - The ellipsis `<ds-button>` shown while collapsed.
 */
@customElement('ds-breadcrumb')
export class DsBreadcrumb extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    /* fontSize etc. on the nav; ds-link inherits (font: inherit on its anchor) */
    nav {
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-regular);
      line-height: var(--font-line-height-normal);
    }

    :host([hidden]) {
      display: none;
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* minTarget: block padding on the item, not the line */
    li {
      display: inline-flex;
      align-items: center;
      min-block-size: var(--size-target-min);
    }

    /* separator: copy.separator in separatorColor, gap on both sides, aria-hidden by construction */
    li + li::before {
      content: '${unsafeCSS(COPY_SEPARATOR)}';
      margin-inline: var(--space-2);
      color: var(--color-foreground-muted);
    }

    /* currentColor: the current page (and any ancestor without an href), rendered as text in the regular weight */
    .current,
    .text {
      color: var(--color-foreground);
    }
  `;

  /** The trail from root to current page, in order. A property, not an attribute. */
  @property({ attribute: false }) items: BreadcrumbItem[] = [];

  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  @property() label = 'Breadcrumb';

  /** When there are more than four items, show the first, an ellipsis, and the last two. */
  @property({ type: Boolean, reflect: true }) collapse = true;

  /** Whether the user has revealed the collapsed items. */
  @state() private expanded = false;

  protected override render() {
    const items = this.items;
    const last = items.length - 1;
    const collapsed = this.collapse && !this.expanded && items.length > COLLAPSE_ABOVE;

    const entries: TemplateResult[] = [];
    items.forEach((item, index) => {
      if (collapsed && index > 0 && index < last - 1) {
        if (index === 1) {
          entries.push(html`
            <li part="item">
              <ds-button
                class="expand"
                part="expand"
                variant="ghost"
                size="sm"
                icon-only
                label=${COPY_EXPAND_LABEL}
                @press=${this.handleExpand}
              >
                <svg slot="leading-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
                  <circle cx="3" cy="8" r="1.5" />
                  <circle cx="8" cy="8" r="1.5" />
                  <circle cx="13" cy="8" r="1.5" />
                </svg>
              </ds-button>
            </li>
          `);
        }
        return;
      }
      if (index === last) {
        entries.push(
          html`<li part="item"><span class="current" part="current" aria-current="page">${item.label}</span></li>`,
        );
      } else if (item.href === undefined || item.href === '') {
        entries.push(html`<li part="item"><span class="text">${item.label}</span></li>`);
      } else {
        entries.push(html`
          <li part="item">
            <ds-link
              part="link"
              data-index=${index}
              href=${item.href}
              label=${item.label}
              @click=${(event: MouseEvent) => this.handleNavigate(event, item, index)}
            ></ds-link>
          </li>
        `);
      }
    });

    return html`
      <nav part="nav" aria-label=${this.label}>
        <ol part="list">${entries}</ol>
      </nav>
    `;
  }

  private handleNavigate(originalEvent: MouseEvent, item: BreadcrumbItem, index: number): void {
    this.dispatchEvent(
      new CustomEvent<BreadcrumbNavigateDetail>('navigate', {
        detail: { item, index, originalEvent },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async handleExpand(event: Event): Promise<void> {
    // The ellipsis is internal; its `press` should not read as a consumer-facing event.
    event.stopPropagation();
    this.expanded = true;
    await this.updateComplete;
    // Focus moves to the first revealed link.
    const revealed = this.renderRoot.querySelector<HTMLElement>('ds-link[data-index="1"]');
    revealed?.focus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-breadcrumb': DsBreadcrumb;
  }
}
