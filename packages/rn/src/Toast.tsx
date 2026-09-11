import * as React from 'react';
import { AccessibilityInfo, Animated, Platform, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type ToastDuration = 'short' | 'long' | 'persistent';
/** Why the toast left the screen. */
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'action' | 'replaced';

/**
 * The style bindings a caller may replace with a different token; see the
 * component's overrides contract. `stackGap`, `regionInset` and `layer` govern the
 * region a `ToastProvider` renders (there is one region, not one per toast) and are
 * no-ops when passed to a standalone `Toast`; every other key is in effect on the
 * toast itself.
 */
export type ToastOverridableBinding =
  | 'radius'
  | 'shadow'
  | 'paddingBlock'
  | 'paddingInline'
  | 'gap'
  | 'stackGap'
  | 'regionInset'
  | 'maxWidth'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'layer'
  | 'enter'
  | 'exit';

export interface ToastProps {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (both computed from `motion.duration.loop` so themes without motion
   * still get sensible times), `persistent` until dismissed. When `actionLabel` is set or `tone` is
   * `danger` the toast is persistent regardless of this prop (a dev warning notes the override).
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible regardless of this prop. */
  dismissible?: boolean | undefined;
  /** Stable identity; a `ToastProvider` showing a toast with the same toastId replaces the previous one instead of stacking. Unused by a standalone `Toast`. */
  toastId?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the action button is activated. The toast then dismisses with reason `action`. */
  onAction?: (() => void) | undefined;
  /** Fired once the toast has finished leaving the screen, with the reason it left. */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}

const COPY = {
  dismissLabel: 'Dismiss',
  regionLabel: 'Notifications',
} as const;

const TONE_ICON: Record<ToastTone, IconName | null> = {
  neutral: null,
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

const TONE_COLOR_TOKEN = {
  neutral: 'colorInverseStatusNeutral',
  success: 'colorInverseStatusSuccess',
  warning: 'colorInverseStatusWarning',
  danger: 'colorInverseStatusDanger',
} as const satisfies Record<ToastTone, keyof Tokens>;

const DURATION_LOOPS = { short: 6, long: 12 } as const satisfies Record<'short' | 'long', number>;

/**
 * Toast — says "done" and gets out of the way. Confirms an action just taken,
 * offers one chance to undo it, and leaves without being asked.
 *
 * When to use: Use it to confirm a completed action the user did not have to watch
 * (sent, saved, deleted, copied), to offer Undo for a reversible action, or to
 * report a background result. Match `tone` to the outcome; use `duration="persistent"`
 * whenever there is an action, and for `danger`, so nobody misses the one they
 * needed. Never toast an error that needs fixing (use Alert) or anything requiring
 * more than one action.
 *
 * Renders a `View` carrying the message, the tone's icon (`neutral` has none),
 * an optional action `Button` and a dismiss `Button` — both rendered with `inverse`
 * so they read against `color.inverse.surface` without restyling `Button` itself.
 * `accessibilityLiveRegion` is `assertive` for `danger`, `polite` otherwise
 * (Android); `danger` also gets `accessibilityRole="alert"` since native has no
 * `status` role to map the schema's `a11y.role` onto directly. iOS ignores live
 * regions, so `AccessibilityInfo.announceForAccessibility(message)` fires once on
 * mount. The toast fades and rises in over `enter`, and fades out over `exit`
 * before calling `onDismiss` — both skipped (jumping straight to the resting value)
 * under reduced motion. A timer dismisses the toast after the effective duration
 * unless that duration is `persistent` — which it always is once `actionLabel` is
 * set or `tone` is `danger`, regardless of the `duration` prop (a `__DEV__` warning
 * flags the mismatch); touching the toast (`onTouchStart`/`onTouchEnd`) pauses and
 * resumes the timer, since native has no hover and no reliable way to observe focus
 * entering a composed `Button`'s subtree from outside.
 *
 * Acknowledged native limits: `escape-dismiss` and the F6 focus-navigation model
 * describe the web keyboard model and are not implemented here — there is no
 * hardware-keyboard event API comparable to a DOM `keydown` listener, and `Button`
 * does not expose focus events externally, so a toast cannot tell whether focus is
 * "inside" it. Dismissal stays reachable through the always-visible dismiss button
 * (forced on for `persistent`) and the standard `Enter`/native-activation gesture
 * `Pressable` already provides. See `ToastProvider`/`useToast`/`toast` below for the
 * app-root region this component is meant to be shown through.
 */
export function Toast({
  message,
  tone = 'neutral',
  actionLabel,
  duration = 'short',
  dismissible = true,
  overrides,
  onAction,
  onDismiss,
}: ToastProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.spaceSm;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.spaceMd;
  const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.layoutGapNormal;
  const maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t.layoutMaxWidthProse;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerToast;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  // An action or danger tone forces the toast to stay until dismissed, regardless of `duration`.
  const forcedPersistent = actionLabel !== undefined || tone === 'danger';
  const effectiveDuration: ToastDuration = forcedPersistent ? 'persistent' : duration;
  const isDismissible = effectiveDuration === 'persistent' ? true : dismissible;
  const iconName = TONE_ICON[tone];
  const iconColor = t[TONE_COLOR_TOKEN[tone]];
  const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);

  const [dismissReason, setDismissReason] = React.useState<ToastDismissReason | null>(null);
  const requestDismiss = React.useCallback((reason: ToastDismissReason) => {
    setDismissReason((prev) => prev ?? reason);
  }, []);

  React.useEffect(() => {
    if (__DEV__ && duration !== 'persistent' && forcedPersistent) {
      console.warn('Toast: `duration` should be `persistent` when an action is present or `tone` is `danger`, so the toast is never missed.');
    }
    // Reflects how this instance was configured on mount; a live toast is not reconfigured.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (Platform.OS === 'ios' && message !== '') {
      AccessibilityInfo.announceForAccessibility(message);
    }
    // Announces once, when the toast is shown, per the platform notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The auto-dismiss timer, pausable by touch. `motion.duration.loop` keeps `short`/
  // `long` sensible even in a theme with no dedicated toast-duration token.
  const totalDuration = effectiveDuration === 'persistent' ? null : t.motionDurationLoop * DURATION_LOOPS[effectiveDuration];
  const remainingRef = React.useRef(totalDuration ?? 0);
  const timerStartRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = React.useCallback(() => {
    if (totalDuration === null || dismissReason !== null) {
      return;
    }
    clearTimer();
    timerStartRef.current = Date.now();
    timerRef.current = setTimeout(() => requestDismiss('timeout'), remainingRef.current);
  }, [totalDuration, dismissReason, clearTimer, requestDismiss]);

  const pauseTimer = React.useCallback(() => {
    if (totalDuration === null) {
      return;
    }
    clearTimer();
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - timerStartRef.current));
  }, [totalDuration, clearTimer]);

  React.useEffect(() => {
    startTimer();
    return clearTimer;
    // Starts once on mount; `duration` does not change over a toast's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fades and rises in on mount, instant under reduced motion.
  const progress = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: enterDuration,
      easing: toEasing(t.motionEasingStandard),
      // react-native-web has no native animated module.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fades out before actually leaving, so `onDismiss` (and a consumer removing it
  // from a list) fires only once the exit is visually complete.
  React.useEffect(() => {
    if (dismissReason === null) {
      return undefined;
    }
    clearTimer();
    if (reducedMotion) {
      onDismiss?.(dismissReason);
      return undefined;
    }
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        onDismiss?.(dismissReason);
      }
    });
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissReason]);

  const handleAction = (): void => {
    onAction?.();
    requestDismiss('action');
  };

  const containerStyle: Animated.WithAnimatedValue<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap,
    maxWidth,
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    borderRadius: radius,
    backgroundColor: t.colorInverseSurface,
    zIndex: layer,
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [t.space2, 0] }) }],
    ...shadow,
  };

  const iconCellStyle: ViewStyle = {
    height: lineHeight,
    justifyContent: 'center',
  };

  const messageStyle: ViewStyle = {
    flex: 1,
  };

  return (
    <View
      testID="Toast"
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion={tone === 'danger' ? 'assertive' : 'polite'}
      accessibilityLabel={message}
      onTouchStart={pauseTimer}
      onTouchEnd={startTimer}
      onTouchCancel={startTimer}
    >
      <Animated.View style={containerStyle}>
        {iconName !== null ? (
          <View style={iconCellStyle} accessibilityElementsHidden importantForAccessibility="no">
            <Icon name={iconName} color={iconColor} />
          </View>
        ) : null}
        <View style={messageStyle}>
          <Text
            overrides={{
              color: 'color.inverse.foreground',
              fontFamily: overrides?.fontFamily,
              fontSize: overrides?.fontSize,
              lineHeight: overrides?.lineHeight,
            }}
          >
            {message}
          </Text>
        </View>
        {actionLabel !== undefined ? <Button label={actionLabel} variant="ghost" size="sm" inverse onPress={handleAction} /> : null}
        {isDismissible ? (
          <Button
            label={COPY.dismissLabel}
            variant="ghost"
            size="sm"
            iconOnly
            inverse
            leadingIcon={<Icon name="close" color={t.colorInverseForeground} />}
            onPress={() => requestDismiss('dismiss-button')}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

/** One shown toast, tracked by a `ToastProvider`. */
interface ToastEntry extends ToastProps {
  id: string;
}

/** Options for the imperative `toast()` call; the same shape as `ToastProps`. */
export type ToastOptions = ToastProps;

export interface ToastContextValue {
  /** Shows a toast. Returns its id (generated when `options.toastId` is omitted). Showing a toast with the same `toastId` replaces the previous one (`onDismiss('replaced')` on the one it replaces). */
  toast: (options: ToastOptions) => string;
  /** Removes a toast immediately without animating it out or notifying its `onDismiss`. Prefer letting the toast dismiss itself. */
  dismiss: (id: string) => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Region-level overrides (`stackGap`, `regionInset`, `layer`). Bindings for the toasts themselves belong on each `toast()` call's own `overrides`. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** The most recently mounted `ToastProvider`'s dispatcher, so the module-level `toast()` works outside React. Only one provider is expected to be mounted at a time, per the schema's "one ToastProvider mounted once at the app root". */
let activeDispatch: ToastContextValue | null = null;

const MAX_TOASTS = 3; // literal-ok: schema-specified stack limit, not a design token

/**
 * ToastProvider — mounted once at the app root. Renders the notification region (an
 * absolutely positioned `View` above the bottom safe-area inset, `layer.toast`
 * z-index, centered, up to three toasts stacked newest-at-the-bottom) and exposes
 * `useToast()` / the module-level `toast()` so any code can show one. A toast shown
 * with a `toastId` already on screen replaces it (`onDismiss('replaced')` on the
 * replaced one); showing a fourth toast evicts the oldest the same way.
 */
export function ToastProvider({ children, overrides }: ToastProviderProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [entries, setEntries] = React.useState<ToastEntry[]>([]);
  const entriesRef = React.useRef<ToastEntry[]>([]);
  const counterRef = React.useRef(0);

  const dismiss = React.useCallback((id: string) => {
    entriesRef.current = entriesRef.current.filter((entry) => entry.id !== id);
    setEntries(entriesRef.current);
  }, []);

  const toast = React.useCallback((options: ToastOptions): string => {
    const id = options.toastId ?? `toast-${(counterRef.current += 1)}`;
    const current = entriesRef.current;
    const replaced = current.find((entry) => entry.id === id);
    replaced?.onDismiss?.('replaced');
    const survivors = current.filter((entry) => entry.id !== id);
    const next = [...survivors, { ...options, id }];
    const evicted = next.length > MAX_TOASTS ? next.shift() : undefined;
    evicted?.onDismiss?.('replaced');
    entriesRef.current = next;
    setEntries(next);
    return id;
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  React.useEffect(() => {
    activeDispatch = value;
    return () => {
      if (activeDispatch === value) {
        activeDispatch = null;
      }
    };
  }, [value]);

  const regionInset = overrides?.regionInset ? (resolveToken(t, overrides.regionInset) as number) : t.layoutGutter;
  const stackGap = overrides?.stackGap ? (resolveToken(t, overrides.stackGap) as number) : t.layoutGapTight;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerToast;

  const regionStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: regionInset,
    alignItems: 'center',
    gap: stackGap,
    zIndex: layer,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View testID="Toast.region" style={regionStyle} pointerEvents="box-none" accessibilityLabel={COPY.regionLabel}>
        {entries.map((entry) => (
          <Toast
            {...entry}
            key={entry.id}
            onDismiss={(reason) => {
              entry.onDismiss?.(reason);
              dismiss(entry.id);
            }}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/** Returns `{ toast, dismiss }` bound to the nearest `ToastProvider`. Warns and no-ops without one. */
export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (context === null) {
    if (__DEV__) {
      console.warn('useToast: no ToastProvider is mounted. Wrap the app root in <ToastProvider>.');
    }
    return { toast: () => '', dismiss: () => undefined };
  }
  return context;
}

/** Shows a toast from anywhere, not just from inside a component. Requires a `ToastProvider` mounted at the app root; warns and no-ops otherwise. */
export function toast(options: ToastOptions): string {
  if (activeDispatch === null) {
    if (__DEV__) {
      console.warn('toast(): no ToastProvider is mounted. Wrap the app root in <ToastProvider>.');
    }
    return '';
  }
  return activeDispatch.toast(options);
}
