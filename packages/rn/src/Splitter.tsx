import * as React from 'react';
import { Animated, PanResponder, View, useWindowDimensions } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type SplitterOrientation = 'horizontal' | 'vertical';
export type SplitterStackBelow = 'prose' | 'content' | 'never';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type SplitterOverridableBinding =
  | 'separatorSize'
  | 'separatorColor'
  | 'handleSize'
  | 'gripLength'
  | 'collapseButtonOffset'
  | 'paneMinTarget'
  | 'transition';

export interface SplitterProps {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. */
  primary: React.ReactNode;
  /** The second pane, which takes the remaining space. */
  secondary: React.ReactNode;
  /** Controlled size of the primary pane as a percentage of the container (0-100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /** Smallest primary size, percent. Below this the pane collapses instead (when `collapsible`). */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Arrow-key (accessibility increment/decrement action) increment, percent. */
  step?: number | undefined;
  /** The primary pane can collapse to nothing: drag past the minimum, the separator's activate action, or the collapse button. Activating again restores the last size. */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** When set, the size and collapsed state are remembered per session under this key, so a sidebar stays where it was left across remounts. */
  persistKey?: string | undefined;
  /** Below this layout width a horizontal splitter stacks its panes and the separator becomes inert (a phone has no room for two panes side by side). Ignored when `orientation` is `vertical`, which is already stacked. */
  stackBelow?: SplitterStackBelow | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired continuously while dragging and on each accessibility step action, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired once when a drag ends, with the final size. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}

const COPY = {
  collapse: (label: string): string => `Collapse ${label}`,
  expand: (label: string): string => `Expand ${label}`,
  sizeText: (percent: number): string => `${Math.round(percent)}%`,
} as const;

/** Per-`persistKey` memory. `AsyncStorage` is not a permitted runtime dependency for
 * this package (see the package's dependency rule), so persistence is in-memory only
 * — it survives a remount but not an app restart. */
const persistedSizes = new Map<string, { size: number; collapsed: boolean }>();

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Splitter — a separator the keyboard (and a pointer, and assistive tech) can move,
 * dividing two panes and reporting how much of the container the primary pane holds.
 *
 * When to use: Use a Splitter when two regions compete for space and the right split
 * depends on the task — a navigation tree beside content, a list beside a detail
 * view. Set sensible `minSize`/`maxSize`, and use `persistKey` so the choice sticks.
 * Use `collapsible` for sidebars. Do not use it on phone-width layouts (it stacks
 * below `stackBelow`) or for static content that never needs resizing.
 *
 * Renders a `View` row (or column) with the primary pane sized by `flexBasis`
 * percent, a separator `View` carrying a `PanResponder` plus
 * `accessibilityRole="adjustable"`, `accessibilityValue` and `accessibilityActions`
 * (`increment`/`decrement` mapped to `step`, `setMinimum`/`setMaximum` for the
 * keyboard model's Home/End, and — when `collapsible` — `activate` to toggle
 * collapse), and the secondary pane at `flex: 1`. A visible collapse `Button`
 * (`ghost`, `sm`, `iconOnly`) sits on the separator as the primary, always-reachable
 * way to collapse or restore. Dragging updates the size continuously with no
 * transition; collapsing and restoring (by button, activate action, or dragging past
 * `minSize`) animates the primary pane's `flexBasis` over `transition`, skipped under
 * reduced motion. A pane never shrinks below `paneMinTarget` on the drag axis before
 * collapsing. Below `stackBelow` (only meaningful for `orientation="horizontal"`,
 * which is already side by side) the panes stack in source order at full width and
 * the separator is not rendered, per the platform notes. Tab reaches the two panes'
 * content and the separator normally; there is no native equivalent for the keyboard
 * model's F6 pane-cycling convenience, and Home/End/Enter are exposed only as
 * accessibility actions rather than physical key handlers — acknowledged platform
 * limits.
 */
export function Splitter({
  label,
  orientation = 'horizontal',
  primary,
  secondary,
  size,
  defaultSize = 30,
  minSize = 10,
  maxSize = 90,
  step = 2,
  collapsible = false,
  collapsed,
  persistKey,
  stackBelow = 'prose',
  overrides,
  onSizeChange,
  onSizeChangeEnd,
  onCollapseChange,
}: SplitterProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const persisted = persistKey !== undefined ? persistedSizes.get(persistKey) : undefined;

  const [internalSize, setInternalSize] = React.useState<number>(() => clamp(persisted?.size ?? defaultSize, minSize, maxSize));
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(() => persisted?.collapsed ?? false);
  const [dragging, setDragging] = React.useState(false);
  const lastSizeRef = React.useRef<number>(persisted?.size ?? defaultSize);

  const isCollapsed = collapsed ?? internalCollapsed;
  const baseSize = clamp(size ?? internalSize, minSize, maxSize);
  const effectiveSize = isCollapsed ? 0 : baseSize;

  React.useEffect(() => {
    if (__DEV__ && minSize >= maxSize) {
      console.warn(`Splitter: minSize (${minSize}) must be less than maxSize (${maxSize}).`);
    }
  }, [minSize, maxSize]);

  const persist = (nextSize: number, nextCollapsed: boolean): void => {
    if (persistKey !== undefined) {
      persistedSizes.set(persistKey, { size: nextSize, collapsed: nextCollapsed });
    }
  };

  const commitSize = (raw: number, dragActive: boolean, end: boolean): void => {
    if (dragActive) {
      skipAnimationRef.current = true;
    }
    if (collapsible && raw < minSize) {
      if (!isCollapsed) {
        if (collapsed === undefined) {
          setInternalCollapsed(true);
        }
        onCollapseChange?.(true);
        persist(lastSizeRef.current, true);
      }
      onSizeChange?.(0);
      if (end) {
        onSizeChangeEnd?.(0);
      }
      return;
    }
    const clamped = clamp(raw, minSize, maxSize);
    if (isCollapsed) {
      if (collapsed === undefined) {
        setInternalCollapsed(false);
      }
      onCollapseChange?.(false);
    }
    if (size === undefined) {
      setInternalSize(clamped);
    }
    lastSizeRef.current = clamped;
    persist(clamped, false);
    onSizeChange?.(clamped);
    if (end) {
      onSizeChangeEnd?.(clamped);
    }
  };

  const toggleCollapse = (): void => {
    if (!collapsible) {
      return;
    }
    const next = !isCollapsed;
    if (collapsed === undefined) {
      setInternalCollapsed(next);
    }
    onCollapseChange?.(next);
    onSizeChange?.(next ? 0 : lastSizeRef.current);
    persist(lastSizeRef.current, next);
  };

  const commitSizeRef = React.useRef(commitSize);
  commitSizeRef.current = commitSize;

  const latest = React.useRef({ baseSize, minSize, isCollapsed, orientation });
  latest.current = { baseSize, minSize, isCollapsed, orientation };

  const containerExtentRef = React.useRef(0);
  const handleContainerLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    containerExtentRef.current = orientation === 'horizontal' ? width : height;
  };

  const dragStartRef = React.useRef(baseSize);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(latest.current.orientation === 'horizontal' ? gesture.dx : gesture.dy) > 2,
      onPanResponderGrant: () => {
        dragStartRef.current = latest.current.isCollapsed ? latest.current.minSize : latest.current.baseSize;
        setDragging(true);
      },
      onPanResponderMove: (_evt, gesture) => {
        const extent = containerExtentRef.current;
        if (extent <= 0) {
          return;
        }
        const delta = latest.current.orientation === 'horizontal' ? gesture.dx : gesture.dy;
        const raw = dragStartRef.current + (delta / extent) * 100;
        commitSizeRef.current(raw, true, false);
      },
      onPanResponderRelease: (_evt, gesture) => {
        setDragging(false);
        const extent = containerExtentRef.current;
        const delta = latest.current.orientation === 'horizontal' ? gesture.dx : gesture.dy;
        const raw = extent > 0 ? dragStartRef.current + (delta / extent) * 100 : dragStartRef.current;
        commitSizeRef.current(raw, true, true);
      },
      onPanResponderTerminate: () => {
        setDragging(false);
      },
    }),
  ).current;

  const handleSeparatorAction = (event: AccessibilityActionEvent): void => {
    const name = event.nativeEvent.actionName;
    const current = isCollapsed ? minSize : baseSize;
    if (name === 'increment') {
      commitSize(current + step, false, true);
    } else if (name === 'decrement') {
      commitSize(current - step, false, true);
    } else if (name === 'setMinimum') {
      commitSize(minSize, false, true);
    } else if (name === 'setMaximum') {
      commitSize(maxSize, false, true);
    } else if (name === 'activate' && collapsible) {
      toggleCollapse();
    }
  };

  // Style bindings.
  const separatorSize = overrides?.separatorSize ? (resolveToken(t, overrides.separatorSize) as number) : t.space1;
  const separatorColor = overrides?.separatorColor ? (resolveToken(t, overrides.separatorColor) as string) : t.colorBorder;
  const handleSize = overrides?.handleSize ? (resolveToken(t, overrides.handleSize) as number) : t.space3;
  const gripLength = overrides?.gripLength ? (resolveToken(t, overrides.gripLength) as number) : t.space6;
  const collapseButtonOffset = overrides?.collapseButtonOffset
    ? (resolveToken(t, overrides.collapseButtonOffset) as number)
    : t.space2;
  const paneMinTarget = overrides?.paneMinTarget ? (resolveToken(t, overrides.paneMinTarget) as number) : t.sizeTargetComfortable;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  // Locked: accessibility-bearing, never overridable. `focusRing`/`focusRingWidth`
  // have no effect here: the separator, like `Slider`'s thumb, must be a plain `View`
  // carrying the `PanResponder` directly (spreading `panHandlers` onto `Pressable`
  // fights its own gesture responder), and a bare `View` has no focus events on this
  // platform — the collapse `Button` below is a real `Pressable` and gets the full
  // focus-visible treatment instead.
  const separatorActiveColor = t.colorControlSelectedBackground;
  const gripColor = t.colorBorderStrong;
  const minTarget = t.sizeTargetMin;

  const skipAnimationRef = React.useRef(false);
  const sizeAnim = React.useRef(new Animated.Value(effectiveSize)).current;

  React.useEffect(() => {
    const immediate = skipAnimationRef.current || reducedMotion;
    skipAnimationRef.current = false;
    if (immediate) {
      sizeAnim.setValue(effectiveSize);
      return undefined;
    }
    const animation = Animated.timing(sizeAnim, {
      toValue: effectiveSize,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      // react-native-web has no native animated module.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [effectiveSize, reducedMotion, sizeAnim, transitionDuration, t.motionEasingStandard]);

  const stackThreshold = stackBelow === 'prose' ? t.layoutMaxWidthProse : stackBelow === 'content' ? t.layoutMaxWidthContent : null;
  const stacked = orientation === 'horizontal' && stackThreshold !== null && windowWidth < stackThreshold;

  const containerStyle: ViewStyle = {
    flexDirection: stacked ? 'column' : orientation === 'horizontal' ? 'row' : 'column',
    flex: 1,
  };

  if (stacked) {
    return (
      <View testID="Splitter" style={containerStyle} onLayout={handleContainerLayout}>
        <View testID="Splitter.primaryPane">{primary}</View>
        <View testID="Splitter.secondaryPane">{secondary}</View>
      </View>
    );
  }

  const primaryPaneStyle: Animated.WithAnimatedValue<ViewStyle> = {
    flexBasis: sizeAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
    flexGrow: 0,
    flexShrink: 0,
    minWidth: orientation === 'horizontal' && !isCollapsed ? paneMinTarget : undefined,
    minHeight: orientation === 'vertical' && !isCollapsed ? paneMinTarget : undefined,
    overflow: 'hidden',
  };

  const secondaryPaneStyle: ViewStyle = { flex: 1 };

  const separatorLineStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          width: separatorSize,
          height: '100%',
          backgroundColor: dragging ? separatorActiveColor : separatorColor,
          position: 'relative',
        }
      : {
          width: '100%',
          height: separatorSize,
          backgroundColor: dragging ? separatorActiveColor : separatorColor,
          position: 'relative',
        };

  const hitAreaSize = Math.max(handleSize, minTarget);
  const hitExtra = Math.max(0, Math.ceil((hitAreaSize - separatorSize) / 2));
  const dragHitSlop =
    orientation === 'horizontal'
      ? { left: hitExtra, right: hitExtra, top: 0, bottom: 0 }
      : { top: hitExtra, bottom: hitExtra, left: 0, right: 0 };

  const handleOverlayStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: hitAreaSize,
          marginLeft: -(hitAreaSize / 2),
        }
      : {
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: hitAreaSize,
          marginTop: -(hitAreaSize / 2),
        };

  const gripStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: separatorSize,
          height: gripLength,
          marginLeft: -(separatorSize / 2),
          marginTop: -(gripLength / 2),
          backgroundColor: gripColor,
        }
      : {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: gripLength,
          height: separatorSize,
          marginLeft: -(gripLength / 2),
          marginTop: -(separatorSize / 2),
          backgroundColor: gripColor,
        };

  const collapseButtonPositionStyle: ViewStyle =
    orientation === 'horizontal'
      ? { position: 'absolute', top: collapseButtonOffset, left: '50%', transform: [{ translateX: -(minTarget / 2) }] }
      : { position: 'absolute', left: collapseButtonOffset, top: '50%', transform: [{ translateY: -(minTarget / 2) }] };

  const collapseIconName: IconName =
    orientation === 'horizontal'
      ? isCollapsed
        ? 'chevron-right'
        : 'chevron-left'
      : isCollapsed
        ? 'chevron-down'
        : 'chevron-up';

  const separatorActions = [
    { name: 'increment', label: 'Increment' },
    { name: 'decrement', label: 'Decrement' },
    { name: 'setMinimum', label: 'Set to minimum' },
    { name: 'setMaximum', label: 'Set to maximum' },
    ...(collapsible ? [{ name: 'activate', label: isCollapsed ? COPY.expand(label) : COPY.collapse(label) }] : []),
  ];

  return (
    <View testID="Splitter" style={containerStyle} onLayout={handleContainerLayout}>
      <Animated.View
        testID="Splitter.primaryPane"
        style={primaryPaneStyle}
        accessibilityElementsHidden={isCollapsed}
        importantForAccessibility={isCollapsed ? 'no-hide-descendants' : 'auto'}
        pointerEvents={isCollapsed ? 'none' : 'auto'}
      >
        {primary}
      </Animated.View>
      <View
        testID="Splitter.separator"
        accessible
        focusable
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: minSize, max: maxSize, now: effectiveSize, text: COPY.sizeText(effectiveSize) }}
        accessibilityActions={separatorActions}
        onAccessibilityAction={handleSeparatorAction}
        hitSlop={dragHitSlop}
        {...panResponder.panHandlers}
        style={separatorLineStyle}
      >
        <View testID="Splitter.handle" pointerEvents="none" style={handleOverlayStyle} />
        <View pointerEvents="none" style={gripStyle} />
        {collapsible ? (
          <View testID="Splitter.collapseButton" style={collapseButtonPositionStyle}>
            <Button
              label={isCollapsed ? COPY.expand(label) : COPY.collapse(label)}
              variant="ghost"
              size="sm"
              iconOnly
              leadingIcon={<Icon name={collapseIconName} color={t.colorForegroundMuted} />}
              onPress={toggleCollapse}
            />
          </View>
        ) : null}
      </View>
      <View testID="Splitter.secondaryPane" style={secondaryPaneStyle}>
        {secondary}
      </View>
    </View>
  );
}
