import { useEffect, useId, type ComponentPropsWithoutRef, type CSSProperties, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'tight' | 'normal' | 'loose';

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/**
 * Style bindings that can be overridden per instance; the accessibility-bearing `labelColor` is
 * never in this list. `labelSize` and `fontFamily` are forwarded to the composed `Text` label's
 * own `overrides` (as `fontSize` and `fontFamily`); Divider does not style the Text itself.
 */
export type DividerOverridableBinding = 'color' | 'thickness' | 'spacing' | 'labelSize' | 'labelGap' | 'fontFamily';

const ROOT_OVERRIDE_HOOK: Partial<Record<DividerOverridableBinding, string>> = {
  color: '--ds-divider-color',
  thickness: '--ds-divider-thickness',
  spacing: '--ds-divider-spacing',
  labelGap: '--ds-divider-label-gap',
};

export interface DividerProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'aria-orientation' | 'aria-hidden' | 'className' | 'style'> {
  /**
   * Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height:
   * `inline-block` with `block-size: auto; align-self: stretch; min-block-size: 100%` (flex stretch
   * applies only to an auto cross size, and the min fills a parent with a set height). They need a
   * flex or grid row (a horizontal Stack with align stretch) or a parent with a definite height; in
   * plain block flow a vertical divider has no height and draws nothing.
   */
  orientation?: DividerOrientation | undefined;
  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier today"). Turns the divider
   * from decorative into a labelled separator (`semantic` is implied). Ignored on a vertical
   * divider, with a development warning: a vertical line has no room for centered text. An ignored
   * label implies nothing either — a vertical divider is semantic only when `semantic` says so.
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
export function Divider({
  ref,
  orientation = 'horizontal',
  label,
  semantic = false,
  spacing = 'none',
  overrides,
  ...rest
}: DividerProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const labelId = useId();
  const labelIgnored = Boolean(label) && orientation === 'vertical';
  const showLabel = Boolean(label) && orientation === 'horizontal';
  const isSemantic = semantic || showLabel;

  // Keyed on `label` and `orientation`: warns when the ignored combination appears or changes, not per render.
  useEffect(() => {
    if (isDev && labelIgnored) {
      console.warn('Divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, orientation]);

  const rootStyle: Record<string, string> = {};
  const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  if (overrides) {
    for (const binding of Object.keys(overrides) as DividerOverridableBinding[]) {
      const token = overrides[binding];
      if (!token) continue;
      // Overrides change values, never presence: spacing is off at `none`, and the label bindings
      // (labelGap on the row, labelSize/fontFamily on the composed Text) only apply while a label
      // is in effect.
      if (binding === 'spacing' && spacing === 'none') continue;
      if (!showLabel && (binding === 'labelGap' || binding === 'labelSize' || binding === 'fontFamily')) continue;
      if (binding === 'labelSize') textOverrides.fontSize = token;
      else if (binding === 'fontFamily') textOverrides.fontFamily = token;
      else {
        const hook = ROOT_OVERRIDE_HOOK[binding];
        if (hook) rootStyle[hook] = cssVar(token);
      }
    }
  }
  const style = Object.keys(rootStyle).length > 0 ? (rootStyle as CSSProperties) : undefined;

  const className = [
    'ds-divider',
    `ds-divider--${orientation}`,
    `ds-divider--spacing-${spacing}`,
    showLabel ? 'ds-divider--labelled' : null,
  ]
    .filter(Boolean)
    .join(' ');

  if (!isSemantic) {
    return (
      <hr
        {...rest}
        ref={ref as Ref<HTMLHRElement>}
        data-ds="Divider"
        className={className}
        style={style}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      data-ds="Divider"
      className={className}
      style={style}
      role="separator"
      aria-orientation={orientation}
      aria-labelledby={showLabel ? labelId : undefined}
    >
      {showLabel ? (
        <>
          <span className="ds-divider__line" data-part="line" aria-hidden="true" />
          <Text
            id={labelId}
            element="span"
            size="sm"
            tone="muted"
            data-part="label"
            overrides={Object.keys(textOverrides).length > 0 ? textOverrides : undefined}
          >
            {label}
          </Text>
          <span className="ds-divider__line" data-part="line" aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}
