import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Icon, type IconName } from './Icon';
import { Menu, type MenuAction, type MenuItem, type MenuOpenChangeReason } from './Menu';
import { Text, type TextOverridableBinding } from './Text';
import './ActionSheet.css';

export type ActionSheetActionTone = 'default' | 'danger';
export type ActionSheetCloseReason = 'escape' | 'scrim' | 'cancel' | 'drag';

/** A single row in the sheet. */
export type ActionSheetAction = {
  id: string;
  label: string;
  icon?: IconName;
  tone?: ActionSheetActionTone;
  disabled?: boolean;
};

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `titleSize`, and `fontFamily`/`lineHeight` for the heading, are forwarded to the
 * composed `Text` heading's own `overrides`, since Text already owns those bindings; `fontFamily`
 * and `lineHeight` are also applied to the item rows directly. Only applies to the phone
 * presentation — above the wide breakpoint the sheet renders as `Menu` and uses Menu's own
 * overrides contract.
 */
export type ActionSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'itemPaddingBlock'
  | 'itemPaddingInline'
  | 'itemGap'
  | 'headerPaddingBlock'
  | 'titleSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'divider'
  | 'dividerWidth'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

const ROOT_OVERRIDE_HOOK: Partial<Record<ActionSheetOverridableBinding, string>> = {
  scrim: '--ds-action-sheet-scrim',
  shadow: '--ds-action-sheet-shadow',
  radius: '--ds-action-sheet-radius',
  itemPaddingBlock: '--ds-action-sheet-item-padding-block',
  itemPaddingInline: '--ds-action-sheet-item-padding-inline',
  itemGap: '--ds-action-sheet-item-gap',
  headerPaddingBlock: '--ds-action-sheet-header-padding-block',
  fontFamily: '--ds-action-sheet-font-family',
  fontSize: '--ds-action-sheet-font-size',
  lineHeight: '--ds-action-sheet-line-height',
  divider: '--ds-action-sheet-divider',
  dividerWidth: '--ds-action-sheet-divider-width',
  maxWidth: '--ds-action-sheet-max-width',
  layer: '--ds-action-sheet-layer',
  enter: '--ds-action-sheet-enter',
  exit: '--ds-action-sheet-exit',
};

function overridesToStyle(overrides: Partial<Record<ActionSheetOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  textOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const textOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  for (const binding of Object.keys(overrides) as ActionSheetOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
    if (binding === 'titleSize') textOverrides.fontSize = ref;
    if (binding === 'fontFamily') textOverrides.fontFamily = ref;
    if (binding === 'lineHeight') textOverrides.lineHeight = ref;
  }
  return { rootStyle: rootStyle as CSSProperties, textOverrides };
}

const COPY = { cancelLabel: 'Cancel', defaultLabel: 'Actions' };

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * Above `layout.maxWidth.prose` (read from the loaded token stylesheet, never hard-coded) the sheet
 * presents as a Menu anchored to the trigger instead of rising from the bottom edge.
 */
function useIsWideViewport(): boolean {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
    if (!breakpoint) return undefined;
    const query = window.matchMedia(`(min-width: ${breakpoint})`);
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isWide;
}

function toMenuAction(action: ActionSheetAction): MenuAction {
  return { id: action.id, label: action.label, icon: action.icon, tone: action.tone, disabled: action.disabled };
}

/** Danger actions are grouped last, separated from the rest — mirrored for both presentations. */
function partitionActions(actions: ActionSheetAction[]): { normal: ActionSheetAction[]; danger: ActionSheetAction[] } {
  const normal = actions.filter((action) => action.tone !== 'danger');
  const danger = actions.filter((action) => action.tone === 'danger');
  return { normal, danger };
}

function toMenuItems(actions: ActionSheetAction[]): MenuItem[] {
  const { normal, danger } = partitionActions(actions);
  const items: MenuItem[] = normal.map(toMenuAction);
  if (danger.length > 0) {
    items.push({ separator: true });
    items.push(...danger.map(toMenuAction));
  }
  return items;
}

export interface ActionSheetProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onClose' | 'open'> {
  /** Controlled visibility. */
  open: boolean;
  /**
   * What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;
   * when omitted the name is `copy.defaultLabel`.
   */
  heading?: string;
  /** Two to about eight actions. `danger` actions are visually distinct and grouped last. */
  actions: ActionSheetAction[];
  /** Escape, the scrim, the cancel row and the drag all request close; Escape still reports through onClose when false, as in Dialog. */
  dismissible?: boolean;
  /** Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string;
  /** An action was chosen; receives its `id`. The consumer performs it and closes. */
  onAction?: (id: string) => void;
  /** Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`. */
  onClose?: (reason: ActionSheetCloseReason) => void;
  /** Portal target for the sheet's DOM node. Defaults to `document.body`. */
  container?: HTMLElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ActionSheetOverridableBinding, TokenRef>>;
}

/**
 * ActionSheet — Design Schema, category: overlay.
 *
 * When to use:
 * Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened
 * from an overflow Button (`iconOnly`, label "More actions") or a long-press. Keep it to what fits
 * without scrolling; more than eight actions means the item needs its own screen. Put destructive
 * actions last with `tone: danger`.
 */
export const ActionSheet = forwardRef<HTMLDialogElement, ActionSheetProps>(function ActionSheet(
  {
    open,
    heading,
    actions,
    dismissible = true,
    cancelLabel,
    onAction,
    onClose,
    container,
    overrides,
    className,
    style,
    ...rest
  },
  ref,
) {
  const isWide = useIsWideViewport();

  const generatedId = useId();
  const listId = `ds-action-sheet${generatedId}-list`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);
  // The element that opened the wide (Menu) presentation, so its popup can anchor to it.
  const menuAnchorRef = useRef<HTMLElement | null>(null);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const accessibleLabel = heading || COPY.defaultLabel;
  const { normal: normalActions, danger: dangerActions } = partitionActions(actions);

  useEffect(() => {
    if (open) setPresent(true);
  }, [open]);

  // Captures the trigger at the moment the wide (Menu) presentation opens, so Menu's `anchor` prop
  // can position its popup against it (Menu renders no trigger of its own in that mode).
  useEffect(() => {
    if (!open || !isWide) return;
    const opener = document.activeElement;
    if (opener instanceof HTMLElement) menuAnchorRef.current = opener;
  }, [open, isWide]);

  // Mount: open the native dialog, move focus to the first enabled action, then reveal on the next frame.
  useLayoutEffect(() => {
    if (!present || isWide) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) {
      // showModal() also reflects `open`, natively; the assignment is the fallback for engines
      // (jsdom, under test) that implement the `open` IDL attribute but not showModal() itself.
      dialog.showModal?.();
      dialog.open = true;
    }

    const first = actions.find((action) => !action.disabled);
    if (first) {
      setActiveId(first.id);
      itemRefs.current.get(first.id)?.focus();
    } else {
      dialog.focus();
    }

    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present, isWide]);

  // Exit: hide, then unmount and close() once the transition finishes (immediately under reduced motion).
  useEffect(() => {
    if (open || !present || isWide) return undefined;
    setVisible(false);
    const dialog = dialogRef.current;
    const finish = () => {
      setPresent(false);
      dialog?.close?.();
      if (dialog) dialog.open = false;
    };
    if (prefersReducedMotion()) {
      finish();
      return undefined;
    }
    const surface = surfaceRef.current;
    const handleExited = (event: TransitionEvent) => {
      if (event.target !== surface || event.propertyName !== 'transform') return;
      finish();
    };
    surface?.addEventListener('transitionend', handleExited);
    return () => surface?.removeEventListener('transitionend', handleExited);
  }, [open, present, isWide]);

  // Body scroll lock while the sheet is present, restored on close or unmount.
  useEffect(() => {
    if (!present || isWide) return undefined;
    document.documentElement.classList.add('ds-action-sheet-lock-scroll');
    return () => document.documentElement.classList.remove('ds-action-sheet-lock-scroll');
  }, [present, isWide]);

  const requestClose = (reason: ActionSheetCloseReason) => {
    if (reason !== 'escape' && !dismissible) return;
    onClose?.(reason);
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // The consumer owns `open`; the sheet never closes itself, even when it is not dismissible.
    event.preventDefault();
    requestClose('escape');
  };

  const handleScrimClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    requestClose('scrim');
  };

  const handleCancelButtonClick = () => requestClose('cancel');

  // Drag: Pointer Events on the surface (excluding rows and the cancel button), tracking downward
  // distance only. Released past 25% of the sheet's height or a fast flick dismisses; otherwise the
  // sheet springs back on the same transition the open/close states use.
  const handleSurfacePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startY: event.clientY, startTime: event.timeStamp };
    surface.style.transition = 'none';
  };

  const handleSurfacePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface) return;
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    dragRef.current = null;
    if (!drag || !surface) return;

    const deltaY = Math.max(0, event.clientY - drag.startY);
    const elapsed = Math.max(1, event.timeStamp - drag.startTime);
    const velocity = deltaY / elapsed;
    const sheetHeight = surface.getBoundingClientRect().height || 1;
    const pastThreshold = deltaY / sheetHeight > 0.25 || velocity > 0.5;

    surface.style.transition = prefersReducedMotion() ? 'none' : '';
    surface.style.transform = '';

    if (pastThreshold) requestClose('drag');
  };

  const focusAction = (id: string) => {
    setActiveId(id);
    itemRefs.current.get(id)?.focus();
  };

  const activateAction = (action: ActionSheetAction) => {
    if (action.disabled) return;
    onAction?.(action.id);
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabled = actions.filter((action) => !action.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((action) => action.id === activeId);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAction(enabled[(currentIndex + 1) % enabled.length].id);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAction(enabled[(currentIndex - 1 + enabled.length) % enabled.length].id);
        break;
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
      default:
        break;
    }
  };

  const handleItemMouseEnter = (action: ActionSheetAction) => {
    if (action.disabled) return;
    focusAction(action.id);
  };

  const handleItemClick = (action: ActionSheetAction) => (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (action.disabled) {
      event.preventDefault();
      return;
    }
    activateAction(action);
  };

  // Menu reports why it closed; an item choice (`action`) is handled by handleMenuAction instead.
  // `outside` (a click away from the popup) is this presentation's equivalent of the scrim tap, so
  // it maps to 'scrim'; every other reason (trigger, controlled) falls back to 'escape'.
  const handleMenuOpenChange = ({ open: isOpen, reason }: { open: boolean; reason: MenuOpenChangeReason }) => {
    if (isOpen || reason === 'action') return;
    requestClose(reason === 'outside' ? 'scrim' : 'escape');
  };

  const handleMenuAction = (id: string) => {
    onAction?.(id);
  };

  const renderItem = (action: ActionSheetAction) => {
    const classes = [
      'ds-action-sheet__item',
      action.tone === 'danger' ? 'ds-action-sheet__item--danger' : null,
      action.disabled ? 'ds-action-sheet__item--disabled' : null,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <button
        key={action.id}
        ref={(element) => {
          if (element) itemRefs.current.set(action.id, element);
          else itemRefs.current.delete(action.id);
        }}
        type="button"
        role="menuitem"
        id={`${listId}-item-${action.id}`}
        tabIndex={action.id === activeId ? 0 : -1}
        aria-disabled={action.disabled ? 'true' : undefined}
        data-part="item"
        className={classes}
        onMouseEnter={() => handleItemMouseEnter(action)}
        onClick={handleItemClick(action)}
      >
        {action.icon ? (
          <span className="ds-action-sheet__item-icon" data-part="itemIcon" aria-hidden="true">
            <Icon name={action.icon} inline />
          </span>
        ) : null}
        <span className="ds-action-sheet__item-label">{action.label}</span>
      </button>
    );
  };

  const { rootStyle: overrideStyle, textOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, textOverrides: {} };

  if (isWide) {
    if (!open) return null;
    return (
      <Menu
        label={accessibleLabel}
        items={toMenuItems(actions)}
        open
        anchor={menuAnchorRef}
        onAction={handleMenuAction}
        onOpenChange={handleMenuOpenChange}
        container={container}
      />
    );
  }

  if (!present) return null;

  const classes = ['ds-action-sheet', visible ? 'ds-action-sheet--visible' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="ActionSheet"
      className={classes}
      style={mergedStyle}
      aria-modal="true"
      onCancel={handleCancel}
      onClick={handleScrimClick}
    >
      <FocusScope trapped autoFocus="none" restoreFocus>
        <div
          className="ds-action-sheet__surface"
          ref={surfaceRef}
          data-part="surface"
          onPointerDown={handleSurfacePointerDown}
          onPointerMove={handleSurfacePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          <div className="ds-action-sheet__header" data-part="header">
            <span className="ds-action-sheet__handle" data-part="handle" aria-hidden="true" />
            {heading ? (
              <Text
                size="sm"
                tone="muted"
                data-part="heading"
                className="ds-action-sheet__heading"
                overrides={Object.keys(textOverrides).length ? textOverrides : undefined}
              >
                {heading}
              </Text>
            ) : null}
          </div>
          <div
            role="menu"
            id={listId}
            aria-label={accessibleLabel}
            data-part="list"
            className="ds-action-sheet__list"
            onKeyDown={handleListKeyDown}
          >
            {normalActions.map(renderItem)}
            {dangerActions.length > 0 ? (
              <div role="separator" className="ds-action-sheet__divider" aria-hidden="true" />
            ) : null}
            {dangerActions.map(renderItem)}
          </div>
          <div role="separator" className="ds-action-sheet__divider" aria-hidden="true" />
          <div className="ds-action-sheet__cancel-row">
            <Button
              variant="secondary"
              label={cancelLabel || COPY.cancelLabel}
              data-part="cancelButton"
              className="ds-action-sheet__cancel"
              onClick={handleCancelButtonClick}
            />
          </div>
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, container ?? document.body);
});
