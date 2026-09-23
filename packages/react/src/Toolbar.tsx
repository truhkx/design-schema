import {
  Children,
  cloneElement,
  Fragment,
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
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Divider } from './Divider';
import { Menu, type MenuAction, type MenuItem } from './Menu';
import { Search } from './Search';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';
import './Toolbar.css';

declare const process: { env: { NODE_ENV?: string | undefined } };

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
  groupGap: '--ds-toolbar-group-gap',
  separatorLength: '--ds-toolbar-separator-length',
  fadeWidth: '--ds-toolbar-fade-width',
};

function overridesToStyle(overrides: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ToolbarOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    // Locked bindings are not in the type; one passed anyway has no hook and is ignored.
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { more: 'More' };

// The roving list: native controls that are not natively disabled, the checked radio of a radio
// group (SegmentedControl, RadioGroup count as one control), and anything with an explicit tabindex.
const FOCUSABLE_SELECTOR = [
  'button:not([role="radio"]):not(:disabled)',
  '[role="radio"][aria-checked="true"]:not(:disabled)',
  'select:not(:disabled)',
  'input:not([type="hidden"]):not([type="radio"]):not(:disabled)',
  'input[type="radio"]:checked:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not(button):not(input):not(select):not(textarea):not([role="radio"])',
].join(',');

function isControlDisabled(element: HTMLElement): boolean {
  return element.getAttribute('aria-disabled') === 'true';
}

function firstFocusable(item: Element): HTMLElement | undefined {
  if (item instanceof HTMLElement && item.matches(FOCUSABLE_SELECTOR)) return item;
  return item.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? undefined;
}

/**
 * One roving stop per control: each top-level entry, and each child of a top-level ToolbarGroup, gives
 * its first focusable descendant — so a SegmentedControl is one stop (its checked radio) and any other
 * wrapper is one bare control. The overflow Menu's root is an entry like any other (its trigger); its
 * popup is portaled, so nothing inside it is ever matched here.
 */
function getControls(row: HTMLElement): HTMLElement[] {
  const controls: HTMLElement[] = [];
  const visit = (item: Element): void => {
    const control = firstFocusable(item);
    if (control) controls.push(control);
  };
  for (const child of Array.from(row.children)) {
    if (child.classList.contains('ds-toolbar__separator') || child.classList.contains('ds-toolbar__reserve')) continue;
    const items = child.classList.contains('ds-toolbar__entry') ? Array.from(child.children) : [child];
    for (const item of items) {
      if (item.getAttribute('data-ds') === 'ToolbarGroup') Array.from(item.children).forEach(visit);
      else visit(item);
    }
  }
  return controls;
}

// Writes only on a real change: a same-value tabIndex write still queues a mutation record, and the
// roving effect's MutationObserver watches `tabindex`, so an unconditional write re-fires it forever.
function applyRovingTabIndex(controls: HTMLElement[], current: HTMLElement | undefined): void {
  for (const control of controls) {
    const next = control === current ? 0 : -1;
    if (control.tabIndex !== next) control.tabIndex = next;
  }
}

/** Expands Fragments so `<>…</>` children still yield one entry per control or group. */
function flattenChildren(children: ReactNode): ReactElement<any>[] {
  const result: ReactElement<any>[] = [];
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    if (child.type === Fragment) result.push(...flattenChildren((child.props as { children?: ReactNode }).children));
    else result.push(child as ReactElement<any>);
  }
  return result;
}

// The package components with a `size` prop, recognised by identity — never by probing for the prop —
// mapped to the toolbar sizes each one actually accepts. Search has no `sm`, so a `sm` toolbar leaves
// every Search at its own default.
const SIZED_COMPONENTS: ReadonlyMap<unknown, ReadonlySet<ToolbarSize>> = new Map<unknown, ReadonlySet<ToolbarSize>>([
  [Button, new Set<ToolbarSize>(['sm', 'md'])],
  [SegmentedControl, new Set<ToolbarSize>(['sm', 'md'])],
  [Select, new Set<ToolbarSize>(['sm', 'md'])],
  [Search, new Set<ToolbarSize>(['md'])],
]);

/** Applies the toolbar's `size` to a sized package control that did not set its own. */
function withSize(element: ReactElement<any>, size: ToolbarSize, key?: string): ReactElement<any> {
  const props = element.props as { size?: unknown };
  if (!SIZED_COMPONENTS.get(element.type)?.has(size) || props.size !== undefined) {
    return key === undefined ? element : cloneElement(element, { key });
  }
  return cloneElement(element, key === undefined ? { size } : { size, key });
}

type ToolbarEntry = {
  key: string;
  /** The entry's place in the toolbar, `entry-<i>`: its overflow Menu item id and warning identity. */
  id: string;
  kind: 'control' | 'group';
  element: ReactElement<any>;
  /** Only Buttons collapse, and a group only as a whole, when every control in it is a Button. */
  collapsible: boolean;
};

function buildEntries(children: ReactNode): ToolbarEntry[] {
  return flattenChildren(children).map((element, index): ToolbarEntry => {
    const key = element.key !== null ? String(element.key) : `ds-toolbar-entry-${index}`;
    const id = `entry-${index}`;
    if (element.type === ToolbarGroup) {
      const groupChildren = flattenChildren((element.props as ToolbarGroupProps).children);
      const collapsible = groupChildren.length > 0 && groupChildren.every((child) => child.type === Button);
      return { key, id, kind: 'group', element, collapsible };
    }
    return { key, id, kind: 'control', element, collapsible: element.type === Button };
  });
}

function actionFromButton(element: ReactElement<any>, id: string, warned: Set<string>): MenuAction {
  const props = element.props as { overflowLabel?: string | undefined; label?: string | undefined; disabled?: boolean | undefined };
  if (props.overflowLabel === undefined && process.env.NODE_ENV !== 'production' && !warned.has(id)) {
    warned.add(id);
    console.warn(`Toolbar: a collapsed Button ("${props.label ?? id}") has no overflowLabel; its label is used in the overflow Menu.`);
  }
  // Button's children are not part of its API, so the chain ends at `label` (required on Button).
  return { id, label: props.overflowLabel ?? props.label ?? id, disabled: props.disabled === true };
}

/** A text-entry control keeps ArrowLeft, ArrowRight, Home and End for its caret. */
function isTextEntry(element: HTMLElement): boolean {
  if (element instanceof HTMLTextAreaElement || element.isContentEditable) return true;
  if (!(element instanceof HTMLInputElement)) return false;
  return !['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].includes(element.type);
}

function readPx(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface ToolbarGroupProps extends Omit<ComponentPropsWithoutRef<'div'>, 'role' | 'className' | 'style'> {
  /** The group's accessible name; also its heading when the group collapses into the "More" Menu. */
  label?: string | undefined;
  /** The group's controls, in order. */
  children: ReactNode;
}

/** Groups related controls inside a Toolbar; a Divider is drawn between adjacent groups. */
export function ToolbarGroup({
  ref,
  label,
  children,
  ...rest
}: ToolbarGroupProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  return (
    <div {...rest} ref={ref} role="group" aria-label={label} data-ds="ToolbarGroup" data-part="group" className="ds-toolbar__group">
      {children}
    </div>
  );
}

export interface ToolbarProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'aria-label' | 'aria-orientation' | 'className' | 'style'> {
  /** What the toolbar controls ("Formatting", "Table actions"). Not visible; read by assistive technology. */
  label: string;
  /**
   * Controls in order: Buttons (usually `ghost` or `secondary`, `iconOnly` for glyph tools),
   * SegmentedControl, Select, Switch. Group related controls with `ToolbarGroup`; a Divider is drawn
   * between two adjacent groups only (a bare control next to a group gets `itemGap`, no Divider).
   * Consumers never place Dividers themselves.
   */
  children: ReactNode;
  /** Vertical toolbars sit beside a canvas; arrow keys swap axes. */
  orientation?: ToolbarOrientation | undefined;
  /**
   * What happens when controls do not fit: wrap onto more rows, collapse trailing controls into a
   * "More" Menu (each collapsible control must provide `overflowLabel`), or scroll horizontally with
   * the edges faded. Collapsing takes whole entries from the end — a group goes into the Menu as a
   * group, never half of one — and the width budget reserves `size.target.min` for the More trigger
   * before it is rendered. `menu` is for horizontal toolbars; a vertical one treats it as `scroll`,
   * since a menu overflow assumes a fixed cross axis. An entry collapses only if every control in it
   * is a Button: walking from the end, an entry holding any other control is skipped and stays
   * visible. Collapsed controls are removed from the render and from the roving list.
   */
  overflow?: ToolbarOverflow | undefined;
  /**
   * Default for the child controls that have a `size` prop — Button, SegmentedControl, Select and
   * Search, recognised by component identity — and do not set their own. Applied to direct children
   * and to the children of each ToolbarGroup; a child's own `size` wins. The overflow Menu's trigger
   * takes no size.
   */
  size?: ToolbarSize | undefined;
  /** Gap between controls: tight or normal rhythm. */
  density?: ToolbarDensity | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToolbarOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Toolbar — Design Schema, category: navigation (APG toolbar).
 *
 * When to use:
 * Use a Toolbar for controls that act on the same thing and are used together: text formatting, a
 * table's row actions, a map's view switches, a data page's filter–sort–export row. Group by purpose
 * with `ToolbarGroup` (drawn with a Divider between groups). Use `overflow: menu` for toolbars whose
 * width the layout cannot guarantee; give every control an `overflowLabel` so it reads well as a
 * menu item.
 */
export function Toolbar({
  ref,
  label,
  children,
  orientation = 'horizontal',
  overflow = 'menu',
  size = 'md',
  density = 'comfortable',
  overrides,
  onFocus,
  onKeyDown,
  ...rest
}: ToolbarProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  // The row inside the toolbar's padding: it lays out, scrolls, clips and is masked, so the fade never
  // clouds the border or the padding.
  const rowRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLElement | null>(null);
  const entryNodesRef = useRef(new Map<string, HTMLElement>());
  const probeRef = useRef<HTMLSpanElement | null>(null);
  const observedWidthRef = useRef<number | null>(null);
  const warnedRef = useRef(new Set<string>());
  // Scroll fades: each edge fades only while content is hidden past it.
  const [fade, setFade] = useState<{ start: boolean; end: boolean }>({ start: false, end: false });

  // A vertical toolbar has no fixed cross axis to measure against, so `menu` scrolls instead.
  const effectiveOverflow: ToolbarOverflow = overflow === 'menu' && orientation === 'vertical' ? 'scroll' : overflow;
  const isMenuOverflow = effectiveOverflow === 'menu';

  // null = measuring: every entry is rendered so its size is known; otherwise the collapsed keys.
  const [hiddenKeys, setHiddenKeys] = useState<string[] | null>(null);

  const entries = buildEntries(children);
  const entriesKey = entries.map((entry) => `${entry.kind}:${entry.key}:${entry.collapsible ? 1 : 0}`).join('|');

  // New content, a new mode or a new rhythm invalidates the last measurement.
  useLayoutEffect(() => {
    if (isMenuOverflow) setHiddenKeys(null);
  }, [isMenuOverflow, entriesKey, size, density]);

  useLayoutEffect(() => {
    if (!isMenuOverflow) return undefined;
    const container = rowRef.current;
    if (!container) return undefined;

    if (hiddenKeys === null) {
      // The row carries no padding of its own; the toolbar's padding sits outside it.
      const available = container.clientWidth;
      const itemGap = readPx(getComputedStyle(container).columnGap);
      const widths = new Map<string, number>();
      for (const entry of entries) widths.set(entry.key, entryNodesRef.current.get(entry.key)?.offsetWidth ?? 0);
      const separatorNode = container.querySelector<HTMLElement>(':scope > [data-part="separator"]');
      const separatorWidth = separatorNode?.offsetWidth ?? 0;

      const widthOf = (visible: ToolbarEntry[]): number => {
        let total = 0;
        visible.forEach((entry, index) => {
          if (index > 0) total += itemGap;
          const previous = visible[index - 1];
          if (previous && previous.kind === 'group' && entry.kind === 'group') total += separatorWidth + itemGap;
          total += widths.get(entry.key) ?? 0;
        });
        return total;
      };

      const hidden = new Set<string>();
      if (widthOf(entries) > available) {
        // Reserve the More trigger's minimum target before deciding what goes behind it.
        const reserve = (probeRef.current?.offsetWidth ?? 0) + itemGap;
        for (let i = entries.length - 1; i >= 0; i--) {
          const visible = entries.filter((entry) => !hidden.has(entry.key));
          if (widthOf(visible) + reserve <= available) break;
          const entry = entries[i]!;
          if (entry.collapsible) hidden.add(entry.key);
        }
      }
      setHiddenKeys(entries.filter((entry) => hidden.has(entry.key)).map((entry) => entry.key));
      return undefined;
    }

    // jsdom has no ResizeObserver; the single measurement above still runs.
    if (typeof ResizeObserver === 'undefined') return undefined;
    // observe() always delivers one initial notification and this observer is re-created after every
    // measurement, so only a width different from the last one seen triggers a remeasure.
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = entry.contentRect.width;
      if (observedWidthRef.current === width) return;
      const isFirst = observedWidthRef.current === null;
      observedWidthRef.current = width;
      if (!isFirst) setHiddenKeys(null);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isMenuOverflow, hiddenKeys]);

  const isScrollOverflow = effectiveOverflow === 'scroll';
  useLayoutEffect(() => {
    const container = rowRef.current;
    if (!isScrollOverflow || !container) return undefined;
    const vertical = orientation === 'vertical';
    const check = () => {
      const offset = vertical ? container.scrollTop : Math.abs(container.scrollLeft);
      const hiddenLength = vertical
        ? container.scrollHeight - container.clientHeight
        : container.scrollWidth - container.clientWidth;
      const start = offset > 0;
      const end = offset < hiddenLength - 1;
      // Converges: state is set only when an edge actually changes, so the observer below settles.
      setFade((last) => (last.start === start && last.end === end ? last : { start, end }));
    };
    check();
    container.addEventListener('scroll', check, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(check);
    observer?.observe(container);
    for (const child of Array.from(container.children)) observer?.observe(child);
    return () => {
      container.removeEventListener('scroll', check);
      observer?.disconnect();
    };
  }, [isScrollOverflow, orientation, entriesKey]);

  // Roving tabindex: the toolbar is one tab stop. Requery on every DOM change (controls mounting,
  // collapsing, or a composite control moving its own checked radio) so the stop is always real.
  useLayoutEffect(() => {
    const container = rowRef.current;
    if (!container) return undefined;

    const sync = () => {
      const controls = getControls(container);
      if (controls.length === 0) return;
      let current = currentRef.current;
      if (!current || !controls.includes(current)) {
        current = controls.find((control) => !isControlDisabled(control)) ?? controls[0]!;
        currentRef.current = current;
      }
      applyRovingTabIndex(controls, current);
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

  const indexOfTarget = (controls: HTMLElement[], target: EventTarget): number =>
    controls.findIndex((control) => control === target || control.contains(target as Node));

  const handleFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    const container = rowRef.current;
    if (!container) return;
    const controls = getControls(container);
    const index = indexOfTarget(controls, event.target);
    if (index === -1) return;
    currentRef.current = controls[index]!;
    applyRovingTabIndex(controls, currentRef.current);
  };

  // A control with its own arrow-key model (SegmentedControl, RadioGroup) handles the key first; the
  // toolbar acts only when the control did not.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    if (event.key !== nextKey && event.key !== prevKey && event.key !== 'Home' && event.key !== 'End') return;

    const container = rowRef.current;
    if (!container) return;
    const controls = getControls(container);
    const currentIndex = indexOfTarget(controls, event.target);
    if (currentIndex === -1) return;
    // A text-entry control keeps these keys for its caret; the toolbar never takes them.
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && isTextEntry(event.target as HTMLElement)) return;

    const enabledIndexes = controls.map((control, index) => (isControlDisabled(control) ? -1 : index)).filter((index) => index !== -1);
    let target: number | undefined;
    if (event.key === nextKey) target = enabledIndexes.find((index) => index > currentIndex);
    else if (event.key === prevKey) target = enabledIndexes.filter((index) => index < currentIndex).pop();
    else if (event.key === 'Home') target = enabledIndexes[0];
    else target = enabledIndexes[enabledIndexes.length - 1];

    // No wrapping: at an end the key is left alone.
    if (target === undefined || target === currentIndex) return;
    event.preventDefault();
    const control = controls[target]!;
    currentRef.current = control;
    applyRovingTabIndex(controls, control);
    control.focus();
  };

  const hidden = new Set(isMenuOverflow && hiddenKeys !== null ? hiddenKeys : []);
  const visibleEntries = entries.filter((entry) => !hidden.has(entry.key));
  const hiddenEntries = entries.filter((entry) => hidden.has(entry.key));

  const overflowButtons = new Map<string, ReactElement<any>>();
  const menuItems: MenuItem[] = [];
  for (const entry of hiddenEntries) {
    if (entry.kind === 'group') {
      const groupProps = entry.element.props as ToolbarGroupProps;
      const actions = flattenChildren(groupProps.children).map((child, index) => {
        const id = `${entry.id}-${index}`;
        overflowButtons.set(id, child);
        return actionFromButton(child, id, warnedRef.current);
      });
      if (groupProps.label) menuItems.push({ group: groupProps.label, items: actions });
      else {
        if (menuItems.length > 0) menuItems.push({ separator: true });
        menuItems.push(...actions);
      }
    } else {
      overflowButtons.set(entry.id, entry.element);
      menuItems.push(actionFromButton(entry.element, entry.id, warnedRef.current));
    }
  }

  // Button's `onPress` contract has no payload, so the collapsed Button's onClick is called bare.
  const handleOverflowAction = (id: string) => {
    const element = overflowButtons.get(id);
    const onClick = (element?.props as { onClick?: (() => void) | undefined } | undefined)?.onClick;
    onClick?.();
  };

  const separatorOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical';

  const renderEntry = (entry: ToolbarEntry): ReactElement => {
    const element =
      entry.kind === 'group'
        ? cloneElement(entry.element, {
            key: entry.key,
            children: flattenChildren((entry.element.props as ToolbarGroupProps).children).map((child, index) =>
              withSize(child, size, child.key !== null ? String(child.key) : `ds-toolbar-control-${index}`),
            ),
          })
        : withSize(entry.element, size, entry.key);
    if (!isMenuOverflow) return element;
    return (
      <span
        key={entry.key}
        className="ds-toolbar__entry"
        ref={(node) => {
          if (node) entryNodesRef.current.set(entry.key, node);
          else entryNodesRef.current.delete(entry.key);
        }}
      >
        {element}
      </span>
    );
  };

  const content: ReactElement[] = [];
  visibleEntries.forEach((entry, index) => {
    const previous = visibleEntries[index - 1];
    if (previous && previous.kind === 'group' && entry.kind === 'group') {
      content.push(
        <span key={`${entry.key}-separator`} className="ds-toolbar__separator" data-part="separator">
          <Divider orientation={separatorOrientation} spacing="none" />
        </span>,
      );
    }
    content.push(renderEntry(entry));
  });

  const classes = [
    'ds-toolbar',
    `ds-toolbar--${orientation}`,
    `ds-toolbar--overflow-${effectiveOverflow}`,
    `ds-toolbar--${density}`,
    isScrollOverflow && fade.start ? 'ds-toolbar--fade-start' : '',
    isScrollOverflow && fade.end ? 'ds-toolbar--fade-end' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...rest}
      ref={ref}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      data-ds="Toolbar"
      data-part="container"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    >
      <div ref={rowRef} className="ds-toolbar__row">
        {content}
        {isMenuOverflow ? <span ref={probeRef} className="ds-toolbar__reserve" aria-hidden="true" /> : null}
        {isMenuOverflow && menuItems.length > 0 ? (
          <Menu
            label={COPY.more}
            items={menuItems}
            triggerVariant="ghost"
            triggerIcon="ellipsis"
            iconOnly
            data-part="overflowMenu"
            onAction={handleOverflowAction}
          />
        ) : null}
      </div>
    </div>
  );
}
