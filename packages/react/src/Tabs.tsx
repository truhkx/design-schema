import {
  Children,
  cloneElement,
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

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export interface TabPanelProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'className' | 'style'> {
  /** Matches the `id` of the tab this panel belongs to. */
  id: string;
  children: ReactNode;
}

/** The wrapper for one tab's content — a child of `Tabs`, one per tab, in the same order. */
export function TabPanel({ ref, id, children, ...rest }: TabPanelProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  return (
    <div {...rest} ref={ref} id={id} role="tabpanel" tabIndex={0} data-ds="TabPanel" data-part="panel" className="ds-tabs__panel">
      {children}
    </div>
  );
}

export interface TabsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange' | 'defaultValue' | 'className' | 'style'> {
  /** The tabs in order. `badge` is a short count or status shown after the label ("3", "New"). */
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
  /** Initially selected tab id. Defaults to the first enabled tab. */
  defaultValue?: string | undefined;
  /**
   * `automatic` selects a tab as arrow keys move to it (fine when panels are cheap); `manual`
   * moves focus only and selects on Enter/Space (use when a panel loads data).
   */
  activation?: TabsActivation | undefined;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  orientation?: TabsOrientation | undefined;
  /** `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs). */
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
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const items = tabs;
  const allPanels = Children.toArray(children).filter(isValidElement) as ReactElement<TabPanelProps>[];
  const panelIds = new Set(allPanels.map((panel) => panel.props.id));
  const tabIds = new Set(items.map((tab) => tab.id));
  // A tab without a matching panel, or a panel without a tab, is not rendered.
  const renderTabs = items.filter((tab) => panelIds.has(tab.id));
  const panels = allPanels.filter((panel) => tabIds.has(panel.props.id));

  const orphanKey = [
    ...items.filter((tab) => !panelIds.has(tab.id)).map((tab) => `tab:${tab.id}`),
    ...allPanels.filter((panel) => !tabIds.has(panel.props.id)).map((panel) => `panel:${panel.props.id}`),
  ].join('|');

  useEffect(() => {
    if (!isDev || !orphanKey) return;
    for (const entry of orphanKey.split('|')) {
      const [kind, id] = entry.split(':');
      console.warn(
        kind === 'tab'
          ? `Tabs: tab "${id}" has no matching TabPanel; it is not rendered.`
          : `Tabs: TabPanel "${id}" has no matching tab; it is not rendered.`,
      );
    }
  }, [orphanKey]);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(() => defaultValue ?? firstEnabledId(renderTabs));
  const selected = isControlled ? value : internalValue;

  // The roving-tabindex target: follows the selection, but under manual activation leads it until
  // Enter/Space catches the selection up.
  const [activeId, setActiveId] = useState<string | undefined>(selected);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties | undefined>(undefined);

  useEffect(() => {
    setActiveId(selected);
  }, [selected]);

  // Only enabled, rendered tabs can hold the tab stop; fall back to the first enabled one.
  const enabled = renderTabs.filter((tab) => !tab.disabled);
  const tabStopId = enabled.some((tab) => tab.id === activeId) ? activeId : enabled[0]?.id;

  const selectTab = (id: string): void => {
    if (id === selected) return;
    if (!isControlled) setInternalValue(id);
    onChange?.(id);
  };

  // Position the indicator on the selected tab and keep that tab scrolled into view within the list.
  useLayoutEffect(() => {
    const list = listRef.current;
    const tabEl = selected ? tabRefs.current.get(selected) : undefined;
    if (!list || !tabEl) {
      setIndicatorStyle(undefined);
      return undefined;
    }

    let last = '';
    const measure = (): void => {
      const next =
        orientation === 'horizontal'
          ? { insetInlineStart: tabEl.offsetLeft, inlineSize: tabEl.offsetWidth }
          : { insetBlockStart: tabEl.offsetTop, blockSize: tabEl.offsetHeight };
      const key = JSON.stringify(next);
      if (key === last) return;
      last = key;
      setIndicatorStyle(next);
    };
    measure();

    // Scroll the list only, never the page.
    if (orientation === 'horizontal') {
      const start = tabEl.offsetLeft;
      const end = start + tabEl.offsetWidth;
      if (start < list.scrollLeft) list.scrollLeft = start;
      else if (end > list.scrollLeft + list.clientWidth) list.scrollLeft = end - list.clientWidth;
    }

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [selected, orientation, fit, renderTabs.length]);

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (enabled.length === 0) return;
    const focusedId = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"]')?.dataset.tabId ?? tabStopId;
    const currentIndex = enabled.findIndex((tab) => tab.id === focusedId);
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

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
          selectTab(focusedId);
        }
        break;
      default:
        break;
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
        className="ds-tabs__list"
        onKeyDown={handleListKeyDown}
      >
        {renderTabs.map((tab, index) => {
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
              id={`${baseId}-tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={isSelected ? 'true' : 'false'}
              aria-controls={mountedPanelIds.has(tab.id) ? tab.id : undefined}
              aria-disabled={tab.disabled ? 'true' : undefined}
              aria-posinset={index + 1}
              aria-setsize={renderTabs.length}
              tabIndex={tab.id === tabStopId ? 0 : -1}
              data-part="tab"
              className={[
                'ds-tabs__tab',
                isSelected ? 'ds-tabs__tab--selected' : null,
                tab.disabled ? 'ds-tabs__tab--disabled' : null,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (tab.disabled) return;
                setActiveId(tab.id);
                selectTab(tab.id);
              }}
            >
              {tab.icon ? (
                <span className="ds-tabs__tab-icon" data-part="tabIcon">
                  <Icon name={tab.icon} inline />
                </span>
              ) : null}
              <span className="ds-tabs__tab-label" data-part="tabLabel">
                {tab.label}
              </span>
              {tab.badge ? (
                <span className="ds-tabs__badge" data-part="tabBadge">
                  {/* Keeps the badge a separate word in the tab's name ("Inbox 3"). */}
                  {' '}
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
        <span aria-hidden="true" data-part="indicator" className="ds-tabs__indicator" style={indicatorStyle} />
      </div>
      <div className="ds-tabs__panels">
        {panels.map((panel) => {
          const panelId = panel.props.id;
          if (!mountedPanelIds.has(panelId)) return null;
          return cloneElement(panel, {
            key: panelId,
            'aria-labelledby': `${baseId}-tab-${panelId}`,
            hidden: panelId !== selected,
          });
        })}
      </div>
    </div>
  );
}
