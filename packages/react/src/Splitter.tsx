import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import './Splitter.css';

export type SplitterOrientation = 'horizontal' | 'vertical';
export type SplitterStackBelow = 'prose' | 'content' | 'never';

/**
 * copy.* — used verbatim; `{label}` and `{percent}` are the only substitutions. `setMinimum` and
 * `setMaximum` name the Home/End accessibility actions, which only the native platforms expose:
 * on web Home and End are bare keys and render neither string.
 */
const COPY = {
  collapse: 'Collapse {label}',
  expand: 'Expand {label}',
  setMinimum: 'Minimum {label}',
  setMaximum: 'Maximum {label}',
  sizeText: '{percent}%',
} as const;

/** Style bindings that can be overridden per instance; locked (accessibility-bearing) bindings are not in this union. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'gripRadius'
  | 'collapseButtonOffset'
  | 'transition';

const OVERRIDE_HOOK: Record<SplitterOverridableBinding, string> = {
  separatorSize: '--ds-splitter-separator-size',
  separatorColor: '--ds-splitter-separator-color',
  handleSize: '--ds-splitter-handle-size',
  gripLength: '--ds-splitter-grip-length',
  gripRadius: '--ds-splitter-grip-radius',
  collapseButtonOffset: '--ds-splitter-collapse-button-offset',
  transition: '--ds-splitter-transition',
};

function overridesToStyle(overrides: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>>): Record<string, string> {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(OVERRIDE_HOOK) as SplitterOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style;
}

declare const process: { env: { NODE_ENV?: string } };
const isDev: boolean = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** stackBelow → the layout.maxWidth.* token whose resolved length is the breakpoint. */
const BREAKPOINT_TOKEN: Record<Exclude<SplitterStackBelow, 'never'>, string> = {
  prose: '--layout-max-width-prose',
  content: '--layout-max-width-content',
};

const LENGTH_PATTERN = /^(\d*\.?\d+)(px|rem|em)$/;

/**
 * The breakpoint in CSS pixels, read from the loaded token stylesheet (literal-ok: the number is
 * the theme's layout.maxWidth.*, never written here). px, rem (against the root font size) and em
 * (against the splitter's own) are readable; any other unit, or no tokens loaded, is `null`.
 */
function readBreakpoint(el: Element, stackBelow: Exclude<SplitterStackBelow, 'never'>): number | null {
  const raw = getComputedStyle(el).getPropertyValue(BREAKPOINT_TOKEN[stackBelow]).trim();
  const match = LENGTH_PATTERN.exec(raw);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (match[2] === 'rem') return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
  if (match[2] === 'em') return value * parseFloat(getComputedStyle(el).fontSize);
  return value;
}

interface PersistedState {
  size?: number | undefined;
  collapsed?: boolean | undefined;
}

function readPersisted(key: string | undefined): PersistedState | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const { size, collapsed } = parsed as Record<string, unknown>;
    return {
      size: typeof size === 'number' && Number.isFinite(size) ? size : undefined,
      collapsed: typeof collapsed === 'boolean' ? collapsed : undefined,
    };
  } catch {
    return null;
  }
}

function writePersisted(key: string | undefined, value: { size: number; collapsed: boolean }): void {
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota): the size just does not stick */
  }
}

/** The standard focusable selector; negative tabindex, inert subtrees and aria-disabled are filtered after. */
const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable]:not([contenteditable="false"]), [tabindex]';

function firstFocusable(region: HTMLElement): HTMLElement | undefined {
  return Array.from(region.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(
    (el) => el.tabIndex >= 0 && !el.closest('[inert]') && el.getAttribute('aria-disabled') !== 'true',
  );
}

export interface SplitterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /**
   * `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. The
   * splitter fills its parent (block-size 100%), so a vertical splitter needs a parent with a definite height.
   */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. */
  primary: ReactNode;
  /** The second pane, which takes the remaining space. */
  secondary: ReactNode;
  /**
   * Controlled size of the primary pane as a percentage of the container (0–100). A value outside
   * `minSize`–`maxSize` is clamped for the layout, the value text and aria-valuenow, and fires nothing.
   */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /**
   * Smallest primary size, percent. With `collapsible`, dragging or stepping below it collapses the
   * pane instead of clamping; otherwise it is the hard floor. Home sets `minSize` and never collapses.
   */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Arrow-key increment, percent. */
  step?: number | undefined;
  /**
   * The primary pane can collapse to nothing: drag past the minimum, press Enter on the separator,
   * or use the collapse button. Enter again restores the last size.
   */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. Ignored unless `collapsible`. */
  collapsed?: boolean | undefined;
  /** Initial collapsed state when uncontrolled. */
  defaultCollapsed?: boolean | undefined;
  /**
   * When set, the size and collapsed state are remembered per user under this key so a sidebar
   * stays where it was left (localStorage, in try/catch, as JSON `{size, collapsed}`). The stored
   * value seeds only an uncontrolled `size` or `collapsed`; a controlled prop wins over the store.
   */
  persistKey?: string | undefined;
  /**
   * Below this width of the splitter's own box — its own box, not the viewport, so nested
   * splitters work — a horizontal splitter stacks its panes and the separator is not rendered. A
   * vertical splitter never stacks. `prose` = layout.maxWidth.prose, `content` =
   * layout.maxWidth.content, `never` = no stacking.
   */
  stackBelow?: SplitterStackBelow | undefined;
  /** Per-instance style overrides: each entry sets the matching `--ds-splitter-*` hook to that token. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each key press that changes the size, with the primary size in percent (unrounded). */
  onSizeChange?: ((size: number) => void) | undefined;
  /**
   * Fired with the final size once when a drag ends and after each key press that changed the size
   * (a key press is a complete interaction), so a caller can persist on it.
   */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}

/**
 * Splitter — Design Schema, category: layout. APG window splitter.
 *
 * When to use:
 * Use a Splitter when two regions compete for space and the right split depends on the task: a
 * navigation tree beside content, a list beside a detail view, a code editor beside its output, a
 * map beside results. Make the primary pane the one whose size matters (the sidebar), set sensible
 * `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for sidebars.
 */
export function Splitter({
  ref,
  label,
  orientation = 'horizontal',
  primary,
  secondary,
  size,
  defaultSize = 30,
  minSize = 10,
  maxSize = 90,
  step = 2,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  persistKey,
  stackBelow = 'prose',
  overrides,
  onSizeChange,
  onSizeChangeEnd,
  onCollapseChange,
  onKeyDown,
  ...rest
}: SplitterProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const primaryId = `ds-splitter${useId()}-primary`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLDivElement | null>(null);
  const separatorRef = useRef<HTMLDivElement | null>(null);
  const secondaryRef = useRef<HTMLDivElement | null>(null);
  const collapseButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isDev && !label) console.warn('Splitter: `label` is required; it is the separator’s accessible name.');
  }, [label]);

  const clamp = (value: number): number => Math.min(Math.max(value, minSize), maxSize);

  // Size: controlled when `size` is given; otherwise local state. The server's answer is the
  // default; a persisted value is applied after mount so hydration matches.
  const [internalSize, setInternalSize] = useState<number>(() => clamp(defaultSize));
  const current = size !== undefined ? clamp(size) : internalSize;
  const latestSizeRef = useRef(current);
  latestSizeRef.current = current;

  // Collapsed: controlled when `collapsed` is given; otherwise local state. Pinned false without `collapsible`.
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(defaultCollapsed);
  const collapsedState = collapsible && (collapsed !== undefined ? collapsed : internalCollapsed);

  // Collapse and restore animate; key steps and drags do not. The hook is set when the collapsed
  // state changes and cleared by the next size change or the next pointerdown.
  const [animate, setAnimate] = useState(false);
  const [prevCollapsed, setPrevCollapsed] = useState(collapsedState);
  if (prevCollapsed !== collapsedState) {
    setPrevCollapsed(collapsedState);
    setAnimate(true);
  }

  // Persistence: seed the uncontrolled values from the store once after mount, and record the
  // settled pair right away (the first-render write), then on every change in either mode.
  const skipNextWriteRef = useRef(true);
  useLayoutEffect(() => {
    if (!persistKey) return;
    const stored = readPersisted(persistKey);
    const nextSize = size === undefined && stored?.size !== undefined ? clamp(stored.size) : current;
    const nextCollapsed =
      collapsible && collapsed === undefined && stored?.collapsed !== undefined ? stored.collapsed : collapsedState;
    if (nextSize !== internalSize && size === undefined) setInternalSize(nextSize);
    if (nextCollapsed !== collapsedState) {
      setInternalCollapsed(nextCollapsed);
      // A restored state is where the splitter starts, not a change to animate.
      setPrevCollapsed(nextCollapsed);
    }
    writePersisted(persistKey, { size: nextSize, collapsed: nextCollapsed });
    // Mount only: later changes go through the write effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      if (persistKey) return;
    }
    writePersisted(persistKey, { size: current, collapsed: collapsedState });
  }, [persistKey, current, collapsedState]);

  // Writing direction: a horizontal splitter swaps its arrow keys, its drag axis and the collapse
  // chevron in RTL. Read once at mount and not observed afterwards.
  const [isRtl, setIsRtl] = useState(false);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setIsRtl(getComputedStyle(el).direction === 'rtl');
  }, []);

  // Stacking: the splitter's own inline size against the layout.maxWidth.* breakpoint, measured
  // with a ResizeObserver. Before mount (and on the server) it renders side by side.
  const canStack = orientation === 'horizontal' && stackBelow !== 'never';
  const [isStacked, setIsStacked] = useState(false);
  useLayoutEffect(() => {
    const el = containerRef.current;
    // No ResizeObserver (jsdom, older browsers) or no readable breakpoint: it never stacks.
    if (!canStack || !el || typeof ResizeObserver === 'undefined') {
      setIsStacked(false);
      return undefined;
    }
    const breakpoint = readBreakpoint(el, stackBelow);
    if (breakpoint === null) {
      setIsStacked(false);
      return undefined;
    }
    let lastWidth = -1;
    const measure = (width: number): void => {
      // observe() always delivers an initial notification; only a changed width may set state.
      if (width === lastWidth) return;
      lastWidth = width;
      setIsStacked(width < breakpoint);
    };
    measure(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measure(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [canStack, stackBelow]);

  // While stacked a collapsed pane keeps its state without showing it.
  const effectiveCollapsed = collapsedState && !isStacked;

  function changeSize(next: number): boolean {
    const clamped = clamp(next);
    if (clamped === latestSizeRef.current) return false;
    if (size === undefined) setInternalSize(clamped);
    latestSizeRef.current = clamped;
    setAnimate(false);
    onSizeChange?.(clamped);
    return true;
  }

  function setCollapsed(next: boolean): void {
    if (!collapsible || next === collapsedState) return;
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapseChange?.(next);
  }

  // ── Pointer drag ────────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  // A press that never changed the clamped size is not a drag and fires no end event.
  const movedRef = useRef(false);
  // Once a drag collapses the pane, the rest of that gesture is ignored.
  const collapsedByDragRef = useRef(false);

  function percentFromPoint(clientX: number, clientY: number): number {
    const el = containerRef.current;
    if (!el) return latestSizeRef.current;
    const rect = el.getBoundingClientRect();
    if (orientation === 'horizontal') {
      if (rect.width === 0) return latestSizeRef.current;
      const ratio = (clientX - rect.left) / rect.width;
      return (isRtl ? 1 - ratio : ratio) * 100;
    }
    if (rect.height === 0) return latestSizeRef.current;
    return ((clientY - rect.top) / rect.height) * 100;
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    setAnimate(false);
    if (effectiveCollapsed || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    movedRef.current = false;
    collapsedByDragRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current || collapsedByDragRef.current) return;
    const raw = percentFromPoint(event.clientX, event.clientY);
    if (collapsible && raw < minSize) {
      // Strictly below the minimum collapses; the size is kept for restoring.
      collapsedByDragRef.current = true;
      setCollapsed(true);
      return;
    }
    if (changeSize(raw)) movedRef.current = true;
  };

  // A cancelled gesture counts as a release.
  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    const wasDrag = movedRef.current || collapsedByDragRef.current;
    draggingRef.current = false;
    movedRef.current = false;
    collapsedByDragRef.current = false;
    setIsDragging(false);
    const target = event.currentTarget;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    if (wasDrag) onSizeChangeEnd?.(latestSizeRef.current);
  };

  // ── Keyboard ────────────────────────────────────────────────────────────────
  const handleSeparatorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      if (!collapsible) return;
      event.preventDefault();
      setCollapsed(!collapsedState);
      return;
    }
    // In RTL a horizontal splitter swaps ArrowLeft and ArrowRight, as dragging does.
    const growKey = orientation === 'vertical' ? 'ArrowDown' : isRtl ? 'ArrowLeft' : 'ArrowRight';
    const shrinkKey = orientation === 'vertical' ? 'ArrowUp' : isRtl ? 'ArrowRight' : 'ArrowLeft';
    let next: number;
    switch (event.key) {
      case growKey:
        next = latestSizeRef.current + step;
        break;
      case shrinkKey:
        next = latestSizeRef.current - step;
        break;
      case 'Home':
        next = minSize;
        break;
      case 'End':
        next = maxSize;
        break;
      default:
        return;
    }
    // Consumed even while collapsed, so a focused separator does not scroll the page.
    event.preventDefault();
    if (effectiveCollapsed) return;
    if (collapsible && event.key === shrinkKey && latestSizeRef.current <= minSize) {
      // The shrink step from minSize collapses; a step that would cross it from above clamps first.
      setCollapsed(true);
      return;
    }
    if (changeSize(next)) onSizeChangeEnd?.(latestSizeRef.current);
  };

  // F6 cycles primary pane → separator → secondary pane, wrapping; a collapsed or unrendered region
  // is skipped. Shift+F6 is left to the browser.
  const handleContainerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'F6' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const separatorTrack = separatorRef.current?.parentElement ?? null;
    const regions = [effectiveCollapsed ? null : primaryRef.current, separatorTrack, secondaryRef.current];
    const active = document.activeElement;
    let from = regions.findIndex((region) => region?.contains(active) ?? false);
    // From the container itself the cycle starts at the primary pane.
    if (from === -1) from = regions.length - 1;
    for (let offset = 1; offset <= regions.length; offset += 1) {
      const region = regions[(from + offset) % regions.length];
      if (!region) continue;
      event.preventDefault();
      if (region === separatorTrack) {
        separatorRef.current?.focus();
        return;
      }
      const target = firstFocusable(region);
      if (target) {
        target.focus();
      } else {
        if (region.getAttribute('tabindex') !== '-1') region.setAttribute('tabindex', '-1');
        region.focus();
      }
      return;
    }
  };

  // The collapseButton part is a wrapper; a click on it reaches the composed Button.
  const handleCollapseTargetClick = (event: ReactMouseEvent<HTMLSpanElement>): void => {
    const button = collapseButtonRef.current;
    if (!button || button.contains(event.target as Node)) return;
    button.click();
  };

  const setContainerRef = (node: HTMLDivElement | null): void => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const percent = effectiveCollapsed ? 0 : Math.round(current);
  const valueText = COPY.sizeText.replace('{percent}', String(percent));

  const rootStyle = {
    ...(overrides ? overridesToStyle(overrides) : undefined),
    '--ds-splitter-primary-size': `${effectiveCollapsed ? 0 : current}%`,
  } as CSSProperties;

  const classes = [
    'ds-splitter',
    `ds-splitter--${orientation}`,
    isStacked ? 'ds-splitter--stacked' : null,
    effectiveCollapsed ? 'ds-splitter--collapsed' : null,
    isDragging ? 'ds-splitter--dragging' : null,
    animate ? 'ds-splitter--animate' : null,
  ]
    .filter(Boolean)
    .join(' ');

  // The chevron points toward the primary pane while expanded and away from it while collapsed;
  // on a horizontal splitter that is mirrored in RTL, where the primary pane sits on the right.
  const pointsAtPrimary = !effectiveCollapsed;
  const collapseIcon: IconName =
    orientation === 'vertical'
      ? pointsAtPrimary
        ? 'chevron-up'
        : 'chevron-down'
      : pointsAtPrimary !== isRtl
        ? 'chevron-left'
        : 'chevron-right';

  return (
    <div
      {...rest}
      ref={setContainerRef}
      data-ds="Splitter"
      data-part="container"
      className={classes}
      style={rootStyle}
      onKeyDown={handleContainerKeyDown}
    >
      <div
        ref={primaryRef}
        id={primaryId}
        data-part="primaryPane"
        className="ds-splitter__primary-pane"
        inert={effectiveCollapsed}
      >
        {primary}
      </div>
      {isStacked ? null : (
        <div className="ds-splitter__track">
          <div
            ref={separatorRef}
            role="separator"
            tabIndex={0}
            data-part="separator"
            className="ds-splitter__separator"
            aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
            aria-valuenow={percent}
            aria-valuemin={effectiveCollapsed ? 0 : minSize}
            aria-valuemax={maxSize}
            aria-valuetext={valueText}
            aria-label={label}
            aria-controls={primaryId}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onKeyDown={handleSeparatorKeyDown}
          />
          {collapsible ? (
            <span className="ds-splitter__collapse-button" data-part="collapseButton" onClick={handleCollapseTargetClick}>
              <Button
                ref={collapseButtonRef}
                variant="ghost"
                size="sm"
                iconOnly
                expanded={!effectiveCollapsed}
                aria-controls={primaryId}
                label={(effectiveCollapsed ? COPY.expand : COPY.collapse).replace('{label}', label)}
                leadingIcon={<Icon name={collapseIcon} inline />}
                onClick={() => setCollapsed(!collapsedState)}
              />
            </span>
          ) : null}
        </div>
      )}
      <div ref={secondaryRef} data-part="secondaryPane" className="ds-splitter__secondary-pane">
        {secondary}
      </div>
    </div>
  );
}
