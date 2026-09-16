import { LitElement, css, html, render as litRender, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TooltipDelay = 'default' | 'none';

/** Overridable style hooks; see the `overrides` property. `surface` and `text` are locked and excluded. */
export type TooltipOverridableBinding =
  | 'radius'
  | 'paddingBlock'
  | 'paddingInline'
  | 'offset'
  | 'maxWidth'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'shadow'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<TooltipOverridableBinding, string> = {
  radius: '--ds-tooltip-radius',
  paddingBlock: '--ds-tooltip-padding-block',
  paddingInline: '--ds-tooltip-padding-inline',
  offset: '--ds-tooltip-offset',
  maxWidth: '--ds-tooltip-max-width',
  fontFamily: `--ds-tooltip-font-family`, // literal-ok: CSS custom-property name, not a font stack
  fontSize: '--ds-tooltip-font-size',
  lineHeight: '--ds-tooltip-line-height',
  shadow: '--ds-tooltip-shadow',
  layer: '--ds-tooltip-layer',
  enter: '--ds-tooltip-enter',
  exit: '--ds-tooltip-exit',
};

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** Constants, each read through its token expression at the moment it is needed. */
const HOVER_DELAY = { token: '--motion-duration-base', multiply: 3 } as const;
const WARM_WINDOW = { token: '--motion-duration-base', multiply: 1 } as const;
const POINTER_GRACE = { token: '--motion-duration-fast', multiply: 1 } as const;

let idCounter = 0;
function nextTooltipId(): string {
  idCounter += 1;
  return `ds-tooltip-${idCounter}`;
}

/** Resolves a duration constant (`token` × `multiply`) off `el`, in ms. */
function constantMs(el: HTMLElement, constant: { token: string; multiply: number }): number {
  const raw = getComputedStyle(el).getPropertyValue(constant.token).trim();
  let ms = 0;
  if (raw.endsWith('ms')) {
    ms = parseFloat(raw);
  } else if (raw.endsWith('s')) {
    ms = parseFloat(raw) * 1000;
  }
  return (Number.isFinite(ms) ? ms : 0) * constant.multiply;
}

/** Shared "warm" state: until this timestamp a newly hovered tooltip shows with no delay. Set whenever any tooltip hides. */
let warmUntil = 0;

const BUBBLE_CLASS = 'ds-tooltip-bubble';
const DESCRIPTION_CLASS = 'ds-tooltip-description';
const LIGHT_STYLE_MARKER = 'data-ds-tooltip-style';

/* The description copy and the bubble live in the light DOM (so the trigger's ID reference resolves), which
   `ds-tooltip`'s shadow stylesheet cannot reach; their rules are injected into the tree they live in.
   surface: color.inverse.surface and text: color.inverse.foreground are locked. Text's color is locked too,
   so the bubble re-scopes --color-foreground on its own container and composes <ds-text> unchanged. */
const LIGHT_STYLE_CSS = `
.${DESCRIPTION_CLASS} {
  /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.${BUBBLE_CLASS} {
  --color-foreground: var(--color-inverse-foreground);
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  margin: 0;
  border: none;
  padding-block: var(--ds-tooltip-padding-block);
  padding-inline: var(--ds-tooltip-padding-inline);
  border-radius: var(--ds-tooltip-radius);
  background: var(--color-inverse-surface);
  color: var(--color-inverse-foreground);
  box-shadow: var(--ds-tooltip-shadow);
  max-inline-size: calc(var(--ds-tooltip-max-width) * 3);
  font-family: var(--ds-tooltip-font-family);
  font-size: var(--ds-tooltip-font-size);
  line-height: var(--ds-tooltip-line-height);
  z-index: var(--ds-tooltip-layer);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--ds-tooltip-exit) var(--motion-easing-standard),
    display var(--ds-tooltip-exit) allow-discrete,
    overlay var(--ds-tooltip-exit) allow-discrete;
}
.${BUBBLE_CLASS}:popover-open,
.${BUBBLE_CLASS}[data-open] {
  opacity: 1;
  pointer-events: auto;
  transition:
    opacity var(--ds-tooltip-enter) var(--motion-easing-standard),
    display var(--ds-tooltip-enter) allow-discrete,
    overlay var(--ds-tooltip-enter) allow-discrete;
}
@starting-style {
  .${BUBBLE_CLASS}:popover-open,
  .${BUBBLE_CLASS}[data-open] {
    opacity: 0;
  }
}
.${BUBBLE_CLASS}[hidden] {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .${BUBBLE_CLASS},
  .${BUBBLE_CLASS}:popover-open,
  .${BUBBLE_CLASS}[data-open] {
    transition: none;
  }
}
`;

/** Roots that already carry the light-DOM stylesheet (a Document per page, a ShadowRoot per nesting host). */
const styledRoots = new WeakSet<Document | ShadowRoot>();

function ensureLightStyle(root: Node): void {
  if (!(root instanceof Document) && !(root instanceof ShadowRoot)) {
    return;
  }
  if (styledRoots.has(root)) {
    return;
  }
  styledRoots.add(root);
  const target = root instanceof Document ? root.head : root;
  if (target.querySelector(`style[${LIGHT_STYLE_MARKER}]`) !== null) {
    return;
  }
  const style = document.createElement('style');
  style.setAttribute(LIGHT_STYLE_MARKER, '');
  style.textContent = LIGHT_STYLE_CSS;
  target.appendChild(style);
}

/**
 * `<ds-tooltip>` — Tooltip (category: overlay, APG pattern: tooltip).
 *
 * `<ds-tooltip content="Bold" no-describes><ds-button icon-only label="Bold">…</ds-button></ds-tooltip>`
 * wraps its single focusable child. Because `aria-describedby`/`aria-labelledby`
 * cannot cross a shadow boundary, the tooltip is not rendered in this element's
 * shadow root. Two light-DOM nodes are appended to the host, siblings of the
 * trigger: a visually-hidden `<span role="tooltip" id>` that the trigger's
 * `aria-describedby` (or `aria-labelledby`) points at and that is always in the
 * accessibility tree, and the positioned bubble — `aria-hidden`, the visible
 * copy — shown with the Popover API (`popover="manual"`) or a `position: fixed`
 * fallback. The bubble shows after `delay` on hover, immediately on focus, stays
 * while the pointer is over it (hoverable), and hides on Escape without moving
 * focus, when focus leaves the trigger, or when the pointer leaves both.
 *
 * ## When to use
 *
 * On an icon-only Button to show its name (`describes: false`, content equal to
 * the child's label), or on a labelled control to add a short clarification.
 * Keep it to a phrase.
 *
 * ## When not to use
 *
 * Not for content the user must read (helper text, an Alert or a Disclosure),
 * not for anything interactive (a Popover, planned), and never on a
 * non-focusable child — keyboard users could never see it.
 *
 * @slot - Exactly one focusable element (a Button, Link, Input) the tooltip attaches to.
 */
@customElement('ds-tooltip')
export class DsTooltip extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: contents;
      --ds-tooltip-radius: var(--radius-sm);
      --ds-tooltip-padding-block: var(--space-1);
      --ds-tooltip-padding-inline: var(--space-2);
      --ds-tooltip-offset: var(--space-1);
      --ds-tooltip-max-width: var(--space-20);
      --ds-tooltip-font-family: var(--font-family-body);
      --ds-tooltip-font-size: var(--font-size-sm);
      --ds-tooltip-line-height: var(--font-line-height-normal);
      --ds-tooltip-shadow: var(--shadow-raised);
      --ds-tooltip-layer: var(--layer-toast);
      --ds-tooltip-enter: var(--motion-duration-fast);
      --ds-tooltip-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }
  `;

  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  @property() accessor content: string = '';

  /** Preferred side; flips when it would overflow the viewport. `start`/`end` are logical and mirror in right-to-left writing. */
  @property({ type: String, reflect: true }) accessor placement: TooltipPlacement = 'top';

  /**
   * `true`: supplementary, linked as the child's `aria-describedby`. `false`: the tooltip IS the child's name
   * and is linked as `aria-labelledby`. Defaults to true, so the attribute is the negated `no-describes`.
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'no-describes',
    converter: {
      fromAttribute: (value: string | null): boolean => value === null,
      toAttribute: (value: boolean): string | null => (value ? null : ''),
    },
  })
  accessor describes: boolean = true;

  /** Hover delay before showing: `default` (motion.duration.base × 3) or `none` for a warm toolbar. */
  @property({ type: String }) accessor delay: TooltipDelay = 'default';

  /**
   * Controlled visibility, for stories and tests only (the `Keyboard` story renders the tooltip open with it).
   * Product code never sets it: a tooltip is hover and focus driven.
   */
  @property({ type: Boolean }) accessor open: boolean | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;

  private readonly tooltipId: string = nextTooltipId();
  private descriptionEl: HTMLSpanElement | null = null;
  private bubbleEl: HTMLDivElement | null = null;
  private triggerEl: HTMLElement | null = null;
  private visible = false;
  private pointerOverTrigger = false;
  private pointerOverBubble = false;
  private triggerFocused = false;
  private showTimerId: ReturnType<typeof setTimeout> | undefined;
  private hideGraceTimerId: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Tooltip');
    this.ensureLightNodes();
    ensureLightStyle(this.getRootNode());
    this.renderLightContent();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.showTimerId);
    clearTimeout(this.hideGraceTimerId);
    this.hideBubble();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('content') || changed.has('overrides')) {
      this.renderLightContent();
    }
    if (changed.has('describes')) {
      this.updateTriggerAria();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('open')) {
      if (this.open === true) {
        this.showBubble();
      } else if (this.open === false) {
        this.hideBubble();
      }
    }
    if (this.visible && changed.has('placement')) {
      this.updatePosition();
    }
    if (changed.has('content')) {
      this.warnInDev();
    }
  }

  protected override render(): TemplateResult {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  /** Creates the description copy and the bubble once, and appends them only when not already in place. */
  private ensureLightNodes(): void {
    if (!this.descriptionEl) {
      const description = document.createElement('span');
      description.id = this.tooltipId;
      description.setAttribute('role', 'tooltip');
      description.className = DESCRIPTION_CLASS;
      this.descriptionEl = description;
    }
    if (!this.bubbleEl) {
      const bubble = document.createElement('div');
      bubble.className = BUBBLE_CLASS;
      bubble.setAttribute('aria-hidden', 'true');
      if (POPOVER_SUPPORTED) {
        bubble.setAttribute('popover', 'manual');
      } else {
        bubble.hidden = true;
      }
      bubble.addEventListener('pointerenter', this.handleBubblePointerEnter);
      bubble.addEventListener('pointerleave', this.handleBubblePointerLeave);
      this.bubbleEl = bubble;
    }
    if (this.descriptionEl.parentElement !== this) {
      this.appendChild(this.descriptionEl);
    }
    if (this.bubbleEl.parentElement !== this) {
      this.appendChild(this.bubbleEl);
    }
  }

  private readonly handleSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot
      .assignedElements({ flatten: true })
      .filter((el): el is HTMLElement => el !== this.bubbleEl && el !== this.descriptionEl && el instanceof HTMLElement);
    if (import.meta.env.DEV && assigned.length > 1) {
      console.warn('<ds-tooltip> takes exactly one focusable child; only the first is the trigger.', this);
    }
    const next = assigned[0] ?? null;
    if (next === this.triggerEl) {
      return;
    }
    this.detachTrigger();
    this.triggerEl = next;
    this.attachTrigger();
    if (this.open === true) {
      this.showBubble();
    }
  };

  private attachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.addEventListener('pointerenter', this.handleTriggerPointerEnter);
    trigger.addEventListener('pointerleave', this.handleTriggerPointerLeave);
    trigger.addEventListener('focusin', this.handleTriggerFocusIn);
    trigger.addEventListener('focusout', this.handleTriggerFocusOut);
    trigger.addEventListener('keydown', this.handleTriggerKeydown);
    this.updateTriggerAria();
    this.warnInDev();
  }

  private detachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.removeEventListener('pointerenter', this.handleTriggerPointerEnter);
    trigger.removeEventListener('pointerleave', this.handleTriggerPointerLeave);
    trigger.removeEventListener('focusin', this.handleTriggerFocusIn);
    trigger.removeEventListener('focusout', this.handleTriggerFocusOut);
    trigger.removeEventListener('keydown', this.handleTriggerKeydown);
    if (trigger.getAttribute('aria-describedby') === this.tooltipId) {
      trigger.removeAttribute('aria-describedby');
    }
    if (trigger.getAttribute('aria-labelledby') === this.tooltipId) {
      trigger.removeAttribute('aria-labelledby');
    }
    this.pointerOverTrigger = false;
    this.triggerFocused = false;
    this.hideBubble();
  }

  private updateTriggerAria(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    const [set, clear] = this.describes ? ['aria-describedby', 'aria-labelledby'] : ['aria-labelledby', 'aria-describedby'];
    if (trigger.getAttribute(set) !== this.tooltipId) {
      trigger.setAttribute(set, this.tooltipId);
    }
    if (trigger.getAttribute(clear) === this.tooltipId) {
      trigger.removeAttribute(clear);
    }
  }

  private readonly handleTriggerPointerEnter = (event: PointerEvent): void => {
    // Never shown on touch (no hover); the text stays in the tree through the description copy.
    if (event.pointerType === 'touch') {
      return;
    }
    this.pointerOverTrigger = true;
    clearTimeout(this.hideGraceTimerId);
    this.requestShow(false);
  };

  private readonly handleTriggerPointerLeave = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      return;
    }
    this.pointerOverTrigger = false;
    if (!this.visible) {
      clearTimeout(this.showTimerId);
      this.showTimerId = undefined;
      return;
    }
    this.scheduleMaybeHide();
  };

  private readonly handleTriggerFocusIn = (): void => {
    this.triggerFocused = true;
    this.requestShow(true);
  };

  private readonly handleTriggerFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    if (next instanceof Node && this.triggerEl?.contains(next)) {
      return;
    }
    this.triggerFocused = false;
    this.hideBubble();
  };

  /** Escape: hides the tooltip without moving focus. */
  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.visible) {
      this.hideBubble();
    }
  };

  /** Escape while shown by hover alone (focus elsewhere): still dismissable without moving the pointer (WCAG 1.4.13). */
  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.visible && !this.triggerFocused) {
      this.hideBubble();
    }
  };

  private readonly handleBubblePointerEnter = (): void => {
    this.pointerOverBubble = true;
    clearTimeout(this.hideGraceTimerId);
  };

  private readonly handleBubblePointerLeave = (): void => {
    this.pointerOverBubble = false;
    this.scheduleMaybeHide();
  };

  private readonly handleReposition = (): void => {
    if (this.visible) {
      this.updatePosition();
    }
  };

  private requestShow(immediate: boolean): void {
    if (this.visible) {
      return;
    }
    clearTimeout(this.showTimerId);
    this.showTimerId = undefined;
    if (immediate || this.delay === 'none' || Date.now() < warmUntil) {
      this.showBubble();
    } else {
      this.showTimerId = setTimeout(() => this.showBubble(), constantMs(this, HOVER_DELAY));
    }
  }

  /** Waits one pointerGrace so the pointer can cross the `offset` gap to the bubble. */
  private scheduleMaybeHide(): void {
    clearTimeout(this.hideGraceTimerId);
    this.hideGraceTimerId = setTimeout(() => {
      if (!this.pointerOverTrigger && !this.pointerOverBubble && !this.triggerFocused) {
        this.hideBubble();
      }
    }, constantMs(this, POINTER_GRACE));
  }

  private showBubble(): void {
    const bubble = this.bubbleEl;
    if (this.visible || !this.triggerEl || !bubble || !this.isConnected) {
      return;
    }
    this.visible = true;
    clearTimeout(this.showTimerId);
    this.showTimerId = undefined;
    if (POPOVER_SUPPORTED) {
      if (!bubble.matches(':popover-open')) {
        bubble.showPopover();
      }
    } else {
      bubble.hidden = false;
      bubble.toggleAttribute('data-open', true);
    }
    this.updatePosition();
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
    document.addEventListener('keydown', this.handleDocumentKeydown);
  }

  private hideBubble(): void {
    if (!this.visible) {
      clearTimeout(this.showTimerId);
      this.showTimerId = undefined;
      return;
    }
    this.visible = false;
    clearTimeout(this.showTimerId);
    clearTimeout(this.hideGraceTimerId);
    this.showTimerId = undefined;
    const bubble = this.bubbleEl;
    if (bubble) {
      if (POPOVER_SUPPORTED) {
        if (bubble.matches(':popover-open')) {
          bubble.hidePopover();
        }
      } else {
        bubble.toggleAttribute('data-open', false);
        bubble.hidden = true;
      }
    }
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    warmUntil = Date.now() + constantMs(this, WARM_WINDOW);
  }

  /** Positions the bubble from the trigger rect at `placement`, resolving start/end from the trigger's direction and flipping on overflow. */
  private updatePosition(): void {
    const trigger = this.triggerEl;
    const bubble = this.bubbleEl;
    if (!trigger || !bubble) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gap = parseFloat(getComputedStyle(this).getPropertyValue('--ds-tooltip-offset')) || 0;
    const rtl = getComputedStyle(trigger).direction === 'rtl';

    type Side = 'top' | 'bottom' | 'left' | 'right';
    let side: Side =
      this.placement === 'start' ? (rtl ? 'right' : 'left') : this.placement === 'end' ? (rtl ? 'left' : 'right') : this.placement;
    if (side === 'top' && triggerRect.top - gap - bubbleRect.height < 0) {
      side = 'bottom';
    } else if (side === 'bottom' && triggerRect.bottom + gap + bubbleRect.height > viewportHeight) {
      side = 'top';
    } else if (side === 'left' && triggerRect.left - gap - bubbleRect.width < 0) {
      side = 'right';
    } else if (side === 'right' && triggerRect.right + gap + bubbleRect.width > viewportWidth) {
      side = 'left';
    }

    let top: number;
    let left: number;
    switch (side) {
      case 'top':
        top = triggerRect.top - gap - bubbleRect.height;
        left = triggerRect.left + triggerRect.width / 2 - bubbleRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - bubbleRect.width / 2;
        break;
      case 'left':
        left = triggerRect.left - gap - bubbleRect.width;
        top = triggerRect.top + triggerRect.height / 2 - bubbleRect.height / 2;
        break;
      default:
        left = triggerRect.right + gap;
        top = triggerRect.top + triggerRect.height / 2 - bubbleRect.height / 2;
        break;
    }

    left = Math.min(Math.max(left, 0), Math.max(0, viewportWidth - bubbleRect.width));
    top = Math.min(Math.max(top, 0), Math.max(0, viewportHeight - bubbleRect.height));
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
  }

  /** Writes `content` into both copies: plain text in the description, a composed <ds-text data-part="text"> in the bubble. */
  private renderLightContent(): void {
    if (this.descriptionEl && this.descriptionEl.textContent !== this.content) {
      this.descriptionEl.textContent = this.content;
    }
    if (!this.bubbleEl) {
      return;
    }
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
    litRender(
      html`<ds-text data-part="text" size="sm" element="span" .overrides=${textOverrides}>${this.content}</ds-text>`,
      this.bubbleEl,
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TooltipOverridableBinding[]) {
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
    if (!this.content) {
      console.warn('<ds-tooltip> requires `content`.', this);
    }
    const trigger = this.triggerEl;
    if (trigger && trigger.tabIndex < 0 && trigger.shadowRoot?.delegatesFocus !== true) {
      console.warn(
        '<ds-tooltip> child must be focusable, so hover and keyboard focus are equivalent (WCAG 1.4.13, 2.1.1).',
        this,
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tooltip': DsTooltip;
  }
}
