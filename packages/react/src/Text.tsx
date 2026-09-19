import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode, Ref, ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.css';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';
export type TextElement = 'p' | 'span';

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `color` is locked: every tone is contrast-checked against the page background, so it
 * is not overridable and is ignored if passed.
 */
export type TextOverridableBinding = 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight';

const OVERRIDE_HOOK: Record<TextOverridableBinding, string> = {
  fontFamily: '--ds-text-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-text-font-size',
  fontWeight: '--ds-text-font-weight',
  lineHeight: '--ds-text-line-height',
};

function overridesToStyle(overrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TextOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface TextProps extends Omit<ComponentPropsWithoutRef<'p'>, 'children'> {
  /** The text content. Inline formatting (emphasis, links) is allowed; block elements are not. */
  children: ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize | undefined;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight | undefined;
  /**
   * Semantic color. `onAction` is only for text placed on an action background, and its story paints
   * that background (color.action.primary.background) behind the Text. There is no `inverse` tone: the
   * shared foreground vocabulary has no such name, so an inverse surface re-scopes `--color-foreground`
   * on its own container, which the `default` tone resolves through.
   */
  tone?: TextTone | undefined;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /**
   * Clip to one line with an ellipsis. The full text is exposed via `title` when children is a plain
   * string; otherwise the consumer passes `title`. A consumer `title` always wins and is forwarded
   * unchanged, with or without `truncate`; `title={undefined}` counts as not passed. With `element: span` the clipped box is
   * `display: inline-block; max-inline-size: 100%`, so the width comes from the parent.
   */
  truncate?: boolean | undefined;
  /** The HTML element to render — `p` for a block, `span` for inline. Labels and legends are native elements rendered by Input and Fieldset, which own the association; Text never renders one. */
  element?: TextElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
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
export function Text({
  ref,
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
}: TextProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
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
    truncate && element === 'span' ? 'ds-text--truncate-inline' : null,
    // Composing components pass a layout-only class (`.ds-input__description { margin: 0 }`); they
    // never restyle Text's own typography, which stays on the token hooks below.
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
}
