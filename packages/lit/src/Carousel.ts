import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';

export type CarouselPicker = 'dots' | 'tabs' | 'none';
export type CarouselChangeReason = 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay';

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

/** constants.minInterval (ms): the floor `interval` is raised to. */
const MIN_INTERVAL = 5000;

/** The share of a slide that must be inside the viewport for it to count as visible. */
const VISIBLE_THRESHOLD = 0.6;

/** How long a programmatic scroll may take before visibility changes count as a swipe again (when `scrollend` never fires). */
const PROGRAMMATIC_SCROLL_TIMEOUT = 1000;

/** layout.maxWidth.prose: `@container` conditions cannot read custom properties, so the built breakpoint is
    duplicated here as a literal, as Table does. literal-ok: breakpoint from layout.maxWidth.prose */
const PROSE_BREAKPOINT_PX = 572;

/** Negates a boolean attribute: `no-snap` present means `snap` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. `controlBackground`, `dot`, `dotActive`, `dotTarget`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'radius'
  | 'transition';

const HOOKS: Record<CarouselOverridableBinding, string> = {
  slideGap: '--ds-carousel-slide-gap',
  controlOffset: '--ds-carousel-control-offset',
  controlShadow: '--ds-carousel-control-shadow',
  pickerGap: '--ds-carousel-picker-gap',
  pickerOffset: '--ds-carousel-picker-offset',
  dotSize: '--ds-carousel-dot-size',
  radius: '--ds-carousel-radius',
  transition: '--ds-carousel-transition',
};

/**
 * `<ds-carousel-slide>` — one Carousel slide (anatomy: slide).
 *
 * `<ds-carousel>` sets its `role="group"`, `aria-roledescription="slide"`,
 * positional `aria-label` and `inert`; consumers set `label` (the slide's name
 * in the tabs picker and its accessible name) and repeat that wording in the
 * slide's own visible heading.
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

  /** The slide's name: the tab label with `picker="tabs"` and part of its accessible name. */
  @property() accessor label: string | undefined;

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
 * `<ds-carousel label="Featured products">` holds slotted
 * `<ds-carousel-slide>` children in a scroll-snap viewport, so swipe and
 * trackpad scrolling work natively. An `IntersectionObserver` on the slotted
 * slides keeps the current index on what is visible and makes the rest
 * `inert`. Previous/Next move one page of visible slides and are disabled at
 * the ends unless `loop`; the picker (`dots` or `tabs`) jumps directly and
 * answers ArrowLeft/ArrowRight/Home/End. `autoplay` advances every `interval`
 * (never faster than 5000 ms), pauses while hovered, focused or touched, stops
 * for good at the last slide without `loop` or when the pause button is
 * pressed, and never starts under reduced motion (the play/pause button is not
 * rendered then). Every change dispatches a composed `change` with
 * `{ index, reason }`; user-initiated changes are announced.
 *
 * Tab order: play/pause, previous, next, picker, then the current slide.
 *
 * @fires change - The current slide changed; `detail` is `{ index, reason }`.
 * @slot - `<ds-carousel-slide>` children, one per slide.
 */
@customElement('ds-carousel')
export class DsCarousel extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-carousel-slide-gap: var(--layout-gap-normal);
      --ds-carousel-control-offset: var(--space-2);
      --ds-carousel-control-shadow: var(--shadow-raised);
      --ds-carousel-picker-gap: var(--layout-gap-tight);
      --ds-carousel-picker-offset: var(--space-3);
      --ds-carousel-dot-size: var(--space-2);
      --ds-carousel-radius: var(--radius-md);
      --ds-carousel-transition: var(--motion-duration-base);
    }

    :host([hidden]) {
      display: none;
    }

    /* The DOM order is the tab order (play, previous, next, picker, slides); the grid places the picker below the viewport. */
    .frame {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      column-gap: var(--ds-carousel-picker-gap);
      row-gap: var(--ds-carousel-picker-offset);
      align-items: center;
    }

    [data-part='viewport'],
    [data-part='controlSurface'] {
      grid-row: 1;
      grid-column: 1 / -1;
    }

    [data-part='viewport'] {
      box-sizing: border-box;
      container-type: inline-size;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      border-radius: var(--ds-carousel-radius);
    }

    [data-part='viewport']::-webkit-scrollbar {
      display: none;
    }

    :host([no-snap]) [data-part='viewport'] {
      scroll-snap-type: none;
    }

    /* slideGap: layout.gap.normal, between slides */
    [data-part='track'] {
      --ds-carousel-visible: var(--ds-carousel-per-view, 1);
      display: flex;
      gap: var(--ds-carousel-slide-gap);
    }

    @container (max-width: ${unsafeCSS(PROSE_BREAKPOINT_PX)}px) {
      [data-part='track'] {
        --ds-carousel-visible: 1;
      }
    }

    ::slotted(*) {
      flex: 0 0
        calc((100% - (var(--ds-carousel-visible) - 1) * var(--ds-carousel-slide-gap)) / var(--ds-carousel-visible));
      min-inline-size: 0;
      scroll-snap-align: start;
    }

    /* controlBackground (locked), controlShadow, minTarget (locked); full radius per the doc */
    [data-part='controlSurface'] {
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      min-inline-size: var(--size-target-comfortable);
      min-block-size: var(--size-target-comfortable);
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-carousel-control-shadow);
      border-radius: var(--radius-full);
    }

    /* controlOffset: distance from the viewport edge */
    .prev {
      justify-self: start;
      inset-inline-start: var(--ds-carousel-control-offset);
    }

    .next {
      justify-self: end;
      inset-inline-end: var(--ds-carousel-control-offset);
    }

    .play {
      grid-row: 2;
      grid-column: 1;
    }

    /* pickerGap, pickerOffset (the frame's row gap) */
    [data-part='picker'] {
      grid-row: 2;
      grid-column: 2;
      justify-self: center;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: var(--ds-carousel-picker-gap);
    }

    .frame.no-play [data-part='picker'] {
      grid-column: 1 / -1;
    }

    button[data-part='pickerItem'] {
      box-sizing: border-box;
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      margin: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    /* dotTarget (locked): the hit area; dotSize: the visible dot */
    .dot {
      inline-size: var(--size-target-min);
      block-size: var(--size-target-min);
      padding: 0;
      border-radius: var(--radius-full);
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

    /* dotActive: color.control.selectedBackground, locked; aria-current carries the state too */
    .dot[aria-current='true']::before {
      background: var(--color-control-selected-background);
    }

    .tab {
      min-block-size: var(--size-target-comfortable);
      padding-block: 0;
      padding-inline: var(--space-3);
      border-radius: var(--ds-carousel-radius);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground-muted);
      white-space: nowrap;
      transition:
        color var(--ds-carousel-transition) var(--motion-easing-standard),
        box-shadow var(--ds-carousel-transition) var(--motion-easing-standard);
    }

    /* dotActive as the selected tab's indicator; aria-selected carries the state too */
    .tab[aria-selected='true'] {
      color: var(--color-foreground-strong);
      box-shadow: inset 0 calc(-1 * var(--border-width-focus)) 0 var(--color-control-selected-background);
    }

    /* focusRing / focusRingWidth: locked */
    button[data-part='pickerItem']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
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

    @media (prefers-reduced-motion: reduce) {
      .dot::before,
      .tab {
        transition: none;
      }
    }
  `;

  /** What the carousel shows ("Featured products"): the region's accessible name. */
  @property() accessor label = '';

  /** Slides visible at once at the widest layout; one below the prose width. */
  @property({ type: Number, reflect: true, attribute: 'per-view' }) accessor perView = 1;

  /** Next from the last slide returns to the first. */
  @property({ type: Boolean, reflect: true }) accessor loop = false;

  /** Rotate every `interval`; never under reduced motion. */
  @property({ type: Boolean, reflect: true }) accessor autoplay = false;

  /** Milliseconds between automatic advances; values below 5000 are raised to 5000. */
  @property({ type: Number }) accessor interval = 6000;

  /** How slides are chosen directly. */
  @property({ reflect: true }) accessor picker: CarouselPicker = 'dots';

  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  @property({ type: Number, reflect: true, attribute: 'active-index' }) accessor activeIndex: number | undefined;

  /** Swiping or scrolling snaps to slide boundaries; `false` is the `no-snap` attribute. */
  @property({ attribute: 'no-snap', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER }) accessor snap = true;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<CarouselOverridableBinding, TokenRef | undefined>>
    | undefined;

  @state() private accessor internalIndex = 0;
  /** How many slides the observer reports visible: one page. */
  @state() private accessor visibleCount = 1;
  @state() private accessor focusedPickerIndex: number | null = null;
  @state() private accessor slideCount = 0;
  @state() private accessor hovering = false;
  @state() private accessor focusWithin = false;
  @state() private accessor touching = false;
  /** Set by the pause button (and by autoplay reaching the end without `loop`); cleared only by play. */
  @state() private accessor stopped = false;
  @state() private accessor reducedMotion = false;
  @state() private accessor announceText = '';

  @query('[data-part="viewport"]') private accessor viewportEl!: HTMLElement | null;

  private intersectionObserver: IntersectionObserver | undefined;
  private reducedMotionQuery: MediaQueryList | undefined;
  private timer: number | undefined;
  private timerInterval: number | undefined;
  private scrollTimeout: number | undefined;
  /** True while a programmatic scroll is settling, so its visibility changes are not reported as a swipe. */
  private programmaticScroll = false;
  /** A user-initiated change in controlled mode is announced once the new `activeIndex` arrives. */
  private announcePending = false;
  private warnedLabel = false;
  private warnedInterval = false;

  /** The current slide index, controlled or not. */
  get currentIndex(): number {
    return this.clamp(this.activeIndex ?? this.internalIndex);
  }

  private get isControlled(): boolean {
    return this.activeIndex !== undefined;
  }

  private get page(): number {
    return Math.max(1, this.visibleCount);
  }

  /** The furthest index a page can start at. */
  private get lastStart(): number {
    return Math.max(0, this.slideCount - this.page);
  }

  /** Rotation is wanted: autoplay on, not stopped by the user, motion allowed. */
  private get rotating(): boolean {
    return this.autoplay && !this.reducedMotion && !this.stopped;
  }

  private get timerShouldRun(): boolean {
    return this.rotating && !this.hovering && !this.focusWithin && !this.touching && this.slideCount > 1;
  }

  private get prevTarget(): number | null {
    const current = this.currentIndex;
    if (current <= 0) return this.loop && this.slideCount > 1 ? this.lastStart : null;
    return Math.max(0, current - this.page);
  }

  private get nextTarget(): number | null {
    const current = this.currentIndex;
    if (current >= this.lastStart) return this.loop && this.slideCount > 1 ? 0 : null;
    return Math.min(this.lastStart, current + this.page);
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
    this.addEventListener('touchcancel', this.handleTouchEnd);
    this.reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange);
    this.reducedMotion = this.reducedMotionQuery.matches;
    if (this.hasUpdated) this.observeSlides();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('touchstart', this.handleTouchStart);
    this.removeEventListener('touchend', this.handleTouchEnd);
    this.removeEventListener('touchcancel', this.handleTouchEnd);
    this.reducedMotionQuery?.removeEventListener('change', this.handleReducedMotionChange);
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
    this.clearTimer();
    window.clearTimeout(this.scrollTimeout);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (changed.has('perView')) {
      const perView = Math.max(1, Math.round(this.perView));
      this.style.setProperty('--ds-carousel-per-view', String(perView));
      if (!this.intersectionObserver) this.visibleCount = perView;
    }
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else this.removeAttribute('aria-label');
    }
  }

  protected override firstUpdated(): void {
    this.syncSlides();
    this.observeSlides();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('activeIndex') && this.activeIndex !== undefined) {
      if (changed.get('activeIndex') !== undefined || this.activeIndex !== 0) {
        this.scrollToIndex(this.currentIndex);
      }
      if (this.announcePending) {
        this.announcePending = false;
        this.announce(this.currentIndex);
      }
      this.syncInert();
    }
    this.syncAutoplay();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const showPlay = this.autoplay && !this.reducedMotion;
    const prevTarget = this.prevTarget;
    const nextTarget = this.nextTarget;
    return html`
      <div class="frame ${showPlay ? '' : 'no-play'}">
        ${showPlay
          ? html`<ds-button
              class="play"
              data-part="playButton"
              part="playButton"
              label=${this.stopped ? COPY_PLAY : COPY_PAUSE}
              @press=${this.handlePlayPause}
            ></ds-button>`
          : nothing}
        <div class="prev" data-part="controlSurface" part="controlSurface">
          <ds-button
            data-part="prevButton"
            part="prevButton"
            variant="secondary"
            icon-only
            label=${COPY_PREVIOUS}
            ?disabled=${prevTarget === null}
            @press=${this.handlePrev}
          >
            <ds-icon slot="leading-icon" name="chevron-left"></ds-icon>
          </ds-button>
        </div>
        <div class="next" data-part="controlSurface" part="controlSurface">
          <ds-button
            data-part="nextButton"
            part="nextButton"
            variant="secondary"
            icon-only
            label=${COPY_NEXT}
            ?disabled=${nextTarget === null}
            @press=${this.handleNext}
          >
            <ds-icon slot="leading-icon" name="chevron-right"></ds-icon>
          </ds-button>
        </div>
        ${this.picker === 'none' ? nothing : this.renderPicker()}
        <div data-part="viewport" part="viewport" @scrollend=${this.handleScrollEnd}>
          <div data-part="track" part="track" aria-live=${this.rotating ? 'off' : 'polite'}>
            <slot @slotchange=${this.handleSlotChange}></slot>
          </div>
        </div>
      </div>
      <div class="visually-hidden" data-part="liveRegion" part="liveRegion" aria-live="polite">${this.announceText}</div>
    `;
  }

  private renderPicker(): TemplateResult {
    const slides = this.slideElements();
    const current = this.currentIndex;
    const roving = this.focusedPickerIndex ?? current;
    if (this.picker === 'tabs') {
      return html`
        <div data-part="picker" part="picker" role="tablist" @keydown=${this.handlePickerKeydown}>
          ${slides.map(
            (slide, index) => html`<button
              type="button"
              class="tab"
              data-part="pickerItem"
              part="pickerItem"
              role="tab"
              aria-selected=${index === current ? 'true' : 'false'}
              data-index=${index}
              tabindex=${index === roving ? 0 : -1}
              @click=${() => this.selectFromPicker(index)}
            >
              ${slide.label ?? COPY_GO_TO(index + 1)}
            </button>`,
          )}
        </div>
      `;
    }
    return html`
      <div data-part="picker" part="picker" role="group" @keydown=${this.handlePickerKeydown}>
        ${slides.map(
          (_slide, index) => html`<button
            type="button"
            class="dot"
            data-part="pickerItem"
            part="pickerItem"
            aria-label=${COPY_GO_TO(index + 1)}
            aria-current=${index === current ? 'true' : nothing}
            data-index=${index}
            tabindex=${index === roving ? 0 : -1}
            @click=${() => this.selectFromPicker(index)}
          ></button>`,
        )}
      </div>
    `;
  }

  private readonly handlePlayPause = (event: Event): void => {
    event.stopPropagation();
    this.stopped = !this.stopped;
  };

  private readonly handlePrev = (event: Event): void => {
    event.stopPropagation();
    const target = this.prevTarget;
    if (target !== null) this.moveTo(target, 'prev');
  };

  private readonly handleNext = (event: Event): void => {
    event.stopPropagation();
    const target = this.nextTarget;
    if (target !== null) this.moveTo(target, 'next');
  };

  private readonly handlePickerKeydown = (event: KeyboardEvent): void => {
    const total = this.slideCount;
    if (total === 0) return;
    const from = this.focusedPickerIndex ?? this.currentIndex;
    let target: number;
    switch (event.key) {
      case 'ArrowRight':
        target = (from + 1) % total;
        break;
      case 'ArrowLeft':
        target = (from - 1 + total) % total;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = total - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.selectFromPicker(target);
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>(`[data-part="pickerItem"][data-index="${target}"]`)?.focus();
    });
  };

  private selectFromPicker(index: number): void {
    this.focusedPickerIndex = index;
    this.moveTo(index, 'picker');
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

  private readonly handleFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    this.focusWithin = next instanceof Node && (next === this || this.contains(next));
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
    this.observeSlides();
  };

  private readonly handleScrollEnd = (): void => {
    this.endProgrammaticScroll();
  };

  private readonly handleIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const visible = entry.isIntersecting && entry.intersectionRatio >= VISIBLE_THRESHOLD;
      const slide = entry.target as HTMLElement;
      if (slide.hasAttribute('inert') === visible) slide.toggleAttribute('inert', !visible);
    }
    const slides = this.slideElements();
    const visible = slides.filter((slide) => !slide.hasAttribute('inert')).length;
    if (visible > 0 && visible !== this.visibleCount) this.visibleCount = visible;
    if (this.programmaticScroll) return;
    const first = slides.findIndex((slide) => !slide.hasAttribute('inert'));
    if (first === -1 || first === this.currentIndex) return;
    this.moveTo(first, 'swipe', false);
  };

  private clamp(index: number): number {
    return Math.min(Math.max(Math.round(index), 0), Math.max(0, this.slideCount - 1));
  }

  /**
   * Requests slide `index`: dispatches `change`; uncontrolled, it also moves and (for a user change) announces.
   * Controlled, the element waits for `activeIndex` to change before it shows or announces anything.
   */
  private moveTo(index: number, reason: CarouselChangeReason, scroll = true): void {
    if (this.slideCount === 0) return;
    const target = this.clamp(index);
    if (target === this.currentIndex) return;
    if (reason !== 'picker') this.focusedPickerIndex = null;
    const user = reason !== 'autoplay';
    if (this.isControlled) {
      this.announcePending = user;
    } else {
      this.internalIndex = target;
      if (scroll) this.scrollToIndex(target);
      else this.syncInert();
      if (user) this.announce(target);
    }
    this.dispatchEvent(
      new CustomEvent<CarouselChangeDetail>('change', {
        detail: { index: target, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private announce(index: number): void {
    this.announceText = COPY_ANNOUNCE(index + 1, this.slideCount);
  }

  private scrollToIndex(index: number): void {
    const slide = this.slideElements()[index];
    const viewport = this.viewportEl;
    if (!slide || !viewport) return;
    this.programmaticScroll = true;
    window.clearTimeout(this.scrollTimeout);
    this.scrollTimeout = window.setTimeout(() => this.endProgrammaticScroll(), PROGRAMMATIC_SCROLL_TIMEOUT);
    slide.scrollIntoView({ behavior: this.reducedMotion ? 'instant' : 'smooth', inline: 'start', block: 'nearest' });
  }

  private endProgrammaticScroll(): void {
    window.clearTimeout(this.scrollTimeout);
    this.programmaticScroll = false;
  }

  private slideElements(): DsCarouselSlide[] {
    return Array.from(this.children).filter((el): el is DsCarouselSlide => el instanceof DsCarouselSlide);
  }

  /** Stamps each slide's group role, roledescription and positional name. Every write compares first. */
  private syncSlides(): void {
    const slides = this.slideElements();
    const total = slides.length;
    slides.forEach((slide, index) => {
      const positional = COPY_SLIDE_LABEL(index + 1, total);
      const name = slide.label ? `${positional}, ${slide.label}` : positional;
      setAttr(slide, 'role', 'group');
      setAttr(slide, 'aria-roledescription', 'slide');
      setAttr(slide, 'aria-label', name);
      setAttr(slide, 'data-part', 'slide');
    });
    this.slideCount = total;
    this.syncInert();
  }

  /** Before the observer reports (or without it), the current page is the visible one. */
  private syncInert(): void {
    if (this.intersectionObserver) return;
    const first = Math.min(this.currentIndex, this.lastStart);
    this.slideElements().forEach((slide, index) => {
      const hidden = index < first || index >= first + this.page;
      if (slide.hasAttribute('inert') !== hidden) slide.toggleAttribute('inert', hidden);
    });
  }

  private observeSlides(): void {
    const viewport = this.viewportEl;
    if (!viewport || typeof IntersectionObserver === 'undefined') return;
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = new IntersectionObserver(this.handleIntersect, {
      root: viewport,
      threshold: [0, VISIBLE_THRESHOLD],
    });
    for (const slide of this.slideElements()) this.intersectionObserver.observe(slide);
  }

  private get effectiveInterval(): number {
    return Math.max(this.interval, MIN_INTERVAL);
  }

  private syncAutoplay(): void {
    if (!this.timerShouldRun) {
      this.clearTimer();
      return;
    }
    const ms = this.effectiveInterval;
    if (this.timer !== undefined && this.timerInterval === ms) return;
    this.clearTimer();
    this.timerInterval = ms;
    this.timer = window.setInterval(this.tick, ms);
  }

  private clearTimer(): void {
    if (this.timer === undefined) return;
    window.clearInterval(this.timer);
    this.timer = undefined;
    this.timerInterval = undefined;
  }

  private readonly tick = (): void => {
    const target = this.nextTarget;
    if (target === null) {
      this.stopped = true;
      return;
    }
    this.moveTo(target, 'autoplay');
    // Without loop, rotation stops for good once it reaches the last page.
    if (!this.loop && target >= this.lastStart) this.stopped = true;
  };

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as CarouselOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) this.style.removeProperty(hook);
      else this.style.setProperty(hook, cssVar(ref));
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) return;
    if (!this.label && !this.warnedLabel) {
      this.warnedLabel = true;
      console.warn("<ds-carousel> requires a `label`, the region's accessible name.", this);
    }
    if (this.interval < MIN_INTERVAL && !this.warnedInterval) {
      this.warnedInterval = true;
      console.warn(`<ds-carousel> \`interval\` ${this.interval} is below the minimum; raised to ${MIN_INTERVAL}.`, this);
    }
  }
}

function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-carousel': DsCarousel;
    'ds-carousel-slide': DsCarouselSlide;
  }
}
