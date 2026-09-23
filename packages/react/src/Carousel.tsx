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
  pickerLabel: string;
  goTo: string;
  announce: string;
} = {
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic rotation',
  pause: 'Stop automatic rotation',
  slideLabel: '{n} of {total}',
  pickerLabel: 'Choose a slide',
  goTo: 'Go to slide {n}',
  announce: 'Slide {n} of {total}',
};

/** constants.minInterval: the floor `interval` is raised to, so autoplay never outpaces reading. */
const MIN_INTERVAL: number = 5000;
/** The share of a slide that must be visible for it to count as visible. */
const VISIBLE_THRESHOLD: number = 0.6;
/** layout.maxWidth.prose, read from the token at measurement time rather than its value today. */
const PROSE_WIDTH_VAR = '--layout-max-width-prose';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CarouselOverridableBinding =
  | 'slideGap'
  | 'controlOffset'
  | 'controlRadius'
  | 'controlShadow'
  | 'pickerGap'
  | 'pickerOffset'
  | 'dotSize'
  | 'dotRadius'
  | 'radius'
  | 'tabFontSize'
  | 'tabFontWeight'
  | 'tabLineHeight'
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'fontFamily'
  | 'transition';

const OVERRIDE_HOOK: Record<CarouselOverridableBinding, string> = {
  slideGap: '--ds-carousel-slide-gap',
  controlOffset: '--ds-carousel-control-offset',
  controlRadius: '--ds-carousel-control-radius',
  controlShadow: '--ds-carousel-control-shadow',
  pickerGap: '--ds-carousel-picker-gap',
  pickerOffset: '--ds-carousel-picker-offset',
  dotSize: '--ds-carousel-dot-size',
  dotRadius: '--ds-carousel-dot-radius',
  radius: '--ds-carousel-radius',
  tabFontSize: '--ds-carousel-tab-font-size',
  tabFontWeight: '--ds-carousel-tab-font-weight',
  tabLineHeight: '--ds-carousel-tab-line-height',
  tabPaddingBlock: '--ds-carousel-tab-padding-block',
  tabPaddingInline: '--ds-carousel-tab-padding-inline',
  fontFamily: '--ds-carousel-font-family',
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

/** Resolves a length custom property to pixels (px or rem); null when it cannot be read. */
function readLengthVar(element: Element, name: string): number | null {
  const raw = getComputedStyle(element).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  if (raw.endsWith('rem')) {
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(rootSize) ? value * rootSize : null;
  }
  return raw.endsWith('px') || /^[\d.]+$/.test(raw) ? value : null;
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
  extends Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'aria-label' | 'className' | 'style' | 'id' | 'children'> {
  /**
   * The slide's name in the tabs picker. A plain string, not read from the rendered content; repeat
   * it visibly as the slide's own heading.
   */
  label: string;
  /** The slide's content; a Card is the usual shape. */
  children: ReactNode;
}

/** One slide — a direct child of `Carousel`, one per slide, in order. */
export function CarouselSlide({
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
}

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
   * How many slides are visible at once at the widest layout. The page size is `perView` while the
   * viewport's own width is above `layout.maxWidth.prose` and 1 at or below it.
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
   * Milliseconds between automatic advances; values below 5000 are raised to 5000 in every build,
   * with a development warning once ever per instance (a later invalid value does not warn again),
   * and only while `autoplay` is on.
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
   * `picker`, `swipe`, `autoplay`). A change of a controlled `activeIndex` never fires it.
   */
  onChange?: ((index: number, reason: CarouselChangeReason) => void) | undefined;
}

/**
 * Carousel — Design Schema, category: container.
 *
 * When to use:
 * Use a Carousel for a small set (three to eight) of peer items too rich to show as a grid —
 * featured products with images, testimonials, a gallery — where paging is a reasonable way to see
 * them all. Use `picker: tabs` when slides have meaningful names ("Plans", "Pricing"); `dots` for
 * images. Leave `autoplay` off unless the content is ambient (a hero of photographs) and even then
 * keep the pause control visible.
 */
export function Carousel({
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

  // perView applies until the viewport is first measured; at or below the prose width the page is one.
  const requestedPerView = Math.max(1, Math.floor(perView));
  const [narrow, setNarrow] = useState<boolean | null>(null);
  const pageSize = Math.min(narrow ? 1 : requestedPerView, Math.max(total, 1));
  const lastStart = Math.max(total - pageSize, 0);

  // The current index is the first visible slide, so it never passes total − page.
  const isControlled = activeIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const rawIndex = isControlled ? Math.floor(activeIndex) : internalIndex;
  const current = Math.min(Math.max(rawIndex, 0), lastStart);

  const reducedMotion = useReducedMotion();
  const effectiveInterval = Math.max(interval, MIN_INTERVAL);
  // stopped: the user pressed pause; only play clears it. The interruptions last as long as the
  // hover, focus or touch does. Reaching the end without loop also counts as stopped.
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const canRotate = autoplay && !reducedMotion;
  const atEnd = total <= pageSize || (!loop && current >= lastStart);
  const playing = canRotate && !stopped && !atEnd;
  const rotating = playing && !hovered && !focused && !touched;

  const [announcement, setAnnouncement] = useState('');
  const [pickerFocus, setPickerFocus] = useState<number | null>(null);
  // Bumped after a swipe so a controlled parent that keeps activeIndex gets scrolled back.
  const [swipeTick, setSwipeTick] = useState(0);

  const rootRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideNodes = useRef<Array<HTMLDivElement | null>>([]);
  const pickerNodes = useRef<Array<HTMLButtonElement | null>>([]);
  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const playButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastScrolledTo = useRef<number | null>(null);
  const userScroll = useRef(false);
  const firstVisible = useRef<number | null>(null);
  const warnedInterval = useRef(false);
  const warnedLabel = useRef(false);

  useEffect(() => {
    if (isDev && autoplay && interval < MIN_INTERVAL && !warnedInterval.current) {
      warnedInterval.current = true;
      console.warn(`Carousel: \`interval\` ${interval}ms is below the ${MIN_INTERVAL}ms minimum; using ${MIN_INTERVAL}ms.`);
    }
  }, [autoplay, interval]);

  const missingLabel = picker === 'tabs' && slides.some((slide) => !slide.props.label);
  useEffect(() => {
    if (isDev && missingLabel && !warnedLabel.current) {
      warnedLabel.current = true;
      console.warn('Carousel: every CarouselSlide needs a `label`; the tab falls back to "Go to slide {n}".');
    }
  }, [missingLabel]);

  const goTo = (index: number, reason: CarouselChangeReason): void => {
    if (total === 0) return;
    const next = Math.min(Math.max(index, 0), lastStart);
    if (next === current) return;
    if (!isControlled) setInternalIndex(next);
    onChange?.(next, reason);
    // Changes the user made are announced; automatic ones are not (WCAG 4.1.3, APG carousel).
    if (reason !== 'autoplay') setAnnouncement(fill(COPY.announce, { n: next + 1, total }));
  };

  // Observers and timers read the latest render through this ref rather than re-subscribing.
  const latest = useRef({ goTo, current, lastStart });
  latest.current = { goTo, current, lastStart };

  const prevDisabled = total <= pageSize || (!loop && current <= 0);
  const nextDisabled = total <= pageSize || (!loop && current >= lastStart);

  const handleNext = (): void => {
    if (nextDisabled) return;
    goTo(current >= lastStart ? 0 : Math.min(current + pageSize, lastStart), 'next');
  };
  const handlePrev = (): void => {
    if (prevDisabled) return;
    goTo(current <= 0 ? lastStart : Math.max(current - pageSize, 0), 'prev');
  };

  // The part wrappers pass a click on themselves through to their Button.
  const forwardClick =
    (buttonRef: { current: HTMLButtonElement | null }) =>
    (event: ReactMouseEvent<HTMLSpanElement>): void => {
      const button = buttonRef.current;
      if (!button || button.contains(event.target as Node)) return;
      button.click();
    };

  const togglePlay = (): void => {
    if (playing) {
      setStopped(true);
      return;
    }
    // Play is an explicit request: it clears the hover/focus/touch pauses, so rotation resumes at once.
    setStopped(false);
    setHovered(false);
    setFocused(false);
    setTouched(false);
    // Stopped at the end without loop: play restarts rotation from the first slide.
    if (!loop && total > pageSize && current >= lastStart) goTo(0, 'autoplay');
  };

  // Picker keys move one slide (not one page), wrapping as Tabs does; focus and selection move together.
  const handlePickerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (total === 0) return;
    const from = pickerFocus ?? current;
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
    goTo(target, 'picker');
    setPickerFocus(target);
    pickerNodes.current[target]?.focus();
  };

  // Autoplay: one timeout per current slide, so each wait is a full interval after the last change.
  useEffect(() => {
    if (!rotating) return undefined;
    const id = window.setTimeout(() => {
      const { goTo: move, current: from, lastStart: end } = latest.current;
      move(from >= end ? 0 : Math.min(from + pageSize, end), 'autoplay');
    }, effectiveInterval);
    return () => window.clearTimeout(id);
  }, [rotating, effectiveInterval, current, pageSize]);

  // Bring the current slide to the viewport's inline start by scrolling the viewport itself (never
  // scrollIntoView, which would also scroll the page). Instant the first time and under reduced motion.
  useEffect(() => {
    const viewport = viewportRef.current;
    const slide = slideNodes.current[current];
    if (!viewport || !slide) return;
    if (lastScrolledTo.current === current) return;
    const isFirstScroll = lastScrolledTo.current === null;
    lastScrolledTo.current = current;
    if (typeof viewport.scrollBy !== 'function') return;
    const viewportRect = viewport.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const rtl = getComputedStyle(viewport).direction === 'rtl';
    const delta = rtl ? slideRect.right - viewportRect.right : slideRect.left - viewportRect.left;
    if (delta === 0) return;
    // A scroll we start is not a swipe; the move already reported its own reason.
    userScroll.current = false;
    viewport.scrollBy({ left: delta, behavior: reducedMotion || isFirstScroll ? 'instant' : 'smooth' });
  }, [current, reducedMotion, swipeTick]);

  // Swipe and trackpad scrolling: a user-started scroll that settles on a new first visible slide
  // reports `swipe`. Settling is `scrollend` where supported, otherwise each observer delivery.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const settle = (): void => {
      const first = firstVisible.current;
      if (!userScroll.current || first === null) return;
      const { goTo: move, current: from, lastStart: end } = latest.current;
      const index = Math.min(first, end);
      // The viewport already shows `index`; if a controlled parent keeps activeIndex, scroll back.
      lastScrolledTo.current = index;
      if (index !== from) {
        move(index, 'swipe');
        setSwipeTick((tick) => tick + 1);
      }
    };
    const hasScrollEnd = 'onscrollend' in viewport;
    if (hasScrollEnd) viewport.addEventListener('scrollend', settle);
    const ratios = new Map<Element, number>();
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
              const first = slideNodes.current.findIndex((node) => node !== null && (ratios.get(node) ?? 0) >= VISIBLE_THRESHOLD);
              if (first === -1) return;
              firstVisible.current = first;
              if (!hasScrollEnd) settle();
            },
            { root: viewport, threshold: VISIBLE_THRESHOLD },
          );
    if (observer) for (const node of slideNodes.current) if (node) observer.observe(node);
    return () => {
      if (hasScrollEnd) viewport.removeEventListener('scrollend', settle);
      observer?.disconnect();
    };
  }, [total]);

  // Page size: compare the viewport's own width with layout.maxWidth.prose. ResizeObserver delivers
  // once on observe(); state is set only when the width changes and the answer differs.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof ResizeObserver === 'undefined') return undefined;
    let lastWidth = -1;
    const observer = new ResizeObserver(() => {
      const width = viewport.clientWidth;
      if (width === lastWidth || width === 0) return;
      lastWidth = width;
      const prose = readLengthVar(viewport, PROSE_WIDTH_VAR);
      if (prose === null) return;
      const next = width <= prose;
      setNarrow((previous) => (previous === next ? previous : next));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const setRootRef = (node: HTMLElement | null): void => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleBlur = (event: ReactFocusEvent<HTMLElement>): void => {
    onBlur?.(event);
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  const markUserScroll = (): void => {
    userScroll.current = true;
  };

  const classes = ['ds-carousel', snap ? null : 'ds-carousel--no-snap'].filter(Boolean).join(' ');
  const rootStyle = {
    '--ds-carousel-per-view': requestedPerView,
    ...(overrides ? overridesToStyle(overrides) : null),
  } as CSSProperties;

  const slideId = (index: number): string => `${baseId}-slide-${index}`;
  // Roving tabindex: the focused item while it is on the current page, else the current slide's item.
  const tabStop = pickerFocus !== null && pickerFocus >= current && pickerFocus < current + pageSize ? pickerFocus : current;
  const onCurrentPage = (index: number): boolean => index >= current && index < current + pageSize;
  const pickerItemRef = (index: number) => (node: HTMLButtonElement | null): void => {
    pickerNodes.current[index] = node;
  };

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
        <span className="ds-carousel__play" data-part="playButton" onClick={forwardClick(playButtonRef)}>
          <Button ref={playButtonRef} variant="secondary" label={playing ? COPY.pause : COPY.play} onClick={togglePlay} />
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
          <div
            role="group"
            aria-label={COPY.pickerLabel}
            className="ds-carousel__picker"
            data-part="picker"
            onKeyDown={handlePickerKeyDown}
          >
            {slides.map((slide, index) => (
              <button
                key={slide.key ?? index}
                ref={pickerItemRef(index)}
                type="button"
                aria-label={fill(COPY.goTo, { n: index + 1 })}
                aria-current={onCurrentPage(index) ? 'true' : undefined}
                aria-controls={slideId(index)}
                tabIndex={index === tabStop ? 0 : -1}
                className="ds-carousel__dot"
                data-part="pickerItem"
                onFocus={() => setPickerFocus(index)}
                onClick={() => goTo(index, 'picker')}
              >
                <span className="ds-carousel__dot-mark" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}
        {picker === 'tabs' ? (
          <div
            role="tablist"
            aria-label={COPY.pickerLabel}
            className="ds-carousel__picker"
            data-part="picker"
            onKeyDown={handlePickerKeyDown}
          >
            {slides.map((slide, index) => (
              <button
                key={slide.key ?? index}
                ref={pickerItemRef(index)}
                type="button"
                role="tab"
                aria-selected={index === current ? 'true' : 'false'}
                aria-controls={slideId(index)}
                tabIndex={index === tabStop ? 0 : -1}
                className="ds-carousel__tab"
                data-part="pickerItem"
                onFocus={() => setPickerFocus(index)}
                onClick={() => goTo(index, 'picker')}
              >
                {slide.props.label || fill(COPY.goTo, { n: index + 1 })}
              </button>
            ))}
          </div>
        ) : null}
        <div
          ref={viewportRef}
          // The viewport is a scroll container, so it must be reachable by keyboard: without a tab
          // stop the only way to scroll it is a pointer (WCAG 2.1.1; axe `scrollable-region-focusable`).
          // Focused, it scrolls with the arrow keys natively — the picker's own arrow model is
          // untouched, and the stop sits after the controls, where the keyboard model puts the slides.
          tabIndex={0}
          className="ds-carousel__viewport"
          data-part="viewport"
          onPointerDown={markUserScroll}
          onTouchStart={markUserScroll}
          onWheel={markUserScroll}
        >
          <div id={`${baseId}-track`} className="ds-carousel__track" data-part="track">
            {slides.map((slide, index) => (
              <SlideContext
                key={slide.key ?? index}
                value={{
                  id: slideId(index),
                  role: picker === 'tabs' ? 'tabpanel' : 'group',
                  label: fill(COPY.slideLabel, { n: index + 1, total }),
                  hidden: !onCurrentPage(index),
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
}
