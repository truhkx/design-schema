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

/** copy.* — used verbatim; `{label}` and `{percent}` are the only substitutions. */
const COPY = {
  collapse: 'Collapse {label}',
  expand: 'Expand {label}',
  sizeText: '{percent}%',
} as const;

/** Style bindings that can be overridden per instance; locked (accessibility-bearing) bindings are not in this union. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'collapseButtonOffset'
  | 'transition';

const OVERRIDE_HOOK: Record<SplitterOverridableBinding, string> = {
  separatorSize: '--ds-splitter-separator-size',
  separatorColor: '--ds-splitter-separator-color',
  handleSize: '--ds-splitter-handle-size',
  gripLength: '--ds-splitter-grip-length',
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

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [contenteditable]:not([contenteditable="false"]), [tabindex]';

/**
 * The breakpoint in CSS pixels, read from the loaded token stylesheet (literal-ok: the number is
 * the theme's layout.maxWidth.*, never written here). `null` when the tokens are not loaded.
 */
function readBreakpoint(el: Element, stackBelow: Exclude<SplitterStackBelow, 'never'>): number | null {
  const raw = getComputedStyle(el).getPropertyValue(BREAKPOINT_TOKEN[stackBelow]).trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (raw.endsWith('rem')) return value * parseFloat(getComputedStyle(document.documentElement).fontSize);
  if (raw.endsWith('em')) return value * parseFloat(getComputedStyle(el).fontSize);
  return value;
}

interface PersistedState {
  size?: number | undefined;
  collapsed?: boolean | undefined;
}

function readPersisted(key: string | undefined): PersistedState | null {
  if (!key || typeof window === 'undefined') return null;
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
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota): the size just does not stick */
  }
}

export interface SplitterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. */
  primary: ReactNode;
  /** The second pane, which takes the remaining space. */
  secondary: ReactNode;
  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /**
   * Smallest primary size, percent. With `collapsible`, dragging or stepping below it collapses the
   * pane instead of clamping; otherwise it is the hard floor.
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
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** Initial collapsed state when uncontrolled. */
  defaultCollapsed?: boolean | undefined;
  /**
   * When set, the size and collapsed state are remembered per user under this key so a sidebar
   * stays where it was left: localStorage on web (in try/catch).
   */
  persistKey?: string | undefined;
  /**
   * Below this width of the splitter's own box (a container query, not the viewport, so nested
   * splitters work) a horizontal splitter stacks its panes and the separator is not rendered. A
   * vertical splitter never stacks. `content` = layout.maxWidth.content, `never` = no stacking.
   */
  stackBelow?: SplitterStackBelow | undefined;
  /** Per-instance style overrides: each entry sets the matching `--ds-splitter-*` hook to that token. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each key press, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /**
   * Fired with the final size once when a drag ends and after each key press (a key press is a
   * complete interaction), so a caller can persist on it.
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

  // Size: controlled when `size` is given; otherwise local state from persistence or defaultSize.
  const [internalSize, setInternalSize] = useState<number>(() => clamp(readPersisted(persistKey)?.size ?? defaultSize));
  const current = size !== undefined ? clamp(size) : internalSize;
  const latestSizeRef = useRef(current);
  latestSizeRef.current = current;

  // Collapsed: controlled when `collapsed` is given; otherwise local state.
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(
    () => readPersisted(persistKey)?.collapsed ?? defaultCollapsed,
  );
  const collapsedState = collapsible && (collapsed !== undefined ? collapsed : internalCollapsed);

  // Stacking: a container query on the splitter's own inline size, measured with a ResizeObserver.
  const canStack = orientation === 'horizontal' && stackBelow !== 'never';
  const [isStacked, setIsStacked] = useState(false);
  useLayoutEffect(() => {
    const el = containerRef.current;
    // jsdom and older browsers have no ResizeObserver: the splitter simply never stacks there.
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

  const effectiveCollapsed = collapsedState && !isStacked;

  // Collapse and restore animate; keyboard steps and drags do not (the transition binding's scope).
  const [animateCollapse, setAnimateCollapse] = useState(false);
  const [prevCollapsed, setPrevCollapsed] = useState(effectiveCollapsed);
  if (prevCollapsed !== effectiveCollapsed) {
    setPrevCollapsed(effectiveCollapsed);
    setAnimateCollapse(true);
  }

  useLayoutEffect(() => {
    const node = primaryRef.current;
    if (node && node.inert !== effectiveCollapsed) node.inert = effectiveCollapsed;
  }, [effectiveCollapsed]);

  useEffect(() => {
    writePersisted(persistKey, { size: current, collapsed: collapsedState });
  }, [persistKey, current, collapsedState]);

  function changeSize(next: number): boolean {
    const clamped = clamp(next);
    setAnimateCollapse(false);
    if (clamped === latestSizeRef.current) return false;
    if (size === undefined) setInternalSize(clamped);
    latestSizeRef.current = clamped;
    onSizeChange?.(clamped);
    return true;
  }

  function setCollapsed(next: boolean): void {
    if (next === collapsedState) return;
    if (collapsed === undefined) setInternalCollapsed(next);
    onCollapseChange?.(next);
  }

  // ── Pointer drag ────────────────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  function percentFromPoint(clientX: number, clientY: number): number {
    const el = containerRef.current;
    if (!el) return latestSizeRef.current;
    const rect = el.getBoundingClientRect();
    if (orientation === 'horizontal') {
      if (rect.width === 0) return latestSizeRef.current;
      const ratio = (clientX - rect.left) / rect.width;
      return (getComputedStyle(el).direction === 'rtl' ? 1 - ratio : ratio) * 100;
    }
    if (rect.height === 0) return latestSizeRef.current;
    return ((clientY - rect.top) / rect.height) * 100;
  }

  function stopDrag(target: HTMLDivElement, pointerId: number): void {
    draggingRef.current = false;
    setIsDragging(false);
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (effectiveCollapsed || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setIsDragging(true);
    setAnimateCollapse(false);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    const raw = percentFromPoint(event.clientX, event.clientY);
    if (collapsible && raw < minSize) {
      // Dragging past the minimum collapses; the drag ends here and the last size is kept to restore.
      stopDrag(event.currentTarget, event.pointerId);
      onSizeChangeEnd?.(latestSizeRef.current);
      setCollapsed(true);
      return;
    }
    changeSize(raw);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    stopDrag(event.currentTarget, event.pointerId);
    onSizeChangeEnd?.(latestSizeRef.current);
  };

  // ── Keyboard ────────────────────────────────────────────────────────────────
  const handleSeparatorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      if (!collapsible) return;
      event.preventDefault();
      setCollapsed(!collapsedState);
      return;
    }
    const growKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const shrinkKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
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
    event.preventDefault();
    // While collapsed, arrows, Home and End do nothing; only Enter or the collapse button restores.
    if (effectiveCollapsed) return;
    if (collapsible && event.key === shrinkKey && latestSizeRef.current <= minSize) {
      // Stepping below the floor collapses instead of clamping.
      setCollapsed(true);
      return;
    }
    if (changeSize(next)) onSizeChangeEnd?.(latestSizeRef.current);
  };

  // F6 cycles primary pane → separator → secondary pane, wrapping; inert or unrendered regions are skipped.
  const handleContainerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'F6' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const regions = [effectiveCollapsed ? null : primaryRef.current, separatorRef.current, secondaryRef.current];
    const active = document.activeElement;
    const separatorTrack = separatorRef.current?.parentElement ?? null;
    let from = regions.findIndex((region, index) =>
      index === 1 ? separatorTrack?.contains(active) ?? false : region?.contains(active) ?? false,
    );
    if (from === -1) from = regions.length - 1;
    for (let offset = 1; offset <= regions.length; offset += 1) {
      const region = regions[(from + offset) % regions.length];
      if (!region) continue;
      event.preventDefault();
      if (region === separatorRef.current) {
        region.focus();
        return;
      }
      const target = Array.from(region.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).find(
        (el) => el.tabIndex >= 0 && !el.closest('[inert]') && el.getAttribute('aria-disabled') !== 'true',
      );
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
    animateCollapse ? 'ds-splitter--animate' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const collapseIcon: IconName =
    orientation === 'horizontal'
      ? effectiveCollapsed
        ? 'chevron-right'
        : 'chevron-left'
      : effectiveCollapsed
        ? 'chevron-down'
        : 'chevron-up';

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
      <div ref={primaryRef} id={primaryId} data-part="primaryPane" className="ds-splitter__primary-pane">
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
