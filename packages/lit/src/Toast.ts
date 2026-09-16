import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';
import './Text.js';
import './Button.js';
import type { TextOverridableBinding } from './Text.js';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type ToastDuration = 'short' | 'long' | 'persistent';
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'action' | 'replaced';

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

/** `duration: short` multiplies motion.duration.loop by this to get ~5s. */
const SHORT_MULTIPLIER = 6;
/** `duration: long` multiplies motion.duration.loop by this to get ~10s. */
const LONG_MULTIPLIER = 12;

/**
 * Safety margin, in ms, added on top of the read `--ds-toast-exit` duration
 * before forcing removal if `transitionend` never fires. Not a design token —
 * a defensive timing, not a motion one.
 */
const EXIT_FALLBACK_BUFFER_MS = 50;

/** At most this many toasts stack; showing another evicts the oldest. */
const MAX_TOASTS = 3;

/** Overridable style hooks; see the `overrides` property. `surface`, `text`, `icon`, `actionColor`, `dismissColor`, `focusRingInverse`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
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

/** Overridable style hooks for `<ds-toast-region>`; see its `overrides` property. `layer` sets the region's stacking context. */
export type ToastRegionOverridableBinding = 'stackGap' | 'regionInset' | 'layer';

const REGION_HOOKS: Record<ToastRegionOverridableBinding, string> = {
  stackGap: '--ds-toast-region-stack-gap',
  regionInset: '--ds-toast-region-inset',
  layer: '--ds-toast-region-layer',
};

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Reads a `--motion-duration-*`-shaped custom property off `el` and returns it in ms. */
function readDurationMs(el: HTMLElement, varName: string): number {
  const raw = getComputedStyle(el).getPropertyValue(varName).trim();
  if (raw.endsWith('ms')) {
    return parseFloat(raw);
  }
  if (raw.endsWith('s')) {
    return parseFloat(raw) * 1000;
  }
  return 0;
}

/**
 * `<ds-toast>` — Toast (category: feedback, APG pattern: alert).
 *
 * One notification. Never created directly by consumers — the `toast()`
 * function below appends it to a lazily-created `<ds-toast-region>` in
 * `document.body`. The host takes `role="status"` (`"alert"` for `tone:
 * "danger"`) and its accessible name through `ElementInternals`, set to
 * `message`, so the live region and its name live in the light DOM tree.
 * Inside the shadow root: the tone icon (`neutral` has none), the message as
 * `<ds-text>`, an inverse-ghost `<ds-button>` for the action, and an
 * inverse-ghost icon-only `<ds-button>` for dismiss. A timer dismisses the
 * toast after `duration`, pausing while hovered, focused, or the page is
 * hidden; persistent toasts have no timer. Escape and the dismiss button both
 * dismiss with a short exit transition (instant under reduced motion), after
 * which the element removes itself.
 *
 * ## When to use
 *
 * Use a Toast to confirm a completed action that the user did not have to
 * watch, to offer Undo for a reversible action, or to report a background
 * result. Match `tone` to the outcome; use `duration: "persistent"` whenever
 * there is an action, and for `danger`, so nobody misses the one they needed.
 *
 * ## When not to use
 *
 * Not for errors that need fixing (an Alert next to the problem), not for
 * anything the user must read (Alert or Dialog), and not for more than one
 * action.
 *
 * @fires action - The action button was activated. Followed by `dismiss` with `reason: 'action'`.
 * @fires dismiss - The toast left the screen, with `{ reason }` (`timeout`, `dismiss-button`, `action`, or `replaced`).
 * @csspart toast - The container (anatomy: toast).
 * @csspart icon - The tone icon (anatomy: icon).
 * @csspart message - The `<ds-text>` (anatomy: message).
 * @csspart action-button - The action `<ds-button>` (anatomy: actionButton).
 * @csspart dismiss-button - The dismiss `<ds-button>` (anatomy: dismissButton).
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

    .container {
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
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-toast-enter) var(--motion-easing-standard),
        transform var(--ds-toast-enter) var(--motion-easing-standard);
    }

    @starting-style {
      .container {
        opacity: 0;
        transform: translateY(var(--space-2));
      }
    }

    /* exit: motion.duration.fast, replacing the enter duration while leaving */
    .container.closing {
      opacity: 0;
      transform: translateY(var(--space-2));
      transition-duration: var(--ds-toast-exit);
    }

    @media (prefers-reduced-motion: reduce) {
      .container {
        transition: none;
      }
    }

    .icon {
      flex: none;
    }

    /* icon: color.inverse.status.{tone}, locked — neutral renders no icon */
    :host([tone='success']) .icon {
      color: var(--color-inverse-status-success);
    }
    :host([tone='warning']) .icon {
      color: var(--color-inverse-status-warning);
    }
    :host([tone='danger']) .icon {
      color: var(--color-inverse-status-danger);
    }

    /* text: color.inverse.foreground, locked. Text's own color binding is locked as well, so the
       message cannot be handed a color override — the token it already reads is re-scoped here. */
    .message {
      --color-foreground: var(--color-inverse-foreground);
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    .action,
    .dismiss {
      flex: none;
    }
  `;

  /** One sentence, past tense, saying what happened ("Message sent", "3 files deleted"). Also the toast's accessible name. */
  @property() accessor message!: string;

  /** Sets the leading icon; `neutral` has none. Toasts never use tinted backgrounds — the icon and message carry the tone. */
  @property({ reflect: true }) accessor tone: ToastTone = 'neutral';

  /** Label for a single action button ("Undo", "View"). Recommended as `persistent` so there is time to use it. */
  @property({ attribute: 'action-label' }) accessor actionLabel: string | undefined;

  /** `short` ≈ 5s, `long` ≈ 10s (motion.duration.loop × 6 / × 12), `persistent` until dismissed. */
  @property({ reflect: true }) accessor duration: ToastDuration = 'short';

  /** Stable identity; showing a toast with the same `toastId` replaces this one instead of stacking. Named `toastId` (attribute `toast-id`) so it does not collide with the DOM `id`. */
  @property({ attribute: 'toast-id' }) accessor toastId: string | undefined;

  /** Shows a dismiss button. Persistent toasts are always dismissible regardless of this value. Exposed as the negated `no-dismiss` attribute (a boolean attribute cannot express `false` for a prop that defaults `true`). */
  @property({ attribute: 'no-dismiss', converter: NEGATED_BOOLEAN_CONVERTER }) accessor dismissible = true;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;

  @query('.container') private accessor containerEl!: HTMLElement;

  @state() private accessor closing = false;

  private readonly internals: ElementInternals;
  private dismissed = false;
  private timerId?: ReturnType<typeof setTimeout> | undefined;
  private remainingMs: number | null = null;
  private timerStartedAt = 0;
  private pointerOver = false;
  private focused = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private get showDismiss(): boolean {
    return this.dismissible || this.duration === 'persistent';
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
    this.startTimer();
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
      // role="status" implies aria-live="polite"; role="alert" implies assertive.
      this.internals.role = this.tone === 'danger' ? 'alert' : 'status';
    }
    if (changed.has('message')) {
      // A literal attribute, not `internals.ariaLabel`: ARIAMixin values set through
      // ElementInternals aren't visible to the accessible-name computation the test
      // suite uses (only real attributes are), though real assistive tech reads either.
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

  protected override updated(): void {
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    if (this.overrides?.fontFamily) {
      textOverrides.fontFamily = this.overrides.fontFamily;
    }
    if (this.overrides?.fontSize) {
      textOverrides.fontSize = this.overrides.fontSize;
    }
    if (this.overrides?.lineHeight) {
      textOverrides.lineHeight = this.overrides.lineHeight;
    }

    return html`
      <div class="container${this.closing ? ' closing' : ''}" part="toast">
        ${this.tone === 'neutral'
          ? nothing
          : html`<ds-icon class="icon" part="icon" name=${this.tone}></ds-icon>`}
        <ds-text class="message" part="message" element="span" size="md" .overrides=${textOverrides}
          >${this.message}</ds-text
        >
        ${this.actionLabel
          ? html`
              <ds-button
                class="action"
                part="action-button"
                variant="ghost"
                inverse
                size="sm"
                label=${this.actionLabel}
                @press=${this.handleActionPress}
              ></ds-button>
            `
          : nothing}
        ${this.showDismiss
          ? html`
              <ds-button
                class="dismiss"
                part="dismiss-button"
                variant="ghost"
                inverse
                size="sm"
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
    // Keep the button's `press` inside the toast; consumers listen for `action`/`dismiss`.
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent<ToastActionDetail>('action', { bubbles: true, composed: true }));
    this.requestDismiss('action');
  };

  private readonly handleDismissPress = (event: Event): void => {
    event.stopPropagation();
    this.requestDismiss('dismiss-button');
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      // No 'escape' reason exists on ToastDismissReason; treated as an explicit manual dismissal.
      this.requestDismiss('dismiss-button');
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

  /** Dispatches `dismiss` and plays the exit transition; called for every dismissal path, including eviction by `toast()`. */
  public requestDismiss(reason: ToastDismissReason): void {
    if (this.dismissed) {
      return;
    }
    this.dismissed = true;
    this.clearTimer();
    this.dispatchEvent(
      new CustomEvent<ToastDismissDetail>('dismiss', { detail: { reason }, bubbles: true, composed: true }),
    );
    this.playExit();
  }

  private computeDurationMs(): number | null {
    if (this.duration === 'persistent') {
      return null;
    }
    const loop = readDurationMs(this, '--motion-duration-loop');
    return loop * (this.duration === 'long' ? LONG_MULTIPLIER : SHORT_MULTIPLIER);
  }

  private startTimer(): void {
    const ms = this.computeDurationMs();
    if (ms === null) {
      return;
    }
    this.remainingMs = ms;
    this.scheduleTimer();
  }

  private scheduleTimer(): void {
    if (this.remainingMs === null) {
      return;
    }
    this.timerStartedAt = Date.now();
    this.timerId = setTimeout(() => this.requestDismiss('timeout'), Math.max(0, this.remainingMs));
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
    this.scheduleTimer();
  }

  private clearTimer(): void {
    clearTimeout(this.timerId);
    this.timerId = undefined;
  }

  /** Plays the exit transition (instant under reduced motion), then removes the element from the DOM. */
  private playExit(): void {
    const finish = (): void => {
      const region = this.closest('ds-toast-region');
      if (this.contains(document.activeElement) && region instanceof DsToastRegion) {
        region.restoreFocus();
      }
      this.remove();
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    this.closing = true;
    const container = this.containerEl;
    if (!container) {
      finish();
      return;
    }

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
    const exitMs = readDurationMs(this, '--ds-toast-exit');
    setTimeout(settle, exitMs + EXIT_FALLBACK_BUFFER_MS);
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
    if (this.actionLabel && this.duration !== 'persistent') {
      console.warn('<ds-toast> with an `action-label` should be `duration="persistent"` (WCAG 2.2.1).', this);
    }
    if (this.tone === 'danger' && this.duration !== 'persistent') {
      console.warn('<ds-toast tone="danger"> should be `duration="persistent"`.', this);
    }
  }
}

/**
 * `<ds-toast-region>` — the live region that holds `<ds-toast>` children (anatomy: region).
 *
 * Auto-created in `document.body` by `toast()`; not meant to be authored
 * directly. Takes `role="region"` and `aria-label` through `ElementInternals`
 * and `aria-live="polite"` as an attribute (an ARIAMixin property does not
 * exist for it), fixed at `regionInset` from the viewport edge — bottom-start
 * on wide screens, bottom-center on phones — stacking `<ds-toast>` children
 * with `stackGap` between them, newest at the bottom. A document-level `F6`
 * handler moves focus into the first toast's action or dismiss button, and
 * back out again on a second press.
 */
@customElement('ds-toast-region')
export class DsToastRegion extends LitElement {
  static override styles: CSSResult = css`
    :host {
      position: fixed;
      inset-inline: var(--ds-toast-region-inset);
      inset-block-end: var(--ds-toast-region-inset);
      z-index: var(--ds-toast-region-layer);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ds-toast-region-stack-gap);
      pointer-events: none;
      --ds-toast-region-stack-gap: var(--layout-gap-tight);
      --ds-toast-region-inset: var(--layout-gutter);
      --ds-toast-region-layer: var(--layer-toast);
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

  /** Per-instance style overrides: `{ regionInset: 'layout.gutter.wide' }`. */
  @property({ attribute: false }) accessor overrides: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;

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
    this.setAttribute('aria-live', 'polite');
    this.internals.role = 'region';
    this.internals.ariaLabel = COPY_REGION_LABEL;
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

  /** Sends focus back to whatever had it before `F6` moved focus in here. Called on the second `F6` and on dismissal. */
  public restoreFocus(): void {
    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    target?.focus();
  }

  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'F6' || this.childElementCount === 0) {
      return;
    }
    if (this.contains(document.activeElement)) {
      event.preventDefault();
      this.restoreFocus();
      return;
    }
    const first = this.firstElementChild as HTMLElement | null;
    const target = first?.shadowRoot?.querySelector<HTMLElement>('.action, .dismiss') ?? first ?? undefined;
    if (target) {
      event.preventDefault();
      this.previouslyFocused = document.activeElement as HTMLElement | null;
      target.focus();
    }
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
}

/** Resolution of the promise `toast()` returns, once the toast leaves the screen. */
export interface ToastResult {
  reason: ToastDismissReason;
}

let regionEl: DsToastRegion | null = null;

function ensureRegion(): DsToastRegion {
  if (regionEl === null || !regionEl.isConnected) {
    regionEl = document.createElement('ds-toast-region') as DsToastRegion;
    document.body.appendChild(regionEl);
  }
  return regionEl;
}

/**
 * Shows a toast, since a notification is an event, not a place in the tree.
 * Returns a promise that resolves once the toast leaves the screen (see
 * `ToastResult.reason`). Showing a toast with the same `toastId` as one
 * already visible replaces it (`reason: 'replaced'` for the old one) instead
 * of stacking; more than `MAX_TOASTS` visible evicts the oldest the same way.
 */
export function toast(options: ToastOptions): Promise<ToastResult> {
  const region = ensureRegion();

  const current = Array.from(region.querySelectorAll('ds-toast')) as DsToast[];

  if (options.toastId !== undefined) {
    const existing = current.find((el) => el.toastId === options.toastId);
    existing?.requestDismiss('replaced');
  }

  if (current.length >= MAX_TOASTS) {
    current[0]?.requestDismiss('replaced');
  }

  const el = document.createElement('ds-toast') as DsToast;
  el.toastId = options.toastId;
  el.message = options.message;
  el.tone = options.tone ?? 'neutral';
  el.duration = options.duration ?? 'short';
  if (options.actionLabel !== undefined) {
    el.actionLabel = options.actionLabel;
  }
  if (options.dismissible !== undefined) {
    el.dismissible = options.dismissible;
  }

  region.appendChild(el);

  return new Promise<ToastResult>((resolve) => {
    el.addEventListener(
      'dismiss',
      (event) => resolve({ reason: (event as CustomEvent<ToastDismissDetail>).detail.reason }),
      { once: true },
    );
  });
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-toast': DsToast;
    'ds-toast-region': DsToastRegion;
  }
}
