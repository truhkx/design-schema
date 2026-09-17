import * as React from 'react';
import { Linking, Pressable, View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import type { ButtonProps } from './Button';
import { trackPress } from './custom/analytics';
import { useFormContext } from './FormContext';
import type { FormContextValue } from './FormContext';
import { Heading } from './Heading';
import { Link, LINK_EXTERNAL_SUFFIX } from './Link';
import type { LinkProps } from './Link';
import { Text } from './Text';
import { useTheme } from './theme';
import type { Tokens } from './theme';

/** Heading level for `heading`. The schema declares the values as strings; numbers are accepted too. */
export type CardHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;
export type CardInset = 'sm' | 'md' | 'lg';
export type CardSurface = 'default' | 'subtle';

/** The style bindings a caller may replace with a different token. Locked: background, hoverBackground, focusRing, focusRingWidth. */
export type CardOverridableBinding =
  | 'paddingBlock'
  | 'paddingInline'
  | 'partGap'
  | 'headerGap'
  | 'footerGap'
  | 'actionsGap'
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'transition';

export interface CardProps {
  /**
   * The body. Usually a Stack of Text and controls; a plain string is rendered inside
   * the system Text (a bare string cannot sit in a native View).
   */
  children: React.ReactNode;
  /**
   * The card's title, rendered as the system Heading at the card's level and at
   * `size: lg`, so a card heading reads smaller than a page heading. Omit for cards
   * that are a single piece of content; an empty string counts as omitted.
   */
  heading?: string | undefined;
  /**
   * Heading level for `heading`, so cards fit the page outline. Cards in a list share
   * a level. React Native has no heading levels: the heading carries the `header`
   * role, and the level is passed to `Heading` for parity only (its size is `lg`).
   */
  headingLevel?: CardHeadingLevel | undefined;
  /** Controls at the end of the header row — a ghost icon-only Button, a Link. At most two (a content guideline, not a runtime check). */
  headerActions?: React.ReactNode;
  /** The action row. Buttons in a row, primary first, following Form's action-order rule. */
  footer?: React.ReactNode;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset | undefined;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface | undefined;
  /**
   * The whole card is one link or button target. Requires exactly one Link or Button
   * among the top-level children of the body (controls nested in a wrapper such as a
   * Stack are not searched); its action, role and name move onto a wrapping Pressable —
   * the card's single target and single focus stop. With zero or several such children
   * the card stays non-interactive and warns once in development. A disabled child
   * disables the card with it. Controls in `headerActions` and `footer` are never the
   * target.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes `tabIndex={-1}` so a container (Feed) can move focus to it by
   * script through `ref`, and draws its own focus ring when focused that way. Not a
   * tab stop; not for making cards clickable (`interactive`). With `interactive` also
   * set, `interactive` wins, this is a no-op, and a development warning says so.
   * A react-native-web capability: on iOS and Android no container can focus a View by script.
   */
  focusable?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view: the surface `View`, or the wrapping `Pressable` when the card is interactive. */
  ref?: React.Ref<ViewInstance> | undefined;
}

interface InteractiveTarget {
  activate: () => void;
  role: 'button' | 'link';
  label: string;
  disabled: boolean;
}

const INSET = {
  sm: 'layoutInsetSm',
  md: 'layoutInsetMd',
  lg: 'layoutInsetLg',
} as const satisfies Record<CardInset, keyof Tokens>;

const BACKGROUND = {
  default: 'colorBackground',
  subtle: 'colorBackgroundSubtle',
} as const satisfies Record<CardSurface, keyof Tokens>;

/** hoverBackground: `color.background.subtle`; subtle cards use `color.background.strong`. */
const HOVER_BACKGROUND = {
  default: 'colorBackgroundSubtle',
  subtle: 'colorBackgroundStrong',
} as const satisfies Record<CardSurface, keyof Tokens>;

/**
 * RN core's `View` type omits `onFocus`/`onBlur`, which the runtime and
 * react-native-web (where scripted focus is exercised) support; this alias types them.
 */
type FocusableViewProps = React.ComponentProps<typeof View> & {
  onFocus?: (() => void) | undefined;
  onBlur?: (() => void) | undefined;
  ref?: React.Ref<ViewInstance> | undefined;
};
const FocusableView = View as unknown as React.ComponentType<FocusableViewProps>;

/** A bare string or number cannot sit in a native View: it goes inside the system Text. */
function wrapText(node: React.ReactNode, key?: number): React.ReactNode {
  return typeof node === 'string' || typeof node === 'number' ? <Text key={key}>{node}</Text> : node;
}

function renderBody(children: React.ReactNode): React.ReactNode {
  return Array.isArray(children) ? children.map((child, index) => wrapText(child, index)) : wrapText(children);
}

function targetOf(node: React.ReactNode, form: FormContextValue | null): InteractiveTarget | null {
  if (!React.isValidElement(node)) {
    return null;
  }
  if (node.type === Button) {
    const props = node.props as ButtonProps;
    const disabled = (props.disabled ?? false) || (form?.disabled ?? false);
    return {
      // Same action as Button's own press handler.
      activate: () => {
        if (disabled || props.loading) {
          return;
        }
        props.onPress?.();
        if (props.track !== undefined) {
          trackPress(props.track, props.label);
          props.onTrack?.(props.track, props.label);
        }
        if (props.type === 'submit') {
          form?.submit();
        }
      },
      role: 'button',
      label: props.accessibleName ?? props.accessibilityLabel ?? props.label,
      disabled,
    };
  }
  if (node.type === Link) {
    const props = node.props as LinkProps;
    return {
      // Same default action as Link: cancelable onPress, then Linking when Link would use it.
      activate: () => {
        if (props.onPress?.(props.href) === false) {
          return;
        }
        if (props.external || props.onPress === undefined) {
          Promise.resolve(Linking.openURL(props.href)).catch(() => undefined);
        }
      },
      role: 'link',
      label: props.external ? `${props.label}${LINK_EXTERNAL_SUFFIX}` : props.label,
      disabled: false,
    };
  }
  return null;
}

/**
 * Looks for the single Link or Button among the top-level children of the body only
 * (header actions, footer and nested wrappers keep their own targets). With exactly
 * one, returns the body with that child made inert and hidden from assistive
 * technology, so the wrapping Pressable is the one target and focus stop.
 */
function scanTopLevel(
  children: React.ReactNode,
  form: FormContextValue | null,
): { content: React.ReactNode; target: InteractiveTarget | null; count: number } {
  const items = Array.isArray(children) ? (children as React.ReactNode[]) : [children];
  let target: InteractiveTarget | null = null;
  let index = -1;
  let count = 0;
  for (const [i, item] of items.entries()) {
    const found = targetOf(item, form);
    if (found !== null) {
      count += 1;
      target = found;
      index = i;
    }
  }
  if (count !== 1) {
    return { content: renderBody(children), target: null, count };
  }
  const inert = (element: React.ReactNode, key?: number): React.JSX.Element => (
    <View key={key} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no">
      {element}
    </View>
  );
  const content = Array.isArray(children)
    ? items.map((item, i) => (i === index ? inert(item, i) : wrapText(item, i)))
    : inert(children);
  return { content, target, count };
}

/**
 * Card — frames one thing so it can sit among others: a search result, a plan to
 * choose, a setting group, a dashboard panel.
 *
 * When to use: collections of like items where each needs its own boundary, and a
 * single panel that groups a heading, content and actions. Give it a `heading` when it
 * is a unit in a list and set `headingLevel` to fit the page. Use `interactive` when
 * the entire card leads somewhere and it contains exactly one Link or Button.
 *
 * A `View` with padding, background, border and radius from tokens. The header
 * (`heading` or `headerActions`) and footer are Card's own row Views styled from its
 * gap bindings, not Stack, so they stay overridable per instance. The Heading gets
 * `marginBlockEnd: space.0` so its own margin adds no space inside the header row.
 *
 * `interactive` wraps the content in a `Pressable` that takes the single top-level
 * child's role, accessible name and action; the child is made inert and hidden from
 * assistive technology, so the Pressable is exactly one target and one focus stop. A
 * disabled child reports the Pressable disabled, ignores presses and shows no hover
 * background. With zero or several candidates the card renders as a plain View. The
 * ring's width (`border.width.focus`) is always reserved, colored `border` on
 * `surface: default` and transparent on `subtle` until focused, so focus never shifts
 * the layout. Hover and press show `hoverBackground` instantly; native has no
 * continuous hover to animate, so `transition` has no runtime effect.
 *
 * `focusable` sets `tabIndex={-1}` (scriptable, not a tab stop under react-native-web;
 * on native Android `-1` means not focusable) and draws the ring on focus.
 */
export function Card({
  children,
  heading,
  headingLevel = '3',
  headerActions,
  footer,
  inset = 'md',
  surface = 'default',
  interactive = false,
  focusable = false,
  overrides,
  ref,
}: CardProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const token = <V,>(override: TokenRef | undefined, fallback: V): V =>
    override ? (resolveToken(t, override) as V) : fallback;

  const paddingBlock = token<number>(overrides?.paddingBlock, t[INSET[inset]]);
  const paddingInline = token<number>(overrides?.paddingInline, t[INSET[inset]]);
  const partGap = token<number>(overrides?.partGap, t.layoutGapLoose);
  const headerGap = token<number>(overrides?.headerGap, t.layoutGapNormal);
  const footerGap = token<number>(overrides?.footerGap, t.layoutGapTight);
  const actionsGap = token<number>(overrides?.actionsGap, t.layoutGapTight);
  const radius = token<number>(overrides?.radius, t.radiusLg);
  const borderColor = token<string>(overrides?.border, t.colorBorder);
  const borderWidth = token<number>(overrides?.borderWidth, t.borderWidthThin);
  const background = t[BACKGROUND[surface]];
  const hoverBackground = t[HOVER_BACKGROUND[surface]];

  const scanned = React.useMemo(
    () => (interactive ? scanTopLevel(children, form) : { content: renderBody(children), target: null, count: 1 }),
    [interactive, children, form],
  );
  const target = scanned.target;
  const isInteractive = target !== null;
  const targetDisabled = target?.disabled ?? false;

  const warnedCount = React.useRef(false);
  const warnedFocusable = React.useRef(false);
  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    if (interactive && scanned.count !== 1 && !warnedCount.current) {
      warnedCount.current = true;
      console.warn(
        `Card: \`interactive\` requires exactly one Link or Button among the top-level children; found ${scanned.count}. The card stays non-interactive.`,
      );
    }
    if (interactive && focusable && !warnedFocusable.current) {
      warnedFocusable.current = true;
      console.warn('Card: `focusable` has no effect while `interactive` is set; the card already has a target.');
    }
  }, [interactive, focusable, scanned.count]);

  const hasHeading = heading !== undefined && heading !== '';
  const hasHeaderActions = headerActions !== undefined && headerActions !== null;
  const hasFooter = footer !== undefined && footer !== null;

  // `interactive` wins over `focusable` only when the card actually has a target.
  const scriptFocusable = focusable && !isInteractive;
  const ringReserved = isInteractive || scriptFocusable;
  const restingBorder = surface === 'default' ? borderColor : 'transparent';
  const showHover = isInteractive && !targetDisabled && (hovered || pressed);
  const surfaceStyle: ViewStyle = {
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    gap: partGap,
    borderRadius: radius,
    backgroundColor: showHover ? hoverBackground : background,
    ...(ringReserved
      ? { borderWidth: t.borderWidthFocus, borderColor: focused ? t.colorBorderFocus : restingBorder }
      : surface === 'default'
        ? { borderWidth, borderColor }
        : {}),
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: hasHeading ? 'space-between' : 'flex-end',
    gap: headerGap,
  };
  const actionsStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: actionsGap };
  const footerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: footerGap };

  const content = (
    <>
      {hasHeading || hasHeaderActions ? (
        <View style={headerStyle} testID="Card.header">
          {hasHeading ? (
            <View style={{ flexShrink: 1 }}>
              <Heading level={headingLevel} size="lg" overrides={{ marginBlockEnd: 'space.0' }}>
                {heading}
              </Heading>
            </View>
          ) : null}
          {hasHeaderActions ? (
            <View style={actionsStyle} testID="Card.headerActions">
              {headerActions}
            </View>
          ) : null}
        </View>
      ) : null}
      <View testID="Card.body">{scanned.content}</View>
      {hasFooter ? (
        <View style={footerStyle} testID="Card.footer">
          {footer}
        </View>
      ) : null}
    </>
  );

  if (target === null) {
    return (
      <FocusableView
        ref={ref}
        style={surfaceStyle}
        testID="Card"
        {...(scriptFocusable
          ? { tabIndex: -1 as const, onFocus: () => setFocused(true), onBlur: () => setFocused(false) }
          : {})}
      >
        {content}
      </FocusableView>
    );
  }

  return (
    <Pressable
      ref={ref}
      accessibilityRole={target.role}
      accessibilityLabel={target.label}
      accessibilityState={{ disabled: target.disabled }}
      onPress={() => {
        if (!target.disabled) {
          target.activate();
        }
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={surfaceStyle}
      testID="Card"
    >
      {content}
    </Pressable>
  );
}
