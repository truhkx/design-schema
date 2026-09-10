import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type BoxInset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxSurface = 'none' | 'default' | 'subtle' | 'strong';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type BoxElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

/** Overridable style hooks; see the `overrides` property. */
export type BoxOverridableBinding =
  | 'paddingBlock'
  | 'paddingInline'
  | 'background'
  | 'border'
  | 'borderWidth'
  | 'radius';

/** Sectioning `element` values and the implicit landmark role each maps to. `div`/`section` set no role. */
const SECTIONING_ROLES: Partial<Record<BoxElement, string>> = {
  article: 'article',
  aside: 'complementary',
  header: 'banner',
  footer: 'contentinfo',
  main: 'main',
  nav: 'navigation',
};

const HOOKS: Record<BoxOverridableBinding, string> = {
  paddingBlock: '--ds-box-padding-block',
  paddingInline: '--ds-box-padding-inline',
  background: '--ds-box-background',
  border: '--ds-box-border',
  borderWidth: '--ds-box-border-width',
  radius: '--ds-box-radius',
};

/**
 * `<ds-box>` — Box (category: layout, role: none).
 *
 * `<ds-box inset="md" surface="subtle" radius="md">`. The host is the box
 * itself (`:host { display: block }`); children stay in the light DOM behind
 * a default slot, so Box never touches their semantics. Padding, background,
 * border and radius are all reflected-attribute-driven CSS custom properties
 * on `:host`, so nothing but the host renders in the shadow root. `element`
 * sets a landmark role on the host via `ElementInternals` for the sectioning
 * values only (`article`, `aside`, `header`, `footer`, `main`, `nav`); `div`
 * and `section` carry no role.
 *
 * ## When to use
 *
 * Use a Box to give a region a background or padding: a sidebar panel, a
 * highlighted row, a footer band, the inside of a modal. Use `insetBlock`/
 * `insetInline` when the axes differ; put a Stack inside for gaps between
 * children — Box never spaces its own content.
 *
 * @slot - Any content. Box does not space its children; put a Stack inside for that.
 */
@customElement('ds-box')
export class DsBox extends LitElement {
  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-box-padding-block: var(--layout-inset-none);
      --ds-box-padding-inline: var(--layout-inset-none);
      --ds-box-background: transparent;
      --ds-box-border: var(--color-border);
      --ds-box-border-width: var(--border-width-thin);
      --ds-box-radius: var(--radius-none);
      padding-block: var(--ds-box-padding-block);
      padding-inline: var(--ds-box-padding-inline);
      background: var(--ds-box-background);
      border-style: solid;
      border-width: 0;
      border-color: var(--ds-box-border);
      border-radius: var(--ds-box-radius);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock/paddingInline: layout.inset.{inset} */
    :host([inset='none']) {
      --ds-box-padding-block: var(--layout-inset-none);
      --ds-box-padding-inline: var(--layout-inset-none);
    }
    :host([inset='sm']) {
      --ds-box-padding-block: var(--layout-inset-sm);
      --ds-box-padding-inline: var(--layout-inset-sm);
    }
    :host([inset='md']) {
      --ds-box-padding-block: var(--layout-inset-md);
      --ds-box-padding-inline: var(--layout-inset-md);
    }
    :host([inset='lg']) {
      --ds-box-padding-block: var(--layout-inset-lg);
      --ds-box-padding-inline: var(--layout-inset-lg);
    }
    :host([inset='xl']) {
      --ds-box-padding-block: var(--layout-inset-xl);
      --ds-box-padding-inline: var(--layout-inset-xl);
    }

    /* paddingBlock override, per axis: layout.inset.{insetBlock}. Declared after inset to win. */
    :host([inset-block='none']) {
      --ds-box-padding-block: var(--layout-inset-none);
    }
    :host([inset-block='sm']) {
      --ds-box-padding-block: var(--layout-inset-sm);
    }
    :host([inset-block='md']) {
      --ds-box-padding-block: var(--layout-inset-md);
    }
    :host([inset-block='lg']) {
      --ds-box-padding-block: var(--layout-inset-lg);
    }
    :host([inset-block='xl']) {
      --ds-box-padding-block: var(--layout-inset-xl);
    }

    /* paddingInline override, per axis: layout.inset.{insetInline}. Declared after inset to win. */
    :host([inset-inline='none']) {
      --ds-box-padding-inline: var(--layout-inset-none);
    }
    :host([inset-inline='sm']) {
      --ds-box-padding-inline: var(--layout-inset-sm);
    }
    :host([inset-inline='md']) {
      --ds-box-padding-inline: var(--layout-inset-md);
    }
    :host([inset-inline='lg']) {
      --ds-box-padding-inline: var(--layout-inset-lg);
    }
    :host([inset-inline='xl']) {
      --ds-box-padding-inline: var(--layout-inset-xl);
    }

    /* background: color.background.{surface}; none renders transparent. */
    :host([surface='none']) {
      --ds-box-background: transparent;
    }
    :host([surface='default']) {
      --ds-box-background: var(--color-background);
    }
    :host([surface='subtle']) {
      --ds-box-background: var(--color-background-subtle);
    }
    :host([surface='strong']) {
      --ds-box-background: var(--color-background-strong);
    }

    /* border / borderWidth: color.border, border.width.thin. A thin default border, only when present. */
    :host([border]) {
      border-width: var(--ds-box-border-width);
    }

    /* radius: radius.{radius} */
    :host([radius='none']) {
      --ds-box-radius: var(--radius-none);
    }
    :host([radius='sm']) {
      --ds-box-radius: var(--radius-sm);
    }
    :host([radius='md']) {
      --ds-box-radius: var(--radius-md);
    }
    :host([radius='lg']) {
      --ds-box-radius: var(--radius-lg);
    }
    :host([radius='full']) {
      --ds-box-radius: var(--radius-full);
    }
  `;

  /** Padding on all sides. Use `insetBlock`/`insetInline` when the axes differ. */
  @property({ reflect: true }) inset: BoxInset = 'none';

  /** Vertical padding, overriding `inset` on that axis. */
  @property({ reflect: true, attribute: 'inset-block' }) insetBlock?: BoxInset;

  /** Horizontal padding, overriding `inset` on that axis. */
  @property({ reflect: true, attribute: 'inset-inline' }) insetInline?: BoxInset;

  /** Background. `none` is transparent; `default`/`subtle`/`strong` step up. */
  @property({ reflect: true }) surface: BoxSurface = 'none';

  /** A thin default border. */
  @property({ type: Boolean, reflect: true }) border = false;

  /** Corner radius from the theme's presets. */
  @property({ reflect: true }) radius: BoxRadius = 'none';

  /**
   * Element to render. The host is always the element in the DOM; sectioning
   * values (`article`, `aside`, `header`, `footer`, `main`, `nav`) set the
   * matching landmark role on the host through `ElementInternals`. `div` and
   * `section` set no role. Prefer Landmark for page regions.
   */
  @property() element: BoxElement = 'div';

  /** Per-instance style overrides: `{ background: 'color.status.danger.background' }`. */
  @property({ attribute: false }) overrides?: Partial<Record<BoxOverridableBinding, TokenRef>>;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Box');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('element')) {
      this.internals.role = SECTIONING_ROLES[this.element] ?? null;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as BoxOverridableBinding[]) {
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
    'ds-box': DsBox;
  }
}
