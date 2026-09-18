import { LitElement, css, html, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type BoxInset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxSurface = 'none' | 'default' | 'subtle' | 'strong';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type BoxElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

/** Overridable style hooks; see the `overrides` property. `background` is locked and excluded. */
export type BoxOverridableBinding = 'paddingBlock' | 'paddingInline' | 'border' | 'borderWidth' | 'radius';

/**
 * `element` values whose implicit role does not depend on ancestry, and that role.
 * `div`, `section`, `header` and `footer` set none: a native `<header>`/`<footer>` is only
 * a banner/contentinfo outside sectioning content, which the element cannot see.
 */
const SECTIONING_ROLES: Partial<Record<BoxElement, string>> = {
  article: 'article',
  aside: 'complementary',
  main: 'main',
  nav: 'navigation',
};

const HOOKS: Record<BoxOverridableBinding, string> = {
  paddingBlock: '--ds-box-padding-block',
  paddingInline: '--ds-box-padding-inline',
  border: '--ds-box-border',
  borderWidth: '--ds-box-border-width',
  radius: '--ds-box-radius',
};

/**
 * `<ds-box>` — Box (category: layout, role: none).
 *
 * `<ds-box inset="md" surface="subtle" radius="md">`. The host is the box
 * itself (`:host { display: block }`); children stay in the light DOM behind a
 * default slot, so Box never touches their semantics and never spaces them —
 * put a Stack inside for that. Padding, background, border and radius all come
 * from reflected attributes on `:host`, so nothing but the slot renders in the
 * shadow root. `element` swaps nothing there: the host is the element, so the
 * prop exists for API parity and sets a plain `role` attribute on the host for the
 * values whose implicit role is unconditional (`article`, `aside`, `main`,
 * `nav`); `div`, `section`, `header` and `footer` carry no role. Prefer
 * Landmark for page regions.
 *
 * ## When to use
 *
 * Use a Box to give a region a background or padding: a sidebar panel, a
 * highlighted row, a footer band, the inside of a modal. Choose `inset` by role
 * — `sm` for dense rows, `md` for most panels, `lg` for page-level containers,
 * `xl` for hero bands — and use `insetBlock`/`insetInline` when the axes differ.
 *
 * ## When not to use
 *
 * Not to put space between two components (that is Stack), not as a page
 * container (that is Container), and never nested more than two surfaces deep
 * (`subtle` on `default`, `strong` on `subtle`) — the contrast pairs are only
 * checked two deep. It never scrolls and never clips: `radius` does not imply
 * `overflow: hidden`, and a child that should be clipped clips itself.
 *
 * @slot - Any content. Box does not space its children; put a Stack inside for that.
 */
@customElement('ds-box')
export class DsBox extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-box-padding-block: var(--layout-inset-none);
      --ds-box-padding-inline: var(--layout-inset-none);
      --ds-box-border: var(--color-border);
      --ds-box-border-width: var(--border-width-thin);
      --ds-box-radius: var(--radius-none);
      padding-block: var(--ds-box-padding-block);
      padding-inline: var(--ds-box-padding-inline);
      /* surface="none" (and the default) is the literal transparent, not read through the hook. */
      background-color: transparent;
      border-style: solid;
      border-width: 0;
      border-color: var(--ds-box-border);
      /* radius="none" is written out as radius.none, not read through the hook. */
      border-radius: var(--radius-none);
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

    /* paddingBlock: layout.inset.{insetBlock}, declared after inset so the axis wins. */
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

    /* paddingInline: layout.inset.{insetInline}, declared after inset so the axis wins. */
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

    /* background: color.background.{surface}, locked — keeps its hook (the CSS escape hatch) but is
       not in the overrides type. surface="none" is the literal transparent, so the parent's shows through,
       and neither overrides nor consumer CSS on --ds-box-background paints it. */
    :host([surface='none']) {
      background-color: transparent;
    }
    :host([surface='default']),
    :host([surface='subtle']),
    :host([surface='strong']) {
      background-color: var(--ds-box-background);
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

    /* border / borderWidth: color.border, border.width.thin — a thin default border, only when asked for. */
    :host([border]) {
      border-width: var(--ds-box-border-width);
    }

    /* radius: radius.{radius}. Presence-gated: none means no rounded corners, so the hook is not read there. */
    :host([radius='none']) {
      border-radius: var(--radius-none);
    }
    :host([radius='sm']),
    :host([radius='md']),
    :host([radius='lg']),
    :host([radius='full']) {
      border-radius: var(--ds-box-radius);
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

  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  @property({ type: String, reflect: true }) accessor inset: BoxInset = 'none';

  /**
   * Vertical padding, overriding `inset` on that axis. No default: unset means `inset`
   * applies, which keeps an explicit `none` distinct from an absent value.
   */
  @property({ type: String, reflect: true, attribute: 'inset-block' }) accessor insetBlock: BoxInset | undefined;

  /** Horizontal padding, overriding `inset` on that axis. Unset means `inset` applies. */
  @property({ type: String, reflect: true, attribute: 'inset-inline' }) accessor insetInline: BoxInset | undefined;

  /**
   * Background. `none` is transparent; `default` is the page background (use to
   * lift content off a subtle parent); `subtle` and `strong` step up.
   */
  @property({ type: String, reflect: true }) accessor surface: BoxSurface = 'none';

  /** A thin default border. */
  @property({ type: Boolean, reflect: true }) accessor border = false;

  /** Corner radius from the theme's presets. */
  @property({ type: String, reflect: true }) accessor radius: BoxRadius = 'none';

  /**
   * Element to render. The host is always the element in the DOM, so this swaps
   * nothing in the shadow root; `article`, `aside`, `main` and `nav` set their
   * implicit role on the host as a plain `role` attribute, and `div`, `section`,
   * `header` and `footer` set none. Sectioning values only when the box is a
   * semantic region; prefer Landmark for page regions.
   */
  @property({ type: String }) accessor element: BoxElement = 'div';

  /** Per-instance style overrides: `{ radius: 'radius.lg' }`. The locked `background` is ignored. */
  @property({ attribute: false })
  accessor overrides: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Box');
    /* The host is the surface (anatomy: surface); there is no box in the shadow root to carry the part. */
    this.setAttribute('data-part', 'surface');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('element')) {
      /* A plain attribute, not ElementInternals: the accessible-role tests cannot read internals. */
      const role = SECTIONING_ROLES[this.element];
      if (role === undefined) {
        this.removeAttribute('role');
      } else if (this.getAttribute('role') !== role) {
        this.setAttribute('role', role);
      }
    }
    /* `border` and `radius` decide which overrides are in effect, so a change to either re-applies them. */
    if (changed.has('overrides') || changed.has('border') || changed.has('radius')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }

  /**
   * Overrides change values, never presence: `border: false` draws no border and
   * `radius: none` rounds nothing, so those bindings are not in effect and their
   * overrides are no-ops.
   */
  private isInEffect(binding: BoxOverridableBinding): boolean {
    switch (binding) {
      case 'border':
      case 'borderWidth':
        return this.border;
      case 'radius':
        return this.radius !== 'none';
      default:
        return true;
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as BoxOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined || !this.isInEffect(binding)) {
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
