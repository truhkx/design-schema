# @design-schema/rn

Accessible React Native components generated from [Design Schema](https://designschema.ai). They are the same 51 components as the web packages, built on platform primitives with native roles, and styled entirely from theme tokens.

**Docs, live examples and each component's accessibility contract: [designschema.ai/docs](https://designschema.ai/docs)**

## Install

```sh
npm install @design-schema/rn @design-schema/tokens react-native-svg
```

The peer dependencies are `react` 19, `react-native` 0.87 or later and `react-native-svg` 15 or later. The package is ESM only and adds no other native modules.

## Use

Wrap your app in `ThemeProvider`. By default it follows the device's light or dark appearance.

```tsx
import { Button, ThemeProvider } from '@design-schema/rn';

export default function App() {
  return (
    <ThemeProvider>
      <Button label="Save" variant="primary" onPress={() => console.log('saved')} />
    </ThemeProvider>
  );
}
```

`<ThemeProvider mode="dark">` (or `"light"`) pins the mode. `useTheme()` returns the active `{ mode, tokens }` for your own styles:

```tsx
import { useTheme } from '@design-schema/rn';

const { tokens } = useTheme();
const style = { backgroundColor: tokens.colorBackground, padding: tokens.spaceMd };
```

Components work without a provider as well: they follow the device appearance.

**Themes:** this build of the package is themed with **Calm & precise**. A different theme on React Native means regenerating from your own fork (below). The web packages switch theme with a stylesheet instead.

## Your own theme

A theme is one Markdown doc: a few decisions about color, type, corners, density and motion. The generator derives every token from it. To build a theme, or to regenerate the components under your own names, fork the [repository](https://github.com/truhkx/design-schema) and start from [Two ways in](https://designschema.ai/docs).

## Related packages

- [`@design-schema/tokens`](https://www.npmjs.com/package/@design-schema/tokens): the themes as CSS, JS, React Native and JSON
- [`@design-schema/react`](https://www.npmjs.com/package/@design-schema/react): the same components for React
- [`@design-schema/lit`](https://www.npmjs.com/package/@design-schema/lit): the same components as custom elements

MIT licensed.
