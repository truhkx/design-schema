import { LitElement, css, html, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'tight' | 'normal' | 'loose' | 'section';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol';

/** Overridable style hooks; see the `overrides` property. */
export type StackOverridableBinding = 'gap';

const HOOKS: Record<StackOverridableBinding, string> = {
  gap: '--ds-stack-gap',
};

/** Comments and whitespace-only text are not children the list wraps in an `<li>`. */
function isRenderable(node: Node): node is Element | Text {
  return node instanceof Element || (node instanceof Text && node.data.trim() !== '');
}

/**
 * `<ds-stack>` — Stack (category: layout, role: none).
 *
 * `<ds-stack direction="horizontal" gap="tight">`. The host itself is the
 * flex container (`:host { display: flex }`); children are slotted light-DOM
 * nodes, so their semantics are untouched. `element="ul"`/`"ol"` renders the
 * slot inside a `<ul role="list">` and wraps each child in an `<li>` using
 * manual slot assignment (`slotAssignment: 'manual'`), so the light DOM is
 * never modified. `nav` and `section` render the matching wrapper.
 *
 * ## When to use
 *
 * Use Stack for any group of siblings that should be evenly spaced: form
 * fields, a row of buttons, a list of cards, label-plus-control pairs. Reach
 * for it before writing any layout CSS. Choose `element` when the group has
 * meaning — `nav` for navigation, `ul` for a list of like items — so the
 * structure is exposed to assistive technology.
 *
 * ## When not to use
 *
 * Not for two-dimensional layouts (use Grid, planned) and not for positioning
 * a single element (use spacing tokens on the parent). Never set spacing
 * between children with margins on the children.
 *
 * @slot - Any components. Stack does not style its children; it only positions them.
 * @csspart container - The semantic wrapper when `element` is not `div`; for `div` the host is the container.
 */
@customElement('ds-stack')
export class DsStack extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    slotAssignment: 'manual',
  };

  static override styles: CSSResult = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      justify-content: flex-start;
      --ds-stack-gap: var(--layout-gap-normal);
      gap: var(--ds-stack-gap);
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

    /* gap: layout.gap.{gap} */
    :host([gap='none']) {
      --ds-stack-gap: var(--layout-gap-none);
    }
    :host([gap='tight']) {
      --ds-stack-gap: var(--layout-gap-tight);
    }
    :host([gap='normal']) {
      --ds-stack-gap: var(--layout-gap-normal);
    }
    :host([gap='loose']) {
      --ds-stack-gap: var(--layout-gap-loose);
    }
    :host([gap='section']) {
      --ds-stack-gap: var(--layout-gap-section);
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

    /* Semantic wrappers contribute no box, so the host stays the flex container
       and the slotted children stay its flex items. Dropping the boxes also
       drops the UA list margin, padding and marker. */
    section,
    nav,
    ul,
    ol,
    li {
      display: contents;
    }
  `;

  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  @property({ reflect: true }) accessor direction: StackDirection = 'vertical';

  /** Space between children, from the layout rhythm. The only way to set spacing between siblings. */
  @property({ reflect: true }) accessor gap: StackGap = 'normal';

  /** Cross-axis alignment. */
  @property({ reflect: true }) accessor align: StackAlign = 'stretch';

  /** Main-axis distribution. */
  @property({ reflect: true }) accessor justify: StackJustify = 'start';

  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  @property({ type: Boolean, reflect: true }) accessor wrap = false;

  /** Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`. */
  @property() accessor element: StackElement = 'div';

  /** Per-instance style overrides: `{ gap: 'layout.gap.loose' }`. */
  @property({ attribute: false })
  accessor overrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;

  /**
   * The `<li>` wrappers are one per light-DOM child, so a child added or
   * removed after the first render has to re-render. `childList` only: a
   * callback that watched attributes would see its own `data-ds` write.
   */
  private readonly observer = new MutationObserver(() => this.requestUpdate());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Stack');
    this.observer.observe(this, { childList: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides') || changed.has('gap')) {
      this.applyOverrides();
    }
  }

  private get items(): (Element | Text)[] {
    return Array.from(this.childNodes).filter(isRenderable);
  }

  protected override render(): TemplateResult {
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

  /**
   * Assign light-DOM children to the shadow slots. Manual assignment keeps the
   * children where the consumer put them: nothing is reparented, so there is no
   * `slotchange` loop to guard against. Re-assigning the same nodes is a no-op.
   */
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

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as StackOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      /* gap: none has no gap in effect, so overrides.gap is a no-op — presence rule. */
      if (ref === undefined || (binding === 'gap' && this.gap === 'none')) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-stack': DsStack;
  }
}
