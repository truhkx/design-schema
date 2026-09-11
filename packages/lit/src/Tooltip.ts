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

/** `delay: default` multiplies motion.duration.base by this to get the hover delay (~600ms). */
const DELAY_MULTIPLIER = 3;

/**
 * Grace window, in ms, between a trigger's pointerleave and actually hiding —
 * long enough for a diagonal mouse move to land on the popup itself (WCAG
 * 1.4.13 hoverable). Not a design token — an interaction timing, not a motion one.
 */
const POINTER_LEAVE_GRACE_MS = 100;

let idCounter = 0;
function nextTooltipId(): string {
  idCounter += 1;
  return `ds-tooltip-${idCounter}`;
}

/** Reads a `--motion-duration-*` custom property off `el` and returns it in ms. */
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

/** Timestamp until which a newly hovered tooltip should skip its delay — set whenever any tooltip closes. */
let warmUntil = 0;

const POPUP_CLASS = 'ds-tooltip-popup';
const POPUP_STYLE_MARKER = 'data-ds-tooltip-popup-style';

/* surface: color.inverse.surface, text: color.inverse.foreground — both locked, so the popup's
   background is hard-coded here and its text color is forwarded to the composed <ds-text> below. */
const POPUP_STYLE_CSS = `
.${POPUP_CLASS} {
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  margin: 0;
  padding-block: var(--ds-tooltip-padding-block);
  padding-inline: var(--ds-tooltip-padding-inline);
  border-radius: var(--ds-tooltip-radius);
  background: var(--color-inverse-surface);
  box-shadow: var(--ds-tooltip-shadow);
  max-inline-size: calc(var(--ds-tooltip-max-width) * 3);
  z-index: var(--ds-tooltip-layer);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--ds-tooltip-exit) var(--motion-easing-standard),
    display var(--ds-tooltip-exit) allow-discrete;
}
.${POPUP_CLASS}:popover-open {
  opacity: 1;
  pointer-events: auto;
  transition:
    opacity var(--ds-tooltip-enter) var(--motion-easing-standard),
    display var(--ds-tooltip-enter) allow-discrete;
}
@starting-style {
  .${POPUP_CLASS}:popover-open {
    opacity: 0;
  }
}
.${POPUP_CLASS}[hidden] {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .${POPUP_CLASS} {
    transition: none;
  }
}
`;

/** Roots that already carry the popup's stylesheet (a Document per page, a ShadowRoot per nesting host). */
const styledPopupRoots = new WeakSet<Document | ShadowRoot>();

/**
 * Injects the popup's rule into the tree the popup element actually lives in
 * (the page, or an ancestor shadow root) — it is a light-DOM sibling of the
 * trigger, not a shadow-root child, so `ds-tooltip`'s own stylesheet can't
 * reach it.
 */
function ensurePopupStyle(root: Document | ShadowRoot): void {
  if (styledPopupRoots.has(root)) {
    return;
  }
  styledPopupRoots.add(root);
  const target = root instanceof Document ? root.head : root;
  if (target.querySelector(`style[${POPUP_STYLE_MARKER}]`) !== null) {
    return;
  }
  const style = document.createElement('style');
  style.setAttribute(POPUP_STYLE_MARKER, '');
  style.textContent = POPUP_STYLE_CSS;
  target.appendChild(style);
}

/**
 * `<ds-tooltip>` — Tooltip (category: overlay, APG pattern: tooltip).
 *
 * `<ds-tooltip content="Includes archived items"><ds-button label="Show all">…</ds-button></ds-tooltip>`
 * wraps its single focusable child. Because `aria-describedby`/`aria-labelledby`
 * cannot cross a shadow boundary, the popup is not rendered inside this
 * element's shadow root: it is a plain `<div role="tooltip">` created once and
 * appended to the host itself (light DOM, a sibling of the slotted trigger),
 * positioned with the Popover API (`popover="manual"`) when available and a
 * `position: fixed` fallback otherwise, so its `id` resolves from the trigger's
 * attribute. It shows after `delay` on hover, immediately on focus, stays open
 * while the pointer is over either element (hoverable), and hides on Escape,
 * on blur, or when the pointer leaves both.
 *
 * ## When to use
 *
 * Use a Tooltip on an icon-only Button to supply its name (`describes="false"`,
 * content equal to the child's label) or on a labelled control to add a short
 * clarification. Keep it to a phrase; never put essential information,
 * interactive content or links in it.
 *
 * ## When not to use
 *
 * Not for content the user must read (use helper text, an Alert or a
 * Disclosure instead), not for anything interactive (a Popover, planned), and
 * never on a non-focusable child — keyboard users could never see it.
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

  /** The tooltip text. One short phrase; no markup, links or line breaks. */
  @property() accessor content!: string;

  /** Preferred side; flips when it would overflow the viewport. */
  @property({ reflect: true }) accessor placement: TooltipPlacement = 'top';

  /** `true`: supplementary, linked as the child's `aria-describedby`. `false`: linked as `aria-labelledby` — the tooltip IS the child's name. */
  @property({ type: Boolean, reflect: true }) accessor describes = true;

  /** Hover delay before showing: `default` (motion.duration.base × 3) or `none` for a warm toolbar item. */
  @property() accessor delay: TooltipDelay = 'default';

  /**
   * Controlled visibility, for stories and tests only (the `Keyboard` story
   * renders the tooltip open with it). Product code never sets this: a
   * tooltip is hover and focus driven.
   */
  @property({ type: Boolean }) accessor open: boolean | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;

  private popupEl!: HTMLDivElement;
  private popupId!: string;
  private triggerEl: HTMLElement | null = null;
  private visible = false;
  private pointerOverTrigger = false;
  private pointerOverPopup = false;
  private triggerFocused = false;
  private showTimerId?: ReturnType<typeof setTimeout> | undefined;
  private hideGraceTimerId?: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Tooltip');
    if (!this.popupEl) {
      this.popupId = nextTooltipId();
      this.popupEl = document.createElement('div');
      this.popupEl.id = this.popupId;
      this.popupEl.dataset.part = 'popup';
      this.popupEl.setAttribute('role', 'tooltip');
      this.popupEl.className = POPUP_CLASS;
      if (POPOVER_SUPPORTED) {
        this.popupEl.setAttribute('popover', 'manual');
      } else {
        this.popupEl.hidden = true;
      }
      this.popupEl.addEventListener('pointerenter', this.handlePopupPointerEnter);
      this.popupEl.addEventListener('pointerleave', this.handlePopupPointerLeave);
    }
    if (!this.popupEl.isConnected) {
      this.appendChild(this.popupEl);
    }
    ensurePopupStyle(this.getRootNode() as Document | ShadowRoot);
    this.renderPopupContent();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.showTimerId);
    clearTimeout(this.hideGraceTimerId);
    this.removeGlobalListeners();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('content') || changed.has('overrides')) {
      this.renderPopupContent();
    }
    if (changed.has('describes')) {
      this.updateTriggerAria();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('open')) {
      if (this.open) {
        this.showPopup();
      } else if (this.open === false) {
        this.hidePopup();
      }
    }
    if (this.visible && changed.has('placement')) {
      this.updatePosition();
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  private readonly handleSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedElements({ flatten: true }).filter((el) => el !== this.popupEl);
    const next = (assigned[0] as HTMLElement | undefined) ?? null;
    if (next === this.triggerEl) {
      this.updateTriggerAria();
      return;
    }
    this.detachTrigger();
    this.triggerEl = next;
    this.attachTrigger();
    if (this.open) {
      this.showPopup();
    }
  };

  private attachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.addEventListener('pointerenter', this.handleTriggerPointerEnter);
    trigger.addEventListener('pointerleave', this.handleTriggerPointerLeave);
    trigger.addEventListener('focus', this.handleTriggerFocus);
    trigger.addEventListener('blur', this.handleTriggerBlur);
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
    trigger.removeEventListener('focus', this.handleTriggerFocus);
    trigger.removeEventListener('blur', this.handleTriggerBlur);
    trigger.removeEventListener('keydown', this.handleTriggerKeydown);
    trigger.removeAttribute('aria-describedby');
    trigger.removeAttribute('aria-labelledby');
    this.hidePopup();
  }

  private updateTriggerAria(): void {
    if (!this.triggerEl) {
      return;
    }
    if (this.describes) {
      this.triggerEl.setAttribute('aria-describedby', this.popupId);
      this.triggerEl.removeAttribute('aria-labelledby');
    } else {
      this.triggerEl.setAttribute('aria-labelledby', this.popupId);
      this.triggerEl.removeAttribute('aria-describedby');
    }
  }

  private readonly handleTriggerPointerEnter = (event: PointerEvent): void => {
    // Never shown on touch; the description stays reachable via aria-describedby/labelledby.
    if (event.pointerType === 'touch') {
      return;
    }
    this.pointerOverTrigger = true;
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

  private readonly handleTriggerFocus = (): void => {
    this.triggerFocused = true;
    this.requestShow(true);
  };

  private readonly handleTriggerBlur = (): void => {
    this.triggerFocused = false;
    this.hidePopup();
  };

  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.visible) {
      this.hidePopup();
    }
  };

  private readonly handlePopupPointerEnter = (): void => {
    this.pointerOverPopup = true;
    clearTimeout(this.hideGraceTimerId);
  };

  private readonly handlePopupPointerLeave = (): void => {
    this.pointerOverPopup = false;
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
    const warm = Date.now() < warmUntil;
    if (immediate || this.delay === 'none' || warm) {
      this.showPopup();
    } else {
      this.showTimerId = setTimeout(() => this.showPopup(), this.computeDelayMs());
    }
  }

  private scheduleMaybeHide(): void {
    clearTimeout(this.hideGraceTimerId);
    this.hideGraceTimerId = setTimeout(() => {
      if (!this.pointerOverTrigger && !this.pointerOverPopup && !this.triggerFocused) {
        this.hidePopup();
      }
    }, POINTER_LEAVE_GRACE_MS);
  }

  private computeDelayMs(): number {
    return readDurationMs(this, '--motion-duration-base') * DELAY_MULTIPLIER;
  }

  private showPopup(): void {
    if (this.visible || !this.triggerEl) {
      return;
    }
    this.visible = true;
    clearTimeout(this.showTimerId);
    this.showTimerId = undefined;
    if (POPOVER_SUPPORTED) {
      this.popupEl.showPopover();
    } else {
      this.popupEl.hidden = false;
    }
    this.updatePosition();
    this.addGlobalListeners();
  }

  private hidePopup(): void {
    if (!this.visible) {
      return;
    }
    this.visible = false;
    clearTimeout(this.showTimerId);
    clearTimeout(this.hideGraceTimerId);
    this.showTimerId = undefined;
    if (POPOVER_SUPPORTED) {
      if (this.popupEl.matches(':popover-open')) {
        this.popupEl.hidePopover();
      }
    } else {
      this.popupEl.hidden = true;
    }
    this.removeGlobalListeners();
    warmUntil = Date.now() + readDurationMs(this, '--motion-duration-base');
  }

  private addGlobalListeners(): void {
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
  }

  private removeGlobalListeners(): void {
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  private updatePosition(): void {
    const trigger = this.triggerEl;
    const popup = this.popupEl;
    if (!trigger || !popup) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gap = parseFloat(getComputedStyle(this).getPropertyValue('--ds-tooltip-offset')) || 0;
    const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-gutter')) || 0;

    let placement = this.placement;
    if (placement === 'top' && triggerRect.top - gap - popupRect.height < 0) {
      placement = 'bottom';
    } else if (placement === 'bottom' && triggerRect.bottom + gap + popupRect.height > viewportHeight) {
      placement = 'top';
    } else if (placement === 'start' && triggerRect.left - gap - popupRect.width < 0) {
      placement = 'end';
    } else if (placement === 'end' && triggerRect.right + gap + popupRect.width > viewportWidth) {
      placement = 'start';
    }

    let top: number;
    let left: number;
    switch (placement) {
      case 'top':
        top = triggerRect.top - gap - popupRect.height;
        left = triggerRect.left + triggerRect.width / 2 - popupRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - popupRect.width / 2;
        break;
      case 'start':
        left = triggerRect.left - gap - popupRect.width;
        top = triggerRect.top + triggerRect.height / 2 - popupRect.height / 2;
        break;
      case 'end':
      default:
        left = triggerRect.right + gap;
        top = triggerRect.top + triggerRect.height / 2 - popupRect.height / 2;
        break;
    }

    left = Math.min(Math.max(left, gutter), Math.max(gutter, viewportWidth - popupRect.width - gutter));
    top = Math.min(Math.max(top, gutter), Math.max(gutter, viewportHeight - popupRect.height - gutter));
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }

  private renderPopupContent(): void {
    if (!this.popupEl) {
      return;
    }
    const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {
      color: 'color.inverse.foreground',
    };
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
      this.popupEl,
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
    if (this.triggerEl && typeof this.triggerEl.focus !== 'function') {
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
