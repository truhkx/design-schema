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
  /**
   * The trail from root to current page, in order. Every item but the last needs an `href`;
   * an ancestor without one, or with an empty-string `href`, renders as plain text (never an
   * empty link). The last is the current page and its `href` is ignored. An empty array
   * renders the named landmark around an empty list; a single item renders only the current
   * page; neither raises a dev warning.
   */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation landmark. Change it only if the page has another breadcrumb. */
  label?: string | undefined;
  /**
   * When there are more than four items, show the first, an ellipsis, and the last two; the
   * ellipsis is a button that reveals the rest. The rule is literal: five items hide the second
   * and third. Once revealed the trail stays expanded for the life of the instance, even if
   * `items` changes. Set false for short trails that must always show in full.
   */
  collapse?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BreadcrumbOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Fired when a non-current item is activated, as `(item, index)`; native has no event. The
   * handler is passed to Link as `onPress` and is the navigation, so returning `false` has
   * nothing to cancel (Breadcrumb links are never `external`); without a handler the Link
   * falls back to `Linking.openURL`.
   */
  onNavigate?: ((item: BreadcrumbItem, index: number) => boolean | void) | undefined;
  /** The root `View` (the `nav` and `list` parts). */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  separator: '/',
  expandLabel: 'Show all pages',
  navLabel: 'Breadcrumb',
  current: 'current page',
} as const;

/** react-native-web mirror of `accessibilityState.selected` for the current page. */
const CURRENT_PAGE_ATTRS: Record<string, unknown> = { 'aria-current': 'page' };

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
 * Renders one wrapping row `View` with `role="navigation"` (semantic on react-native-web,
 * ignored on native) and `accessibilityLabel={label}`; it is both the `nav` and `list`
 * parts and spaces items with `columnGap: gap` (no row gap: each item's `minTarget` height
 * spaces wrapped lines). Each item is a row `View` (`Breadcrumb.item`, `minHeight:
 * minTarget`) holding its leading separator and its content `gap` apart, so a wrapped
 * line may start with a separator. Ancestors are the system `Link` (`tone: default`)
 * nested in a system `Text` whose `overrides` receive `fontSize`, `fontFamily`,
 * `fontWeight` and `lineHeight`; `onPress` calls `onNavigate(item, index)`. An ancestor
 * without `href` is plain text in `itemColor`. The current page is `Text` in
 * `currentColor` with `accessibilityState={{ selected: true }}` and `copy.current`
 * appended to its label; separators are decorative `Text` in `separatorColor`. With
 * `collapse` and more than four items the ellipsis is the system `Button` (`ghost`, `sm`,
 * `iconOnly`, labelled `copy.expandLabel`, the `ellipsis` glyph as `leadingIcon`);
 * activating it reveals the hidden items one-way and moves accessibility focus to the
 * first revealed item's `View` (hardware-keyboard focus cannot be moved to a Text link).
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
    const lineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
    const text: TextStyle = {
      fontFamily,
      fontSize,
      fontWeight: toFontWeight(fontWeight),
      lineHeight: toLineHeight(fontSize, lineHeight),
    };
    const nav: ViewStyle = { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: gap };
    const item: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: gap,
      minHeight: t.sizeTargetMin,
    };
    const current: TextStyle = { ...text, color: t.colorForeground };
    const plain: TextStyle = { ...text, color: t.colorForegroundMuted };
    const separator: TextStyle = { ...text, color: t.colorForegroundMuted };
    return { nav, item, current, plain, separator };
  }, [t, overrides?.gap, overrides?.fontFamily, overrides?.fontSize, overrides?.fontWeight, overrides?.lineHeight]);

  // Forwarded to the Text around each Link so the Link inherits the breadcrumb type.
  const linkTextOverrides = {
    fontSize: overrides?.fontSize ?? 'font.size.sm',
    fontFamily: overrides?.fontFamily ?? 'font.family.body',
    fontWeight: overrides?.fontWeight ?? 'font.weight.regular',
    lineHeight: overrides?.lineHeight ?? 'font.lineHeight.normal',
  } as const;

  const separator = (): React.JSX.Element => (
    <RNText
      testID="Breadcrumb.separator"
      accessibilityElementsHidden
      importantForAccessibility="no"
      aria-hidden
      style={styles.separator}
    >
      {COPY.separator}
    </RNText>
  );

  const nodes: React.JSX.Element[] = [];
  items.forEach((item, index) => {
    if (collapsed && index > 0 && index < tailStart) {
      if (index === 1) {
        nodes.push(
          <View key="expand" testID="Breadcrumb.item" style={styles.item}>
            {separator()}
            <View testID="Breadcrumb.expand">
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
            </View>
          </View>,
        );
      }
      return;
    }

    let content: React.JSX.Element;
    if (index === lastIndex) {
      const currentName = `${item.label}, ${COPY.current}`;
      content = (
        <RNText
          testID="Breadcrumb.current"
          accessibilityState={{ selected: true }}
          accessibilityLabel={currentName}
          aria-label={currentName}
          // aria-selected is not allowed on a generic element; the web contract marks the
          // current page with aria-current="page", which Text's types omit.
          {...CURRENT_PAGE_ATTRS}
          style={styles.current}
        >
          {item.label}
        </RNText>
      );
    } else if (item.href === undefined || item.href === '') {
      content = <RNText style={styles.plain}>{item.label}</RNText>;
    } else {
      const href = item.href;
      content = (
        // Text takes no testID, so the `link` part hook sits on a View around it.
        <View testID="Breadcrumb.link">
          <Text overrides={linkTextOverrides}>
            <Link
              href={href}
              label={item.label}
              tone="default"
              // Without a handler the Link falls back to Linking.openURL(href) itself.
              onPress={onNavigate === undefined ? undefined : () => onNavigate(item, index)}
            />
          </Text>
        </View>
      );
    }

    nodes.push(
      <View
        key={`item-${index}`}
        testID="Breadcrumb.item"
        ref={index === 1 ? firstRevealedRef : undefined}
        style={styles.item}
      >
        {index > 0 ? separator() : null}
        {content}
      </View>,
    );
  });

  return (
    <View
      ref={ref}
      testID="Breadcrumb"
      role="navigation"
      accessibilityLabel={label}
      aria-label={label}
      style={styles.nav}
    >
      {nodes}
    </View>
  );
}
