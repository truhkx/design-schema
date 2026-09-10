import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Box.css';

export type BoxInset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxSurface = 'none' | 'default' | 'subtle' | 'strong';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type BoxElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type BoxOverridableBinding = 'paddingBlock' | 'paddingInline' | 'background' | 'border' | 'borderWidth' | 'radius';

const OVERRIDE_HOOK: Record<BoxOverridableBinding, string> = {
  paddingBlock: '--ds-box-padding-block',
  paddingInline: '--ds-box-padding-inline',
  background: '--ds-box-background',
  border: '--ds-box-border',
  borderWidth: '--ds-box-border-width',
  radius: '--ds-box-radius',
};

function overridesToStyle(overrides: Partial<Record<BoxOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as BoxOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface BoxProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset;
  /** Vertical padding, overriding `inset` on that axis. */
  insetBlock?: BoxInset;
  /** Horizontal padding, overriding `inset` on that axis. */
  insetInline?: BoxInset;
  /** Background. `none` is transparent; `default` is the page background (use to lift content off a subtle parent); `subtle` and `strong` step up. */
  surface?: BoxSurface;
  /** A thin default border. */
  border?: boolean;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius;
  /** Element to render. Sectioning elements only when the box is a semantic region; prefer Landmark for page regions. */
  element?: BoxElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef>>;
}

/**
 * Box — Design Schema, category: layout.
 *
 * When to use:
 * Use a Box to give a region of a layout a background or padding: a sidebar panel, a highlighted
 * row, a footer band, the inside of a modal. Use it when a Card is too much (a Card is a Box with
 * conventions about elevation and content). Choose `inset` by role — `sm` for dense rows, `md`
 * for most panels, `lg` for page-level containers, `xl` for hero bands — and let the theme's
 * rhythm decide the numbers.
 */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  {
    children,
    inset = 'none',
    insetBlock,
    insetInline,
    surface = 'none',
    border = false,
    radius = 'none',
    element = 'div',
    overrides,
    className,
    style,
    ...rest
  },
  ref,
) {
  const Tag = element as ElementType;

  const classes = [
    'ds-box',
    `ds-box--inset-${inset}`,
    insetBlock ? `ds-box--inset-block-${insetBlock}` : null,
    insetInline ? `ds-box--inset-inline-${insetInline}` : null,
    surface !== 'none' ? `ds-box--surface-${surface}` : null,
    border ? 'ds-box--border' : null,
    radius !== 'none' ? `ds-box--radius-${radius}` : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement>} data-ds="Box" className={classes} style={mergedStyle}>
      {children}
    </Tag>
  );
});
