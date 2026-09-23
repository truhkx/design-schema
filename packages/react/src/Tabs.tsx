import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Context,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Icon, type IconName } from './Icon';
import './Tabs.css';

export type TabsActivation = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsFit = 'start' | 'fill';

/** One tab. `badge` is a short count or status shown after the label ("3", "New"). */
export type TabsItem = { id: string; label: string; icon?: IconName | undefined; disabled?: boolean | undefined; badge?: string | undefined };

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type TabsOverridableBinding =
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'tabGap'
  | 'listGap'
  | 'listBorder'
  | 'listBorderWidth'
  | 'panelGap'
  | 'badgeWeight'
  | 'badgeSize'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'radius'
  | 'transition'
  | 'disabledOpacity';

const OVERRIDE_HOOK: Record<TabsOverridableBinding, string> = {
  tabPaddingBlock: '--ds-tabs-tab-padding-block',
  tabPaddingInline: '--ds-tabs-tab-padding-inline',
  tabGap: '--ds-tabs-tab-gap',
  listGap: '--ds-tabs-list-gap',
  listBorder: '--ds-tabs-list-border',
  listBorderWidth: '--ds-tabs-list-border-width',
  panelGap: '--ds-tabs-panel-gap',
  badgeWeight: '--ds-tabs-badge-weight',
  badgeSize: '--ds-tabs-badge-size',
  fontFamily: '--ds-tabs-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-tabs-font-size',
  fontWeight: '--ds-tabs-font-weight',
  lineHeight: '--ds-tabs-line-height',
  radius: '--ds-tabs-radius',
  transition: '--ds-tabs-transition',
  disabledOpacity: '--ds-tabs-disabled-opacity',
};

function overridesToStyle(overrides: Partial<Record<TabsOverridableBinding, TokenRef | undefined>>): CSSProperties | undefined {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TabsOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    // Locked bindings have no hook and are ignored if passed.
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

function firstEnabledId(items: TabsItem[]): string | undefined {
  return items.find((item) => !item.disabled)?.id ?? items[0]?.id;
}

/** The list's writing direction: RTL swaps ArrowLeft/ArrowRight and mirrors the indicator's offset. */
function isRtl(el: HTMLElement | null): boolean {
  if (!el || typeof getComputedStyle !== 'function') return false;
  return getComputedStyle(el).direction === 'rtl';
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

interface TabsPanelContextValue {
  tabDomId: (id: string) => string;
  panelDomId: (id: string) => string;
  selected: string | undefined;
}

/** Gives each TabPanel its prefixed DOM id, its labelling tab and its hidden state. */
const TabsPanelContext: Context<TabsPanelContextValue | null> = createContext<TabsPanelContextValue | null>(null);

export interface TabPanelProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'className' | 'style' | 'hidden'> {
  /** Matches the `id` of the tab this panel belongs to. The DOM id is this value prefixed per Tabs instance. */
  id: string;
  children: ReactNode;
}

/** The wrapper for one tab's content — a child of `Tabs`, one per tab, in the same order. */
export function TabPanel({ ref, id, children, ...rest }: TabPanelProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const ctx = useContext(TabsPanelContext);
  return (
    <div
      {...rest}
      ref={ref}
      id={ctx ? ctx.panelDomId(id) : id}
      role="tabpanel"
      aria-labelledby={ctx ? ctx.tabDomId(id) : undefined}
      tabIndex={0}
      hidden={ctx ? id !== ctx.selected : undefined}
      data-ds="TabPanel"
      data-part="panel"
      className="ds-tabs__panel"
    >
      {children}
    </div>
  );
}

export interface TabsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange' | 'defaultValue' | 'className' | 'style'> {
  /**
   * The tabs in order. `badge` is a short count or status shown after the label ("3", "New"). The
   * icon is an Icon at `size: md` (the label's size) in the tab's current foreground color. An `id`
   * must be a valid IDREF token (no whitespace), since tab and panel element ids are built from it;
   * the component does not sanitize it.
   */
  tabs: TabsItem[];
  /**
   * One panel per tab, in the same order, each wrapped in the exported `TabPanel` with a matching
   * `id`. Only the selected panel is rendered unless `keepMounted`.
   */
  children: ReactNode;
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  value?: string | undefined;
  /**
   * Initially selected tab id. Defaults to the first enabled tab. Taken verbatim, never corrected:
   * one naming a disabled tab selects it and shows its panel, one matching no tab selects nothing —
   * in both cases the roving tab stop falls back to the first enabled tab, and neither warns.
   */
  defaultValue?: string | undefined;
  /**
   * `automatic` selects a tab as arrow keys move to it (fine when panels are cheap); `manual`
   * moves focus only and selects on Enter/Space (use when a panel loads data).
   */
  activation?: TabsActivation | undefined;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  orientation?: TabsOrientation | undefined;
  /**
   * `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four
   * tabs). Horizontal only: vertical tabs always span the list's inline size.
   */
  fit?: TabsFit | undefined;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: ((value: string) => void) | undefined;
}

/**
 * Tabs — Design Schema, category: navigation.
 *
 * When to use:
 * Use Tabs to split a region's content into two to about seven views that are alternatives of each
 * other: the sections of a settings page, "Overview / Activity / Files" on a record, code and
 * preview. Use `manual` activation when a panel is expensive to show. Use `vertical` when there are
 * many tabs and horizontal room is short. Use `fill` on phones for two to four tabs.
 */
export function Tabs({
  ref,
  tabs,
  children,
  label,
  value,
  defaultValue,
  activation = 'automatic',
  orientation = 'horizontal',
  fit = 'start',
  keepMounted = false,
  overrides,
  onChange,
  ...rest
}: TabsProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const baseId = `ds-tabs${useId()}`;
  const tabDomId = (id: string): string => `${baseId}-tab-${id}`;
  const panelDomId = (id: string): string => `${baseId}-panel-${id}`;
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const allPanels = Children.toArray(children).filter(isValidElement) as ReactElement<TabPanelProps>[];
  const panelIds = new Set(allPanels.map((panel) => panel.props.id));
  const tabIds = new Set(tabs.map((tab) => tab.id));
  // A tab without a panel is still rendered (its panel region is empty); a panel without a tab is not shown.
  const panels = allPanels.filter((panel) => tabIds.has(panel.props.id));

  const orphanKey = [
    ...tabs.filter((tab) => !panelIds.has(tab.id)).map((tab) => `tab:${tab.id}`),
    ...allPanels.filter((panel) => !tabIds.has(panel.props.id)).map((panel) => `panel:${panel.props.id}`),
  ].join('|');

  useEffect(() => {
    if (!isDev || !orphanKey) return;
    for (const entry of orphanKey.split('|')) {
      const kind = entry.slice(0, entry.indexOf(':'));
      const id = entry.slice(entry.indexOf(':') + 1);
      console.warn(
        kind === 'tab'
          ? `Tabs: tab "${id}" has no matching TabPanel; its panel region is empty.`
          : `Tabs: TabPanel "${id}" has no matching tab; it is not shown.`,
      );
    }
  }, [orphanKey]);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(() => defaultValue ?? firstEnabledId(tabs));
  const selected = isControlled ? value : internalValue;

  // The roving-tabindex target: follows the selection, but under manual activation leads it until
  // Enter/Space catches the selection up, or focus leaves the list.
  const [activeId, setActiveId] = useState<string | undefined>(selected);
  // The indicator is placed instantly on first render and when the selected tab first appears; it
  // animates only when the selection moves from one tab to another.
  const [indicator, setIndicator] = useState<{ style: CSSProperties; animate: boolean } | undefined>(undefined);
  const placedFor = useRef<string | undefined>(undefined);
  // The tab a manual Enter/Space just selected, so the key's synthesized click does not repeat it.
  const keySelectedId = useRef<string | undefined>(undefined);

  useEffect(() => {
    setActiveId(selected);
  }, [selected]);

  // Only enabled tabs can hold the tab stop; fall back to the first enabled one.
  const enabled = tabs.filter((tab) => !tab.disabled);
  const tabStopId = enabled.some((tab) => tab.id === activeId) ? activeId : enabled[0]?.id;

  const selectTab = (id: string): void => {
    if (id === selected) return;
    if (!isControlled) setInternalValue(id);
    onChange?.(id);
  };

  // Position the indicator on the selected tab and keep that tab in view within the list.
  useLayoutEffect(() => {
    const list = listRef.current;
    const tabEl = selected ? tabRefs.current.get(selected) : undefined;
    if (!list || !tabEl) {
      placedFor.current = undefined;
      setIndicator(undefined);
      return undefined;
    }

    const moved = placedFor.current !== undefined && placedFor.current !== selected;
    placedFor.current = selected;

    // The tab's box within the list's client (padding) box, in the list's current scroll position.
    const clientBox = (): { left: number; right: number; top: number; bottom: number } => {
      const listRect = list.getBoundingClientRect();
      const tabRect = tabEl.getBoundingClientRect();
      const left = tabRect.left - listRect.left - list.clientLeft;
      const top = tabRect.top - listRect.top - list.clientTop;
      return { left, right: left + tabRect.width, top, bottom: top + tabRect.height };
    };

    let last = '';
    const measure = (): void => {
      // inset-inline-start is measured from the list's inline-start edge (from the right under RTL),
      // in scroll-content coordinates, so the value holds whatever the list's scroll offset is —
      // RTL browsers report a negative scrollLeft, which the subtraction below accounts for.
      const box = clientBox();
      const inlineStart = isRtl(list) ? list.clientWidth - box.right - list.scrollLeft : box.left + list.scrollLeft;
      const next =
        orientation === 'horizontal'
          ? { insetInlineStart: inlineStart, inlineSize: tabEl.offsetWidth }
          : { insetBlockStart: box.top + list.scrollTop, blockSize: tabEl.offsetHeight };
      const key = JSON.stringify(next);
      // Writing only on a real change keeps the ResizeObserver from re-firing itself.
      if (key === last) return;
      const isFirst = last === '';
      last = key;
      setIndicator({ style: next, animate: moved && isFirst });
    };

    measure();

    // Keep the selected tab in view by scrolling the list only, never the page (no scrollIntoView),
    // on first render too. Measured from the tab's offset within the list's client box, so it works
    // in both directions; animated unless reduced motion is on.
    const box = clientBox();
    const size = orientation === 'horizontal' ? list.clientWidth : list.clientHeight;
    const start = orientation === 'horizontal' ? box.left : box.top;
    const end = orientation === 'horizontal' ? box.right : box.bottom;
    const delta = start < 0 ? start : end > size ? Math.min(end - size, start) : 0;
    if (delta !== 0) {
      const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
      if (typeof list.scrollBy === 'function') {
        list.scrollBy(orientation === 'horizontal' ? { left: delta, behavior } : { top: delta, behavior });
      } else if (orientation === 'horizontal') list.scrollLeft += delta;
      else list.scrollTop += delta;
    }

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [selected, orientation, fit, tabs.length]);

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    keySelectedId.current = undefined;
    if (enabled.length === 0) return;
    const focusedId = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]')?.dataset.tabId ?? tabStopId;
    const currentIndex = enabled.findIndex((tab) => tab.id === focusedId);
    // In a right-to-left layout ArrowLeft and ArrowRight swap; Up/Down, Home and End do not.
    const rtl = orientation === 'horizontal' && isRtl(listRef.current);
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';

    const moveTo = (index: number): void => {
      const id = enabled[index]!.id;
      setActiveId(id);
      tabRefs.current.get(id)?.focus();
      if (activation === 'automatic') selectTab(id);
    };

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        moveTo(currentIndex < 0 ? 0 : (currentIndex + 1) % enabled.length);
        break;
      case prevKey:
        event.preventDefault();
        moveTo(currentIndex < 0 ? enabled.length - 1 : (currentIndex - 1 + enabled.length) % enabled.length);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(enabled.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (activation === 'manual' && focusedId && currentIndex >= 0) {
          event.preventDefault();
          // The native click a button may still synthesize from this key must not select twice.
          keySelectedId.current = focusedId;
          selectTab(focusedId);
        }
        break;
      default:
        break;
    }
  };

  // While focus is inside the list the tab stop follows the focused tab, however focus arrived
  // (key, click or a programmatic focus()), so an arrow always moves from the tab that has focus.
  const handleListFocus = (event: ReactFocusEvent<HTMLDivElement>): void => {
    const id = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]')?.dataset.tabId;
    if (id !== undefined && id !== activeId && enabled.some((tab) => tab.id === id)) setActiveId(id);
  };

  // Tab from outside lands on the selected tab: once focus leaves the list, the stop returns to it.
  const handleListBlur = (event: ReactFocusEvent<HTMLDivElement>): void => {
    const next = event.relatedTarget as Node | null;
    if (!next || !listRef.current?.contains(next)) {
      keySelectedId.current = undefined;
      if (activeId !== selected) setActiveId(selected);
    }
  };

  const mountedPanelIds = new Set(panels.map((panel) => panel.props.id).filter((id) => keepMounted || id === selected));

  return (
    <div
      {...rest}
      ref={ref}
      data-ds="Tabs"
      className={`ds-tabs ds-tabs--${orientation} ds-tabs--fit-${fit}`}
      style={overrides ? overridesToStyle(overrides) : undefined}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        data-part="tablist"
        className="ds-tabs__tablist"
        onKeyDown={handleListKeyDown}
        onFocus={handleListFocus}
        onBlur={handleListBlur}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === selected;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={tabDomId(tab.id)}
              data-tab-id={tab.id}
              aria-selected={isSelected ? 'true' : 'false'}
              aria-controls={mountedPanelIds.has(tab.id) ? panelDomId(tab.id) : undefined}
              aria-disabled={tab.disabled ? 'true' : undefined}
              tabIndex={tab.id === tabStopId ? 0 : -1}
              data-part="tab"
              className={[
                'ds-tabs__tab',
                isSelected ? 'ds-tabs__tab--selected' : null,
                tab.disabled ? 'ds-tabs__tab--disabled' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={(event) => {
                if (tab.disabled) return;
                if (event.detail === 0 && keySelectedId.current === tab.id) {
                  keySelectedId.current = undefined;
                  return;
                }
                setActiveId(tab.id);
                selectTab(tab.id);
              }}
            >
              {tab.icon ? (
                <span className="ds-tabs__tab-icon" data-part="tabIcon">
                  <Icon name={tab.icon} size="md" />
                </span>
              ) : null}
              <span className="ds-tabs__tab-label" data-part="tabLabel">
                {tab.label}
              </span>
              {tab.badge ? (
                <span className="ds-tabs__tab-badge" data-part="tabBadge">
                  {/* Keeps the badge a separate word in the tab's name ("Inbox 3"). */}
                  {' '}
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
        <span
          aria-hidden="true"
          data-part="indicator"
          data-animate={indicator?.animate ? 'true' : 'false'}
          className="ds-tabs__indicator"
          style={indicator?.style}
        />
      </div>
      <div className="ds-tabs__panels">
        <TabsPanelContext.Provider value={{ tabDomId, panelDomId, selected }}>
          {panels.filter((panel) => mountedPanelIds.has(panel.props.id))}
        </TabsPanelContext.Provider>
      </div>
    </div>
  );
}
