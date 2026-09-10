import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Container.css';

export type ContainerWidth = 'prose' | 'content' | 'page' | 'full';
export type ContainerGutter = 'narrow' | 'default' | 'wide' | 'none';
export type ContainerAlign = 'center' | 'start';
export type ContainerElement = 'div' | 'main' | 'section';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type ContainerOverridableBinding = 'maxWidth' | 'paddingInline';

const OVERRIDE_HOOK: Record<ContainerOverridableBinding, string> = {
  maxWidth: '--ds-container-max-width',
  paddingInline: '--ds-container-padding-inline',
};

function overridesToStyle(overrides: Partial<Record<ContainerOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ContainerOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface ContainerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The page or region content, usually a Stack with `gap: section` between regions. */
  children: ReactNode;
  /** `prose` for reading (a 65-character measure), `content` for most screens, `page` for full-bleed
   * layouts with wide grids, `full` for no cap (gutters only). */
  width?: ContainerWidth;
  /** Horizontal padding at the viewport edge. Responsive: `default` uses the narrow gutter under the
   * content width and the wide gutter above the page width. `none` for a nested container inside a
   * padded parent. */
  gutter?: ContainerGutter;
  /** Where the capped column sits in a wider viewport. */
  align?: ContainerAlign;
  /** Use `main` for the page's main column when no Landmark wraps it. */
  element?: ContainerElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ContainerOverridableBinding, TokenRef>>;
}

/**
 * Container — Design Schema, category: layout.
 *
 * When to use:
 * Wrap every page's content in one Container, inside the `main` Landmark, with `width: content` for
 * application screens and `width: prose` for reading. Use `page` for layouts with wide data grids or
 * side-by-side panels, and `full` only for edge-to-edge sections (a hero, a map) that manage their own
 * inner Container. Nest a `gutter: none` Container inside a padded parent when a section needs a
 * narrower measure than the page.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  {
    children,
    width = 'content',
    gutter = 'default',
    align = 'center',
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
    'ds-container',
    `ds-container--width-${width}`,
    `ds-container--gutter-${gutter}`,
    `ds-container--align-${align}`,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement>} data-ds="Container" className={classes} style={mergedStyle}>
      {children}
    </Tag>
  );
});
