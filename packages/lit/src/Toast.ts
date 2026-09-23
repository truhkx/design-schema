import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import './Button.js';
import type { IconOverridableBinding } from './Icon.js';
import type { TextOverridableBinding } from './Text.js';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type ToastDuration = 'short' | 'long' | 'persistent';
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'escape' | 'action' | 'replaced' | 'programmatic';

/** Detail carried by the `action` CustomEvent (none). */
export type ToastActionDetail = void;

/** Detail carried by the `dismiss` CustomEvent. */
export interface ToastDismissDetail {
  reason: ToastDismissReason;
}

/** copy.dismissLabel */
const COPY_DISMISS_LABEL = 'Dismiss';
/** copy.regionLabel */
const COPY_REGION_LABEL = 'Notifications';

/** Negates a boolean attribute: `no-dismiss` present means `dismissible` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** A constant resolved from a token at runtime: `token` × `multiply`, in ms. */
interface TokenConstant {
  token: TokenRef;
  multiply: number;
}

/** Constants `shortDuration` / `longDuration`: motion.duration.loop × 6 / × 12, in ms. */
const DURATION_CONSTANTS: Record<Exclude<ToastDuration, 'persistent'>, TokenConstant> = {
  short: { token: 'motion.duration.loop', multiply: 6 },
  long: { token: 'motion.duration.loop', multiply: 12 },
};

/**
 * Safety margin, in ms, added on top of the resolved `--ds-toast-exit` duration
 * before forcing removal if `transitionend` never fires. Not a design token —
 * a defensive timing, not a motion one.
 */
const EXIT_FALLBACK_BUFFER_MS = 50;

/** At most this many toasts stack; showing another evicts the oldest. A fixed count, not a token. */
const MAX_TOASTS = 3;

/** Overridable style hooks; see the `overrides` property. `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse` and `minTarget` are locked and excluded; `stackGap`, `regionInset` and `layer` belong to `<ds-toast-region>`. */
export type ToastOverridableBinding =
  | 'radius'
  | 'shadow'
  | 'paddingBlock'
  | 'paddingInline'
  | 'gap'
  | 'maxWidth'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'enter'
  | 'enterOffset'
  | 'exit';

/** Bindings the toast draws itself; `fontFamily`, `fontSize` and `lineHeight` are forwarded to Text's `overrides`. */
const HOOKS: Record<Exclude<ToastOverridableBinding, 'fontFamily' | 'fontSize' | 'lineHeight'>, string> = {
  radius: '--ds-toast-radius',
  shadow: '--ds-toast-shadow',
  paddingBlock: '--ds-toast-padding-block',
  paddingInline: '--ds-toast-padding-inline',
  gap: '--ds-toast-gap',
  maxWidth: '--ds-toast-max-width',
  enter: '--ds-toast-enter',
  enterOffset: '--ds-toast-enter-offset',
  exit: '--ds-toast-exit',
};

/** Overridable style hooks for `<ds-toast-region>`; see its `overrides` property. */
export type ToastRegionOverridableBinding = 'stackGap' | 'regionInset' | 'layer';

const REGION_HOOKS: Record<ToastRegionOverridableBinding, string> = {
  stackGap: '--ds-toast-stack-gap',
  regionInset: '--ds-toast-region-inset',
  layer: '--ds-toast-layer',
};

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Parses a CSS time (`800ms`, `0.8s`); `null` when it is not one. */
function parseTime(raw: string): number | null {
  const value = raw.trim();
  const n = parseFloat(value);
  if (Number.isNaN(n)) {
    return null;
  }
  if (value.endsWith('ms')) {
    return n;
  }
  if (value.endsWith('s')) {
    return n * 1000;
  }
  return null;
}

/** Reads a custom property holding a time off `el`, in ms; `null` when unresolved. */
function readTimeMs(el: HTMLElement, name: string): number | null {
  return parseTime(getComputedStyle(el).getPropertyValue(name));
}

/** `'motion.duration.loop'` → `'--motion-duration-loop'`. */
function tokenProperty(ref: TokenRef): string {
  return cssVar(ref).replace(/^var\((--[^),]+)\)$/, '$1');
}

/** Resolves a token constant on `el`, in ms; `null` when the token has no time value there. */
function resolveConstant(el: HTMLElement, constant: TokenConstant): number | null {
  const base = readTimeMs(el, tokenProperty(constant.token));
  return base === null ? null : base * constant.multiply;
}

/* --- FocusScope's focusable walker, kept in step with it ------------------------------------- */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  if (el.hasAttribute('data-focus-sentinel') || el.hasAttribute('data-focus-scope-anchor')) {
    return false;
  }
  if (!el.matches(FOCUSABLE_SELECTOR) || el.matches(':disabled')) {
    return false;
  }
  return el.getAttribute('tabindex') !== '-1' && el.tabIndex >= 0;
}

/** `inert` and `aria-hidden="true"` subtrees contribute nothing at all. */
function isExcludedSubtree(el: Element): boolean {
  return el.hasAttribute('inert') || el.getAttribute('aria-hidden') === 'true';
}

/**
 * Walks light DOM, slot assignments and open shadow roots in tree order, exactly as FocusScope
 * does, so a `<ds-button>` contributes the `<button>` inside its shadow root. F6 and the focus
 * restore both need that: every control a toast owns lives in a shadow tree.
 */
function collectFocusable(node: Element, results: HTMLElement[] = []): HTMLElement[] {
  if (isExcludedSubtree(node)) {
    return results;
  }
  if (isFocusable(node)) {
    results.push(node);
  }
  if (node instanceof HTMLSlotElement) {
    for (const assigned of node.assignedElements({ flatten: true })) {
      collectFocusable(assigned, results);
    }
    return results;
  }
  const scope = node.shadowRoot ?? node;
  for (const child of Array.from(scope.children)) {
    collectFocusable(child, results);
  }
  return results;
}

/** The deepest focused element, through open shadow roots. */
function deepActiveElement(): HTMLElement | null {
  let active: Element | null = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active instanceof HTMLElement && active !== document.body ? active : null;
}

/** `Node.contains`, but crossing shadow boundaries, so a button inside a toast counts as inside the region. */
function containsDeep(root: Node, node: Node | null): boolean {
  let current: Node | null = node;
  while (current) {
    if (current === root) {
      return true;
    }
    current = current.parentNode ?? (current instanceof ShadowRoot ? current.host : null);
  }
  return false;
}

/** The element itself, or the outermost shadow host holding it, so it can be ordered against document nodes. */
function documentHost(el: Element): Element {
  let node: Element = el;
  let root = node.getRootNode();
  while (root instanceof ShadowRoot) {
    node = root.host;
    root = node.getRootNode();
  }
  return node;
}

/** Where focus was before it entered the toast region (by F6 or by Tab); Escape and the buttons send it back. */
let returnFocusTarget: HTMLElement | null = null;

/**
 * Sends focus back to where it came from; if that element is gone, to the next focusable element
 * after `root` (the previous one if there is none), found with FocusScope's walker so it descends
 * open shadow roots.
 */
function returnFocus(root: HTMLElement): void {
  const target = returnFocusTarget;
  returnFocusTarget = null;
  if (target?.isConnected) {
    target.focus();
    return;
  }
  const candidates = collectFocusable(root.ownerDocument.body).filter((el) => !containsDeep(root, el));
  const position = (el: HTMLElement): number => root.compareDocumentPosition(documentHost(el));
  const next = candidates.find((el) => (position(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0);
  const previous = candidates.filter((el) => (position(el) & Node.DOCUMENT_POSITION_PRECEDING) !== 0).pop();
  (next ?? previous)?.focus();
}

/**
 * `<ds-toast>` — Toast (category: feedback, APG pattern: alert).
 *
 * One notification, normally created by the `toast()` function below inside a
 * lazily created `<ds-toast-region>` in `document.body`. Inside the shadow root
 * the `toast` part carries `role="status"` (`"alert"` for `tone: "danger"`) and
 * `aria-label` set to `message`, and holds the tone icon (`neutral` has none),
 * the message as `<ds-text>`, a ghost + inverse `<ds-button>` for the action,
 * and a ghost + inverse icon-only `<ds-button>` for dismiss, each inside a
 * wrapper the toast owns. A timer dismisses the toast after `duration`, pausing
 * while hovered, touched, focused, or the page is hidden; a toast with an
 * action or `tone: "danger"` is persistent regardless of `duration`. Escape
 * (while the toast holds focus), the dismiss button and the action all dismiss
 * with a short exit transition (instant under reduced motion); a replaced or
 * evicted toast leaves at once.
 *
 * ## When to use
 *
 * Use a Toast to confirm a completed action that the user did not have to
 * watch, to offer Undo for a reversible action, or to report a background
 * result. Match `tone` to the outcome.
 *
 * ## When not to use
 *
 * Not for errors that need fixing (an Alert next to the problem), not for
 * anything the user must read (Alert or Dialog), and not for more than one
 * action.
 *
 * @fires action - The action button was activated. Followed by `dismiss` with `reason: 'action'`.
 * @fires dismiss - The toast left the screen, with `{ reason }` (`timeout`, `dismiss-button`, `escape`, `action`, `replaced` or `programmatic`).
 */
@customElement('ds-toast')
export class DsToast extends LitElement {
  /** Focus delegates to the first control, so `toast.focus()` reaches the action or dismiss button. */
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-toast-radius: var(--radius-md);
      --ds-toast-shadow: var(--shadow-overlay);
      --ds-toast-padding-block: var(--space-sm);
      --ds-toast-padding-inline: var(--space-md);
      --ds-toast-gap: var(--layout-gap-normal);
      --ds-toast-max-width: var(--layout-max-width-prose);
      --ds-toast-enter: var(--motion-duration-base);
      --ds-toast-enter-offset: var(--space-2);
      --ds-toast-exit: var(--motion-duration-fast);
      /* Locked bindings: out of the overrides API, but themeable from page CSS through these hooks. */
      --ds-toast-surface: var(--color-inverse-surface);
      --ds-toast-text: var(--color-inverse-foreground);
      --ds-toast-action-color: var(--color-inverse-link);
      --ds-toast-dismiss-color: var(--color-inverse-link);
      --ds-toast-focus-ring-inverse: var(--color-inverse-focus);
      --ds-toast-min-target: var(--size-target-min);
      max-inline-size: var(--ds-toast-max-width);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='toast'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-toast-gap);
      /* minTarget: size.target.min, locked — the row never falls below the minimum target height */
      min-block-size: var(--ds-toast-min-target);
      padding-block: var(--ds-toast-padding-block);
      padding-inline: var(--ds-toast-padding-inline);
      border-radius: var(--ds-toast-radius);
      box-shadow: var(--ds-toast-shadow);
      /* surface: color.inverse.surface, locked — inverted like Tooltip, so it floats above any page surface */
      background: var(--ds-toast-surface);
      /* text: color.inverse.foreground, locked. Text's color binding is locked and it has no inverse tone,
         so the toast re-scopes the token Text already reads on its own container and composes Text unchanged. */
      --color-foreground: var(--ds-toast-text);
      color: var(--ds-toast-text);
      /* focusRingInverse: color.inverse.focus, locked — replaces color.border.focus inside the toast */
      --color-border-focus: var(--ds-toast-focus-ring-inverse);
      opacity: 1;
      transform: none;
      transition:
        opacity var(--ds-toast-enter) var(--motion-easing-standard),
        transform var(--ds-toast-enter) var(--motion-easing-standard);
    }

    /* enter: rise by enterOffset and fade in over enter */
    @starting-style {
      [data-part='toast'] {
        opacity: 0;
        transform: translateY(var(--ds-toast-enter-offset));
      }
    }

    /* exit: the reverse of enter — sink by enterOffset while fading, over exit */
    [data-part='toast'].closing {
      opacity: 0;
      transform: translateY(var(--ds-toast-enter-offset));
      transition-duration: var(--ds-toast-exit);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='toast'],
      [data-part='toast'].closing {
        transform: none;
        transition: none;
      }

      @starting-style {
        [data-part='toast'] {
          opacity: 1;
          transform: none;
        }
      }
    }

    [data-part='icon'] {
      flex: none;
    }

    [data-part='message'] {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    [data-part='actionButton'],
    [data-part='dismissButton'] {
      display: inline-flex;
      flex: none;
    }

    /* actionColor / dismissColor: color.inverse.link, locked. The Buttons are ghost + inverse and are
       never restyled; each wrapper re-scopes the token Button's inverse text already reads, as the
       toast does for Text's foreground, so the hooks take effect without reaching into Button. */
    [data-part='actionButton'] {
      --color-inverse-link: var(--ds-toast-action-color);
    }

    [data-part='dismissButton'] {
      --color-inverse-link: var(--ds-toast-dismiss-color);
    }
  `;

  /** One sentence saying what happened ("Message sent", "3 files deleted"). Also the toast's accessible name. */
  @property({ type: String }) accessor message = '';

  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  @property({ type: String, reflect: true }) accessor tone: ToastTone = 'neutral';

  /** Label for a single action button ("Undo", "View"). When present the toast is persistent and pauses on hover and focus. */
  @property({ type: String, attribute: 'action-label' }) accessor actionLabel: string | undefined;

  private durationValue: ToastDuration = 'short';
  private durationAssigned = false;

  /**
   * `short` ≈ 5s, `long` ≈ 10s (motion.duration.loop × 6 / × 12, resolved at
   * region mount), `persistent` until dismissed. An action or `tone: "danger"`
   * makes the toast persistent regardless; a development warning notes that
   * only when `duration` was assigned.
   */
  get duration(): ToastDuration {
    return this.durationValue;
  }

  @property({ type: String, reflect: true })
  set duration(value: ToastDuration) {
    this.durationValue = value;
    this.durationAssigned = true;
  }

  /** Shows a dismiss button. Persistent toasts are always dismissible. Exposed as the negated `no-dismiss` attribute. */
  @property({ attribute: 'no-dismiss', converter: NEGATED_BOOLEAN_CONVERTER, reflect: true }) accessor dismissible = true;

  /** Stable identity; showing a toast with the same `toastId` replaces this one instead of stacking. Attribute `toast-id`. No effect outside the region. */
  @property({ type: String, attribute: 'toast-id' }) accessor toastId: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;

  @query('[data-part="toast"]') private accessor containerEl!: HTMLElement | null;

  @state() private accessor closing = false;

  private dismissed = false;
  private wasMoot = false;
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private remainingMs: number | null = null;
  private timerStartedAt = 0;
  private pointerOver = false;
  private focused = false;

  constructor() {
    super();
    // Reflect the default `duration` without marking it assigned (it bypasses the setter).
    this.requestUpdate('duration', undefined);
  }

  /** `true` once the toast has started leaving; it no longer counts toward the stack. */
  get dismissing(): boolean {
    return this.dismissed;
  }

  /** An action or a danger tone keeps the toast until it is dismissed. */
  private get effectiveDuration(): ToastDuration {
    return this.actionLabel || this.tone === 'danger' ? 'persistent' : this.duration;
  }

  private get showDismiss(): boolean {
    return this.dismissible || this.effectiveDuration === 'persistent';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Toast');
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('pointercancel', this.handlePointerLeave);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.hasUpdated) {
      this.restartTimer();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimer();
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    this.removeEventListener('pointercancel', this.handlePointerLeave);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('duration') || changed.has('actionLabel') || changed.has('tone')) {
      this.restartTimer();
      this.warnForcedPersistent(changed.has('duration'));
    }
    if (changed.has('message') && import.meta.env.DEV && !this.message) {
      console.warn('<ds-toast> requires a `message`.', this);
    }
  }

  protected override render(): TemplateResult {
    const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontFamily: this.overrides?.fontFamily ?? 'font.family.body',
      fontSize: this.overrides?.fontSize ?? 'font.size.md',
      lineHeight: this.overrides?.lineHeight ?? 'font.lineHeight.normal',
    };
    const iconOverrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
      color: `color.inverse.status.${this.tone}` as TokenRef,
    };

    return html`
      <div
        class=${this.closing ? 'closing' : ''}
        ?inert=${this.closing}
        part="toast"
        data-part="toast"
        role=${this.tone === 'danger' ? 'alert' : 'status'}
        aria-label=${this.message || nothing}
      >
        ${this.tone === 'neutral'
          ? nothing
          : html`<ds-icon part="icon" data-part="icon" name=${this.tone} .overrides=${iconOverrides}></ds-icon>`}
        <ds-text part="message" data-part="message" element="span" size="md" .overrides=${textOverrides}
          >${this.message}</ds-text
        >
        ${this.actionLabel
          ? html`<span part="actionButton" data-part="actionButton"
              ><ds-button
                variant="ghost"
                inverse
                size="sm"
                label=${this.actionLabel}
                @press=${this.handleActionPress}
              ></ds-button
            ></span>`
          : nothing}
        ${this.showDismiss
          ? html`<span part="dismissButton" data-part="dismissButton"
              ><ds-button
                variant="ghost"
                inverse
                size="sm"
                icon-only
                label=${COPY_DISMISS_LABEL}
                @press=${this.handleDismissPress}
                ><ds-icon slot="leading-icon" name="close"></ds-icon></ds-button
            ></span>`
          : nothing}
      </div>
    `;
  }

  /** The first focusable control: the action button, else the dismiss button. */
  public firstControl(): HTMLElement | null {
    const container = this.containerEl;
    return container ? (collectFocusable(container)[0] ?? null) : null;
  }

  private readonly handleActionPress = (event: Event): void => {
    // The composite reports its own `action`; the inner button's `press` stays inside.
    event.stopPropagation();
    if (this.dismissed) {
      return;
    }
    this.dispatchEvent(new CustomEvent<ToastActionDetail>('action', { bubbles: true, composed: true }));
    this.requestDismiss('action');
  };

  private readonly handleDismissPress = (event: Event): void => {
    event.stopPropagation();
    this.requestDismiss('dismiss-button');
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !this.dismissed) {
      event.preventDefault();
      event.stopPropagation();
      this.requestDismiss('escape');
    }
  };

  private readonly handlePointerEnter = (): void => {
    this.pointerOver = true;
    this.pauseTimer();
  };

  private readonly handlePointerLeave = (): void => {
    this.pointerOver = false;
    this.maybeResumeTimer();
  };

  private readonly handleFocusIn = (event: FocusEvent): void => {
    this.focused = true;
    this.pauseTimer();
    const region = this.closest('ds-toast-region');
    const from = event.relatedTarget;
    // Focus tabbed in from outside the region: that is where Escape and the buttons send it back.
    if (from instanceof HTMLElement && !containsDeep(region ?? this, from)) {
      returnFocusTarget = from;
    }
  };

  private readonly handleFocusOut = (event: FocusEvent): void => {
    if (event.relatedTarget instanceof Node && containsDeep(this, event.relatedTarget)) {
      return;
    }
    this.focused = false;
    this.maybeResumeTimer();
  };

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.pauseTimer();
    } else {
      this.maybeResumeTimer();
    }
  };

  /**
   * Starts the toast leaving. `dismiss` fires synchronously here, while the
   * toast is still connected so it bubbles to the region, and the element is
   * removed once the exit transition ends — at once for `replaced`, under
   * reduced motion, and when the exit time cannot be resolved. A toast holding
   * focus sends it back first; a `replaced` toast restores at unmount, and only
   * while focus is still inside it or has fallen to the body, so no dismissal
   * restores twice.
   */
  public requestDismiss(reason: ToastDismissReason): void {
    if (this.dismissed) {
      return;
    }
    this.dismissed = true;
    this.clearTimer();
    const root = this.closest('ds-toast-region') ?? this;

    if (reason !== 'replaced' && this.matches(':focus-within')) {
      returnFocus(root);
    }
    this.dispatchEvent(
      new CustomEvent<ToastDismissDetail>('dismiss', { detail: { reason }, bubbles: true, composed: true }),
    );

    const finish = (): void => {
      if (reason === 'replaced' && (this.matches(':focus-within') || (this.focused && deepActiveElement() === null))) {
        returnFocus(root);
      }
      this.remove();
    };

    const container = this.containerEl;
    const exitMs = readTimeMs(this, HOOKS.exit);
    if (reason === 'replaced' || prefersReducedMotion() || !container || !this.isConnected || !exitMs) {
      finish();
      return;
    }

    this.closing = true;
    let settled = false;
    const settle = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      container.removeEventListener('transitionend', handleTransitionEnd);
      finish();
    };
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === container && event.propertyName === 'opacity') {
        settle();
      }
    };
    container.addEventListener('transitionend', handleTransitionEnd);
    setTimeout(settle, exitMs + EXIT_FALLBACK_BUFFER_MS);
  }

  /** shortDuration / longDuration, from the region's measurement at mount, else measured on this element. */
  private computeDurationMs(): number | null {
    const duration = this.effectiveDuration;
    if (duration === 'persistent') {
      return null;
    }
    const constant = DURATION_CONSTANTS[duration];
    const region = this.closest('ds-toast-region');
    const ms =
      region instanceof DsToastRegion && region.loopMs !== undefined
        ? region.loopMs === null
          ? null
          : region.loopMs * constant.multiply
        : resolveConstant(this, constant);
    // Without a resolvable, positive motion.duration.loop there is no time to count: stay until dismissed.
    return ms !== null && ms > 0 ? ms : null;
  }

  private restartTimer(): void {
    this.clearTimer();
    if (this.dismissed || !this.isConnected) {
      return;
    }
    this.remainingMs = this.computeDurationMs();
    this.maybeResumeTimer();
  }

  private pauseTimer(): void {
    if (this.timerId === undefined || this.remainingMs === null) {
      return;
    }
    clearTimeout(this.timerId);
    this.timerId = undefined;
    this.remainingMs -= Date.now() - this.timerStartedAt;
  }

  private maybeResumeTimer(): void {
    if (this.dismissed || this.timerId !== undefined || this.remainingMs === null) {
      return;
    }
    if (this.pointerOver || this.focused || document.hidden) {
      return;
    }
    this.timerStartedAt = Date.now();
    this.timerId = setTimeout(() => this.requestDismiss('timeout'), Math.max(0, this.remainingMs));
  }

  private clearTimer(): void {
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as (keyof typeof HOOKS)[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  /**
   * Warns each time a change to `duration`, `actionLabel` or `tone` enters the case where an
   * assigned `short`/`long` is moot — including a `duration` change while the case already held.
   */
  private warnForcedPersistent(durationChanged: boolean): void {
    const assigned = this.duration;
    const moot =
      this.durationAssigned && (assigned === 'short' || assigned === 'long') && this.effectiveDuration === 'persistent';
    const entered = moot && (!this.wasMoot || durationChanged);
    this.wasMoot = moot;
    if (import.meta.env.DEV && entered) {
      console.warn(
        `<ds-toast>: \`duration="${assigned}"\` is ignored — a toast with an action or \`tone="danger"\` is persistent until dismissed.`,
        this,
      );
    }
  }
}

/**
 * `<ds-toast-region>` — the live region that holds `<ds-toast>` children (anatomy: region).
 *
 * Auto-created in `document.body` by `toast()`. Takes `role="region"`,
 * `aria-label` and `aria-live="polite"`, fixed at `regionInset` from the
 * viewport edge (plus the bottom safe area) — bottom-start on wide screens,
 * bottom-center on phones — stacking `<ds-toast>` children in the light DOM
 * with `stackGap` between them, newest at the bottom. Measures
 * motion.duration.loop at mount for its toasts' durations. A document-level
 * `F6` handler moves focus into the first toast's action or dismiss button,
 * and back to where it was on a second press.
 */
@customElement('ds-toast-region')
export class DsToastRegion extends LitElement {
  static override styles: CSSResult = css`
    :host {
      --ds-toast-stack-gap: var(--layout-gap-tight);
      --ds-toast-region-inset: var(--layout-gutter);
      --ds-toast-layer: var(--layer-toast);
      position: fixed;
      inset-inline: var(--ds-toast-region-inset);
      inset-block-end: calc(var(--ds-toast-region-inset) + env(safe-area-inset-bottom, 0px)); /* literal-ok: env() fallback for browsers without safe areas */
      z-index: var(--ds-toast-layer);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ds-toast-stack-gap);
      pointer-events: none;
    }

    :host([hidden]) {
      display: none;
    }

    ::slotted(ds-toast) {
      pointer-events: auto;
    }

    /* Bottom-start on wide screens. */
    @media (min-width: 960px) { /* literal-ok: breakpoint from layout.maxWidth.content */
      :host {
        align-items: flex-start;
        inset-inline-end: auto;
      }
    }
  `;

  /** Per-instance style overrides: `{ regionInset: 'layout.gutter' }`. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;

  /** motion.duration.loop as resolved on the region at mount, in ms; `undefined` before mount, `null` when unresolved. */
  public loopMs: number | null | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ToastRegion');
    this.setAttribute('data-part', 'region');
    // Plain attributes so the accessibility tree the tests read sees them.
    this.setAttribute('role', 'region');
    this.setAttribute('aria-label', COPY_REGION_LABEL);
    this.setAttribute('aria-live', 'polite');
    this.loopMs = readTimeMs(this, tokenProperty(DURATION_CONSTANTS.short.token));
    document.addEventListener('keydown', this.handleDocumentKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleDocumentKeydown);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    return html`<slot></slot>`;
  }

  /**
   * Sends focus back to where it was before it entered the region; if that
   * element is gone, to the next focusable element after the region (the
   * previous one if there is none).
   */
  public restoreFocus(): void {
    returnFocus(this);
  }

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    // With two regions on a page, the first handler to act wins the press.
    if (event.key !== 'F6' || event.defaultPrevented) {
      return;
    }
    const first = Array.from(this.querySelectorAll('ds-toast')).find((el) => !el.dismissing);
    if (!first) {
      return;
    }
    if (containsDeep(this, deepActiveElement())) {
      event.preventDefault();
      this.restoreFocus();
      return;
    }
    const target = first.firstControl();
    if (!target) {
      return;
    }
    event.preventDefault();
    const origin = deepActiveElement();
    target.focus();
    // Recorded after focusing, so the deepest origin wins over the retargeted relatedTarget.
    returnFocusTarget = origin;
  };

  private applyOverrides(): void {
    for (const binding of Object.keys(REGION_HOOKS) as ToastRegionOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = REGION_HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

/** Options for `toast()`. */
export interface ToastOptions {
  message: string;
  tone?: ToastTone | undefined;
  actionLabel?: string | undefined;
  duration?: ToastDuration | undefined;
  dismissible?: boolean | undefined;
  /** Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking. */
  toastId?: string | undefined;
  /** Called when the action button is activated, before the toast dismisses. */
  onAction?: (() => void) | undefined;
}

/** Resolution of the promise `toast()` returns, once the toast leaves the screen. */
export interface ToastResult {
  reason: ToastDismissReason;
}

let regionEl: DsToastRegion | null = null;

function findRegion(): DsToastRegion | null {
  if (regionEl === null || !regionEl.isConnected) {
    regionEl = document.querySelector('ds-toast-region');
  }
  return regionEl;
}

function liveToasts(region: DsToastRegion): DsToast[] {
  return Array.from(region.querySelectorAll('ds-toast')).filter((el) => !el.dismissing);
}

/**
 * Shows a toast, since a notification is an event, not a place in the tree.
 * Returns a promise that resolves once the toast leaves the screen. Showing a
 * toast with the same `toastId` as one already visible replaces it (`reason:
 * 'replaced'` for the old one) instead of stacking; a fourth visible toast
 * evicts the oldest the same way.
 */
export function toast(options: ToastOptions): Promise<ToastResult> {
  const existing = findRegion();
  const region = existing ?? document.createElement('ds-toast-region');
  if (!existing) {
    document.body.appendChild(region);
    regionEl = region;
  }

  if (options.toastId !== undefined) {
    liveToasts(region)
      .filter((el) => el.toastId === options.toastId)
      .forEach((el) => el.requestDismiss('replaced'));
  }
  const current = liveToasts(region);
  for (let i = 0; i <= current.length - MAX_TOASTS; i++) {
    current[i]!.requestDismiss('replaced');
  }

  const el = document.createElement('ds-toast');
  el.message = options.message;
  el.tone = options.tone ?? 'neutral';
  if (options.duration !== undefined) {
    el.duration = options.duration;
  }
  el.actionLabel = options.actionLabel;
  el.toastId = options.toastId;
  if (options.dismissible !== undefined) {
    el.dismissible = options.dismissible;
  }

  const result = new Promise<ToastResult>((resolve) => {
    const onAction = options.onAction;
    if (onAction) {
      el.addEventListener('action', () => onAction(), { once: true });
    }
    el.addEventListener(
      'dismiss',
      (event) => resolve({ reason: (event as CustomEvent<ToastDismissDetail>).detail.reason }),
      { once: true },
    );
  });

  // A region this call just created waits one frame before its first toast, so the empty live
  // region is in the document before the content it has to announce.
  if (!existing && typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => region.appendChild(el));
  } else {
    region.appendChild(el);
  }
  return result;
}

/** Dismisses the toast with `toastId`, or every toast when no id is given, with reason `programmatic`. */
export function dismiss(toastId?: string): void {
  const region = findRegion();
  if (!region) {
    return;
  }
  liveToasts(region)
    .filter((el) => toastId === undefined || el.toastId === toastId)
    .forEach((el) => el.requestDismiss('programmatic'));
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-toast': DsToast;
    'ds-toast-region': DsToastRegion;
  }
}
