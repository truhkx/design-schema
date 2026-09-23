import * as React from 'react';
import { AccessibilityInfo, Animated, AppState, Platform, View } from 'react-native';
import type { AppStateStatus, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Text, TextForegroundContext } from './Text';
import type { TextOverridableBinding } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type ToastDuration = 'short' | 'long' | 'persistent';
/**
 * Why the toast left the screen. `escape` belongs to the web keyboard model and is
 * never reported on native (there is no Escape to press inside a toast); it stays in
 * the union so handlers are shared across platforms.
 */
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'escape' | 'action' | 'replaced' | 'programmatic';

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
  | 'enterOffset'
  | 'exit';

export interface ToastProps {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays until dismissed and pauses while touched. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (`motion.duration.loop` × 6 / × 12, so themes without motion
   * still get sensible times), `persistent` until dismissed. When `actionLabel` is set or `tone` is
   * `danger` the toast is persistent regardless of this prop (a dev warning notes the override only
   * when `duration` was passed explicitly as `short` or `long`). If `motion.duration.loop` is 0,
   * both durations are persistent.
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible regardless of this prop. */
  dismissible?: boolean | undefined;
  /** Stable identity; a `ToastProvider` showing a toast with the same toastId replaces the previous one instead of stacking. Unused by a standalone `Toast`. */
  toastId?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the action button is activated, before `onDismiss('action')`. The toast then dismisses. */
  onAction?: (() => void) | undefined;
  /**
   * Fired when the toast begins to leave, with the reason — synchronously, at the state change
   * that starts the exit transition. The toast is removed once that transition ends.
   */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}

const COPY = {
  dismissLabel: 'Dismiss',
  regionLabel: 'Notifications',
} as const;

/** `icon`: Icon `name={tone}` with `color.inverse.status.{tone}` forwarded to Icon's `overrides.color`; `neutral` renders no icon. */
const TONE_ICON = {
  neutral: null,
  success: { name: 'success', color: 'color.inverse.status.success' },
  warning: { name: 'warning', color: 'color.inverse.status.warning' },
  danger: { name: 'danger', color: 'color.inverse.status.danger' },
} as const satisfies Record<ToastTone, { name: IconName; color: TokenRef } | null>;

/** constants.shortDuration / longDuration: `motion.duration.loop` × multiplier, in ms. */
const DURATION_MULTIPLIER = { short: 6, long: 12 } as const satisfies Record<'short' | 'long', number>;

/**
 * Typography belongs to the composed Text, so `fontFamily`, `fontSize` and `lineHeight` are
 * forward-only: the toast never styles them itself, and the value — an override or this
 * default — is always passed to Text's `overrides` under the same name.
 */
type ToastTextBinding = ToastOverridableBinding & TextOverridableBinding;

const TEXT_DEFAULT: Record<ToastTextBinding, TokenRef> = {
  fontFamily: 'font.family.body', // literal-ok: a TokenRef forwarded to Text, not a font stack
  fontSize: 'font.size.md',
  lineHeight: 'font.lineHeight.normal',
};

type PauseSource = 'touch' | 'hidden';

/**
 * Provided by a `ToastProvider` to each toast it shows. `exiting` turns true once the toast has
 * reported `onDismiss`, or when `dismiss()` (which reports on the toast's behalf) asks it to
 * leave; `onExited` tells the provider the exit transition has ended so it can remove the
 * toast. `null` outside a provider.
 */
interface ToastExit {
  exiting: boolean;
  onExited: () => void;
}

const ToastExitContext: React.Context<ToastExit | null> = React.createContext<ToastExit | null>(null);

/**
 * Toast — says "done" and gets out of the way. Confirms an action just taken,
 * offers one chance to undo it, and leaves without being asked.
 *
 * When to use: confirm a completed action the user did not have to watch (sent,
 * saved, deleted, copied), offer Undo for a reversible action, or report a
 * background result. Match `tone` to the outcome. Never toast an error that needs
 * fixing (use Alert) or anything requiring more than one action. Show toasts through
 * `ToastProvider` + `useToast()` / `toast()`; a notification is an event, not a place
 * in the tree.
 *
 * Renders a `View` carrying the tone's icon (`neutral` has none), the message, an
 * optional action `Button` and a dismiss `Button` — both `ghost` + `inverse`, so they
 * read against `color.inverse.surface` without Toast restyling them.
 * React Native has no `status` role: `danger` gets `accessibilityRole="alert"` and
 * `accessibilityLiveRegion="assertive"`, every other tone no role and `polite`
 * (Android). iOS ignores live regions, so the message is announced once on mount
 * (queued for polite tones, interrupting for `danger`).
 *
 * The toast rises and fades in over `enter`, and sinks and fades out over `exit`;
 * `onDismiss` fires as the exit begins and the toast renders nothing once it ends. Both
 * are instant under reduced motion. A timer dismisses it after
 * the effective duration unless that is `persistent` — which it always is once
 * `actionLabel` is set or `tone` is `danger` (a `__DEV__` warning flags the mismatch).
 * The timer pauses while the toast is touched and while the app is not in the
 * foreground.
 *
 * Acknowledged native limits: F6 and Escape have no native equivalent, so toasts are
 * reached by swiping through the accessibility order and left through the dismiss
 * button, which is always shown for persistent toasts.
 */
export function Toast({
  message,
  tone = 'neutral',
  actionLabel,
  duration: durationProp,
  dismissible = true,
  overrides,
  onAction,
  onDismiss,
}: ToastProps): React.JSX.Element | null {
  const duration: ToastDuration = durationProp ?? 'short';
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.spaceSm;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t.spaceMd;
  const gap = overrides?.gap ? (resolveToken(t, overrides.gap) as number) : t.layoutGapNormal;
  const maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t.layoutMaxWidthProse;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeMd;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const enterOffset = overrides?.enterOffset ? (resolveToken(t, overrides.enterOffset) as number) : t.space2;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  // An action or danger tone forces the toast to stay until dismissed, regardless of `duration`;
  // so does a theme whose `motion.duration.loop` is 0 (no timed durations can be computed).
  const forcedPersistent = actionLabel !== undefined || tone === 'danger';
  const loopResolved = t.motionDurationLoop > 0;
  const effectiveDuration: ToastDuration = forcedPersistent || !loopResolved ? 'persistent' : duration;
  const isDismissible = effectiveDuration === 'persistent' ? true : dismissible;
  const icon = TONE_ICON[tone];
  const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);

  // `exiting` starts the exit transition; `exited` removes the toast once it has ended.
  const [exiting, setExiting] = React.useState(false);
  const [exited, setExited] = React.useState(false);
  const dismissedRef = React.useRef(false);
  const onDismissRef = React.useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const exitContext = React.useContext(ToastExitContext);

  // `onDismiss` is after-change: it fires synchronously at the state change that starts the
  // exit transition, so a caller knows the reason before the animation rather than after it.
  const requestDismiss = React.useCallback((reason: ToastDismissReason) => {
    if (dismissedRef.current) {
      return;
    }
    dismissedRef.current = true;
    setExiting(true);
    onDismissRef.current?.(reason);
  }, []);

  React.useEffect(() => {
    // Only an explicit `short` or `long` warns; the default never does. It fires again
    // whenever a change to `duration`, `actionLabel` or `tone` enters that case.
    if (__DEV__ && forcedPersistent && (durationProp === 'short' || durationProp === 'long')) {
      console.warn(
        `Toast: \`duration: ${durationProp}\` is ignored — a toast with an action or \`tone: danger\` is persistent until dismissed.`,
      );
    }
  }, [forcedPersistent, durationProp]);

  React.useEffect(() => {
    if (Platform.OS === 'ios' && message !== '') {
      if (tone === 'danger') {
        AccessibilityInfo.announceForAccessibility(message);
      } else {
        AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: true });
      }
    }
    // Announces once, when the toast is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The auto-dismiss timer. Read once at mount from the resolved `motion.duration.loop`.
  const totalDurationRef = React.useRef<number | null>(
    effectiveDuration === 'persistent' ? null : t.motionDurationLoop * DURATION_MULTIPLIER[effectiveDuration],
  );

  // `dismiss(toastId?)` on the provider has already reported `programmatic` for this toast;
  // it leaves through the exit transition like every reason but `replaced`.
  const providerExiting = exitContext?.exiting === true;
  React.useEffect(() => {
    if (providerExiting && !dismissedRef.current) {
      dismissedRef.current = true;
      setExiting(true);
    }
  }, [providerExiting]);
  const remainingRef = React.useRef(totalDurationRef.current ?? 0);
  const timerStartRef = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = React.useRef<Set<PauseSource>>(new Set());

  const stopTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - timerStartRef.current));
    }
  }, []);

  const runTimer = React.useCallback(() => {
    if (totalDurationRef.current === null || dismissedRef.current || timerRef.current !== null || pausedRef.current.size > 0) {
      return;
    }
    timerStartRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      requestDismiss('timeout');
    }, remainingRef.current);
  }, [requestDismiss]);

  const pause = React.useCallback(
    (source: PauseSource) => {
      pausedRef.current.add(source);
      stopTimer();
    },
    [stopTimer],
  );

  const resume = React.useCallback(
    (source: PauseSource) => {
      pausedRef.current.delete(source);
      runTimer();
    },
    [runTimer],
  );

  React.useEffect(() => {
    if (AppState.currentState !== 'active' && AppState.currentState != null) {
      pausedRef.current.add('hidden');
    }
    runTimer();
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        resume('hidden');
      } else {
        pause('hidden');
      }
    });
    return () => {
      subscription.remove();
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [runTimer, pause, resume]);

  // Rises and fades in on mount, instant under reduced motion.
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

  // The reverse of `enter`: sinks by `enterOffset` while fading, then the toast is removed.
  const finishExit = React.useCallback(() => {
    setExited(true);
    exitContext?.onExited();
  }, [exitContext]);

  React.useEffect(() => {
    if (!exiting) {
      return undefined;
    }
    stopTimer();
    // Immediate under reduced motion or when the exit time does not resolve to a positive duration.
    if (reducedMotion || !(exitDuration > 0)) {
      finishExit();
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
        finishExit();
      }
    });
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exiting]);

  const handleAction = (): void => {
    if (dismissedRef.current) {
      return;
    }
    onAction?.();
    requestDismiss('action');
  };

  const toastStyle: Animated.WithAnimatedValue<ViewStyle> = {
    flexDirection: 'row',
    alignItems: 'center',
    // No `alignSelf`: the region centers its toasts at every width (`alignItems: 'center'`),
    // and a standalone toast takes the cross-axis alignment of whatever holds it.
    gap,
    maxWidth,
    // minTarget (locked): the row is never shorter than a touch target, even with no buttons.
    // The Buttons size their own targets; this floor is the toast's alone.
    minHeight: t.sizeTargetMin,
    paddingVertical: paddingBlock,
    paddingHorizontal: paddingInline,
    borderRadius: radius,
    backgroundColor: t.colorInverseSurface,
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [enterOffset, 0] }) }],
    ...shadow,
  };

  const iconCellStyle: ViewStyle = {
    height: lineHeight,
    justifyContent: 'center',
  };

  const messageStyle: ViewStyle = {
    flexShrink: 1,
    flexGrow: 1,
  };

  // Typography is forward-only: the value, an override or the binding's own token, is
  // always passed to the composed Text rather than drawn on the toast.
  const textOverrides = React.useMemo<Partial<Record<TextOverridableBinding, TokenRef | undefined>>>(() => {
    const next: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    for (const binding of Object.keys(TEXT_DEFAULT) as ToastTextBinding[]) {
      next[binding] = overrides?.[binding] ?? TEXT_DEFAULT[binding];
    }
    return next;
  }, [overrides]);

  if (exited) {
    return null;
  }

  const live = tone === 'danger' ? 'assertive' : 'polite';

  // Not `accessible`: that would merge the action and dismiss Buttons into one node.
  return (
    <Animated.View
      testID="Toast"
      style={toastStyle}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion={live}
      aria-live={live}
      accessibilityLabel={message}
      aria-label={message}
      onTouchStart={() => pause('touch')}
      onTouchEnd={() => resume('touch')}
      onTouchCancel={() => resume('touch')}
    >
      {/* text: color.inverse.foreground, locked. Text's own `color` binding is locked, so the
          toast re-scopes the foreground on its own container and composes Text unchanged. */}
      <TextForegroundContext.Provider value={t.colorInverseForeground}>
        {icon !== null ? (
          <View testID="Toast.icon" style={iconCellStyle} accessibilityElementsHidden importantForAccessibility="no">
            <Icon name={icon.name} overrides={{ color: icon.color }} />
          </View>
        ) : null}
        <View testID="Toast.message" style={messageStyle}>
          {/* React Native Text has no `element`, so the message part takes only `size: md`. */}
          <Text size="md" overrides={textOverrides}>
            {message}
          </Text>
        </View>
        {actionLabel !== undefined ? (
          <View testID="Toast.actionButton">
            <Button label={actionLabel} variant="ghost" size="sm" inverse onPress={handleAction} />
          </View>
        ) : null}
        {isDismissible ? (
          /* dismissColor: native has no currentColor, so the glyph takes color.inverse.link
             through Icon's own `overrides`, the sanctioned way to color a composed child. */
          <View testID="Toast.dismissButton">
            <Button
              label={COPY.dismissLabel}
              variant="ghost"
              size="sm"
              iconOnly
              inverse
              leadingIcon={<Icon name="close" overrides={{ color: 'color.inverse.link' }} />}
              onPress={() => requestDismiss('dismiss-button')}
            />
          </View>
        ) : null}
      </TextForegroundContext.Provider>
    </Animated.View>
  );
}

/** Options for the imperative `toast()` call; the same shape as `ToastProps`. */
export type ToastOptions = ToastProps;

/** What `toast()` resolves to once the toast begins to leave the screen. */
export interface ToastResult {
  reason: ToastDismissReason;
}

export interface ToastContextValue {
  /**
   * Shows a toast and resolves with `{ reason }` when it begins to leave. Showing a toast with a
   * `toastId` already on screen replaces it; the replaced toast leaves immediately with
   * reason `replaced`, as does the oldest one when a fourth is shown.
   */
  toast: (options: ToastOptions) => Promise<ToastResult>;
  /**
   * Dismisses the toast with this `toastId`, or every shown toast when called with no id,
   * with reason `programmatic`. Each leaves through its exit transition.
   */
  dismiss: (toastId?: string | undefined) => void;
}

export interface ToastProviderProps {
  children?: React.ReactNode;
  /** Region-level overrides (`stackGap`, `regionInset`, `layer`). Bindings for the toasts themselves belong on each `toast()` call's own `overrides`. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
}

/** One shown toast, tracked by a `ToastProvider`. */
interface ToastEntry {
  id: string;
  options: ToastOptions;
  resolve: (result: ToastResult) => void;
  /**
   * True once the toast has been reported (`onDismiss` fired, the promise resolved) and is
   * playing its exit transition. It no longer counts toward the three and is removed when the
   * transition ends.
   */
  exiting: boolean;
}

const ToastContext: React.Context<ToastContextValue | null> = React.createContext<ToastContextValue | null>(null);

/** The mounted `ToastProvider`'s dispatcher, so the module-level `toast()` works outside React. */
let activeDispatch: ToastContextValue | null = null;

const MAX_TOASTS = 3; // literal-ok: the doc's stack limit ("Up to three toasts stack"), not a design token

/**
 * ToastProvider — mounted once at the app root. Renders the notification region (an
 * absolutely positioned `View` at `layer.toast` z-index, `regionInset` above the
 * bottom edge, centered, up to three toasts stacked newest-at-the-bottom) and exposes
 * `useToast()` / the module-level `toast()` so any code can show one.
 */
export function ToastProvider({ children, overrides }: ToastProviderProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [entries, setEntries] = React.useState<ToastEntry[]>([]);
  const entriesRef = React.useRef<ToastEntry[]>([]);
  const counterRef = React.useRef(0);

  const commit = React.useCallback((next: ToastEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  /** Reports `reason` to the entry's caller: its `onDismiss`, then the promise. */
  const report = (entry: ToastEntry, reason: ToastDismissReason): void => {
    entry.options.onDismiss?.(reason);
    entry.resolve({ reason });
  };

  /**
   * The toast began to leave (`onDismiss` from the toast itself): report at once and mark it
   * exiting; it stays mounted until its exit transition ends.
   */
  const handleDismiss = React.useCallback(
    (id: string, reason: ToastDismissReason) => {
      const entry = entriesRef.current.find((candidate) => candidate.id === id);
      if (entry === undefined || entry.exiting) {
        return;
      }
      commit(entriesRef.current.map((candidate) => (candidate === entry ? { ...candidate, exiting: true } : candidate)));
      report(entry, reason);
    },
    [commit],
  );

  /** The exit transition ended: remove the toast. */
  const remove = React.useCallback(
    (id: string) => {
      commit(entriesRef.current.filter((candidate) => candidate.id !== id));
    },
    [commit],
  );

  const toast = React.useCallback(
    (options: ToastOptions): Promise<ToastResult> =>
      new Promise<ToastResult>((resolve) => {
        counterRef.current += 1;
        const id = options.toastId ?? `toast-${counterRef.current}`;
        // `replaced` leaves immediately, without its exit transition; one already exiting
        // under the same id has been reported and is simply removed.
        const replaced = entriesRef.current.find((candidate) => candidate.id === id);
        const next: ToastEntry[] = [
          ...entriesRef.current.filter((candidate) => candidate !== replaced),
          { id, options, resolve, exiting: false },
        ];
        // A toast already in its exit transition does not count toward the three, so the
        // oldest one still staying is the one evicted. Only one can exceed at a time.
        const staying = next.filter((candidate) => !candidate.exiting);
        const evicted = staying.length > MAX_TOASTS ? staying[0] : undefined;
        commit(evicted === undefined ? next : next.filter((candidate) => candidate !== evicted));
        if (replaced !== undefined && !replaced.exiting) {
          report(replaced, 'replaced');
        }
        if (evicted !== undefined) {
          report(evicted, 'replaced');
        }
      }),
    [commit],
  );

  const dismiss = React.useCallback(
    (toastId?: string | undefined) => {
      const leaving = entriesRef.current.filter((entry) => (toastId === undefined || entry.id === toastId) && !entry.exiting);
      if (leaving.length === 0) {
        return;
      }
      // `programmatic` plays the exit transition: report now, remove once each toast has exited.
      commit(entriesRef.current.map((entry) => (leaving.includes(entry) ? { ...entry, exiting: true } : entry)));
      for (const entry of leaving) {
        report(entry, 'programmatic');
      }
    },
    [commit],
  );

  const value = React.useMemo<ToastContextValue>(() => ({ toast, dismiss }), [toast, dismiss]);

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
    left: regionInset,
    right: regionInset,
    bottom: regionInset,
    alignItems: 'center',
    gap: stackGap,
    zIndex: layer,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* `role="region"` carries the name: the region exists before any toast, and an
          `accessibilityLabel` on a View with no role is an `aria-label` on a bare <div>
          under react-native-web (axe `aria-prohibited-attr`). It is also the role the web
          and Lit regions use, so the three platforms announce the same landmark. */}
      <View
        testID="Toast.region"
        style={regionStyle}
        pointerEvents="box-none"
        role="region"
        accessibilityLabel={COPY.regionLabel}
        aria-label={COPY.regionLabel}
      >
        {entries.map((entry) => (
          <ToastExitContext.Provider key={entry.id} value={{ exiting: entry.exiting, onExited: () => remove(entry.id) }}>
            <Toast {...entry.options} onDismiss={(reason) => handleDismiss(entry.id, reason)} />
          </ToastExitContext.Provider>
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
    return { toast: () => new Promise<ToastResult>(() => undefined), dismiss: () => undefined };
  }
  return context;
}

/** Shows a toast from anywhere, not just from inside a component. Requires a `ToastProvider` at the app root; warns and never resolves otherwise. */
export function toast(options: ToastOptions): Promise<ToastResult> {
  if (activeDispatch === null) {
    if (__DEV__) {
      console.warn('toast(): no ToastProvider is mounted. Wrap the app root in <ToastProvider>.');
    }
    return new Promise<ToastResult>(() => undefined);
  }
  return activeDispatch.toast(options);
}
