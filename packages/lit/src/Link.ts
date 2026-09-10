import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';

export type LinkTone = 'default' | 'inherit';

/** copy.externalSuffix — appended to the accessible name of an external link. */
const EXTERNAL_SUFFIX = ' (opens in new tab)';

/** Overridable style hooks; see the `overrides` property. `color`, `colorHover`, `colorVisited`, `focusRing`, `focusRingWidth` and `focusRingRadius` are locked and excluded. */
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
 * ## When to use
 *
 * Use a Link for any navigation: another page, a screen, an anchor, an
 * external site, or a downloadable file. Use `external` whenever the
 * destination leaves the product so people are warned before they lose their
 * place. Do not use a Link to trigger an action; that is a ghost Button.
 *
 * @csspart anchor - The native `<a>` (anatomy: anchor).
 * @csspart label - The visible link text (anatomy: label).
 * @csspart external-icon - The decorative trailing icon shown when `external` (anatomy: externalIcon).
 */
@customElement('ds-link')
export class DsLink extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: inline;
      --ds-link-underline-thickness: var(--border-width-thin);
      --ds-link-underline-offset: var(--space-1);
      --ds-link-external-icon-gap: var(--space-1);
      --ds-link-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    a {
      /* Inherit the surrounding font so the link flows with its paragraph. */
      font: inherit;
      color: var(--color-link);
      text-decoration-line: underline;
      text-decoration-thickness: var(--ds-link-underline-thickness);
      text-underline-offset: var(--ds-link-underline-offset);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: color var(--ds-link-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      a {
        transition: none;
      }
    }

    /* colorVisited: web and Lit only */
    a:visited {
      color: var(--color-link-visited);
    }

    /* colorHover: pointer hover and active state */
    a:is(:hover, :active) {
      color: var(--color-link-hover);
    }

    /* tone=inherit: takes the surrounding text color; the underline alone marks the link */
    :host([tone='inherit']) a,
    :host([tone='inherit']) a:visited,
    :host([tone='inherit']) a:is(:hover, :active) {
      color: inherit;
    }

    /* focus-visible: the ring follows the text box (inline), rounded by focusRingRadius */
    a:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    /* externalIcon: 1em of the surrounding font size (ds-icon's own inline sizing), never larger */
    ds-icon {
      margin-inline-start: var(--ds-link-external-icon-gap);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** The destination URL. */
  @property() href = '';

  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  @property() label = '';

  /** Opens in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  @property({ type: Boolean, reflect: true }) external = false;

  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  @property({ reflect: true }) tone: LinkTone = 'default';

  /** Downloads the resource instead of navigating. */
  @property({ type: Boolean, reflect: true }) download = false;

  /** Per-instance style overrides: `{ underlineOffset: 'space.2' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<LinkOverridableBinding, TokenRef>>;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Link');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render() {
    return html`
      <a
        part="anchor"
        href=${this.href}
        target=${ifDefined(this.external ? '_blank' : undefined)}
        rel=${ifDefined(this.external ? 'noopener noreferrer' : undefined)}
        ?download=${this.download}
      >
        <span part="label">${this.label}</span>${this.external
          ? html`<span class="visually-hidden">${EXTERNAL_SUFFIX}</span
              ><ds-icon part="external-icon" name="external" inline></ds-icon>`
          : nothing}
      </a>
    `;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as LinkOverridableBinding[]) {
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
    'ds-link': DsLink;
  }
}
