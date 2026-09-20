import { LitElement, css, html, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type ContainerWidth = 'prose' | 'content' | 'page' | 'full';
export type ContainerGutter = 'narrow' | 'default' | 'wide' | 'none';
export type ContainerAlign = 'center' | 'start';
export type ContainerElement = 'div' | 'main' | 'section';

/** Overridable style hooks; see the `overrides` property. */
export type ContainerOverridableBinding = 'maxWidth' | 'paddingInline';

const HOOKS: Record<ContainerOverridableBinding, string> = {
  maxWidth: '--ds-container-max-width',
  paddingInline: '--ds-container-padding-inline',
};

/**
 * `<ds-container>` — Container (category: layout, role: none).
 *
 * `<ds-container width="content" gutter="default" align="center">`. The host
 * is the capped column itself (`:host { display: block }`); children stay in
 * the light DOM behind a default slot, and the host carries
 * `data-part="column"`. `maxWidth` and `paddingInline` are
 * reflected-attribute-driven CSS custom properties on `:host`. `element:
 * main` sets the page's main landmark role on the host through
 * `ElementInternals`; `div` and `section` carry no role, since a custom
 * element's host tag can't be swapped the way a real HTML tag can.
 *
 * ## When to use
 *
 * Wrap every page's content in one Container, inside the `main` Landmark,
 * with `width: content` for application screens and `width: prose` for
 * reading. Use `page` for layouts with wide data grids or side-by-side
 * panels, and `full` only for edge-to-edge sections that manage their own
 * inner Container. Nest a `gutter: none` Container inside a padded parent
 * when a section needs a narrower measure than the page.
 *
 * @slot - The page or region content, usually a Stack with `gap: section` between regions.
 */
@customElement('ds-container')
export class DsContainer extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      box-sizing: border-box;
      margin-inline: auto;
      --ds-container-max-width: var(--layout-max-width-content);
      --ds-container-padding-inline: var(--layout-gutter-narrow);
      max-inline-size: var(--ds-container-max-width);
      padding-inline: var(--ds-container-padding-inline);
    }

    :host([hidden]) {
      display: none;
    }

    /* maxWidth: layout.maxWidth.{width}; full renders no max-width. */
    :host([width='prose']) {
      --ds-container-max-width: var(--layout-max-width-prose);
    }
    :host([width='content']) {
      --ds-container-max-width: var(--layout-max-width-content);
    }
    :host([width='page']) {
      --ds-container-max-width: var(--layout-max-width-page);
    }
    /* full: the literal none with no hook, so a maxWidth override is a no-op here. */
    :host([width='full']) {
      max-inline-size: none;
    }

    /* paddingInline: layout.gutter.{gutter}; none renders no padding. default is responsive,
       narrow below layout.maxWidth.content and wide above layout.maxWidth.page; custom
       properties are not valid in media queries, so the breakpoints below are the resolved
       px values of those two tokens, read from the token file at generation time. Both
       boundaries are inclusive (a min-width query), so a viewport exactly at a token width
       takes the wider gutter. The bare :host carries the responsive default alongside
       [gutter='default'], since before the first update the attribute is not yet reflected
       and the plain rules have to be the prop defaults; an attribute selector is more specific
       than :host, so narrow/wide/none still win whenever their attribute is present. */
    :host([gutter='narrow']) {
      --ds-container-padding-inline: var(--layout-gutter-narrow);
    }
    :host([gutter='wide']) {
      --ds-container-padding-inline: var(--layout-gutter-wide);
    }
    /* none: a literal 0 with no hook, so a paddingInline override is a no-op here. */
    :host([gutter='none']) {
      padding-inline: 0;
    }
    :host([gutter='default']) {
      --ds-container-padding-inline: var(--layout-gutter-narrow);
    }

    @media (min-width: 960px) { /* literal-ok: breakpoint from layout.maxWidth.content */
      :host,
      :host([gutter='default']) {
        --ds-container-padding-inline: var(--layout-gutter);
      }
    }

    @media (min-width: 1280px) { /* literal-ok: breakpoint from layout.maxWidth.page */
      :host,
      :host([gutter='default']) {
        --ds-container-padding-inline: var(--layout-gutter-wide);
      }
    }

    /* align: margin-inline; center keeps the column centered, start zeroes both sides. */
    :host([align='start']) {
      margin-inline: 0;
    }
  `;

  /** `prose` for reading, `content` for most screens, `page` for wide layouts, `full` for no cap. */
  @property({ type: String, reflect: true }) accessor width: ContainerWidth = 'content';

  /** Horizontal padding at the viewport edge. `default` is responsive; `none` for a nested container. */
  @property({ type: String, reflect: true }) accessor gutter: ContainerGutter = 'default';

  /** Where the capped column sits in a wider viewport. `start` sets `margin-inline: 0` on both sides. */
  @property({ type: String, reflect: true }) accessor align: ContainerAlign = 'center';

  /** Use `main` for the page's main column when no Landmark wraps it. */
  @property({ type: String }) accessor element: ContainerElement = 'div';

  /** Per-instance style overrides: `{ maxWidth: 'layout.maxWidth.page' }`. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ContainerOverridableBinding, TokenRef | undefined>> | undefined;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Container');
    this.setAttribute('data-part', 'column');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('element')) {
      this.internals.role = this.element === 'main' ? 'main' : null;
    }
    /* `width` and `gutter` decide which overrides are in effect, so a change to either re-applies them. */
    if (changed.has('overrides') || changed.has('width') || changed.has('gutter')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }

  /**
   * Overrides change values, never presence: `width: full` renders the literal `none` and
   * `gutter: none` a literal 0, neither read through a hook, so those bindings are not in
   * effect and their overrides are no-ops. No dev warning fires for one that has no effect.
   */
  private isInEffect(binding: ContainerOverridableBinding): boolean {
    switch (binding) {
      case 'maxWidth':
        return this.width !== 'full';
      case 'paddingInline':
        return this.gutter !== 'none';
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as ContainerOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined || !this.isInEffect(binding)) {
        this.style.removeProperty(hook);
      } else {
        /* Set inline, so a paddingInline override replaces the whole responsive `default`
           gutter at every viewport width, not just its middle band. */
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-container': DsContainer;
  }
}
