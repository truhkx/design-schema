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
  | 'gutter'
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
  gutter: '--ds-menu-gutter',
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

/**
 * Reads a resolved length custom property in px (`popupOffset`, `gutter`): a rem value is multiplied
 * by the root font size. `null` when it cannot be read — no stylesheet loaded, or not a length.
 */
function readLengthVar(element: Element, name: string): number | null {
  const raw = getComputedStyle(element).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return null;
  if (raw.endsWith('rem')) {
    const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(rootSize) ? value * rootSize : null;
  }
  return raw.endsWith('px') || /^[\d.]+$/.test(raw) ? value : null;
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

/** Whether focus can be parked on this element — an `anchor` is any element, and need not take focus. */
function isFocusable(element: HTMLElement): boolean {
  return element.matches(TABBABLE_SELECTOR) || element.tabIndex >= 0;
}

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

/** minWidth's runtime floor: the trigger's measured width. `0px` in `anchor` mode, which has no floor. */
const TRIGGER_WIDTH_HOOK = '--ds-menu-trigger-width';

/**
 * Places the popup from the anchor rect for `placement`. Only the block side flips (bottom and top
 * swap) when the popup would overflow; `start` and `end` never flip — they resolve against the layout
 * direction (in right-to-left `start` is the right edge) and the popup is shifted inline instead so it
 * stays `gutter` away from the side edges. `offset` (popupOffset, resolved) is part of the flip check;
 * the gap itself is the popup's block margin, so a flipped popup keeps it on its new side.
 */
function computePosition(
  anchorRect: DOMRect,
  popupRect: DOMRect,
  placement: MenuPlacement,
  offset: number,
  gutter: number,
  rtl: boolean,
): ResolvedPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const [preferredVertical, side] = placement.split('-') as ['bottom' | 'top', 'start' | 'end'];
  const needed = popupRect.height + offset;

  let vertical = preferredVertical;
  if (vertical === 'bottom' && anchorRect.bottom + needed > viewportHeight && anchorRect.top - needed >= 0) {
    vertical = 'top';
  } else if (vertical === 'top' && anchorRect.top - needed < 0 && anchorRect.bottom + needed <= viewportHeight) {
    vertical = 'bottom';
  }

  // `start` is the anchor's leading edge: its left in left-to-right, its right in right-to-left.
  const alignsToLeadingEdge = rtl ? side === 'end' : side === 'start';
  const preferredLeft = alignsToLeadingEdge ? anchorRect.left : anchorRect.right - popupRect.width;
  // Shifted, never flipped: clamped into the gutter on both sides (the near edge wins when the popup
  // is wider than the space between them).
  const furthestLeft = Math.max(gutter, viewportWidth - gutter - popupRect.width);
  const left = Math.min(Math.max(preferredLeft, gutter), furthestLeft);

  const style: Record<string, string | number> = { left };
  if (vertical === 'bottom') style.top = anchorRect.bottom;
  else style.bottom = viewportHeight - anchorRect.top;
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
   * `triggerIcon: none` there would be nothing visible to press, so that pairing warns in development
   * (once), unless `anchor` is set (there is no trigger then). It is the only development warning Menu
   * issues — no warning for empty items, a missing label or an uncontrolled anchor.
   */
  iconOnly?: boolean | undefined;
  /**
   * Preferred position of the popup relative to the trigger (or `anchor`). Only the block side flips
   * (bottom and top swap) when the popup would overflow the viewport; `start` and `end` never flip.
   * They resolve against the layout direction (in right-to-left `start` is the right edge), and the
   * popup is shifted inline instead so it stays `gutter` away from the side edges.
   */
  placement?: MenuPlacement | undefined;
  /**
   * Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu, which
   * starts closed; there is no defaultOpen. A controlled menu hides only when `open` becomes false — a
   * parent that never flips it keeps the menu open. Focus on close follows the reason; a close the menu
   * did not request moves focus to the trigger only when focus is inside the popup at that moment.
   */
  open?: boolean | undefined;
  /**
   * Position the popup relative to this element instead of rendering a trigger; the trigger part is
   * omitted and `open` must be controlled. Used by ActionSheet above its breakpoint and by context
   * menus. The anchor stands in for the trigger: a pointerdown on it is not `outside` and focus moving
   * onto it is not `focus-out`, and focus that would return to the trigger returns to the element that
   * had focus when the menu opened.
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
  // The last position written, so a scroll that does not move the popup does not re-render it.
  const lastPositionRef = useRef('');

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

  /**
   * The item that actually holds focus. The menu moves real focus rather than pointing at an item
   * with aria-activedescendant, so focus is the source of truth: it can land on an item without
   * passing through `focusAction` (a click, a screen reader, a consumer calling `focus()`), and the
   * arrows, Home/End and typeahead must all move from wherever it really is, not from the last item
   * this component happened to highlight. `activeId` only backs the roving tabindex.
   */
  const focusedActionId = (): string | null => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      for (const [id, element] of itemRefs.current) {
        if (element === active || element.contains(active)) return id;
      }
    }
    return activeId;
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
        // `escape` and `action` return focus to the trigger; `tab-out` follows the Tab rule; `trigger`,
        // `outside` and `focus-out` leave it alone — except that a popup hiding with focus still inside
        // it (including a controlled close the menu did not request) hands focus back to the trigger,
        // so it never drops to the page body.
        if (focusAfter === 'next' || focusAfter === 'previous') {
          if (from) focusAdjacent(from, null, focusAfter);
        } else if (focusAfter === 'opener' || focusInsideRef.current) {
          opener?.focus();
        }
      }
      focusAfterCloseRef.current = null;
      focusInsideRef.current = false;
      openerRef.current = null;
      lastPositionRef.current = '';
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
      // The trigger width is only known at runtime, so the floor is measured here and applied before
      // the popup is measured; with `anchor` there is no trigger-width floor.
      const triggerWidth = anchor ? '0px' : `${target.getBoundingClientRect().width}px`;
      popup.style.setProperty(TRIGGER_WIDTH_HOOK, triggerWidth);
      // popupOffset and gutter are read in px from the popup's resolved hooks (rem × root font size).
      const offset = readLengthVar(popup, OVERRIDE_HOOK.popupOffset) ?? 0;
      const gutter = readLengthVar(popup, OVERRIDE_HOOK.gutter) ?? 0;
      const rtl = getComputedStyle(target).direction === 'rtl';
      const result = computePosition(
        target.getBoundingClientRect(),
        popup.getBoundingClientRect(),
        latest.current.placement,
        offset,
        gutter,
        rtl,
      );
      // Converging write: reposition runs on every scroll and resize event, so an unchanged position
      // must not re-render.
      const next = `${result.vertical}|${triggerWidth}|${JSON.stringify(result.style)}`;
      if (next === lastPositionRef.current) return;
      lastPositionRef.current = next;
      setPopupStyle({ ...result.style, [TRIGGER_WIDTH_HOOK]: triggerWidth } as CSSProperties);
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
    const enabled = flattenActions(items).filter((action) => !action.disabled);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      // On an already open menu the arrows just move focus in, first or last.
      if (!open) openMenu('first', 'trigger');
      else if (enabled[0]) focusAction(enabled[0].id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openMenu('last', 'trigger');
      else if (enabled[enabled.length - 1]) focusAction(enabled[enabled.length - 1]!.id);
    } else if (event.key === 'Escape' && open) {
      // Escape on the trigger while the menu is open closes it too; focus stays where it is.
      event.preventDefault();
      event.stopPropagation();
      closeMenu('escape', 'none');
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

  /**
   * Tab and Shift+Tab close and let the browser carry on. The key is not prevented when there is
   * somewhere to park focus — the trigger, or a focusable `anchor` standing in for it: every item
   * drops to tabindex -1 and focus moves there, so the browser's own Tab continues from that point
   * and a popup a controlled parent still shows holds no tab stop. Only an unfocusable anchor makes
   * the menu move focus itself, to the first tabbable after (Tab) or last before (Shift+Tab) it.
   */
  const handleTab = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const anchorTarget = anchor?.current ?? null;
    const park = triggerRef.current ?? (anchorTarget && isFocusable(anchorTarget) ? anchorTarget : null);
    if (park) {
      for (const element of itemRefs.current.values()) {
        // Converging write: a same-value tabIndex assignment still queues a mutation record.
        if (element.tabIndex !== -1) element.tabIndex = -1;
      }
      setActiveId(null);
      park.focus();
      closeMenu('tab-out', 'none');
      return;
    }
    event.preventDefault();
    closeMenu('tab-out', event.shiftKey ? 'previous' : 'next');
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabled = flattenActions(items).filter((action) => !action.disabled);
    const currentIndex = enabled.findIndex((action) => action.id === focusedActionId());

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
        handleTab(event);
        break;
      default: {
        const char = event.key;
        // Typeahead takes any single printable character (letters of any script and digits, not only
        // a–z); Space stays activation, and keys held with Ctrl, Meta or Alt are ignored.
        if (char.length === 1 && char !== ' ' && !event.metaKey && !event.ctrlKey && !event.altKey && enabled.length > 0) {
          event.preventDefault();
          handleTypeahead(char, enabled, currentIndex);
        }
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

  // The one roving tabindex follows real focus, however the item got it. Converging write: React bails
  // out of a same-value setState, so this cannot loop with the re-render that moves the tabindex.
  const handleItemFocus = (action: MenuAction) => {
    if (action.id !== activeId) setActiveId(action.id);
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
        onFocus={() => handleItemFocus(action)}
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
  // `className` and `style` are not in MenuProps; one that arrives through an untyped spread is still
  // dropped, since `overrides` is the only per-instance styling.
  const { className: _className, style: _style, ...rootProps } = rest as typeof rest & {
    className?: unknown;
    style?: unknown;
  };

  return (
    <div {...rootProps} data-ds="Menu" className="ds-menu">
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
            expanded={open}
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
