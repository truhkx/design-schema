import { LitElement, css, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';
export type TextElement = 'p' | 'span';

/** Overridable style hooks; see the `overrides` property. `color` is locked and excluded. */
export type TextOverridableBinding = 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight';

const HOOKS: Record<TextOverridableBinding, string> = {
  fontFamily: '--ds-text-font-family',
  fontSize: '--ds-text-font-size',
  fontWeight: '--ds-text-font-weight',
  lineHeight: '--ds-text-line-height',
};

const TAGS: Record<TextElement, StaticValue> = {
  p: literal`p`,
  span: literal`span`,
};

function isTextElement(value: unknown): value is TextElement {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TAGS, value);
}

/**
 * `<ds-text>` — Text (category: typography).
 *
 * `<ds-text size="sm" tone="muted">` renders the chosen `element` inside a
 * shadow root with `part="text"`. The host is `display: contents` for
 * `span`-like use and `display: block` otherwise, so the rendered element takes
 * part in the surrounding layout directly. Reflected attributes allow
 * `ds-text[tone="danger"]` selectors in consuming apps.
 *
 * ## When to use
 *
 * Use Text for paragraphs, labels, captions, helper text, and any inline copy.
 * Pick `size` from the scale rather than styling a raw element, and use `tone`
 * for meaning: `muted` for secondary information, `danger` for errors, `strong`
 * when a phrase must stand out from surrounding body copy. Use `weight` to
 * create hierarchy inside a size; it is calmer than jumping sizes.
 *
 * Do not use Text for section titles — that is `<ds-heading>`, which carries
 * document structure — and do not use `tone="danger"` decoratively: it is
 * reserved for error and destructive messaging, paired with explicit wording so
 * colour never carries the meaning alone.
 *
 * `part="text"` is the anatomy name only; styling comes through the
 * `--ds-text-*` hooks and `overrides`, never `::part`.
 *
 * @slot - The text content. Inline formatting (emphasis, links) is allowed; block elements are not.
 */
@customElement('ds-text')
export class DsText extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-text-font-family: var(--font-family-body);
      --ds-text-font-size: var(--font-size-md);
      --ds-text-font-weight: var(--font-weight-regular);
      --ds-text-line-height: var(--font-line-height-normal);
    }

    /* A span-like host gets out of the way so the inline run joins its surrounding line. */
    :host([element='span']) {
      display: contents;
    }

    .text {
      margin: 0;
      padding: 0;
      font-family: var(--ds-text-font-family);
      font-size: var(--ds-text-font-size);
      font-weight: var(--ds-text-font-weight);
      line-height: var(--ds-text-line-height);
      /* color: color.foreground.{tone} is locked: no hook, the tone rules below read the token
         directly. The default tone is the bare --color-foreground, which an inverse surface
         re-scopes on its own container. */
      color: var(--color-foreground);
      text-align: start;
    }

    p.text {
      display: block;
    }
    span.text {
      display: inline;
    }

    /* fontSize: font.size.{size} */
    :host([size='xs']) {
      --ds-text-font-size: var(--font-size-xs);
    }
    :host([size='sm']) {
      --ds-text-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-text-font-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-text-font-size: var(--font-size-lg);
    }
    :host([size='xl']) {
      --ds-text-font-size: var(--font-size-xl);
    }

    /* fontWeight: font.weight.{weight} */
    :host([weight='regular']) {
      --ds-text-font-weight: var(--font-weight-regular);
    }
    :host([weight='medium']) {
      --ds-text-font-weight: var(--font-weight-medium);
    }
    :host([weight='semibold']) {
      --ds-text-font-weight: var(--font-weight-semibold);
    }
    :host([weight='bold']) {
      --ds-text-font-weight: var(--font-weight-bold);
    }

    /* color: color.foreground.{tone} ("default" is the bare color.foreground token) */
    :host([tone='default']) .text {
      color: var(--color-foreground);
    }
    :host([tone='strong']) .text {
      color: var(--color-foreground-strong);
    }
    :host([tone='muted']) .text {
      color: var(--color-foreground-muted);
    }
    :host([tone='danger']) .text {
      color: var(--color-foreground-danger);
    }
    :host([tone='onAction']) .text {
      color: var(--color-foreground-on-action);
    }

    :host([align='start']) .text {
      text-align: start;
    }
    :host([align='center']) .text {
      text-align: center;
    }
    :host([align='end']) .text {
      text-align: end;
    }

    /* truncate: one line with an ellipsis; the full text stays reachable as title */
    :host([truncate]) .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([truncate]) span.text {
      display: inline-block;
      max-inline-size: 100%;
      vertical-align: bottom;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  /**
   * Maps to the font size scale. `md` is body copy; `xs` is the smallest
   * readable size and is reserved for captions and metadata.
   */
  @property({ type: String, reflect: true }) accessor size: TextSize = 'md';

  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  @property({ type: String, reflect: true }) accessor weight: TextWeight = 'regular';

  /**
   * Semantic color. `onAction` is only for text placed on an action background.
   * There is no `inverse` tone: an inverse surface re-scopes `--color-foreground`
   * on its own container, which the `default` tone resolves through. The colour
   * is locked: not in `overrides` and it has no `--ds-text-color` hook.
   */
  @property({ type: String, reflect: true }) accessor tone: TextTone = 'default';

  /** Horizontal alignment. `start`/`end` follow writing direction. */
  @property({ type: String, reflect: true }) accessor align: TextAlign = 'start';

  /**
   * Clip to one line with an ellipsis. The full text is exposed via `title`,
   * taken from the host's flattened, whitespace-collapsed textContent and
   * omitted when that is empty. With `element="span"` the clipped box is
   * `inline-block` with `max-inline-size: 100%`, so the width comes from the
   * parent. Screen readers still read the whole string.
   */
  @property({ type: Boolean, reflect: true }) accessor truncate = false;

  /**
   * The HTML element to render — `p` for a block, `span` for inline. Labels and
   * legends are rendered by Input and Fieldset, which own the association.
   */
  @property({ type: String, reflect: true }) accessor element: TextElement = 'p';

  /** Per-instance style overrides: `{ fontSize: 'font.size.lg' }`. `color` is locked and ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;

  /** Plain-text content of the default slot, used for `title` when truncated. */
  @state() private accessor fullText = '';

  /** The consumer's `title` attribute on the host, forwarded to the `text` part unchanged. */
  @state() private accessor consumerTitle: string | undefined;

  /** Text edits inside existing nodes do not fire `slotchange`; this keeps `title` current. */
  private textObserver: MutationObserver | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Text');
    this.syncFullText();
    this.textObserver ??= new MutationObserver(() => this.syncFullText());
    // Observes only; the callback writes reactive state, never the observed DOM.
    this.textObserver.observe(this, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['title'],
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.textObserver?.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    const tag = isTextElement(this.element) ? TAGS[this.element] : TAGS.p;
    // A consumer `title` on the host always wins and is forwarded unchanged, with or without truncate.
    const title =
      this.consumerTitle ?? (this.truncate && this.fullText !== '' ? this.fullText : undefined);
    return html`<${tag} class="text" part="text" data-part="text" title=${ifDefined(title)}
      ><slot @slotchange=${this.syncFullText}></slot></${tag}
    >`;
  }

  /**
   * The host's flattened, whitespace-collapsed textContent (`title` is omitted when it is
   * empty), and the consumer's own `title` attribute on the host.
   */
  private syncFullText(): void {
    const next = (this.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (next !== this.fullText) this.fullText = next;
    const consumer = this.getAttribute('title') ?? undefined;
    if (consumer !== this.consumerTitle) this.consumerTitle = consumer;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TextOverridableBinding[]) {
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
    'ds-text': DsText;
  }
}
