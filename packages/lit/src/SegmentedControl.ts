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

/** The selected segment's box inside the group, in physical pixels, as the pill is drawn. */
interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

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
 * it only once `value` changes — an arrow still moves focus and fires
 * `change`, while the checked state, the pill and the tab stop stay where
 * `value` says. Not form-associated: a segmented control has nothing to
 * submit, it only switches a mode.
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

    /* groupBackground: color.background.strong, locked. segmentSpacing is the group's gap, never a segment margin. */
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

    [data-part='segment'] {
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      display: inline-flex;
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
      white-space: nowrap;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    /* ds-tooltip is display: contents, so the button stays the group's flex item */
    :host([fill]) [data-part='segment'] {
      flex: 1 1 0;
    }

    /* paddingBlockSm: vertical padding at size sm; md keeps segmentPaddingBlock. */
    :host([size='sm']) [data-part='segment'] {
      padding-block: var(--ds-segmented-control-padding-block-sm);
    }

    /* segmentSelectedColor: color.foreground.strong, locked. Selection is the text pair plus the
       checked state plus the pill — never color alone (1.4.1). */
    [data-part='segment'][aria-checked='true'] {
      color: var(--color-foreground-strong);
      font-weight: var(--ds-segmented-control-selected-weight);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked. Never removed. */
    [data-part='segment']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='segment'][aria-disabled='true'] {
      opacity: var(--ds-segmented-control-disabled-opacity);
      cursor: default;
    }

    [data-part='segmentIcon'] {
      flex: none;
      line-height: 0;
    }

    [data-part='segmentLabel'] {
      min-inline-size: 0;
    }

    /* The raised pill under the selected segment: segmentSelectedBackground (color.background,
       locked) plus segmentShadow. Placed in JS from the selected segment's measured offset, and
       unmounted entirely when nothing is selected — see updateIndicator(). */
    [data-part='indicator'] {
      position: absolute;
      z-index: 0;
      box-sizing: border-box;
      background: var(--color-background);
      border-radius: var(--ds-segmented-control-segment-radius);
      box-shadow: var(--ds-segmented-control-segment-shadow);
      pointer-events: none;
      transition-property: left, top, width, height;
      transition-duration: var(--ds-segmented-control-transition);
      transition-timing-function: var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='indicator'] {
        transition: none;
      }
    }
  `;

  /** Accessible name of the control ("View mode"). Not shown; put a visible Text label beside it when the meaning is not obvious from context. */
  @property() accessor label: string = '';

  /**
   * Two to five options (guidance, not enforced: any count renders, with no warning) in display
   * order. Labels are one word; with `iconOnly` the label becomes the accessible name. The icon is
   * an Icon whose `size` is the control's `size`. A property, not an attribute.
   */
  @property({ attribute: false }) accessor options: SegmentedControlOption[] = [];

  /** Controlled selected value. Omit for uncontrolled. */
  @property({ type: String, reflect: true }) accessor value: string | undefined;

  /**
   * Initially selected value. Defaults to the first enabled option — a segmented control always has
   * a selection. A `value` or `defaultValue` is taken as given, never corrected: one naming a
   * disabled option keeps that segment checked with the pill under it (arrows still skip it); one
   * matching no option checks nothing and draws no pill. In both cases the tab stop is the first
   * enabled segment. Reads the `default-value` attribute; not reflected.
   */
  @property({ attribute: 'default-value' }) accessor defaultValue: string | undefined;

  /**
   * Show icons only (every option must have one); labels become accessible names and Tooltips. An
   * option without `icon` warns in development once per instance and shows its label as text
   * instead, so it never renders empty; that segment gets no Tooltip and no `aria-label`.
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' }) accessor iconOnly = false;

  /** Toolbar (`sm`) or standard (`md`) height. */
  @property({ type: String, reflect: true }) accessor size: SegmentedControlSize = 'md';

  /** Stretch to the container width with equal segments. */
  @property({ type: Boolean, reflect: true }) accessor fill = false;

  /** Per-instance style overrides: `{ segmentRadius: 'radius.md' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<SegmentedControlOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Uncontrolled selection, seeded from `defaultValue` (or the first enabled option). */
  @state() private accessor internalValue: string | undefined;

  @query('[data-part="group"]') private accessor groupEl!: HTMLElement | null;
  @query('[data-part="indicator"]') private accessor indicatorEl!: HTMLElement | null;

  private resizeObserver: ResizeObserver | undefined;
  private placedRect: IndicatorRect | undefined;
  private warnedLabel = false;
  private warnedIcon = false;

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
    // A selection matching no option draws no pill: the element is unmounted rather than hidden,
    // so the next selection mounts it in place instead of sliding it in from nowhere.
    const hasPill = selected !== null && this.options.some((option) => option.value === selected);
    return html`
      <div data-part="group" part="group" role="radiogroup" aria-label=${this.label} @keydown=${this.handleKeydown}>
        ${this.options.map((option) =>
          this.renderSegment(option, option.value === selected, option.value === tabStop),
        )}
        ${hasPill ? html`<span data-part="indicator" part="indicator" aria-hidden="true"></span>` : nothing}
      </div>
    `;
  }

  private renderSegment(option: SegmentedControlOption, selected: boolean, tabStop: boolean): TemplateResult {
    // An `iconOnly` option without an icon shows its label as text, so the segment never renders
    // empty — and then carries no Tooltip and no aria-label, since its visible text is its name.
    const iconOnly = this.iconOnly && option.icon !== undefined;
    const button = html`
      <button
        type="button"
        data-part="segment"
        part="segment"
        role="radio"
        data-value=${option.value}
        aria-checked=${selected ? 'true' : 'false'}
        aria-disabled=${ifDefined(option.disabled === true ? 'true' : undefined)}
        aria-label=${ifDefined(iconOnly ? option.label : undefined)}
        tabindex=${tabStop ? 0 : -1}
        @click=${() => this.handleSegmentClick(option)}
      >
        ${option.icon
          ? html`<ds-icon data-part="segmentIcon" part="segmentIcon" name=${option.icon} size=${this.size}></ds-icon>`
          : nothing}
        ${iconOnly ? nothing : html`<span data-part="segmentLabel" part="segmentLabel">${option.label}</span>`}
      </button>
    `;
    return iconOnly
      ? html`<ds-tooltip data-part="tooltip" part="tooltip" content=${option.label} no-describes>${button}</ds-tooltip>`
      : button;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const enabled = this.enabledOptions();
    if (enabled.length === 0) {
      return;
    }

    // In right-to-left writing ArrowLeft is "next" and ArrowRight "previous"; the vertical arrows
    // are unchanged. The direction is the host's computed one, read at keydown.
    const rtl = getComputedStyle(this).direction === 'rtl';
    let step: 1 | -1 | 'first' | 'last';
    switch (event.key) {
      case 'ArrowDown':
        step = 1;
        break;
      case 'ArrowUp':
        step = -1;
        break;
      case 'ArrowRight':
        step = rtl ? -1 : 1;
        break;
      case 'ArrowLeft':
        step = rtl ? 1 : -1;
        break;
      case 'Home':
        step = 'first';
        break;
      case 'End':
        step = 'last';
        break;
      default:
        return;
    }

    // Movement starts at the focused segment, and at the tab stop only when no segment has focus.
    const origin = enabled.findIndex((option) => option.value === (this.focusedValue() ?? this.tabStopValue()));
    // Inside a toolbar the arrows do not wrap, and Home/End belong to the toolbar: leaving the key
    // unhandled lets the toolbar move focus to the neighbouring control.
    const inToolbar = this.insideToolbar();

    let position: number;
    if (step === 'first' || step === 'last') {
      if (inToolbar) return;
      position = step === 'first' ? 0 : enabled.length - 1;
    } else if (origin < 0) {
      // Focus is on no enabled segment: an outward arrow moves inside the control instead.
      position = step === 1 ? 0 : enabled.length - 1;
    } else {
      position = origin + step;
      if (position < 0 || position >= enabled.length) {
        if (inToolbar) return;
        position = (position + enabled.length) % enabled.length;
      }
    }

    const target = enabled[position];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    this.segmentElement(target.value)?.focus();
    this.select(target.value);
  };

  /** Whether a `role="toolbar"` ancestor contains this element, walking host ancestors across shadow roots. */
  private insideToolbar(): boolean {
    let node: Element | null = this.parentElement ?? this.hostOf(this);
    while (node) {
      if (node.getAttribute('role') === 'toolbar') return true;
      node = node.parentElement ?? this.hostOf(node);
    }
    return false;
  }

  private hostOf(node: Element): Element | null {
    const root = node.getRootNode();
    return root instanceof ShadowRoot ? root.host : null;
  }

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

  private segmentElement(value: string): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`[data-part="segment"][data-value="${CSS.escape(value)}"]`);
  }

  /** The value of the segment that holds focus right now, or undefined when none does. */
  private focusedValue(): string | undefined {
    const active = this.shadowRoot?.activeElement;
    const segment = active?.closest<HTMLElement>('[data-part="segment"]');
    return segment?.dataset['value'];
  }

  /** One tab stop: the selected segment when it is enabled, otherwise the first enabled one. */
  private tabStopValue(): string | undefined {
    const selected = this.currentValue;
    const option = this.options.find((candidate) => candidate.value === selected);
    return option !== undefined && option.disabled !== true ? option.value : this.firstEnabled()?.value;
  }

  private select(next: string): void {
    // `change` fires only when the target differs from the current value, so moving back onto the
    // checked segment fires nothing.
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

  /**
   * Place the pill over the selected segment. Writes only when the measured box moved, so the
   * ResizeObserver that feeds it cannot drive itself.
   */
  private updateIndicator(): void {
    const indicator = this.indicatorEl;
    const selected = this.currentValue;
    const segment = selected !== null ? this.segmentElement(selected) : null;
    if (!indicator || !segment) {
      this.placedRect = undefined;
      return;
    }
    // offsetLeft/offsetTop are physical and measured against the group, which is the only
    // positioned ancestor, so the pill is placed with physical insets in either direction.
    const next: IndicatorRect = {
      left: segment.offsetLeft,
      top: segment.offsetTop,
      width: segment.offsetWidth,
      height: segment.offsetHeight,
    };
    const prev = this.placedRect;
    if (
      prev !== undefined &&
      prev.left === next.left &&
      prev.top === next.top &&
      prev.width === next.width &&
      prev.height === next.height
    ) {
      return;
    }
    this.placedRect = next;
    indicator.style.left = `${next.left}px`;
    indicator.style.top = `${next.top}px`;
    indicator.style.width = `${next.width}px`;
    indicator.style.height = `${next.height}px`;
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
    if (!this.label && !this.warnedLabel) {
      this.warnedLabel = true;
      console.warn("<ds-segmented-control> requires a `label`, the group's accessible name.", this);
    }
    // The two-to-five option count is guidance only: any count renders, with no warning.
    if (this.iconOnly && !this.warnedIcon) {
      const missing = this.options.filter((option) => option.icon === undefined);
      if (missing.length > 0) {
        this.warnedIcon = true;
        console.warn(
          `<ds-segmented-control>: \`icon-only\` needs an \`icon\` on every option; ${missing
            .map((option) => `"${option.value}"`)
            .join(', ')} show their label as text instead.`,
          this,
        );
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-segmented-control': DsSegmentedControl;
  }
}
