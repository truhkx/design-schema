import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import type { IconName } from './Icon.js';

export type SegmentedControlSize = 'sm' | 'md';

/** Shape of each entry in `options`. */
export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

/** Detail carried by the `change` CustomEvent. */
export interface SegmentedControlChangeDetail {
  value: string;
}

/** Overridable style hooks; see the `overrides` property. `groupBackground`, `segmentColor`, `segmentSelectedColor`, `segmentSelectedBackground`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type SegmentedControlOverridableBinding =
  | 'groupPadding'
  | 'groupRadius'
  | 'segmentShadow'
  | 'segmentRadius'
  | 'segmentPaddingInline'
  | 'segmentPaddingBlock'
  | 'segmentGap'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'transition'
  | 'disabledOpacity';

const HOOKS: Record<SegmentedControlOverridableBinding, string> = {
  groupPadding: '--ds-segmented-control-group-padding',
  groupRadius: '--ds-segmented-control-group-radius',
  segmentShadow: '--ds-segmented-control-segment-shadow',
  segmentRadius: '--ds-segmented-control-segment-radius',
  segmentPaddingInline: '--ds-segmented-control-segment-padding-inline',
  segmentPaddingBlock: '--ds-segmented-control-segment-padding-block',
  segmentGap: '--ds-segmented-control-segment-gap',
  fontFamily: '--ds-segmented-control-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-segmented-control-font-size',
  fontWeight: '--ds-segmented-control-font-weight',
  lineHeight: '--ds-segmented-control-line-height',
  transition: '--ds-segmented-control-transition',
  disabledOpacity: '--ds-segmented-control-disabled-opacity',
};

/**
 * `<ds-segmented-control>` — SegmentedControl (category: input, APG pattern: radio).
 *
 * `<ds-segmented-control label="View mode" .options=${[...]} value="grid">`
 * renders a `role="radiogroup"` of native `<button role="radio">` in its
 * shadow root, one per entry of `options`. The list is one roving-tabindex
 * stop: arrow keys move real focus *and* selection together (radio
 * semantics), wrapping and skipping disabled options; Home/End jump to the
 * first/last enabled option and select it too. The pill is an absolutely
 * positioned element measured from the selected segment's box and animated
 * with `transition`, removed under reduced motion. Selecting a segment fires
 * a composed `change` CustomEvent with `{ value }`. Not form-associated: a
 * segmented control has nothing to submit, it only switches a mode.
 *
 * ## When to use
 *
 * Use it for two to five short, parallel options that change what a region
 * shows or how a tool behaves, where the user switches often and sees the
 * effect immediately. Use `iconOnly` in toolbars where the icons are
 * unambiguous and pair it with a visible Text label when the group's purpose
 * is not obvious.
 *
 * ## When not to use
 *
 * Not for a value that is submitted later (RadioGroup), not for more than
 * five options or long labels (use Tabs or Select), and never with no
 * selection — a segmented control always has one.
 *
 * @fires change - Fired when the selection changes, with `{ value }` in `detail`.
 * @csspart group - The `role="radiogroup"` container (anatomy: group).
 * @csspart segment - Each `role="radio"` button (anatomy: segment).
 * @csspart segment-label - A segment's visible label (anatomy: segmentLabel).
 * @csspart segment-icon - A segment's `<ds-icon>` (anatomy: segmentIcon).
 * @csspart indicator - The pill tracking the selected segment (anatomy: indicator).
 */
@customElement('ds-segmented-control')
export class DsSegmentedControl extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: inline-flex;
      max-inline-size: 100%;
      --ds-segmented-control-group-padding: var(--space-1);
      --ds-segmented-control-group-radius: var(--radius-md);
      --ds-segmented-control-segment-shadow: var(--shadow-raised);
      --ds-segmented-control-segment-radius: var(--radius-sm);
      --ds-segmented-control-segment-padding-inline: var(--space-md);
      --ds-segmented-control-segment-padding-block: var(--space-1);
      --ds-segmented-control-segment-gap: var(--layout-gap-tight);
      --ds-segmented-control-font-family: var(--font-family-body);
      --ds-segmented-control-font-size: var(--font-size-md);
      --ds-segmented-control-font-weight: var(--font-weight-medium);
      --ds-segmented-control-line-height: var(--font-line-height-normal);
      --ds-segmented-control-transition: var(--motion-duration-fast);
      --ds-segmented-control-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    :host([fill]) {
      display: flex;
      inline-size: 100%;
    }

    /* fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-segmented-control-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-segmented-control-font-size: var(--font-size-md);
    }

    /* groupBackground: color.background.strong, locked */
    .group {
      position: relative;
      box-sizing: border-box;
      display: flex;
      inline-size: 100%;
      padding: var(--ds-segmented-control-group-padding);
      border-radius: var(--ds-segmented-control-group-radius);
      background: var(--color-background-strong);
    }

    /* indicator: color.background, locked — the raised pill under the selected segment */
    .indicator {
      position: absolute;
      inset-inline-start: 0;
      inset-block-start: 0;
      z-index: 0;
      box-sizing: border-box;
      background: var(--color-background);
      border-radius: var(--ds-segmented-control-segment-radius);
      box-shadow: var(--ds-segmented-control-segment-shadow);
      opacity: 0;
      pointer-events: none;
      transition:
        transform var(--ds-segmented-control-transition) var(--motion-easing-standard),
        inline-size var(--ds-segmented-control-transition) var(--motion-easing-standard),
        block-size var(--ds-segmented-control-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .indicator {
        transition: none;
      }
    }

    .segment {
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      gap: var(--ds-segmented-control-segment-gap);
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-inline: var(--ds-segmented-control-segment-padding-inline);
      padding-block: var(--ds-segmented-control-segment-padding-block);
      border: 0;
      border-radius: var(--ds-segmented-control-segment-radius);
      background: transparent;
      font-family: var(--ds-segmented-control-font-family);
      font-size: var(--ds-segmented-control-font-size);
      font-weight: var(--font-weight-regular);
      line-height: var(--ds-segmented-control-line-height);
      /* segmentColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: color var(--ds-segmented-control-transition) var(--motion-easing-standard);
    }

    :host([fill]) .segment {
      flex: 1 1 0%;
    }

    /* segmentSelectedColor: color.foreground.strong, locked; fontWeight: font.weight.medium marks the selection alongside the pill and checked state, not color alone */
    .segment[aria-checked='true'] {
      color: var(--color-foreground-strong);
      font-weight: var(--ds-segmented-control-font-weight);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .segment:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .segment:disabled {
      opacity: var(--ds-segmented-control-disabled-opacity);
      cursor: not-allowed;
    }

    .segment-icon {
      flex: none;
    }

    .segment-label {
      min-inline-size: 0;
    }
  `;

  /** Accessible name of the control ("View mode"). Not shown. */
  @property() label!: string;

  /** Two to five options in display order. A property, not an attribute. */
  @property({ attribute: false }) options: SegmentedControlOption[] = [];

  /** Controlled selected value. Omit for uncontrolled. */
  @property({ reflect: true }) value?: string;

  /** Initially selected value. Defaults to the first enabled option. */
  @property({ attribute: 'default-value' }) defaultValue?: string;

  /** Show icons only; every option must have one. Labels become accessible names. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) iconOnly = false;

  /** Toolbar (`sm`) or standard (`md`) height. */
  @property({ reflect: true }) size: SegmentedControlSize = 'md';

  /** Stretch to the container width with equal segments. */
  @property({ type: Boolean, reflect: true }) fill = false;

  /** Per-instance style overrides: `{ segmentRadius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<SegmentedControlOverridableBinding, TokenRef>>;

  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled option) on first update. */
  @state() private internalValue?: string;

  /** The segment currently carrying the roving tabindex and (usually) real focus. */
  @state() private focusedValue: string | null = null;

  @query('.group') private readonly groupEl?: HTMLElement;
  @query('.indicator') private readonly indicatorEl?: HTMLElement;

  private resizeObserver?: ResizeObserver;

  /** The currently selected value, controlled or not. */
  get currentValue(): string | null {
    return this.value ?? this.internalValue ?? null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'SegmentedControl');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    if (this.groupEl) {
      this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
      this.resizeObserver.observe(this.groupEl);
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalValue = this.defaultValue ?? this.options.find((option) => option.disabled !== true)?.value;
      this.focusedValue = this.currentValue;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.updateIndicator();
    this.warnInDev();
  }

  protected override render() {
    const selected = this.currentValue;
    return html`
      <div class="group" part="group" role="radiogroup" aria-label=${this.label} @keydown=${this.handleKeydown}>
        <span class="indicator" part="indicator" aria-hidden="true"></span>
        ${this.options.map((option) => this.renderSegment(option, option.value === selected))}
      </div>
    `;
  }

  private renderSegment(option: SegmentedControlOption, selected: boolean) {
    const disabled = option.disabled === true;
    const focused = (this.focusedValue ?? this.currentValue) === option.value;
    return html`
      <button
        type="button"
        class="segment"
        part="segment"
        role="radio"
        data-value=${option.value}
        aria-checked=${selected ? 'true' : 'false'}
        aria-label=${ifDefined(this.iconOnly ? option.label : undefined)}
        tabindex=${focused ? 0 : -1}
        ?disabled=${disabled}
        @click=${() => this.handleSegmentClick(option)}
      >
        ${option.icon
          ? html`<ds-icon class="segment-icon" part="segment-icon" name=${option.icon}></ds-icon>`
          : nothing}
        ${!this.iconOnly ? html`<span class="segment-label" part="segment-label">${option.label}</span>` : nothing}
      </button>
    `;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveSelection(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveSelection(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.selectEdge('first');
    } else if (event.key === 'End') {
      event.preventDefault();
      this.selectEdge('last');
    }
  };

  private handleSegmentClick(option: SegmentedControlOption): void {
    if (option.disabled === true) {
      return;
    }
    this.select(option.value);
  }

  private enabledOptions(): SegmentedControlOption[] {
    return this.options.filter((option) => option.disabled !== true);
  }

  private moveSelection(delta: number): void {
    const items = this.enabledOptions();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((option) => option.value === (this.focusedValue ?? this.currentValue));
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) {
      nextIndex = items.length - 1;
    } else if (nextIndex >= items.length) {
      nextIndex = 0;
    }
    this.focusAndSelect(items[nextIndex].value);
  }

  private selectEdge(edge: 'first' | 'last'): void {
    const items = this.enabledOptions();
    if (items.length === 0) {
      return;
    }
    this.focusAndSelect(edge === 'first' ? items[0].value : items[items.length - 1].value);
  }

  private focusAndSelect(value: string): void {
    this.select(value);
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`)?.focus();
    });
  }

  private select(next: string): void {
    this.focusedValue = next;
    if (next === this.currentValue) {
      return;
    }
    if (this.value !== undefined) {
      this.value = next;
    } else {
      this.internalValue = next;
    }
    this.dispatchEvent(
      new CustomEvent<SegmentedControlChangeDetail>('change', {
        detail: { value: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private updateIndicator(): void {
    const indicator = this.indicatorEl;
    if (!indicator) {
      return;
    }
    const selected = this.currentValue;
    const segmentEl = selected
      ? this.renderRoot.querySelector<HTMLElement>(`[data-value="${CSS.escape(selected)}"]`)
      : null;
    if (!segmentEl) {
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.opacity = '1';
    indicator.style.transform = `translate(${segmentEl.offsetLeft}px, ${segmentEl.offsetTop}px)`;
    indicator.style.inlineSize = `${segmentEl.offsetWidth}px`;
    indicator.style.blockSize = `${segmentEl.offsetHeight}px`;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SegmentedControlOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.label) {
      console.warn("<ds-segmented-control> requires a `label`, the group's accessible name.", this);
    }
    if (!this.options || this.options.length < 2 || this.options.length > 5) {
      console.warn('<ds-segmented-control> expects two to five entries in `options`.', this);
    }
    if (this.iconOnly && this.options?.some((option) => option.icon === undefined)) {
      console.warn('<ds-segmented-control> `iconOnly` requires every option to have an `icon`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-segmented-control': DsSegmentedControl;
  }
}
