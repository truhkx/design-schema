import * as React from 'react';
import { AccessibilityInfo, Easing, Platform, useColorScheme } from 'react-native';
import type { EasingFunction, TextStyle } from 'react-native';
import * as light from '@design-schema/tokens/calm-precise/rn/light';
import * as dark from '@design-schema/tokens/calm-precise/rn/dark';

/** The flat React Native token object for one mode (dimensions are numbers, colors are strings). */
export type Tokens = typeof light;

/** A resolved color mode. */
export type ThemeMode = 'light' | 'dark';

/** What a consumer may ask for; `system` follows the OS appearance via `useColorScheme()`. */
export type ThemeModeSetting = ThemeMode | 'system';

export interface Theme {
  /** The resolved mode (never `system`). */
  mode: ThemeMode;
  /** The token module for the resolved mode. */
  tokens: Tokens;
}

export interface ThemeProviderProps {
  /** Which mode to apply. Defaults to `system`. */
  mode?: ThemeModeSetting | undefined;
  children: React.ReactNode;
}

const lightTokens: Tokens = light;
const darkTokens: Tokens = dark;

const THEMES: Record<ThemeMode, Theme> = {
  light: { mode: 'light', tokens: lightTokens },
  dark: { mode: 'dark', tokens: darkTokens },
};

const ThemeContext = React.createContext<Theme | null>(null);

/**
 * Calm & precise theme provider for React Native.
 *
 * Selects the light or dark token module and exposes it through `useTheme()`.
 * `mode="system"` (the default) resolves through React Native's `useColorScheme()`.
 */
export function ThemeProvider({ mode = 'system', children }: ThemeProviderProps): React.JSX.Element {
  const scheme = useColorScheme();
  const resolved: ThemeMode = mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : mode;
  return <ThemeContext.Provider value={THEMES[resolved]}>{children}</ThemeContext.Provider>;
}

/**
 * Returns the active `{ mode, tokens }`.
 *
 * Works without a provider by following the OS appearance, so components never
 * fall back to hard-coded values.
 */
export function useTheme(): Theme {
  const context = React.useContext(ThemeContext);
  const scheme = useColorScheme();
  if (context !== null) {
    return context;
  }
  return THEMES[scheme === 'dark' ? 'dark' : 'light'];
}

/**
 * Converts a numeric `font.weight.*` token (400, 500, 600, 700) into React Native's
 * `fontWeight` union. The token module types weights as `number`, which is not
 * assignable to `TextStyle['fontWeight']` under strict mode.
 */
export function toFontWeight(value: number): TextStyle['fontWeight'] {
  switch (Math.round(value / 100) * 100) {
    case 100:
      return '100';
    case 200:
      return '200';
    case 300:
      return '300';
    case 400:
      return '400';
    case 500:
      return '500';
    case 600:
      return '600';
    case 700:
      return '700';
    case 800:
      return '800';
    case 900:
      return '900';
    default:
      return 'normal';
  }
}

/**
 * React Native `lineHeight` is an absolute size, while the `font.lineHeight.*`
 * tokens are unitless multipliers. Resolve them against the font size.
 */
export function toLineHeight(fontSize: number, multiplier: number): number {
  return Math.round(fontSize * multiplier);
}

/**
 * Converts a `motion.easing.*` token (a cubic-bézier as four numbers) into an
 * `Animated` easing function. Anything that is not four numbers falls back to
 * `Easing.linear` rather than a hand-written curve.
 */
export function toEasing(value: readonly number[]): EasingFunction {
  const [x1, y1, x2, y2] = value;
  if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
    return Easing.linear;
  }
  return Easing.bezier(x1, y1, x2, y2);
}

/** The slice of `window.matchMedia` this hook needs; the package has no DOM lib. */
type MediaMatcher = { matchMedia?: ((query: string) => { matches: boolean }) | undefined };

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * The preference as of this instant, for the first render. react-native-web resolves
 * `isReduceMotionEnabled()` from this very media query, so the synchronous read agrees with
 * the promise below; it just arrives a render earlier. Native has no synchronous source, so
 * it keeps the asynchronous answer alone.
 */
function reducedMotionNow(): boolean {
  if (Platform.OS !== 'web') {
    return false;
  }
  const media = globalThis as MediaMatcher;
  return typeof media.matchMedia === 'function' ? media.matchMedia(REDUCED_MOTION_QUERY).matches : false;
}

/**
 * Whether the person has asked the OS to reduce motion, so components can skip `Animated`
 * transitions and set their final value directly. On web it is known synchronously for the
 * first render — an entrance animation that plays once before an asynchronous answer arrives
 * is motion the person asked not to see. Native resolves asynchronously (assume `false` until
 * then). Both follow later changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(reducedMotionNow);
  React.useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setReduced(enabled);
        }
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}
