import * as React from 'react';
import { Linking, Pressable, View } from 'react-native';
import type { PressableStateCallbackType, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import type { ButtonProps } from './Button';
import { Heading } from './Heading';
import { Link, LINK_EXTERNAL_SUFFIX } from './Link';
import type { LinkProps } from './Link';
import { useTheme } from './theme';
import type { Tokens } from './theme';

/** Heading level for `heading`. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type CardHeadingLevel = '2' | '3' | '4' | '5' | '6' | 2 | 3 | 4 | 5 | 6;
export type CardInset = 'sm' | 'md' | 'lg';
export type CardSurface = 'default' | 'subtle';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
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
  | 'hoverBackground'
  | 'transition';

export interface CardProps {
  /** The body. Usually a Stack of Text and controls. */
  children: React.ReactNode;
  /** The card's title, rendered as a Heading at the card's level. Omit for cards that are a single piece of content. */
  heading?: string;
  /**
   * Heading level for `heading`, so cards fit the page outline. Cards in a list
   * share a level. Native has no heading levels; this controls only the default
   * typography, and the header trait is set regardless.
   */
  headingLevel?: CardHeadingLevel;
  /** Controls at the end of the header row — a ghost icon-only Button, a Link. At most two. */
  headerActions?: React.ReactNode;
  /** The action row. Buttons in a horizontal row, primary first, following Form's action-order rule. */
  footer?: React.ReactNode;
  /** Padding inside the card from the layout inset presets. `sm` for dense grids, `lg` for a single featured card. */
  inset?: CardInset;
  /** `default` is the page background with a border — the calm option; `subtle` is a tinted surface without a border. */
  surface?: CardSurface;
  /**
   * The whole card is one link or button target. Requires exactly one interactive
   * child (a Link or Button) whose action the card extends to its full area; the
   * card itself is not focusable — its single child is the target.
   */
  interactive?: boolean;
  /**
   * The card root takes `tabIndex={-1}` so a container (Feed) can move focus to it
   * by calling `.focus()` on the forwarded ref, and draws its own focus ring when
   * focused that way. Not a tab stop; not for making cards clickable (`interactive`).
   * Has no effect while `interactive` is set — the child link/button is already the
   * sole focus target.
   */
  focusable?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<CardOverridableBinding, TokenRef>>;
}

interface InteractiveTarget {
  activate: () => void;
  role: 'button' | 'link';
  label: string;
  disabled: boolean;
}

interface InteractiveScanState {
  target: InteractiveTarget | null;
  count: number;
}

const INSET_TOKEN = {
  sm: 'layoutInsetSm',
  md: 'layoutInsetMd',
  lg: 'layoutInsetLg',
} as const satisfies Record<CardInset, keyof Tokens>;

const SURFACE_BACKGROUND_TOKEN = {
  default: 'colorBackground',
  subtle: 'colorBackgroundSubtle',
} as const satisfies Record<CardSurface, keyof Tokens>;

const SURFACE_HOVER_TOKEN = {
  default: 'colorBackgroundSubtle',
  subtle: 'colorBackgroundStrong',
} as const satisfies Record<CardSurface, keyof Tokens>;

/**
 * RN core's `View` type omits `onFocus`/`onBlur` even though the runtime (and
 * react-native-web, where `focusable`'s scripted focus is actually exercised)
 * supports them; this typed alias documents that gap instead of reaching for `any`.
 */
type FocusableViewProps = React.ComponentProps<typeof View> & {
  onFocus?: () => void;
  onBlur?: () => void;
};
const FocusableView = View as unknown as React.ForwardRefExoticComponent<
  FocusableViewProps & React.RefAttributes<View>
>;

/**
 * Walks `children`, wraps the single `Button`/`Link` it finds in an inert, hidden
 * `View` (`pointerEvents="none"`, `accessibilityElementsHidden`) so it collapses into
 * the surrounding Pressable for both touch and assistive technology, and records how
 * to activate it. Only called for `interactive` cards.
 */
function extendInteractiveChild(node: React.ReactNode, state: InteractiveScanState): React.ReactNode {
  if (Array.isArray(node)) {
    return node.map((child, index) => (
      <React.Fragment key={index}>{extendInteractiveChild(child, state)}</React.Fragment>
    ));
  }
  if (!React.isValidElement(node)) {
    return node;
  }
  const element = node as React.ReactElement<any>;

  if (element.type === Button) {
    const props = element.props as ButtonProps;
    state.count += 1;
    state.target = {
      activate: () => props.onPress?.(),
      role: 'button',
      label: props.label,
      disabled: props.disabled ?? false,
    };
    return (
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no">
        {element}
      </View>
    );
  }

  if (element.type === Link) {
    const props = element.props as LinkProps;
    state.count += 1;
    state.target = {
      activate: () => {
        if (props.onPress) {
          props.onPress(props.href);
        } else {
          Linking.openURL(props.href).catch(() => undefined);
        }
      },
      role: 'link',
      label: props.external ? `${props.label}${LINK_EXTERNAL_SUFFIX}` : props.label,
      disabled: false,
    };
    return (
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no">
        {element}
      </View>
    );
  }

  const childProps = element.props as { children?: React.ReactNode };
  if (childProps.children === undefined) {
    return element;
  }
  return React.cloneElement(element, undefined, extendInteractiveChild(childProps.children, state));
}

/**
 * Card — frames one thing so it can sit among others: a search result, a plan to
 * choose, a setting group, a dashboard panel.
 *
 * When to use: Use Cards for collections of like items where each needs its own
 * boundary, and for a single panel that groups a heading, content and actions. Give
 * the card a `heading` when it is a unit in a list — it is what a screen reader jumps
 * to — and set `headingLevel` to fit the page. Use `interactive` when the entire card
 * leads somewhere and it contains exactly one Link or Button.
 *
 * Renders a `View` (a `Pressable` when `interactive`) with padding, background,
 * border and radius from tokens. The header and footer are horizontal rows built
 * directly from the `layout.gap.*` tokens rather than the `Stack` component, whose
 * `gap` prop only accepts the `space.*` scale. `interactive` finds the single
 * `Button`/`Link` inside `children`, hides it from touch and assistive technology,
 * and moves its role, accessible name and activation onto the surrounding
 * `Pressable`, so the card adds no separate focus stop. The focus ring's width is
 * always reserved on interactive cards (`border.width.focus`) so it never shifts the
 * layout when focus toggles; its color is the static border color
 * (`overrides.border` / `color.border`) until focused, then `color.border.focus`.
 * There is no pointer hover on native, so `hoverBackground` styles the pressed state
 * instead — the same substitution `Button` and `Link` already make — and `transition`
 * has no visible effect since there is no continuous hover to animate between.
 *
 * `focusable` forwards the root's ref (a plain `View`, or the `Pressable` when
 * `interactive`) so a container can call `.focus()`/`.blur()` on it (RN's
 * `NativeMethods`) and sets `tabIndex={-1}` — a real DOM `tabIndex=-1` under
 * react-native-web (scriptable, no tab stop), though on native Android RN's own
 * `tabIndex` typing treats `-1` as simply not focusable, so scripted focus is a
 * react-native-web-only guarantee here. The ring it draws reads `onFocus`/`onBlur`,
 * which RN core's `View` type omits (see `FocusableViewProps`); no component in this
 * package currently calls the ref (Feed's native list has no analog of the web
 * doc's PageUp/PageDown scripted paging), so this wires up the mechanism for a
 * future caller without one yet.
 */
export const Card = React.forwardRef<View, CardProps>(function Card(
  {
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
  }: CardProps,
  ref,
): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [focused, setFocused] = React.useState(false);
  const [scriptFocused, setScriptFocused] = React.useState(false);

  if (__DEV__ && interactive && focusable) {
    console.warn('Card: `focusable` has no effect while `interactive` is set; the child Link/Button is already the sole focus target.');
  }

  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[INSET_TOKEN[inset]];
  const paddingInline = overrides?.paddingInline
    ? (resolveToken(t, overrides.paddingInline) as number)
    : t[INSET_TOKEN[inset]];
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapNormal;
  const footerGap = overrides?.footerGap ? (resolveToken(t, overrides.footerGap) as number) : t.layoutGapTight;
  const actionsGap = overrides?.actionsGap ? (resolveToken(t, overrides.actionsGap) as number) : t.layoutGapTight;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const background = t[SURFACE_BACKGROUND_TOKEN[surface]];
  const hoverBackground = overrides?.hoverBackground
    ? (resolveToken(t, overrides.hoverBackground) as string)
    : t[SURFACE_HOVER_TOKEN[surface]];

  const showHeader = heading !== undefined || headerActions !== undefined;
  const showFooter = footer !== undefined;

  const interactiveResult = React.useMemo(() => {
    if (!interactive) {
      return { content: children, target: null as InteractiveTarget | null };
    }
    const state: InteractiveScanState = { target: null, count: 0 };
    const content = extendInteractiveChild(children, state);
    if (__DEV__ && state.count !== 1) {
      console.warn(`Card: interactive requires exactly one Link or Button child; found ${state.count}.`);
    }
    return { content, target: state.target };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, children]);

  const surfaceStyle: ViewStyle = {
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    gap: partGap,
    borderRadius: radius,
    backgroundColor: background,
  };
  if (focusable && !interactive) {
    surfaceStyle.borderWidth = t.borderWidthFocus;
    surfaceStyle.borderColor = scriptFocused ? t.colorBorderFocus : surface === 'default' ? borderColor : 'transparent';
  } else if (surface === 'default' && !interactive) {
    surfaceStyle.borderWidth = borderWidth;
    surfaceStyle.borderColor = borderColor;
  }

  const headerJustify: ViewStyle['justifyContent'] =
    heading !== undefined && headerActions !== undefined
      ? 'space-between'
      : headerActions !== undefined
        ? 'flex-end'
        : 'flex-start';

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: headerJustify,
    gap: headerGap,
  };

  const headerActionsStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: actionsGap,
  };

  const headingCellStyle: ViewStyle = { flexShrink: 1 };

  const footerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: footerGap,
  };

  const content = (
    <>
      {showHeader ? (
        <View style={headerStyle} testID="card-header">
          {heading !== undefined ? (
            <View style={headingCellStyle}>
              <Heading level={headingLevel}>{heading}</Heading>
            </View>
          ) : null}
          {headerActions !== undefined ? <View style={headerActionsStyle}>{headerActions}</View> : null}
        </View>
      ) : null}
      <View testID="card-body">{interactive ? interactiveResult.content : children}</View>
      {showFooter ? (
        <View style={footerStyle} testID="card-footer">
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
          ? { tabIndex: -1, onFocus: () => setScriptFocused(true), onBlur: () => setScriptFocused(false) }
          : {})}
      >
        {content}
      </FocusableView>
    );
  }

  const target = interactiveResult.target;

  const pressableStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    ...surfaceStyle,
    backgroundColor: pressed ? hoverBackground : background,
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : surface === 'default' ? borderColor : 'transparent',
  });

  return (
    <Pressable
      ref={ref}
      accessibilityRole={target?.role ?? 'button'}
      accessibilityLabel={target?.label}
      accessibilityState={{ disabled: target?.disabled ?? false }}
      onPress={() => {
        if (target !== null && !target.disabled) {
          target.activate();
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={pressableStyle}
      testID="Card"
    >
      {content}
    </Pressable>
  );
});
