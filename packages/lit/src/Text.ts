import { LitElement, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';
export type TextElement = 'p' | 'span' | 'label' | 'legend';

const TAGS: Record<TextElement, StaticValue> = {
  p: literal`p`,
  span: literal`span`,
  label: literal`label`,
  legend: literal`legend`,
};

function isTextElement(value: unknown): value is TextElement {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TAGS, value);
}

/**
 * `<ds-text>` — Text (category: typography).
 *
 * `<ds-text size="sm" tone="muted">` renders the chosen `element` inside a
 * shadow root with `part="text"`. The host is `display: contents`, so the
 * rendered element (block for `p`/`legend`, inline for `span`/`label`) takes
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
 * @slot - The text content. Inline formatting (emphasis, links) is allowed; block elements are not.
 * @csspart text - The rendered element.
 */
@customElement('ds-text')
export class DsText extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }

    :host([hidden]) {
      display: none;
    }

    .text {
      margin: 0;
      padding: 0;
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-regular);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
      text-align: start;
    }

    p.text,
    legend.text {
      display: block;
    }
    span.text,
    label.text {
      display: inline;
    }

    /* fontSize: font.size.{size} */
    :host([size='xs']) .text {
      font-size: var(--font-size-xs);
    }
    :host([size='sm']) .text {
      font-size: var(--font-size-sm);
    }
    :host([size='md']) .text {
      font-size: var(--font-size-md);
    }
    :host([size='lg']) .text {
      font-size: var(--font-size-lg);
    }
    :host([size='xl']) .text {
      font-size: var(--font-size-xl);
    }

    /* fontWeight: font.weight.{weight} */
    :host([weight='regular']) .text {
      font-weight: var(--font-weight-regular);
    }
    :host([weight='medium']) .text {
      font-weight: var(--font-weight-medium);
    }
    :host([weight='semibold']) .text {
      font-weight: var(--font-weight-semibold);
    }
    :host([weight='bold']) .text {
      font-weight: var(--font-weight-bold);
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

    /* truncate: one line with an ellipsis; the full text is exposed via title */
    :host([truncate]) .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([truncate]) span.text,
    :host([truncate]) label.text {
      display: inline-block;
      max-inline-size: 100%;
      vertical-align: bottom;
    }
  `;

  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size. */
  @property({ reflect: true }) size: TextSize = 'md';

  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  @property({ reflect: true }) weight: TextWeight = 'regular';

  /** Semantic color. `onAction` is only for text placed on an action background. */
  @property({ reflect: true }) tone: TextTone = 'default';

  /** Horizontal alignment. `start`/`end` follow writing direction. */
  @property({ reflect: true }) align: TextAlign = 'start';

  /** Clip to one line with an ellipsis. The full text remains available as `title`. */
  @property({ type: Boolean, reflect: true }) truncate = false;

  /** The HTML element to render. Choose by meaning, not by layout. */
  @property() element: TextElement = 'p';

  /** Plain-text content of the default slot, used for `title` when truncated. */
  @state() private fullText = '';

  protected override render() {
    const tag = isTextElement(this.element) ? TAGS[this.element] : TAGS.p;
    const title = this.truncate && this.fullText !== '' ? this.fullText : undefined;
    return html`<${tag} class="text" part="text" title=${ifDefined(title)}
      ><slot @slotchange=${this.handleSlotChange}></slot></${tag}
    >`;
  }

  private handleSlotChange(): void {
    this.fullText = (this.textContent ?? '').replace(/\s+/g, ' ').trim();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-text': DsText;
  }
}
