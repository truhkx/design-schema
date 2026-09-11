import * as React from 'react';
import { Animated, Pressable, Text as RNText, View, useWindowDimensions } from 'react-native';
import type { PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { Text } from './Text';
import { toEasing, toFontWeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperNavigable = 'none' | 'completed' | 'all';
export type StepperStepStatus = 'complete' | 'current' | 'upcoming' | 'error';

/** One step. `status` is derived from `current` when omitted: before it complete, after it upcoming. */
export type StepperStep = {
  id: string;
  label: string;
  description?: string | undefined;
  status?: StepperStepStatus | undefined;
};

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type StepperOverridableBinding =
  | 'indicatorSize'
  | 'indicatorBackground'
  | 'indicatorBorderWidth'
  | 'indicatorFontSize'
  | 'indicatorFontWeight'
  | 'connector'
  | 'connectorWidth'
  | 'labelWeight'
  | 'labelCurrentWeight'
  | 'labelSize'
  | 'descriptionSize'
  | 'stepHover'
  | 'stepRadius'
  | 'stepGap'
  | 'partGap'
  | 'fontFamily'
  | 'transition';

export interface StepperProps {
  /** Accessible name of the navigation landmark. Defaults to `copy.navLabel`. */
  label?: string | undefined;
  /** The steps in order. */
  steps: StepperStep[];
  /** The id of the current step. */
  current: string;
  /** Vertical shows descriptions under each label and suits a side column; horizontal collapses to `compact` below the prose width. */
  orientation?: StepperOrientation | undefined;
  /** Which steps are Pressables: `none` (display only), `completed` steps (the usual — you can go back, not skip ahead), or `all` (a settings-style flow where order does not matter). */
  navigable?: StepperNavigable | undefined;
  /** Show only the current step's label and "Step 2 of 5"; the indicators stay. Automatic on narrow viewports for horizontal steppers. Has no effect on `vertical`. */
  compact?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself. */
  onStepSelect?: ((id: string) => void) | undefined;
}

const COPY = {
  navLabel: 'Progress',
  stepOf: (n: number, total: number): string => `Step ${n} of ${total}`,
  complete: 'completed',
  current: 'current step',
  error: 'has an error',
  stepLabel: (n: number, stepLabelText: string): string => `Step ${n}: ${stepLabelText}`,
} as const;

/** Resolves a step's displayed status: an explicit `status` wins, otherwise position relative to `currentIndex` decides. */
function statusFor(step: StepperStep, index: number, currentIndex: number): StepperStepStatus {
  if (step.status !== undefined) {
    return step.status;
  }
  if (currentIndex === -1) {
    return 'upcoming';
  }
  if (index < currentIndex) {
    return 'complete';
  }
  if (index === currentIndex) {
    return 'current';
  }
  return 'upcoming';
}

interface IndicatorColors {
  background: string;
  borderColor: string;
}

function indicatorColorsFor(status: StepperStepStatus, t: Tokens, indicatorBackground: string): IndicatorColors {
  switch (status) {
    case 'complete':
      return { background: t.colorControlSelectedBackground, borderColor: t.colorBorderStrong };
    case 'current':
      return { background: indicatorBackground, borderColor: t.colorControlSelectedBackground };
    case 'error':
      return { background: t.colorStatusDangerBackground, borderColor: t.colorStatusDangerIcon };
    case 'upcoming':
    default:
      return { background: indicatorBackground, borderColor: t.colorBorderStrong };
  }
}

interface StepStyleTokens {
  indicatorSize: number;
  indicatorBackground: string;
  indicatorBorderWidth: number;
  indicatorFontSize: number;
  indicatorFontSizeRef?: TokenRef | undefined;
  indicatorFontWeight: number;
  stepHoverColor: string;
  stepRadius: number;
  partGap: number;
  fontFamily: string;
  fontFamilyRef?: TokenRef | undefined;
  minTarget: number;
  focusRingColor: string;
  focusRingWidth: number;
  labelWeightRef?: TokenRef | undefined;
  labelCurrentWeightRef?: TokenRef | undefined;
  labelSizeRef?: TokenRef | undefined;
  descriptionSizeRef?: TokenRef | undefined;
}

/**
 * Stepper — a map of a journey with a "you are here". It sets expectations, shows
 * progress without a bar, and gives people a way back to a step they finished.
 * Navigation, not a form control.
 *
 * When to use: Use a Stepper for a flow with three to about seven ordered steps that
 * each fit on a screen: checkout, account setup, a report builder. Vertical with
 * descriptions for flows that need explanation; horizontal for short, familiar ones.
 * Leave `navigable="completed"` so people can correct earlier answers without losing
 * later ones. Do not use it for two steps, for more than about eight, as Tabs, or to
 * show task progress (ProgressBar).
 *
 * Renders a `View` with `accessibilityRole="list"` and `accessibilityLabel`. Each
 * step is its own `Pressable` (navigable) or `View` (inert) carrying an
 * `accessibilityLabel` built from `copy.stepLabel` plus the status word, and
 * `accessibilityState.selected` for the step whose id matches `current` — not
 * necessarily the one whose derived/overridden `status` is `"current"`, since an
 * explicit `status: "error"` on the current step still needs to read as "here" to
 * assistive technology while showing the danger indicator. Complete steps show the
 * system `Icon` (`check`), error steps show `danger`; both are decorative — the
 * meaning is carried by the accessible name and the visually-adjacent status word.
 * Connectors are separate decorative `View`s between steps that cross-fade from
 * `connector` to `connectorComplete` over `transition` with `motion.easing.standard`
 * (skipped under reduced motion) as the step before them completes; the indicator
 * itself switches instantly since it has four discrete states rather than one
 * progress value. `navigable="completed"` means every step before `current` by
 * position, including one marked `error`. Below `layout.maxWidth.prose` a horizontal
 * stepper automatically behaves as `compact`, same as the explicit prop.
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
}: StepperProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();

  const currentIndex = steps.findIndex((step) => step.id === current);
  const isHorizontal = orientation === 'horizontal';
  const isCompact = isHorizontal && (compact || windowWidth < t.layoutMaxWidthProse);
  const total = steps.length;

  const indicatorSize = overrides?.indicatorSize ? (resolveToken(t, overrides.indicatorSize) as number) : t.space6;
  const indicatorBackground = overrides?.indicatorBackground
    ? (resolveToken(t, overrides.indicatorBackground) as string)
    : t.colorControlBackground;
  const indicatorBorderWidth = overrides?.indicatorBorderWidth
    ? (resolveToken(t, overrides.indicatorBorderWidth) as number)
    : t.borderWidthFocus;
  const indicatorFontSize = overrides?.indicatorFontSize ? (resolveToken(t, overrides.indicatorFontSize) as number) : t.fontSizeSm;
  const indicatorFontWeight = overrides?.indicatorFontWeight
    ? (resolveToken(t, overrides.indicatorFontWeight) as number)
    : t.fontWeightSemibold;
  const connectorColor = overrides?.connector ? (resolveToken(t, overrides.connector) as string) : t.colorBorder;
  const connectorWidth = overrides?.connectorWidth ? (resolveToken(t, overrides.connectorWidth) as number) : t.borderWidthFocus;
  const stepHoverColor = overrides?.stepHover ? (resolveToken(t, overrides.stepHover) as string) : t.colorActionGhostBackgroundHover;
  const stepRadius = overrides?.stepRadius ? (resolveToken(t, overrides.stepRadius) as number) : t.radiusSm;
  const stepGap = overrides?.stepGap ? (resolveToken(t, overrides.stepGap) as number) : t.layoutGapNormal;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space2;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;

  const styleTokens: StepStyleTokens = {
    indicatorSize,
    indicatorBackground,
    indicatorBorderWidth,
    indicatorFontSize,
    indicatorFontSizeRef: overrides?.indicatorFontSize,
    indicatorFontWeight,
    stepHoverColor,
    stepRadius,
    partGap,
    fontFamily,
    fontFamilyRef: overrides?.fontFamily,
    minTarget: t.sizeTargetMin,
    focusRingColor: t.colorBorderFocus,
    focusRingWidth: t.borderWidthFocus,
    labelWeightRef: overrides?.labelWeight,
    labelCurrentWeightRef: overrides?.labelCurrentWeight,
    labelSizeRef: overrides?.labelSize,
    descriptionSizeRef: overrides?.descriptionSize,
  };

  const rootStyle: ViewStyle = isHorizontal ? { flexDirection: 'row', alignItems: 'flex-start' } : { flexDirection: 'column' };

  const nodes: React.ReactNode[] = [];
  steps.forEach((step, index) => {
    const status = statusFor(step, index, currentIndex);
    const isCurrentPosition = step.id === current;
    const isNavigable = navigable === 'all' ? true : navigable === 'completed' ? index < currentIndex : false;

    nodes.push(
      <StepControl
        key={step.id}
        step={step}
        index={index}
        total={total}
        status={status}
        isCurrentPosition={isCurrentPosition}
        isNavigable={isNavigable}
        compact={isCompact}
        isHorizontal={isHorizontal}
        t={t}
        s={styleTokens}
        onSelect={(id) => onStepSelect?.(id)}
      />,
    );

    if (index < steps.length - 1) {
      nodes.push(
        <Connector
          key={`connector-${step.id}`}
          isHorizontal={isHorizontal}
          complete={status === 'complete'}
          color={connectorColor}
          completeColor={t.colorControlSelectedBackground}
          width={connectorWidth}
          gap={stepGap}
          indicatorSize={indicatorSize}
          reducedMotion={reducedMotion}
          transitionDuration={transitionDuration}
          t={t}
        />,
      );
    }
  });

  return (
    <View testID="Stepper" accessibilityRole="list" accessibilityLabel={label ?? COPY.navLabel} style={rootStyle}>
      {nodes}
    </View>
  );
}

interface StepControlProps {
  step: StepperStep;
  index: number;
  total: number;
  status: StepperStepStatus;
  isCurrentPosition: boolean;
  isNavigable: boolean;
  compact: boolean;
  isHorizontal: boolean;
  t: Tokens;
  s: StepStyleTokens;
  onSelect: (id: string) => void;
}

/** One step's indicator, label and description. Its own component so focus/press state does not re-render the whole list. */
function StepControl({
  step,
  index,
  total,
  status,
  isCurrentPosition,
  isNavigable,
  compact,
  isHorizontal,
  t,
  s,
  onSelect,
}: StepControlProps): React.JSX.Element {
  const [focused, setFocused] = React.useState(false);
  const colors = indicatorColorsFor(status, t, s.indicatorBackground);
  const stepNumber = index + 1;
  const stepName = COPY.stepLabel(stepNumber, step.label);
  const statusWord =
    status === 'error' ? COPY.error : isCurrentPosition ? COPY.current : status === 'complete' ? COPY.complete : undefined;
  const accessibleName = statusWord !== undefined ? `${stepName}, ${statusWord}` : stepName;

  const indicatorStyle: ViewStyle = {
    width: s.indicatorSize,
    height: s.indicatorSize,
    borderRadius: s.indicatorSize / 2, // literal-ok: halves a token-derived size into a circle radius
    borderWidth: s.indicatorBorderWidth,
    borderColor: colors.borderColor,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const numeralStyle: TextStyle = {
    fontFamily: s.fontFamily,
    fontSize: s.indicatorFontSize,
    fontWeight: toFontWeight(s.indicatorFontWeight),
    color: t.colorForeground,
  };

  const indicatorContent =
    status === 'complete' ? (
      <Icon
        name="check"
        size="sm"
        color={t.colorControlSelectedForeground}
        overrides={s.indicatorFontSizeRef ? { size: s.indicatorFontSizeRef } : undefined}
      />
    ) : status === 'error' ? (
      <Icon
        name="danger"
        size="sm"
        color={t.colorStatusDangerForeground}
        overrides={s.indicatorFontSizeRef ? { size: s.indicatorFontSizeRef } : undefined}
      />
    ) : (
      <RNText allowFontScaling style={numeralStyle}>
        {stepNumber}
      </RNText>
    );

  const showLabel = !compact || isCurrentPosition;
  const labelWeight = isCurrentPosition ? 'semibold' : 'medium';
  const labelWeightRef = isCurrentPosition ? s.labelCurrentWeightRef : s.labelWeightRef;
  const labelTone = status === 'upcoming' ? 'muted' : 'default';
  const textAlign = isHorizontal ? 'center' : 'start';

  const textBlock = showLabel ? (
    <View style={isHorizontal ? styles.textColumnHorizontal : styles.textColumnVertical}>
      <Text
        size="sm"
        weight={labelWeight}
        tone={labelTone}
        align={textAlign}
        overrides={{ fontSize: s.labelSizeRef, fontWeight: labelWeightRef, fontFamily: s.fontFamilyRef }}
      >
        {step.label}
      </Text>
      {compact && isCurrentPosition ? (
        <Text size="xs" tone="muted" align={textAlign} overrides={{ fontFamily: s.fontFamilyRef }}>
          {COPY.stepOf(stepNumber, total)}
        </Text>
      ) : step.description !== undefined ? (
        <Text size="xs" tone="muted" align={textAlign} overrides={{ fontSize: s.descriptionSizeRef, fontFamily: s.fontFamilyRef }}>
          {step.description}
        </Text>
      ) : null}
    </View>
  ) : null;

  const contentStyle: ViewStyle = isHorizontal
    ? { alignItems: 'center', gap: s.partGap }
    : { flexDirection: 'row', alignItems: 'flex-start', gap: s.partGap, flex: 1 };

  const containerStyle = (pressed: boolean): ViewStyle => ({
    ...contentStyle,
    minWidth: s.minTarget,
    minHeight: s.minTarget,
    borderRadius: s.stepRadius,
    backgroundColor: pressed ? s.stepHoverColor : 'transparent',
    borderWidth: s.focusRingWidth,
    borderColor: focused ? s.focusRingColor : 'transparent',
  });

  const indicator = (
    <View style={indicatorStyle} accessibilityElementsHidden importantForAccessibility="no">
      {indicatorContent}
    </View>
  );

  if (!isNavigable) {
    return (
      <View
        testID="Stepper.step"
        accessible
        accessibilityLabel={accessibleName}
        accessibilityState={{ selected: isCurrentPosition }}
        style={containerStyle(false)}
      >
        {indicator}
        {textBlock}
      </View>
    );
  }

  return (
    <Pressable
      testID="Stepper.step"
      accessibilityRole="button"
      accessibilityLabel={accessibleName}
      accessibilityState={{ selected: isCurrentPosition }}
      onPress={() => onSelect(step.id)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }: PressableStateCallbackType) => containerStyle(pressed)}
    >
      {indicator}
      {textBlock}
    </Pressable>
  );
}

interface ConnectorProps {
  isHorizontal: boolean;
  complete: boolean;
  color: string;
  completeColor: string;
  width: number;
  gap: number;
  indicatorSize: number;
  reducedMotion: boolean;
  transitionDuration: number;
  t: Tokens;
}

/** The decorative line between two steps. Cross-fades to `connectorComplete` as the step before it completes. */
function Connector({
  isHorizontal,
  complete,
  color,
  completeColor,
  width,
  gap,
  indicatorSize,
  reducedMotion,
  transitionDuration,
  t,
}: ConnectorProps): React.JSX.Element {
  const anim = React.useRef(new Animated.Value(complete ? 1 : 0)).current;

  React.useEffect(() => {
    const toValue = complete ? 1 : 0;
    if (reducedMotion) {
      anim.setValue(toValue);
      return;
    }
    Animated.timing(anim, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [complete, reducedMotion, transitionDuration, anim, t.motionEasingStandard]);

  const backgroundColor = anim.interpolate({ inputRange: [0, 1], outputRange: [color, completeColor] });

  // Centers the line on the indicator's midpoint since the connector is a sibling, not a child, of the step it follows.
  const offset = indicatorSize / 2 - width / 2; // literal-ok: geometry derived from token-based sizes, not a design literal

  const style: Animated.WithAnimatedValue<ViewStyle> = isHorizontal
    ? { width: gap, height: width, backgroundColor, marginTop: offset }
    : { width, height: gap, backgroundColor, marginLeft: offset };

  return <Animated.View testID="Stepper.connector" accessibilityElementsHidden importantForAccessibility="no" style={style} />;
}

const styles = {
  textColumnHorizontal: { alignItems: 'center' } as ViewStyle,
  textColumnVertical: { flex: 1 } as ViewStyle,
};
