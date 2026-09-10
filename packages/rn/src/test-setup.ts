// Loaded by jest.config.cjs after the environment: Testing Library's native matchers
// (toBeChecked, toBeDisabled, toBeOnTheScreen…) — opt-in in v12 — plus the two things React Native's own
// Jest preset leaves half-mocked: the animated-node helper (warns) and AccessibilityInfo's promise-returning
// queries (`jest.fn()` returning undefined, so `isReduceMotionEnabled().then` throws in useReducedMotion).
import '@testing-library/react-native/extend-expect';
import { AccessibilityInfo } from 'react-native';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

for (const method of ['isReduceMotionEnabled', 'isReduceTransparencyEnabled', 'prefersCrossFadeTransitions', 'isBoldTextEnabled',
                      'isGrayscaleEnabled', 'isInvertColorsEnabled', 'isScreenReaderEnabled'] as const) {
  const fn = (AccessibilityInfo as unknown as Record<string, jest.Mock | undefined>)[method];
  if (fn && typeof fn.mockResolvedValue === 'function') {
    fn.mockResolvedValue(false);
  }
}
