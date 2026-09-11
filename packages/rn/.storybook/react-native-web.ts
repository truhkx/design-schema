// What `react-native` resolves to in this Storybook (see main.ts): react-native-web, plus the one
// export it dropped in 0.20 when React 19 removed `findDOMNode`. Its replacement throws on every call,
// and the package calls `findNodeHandle` before `AccessibilityInfo.setAccessibilityFocus`, which is
// a no-op on web anyway. Returning null keeps the 0.19-era behaviour: the null guard in each
// component skips the focus call and nothing throws.
export * from 'react-native-web';

export function findNodeHandle(_component: unknown): null {
  return null;
}
