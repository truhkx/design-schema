import {
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
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
import { Landmark } from './Landmark';
import { Stack } from './Stack';
import './SidePanel.css';

export type SidePanelSide = 'start' | 'end';
export type SidePanelWidth = 'narrow' | 'default' | 'wide';
export type SidePanelPersistent = 'never' | 'content' | 'page';
export type SidePanelRole = 'complementary' | 'navigation';
export type SidePanelOpenChangeReason =
  | 'trigger'
  | 'escape'
  | 'close-button'
  | 'scrim'
  | 'outside'
  | 'swipe'
  | 'action'
  | 'navigation';

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
  | 'headingGap'
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
  headingGap: '--ds-side-panel-heading-gap',
  partGap: '--ds-side-panel-part-gap',
  footerGap: '--ds-side-panel-footer-gap',
  layer: '--ds-side-panel-layer',
  enter: '--ds-side-panel-enter',
  exit: '--ds-side-panel-exit',
};

function overridesToStyle(overrides: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as SidePanelOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    // Locked bindings are not in the type; anything passed anyway has no hook and is ignored.
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/** copy.* — used verbatim. `expanded` is SwiftUI-only; web announces aria-expanded natively. */
const COPY = { closeLabel: 'Close', expanded: 'Expanded' };

/** Reasons `dismissible: false` suppresses. Escape still reports; the trigger, actions and navigation always close. */
const DISMISS_REASONS: ReadonlySet<SidePanelOpenChangeReason> = new Set<SidePanelOpenChangeReason>([
  'close-button',
  'scrim',
  'outside',
  'swipe',
]);

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function isTabbable(element: HTMLElement): boolean {
  if (element.hasAttribute('data-focus-sentinel')) return false;
  if (element.getAttribute('tabindex') === '-1' || element.tabIndex < 0) return false;
  return !element.closest('[hidden], [inert]');
}

function tabbablesIn(root: ParentNode | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isTabbable);
}

/** The next tabbable element after `anchor` in document order, skipping the portaled panel. */
function nextTabbableAfter(anchor: HTMLElement, exclude: HTMLElement | null): HTMLElement | null {
  for (const element of tabbablesIn(document)) {
    if (element === anchor || anchor.contains(element) || exclude?.contains(element)) continue;
    if (anchor.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) return element;
  }
  return null;
}

declare const process: { env: { NODE_ENV?: string } };

/** True when the element has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition(element: HTMLElement): boolean {
  const durations = getComputedStyle(element).transitionDuration;
  if (!durations) return true;
  return durations.split(',').every((duration) => parseFloat(duration) === 0);
}

/** Scroll lock is reference-counted so an overlay opened over the panel cannot release it early. */
let scrollLockCount = 0;
function lockScroll(): () => void {
  scrollLockCount += 1;
  document.documentElement.classList.add('ds-side-panel-lock-scroll');
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.documentElement.classList.remove('ds-side-panel-lock-scroll');
  };
}

/**
 * The breakpoint width in px. A media query cannot read a custom property, and a `rem` breakpoint in a
 * media query resolves against the initial font size rather than the one on <html>, so the token's
 * resolved value is measured once and handed to matchMedia as px.
 */
function breakpointPx(property: string): string | null {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  if (!raw) return null;
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.inlineSize = raw;
  document.documentElement.appendChild(probe);
  const measured = probe.getBoundingClientRect().width;
  probe.remove();
  return measured > 0 ? `${measured}px` : raw;
}

/**
 * persistent — `layout.maxWidth.content` or `layout.maxWidth.page`, read from the loaded token
 * stylesheet on <html> when the component mounts. Above it the panel is a sidebar; exactly the token
 * width is still the overlay, so the comparison is `(width > token)`.
 */
function persistentQuery(persistent: SidePanelPersistent): MediaQueryList | null {
  if (persistent === 'never') return null;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  const property = persistent === 'content' ? '--layout-max-width-content' : '--layout-max-width-page';
  const breakpoint = breakpointPx(property);
  if (!breakpoint) return null;
  return window.matchMedia(`(width > ${breakpoint})`);
}

/**
 * False on the server and through hydration, true from then on (and from the first render of a
 * client-only mount). Nothing that exists only in the browser — the portal host, a media query —
 * may shape the markup before this is true, or the server and client trees differ.
 */
const subscribeNothing = (): (() => void) => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

function useIsPersistent(persistent: SidePanelPersistent): boolean {
  // Never read the viewport during render: the server has none, so the first client render must match it.
  const [matches, setMatches] = useState(false);
  useLayoutEffect(() => {
    const query = persistentQuery(persistent);
    if (!query) {
      setMatches(false);
      return undefined;
    }
    const update = (): void => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [persistent]);
  return matches;
}

export interface SidePanelProps extends Omit<ComponentPropsWithoutRef<'aside'>, 'children' | 'role' | 'hidden'> {
  /**
   * The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and a label
   * like "Menu"). It is the APG disclosure button: the panel sets aria-expanded on it, and
   * aria-controls whenever the element it names is in the DOM — a modal panel's <dialog> unmounts
   * when closed, so the attribute is dropped then. It stays a toggle — pressing it again closes. Omit
   * to control `open` from elsewhere (a Toolbar). Exactly one element, because it is cloned to carry
   * that wiring; a fragment or a bare string never opens the panel, so both warn in development. The
   * clone sits in an overlay-owned `<span data-part="trigger">` with display: contents, and that
   * wrapper — never the Button — is what persistent mode hides.
   */
  trigger?: ReactElement<{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }> | undefined;
  /**
   * Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel
   * always starts closed and there is no defaultOpen, so a panel that must start open is controlled.
   */
  open?: boolean | undefined;
  /** The panel's title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideHeading`. */
  heading: string;
  /**
   * Keep the title for assistive technology but hide it visually (a navigation panel whose Links are
   * self-explanatory): it stays rendered with the visually-hidden clip pattern so aria-labelledby
   * still resolves. When the header would then be empty (no close button because `dismissible` is
   * false or the panel is persistent), the header part is not rendered: no padding, no gap, no
   * height, and the hidden title moves to the top of the surface. The accessible name is required
   * regardless.
   */
  hideHeading?: boolean | undefined;
  /**
   * The body: a Stack or Tree of Links for navigation, a Stack of filter controls (Checkboxes, a
   * RadioGroup — not a Form, whose own actions would duplicate the footer), a Stack of Cards. Scrolls
   * inside the panel when taller than the viewport.
   */
  children: ReactNode;
  /** Pinned to the bottom of the panel above the safe area (a sign-out Button, a "Apply filters" action row). */
  footer?: ReactNode;
  /**
   * The edge the panel slides from: `start` is left in left-to-right languages and right in
   * right-to-left; `end` the opposite. Navigation comes from the start; contextual panels (a cart, a
   * detail) from the end.
   */
  side?: SidePanelSide | undefined;
  /**
   * Panel width on wide screens: narrow for a list of links, wide for a form or a detail. On phones
   * the panel is the viewport width minus a gutter that keeps the scrim visible.
   */
  width?: SidePanelWidth | undefined;
  /**
   * Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the
   * content: always visible, no scrim, no trap, part of the page's tab order, and the trigger is
   * hidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page; the
   * comparison is `(width > token)`, read from the theme token on <html> when the component mounts.
   * Below it, the overlay behavior applies.
   */
  persistent?: SidePanelPersistent | undefined;
  /**
   * The landmark the panel exposes (in persistent mode and as the region's role when open):
   * `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. This is the
   * composed Landmark's own role, so `navigation` renders a real <nav>; a modal panel is a dialog,
   * not a landmark, and takes none of this.
   */
  role?: SidePanelRole | undefined;
  /**
   * False (the default, the disclosure pattern): the panel is a disclosed region — the page stays
   * live and in the tab order after the panel, focus stays on the trigger when it opens, and Escape
   * from inside or a click outside closes it. True: the panel is a modal Dialog at the edge — scrim,
   * focus moved in and trapped, page inert and scroll-locked — for a panel that must be finished or
   * dismissed (a cart checkout, a required filter).
   */
  modal?: boolean | undefined;
  /**
   * Show the scrim in non-modal mode too (modal always has one). It defaults to true, so turn it off
   * for a panel that should feel like part of the page.
   */
  scrim?: boolean | undefined;
  /**
   * Escape, the close button, a scrim tap / outside click, and the swipe gesture all request close.
   * When false, the close button is not rendered and a scrim tap and an outside press do nothing;
   * Escape still reports through onOpenChange with reason escape (the consumer decides), as in
   * Dialog. Only those are gated: the trigger toggle, a followed Link (`navigation`) and a consumer's
   * `action` always close.
   */
  dismissible?: boolean | undefined;
  /**
   * On touch, a swipe toward the edge dismisses (native only). Purely additive, and accepted here for
   * parity: the web wires no gesture, since dragging a panel with a mouse is not a web idiom. The
   * trigger and close button are always there (WCAG 2.5.1).
   */
  swipeable?: boolean | undefined;
  /**
   * Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `close-button`, `scrim`, `outside`, `swipe`, `action`, `navigation` (a Link inside was followed).
   * `swipe` never comes from the web; `action` is a consumer's own footer handler reusing this.
   */
  onOpenChange?: ((open: boolean, reason: SidePanelOpenChangeReason) => void) | undefined;
  /** Portal target for the overlay. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.
   * `inset` is also forwarded to the body Box's `paddingInline` and `footerGap` to the footer Stack's
   * `gap`, so the composed children follow.
   */
  overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * SidePanel — Design Schema, category: overlay.
 *
 * When to use:
 * Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a Stack or Tree of
 * Links from the `start` edge), for filters beside a results page, for a cart or a detail panel from
 * the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should become
 * the permanent sidebar on desktop; leave it `never` for panels that are always a temporary overlay
 * (a cart).
 *
 * The panel renders into one stable host node that moves between the portal target (overlay) and
 * the component's place in the page (persistent sidebar), so crossing the breakpoint keeps a
 * non-modal panel's children state. The ref resolves to the root element — the fixed panel, the
 * full-viewport <dialog> when modal, the in-page sidebar when persistent — and is null while closed.
 */
export function SidePanel({
  ref,
  trigger,
  open: openProp,
  heading,
  hideHeading = false,
  children,
  footer,
  side = 'start',
  width = 'default',
  persistent = 'never',
  role = 'complementary',
  modal = false,
  scrim = true,
  dismissible = true,
  // Accepted for parity; the web wires no gesture.
  swipeable: _swipeable = true,
  onOpenChange,
  container,
  overrides,
  // Never forwarded to the root: `overrides` is the only per-instance styling.
  className: _className,
  style: _style,
  ...rest
}: SidePanelProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const hydrated = useHydrated();
  const isPersistent = useIsPersistent(persistent);
  const modalActive = modal && !isPersistent;

  const generatedId = useId();
  const panelId = `ds-side-panel${generatedId}-panel`;
  const headingId = `ds-side-panel${generatedId}-heading`;

  const rootRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const triggerWrapRef = useRef<HTMLSpanElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const escapeHandledRef = useRef(false);
  // The reason of the last close: `navigation` leaves focus where the navigation put it.
  const closeReasonRef = useRef<SidePanelOpenChangeReason | null>(null);

  // The one node the panel is portaled into; it moves, the React subtree does not.
  const [host] = useState<HTMLDivElement | null>(() =>
    typeof document === 'undefined' ? null : document.createElement('div'),
  );

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;

  // Overlay only: shown while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; set a frame after showing so the enter transition runs.
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  if (open && !present) setPresent(true);

  const rootShown = isPersistent || present;
  useImperativeHandle(ref, () => (rootShown ? rootRef.current : null) as HTMLElement, [rootShown, modalActive]);

  // The trigger is cloned to carry its wiring, so it must be exactly one element.
  const triggerCloneable = isValidElement(trigger) && trigger.type !== Fragment;

  const warnedRef = useRef(false);
  const warnedTriggerRef = useRef(false);
  if (process.env.NODE_ENV !== 'production') {
    if (!heading && !warnedRef.current) {
      warnedRef.current = true;
      console.warn('SidePanel: `heading` is required and becomes the accessible name; it must not be empty.');
    }
    if (trigger != null && !triggerCloneable && !warnedTriggerRef.current) {
      warnedTriggerRef.current = true;
      console.warn(
        'SidePanel: `trigger` must be exactly one element (a Button); a fragment or a bare string cannot carry aria-expanded, aria-controls and the toggle, so it never opens the panel.',
      );
    }
  }

  const changeOpen = (next: boolean, reason: SidePanelOpenChangeReason): void => {
    closeReasonRef.current = next ? null : reason;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next, reason);
  };

  const requestClose = (reason: SidePanelOpenChangeReason): void => {
    if (!open || isPersistent) return;
    if (DISMISS_REASONS.has(reason) && !dismissible) return;
    if (reason === 'escape' && !dismissible) {
      // Reported, not applied: the consumer decides; an uncontrolled panel stays open.
      closeReasonRef.current = 'escape';
      onOpenChange?.(false, 'escape');
      return;
    }
    changeOpen(false, reason);
  };

  const latestRequestClose = useRef(requestClose);
  latestRequestClose.current = requestClose;

  // The trigger is the cloned element's DOM node, read from its wrapper after every commit.
  useLayoutEffect(() => {
    triggerRef.current = (triggerWrapRef.current?.firstElementChild as HTMLElement | null) ?? null;
  });

  // Place the host: in the portal target as an overlay, in the page where SidePanel sits when persistent.
  useLayoutEffect(() => {
    if (!host) return undefined;
    if (host.className !== 'ds-side-panel-host') host.className = 'ds-side-panel-host';
    const target = isPersistent ? slotRef.current : (container ?? document.body);
    if (!target) return undefined;
    target.appendChild(host);
    return () => host.remove();
  }, [host, isPersistent, container]);

  // Modal open: showModal(), then focus the body's first focusable, the footer's, the close button, or the title.
  useLayoutEffect(() => {
    if (!present || !modalActive || !hydrated) return;
    const dialog = rootRef.current;
    if (!(dialog instanceof HTMLDialogElement)) return;
    if (!dialog.open) {
      // jsdom implements the `open` IDL attribute but not showModal(); the assignment is the fallback there.
      if (typeof dialog.showModal === 'function' && dialog.isConnected) dialog.showModal();
      else dialog.open = true;
    }
    const target = tabbablesIn(bodyRef.current)[0] ?? tabbablesIn(footerRef.current)[0] ?? closeButtonRef.current;
    if (target) {
      target.focus();
      return;
    }
    headingRef.current?.focus();
  }, [present, modalActive, hydrated]);

  // Reveal on the next frame so the slide-in runs from the off-edge position. Keyed on `hydrated`
  // too: the surface is only in the DOM once the portal renders, and a flag set before that has
  // nothing to slide.
  useLayoutEffect(() => {
    if (!present || !open || isPersistent || !hydrated) return undefined;
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [present, open, isPersistent, modalActive, hydrated]);

  // However it was opened (the trigger, a controlled prop), a new open forgets the last close reason.
  useEffect(() => {
    if (open) closeReasonRef.current = null;
  }, [open]);

  // Non-modal close: focus inside the panel, or focus lost to <body> (a scrim click), returns to the
  // trigger, unless a followed Link owns focus (the modal's FocusScope restores on unmount, under the
  // same rule). Focus the user already put on another control on the page is left there.
  const wasOpenRef = useRef(open);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!wasOpen || open || isPersistent || modalActive || !host) return;
    if (closeReasonRef.current === 'navigation') return;
    const active = document.activeElement;
    const lost = active === null || active === document.body;
    if (lost || (active && host.contains(active))) triggerRef.current?.focus();
  }, [open, isPersistent, modalActive, host]);

  // Close: run the exit transition on the surface, then hide (non-modal) or close() and unmount (modal).
  useEffect(() => {
    if (open || !present || isPersistent) return undefined;
    const wasVisible = visibleRef.current;
    setVisible(false);
    const surface = surfaceRef.current;
    const finish = (): void => {
      const root = rootRef.current;
      if (root instanceof HTMLDialogElement && root.open) {
        if (typeof root.close === 'function') root.close();
        else root.open = false;
      }
      setPresent(false);
    };
    if (!wasVisible || !surface || hasNoTransition(surface)) {
      finish();
      return undefined;
    }
    const handleExited = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') finish();
    };
    surface.addEventListener('transitionend', handleExited);
    return () => surface.removeEventListener('transitionend', handleExited);
  }, [open, present, isPersistent]);

  // Scroll lock on <html> while a modal panel is present; the non-modal page stays live.
  useEffect(() => {
    if (!present || !modalActive) return undefined;
    return lockScroll();
  }, [present, modalActive]);

  // Non-modal with no scrim: a pointerdown outside the panel and trigger closes with `outside`; a focusout does not.
  useEffect(() => {
    if (!open || modalActive || isPersistent || scrim || !dismissible || !host) return undefined;
    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (host.contains(target) || triggerWrapRef.current?.contains(target)) return;
      latestRequestClose.current('outside');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, modalActive, isPersistent, scrim, dismissible, host]);

  const handleTriggerClick = (event: ReactMouseEvent<HTMLElement>): void => {
    trigger?.props.onClick?.(event);
    if (event.defaultPrevented) return;
    changeOpen(!open, 'trigger');
  };

  // Tab from the trigger enters the open non-modal panel, which is portaled elsewhere in the document.
  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>): void => {
    if (event.key !== 'Tab' || event.shiftKey || event.defaultPrevented) return;
    if (!open || modalActive || isPersistent || event.target !== triggerRef.current) return;
    const first = tabbablesIn(surfaceRef.current)[0];
    if (!first) return;
    event.preventDefault();
    first.focus();
  };

  const handleRootKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    rest.onKeyDown?.(event);
    if (event.defaultPrevented || isPersistent || !open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (modalActive) {
        escapeHandledRef.current = true;
        // The browser's `cancel` for this same key follows the keydown's listeners; skip it once.
        setTimeout(() => {
          escapeHandledRef.current = false;
        }, 0);
      }
      requestClose('escape');
      return;
    }
    // The modal's FocusScope wraps Tab; the non-modal seam hands focus back to the page around the trigger.
    if (event.key !== 'Tab' || modalActive) return;
    const triggerElement = triggerRef.current;
    const tabbables = tabbablesIn(surfaceRef.current);
    if (!triggerElement || tabbables.length === 0) return;
    const active = document.activeElement;
    if (event.shiftKey && active === tabbables[0]) {
      event.preventDefault();
      triggerElement.focus();
    } else if (!event.shiftKey && active === tabbables[tabbables.length - 1]) {
      const next = nextTabbableAfter(triggerElement, host);
      if (!next) return;
      event.preventDefault();
      next.focus();
    }
  };

  // A non-cancelable `cancel` closes the <dialog> anyway: report `escape` and show it again if `open` stands.
  const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: never let the browser close the panel, dismissible or not.
    event.preventDefault();
    if (escapeHandledRef.current) return;
    requestClose('escape');
  };

  const handleDialogClose = (): void => {
    if (!open || !modalActive) return;
    requestAnimationFrame(() => {
      const dialog = rootRef.current;
      if (!(dialog instanceof HTMLDialogElement) || dialog.open || !dialog.isConnected) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
    });
  };

  // The closeButton part is the wrapper, so a press on it that missed the Button activates the Button.
  const handleCloseTargetClick = (event: ReactMouseEvent<HTMLSpanElement>): void => {
    const button = closeButtonRef.current;
    if (!button || button.contains(event.target as Node)) return;
    button.click();
  };

  // A Link followed inside the panel closes it: a click whose path holds an <a href> and that nothing
  // default-prevented. A modified click opens elsewhere and leaves this page (and the panel) as it was.
  const handleContentClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (event.isDefaultPrevented() || event.nativeEvent.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement) || !event.currentTarget.contains(anchor)) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    if (!open || isPersistent) return;
    changeOpen(false, 'navigation');
  };

  // aria-controls only while the element it names is in the DOM: the non-modal surface stays mounted
  // (hidden) once portaled, the modal <dialog> unmounts when closed.
  const controlsPresent = hydrated && (isPersistent || !modalActive || present);
  const clonedTrigger = triggerCloneable
    ? cloneElement(trigger, {
        'aria-expanded': open,
        'aria-controls': controlsPresent ? panelId : undefined,
        onClick: handleTriggerClick,
      } as Partial<{ onClick: (event: ReactMouseEvent<HTMLElement>) => void }>)
    : (trigger ?? null);

  const hasFooter = footer !== undefined && footer !== null && footer !== false;
  const closeShown = dismissible && !isPersistent;
  // hideHeading with no close button leaves the header empty: it is not rendered and the hidden title leads the column.
  const headerShown = !hideHeading || closeShown;

  const headingPart = (
    <div
      className={hideHeading ? 'ds-side-panel__heading ds-side-panel__visually-hidden' : 'ds-side-panel__heading'}
      data-part="heading"
    >
      <Heading level="2" size="lg" id={headingId} ref={headingRef} tabIndex={modalActive ? -1 : undefined}>
        {heading}
      </Heading>
    </div>
  );

  // The partGap column: the overlay-owned focusScope part, since FocusScope writes its own data-part="scope".
  const parts = (
    <div className="ds-side-panel__scope" data-part="focusScope" onClick={handleContentClick}>
      {headerShown ? (
        <div className="ds-side-panel__header" data-part="header">
          {headingPart}
          {closeShown ? (
            // Button writes its own data-part="container", so the closeButton part is this wrapper; a
            // press that lands on it rather than on the Button is forwarded.
            <span className="ds-side-panel__close" data-part="closeButton" onClick={handleCloseTargetClick}>
              {/* Default size: Button's own minimum target is size.target.comfortable. */}
              <Button
                ref={closeButtonRef}
                variant="ghost"
                iconOnly
                label={COPY.closeLabel}
                leadingIcon={<Icon name="close" inline />}
                onClick={() => requestClose('close-button')}
              />
            </span>
          ) : null}
        </div>
      ) : (
        headingPart
      )}
      <div className="ds-side-panel__scroll" ref={bodyRef}>
        <Box
          data-part="body"
          inset="lg"
          insetBlock="none"
          overrides={overrides?.inset ? { paddingInline: overrides.inset } : undefined}
        >
          {children}
        </Box>
      </div>
      {hasFooter ? (
        <div className="ds-side-panel__footer" data-part="footer" ref={footerRef}>
          <Stack
            direction="horizontal"
            gap="tight"
            justify="end"
            overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
          >
            {footer}
          </Stack>
        </div>
      ) : null}
    </div>
  );

  const shown = visible && open && !isPersistent;
  const hookStyle = overrides ? overridesToStyle(overrides) : undefined;
  const rootClasses = [
    'ds-side-panel',
    modalActive ? 'ds-side-panel--modal' : null,
    isPersistent ? 'ds-side-panel--persistent' : null,
    shown ? 'ds-side-panel--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');
  // side/width/visible live on the surface, which is the root itself unless the panel is modal.
  const surfaceClasses = [
    'ds-side-panel__surface',
    `ds-side-panel__surface--${side}`,
    `ds-side-panel__surface--${width}`,
    isPersistent ? 'ds-side-panel__surface--persistent' : null,
    shown ? 'ds-side-panel__surface--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const scrimClasses = shown ? 'ds-side-panel__scrim ds-side-panel__scrim--visible' : 'ds-side-panel__scrim';

  let panel: ReactElement | null = null;
  if (modalActive) {
    // The <dialog> fills the viewport with a transparent ::backdrop; the scrim and the edge-positioned
    // surface are real elements inside it, so both take the hooks and the scrim is a click target.
    panel = present ? (
      <dialog
        {...rest}
        ref={(node) => {
          rootRef.current = node;
        }}
        id={panelId}
        data-ds="SidePanel"
        className={rootClasses}
        style={hookStyle}
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={handleRootKeyDown}
        onCancel={handleDialogCancel}
        onClose={handleDialogClose}
      >
        <div className={scrimClasses} data-part="scrim" onClick={() => requestClose('scrim')} />
        <div
          className={surfaceClasses}
          data-part="surface"
          ref={(node) => {
            surfaceRef.current = node;
          }}
        >
          <FocusScope
            trapped
            autoFocus="none"
            restoreFocus={closeReasonRef.current !== 'navigation'}
            returnFocusTo={triggerRef}
          >
            {parts}
          </FocusScope>
        </div>
      </dialog>
    ) : null;
  } else {
    panel = (
      <>
        {!isPersistent && scrim ? (
          <div
            className={scrimClasses}
            style={hookStyle}
            data-part="scrim"
            aria-hidden="true"
            hidden={!present}
            onClick={() => requestClose('scrim')}
          />
        ) : null}
        <div
          {...rest}
          ref={(node) => {
            rootRef.current = node;
            surfaceRef.current = node;
          }}
          id={panelId}
          data-ds="SidePanel"
          data-part="surface"
          className={`${rootClasses} ${surfaceClasses}`}
          style={hookStyle}
          hidden={!rootShown}
          onKeyDown={handleRootKeyDown}
        >
          {/* surface > Landmark > FocusScope > column, so the column sits directly inside FocusScope as
              in the modal. The untrapped scope also stays in the persistent sidebar, so crossing the
              breakpoint never changes the tree above the children and their state survives. */}
          <Landmark role={role} as={role === 'navigation' ? 'nav' : 'aside'} aria-labelledby={headingId}>
            <FocusScope trapped={false} autoFocus="none" restoreFocus={false}>
              {parts}
            </FocusScope>
          </Landmark>
        </div>
      </>
    );
  }

  return (
    <>
      {clonedTrigger ? (
        <span
          ref={triggerWrapRef}
          className={isPersistent ? 'ds-side-panel__trigger ds-side-panel__trigger--hidden' : 'ds-side-panel__trigger'}
          data-part="trigger"
          hidden={isPersistent}
          onKeyDown={handleTriggerKeyDown}
        >
          {clonedTrigger}
        </span>
      ) : null}
      <div ref={slotRef} className="ds-side-panel-slot" />
      {/* The server renders no portal, so hydration must not either; it appears on the next render. */}
      {hydrated && host && panel ? createPortal(panel, host) : null}
    </>
  );
}
