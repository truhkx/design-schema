import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type Context,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import './Carousel.css';

export type CarouselPicker = 'dots' | 'tabs' | 'none';
export type CarouselChangeReason = 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay';

/** Copy from the component doc, used verbatim. */
const COPY: {
  previous: string;
  next: string;
  play: string;
  pause: string;
  slideLabel: string;
  goTo: string;
  announce: string;
} = {
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic rotation',
  pause: 'Stop automatic rotation',
  slideLabel: '{n} of {total}',
  goTo: 'Go to slide {n}',
  announce: 'Slide {n} of {total}',
};

/** constants.minInterval: the floor `interval` is raised to, so autoplay never outpaces reading. */
const MIN_INTERVAL: number = 5000;
/** The share of a slide that must be visible for it to count as the current one. */
const VISIBLE_THRESHOLD: number = 0.6;
/** How long a programmatic scroll may take before the observer trusts what is visible again. */
const PROGRAMMATIC_SCROLL_GRACE: number = 1000;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'radius'
  | 'transition';

const OVERRIDE_HOOK: Record<CarouselOverridableBinding, string> = {
  slideGap: '--ds-carousel-slide-gap',
  controlOffset: '--ds-carousel-control-offset',
  controlShadow: '--ds-carousel-control-shadow',
  pickerGap: '--ds-carousel-picker-gap',
  pickerOffset: '--ds-carousel-picker-offset',
  dotSize: '--ds-carousel-dot-size',
  radius: '--ds-carousel-radius',
  transition: '--ds-carousel-transition',
};

function overridesToStyle(overrides: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as CarouselOverridableBinding[]) {
    // Locked bindings are not in the type; ignore them if they arrive anyway.
    if (!(binding in OVERRIDE_HOOK)) continue;
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

declare const process: { env: Record<string, string | undefined> };
const isDev: boolean = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function fill(template: string, params: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const list = window.matchMedia(REDUCED_MOTION_QUERY);
  list.addEventListener('change', onChange);
  return () => list.removeEventListener('change', onChange);
}

/** jsdom (and older browsers) have no `matchMedia`; that is "no preference". */
function getReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(REDUCED_MOTION_QUERY).matches
    : false;
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

/* ------------------------------------------------------------------------------------------------ */
/* CarouselSlide                                                                                     */
/* ------------------------------------------------------------------------------------------------ */

interface SlideContextValue {
  id: string;
  role: 'group' | 'tabpanel';
  label: string;
  hidden: boolean;
  register: (node: HTMLDivElement | null) => void;
}

const SlideContext: Context<SlideContextValue | null> = createContext<SlideContextValue | null>(null);

export interface CarouselSlideProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-label' | 'className' | 'style' | 'id'> {
  /**
   * The slide's name in the picker (tab text) and the announcement. A plain string, not read from
   * the rendered content; repeat it visibly as the slide's own heading.
   */
  label: string;
  /** The slide's content; a Card is the usual shape. */
  children: ReactNode;
}

/** One slide — a direct child of `Carousel`, one per slide, in order. */
export const CarouselSlide = function CarouselSlide({
  ref,
  label: _label,
  children,
  ...rest
}: CarouselSlideProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const slide = use(SlideContext);
  const setRefs = (node: HTMLDivElement | null): void => {
    slide?.register(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };
  return (
    <div
      {...rest}
      ref={setRefs}
      id={slide?.id}
      role={slide?.role ?? 'group'}
      aria-roledescription="slide"
      aria-label={slide?.label}
      aria-hidden={slide?.hidden ? 'true' : undefined}
      inert={slide?.hidden ?? false}
      data-ds="CarouselSlide"
      data-part="slide"
      className="ds-carousel__slide"
    >
      {children}
    </div>
  );
};

/** `Children.toArray` keeps fragments whole; slides written inside `<>…</>` are unwrapped here. */
function collectSlides(children: ReactNode): ReactElement<CarouselSlideProps>[] {
  const slides: ReactElement<CarouselSlideProps>[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      slides.push(...collectSlides((child.props as { children?: ReactNode }).children));
    } else {
      slides.push(child as ReactElement<CarouselSlideProps>);
    }
  });
  return slides;
}

/* ------------------------------------------------------------------------------------------------ */
/* Carousel                                                                                          */
/* ------------------------------------------------------------------------------------------------ */

export interface CarouselProps
  extends Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'aria-label' | 'onChange' | 'role' | 'className' | 'style'> {
  /** What the carousel shows ("Featured products", "Customer stories"). */
  label: string;
  /** One `CarouselSlide` per slide. A slide is any content; a Card is the usual shape. Slides should be equal height. */
  children: ReactNode;
  /**
   * How many slides are visible at once at the widest layout; fewer are shown as the viewport
   * narrows (one below the prose width).
   */
  perView?: number | undefined;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean | undefined;
  /**
   * Rotate automatically every `interval`. Starts only when the user has not asked for reduced
   * motion; stops on hover, focus, touch, or the play/pause button; never restarts on its own
   * after the user pauses it.
   */
  autoplay?: boolean | undefined;
  /**
   * Milliseconds between automatic advances; values below 5000 are raised to 5000 on every
   * platform (with a development warning).
   */
  interval?: number | undefined;
  /**
   * How slides are chosen directly: small dot buttons, tabs with each slide's label (for few,
   * meaningful slides), or none (arrows only).
   */
  picker?: CarouselPicker | undefined;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number | undefined;
  /** Swiping or scrolling snaps to slide boundaries. */
  snap?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when the current slide changes, with the new index and the reason (`next`, `prev`,
   * `picker`, `swipe`, `autoplay`).
   */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
}

/**
 * Carousel — Design Schema, category: container.
 *
 * When to use:
 * Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid —
 * featured products with images, testimonials, a gallery — where paging is a reasonable way to
 * see them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots`
 * for images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even
 * then keep the pause control visible.
 */
export const Carousel = function Carousel({
  ref,
  label,
  children,
  perView = 1,
  loop = false,
  autoplay = false,
  interval = 6000,
  picker = 'dots',
  activeIndex,
  snap = true,
  overrides,
  onChange,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...rest
}: CarouselProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const baseId = `ds-carousel${useId()}`;
  const slides = collectSlides(children);
  const total = slides.length;

  // perView is an integer; below the prose width the CSS collapses it to one, and the measured
  // value (from the rendered slide width) drives paging so the arrows match what is visible.
  const requestedPerView = Math.max(1, Math.floor(perView));
  const [measuredPerView, setMeasuredPerView] = useState<number | null>(null);
  const pageSize = Math.min(measuredPerView ?? requestedPerView, Math.max(total, 1));
  const lastStart = Math.max(total - pageSize, 0);

  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const rawIndex = isControlled ? Math.floor(activeIndex) : internalIndex;
  const current = total === 0 ? 0 : Math.min(Math.max(rawIndex, 0), total - 1);
  const visibleStart = Math.min(current, lastStart);

  const reducedMotion = useReducedMotion();
  const effectiveInterval = Math.max(interval, MIN_INTERVAL);
  // stopped: the user pressed pause; only play clears it. The interruptions last as long as the
  // hover, focus or touch does.
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const canRotate = autoplay && !reducedMotion;
  const rotating = canRotate && !stopped && !hovered && !focused && !touched;

  const [announcement, setAnnouncement] = useState('');

  const rootRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideNodes = useRef<Array<HTMLDivElement | null>>([]);
  const pickerNodes = useRef<Array<HTMLButtonElement | null>>([]);
  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const programmaticTarget = useRef<number | null>(null);
  const lastScrolledTo = useRef<number | null>(null);
  const lastReason = useRef<CarouselChangeReason | null>(null);
  const warnedInterval = useRef(false);

  useEffect(() => {
    if (isDev && interval < MIN_INTERVAL && !warnedInterval.current) {
      warnedInterval.current = true;
      console.warn(`Carousel: \`interval\` ${interval}ms is below the ${MIN_INTERVAL}ms minimum; using ${MIN_INTERVAL}ms.`);
    }
  }, [interval]);

  const goTo = (index: number, reason: CarouselChangeReason): void => {
    if (total === 0) return;
    const next = Math.min(Math.max(index, 0), total - 1);
    if (next === current) return;
    lastReason.current = reason;
    if (!isControlled) setInternalIndex(next);
    onChange?.(next, reason);
    // Changes the user made are announced; automatic ones are not (WCAG 4.1.3, APG carousel).
    if (reason !== 'autoplay') setAnnouncement(fill(COPY.announce, { n: next + 1, total }));
  };

  // The observer and timers read the latest render through this ref rather than re-subscribing.
  const latest = useRef({ goTo, current, pageSize, lastStart });
  latest.current = { goTo, current, pageSize, lastStart };

  const nextIndex = (from: number): number => (loop && from >= lastStart ? 0 : Math.min(from + pageSize, lastStart));
  const prevIndex = (from: number): number => (loop && from <= 0 ? lastStart : Math.max(Math.min(from, lastStart) - pageSize, 0));

  const prevDisabled = total <= pageSize || (!loop && visibleStart <= 0);
  const nextDisabled = total <= pageSize || (!loop && current >= lastStart);

  const handlePrev = (): void => goTo(prevIndex(current), 'prev');
  const handleNext = (): void => goTo(nextIndex(current), 'next');

  // The part wrappers extend the pointer target; a click on the wrapper itself activates its Button.
  const forwardClick =
    (buttonRef: { current: HTMLButtonElement | null }) =>
    (event: ReactMouseEvent<HTMLSpanElement>): void => {
      const button = buttonRef.current;
      if (!button || button.contains(event.target as Node)) return;
      button.click();
    };

  const togglePlay = (): void => {
    if (stopped) {
      // Play is an explicit request: it overrides the focus that pressing it just moved here.
      setStopped(false);
      setHovered(false);
      setFocused(false);
      setTouched(false);
    } else {
      setStopped(true);
    }
  };

  // Keyboard on the picker: ArrowRight/ArrowLeft/Home/End, wrapping as Tabs does.
  const handlePickerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (total === 0) return;
    let target: number;
    switch (event.key) {
      case 'ArrowRight':
        target = (current + 1) % total;
        break;
      case 'ArrowLeft':
        target = (current - 1 + total) % total;
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
    goTo(target, 'picker');
    pickerNodes.current[target]?.focus();
  };

  // Autoplay: one timeout per current slide, so each wait is a full interval after the last change.
  // Without loop it stops at the last page instead of wrapping.
  useEffect(() => {
    if (!rotating || total <= pageSize) return undefined;
    if (!loop && current >= lastStart) return undefined;
    const id = window.setTimeout(() => {
      const { goTo: move, current: from, lastStart: end, pageSize: size } = latest.current;
      move(loop && from >= end ? 0 : Math.min(from + size, end), 'autoplay');
    }, effectiveInterval);
    return () => window.clearTimeout(id);
  }, [rotating, effectiveInterval, current, loop, total, pageSize, lastStart]);

  // Bring the current slide to the viewport's inline start. The viewport is scrolled directly
  // (not scrollIntoView) so the page itself never jumps, including on mount and during autoplay.
  useEffect(() => {
    const viewport = viewportRef.current;
    const slide = slideNodes.current[visibleStart];
    if (!viewport || !slide) return undefined;
    if (lastReason.current === 'swipe') {
      // The user already scrolled it there.
      lastReason.current = null;
      lastScrolledTo.current = visibleStart;
      return undefined;
    }
    if (lastScrolledTo.current === visibleStart) return undefined;
    const isFirstScroll = lastScrolledTo.current === null;
    lastScrolledTo.current = visibleStart;
    if (typeof viewport.scrollBy !== 'function') return undefined;
    const viewportRect = viewport.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const rtl = getComputedStyle(viewport).direction === 'rtl';
    const delta = rtl ? slideRect.right - viewportRect.right : slideRect.left - viewportRect.left;
    if (delta === 0) return undefined;
    programmaticTarget.current = visibleStart;
    viewport.scrollBy({ left: delta, behavior: reducedMotion || isFirstScroll ? 'instant' : 'smooth' });
    const timeout = window.setTimeout(() => {
      programmaticTarget.current = null;
    }, PROGRAMMATIC_SCROLL_GRACE);
    return () => {
      window.clearTimeout(timeout);
      programmaticTarget.current = null;
    };
  }, [visibleStart, reducedMotion]);

  // Swipe and trackpad scrolling: the first slide at least 60% visible becomes current. The ratio
  // table is kept across callbacks (each only reports the entries that changed), and a change is
  // reported only when it differs from the current index, so the initial notification converges.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === 'undefined') return undefined;
    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
        const first = slideNodes.current.findIndex((node) => node !== null && (ratios.get(node) ?? 0) >= VISIBLE_THRESHOLD);
        if (first === -1) return;
        if (programmaticTarget.current !== null) {
          if (first === programmaticTarget.current) programmaticTarget.current = null;
          return;
        }
        const { goTo: move, current: from, lastStart: end } = latest.current;
        if (first !== Math.min(from, end)) move(first, 'swipe');
      },
      { root: viewport, threshold: VISIBLE_THRESHOLD },
    );
    for (const node of slideNodes.current) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [total]);

  // Measure how many slides the layout actually shows (perView collapses below the prose width).
  // ResizeObserver delivers once on observe(); state is set only when the count changes.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || typeof ResizeObserver === 'undefined') return undefined;
    let lastWidth = -1;
    const observer = new ResizeObserver(() => {
      const width = viewport.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      const slide = slideNodes.current[0];
      if (!slide || width === 0 || slide.offsetWidth === 0) return;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const count = Math.max(1, Math.round((width + gap) / (slide.offsetWidth + gap)));
      setMeasuredPerView((previous) => (previous === count ? previous : count));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [total, requestedPerView]);

  const setRootRef = (node: HTMLElement | null): void => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleBlur = (event: ReactFocusEvent<HTMLElement>): void => {
    onBlur?.(event);
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  const classes = ['ds-carousel', snap ? null : 'ds-carousel--no-snap'].filter(Boolean).join(' ');
  const rootStyle = {
    '--ds-carousel-per-view': requestedPerView,
    ...(overrides ? overridesToStyle(overrides) : null),
  } as CSSProperties;

  const pickerItemId = (index: number): string => `${baseId}-picker-${index}`;
  const slideId = (index: number): string => `${baseId}-slide-${index}`;

  return (
    <section
      {...rest}
      ref={setRootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-ds="Carousel"
      data-part="region"
      className={classes}
      style={rootStyle}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType !== 'touch') setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        setFocused(true);
      }}
      onBlur={handleBlur}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        setTouched(true);
      }}
      onTouchEnd={(event) => {
        onTouchEnd?.(event);
        setTouched(false);
      }}
      onTouchCancel={(event) => {
        onTouchCancel?.(event);
        setTouched(false);
      }}
    >
      {canRotate ? (
        <span className="ds-carousel__play" data-part="playButton">
          <Button variant="secondary" label={stopped ? COPY.play : COPY.pause} onClick={togglePlay} />
        </span>
      ) : null}
      <div className="ds-carousel__stage">
        <span className="ds-carousel__control-surface ds-carousel__control-surface--prev" data-part="controlSurface">
          <span className="ds-carousel__control" data-part="prevButton" onClick={forwardClick(prevButtonRef)}>
            <Button
              ref={prevButtonRef}
              variant="secondary"
              iconOnly
              label={COPY.previous}
              leadingIcon={<Icon name="chevron-left" inline />}
              disabled={prevDisabled}
              aria-controls={`${baseId}-track`}
              onClick={handlePrev}
            />
          </span>
        </span>
        <span className="ds-carousel__control-surface ds-carousel__control-surface--next" data-part="controlSurface">
          <span className="ds-carousel__control" data-part="nextButton" onClick={forwardClick(nextButtonRef)}>
            <Button
              ref={nextButtonRef}
              variant="secondary"
              iconOnly
              label={COPY.next}
              leadingIcon={<Icon name="chevron-right" inline />}
              disabled={nextDisabled}
              aria-controls={`${baseId}-track`}
              onClick={handleNext}
            />
          </span>
        </span>
        {picker === 'dots' ? (
          <div role="group" aria-label={label} className="ds-carousel__picker" data-part="picker" onKeyDown={handlePickerKeyDown}>
            {slides.map((slide, index) => {
              const selected = index === current;
              return (
                <button
                  key={slide.key ?? index}
                  ref={(node) => {
                    pickerNodes.current[index] = node;
                  }}
                  type="button"
                  id={pickerItemId(index)}
                  aria-label={fill(COPY.goTo, { n: index + 1 })}
                  aria-current={selected ? 'true' : undefined}
                  aria-controls={slideId(index)}
                  tabIndex={selected ? 0 : -1}
                  className="ds-carousel__dot"
                  data-part="pickerItem"
                  onClick={() => goTo(index, 'picker')}
                >
                  <span className="ds-carousel__dot-mark" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        ) : null}
        {picker === 'tabs' ? (
          <div role="tablist" aria-label={label} className="ds-carousel__picker" data-part="picker" onKeyDown={handlePickerKeyDown}>
            {slides.map((slide, index) => {
              const selected = index === current;
              return (
                <button
                  key={slide.key ?? index}
                  ref={(node) => {
                    pickerNodes.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={pickerItemId(index)}
                  aria-selected={selected ? 'true' : 'false'}
                  aria-controls={slideId(index)}
                  tabIndex={selected ? 0 : -1}
                  className="ds-carousel__tab"
                  data-part="pickerItem"
                  onClick={() => goTo(index, 'picker')}
                >
                  {slide.props.label}
                </button>
              );
            })}
          </div>
        ) : null}
        <div ref={viewportRef} className="ds-carousel__viewport" data-part="viewport">
          <div ref={trackRef} id={`${baseId}-track`} className="ds-carousel__track" data-part="track">
            {slides.map((slide, index) => (
              <SlideContext
                key={slide.key ?? index}
                value={{
                  id: slideId(index),
                  role: picker === 'tabs' ? 'tabpanel' : 'group',
                  label: fill(COPY.slideLabel, { n: index + 1, total }),
                  hidden: index < visibleStart || index >= visibleStart + pageSize,
                  register: (node) => {
                    slideNodes.current[index] = node;
                  },
                }}
              >
                {slide}
              </SlideContext>
            ))}
          </div>
        </div>
      </div>
      <div className="ds-carousel__live" data-part="liveRegion" aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">
        {announcement}
      </div>
    </section>
  );
};
