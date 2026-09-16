import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
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
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='anchor'] {
      /* A link has no typography of its own: it takes the surrounding text's. */
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
      [data-part='anchor'] {
        transition: none;
      }
    }

    /* colorVisited */
    [data-part='anchor']:visited {
      color: var(--color-link-visited);
    }

    /* colorHover */
    [data-part='anchor']:hover {
      color: var(--color-link-hover);
    }

    /* tone=inherit: the surrounding text color; the underline alone marks the link */
    :host([tone='inherit']) [data-part='anchor'],
    :host([tone='inherit']) [data-part='anchor']:visited,
    :host([tone='inherit']) [data-part='anchor']:hover {
      color: inherit;
    }

    /* focusRing, focusRingWidth, focusRingRadius: the ring follows the inline text box */
    [data-part='anchor']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    /* externalIconGap; the icon itself is 1em of the surrounding font (ds-icon inline) */
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
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** The destination. */
  @property() accessor href = '';

  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  @property() accessor label = '';

  /** Opens the destination in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  @property({ type: Boolean, reflect: true }) accessor external = false;

  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  @property({ type: String, reflect: true }) accessor tone: LinkTone = 'default';

  /** Downloads the resource instead of navigating, under the server's file name. */
  @property({ type: Boolean, reflect: true }) accessor download = false;

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
      ><span part="label" data-part="label">${this.label}</span>${this.external
        ? html`<span class="visually-hidden">${EXTERNAL_SUFFIX}</span
            ><ds-icon part="externalIcon" data-part="externalIcon" name="external" inline></ds-icon>`
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
