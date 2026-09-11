import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import './Splitter.css';

export type SplitterOrientation = 'horizontal' | 'vertical';
export type SplitterStackBelow = 'prose' | 'content' | 'never';

/** copy.* — used verbatim; `{label}`/`{percent}` are replaced. */
const COPY = {
  collapse: 'Collapse {label}',
  expand: 'Expand {label}',
  sizeText: '{percent}%',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'collapseButtonOffset'
  | 'paneMinTarget'
  | 'transition';

const OVERRIDE_HOOK: Record<SplitterOverridableBinding, string> = {
  separatorSize: '--ds-splitter-separator-size',
  separatorColor: '--ds-splitter-separator-color',
  handleSize: '--ds-splitter-handle-size',
  gripLength: '--ds-splitter-grip-length',
  collapseButtonOffset: '--ds-splitter-collapse-button-offset',
  paneMinTarget: '--ds-splitter-pane-min-target',
  transition: '--ds-splitter-transition',
};

function overridesToStyle(overrides: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as SplitterOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const BREAKPOINT_VAR: Record<Exclude<SplitterStackBelow, 'never'>, string> = {
  prose: '--layout-max-width-prose',
  content: '--layout-max-width-content',
};

function readPersisted(key: string | undefined): { size?: number | undefined; collapsed?: boolean | undefined } | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { size?: number | undefined; collapsed?: boolean | undefined }) : null;
  } catch {
    return null;
  }
}

function writePersisted(key: string | undefined, value: { size: number; collapsed: boolean }): void {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota) — the size just does not stick */
  }
}

export interface SplitterProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
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
  /** Smallest primary size, percent. Below this the pane collapses instead, when `collapsible`. */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Arrow-key increment, percent. */
  step?: number | undefined;
  /**
   * The primary pane can collapse to nothing: drag past the minimum, press Enter on the
   * separator, or use the collapse button. Enter again restores the last size.
   */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** When set, the size is remembered per user under this key (localStorage) so a sidebar stays where it was left. */
  persistKey?: string | undefined;
  /**
   * Below this layout width a horizontal splitter stacks its panes and the separator becomes
   * inert (a phone has no room for two panes side by side).
   */
  stackBelow?: SplitterStackBelow | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each key press, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired once when a drag ends, with the final size. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}

/**
 * Splitter — Design Schema, category: layout.
 *
 * When to use:
 * Use a Splitter when two regions compete for space and the right split depends on the task: a
 * navigation tree beside content, a list beside a detail view, a code editor beside its output, a
 * map beside results. Make the primary pane the one whose size matters (the sidebar), set
 * sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks. Use `collapsible` for
 * sidebars.
 */
export const Splitter = function Splitter({
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
  persistKey,
  stackBelow = 'prose',
  overrides,
  onSizeChange,
  onSizeChangeEnd,
  onCollapseChange,
  id: idProp,
  className,
  style,
  onKeyDown,
  ...rest
}: SplitterProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const id = idProp ?? `ds-splitter${generatedId}`;
  const primaryId = `${id}-primary`;
  const secondaryId = `${id}-secondary`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const primaryRef = useRef<HTMLDivElement | null>(null);
  const separatorRef = useRef<HTMLDivElement | null>(null);
  const secondaryRef = useRef<HTMLDivElement | null>(null);

  if (isDev && !label) {
    console.warn('Splitter: `label` is required and becomes the separator’s accessible name.');
  }

  const isControlled = size !== undefined;
  const [internalSize, setInternalSize] = useState<number>(() => readPersisted(persistKey)?.size ?? defaultSize);
  const current = isControlled ? (size as number) : internalSize;
  const latestSizeRef = useRef(current);
  latestSizeRef.current = current;

  const isCollapsedControlled = collapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => readPersisted(persistKey)?.collapsed ?? false);
  const collapsedState = isCollapsedControlled ? (collapsed as boolean) : internalCollapsed;
  const lastSizeRef = useRef(current);

  // The size stacking checks against the splitter's own inline size, not the viewport — this is a
  // real container query, not a page-layout breakpoint (see SidePanel's `persistent`).
  const [isStacked, setIsStacked] = useState(false);
  useEffect(() => {
    if (orientation !== 'horizontal' || stackBelow === 'never') {
      setIsStacked(false);
      return undefined;
    }
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    // literal-ok: breakpoint value read from the token custom property at runtime, not a literal.
    const raw = getComputedStyle(document.documentElement).getPropertyValue(BREAKPOINT_VAR[stackBelow]).trim();
    const breakpoint = parseFloat(raw) || 0;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.getBoundingClientRect().width;
      setIsStacked(width < breakpoint);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [orientation, stackBelow]);

  const effectiveCollapsed = collapsedState && !isStacked;

  useLayoutEffect(() => {
    const node = primaryRef.current;
    if (node) node.inert = effectiveCollapsed;
  }, [effectiveCollapsed]);

  useEffect(() => {
    writePersisted(persistKey, { size: current, collapsed: collapsedState });
  }, [persistKey, current, collapsedState]);

  function clamp(value: number): number {
    return Math.min(Math.max(value, minSize), maxSize);
  }

  function commitSize(next: number): void {
    const clamped = clamp(next);
    if (!isControlled) setInternalSize(clamped);
    latestSizeRef.current = clamped;
    onSizeChange?.(clamped);
  }

  function setCollapsed(next: boolean): void {
    if (!isCollapsedControlled) setInternalCollapsed(next);
    onCollapseChange?.(next);
  }

  function collapse(): void {
    if (collapsedState) return;
    lastSizeRef.current = current;
    setCollapsed(true);
  }

  function restore(): void {
    if (!collapsedState) return;
    setCollapsed(false);
    commitSize(lastSizeRef.current);
  }

  function toggleCollapse(): void {
    if (collapsedState) restore();
    else collapse();
  }

  function percentFromPoint(clientX: number, clientY: number): number {
    const el = containerRef.current;
    if (!el) return current;
    const rect = el.getBoundingClientRect();
    if (orientation === 'horizontal') {
      const rtl = getComputedStyle(el).direction === 'rtl';
      const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
      return Math.min(Math.max(rtl ? 1 - ratio : ratio, 0), 1) * 100;
    }
    const ratio = rect.height === 0 ? 0 : (clientY - rect.top) / rect.height;
    return Math.min(Math.max(ratio, 0), 1) * 100;
  }

  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSeparatorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isStacked || event.button !== 0) return;
    if ((event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    onSizeChangeEnd?.(latestSizeRef.current);
  };

  const handleSeparatorPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || effectiveCollapsed) return;
    const raw = percentFromPoint(event.clientX, event.clientY);
    if (collapsible && raw < minSize) {
      draggingRef.current = false;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      collapse();
      return;
    }
    commitSize(raw);
  };

  const handleSeparatorPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => endDrag(event);
  const handleSeparatorPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => endDrag(event);

  const keyChangedRef = useRef(false);

  const handleSeparatorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isStacked || event.target !== event.currentTarget) return;
    if (effectiveCollapsed) {
      if (event.key === 'Enter' && collapsible) {
        event.preventDefault();
        restore();
      }
      return;
    }
    const growKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const shrinkKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    switch (event.key) {
      case growKey:
        event.preventDefault();
        commitSize(current + step);
        keyChangedRef.current = true;
        break;
      case shrinkKey:
        event.preventDefault();
        commitSize(current - step);
        keyChangedRef.current = true;
        break;
      case 'Home':
        event.preventDefault();
        commitSize(minSize);
        keyChangedRef.current = true;
        break;
      case 'End':
        event.preventDefault();
        commitSize(maxSize);
        keyChangedRef.current = true;
        break;
      case 'Enter':
        if (collapsible) {
          event.preventDefault();
          collapse();
        }
        break;
      default:
        break;
    }
  };

  const handleSeparatorKeyUp = () => {
    if (keyChangedRef.current) {
      keyChangedRef.current = false;
      onSizeChangeEnd?.(latestSizeRef.current);
    }
  };

  // F6: the APG convenience for cycling focus between the two panes and the separator, regardless
  // of which of the three currently holds focus.
  const handleContainerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key !== 'F6' || isStacked) return;
    const active = document.activeElement;
    const regions = [primaryRef, separatorRef, secondaryRef];
    const activeIndex = regions.findIndex((r) => r.current === active || (r.current?.contains(active) ?? false));
    const nextRegion = regions[activeIndex === -1 ? 0 : (activeIndex + 1) % regions.length]!.current;
    if (!nextRegion) return;
    event.preventDefault();
    const focusable = nextRegion.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable ?? nextRegion).focus();
  };

  const handleCollapseButtonClick = () => toggleCollapse();

  const setContainerRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  const displayedPercent = effectiveCollapsed ? 0 : Math.round(current);
  const valueText = COPY.sizeText.replace('{percent}', String(displayedPercent));

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const rootStyle: CSSProperties = {
    ...overrideStyle,
    ...style,
    '--ds-splitter-primary-size': `${effectiveCollapsed ? 0 : current}%`,
  } as CSSProperties;

  const classes = [
    'ds-splitter',
    `ds-splitter--${orientation}`,
    isStacked ? 'ds-splitter--stacked' : null,
    effectiveCollapsed ? 'ds-splitter--collapsed' : null,
    isDragging ? 'ds-splitter--dragging' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const collapseIcon =
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
      id={id}
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
        tabIndex={-1}
      >
        {primary}
      </div>
      <div
        ref={separatorRef}
        data-part="separator"
        className="ds-splitter__separator"
        role={isStacked ? 'presentation' : 'separator'}
        tabIndex={isStacked ? undefined : 0}
        aria-orientation={isStacked ? undefined : orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        aria-label={isStacked ? undefined : label}
        aria-controls={isStacked ? undefined : primaryId}
        aria-valuenow={isStacked ? undefined : displayedPercent}
        aria-valuemin={isStacked ? undefined : minSize}
        aria-valuemax={isStacked ? undefined : maxSize}
        aria-valuetext={isStacked ? undefined : valueText}
        onPointerDown={handleSeparatorPointerDown}
        onPointerMove={handleSeparatorPointerMove}
        onPointerUp={handleSeparatorPointerUp}
        onPointerCancel={handleSeparatorPointerCancel}
        onKeyDown={handleSeparatorKeyDown}
        onKeyUp={handleSeparatorKeyUp}
      >
        {collapsible && !isStacked ? (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            data-part="collapseButton"
            className="ds-splitter__collapse-button"
            label={(effectiveCollapsed ? COPY.expand : COPY.collapse).replace('{label}', label)}
            leadingIcon={<Icon name={collapseIcon} inline />}
            onClick={handleCollapseButtonClick}
          />
        ) : null}
      </div>
      <div ref={secondaryRef} id={secondaryId} data-part="secondaryPane" className="ds-splitter__secondary-pane" tabIndex={-1}>
        {secondary}
      </div>
    </div>
  );
};
