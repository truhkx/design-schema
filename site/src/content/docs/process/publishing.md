---
title: Publishing
description: What the four npm packages are, how they are built, and the exact commands a person runs to publish them — publishing is never part of the build.
sidebar:
  order: 7
---

Four packages ship from this repository under the `@design-schema` npm organization:

| Package | What it is | Runtime dependencies |
| --- | --- | --- |
| `@design-schema/tokens` | Built tokens per theme, mode and platform: CSS custom properties, ESM modules, React Native modules, JSON. | none |
| `@design-schema/react` | The generated React components plus one stylesheet, `@design-schema/react/index.css`. | `react`, `react-dom` (peers), tokens |
| `@design-schema/lit` | The generated custom elements. Importing the package registers them, so it is marked as having side effects. | `lit` (peer), tokens |
| `@design-schema/rn` | The generated React Native components. | `react`, `react-native`, `react-native-svg` (peers), tokens |

The allowed runtime dependencies are fixed in `tools/check_deps.py`, and the `deps` gate fails a generation that adds one. Everything a component needs is a token or a platform primitive; that is what makes the packages cheap to adopt.

## Build

`main`, `types` and `exports` point at `dist/`, which `tsdown` emits from `src/index.ts` as ESM with type declarations. The declarations come from isolated declarations (every exported symbol carries an explicit type, so no TypeScript compiler run is needed at build time). Stories, tests and demos are not entries, so they never ship; `files` limits the tarball to `dist/`.

```sh
pnpm build:packages     # tsdown in react, lit and rn; tokens are built by `pnpm themes` / `pnpm tokens`
pnpm release:check      # build, then publint, attw --pack and `npm pack --dry-run` per package
```

`release:check` runs three checks per package after the build: `publint` (the `package.json` `exports`, `types` and `files` fields are consistent with what is on disk), `attw --pack` ("are the types wrong": the declarations resolve under every module resolution mode a consumer might use), and `npm pack --dry-run`, the exact file list that would ship. Read that output before every publish. It is the whole point of the script: no file reaches npm that was not in that list.

`@design-schema/tokens` is a normal dependency of the three component packages, declared as `workspace:^`. pnpm rewrites that to the tokens package's version range when it publishes, so consumers get a real semver dependency and the workspace keeps a single copy.

## Publish

Publishing is a human step with a human's credentials. The build never calls npm.

```sh
npm login                          # an account in the design-schema organization
pnpm -r exec npm version 0.1.0     # bump every package to the same version, for now
pnpm build:packages
pnpm release:check
pnpm -r publish --access public    # publishes each non-private package; pnpm rewrites workspace: ranges
```

- The organization requires two-factor authentication, or a granular access token with publish rights scoped to the four packages, for `npm publish`. Set the token in `NPM_TOKEN` or let `npm login` handle 2FA interactively.
- Versions move together. Until the packages have independent release cadences, bump all four with `pnpm -r exec npm version <x>` and tag the commit.
- The root package stays `private`; `pnpm -r publish` skips it, along with the docs site and the Storybook root.

## Consuming

```ts
import '@design-schema/tokens/calm-precise/css';   // once, at the app root
import '@design-schema/react/index.css';           // once, for the React package's component styles
import { Button } from '@design-schema/react';
```

Lit and React Native need only the tokens import for their platform and the component import; see the theme's platform notes.
