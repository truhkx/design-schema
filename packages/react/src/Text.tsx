import { forwardRef, type ComponentPropsWithoutRef, type CSSProperties, type ElementType, type ReactNode, type Ref } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.css';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';
export type TextElement = 'p' | 'span';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type TextOverridableBinding = 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'color';

const OVERRIDE_HOOK: Record<TextOverridableBinding, string> = {
  fontFamily: '--ds-text-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-text-font-size',
  fontWeight: '--ds-text-font-weight',
  lineHeight: '--ds-text-line-height',
  color: '--ds-text-color',
};

function overridesToStyle(overrides: Partial<Record<TextOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TextOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface TextProps extends Omit<ComponentPropsWithoutRef<'p'>, 'children'> {
  /** The text content. Inline formatting (emphasis, links) is allowed; block elements are not. */
  children: ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight;
  /** Semantic color. `onAction` is only for text placed on an action background. */
  tone?: TextTone;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign;
  /** Clip to one line with an ellipsis. On web the full text is exposed via `title` when children is a plain string; otherwise the consumer passes `title`. */
  truncate?: boolean;
  /** The HTML element to render — `p` for a block, `span` for inline. */
  element?: TextElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef>>;
}

/** tone → color.foreground.{tone}; `default` is the bare `color.foreground` token. */
const TONE_CLASS: Record<TextTone, string> = {
  default: 'ds-text--tone-default',
  strong: 'ds-text--tone-strong',
  muted: 'ds-text--tone-muted',
  danger: 'ds-text--tone-danger',
  onAction: 'ds-text--tone-on-action',
};

/**
 * Text — Design Schema, category: typography.
 *
 * When to use:
 * Use Text for paragraphs, labels, captions, helper text, and any inline copy. Pick `size` from
 * the scale rather than styling a raw element, and use `tone` for meaning: `muted` for secondary
 * information, `danger` for errors, `strong` when a phrase must stand out from surrounding body
 * copy. Use `weight` to create hierarchy inside a size; it is calmer than jumping sizes.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    children,
    size = 'md',
    weight = 'regular',
    tone = 'default',
    align = 'start',
    truncate = false,
    element = 'p',
    overrides,
    title,
    className,
    style,
    ...rest
  },
  ref,
) {
  const Tag = element as ElementType;
  // When truncated the full text must remain reachable: expose it as `title`.
  const resolvedTitle = title ?? (truncate && typeof children === 'string' ? children : undefined);

  const classes = [
    'ds-text',
    `ds-text--size-${size}`,
    `ds-text--weight-${weight}`,
    TONE_CLASS[tone],
    `ds-text--align-${align}`,
    truncate ? 'ds-text--truncate' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement>} data-ds="Text" className={classes} style={mergedStyle} title={resolvedTitle}>
      {children}
    </Tag>
  );
});
