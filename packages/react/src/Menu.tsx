import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import './Menu.css';

export type MenuTriggerVariant = 'ghost' | 'secondary' | 'primary';
export type MenuTriggerIcon = 'ellipsis' | 'chevron-down' | 'none';
export type MenuPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type MenuItemTone = 'default' | 'danger';

/** A single actionable row. */
export type MenuAction = {
  id: string;
  label: string;
  icon?: IconName;
  shortcut?: string;
  tone?: MenuItemTone;
  disabled?: boolean;
};
/** A labelled cluster of items, rendered with a non-interactive heading row. */
export type MenuGroup = { group: string; items: MenuItem[] };
/** A divider between clusters of items. */
export type MenuSeparator = { separator: true };
export type MenuItem = MenuAction | MenuGroup | MenuSeparator;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type MenuOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'popupPadding'
  | 'popupOffset'
  | 'minWidth'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'itemRadius'
  | 'groupLabelSize'
  | 'groupLabelWeight'
  | 'shortcutSize'
  | 'separator'
  | 'separatorMargin'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'layer'
  | 'enter';

const OVERRIDE_HOOK: Record<MenuOverridableBinding, string> = {
  border: '--ds-menu-border',
  borderWidth: '--ds-menu-border-width',
  shadow: '--ds-menu-shadow',
  radius: '--ds-menu-radius',
  popupPadding: '--ds-menu-popup-padding',
  popupOffset: '--ds-menu-popup-offset',
  minWidth: '--ds-menu-min-width',
  itemPaddingBlock: '--ds-menu-item-padding-block',
  itemPaddingInline: '--ds-menu-item-padding-inline',
  itemGap: '--ds-menu-item-gap',
  itemRadius: '--ds-menu-item-radius',
  groupLabelSize: '--ds-menu-group-label-size',
  groupLabelWeight: '--ds-menu-group-label-weight',
  shortcutSize: '--ds-menu-shortcut-size',
  separator: '--ds-menu-separator',
  separatorMargin: '--ds-menu-separator-margin',
  fontFamily: '--ds-menu-font-family', /* literal-ok: CSS custom-property name, not a font stack */
  fontSize: '--ds-menu-font-size',
  lineHeight: '--ds-menu-line-height',
  layer: '--ds-menu-layer',
  enter: '--ds-menu-enter',
};

function overridesToStyle(overrides: Partial<Record<MenuOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as MenuOverridableBinding[]) {
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

function flattenActions(items: MenuItem[]): MenuAction[] {
  const result: MenuAction[] = [];
  for (const item of items) {
    if ('separator' in item) continue;
    if ('group' in item) result.push(...flattenActions(item.items));
    else result.push(item);
  }
  return result;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Moves focus to the next (or previous) document-order tabbable element relative to `anchor`,
 * ignoring anything inside `exclude` (the menu's own popup, which is about to close).
 */
function focusAdjacent(anchor: HTMLElement, exclude: HTMLElement | null, direction: 1 | -1) {
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !exclude || !exclude.contains(element),
  );
  const index = all.indexOf(anchor);
  if (index === -1) return;
  all[index + direction]?.focus();
}

type ResolvedPosition = { style: CSSProperties; vertical: 'top' | 'bottom' };

/** Positions the popup from the trigger's rect for `placement`, flipping either axis on overflow. */
function computePosition(triggerRect: DOMRect, popupRect: DOMRect, placement: MenuPlacement): ResolvedPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const [vert, horiz] = placement.split('-') as ['bottom' | 'top', 'start' | 'end'];

  let vertical = vert;
  if (
    vert === 'bottom' &&
    triggerRect.bottom + popupRect.height > viewportHeight &&
    triggerRect.top - popupRect.height >= 0
  ) {
    vertical = 'top';
  } else if (
    vert === 'top' &&
    triggerRect.top - popupRect.height < 0 &&
    triggerRect.bottom + popupRect.height <= viewportHeight
  ) {
    vertical = 'bottom';
  }

  let horizontal = horiz;
  if (
    horiz === 'start' &&
    triggerRect.left + popupRect.width > viewportWidth &&
    triggerRect.right - popupRect.width >= 0
  ) {
    horizontal = 'end';
  } else if (
    horiz === 'end' &&
    triggerRect.right - popupRect.width < 0 &&
    triggerRect.left + popupRect.width <= viewportWidth
  ) {
    horizontal = 'start';
  }

  const style: Record<string, string | number> = { '--ds-menu-trigger-width': `${triggerRect.width}px` };
  if (vertical === 'bottom') style.top = triggerRect.bottom;
  else style.bottom = viewportHeight - triggerRect.top;
  if (horizontal === 'start') style.left = triggerRect.left;
  else style.right = viewportWidth - triggerRect.right;

  return { style: style as CSSProperties, vertical };
}

export interface MenuProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /** Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row. */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant;
  /**
   * Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes
   * the accessible name), `chevron-down` for a labelled dropdown, `none`.
   */
  triggerIcon?: MenuTriggerIcon;
  /** Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. */
  iconOnly?: boolean;
  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  placement?: MenuPlacement;
  /** Controlled open state. Omit for an uncontrolled menu. */
  open?: boolean;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: (id: string) => void;
  /** Fired when the menu opens or closes, with the new boolean. */
  onOpenChange?: (open: boolean) => void;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef>>;
}

/**
 * Menu — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Menu for secondary actions on an item or a view that do not deserve their own buttons:
 * overflow ("More actions"), sort or view options, account menus. Group related items with a
 * `group` label when there are more than about six; separate a danger action with a `separator`.
 * On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is
 * "pick an action" and let the platform decide the surface.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    label,
    items,
    triggerVariant = 'ghost',
    triggerIcon = 'chevron-down',
    iconOnly = false,
    placement = 'bottom-start',
    open: openProp,
    onAction,
    onOpenChange,
    overrides,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const triggerId = `ds-menu${generatedId}-trigger`;
  const listId = `ds-menu${generatedId}-list`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingFocusRef = useRef<'first' | 'last'>('first');
  const typeaheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timer: null,
  });

  const latest = useRef({ items, placement });
  latest.current = { items, placement };

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? (openProp as boolean) : internalOpen;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>();
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [entered, setEntered] = useState(false);

  if (isDev && !label) {
    console.warn('Menu: `label` is required and becomes the trigger label and the menu’s accessible name.');
  }

  const changeOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value);
  };

  const openMenu = (focusTarget: 'first' | 'last') => {
    if (open) return;
    pendingFocusRef.current = focusTarget;
    changeOpen(true);
  };

  const closeMenu = (focusTrigger = false) => {
    if (!open) return;
    if (focusTrigger) triggerRef.current?.focus();
    changeOpen(false);
  };

  const setItemRef = (id: string) => (element: HTMLDivElement | null) => {
    if (element) itemRefs.current.set(id, element);
    else itemRefs.current.delete(id);
  };

  const focusAction = (id: string) => {
    setActiveId(id);
    itemRefs.current.get(id)?.focus();
  };

  const activateAction = (action: MenuAction) => {
    if (action.disabled) return;
    closeMenu(true);
    onAction?.(action.id);
  };

  // Position the popup and move focus in on open; reposition while scrolling or resizing.
  useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
      return undefined;
    }
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return undefined;

    const reposition = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const result = computePosition(triggerRect, popupRect, latest.current.placement);
      setPopupStyle(result.style);
      setVertical(result.vertical);
    };
    reposition();

    const actions = flattenActions(latest.current.items).filter((action) => !action.disabled);
    const target = pendingFocusRef.current === 'last' ? actions[actions.length - 1] : actions[0];
    pendingFocusRef.current = 'first';
    if (target) {
      setActiveId(target.id);
      itemRefs.current.get(target.id)?.focus();
    } else {
      popup.focus();
    }

    if (prefersReducedMotion()) setEntered(true);
    else requestAnimationFrame(() => setEntered(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  // A pointer click outside, or the window losing focus, closes.
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popupRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      closeMenu();
    };
    const handleWindowBlur = () => closeMenu();
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleTriggerClick = () => {
    if (open) closeMenu();
    else openMenu('first');
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    }
  };

  const handleTypeahead = (char: string, enabled: MenuAction[], currentIndex: number) => {
    const state = typeaheadRef.current;
    if (state.timer) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    state.timer = setTimeout(() => {
      state.buffer = '';
    }, 500);

    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    for (let offset = 1; offset <= enabled.length; offset++) {
      const candidate = enabled[(startIndex + offset) % enabled.length];
      if (candidate.label.toLowerCase().startsWith(state.buffer)) {
        focusAction(candidate.id);
        return;
      }
    }
    // The buffer as a whole matched nothing (e.g. the same letter typed again); retry with just it.
    if (state.buffer.length > 1) {
      const single = state.buffer.slice(-1);
      for (let offset = 0; offset < enabled.length; offset++) {
        const candidate = enabled[(startIndex + offset) % enabled.length];
        if (candidate.label.toLowerCase().startsWith(single)) {
          state.buffer = single;
          focusAction(candidate.id);
          return;
        }
      }
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabled = flattenActions(items).filter((action) => !action.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((action) => action.id === activeId);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        focusAction(enabled[(currentIndex + 1) % enabled.length].id);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        focusAction(enabled[(currentIndex - 1 + enabled.length) % enabled.length].id);
        break;
      }
      case 'Home':
        event.preventDefault();
        focusAction(enabled[0].id);
        break;
      case 'End':
        event.preventDefault();
        focusAction(enabled[enabled.length - 1].id);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex !== -1) activateAction(enabled[currentIndex]);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        event.preventDefault();
        focusAdjacent(triggerRef.current as HTMLElement, popupRef.current, event.shiftKey ? -1 : 1);
        closeMenu();
        break;
      default:
        if (event.key.length === 1 && /^[a-z]$/i.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
          handleTypeahead(event.key, enabled, currentIndex);
        }
    }
  };

  const handleItemMouseEnter = (action: MenuAction) => {
    if (action.disabled) return;
    focusAction(action.id);
  };

  const handleItemClick = (action: MenuAction) => (event: ReactMouseEvent<HTMLDivElement>) => {
    if (action.disabled) {
      event.preventDefault();
      return;
    }
    activateAction(action);
  };

  const renderAction = (action: MenuAction) => {
    const classes = [
      'ds-menu__item',
      action.tone === 'danger' ? 'ds-menu__item--danger' : null,
      action.disabled ? 'ds-menu__item--disabled' : null,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        key={action.id}
        ref={setItemRef(action.id)}
        role="menuitem"
        id={`${listId}-item-${action.id}`}
        tabIndex={action.id === activeId ? 0 : -1}
        aria-disabled={action.disabled ? 'true' : undefined}
        aria-keyshortcuts={action.shortcut || undefined}
        className={classes}
        onMouseEnter={() => handleItemMouseEnter(action)}
        onClick={handleItemClick(action)}
      >
        {action.icon ? (
          <span className="ds-menu__item-icon" data-part="itemIcon" aria-hidden="true">
            <Icon name={action.icon} inline />
          </span>
        ) : null}
        <span className="ds-menu__item-label">{action.label}</span>
        {action.shortcut ? (
          <span className="ds-menu__item-shortcut" data-part="itemShortcut">
            {action.shortcut}
          </span>
        ) : null}
      </div>
    );
  };

  const renderNode = (node: MenuItem, path: string) => {
    if ('separator' in node) {
      return <div key={`${path}-separator`} role="separator" className="ds-menu__separator" />;
    }
    if ('group' in node) {
      const groupLabelId = `${listId}-group-${path}`;
      return (
        <div key={`${path}-group`} role="group" aria-labelledby={groupLabelId} className="ds-menu__group">
          <div id={groupLabelId} data-part="groupLabel" className="ds-menu__group-label">
            {node.group}
          </div>
          <div className="ds-menu__group-items">
            {node.items.map((child, index) => renderNode(child, `${path}-${index}`))}
          </div>
        </div>
      );
    }
    return renderAction(node);
  };

  const classes = ['ds-menu', className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedPopupStyle = { ...popupStyle, ...overrideStyle };

  const popupClasses = ['ds-menu__popup', entered ? 'ds-menu__popup--entered' : null].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={ref} data-ds="Menu" className={classes} style={style}>
      <Button
        ref={triggerRef}
        id={triggerId}
        type="button"
        variant={triggerVariant}
        iconOnly={iconOnly}
        label={label}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={open ? listId : undefined}
        trailingIcon={triggerIcon !== 'none' ? <Icon name={triggerIcon} inline /> : undefined}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      />
      {open
        ? createPortal(
            <div
              ref={popupRef}
              role="menu"
              id={listId}
              tabIndex={-1}
              aria-labelledby={triggerId}
              data-part="popup"
              data-vertical={vertical}
              className={popupClasses}
              style={mergedPopupStyle}
              onKeyDown={handleListKeyDown}
            >
              {items.map((item, index) => renderNode(item, String(index)))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
});
