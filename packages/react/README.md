# @design-schema/react

Accessible React components generated from [Design Schema](https://designschema.ai). There are 51 components, from Button and Dialog to DataGrid and TreeGrid. Every color, size and duration comes from a theme's tokens, so changing the theme restyles all of them.

**Docs, live examples and each component's accessibility contract: [designschema.ai/docs](https://designschema.ai/docs)**

## Install

```sh
npm install @design-schema/react @design-schema/tokens
```

`react` and `react-dom` 19 are peer dependencies. The package is ESM only.

## Use

Import the two stylesheets once, at your app's root: a theme's tokens, then the components' styles.

```tsx
import '@design-schema/tokens/calm-precise/css';
import '@design-schema/react/index.css';

import { Button, Dialog } from '@design-schema/react';

export function Save() {
  return <Button label="Save" variant="primary" onClick={() => console.log('saved')} />;
}
```

Without the tokens stylesheet the components render but have no colors, spacing or type. Each theme is one stylesheet:

| Theme | Import |
| --- | --- |
| Calm & precise | `@design-schema/tokens/calm-precise/css` |
| Warm & friendly | `@design-schema/tokens/warm-friendly/css` |

For dark mode, set `data-mode="dark"` on `<html>` (or any ancestor). Light is the default.

## Your own theme

A theme is one Markdown doc: a few decisions about color, type, corners, density and motion. The generator derives every token from it. To build a theme, or to regenerate the components under your own names, fork the [repository](https://github.com/truhkx/design-schema) and start from [Two ways in](https://designschema.ai/docs).

## Related packages

- [`@design-schema/tokens`](https://www.npmjs.com/package/@design-schema/tokens): the themes as CSS, JS, React Native and JSON
- [`@design-schema/lit`](https://www.npmjs.com/package/@design-schema/lit): the same components as custom elements
- [`@design-schema/rn`](https://www.npmjs.com/package/@design-schema/rn): the same components for React Native

MIT licensed.
