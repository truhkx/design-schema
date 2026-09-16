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
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'escape' | 'action' | 'replaced';

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
 * Safety margin, in ms, added on top of the read `--ds-toast-exit` duration
 * before forcing removal if `transitionend` never fires. Not a design token —
 * a defensive timing, not a motion one.
 */
const EXIT_FALLBACK_BUFFER_MS = 50;

/** At most this many toasts stack; showing another evicts the oldest. */
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
  | 'exit';

const HOOKS: Record<ToastOverridableBinding, string> = {
  radius: '--ds-toast-radius',
  shadow: '--ds-toast-shadow',
  paddingBlock: '--ds-toast-padding-block',
  paddingInline: '--ds-toast-padding-inline',
  gap: '--ds-toast-gap',
  maxWidth: '--ds-toast-max-width',
  fontFamily: '--ds-toast-font-family', // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-toast-font-size',
  lineHeight: '--ds-toast-line-height',
  enter: '--ds-toast-enter',
  exit: '--ds-toast-exit',
};

/** Overridable style hooks for `<ds-toast-region>`; see its `overrides` property. */
export type ToastRegionOverridableBinding = 'stackGap' | 'regionInset' | 'layer';

const REGION_HOOKS: Record<ToastRegionOverridableBinding, string> = {
  stackGap: '--ds-toast-region-stack-gap',
  regionInset: '--ds-toast-region-inset',
  layer: '--ds-toast-region-layer',
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

/**
 * `<ds-toast>` — Toast (category: feedback, APG pattern: alert).
 *
 * One notification, normally created by the `toast()` function below inside
 * a lazily created `<ds-toast-region>` in `document.body`. The host carries
 * `role="status"` (`"alert"` for `tone: "danger"`) and `aria-label` set to
 * `message`. Inside the shadow root: the tone icon (`neutral` has none), the
 * message as `<ds-text>`, a ghost + inverse `<ds-button>` for the action, and
 * a ghost + inverse icon-only `<ds-button>` for dismiss. A timer dismisses the
 * toast after `duration`, pausing while hovered, focused, or the page is
 * hidden; a toast with an action or `tone: "danger"` is persistent regardless
 * of `duration`. Escape (while the toast holds focus), the dismiss button and
 * the action all dismiss with a short exit transition (instant under reduced
 * motion); a replaced or evicted toast leaves at once.
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
 * @fires dismiss - The toast left the screen, with `{ reason }` (`timeout`, `dismiss-button`, `escape`, `action`, or `replaced`).
 */
@customElement('ds-toast')
export class DsToast extends LitElement {
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
      --ds-toast-font-family: var(--font-family-body);
      --ds-toast-font-size: var(--font-size-md);
      --ds-toast-line-height: var(--font-line-height-normal);
      --ds-toast-enter: var(--motion-duration-base);
      --ds-toast-exit: var(--motion-duration-fast);
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
      padding-block: var(--ds-toast-padding-block);
      padding-inline: var(--ds-toast-padding-inline);
      border-radius: var(--ds-toast-radius);
      box-shadow: var(--ds-toast-shadow);
      /* surface: color.inverse.surface, locked — inverted like Tooltip, so it floats above any page surface */
      background: var(--color-inverse-surface);
      /* focusRingInverse: color.inverse.focus, locked — replaces color.border.focus inside the toast */
      --color-border-focus: var(--color-inverse-focus);
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-toast-enter) var(--motion-easing-standard),
        transform var(--ds-toast-enter) var(--motion-easing-standard);
    }

    @starting-style {
      [data-part='toast'] {
        opacity: 0;
        transform: translateY(var(--space-2));
      }
    }

    /* exit: motion.duration.fast, replacing the enter duration while leaving */
    [data-part='toast'].closing {
      opacity: 0;
      transform: translateY(var(--space-2));
      transition-duration: var(--ds-toast-exit);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='toast'] {
        transition: none;
      }
    }

    [data-part='icon'] {
      flex: none;
    }

    /* text: color.inverse.foreground, locked. Text's color binding is locked and it has no inverse tone,
       so the token it already reads is re-scoped here rather than styling the child. */
    [data-part='message'] {
      --color-foreground: var(--color-inverse-foreground);
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    [data-part='actionButton'],
    [data-part='dismissButton'] {
      flex: none;
    }
  `;

  /** One sentence, past tense, saying what happened ("Message sent", "3 files deleted"). Also the toast's accessible name. */
  @property({ type: String }) accessor message = '';

  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  @property({ type: String, reflect: true }) accessor tone: ToastTone = 'neutral';

  /** Label for a single action button ("Undo", "View"). When present the toast is persistent and pauses on hover and focus. */
  @property({ type: String, attribute: 'action-label' }) accessor actionLabel: string | undefined;

  /** `short` ≈ 5s, `long` ≈ 10s (motion.duration.loop × 6 / × 12), `persistent` until dismissed. An action or `tone: "danger"` makes the toast persistent regardless. */
  @property({ type: String, reflect: true }) accessor duration: ToastDuration = 'short';

  /** Shows a dismiss button. Persistent toasts are always dismissible. Exposed as the negated `no-dismiss` attribute. */
  @property({ attribute: 'no-dismiss', converter: NEGATED_BOOLEAN_CONVERTER, reflect: true }) accessor dismissible = true;

  /** Stable identity; showing a toast with the same `toastId` replaces this one instead of stacking. Attribute `toast-id`. */
  @property({ type: String, attribute: 'toast-id' }) accessor toastId: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;

  @query('[data-part="toast"]') private accessor containerEl!: HTMLElement | null;

  @state() private accessor closing = false;

  private dismissed = false;
  private timerId: ReturnType<typeof setTimeout> | undefined;
  private remainingMs: number | null = null;
  private timerStartedAt = 0;
  private pointerOver = false;
  private focused = false;
  private warnedForcedPersistent = false;

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
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('tone')) {
      // A plain attribute so the accessible-role computation sees it; `alert` is assertive, `status` polite.
      this.setAttribute('role', this.tone === 'danger' ? 'alert' : 'status');
    }
    if (changed.has('message')) {
      if (this.message) {
        this.setAttribute('aria-label', this.message);
      } else {
        this.removeAttribute('aria-label');
      }
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('duration') || changed.has('actionLabel') || changed.has('tone')) {
      this.restartTimer();
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      fontFamily: this.overrides?.fontFamily,
      fontSize: this.overrides?.fontSize,
      lineHeight: this.overrides?.lineHeight,
    };
    const iconOverrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>> = {
      color: `color.inverse.status.${this.tone}` as TokenRef,
    };

    return html`
      <div class=${this.closing ? 'closing' : ''} part="toast" data-part="toast">
        ${this.tone === 'neutral'
          ? nothing
          : html`<ds-icon part="icon" data-part="icon" name=${this.tone} .overrides=${iconOverrides}></ds-icon>`}
        <ds-text part="message" data-part="message" element="span" .overrides=${textOverrides}>${this.message}</ds-text>
        ${this.actionLabel
          ? html`
              <ds-button
                part="actionButton"
                data-part="actionButton"
                variant="ghost"
                inverse
                label=${this.actionLabel}
                @press=${this.handleActionPress}
              ></ds-button>
            `
          : nothing}
        ${this.showDismiss
          ? html`
              <ds-button
                part="dismissButton"
                data-part="dismissButton"
                variant="ghost"
                inverse
                icon-only
                label=${COPY_DISMISS_LABEL}
                @press=${this.handleDismissPress}
              >
                <ds-icon slot="leading-icon" name="close" inline></ds-icon>
              </ds-button>
            `
          : nothing}
      </div>
    `;
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

  private readonly handleFocusIn = (): void => {
    this.focused = true;
    this.pauseTimer();
  };

  private readonly handleFocusOut = (): void => {
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
   * Removes the toast and dispatches `dismiss` once it has left: after the exit
   * transition, or at once for `replaced` and under reduced motion.
   */
  public requestDismiss(reason: ToastDismissReason): void {
    if (this.dismissed) {
      return;
    }
    this.dismissed = true;
    this.clearTimer();

    const finish = (): void => {
      const region = this.closest('ds-toast-region');
      const hadFocus = this.matches(':focus-within');
      // Dispatched once the toast has left the screen, while still connected so it bubbles to the region.
      this.dispatchEvent(
        new CustomEvent<ToastDismissDetail>('dismiss', { detail: { reason }, bubbles: true, composed: true }),
      );
      this.remove();
      if (hadFocus && region instanceof DsToastRegion) {
        region.restoreFocus();
      }
    };

    const container = this.containerEl;
    if (reason === 'replaced' || prefersReducedMotion() || !container || !this.isConnected) {
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
    setTimeout(settle, (readTimeMs(this, HOOKS.exit) ?? 0) + EXIT_FALLBACK_BUFFER_MS);
  }

  /** shortDuration / longDuration, from the region's measurement at mount, else measured on this element. */
  private computeDurationMs(): number | null {
    const duration = this.effectiveDuration;
    if (duration === 'persistent') {
      return null;
    }
    const region = this.closest('ds-toast-region');
    const loopMs = region instanceof DsToastRegion ? region.loopMs : undefined;
    const constant = DURATION_CONSTANTS[duration];
    const ms = loopMs !== undefined && loopMs !== null ? loopMs * constant.multiply : resolveConstant(this, constant);
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
    for (const binding of Object.keys(HOOKS) as ToastOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.message) {
      console.warn('<ds-toast> requires a `message`.', this);
    }
    if (!this.warnedForcedPersistent && this.duration !== 'persistent' && this.effectiveDuration === 'persistent') {
      this.warnedForcedPersistent = true;
      console.warn(
        `<ds-toast>: \`duration="${this.duration}"\` is ignored — a toast with an action or \`tone="danger"\` is persistent until dismissed.`,
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
 * viewport edge — bottom-start on wide screens, bottom-center on phones —
 * stacking `<ds-toast>` children in the light DOM with `stackGap` between
 * them, newest at the bottom. Measures motion.duration.loop at mount for its
 * toasts' durations. A document-level `F6` handler moves focus into the first
 * toast's action or dismiss button, and back out again on a second press.
 */
@customElement('ds-toast-region')
export class DsToastRegion extends LitElement {
  static override styles: CSSResult = css`
    :host {
      --ds-toast-region-stack-gap: var(--layout-gap-tight);
      --ds-toast-region-inset: var(--layout-gutter);
      --ds-toast-region-layer: var(--layer-toast);
      position: fixed;
      inset-inline: var(--ds-toast-region-inset);
      inset-block-end: var(--ds-toast-region-inset);
      z-index: var(--ds-toast-region-layer);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ds-toast-region-stack-gap);
      pointer-events: none;
    }

    :host([hidden]) {
      display: none;
    }

    ::slotted(ds-toast) {
      pointer-events: auto;
    }

    /* Bottom-start (not centered) once there is room beside the toast's own max width. */
    @media (min-width: 572px) { /* literal-ok: breakpoint from layout.maxWidth.prose */
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

  private readonly internals: ElementInternals;

  /** What had focus before `F6` moved it into the region, restored on the next `F6` or on dismissal. */
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'ToastRegion');
    this.setAttribute('data-part', 'region');
    this.internals.role = 'region';
    this.internals.ariaLabel = COPY_REGION_LABEL;
    this.internals.ariaLive = 'polite';
    // Mirrored as attributes so the accessibility tree the tests read sees them too.
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

  /** Sends focus back to whatever had it before `F6` moved focus in here. */
  public restoreFocus(): void {
    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'F6') {
      return;
    }
    const toasts = Array.from(this.querySelectorAll('ds-toast'));
    const first = toasts[0];
    if (!first) {
      return;
    }
    if (this.matches(':focus-within')) {
      event.preventDefault();
      this.restoreFocus();
      return;
    }
    const target = first.shadowRoot?.querySelector<HTMLElement>('[data-part="actionButton"], [data-part="dismissButton"]');
    if (!target) {
      return;
    }
    event.preventDefault();
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    this.previouslyFocused = active instanceof HTMLElement && active !== document.body ? active : null;
    target.focus();
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

function ensureRegion(): DsToastRegion {
  if (regionEl === null || !regionEl.isConnected) {
    regionEl = document.querySelector('ds-toast-region') ?? document.createElement('ds-toast-region');
    if (!regionEl.isConnected) {
      document.body.appendChild(regionEl);
    }
  }
  return regionEl;
}

/**
 * Shows a toast, since a notification is an event, not a place in the tree.
 * Returns a promise that resolves once the toast leaves the screen. Showing a
 * toast with the same `toastId` as one already visible replaces it (`reason:
 * 'replaced'` for the old one) instead of stacking; more than three visible
 * evicts the oldest the same way.
 */
export function toast(options: ToastOptions): Promise<ToastResult> {
  const region = ensureRegion();

  if (options.toastId !== undefined) {
    const existing = Array.from(region.querySelectorAll('ds-toast')).find((el) => el.toastId === options.toastId);
    existing?.requestDismiss('replaced');
  }
  const current = Array.from(region.querySelectorAll('ds-toast'));
  if (current.length >= MAX_TOASTS) {
    current[0]?.requestDismiss('replaced');
  }

  const el = document.createElement('ds-toast');
  el.message = options.message;
  el.tone = options.tone ?? 'neutral';
  el.duration = options.duration ?? 'short';
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

  region.appendChild(el);
  return result;
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-toast': DsToast;
    'ds-toast-region': DsToastRegion;
  }
}
