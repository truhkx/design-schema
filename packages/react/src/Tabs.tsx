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
  | 'indicatorThickness'
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
  indicatorThickness: '--ds-tabs-indicator-thickness',
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

function overridesToStyle(overrides: Partial<Record<TabsOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TabsOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

function firstEnabledId(items: TabsItem[]): string | undefined {
  return items.find((item) => !item.disabled)?.id ?? items[0]?.id;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export interface TabPanelProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id'> {
  /** Matches the `id` of the tab this panel belongs to. */
  id: string;
  children: ReactNode;
}

/** The wrapper for one tab's content — a direct child of `Tabs`, one per tab, in the same order. */
export const TabPanel = function TabPanel({ ref, id, children, className, ...rest }: TabPanelProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  return (
    <div
      {...rest}
      ref={ref}
      id={id}
      role="tabpanel"
      tabIndex={0}
      data-ds="TabPanel"
      data-part="panel"
      className={['ds-tabs__panel', className ?? null].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
};

export interface TabsProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> {
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
  onChange?: ((id: string) => void) | undefined;
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
export const Tabs = function Tabs({
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
  className,
  style,
  ...rest
}: TabsProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const baseId = `ds-tabs${generatedId}`;

  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const allPanels = Children.toArray(children).filter(isValidElement) as ReactElement<TabPanelProps>[];
  const panelIds = new Set(allPanels.map((panel) => panel.props.id));
  const tabIds = new Set(tabs.map((tab) => tab.id));
  const renderTabs = tabs.filter((tab) => panelIds.has(tab.id));
  const panels = allPanels.filter((panel) => tabIds.has(panel.props.id));

  if (isDev && !label) {
    console.warn('Tabs: `label` is required and becomes the tab list’s accessible name.');
  }
  if (isDev) {
    for (const tab of tabs) {
      if (!panelIds.has(tab.id)) console.warn(`Tabs: tab "${tab.id}" has no matching panel; it will not be rendered.`);
    }
    for (const panel of allPanels) {
      if (!tabIds.has(panel.props.id)) {
        console.warn(`Tabs: panel "${panel.props.id}" has no matching tab; it will not be rendered.`);
      }
    }
  }

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    () => defaultValue ?? firstEnabledId(renderTabs),
  );
  const selected = isControlled ? value : internalValue;

  // The roving-tabindex target: tracks the selection under automatic activation, but can lead it
  // under manual activation until Enter/Space catches the selection up.
  const [activeId, setActiveId] = useState<string | undefined>(selected);
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>();

  useEffect(() => {
    setActiveId(selected);
  }, [selected]);

  const selectTab = (id: string) => {
    if (!isControlled) setInternalValue(id);
    if (id !== selected) onChange?.(id);
  };

  const setTabRef = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(id, el);
    else tabRefs.current.delete(id);
  };

  const focusTab = (id: string) => {
    setActiveId(id);
    tabRefs.current.get(id)?.focus();
  };

  // Position the indicator under (horizontal) or beside (vertical) the selected tab, and keep it
  // scrolled into view; reflows on resize since `fill` widths and wrapped labels can change.
  useLayoutEffect(() => {
    const tabEl = selected ? tabRefs.current.get(selected) : undefined;
    if (!tabEl) return undefined;

    const measure = () => {
      setIndicatorStyle(
        orientation === 'horizontal'
          ? { insetInlineStart: tabEl.offsetLeft, inlineSize: tabEl.offsetWidth }
          : { insetBlockStart: tabEl.offsetTop, blockSize: tabEl.offsetHeight },
      );
    };
    measure();
    if (typeof tabEl.scrollIntoView === 'function') tabEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected, orientation, fit, tabs]);

  const handleTabClick = (tab: TabsItem) => {
    if (tab.disabled) return;
    setActiveId(tab.id);
    selectTab(tab.id);
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabled = renderTabs.filter((tab) => !tab.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((tab) => tab.id === activeId);
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';

    const moveTo = (id: string) => {
      focusTab(id);
      if (activation === 'automatic') selectTab(id);
    };

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        moveTo(enabled[(currentIndex + 1) % enabled.length]!.id);
        break;
      case prevKey:
        event.preventDefault();
        moveTo(enabled[(currentIndex - 1 + enabled.length) % enabled.length]!.id);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(enabled[0]!.id);
        break;
      case 'End':
        event.preventDefault();
        moveTo(enabled[enabled.length - 1]!.id);
        break;
      case 'Enter':
      case ' ':
        if (activation === 'manual' && activeId) {
          event.preventDefault();
          selectTab(activeId);
        }
        break;
      default:
        break;
    }
  };

  const classes = ['ds-tabs', `ds-tabs--${orientation}`, `ds-tabs--fit-${fit}`, className ?? null]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <div {...rest} ref={ref} data-ds="Tabs" className={classes} style={mergedStyle}>
      <div
        role="tablist"
        aria-label={label}
        aria-orientation={orientation}
        data-part="tablist"
        className="ds-tabs__list"
        onKeyDown={handleListKeyDown}
      >
        {renderTabs.map((tab) => {
          const tabId = `${baseId}-tab-${tab.id}`;
          const isSelected = tab.id === selected;
          const tabClasses = [
            'ds-tabs__tab',
            isSelected ? 'ds-tabs__tab--selected' : null,
            tab.disabled ? 'ds-tabs__tab--disabled' : null,
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={tab.id}
              ref={setTabRef(tab.id)}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={isSelected ? 'true' : 'false'}
              aria-controls={tab.id}
              aria-disabled={tab.disabled ? 'true' : undefined}
              tabIndex={tab.id === activeId ? 0 : -1}
              data-part="tab"
              className={tabClasses}
              onClick={() => handleTabClick(tab)}
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
                <span className="ds-tabs__badge" data-part="badge">
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
          const isSelected = panelId === selected;
          if (!isSelected && !keepMounted) return null;
          return cloneElement(panel, {
            key: panelId,
            'aria-labelledby': `${baseId}-tab-${panelId}`,
            hidden: !isSelected,
          });
        })}
      </div>
    </div>
  );
};
