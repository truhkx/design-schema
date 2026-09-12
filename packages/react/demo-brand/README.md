# demo-brand — the naming mechanism, actually run

A fictional adopter's tree, generated from `packages/react/src` under
[`themes/demo-brand/naming.md`](../../../themes/demo-brand/naming.md). Job 523 of
[Brand naming, and the update path](../../../site/src/content/docs/process/customization-and-naming.md):
the worked example that proves the mechanism instead of describing it.

```
pnpm demo:naming          # rebuild src/ and behavior/ from packages/react/src, and write DIFF.md
pnpm demo:naming:check    # the tree is current and every difference from canonical is an identifier
pnpm demo:naming:gates    # every gate, against the renamed tree
```

Everything under `src/` and `behavior/` is generated: **do not edit it**, `pnpm demo:naming` will
overwrite it, and `pnpm check` fails when it is stale. `tsconfig.json`, `vitest.config.ts` and this
file are the fork's own — the three files a real adopter would write and the generator never does.

## What is in here

| | |
| --- | --- |
| `src/CtaButton.*`, `src/Expander.*`, `src/Callout.*` | the three components the naming doc renames (`Button`, `Disclosure`, `Alert`), with their stylesheets, stories and hand-written tests |
| `src/Icon.*`, `src/Link.*`, `src/Stack.*`, `src/Text.*`, `src/FormContext.ts` | everything those three import, *not* renamed — the closure is followed so the tree compiles, and what the doc does not name keeps its name |
| `src/custom/analytics.ts` | hand-written, byte-identical to the canonical copy: `custom/` is the one folder a rename never touches |
| `behavior/*.web.test.tsx` | `generated/behavior/*.web.test.tsx` put through the same rename, so the derived scenarios run against the renamed modules |
| `DIFF.md` | every difference from the canonical build, classified |

## The two halves worth looking at

Open `src/CtaButton.tsx` beside `../src/Button.tsx`. On the surface everything is Demo Brand's:
`CtaButton`, `CtaButtonProps`, `emphasis` instead of `variant`, `.demo-cta-button__label`,
`--demo-button-padding-inline`, `@demo/tokens`. Underneath, the line that renders the element still
says `data-ds="Button"` and `data-part="leadingIcon"`, and the stylesheet still reads
`var(--color-action-primary-background)`. That split is the whole design: the brand owns the names
its developers type, the schema owns the names its gates read.

Then open `src/Callout.tsx`. The naming doc says nothing about Alert's internals, and Alert's dismiss
control is now `<CtaButton emphasis="ghost" …>` next to an `<Icon …>` that did not move. A composite
follows the rename because the rename is applied to the whole generated surface, not to one file at a
time.

## Why it lives beside `src/` rather than replacing it

The canonical build has to stay exactly as it was — that is what the demo is being compared against —
so this is a sibling directory, and nothing in it is part of the canonical package. `../tsconfig.json`
includes `src` and `demo`; `../vitest.config.ts` includes `src/**/*.test.tsx` and
`../../generated/behavior`; `../.storybook/main.ts` globs `../src` and `../demo`. None of them reach
here, and this tree's own two configs reach back for React, Testing Library and jsdom rather than
making the demo a fourth workspace package.

The comparison a reader can see is at [`/docs/naming-demo`](../../../apps/website/src/pages/docs/naming-demo.astro)
on the website: the canonical component and the renamed one rendered side by side, from the same
props, with their markup and their accessibility trees diffed in the browser by
`tests/website/naming-demo.spec.ts`.
