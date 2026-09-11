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

/** Roles that may legitimately repeat, so duplicates must be told apart by label. */
const DISTINCT_BY_LABEL: ReadonlySet<string> = new Set(['navigation', 'complementary', 'region', 'form']);

/**
 * `<ds-landmark>` — Landmark (category: layout, APG: landmarks).
 *
 * `<ds-landmark role="navigation" label="Main">` uses **no shadow root and no
 * wrapper element**: the host itself is the landmark in the light DOM tree
 * and its children are ordinary light-DOM children. The landmark role and
 * accessible name are plain `role` / `aria-label` attributes reflected
 * straight onto the host (real attributes, not `ElementInternals`, so the
 * accessible-name computation the test suite uses can see them — the same
 * attributes are what real assistive tech reads). The element is a plain
 * block; consumers lay it out like any block.
 *
 * ## When to use
 *
 * Wrap the page's major regions: one `banner`, exactly one `main`,
 * `navigation` for each navigation block (labelled when there is more than
 * one), `complementary` for sidebars, `contentinfo` for the footer, `search`
 * around the site search, and `region` for any other section a user might
 * want to jump to. Do not wrap everything; layout containers and cards are
 * not landmarks.
 *
 * @slot - The region's content (ordinary light-DOM children; there is no shadow root).
 */
@customElement('ds-landmark')
export class DsLandmark extends LitElement {
  /**
   * Which landmark this is. Exposed as the host's `role` attribute; the
   * property is named `landmark` because `HTMLElement` already defines `role`.
   */
  @property({ reflect: true, attribute: 'role' }) accessor landmark: LandmarkRole | undefined;

  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Reflects to `aria-label`. */
  @property({ reflect: true, attribute: 'aria-label' }) accessor label: string | undefined;

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
    this.warnInDev();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if ((changed.has('landmark') || changed.has('label')) && this.hasUpdated) {
      this.warnInDev();
    }
  }

  protected override render(): symbol {
    return nothing;
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV || !this.isConnected) {
      return;
    }
    const role = this.landmark;
    if (role === undefined) {
      console.warn('<ds-landmark> needs a landmark role.', this);
      return;
    }
    if (NAME_REQUIRED.has(role) && !this.label) {
      console.warn(`<ds-landmark role="${role}"> is only a landmark when it has a label.`, this);
    }
    const root = this.getRootNode() as Document | ShadowRoot;
    const siblings = Array.from(root.querySelectorAll<DsLandmark>('ds-landmark')).filter(
      (candidate) => candidate !== this && candidate.landmark === role,
    );
    if (role === 'main' && siblings.length > 0) {
      console.warn('A document must have exactly one <ds-landmark role="main">.', this);
    }
    if (
      DISTINCT_BY_LABEL.has(role) &&
      siblings.some((candidate) => !candidate.label || !this.label || candidate.label === this.label)
    ) {
      console.warn(
        `Two <ds-landmark role="${role}"> elements share a label or lack one; give each a distinct label.`,
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
