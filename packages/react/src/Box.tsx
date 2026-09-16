import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Box.css';

export type BoxInset = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BoxSurface = 'none' | 'default' | 'subtle' | 'strong';
export type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type BoxElement = 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings are never in
 * this list. `background` is locked: the surface colours are the pairs the contrast gate checks.
 */
export type BoxOverridableBinding = 'paddingBlock' | 'paddingInline' | 'border' | 'borderWidth' | 'radius';

const OVERRIDE_HOOK: Record<BoxOverridableBinding, string> = {
  paddingBlock: '--ds-box-padding-block',
  paddingInline: '--ds-box-padding-inline',
  border: '--ds-box-border',
  borderWidth: '--ds-box-border-width',
  radius: '--ds-box-radius',
};

function overridesToStyle(overrides: Partial<Record<BoxOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as BoxOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    // A locked binding passed at runtime has no hook here and is ignored.
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface BoxProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Any content. Box does not space its children; put a Stack inside for that. */
  children: ReactNode;
  /** Padding on all sides, from the layout inset presets. Use `insetBlock`/`insetInline` when the axes differ. */
  inset?: BoxInset | undefined;
  /** Vertical padding, overriding `inset` on that axis. Defaults to `inset`. */
  insetBlock?: BoxInset | undefined;
  /** Horizontal padding, overriding `inset` on that axis. Defaults to `inset`. */
  insetInline?: BoxInset | undefined;
  /** Background. `none` is transparent; `default` is the page background (use to lift content off a subtle parent); `subtle` and `strong` step up. */
  surface?: BoxSurface | undefined;
  /** A thin default border. */
  border?: boolean | undefined;
  /** Corner radius from the theme's presets. */
  radius?: BoxRadius | undefined;
  /** Element to render. Sectioning elements only when the box is a semantic region; prefer Landmark for page regions. */
  element?: BoxElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
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
 *
 * Box adds no role of its own; when `element` is a sectioning element the native element carries
 * the semantics (`nav` → navigation, `article` → article). It never carries margin.
 */
export const Box = function Box({
  ref,
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
}: BoxProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const Tag = element as ElementType;

  const classes = [
    'ds-box',
    `ds-box--inset-${inset}`,
    insetBlock ? `ds-box--inset-block-${insetBlock}` : null,
    insetInline ? `ds-box--inset-inline-${insetInline}` : null,
    surface !== 'none' ? `ds-box--surface-${surface}` : null,
    border ? 'ds-box--border' : null,
    radius !== 'none' ? `ds-box--radius-${radius}` : null,
    // Composing components (Popover, BottomSheet) pass a layout-only class for their own body
    // part; they never restyle the box itself, which stays on the token hooks in Box.css.
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    // `data-part` precedes the spread so a composing parent can name the part it is standing in for.
    <Tag data-part="surface" {...rest} ref={ref as Ref<HTMLElement>} data-ds="Box" className={classes} style={mergedStyle}>
      {children}
    </Tag>
  );
};
