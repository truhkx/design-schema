import { type ComponentPropsWithoutRef, type CSSProperties, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'tight' | 'normal' | 'loose';

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/**
 * Style bindings that can be overridden per instance; accessibility-bearing bindings (labelColor)
 * are never in this list. `labelSize` and `fontFamily` are forwarded to the composed `Text`
 * label's own `overrides`, since Text already owns those bindings.
 */
export type DividerOverridableBinding = 'color' | 'thickness' | 'spacing' | 'labelSize' | 'labelGap' | 'fontFamily';

const ROOT_OVERRIDE_HOOK: Partial<Record<DividerOverridableBinding, string | undefined>> = {
  color: '--ds-divider-color',
  thickness: '--ds-divider-thickness',
  spacing: '--ds-divider-spacing',
  labelGap: '--ds-divider-label-gap',
};

function overridesToStyle(overrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
} {
  const rootStyle: Record<string, string> = {};
  const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  for (const binding of Object.keys(overrides) as DividerOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) {
      rootStyle[hook] = cssVar(ref);
    } else if (binding === 'labelSize') {
      textOverrides.fontSize = ref;
    } else if (binding === 'fontFamily') {
      textOverrides.fontFamily = ref;
    }
  }
  return { rootStyle: rootStyle as CSSProperties, textOverrides };
}

export interface DividerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'aria-orientation'> {
  /** Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height. */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the divider
   * from decorative into a labelled separator. Meaningful on `horizontal` dividers only.
   */
  label?: string | undefined;
  /**
   * Expose as a separator to assistive technology. Leave false for purely visual lines between
   * list rows; set true (or provide a label) when the divider marks a real boundary between
   * sections that a screen-reader user should hear.
   */
  semantic?: boolean | undefined;
  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  spacing?: DividerSpacing | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook (or the composed label's own override) to that token. */
  overrides?: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Divider — Design Schema, category: layout.
 *
 * When to use:
 * Use a Divider between items in a dense list where whitespace alone does not separate them,
 * between groups in a menu (Menu renders its own), between toolbar groups (`vertical`), and with a
 * `label` as an "or" between alternatives (sign in with email — or — with a provider) or a date
 * heading in a feed. Use `spacing` when the divider stands outside a Stack.
 */
export const Divider = function Divider({ ref, orientation = 'horizontal', label, semantic = false, spacing = 'none', overrides, className, style, ...rest }: DividerProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const showLabel = Boolean(label) && orientation === 'horizontal';
  const isSemantic = semantic || showLabel;

  if (isDev && label && orientation === 'vertical') {
    console.warn('Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.');
  }

  const classes = [
    'ds-divider',
    `ds-divider--${orientation}`,
    `ds-divider--spacing-${spacing}`,
    showLabel ? 'ds-divider--labelled' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, textOverrides } = overrides ? overridesToStyle(overrides) : { rootStyle: undefined, textOverrides: {} };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  if (showLabel) {
    return (
      <div
        {...rest}
        ref={ref as Ref<HTMLDivElement>}
        data-ds="Divider"
        className={classes}
        style={mergedStyle}
        role="separator"
        aria-orientation={orientation}
      >
        <span className="ds-divider__line" data-part="line" aria-hidden="true" />
        <span className="ds-divider__label" data-part="label">
          <Text element="span" size="sm" tone="muted" overrides={Object.keys(textOverrides).length ? textOverrides : undefined}>
            {label}
          </Text>
        </span>
        <span className="ds-divider__line" data-part="line" aria-hidden="true" />
      </div>
    );
  }

  return (
    <hr
      {...rest}
      ref={ref as Ref<HTMLHRElement>}
      data-ds="Divider"
      className={classes}
      style={mergedStyle}
      aria-hidden={isSemantic ? undefined : 'true'}
      role={isSemantic ? 'separator' : undefined}
      aria-orientation={isSemantic ? orientation : undefined}
    />
  );
};
