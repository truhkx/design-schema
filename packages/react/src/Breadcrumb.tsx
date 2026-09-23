import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Link } from './Link';
import { Button } from './Button';
import { Icon } from './Icon';
import './Breadcrumb.css';

/** One step of the trail. `href` is ignored on the last item, which is the current page. */
export type BreadcrumbItem = { label: string; href?: string | undefined };

/**
 * Copy strings from the schema, used verbatim. `copy.current` is not rendered on web: the
 * current page carries `aria-current="page"`, which announces it.
 */
const COPY = {
  separator: '/',
  expandLabel: 'Show all pages',
  navLabel: 'Breadcrumb',
} as const;

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

function overridesToStyle(overrides: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>>): Record<string, string> {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(OVERRIDE_HOOK) as BreadcrumbOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style;
}

export interface BreadcrumbProps
  extends Omit<ComponentPropsWithoutRef<'nav'>, 'children' | 'aria-label' | 'className' | 'style'> {
  /**
   * The trail from root to current page, in order. Every item but the last needs an `href`; an
   * ancestor without one, or with an empty-string `href`, renders as plain text (never an empty link).
   * The last is the current page and its `href` is ignored. An empty array renders the named landmark
   * around an empty list; a single item renders only the current page.
   */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis
   * is a button that reveals the rest. The rule is literal: five items hide the second and third. Once
   * revealed the trail stays expanded for the life of the instance, even if `items` changes. Set false
   * for short trails that must always show in full.
   */
  collapse?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when a non-current item is activated, as `(item, index, event)`. The link still navigates
   * unless the handler returns `false` or calls `event.preventDefault()`.
   */
  onNavigate?:
    | ((item: BreadcrumbItem, index: number, event: MouseEvent<HTMLAnchorElement>) => void | boolean)
    | undefined;
}

/**
 * Breadcrumb — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Breadcrumb on pages that live three or more levels deep in a hierarchy — documentation,
 * catalogues, settings sub-pages, file browsers — where the user benefits from seeing the ancestors
 * and jumping to any of them. Place it above the page title, at the top of `main`.
 */
export function Breadcrumb({
  ref,
  items,
  label = COPY.navLabel,
  collapse = true,
  overrides,
  onNavigate,
  ...rest
}: BreadcrumbProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  // One-way: once revealed, the trail stays expanded for the life of the instance, even if `items` changes.
  const [expanded, setExpanded] = useState(false);
  // Set when no revealed item is a link: the first revealed `<li>` takes focus instead (tabindex -1).
  const [focusItemFallback, setFocusItemFallback] = useState(false);
  const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
  const lastIndex = items.length - 1;
  // Collapsed: items[0], the ellipsis, then items[hiddenEnd..].
  const hiddenEnd = items.length - 2;

  const linkRefs = useRef(new Map<number, HTMLAnchorElement>());
  const itemRefs = useRef(new Map<number, HTMLLIElement>());
  // The revealed range [1, end) captured when the ellipsis is activated; null once focus has moved.
  const revealedEnd = useRef<number | null>(null);

  // After the ellipsis is activated, focus moves to the first revealed link, or else the first revealed item.
  useEffect(() => {
    const end = revealedEnd.current;
    if (end === null) return;
    revealedEnd.current = null;
    for (let index = 1; index < end; index++) {
      const link = linkRefs.current.get(index);
      if (link) {
        link.focus();
        return;
      }
    }
    itemRefs.current.get(1)?.focus();
  }, [expanded, focusItemFallback]);

  const handleExpand = (): void => {
    revealedEnd.current = hiddenEnd;
    const hasRevealedLink = items.slice(1, hiddenEnd).some((item) => item.href !== undefined && item.href !== '');
    setFocusItemFallback(!hasRevealedLink);
    setExpanded(true);
  };

  const setLinkRef =
    (index: number) =>
    (el: HTMLAnchorElement | null): void => {
      if (el) linkRefs.current.set(index, el);
      else linkRefs.current.delete(index);
    };

  const setItemRef =
    (index: number) =>
    (el: HTMLLIElement | null): void => {
      if (el) itemRefs.current.set(index, el);
      else itemRefs.current.delete(index);
    };

  const renderItem = (item: BreadcrumbItem, index: number): ReactElement => {
    let content: ReactElement;
    if (index === lastIndex) {
      content = (
        <span className="ds-breadcrumb__current" data-part="current" aria-current="page">
          {item.label}
        </span>
      );
    } else if (item.href === undefined || item.href === '') {
      // A level with no page of its own is plain text inside `item` (no part, no class), never an empty link.
      content = <span>{item.label}</span>;
    } else {
      content = (
        <span className="ds-breadcrumb__link" data-part="link">
          <Link
            ref={setLinkRef(index)}
            href={item.href}
            label={item.label}
            tone="default"
            onClick={onNavigate ? (event) => onNavigate(item, index, event) : undefined}
          />
        </span>
      );
    }
    return (
      <li
        key={index}
        ref={setItemRef(index)}
        className="ds-breadcrumb__item"
        data-part="item"
        tabIndex={index === 1 && expanded && focusItemFallback ? -1 : undefined}
      >
        {content}
      </li>
    );
  };

  const first = items[0];
  const list: ReactElement[] =
    collapsed && first !== undefined
      ? [
          renderItem(first, 0),
          <li key="ellipsis" className="ds-breadcrumb__item" data-part="item">
            <span className="ds-breadcrumb__expand" data-part="expand">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                label={COPY.expandLabel}
                leadingIcon={<Icon name="ellipsis" inline />}
                onClick={handleExpand}
              />
            </span>
          </li>,
          ...items.slice(hiddenEnd).map((item, offset) => renderItem(item, hiddenEnd + offset)),
        ]
      : items.map(renderItem);

  const style = {
    ...(overrides ? overridesToStyle(overrides) : undefined),
    // copy.separator, quoted for `content`; read by `li + li::before`.
    '--ds-breadcrumb-separator': JSON.stringify(COPY.separator),
  } as CSSProperties;

  return (
    <nav
      {...rest}
      ref={ref}
      data-ds="Breadcrumb"
      data-part="nav"
      className="ds-breadcrumb"
      style={style}
      aria-label={label}
    >
      <ol className="ds-breadcrumb__list" data-part="list">
        {list}
      </ol>
    </nav>
  );
}
