import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
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
import { Icon, type IconName } from './Icon';
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
export type ActionSheetAction = { id: string; label: string; icon?: IconName; tone?: "default" | "danger"; disabled?: boolean };

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
  | 'lineHeight'
  | 'divider'
  | 'dividerWidth'
  | 'layer'
  | 'enter'
  | 'exit';

/** Host hooks. `titleSize` has none: it reaches the heading Text only. */
const OVERRIDE_HOOK: Partial<Record<ActionSheetOverridableBinding, string>> = {
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
  fontFamily: '--ds-action-sheet-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-action-sheet-font-size',
  lineHeight: '--ds-action-sheet-line-height',
  divider: '--ds-action-sheet-divider',
  dividerWidth: '--ds-action-sheet-divider-width',
  layer: '--ds-action-sheet-layer',
  enter: '--ds-action-sheet-enter',
  exit: '--ds-action-sheet-exit',
};

/** Bindings forwarded to the composed heading Text, under Text's own binding name. */
const TEXT_FORWARD: Partial<Record<ActionSheetOverridableBinding, TextOverridableBinding>> = {
  titleSize: 'fontSize',
  fontFamily: 'fontFamily', // literal-ok: Text binding name, not a font stack
  lineHeight: 'lineHeight',
};

/** Bindings forwarded to the wide Menu: the ones sharing a name, plus divider → separator. */
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

/** Fraction of the sheet height a downward drag must pass for release to dismiss it. */
const DISMISS_DISTANCE = 0.25;
/** Drag speed at release (px/ms) that dismisses the sheet whatever the distance travelled. */
const DISMISS_VELOCITY = 1.5;

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

function useIsWide(): boolean {
  const [isWide, setIsWide] = useState(() => wideQuery()?.matches ?? false);
  useEffect(() => {
    const query = wideQuery();
    if (!query) return undefined;
    const onChange = (): void => setIsWide(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isWide;
}

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
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onClose' | 'open' | 'className' | 'style'> {
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
   * Two to about eight actions. `danger` actions are visually distinct and grouped last. The count
   * is guidance, not enforced: no dev warning outside that range.
   */
  actions: ActionSheetAction[];
  /**
   * Escape, the scrim, the cancel row and the drag all request close. When false, as in Dialog: the
   * Cancel row and the divider above it are not rendered, the drag handle is not rendered, the scrim
   * and the drag do nothing, and Escape still reports through onClose. It gates the sheet
   * presentation only — the wide Menu presentation has no scrim, drag or cancel row, and clicking
   * outside always closes it.
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
  const isWide = useIsWide();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);

  // The element focused when `open` became true: the wide Menu anchors to it, and both
  // presentations return focus to it. Captured during render, before any child effect moves focus.
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  // A choice was made in the wide Menu during this opening: no close reason may follow it.
  const choseRef = useRef(false);
  if (open && !wasOpenRef.current && typeof document !== 'undefined') {
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : document.body;
    choseRef.current = false;
  }
  useEffect(() => {
    wasOpenRef.current = open;
  }, [open]);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
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
    if (!present || isWide || !open) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
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
  }, [present, isWide, open]);

  // Exit: slide out, then close() and unmount once the transition ends (at once when there is none).
  useEffect(() => {
    if (open || !present) return undefined;
    setVisible(false);
    setSettling(false);
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    const finish = (): void => {
      if (dialog?.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
      setPresent(false);
      setDragging(false);
    };
    const duration = surface ? Number.parseFloat(getComputedStyle(surface).transitionDuration || '0') : 0;
    if (isWide || !surface || prefersReducedMotion() || !(duration > 0)) {
      finish();
      return undefined;
    }
    const handleEnd = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') finish();
    };
    surface.addEventListener('transitionend', handleEnd);
    return () => surface.removeEventListener('transitionend', handleEnd);
  }, [open, present, isWide]);

  // Body scroll lock while the sheet is present.
  useEffect(() => {
    if (!present || isWide) return undefined;
    document.documentElement.classList.add('ds-action-sheet-lock-scroll');
    return () => document.documentElement.classList.remove('ds-action-sheet-lock-scroll');
  }, [present, isWide]);

  const requestClose = (reason: ActionSheetCloseReason): void => {
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

  // Drag lives on the header (handle + heading), as in BottomSheet; only while dismissible.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!dismissible || !surfaceRef.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { startY: event.clientY, startTime: event.timeStamp };
    setSettling(false);
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface) return;
    surface.style.setProperty('--ds-action-sheet-drag', `${Math.max(0, event.clientY - drag.startY)}px`);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    dragRef.current = null;
    if (!drag || !surface) return;
    const distance = Math.max(0, event.clientY - drag.startY);
    const elapsed = Math.max(1, event.timeStamp - drag.startTime);
    const height = surface.getBoundingClientRect().height;
    const pastDistance = height > 0 && distance / height > DISMISS_DISTANCE;
    if (pastDistance || distance / elapsed > DISMISS_VELOCITY) {
      // Hold the released position; the exit slides on from there once the consumer closes.
      requestClose('drag');
      return;
    }
    surface.style.removeProperty('--ds-action-sheet-drag');
    setDragging(false);
    setSettling(!prefersReducedMotion());
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
    else if (reason === 'outside' || reason === 'tab-out' || reason === 'focus-out') onClose?.('scrim');
  };

  const handleMenuAction = (id: string): void => {
    choseRef.current = true;
    onAction?.(id);
  };

  if (isWide) {
    if (!open || typeof document === 'undefined') return null;
    const menuOverrides: Partial<Record<MenuOverridableBinding, TokenRef | undefined>> = {};
    for (const [binding, token] of Object.entries(overrides ?? {}) as [ActionSheetOverridableBinding, TokenRef | undefined][]) {
      const forward = MENU_FORWARD[binding];
      if (token && forward) menuOverrides[forward] = token;
    }
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

  if (!present || typeof document === 'undefined') return null;

  const rootStyle: Record<string, string> = {};
  const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  for (const [binding, token] of Object.entries(overrides ?? {}) as [ActionSheetOverridableBinding, TokenRef | undefined][]) {
    if (!token) continue;
    const hook = OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(token);
    const forward = TEXT_FORWARD[binding];
    if (forward) textOverrides[forward] = token;
  }

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
          <Icon name={action.icon} inline />
        </span>
      ) : null}
      <span className="ds-action-sheet__label">{action.label}</span>
    </button>
  );

  const className = [
    'ds-action-sheet',
    visible ? 'ds-action-sheet--visible' : '',
    dragging ? 'ds-action-sheet--dragging' : '',
    settling ? 'ds-action-sheet--settling' : '',
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
      <FocusScope trapped autoFocus="none" restoreFocus returnFocusTo={openerRef} data-part="focusScope">
        <div
          ref={surfaceRef}
          className="ds-action-sheet__surface"
          data-part="surface"
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && settling) setSettling(false);
          }}
        >
          {dismissible || heading ? (
            <div
              className="ds-action-sheet__header"
              data-part="header"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrag}
              onPointerCancel={finishDrag}
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
              {/* Button stamps its own data-part, so the part hook sits on the row that wraps it. */}
              <div className="ds-action-sheet__cancel-row" data-part="cancelButton">
                <Button
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
