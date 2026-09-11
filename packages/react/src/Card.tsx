import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Heading, type HeadingLevel } from './Heading';
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
  | 'hoverBackground'
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
  hoverBackground: '--ds-card-hover-background',
  transition: '--ds-card-transition',
};

function overridesToStyle(overrides: Partial<Record<CardOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as CardOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

export interface CardProps extends Omit<ComponentPropsWithoutRef<'article'>, 'children' | 'aria-labelledby'> {
  /** The body. Usually a Stack of Text and controls. */
  children: ReactNode;
  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content. */
  heading?: string | undefined;
  /** Heading level for `heading`, so cards fit the page outline. Cards in a list share a level. */
  headingLevel?: CardHeadingLevel | undefined;
  /** Controls at the end of the header row — a ghost icon-only Button, a Link. At most two. */
  headerActions?: ReactNode;
  /** The action row. Buttons in a horizontal Stack, primary first, following Form's action-order rule. */
  footer?: ReactNode;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one interactive child (a Link
   * or Button) whose action the card extends to its full area; the card itself is not focusable.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes tabindex=-1 so a container (Feed) can move focus to it by script, and
   * draws its own focus ring when focused that way. Not a tab stop; not for making cards
   * clickable (`interactive`).
   */
  focusable?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Card — Design Schema, category: container.
 *
 * When to use:
 * Use Cards for collections of like items where each needs its own boundary, and for a single
 * panel that groups a heading, content and actions. Give the card a `heading` when it is a unit in
 * a list (the heading is what a screen reader jumps to) and set `headingLevel` to fit the page.
 * Use `interactive` when the entire card leads somewhere and it contains exactly one Link or Button.
 */
export const Card = function Card({
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
  className,
  style,
  ...rest
}: CardProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const generatedId = useId();
  const headingId = heading ? `ds-card${generatedId}-heading` : undefined;

  if (isDev && interactive && (!isValidElement(children) || Children.count(children) !== 1)) {
    console.warn('Card: `interactive` requires exactly one interactive child (a Link or Button).');
  }

  const Tag = (heading ? 'article' : 'div') as ElementType;

  const classes = [
    'ds-card',
    `ds-card--inset-${inset}`,
    `ds-card--surface-${surface}`,
    interactive ? 'ds-card--interactive' : null,
    focusable ? 'ds-card--focusable' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const showHeader = Boolean(heading) || headerActions !== undefined;
  const showFooter = footer !== undefined;

  // Interactive: the single child link/button gets a class that grows its own ::after to cover
  // the card, so the hit area extends without adding a focus stop of the card's own.
  const body =
    interactive && isValidElement<{ className?: string | undefined }>(children)
      ? cloneElement(children, {
          className: ['ds-card__interactive-target', children.props.className].filter(Boolean).join(' '),
        })
      : children;

  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLElement>}
      data-ds="Card"
      data-part="surface"
      className={classes}
      style={mergedStyle}
      aria-labelledby={headingId}
      tabIndex={focusable ? -1 : undefined}
    >
      {showHeader ? (
        <div className="ds-card__header" data-part="header">
          {heading ? (
            <Heading level={headingLevel as HeadingLevel} id={headingId} className="ds-card__heading">
              {heading}
            </Heading>
          ) : null}
          {headerActions !== undefined ? (
            <div className="ds-card__header-actions" data-part="headerActions">
              {headerActions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="ds-card__body" data-part="body">
        {body}
      </div>
      {showFooter ? (
        <div className="ds-card__footer" data-part="footer">
          {footer}
        </div>
      ) : null}
    </Tag>
  );
};
