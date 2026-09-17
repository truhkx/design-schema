import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
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
/**
 * Why the menu opened or closed: `trigger` (the trigger was activated), `escape` (Escape pressed
 * while open), `outside` (a pointer press landed outside the menu), `action` (an item was chosen;
 * fired before onAction), `controlled` (the consumer changed the open prop — the menu never raises
 * this itself; it exists so a composing component can forward its own reason through), `tab-out`
 * (Tab or Shift+Tab pressed while open), `focus-out` (focus moved outside the menu and trigger by
 * other means, or the window lost focus).
 */
export type MenuOpenChangeReason = 'trigger' | 'escape' | 'outside' | 'action' | 'controlled' | 'tab-out' | 'focus-out';

/** A single actionable row. */
export type MenuAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: MenuItemTone | undefined;
  disabled?: boolean | undefined;
};
/** A labelled cluster of action items, rendered with a non-interactive heading row. */
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
  | 'typeaheadReset'
  | 'maxHeight'
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
  | 'enter'
  | 'enterDistance';

const OVERRIDE_HOOK: Record<MenuOverridableBinding, string> = {
  border: '--ds-menu-border',
  borderWidth: '--ds-menu-border-width',
  shadow: '--ds-menu-shadow',
  radius: '--ds-menu-radius',
  popupPadding: '--ds-menu-popup-padding',
  popupOffset: '--ds-menu-popup-offset',
  typeaheadReset: '--ds-menu-typeahead-reset',
  maxHeight: '--ds-menu-max-height',
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
  fontFamily: '--ds-menu-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-menu-font-size',
  lineHeight: '--ds-menu-line-height',
  layer: '--ds-menu-layer',
  enter: '--ds-menu-enter',
  enterDistance: '--ds-menu-enter-distance',
};

function overridesToStyle(overrides: Partial<Record<MenuOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as MenuOverridableBinding[]) {
    // Locked bindings are not in the type; anything outside OVERRIDE_HOOK is ignored at runtime too.
    const hook = OVERRIDE_HOOK[binding] as string | undefined;
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev: boolean = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Reads a resolved CSS `<time>` value (`"800ms"`, `"0.8s"`) as milliseconds; 0 when unresolvable. */
function cssTimeToMs(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('ms')) return parseFloat(trimmed) || 0;
  if (trimmed.endsWith('s')) return (parseFloat(trimmed) || 0) * 1000;
  return parseFloat(trimmed) || 0;
}

function isSeparator(item: MenuItem): item is MenuSeparator {
  return 'separator' in item;
}

function isGroup(item: MenuItem): item is MenuGroup {
  return 'group' in item;
}

/** Action items in document order. Groups hold action items only; nested groups and separators are dropped. */
function flattenActions(items: MenuItem[]): MenuAction[] {
  const result: MenuAction[] = [];
  for (const item of items) {
    if (isSeparator(item)) continue;
    if (isGroup(item)) {
      for (const child of item.items) if (!isSeparator(child) && !isGroup(child)) result.push(child);
    } else {
      result.push(item);
    }
  }
  return result;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as RefObject<T | null>).current = value;
}

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focuses the tabbable element after (or before) `from` in document order, skipping the popup. `from`
 * need not be tabbable itself (an `anchor` stands in for the trigger), and its own descendants are
 * neither before nor after it.
 */
function focusAdjacent(from: HTMLElement, exclude: HTMLElement | null, direction: 'next' | 'previous'): void {
  const all = Array.from(document.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) => !(exclude && exclude.contains(element)) && !from.contains(element),
  );
  if (direction === 'next') {
    all.find((element) => from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)?.focus();
  } else {
    const preceding = all.filter((element) => from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING);
    preceding[preceding.length - 1]?.focus();
  }
}

type ResolvedPosition = { style: CSSProperties; vertical: 'top' | 'bottom' };

/**
 * Places the popup from the anchor rect for `placement`, flipping either axis when it would overflow.
 * `offset` (popupOffset, resolved) is part of the vertical flip check; the gap itself is the popup's
 * block margin, so a flipped popup keeps it on its new side.
 */
function computePosition(anchorRect: DOMRect, popupRect: DOMRect, placement: MenuPlacement, offset: number): ResolvedPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const [preferredVertical, preferredHorizontal] = placement.split('-') as ['bottom' | 'top', 'start' | 'end'];
  const needed = popupRect.height + offset;

  let vertical = preferredVertical;
  if (vertical === 'bottom' && anchorRect.bottom + needed > viewportHeight && anchorRect.top - needed >= 0) {
    vertical = 'top';
  } else if (vertical === 'top' && anchorRect.top - needed < 0 && anchorRect.bottom + needed <= viewportHeight) {
    vertical = 'bottom';
  }

  let horizontal = preferredHorizontal;
  if (horizontal === 'start' && anchorRect.left + popupRect.width > viewportWidth && anchorRect.right - popupRect.width >= 0) {
    horizontal = 'end';
  } else if (horizontal === 'end' && anchorRect.right - popupRect.width < 0 && anchorRect.left + popupRect.width <= viewportWidth) {
    horizontal = 'start';
  }

  const style: Record<string, string | number> = { '--ds-menu-trigger-width': `${anchorRect.width}px` };
  if (vertical === 'bottom') style.top = anchorRect.bottom;
  else style.bottom = viewportHeight - anchorRect.top;
  if (horizontal === 'start') style.left = anchorRect.left;
  else style.right = viewportWidth - anchorRect.right;
  return { style: style as CSSProperties, vertical };
}

/** What happens to focus once the menu has actually closed; `null` = closed by the consumer. */
type FocusAfterClose = 'opener' | 'next' | 'previous' | 'none' | null;

export interface MenuProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** The trigger's label and the menu's accessible name ("More actions", "Sort by"). */
  label: string;
  /**
   * Actions, optionally grouped with a label or divided by separators. Groups render their label as
   * a non-interactive heading row and hold action items only — the shape is recursive but a group
   * inside a group is not a shape this component draws: a nested group or a separator inside a group
   * is dropped without a development warning.
   */
  items: MenuItem[];
  /** Variant of the trigger Button. */
  triggerVariant?: MenuTriggerVariant | undefined;
  /**
   * Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the
   * accessible name), `chevron-down` for a labelled dropdown, `none`. With `iconOnly` the glyph is
   * passed as the Button's `leadingIcon` (an icon-only Button shows only that); otherwise as its
   * `trailingIcon`.
   */
  triggerIcon?: MenuTriggerIcon | undefined;
  /**
   * Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. With
   * `triggerIcon: none` there would be nothing visible to press, so that pairing warns in development (once).
   */
  iconOnly?: boolean | undefined;
  /** Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport. */
  placement?: MenuPlacement | undefined;
  /**
   * Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu, which
   * starts closed; there is no defaultOpen. A controlled menu hides, and returns focus to the trigger,
   * only when `open` becomes false.
   */
  open?: boolean | undefined;
  /**
   * Position the popup relative to this element instead of rendering a trigger; the trigger part is
   * omitted and `open` must be controlled. Used by ActionSheet above its breakpoint and by context menus.
   */
  anchor?: RefObject<HTMLElement | null> | undefined;
  /** An item was chosen; receives its `id`. The menu closes itself first. */
  onAction?: ((id: string) => void) | undefined;
  /**
   * Fired when the menu opens or closes, with `(open, reason)` — reason: `trigger`, `escape`,
   * `outside`, `action` (an item was chosen; fired before onAction), `controlled`, `tab-out`, `focus-out`.
   */
  onOpenChange?: ((open: boolean, reason: MenuOpenChangeReason) => void) | undefined;
  /** Portal target for the popup. Defaults to `document.body`. A platform prop, not a schema prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook on the popup to that token, inline. */
  overrides?: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Menu — Design Schema, category: overlay (APG menu button).
 *
 * When to use:
 * Use a Menu for secondary actions on an item or a view that do not deserve their own buttons:
 * overflow ("More actions"), sort or view options, account menus. Group related items with a
 * `group` label when there are more than about six; separate a danger action with a `separator`.
 * On phones, Menu presents as an ActionSheet on its own, so use Menu wherever the interaction is
 * "pick an action" and let the platform decide the surface.
 *
 * The forwarded `ref` resolves to the popup (`role="menu"`) and is null while closed.
 */
export function Menu({
  ref,
  label,
  items,
  triggerVariant = 'ghost',
  triggerIcon = 'chevron-down',
  iconOnly = false,
  placement = 'bottom-start',
  open: openProp,
  anchor,
  onAction,
  onOpenChange,
  container,
  overrides,
  ...rest
}: MenuProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const triggerId = `ds-menu${generatedId}-trigger`;
  const listId = `ds-menu${generatedId}-list`;

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingFocusRef = useRef<'first' | 'last'>('first');
  // Where focus returns on close: the trigger, or in `anchor` mode whatever was focused at open.
  const openerRef = useRef<HTMLElement | null>(null);
  const focusAfterCloseRef = useRef<FocusAfterClose>(null);
  // Whether focus is inside the popup; a popup removed while focused fires no blur, so this stays true.
  const focusInsideRef = useRef(false);
  // Set while the menu requests its own close, so the focus moves that follow do not report a second one.
  const closingRef = useRef(false);
  const typeaheadRef = useRef<{ buffer: string; timer: ReturnType<typeof setTimeout> | null }>({
    buffer: '',
    timer: null,
  });
  const warnedRef = useRef(false);
  const swallowSpaceKeyUpRef = useRef(false);

  const latest = useRef({ items, placement });
  latest.current = { items, placement };

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [popupStyle, setPopupStyle] = useState<CSSProperties | undefined>(undefined);
  const [vertical, setVertical] = useState<'top' | 'bottom'>('bottom');
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isDev || warnedRef.current) return;
    if (iconOnly && triggerIcon === 'none' && !anchor) {
      warnedRef.current = true;
      console.warn('Menu: `iconOnly` with `triggerIcon: none` leaves nothing visible to press; choose `ellipsis` or `chevron-down`.');
    }
  }, [iconOnly, triggerIcon, anchor]);

  const setPopupRef = useCallback(
    (element: HTMLDivElement | null) => {
      popupRef.current = element;
      assignRef(ref, element);
    },
    [ref],
  );

  const changeOpen = (value: boolean, reason: MenuOpenChangeReason) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value, reason);
  };

  const openMenu = (focusTarget: 'first' | 'last', reason: MenuOpenChangeReason) => {
    if (open) return;
    pendingFocusRef.current = focusTarget;
    changeOpen(true, reason);
  };

  /** Requests a close; focus moves only once `open` is actually false (a controlled parent may refuse). */
  const closeMenu = (reason: MenuOpenChangeReason, focusAfter: Exclude<FocusAfterClose, null>) => {
    if (!open || closingRef.current) return;
    focusAfterCloseRef.current = focusAfter;
    closingRef.current = true;
    try {
      changeOpen(false, reason);
    } finally {
      closingRef.current = false;
    }
  };

  const anchorElement = (): HTMLElement | null => anchor?.current ?? triggerRef.current;

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
    // The menu closes itself first: onOpenChange(false, 'action') precedes onAction.
    closeMenu('action', 'opener');
    onAction?.(action.id);
  };

  // On open: position from the anchor, move focus in, and reposition on scroll and resize.
  // On close: move focus as the close requested (or back to the opener when the consumer closed it).
  useLayoutEffect(() => {
    if (!open) {
      const focusAfter = focusAfterCloseRef.current;
      const opener = openerRef.current;
      const from = anchorElement();
      if (opener || from) {
        if (focusAfter === 'opener' || (focusAfter === null && focusInsideRef.current)) opener?.focus();
        else if ((focusAfter === 'next' || focusAfter === 'previous') && from) focusAdjacent(from, null, focusAfter);
      }
      focusAfterCloseRef.current = null;
      focusInsideRef.current = false;
      openerRef.current = null;
      setEntered(false);
      return undefined;
    }
    const popup = popupRef.current;
    if (!popup) return undefined;
    focusAfterCloseRef.current = null;

    openerRef.current =
      triggerRef.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    const reposition = () => {
      const target = anchor?.current ?? triggerRef.current;
      if (!target) return;
      // popupOffset is read through its hook, resolved by the popup's block margin.
      const offset = parseFloat(getComputedStyle(popup).marginBlockStart) || 0;
      const result = computePosition(target.getBoundingClientRect(), popup.getBoundingClientRect(), latest.current.placement, offset);
      setPopupStyle(result.style);
      setVertical(result.vertical);
    };
    reposition();

    const enabled = flattenActions(latest.current.items).filter((action) => !action.disabled);
    const target = pendingFocusRef.current === 'last' ? enabled[enabled.length - 1] : enabled[0];
    pendingFocusRef.current = 'first';
    if (target) focusAction(target.id);
    else popup.focus();

    let frame = 0;
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') setEntered(true);
    else frame = requestAnimationFrame(() => setEntered(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchor]);

  // A pointer press outside the popup and trigger closes (`outside`); the window losing focus closes (`focus-out`).
  const dismissRef = useRef<(reason: 'outside' | 'focus-out') => void>(() => undefined);
  dismissRef.current = (reason) => closeMenu(reason, 'none');
  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      const from = anchor?.current ?? triggerRef.current;
      if (target && (popupRef.current?.contains(target) || from?.contains(target))) return;
      dismissRef.current('outside');
    };
    const handleWindowBlur = () => dismissRef.current('focus-out');
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [open, anchor]);

  useEffect(
    () => () => {
      const timer = typeaheadRef.current.timer;
      if (timer) clearTimeout(timer);
    },
    [],
  );

  const handleTriggerClick = () => {
    // Enter and Space reach here as the Button's native click; clicking while open closes.
    if (open) closeMenu('trigger', 'none');
    else openMenu('first', 'trigger');
  };

  const handleTriggerKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' && swallowSpaceKeyUpRef.current) event.preventDefault();
    swallowSpaceKeyUpRef.current = false;
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first', 'trigger');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last', 'trigger');
    }
  };

  const typeaheadResetMs = (): number => {
    // typeaheadReset is read through its hook (motion.duration.loop by default), never a number.
    const popup = popupRef.current;
    return popup ? cssTimeToMs(getComputedStyle(popup).getPropertyValue(OVERRIDE_HOOK.typeaheadReset)) : 0;
  };

  const handleTypeahead = (char: string, enabled: MenuAction[], currentIndex: number) => {
    const state = typeaheadRef.current;
    if (state.timer) clearTimeout(state.timer);
    state.buffer += char.toLowerCase();
    const buffer = state.buffer;
    // Without a resolvable token (no stylesheet loaded) every keypress starts a fresh buffer.
    const resetMs = typeaheadResetMs();
    state.timer =
      resetMs > 0
        ? setTimeout(() => {
            state.buffer = '';
            state.timer = null;
          }, resetMs)
        : null;
    if (resetMs <= 0) state.buffer = '';

    const start = Math.max(currentIndex, 0);
    // A growing buffer may keep the current item; a single character moves on to the next match.
    const firstOffset = buffer.length > 1 ? 0 : 1;
    for (let offset = firstOffset; offset < enabled.length + firstOffset; offset++) {
      const candidate = enabled[(start + offset) % enabled.length];
      if (candidate && candidate.label.toLowerCase().startsWith(buffer)) {
        focusAction(candidate.id);
        return;
      }
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabled = flattenActions(items).filter((action) => !action.disabled);
    const currentIndex = enabled.findIndex((action) => action.id === activeId);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const next = enabled[(currentIndex + 1) % enabled.length];
        if (next) focusAction(next.id);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const previous = enabled[currentIndex <= 0 ? enabled.length - 1 : currentIndex - 1];
        if (previous) focusAction(previous.id);
        break;
      }
      case 'Home': {
        event.preventDefault();
        const first = enabled[0];
        if (first) focusAction(first.id);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = enabled[enabled.length - 1];
        if (last) focusAction(last.id);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const current = enabled[currentIndex];
        if (!current) break;
        // Focus returns to the trigger Button, which would activate on Space's keyup and reopen.
        if (event.key === ' ') swallowSpaceKeyUpRef.current = true;
        activateAction(current);
        break;
      }
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        closeMenu('escape', 'opener');
        break;
      case 'Tab':
        event.preventDefault();
        closeMenu('tab-out', event.shiftKey ? 'previous' : 'next');
        break;
      default:
        if (/^[a-z]$/i.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey && enabled.length > 0) {
          event.preventDefault();
          handleTypeahead(event.key, enabled, currentIndex);
        }
    }
  };

  const handlePopupFocus = () => {
    focusInsideRef.current = true;
  };

  // Focus leaving the popup for something other than the trigger closes it (dismiss: focus-out).
  const handlePopupBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && popupRef.current?.contains(next)) return;
    focusInsideRef.current = false;
    if (!next) return; // Pointer presses on non-focusable ground are handled by pointerdown; window blur by its listener.
    if (anchorElement()?.contains(next)) return;
    closeMenu('focus-out', 'none');
  };

  const handleItemMouseEnter = (action: MenuAction) => {
    // Hover moves the roving focus so pointer and keyboard never highlight two items.
    if (!action.disabled) focusAction(action.id);
  };

  const handleItemClick = (action: MenuAction) => (event: ReactMouseEvent<HTMLDivElement>) => {
    if (action.disabled) {
      event.preventDefault();
      return;
    }
    activateAction(action);
  };

  const renderAction = (action: MenuAction): ReactElement => {
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
        data-part="item"
        tabIndex={action.id === activeId ? 0 : -1}
        aria-disabled={action.disabled ? 'true' : undefined}
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
          <span className="ds-menu__item-shortcut" data-part="itemShortcut" aria-hidden="true">
            {action.shortcut}
          </span>
        ) : null}
      </div>
    );
  };

  const renderNode = (node: MenuItem, index: number): ReactNode => {
    if (isSeparator(node)) {
      return <div key={`separator-${index}`} role="separator" data-part="separator" className="ds-menu__separator" />;
    }
    if (isGroup(node)) {
      const groupLabelId = `${listId}-group-${index}`;
      return (
        <div key={`group-${index}`} role="group" aria-labelledby={groupLabelId} data-part="group" className="ds-menu__group">
          <div id={groupLabelId} data-part="groupLabel" className="ds-menu__group-label">
            {node.group}
          </div>
          {/* Groups hold action items only: a nested group or separator is dropped. */}
          {node.items.map((child) => (isSeparator(child) || isGroup(child) ? null : renderAction(child)))}
        </div>
      );
    }
    return renderAction(node);
  };

  const icon = triggerIcon === 'none' ? undefined : <Icon name={triggerIcon} inline />;
  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const popupClasses = ['ds-menu__popup', entered ? 'ds-menu__popup--entered' : null].filter(Boolean).join(' ');

  return (
    <div {...rest} data-ds="Menu" className="ds-menu">
      {anchor ? null : (
        <span data-part="trigger" className="ds-menu__trigger">
          <Button
            ref={triggerRef}
            id={triggerId}
            type="button"
            variant={triggerVariant}
            label={label}
            iconOnly={iconOnly}
            leadingIcon={iconOnly ? icon : undefined}
            trailingIcon={iconOnly ? undefined : icon}
            aria-haspopup="menu"
            aria-expanded={open ? 'true' : 'false'}
            aria-controls={open ? listId : undefined}
            onClick={handleTriggerClick}
            onKeyDown={handleTriggerKeyDown}
            onKeyUp={handleTriggerKeyUp}
          />
        </span>
      )}
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={setPopupRef}
              role="menu"
              id={listId}
              tabIndex={-1}
              aria-labelledby={anchor ? undefined : triggerId}
              aria-label={anchor ? label : undefined}
              data-part="popup"
              data-vertical={vertical}
              className={popupClasses}
              style={{ ...popupStyle, ...overrideStyle }}
              onKeyDown={handleListKeyDown}
              onFocus={handlePopupFocus}
              onBlur={handlePopupBlur}
            >
              {items.map((item, index) => renderNode(item, index))}
            </div>,
            container ?? document.body,
          )
        : null}
    </div>
  );
}
