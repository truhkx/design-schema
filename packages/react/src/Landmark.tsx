import {
  createElement,
  useEffect,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import './Landmark.css';

/** Which landmark this is. */
export type LandmarkRole =
  | 'banner'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'region'
  | 'search'
  | 'form';

/** Web element override. */
export type LandmarkElement = 'header' | 'nav' | 'main' | 'aside' | 'footer' | 'section' | 'form' | 'div';

export interface LandmarkProps
  extends Omit<HTMLAttributes<HTMLElement>, 'role' | 'children' | 'aria-label' | 'className' | 'style'> {
  /**
   * Which landmark this is. `banner` (site header), `navigation`, `main` (exactly one per page),
   * `complementary` (sidebar), `contentinfo` (site footer), `region` (a labelled section that
   * deserves a jump point), `search`, `form` (a labelled form that is a page-level region).
   */
  role: LandmarkRole;
  /**
   * Accessible name. Required for `region` and `form`, and whenever the page has more than one
   * landmark of the same role (two navigations: "Main" and "Footer"). Not shown visually. An empty
   * string counts as absent. `banner`, `main` and `contentinfo` never take a label: one passed to
   * them is not rendered and a development warning says so.
   */
  label?: string | undefined;
  /** The region's content. */
  children: ReactNode;
  /**
   * Web element override. By default the element is chosen from `role`; set this only when the
   * native element would be wrong, e.g. a `banner` that is not the page header.
   */
  as?: LandmarkElement | undefined;
}

declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev: boolean = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const COPY = {
  missingLabel: 'Landmark: role "{role}" is only a landmark when it has a label.',
  labelNotTaken: 'Landmark: role "{role}" does not take a label; it was not rendered.',
} as const;

/** The element each role renders when `as` is not set. */
const DEFAULT_ELEMENT: Record<LandmarkRole, LandmarkElement> = {
  banner: 'header',
  navigation: 'nav',
  main: 'main',
  complementary: 'aside',
  contentinfo: 'footer',
  region: 'section',
  search: 'form',
  form: 'form',
};

/** The landmark role an element implies without an explicit `role`. */
const IMPLIED_ROLE: Partial<Record<LandmarkElement, LandmarkRole>> = {
  header: 'banner',
  nav: 'navigation',
  main: 'main',
  aside: 'complementary',
  footer: 'contentinfo',
  section: 'region',
  form: 'form',
};

/** Roles that never take a label. */
const UNLABELLED_ROLES: ReadonlySet<LandmarkRole> = new Set<LandmarkRole>(['banner', 'main', 'contentinfo']);

/** Roles whose duplicates must be told apart by label. */
const DISTINGUISHED_ROLES: ReadonlySet<LandmarkRole> = new Set<LandmarkRole>([
  'navigation',
  'complementary',
  'region',
  'form',
]);

/** The role a rendered Landmark carries, read back from the DOM. */
function roleOf(el: Element): string | undefined {
  return el.getAttribute('role') ?? IMPLIED_ROLE[el.tagName.toLowerCase() as LandmarkElement];
}

/** The name a rendered Landmark carries: `aria-label`, else the text `aria-labelledby` points at. */
function nameOf(el: Element, root: Document | ShadowRoot): string | null {
  const label = el.getAttribute('aria-label');
  if (label) return label;
  const ids = el.getAttribute('aria-labelledby');
  if (!ids) return null;
  const text = ids
    .split(/\s+/)
    .map((id) => root.getElementById?.(id)?.textContent?.trim() ?? '')
    .join(' ')
    .trim();
  return text || null;
}

/** Development warnings from the guidance; only the later duplicate warns, so each pair warns once. */
function warn(node: HTMLElement, role: LandmarkRole, labelDropped: boolean): void {
  if (labelDropped) console.warn(COPY.labelNotTaken.replace('{role}', role));
  const root = node.getRootNode() as Document | ShadowRoot;
  if (typeof root.querySelectorAll !== 'function') return;
  const own = nameOf(node, root);
  if ((role === 'region' || role === 'form') && own === null) {
    console.warn(COPY.missingLabel.replace('{role}', role));
  }
  if (role !== 'main' && !DISTINGUISHED_ROLES.has(role)) return;
  const earlier = Array.from(root.querySelectorAll('[data-ds="Landmark"]')).filter(
    (other) =>
      other !== node &&
      roleOf(other) === role &&
      (other.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
  );
  if (role === 'main') {
    if (earlier.length > 0) console.warn('Landmark: a document should contain exactly one "main" landmark.');
    return;
  }
  if (earlier.some((other) => nameOf(other, root) === own)) {
    console.warn(
      own === null
        ? `Landmark: two "${role}" landmarks in the same root both lack a label; give each a distinct label.`
        : `Landmark: two "${role}" landmarks in the same root share the label "${own}"; give each a distinct label.`,
    );
  }
}

/**
 * Landmark — Design Schema, category: layout. Renders its children inside the element and role
 * of one ARIA landmark, and nothing else: no padding, background or layout.
 *
 * When to use:
 * Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for
 * the primary content, `navigation` for each navigation block (labelled when there is more than
 * one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site
 * footer, `search` around the site search form, and `region` for any other section a user might
 * want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly
 * one `main`.
 */
export function Landmark({
  ref,
  role,
  label,
  children,
  as,
  ...rest
}: LandmarkProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const nodeRef = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => nodeRef.current!, []);

  const tagName: LandmarkElement = as ?? DEFAULT_ELEMENT[role];
  // Explicit role on header/footer (they lose the landmark role inside sectioning content), when
  // `as` overrides the default element, and wherever the element does not imply the role
  // (<form role="search">).
  const explicitRole =
    tagName === 'header' ||
    tagName === 'footer' ||
    (as !== undefined && as !== DEFAULT_ELEMENT[role]) ||
    IMPLIED_ROLE[tagName] !== role;
  // An empty string counts as absent; banner, main and contentinfo never render a label.
  const hasLabel = label !== undefined && label !== '';
  const labelDropped = hasLabel && UNLABELLED_ROLES.has(role);
  const ariaLabel = hasLabel && !labelDropped ? label : undefined;
  const labelledBy = rest['aria-labelledby'];

  // Fires when the combination appears or changes, not on every render.
  useEffect(() => {
    if (!isDev || !nodeRef.current) return;
    warn(nodeRef.current, role, labelDropped);
  }, [role, ariaLabel, labelDropped, labelledBy, tagName]);

  // createElement typed on HTMLElement: JSX over a union of tags would demand a ref that fits
  // every element type at once.
  return createElement<HTMLAttributes<HTMLElement> & { 'data-ds': string }, HTMLElement>(
    tagName,
    {
      ...rest,
      ref: nodeRef,
      className: 'ds-landmark',
      'data-ds': 'Landmark',
      role: explicitRole ? role : undefined,
      'aria-label': ariaLabel,
    },
    children,
  );
}
