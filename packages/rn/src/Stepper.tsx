import * as React from 'react';
import { Animated, Pressable, Text as RNText, View } from 'react-native';
import type { LayoutChangeEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text } from './Text';
import { toEasing, toFontWeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';
export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/**
 * One step. `status` is derived from `current` when omitted: before it complete, the step it names current, after it
 * upcoming. An explicit `status` sets only the indicator, its colours and the status word.
 */
export type StepperStep = { id: string; label: string; description?: string; status?: 'complete' | 'current' | 'upcoming' | 'error' };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type StepperOverridableBinding =
  | 'indicatorSize'
  | 'indicatorBackground'
  | 'indicatorRadius'
  | 'indicatorFontSize'
  | 'indicatorFontWeight'
  | 'connector'
  | 'labelWeight'
  | 'labelCurrentWeight'
  | 'labelSize'
  | 'descriptionSize'
  | 'countSize'
  | 'stepHover'
  | 'stepRadius'
  | 'stepPadding'
  | 'stepGap'
  | 'partGap'
  | 'fontFamily'
  | 'transition';

export interface StepperProps {
  /**
   * Accessible name of the list (React Native has no navigation landmark, so the name sits on the list View).
   * Defaults to `copy.navLabel`, which an empty string also falls back to.
   */
  label?: string | undefined;
  /**
   * The steps in order. `status` is derived from `current` when omitted. An explicit `status` sets only the
   * indicator, its colours and the status word; position (not status) decides the selected state, navigability,
   * the connector colour and the compact reveal.
   */
  steps: { id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[];
  /**
   * The id of the current step. When no id matches, nothing is selected, every step without an explicit status is
   * upcoming, no step is navigable under `completed` (all still are under `all`), the count reads "Step 1 of m",
   * and `__DEV__` logs a warning — an empty `current` is treated as not yet set and does not warn.
   */
  current: string;
  /** Vertical shows descriptions under each label; horizontal renders no descriptions and collapses to `compact` below the prose width. */
  orientation?: StepperOrientation | undefined;
  /**
   * Which steps can be activated: `none` (display only), `completed` (every step before the current one by
   * position, including one marked `error`), or `all` (a settings-style flow where order does not matter).
   */
  navigable?: StepperNavigable | undefined;
  /**
   * Show only the current step's label and "Step 2 of 5"; the indicators stay. Horizontal only, set by hand or
   * automatically when the stepper's own width is below `layout.maxWidth.prose`; does nothing on a vertical stepper.
   */
  compact?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
  /** The root view, which holds the list and the count. */
  ref?: React.Ref<ViewInstance> | undefined;
}

type Step = StepperProps['steps'][number];

const COPY = {
  navLabel: 'Progress',
  stepOf: 'Step {current} of {total}',
  complete: 'completed',
  current: 'current step',
  error: 'has an error',
  stepLabel: 'Step {n}: {label}',
} as const;

function format(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

/** An explicit `status` wins; otherwise position relative to `currentIndex` decides. */
function statusFor(step: Step, index: number, currentIndex: number): StepperStepStatus {
  if (step.status !== undefined) return step.status;
  if (currentIndex === -1 || index > currentIndex) return 'upcoming';
  return index < currentIndex ? 'complete' : 'current';
}

/**
 * The DOM mirror of `accessibilityState.selected`, which react-native-web does not map. The web contract marks the
 * current step with aria-current="step" (aria-selected is not allowed on a button); View's types omit aria-current.
 */
const CURRENT_STEP_ATTRS: Record<string, unknown> = { 'aria-current': 'step' };

const STATUS_WORD = {
  complete: COPY.complete,
  current: COPY.current,
  error: COPY.error,
  upcoming: undefined,
} as const satisfies Record<StepperStepStatus, string | undefined>;

interface Resolved {
  indicatorSize: number;
  indicatorBackground: string;
  indicatorRadius: number;
  indicatorFontSize: number;
  indicatorFontWeight: number;
  connector: string;
  stepHover: string;
  stepRadius: number;
  stepPadding: number;
  stepGap: number;
  partGap: number;
  fontFamily: string;
  transition: number;
}

/** The token each composed Text is handed, overridden or not — the Text's own `size`/`weight` props never carry it. */
interface Forwards {
  labelSize: TokenRef;
  labelWeight: TokenRef;
  labelCurrentWeight: TokenRef;
  descriptionSize: TokenRef;
  countSize: TokenRef;
  indicatorFontSize: TokenRef;
  fontFamily: TokenRef;
}

/**
 * Stepper — a map of a journey with a "you are here". It sets expectations, shows progress without a bar, and
 * gives people a way back to a step they finished. Navigation, not a form control (the number-stepping field is
 * NumberInput).
 *
 * Use it for three to about seven ordered steps: vertical with descriptions for flows that need explanation,
 * horizontal for short, familiar ones. Do not use it for two steps, for more than about eight, as Tabs, or to show
 * task progress (ProgressBar).
 *
 * A plain root `View` holds the list `View` (`accessibilityRole="list"`, named by `label` — React Native has no
 * `nav` landmark) and, `stepGap` after it, the `count` Text, so the count is never inside the list. Each step is a
 * `role="listitem"` View — the `<li>` of the web anatomy, and the only child role a list may own — holding a
 * `Pressable` (navigable) or an `accessible` `View` whose `accessibilityLabel` is `copy.stepLabel` plus ", " and
 * the status word, with `accessibilityState.selected` on the step `current` names. An explicit `status: "error"`
 * wins for the indicator and the status word, while selection and the compact reveal still follow the id. The
 * indicator switches between its four states at once; connectors cross-fade to `connectorComplete` over
 * `transition`. Compact is decided by the stepper's own `onLayout` width against `layout.maxWidth.prose`,
 * rendering non-compact until the first layout; the root stretches to its parent, so the measured width is the
 * space offered and switching to compact cannot narrow it further.
 */
export function Stepper({
  label,
  steps,
  current,
  orientation = 'horizontal',
  navigable = 'completed',
  compact = false,
  overrides,
  onStepSelect,
  ref,
}: StepperProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const [width, setWidth] = React.useState<number | undefined>(undefined);

  const pick = <T extends number | string>(binding: StepperOverridableBinding, fallback: T): T => {
    const tokenRef = overrides?.[binding];
    return tokenRef ? (resolveToken(t, tokenRef) as T) : fallback;
  };

  const r: Resolved = {
    indicatorSize: pick('indicatorSize', t.space6),
    indicatorBackground: pick('indicatorBackground', t.colorControlBackground),
    indicatorRadius: pick('indicatorRadius', t.radiusFull),
    indicatorFontSize: pick('indicatorFontSize', t.fontSizeSm),
    indicatorFontWeight: pick('indicatorFontWeight', t.fontWeightSemibold),
    connector: pick('connector', t.colorBorder),
    stepHover: pick('stepHover', t.colorActionGhostBackgroundHover),
    stepRadius: pick('stepRadius', t.radiusSm),
    stepPadding: pick('stepPadding', t.space2),
    stepGap: pick('stepGap', t.layoutGapNormal),
    partGap: pick('partGap', t.space2),
    fontFamily: pick('fontFamily', t.fontFamilyBody),
    transition: pick('transition', t.motionDurationFast),
  };

  const f: Forwards = {
    labelSize: overrides?.labelSize ?? 'font.size.sm',
    labelWeight: overrides?.labelWeight ?? 'font.weight.medium',
    labelCurrentWeight: overrides?.labelCurrentWeight ?? 'font.weight.semibold',
    descriptionSize: overrides?.descriptionSize ?? 'font.size.xs',
    countSize: overrides?.countSize ?? 'font.size.sm',
    indicatorFontSize: overrides?.indicatorFontSize ?? 'font.size.sm',
    fontFamily: overrides?.fontFamily ?? 'font.family.body',
  };

  const currentIndex = steps.findIndex((step) => step.id === current);
  const isHorizontal = orientation === 'horizontal';
  const isCompact = isHorizontal && (compact || (width !== undefined && width < t.layoutMaxWidthProse));

  React.useEffect(() => {
    // An empty `current` is a property that has not been set yet, not a wrong id.
    if (__DEV__ && current !== '' && currentIndex === -1) {
      console.warn(`Stepper: current "${current}" matches no step id; nothing is selected.`);
    }
  }, [current, currentIndex]);

  const onLayout = (event: LayoutChangeEvent): void => {
    const next = event.nativeEvent.layout.width;
    setWidth((previous) => (previous === next ? previous : next));
  };

  const nodes: React.ReactNode[] = [];
  steps.forEach((step, index) => {
    const isNavigable = navigable === 'all' || (navigable === 'completed' && currentIndex !== -1 && index < currentIndex);
    nodes.push(
      <StepControl
        key={step.id}
        step={step}
        index={index}
        status={statusFor(step, index, currentIndex)}
        isCurrent={step.id === current}
        isRevealed={currentIndex === -1 ? index === 0 : step.id === current}
        isNavigable={isNavigable}
        compact={isCompact}
        isHorizontal={isHorizontal}
        t={t}
        r={r}
        f={f}
        onStepSelect={onStepSelect}
      />,
    );
    if (index < steps.length - 1) {
      nodes.push(
        <Connector
          key={`connector-${step.id}`}
          isHorizontal={isHorizontal}
          complete={currentIndex !== -1 && index < currentIndex}
          reducedMotion={reducedMotion}
          t={t}
          r={r}
        />,
      );
    }
  });

  return (
    <View ref={ref} testID="Stepper" onLayout={onLayout} style={{ alignSelf: 'stretch', flexDirection: 'column', gap: r.stepGap }}>
      <View
        testID="Stepper.list"
        accessibilityRole="list"
        accessibilityLabel={label || COPY.navLabel}
        aria-label={label || COPY.navLabel}
        style={isHorizontal ? { flexDirection: 'row', alignItems: 'flex-start' } : { flexDirection: 'column' }}
      >
        {nodes}
      </View>
      {isCompact ? (
        <View testID="Stepper.count">
          <Text size="sm" tone="muted" overrides={{ fontSize: f.countSize, fontFamily: f.fontFamily }}>
            {format(COPY.stepOf, { current: currentIndex === -1 ? 1 : currentIndex + 1, total: steps.length })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

interface StepControlProps {
  step: Step;
  index: number;
  status: StepperStepStatus;
  isCurrent: boolean;
  /** Compact shows this step's label: the id match, or the first step when nothing matches. */
  isRevealed: boolean;
  isNavigable: boolean;
  compact: boolean;
  isHorizontal: boolean;
  t: Tokens;
  r: Resolved;
  f: Forwards;
  onStepSelect: StepperProps['onStepSelect'];
}

/** One step's indicator, label and description; its own component so focus and hover state stay local. */
function StepControl({
  step,
  index,
  status,
  isCurrent,
  isRevealed,
  isNavigable,
  compact,
  isHorizontal,
  t,
  r,
  f,
  onStepSelect,
}: StepControlProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const n = index + 1;

  const statusWord = STATUS_WORD[status];
  const stepName = format(COPY.stepLabel, { n, label: step.label });
  const accessibleName = statusWord !== undefined ? `${stepName}, ${statusWord}` : stepName;

  const indicatorStyle: ViewStyle = {
    width: r.indicatorSize,
    height: r.indicatorSize,
    borderRadius: r.indicatorRadius,
    borderWidth: t.borderWidthFocus,
    borderColor:
      status === 'error'
        ? t.colorStatusDangerIcon
        : status === 'complete' || status === 'current'
          ? t.colorControlSelectedBackground
          : t.colorBorderStrong,
    backgroundColor:
      status === 'error'
        ? t.colorStatusDangerBackground
        : status === 'complete'
          ? t.colorControlSelectedBackground
          : r.indicatorBackground,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const numeralStyle: TextStyle = {
    fontFamily: r.fontFamily,
    fontSize: r.indicatorFontSize,
    fontWeight: toFontWeight(r.indicatorFontWeight),
    color: t.colorForeground,
  };

  const indicator = (
    <View
      testID="Stepper.indicator"
      style={indicatorStyle}
      accessibilityElementsHidden
      importantForAccessibility="no"
      aria-hidden
    >
      {status === 'complete' ? (
        <Icon name="check" size="sm" overrides={{ color: 'color.control.selectedForeground', size: f.indicatorFontSize }} />
      ) : status === 'error' ? (
        <Icon name="danger" size="sm" overrides={{ color: 'color.status.danger.foreground', size: f.indicatorFontSize }} />
      ) : (
        <RNText style={numeralStyle}>{n}</RNText>
      )}
    </View>
  );

  // Compact keeps every indicator but renders only the current step's label; horizontal never renders descriptions.
  const showLabel = !compact || isRevealed;
  const showDescription = !isHorizontal && step.description !== undefined;
  const textBlock =
    showLabel || showDescription ? (
      <View style={isHorizontal ? { alignItems: 'center' } : { flex: 1, gap: r.partGap }}>
        {showLabel ? (
          <View testID="Stepper.label">
            <Text
              size="sm"
              tone={status === 'upcoming' ? 'muted' : 'default'}
              align={isHorizontal ? 'center' : 'start'}
              overrides={{
                fontSize: f.labelSize,
                fontWeight: isCurrent ? f.labelCurrentWeight : f.labelWeight,
                fontFamily: f.fontFamily,
              }}
            >
              {step.label}
            </Text>
          </View>
        ) : null}
        {showDescription ? (
          <View testID="Stepper.description">
            <Text size="xs" tone="muted" overrides={{ fontSize: f.descriptionSize, fontFamily: f.fontFamily }}>
              {step.description}
            </Text>
          </View>
        ) : null}
      </View>
    ) : null;

  // The transparent focus border is on every step, navigable or not, so the two line up in one list; only a
  // navigable control can be focused, and only it takes the 24px minimum target.
  const containerStyle = (active: boolean): ViewStyle => ({
    ...(isHorizontal ? { alignItems: 'center' } : { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: r.stepPadding }),
    ...(isNavigable ? { minWidth: t.sizeTargetMin, minHeight: t.sizeTargetMin } : null),
    paddingHorizontal: r.stepPadding,
    gap: r.partGap,
    borderRadius: r.stepRadius,
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? t.colorBorderFocus : 'transparent',
    backgroundColor: active ? r.stepHover : 'transparent',
  });

  // The `step` part is the list item, as it is the <li> on web: a list role owns list items and nothing else, so
  // the control (Pressable or plain View) sits inside it rather than being the item itself.
  // A display-only step with no rendered text (compact) has nothing but its label to name it, and a role-less View
  // may not carry aria-label, so it is an image-role element; such a step is never the selected one.
  const control = !isNavigable ? (
    <View
      accessible
      accessibilityLabel={accessibleName}
      aria-label={accessibleName}
      {...(textBlock === null ? { role: 'img' as const } : { accessibilityState: { selected: isCurrent } })}
      {...(isCurrent ? CURRENT_STEP_ATTRS : null)}
      style={containerStyle(false)}
    >
      {indicator}
      {textBlock}
    </View>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibleName}
      aria-label={accessibleName}
      accessibilityState={{ selected: isCurrent }}
      {...(isCurrent ? CURRENT_STEP_ATTRS : null)}
      onPress={() => onStepSelect?.(step.id)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => containerStyle(pressed || hovered)}
    >
      {indicator}
      {textBlock}
    </Pressable>
  );

  return (
    <View testID="Stepper.step" role="listitem">
      {control}
    </View>
  );
}

interface ConnectorProps {
  isHorizontal: boolean;
  complete: boolean;
  reducedMotion: boolean;
  t: Tokens;
  r: Resolved;
}

/** The decorative line filling `stepGap` between two steps; cross-fades to `connectorComplete` once the step before it is passed. */
function Connector({ isHorizontal, complete, reducedMotion, t, r }: ConnectorProps): React.JSX.Element {
  const anim = React.useRef(new Animated.Value(complete ? 1 : 0)).current;
  const previous = React.useRef(complete);

  React.useEffect(() => {
    if (previous.current === complete) return;
    previous.current = complete;
    const toValue = complete ? 1 : 0;
    if (reducedMotion) {
      anim.setValue(toValue);
      return;
    }
    const animation = Animated.timing(anim, {
      toValue,
      duration: r.transition,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [complete, reducedMotion, r.transition, anim, t.motionEasingStandard]);

  const backgroundColor = anim.interpolate({ inputRange: [0, 1], outputRange: [r.connector, t.colorControlSelectedBackground] });

  // The line is a sibling of the steps, so a track as tall (or wide) as the indicator, inset by the step's focus
  // border (and its padding on the indicator's axis), centres it on the indicator without a margin. Horizontally it
  // takes the row's free space from a minimum of stepGap; vertically stepGap is the whole of it.
  const track: ViewStyle = isHorizontal
    ? {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: r.stepGap,
        height: r.indicatorSize,
        paddingTop: t.borderWidthFocus,
        boxSizing: 'content-box',
        justifyContent: 'center',
      }
    : {
        width: r.indicatorSize,
        height: r.stepGap,
        paddingLeft: t.borderWidthFocus + r.stepPadding,
        boxSizing: 'content-box',
        alignItems: 'center',
      };
  const line: Animated.WithAnimatedValue<ViewStyle> = isHorizontal
    ? { alignSelf: 'stretch', height: t.borderWidthFocus, backgroundColor }
    : { flex: 1, width: t.borderWidthFocus, backgroundColor };

  return (
    <View testID="Stepper.connector" accessibilityElementsHidden importantForAccessibility="no" aria-hidden style={track}>
      <Animated.View style={line} />
    </View>
  );
}
