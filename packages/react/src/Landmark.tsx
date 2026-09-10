import { createElement, forwardRef, useEffect, type HTMLAttributes, type ReactNode } from 'react';
import './Landmark.css';

export type LandmarkRole =
  | 'banner'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'region'
  | 'search'
  | 'form';
export type LandmarkElement = 'header' | 'nav' | 'main' | 'aside' | 'footer' | 'section' | 'form' | 'div';

export interface LandmarkProps extends Omit<HTMLAttributes<HTMLElement>, 'role' | 'children' | 'aria-label'> {
  /** Which landmark this is. `main` exactly once per page; `region` and `form` only with a `label`. */
  role: LandmarkRole;
  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Not shown visually. */
  label?: string;
  /** The region's content. */
  children: ReactNode;
  /** Web element override. Set this only when the native element would be wrong, e.g. a `banner` that is not the page header. */
  as?: LandmarkElement;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** Native elements carry the roles; `search` is <form role="search"> (never branch on `document` at render). */
function defaultElement(role: LandmarkRole): LandmarkElement {
  switch (role) {
    case 'banner':
      return 'header';
    case 'navigation':
      return 'nav';
    case 'main':
      return 'main';
    case 'complementary':
      return 'aside';
    case 'contentinfo':
      return 'footer';
    case 'region':
      return 'section';
    case 'search':
      return 'form';
    case 'form':
      return 'form';
  }
}

/** The roles these elements imply on their own, when not nested in sectioning content. */
const IMPLIED_ROLE: Partial<Record<LandmarkElement, LandmarkRole>> = {
  header: 'banner',
  nav: 'navigation',
  main: 'main',
  aside: 'complementary',
  footer: 'contentinfo',
  section: 'region',
  form: 'form',
};

/** Roles that take labels and must not be duplicated without distinct ones. */
const LABELLED_ROLES: ReadonlySet<LandmarkRole> = new Set(['navigation', 'complementary', 'region', 'form']);

/** Development-only bookkeeping for the warnings in the guidance. */
const registry = new Map<LandmarkRole, Map<string | undefined, number>>();

/**
 * Landmark — Design Schema, category: layout.
 *
 * When to use:
 * Wrap the page's major regions in a Landmark: one `banner` for the site header, one `main` for
 * the primary content, `navigation` for each navigation block (labelled when there is more than
 * one), `complementary` for sidebars that make sense on their own, `contentinfo` for the site
 * footer, `search` around the site search form, and `region` for any other section a user might
 * want to jump to — a "Related articles" block, a dashboard panel. Every page should have exactly
 * one `main`.
 */
export const Landmark = forwardRef<HTMLElement, LandmarkProps>(function Landmark(
  { role, label, children, as, className, ...rest },
  ref,
) {
  const tagName: LandmarkElement = as ?? defaultElement(role);

  // Add the explicit role when `as` overrides the element, when the element does not imply it
  // (<form role="search">), and always on header/footer, which lose the landmark role inside
  // sectioning content (an explicit role there is harmless and cannot be detected at render).
  const needsExplicitRole = IMPLIED_ROLE[tagName] !== role || tagName === 'header' || tagName === 'footer';

  useEffect(() => {
    if (!isDev) return undefined;
    if ((role === 'region' || role === 'form') && !label) {
      console.warn(`Landmark: a "${role}" landmark needs a label; without one it is not exposed as a landmark.`);
    }
    const labels = registry.get(role) ?? new Map<string | undefined, number>();
    labels.set(label, (labels.get(label) ?? 0) + 1);
    registry.set(role, labels);
    const total = Array.from(labels.values()).reduce((sum, count) => sum + count, 0);
    if (role === 'main' && total > 1) {
      console.warn('Landmark: a document should contain exactly one "main" landmark.');
    } else if (LABELLED_ROLES.has(role) && (labels.get(label) ?? 0) > 1) {
      console.warn(
        `Landmark: two "${role}" landmarks in the same document ${label === undefined ? 'both lack a label' : `share the label "${label}"`}; give each a distinct label.`,
      );
    }
    return () => {
      const count = labels.get(label) ?? 0;
      if (count <= 1) labels.delete(label);
      else labels.set(label, count - 1);
    };
  }, [role, label]);

  const classes = ['ds-landmark', className ?? null].filter(Boolean).join(' ');

  // createElement with an explicit HTMLElement type: JSX on a union of tag names would demand a
  // ref that satisfies every element type at once (HTMLElement & HTMLDivElement & HTMLFormElement).
  return createElement<HTMLAttributes<HTMLElement>, HTMLElement>(
    tagName,
    {
      ...rest,
      ref,
      className: classes,
      role: needsExplicitRole ? role : undefined,
      'aria-label': label,
    },
    children,
  );
});
