// The tests gate (tools/checks.ts) runs `pnpm test -- src/<Name>.test.tsx` per component.
// React Native's own Jest preset (test renderer + native mocks; a separate package since 0.87) with
// the workspace packages added to the transform allowlist; pnpm nests real paths under
// node_modules/.pnpm, hence the lookahead that skips that segment.
// The behavior gate (tools/behavior_tests.ts) writes generated/behavior/<Name>.rn.test.tsx, run
// with `pnpm test -- generated/behavior/<Name>.rn`; it is included here too.
const path = require('path');

// This package's react-native, not whichever copy pnpm hoisted next to the preset (the Expo gallery
// app pins the SDK's older release, and the preset's own `require.resolve('react-native')` finds that
// one). Same regex keys as the preset's moduleNameMapper, so these entries replace them.
const reactNativeDir = path.dirname(require.resolve('react-native/package.json'));

module.exports = {
  preset: '@react-native/jest-preset',
  rootDir: __dirname,
  // Jest only walks `roots` (default: rootDir), so the second testMatch entry finds nothing until
  // '<rootDir>/../../generated/behavior' is added to `roots`. Doing so surfaces 24 generated suites
  // failing on `has-accessible-name` (ByRole queries need an `accessible` host element) — a generator
  // question, tracked separately from the RN 0.87 upgrade.
  testMatch: ['<rootDir>/src/**/*.test.tsx', '<rootDir>/../../generated/behavior/*.rn.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    // src/test-setup.ts predates React Native 0.87 and Testing Library 13; both paths it names moved.
    // Mapped here rather than edited there (src/ is generator territory): the Animated helper now
    // lives under src/private, and Testing Library's matchers entry is `matchers` (auto-extended on
    // import of the package since 13, the `extend-expect` file is gone).
    '^react-native/Libraries/Animated/NativeAnimatedHelper$': `${reactNativeDir}/src/private/animated/NativeAnimatedHelper`,
    '^@testing-library/react-native/extend-expect$': '@testing-library/react-native/matchers',
    '^react-native/setup-env$': `${reactNativeDir}/src/setup-env.js`,
    '^react-native($|/.*)': `${reactNativeDir}/$1`,
  },
  transformIgnorePatterns: [
    'node_modules/(?!\\.pnpm/|((jest-)?react-native|@react-native(-community)?|@design-schema)/)',
  ],
};
