import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
} from 'react';
import { Link } from './Link';
import { Button } from './Button';
import './Breadcrumb.css';

export type BreadcrumbItem = { label: string; href?: string };

/** copy.separator — drawn by CSS so it is not in the accessibility tree. */
const SEPARATOR = '/';
/** copy.expandLabel */
const EXPAND_LABEL = 'Show all pages';
/** With `collapse`, trails longer than this show the first item, an ellipsis, and the last two. */
const COLLAPSE_ABOVE = 4;

export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'aria-label'> {
  /** The trail from root to current page, in order. An ancestor without `href` renders as plain text; the last is the current page. */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string;
  /** When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis reveals the rest. */
  collapse?: boolean;
  /** Fired when a non-current item is activated, with the item, its index and the click event; call `event.preventDefault()` to route client-side. */
  onNavigate?: (item: BreadcrumbItem, index: number, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Breadcrumb — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
 * catalogues, settings sub-pages, file browsers — where the user benefits from seeing the
 * ancestors and jumping to any of them. Place it above the page title, at the top of `main`.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, label = 'Breadcrumb', collapse = true, onNavigate, className, style, ...rest },
  ref,
) {
  const [expanded, setExpanded] = useState(false);
  const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
  const linkRefs = useRef(new Map<number, HTMLAnchorElement>());

  // After the ellipsis is activated, focus moves to the first revealed link.
  const revealedIndex = useRef<number | null>(null);
  useEffect(() => {
    if (revealedIndex.current !== null) {
      linkRefs.current.get(revealedIndex.current)?.focus();
      revealedIndex.current = null;
    }
  }, [expanded]);

  const handleExpand = () => {
    revealedIndex.current = 1;
    setExpanded(true);
  };

  const setLinkRef = (index: number) => (el: HTMLAnchorElement | null) => {
    if (el) linkRefs.current.set(index, el);
    else linkRefs.current.delete(index);
  };

  const lastIndex = items.length - 1;
  const hiddenStart = 1;
  const hiddenEnd = items.length - 2; // exclusive

  const renderItem = (item: BreadcrumbItem, index: number) => {
    if (index === lastIndex) {
      return (
        <li key={index} className="ds-breadcrumb__item">
          <span className="ds-breadcrumb__current" aria-current="page">
            {item.label}
          </span>
        </li>
      );
    }
    if (item.href === undefined) {
      // An ancestor without a destination is not rendered as a link (an empty href is a placeholder, not a link).
      return (
        <li key={index} className="ds-breadcrumb__item">
          <span className="ds-breadcrumb__text">{item.label}</span>
        </li>
      );
    }
    return (
      <li key={index} className="ds-breadcrumb__item">
        <Link
          ref={setLinkRef(index)}
          href={item.href}
          label={item.label}
          tone="default"
          onClick={(event) => onNavigate?.(item, index, event)}
        />
      </li>
    );
  };

  const list = collapsed
    ? [
        ...items.slice(0, hiddenStart).map(renderItem),
        <li key="ellipsis" className="ds-breadcrumb__item">
          <Button
            className="ds-breadcrumb__expand"
            variant="ghost"
            size="sm"
            iconOnly
            label={EXPAND_LABEL}
            onClick={handleExpand}
            leadingIcon={
              <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="3" cy="8" r="1.25" />
                <circle cx="8" cy="8" r="1.25" />
                <circle cx="13" cy="8" r="1.25" />
              </svg>
            }
          />
        </li>,
        ...items.slice(hiddenEnd).map((item, offset) => renderItem(item, hiddenEnd + offset)),
      ]
    : items.map(renderItem);

  const classes = ['ds-breadcrumb', className ?? null].filter(Boolean).join(' ');
  const separatorStyle = { ...style, '--ds-breadcrumb-separator': `'${SEPARATOR}'` } as CSSProperties;

  return (
    <nav {...rest} ref={ref} className={classes} style={separatorStyle} aria-label={label}>
      <ol className="ds-breadcrumb__list">{list}</ol>
    </nav>
  );
});
