import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';

export type CarouselPicker = 'dots' | 'tabs' | 'none';
export type CarouselChangeReason = 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay';

/** Distinguishes one `<ds-carousel>`'s auto-generated slide ids from another's on the same page. */
let instanceCount = 0;

/** Detail carried by the `change` CustomEvent. */
export interface CarouselChangeDetail {
  index: number;
  reason: CarouselChangeReason;
}

/** copy.previous */
const COPY_PREVIOUS = 'Previous slide';
/** copy.next */
const COPY_NEXT = 'Next slide';
/** copy.play */
const COPY_PLAY = 'Start automatic rotation';
/** copy.pause */
const COPY_PAUSE = 'Stop automatic rotation';
/** copy.slideLabel */
const COPY_SLIDE_LABEL = (n: number, total: number): string => `${n} of ${total}`;
/** copy.goTo */
const COPY_GO_TO = (n: number): string => `Go to slide ${n}`;
/** copy.announce */
const COPY_ANNOUNCE = (n: number, total: number): string => `Slide ${n} of ${total}`;

/** Negates a boolean attribute: `no-snap` present means `snap` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. `controlBackground`, `dot`, `dotActive`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'dotTarget'
  | 'radius'
  | 'transition';

const HOOKS: Record<CarouselOverridableBinding, string> = {
  slideGap: '--ds-carousel-slide-gap',
  controlOffset: '--ds-carousel-control-offset',
  controlShadow: '--ds-carousel-control-shadow',
  pickerGap: '--ds-carousel-picker-gap',
  pickerOffset: '--ds-carousel-picker-offset',
  dotSize: '--ds-carousel-dot-size',
  dotTarget: '--ds-carousel-dot-target',
  radius: '--ds-carousel-radius',
  transition: '--ds-carousel-transition',
};

/**
 * `<ds-carousel-slide>` — the light-DOM wrapper for one Carousel slide (anatomy: slide).
 *
 * `<ds-carousel>` sets its `role`, `aria-roledescription`, `aria-label` and
 * `inert` from outside; consumers only set an optional `heading` (used in the
 * positional name and, with `picker="tabs"`, as the tab's label) and put
 * content inside. Slides should be equal height and parallel in shape.
 */
@customElement('ds-carousel-slide')
export class DsCarouselSlide extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      box-sizing: border-box;
      min-inline-size: 0;
    }

    :host([hidden]) {
      display: none;
    }
  `;

  /** The slide's own name, used in its positional label and as the tabs-picker label. */
  @property() accessor heading: string | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'CarouselSlide');
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }
}

/**
 * `<ds-carousel>` — Carousel (category: container, APG pattern: carousel).
 *
 * `<ds-carousel label="Featured products">` holds slotted light-DOM
 * `<ds-carousel-slide>` children in a scroll-snap viewport; swiping and
 * horizontal trackpad scrolling work natively, and an `IntersectionObserver`
 * on the slotted slides keeps the current index in sync with what is
 * visible, marking the rest `inert` so their content is not a tab stop.
 * Previous/Next move one page of `perView` slides (wrapping only when
 * `loop`); the picker (`dots` or `tabs`) jumps directly and, like a
 * roving-tabindex list, answers arrow keys, Home and End. `autoplay`
 * advances every `interval` on a timer that pauses on hover, focus or touch
 * and stops for good once the play/pause button is pressed; it never starts
 * under `prefers-reduced-motion`. Every change dispatches a composed
 * `change` CustomEvent with `{ index, reason }` so analytics can tell paging
 * apart from rotation, and user-initiated changes (not autoplay) are
 * announced through a visually-hidden live region.
 *
 * ## When to use
 *
 * Use a Carousel for a small set (three to eight) of peer items too rich for
 * a grid — featured products, testimonials, a gallery. Use `picker="tabs"`
 * when slides have meaningful names, `dots` for images. Leave `autoplay` off
 * unless the content is ambient, and keep the pause control visible.
 *
 * ## When not to use
 *
 * Not to hide content behind slide two — lay it out if it must be seen. Not
 * for a list that can grow past ten items, and not for step-by-step content
 * (Stepper).
 *
 * @fires change - Fired when the current slide changes, with `{ index, reason }` in `detail`.
 * @slot - `<ds-carousel-slide>` children, one per slide.
 * @csspart viewport - The scroll-snap container (anatomy: viewport).
 * @csspart track - The flex row inside the viewport (anatomy: track).
 * @csspart prevButton - The composed previous `<ds-button>` (anatomy: prevButton).
 * @csspart nextButton - The composed next `<ds-button>` (anatomy: nextButton).
 * @csspart playButton - The composed play/pause `<ds-button>` (anatomy: playButton).
 * @csspart picker - The dots/tabs picker row (anatomy: picker).
 * @csspart pickerItem - Each dot or tab button (anatomy: pickerItem).
 */
@customElement('ds-carousel')
export class DsCarousel extends LitElement {
  static override styles: CSSResult = css`
    :host {
      position: relative;
      display: block;
      box-sizing: border-box;
      --ds-carousel-slide-gap: var(--layout-gap-normal);
      --ds-carousel-control-offset: var(--space-2);
      --ds-carousel-control-shadow: var(--shadow-raised);
      --ds-carousel-picker-gap: var(--layout-gap-tight);
      --ds-carousel-picker-offset: var(--space-3);
      --ds-carousel-dot-size: var(--space-2);
      --ds-carousel-dot-target: var(--size-target-min);
      --ds-carousel-radius: var(--radius-md);
      --ds-carousel-transition: var(--motion-duration-base);
    }

    :host([hidden]) {
      display: none;
    }

    .stage {
      position: relative;
    }

    .viewport {
      box-sizing: border-box;
      container-type: inline-size;
      container-name: ds-carousel-viewport;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      border-radius: var(--ds-carousel-radius);
    }

    .viewport::-webkit-scrollbar {
      display: none;
    }

    :host([no-snap]) .viewport {
      scroll-snap-type: none;
    }

    .track {
      display: flex;
      gap: var(--ds-carousel-slide-gap);
    }

    ::slotted(*) {
      flex: 0 0 calc(100% / var(--ds-carousel-per-view, 1));
      min-inline-size: 0;
      scroll-snap-align: start;
    }

    /* perView narrows by one step below the prose-reading width; see the generation gap note. */
    @container ds-carousel-viewport (max-width: 48rem) {
      ::slotted(*) {
        flex-basis: 100%;
      }
    }

    /* controlBackground / controlShadow / minTarget: color.overlay.surface / shadow.raised / size.target.comfortable — controlBackground and minTarget locked */
    .control {
      position: absolute;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: var(--size-target-comfortable);
      min-block-size: var(--size-target-comfortable);
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-carousel-control-shadow);
      border-radius: var(--radius-full);
      z-index: 1;
    }

    .prev-control,
    .next-control {
      top: 50%;
      transform: translateY(-50%);
    }

    .prev-control {
      inset-inline-start: var(--ds-carousel-control-offset);
    }

    .next-control {
      inset-inline-end: var(--ds-carousel-control-offset);
    }

    .play-control {
      top: var(--ds-carousel-control-offset);
      inset-inline-end: var(--ds-carousel-control-offset);
    }

    .picker {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: var(--ds-carousel-picker-gap);
      margin-block-start: var(--ds-carousel-picker-offset);
    }

    .dot {
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      inline-size: var(--ds-carousel-dot-target);
      block-size: var(--ds-carousel-dot-target);
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      cursor: pointer;
    }

    .dot::before {
      content: '';
      display: block;
      inline-size: var(--ds-carousel-dot-size);
      block-size: var(--ds-carousel-dot-size);
      border-radius: var(--radius-full);
      /* dot: color.border.strong, locked */
      background: var(--color-border-strong);
      transition: background-color var(--ds-carousel-transition) var(--motion-easing-standard);
    }

    /* dotActive: color.control.selectedBackground, locked; selection is also conveyed by aria-current, not color alone */
    .dot[aria-current='true']::before {
      background: var(--color-control-selected-background);
    }

    .tab {
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      min-inline-size: var(--ds-carousel-dot-target);
      min-block-size: var(--ds-carousel-dot-target);
      padding-inline: var(--space-2);
      border: 0;
      border-radius: var(--ds-carousel-radius);
      background: transparent;
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-foreground-muted);
      white-space: nowrap;
      cursor: pointer;
    }

    /* selection is also conveyed by aria-selected, not color alone */
    .tab[aria-selected='true'] {
      color: var(--color-foreground-strong);
      background: var(--color-background-subtle);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .dot:focus-visible,
    .tab:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* visually-hidden: clipped off-screen but still announced by the live region */
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

    @media (prefers-reduced-motion: reduce) {
      .dot::before {
        transition: none;
      }
    }
  `;

  /** What the carousel shows ("Featured products"). Not visible; the region's accessible name. */
  @property() accessor label!: string;

  /** Slides visible at once at the widest layout; fewer show as the viewport narrows. */
  @property({ type: Number, reflect: true, attribute: 'per-view' }) accessor perView = 1;

  /** Next from the last slide returns to the first. Off by default so users can tell where the end is. */
  @property({ type: Boolean, reflect: true }) accessor loop = false;

  /** Rotates every `interval`. Starts only without reduced motion; stops on hover, focus, touch, or pause, and never restarts on its own. */
  @property({ type: Boolean, reflect: true }) accessor autoplay = false;

  /** Milliseconds between automatic advances. Below 5000 is refused in development. */
  @property({ type: Number }) accessor interval = 6000;

  /** How slides are chosen directly. */
  @property({ reflect: true }) accessor picker: CarouselPicker = 'dots';

  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  @property({ type: Number, reflect: true, attribute: 'active-index' }) accessor activeIndex: number | undefined;

  /** Swiping or scrolling snaps to slide boundaries. Exposed as the negated `no-snap` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  @property({ attribute: 'no-snap', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER }) accessor snap = true;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled current slide, updated by navigation and by the intersection observer. */
  @state() private accessor internalIndex = 0;

  /** The picker item currently carrying the roving tabindex. */
  @state() private accessor focusedPickerIndex: number | null = null;

  @state() private accessor hovering = false;
  @state() private accessor focusWithin = false;
  @state() private accessor touching = false;
  @state() private accessor userPaused = false;
  @state() private accessor reducedMotion = false;
  @state() private accessor announceText = '';

  @query('.viewport') private accessor viewportEl!: HTMLElement | null;

  private intersectionObserver?: IntersectionObserver | undefined;
  private reducedMotionQuery?: MediaQueryList | undefined;
  private timer?: number | undefined;
  private currentIntervalMs?: number | undefined;
  private readonly uid = `ds-carousel-${++instanceCount}`;
  /** Set for a short window after a programmatic scroll, so the intersection observer's own index sync does not re-dispatch a duplicate `change`. */
  private suppressSwipeUntil = 0;

  /** The current slide index, controlled or not. */
  get currentIndex(): number {
    return this.clampIndex(this.activeIndex ?? this.internalIndex);
  }

  /** Total slotted `<ds-carousel-slide>` children. */
  get total(): number {
    return this.slideElements().length;
  }

  private get isPlaying(): boolean {
    return (
      this.autoplay &&
      !this.userPaused &&
      !this.hovering &&
      !this.focusWithin &&
      !this.touching &&
      !this.reducedMotion &&
      this.total > 1
    );
  }

  private get canGoPrev(): boolean {
    return this.loop || this.currentIndex > 0;
  }

  private get canGoNext(): boolean {
    return this.loop || this.currentIndex < this.total - 1;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Carousel');
    this.setAttribute('role', 'region');
    this.setAttribute('aria-roledescription', 'carousel');
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.addEventListener('touchend', this.handleTouchEnd);
    this.reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange);
    this.reducedMotion = this.reducedMotionQuery.matches;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
    this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange);
    this.intersectionObserver?.disconnect();
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
    }
  }

  protected override firstUpdated(): void {
    this.intersectionObserver = new IntersectionObserver(this.handleIntersect, {
      root: this.viewportEl,
      threshold: [0, 0.6],
    });
    this.syncSlides();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('perView')) {
      this.style.setProperty('--ds-carousel-per-view', String(Math.max(1, this.perView)));
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('activeIndex') && this.activeIndex !== undefined) {
      this.scrollToIndex(this.clampIndex(this.activeIndex));
    }
    this.syncHostAria();
    this.syncAutoplay();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const total = this.total;
    const current = this.currentIndex;
    const playing = this.isPlaying;
    return html`
      <div class="stage">
        ${this.autoplay
          ? html`
              <div class="control play-control">
                <ds-button
                  part="playButton"
                  variant="ghost"
                  size="sm"
                  label=${playing ? COPY_PAUSE : COPY_PLAY}
                  @press=${this.handlePlayPause}
                ></ds-button>
              </div>
            `
          : nothing}
        <div class="control prev-control">
          <ds-button
            part="prevButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${COPY_PREVIOUS}
            ?disabled=${!this.canGoPrev}
            @press=${this.handlePrev}
          >
            <ds-icon slot="leading-icon" name="chevron-left"></ds-icon>
          </ds-button>
        </div>
        <div class="control next-control">
          <ds-button
            part="nextButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${COPY_NEXT}
            ?disabled=${!this.canGoNext}
            @press=${this.handleNext}
          >
            <ds-icon slot="leading-icon" name="chevron-right"></ds-icon>
          </ds-button>
        </div>
        <div class="viewport" part="viewport">
          <div class="track" part="track" aria-live=${playing ? 'off' : 'polite'}>
            <slot @slotchange=${this.handleSlotChange}></slot>
          </div>
        </div>
      </div>
      ${this.picker !== 'none' ? this.renderPicker(total, current) : nothing}
      <div class="visually-hidden" aria-live="polite">${this.announceText}</div>
    `;
  }

  private renderPicker(total: number, current: number) {
    const items = Array.from({ length: total }, (_, index) => index);
    if (this.picker === 'tabs') {
      return html`
        <div class="picker" part="picker" role="tablist" @keydown=${this.handlePickerKeydown}>
          ${items.map((index) => this.renderTabItem(index, index === current))}
        </div>
      `;
    }
    return html`
      <div class="picker" part="picker" role="group" @keydown=${this.handlePickerKeydown}>
        ${items.map((index) => this.renderDotItem(index, index === current))}
      </div>
    `;
  }

  private renderDotItem(index: number, selected: boolean) {
    const focused = (this.focusedPickerIndex ?? this.currentIndex) === index;
    return html`
      <button
        type="button"
        class="dot"
        part="pickerItem"
        aria-label=${COPY_GO_TO(index + 1)}
        aria-current=${selected ? 'true' : 'false'}
        data-index=${index}
        tabindex=${focused ? 0 : -1}
        @click=${() => this.handlePickerSelect(index)}
      ></button>
    `;
  }

  private renderTabItem(index: number, selected: boolean) {
    const focused = (this.focusedPickerIndex ?? this.currentIndex) === index;
    const slide = this.slideElements()[index];
    const label = slide?.heading ?? COPY_GO_TO(index + 1);
    return html`
      <button
        type="button"
        class="tab"
        part="pickerItem"
        role="tab"
        aria-selected=${selected ? 'true' : 'false'}
        aria-controls=${slide?.id ?? nothing}
        data-index=${index}
        tabindex=${focused ? 0 : -1}
        @click=${() => this.handlePickerSelect(index)}
      >
        ${label}
      </button>
    `;
  }

  private readonly handlePlayPause = (event: Event): void => {
    event.stopPropagation();
    this.userPaused = !this.userPaused;
  };

  private readonly handlePrev = (event: Event): void => {
    event.stopPropagation();
    this.moveTo(this.currentIndex - this.step(), 'prev');
  };

  private readonly handleNext = (event: Event): void => {
    event.stopPropagation();
    this.moveTo(this.currentIndex + this.step(), 'next');
  };

  private handlePickerSelect(index: number): void {
    this.focusedPickerIndex = index;
    this.moveTo(index, 'picker');
  }

  private readonly handlePickerKeydown = (event: KeyboardEvent): void => {
    if (this.total === 0) {
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.movePickerFocus(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.movePickerFocus(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.selectFromPicker(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      this.selectFromPicker(this.total - 1);
    }
  };

  private movePickerFocus(delta: number): void {
    const total = this.total;
    const current = this.focusedPickerIndex ?? this.currentIndex;
    this.selectFromPicker(((current + delta) % total + total) % total);
  }

  private selectFromPicker(index: number): void {
    this.focusedPickerIndex = index;
    this.moveTo(index, 'picker');
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
    });
  }

  private readonly handlePointerEnter = (): void => {
    this.hovering = true;
  };

  private readonly handlePointerLeave = (): void => {
    this.hovering = false;
  };

  private readonly handleFocusIn = (): void => {
    this.focusWithin = true;
  };

  private readonly handleFocusOut = (): void => {
    this.focusWithin = false;
  };

  private readonly handleTouchStart = (): void => {
    this.touching = true;
  };

  private readonly handleTouchEnd = (): void => {
    this.touching = false;
  };

  private readonly handleReducedMotionChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
  };

  private readonly handleSlotChange = (): void => {
    this.syncSlides();
  };

  private readonly handleIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      (entry.target as HTMLElement).toggleAttribute('inert', !(entry.isIntersecting && entry.intersectionRatio >= 0.6));
    }
    this.syncActiveFromVisibility();
  };

  private syncActiveFromVisibility(): void {
    const slides = this.slideElements();
    const visibleIndex = slides.findIndex((slide) => !slide.hasAttribute('inert'));
    if (visibleIndex === -1 || visibleIndex === this.currentIndex) {
      return;
    }
    if (Date.now() < this.suppressSwipeUntil) {
      if (this.activeIndex !== undefined) {
        this.activeIndex = visibleIndex;
      } else {
        this.internalIndex = visibleIndex;
      }
      return;
    }
    this.moveTo(visibleIndex, 'swipe', { scroll: false });
  }

  private step(): number {
    return Math.max(1, this.perView);
  }

  private clampIndex(index: number): number {
    const total = this.total;
    if (total === 0) {
      return 0;
    }
    if (this.loop) {
      return ((index % total) + total) % total;
    }
    return Math.min(Math.max(index, 0), total - 1);
  }

  /** Navigates to `index`, dispatching `change` and announcing the result. `autoplay` always wraps regardless of `loop` — see the generation gap note. */
  private moveTo(index: number, reason: CarouselChangeReason, options: { scroll?: boolean | undefined } = {}): void {
    const total = this.total;
    if (total === 0) {
      return;
    }
    const previous = this.currentIndex;
    const clamped = this.clampIndex(index);
    if (this.activeIndex !== undefined) {
      this.activeIndex = clamped;
    } else {
      this.internalIndex = clamped;
    }
    if (options.scroll !== false) {
      this.scrollToIndex(clamped);
    }
    if (clamped === previous) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<CarouselChangeDetail>('change', {
        detail: { index: clamped, reason },
        bubbles: true,
        composed: true,
      }),
    );
    if (reason !== 'autoplay') {
      this.announceText = COPY_ANNOUNCE(clamped + 1, total);
    }
  }

  private tickAutoplay(): void {
    const total = this.total;
    if (total <= 1) {
      return;
    }
    this.moveTo((this.currentIndex + this.step()) % total, 'autoplay');
  }

  private scrollToIndex(index: number): void {
    const slide = this.slideElements()[index];
    if (!slide) {
      return;
    }
    this.suppressSwipeUntil = Date.now() + 500;
    slide.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
  }

  private slideElements(): DsCarouselSlide[] {
    return Array.from(this.children).filter(
      (el): el is DsCarouselSlide => (el as HTMLElement).dataset.ds === 'CarouselSlide',
    );
  }

  /** Stamps `role`, `aria-roledescription`, `id` and the positional `aria-label` onto each slide, and (re)registers it with the intersection observer. */
  private syncSlides(): void {
    this.intersectionObserver?.disconnect();
    const slides = this.slideElements();
    const total = slides.length;
    const current = this.currentIndex;
    const step = this.step();
    slides.forEach((slide, index) => {
      if (!slide.id) {
        slide.id = `${this.uid}-slide-${index}`;
      }
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      const positional = COPY_SLIDE_LABEL(index + 1, total);
      slide.setAttribute('aria-label', slide.heading ? `${positional}, ${slide.heading}` : positional);
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(slide);
      } else {
        slide.toggleAttribute('inert', index < current || index >= current + step);
      }
    });
    this.requestUpdate();
  }

  /** `role`/`aria-roledescription`/`aria-label` as plain host attributes, so the accessible-name tests can read them. */
  private syncHostAria(): void {
    if (this.label) {
      this.setAttribute('aria-label', this.label);
    } else {
      this.removeAttribute('aria-label');
    }
  }

  private get effectiveInterval(): number {
    if (import.meta.env.DEV && this.interval < 5000) {
      console.warn('<ds-carousel> `interval` below 5000ms is refused in development; using 5000ms.', this); // literal-ok: dev-warning text, not a style value
      return 5000;
    }
    return this.interval;
  }

  private syncAutoplay(): void {
    if (this.isPlaying) {
      const ms = this.effectiveInterval;
      if (this.timer === undefined || this.currentIntervalMs !== ms) {
        if (this.timer !== undefined) {
          window.clearInterval(this.timer);
        }
        this.currentIntervalMs = ms;
        this.timer = window.setInterval(() => this.tickAutoplay(), ms);
      }
    } else if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
      this.currentIntervalMs = undefined;
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as CarouselOverridableBinding[]) {
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
      console.warn("<ds-carousel> requires a `label`, the region's accessible name.", this);
    }
    if (this.total === 0) {
      console.warn('<ds-carousel> requires at least one `<ds-carousel-slide>` child.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-carousel': DsCarousel;
    'ds-carousel-slide': DsCarouselSlide;
  }
}
