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

The allowed runtime dependencies are fixed in `tools/check_deps.ts`, and the `deps` gate fails a generation that adds one. Everything a component needs is a token or a platform primitive; that is what makes the packages cheap to adopt.

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

## The Pages site

Updated 2026-09-12 (job 509). `vision-and-decisions.md` §3 said the GitHub Pages deploy was "landing
page at `/`, docs at `/docs` (Astro build), Storybooks at `/storybook/{react,lit,rn}`". Two parts of
that no longer hold, and job 509's step 5 was to correct that section — except that
`vision-and-decisions.md` has never been a file in this repository. It is referenced from
`website-plan.md`, `customization-and-naming.md` and `tools/site_nav.ts`, and job 504 already found
the same thing when it went looking for the Vision paragraph. So the correction lives here, in the
doc about what this repository publishes, and `vision-and-decisions.md` should be read as superseded
on this point wherever it is kept:

- **"docs at `/docs`" is `apps/website`'s docs section**, not a Starlight build.
  [The public website](/process/website-plan/) explains why that app exists; the consequence for
  publishing is that **`site/` is not deployed at all**. It stays the contributor and spec reference
  — schema decisions, process pages, the MCP server doc — read locally with `pnpm docs` and by
  Claude Code sessions working in the repository. The Pages artifact is `apps/website/dist` and
  nothing else.
- **The Storybooks are not in the artifact.** Each of `packages/{react,lit,rn}` publishes its own
  Storybook to [Chromatic](https://www.chromatic.com/) on its own schedule, with a permanent
  versioned URL per package (job 510, `generated/chromatic.json`). `/storybook/{react,lit,rn}` is
  not a path on the site.

That second change is the one worth keeping the reason for. Folding three Storybook builds into the
Pages job made them a single point of failure for the docs site: one package failing to build its
Storybook failed the whole artifact, and the working docs site went down with it. Separate workflows
share no job, no artifact and no `needs:` edge, so a broken Chromatic publish cannot fail the deploy.
The docs site does not depend on a Storybook being *reachable* either — every example on a component
page renders from its story's args, in the page (`website-plan.md`, "Linking to Storybook") — so a
Chromatic outage costs one "Open in Storybook ↗" link per example and nothing else.

The deploy workflow is `.github/workflows/deploy-pages.yml`. It builds the packages, builds the React
Storybook for its story-id manifest only (`tools/docs_examples.ts` reads
`packages/react/storybook-static/index.json`; nothing is published from it, and lit and rn are not
built), runs `pnpm check` for the site's generated inputs, builds the app, and checks the routes with
`pnpm site:routes` before uploading — a static build exits 0 with a route silently absent, and that
check is what makes the missing page a failed deploy instead of a 404 nobody notices.

## The Storybooks

Added 2026-09-12 (job 510). `.github/workflows/chromatic.yml` publishes one Storybook per package to
its own Chromatic project, on every push to `main` and on every PR — a PR gets its own preview URL,
which is how a generated component's Storybook is reviewed before the component is merged. A small
first job works out which of `packages/{react,lit,rn}` the commit touched (GitHub's `paths:` filter is
workflow-level, and this needs to be per package), and the three publishes are otherwise unrelated to
each other and to the deploy above.

The three permanent URLs live in `generated/chromatic.json` — the one file under `generated/` that is
typed in by hand, because a Chromatic project URL only exists once somebody has created the project.
`pnpm chromatic:check` validates its shape and `pnpm chromatic:check:fetch` requires every URL to
answer 200; an empty string is the deliberate "no project yet" value, and while it is there the
website simply omits that package's "Open in Storybook ↗" links.

Creating the projects and storing their tokens as repository secrets
(`CHROMATIC_PROJECT_TOKEN_{REACT,LIT,RN}`) needs a human with a GitHub and Chromatic account; the
procedure is in `jobs/510-chromatic-storybooks.md`, "Log". Until that is done the workflow is staged
in `.github/workflows-pending/`, not installed.

## Consuming

```ts
import '@design-schema/tokens/calm-precise/css';   // once, at the app root
import '@design-schema/react/index.css';           // once, for the React package's component styles
import { Button } from '@design-schema/react';
```

Lit and React Native need only the tokens import for their platform and the component import; see the theme's platform notes.
