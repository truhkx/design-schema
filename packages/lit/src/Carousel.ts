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
/** copy.pickerLabel */
const COPY_PICKER_LABEL = 'Choose a slide';
/** copy.goTo */
const COPY_GO_TO = (n: number): string => `Go to slide ${n}`;
/** copy.announce */
const COPY_ANNOUNCE = (n: number, total: number): string => `Slide ${n} of ${total}`;

/** constants.minInterval (ms): the floor `interval` is raised to. */
const MIN_INTERVAL = 5000;

/** The share of a slide that must be inside the viewport for it to count as visible. */
const VISIBLE_THRESHOLD = 0.6;

/** Settle delay for a user scroll where `scrollend` is not supported. */
const SCROLL_SETTLE_FALLBACK = 150;
const SCROLLEND_SUPPORTED: boolean = typeof window !== 'undefined' && 'onscrollend' in window;

/** layout.maxWidth.prose from the built token JSON: `@container` conditions cannot read custom properties, so the
    breakpoint is duplicated as a literal, as Table does. Logic reads the token first. literal-ok: breakpoint from layout.maxWidth.prose */
const PROSE_BREAKPOINT = 572;

/** Negates a boolean attribute: `no-snap` present means `snap` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. Locked bindings (`controlBackground`, `dot`, `dotActive`, `dotTarget`, `tabColor`, `tabSelectedColor`, `tabIndicatorThickness`, `minTarget`, `focusRing`, `focusRingWidth`) are excluded. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlRadius'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'radius'
  | 'tabFontSize'
  | 'tabFontWeight'
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'fontFamily'
  | 'transition';

const HOOKS: Record<CarouselOverridableBinding, string> = {
  slideGap: '--ds-carousel-slide-gap',
  controlOffset: '--ds-carousel-control-offset',
  controlRadius: '--ds-carousel-control-radius',
  controlShadow: '--ds-carousel-control-shadow',
  pickerGap: '--ds-carousel-picker-gap',
  pickerOffset: '--ds-carousel-picker-offset',
  dotSize: '--ds-carousel-dot-size',
  radius: '--ds-carousel-radius',
  tabFontSize: '--ds-carousel-tab-font-size',
  tabFontWeight: '--ds-carousel-tab-font-weight',
  tabPaddingBlock: '--ds-carousel-tab-padding-block',
  tabPaddingInline: '--ds-carousel-tab-padding-inline',
  fontFamily: '--ds-carousel-font-family',
  transition: '--ds-carousel-transition',
};

/**
 * `<ds-carousel-slide>` — one Carousel slide (anatomy: slide).
 *
 * `<ds-carousel>` sets its role, `aria-roledescription="slide"`, positional
 * `aria-label` (`copy.slideLabel`), `inert` and `aria-hidden`; consumers set
 * `label` (the slide's name in the tabs picker) and repeat that wording in the
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

  /** The slide's name in the tabs picker. A plain string, never read from the slide's content. */
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
 * slides makes the ones outside the visible page `inert` and `aria-hidden`;
 * a scroll the user started reports the first visible slide as a `swipe` when
 * it settles. Previous/Next move one page and are disabled at the ends unless
 * `loop`; the picker (`dots` or `tabs`) jumps directly and answers
 * ArrowLeft/ArrowRight/Home/End. `autoplay` advances every `interval` (never
 * faster than `minInterval`), pauses while hovered, focused or touched, stops
 * at the last slide without `loop` or when paused, and never starts under
 * reduced motion (the play/pause button is not rendered then).
 *
 * Order: play/pause, previous, next, picker, then the slides; the grid places
 * the play/pause row above the viewport and the picker below it.
 *
 * @fires change - The current slide changed; `detail` is `{ index, reason }`.
 * @slot - `<ds-carousel-slide>` children, one per slide.
 */
@customElement('ds-carousel')
export class DsCarousel extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      position: relative;
      display: block;
      box-sizing: border-box;
      --ds-carousel-slide-gap: var(--layout-gap-normal);
      --ds-carousel-control-offset: var(--space-2);
      --ds-carousel-control-radius: var(--radius-full);
      --ds-carousel-control-shadow: var(--shadow-raised);
      --ds-carousel-picker-gap: var(--layout-gap-tight);
      --ds-carousel-picker-offset: var(--space-3);
      --ds-carousel-dot-size: var(--space-2);
      --ds-carousel-radius: var(--radius-md);
      --ds-carousel-tab-font-size: var(--font-size-sm);
      --ds-carousel-tab-font-weight: var(--font-weight-medium);
      --ds-carousel-tab-padding-block: var(--space-sm);
      --ds-carousel-tab-padding-inline: var(--space-md);
      --ds-carousel-font-family: var(--font-family-body);
      --ds-carousel-transition: var(--motion-duration-base);
    }

    :host([hidden]) {
      display: none;
    }

    /* DOM order is the tab order (play, previous, next, picker, slides); the grid places the rows.
       pickerOffset: the gap between the play row, the viewport and the picker row. */
    .frame {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      row-gap: var(--ds-carousel-picker-offset);
      align-items: center;
    }

    [data-part='playButton'] {
      grid-row: 1;
      grid-column: 1;
      justify-self: start;
    }

    [data-part='viewport'],
    [data-part='controlSurface'] {
      grid-row: 2;
      grid-column: 1;
    }

    [data-part='picker'] {
      grid-row: 3;
      grid-column: 1;
    }

    .frame.no-play [data-part='viewport'],
    .frame.no-play [data-part='controlSurface'] {
      grid-row: 1;
    }

    .frame.no-play [data-part='picker'] {
      grid-row: 2;
    }

    /* radius: the viewport's corners */
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

    /* slideGap: the track's gap, never a slide margin */
    [data-part='track'] {
      --ds-carousel-visible: var(--ds-carousel-per-view, 1);
      display: flex;
      gap: var(--ds-carousel-slide-gap);
    }

    @container (max-width: ${unsafeCSS(PROSE_BREAKPOINT)}px) {
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

    /* controlBackground (locked), controlShadow, controlRadius, minTarget (locked) */
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
      border-radius: var(--ds-carousel-control-radius);
    }

    /* controlOffset: the inline inset from the viewport's inline edge */
    .prev {
      justify-self: start;
      inset-inline-start: var(--ds-carousel-control-offset);
    }

    .next {
      justify-self: end;
      inset-inline-end: var(--ds-carousel-control-offset);
    }

    [data-part='prevButton'],
    [data-part='nextButton'],
    [data-part='playButton'] {
      display: inline-flex;
    }

    /* pickerGap */
    [data-part='picker'] {
      justify-self: center;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: var(--ds-carousel-picker-gap);
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
      /* dot: locked */
      background: var(--color-border-strong);
      transition: background-color var(--ds-carousel-transition) var(--motion-easing-standard);
    }

    /* dotActive: locked; aria-current carries the state too */
    .dot[aria-current='true']::before {
      background: var(--color-control-selected-background);
    }

    /* tabColor (locked), tabFontSize, tabFontWeight, tabPaddingBlock, tabPaddingInline, fontFamily, minTarget (locked) */
    .tab {
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-carousel-tab-padding-block);
      padding-inline: var(--ds-carousel-tab-padding-inline);
      font-family: var(--ds-carousel-font-family);
      font-size: var(--ds-carousel-tab-font-size);
      font-weight: var(--ds-carousel-tab-font-weight);
      color: var(--color-foreground-muted);
      white-space: nowrap;
      transition: color var(--ds-carousel-transition) var(--motion-easing-standard);
    }

    /* tabSelectedColor (locked); tabIndicatorThickness (locked) drawn in dotActive inside the tab's box */
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

  /** Slides visible at once at the widest layout; one while the viewport is at or below `layout.maxWidth.prose`. */
  @property({ type: Number, reflect: true, attribute: 'per-view' }) accessor perView = 1;

  /** Next from the last slide returns to the first. */
  @property({ type: Boolean, reflect: true }) accessor loop = false;

  /** Rotate every `interval`; never under reduced motion. */
  @property({ type: Boolean, reflect: true }) accessor autoplay = false;

  /** Milliseconds between automatic advances; values below `minInterval` are raised to it. */
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
  /** False until the viewport is first measured; `perView` applies until then. */
  @state() private accessor measured = false;
  @state() private accessor viewportWide = true;
  @state() private accessor focusedPickerIndex: number | null = null;
  @state() private accessor slideCount = 0;
  @state() private accessor hovering = false;
  @state() private accessor focusWithin = false;
  @state() private accessor touching = false;
  /** Set by the pause button and by autoplay reaching the last slide without `loop`; cleared only by play. */
  @state() private accessor stopped = false;
  @state() private accessor reducedMotion = false;
  @state() private accessor announceText = '';

  @query('[data-part="viewport"]') private accessor viewportEl!: HTMLElement | null;

  private intersectionObserver: IntersectionObserver | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private reducedMotionQuery: MediaQueryList | undefined;
  private timer: number | undefined;
  private timerInterval: number | undefined;
  private settleTimeout: number | undefined;
  /** True after pointerdown, touchstart or wheel on the viewport: the next settled scroll is a swipe. */
  private userScroll = false;
  /** The first positioning is instant. */
  private positioned = false;
  /** A user-initiated change in controlled mode is announced once the new `activeIndex` arrives. */
  private announcePending = false;
  private warnedInterval = false;
  private readonly warnedSlides: WeakSet<Element> = new WeakSet();

  /** The current slide index, controlled or not. */
  get currentIndex(): number {
    return this.clamp(this.activeIndex ?? this.internalIndex);
  }

  private get isControlled(): boolean {
    return this.activeIndex !== undefined;
  }

  private get perViewInt(): number {
    return Math.max(1, Math.round(this.perView));
  }

  /** The page size: `perView` above the prose width, 1 at or below it; `perView` until measured. */
  private get page(): number {
    if (!this.measured) return this.perViewInt;
    return this.viewportWide ? this.perViewInt : 1;
  }

  /** The furthest index a page can start at. */
  private get lastStart(): number {
    return Math.max(0, this.slideCount - this.page);
  }

  /** Rotation is wanted: autoplay on, motion allowed, not stopped. */
  private get rotationOn(): boolean {
    return this.autoplay && !this.reducedMotion && !this.stopped;
  }

  /** Rotating right now: wanted and not paused by hover, focus or touch. */
  private get rotating(): boolean {
    return (
      this.rotationOn && !this.hovering && !this.focusWithin && !this.touching && this.slideCount > this.page
    );
  }

  private get prevTarget(): number | null {
    if (this.slideCount <= this.page) return null;
    const current = this.currentIndex;
    if (current <= 0) return this.loop ? this.lastStart : null;
    return Math.max(current - this.page, 0);
  }

  private get nextTarget(): number | null {
    if (this.slideCount <= this.page) return null;
    const current = this.currentIndex;
    if (current >= this.lastStart) return this.loop ? 0 : null;
    return Math.min(current + this.page, this.lastStart);
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
    if (this.hasUpdated) this.observe();
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
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.clearTimer();
    window.clearTimeout(this.settleTimeout);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else this.removeAttribute('aria-label');
    }
  }

  protected override firstUpdated(): void {
    this.syncSlides();
    this.observe();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('picker')) this.syncSlides();
    if (!this.positioned) {
      if (this.slideCount > 0) {
        this.positioned = true;
        if (this.currentIndex > 0) this.scrollToIndex(this.currentIndex, true);
      }
    } else if (changed.has('activeIndex') && this.activeIndex !== undefined) {
      this.scrollToIndex(this.currentIndex);
      if (this.announcePending) {
        this.announcePending = false;
        this.announce(this.currentIndex);
      }
      this.syncInert();
    }
    this.syncAutoplay();
    if (import.meta.env.DEV && this.autoplay && this.interval < MIN_INTERVAL && !this.warnedInterval) {
      this.warnedInterval = true;
      console.warn(`<ds-carousel> \`interval\` ${this.interval} is below ${MIN_INTERVAL} ms; raised to ${MIN_INTERVAL}.`, this);
    }
  }

  protected override render(): TemplateResult {
    const showPlay = this.autoplay && !this.reducedMotion;
    const prevTarget = this.prevTarget;
    const nextTarget = this.nextTarget;
    return html`
      <div class="frame ${showPlay ? '' : 'no-play'}">
        ${showPlay
          ? html`<span data-part="playButton" part="playButton" @click=${this.handlePlayWrapperClick}>
              <ds-button variant="secondary" label=${this.stopped ? COPY_PLAY : COPY_PAUSE} @press=${this.handlePlayPause}></ds-button>
            </span>`
          : nothing}
        <div class="prev" data-part="controlSurface" part="controlSurface">
          <span data-part="prevButton" part="prevButton" @click=${this.handlePrevWrapperClick}>
            <ds-button
              variant="secondary"
              icon-only
              label=${COPY_PREVIOUS}
              ?disabled=${prevTarget === null}
              @press=${this.handlePrev}
            >
              <ds-icon slot="leading-icon" name="chevron-left"></ds-icon>
            </ds-button>
          </span>
        </div>
        <div class="next" data-part="controlSurface" part="controlSurface">
          <span data-part="nextButton" part="nextButton" @click=${this.handleNextWrapperClick}>
            <ds-button
              variant="secondary"
              icon-only
              label=${COPY_NEXT}
              ?disabled=${nextTarget === null}
              @press=${this.handleNext}
            >
              <ds-icon slot="leading-icon" name="chevron-right"></ds-icon>
            </ds-button>
          </span>
        </div>
        ${this.picker === 'none' ? nothing : this.renderPicker()}
        <div
          data-part="viewport"
          part="viewport"
          @pointerdown=${this.armUserScroll}
          @touchstart=${this.armUserScroll}
          @wheel=${this.armUserScroll}
          @scroll=${this.handleScroll}
          @scrollend=${this.handleScrollEnd}
        >
          <div data-part="track" part="track" style="--ds-carousel-per-view: ${this.perViewInt}">
            <slot @slotchange=${this.handleSlotChange}></slot>
          </div>
        </div>
      </div>
      <div class="visually-hidden" data-part="liveRegion" part="liveRegion" aria-live=${this.rotating ? 'off' : 'polite'}>
        ${this.announceText}
      </div>
    `;
  }

  private renderPicker(): TemplateResult {
    const slides = this.slideElements();
    const current = this.currentIndex;
    const page = this.page;
    const roving = this.focusedPickerIndex ?? current;
    if (this.picker === 'tabs') {
      return html`
        <div
          data-part="picker"
          part="picker"
          role="tablist"
          aria-label=${COPY_PICKER_LABEL}
          @keydown=${this.handlePickerKeydown}
        >
          ${slides.map((slide, index) => {
            if (!slide.label) this.warnMissingSlideLabel(slide, index);
            return html`<button
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
              ${slide.label || COPY_GO_TO(index + 1)}
            </button>`;
          })}
        </div>
      `;
    }
    return html`
      <div
        data-part="picker"
        part="picker"
        role="group"
        aria-label=${COPY_PICKER_LABEL}
        @keydown=${this.handlePickerKeydown}
      >
        ${slides.map(
          (_slide, index) => html`<button
            type="button"
            class="dot"
            data-part="pickerItem"
            part="pickerItem"
            aria-label=${COPY_GO_TO(index + 1)}
            aria-current=${index >= current && index < current + page ? 'true' : nothing}
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
    if (!this.stopped) {
      this.stopped = true;
      return;
    }
    // Play clears the hover, focus and touch pauses so rotation resumes at once.
    this.stopped = false;
    this.hovering = false;
    this.focusWithin = false;
    this.touching = false;
    if (!this.loop && this.nextTarget === null && this.currentIndex > 0) this.moveTo(0, 'autoplay');
  };

  private readonly handlePrev = (event?: Event): void => {
    event?.stopPropagation();
    const target = this.prevTarget;
    if (target !== null) this.moveTo(target, 'prev');
  };

  private readonly handleNext = (event?: Event): void => {
    event?.stopPropagation();
    const target = this.nextTarget;
    if (target !== null) this.moveTo(target, 'next');
  };

  /** A click on a wrapper outside its Button passes through to the Button's action. */
  private readonly handlePrevWrapperClick = (event: Event): void => {
    if (event.target === event.currentTarget) this.handlePrev();
  };

  private readonly handleNextWrapperClick = (event: Event): void => {
    if (event.target === event.currentTarget) this.handleNext();
  };

  private readonly handlePlayWrapperClick = (event: Event): void => {
    if (event.target === event.currentTarget) this.handlePlayPause(event);
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

  private readonly handlePointerEnter = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') this.hovering = true;
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

  private readonly armUserScroll = (): void => {
    this.userScroll = true;
  };

  private readonly handleScroll = (): void => {
    if (!this.userScroll || SCROLLEND_SUPPORTED) return;
    window.clearTimeout(this.settleTimeout);
    this.settleTimeout = window.setTimeout(this.handleScrollEnd, SCROLL_SETTLE_FALLBACK);
  };

  /** A scroll the user started has settled: the first visible slide is the new index. */
  private readonly handleScrollEnd = (): void => {
    if (!this.userScroll) return;
    this.userScroll = false;
    const first = this.firstVisibleIndex();
    if (first === -1) return;
    if (this.clampToPage(first) === this.currentIndex) return;
    this.moveTo(first, 'swipe', false);
  };

  private readonly handleIntersect = (entries: IntersectionObserverEntry[]): void => {
    for (const entry of entries) {
      const hidden = !(entry.isIntersecting && entry.intersectionRatio >= VISIBLE_THRESHOLD);
      setHidden(entry.target, hidden);
    }
  };

  private readonly handleResize = (entries: ResizeObserverEntry[]): void => {
    const entry = entries[0];
    if (!entry) return;
    const width = entry.contentRect.width;
    const wide = width > this.proseBreakpoint();
    if (this.viewportWide !== wide) this.viewportWide = wide;
    if (!this.measured) this.measured = true;
  };

  /** layout.maxWidth.prose, read from the token; the built value when the token stylesheet is absent. */
  private proseBreakpoint(): number {
    const value = parseFloat(getComputedStyle(this).getPropertyValue('--layout-max-width-prose'));
    return Number.isFinite(value) ? value : PROSE_BREAKPOINT;
  }

  private firstVisibleIndex(): number {
    const viewport = this.viewportEl;
    if (!viewport) return -1;
    const bounds = viewport.getBoundingClientRect();
    return this.slideElements().findIndex((slide) => {
      const rect = slide.getBoundingClientRect();
      if (rect.width === 0) return false;
      const overlap = Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left);
      return overlap / rect.width >= VISIBLE_THRESHOLD;
    });
  }

  private clamp(index: number): number {
    return Math.min(Math.max(Math.round(index), 0), Math.max(0, this.slideCount - 1));
  }

  /** A target past the last page start becomes the last page start. */
  private clampToPage(index: number): number {
    return Math.min(this.clamp(index), this.lastStart);
  }

  /**
   * Requests slide `index`: dispatches `change`; uncontrolled, it also moves and (for a user change) announces.
   * Controlled, the element waits for `activeIndex` to change before it shows or announces anything, and a swipe the
   * parent does not accept scrolls back.
   */
  private moveTo(index: number, reason: CarouselChangeReason, scroll = true): void {
    if (this.slideCount === 0) return;
    const target = this.clampToPage(index);
    if (target === this.currentIndex) return;
    if (reason !== 'picker') this.focusedPickerIndex = null;
    const user = reason !== 'autoplay';
    const previous = this.activeIndex;
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
    if (this.isControlled) {
      void this.updateComplete.then(() => {
        if (this.activeIndex !== previous) return;
        this.announcePending = false;
        if (reason === 'swipe') this.scrollToIndex(this.currentIndex);
      });
    }
  }

  private announce(index: number): void {
    this.announceText = COPY_ANNOUNCE(index + 1, this.slideCount);
  }

  /** Scrolls the viewport itself (never scrollIntoView, which would also scroll the page); RTL-aware. */
  private scrollToIndex(index: number, instant = false): void {
    const slide = this.slideElements()[index];
    const viewport = this.viewportEl;
    if (!slide || !viewport) return;
    this.userScroll = false;
    const rtl = getComputedStyle(viewport).direction === 'rtl';
    const slideRect = slide.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const delta = rtl ? slideRect.right - viewportRect.right : slideRect.left - viewportRect.left;
    viewport.scrollTo({
      left: viewport.scrollLeft + delta,
      behavior: instant || this.reducedMotion ? 'instant' : 'smooth',
    });
  }

  private slideElements(): DsCarouselSlide[] {
    return Array.from(this.children).filter((el): el is DsCarouselSlide => el instanceof DsCarouselSlide);
  }

  /** Stamps each slide's role, roledescription, positional name and part. Every write compares first. */
  private syncSlides(): void {
    const slides = this.slideElements();
    const total = slides.length;
    const role = this.picker === 'tabs' ? 'tabpanel' : 'group';
    slides.forEach((slide, index) => {
      setAttr(slide, 'role', role);
      setAttr(slide, 'aria-roledescription', 'slide');
      setAttr(slide, 'aria-label', COPY_SLIDE_LABEL(index + 1, total));
      setAttr(slide, 'data-part', 'slide');
    });
    if (this.slideCount !== total) this.slideCount = total;
    this.syncInert();
  }

  /** Before the observer exists, the current page is the visible one. */
  private syncInert(): void {
    if (this.intersectionObserver) return;
    const first = Math.min(this.currentIndex, this.lastStart);
    this.slideElements().forEach((slide, index) => {
      setHidden(slide, index < first || index >= first + this.page);
    });
  }

  private observe(): void {
    const viewport = this.viewportEl;
    if (viewport && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver?.disconnect();
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(viewport);
    }
    this.observeSlides();
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
    if (!this.rotating) {
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
    // Without loop, reaching the last page counts as stopped: the control shows play and announcements return.
    if (!this.loop && target >= this.lastStart) this.stopped = true;
  };

  private warnMissingSlideLabel(slide: Element, index: number): void {
    if (!import.meta.env.DEV || this.warnedSlides.has(slide)) return;
    this.warnedSlides.add(slide);
    console.warn(`<ds-carousel> slide ${index + 1} has no \`label\`; the tab shows "${COPY_GO_TO(index + 1)}".`, slide);
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as CarouselOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) this.style.removeProperty(hook);
      else this.style.setProperty(hook, cssVar(ref));
    }
  }
}

function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

/** Slides outside the visible page get both `inert` and `aria-hidden="true"`. */
function setHidden(el: Element, hidden: boolean): void {
  if (el.hasAttribute('inert') !== hidden) el.toggleAttribute('inert', hidden);
  if (hidden) setAttr(el, 'aria-hidden', 'true');
  else if (el.hasAttribute('aria-hidden')) el.removeAttribute('aria-hidden');
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-carousel': DsCarousel;
    'ds-carousel-slide': DsCarouselSlide;
  }
}
