import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import './Carousel.css';

export type CarouselPicker = 'dots' | 'tabs' | 'none';
export type CarouselChangeReason = 'next' | 'prev' | 'picker' | 'swipe' | 'autoplay';

const COPY = {
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic rotation',
  pause: 'Stop automatic rotation',
  slideLabel: '{n} of {total}',
  goTo: 'Go to slide {n}',
  announce: 'Slide {n} of {total}',
};

const MIN_INTERVAL = 5000;
const VISIBLE_THRESHOLD = 0.6;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

const OVERRIDE_HOOK: Record<CarouselOverridableBinding, string> = {
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

function overridesToStyle(overrides: Partial<Record<CarouselOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as CarouselOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

function clampIndex(index: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

/** Whether `index` is one of the `perView` slides starting at `current` (wrapping when `loop`). */
function isSlideVisible(index: number, current: number, perView: number, total: number, loop: boolean): boolean {
  if (total === 0) return false;
  const span = Math.min(Math.max(perView, 1), total);
  for (let offset = 0; offset < span; offset++) {
    let candidate = current + offset;
    if (loop) candidate = ((candidate % total) + total) % total;
    else if (candidate >= total) break;
    if (candidate === index) return true;
  }
  return false;
}

export interface CarouselSlideProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Short name for this slide ("Plans", "Pricing"), shown as its tab text when `picker: tabs`.
   * Falls back to the slide's position when omitted.
   */
  label?: string;
  children: ReactNode;
}

/** One slide's content — a direct child of `Carousel`, one per slide, in the same order. */
export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide(
  { label: _label, children, className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      data-ds="CarouselSlide"
      data-part="slide"
      className={['ds-carousel__slide', className ?? null].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
});

export interface CarouselProps
  extends Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'aria-label' | 'onChange' | 'role'> {
  /** What the carousel shows ("Featured products", "Customer stories"). */
  label: string;
  /** One `CarouselSlide` per slide. A slide is any content; a Card is the usual shape. Slides should be equal height. */
  children: ReactNode;
  /**
   * How many slides are visible at once at the widest layout; fewer are shown as the viewport
   * narrows (one below the prose width).
   */
  perView?: number;
  /** Next from the last returns to the first. Off by default so users can tell where the end is. */
  loop?: boolean;
  /**
   * Rotate automatically every `interval`. Starts only when the user has not asked for reduced
   * motion; stops on hover, focus, touch, or the play/pause button; never restarts on its own
   * after the user pauses it.
   */
  autoplay?: boolean;
  /** Milliseconds between automatic advances. Below 5000 is refused in development. */
  interval?: number;
  /**
   * How slides are chosen directly: small dot buttons, tabs with each slide's label (for few,
   * meaningful slides), or none (arrows only).
   */
  picker?: CarouselPicker;
  /** Controlled current slide (zero-based). Omit for uncontrolled. */
  activeIndex?: number;
  /** Swiping or scrolling snaps to slide boundaries. */
  snap?: boolean;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CarouselOverridableBinding, TokenRef>>;
  /** Fired when the current slide changes, with the new index and the reason. */
  onChange?: (index: number, reason: CarouselChangeReason) => void;
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
export const Carousel = forwardRef<HTMLElement, CarouselProps>(function Carousel(
  {
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
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const baseId = `ds-carousel${generatedId}`;

  const slideElements = Children.toArray(children).filter(isValidElement) as ReactElement<
    CarouselSlideProps & RefAttributes<HTMLDivElement>
  >[];
  const total = slideElements.length;

  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const current = clampIndex(isControlled ? (activeIndex as number) : internalIndex, total);

  const [playing, setPlaying] = useState(() => autoplay && !prefersReducedMotion());
  const [announcement, setAnnouncement] = useState('');

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pickerRefs = useRef(new Map<number, HTMLButtonElement>());
  const suppressObserverRef = useRef(false);
  const lastReasonRef = useRef<CarouselChangeReason>('picker');

  if (isDev && !label) {
    console.warn('Carousel: `label` is required and becomes the region’s accessible name.');
  }
  if (isDev && interval < MIN_INTERVAL) {
    console.warn(`Carousel: \`interval\` below ${MIN_INTERVAL}ms is not allowed; using ${MIN_INTERVAL}ms.`);
  }
  const effectiveInterval = Math.max(interval, MIN_INTERVAL);

  const goTo = (index: number, reason: CarouselChangeReason) => {
    const clamped = clampIndex(index, total);
    lastReasonRef.current = reason;
    if (!isControlled) setInternalIndex(clamped);
    if (clamped !== current) {
      onChange?.(clamped, reason);
      if (reason !== 'autoplay') {
        setAnnouncement(COPY.announce.replace('{n}', String(clamped + 1)).replace('{total}', String(total)));
      }
    }
  };

  const handlePrev = () => {
    if (total === 0) return;
    goTo(loop ? (current - 1 + total) % total : Math.max(current - 1, 0), 'prev');
  };

  const handleNext = () => {
    if (total === 0) return;
    goTo(loop ? (current + 1) % total : Math.min(current + 1, total - 1), 'next');
  };

  const togglePlay = () => setPlaying((wasPlaying) => !wasPlaying);
  const pauseForInteraction = () => setPlaying(false);

  const handlePickerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (total === 0) return;
    const moveTo = (index: number) => {
      goTo(index, 'picker');
      pickerRefs.current.get(index)?.focus();
    };
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveTo((current + 1) % total);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveTo((current - 1 + total) % total);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(total - 1);
        break;
      default:
        break;
    }
  };

  const setPickerRef = (index: number) => (el: HTMLButtonElement | null) => {
    if (el) pickerRefs.current.set(index, el);
    else pickerRefs.current.delete(index);
  };

  // Autoplay: one timer per current slide, so the wait is always a full `interval` after the last
  // change (user-driven or automatic). Never started under reduced motion or while paused.
  useEffect(() => {
    if (!autoplay || !playing || total <= 1) return undefined;
    const id = window.setInterval(() => {
      goTo(loop ? (current + 1) % total : current + 1 >= total ? 0 : current + 1, 'autoplay');
    }, effectiveInterval);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, playing, effectiveInterval, current, loop, total]);

  // Scroll the newly-current slide into view, unless it just became current because the user
  // scrolled it there themselves (the 'swipe' reason from the IntersectionObserver below).
  useEffect(() => {
    if (lastReasonRef.current === 'swipe') return undefined;
    const node = slideRefs.current[current];
    if (!node || typeof node.scrollIntoView !== 'function') return undefined;
    suppressObserverRef.current = true;
    node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
    const timeout = window.setTimeout(() => {
      suppressObserverRef.current = false;
    }, 500);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Tracks the visible slide as the user swipes or scrolls the viewport natively.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return;
        let bestIndex = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const index = slideRefs.current.findIndex((node) => node === entry.target);
          if (index !== -1 && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        });
        if (bestIndex !== -1 && bestRatio >= VISIBLE_THRESHOLD && bestIndex !== current) {
          goTo(bestIndex, 'swipe');
        }
      },
      { root: viewport, threshold: VISIBLE_THRESHOLD },
    );
    slideRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, current]);

  // Off-screen slides are not tab stops and are not announced; `inert` has no React JSX prop
  // (only a DOM property), so it is set imperatively here.
  useLayoutEffect(() => {
    slideRefs.current.forEach((node, index) => {
      if (node) node.inert = !isSlideVisible(index, current, perView, total, loop);
    });
  });

  const classes = ['ds-carousel', snap ? null : 'ds-carousel--no-snap', className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const perViewStyle = { '--ds-carousel-per-view': perView } as CSSProperties;
  const mergedStyle = { ...perViewStyle, ...overrideStyle, ...style };

  const prevDisabled = total === 0 || (!loop && current === 0);
  const nextDisabled = total === 0 || (!loop && current === total - 1);

  return (
    <section
      {...rest}
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-ds="Carousel"
      className={classes}
      style={mergedStyle}
      onMouseEnter={pauseForInteraction}
      onFocus={pauseForInteraction}
      onTouchStart={pauseForInteraction}
    >
      {autoplay ? (
        <Button
          variant="secondary"
          label={playing ? COPY.pause : COPY.play}
          data-part="playButton"
          onClick={togglePlay}
        />
      ) : null}
      <div className="ds-carousel__stage">
        <span className="ds-carousel__control ds-carousel__control--prev" data-part="prevButton">
          <Button
            variant="secondary"
            iconOnly
            label={COPY.previous}
            leadingIcon={<Icon name="chevron-left" inline />}
            disabled={prevDisabled}
            onClick={handlePrev}
          />
        </span>
        <span className="ds-carousel__control ds-carousel__control--next" data-part="nextButton">
          <Button
            variant="secondary"
            iconOnly
            label={COPY.next}
            leadingIcon={<Icon name="chevron-right" inline />}
            disabled={nextDisabled}
            onClick={handleNext}
          />
        </span>
        {picker === 'tabs' ? (
          <div
            role="tablist"
            aria-label={label}
            className="ds-carousel__picker"
            data-part="picker"
            onKeyDown={handlePickerKeyDown}
          >
            {slideElements.map((slideElement, index) => {
              const isSelected = index === current;
              return (
                <button
                  key={slideElement.key ?? index}
                  ref={setPickerRef(index)}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${index}`}
                  aria-selected={isSelected ? 'true' : 'false'}
                  aria-controls={`${baseId}-slide-${index}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={['ds-carousel__tab', isSelected ? 'ds-carousel__tab--selected' : null]
                    .filter(Boolean)
                    .join(' ')}
                  data-part="pickerItem"
                  onClick={() => goTo(index, 'picker')}
                >
                  {slideElement.props.label ?? String(index + 1)}
                </button>
              );
            })}
          </div>
        ) : null}
        {picker === 'dots' ? (
          <div
            role="group"
            aria-label={label}
            className="ds-carousel__picker"
            data-part="picker"
            onKeyDown={handlePickerKeyDown}
          >
            {slideElements.map((slideElement, index) => {
              const isSelected = index === current;
              return (
                <span key={slideElement.key ?? index} className="ds-carousel__pickerItemWrap">
                  <Button
                    ref={setPickerRef(index)}
                    variant="ghost"
                    iconOnly
                    label={COPY.goTo.replace('{n}', String(index + 1))}
                    aria-current={isSelected ? 'true' : undefined}
                    tabIndex={isSelected ? 0 : -1}
                    leadingIcon={
                      <span
                        aria-hidden="true"
                        className={['ds-carousel__dot', isSelected ? 'ds-carousel__dot--active' : null]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    }
                    data-part="pickerItem"
                    onClick={() => goTo(index, 'picker')}
                  />
                </span>
              );
            })}
          </div>
        ) : null}
        <div ref={viewportRef} className="ds-carousel__viewport" data-part="viewport">
          <div className="ds-carousel__track" data-part="track">
            {slideElements.map((slideElement, index) =>
              cloneElement(slideElement, {
                key: slideElement.key ?? index,
                ref: (node: HTMLDivElement | null) => {
                  slideRefs.current[index] = node;
                },
                id: `${baseId}-slide-${index}`,
                role: 'group',
                'aria-roledescription': 'slide',
                'aria-label': COPY.slideLabel.replace('{n}', String(index + 1)).replace('{total}', String(total)),
                'aria-hidden': isSlideVisible(index, current, perView, total, loop) ? undefined : true,
              }),
            )}
          </div>
        </div>
      </div>
      <div className="ds-carousel__visually-hidden" data-part="liveRegion" role="status" aria-live={playing ? 'off' : 'polite'}>
        {announcement}
      </div>
    </section>
  );
});
