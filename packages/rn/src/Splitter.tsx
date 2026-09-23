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
  | 'gripRadius'
  | 'collapseButtonOffset'
  | 'transition';

export interface SplitterProps {
  /** What the divider resizes ("Sidebar width", "Preview height"). The separator's accessible name. */
  label: string;
  /** `horizontal` places panes side by side (the separator is vertical); `vertical` stacks them. A vertical splitter needs a parent with a definite height. */
  orientation?: SplitterOrientation | undefined;
  /** The first pane (start or top). Its size is what the separator controls and reports. A string or number is wrapped in `Text`. */
  primary: React.ReactNode;
  /** The second pane, which takes the remaining space. A string or number is wrapped in `Text`, as `primary`. */
  secondary: React.ReactNode;
  /** Controlled size of the primary pane as a percentage of the container (0–100). */
  size?: number | undefined;
  /** Initial primary size, percent. */
  defaultSize?: number | undefined;
  /** Smallest primary size, percent. With `collapsible`, a step that would cross it clamps here first and the next shrink step collapses; otherwise it is the hard floor. */
  minSize?: number | undefined;
  /** Largest primary size, percent. */
  maxSize?: number | undefined;
  /** Increment of the increment/decrement accessibility actions, percent. */
  step?: number | undefined;
  /** The primary pane can collapse to nothing: drag past the minimum, the separator's activate action, or the collapse button. Activating again restores the last size. */
  collapsible?: boolean | undefined;
  /** Controlled collapsed state. Ignored unless `collapsible`. */
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
  /** Fired continuously while dragging and on each step action, with the primary size in percent (unrounded). */
  onSizeChange?: ((size: number) => void) | undefined;
  /** Fired with the final size once when a drag ends and after each step action that changed the size. */
  onSizeChangeEnd?: ((size: number) => void) | undefined;
  /** Fired when the primary pane collapses or restores. */
  onCollapseChange?: ((collapsed: boolean) => void) | undefined;
}

const COPY = {
  collapse: (label: string): string => `Collapse ${label}`,
  expand: (label: string): string => `Expand ${label}`,
  setMinimum: (label: string): string => `Minimum ${label}`,
  setMaximum: (label: string): string => `Maximum ${label}`,
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
 * `View` carrying a `PanResponder` (as Slider's thumb — `panHandlers` on a `Pressable`
 * fight its own responder) with `accessibilityRole="adjustable"`, `accessibilityValue`
 * and `accessibilityActions` — increment/decrement by `step`, setMinimum/setMaximum
 * (Home/End) and, when `collapsible`, activate (Enter) — the gesture alternative; then
 * the secondary pane at `flex: 1`. The collapse `Button` (ghost, sm, iconOnly) is a
 * positioned sibling of the separator, placed from its measured position rather than a
 * child, because Android drops touches outside a parent's bounds. While collapsed the
 * pane is hidden from assistive tech and touch, and drag and the step actions do
 * nothing; only activate or the button restores. Collapse and restore animate over
 * `transition` (skipped under reduced motion); dragging and step actions resize
 * instantly and the separator colour switches instantly.
 *
 * Known platform limits: a `View` has no typed key handler, so hardware arrows, Home,
 * End and Enter do nothing (including on react-native-web) — the accessibility actions
 * and the collapse Button are the keyboard and screen-reader route; the separator is a
 * plain `View`, so it shows no keyboard focus ring (the Button has full focus
 * treatment); and F6 pane cycling has no native equivalent.
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

  // Recorded whenever either value settles, in both modes and once on the first render,
  // so a controlled splitter still remembers what its parent chose. A collapsed pane
  // keeps its size for restoring.
  React.useEffect(() => {
    if (persistKey !== undefined) {
      persisted.set(persistKey, { size: baseSize, collapsed: isCollapsed });
    }
  }, [persistKey, baseSize, isCollapsed]);

  const applySize = (raw: number, commit: boolean): void => {
    const next = clamp(raw, minSize, maxSize);
    if (size === undefined) {
      setInternalSize(next);
    }
    onSizeChange?.(next);
    if (commit) {
      onSizeChangeEnd?.(next);
    }
  };

  /** A step action is a complete interaction: it reports the change and the commit, and
   * a step already at a bound (setMaximum at `maxSize`) reports nothing. */
  const stepTo = (raw: number): void => {
    const next = clamp(raw, minSize, maxSize);
    if (next === baseSize) {
      return;
    }
    applySize(next, true);
  };

  const setCollapsedState = (next: boolean): void => {
    if (collapsed === undefined) {
      setInternalCollapsed(next);
    }
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
      // While collapsed only activate or the collapse button does anything.
      return;
    }
    if (name === 'increment') {
      stepTo(baseSize + step);
    } else if (name === 'decrement') {
      if (collapsible && baseSize <= minSize) {
        // At the minimum the next shrink step collapses; crossing it from above clamps first.
        setCollapsedState(true);
      } else {
        stepTo(baseSize - step);
      }
    } else if (name === 'setMinimum') {
      // Home sets `minSize` and never collapses.
      stepTo(minSize);
    } else if (name === 'setMaximum') {
      stepTo(maxSize);
    }
  };

  // The PanResponder is created once; it reads the current render through these refs.
  const latest = React.useRef({
    baseSize,
    isCollapsed,
    horizontal,
    collapsible,
    minSize,
    maxSize,
    applySize,
    setCollapsedState,
    onSizeChangeEnd,
  });
  latest.current = {
    baseSize,
    isCollapsed,
    horizontal,
    collapsible,
    minSize,
    maxSize,
    applySize,
    setCollapsedState,
    onSizeChangeEnd,
  };
  const containerExtentRef = React.useRef(0);
  const dragRef = React.useRef({ active: false, moved: false, start: 0, last: 0 });

  /** A gesture that never moved the separator (no change of the clamped size, and no
   * collapse) is not a drag and commits nothing; one the platform cancels counts as a
   * release, so both paths end here. */
  const endDrag = (): void => {
    const drag = dragRef.current;
    if (drag.moved) {
      // A drag commits once, carrying the last expanded size even when the gesture
      // collapsed the pane.
      latest.current.onSizeChangeEnd?.(drag.last);
    }
    drag.active = false;
    drag.moved = false;
    setDragging(false);
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latest.current.isCollapsed,
      onMoveShouldSetPanResponder: () => !latest.current.isCollapsed,
      onPanResponderGrant: () => {
        dragRef.current = {
          active: true,
          moved: false,
          start: latest.current.baseSize,
          last: latest.current.baseSize,
        };
        setDragging(true);
      },
      onPanResponderMove: (_event, gesture) => {
        const drag = dragRef.current;
        const extent = containerExtentRef.current;
        if (!drag.active || extent <= 0) {
          return;
        }
        const delta = latest.current.horizontal ? gesture.dx : gesture.dy;
        const raw = drag.start + (delta / extent) * 100;
        if (latest.current.collapsible && raw < latest.current.minSize) {
          // Strictly past the minimum: collapse, and the rest of this gesture is ignored.
          // `last` keeps the last expanded size, which the release event carries, even
          // when the gesture collapsed before ever changing the size.
          drag.active = false;
          drag.moved = true;
          setDragging(false);
          latest.current.setCollapsedState(true);
          return;
        }
        const next = clamp(raw, latest.current.minSize, latest.current.maxSize);
        if (next === drag.last) {
          // Never repeat the last reported size: a zero delta or a drag held against a
          // bound is still a press, not a drag, and stays silent.
          return;
        }
        drag.moved = true;
        drag.last = next;
        latest.current.applySize(next, false);
      },
      onPanResponderRelease: endDrag,
      onPanResponderTerminate: endDrag,
    }),
  ).current;

  // Style bindings.
  const separatorSize = overrides?.separatorSize ? (resolveToken(t, overrides.separatorSize) as number) : t.space1;
  const separatorColor = overrides?.separatorColor ? (resolveToken(t, overrides.separatorColor) as string) : t.colorBorder;
  const handleSize = overrides?.handleSize ? (resolveToken(t, overrides.handleSize) as number) : t.space3;
  const gripLength = overrides?.gripLength ? (resolveToken(t, overrides.gripLength) as number) : t.space6;
  const gripRadius = overrides?.gripRadius ? (resolveToken(t, overrides.gripRadius) as number) : t.radiusFull;
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

  const stackToken: unknown = stackBelow === 'never' ? undefined : t[STACK_BELOW[stackBelow]];
  // An absent or unreadable breakpoint never stacks; unmeasured (first frame, test
  // renderer) renders side by side. The comparison is strict.
  const stackThreshold = typeof stackToken === 'number' ? stackToken : null;
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
        // The pane floor is dropped while collapsed so collapse reaches zero.
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

  // The grab area overlaps both panes; on native `hitSlop` carries it, and on
  // react-native-web (which ignores `hitSlop`) the overflowing child View does.
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
    borderRadius: gripRadius,
    backgroundColor: grip,
  };

  // Centred across the separator; while collapsed the primary pane has no size, so the
  // button aligns to the secondary pane's start edge instead of hanging outside.
  const buttonCross = isCollapsed
    ? separatorOffset + separatorSize
    : separatorOffset + separatorSize / 2 - buttonExtent / 2;
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

  // increment/decrement are named by the system; the rest carry their own copy.
  const separatorActions = [
    { name: 'increment' },
    { name: 'decrement' },
    { name: 'setMinimum', label: COPY.setMinimum(label) },
    { name: 'setMaximum', label: COPY.setMaximum(label) },
    ...(collapsible ? [{ name: 'activate', label: toggleLabel }] : []),
  ];

  // Only the reported value rounds; the size events carry the unrounded number. The
  // minimum is 0 while collapsed so the reported value stays in range, while the
  // maximum stays `maxSize`.
  const reportedSize = Math.round(effectiveSize);
  const reportedMin = isCollapsed ? 0 : minSize;

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
          aria-label={label}
          accessibilityValue={{
            min: reportedMin,
            max: maxSize,
            now: reportedSize,
            text: COPY.sizeText(reportedSize),
          }}
          // The aria-* aliases carry the same value. React Native merges them into
          // `accessibilityValue`; react-native-web has no such prop and forwards only these,
          // and role="slider" (its mapping of `adjustable`) requires aria-valuenow.
          aria-valuemin={reportedMin}
          aria-valuemax={maxSize}
          aria-valuenow={reportedSize}
          aria-valuetext={COPY.sizeText(reportedSize)}
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
            // The Button discloses the primary pane, as `aria-expanded={!collapsed}` on web.
            expanded={!isCollapsed}
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
