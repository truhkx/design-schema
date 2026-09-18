import { useRef, type ComponentPropsWithoutRef, type CSSProperties, type ReactElement, type ReactNode, type Ref } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.css';

declare const process: { env: { NODE_ENV?: string } };

/** Position in the document outline: the schema's canonical string values. The `level` prop also accepts the number. */
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
/** Visual size: the large end of the shared size vocabulary (Text takes the small end). */
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';
/** Horizontal text alignment; `start` and `end` are logical. */
export type HeadingAlign = 'start' | 'center' | 'end';

/** Style bindings that can be overridden per instance; the locked `color` binding is not in this list. */
export type HeadingOverridableBinding = 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'marginBlockEnd';

const OVERRIDE_HOOK: Record<HeadingOverridableBinding, string> = {
  fontFamily: '--ds-heading-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontWeight: '--ds-heading-font-weight',
  fontSize: '--ds-heading-font-size',
  lineHeight: '--ds-heading-line-height',
  marginBlockEnd: '--ds-heading-margin-block-end',
};

function overridesToStyle(overrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as HeadingOverridableBinding[]) {
    // Locked bindings are not in the type; ignore them if an untyped caller passes one anyway.
    const hook = OVERRIDE_HOOK[binding] as string | undefined;
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface HeadingProps extends Omit<ComponentPropsWithoutRef<'h1'>, 'children' | 'className' | 'style'> {
  /**
   * Position in the document outline. Controls the semantic element, not the visual size.
   * Canonical values are strings; the number is accepted too. A missing, out-of-range or
   * non-numeric level is treated as `2` (an <h2> at the 3xl default size) with one development
   * warning per element for its lifetime.
   */
  level: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Visual size, independent of level. There is no single default; the default is read from
   * `level` by this exact map — 1 → 4xl, 2 → 3xl, 3 → 2xl, 4 → xl, 5 → lg, 6 → md — and an
   * explicit `size` always wins over it. Web exposes no size attribute, only the
   * `ds-heading--size-*` modifier class, which carries the resolved size.
   */
  size?: HeadingSize | undefined;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: ReactNode;
  /**
   * Horizontal text alignment. It has no style binding on purpose — alignment is a layout choice,
   * not a themed value — so it maps straight to text-align. `start` and `end` are logical.
   */
  align?: HeadingAlign | undefined;
  /** Per-instance style overrides: each entry sets the matching `--ds-heading-*` hook to that token, inline. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
}

const ELEMENT_BY_LEVEL: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
  '1': 'h1',
  '2': 'h2',
  '3': 'h3',
  '4': 'h4',
  '5': 'h5',
  '6': 'h6',
};

const SIZE_BY_LEVEL: Record<HeadingLevel, HeadingSize> = {
  '1': '4xl',
  '2': '3xl',
  '3': '2xl',
  '4': 'xl',
  '5': 'lg',
  '6': 'md',
};

function isLevel(value: string): value is HeadingLevel {
  return Object.hasOwn(ELEMENT_BY_LEVEL, value);
}

/**
 * Heading — Design Schema, category: typography.
 *
 * When to use:
 * Use a Heading to title a page, a section, or a card that contains its own content. Choose
 * `level` from the document outline — the page title is `1`, its major sections are `2`, their
 * subsections `3` — and then choose `size` separately if the default visual size is wrong for the
 * layout. Decoupling level from size is the whole point of this component: it lets designers pick
 * the right look without breaking the outline.
 */
export function Heading({
  ref,
  level,
  size,
  children,
  align = 'start',
  overrides,
  ...rest
}: HeadingProps & { ref?: Ref<HTMLHeadingElement> | undefined }): ReactElement {
  const warnedRef = useRef(false);
  const raw = String(level);
  const valid = isLevel(raw);
  const key: HeadingLevel = valid ? raw : '2';
  if (process.env.NODE_ENV !== 'production' && !valid && !warnedRef.current) {
    warnedRef.current = true;
    console.warn(`Heading: level ${JSON.stringify(level)} is not one of 1–6; rendering an <h2>.`);
  }

  const Tag = ELEMENT_BY_LEVEL[key];
  // The level-derived size is only a class; it is never written back as an explicit size.
  const resolvedSize = size ?? SIZE_BY_LEVEL[key];

  const classes = `ds-heading ds-heading--size-${resolvedSize} ds-heading--align-${align}`;
  const style = overrides ? overridesToStyle(overrides) : undefined;

  return (
    <Tag {...rest} ref={ref} data-ds="Heading" data-part="text" className={classes} style={style}>
      {children}
    </Tag>
  );
}
