import { Children, forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode, type Ref } from 'react';
import './Stack.css';

export type StackDirection = 'vertical' | 'horizontal';
export type StackGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type StackElement = 'div' | 'section' | 'nav' | 'ul' | 'ol';

export interface StackProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Any components. Stack does not style its children; it only positions them. */
  children: ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection;
  /** Space between children from the spacing scale. The only way to set spacing. */
  gap?: StackGap;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Allow horizontal stacks to wrap onto new lines instead of overflowing. */
  wrap?: boolean;
  /** Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an `li`. */
  element?: StackElement;
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
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    children,
    direction = 'vertical',
    gap = '4',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    element = 'div',
    className,
    ...rest
  },
  ref,
) {
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

  // Removing list styling can drop list semantics in some browsers; `role="list"` restores it.
  const role = isList ? 'list' : rest.role;

  return (
    <Tag {...rest} ref={ref as Ref<HTMLElement>} role={role} className={classes}>
      {isList
        ? Children.map(children, (child) =>
            child === null || child === undefined || typeof child === 'boolean' ? null : (
              <li className="ds-stack__item">{child}</li>
            ),
          )
        : children}
    </Tag>
  );
});
