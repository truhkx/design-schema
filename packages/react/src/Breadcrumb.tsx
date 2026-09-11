import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Link } from './Link';
import { Button } from './Button';
import { Icon } from './Icon';
import './Breadcrumb.css';

export type BreadcrumbItem = { label: string; href?: string | undefined };

/** copy.separator — drawn by CSS so it is not in the accessibility tree. */
const SEPARATOR = '/';
/** copy.expandLabel */
const EXPAND_LABEL = 'Show all pages';
/** With `collapse`, trails longer than this show the first item, an ellipsis, and the last two. */
const COLLAPSE_ABOVE = 4;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type BreadcrumbOverridableBinding = 'gap' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight';

const OVERRIDE_HOOK: Record<BreadcrumbOverridableBinding, string> = {
  gap: '--ds-breadcrumb-gap',
  fontFamily: '--ds-breadcrumb-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-breadcrumb-font-size',
  fontWeight: '--ds-breadcrumb-font-weight',
  lineHeight: '--ds-breadcrumb-line-height',
};

function overridesToStyle(overrides: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as BreadcrumbOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'aria-label'> {
  /** The trail from root to current page, in order. An ancestor without `href` renders as plain text; the last is the current page. */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /** When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis reveals the rest. */
  collapse?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a non-current item is activated, with the item, its index and the click event; call `event.preventDefault()` to route client-side. */
  onNavigate?: ((item: BreadcrumbItem, index: number, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/**
 * Breadcrumb — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
 * catalogues, settings sub-pages, file browsers — where the user benefits from seeing the
 * ancestors and jumping to any of them. Place it above the page title, at the top of `main`.
 */
export const Breadcrumb = function Breadcrumb({ ref, items, label = 'Breadcrumb', collapse = true, overrides, onNavigate, className, style, ...rest }: BreadcrumbProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
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
        <li key={index} className="ds-breadcrumb__item" data-part="item">
          <span className="ds-breadcrumb__current" data-part="current" aria-current="page">
            {item.label}
          </span>
        </li>
      );
    }
    if (item.href === undefined) {
      // An ancestor without a destination is not rendered as a link (an empty href is a placeholder, not a link).
      return (
        <li key={index} className="ds-breadcrumb__item" data-part="item">
          <span className="ds-breadcrumb__text">{item.label}</span>
        </li>
      );
    }
    return (
      <li key={index} className="ds-breadcrumb__item" data-part="item">
        <Link
          ref={setLinkRef(index)}
          href={item.href}
          label={item.label}
          tone="default"
          data-part="link"
          onClick={(event) => onNavigate?.(item, index, event)}
        />
      </li>
    );
  };

  const list = collapsed
    ? [
        ...items.slice(0, hiddenStart).map(renderItem),
        <li key="ellipsis" className="ds-breadcrumb__item" data-part="item">
          <Button
            className="ds-breadcrumb__expand"
            variant="ghost"
            size="sm"
            iconOnly
            label={EXPAND_LABEL}
            onClick={handleExpand}
            leadingIcon={<Icon name="ellipsis" inline />}
          />
        </li>,
        ...items.slice(hiddenEnd).map((item, offset) => renderItem(item, hiddenEnd + offset)),
      ]
    : items.map(renderItem);

  const classes = ['ds-breadcrumb', className ?? null].filter(Boolean).join(' ');
  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = {
    ...overrideStyle,
    ...style,
    '--ds-breadcrumb-separator': `'${SEPARATOR}'`,
  } as CSSProperties;

  return (
    <nav {...rest} ref={ref} data-ds="Breadcrumb" data-part="nav" className={classes} style={mergedStyle} aria-label={label}>
      <ol className="ds-breadcrumb__list" data-part="list">
        {list}
      </ol>
    </nav>
  );
};
