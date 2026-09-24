# @design-schema/tokens

The design tokens behind [Design Schema](https://designschema.ai): color, type, space, radius, motion, elevation and layout. Each theme comes in light and dark, and in four formats: CSS custom properties, ES modules, React Native modules and JSON. The component packages style themselves entirely from these, so this package is also how you theme them.

**Docs and the full token reference: [designschema.ai/docs/foundations](https://designschema.ai/docs/foundations)**

## Install

```sh
npm install @design-schema/tokens
```

It has no dependencies and is ESM only.

## Themes

| Theme | id |
| --- | --- |
| Calm & precise | `calm-precise` |
| Warm & friendly | `warm-friendly` |
| Warm & sleek (preview) | `warm-sleek` |

## Formats

For every theme `<id>`:

| Import | What it is |
| --- | --- |
| `@design-schema/tokens/<id>/css` | CSS custom properties. Light applies on `:root`, dark under `[data-mode="dark"]`. |
| `@design-schema/tokens/<id>/light`, `/dark` | ES module, one named export per token (`colorBackground`, `spaceMd`, …) |
| `@design-schema/tokens/<id>/rn/light`, `/rn/dark` | The same, with React Native values (unitless numbers) |
| `@design-schema/tokens/<id>/json/light`, `/json/dark` | Flat JSON, keyed by dotted token name |
| `@design-schema/tokens` | The `TokenRef` type: every dotted token name, for typed lookups |

```css
@import '@design-schema/tokens/calm-precise/css';

.panel {
  background: var(--color-background-subtle);
  color: var(--color-foreground);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
```

```ts
import { colorLink, spaceMd } from '@design-schema/tokens/calm-precise/light';
```

Set `data-mode="dark"` on `<html>` (or any ancestor) to switch the CSS to dark.

## Using them with the components

- [`@design-schema/react`](https://www.npmjs.com/package/@design-schema/react): import `<id>/css` once at the app root
- [`@design-schema/lit`](https://www.npmjs.com/package/@design-schema/lit): the same, and the properties inherit into every shadow root
- [`@design-schema/rn`](https://www.npmjs.com/package/@design-schema/rn): its `ThemeProvider` reads the `rn` modules for you

## Your own theme

A theme is one Markdown doc, and every value here is derived from it, with contrast checked for every pairing in both modes. To make your own, fork the [repository](https://github.com/truhkx/design-schema) and write a theme doc.

MIT licensed.
