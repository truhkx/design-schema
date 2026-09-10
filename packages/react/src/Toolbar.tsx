import {
  Children,
  forwardRef,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Divider } from './Divider';
import { Menu, type MenuAction, type MenuItem } from './Menu';
import './Toolbar.css';

export type ToolbarOrientation = 'horizontal' | 'vertical';
export type ToolbarOverflow = 'wrap' | 'menu' | 'scroll';
export type ToolbarSize = 'sm' | 'md';
export type ToolbarDensity = 'compact' | 'comfortable';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type ToolbarOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'itemGap'
  | 'itemGapCompact'
  | 'groupGap'
  | 'separatorLength'
  | 'fadeWidth';

const OVERRIDE_HOOK: Record<ToolbarOverridableBinding, string> = {
  border: '--ds-toolbar-border',
  borderWidth: '--ds-toolbar-border-width',
  radius: '--ds-toolbar-radius',
  paddingInline: '--ds-toolbar-padding-inline',
  paddingBlock: '--ds-toolbar-padding-block',
  itemGap: '--ds-toolbar-item-gap',
  itemGapCompact: '--ds-toolbar-item-gap-compact',
  groupGap: '--ds-toolbar-group-gap',
  separatorLength: '--ds-toolbar-separator-length',
  fadeWidth: '--ds-toolbar-fade-width',
};

function overridesToStyle(overrides: Partial<Record<ToolbarOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ToolbarOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { more: 'More' };

const FOCUSABLE_SELECTOR = [
  'button:not([role="radio"]):not(:disabled)',
  '[role="radio"][aria-checked="true"]:not(:disabled)',
  'select:not(:disabled)',
  'input:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isControlDisabled(element: HTMLElement): boolean {
  return (element as HTMLButtonElement).disabled === true || element.getAttribute('aria-disabled') === 'true';
}

function getControls(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

function applyRovingTabIndex(controls: HTMLElement[], currentIndex: number) {
  controls.forEach((control, index) => {
    control.tabIndex = index === currentIndex ? 0 : -1;
  });
}

/** Best-effort accessible name for a collapsed control, reused as its overflow Menu row label. */
function actionFromElement(element: ReactElement, id: string): MenuAction {
  const props = element.props as Record<string, unknown>;
  const overflowLabel = props.overflowLabel;
  const ariaLabel = props['aria-label'];
  const label = props.label;
  const childText = props.children;
  const resolvedLabel =
    (typeof overflowLabel === 'string' && overflowLabel) ||
    (typeof ariaLabel === 'string' && ariaLabel) ||
    (typeof label === 'string' && label) ||
    (typeof childText === 'string' && childText) ||
    id;
  const disabled = props.disabled === true || props['aria-disabled'] === 'true' || props['aria-disabled'] === true;
  return { id, label: resolvedLabel, disabled };
}

type ToolbarEntry =
  | { kind: 'control'; element: ReactElement; key: string }
  | { kind: 'group'; element: ReactElement<ToolbarGroupProps>; key: string }
  | { kind: 'separator'; key: string };

function buildEntries(children: ReactNode): ToolbarEntry[] {
  const elements = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const entries: ToolbarEntry[] = [];
  elements.forEach((element, index) => {
    const isGroup = element.type === ToolbarGroup;
    const previous = entries[entries.length - 1];
    if (isGroup && previous && previous.kind === 'group') {
      entries.push({ kind: 'separator', key: `ds-toolbar-separator-${index}` });
    }
    entries.push({
      kind: isGroup ? 'group' : 'control',
      element,
      key: typeof element.key === 'string' ? element.key : `ds-toolbar-item-${index}`,
    } as ToolbarEntry);
  });
  return entries;
}

export interface ToolbarGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role'> {
  /** Accessible name for the cluster, when it isn't obvious from its controls alone. Also becomes its heading if the group overflows into the "More" menu. */
  label?: string;
  /** The group's controls, in order. */
  children: ReactNode;
}

/** Groups related controls inside a Toolbar; a Divider is drawn automatically between adjacent groups. */
export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
  { label, children, className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      aria-label={label}
      data-ds="ToolbarGroup"
      data-part="group"
      className={['ds-toolbar__group', className ?? null].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
});

export interface ToolbarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'aria-label' | 'aria-orientation'> {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools),
   * SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is
   * drawn between groups.
   */
  children: ReactNode;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  orientation?: ToolbarOrientation;
  /**
   * What happens when controls do not fit: wrap onto more rows, collapse trailing controls into a
   * "More" Menu (each control must provide `overflowLabel`), or scroll horizontally with the edges
   * faded.
   */
  overflow?: ToolbarOverflow;
  /** Passed to the child controls that accept it. */
  size?: ToolbarSize;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef>>;
}

/**
 * Toolbar — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Toolbar for controls that act on the same thing and are used together: text formatting, a
 * table's row actions, a map's view switches, a data page's filter–sort–export row. Group by
 * purpose with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for
 * toolbars whose width the layout cannot guarantee; give every control an `overflowLabel` so it
 * reads well as a menu item.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  {
    label,
    children,
    orientation = 'horizontal',
    overflow = 'menu',
    size = 'md',
    density = 'comfortable',
    overrides,
    className,
    style,
    ...rest
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef(0);
  const itemNodesRef = useRef<Array<HTMLElement | null>>([]);
  const moreItemRef = useRef<HTMLElement | null>(null);
  const overflowElementsRef = useRef(new Map<string, ReactElement>());

  const isMenuOverflow = overflow === 'menu';
  const [renderCount, setRenderCount] = useState<number | null>(null);

  const setContainerRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  const entries = buildEntries(children);
  const entriesKey = entries.map((entry) => `${entry.kind}:${entry.key}`).join('|');

  // A widening (or first-mount) container needs its full content remeasured, since collapsed
  // controls are removed from the DOM entirely and their widths are no longer known.
  useLayoutEffect(() => {
    if (!isMenuOverflow) return undefined;
    setRenderCount(null);
  }, [isMenuOverflow, orientation, entriesKey]);

  useLayoutEffect(() => {
    if (!isMenuOverflow) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    if (renderCount === null) {
      const nodes = itemNodesRef.current.filter((node): node is HTMLElement => node !== null);
      const total = nodes.length;
      if (total === 0) {
        setRenderCount(0);
        return undefined;
      }
      const moreWidth = moreItemRef.current?.offsetWidth ?? 0;
      const limit = container.clientWidth - moreWidth;
      let fit = total;
      for (let i = 0; i < total; i++) {
        if (nodes[i].offsetLeft + nodes[i].offsetWidth > limit) {
          fit = i;
          break;
        }
      }
      setRenderCount(fit);
      return undefined;
    }

    // jsdom (used by the test suite) has no ResizeObserver; the single measurement pass above
    // still runs, it just never reacts to a later resize.
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => setRenderCount(null));
    observer.observe(container);
    return () => observer.disconnect();
  }, [isMenuOverflow, renderCount]);

  // Roving tabindex: one stop for the whole toolbar. Requery on every DOM change (children
  // mounting/unmounting, or a composite control like SegmentedControl moving its own tabIndex)
  // so the current pointer always lands on something real.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const sync = () => {
      const controls = getControls(container);
      if (controls.length === 0) return;
      if (currentIndexRef.current >= controls.length) currentIndexRef.current = 0;
      if (isControlDisabled(controls[currentIndexRef.current])) {
        const firstEnabled = controls.findIndex((control) => !isControlDisabled(control));
        if (firstEnabled !== -1) currentIndexRef.current = firstEnabled;
      }
      applyRovingTabIndex(controls, currentIndexRef.current);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'aria-checked', 'tabindex'],
    });
    return () => observer.disconnect();
  });

  const handleFocusIn = (event: ReactFocusEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const controls = getControls(container);
    const index = controls.indexOf(event.target as HTMLElement);
    if (index !== -1) {
      currentIndexRef.current = index;
      applyRovingTabIndex(controls, index);
    }
  };

  // Composite controls (SegmentedControl, RadioGroup) handle their own arrow keys and call
  // preventDefault() when they do; deferring to that here is what lets them "keep their own
  // inner arrow keys" without the Toolbar needing to know about them by name.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    if (event.key !== nextKey && event.key !== prevKey && event.key !== 'Home' && event.key !== 'End') return;

    const container = containerRef.current;
    if (!container) return;
    const controls = getControls(container);
    if (controls.length === 0) return;
    const currentIndex = controls.indexOf(event.target as HTMLElement);
    if (currentIndex === -1) return;

    const moveTo = (index: number) => {
      currentIndexRef.current = index;
      applyRovingTabIndex(controls, index);
      controls[index].focus();
    };

    if (event.key === nextKey) {
      for (let i = currentIndex + 1; i < controls.length; i++) {
        if (!isControlDisabled(controls[i])) {
          event.preventDefault();
          moveTo(i);
          break;
        }
      }
    } else if (event.key === prevKey) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (!isControlDisabled(controls[i])) {
          event.preventDefault();
          moveTo(i);
          break;
        }
      }
    } else if (event.key === 'Home') {
      const i = controls.findIndex((control) => !isControlDisabled(control));
      if (i !== -1) {
        event.preventDefault();
        moveTo(i);
      }
    } else if (event.key === 'End') {
      for (let i = controls.length - 1; i >= 0; i--) {
        if (!isControlDisabled(controls[i])) {
          event.preventDefault();
          moveTo(i);
          break;
        }
      }
    }
  };

  const handleOverflowAction = (id: string) => {
    const element = overflowElementsRef.current.get(id);
    const onClickProp = (element?.props as { onClick?: (event: unknown) => void } | undefined)?.onClick;
    onClickProp?.({});
  };

  const separatorOrientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
  const renderSeparator = (key: string, ref?: (node: HTMLElement | null) => void) => (
    <span key={key} ref={ref} className="ds-toolbar__separator" data-part="separator">
      <Divider orientation={separatorOrientation} />
    </span>
  );

  let visibleEntries = entries;
  if (isMenuOverflow) {
    const count = renderCount === null ? entries.length : Math.min(renderCount, entries.length);
    visibleEntries = entries.slice(0, count);
    while (visibleEntries.length > 0 && visibleEntries[visibleEntries.length - 1].kind === 'separator') {
      visibleEntries = visibleEntries.slice(0, -1);
    }
  }
  const hiddenEntries = isMenuOverflow ? entries.slice(visibleEntries.length).filter((entry) => entry.kind !== 'separator') : [];

  overflowElementsRef.current.clear();
  const menuItems: MenuItem[] = hiddenEntries.flatMap((entry): MenuItem[] => {
    if (entry.kind === 'group') {
      const groupProps = entry.element.props;
      const groupChildren = Children.toArray(groupProps.children).filter(isValidElement) as ReactElement[];
      const actions = groupChildren.map((child, childIndex) => {
        const id = `${entry.key}-${childIndex}`;
        overflowElementsRef.current.set(id, child);
        return actionFromElement(child, id);
      });
      return groupProps.label ? [{ group: groupProps.label, items: actions }] : actions;
    }
    overflowElementsRef.current.set(entry.key, entry.element);
    return [actionFromElement(entry.element, entry.key)];
  });

  const mountMoreButton = isMenuOverflow && (renderCount === null || hiddenEntries.length > 0);
  const moreButtonStyle: CSSProperties | undefined =
    isMenuOverflow && hiddenEntries.length === 0 ? { visibility: 'hidden', position: 'absolute' } : undefined;

  const classes = [
    'ds-toolbar',
    `ds-toolbar--${orientation}`,
    `ds-toolbar--overflow-${overflow}`,
    `ds-toolbar--size-${size}`,
    density === 'compact' ? 'ds-toolbar--density-compact' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <div
      {...rest}
      ref={setContainerRef}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-ds="Toolbar"
      data-part="container"
      className={classes}
      style={mergedStyle}
      onFocus={handleFocusIn}
      onKeyDown={handleKeyDown}
    >
      {isMenuOverflow
        ? visibleEntries.map((entry, index) => {
            const setItemRef = (node: HTMLElement | null) => {
              itemNodesRef.current[index] = node;
            };
            if (entry.kind === 'separator') return renderSeparator(entry.key, setItemRef);
            return (
              <span key={entry.key} ref={setItemRef} className="ds-toolbar__item">
                {entry.element}
              </span>
            );
          })
        : entries.map((entry) => (entry.kind === 'separator' ? renderSeparator(entry.key) : entry.element))}
      {mountMoreButton ? (
        <span ref={(node) => { moreItemRef.current = node; }} className="ds-toolbar__item ds-toolbar__more" style={moreButtonStyle}>
          <Menu
            label={COPY.more}
            items={menuItems.length > 0 ? menuItems : [{ id: 'ds-toolbar-more-empty', label: COPY.more, disabled: true }]}
            triggerVariant="ghost"
            triggerIcon="ellipsis"
            iconOnly
            data-part="overflowMenu"
            onAction={handleOverflowAction}
          />
        </span>
      ) : null}
    </div>
  );
});
