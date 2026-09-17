import * as React from 'react';
import { Animated, I18nManager, Platform, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import type {
  LayoutChangeEvent,
  PressableStateCallbackType,
  ScrollEvent,
  ScrollViewInstance,
  TextStyle,
  ViewInstance,
  ViewStyle,
} from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

export type TabsActivation = 'automatic' | 'manual';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsFit = 'start' | 'fill';

/**
 * One tab. `badge` is a short count or status shown after the label ("3", "New"). The icon is
 * an Icon at `size: md` in the tab's current foreground color.
 */
export type TabsItem = {
  id: string;
  label: string;
  icon?: IconName | undefined;
  disabled?: boolean | undefined;
  badge?: string | undefined;
};

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TabsOverridableBinding =
  | 'tabPaddingBlock'
  | 'tabPaddingInline'
  | 'tabGap'
  | 'listGap'
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
  /** The tabs in order. `badge` is a short count or status shown after the label ("3", "New"). */
  tabs: TabsItem[];
  /** One `TabPanel` per tab, in the same order, each with a matching `id`. Only the selected panel is rendered unless `keepMounted`. */
  children: React.ReactNode;
  /** Accessible name of the tab list ("Account sections"). Not shown visually. */
  label: string;
  /** Controlled selected tab id. Omit for uncontrolled. */
  value?: string | undefined;
  /** Initially selected tab id. Defaults to the first enabled tab. */
  defaultValue?: string | undefined;
  /**
   * `automatic` selects a tab as arrow keys move to it (fine when panels are cheap);
   * `manual` moves focus only and selects on Enter/Space (use when a panel loads data).
   * Arrow keys reach a tab list only through react-native-web or a hardware keyboard;
   * a touch always selects the touched tab.
   */
  activation?: TabsActivation | undefined;
  /** Vertical tab lists sit beside their panels and use Up/Down arrows. */
  orientation?: TabsOrientation | undefined;
  /** `start` packs tabs at the start; `fill` stretches them across the width (phones, two to four tabs). */
  fit?: TabsFit | undefined;
  /** Keep unselected panels in the tree (hidden) so their state survives switching. */
  keepMounted?: boolean | undefined;
  /** Fired when the selected tab changes, with the new id. */
  onChange?: ((value: string) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TabsOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

export interface TabPanelProps {
  /** Must match a `tabs[].id`. */
  id: string;
  children?: React.ReactNode | undefined;
}

const COPY = {
  position: (index: number, total: number): string =>
    '{index} of {total}'.replace('{index}', String(index)).replace('{total}', String(total)),
} as const;

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

const isWeb = Platform.OS === 'web';

/**
 * Tabs — one region of a screen showing one of several equal-standing views.
 *
 * When to use: two to about seven alternative views of one region — the sections of a
 * settings page, "Overview / Activity / Files" on a record. `manual` activation when a
 * panel is expensive to show, `vertical` when there are many tabs and horizontal room is
 * short, `fill` on phones for two to four tabs. Not for navigation between pages (a nav
 * Landmark of Links), not for a sequence (Stepper), not for panels the user must compare.
 *
 * Renders a `ScrollView` (fit `start`, and every vertical list: overflowing tabs scroll, the
 * selected tab kept in view) or a row `View` whose tabs share the width (horizontal fit `fill`) of `Pressable`s
 * with `accessibilityRole="tab"`, `accessibilityState={{ selected, disabled }}` and
 * `accessibilityValue` from `copy.position`; the list carries `accessibilityRole="tablist"`
 * and `accessibilityLabel={label}`. The indicator is an `Animated.View` positioned from
 * each tab's measured layout and moved over `transition` with `motion.easing.standard`,
 * snapping under reduced motion. Panels are `View`s; only the selected one renders
 * unless `keepMounted`, when the rest stay mounted with `display: 'none'` and hidden
 * from assistive technology.
 *
 * Keyboard: on react-native-web the list handles `onKeyDown` — arrows along the
 * orientation move focus between enabled tabs and wrap (selecting under `automatic`),
 * Home/End jump, Enter/Space press the focused tab, and only the selected tab is a tab
 * stop (roving). On iOS/Android there is no key event on `View`/`Pressable`, so every
 * tab is its own accessibility stop, as on native, and a press always selects.
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
  ref,
}: TabsProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const isHorizontal = orientation === 'horizontal';
  // `fill` is horizontal only: vertical tabs always span the list's inline size.
  const fill = fit === 'fill' && isHorizontal;
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
          console.warn(`Tabs: TabPanel id "${id}" has no matching entry in tabs[]; it is not rendered.`);
        }
      });
    }
  }, [tabs, panelsById]);

  const tabPaddingBlock = overrides?.tabPaddingBlock ? (resolveToken(t, overrides.tabPaddingBlock) as number) : t.spaceSm;
  const tabPaddingInline = overrides?.tabPaddingInline ? (resolveToken(t, overrides.tabPaddingInline) as number) : t.spaceMd;
  const tabGap = overrides?.tabGap ? (resolveToken(t, overrides.tabGap) as number) : t.layoutGapTight;
  const listGap = overrides?.listGap ? (resolveToken(t, overrides.listGap) as number) : t.layoutGapNone;
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

  // Locked bindings: never read from overrides.
  const indicatorColor = t.colorControlSelectedBackground;
  const indicatorThickness = t.borderWidthFocus;

  const tabLayoutsRef = React.useRef(new Map<string, TabLayout>());
  const tabRefs = React.useRef(new Map<string, ViewInstance>());
  const hasMeasuredIndicatorRef = React.useRef(false);
  const indicatorOffset = React.useRef(new Animated.Value(0)).current;
  const indicatorExtent = React.useRef(new Animated.Value(0)).current;
  const scrollRef = React.useRef<ScrollViewInstance>(null);
  const scrollOffsetRef = React.useRef(0);
  const viewportSizeRef = React.useRef(0);
  const focusedIdRef = React.useRef<string | undefined>(undefined);

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
      const easing = toEasing(t.motionEasingStandard);
      Animated.parallel([
        Animated.timing(indicatorOffset, { toValue: offset, duration: transitionDuration, easing, useNativeDriver: false }),
        Animated.timing(indicatorExtent, { toValue: extent, duration: transitionDuration, easing, useNativeDriver: false }),
      ]).start();
    },
    [isHorizontal, reducedMotion, transitionDuration, t.motionEasingStandard, indicatorOffset, indicatorExtent],
  );

  const scrollSelectedIntoView = React.useCallback(
    (id: string): void => {
      if (fill) {
        return;
      }
      const layout = tabLayoutsRef.current.get(id);
      const scrollView = scrollRef.current;
      if (!layout || !scrollView) {
        return;
      }
      const start = isHorizontal ? layout.x : layout.y;
      const end = start + (isHorizontal ? layout.width : layout.height);
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
        scrollView.scrollTo(isHorizontal ? { x: Math.max(0, target), animated } : { y: Math.max(0, target), animated });
      }
    },
    [fill, isHorizontal, reducedMotion],
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

  const handleScroll = (event: ScrollEvent): void => {
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

  // react-native-web only: View has no key events on iOS/Android.
  const handleKeyDown = (event: { key?: string; nativeEvent?: { key?: string }; preventDefault?: () => void }): void => {
    const key = event.key ?? event.nativeEvent?.key;
    const enabled = tabs.filter((tab) => tab.disabled !== true);
    if (enabled.length === 0 || key === undefined) {
      return;
    }
    const fromId = focusedIdRef.current ?? currentValue;
    const fromIndex = enabled.findIndex((tab) => tab.id === fromId);
    const nextKey = isHorizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
    const prevKey = isHorizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    let targetIndex: number;
    if (key === nextKey) {
      targetIndex = fromIndex < 0 ? 0 : (fromIndex + 1) % enabled.length;
    } else if (key === prevKey) {
      targetIndex = fromIndex <= 0 ? enabled.length - 1 : fromIndex - 1;
    } else if (key === 'Home') {
      targetIndex = 0;
    } else if (key === 'End') {
      targetIndex = enabled.length - 1;
    } else {
      return;
    }
    event.preventDefault?.();
    const target = enabled[targetIndex]!;
    tabRefs.current.get(target.id)?.focus();
    if (activation === 'automatic') {
      selectTab(target.id);
    }
  };

  const keyProps: Record<string, unknown> = isWeb ? { onKeyDown: handleKeyDown } : {};

  const styleTokens: TabButtonStyleTokens = {
    paddingBlock: tabPaddingBlock,
    paddingInline: tabPaddingInline,
    gap: tabGap,
    minTarget: t.sizeTargetComfortable,
    radius,
    hoverBackground: t.colorBackgroundSubtle,
    disabledOpacity,
    focusRingColor: t.colorBorderFocus,
    focusRingWidth: t.borderWidthFocus,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeightMultiplier,
    color: t.colorForegroundMuted,
    selectedColor: t.colorForegroundStrong,
    badgeColor: t.colorForegroundMuted,
    badgeSize,
  };

  // The roving tab stop on web: the selected tab, or the first enabled one when nothing is selected.
  const tabStopId = tabs.some((tab) => tab.id === currentValue && tab.disabled !== true) ? currentValue : firstEnabledId;

  const tabButtons = tabs.map((tab, index) => (
    <TabButton
      key={tab.id}
      tab={tab}
      position={COPY.position(index + 1, tabs.length)}
      selected={tab.id === currentValue}
      tabStop={tab.id === tabStopId}
      fill={fill}
      horizontal={isHorizontal}
      styleTokens={styleTokens}
      onSelect={selectTab}
      onMeasured={handleTabLayout}
      onFocusChange={(id, focused) => {
        focusedIdRef.current = focused ? id : focusedIdRef.current === id ? undefined : focusedIdRef.current;
      }}
      registerRef={(id, instance) => {
        if (instance) {
          tabRefs.current.set(id, instance);
        } else {
          tabRefs.current.delete(id);
        }
      }}
    />
  ));

  const listContentStyle: ViewStyle = {
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: 'stretch',
    flexGrow: fill ? 1 : 0,
    gap: listGap,
    position: 'relative',
    borderBottomWidth: isHorizontal ? listBorderWidth : 0,
    borderRightWidth: !isHorizontal && !rtl ? listBorderWidth : 0,
    borderLeftWidth: !isHorizontal && rtl ? listBorderWidth : 0,
    borderColor: listBorderColor,
  };

  const indicatorStyle: Animated.WithAnimatedValue<ViewStyle> = isHorizontal
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

  const indicator = (
    <Animated.View
      style={indicatorStyle}
      testID="Tabs.indicator"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );

  const list = !fill ? (
      <ScrollView
        ref={scrollRef}
        horizontal={isHorizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // literal-ok: one frame at 60 Hz, not a size
        onLayout={handleViewportLayout}
        style={{ flexGrow: 0 }}
      >
        <View {...keyProps} accessibilityRole="tablist" accessibilityLabel={label} testID="Tabs.tablist" style={listContentStyle}>
          {tabButtons}
          {indicator}
        </View>
      </ScrollView>
    ) : (
      <View
        onLayout={handleViewportLayout}
        {...keyProps}
        accessibilityRole="tablist"
        accessibilityLabel={label}
        testID="Tabs.tablist"
        style={listContentStyle}
      >
        {tabButtons}
        {indicator}
      </View>
    );

  return (
    <View ref={ref} testID="Tabs" style={{ flexDirection: isHorizontal ? 'column' : 'row', gap: panelGap }}>
      {list}
      <View style={{ flex: 1 }}>
        {tabs.map((tab) => {
          const selected = tab.id === currentValue;
          if ((!selected && !keepMounted) || !panelsById.has(tab.id)) {
            return null;
          }
          return (
            <View
              key={tab.id}
              testID="Tabs.panel"
              accessibilityLabel={tab.label}
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
  tab: TabsItem;
  position: string;
  selected: boolean;
  tabStop: boolean;
  fill: boolean;
  horizontal: boolean;
  styleTokens: TabButtonStyleTokens;
  onSelect: (id: string) => void;
  onMeasured: (id: string, event: LayoutChangeEvent) => void;
  onFocusChange: (id: string, focused: boolean) => void;
  registerRef: (id: string, instance: ViewInstance | null) => void;
}

/** One tab. Its own component so focus/hover state does not re-render the whole list. */
function TabButton({
  tab,
  position,
  selected,
  tabStop,
  fill,
  horizontal,
  styleTokens: s,
  onSelect,
  onMeasured,
  onFocusChange,
  registerRef,
}: TabButtonProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const disabled = tab.disabled === true;
  const foreground = selected ? s.selectedColor : s.color;

  const rowStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: fill ? 1 : 0,
    flexShrink: fill ? 1 : 0,
    flexBasis: fill ? 0 : 'auto',
    justifyContent: fill && horizontal ? 'center' : 'flex-start',
    gap: s.gap,
    minHeight: s.minTarget,
    minWidth: s.minTarget,
    paddingVertical: s.paddingBlock,
    paddingHorizontal: s.paddingInline,
    borderRadius: s.radius,
    backgroundColor: (hovered || pressed) && !disabled ? s.hoverBackground : 'transparent',
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

  // The badge is part of the name: label, a plain space, badge ("Inbox 3").
  const accessibleName = tab.badge !== undefined ? `${tab.label} ${tab.badge}` : tab.label;
  // Roving tab stop on react-native-web; on native every tab stays its own stop.
  const webFocusProps: Record<string, unknown> = Platform.OS === 'web' ? { focusable: tabStop && !disabled } : {};

  return (
    <Pressable
      ref={(instance: ViewInstance | null) => registerRef(tab.id, instance)}
      accessibilityRole="tab"
      accessibilityLabel={accessibleName}
      accessibilityState={{ selected, disabled }}
      accessibilityValue={{ text: position }}
      {...webFocusProps}
      // Never the native `disabled` prop: it would drop the tab from the accessibility order.
      onPress={() => {
        if (!disabled) {
          onSelect(tab.id);
        }
      }}
      onFocus={() => {
        setFocused(true);
        onFocusChange(tab.id, true);
      }}
      onBlur={() => {
        setFocused(false);
        onFocusChange(tab.id, false);
      }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onLayout={(event) => onMeasured(tab.id, event)}
      style={rowStyle}
      testID="Tabs.tab"
    >
      {tab.icon !== undefined ? (
        <View testID="Tabs.tabIcon" accessibilityElementsHidden importantForAccessibility="no">
          <Icon name={tab.icon} size="md" color={foreground} />
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
