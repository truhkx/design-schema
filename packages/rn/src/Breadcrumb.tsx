import * as React from 'react';
import { AccessibilityInfo, Text as RNText, View, findNodeHandle } from 'react-native';
import type { TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Link } from './Link';
import { Text } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type BreadcrumbOverridableBinding = 'gap' | 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight';

export interface BreadcrumbProps {
  /** The trail from root to current page, in order. Every item but the last needs an `href`; an ancestor without one renders as plain text (never an empty link). The last is the current page and its `href` is ignored. */
  items: { label: string; href?: string | undefined }[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /** When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis is a button that reveals the rest. */
  collapse?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a non-current item is activated, as `(item, index)`. On native the handler is the navigation; without one the Link falls back to `Linking.openURL`. */
  onNavigate?: ((item: { label: string; href?: string | undefined }, index: number) => void) | undefined;
}

/** One item of the trail — the element type of the schema's `items` shape. */
export type BreadcrumbItem = BreadcrumbProps['items'][number];

const COPY = {
  separator: '/',
  expandLabel: 'Show all pages',
} as const;

/** Trails longer than this collapse (when `collapse` is on). */
const COLLAPSE_ABOVE = 4;

/**
 * Breadcrumb — answers "where am I?" and "how do I go up a level?" in one line. A
 * secondary navigation that shows the hierarchy, not the user's history.
 *
 * When to use: Use a Breadcrumb on pages three or more levels deep — documentation,
 * catalogues, settings sub-pages — above the page title, at the top of `main`. Do
 * not use it on top-level pages, to show history, or as a wizard step indicator.
 * Breadcrumbs are rare on native, where the navigation stack does this job; they are
 * provided mainly for tablet and react-native-web layouts.
 *
 * Renders a wrapping row `View` with `role="navigation"` (semantic on react-native-web,
 * ignored on native) and `accessibilityLabel={label}`. Ancestors are the system
 * `Link` nested in a `Text` at `fontSize` so they inherit it, with `onPress` calling
 * `onNavigate(item, index)`; an ancestor without `href` is plain text. Each item
 * sits in a `View` with `minHeight: minTarget`. The current page is `Text` in
 * `currentColor` with `accessibilityState={{ selected: true }}`; separators are
 * decorative `Text`. With `collapse` and more than four items the ellipsis is the
 * system `Button` (`ghost`, `sm`, `iconOnly`, labelled `copy.expandLabel`, with an
 * ellipsis glyph as `leadingIcon`); activating it reveals the hidden items one-way
 * and moves accessibility focus to the first revealed item (hardware-keyboard focus
 * cannot be moved to a Text link).
 */
export function Breadcrumb({
  items,
  label = 'Breadcrumb',
  collapse = true,
  overrides,
  onNavigate,
}: BreadcrumbProps): React.JSX.Element {
  const { tokens } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const firstRevealedRef = React.useRef<ViewInstance>(null);
  const [pendingFocus, setPendingFocus] = React.useState(false);

  const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
  // The index of the first hidden item, which receives focus once revealed.
  const firstHiddenIndex = 1;

  React.useEffect(() => {
    if (!pendingFocus) {
      return;
    }
    setPendingFocus(false);
    const node = firstRevealedRef.current === null ? null : findNodeHandle(firstRevealedRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [pendingFocus]);

  const gap = overrides?.gap ? (resolveToken(tokens, overrides.gap) as number) : tokens.space2;
  const fontFamily = overrides?.fontFamily ? (resolveToken(tokens, overrides.fontFamily) as string) : tokens.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(tokens, overrides.fontSize) as number) : tokens.fontSizeSm;
  const fontWeightToken = overrides?.fontWeight
    ? (resolveToken(tokens, overrides.fontWeight) as number)
    : tokens.fontWeightRegular;
  const lineHeightMultiplier = overrides?.lineHeight
    ? (resolveToken(tokens, overrides.lineHeight) as number)
    : tokens.fontLineHeightNormal;
  const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);

  const navStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  // Block padding is added to the item so each reaches the minimum target without
  // stretching the line.
  const itemStyle: ViewStyle = {
    minHeight: tokens.sizeTargetMin,
    justifyContent: 'center',
  };

  const textStyle: TextStyle = {
    fontFamily,
    fontSize,
    fontWeight: toFontWeight(fontWeightToken),
    lineHeight,
  };

  const currentStyle: TextStyle = {
    ...textStyle,
    color: tokens.colorForeground,
  };

  const itemStyleText: TextStyle = {
    ...textStyle,
    color: tokens.colorForegroundMuted,
  };

  const separatorStyle: TextStyle = {
    ...textStyle,
    color: tokens.colorForegroundMuted,
    marginHorizontal: gap,
  };

  const separator = (key: string): React.JSX.Element => (
    <RNText key={key} accessibilityElementsHidden importantForAccessibility="no" allowFontScaling style={separatorStyle}>
      {COPY.separator}
    </RNText>
  );

  const lastIndex = items.length - 1;
  const visible: { item: BreadcrumbItem; index: number }[] = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => !collapsed || index === 0 || index >= items.length - 2);

  const nodes: React.ReactNode[] = [];
  visible.forEach(({ item, index }, position) => {
    if (position > 0) {
      nodes.push(separator(`sep-${index}`));
    }
    if (collapsed && position === 1) {
      nodes.push(
        <View key="ellipsis" style={itemStyle}>
          <Button
            label={COPY.expandLabel}
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<Icon name="ellipsis" color={tokens.colorActionGhostForeground} />}
            onPress={() => {
              setExpanded(true);
              setPendingFocus(true);
            }}
          />
        </View>,
        separator(`sep-ellipsis`),
      );
    }
    if (index === lastIndex) {
      nodes.push(
        <View key={`item-${index}`} style={itemStyle}>
          <RNText accessibilityState={{ selected: true }} allowFontScaling style={currentStyle}>
            {item.label}
          </RNText>
        </View>,
      );
      return;
    }
    const href = item.href;
    nodes.push(
      <View
        key={`item-${index}`}
        ref={index === firstHiddenIndex ? firstRevealedRef : undefined}
        style={itemStyle}
      >
        {href === undefined ? (
          <RNText allowFontScaling style={itemStyleText}>
            {item.label}
          </RNText>
        ) : (
          // Nested in a system Text at `fontSize` so the Link inherits the breadcrumb typography;
          // forwards this component's own fontSize override so the size stays one value everywhere.
          <Text overrides={{ fontSize: overrides?.fontSize ?? 'font.size.sm' }}>
            <Link
              href={href}
              label={item.label}
              // Without a handler the Link falls back to Linking.openURL(href) itself.
              onPress={onNavigate === undefined ? undefined : () => onNavigate(item, index)}
            />
          </Text>
        )}
      </View>,
    );
  });

  return (
    <View testID="Breadcrumb" role="navigation" accessibilityLabel={label} style={navStyle}>
      {nodes}
    </View>
  );
}
