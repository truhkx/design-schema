import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Icon, type IconName, type IconOverridableBinding } from './Icon';
import {
  Menu,
  type MenuAction,
  type MenuItem,
  type MenuOpenChangeReason,
  type MenuOverridableBinding,
} from './Menu';
import { Text, type TextOverridableBinding } from './Text';
import './ActionSheet.css';

export type ActionSheetActionTone = 'default' | 'danger';
export type ActionSheetCloseReason = 'escape' | 'scrim' | 'cancel' | 'drag';

/** A single row in the sheet. */
export type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: 'default' | 'danger' | undefined;
  disabled?: boolean | undefined;
};

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings (surface,
 * handle, itemHover, itemColor, itemDangerColor, titleColor, minTarget, maxWidth, focusRing,
 * focusRingWidth) are never in this list.
 */
export type ActionSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'headerPaddingBlock'
  | 'headerGap'
  | 'handleHeight'
  | 'handleWidth'
  | 'handleRadius'
  | 'titleSize'
  | 'fontFamily'
  | 'fontSize'
  | 'itemIconSize'
  | 'lineHeight'
  | 'divider'
  | 'dividerWidth'
  | 'layer'
  | 'enter'
  | 'exit';

/** Host hooks; the sheet's stylesheet reads each one. */
const OVERRIDE_HOOK: Record<ActionSheetOverridableBinding, string> = {
  scrim: '--ds-action-sheet-scrim',
  shadow: '--ds-action-sheet-shadow',
  radius: '--ds-action-sheet-radius',
  itemPaddingBlock: '--ds-action-sheet-item-padding-block',
  itemPaddingInline: '--ds-action-sheet-item-padding-inline',
  itemGap: '--ds-action-sheet-item-gap',
  headerPaddingBlock: '--ds-action-sheet-header-padding-block',
  headerGap: '--ds-action-sheet-header-gap',
  handleHeight: '--ds-action-sheet-handle-height',
  handleWidth: '--ds-action-sheet-handle-width',
  handleRadius: '--ds-action-sheet-handle-radius',
  titleSize: '--ds-action-sheet-title-size',
  fontFamily: '--ds-action-sheet-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-action-sheet-font-size',
  itemIconSize: '--ds-action-sheet-item-icon-size',
  lineHeight: '--ds-action-sheet-line-height',
  divider: '--ds-action-sheet-divider',
  dividerWidth: '--ds-action-sheet-divider-width',
  layer: '--ds-action-sheet-layer',
  enter: '--ds-action-sheet-enter',
  exit: '--ds-action-sheet-exit',
};

/**
 * Bindings forwarded to the composed heading Text, under Text's own binding name. The default value
 * reaches Text through its CSS hook (the stylesheet points `--ds-text-*` at the sheet's hooks), so
 * `overrides` is passed only for the bindings the caller actually set and consumer CSS on the sheet
 * hook keeps working.
 */
const TEXT_FORWARD: Partial<Record<ActionSheetOverridableBinding, TextOverridableBinding>> = {
  titleSize: 'fontSize',
  fontFamily: 'fontFamily', // literal-ok: Text binding name, not a font stack
  lineHeight: 'lineHeight',
};

/**
 * Bindings forwarded to each row's composed Icon, delivered as TEXT_FORWARD is: the stylesheet points
 * `--ds-icon-size` at the sheet's hook, and `overrides` carries only what the caller set.
 */
const ICON_FORWARD: Partial<Record<ActionSheetOverridableBinding, IconOverridableBinding>> = {
  itemIconSize: 'size',
};

/**
 * Bindings forwarded to the wide Menu: the overridable ones it shares by name, plus divider →
 * separator. Locked bindings are never forwarded, and the rest (scrim, header, handle, title,
 * dividerWidth, exit) have no effect there.
 */
const MENU_FORWARD: Partial<Record<ActionSheetOverridableBinding, MenuOverridableBinding>> = {
  shadow: 'shadow',
  radius: 'radius',
  itemPaddingBlock: 'itemPaddingBlock',
  itemPaddingInline: 'itemPaddingInline',
  itemGap: 'itemGap',
  fontFamily: 'fontFamily', // literal-ok: Menu binding name, not a font stack
  fontSize: 'fontSize',
  lineHeight: 'lineHeight',
  layer: 'layer',
  enter: 'enter',
  divider: 'separator',
};

const COPY = { cancelLabel: 'Cancel', defaultLabel: 'Actions' } as const;

/** constants.dismissDistance — fraction of the sheet height a downward drag must pass to dismiss on release. */
const DISMISS_DISTANCE = 0.25;
/** constants.dismissVelocity — downward px/ms at release that dismisses whatever the distance travelled. */
const DISMISS_VELOCITY = 1.5;
/** constants.dragSlop — `space.1`, read from the resolved custom property at gesture time, as BottomSheet. */
const DRAG_SLOP_TOKEN = '--space-1';

/**
 * `space.1` in px: the token resolves to a rem length, so it is multiplied by the root font size.
 * An unresolvable value (no theme stylesheet, jsdom) counts as 0.
 */
function resolveDragSlop(element: HTMLElement): number {
  const raw = getComputedStyle(element).getPropertyValue(DRAG_SLOP_TOKEN).trim();
  const length = Number.parseFloat(raw);
  if (!Number.isFinite(length)) return 0;
  if (!raw.endsWith('rem') && !raw.endsWith('em')) return length;
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(rootFontSize) ? length * rootFontSize : 0;
}

function hasNoTransition(element: HTMLElement): boolean {
  const duration = getComputedStyle(element).transitionDuration || '';
  return !duration.split(',').some((part) => Number.parseFloat(part) > 0);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** Wide when the viewport is strictly wider than `layout.maxWidth.prose`, read from the theme stylesheet. */
function wideQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
  return breakpoint ? window.matchMedia(`(width > ${breakpoint})`) : null;
}

/**
 * False on the server and through hydration, true from then on (and from the first render of a
 * client-only mount). The portaled sheet and the wide Menu both need `document`, so neither may be in
 * the tree before this is true, or the server and client trees differ.
 */
const subscribeNothing = (): (() => void) => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

/**
 * Starts narrow on the server and during hydration — the viewport is never read during render — and
 * settles on the real presentation in a layout effect after mount, before the browser paints.
 */
function useIsWide(): boolean {
  const [isWide, setIsWide] = useState(false);
  useLayoutEffect(() => {
    let frame = 0;
    let query: MediaQueryList | null = null;
    const onChange = (): void => setIsWide(query?.matches ?? false);
    const attach = (): void => {
      query = wideQuery();
      if (query) {
        onChange();
        query.addEventListener('change', onChange);
        return;
      }
      // The theme stylesheet has not been applied yet, so the breakpoint reads as empty. Retry until
      // the document has finished loading rather than pinning the presentation to the narrow
      // fallback for the component's lifetime — which would strand a desktop sheet below its Menu.
      if (typeof document !== 'undefined' && document.readyState !== 'complete') {
        frame = requestAnimationFrame(attach);
      }
    };
    attach();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      query?.removeEventListener('change', onChange);
    };
  }, []);
  return isWide;
}

interface DragSample {
  y: number;
  time: number;
}

interface DragState {
  pointerId: number;
  /** Where the pointer went down; the slop is measured from here. */
  startY: number;
  /** Where the slop was crossed; the drag offset counts from here, so the surface does not jump. */
  originY: number;
  claimed: boolean;
  previous: DragSample | null;
  last: DragSample | null;
}

/**
 * idle → dragging (past the slop) → settling (spring back to rest)
 *                                 | held (dismissed, holding the released offset) → exiting | settling
 */
type DragPhase = 'idle' | 'dragging' | 'settling' | 'held' | 'exiting';

/** Danger actions are grouped last, after a divider, in both presentations. */
function partition(actions: ActionSheetAction[]): { normal: ActionSheetAction[]; danger: ActionSheetAction[] } {
  return {
    normal: actions.filter((action) => action.tone !== 'danger'),
    danger: actions.filter((action) => action.tone === 'danger'),
  };
}

function toMenuAction(action: ActionSheetAction): MenuAction {
  return { id: action.id, label: action.label, icon: action.icon, tone: action.tone, disabled: action.disabled };
}

function toMenuItems(actions: ActionSheetAction[]): MenuItem[] {
  const { normal, danger } = partition(actions);
  const items: MenuItem[] = normal.map(toMenuAction);
  if (normal.length > 0 && danger.length > 0) items.push({ separator: true });
  items.push(...danger.map(toMenuAction));
  return items;
}

export interface ActionSheetProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open' | 'className' | 'style'> {
  /**
   * Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a
   * dismissal through `onClose` and reports a choice through `onAction`, and the consumer sets
   * `open` to false for both.
   */
  open: boolean;
  /**
   * What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;
   * when omitted the name is `copy.defaultLabel`.
   */
  heading?: string | undefined;
  /**
   * Two to about eight actions. `danger` actions are visually distinct and grouped last: the
   * component does the grouping, so the consumer may pass them in any order — the default actions
   * render in the order given, then the danger ones in the order given. The count is guidance, not
   * enforced: no dev warning outside that range.
   */
  actions: ActionSheetAction[];
  /**
   * Escape, the scrim, the cancel row and the drag all request close. When false, as in Dialog: the
   * Cancel row and the divider above it are not rendered, the drag handle is not rendered, the scrim
   * and the drag do nothing, and Escape still reports through onClose; with no `heading` either, the
   * header has nothing to show and is not rendered at all. It gates the sheet presentation only —
   * the wide Menu presentation has no scrim, drag or cancel row, and clicking outside always closes it.
   */
  dismissible?: boolean | undefined;
  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** An action was chosen; receives its `id`. The consumer performs it and closes. */
  onAction?: ((id: string) => void) | undefined;
  /** Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`. */
  onClose?: ((reason: ActionSheetCloseReason) => void) | undefined;
  /** Portal target (platform prop, not in the schema). Defaults to `document.body`; forwarded to the wide Menu. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * ActionSheet — contextual actions on an item: a bottom sheet of menu items at or below
 * `layout.maxWidth.prose`, a Menu anchored to the opener above it.
 *
 * When to use: Use an ActionSheet for contextual actions on an item — share, rename, duplicate,
 * delete — opened from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep
 * it to what fits without scrolling; more than eight actions means the item needs its own screen.
 * Put destructive actions last with `tone: danger`.
 */
export function ActionSheet({
  ref,
  open,
  heading,
  actions,
  dismissible = true,
  cancelLabel,
  onAction,
  onClose,
  container,
  overrides,
  ...rest
}: ActionSheetProps & { ref?: Ref<HTMLDialogElement> | undefined }): ReactElement | null {
  const hydrated = useHydrated();
  const isWide = useIsWide();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // The element focused when `open` became true: the wide Menu anchors to it, and both
  // presentations return focus to it. Captured during render, before any child effect moves focus.
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  // A choice was made in the wide Menu during this opening: no close reason may follow it.
  const choseRef = useRef(false);
  // The flag flips here rather than in an effect: the enter layout effect focuses the first item and
  // sets state, which re-renders before any passive effect runs, and a capture still armed on that
  // re-render would record the focused item as the opener — leaving `anchor` and the focus restore
  // pointing inside the sheet. One capture per opening, decided the moment `open` turns true.
  if (open && !wasOpenRef.current) {
    if (typeof document !== 'undefined') {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement ? active : document.body;
    }
    choseRef.current = false;
    wasOpenRef.current = true;
  } else if (!open && wasOpenRef.current) {
    wasOpenRef.current = false;
  }

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  const [visible, setVisible] = useState(false);
  const [dragPhase, setDragPhase] = useState<DragPhase>('idle');
  const [activeId, setActiveId] = useState<string | null>(null);

  if (open && !present) setPresent(true);

  // The sheet's <dialog>, null while closed and in the wide presentation.
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, [isWide, open, present]);

  const accessibleLabel = heading || COPY.defaultLabel;
  const { normal, danger } = partition(actions);
  const ordered = [...normal, ...danger];
  const enabled = ordered.filter((action) => !action.disabled);

  // Enter: show the native modal dialog, focus the first enabled action, reveal on the next frame.
  useLayoutEffect(() => {
    if (!present || isWide || !open || !hydrated) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) {
      // inert-background is showModal()'s guarantee; the `open`-attribute fallback exists only so
      // tests can render in jsdom and makes nothing inert. A refused showModal() (the dialog is
      // already in the top layer, or detached) must not throw out of this effect and take the whole
      // sheet down with it — the sheet still renders, just without the inert background.
      let shown = false;
      if (typeof dialog.showModal === 'function') {
        try {
          dialog.showModal();
          shown = true;
        } catch {
          shown = false;
        }
      }
      if (!shown) dialog.setAttribute('open', '');
    }
    const first = enabled[0];
    if (first) {
      setActiveId(first.id);
      itemRefs.current.get(first.id)?.focus();
    }
    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present, isWide, open, hydrated]);

  // Exit: focus returns to the opener at the start of the transition (the FocusScope is inactive
  // from this moment, so a mounted scope never pulls it back), then close() and unmount at the end.
  useEffect(() => {
    if (open || !present) return undefined;
    setVisible(false);
    const opener = openerRef.current;
    if (opener?.isConnected) opener.focus();
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    const finish = (): void => {
      if (dialog?.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
      setPresent(false);
    };
    if (isWide || !surface || hasNoTransition(surface)) {
      finish();
      return undefined;
    }
    const handleExited = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') finish();
    };
    surface.addEventListener('transitionend', handleExited);
    return () => surface.removeEventListener('transitionend', handleExited);
  }, [open, present, isWide]);

  // The released offset stays on the surface until the consumer's next render decides what it means.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;

    // held: the render that follows the `onClose` call has arrived (a setState in the handler is
    // batched into it). `open` still true springs back; `open` false plays the normal exit.
    if (dragPhase === 'held') {
      setDragPhase(open ? 'settling' : 'exiting');
      return undefined;
    }

    // exiting: `--visible` came off in the same commit, so dropping the inline offset animates the
    // exit from wherever the finger left the sheet.
    if (dragPhase === 'exiting') {
      if (open) {
        setDragPhase('settling');
        return undefined;
      }
      if (surface) surface.style.transform = '';
      setDragPhase('idle');
      return undefined;
    }

    // settling: spring back to rest over the exit duration with motion.easing.standard. Clearing the
    // offset also finishes an interrupted enter animation.
    if (dragPhase !== 'settling') return undefined;
    if (!surface) {
      setDragPhase('idle');
      return undefined;
    }
    surface.style.transform = '';
    if (hasNoTransition(surface)) {
      setDragPhase('idle');
      return undefined;
    }
    const handleSettled = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') setDragPhase('idle');
    };
    surface.addEventListener('transitionend', handleSettled);
    return () => surface.removeEventListener('transitionend', handleSettled);
  }, [dragPhase, open]);

  // Body scroll lock while the sheet is present.
  useEffect(() => {
    if (!present || isWide) return undefined;
    document.documentElement.classList.add('ds-action-sheet-lock-scroll');
    return () => document.documentElement.classList.remove('ds-action-sheet-lock-scroll');
  }, [present, isWide]);

  const requestClose = (reason: ActionSheetCloseReason): void => {
    // Escape reports even when the sheet is not dismissible, as in Dialog.
    if (reason !== 'escape' && !dismissible) return;
    onClose?.(reason);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>): void => {
    if (event.key !== 'Escape') return;
    // The consumer owns `open`; preventing the keydown also suppresses the native `cancel`.
    event.preventDefault();
    event.stopPropagation();
    requestClose('escape');
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    event.preventDefault();
    requestClose('escape');
  };

  // Drag lives on the header (which holds the handle), as in BottomSheet. Nothing is claimed until
  // the pointer has moved `dragSlop` downward, so a tap on the header is not a drag.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!dismissible || !open || dragRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // No coordinate, no gesture: an environment without Pointer Events must not translate the surface.
    if (!Number.isFinite(event.clientY)) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      originY: event.clientY,
      claimed: false,
      previous: null,
      last: null,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !surface) return;
    if (!Number.isFinite(event.clientY)) return;
    if (!drag.claimed) {
      const moved = event.clientY - drag.startY;
      if (moved <= 0 || moved < resolveDragSlop(surface)) return;
      drag.claimed = true;
      // The offset counts from where the slop was crossed, so the surface does not jump.
      drag.originY = event.clientY;
      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      // The drag-follow tracks the finger directly, reduced motion or not.
      setDragPhase('dragging');
    }
    drag.previous = drag.last;
    drag.last = { y: event.clientY, time: event.timeStamp };
    surface.style.transform = `translateY(${Math.max(0, event.clientY - drag.originY)}px)`;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const surface = surfaceRef.current;
    if (!drag.claimed || !surface) return;

    const travelled = Number.isFinite(event.clientY) ? Math.max(0, event.clientY - drag.originY) : 0;
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && travelled > sheetHeight * DISMISS_DISTANCE;
    // Velocity between the last two move samples before release; only downward speed counts.
    let velocity = 0;
    if (drag.previous && drag.last && drag.last.time > drag.previous.time) {
      velocity = (drag.last.y - drag.previous.y) / (drag.last.time - drag.previous.time);
    }

    if (cancelled || !open || !(pastDistance || velocity > DISMISS_VELOCITY)) {
      setDragPhase('settling');
      return;
    }
    // Hold the released offset until the consumer's next render, then exit or spring back from there.
    setDragPhase('held');
    requestClose('drag');
  };

  const focusAction = (action: ActionSheetAction | undefined): void => {
    if (!action) return;
    setActiveId(action.id);
    itemRefs.current.get(action.id)?.focus();
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (enabled.length === 0) return;
    const index = enabled.findIndex((action) => action.id === activeId);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAction(enabled[(index + 1) % enabled.length]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAction(enabled[(index - 1 + enabled.length) % enabled.length]);
        break;
      case 'Home':
        event.preventDefault();
        focusAction(enabled[0]);
        break;
      case 'End':
        event.preventDefault();
        focusAction(enabled[enabled.length - 1]);
        break;
      default:
        break;
    }
  };

  const choose = (action: ActionSheetAction) => (event: ReactMouseEvent<HTMLButtonElement>): void => {
    // Enter and Space reach here as the native button's click.
    if (action.disabled) {
      event.preventDefault();
      return;
    }
    onAction?.(action.id);
  };

  // Menu's reasons map to ours; a close that accompanies a choice never fires onClose.
  const handleMenuOpenChange = (next: boolean, reason: MenuOpenChangeReason): void => {
    if (next) return;
    if (reason === 'action') {
      choseRef.current = true;
      return;
    }
    if (choseRef.current) return;
    if (reason === 'escape') onClose?.('escape');
    else if (reason === 'outside' || reason === 'tab-out') onClose?.('scrim');
    // A `focus-out` raised because the window itself lost focus is no dismissal: report nothing.
    else if (reason === 'focus-out' && document.hasFocus()) onClose?.('scrim');
  };

  const handleCancelRowClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const button = cancelButtonRef.current;
    if (!button || button.contains(event.target as Node)) return;
    button.click();
  };

  const handleMenuAction = (id: string): void => {
    choseRef.current = true;
    onAction?.(id);
  };

  // Nothing renders until hydration is over: the server has no `document` to portal into.
  if (!hydrated) return null;

  if (isWide) {
    if (!open) return null;
    const menuOverrides: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> = {};
    for (const [binding, token] of Object.entries(overrides ?? {}) as [ActionSheetOverridableBinding, TokenRef | undefined][]) {
      const forward = MENU_FORWARD[binding];
      if (token && forward) menuOverrides[forward] = token;
    }
    // Menu owns every part and its own hooks here; no ActionSheet `data-part` values appear.
    return (
      <Menu
        label={accessibleLabel}
        items={toMenuItems(actions)}
        open
        anchor={openerRef}
        onAction={handleMenuAction}
        onOpenChange={handleMenuOpenChange}
        container={container}
        overrides={Object.keys(menuOverrides).length > 0 ? menuOverrides : undefined}
      />
    );
  }

  if (!present) return null;

  const rootStyle: Record<string, string> = {};
  const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const iconOverrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {};
  for (const [binding, token] of Object.entries(overrides ?? {}) as [ActionSheetOverridableBinding, TokenRef | undefined][]) {
    // Locked bindings passed from JavaScript have no hook and are ignored.
    const hook = OVERRIDE_HOOK[binding] as string | undefined;
    if (!token || !hook) continue;
    rootStyle[hook] = cssVar(token);
    const textForward = TEXT_FORWARD[binding];
    if (textForward) textOverrides[textForward] = token;
    const iconForward = ICON_FORWARD[binding];
    if (iconForward) iconOverrides[iconForward] = token;
  }
  const hasIconOverrides = Object.keys(iconOverrides).length > 0;

  const renderItem = (action: ActionSheetAction): ReactElement => (
    <button
      key={action.id}
      ref={(element) => {
        if (element) itemRefs.current.set(action.id, element);
        else itemRefs.current.delete(action.id);
      }}
      type="button"
      role="menuitem"
      tabIndex={action.id === (activeId ?? enabled[0]?.id) ? 0 : -1}
      aria-disabled={action.disabled ? 'true' : undefined}
      data-part="item"
      className={[
        'ds-action-sheet__item',
        action.tone === 'danger' ? 'ds-action-sheet__item--danger' : '',
        action.disabled ? 'ds-action-sheet__item--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onFocus={() => {
        if (!action.disabled && activeId !== action.id) setActiveId(action.id);
      }}
      onClick={choose(action)}
    >
      {action.icon ? (
        <span className="ds-action-sheet__icon" data-part="itemIcon" aria-hidden="true">
          <Icon name={action.icon} overrides={hasIconOverrides ? iconOverrides : undefined} />
        </span>
      ) : null}
      <span className="ds-action-sheet__label">{action.label}</span>
    </button>
  );

  const className = [
    'ds-action-sheet',
    // The open class follows the one DOM-driven flag, never the prop alone.
    visible && open ? 'ds-action-sheet--visible' : '',
    dragPhase === 'dragging' ? 'ds-action-sheet--dragging' : '',
    dragPhase === 'settling' ? 'ds-action-sheet--settling' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="ActionSheet"
      className={className}
      style={Object.keys(rootStyle).length > 0 ? (rootStyle as CSSProperties) : undefined}
      aria-modal="true"
      aria-label={accessibleLabel}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
    >
      <div className="ds-action-sheet__scrim" data-part="scrim" aria-hidden="true" onClick={() => requestClose('scrim')} />
      <FocusScope trapped autoFocus="none" restoreFocus active={open} returnFocusTo={openerRef} data-part="focusScope">
        <div ref={surfaceRef} className="ds-action-sheet__surface" data-part="surface">
          {dismissible || heading ? (
            <div
              className="ds-action-sheet__header"
              data-part="header"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => endDrag(event, false)}
              onPointerCancel={(event) => endDrag(event, true)}
            >
              {dismissible ? <span className="ds-action-sheet__handle" data-part="handle" aria-hidden="true" /> : null}
              {heading ? (
                <Text
                  element="p"
                  size="sm"
                  tone="muted"
                  data-part="heading"
                  overrides={Object.keys(textOverrides).length > 0 ? textOverrides : undefined}
                >
                  {heading}
                </Text>
              ) : null}
            </div>
          ) : null}
          <div
            role="menu"
            aria-label={accessibleLabel}
            data-part="list"
            className="ds-action-sheet__list"
            onKeyDown={handleListKeyDown}
          >
            {normal.map(renderItem)}
            {normal.length > 0 && danger.length > 0 ? (
              <div role="separator" className="ds-action-sheet__divider" data-part="divider" />
            ) : null}
            {danger.map(renderItem)}
          </div>
          {dismissible ? (
            <>
              <div className="ds-action-sheet__divider" data-part="divider" aria-hidden="true" />
              {/* Button stamps its own data-part, so the part hook sits on the row that wraps it; a
                  press on the row that missed the Button is forwarded to it. */}
              <div className="ds-action-sheet__cancel-row" data-part="cancelButton" onClick={handleCancelRowClick}>
                <Button
                  ref={cancelButtonRef}
                  variant="secondary"
                  label={cancelLabel || COPY.cancelLabel}
                  onClick={() => requestClose('cancel')}
                />
              </div>
            </>
          ) : null}
        </div>
      </FocusScope>
    </dialog>,
    container ?? document.body,
  );
}
