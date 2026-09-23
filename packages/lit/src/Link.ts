import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';

export type LinkTone = 'default' | 'inherit';

/** copy.externalSuffix — appended to the accessible name of an external link. */
const EXTERNAL_SUFFIX = ' (opens in new tab)';

/** Overridable style hooks; see the `overrides` property. `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth`, `focusRingRadius` and `focusRingOffset` are locked and excluded. */
export type LinkOverridableBinding = 'underlineThickness' | 'underlineOffset' | 'externalIconGap' | 'transition';

const HOOKS: Record<LinkOverridableBinding, string> = {
  underlineThickness: '--ds-link-underline-thickness',
  underlineOffset: '--ds-link-underline-offset',
  externalIconGap: '--ds-link-external-icon-gap',
  transition: '--ds-link-transition',
};

/**
 * `<ds-link>` — Link (category: navigation, APG pattern: link).
 *
 * Wraps a native `<a href>` in a shadow root created with `delegatesFocus`, so
 * focusing the host focuses the anchor. There is no custom event: the native
 * `click` bubbles and retargets to the host, and consumers who route
 * client-side call `preventDefault()` on it there. The host is `display: inline`
 * so a link can sit inside a `<ds-text>` paragraph.
 *
 * `href` and `label` are required but start as `''`; an empty href is the
 * consumer's authoring error (render Text instead), and Link does not warn.
 *
 * ## When to use
 *
 * Use a Link for any navigation: another page, a screen, an anchor, an
 * external site, or a downloadable file. Use `external` whenever the
 * destination leaves the product so people are warned before they lose their
 * place. Do not use a Link to trigger an action; that is a ghost Button.
 *
 * @fires click - The native anchor's click, retargeted to the host (onPress). Cancelable: `preventDefault()` skips navigation.
 */
@customElement('ds-link')
export class DsLink extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: inline;
      --ds-link-underline-thickness: var(--border-width-thin);
      --ds-link-underline-offset: var(--space-1);
      --ds-link-external-icon-gap: var(--space-1);
      --ds-link-transition: var(--motion-duration-fast);
      /* Locked bindings: out of the overrides type, but themeable from page CSS and renameable by the naming codemod. */
      --ds-link-color: var(--color-link);
      --ds-link-color-hover: var(--color-link-hover);
      --ds-link-color-visited: var(--color-link-visited);
      --ds-link-focus-ring: var(--color-border-focus);
      --ds-link-focus-ring-width: var(--border-width-focus);
      --ds-link-focus-ring-radius: var(--radius-sm);
      --ds-link-focus-ring-offset: var(--border-width-focus);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='anchor'] {
      /* A link has no typography of its own: it takes the surrounding text's. */
      font: inherit;
      /* tone=inherit: rest, hover and visited all resolve to the inherited color; the underline and icon follow currentColor */
      color: inherit;
      text-decoration-line: underline;
      text-decoration-thickness: var(--ds-link-underline-thickness);
      text-underline-offset: var(--ds-link-underline-offset);
      transition: color var(--ds-link-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='anchor'] {
        transition: none;
      }
    }

    /* color, colorVisited and colorHover apply under tone=default only */
    :host(:not([tone='inherit'])) [data-part='anchor'] {
      color: var(--ds-link-color);
    }

    :host(:not([tone='inherit'])) [data-part='anchor']:visited {
      color: var(--ds-link-color-visited);
    }

    /* colorHover: pointer hover only, not :active, with no hover-media guard */
    :host(:not([tone='inherit'])) [data-part='anchor']:hover {
      color: var(--ds-link-color-hover);
    }

    /* focusRing, focusRingWidth, focusRingRadius, focusRingOffset: the ring follows the inline text box */
    [data-part='anchor']:focus-visible {
      outline: var(--ds-link-focus-ring-width) solid var(--ds-link-focus-ring);
      outline-offset: var(--ds-link-focus-ring-offset);
      border-radius: var(--ds-link-focus-ring-radius);
    }

    /* externalIconGap, on Link's own wrapper; the icon inside is 1em of the surrounding font (ds-icon inline) */
    [data-part='externalIcon'] {
      margin-inline-start: var(--ds-link-external-icon-gap);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** The destination. A URL. An empty href still renders `href=""`, so the anchor stays a link in the focus order. */
  @property() accessor href = '';

  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  @property() accessor label = '';

  /** Opens the destination in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  @property({ type: Boolean, reflect: true }) accessor external = false;

  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  @property({ type: String, reflect: true }) accessor tone: LinkTone = 'default';

  /** Downloads the resource instead of navigating, under the server's file name. */
  @property({ type: Boolean, reflect: true }) accessor download = false;

  /**
   * The link points at the page the user is on, in a navigation list: `aria-current="page"` on the anchor.
   * The link keeps its colours and underline; how a navigation marks it visually is that container's to say.
   * False writes nothing.
   */
  @property({ type: Boolean, reflect: true }) accessor current = false;

  /** Per-instance style overrides: `{ underlineOffset: 'space.2' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Link');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides') || changed.has('external')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    return html`<a
      part="anchor"
      data-part="anchor"
      href=${this.href}
      target=${ifDefined(this.external ? '_blank' : undefined)}
      rel=${ifDefined(this.external ? 'noopener noreferrer' : undefined)}
      ?download=${this.download}
      aria-current=${ifDefined(this.current ? 'page' : undefined)}
      ><span part="label" data-part="label">${this.label}</span>${this.external
        ? html`<span class="visually-hidden">${EXTERNAL_SUFFIX}</span
            ><span part="externalIcon" data-part="externalIcon"><ds-icon name="external" inline></ds-icon></span>`
        : nothing}</a
    >`;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as LinkOverridableBinding[]) {
      const hook = HOOKS[binding];
      // externalIconGap only applies where the externalIcon part is present.
      const ref = binding === 'externalIconGap' && !this.external ? undefined : this.overrides?.[binding];
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
    'ds-link': DsLink;
  }
}
