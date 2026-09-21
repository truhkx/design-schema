import { LitElement, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type LandmarkRole =
  | 'banner'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'region'
  | 'search'
  | 'form';

/** Roles that are landmarks only when they have an accessible name. */
const NAME_REQUIRED: ReadonlySet<string> = new Set(['region', 'form']);

/** Roles that never take a label: one passed to them is not rendered. */
const NO_LABEL: ReadonlySet<string> = new Set(['banner', 'main', 'contentinfo']);

/** Roles that may repeat in one root, so duplicates must be told apart by label. */
const DISTINCT_BY_LABEL: ReadonlySet<string> = new Set(['navigation', 'complementary', 'region', 'form']);

/** Implicit roles of the elements the web Landmark renders, for peers that carry no `role` attribute. */
const IMPLICIT_ROLE: Readonly<Record<string, string>> = {
  header: 'banner',
  nav: 'navigation',
  main: 'main',
  aside: 'complementary',
  footer: 'contentinfo',
  section: 'region',
  form: 'form',
};

function roleOf(el: Element): string | undefined {
  return el.getAttribute('role') ?? IMPLICIT_ROLE[el.localName];
}

/** The name the warnings count: `aria-labelledby` text, else a non-empty `aria-label`; `''` when absent. */
function nameOf(el: Element): string {
  const labelledBy = el.getAttribute('aria-labelledby');
  const root = el.getRootNode() as Document | ShadowRoot;
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => root.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }
  return el.getAttribute('aria-label')?.trim() ?? '';
}

/**
 * `<ds-landmark>` — Landmark (category: layout, APG: landmarks).
 *
 * `<ds-landmark role="navigation" label="Main">` uses **no shadow root and no
 * wrapper element**: the host itself is the landmark in the light DOM tree
 * and its children are ordinary light-DOM children. The role and accessible
 * name are plain `role` / `aria-label` attributes on the host (not
 * `ElementInternals`, which the accessible-name tooling does not read). The
 * element is a plain block; consumers lay it out like any block. There is no
 * wrapper `<nav>` or similar inside: a nested landmark of the same role would
 * be a duplicate.
 *
 * The property is `landmark` (attribute `role`) because `HTMLElement` already
 * defines `role`. `label` maps to `aria-label`; `banner`, `main` and
 * `contentinfo` never take a label, so on them neither `label` nor a
 * composite's `aria-labelledby` is rendered.
 *
 * In development it warns when no role is set, when `region` or `form` has no
 * label, when a label is passed to a role that never takes one, when `main`
 * appears twice in a root, and when two `navigation`, `complementary`,
 * `region` or `form` landmarks share a label or both lack one (only the later
 * one in document order warns). Warnings fire on mount and on a change of role
 * or label, not on every render.
 *
 * Children are ordinary light-DOM children; there is no `<slot>` and no part
 * hook — `data-ds="Landmark"` on the host is the only hook.
 */
@customElement('ds-landmark')
export class DsLandmark extends LitElement {
  /** Which landmark this is. Reflected to the host's `role` attribute; absent exposes no role. */
  @property({ type: String, reflect: true, attribute: 'role' }) accessor landmark: LandmarkRole | undefined;

  /**
   * Accessible name, rendered as `aria-label`. Required for `region` and `form`, and whenever
   * the page has more than one landmark of the same role. An empty string counts as absent.
   */
  @property({ type: String, attribute: 'aria-label' }) accessor label: string | undefined;

  /** Set while the element writes `aria-label` itself, so the write does not feed back into `label`. */
  private syncingLabel = false;

  /** A (re)connection counts as a mount for the warnings. */
  private warnPending = false;

  /** No shadow root: children stay in the light DOM and the host is the landmark. */
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Landmark');
    // A plain block, without `display: contents` (which drops semantics in some browsers).
    if (this.style.display === '') {
      this.style.display = 'block';
    }
    this.warnPending = true;
    if (this.hasUpdated) this.requestUpdate();
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    if (this.syncingLabel && name === 'aria-label') return;
    super.attributeChangedCallback(name, old, value);
  }

  protected override render(): typeof nothing {
    return nothing;
  }

  protected override updated(changed: PropertyValues): void {
    const refusedLabel = this.syncName();
    if (this.warnPending || changed.has('landmark') || changed.has('label')) {
      this.warnPending = false;
      this.warnInDev(refusedLabel);
    }
  }

  /**
   * Writes `aria-label` from `label`, omitting it when empty or when the role never takes a label,
   * and drops a composite's `aria-labelledby` on those roles too. Returns true when a label — from
   * either source — was passed to a role that never takes one, so it was not rendered.
   */
  private syncName(): boolean {
    const role = this.landmark;
    const refuses = role !== undefined && NO_LABEL.has(role);
    const label = this.label ? this.label : null;
    const next = refuses ? null : label;
    if (this.getAttribute('aria-label') !== next) {
      this.syncingLabel = true;
      try {
        if (next === null) this.removeAttribute('aria-label');
        else this.setAttribute('aria-label', next);
      } finally {
        this.syncingLabel = false;
      }
    }
    const droppedLabelledBy = refuses && this.hasAttribute('aria-labelledby');
    if (droppedLabelledBy) this.removeAttribute('aria-labelledby');
    return refuses && (label !== null || droppedLabelledBy);
  }

  private warnInDev(refusedLabel: boolean): void {
    if (!import.meta.env.DEV || !this.isConnected) return;
    const role = this.landmark;
    if (role === undefined) {
      console.warn('Landmark: no role is set, so no landmark is exposed.', this);
      return;
    }
    if (refusedLabel) {
      console.warn(`Landmark: role "${role}" does not take a label; it was not rendered.`, this);
    }
    const name = nameOf(this);
    if (NAME_REQUIRED.has(role) && !name) {
      console.warn(`Landmark: role "${role}" is only a landmark when it has a label.`, this);
    }
    const root = this.getRootNode() as Document | ShadowRoot;
    const earlier = Array.from(root.querySelectorAll('[data-ds="Landmark"]')).filter(
      (peer) =>
        peer !== this &&
        roleOf(peer) === role &&
        (peer.compareDocumentPosition(this) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    );
    if (role === 'main' && earlier.length > 0) {
      console.warn('Landmark: role "main" appears more than once in this document.', this);
    }
    if (DISTINCT_BY_LABEL.has(role) && earlier.some((peer) => nameOf(peer) === name)) {
      console.warn(
        name
          ? `Landmark: two "${role}" landmarks share the label "${name}"; give each a distinct label.`
          : `Landmark: two "${role}" landmarks both lack a label; give each a distinct label.`,
        this,
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-landmark': DsLandmark;
  }
}
