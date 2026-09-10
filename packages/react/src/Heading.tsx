import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import './Heading.css';

/** Position in the document outline. Accepts the schema's string values and their numeric equivalents. */
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6' | 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';
export type HeadingAlign = 'start' | 'center' | 'end';

export interface HeadingProps extends Omit<ComponentPropsWithoutRef<'h1'>, 'children'> {
  /** Position in the document outline. Controls the semantic element, not the visual size. */
  level: HeadingLevel;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  size?: HeadingSize;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: ReactNode;
  /** Horizontal text alignment. */
  align?: HeadingAlign;
}

const ELEMENT_BY_LEVEL = {
  '1': 'h1',
  '2': 'h2',
  '3': 'h3',
  '4': 'h4',
  '5': 'h5',
  '6': 'h6',
} as const;

const SIZE_BY_LEVEL: Record<keyof typeof ELEMENT_BY_LEVEL, HeadingSize> = {
  '1': '4xl',
  '2': '3xl',
  '3': '2xl',
  '4': 'xl',
  '5': 'lg',
  '6': 'md',
};

/**
 * Heading — Design Schema, category: typography.
 *
 * When to use:
 * Use a Heading to title a page, a section, or a card that contains its own content. Choose
 * `level` from the document outline — the page title is `1`, its major sections are `2`, their
 * subsections `3` — and then choose `size` separately if the default visual size is wrong for the
 * layout. Decoupling level from size is the whole point of this component: it lets designers pick
 * the right look without breaking the outline.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level, size, children, align = 'start', className, ...rest },
  ref,
) {
  const key = String(level) as keyof typeof ELEMENT_BY_LEVEL;
  const Tag: ElementType = ELEMENT_BY_LEVEL[key];
  const resolvedSize = size ?? SIZE_BY_LEVEL[key];

  const classes = ['ds-heading', `ds-heading--size-${resolvedSize}`, `ds-heading--align-${align}`, className ?? null]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag {...rest} ref={ref} className={classes}>
      {children}
    </Tag>
  );
});
