import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult, type CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { DsLink } from './Link.js';
import './Link.js';
import './Button.js';
import './Icon.js';

/** Shape of each entry in `items`: `{ label: string; href?: string | undefined }`. */
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

/**
 * copy.* — `current` is a native-only string (aria-current="page" announces it here), so it is omitted.
 * `separator` is drawn with CSS from `--ds-breadcrumb-separator`, so it is not in the accessibility tree.
 */
const COPY = {
  separator: '/',
  expandLabel: 'Show all pages',
  navLabel: 'Breadcrumb',
} as const;

/** Trails longer than this collapse (first, ellipsis, last two). */
const COLLAPSE_ABOVE = 4;

/** Index of the first item hidden by collapsing, and of the focus fallback after expanding. */
const FIRST_HIDDEN = 1;

/** Negates a boolean attribute: `no-collapse` present means `collapse` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** An ancestor with no page of its own renders as plain text, never an empty link. */
function hasHref(item: BreadcrumbItem | undefined): item is BreadcrumbItem & { href: string } {
  return item?.href !== undefined && item.href !== '';
}

/**
 * Overridable style hooks; see the `overrides` property. `currentColor`, `itemColor`,
 * `separatorColor`, `focusRing`, `focusRingWidth` and `minTarget` are locked: absent from this
 * type, but their `--ds-breadcrumb-*` hooks stay on `:host` for page CSS.
 */
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
 * `preventDefault()` on it or on `originalEvent` (the retargeted native click)
 * cancels navigation. The ellipsis is a ghost `sm` icon-only `<ds-button>`,
 * used unchanged, whose `press` is stopped so consumers see only `navigate`.
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
      --ds-breadcrumb-current-color: var(--color-foreground);
      --ds-breadcrumb-item-color: var(--color-foreground-muted);
      --ds-breadcrumb-separator-color: var(--color-foreground-muted);
      --ds-breadcrumb-gap: var(--space-2);
      --ds-breadcrumb-focus-ring: var(--color-border-focus);
      --ds-breadcrumb-focus-ring-width: var(--border-width-focus);
      --ds-breadcrumb-font-family: var(--font-family-body);
      --ds-breadcrumb-font-size: var(--font-size-sm);
      --ds-breadcrumb-font-weight: var(--font-weight-regular);
      --ds-breadcrumb-line-height: var(--font-line-height-normal);
      --ds-breadcrumb-min-target: var(--size-target-min);
    }

    :host([hidden]) {
      display: none;
    }

    /* fontFamily, fontSize, fontWeight, lineHeight on the nav; ds-link inherits them */
    [data-part='nav'] {
      font-family: var(--ds-breadcrumb-font-family);
      font-size: var(--ds-breadcrumb-font-size);
      font-weight: var(--ds-breadcrumb-font-weight);
      line-height: var(--ds-breadcrumb-line-height);
    }

    /* the trail wraps rather than truncating; gap between items, no row gap (minTarget spaces the lines) */
    [data-part='list'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: var(--ds-breadcrumb-gap);
      row-gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    /* minTarget on the list item, not the inline Link; itemColor reaches a plain ancestor; gap after the separator */
    [data-part='item'] {
      display: inline-flex;
      align-items: center;
      gap: var(--ds-breadcrumb-gap);
      min-block-size: var(--ds-breadcrumb-min-target);
      color: var(--ds-breadcrumb-item-color);
    }

    /* separator: copy.separator, generated, so it is not in the accessibility tree */
    [data-part='item'] + [data-part='item']::before {
      content: var(--ds-breadcrumb-separator);
      color: var(--ds-breadcrumb-separator-color);
    }

    /* currentColor: the current page, as text in the regular weight */
    [data-part='current'] {
      color: var(--ds-breadcrumb-current-color);
    }

    /* focusRing / focusRingWidth: only the focus-fallback item; Link and Button draw their own */
    [data-part='item']:focus-visible {
      outline: var(--ds-breadcrumb-focus-ring-width) solid var(--ds-breadcrumb-focus-ring);
      outline-offset: var(--ds-breadcrumb-focus-ring-width);
    }
  `;

  /**
   * The trail from root to current page, in order. Every item but the last needs an `href`; an
   * ancestor without one (or with `''`) renders as plain text. The last is the current page and
   * its `href` is ignored. A property, not an attribute.
   */
  @property({ attribute: false }) accessor items: BreadcrumbItem[] = [];

  /** Accessible name of the navigation landmark (`copy.navLabel` by default). Change it only if the page has another breadcrumb. */
  @property() accessor label: string = COPY.navLabel;

  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the
   * ellipsis reveals the rest. Attribute is the negation, `no-collapse`, because a boolean
   * attribute cannot express `false` for a prop that defaults `true`.
   */
  @property({ attribute: 'no-collapse', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor collapse = true;

  /** Per-instance style overrides: `{ gap: 'space.3' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Whether the user has revealed the collapsed items: one-way, private, for the life of the instance. */
  @state() private accessor expanded = false;

  /** Once focus has fallen back to an item, the `<li>` at index 1 keeps `tabindex="-1"`. */
  @state() private accessor fallbackTabindex = false;

  /** Focus target decided at the press, applied in the update that reveals the items. */
  private pendingFocus: number | 'fallback' | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Breadcrumb');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    const target = this.pendingFocus;
    if (target === undefined) return;
    this.pendingFocus = undefined;
    if (target === 'fallback') {
      this.renderRoot.querySelector<HTMLElement>(`[data-index="${FIRST_HIDDEN}"]`)?.focus();
    } else {
      this.renderRoot.querySelector<DsLink>(`[data-index="${target}"] ds-link`)?.focus();
    }
  }

  protected override render(): TemplateResult {
    const items = this.items;
    const last = items.length - 1;
    const collapsed = this.collapse && !this.expanded && items.length > COLLAPSE_ABOVE;

    const entries: TemplateResult[] = [];
    items.forEach((item, index) => {
      if (collapsed && index >= FIRST_HIDDEN && index < last - 1) {
        if (index === FIRST_HIDDEN) {
          entries.push(html`
            <li part="item" data-part="item">
              <span part="expand" data-part="expand">
                <ds-button
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${COPY.expandLabel}
                  @press=${this.handleExpand}
                >
                  <ds-icon slot="leading-icon" name="ellipsis"></ds-icon>
                </ds-button>
              </span>
            </li>
          `);
        }
        return;
      }
      const tabindex = this.fallbackTabindex && index === FIRST_HIDDEN ? '-1' : nothing;
      if (index === last) {
        entries.push(html`
          <li part="item" data-part="item" data-index=${index} tabindex=${tabindex}>
            <span part="current" data-part="current" aria-current="page">${item.label}</span>
          </li>
        `);
      } else if (!hasHref(item)) {
        // No anatomy part of its own: plain text inside the item, taking itemColor from the <li>.
        entries.push(html`
          <li part="item" data-part="item" data-index=${index} tabindex=${tabindex}><span>${item.label}</span></li>
        `);
      } else {
        entries.push(html`
          <li part="item" data-part="item" data-index=${index} tabindex=${tabindex}>
            <span part="link" data-part="link">
              <ds-link
                tone="default"
                href=${item.href}
                label=${item.label}
                @click=${(event: MouseEvent) => this.handleNavigate(event, item, index)}
              ></ds-link>
            </span>
          </li>
        `);
      }
    });

    return html`
      <nav
        part="nav"
        data-part="nav"
        aria-label=${this.label}
        style=${`--ds-breadcrumb-separator: ${JSON.stringify(COPY.separator)}`}
      >
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

  private handleExpand(event: Event): void {
    // The ellipsis is internal; consumers see only `navigate`.
    event.stopPropagation();
    // The revealed items are 1 through length − 3 as they are now, at the press.
    const lastHidden = this.items.length - 3;
    let target: number | 'fallback' = 'fallback';
    for (let index = FIRST_HIDDEN; index <= lastHidden; index++) {
      if (hasHref(this.items[index])) {
        target = index;
        break;
      }
    }
    this.pendingFocus = target;
    if (target === 'fallback') this.fallbackTabindex = true;
    this.expanded = true;
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
