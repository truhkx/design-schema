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

/** One item of the trail — the element type of the schema's `items` shape. */
export type BreadcrumbItem = { label: string; href?: string | undefined };

export interface BreadcrumbProps {
  /** The trail from root to current page, in order. Every item but the last needs an `href`; an ancestor without one renders as plain text (never an empty link). The last is the current page and its `href` is ignored. */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /** When there are more than four items, show the first, an ellipsis, and the last two; the ellipsis is a button that reveals the rest. Set false for short trails that must always show in full. */
  collapse?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when a non-current item is activated, as `(item, index)`. On native there is no
   * event: the handler is the navigation, and without one the Link falls back to
   * `Linking.openURL`. Cancelable: return `false` to skip the Link's default hand-off.
   */
  onNavigate?: ((item: BreadcrumbItem, index: number) => boolean | void) | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  separator: '/',
  expandLabel: 'Show all pages',
  navLabel: 'Breadcrumb',
} as const;

/** Trails longer than this collapse (when `collapse` is on). */
const COLLAPSE_ABOVE = 4;
/** How many trailing items stay visible when collapsed. */
const COLLAPSED_TAIL = 2;

/**
 * Breadcrumb — answers "where am I?" and "how do I go up a level?" in one line. A
 * secondary navigation that shows the hierarchy, not the user's history.
 *
 * When to use: pages three or more levels deep — documentation, catalogues, settings
 * sub-pages — above the page title. Not on top-level pages, not for history, not as a
 * wizard step indicator. Breadcrumbs are rare on native, where the navigation stack does
 * this job; they are provided mainly for tablet and react-native-web layouts.
 *
 * Renders a wrapping row `View` with `role="navigation"` (semantic on react-native-web,
 * ignored on native) and `accessibilityLabel={label}`; the anatomy's `nav` and `list` are
 * this one view. Ancestors are the system `Link` nested in a system `Text` whose
 * `overrides.fontSize` receives this component's `fontSize` binding, with `onPress`
 * calling `onNavigate(item, index)`; an ancestor without `href` is plain text in
 * `itemColor`. Each item sits in a `View` with `minHeight: minTarget`. The current page
 * is `Text` in `currentColor` with `accessibilityState={{ selected: true }}`; separators
 * are decorative `Text` in `separatorColor`, spaced by `gap` on both sides through the
 * row's `columnGap`. With `collapse` and more than four items the ellipsis is the system
 * `Button` (`ghost`, `sm`, `iconOnly`, labelled `copy.expandLabel`, the `ellipsis` glyph
 * as `leadingIcon`); activating it reveals the hidden items one-way and moves
 * accessibility focus to the first revealed item (hardware-keyboard focus cannot be
 * moved to a Text link).
 */
export function Breadcrumb({
  items,
  label = COPY.navLabel,
  collapse = true,
  overrides,
  onNavigate,
  ref,
}: BreadcrumbProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const firstRevealedRef = React.useRef<ViewInstance>(null);
  const focusPending = React.useRef(false);

  const collapsed = collapse && !expanded && items.length > COLLAPSE_ABOVE;
  const tailStart = items.length - COLLAPSED_TAIL;
  const lastIndex = items.length - 1;

  React.useEffect(() => {
    if (!expanded || !focusPending.current) {
      return;
    }
    focusPending.current = false;
    const node = firstRevealedRef.current === null ? null : findNodeHandle(firstRevealedRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [expanded]);

  const styles = React.useMemo(() => {
    const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.space2;
    const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
    const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeSm;
    const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightRegular;
    const lineHeight = overrides?.lineHeight
      ? (resolveToken(t, overrides.lineHeight) as number)
      : t.fontLineHeightNormal;
    const text: TextStyle = {
      fontFamily,
      fontSize,
      fontWeight: toFontWeight(fontWeight),
      lineHeight: toLineHeight(fontSize, lineHeight),
    };
    const nav: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: gap };
    const item: ViewStyle = { minHeight: t.sizeTargetMin, justifyContent: 'center' };
    const current: TextStyle = { ...text, color: t.colorForeground };
    const plain: TextStyle = { ...text, color: t.colorForegroundMuted };
    const separator: TextStyle = { ...text, color: t.colorForegroundMuted };
    return { nav, item, current, plain, separator };
  }, [t, overrides?.gap, overrides?.fontFamily, overrides?.fontSize, overrides?.fontWeight, overrides?.lineHeight]);

  const separator = (key: string): React.JSX.Element => (
    <RNText
      key={key}
      testID="Breadcrumb.separator"
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={styles.separator}
    >
      {COPY.separator}
    </RNText>
  );

  const nodes: React.ReactNode[] = [];
  items.forEach((item, index) => {
    if (collapsed && index > 0 && index < tailStart) {
      if (index === 1) {
        nodes.push(
          separator('sep-ellipsis'),
          <View key="ellipsis" style={styles.item}>
            <Button
              label={COPY.expandLabel}
              variant="ghost"
              size="sm"
              iconOnly
              leadingIcon={<Icon name="ellipsis" color={t.colorActionGhostForeground} />}
              onPress={() => {
                focusPending.current = true;
                setExpanded(true);
              }}
            />
          </View>,
        );
      }
      return;
    }
    if (index > 0) {
      nodes.push(separator(`sep-${index}`));
    }
    if (index === lastIndex) {
      nodes.push(
        <View key={`item-${index}`} style={styles.item}>
          <RNText testID="Breadcrumb.current" accessibilityState={{ selected: true }} style={styles.current}>
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
        testID="Breadcrumb.item"
        ref={index === 1 ? firstRevealedRef : undefined}
        style={styles.item}
      >
        {href === undefined ? (
          <RNText style={styles.plain}>{item.label}</RNText>
        ) : (
          // The Link inherits the breadcrumb size from the enclosing system Text; the
          // fontSize binding (and any override of it) is forwarded to that Text.
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
    <View ref={ref} testID="Breadcrumb" role="navigation" accessibilityLabel={label} style={styles.nav}>
      {nodes}
    </View>
  );
}
