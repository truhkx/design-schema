import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Heading, type HeadingLevel } from './Heading';
import { Button } from './Button';
import { Link } from './Link';
import { Text } from './Text';
import './Card.css';

/** Accepts the schema's string values and their numeric equivalents. */
export type CardHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;
export type CardInset = 'sm' | 'md' | 'lg';
export type CardSurface = 'default' | 'subtle';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CardOverridableBinding =
  | 'paddingBlock'
  | 'paddingInline'
  | 'partGap'
  | 'headerGap'
  | 'footerGap'
  | 'actionsGap'
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'transition';

const OVERRIDE_HOOK: Record<CardOverridableBinding, string> = {
  paddingBlock: '--ds-card-padding-block',
  paddingInline: '--ds-card-padding-inline',
  partGap: '--ds-card-part-gap',
  headerGap: '--ds-card-header-gap',
  footerGap: '--ds-card-footer-gap',
  actionsGap: '--ds-card-actions-gap',
  border: '--ds-card-border',
  borderWidth: '--ds-card-border-width',
  radius: '--ds-card-radius',
  transition: '--ds-card-transition',
};

function overridesToStyle(overrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as CardOverridableBinding[]) {
    // Locked bindings are not in the type; ignore them if they arrive anyway.
    if (!(binding in OVERRIDE_HOOK)) continue;
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export interface CardProps
  extends Omit<ComponentPropsWithoutRef<'article'>, 'children' | 'aria-labelledby' | 'className' | 'style'> {
  /**
   * The body. Usually a Stack of Text and controls; a plain string is rendered inside the system
   * Text (a bare string cannot sit in a native View).
   */
  children: ReactNode;
  /**
   * The card's title, rendered as the system Heading at the card's level and at `size: lg` on every
   * platform, so a card heading reads smaller than a page heading. Omit for cards that are a single
   * piece of content; an empty string counts as omitted (no article, no label).
   */
  heading?: string | undefined;
  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  headingLevel?: CardHeadingLevel | undefined;
  /**
   * Controls at the end of the header row — a ghost icon-only Button, a Link. At most two: a
   * content guideline, not a runtime check, as with every other soft content limit here.
   */
  headerActions?: ReactNode | undefined;
  /** The action row. Buttons in a row, primary first, following Form's action-order rule. */
  footer?: ReactNode | undefined;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one interactive child (a Link or
   * Button) whose action the card extends to its full area; the card itself is not focusable. The
   * child is looked for among the top-level children of the body only (a native a[href] or button
   * is accepted too); controls nested inside a wrapper such as a Stack are not searched. With zero
   * or several such children the card stays non-interactive and warns once in development. If the
   * child is disabled the card is disabled with it. Controls in `headerActions` and `footer` are
   * never the target; they sit above the hit area and keep their own targets.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes tabindex=-1 so a container (Feed) can move focus to it by script, and
   * draws its own focus ring when focused that way. Not a tab stop; not for making cards
   * clickable (`interactive`). With `interactive` also set, `interactive` wins and this is a
   * no-op — the card already has a target — and a development warning says so.
   */
  focusable?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Marks the one child an interactive card extends. Link and Button forward data attributes through
 * `...rest` but replace a passed className with their own, so the mark is an attribute.
 */
const TARGET_ATTRIBUTE = 'data-ds-card-target';

function isTarget(node: ReactNode): node is ReactElement<Record<string, unknown>> {
  if (!isValidElement<{ href?: unknown }>(node)) return false;
  const { type } = node;
  if (type === Link || type === Button || type === 'button') return true;
  return type === 'a' && node.props.href !== undefined;
}

/**
 * Card — Design Schema, category: container.
 *
 * When to use:
 * Use Cards for collections of like items where each needs its own boundary, and for a single panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page. Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.
 */
export function Card({
  ref,
  children,
  heading,
  headingLevel = '3',
  headerActions,
  footer,
  inset = 'md',
  surface = 'default',
  interactive = false,
  focusable = false,
  overrides,
  ...rest
}: CardProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const headingId = useId();
  const hasHeading = heading !== undefined && heading !== '';

  let body: ReactNode = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  let isInteractive = false;
  if (interactive) {
    // Top-level children of the body only; a Link inside a Stack is not searched.
    const items = Children.toArray(children);
    const targets = items.filter(isTarget);
    const target = targets.length === 1 ? targets[0]! : null;
    if (target !== null) {
      isInteractive = true;
      body = items.map((item) => (item === target ? cloneElement(target, { [TARGET_ATTRIBUTE]: '' }) : item));
    }
  }
  // `interactive` wins: the card already has a target, so it takes no scripted focus of its own.
  const isFocusable = focusable && !interactive;

  const warnedNoTarget = useRef(false);
  const warnedBoth = useRef(false);
  const warnNoTarget = isDev && interactive && !isInteractive;
  const warnBoth = isDev && interactive && focusable;
  useEffect(() => {
    if (warnNoTarget && !warnedNoTarget.current) {
      warnedNoTarget.current = true;
      console.warn(
        'Card: `interactive` requires exactly one Link or Button among the top-level children; the card stays non-interactive.',
      );
    }
  }, [warnNoTarget]);
  useEffect(() => {
    if (warnBoth && !warnedBoth.current) {
      warnedBoth.current = true;
      console.warn('Card: `focusable` has no effect with `interactive`; the child link or button is the target.');
    }
  }, [warnBoth]);

  const Tag: ElementType = hasHeading ? 'article' : 'div';

  const classes = [
    'ds-card',
    `ds-card--inset-${inset}`,
    `ds-card--surface-${surface}`,
    isInteractive ? 'ds-card--interactive' : null,
    isFocusable ? 'ds-card--focusable' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const hasHeaderActions = headerActions !== undefined && headerActions !== null && headerActions !== false;
  const hasFooter = footer !== undefined && footer !== null && footer !== false;

  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLDivElement> | undefined}
      data-ds="Card"
      data-part="surface"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      aria-labelledby={hasHeading ? headingId : undefined}
      tabIndex={isFocusable ? -1 : rest.tabIndex}
    >
      {hasHeading || hasHeaderActions ? (
        <div className="ds-card__header" data-part="header">
          {hasHeading ? (
            <Heading id={headingId} level={headingLevel as HeadingLevel} size="lg" overrides={{ marginBlockEnd: 'space.0' }}>
              {heading}
            </Heading>
          ) : null}
          {hasHeaderActions ? (
            <div className="ds-card__header-actions" data-part="headerActions">
              {headerActions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="ds-card__body" data-part="body">
        {body}
      </div>
      {hasFooter ? (
        <div className="ds-card__footer" data-part="footer">
          {footer}
        </div>
      ) : null}
    </Tag>
  );
}
