import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode, type Ref } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.css';

/** Position in the document outline. Accepts the schema's string values and their numeric equivalents. */
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6' | 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';
export type HeadingAlign = 'start' | 'center' | 'end';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type HeadingOverridableBinding = 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'marginBlockEnd';

const OVERRIDE_HOOK: Record<HeadingOverridableBinding, string> = {
  fontFamily: '--ds-heading-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontWeight: '--ds-heading-font-weight',
  fontSize: '--ds-heading-font-size',
  lineHeight: '--ds-heading-line-height',
  marginBlockEnd: '--ds-heading-margin-block-end',
};

function overridesToStyle(overrides: Partial<Record<HeadingOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as HeadingOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface HeadingProps extends Omit<ComponentPropsWithoutRef<'h1'>, 'children'> {
  /** Position in the document outline. Controls the semantic element, not the visual size. */
  level: HeadingLevel;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  size?: HeadingSize;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: ReactNode;
  /** Horizontal text alignment. */
  align?: HeadingAlign;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef>>;
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
  { level, size, children, align = 'start', overrides, className, style, ...rest },
  ref,
) {
  const key = String(level) as keyof typeof ELEMENT_BY_LEVEL;
  const Tag: ElementType = ELEMENT_BY_LEVEL[key];
  const resolvedSize = size ?? SIZE_BY_LEVEL[key];

  const classes = ['ds-heading', `ds-heading--size-${resolvedSize}`, `ds-heading--align-${align}`, className ?? null]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <Tag {...rest} ref={ref as Ref<HTMLHeadingElement>} data-ds="Heading" className={classes} style={mergedStyle}>
      {children}
    </Tag>
  );
});
