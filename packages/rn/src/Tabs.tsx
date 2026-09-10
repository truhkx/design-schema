import * as React from 'react';
import { Animated, I18nManager, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

export type TabsActivation = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsFit = 'start' | 'fill';

/** One tab. `badge` is a short count or status shown after the label ("3", "New"). */
export type TabsTab = { id: string; label: string; icon?: IconName; disabled?: boolean; badge?: string };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TabsOverridableBinding =
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'tabGap'
  | 'listGap'
  | 'indicatorThickness'
  | 'listBorder'
  | 'listBorderWidth'
  | 'panelGap'
  | 'badgeSize'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'radius'
  | 'transition'
  | 'disabledOpacity';

export interface TabsProps {
  /** The tabs in order. */
  tabs: TabsTab[];
  /** One `TabPanel` per tab, in the same order, each with a matching `id`. Only the selected panel is rendered unless `keepMounted`. */
  children: React.ReactNode;
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  value?: string;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  defaultValue?: string;
  /**
   * `automatic` selects a tab as arrow keys move to it; `manual` moves focus only and
   * selects on Enter/Space. Native has no arrow-key focus movement (see the
   * component doc), so this has no observable effect on this platform; it is still
   * accepted and typed for parity with the other platforms.
   */
  activation?: TabsActivation;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows on a hardware keyboard. */
  orientation?: TabsOrientation;
  /** `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs). */
  fit?: TabsFit;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: (id: string) => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef>>;
}

export interface TabPanelProps {
  /** Must match a `tabs[].id`. */
  id: string;
  children: React.ReactNode;
}

/** Wraps one tab's content. Rendered by `Tabs`, never directly. */
export function TabPanel({ children }: TabPanelProps): React.JSX.Element {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

type TabLayout = { x: number; y: number; width: number; height: number };

function collectPanels(children: React.ReactNode): Map<string, React.ReactNode> {
  const panels = new Map<string, React.ReactNode>();
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === TabPanel) {
      const props = child.props as TabPanelProps;
      panels.set(props.id, props.children);
    }
  });
  return panels;
}

/**
 * Tabs — one region of a screen showing one of several equal-standing views, with
 * the tab list as a single stop in the accessibility order.
 *
 * When to use: Use Tabs to split a region into two to about seven alternative views
 * — the sections of a settings page, "Overview / Activity / Files" on a record.
 * Use `manual` activation when a panel is expensive to show (native has no
 * arrow-key movement, so this only documents intent — see below). Use `vertical`
 * when there are many tabs and horizontal room is short, `fill` on phones for two
 * to four tabs. Do not use Tabs for navigation between pages (a nav Landmark of
 * Links, styled as tabs if you like) or for a sequence (Stepper, planned).
 *
 * Renders a `ScrollView` (fit `start`, so overflowing tabs scroll, the selected tab
 * kept in view) or a `View` with each tab at `flex: 1` (fit `fill`) of `Pressable`s
 * with `accessibilityRole="tab"` and `accessibilityState={{ selected, disabled }}`,
 * carrying `accessibilityRole="tablist"` and `accessibilityLabel={label}` itself.
 * The indicator is an `Animated.View` positioned from each tab's measured
 * `onLayout` rect and animated between tabs over `transition` with
 * `motion.easing.standard`, snapping instead under reduced motion. Panels are
 * `View`s; only the selected one renders unless `keepMounted`, in which case the
 * others stay in the tree with `display: 'none'` and are hidden from assistive
 * technology.
 *
 * Acknowledged native limits: there is no generic key-event API on `Pressable`, so
 * arrow-key/Home/End movement and the automatic/manual distinction are a web
 * keyboard model with no RN equivalent (the same limit `Menu` and `RadioGroup`
 * document) — every tab is its own accessibility stop, and touching one always
 * selects it immediately regardless of `activation`. Tab-from-the-list-into-the-
 * panel and the panel's `tabpanel`/`aria-labelledby` pairing have no native
 * equivalent either; panels are plain `View`s.
 */
export function Tabs({
  tabs,
  children,
  label,
  value,
  defaultValue,
  activation = 'automatic',
  orientation = 'horizontal',
  fit = 'start',
  keepMounted = false,
  onChange,
  overrides,
}: TabsProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const isHorizontal = orientation === 'horizontal';
  const rtl = I18nManager.isRTL;

  const firstEnabledId = tabs.find((tab) => tab.disabled !== true)?.id;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue ?? firstEnabledId);
  const currentValue = isControlled ? value : internalValue;

  const panelsById = React.useMemo(() => collectPanels(children), [children]);

  React.useEffect(() => {
    if (__DEV__) {
      tabs.forEach((tab) => {
        if (!panelsById.has(tab.id)) {
          console.warn(`Tabs: no TabPanel with id "${tab.id}" matching tabs[].id.`);
        }
      });
      panelsById.forEach((_panel, id) => {
        if (!tabs.some((tab) => tab.id === id)) {
          console.warn(`Tabs: TabPanel id "${id}" has no matching entry in tabs[].`);
        }
      });
    }
  }, [tabs, panelsById]);

  const tabPaddingBlock = overrides?.tabPaddingBlock ? (resolveToken(t, overrides.tabPaddingBlock) as number) : t.spaceSm;
  const tabPaddingInline = overrides?.tabPaddingInline ? (resolveToken(t, overrides.tabPaddingInline) as number) : t.spaceMd;
  const tabGap = overrides?.tabGap ? (resolveToken(t, overrides.tabGap) as number) : t.layoutGapTight;
  const listGap = overrides?.listGap ? (resolveToken(t, overrides.listGap) as number) : t.layoutGapNone;
  const indicatorThickness = overrides?.indicatorThickness ? (resolveToken(t, overrides.indicatorThickness) as number) : t.borderWidthFocus;
  const listBorderColor = overrides?.listBorder ? (resolveToken(t, overrides.listBorder) as string) : t.colorBorder;
  const listBorderWidth = overrides?.listBorderWidth ? (resolveToken(t, overrides.listBorderWidth) as number) : t.borderWidthThin;
  const panelGap = overrides?.panelGap ? (resolveToken(t, overrides.panelGap) as number) : t.layoutGapLoose;
  const badgeSize = overrides?.badgeSize ? (resolveToken(t, overrides.badgeSize) as number) : t.fontSizeXs;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightMedium;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusSm;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  const tabColor = t.colorForegroundMuted;
  const tabSelectedColor = t.colorForegroundStrong;
  const tabHoverBackground = t.colorBackgroundSubtle;
  const indicatorColor = t.colorControlSelectedBackground;
  const badgeColor = t.colorForegroundMuted;
  const minTarget = t.sizeTargetComfortable;
  const focusRingColor = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;

  const tabLayoutsRef = React.useRef(new Map<string, TabLayout>());
  const hasMeasuredIndicatorRef = React.useRef(false);
  const indicatorOffset = React.useRef(new Animated.Value(0)).current;
  const indicatorExtent = React.useRef(new Animated.Value(0)).current;
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollOffsetRef = React.useRef(0);
  const viewportSizeRef = React.useRef(0);

  const updateIndicator = React.useCallback(
    (id: string): void => {
      const layout = tabLayoutsRef.current.get(id);
      if (!layout) {
        return;
      }
      const offset = isHorizontal ? layout.x : layout.y;
      const extent = isHorizontal ? layout.width : layout.height;
      if (reducedMotion || !hasMeasuredIndicatorRef.current) {
        indicatorOffset.setValue(offset);
        indicatorExtent.setValue(extent);
        hasMeasuredIndicatorRef.current = true;
        return;
      }
      Animated.parallel([
        Animated.timing(indicatorOffset, {
          toValue: offset,
          duration: transitionDuration,
          easing: toEasing(t.motionEasingStandard),
          useNativeDriver: false,
        }),
        Animated.timing(indicatorExtent, {
          toValue: extent,
          duration: transitionDuration,
          easing: toEasing(t.motionEasingStandard),
          useNativeDriver: false,
        }),
      ]).start();
    },
    [isHorizontal, reducedMotion, transitionDuration, t.motionEasingStandard, indicatorOffset, indicatorExtent],
  );

  const scrollSelectedIntoView = React.useCallback(
    (id: string): void => {
      if (fit !== 'start') {
        return;
      }
      const layout = tabLayoutsRef.current.get(id);
      const scrollView = scrollRef.current;
      if (!layout || !scrollView) {
        return;
      }
      const start = isHorizontal ? layout.x : layout.y;
      const size = isHorizontal ? layout.width : layout.height;
      const end = start + size;
      const viewStart = scrollOffsetRef.current;
      const viewEnd = viewStart + viewportSizeRef.current;
      let target: number | null = null;
      if (start < viewStart) {
        target = start;
      } else if (end > viewEnd) {
        target = end - viewportSizeRef.current;
      }
      if (target !== null) {
        const animated = !reducedMotion;
        if (isHorizontal) {
          scrollView.scrollTo({ x: Math.max(0, target), animated });
        } else {
          scrollView.scrollTo({ y: Math.max(0, target), animated });
        }
      }
    },
    [fit, isHorizontal, reducedMotion],
  );

  React.useEffect(() => {
    if (currentValue === undefined) {
      return;
    }
    updateIndicator(currentValue);
    scrollSelectedIntoView(currentValue);
  }, [currentValue, updateIndicator, scrollSelectedIntoView]);

  const handleTabLayout = (id: string, event: LayoutChangeEvent): void => {
    const { x, y, width, height } = event.nativeEvent.layout;
    tabLayoutsRef.current.set(id, { x, y, width, height });
    if (id === currentValue) {
      updateIndicator(id);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { x, y } = event.nativeEvent.contentOffset;
    scrollOffsetRef.current = isHorizontal ? x : y;
  };

  const handleViewportLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    viewportSizeRef.current = isHorizontal ? width : height;
  };

  const selectTab = (id: string): void => {
    const tab = tabs.find((candidate) => candidate.id === id);
    if (!tab || tab.disabled === true || id === currentValue) {
      return;
    }
    if (!isControlled) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  const outerStyle: ViewStyle = { flexDirection: isHorizontal ? 'column' : 'row' };

  const listContentStyle: ViewStyle = {
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: isHorizontal ? 'center' : 'stretch',
    gap: listGap,
    position: 'relative',
    borderBottomWidth: isHorizontal ? listBorderWidth : 0,
    borderRightWidth: !isHorizontal && !rtl ? listBorderWidth : 0,
    borderLeftWidth: !isHorizontal && rtl ? listBorderWidth : 0,
    borderColor: listBorderColor,
  };

  const indicatorStyle: Animated.WithAnimatedObject<ViewStyle> = isHorizontal
    ? {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: indicatorThickness,
        width: indicatorExtent,
        backgroundColor: indicatorColor,
        transform: [{ translateX: indicatorOffset }],
      }
    : {
        position: 'absolute',
        top: 0,
        ...(rtl ? { left: 0 } : { right: 0 }),
        width: indicatorThickness,
        height: indicatorExtent,
        backgroundColor: indicatorColor,
        transform: [{ translateY: indicatorOffset }],
      };

  const panelContainerStyle: ViewStyle = {
    flex: 1,
    marginTop: isHorizontal ? panelGap : 0,
    ...(!isHorizontal ? (rtl ? { marginRight: panelGap } : { marginLeft: panelGap }) : null),
  };

  const styleTokens: TabButtonStyleTokens = {
    paddingBlock: tabPaddingBlock,
    paddingInline: tabPaddingInline,
    gap: tabGap,
    minTarget,
    radius,
    hoverBackground: tabHoverBackground,
    disabledOpacity,
    focusRingColor,
    focusRingWidth,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeightMultiplier,
    color: tabColor,
    selectedColor: tabSelectedColor,
    badgeColor,
    badgeSize,
  };

  const tabButtons = tabs.map((tab) => (
    <TabButton
      key={tab.id}
      tab={tab}
      selected={tab.id === currentValue}
      fill={fit === 'fill'}
      styleTokens={styleTokens}
      onSelect={selectTab}
      onMeasured={handleTabLayout}
    />
  ));

  const list =
    fit === 'start' ? (
      <ScrollView
        ref={scrollRef}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleViewportLayout}
        accessibilityRole="tablist"
        accessibilityLabel={label}
        testID="Tabs.tablist"
      >
        <View style={listContentStyle}>
          {tabButtons}
          <Animated.View style={indicatorStyle} testID="Tabs.indicator" />
        </View>
      </ScrollView>
    ) : (
      <View
        onLayout={handleViewportLayout}
        accessibilityRole="tablist"
        accessibilityLabel={label}
        testID="Tabs.tablist"
        style={listContentStyle}
      >
        {tabButtons}
        <Animated.View style={indicatorStyle} testID="Tabs.indicator" />
      </View>
    );

  return (
    <View testID="Tabs" style={outerStyle}>
      {list}
      <View style={panelContainerStyle}>
        {tabs.map((tab) => {
          const selected = tab.id === currentValue;
          if (!selected && !keepMounted) {
            return null;
          }
          return (
            <View
              key={tab.id}
              testID="Tabs.panel"
              style={{ display: selected ? 'flex' : 'none' }}
              accessibilityElementsHidden={!selected}
              importantForAccessibility={selected ? 'auto' : 'no-hide-descendants'}
            >
              {panelsById.get(tab.id)}
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface TabButtonStyleTokens {
  paddingBlock: number;
  paddingInline: number;
  gap: number;
  minTarget: number;
  radius: number;
  hoverBackground: string;
  disabledOpacity: number;
  focusRingColor: string;
  focusRingWidth: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeightMultiplier: number;
  color: string;
  selectedColor: string;
  badgeColor: string;
  badgeSize: number;
}

interface TabButtonProps {
  tab: TabsTab;
  selected: boolean;
  fill: boolean;
  styleTokens: TabButtonStyleTokens;
  onSelect: (id: string) => void;
  onMeasured: (id: string, event: LayoutChangeEvent) => void;
}

/** One tab. Its own component so focus/press state does not re-render the whole list. */
function TabButton({ tab, selected, fill, styleTokens: s, onSelect, onMeasured }: TabButtonProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const disabled = tab.disabled === true;
  const foreground = selected ? s.selectedColor : s.color;

  const rowStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: fill ? 1 : 0,
    flexBasis: fill ? 0 : undefined,
    justifyContent: fill ? 'center' : 'flex-start',
    gap: s.gap,
    minHeight: s.minTarget,
    minWidth: s.minTarget,
    paddingVertical: s.paddingBlock,
    paddingHorizontal: s.paddingInline,
    borderRadius: s.radius,
    backgroundColor: pressed && !disabled ? s.hoverBackground : 'transparent',
    borderWidth: s.focusRingWidth,
    borderColor: focused ? s.focusRingColor : 'transparent',
    opacity: disabled ? s.disabledOpacity : 1,
  });

  const labelStyle: TextStyle = {
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    fontWeight: toFontWeight(s.fontWeight),
    lineHeight: toLineHeight(s.fontSize, s.lineHeightMultiplier),
    color: foreground,
  };

  const badgeStyle: TextStyle = {
    fontFamily: s.fontFamily,
    fontSize: s.badgeSize,
    lineHeight: toLineHeight(s.badgeSize, s.lineHeightMultiplier),
    color: s.badgeColor,
  };

  const accessibleName = tab.badge !== undefined ? `${tab.label}, ${tab.badge}` : tab.label;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={accessibleName}
      accessibilityState={{ selected, disabled }}
      // Never the native `disabled` prop: it would drop the tab from the focus order.
      onPress={() => {
        if (!disabled) {
          onSelect(tab.id);
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onLayout={(event) => onMeasured(tab.id, event)}
      style={rowStyle}
      testID="Tabs.tab"
    >
      {tab.icon !== undefined ? (
        <View testID="Tabs.tabIcon" accessibilityElementsHidden importantForAccessibility="no">
          <Icon name={tab.icon} size="sm" color={foreground} />
        </View>
      ) : null}
      <RNText numberOfLines={1} style={labelStyle} testID="Tabs.tabLabel">
        {tab.label}
      </RNText>
      {tab.badge !== undefined ? (
        <RNText testID="Tabs.tabBadge" style={badgeStyle} accessibilityElementsHidden importantForAccessibility="no">
          {tab.badge}
        </RNText>
      ) : null}
    </Pressable>
  );
}
