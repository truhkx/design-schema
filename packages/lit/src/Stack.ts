import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol';

function isRenderable(node: Node): node is Element | Text {
  return node instanceof Element || (node instanceof Text && node.data.trim() !== '');
}

/**
 * `<ds-stack>` — Stack (category: layout, role: none).
 *
 * `<ds-stack direction="horizontal" gap="2">`. The host itself is the flex
 * container (`:host { display: flex }`); children are slotted light-DOM nodes,
 * so their semantics are untouched. `element="ul"`/`"ol"` renders the slot
 * inside a `<ul role="list">` and wraps each child in an `<li>` using manual
 * slot assignment (`slotAssignment: 'manual'`), so the light DOM is never
 * modified. `nav` and `section` render the matching wrapper.
 *
 * ## When to use
 *
 * Use Stack for any group of siblings that should be evenly spaced: form
 * fields, a row of buttons, a list of cards, label-plus-control pairs. Reach
 * for it before writing any layout CSS. Choose `element` when the group has
 * meaning — `nav` for navigation, `ul` for a list of like items — so the
 * structure is exposed to assistive technology.
 *
 * @slot - Any components. Stack does not style its children; it only positions them.
 * @csspart container - The semantic wrapper when `element` is not `div`.
 */
@customElement('ds-stack')
export class DsStack extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: 'manual',
  };

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      justify-content: flex-start;
      gap: var(--space-4);
    }

    :host([hidden]) {
      display: none;
    }

    :host([direction='vertical']) {
      flex-direction: column;
    }
    :host([direction='horizontal']) {
      flex-direction: row;
    }

    /* gap: space.{gap} */
    :host([gap='0']) {
      gap: var(--space-0);
    }
    :host([gap='1']) {
      gap: var(--space-1);
    }
    :host([gap='2']) {
      gap: var(--space-2);
    }
    :host([gap='3']) {
      gap: var(--space-3);
    }
    :host([gap='4']) {
      gap: var(--space-4);
    }
    :host([gap='5']) {
      gap: var(--space-5);
    }
    :host([gap='6']) {
      gap: var(--space-6);
    }
    :host([gap='8']) {
      gap: var(--space-8);
    }
    :host([gap='10']) {
      gap: var(--space-10);
    }
    :host([gap='12']) {
      gap: var(--space-12);
    }

    :host([align='start']) {
      align-items: flex-start;
    }
    :host([align='center']) {
      align-items: center;
    }
    :host([align='end']) {
      align-items: flex-end;
    }
    :host([align='stretch']) {
      align-items: stretch;
    }

    :host([justify='start']) {
      justify-content: flex-start;
    }
    :host([justify='center']) {
      justify-content: center;
    }
    :host([justify='end']) {
      justify-content: flex-end;
    }
    :host([justify='between']) {
      justify-content: space-between;
    }

    :host([wrap]) {
      flex-wrap: wrap;
    }

    /* Semantic wrappers contribute no box; the host stays the flex container. */
    section,
    nav,
    ul,
    ol,
    li {
      display: contents;
    }
  `;

  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  @property({ reflect: true }) direction: StackDirection = 'vertical';

  /** Space between children from the spacing scale. The only way to set spacing. */
  @property({ reflect: true }) gap: StackGap = '4';

  /** Cross-axis alignment. */
  @property({ reflect: true }) align: StackAlign = 'stretch';

  /** Main-axis distribution. */
  @property({ reflect: true }) justify: StackJustify = 'start';

  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  @property({ type: Boolean, reflect: true }) wrap = false;

  /** Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`. */
  @property() element: StackElement = 'div';

  private readonly observer = new MutationObserver(() => this.requestUpdate());

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer.observe(this, { childList: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  private get items(): (Element | Text)[] {
    return Array.from(this.childNodes).filter(isRenderable);
  }

  protected override render() {
    switch (this.element) {
      case 'ul':
        return html`<ul part="container" role="list">
          ${this.items.map(() => html`<li role="listitem"><slot></slot></li>`)}
        </ul>`;
      case 'ol':
        return html`<ol part="container" role="list">
          ${this.items.map(() => html`<li role="listitem"><slot></slot></li>`)}
        </ol>`;
      case 'nav':
        return html`<nav part="container" role="navigation"><slot></slot></nav>`;
      case 'section':
        return html`<section part="container"><slot></slot></section>`;
      default:
        return html`<slot></slot>`;
    }
  }

  protected override updated(): void {
    this.assignSlots();
  }

  /** Assign light-DOM children to the shadow slots (manual slot assignment). */
  private assignSlots(): void {
    const slots = Array.from(this.renderRoot.querySelectorAll('slot'));
    const items = this.items;
    if (slots.length === 0) {
      return;
    }
    if (this.element === 'ul' || this.element === 'ol') {
      slots.forEach((slot, index) => {
        const item = items[index];
        if (item === undefined) {
          slot.assign();
        } else {
          slot.assign(item);
        }
      });
      return;
    }
    const [first] = slots;
    if (first !== undefined) {
      first.assign(...items);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-stack': DsStack;
  }
}
