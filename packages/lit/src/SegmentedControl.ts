import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import type { IconName } from './Icon.js';
import './Tooltip.js';

export type SegmentedControlSize = 'sm' | 'md';

/** Shape of each entry in `options`. */
export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
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
  | 'segmentSpacing'
  | 'selectedWeight'
  | 'paddingBlockSm'
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
  segmentSpacing: '--ds-segmented-control-segment-spacing',
  selectedWeight: '--ds-segmented-control-selected-weight',
  paddingBlockSm: '--ds-segmented-control-padding-block-sm',
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
 * shadow root, one per entry of `options`. The group is one roving-tabindex
 * stop: arrow keys move real focus *and* selection together (radio
 * semantics), wrapping and skipping disabled options; Home/End do the same
 * to the first/last enabled option. The pill (anatomy: indicator) is an
 * absolutely positioned element measured from the selected segment's box and
 * slid with `transition`, instant under reduced motion. `iconOnly` wraps each
 * segment in a `<ds-tooltip no-describes>` so the option's label is both the
 * accessible name and the visible hover/focus label.
 *
 * Selecting a segment fires a composed `change` CustomEvent with `{ value }`.
 * With `value` set the element is controlled: it reports the choice and shows
 * it only once `value` changes. Not form-associated: a segmented control has
 * nothing to submit, it only switches a mode.
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
 * @fires change - Fired when the user changes the selection, with `{ value }` in `detail`.
 */
@customElement('ds-segmented-control')
export class DsSegmentedControl extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
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
      --ds-segmented-control-segment-spacing: var(--space-0);
      --ds-segmented-control-selected-weight: var(--font-weight-semibold);
      --ds-segmented-control-padding-block-sm: var(--space-1);
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
    [data-part='group'] {
      position: relative;
      box-sizing: border-box;
      display: flex;
      inline-size: 100%;
      gap: var(--ds-segmented-control-segment-spacing);
      padding: var(--ds-segmented-control-group-padding);
      border-radius: var(--ds-segmented-control-group-radius);
      background: var(--color-background-strong);
    }

    /* segmentSelectedBackground: color.background, locked; segmentShadow — the raised pill under the selected segment */
    [data-part='indicator'] {
      position: absolute;
      left: 0;
      top: 0;
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

    /* The first placement jumps; only later selections slide. */
    [data-part='indicator']:not([data-placed]) {
      transition: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='indicator'] {
        transition: none;
      }
    }

    [data-part='segment'] {
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      gap: var(--ds-segmented-control-segment-gap);
      /* minTarget: size.target.min, locked */
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
      font-weight: var(--ds-segmented-control-font-weight);
      line-height: var(--ds-segmented-control-line-height);
      /* segmentColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    /* ds-tooltip is display: contents, so the button stays the flex item */
    :host([fill]) [data-part='segment'] {
      flex: 1 1 0%;
    }

    :host([size='sm']) [data-part='segment'] {
      padding-block: var(--ds-segmented-control-padding-block-sm);
    }

    /* segmentSelectedColor: color.foreground.strong, locked; selectedWeight marks the selection alongside the pill and checked state, not color alone */
    [data-part='segment'][aria-checked='true'] {
      color: var(--color-foreground-strong);
      font-weight: var(--ds-segmented-control-selected-weight);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='segment']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='segment']:disabled {
      opacity: var(--ds-segmented-control-disabled-opacity);
      cursor: not-allowed;
    }

    [data-part='segmentIcon'] {
      flex: none;
    }

    [data-part='segmentLabel'] {
      min-inline-size: 0;
    }
  `;

  /** Accessible name of the control ("View mode"). Not shown. */
  @property() accessor label: string = '';

  /** Two to five options in display order. A property, not an attribute. */
  @property({ attribute: false }) accessor options: SegmentedControlOption[] = [];

  /** Controlled selected value. Omit for uncontrolled. */
  @property({ type: String, reflect: true }) accessor value: string | undefined;

  /** Initially selected value. Defaults to the first enabled option. */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /** Show icons only; every option must have one. Labels become accessible names and Tooltips. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /** Toolbar (`sm`) or standard (`md`) height. */
  @property({ type: String, reflect: true }) accessor size: SegmentedControlSize = 'md';

  /** Stretch to the container width with equal segments. */
  @property({ type: Boolean, reflect: true }) accessor fill = false;

  /** Per-instance style overrides: `{ segmentRadius: 'radius.md' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides: Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled option). */
  @state() private accessor internalValue: string | undefined;

  /** The segment carrying the roving tabindex. */
  @state() private accessor focusedValue: string | undefined;

  @query('[data-part="group"]') private accessor groupEl!: HTMLElement | null;
  @query('[data-part="indicator"]') private accessor indicatorEl!: HTMLElement | null;

  private resizeObserver: ResizeObserver | undefined;
  private warned = false;

  /** The currently selected value, controlled or not. */
  get currentValue(): string | null {
    return this.value ?? this.internalValue ?? null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'SegmentedControl');
    if (this.hasUpdated && this.groupEl) {
      this.observeGroup(this.groupEl);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override firstUpdated(): void {
    if (this.groupEl) {
      this.observeGroup(this.groupEl);
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (this.internalValue === undefined && this.options.length > 0) {
      this.internalValue = this.defaultValue ?? this.firstEnabled()?.value;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.updateIndicator();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const selected = this.currentValue;
    const tabStop = this.tabStopValue();
    return html`
      <div data-part="group" part="group" role="radiogroup" aria-label=${this.label} @keydown=${this.handleKeydown}>
        <span data-part="indicator" part="indicator" aria-hidden="true"></span>
        ${this.options.map((option) => this.renderSegment(option, option.value === selected, option.value === tabStop))}
      </div>
    `;
  }

  private renderSegment(option: SegmentedControlOption, selected: boolean, tabStop: boolean): TemplateResult {
    const button = html`
      <button
        type="button"
        data-part="segment"
        part="segment"
        role="radio"
        data-value=${option.value}
        aria-checked=${selected ? 'true' : 'false'}
        aria-label=${ifDefined(this.iconOnly ? option.label : undefined)}
        tabindex=${tabStop ? 0 : -1}
        ?disabled=${option.disabled === true}
        @click=${() => this.handleSegmentClick(option)}
      >
        ${option.icon
          ? html`<ds-icon data-part="segmentIcon" part="segmentIcon" name=${option.icon}></ds-icon>`
          : nothing}
        ${this.iconOnly
          ? nothing
          : html`<span data-part="segmentLabel" part="segmentLabel">${option.label}</span>`}
      </button>
    `;
    return this.iconOnly
      ? html`<ds-tooltip data-part="tooltip" part="tooltip" content=${option.label} no-describes>${button}</ds-tooltip>`
      : button;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.moveSelection(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.moveSelection(-1);
        break;
      case 'Home': {
        event.preventDefault();
        const first = this.firstEnabled();
        if (first) this.focusAndSelect(first.value);
        break;
      }
      case 'End': {
        event.preventDefault();
        const items = this.enabledOptions();
        const last = items[items.length - 1];
        if (last) this.focusAndSelect(last.value);
        break;
      }
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

  private firstEnabled(): SegmentedControlOption | undefined {
    return this.options.find((option) => option.disabled !== true);
  }

  /** The focused segment if it is still enabled, else the selected one, else the first enabled. */
  private tabStopValue(): string | undefined {
    const items = this.enabledOptions();
    const candidates = [this.focusedValue, this.currentValue ?? undefined];
    for (const candidate of candidates) {
      if (candidate !== undefined && items.some((option) => option.value === candidate)) {
        return candidate;
      }
    }
    return items[0]?.value;
  }

  private moveSelection(delta: number): void {
    const items = this.enabledOptions();
    if (items.length === 0) {
      return;
    }
    const currentIndex = items.findIndex((option) => option.value === this.tabStopValue());
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    this.focusAndSelect(items[nextIndex]!.value);
  }

  private focusAndSelect(value: string): void {
    this.select(value);
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`[data-part="segment"][data-value="${CSS.escape(value)}"]`)?.focus();
    });
  }

  private select(next: string): void {
    this.focusedValue = next;
    if (next === this.currentValue) {
      return;
    }
    if (this.value === undefined) {
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

  private observeGroup(group: HTMLElement): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.updateIndicator());
    this.resizeObserver.observe(group);
  }

  private updateIndicator(): void {
    const indicator = this.indicatorEl;
    const group = this.groupEl;
    if (!indicator || !group) {
      return;
    }
    const selected = this.currentValue;
    const segment = selected
      ? this.renderRoot.querySelector<HTMLElement>(`[data-part="segment"][data-value="${CSS.escape(selected)}"]`)
      : null;
    if (!segment) {
      indicator.style.opacity = '0';
      return;
    }
    const groupBox = group.getBoundingClientRect();
    const segmentBox = segment.getBoundingClientRect();
    const x = segmentBox.left - groupBox.left - group.clientLeft;
    const y = segmentBox.top - groupBox.top - group.clientTop;
    indicator.style.opacity = '1';
    indicator.style.transform = `translate(${x}px, ${y}px)`;
    indicator.style.inlineSize = `${segmentBox.width}px`;
    indicator.style.blockSize = `${segmentBox.height}px`;
    if (!indicator.hasAttribute('data-placed')) {
      requestAnimationFrame(() => indicator.setAttribute('data-placed', ''));
    }
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
    if (!import.meta.env.DEV || this.warned) {
      return;
    }
    if (!this.label) {
      this.warned = true;
      console.warn("<ds-segmented-control> requires a `label`, the group's accessible name.", this);
    }
    if (this.options.length < 2 || this.options.length > 5) {
      this.warned = true;
      console.warn('<ds-segmented-control> expects two to five entries in `options`.', this);
    }
    if (this.iconOnly && this.options.some((option) => option.icon === undefined)) {
      this.warned = true;
      console.warn('<ds-segmented-control> `iconOnly` requires every option to have an `icon`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-segmented-control': DsSegmentedControl;
  }
}
