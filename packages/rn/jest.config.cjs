// The tests gate (tools/checks.py) runs `pnpm test -- src/<Name>.test.tsx` per component.
// React Native's own Jest preset (test renderer + native mocks) with the workspace packages
// added to the transform allowlist; pnpm nests real paths under node_modules/.pnpm, hence the
// lookahead that skips that segment.
// The behavior gate (tools/behavior_tests.py) writes generated/behavior/<Name>.rn.test.tsx, run
// with `pnpm test -- generated/behavior/<Name>.rn`; it is included here too.
module.exports = {
  preset: 'react-native',
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/*.test.tsx', '<rootDir>/../../generated/behavior/*.rn.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!\\.pnpm/|((jest-)?react-native|@react-native(-community)?|@design-schema)/)',
  ],
};
