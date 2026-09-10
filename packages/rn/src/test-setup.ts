// Loaded by jest.config.cjs after the environment: Testing Library's native matchers
// (toBeChecked, toBeDisabled, toBeOnTheScreen…) — opt-in in v12 — and a silenced animated-node
// warning from the native Switch mock.
import '@testing-library/react-native/extend-expect';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
