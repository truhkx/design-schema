# @design-schema/lit

Accessible web components (custom elements built with Lit) generated from [Design Schema](https://designschema.ai). They work in any framework, or with none. There are 51 components, from `<ds-button>` and `<ds-dialog>` to `<ds-data-grid>`. Every color, size and duration comes from a theme's tokens, so changing the theme restyles all of them.

**Docs, live examples and each component's accessibility contract: [designschema.ai/docs](https://designschema.ai/docs)**

## Install

```sh
npm install @design-schema/lit @design-schema/tokens
```

`lit` 3 is a peer dependency. The package is ESM only.

## Use

Import a theme's tokens and the package once, at your app's entry point. Importing the package registers every `ds-*` element.

```js
import '@design-schema/tokens/calm-precise/css';
import '@design-schema/lit';
```

```html
<ds-button label="Save" variant="primary"></ds-button>

<script type="module">
  document.querySelector('ds-button').addEventListener('press', () => console.log('saved'));
</script>
```

Events are `CustomEvent`s that bubble and cross shadow roots (`press`, `close`, `change` and so on; each component's page lists them). Token custom properties inherit into every shadow root, so the one stylesheet themes every element.

Without the tokens stylesheet the elements render but have no colors, spacing or type. Each theme is one stylesheet:

| Theme | Import |
| --- | --- |
| Calm & precise | `@design-schema/tokens/calm-precise/css` |
| Warm & friendly | `@design-schema/tokens/warm-friendly/css` |

For dark mode, set `data-mode="dark"` on `<html>` (or any ancestor). Light is the default.

## Your own theme

A theme is one Markdown doc: a few decisions about color, type, corners, density and motion. The generator derives every token from it. To build a theme, or to regenerate the elements under your own tag names, fork the [repository](https://github.com/truhkx/design-schema) and start from [Two ways in](https://designschema.ai/docs).

## Related packages

- [`@design-schema/tokens`](https://www.npmjs.com/package/@design-schema/tokens): the themes as CSS, JS, React Native and JSON
- [`@design-schema/react`](https://www.npmjs.com/package/@design-schema/react): the same components for React
- [`@design-schema/rn`](https://www.npmjs.com/package/@design-schema/rn): the same components for React Native

MIT licensed.
