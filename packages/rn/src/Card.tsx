import * as React from 'react';
import { Linking, Pressable, View } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import type { ButtonProps } from './Button';
import { Heading } from './Heading';
import { Link, LINK_EXTERNAL_SUFFIX } from './Link';
import type { LinkProps } from './Link';
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
  /** The body. Usually a Stack of Text and controls. */
  children: React.ReactNode;
  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content. */
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
   * The whole card is one link or button target. Requires exactly one interactive
   * child (a Link or Button) in `children`, whose action, role and name move onto a
   * wrapping Pressable — the card's single target and single focus stop.
   */
  interactive?: boolean | undefined;
  /**
   * The card root takes `tabIndex={-1}` so a container (Feed) can move focus to it by
   * script through `ref`, and draws its own focus ring when focused that way. Not a
   * tab stop; not for making cards clickable (`interactive`). With `interactive` also
   * set, `interactive` wins, this is a no-op, and a development warning says so.
   */
  focusable?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view: the surface `View`, or the wrapping `Pressable` when `interactive`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

interface InteractiveTarget {
  activate: () => void;
  role: 'button' | 'link';
  label: string;
  disabled: boolean;
}

interface InteractiveScan {
  target: InteractiveTarget | null;
  count: number;
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

function wrapInert(element: React.ReactNode): React.JSX.Element {
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no">
      {element}
    </View>
  );
}

/**
 * Walks `children` (only `children`: header actions and footer keep their own
 * targets), neutralises every `Button`/`Link` it finds and records how to activate
 * the last one. The count lets the card warn when there is not exactly one.
 */
function collapseInteractiveChild(node: React.ReactNode, scan: InteractiveScan): React.ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <React.Fragment key={index}>{collapseInteractiveChild(child, scan)}</React.Fragment>
    ));
  }
  if (!React.isValidElement(node)) {
    return node;
  }

  if (node.type === Button) {
    const props = node.props as ButtonProps;
    scan.count += 1;
    scan.target = {
      activate: () => props.onPress?.(),
      role: 'button',
      label: props.label,
      disabled: props.disabled ?? false,
    };
    return wrapInert(node);
  }

  if (node.type === Link) {
    const props = node.props as LinkProps;
    scan.count += 1;
    scan.target = {
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
    return wrapInert(node);
  }

  const childProps = node.props as { children?: React.ReactNode };
  if (childProps.children === undefined) {
    return node;
  }
  return React.cloneElement(
    node as React.ReactElement<{ children?: React.ReactNode }>,
    undefined,
    collapseInteractiveChild(childProps.children, scan),
  );
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
 * gap bindings, not Stack, so they stay overridable per instance.
 *
 * `interactive` wraps the content in a `Pressable` that takes the single child's
 * role, accessible name and action; the child is made inert and hidden from assistive
 * technology, so the Pressable is exactly one target and one focus stop. The ring's
 * width (`border.width.focus`) is always reserved, transparent until focused (or the
 * border color on `surface: default`), so focus never shifts the layout. Hover and
 * press show `hoverBackground` instantly; native has no continuous hover to animate,
 * so `transition` has no runtime effect.
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
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const warnedFocusable = React.useRef(false);
  if (__DEV__ && interactive && focusable && !warnedFocusable.current) {
    warnedFocusable.current = true;
    console.warn('Card: `focusable` has no effect while `interactive` is set; the card already has a target.');
  }

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

  const scanned = React.useMemo((): { content: React.ReactNode; target: InteractiveTarget | null } => {
    if (!interactive) {
      return { content: children, target: null };
    }
    const scan: InteractiveScan = { target: null, count: 0 };
    const content = collapseInteractiveChild(children, scan);
    if (__DEV__ && scan.count !== 1) {
      console.warn(`Card: \`interactive\` requires exactly one Link or Button in children; found ${scan.count}.`);
    }
    return { content, target: scan.count === 1 ? scan.target : null };
  }, [interactive, children]);

  const ringReserved = interactive || focusable;
  const restingBorder = surface === 'default' ? borderColor : 'transparent';
  const surfaceStyle: ViewStyle = {
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    gap: partGap,
    borderRadius: radius,
    backgroundColor: interactive && (hovered || pressed) ? hoverBackground : background,
    ...(ringReserved
      ? { borderWidth: t.borderWidthFocus, borderColor: focused ? t.colorBorderFocus : restingBorder }
      : surface === 'default'
        ? { borderWidth, borderColor }
        : {}),
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: heading !== undefined ? 'space-between' : 'flex-end',
    gap: headerGap,
  };
  const actionsStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: actionsGap };
  const footerStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: footerGap };

  const content = (
    <>
      {heading !== undefined || headerActions !== undefined ? (
        <View style={headerStyle} testID="Card.header">
          {heading !== undefined ? (
            <View style={{ flexShrink: 1 }} testID="Card.heading">
              <Heading level={headingLevel} size="lg">
                {heading}
              </Heading>
            </View>
          ) : null}
          {headerActions !== undefined ? (
            <View style={actionsStyle} testID="Card.headerActions">
              {headerActions}
            </View>
          ) : null}
        </View>
      ) : null}
      <View testID="Card.body">{scanned.content}</View>
      {footer !== undefined ? (
        <View style={footerStyle} testID="Card.footer">
          {footer}
        </View>
      ) : null}
    </>
  );

  if (!interactive) {
    return (
      <FocusableView
        ref={ref}
        style={surfaceStyle}
        testID="Card"
        {...(focusable
          ? { tabIndex: -1 as const, onFocus: () => setFocused(true), onBlur: () => setFocused(false) }
          : {})}
      >
        {content}
      </FocusableView>
    );
  }

  const target = scanned.target;
  return (
    <Pressable
      ref={ref}
      accessibilityRole={target?.role}
      accessibilityLabel={target?.label}
      accessibilityState={{ disabled: target?.disabled ?? false }}
      onPress={() => {
        if (target !== null && !target.disabled) {
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
