import * as React from 'react';
import { Animated, PanResponder, View } from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text } from './Text';
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
  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /** Smallest primary size, percent. With `collapsible`, dragging or stepping below it collapses the pane instead of clamping; otherwise it is the hard floor. */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Increment of the increment/decrement accessibility actions, percent. */
  step?: number | undefined;
  /** The primary pane can collapse to nothing: drag past the minimum, the separator's activate action, or the collapse button. Activating again restores the last size. */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. */
  collapsed?: boolean | undefined;
  /** Initial collapsed state when uncontrolled. */
  defaultCollapsed?: boolean | undefined;
  /** When set, the size and collapsed state are remembered under this key in a module-level memory map: survives remounts, not a restart. */
  persistKey?: string | undefined;
  /** Below this width of the splitter's own box a horizontal splitter stacks its panes and the separator is not rendered. A vertical splitter never stacks. */
  stackBelow?: SplitterStackBelow | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<SplitterOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired continuously while dragging and on each step action, with the primary size in percent. */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired with the final size once when a drag ends and after each step action. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}

const COPY = {
  collapse: (label: string): string => `Collapse ${label}`,
  expand: (label: string): string => `Expand ${label}`,
  sizeText: (percent: number): string => `${percent}%`,
} as const;

const STACK_BELOW = {
  prose: 'layoutMaxWidthProse',
  content: 'layoutMaxWidthContent',
} as const;

/** Per-`persistKey` memory. No storage dependency is permitted in this package, so it
 * survives a remount but not an app restart. */
const persisted = new Map<string, { size: number; collapsed: boolean }>();

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function renderPane(content: React.ReactNode): React.ReactNode {
  return typeof content === 'string' || typeof content === 'number' ? <Text>{content}</Text> : content;
}

/**
 * Splitter — a separator that moves the boundary between two panes, reporting how much
 * of the container the primary pane holds.
 *
 * When to use: two regions compete for space and the right split depends on the task
 * (a navigation tree beside content, a list beside a detail view). Set sensible
 * `minSize`/`maxSize`, use `persistKey` so the choice sticks, and `collapsible` for
 * sidebars. Not for phone-only screens (it stacks below `stackBelow`) or static layout.
 *
 * A `View` row (or column): the primary pane at `flexBasis` percent, the separator
 * `View` carrying a `PanResponder` (as Slider's thumb) with `accessibilityRole="adjustable"`,
 * `accessibilityValue` and `accessibilityActions` — increment/decrement by `step`,
 * setMinimum/setMaximum (Home/End) and, when `collapsible`, activate (Enter) — the
 * gesture alternative; then the secondary pane at `flex: 1`. The collapse `Button`
 * (ghost, sm, iconOnly) sits on the separator. While collapsed the pane is hidden from
 * assistive tech and touch, and drag and the step actions do nothing; only activate or
 * the button restores. Collapse and restore animate over `transition` (skipped under
 * reduced motion); dragging has no transition. Known platform limits: the separator is
 * a plain `View`, so it shows no keyboard focus ring (the Button does), and F6 pane
 * cycling has no native equivalent.
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
  defaultCollapsed = false,
  persistKey,
  stackBelow = 'prose',
  overrides,
  ref,
  onSizeChange,
  onSizeChangeEnd,
  onCollapseChange,
}: SplitterProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const horizontal = orientation === 'horizontal';

  const [internalSize, setInternalSize] = React.useState<number>(() => {
    const stored = persistKey !== undefined ? persisted.get(persistKey) : undefined;
    return stored?.size ?? defaultSize;
  });
  const [internalCollapsed, setInternalCollapsed] = React.useState<boolean>(() => {
    const stored = persistKey !== undefined ? persisted.get(persistKey) : undefined;
    return stored?.collapsed ?? defaultCollapsed;
  });
  const [dragging, setDragging] = React.useState(false);
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);
  const [separatorOffset, setSeparatorOffset] = React.useState(0);
  const [buttonExtent, setButtonExtent] = React.useState(0);

  const isCollapsed = collapsible && (collapsed ?? internalCollapsed);
  const baseSize = clamp(size ?? internalSize, minSize, maxSize);
  const effectiveSize = isCollapsed ? 0 : baseSize;

  React.useEffect(() => {
    if (__DEV__ && minSize >= maxSize) {
      console.warn(`Splitter: minSize (${minSize}) must be less than maxSize (${maxSize}).`);
    }
  }, [minSize, maxSize]);

  const persist = (nextSize: number, nextCollapsed: boolean): void => {
    if (persistKey !== undefined) {
      persisted.set(persistKey, { size: nextSize, collapsed: nextCollapsed });
    }
  };

  const applySize = (raw: number, end: boolean): void => {
    const next = clamp(raw, minSize, maxSize);
    if (size === undefined) {
      setInternalSize(next);
    }
    persist(next, false);
    onSizeChange?.(next);
    if (end) {
      onSizeChangeEnd?.(next);
    }
  };

  const setCollapsedState = (next: boolean): void => {
    if (collapsed === undefined) {
      setInternalCollapsed(next);
    }
    persist(baseSize, next);
    onCollapseChange?.(next);
  };

  const toggleCollapse = (): void => {
    if (collapsible) {
      setCollapsedState(!isCollapsed);
    }
  };

  const handleSeparatorAction = (event: AccessibilityActionEvent): void => {
    const name = event.nativeEvent.actionName;
    if (name === 'activate') {
      toggleCollapse();
      return;
    }
    if (isCollapsed) {
      return;
    }
    if (name === 'increment') {
      applySize(baseSize + step, true);
    } else if (name === 'decrement') {
      if (collapsible && baseSize - step < minSize) {
        setCollapsedState(true);
      } else {
        applySize(baseSize - step, true);
      }
    } else if (name === 'setMinimum') {
      applySize(minSize, true);
    } else if (name === 'setMaximum') {
      applySize(maxSize, true);
    }
  };

  // The PanResponder is created once; it reads the current render through these refs.
  const latest = React.useRef({ baseSize, isCollapsed, horizontal, collapsible, minSize, applySize, setCollapsedState });
  latest.current = { baseSize, isCollapsed, horizontal, collapsible, minSize, applySize, setCollapsedState };
  const containerExtentRef = React.useRef(0);
  const dragRef = React.useRef({ active: false, start: 0, last: 0, moved: false });

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.isCollapsed,
      onMoveShouldSetPanResponder: () => !latest.current.isCollapsed,
      onPanResponderGrant: () => {
        dragRef.current = { active: true, start: latest.current.baseSize, last: latest.current.baseSize, moved: false };
        setDragging(true);
      },
      onPanResponderMove: (_event, gesture) => {
        const drag = dragRef.current;
        const extent = containerExtentRef.current;
        if (!drag.active || extent <= 0) {
          return;
        }
        const raw = drag.start + ((latest.current.horizontal ? gesture.dx : gesture.dy) / extent) * 100;
        if (latest.current.collapsible && raw < latest.current.minSize) {
          // Past the minimum: collapse, and the rest of this drag does nothing.
          drag.active = false;
          setDragging(false);
          latest.current.setCollapsedState(true);
          return;
        }
        drag.last = raw;
        drag.moved = true;
        latest.current.applySize(raw, false);
      },
      onPanResponderRelease: () => {
        const drag = dragRef.current;
        if (drag.active && drag.moved) {
          latest.current.applySize(drag.last, true);
        }
        drag.active = false;
        setDragging(false);
      },
      onPanResponderTerminate: () => {
        dragRef.current.active = false;
        setDragging(false);
      },
    }),
  ).current;

  // Style bindings.
  const separatorSize = overrides?.separatorSize ? (resolveToken(t, overrides.separatorSize) as number) : t.space1;
  const separatorColor = overrides?.separatorColor ? (resolveToken(t, overrides.separatorColor) as string) : t.colorBorder;
  const handleSize = overrides?.handleSize ? (resolveToken(t, overrides.handleSize) as number) : t.space3;
  const gripLength = overrides?.gripLength ? (resolveToken(t, overrides.gripLength) as number) : t.space6;
  const collapseButtonOffset = overrides?.collapseButtonOffset
    ? (resolveToken(t, overrides.collapseButtonOffset) as number)
    : t.space2;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  // Locked. `separatorHover` is unused on native; `focusRing`/`focusRingWidth` cannot be
  // drawn on the separator (a plain View has no focus events) — the collapse Button has them.
  const separatorActive = t.colorControlSelectedBackground;
  const grip = t.colorBorderStrong;
  const paneMinTarget = t.sizeTargetComfortable;
  const minTarget = t.sizeTargetMin;

  // Collapse and restore animate; a size change from dragging or a step is immediate.
  const sizeAnim = React.useRef(new Animated.Value(effectiveSize)).current;
  const previousCollapsed = React.useRef(isCollapsed);
  React.useEffect(() => {
    const toggled = previousCollapsed.current !== isCollapsed;
    previousCollapsed.current = isCollapsed;
    if (!toggled || reducedMotion) {
      sizeAnim.setValue(effectiveSize);
      return undefined;
    }
    const animation = Animated.timing(sizeAnim, {
      toValue: effectiveSize,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [effectiveSize, isCollapsed, reducedMotion, sizeAnim, transitionDuration, t.motionEasingStandard]);

  const stackThreshold = stackBelow === 'never' ? null : t[STACK_BELOW[stackBelow]];
  // Unmeasured (first frame, test renderer) renders side by side.
  const stacked = horizontal && stackThreshold !== null && containerWidth !== null && containerWidth < stackThreshold;

  const handleContainerLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    containerExtentRef.current = horizontal ? width : height;
    setContainerWidth(width);
  };

  const handleSeparatorLayout = (event: LayoutChangeEvent): void => {
    const { x, y } = event.nativeEvent.layout;
    setSeparatorOffset(horizontal ? x : y);
  };

  const handleButtonLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setButtonExtent(horizontal ? width : height);
  };

  const containerStyle: ViewStyle = { flex: 1, flexDirection: horizontal && !stacked ? 'row' : 'column' };

  const primaryPaneStyle: Animated.WithAnimatedValue<ViewStyle> = stacked
    ? {}
    : {
        flexBasis: sizeAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        flexGrow: 0,
        flexShrink: isCollapsed ? 1 : 0,
        minWidth: horizontal && !isCollapsed ? paneMinTarget : 0,
        minHeight: !horizontal && !isCollapsed ? paneMinTarget : 0,
        overflow: 'hidden',
      };

  const secondaryPaneStyle: ViewStyle = stacked
    ? {}
    : {
        flex: 1,
        minWidth: horizontal ? paneMinTarget : 0,
        minHeight: horizontal ? 0 : paneMinTarget,
      };

  const hitArea = Math.max(handleSize, minTarget);
  const hitExtra = Math.max(0, Math.ceil((hitArea - separatorSize) / 2));

  const separatorStyle: ViewStyle = {
    width: horizontal ? separatorSize : '100%',
    height: horizontal ? '100%' : separatorSize,
    backgroundColor: dragging ? separatorActive : separatorColor,
    zIndex: 1,
  };

  // The grab area overlaps both panes; on native `hitSlop` carries it, on react-native-web the overflowing child does.
  const handleStyle: ViewStyle = horizontal
    ? { position: 'absolute', top: 0, bottom: 0, left: -hitExtra, right: -hitExtra }
    : { position: 'absolute', left: 0, right: 0, top: -hitExtra, bottom: -hitExtra };

  const gripStyle: ViewStyle = {
    position: 'absolute',
    width: horizontal ? separatorSize : gripLength,
    height: horizontal ? gripLength : separatorSize,
    left: horizontal ? 0 : '50%',
    top: horizontal ? '50%' : 0,
    transform: horizontal ? [{ translateY: -gripLength / 2 }] : [{ translateX: -gripLength / 2 }],
    borderRadius: t.radiusFull,
    backgroundColor: grip,
  };

  const buttonCross = separatorOffset + separatorSize / 2 - buttonExtent / 2;
  const collapseButtonStyle: ViewStyle = horizontal
    ? { position: 'absolute', top: collapseButtonOffset, left: buttonCross, zIndex: 1 }
    : { position: 'absolute', left: collapseButtonOffset, top: buttonCross, zIndex: 1 };

  const collapseIcon: IconName = horizontal
    ? isCollapsed
      ? 'chevron-right'
      : 'chevron-left'
    : isCollapsed
      ? 'chevron-down'
      : 'chevron-up';
  const toggleLabel = isCollapsed ? COPY.expand(label) : COPY.collapse(label);

  const separatorActions = [
    { name: 'increment' },
    { name: 'decrement' },
    { name: 'setMinimum' },
    { name: 'setMaximum' },
    ...(collapsible ? [{ name: 'activate', label: toggleLabel }] : []),
  ];

  return (
    <View ref={ref} testID="Splitter" style={containerStyle} onLayout={handleContainerLayout}>
      <Animated.View
        testID="Splitter.primaryPane"
        style={primaryPaneStyle}
        accessibilityElementsHidden={isCollapsed && !stacked}
        importantForAccessibility={isCollapsed && !stacked ? 'no-hide-descendants' : 'auto'}
        pointerEvents={isCollapsed && !stacked ? 'none' : 'auto'}
      >
        {renderPane(primary)}
      </Animated.View>
      {stacked ? null : (
        <View
          testID="Splitter.separator"
          accessible
          focusable
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: minSize, max: maxSize, now: effectiveSize, text: COPY.sizeText(effectiveSize) }}
          accessibilityActions={separatorActions}
          onAccessibilityAction={handleSeparatorAction}
          hitSlop={horizontal ? { left: hitExtra, right: hitExtra } : { top: hitExtra, bottom: hitExtra }}
          onLayout={handleSeparatorLayout}
          style={separatorStyle}
          {...panResponder.panHandlers}
        >
          <View testID="Splitter.handle" style={handleStyle} />
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no" style={gripStyle} />
        </View>
      )}
      {stacked || !collapsible ? null : (
        <View testID="Splitter.collapseButton" style={collapseButtonStyle} onLayout={handleButtonLayout}>
          <Button
            label={toggleLabel}
            variant="ghost"
            size="sm"
            iconOnly
            leadingIcon={<Icon name={collapseIcon} color={t.colorActionGhostForeground} />}
            onPress={toggleCollapse}
          />
        </View>
      )}
      <View testID="Splitter.secondaryPane" style={secondaryPaneStyle}>
        {renderPane(secondary)}
      </View>
    </View>
  );
}
