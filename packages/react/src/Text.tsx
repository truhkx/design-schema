import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import './Text.css';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';
export type TextElement = 'p' | 'span' | 'label' | 'legend';

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
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
  /** Clip to one line with an ellipsis. The full text must remain available (title or tooltip) when truncated. */
  truncate?: boolean;
  /** The HTML element to render. Choose by meaning, not by layout — `span` for inline, `label` only when associated with a control. */
  element?: TextElement;
  /** Only meaningful with `element="label"`: id of the control the label names. */
  htmlFor?: string;
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
    title,
    className,
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

  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement>} className={classes} title={resolvedTitle}>
      {children}
    </Tag>
  );
});
