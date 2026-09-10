import {
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Attributes,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import './SidePanel.css';

export type SidePanelSide = 'start' | 'end';
export type SidePanelWidth = 'narrow' | 'default' | 'wide';
export type SidePanelPersistent = 'never' | 'content' | 'page';
export type SidePanelOpenChangeReason =
  | 'trigger'
  | 'escape'
  | 'close-button'
  | 'scrim'
  | 'swipe'
  | 'action'
  | 'navigation';

/** Reasons that request close but are not blocked by `dismissible: false` — only the trigger, footer actions, and following a link still work. */
const ALWAYS_ALLOWED_REASONS: ReadonlySet<SidePanelOpenChangeReason> = new Set(['trigger', 'action', 'navigation']);

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type SidePanelOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'border'
  | 'borderWidth'
  | 'width'
  | 'widthNarrow'
  | 'widthWide'
  | 'edgeGutter'
  | 'inset'
  | 'headerGap'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

const OVERRIDE_HOOK: Record<SidePanelOverridableBinding, string> = {
  scrim: '--ds-side-panel-scrim',
  shadow: '--ds-side-panel-shadow',
  border: '--ds-side-panel-border',
  borderWidth: '--ds-side-panel-border-width',
  width: '--ds-side-panel-width',
  widthNarrow: '--ds-side-panel-width-narrow',
  widthWide: '--ds-side-panel-width-wide',
  edgeGutter: '--ds-side-panel-edge-gutter',
  inset: '--ds-side-panel-inset',
  headerGap: '--ds-side-panel-header-gap',
  partGap: '--ds-side-panel-part-gap',
  footerGap: '--ds-side-panel-footer-gap',
  layer: '--ds-side-panel-layer',
  enter: '--ds-side-panel-enter',
  exit: '--ds-side-panel-exit',
};

function overridesToStyle(overrides: Partial<Record<SidePanelOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as SidePanelOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { closeLabel: 'Close' };

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * Above the given token custom property's breakpoint (read from the loaded token stylesheet, never
 * hard-coded), the panel stops being an overlay and becomes a fixed sidebar. `null` never matches.
 */
function useBreakpoint(cssVarName: string | null): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (!cssVarName || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setMatches(false);
      return undefined;
    }
    // literal-ok: breakpoint value read from the token custom property at runtime, not a literal.
    const value = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    if (!value) return undefined;
    const query = window.matchMedia(`(min-width: ${value})`);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [cssVarName]);

  return matches;
}

export interface SidePanelProps {
  /**
   * The Button that shows and hides the panel (usually `iconOnly` with a label like "Menu"). It is
   * the APG disclosure button: the panel adds aria-expanded and aria-controls to it, and it stays a
   * toggle — pressing it again closes. Omit to control `open` from elsewhere (a Toolbar).
   */
  trigger?: ReactElement;
  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideTitle`. */
  title: string;
  /** Keep the title for assistive technology but do not render it. The accessible name is required regardless. */
  hideTitle?: boolean;
  /** The body: a List or Tree of Links for navigation, a Form of filters, a Stack of Cards. Scrolls inside the panel when taller than the viewport. */
  children: ReactNode;
  /** Pinned to the bottom of the panel above the safe area. */
  footer?: ReactNode;
  /** The edge the panel slides from: `start` is left in left-to-right languages and right in right-to-left; `end` the opposite. */
  side?: SidePanelSide;
  /** Panel width on wide screens: `narrow` for a list of links, `wide` for a form or a detail. */
  width?: SidePanelWidth;
  /**
   * Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the
   * content: always visible, no scrim, no trap, part of the page's tab order, and the trigger is
   * hidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page.
   */
  persistent?: SidePanelPersistent;
  /**
   * False (the default, the disclosure pattern): no scrim by default, the page stays live and in
   * the tab order, focus stays on the trigger when it opens, and Escape or an outside click closes
   * it. True: the panel is a modal Dialog at the edge — scrim, focus trapped, page inert.
   */
  modal?: boolean;
  /** Show the scrim in non-modal mode too (modal always has one). */
  scrim?: boolean;
  /**
   * Escape, the close button, a scrim tap / outside click, and the swipe gesture all request
   * close. When false, only the trigger and footer actions close it.
   */
  dismissible?: boolean;
  /** On touch, a swipe toward the edge dismisses. Purely additive: the trigger and close button always exist. */
  swipeable?: boolean;
  /**
   * Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `close-button`, `scrim`, `swipe`, `action`, `navigation` (a Link inside was followed).
   */
  onOpenChange?: (open: boolean, reason: SidePanelOpenChangeReason) => void;
  /** Portal target for the panel's DOM node. Defaults to `document.body`. Not used in persistent mode. */
  container?: HTMLElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef>>;
}

/**
 * SidePanel — Design Schema, category: overlay.
 *
 * When to use:
 * Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a List or Tree of
 * Links from the `start` edge), for filters beside a results page, for a cart or a detail panel
 * from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should
 * become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary
 * overlay (a cart).
 */
export const SidePanel = forwardRef<HTMLDivElement, SidePanelProps>(function SidePanel(
  {
    trigger,
    open: openProp,
    title,
    hideTitle = false,
    children,
    footer,
    side = 'start',
    width = 'default',
    persistent = 'never',
    modal = false,
    scrim = true,
    dismissible = true,
    swipeable = true,
    onOpenChange,
    container,
    overrides,
  },
  ref,
) {
  const breakpointVar =
    persistent === 'content' ? '--layout-max-width-content' : persistent === 'page' ? '--layout-max-width-page' : null;
  const isPersistentActive = useBreakpoint(breakpointVar);

  const generatedId = useId();
  const triggerId = `ds-side-panel${generatedId}-trigger`;
  const panelId = `ds-side-panel${generatedId}-panel`;
  const titleId = `ds-side-panel${generatedId}-title`;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement, []);

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{ startX: number; startTime: number } | null>(null);

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? (openProp as boolean) : internalOpen;

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  const closingRef = useRef(false);

  if (isDev && !title) {
    console.warn('SidePanel: `title` is required and becomes the accessible name; it must not be empty.');
  }

  const changeOpen = (value: boolean, reason: SidePanelOpenChangeReason) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value, reason);
  };

  const requestClose = (reason: SidePanelOpenChangeReason) => {
    if (!dismissible && !ALWAYS_ALLOWED_REASONS.has(reason)) return;
    if (closingRef.current) return;
    closingRef.current = true;
    changeOpen(false, reason);
  };

  const handleTriggerClick = () => {
    if (open) {
      requestClose('trigger');
    } else {
      closingRef.current = false;
      changeOpen(true, 'trigger');
    }
  };

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setPresent(true);
    }
  }, [open]);

  // Mount: open the native dialog (modal only) and move focus to the first control, then reveal on
  // the next frame. Non-modal leaves focus on the trigger, as the disclosure pattern requires.
  useLayoutEffect(() => {
    if (!present || isPersistentActive) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    if (modal && panel instanceof HTMLDialogElement && !panel.open) {
      // showModal() also reflects `open`, natively; the assignment is the fallback for engines
      // (jsdom, under test) that implement the `open` IDL attribute but not showModal() itself.
      panel.showModal?.();
      panel.open = true;
    }

    if (modal) {
      const first = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? closeButtonRef.current ?? panel).focus();
    }

    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [present, modal, isPersistentActive]);

  // Exit: hide, then unmount (and close() the native dialog) once the transition finishes.
  useEffect(() => {
    if (open || !present || isPersistentActive) return undefined;
    setVisible(false);
    const panel = panelRef.current;
    const finish = () => {
      setPresent(false);
      if (modal && panel instanceof HTMLDialogElement) {
        panel.close?.();
        panel.open = false;
      }
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
  }, [open, present, modal, isPersistentActive]);

  // Body scroll lock while a modal panel is present; the non-modal disclosure leaves the page live.
  useEffect(() => {
    if (!modal || !present || isPersistentActive) return undefined;
    document.documentElement.classList.add('ds-side-panel-lock-scroll');
    return () => document.documentElement.classList.remove('ds-side-panel-lock-scroll');
  }, [modal, present, isPersistentActive]);

  // Non-modal: a pointerdown outside the panel and trigger closes (a focusout does not).
  useEffect(() => {
    if (modal || !open || isPersistentActive) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      requestClose('scrim');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, open, isPersistentActive]);

  const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // The consumer owns `open`; the panel never closes itself, even when it is not dismissible.
    event.preventDefault();
    requestClose('escape');
  };

  const handleDialogClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target !== panelRef.current) return;
    requestClose('scrim');
  };

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    requestClose('escape');
    triggerRef.current?.focus();
  };

  const handleCloseButtonClick = () => requestClose('close-button');

  const handleScrimClick = () => requestClose('scrim');

  // A Link followed inside the panel closes it, regardless of `dismissible` — the navigation makes
  // staying open moot.
  const handleBodyClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (!(event.target as HTMLElement).closest('a[href]')) return;
    requestClose('navigation');
  };

  // Swipe: pointer drag on the header (there is no separate handle, unlike BottomSheet) tracking
  // movement toward the edge the panel slides from only. Released past 25% of the panel's width or
  // a fast flick dismisses; otherwise the panel springs back on the same transition open/close use.
  const swipeDirection = (): 1 | -1 => {
    const surface = surfaceRef.current;
    const rtl = surface ? getComputedStyle(surface).direction === 'rtl' : false;
    const anchoredLeft = (side === 'start' && !rtl) || (side === 'end' && rtl);
    return anchoredLeft ? -1 : 1;
  };

  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeable) return;
    if ((event.target as HTMLElement).closest('button')) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startTime: event.timeStamp };
    surface.style.transition = 'none';
  };

  const handleHeaderPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface) return;
    const direction = swipeDirection();
    const deltaOffscreen = Math.max(0, (event.clientX - drag.startX) * direction);
    surface.style.transform = `translateX(${direction * deltaOffscreen}px)`;
  };

  const finishHeaderDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    dragRef.current = null;
    if (!drag || !surface) return;

    const direction = swipeDirection();
    const deltaOffscreen = Math.max(0, (event.clientX - drag.startX) * direction);
    const elapsed = Math.max(1, event.timeStamp - drag.startTime);
    const velocity = deltaOffscreen / elapsed;
    const panelWidth = surface.getBoundingClientRect().width || 1;
    const pastThreshold = deltaOffscreen / panelWidth > 0.25 || velocity > 0.5;

    surface.style.transition = prefersReducedMotion() ? 'none' : '';
    surface.style.transform = '';

    if (pastThreshold) requestClose('swipe');
  };

  const triggerElement = trigger as ReactElement<{ onClick?: (event: ReactMouseEvent) => void }> | undefined;
  const clonedTrigger = triggerElement
    ? cloneElement(triggerElement, {
        ref: triggerRef,
        id: triggerId,
        'aria-expanded': open ? 'true' : 'false',
        'aria-controls': panelId,
        hidden: isPersistentActive || undefined,
        onClick: (event: ReactMouseEvent) => {
          triggerElement.props.onClick?.(event);
          handleTriggerClick();
        },
      } as unknown as Attributes)
    : null;

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const bodyOverrides = overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined;

  const titleClasses = ['ds-side-panel__title', hideTitle ? 'ds-side-panel__title--hidden' : null].filter(Boolean).join(' ');

  const header = (
    <div
      className="ds-side-panel__header"
      data-part="header"
      onPointerDown={handleHeaderPointerDown}
      onPointerMove={handleHeaderPointerMove}
      onPointerUp={finishHeaderDrag}
      onPointerCancel={finishHeaderDrag}
    >
      <Heading level={2} id={titleId} data-part="title" className={titleClasses}>
        {title}
      </Heading>
      {!isPersistentActive ? (
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="md"
          iconOnly
          label={COPY.closeLabel}
          data-part="closeButton"
          className="ds-side-panel__close"
          onClick={handleCloseButtonClick}
          leadingIcon={<Icon name="close" inline />}
        />
      ) : null}
    </div>
  );

  const body = (
    <Box
      element="div"
      inset="lg"
      overrides={bodyOverrides}
      data-part="body"
      className="ds-side-panel__body"
      ref={bodyRef}
      onClick={handleBodyClick}
    >
      {children}
    </Box>
  );

  const footerNode =
    footer !== undefined ? (
      <div className="ds-side-panel__footer" data-part="footer">
        <Stack direction="horizontal" gap="tight" justify="end">
          {footer}
        </Stack>
      </div>
    ) : null;

  if (isPersistentActive) {
    const persistentClasses = [
      'ds-side-panel__panel',
      `ds-side-panel__panel--${side}`,
      `ds-side-panel__panel--width-${width}`,
      'ds-side-panel__panel--persistent',
    ].join(' ');

    return (
      <div ref={wrapperRef} data-ds="SidePanel" className="ds-side-panel">
        {clonedTrigger}
        <aside id={panelId} aria-labelledby={titleId} role="complementary" className={persistentClasses} style={overrideStyle}>
          <div className="ds-side-panel__surface" data-part="surface">
            {header}
            {body}
            {footerNode}
          </div>
        </aside>
      </div>
    );
  }

  if (!present) {
    return (
      <div ref={wrapperRef} data-ds="SidePanel" className="ds-side-panel">
        {clonedTrigger}
      </div>
    );
  }

  const panelClasses = [
    'ds-side-panel__panel',
    `ds-side-panel__panel--${side}`,
    `ds-side-panel__panel--width-${width}`,
    visible ? 'ds-side-panel__panel--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const scrimClasses = ['ds-side-panel__scrim', visible ? 'ds-side-panel__scrim--visible' : null].filter(Boolean).join(' ');

  const panelBody = (
    <FocusScope trapped={modal} autoFocus={modal ? 'first' : 'none'} restoreFocus>
      <div className="ds-side-panel__surface" ref={surfaceRef} data-part="surface">
        {header}
        {body}
        {footerNode}
      </div>
    </FocusScope>
  );

  const showScrimDiv = !modal && scrim;

  const portalNode = (
    <>
      {showScrimDiv ? <div className={scrimClasses} data-part="scrim" aria-hidden="true" onClick={handleScrimClick} /> : null}
      {modal ? (
        <dialog
          ref={panelRef as Ref<HTMLDialogElement>}
          id={panelId}
          className={panelClasses}
          style={overrideStyle}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onCancel={handleDialogCancel}
          onClick={handleDialogClick}
        >
          {panelBody}
        </dialog>
      ) : (
        <aside
          ref={panelRef as Ref<HTMLElement>}
          id={panelId}
          className={panelClasses}
          style={overrideStyle}
          role="complementary"
          aria-labelledby={titleId}
          onKeyDown={handlePanelKeyDown}
        >
          {panelBody}
        </aside>
      )}
    </>
  );

  return (
    <div ref={wrapperRef} data-ds="SidePanel" className="ds-side-panel">
      {clonedTrigger}
      {createPortal(portalNode, container ?? document.body)}
    </div>
  );
});
