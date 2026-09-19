import {
  Children,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
  type ReactElement,
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
  /**
   * Any components. Stack does not style its children; it only positions them. Null and boolean
   * children are skipped, as the platform skips them. With `element` `ul`/`ol` each child gets one
   * `li`, as React counts children: a fragment is one child, so pass an array.
   */
  children: ReactNode;
  /** Main axis. `horizontal` follows writing direction (start→end), not left→right. */
  direction?: StackDirection | undefined;
  /**
   * Space between children, from the layout rhythm (`layout.gap.*`), not the raw spacing scale: tight
   * for related controls, normal for fields in a form, loose for groups, section between page sections.
   * The only way to set spacing between siblings.
   */
  gap?: StackGap | undefined;
  /** Cross-axis alignment. */
  align?: StackAlign | undefined;
  /**
   * Main-axis distribution. It only shows where the main axis is larger than the content — a vertical
   * Stack needs a bounded height for it to mean anything, and Stack has no size of its own, so that is
   * the caller's to give. The four values are the whole set: `around` and `evenly` are deliberately left out.
   */
  justify?: StackJustify | undefined;
  /**
   * Allow horizontal stacks to wrap onto new lines instead of overflowing. It is set whatever the
   * direction — on a column it is inert unless the block size is bounded.
   */
  wrap?: boolean | undefined;
  /**
   * Landmark or list semantics when the group has meaning. For `ul`/`ol`, each child is wrapped in an
   * `li` that is `display: contents`, so the children stay the flex items and the gap is unchanged. One
   * `li` per child as React counts children: a fragment holding two elements is one child, so pass an array;
   * null and boolean children get no `li`. The wrapper carries `role="listitem"` and the list `role="list"`,
   * because dropping `list-style` removes list semantics in some browsers. The list role wins over a
   * consumer `role` on `ul`/`ol`; on the other elements a consumer `role` passes through.
   */
  element?: StackElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Stack — Design Schema, category: layout.
 *
 * When to use:
 * Use Stack for any group of siblings that should be evenly spaced: form fields, a row of buttons, a
 * list of cards, label-plus-control pairs. Reach for it before writing any layout CSS. Choose `element`
 * when the group has meaning — `nav` for navigation, `ul` for a list of like items — so the structure is
 * exposed to assistive technology.
 */
export function Stack({
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

  // Stack merges a consumer `className` and `style` onto the root: composites give it layout-only classes.
  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  // Removing list styling can drop list semantics in some browsers; the explicit roles restore them.
  const role = isList ? 'list' : rest.role;

  return (
    <Tag
      {...rest}
      ref={ref}
      role={role}
      data-ds="Stack"
      data-part="container"
      className={classes}
      style={mergedStyle}
    >
      {isList
        ? Children.map(children, (child) =>
            child === null || child === undefined || typeof child === 'boolean' ? null : (
              <li role="listitem" data-part="item" className="ds-stack__item">
                {child}
              </li>
            ),
          )
        : children}
    </Tag>
  );
}
