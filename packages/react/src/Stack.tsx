import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Stack.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = 'none' | 'tight' | 'normal' | 'loose' | 'section';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type StackOverridableBinding = 'gap';

const OVERRIDE_HOOK: Record<StackOverridableBinding, string> = {
  gap: '--ds-stack-gap',
};

function overridesToStyle(overrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as StackOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface StackProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Any components. Stack does not style its children; it only positions them. */
  children: ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection | undefined;
  /** Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing scale: tight
   * for related controls, normal for fields in a form, loose for groups, section between page sections.
   * The only way to set spacing between siblings. */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /** Main-axis distribution. */
  justify?: StackJustify | undefined;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean | undefined;
  /** Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`. */
  element?: StackElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Stack — Design Schema, category: layout.
 *
 * When to use:
 * Use Stack for any group of siblings that should be evenly spaced: form fields, a row of
 * buttons, a list of cards, label-plus-control pairs. Reach for it before writing any layout CSS.
 * Choose `element` when the group has meaning — `nav` for navigation, `ul` for a list of like
 * items — so the structure is exposed to assistive technology.
 */
export const Stack = function Stack({
  ref,
  children,
  direction = 'vertical',
  gap = 'normal',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  element = 'div',
  overrides,
  className,
  style,
  ...rest
}: StackProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const Tag = element as ElementType;
  const isList = element === 'ul' || element === 'ol';

  const classes = [
    'ds-stack',
    `ds-stack--${direction}`,
    `ds-stack--gap-${gap}`,
    `ds-stack--align-${align}`,
    `ds-stack--justify-${justify}`,
    wrap ? 'ds-stack--wrap' : null,
    isList ? 'ds-stack--list' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  // Removing list styling can drop list semantics in some browsers; `role="list"` restores it.
  const role = isList ? 'list' : rest.role;

  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement>} role={role} data-ds="Stack" className={classes} style={mergedStyle}>
      {isList
        ? Children.map(children, (child) =>
            child === null || child === undefined || typeof child === 'boolean' ? null : (
              <li className="ds-stack__item">{child}</li>
            ),
          )
        : children}
    </Tag>
  );
};
