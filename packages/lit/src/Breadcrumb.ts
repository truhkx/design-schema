import { LitElement, css, html, type PropertyValues, type TemplateResult, type CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { DsLink } from './Link.js';
import './Link.js';
import './Button.js';
import './Icon.js';

/** Shape of each entry in `items`: `{ label: string; href?: string }`. */
export interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
}

/** Detail carried by the `navigate` CustomEvent. `preventDefault()` on `originalEvent` (or on the `navigate` event) cancels navigation. */
export interface BreadcrumbNavigateDetail {
  item: BreadcrumbItem;
  index: number;
  originalEvent: MouseEvent;
}

/** copy.separator — drawn with CSS from `--ds-breadcrumb-separator`, so it is not in the accessibility tree. */
const COPY_SEPARATOR = '/';
/** copy.expandLabel */
const COPY_EXPAND_LABEL = 'Show all pages';
/** copy.navLabel */
const COPY_NAV_LABEL = 'Breadcrumb';

/** Trails longer than this collapse (first, ellipsis, last two). */
const COLLAPSE_ABOVE = 4;

/** Negates a boolean attribute: `no-collapse` present means `collapse` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. `currentColor`, `itemColor`, `separatorColor` and `minTarget` are locked and excluded. */
export type BreadcrumbOverridableBinding = 'gap' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight';

const HOOKS: Record<BreadcrumbOverridableBinding, string> = {
  gap: '--ds-breadcrumb-gap',
  fontFamily: '--ds-breadcrumb-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-breadcrumb-font-size',
  fontWeight: '--ds-breadcrumb-font-weight',
  lineHeight: '--ds-breadcrumb-line-height',
};

/**
 * `<ds-breadcrumb>` — Breadcrumb (category: navigation, APG pattern: breadcrumb).
 *
 * `<ds-breadcrumb .items=${[{ label: 'Docs', href: '/docs' }, { label: 'Components' }]}>`
 * renders `<nav aria-label>` with an `<ol>` in its shadow root; landmarks
 * inside shadow roots are exposed normally. Each ancestor is a `<ds-link>`;
 * the last item is the current page, `<span aria-current="page">`. Separators
 * are CSS-generated. Activating an ancestor dispatches a composed, cancelable
 * `navigate` CustomEvent with `{ item, index, originalEvent }`; calling
 * `preventDefault()` on `originalEvent` (the retargeted native click) cancels
 * navigation. The ellipsis is a ghost `sm` icon-only `<ds-button>`, used
 * unchanged, whose `press` is stopped so consumers see only `navigate`. An
 * ancestor without an `href` renders as plain text.
 *
 * ## When to use
 *
 * Use a Breadcrumb on pages three or more levels deep in a hierarchy —
 * documentation, catalogues, settings sub-pages — placed above the page title
 * at the top of `main`. It shows the site's hierarchy, not the user's history,
 * and never replaces the primary navigation or Back.
 *
 * @fires navigate - Fired when a non-current item is activated with `{ item, index, originalEvent }` in `detail`. Cancelable: the link still navigates unless `preventDefault()` is called on it or on `originalEvent`.
 */
@customElement('ds-breadcrumb')
export class DsBreadcrumb extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-breadcrumb-gap: var(--space-2);
      --ds-breadcrumb-font-family: var(--font-family-body);
      --ds-breadcrumb-font-size: var(--font-size-sm);
      --ds-breadcrumb-font-weight: var(--font-weight-regular);
      --ds-breadcrumb-line-height: var(--font-line-height-normal);
    }

    :host([hidden]) {
      display: none;
    }

    /* fontFamily, fontSize, fontWeight, lineHeight on the nav; ds-link inherits (font: inherit on its anchor) */
    [data-part='nav'] {
      font-family: var(--ds-breadcrumb-font-family);
      font-size: var(--ds-breadcrumb-font-size);
      font-weight: var(--ds-breadcrumb-font-weight);
      line-height: var(--ds-breadcrumb-line-height);
    }

    /* the trail wraps rather than truncating; gap: after each separator */
    [data-part='list'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: var(--ds-breadcrumb-gap);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* minTarget on the list item, not the inline Link; itemColor: an ancestor without href */
    [data-part='item'] {
      display: inline-flex;
      align-items: center;
      gap: var(--ds-breadcrumb-gap);
      min-block-size: var(--size-target-min);
      color: var(--color-foreground-muted);
    }

    /* separator: copy.separator in separatorColor, gap before it; generated, so aria-hidden by construction */
    [data-part='item'] + [data-part='item']::before {
      content: var(--ds-breadcrumb-separator);
      color: var(--color-foreground-muted);
    }

    /* currentColor: the current page, rendered as text in the regular weight */
    [data-part='current'] {
      color: var(--color-foreground);
    }
  `;

  /** The trail from root to current page, in order. Every item but the last needs an `href`; the last is the current page and its `href` is ignored. A property, not an attribute. */
  @property({ attribute: false }) accessor items: BreadcrumbItem[] = [];

  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  @property() accessor label: string = COPY_NAV_LABEL;

  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the
   * ellipsis reveals the rest. Attribute is the negation, `no-collapse`, because a boolean
   * attribute cannot express `false` for a prop that defaults `true`.
   */
  @property({ attribute: 'no-collapse', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor collapse = true;

  /** Per-instance style overrides: `{ gap: 'space.3' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;

  /** Whether the user has revealed the collapsed items (one-way). */
  @state() private accessor expanded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Breadcrumb');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    const items = this.items;
    const last = items.length - 1;
    const collapsed = this.collapse && !this.expanded && items.length > COLLAPSE_ABOVE;

    const entries: TemplateResult[] = [];
    items.forEach((item, index) => {
      if (collapsed && index > 0 && index < last - 1) {
        if (index === 1) {
          entries.push(html`
            <li part="item" data-part="item">
              <ds-button
                variant="ghost"
                size="sm"
                icon-only
                label=${COPY_EXPAND_LABEL}
                @press=${this.handleExpand}
              >
                <ds-icon slot="leading-icon" name="ellipsis"></ds-icon>
              </ds-button>
            </li>
          `);
        }
        return;
      }
      if (index === last) {
        entries.push(
          html`<li part="item" data-part="item"><span part="current" data-part="current" aria-current="page">${item.label}</span></li>`,
        );
      } else if (item.href === undefined || item.href === '') {
        entries.push(html`<li part="item" data-part="item">${item.label}</li>`);
      } else {
        entries.push(html`
          <li part="item" data-part="item">
            <ds-link
              part="link"
              data-part="link"
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
      <nav part="nav" data-part="nav" aria-label=${this.label} style=${`--ds-breadcrumb-separator: ${JSON.stringify(COPY_SEPARATOR)}`}>
        <ol part="list" data-part="list">${entries}</ol>
      </nav>
    `;
  }

  private handleNavigate(originalEvent: MouseEvent, item: BreadcrumbItem, index: number): void {
    const proceed = this.dispatchEvent(
      new CustomEvent<BreadcrumbNavigateDetail>('navigate', {
        detail: { item, index, originalEvent },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!proceed) {
      originalEvent.preventDefault();
    }
  }

  private async handleExpand(event: Event): Promise<void> {
    // The ellipsis is internal; consumers see only `navigate`.
    event.stopPropagation();
    const firstHidden = 1;
    const lastHidden = this.items.length - 3;
    this.expanded = true;
    await this.updateComplete;
    // Focus moves to the first revealed link.
    for (let index = firstHidden; index <= lastHidden; index++) {
      const link = this.renderRoot.querySelector<DsLink>(`[data-part="link"][data-index="${index}"]`);
      if (link) {
        link.focus();
        return;
      }
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as BreadcrumbOverridableBinding[]) {
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
    'ds-breadcrumb': DsBreadcrumb;
  }
}
