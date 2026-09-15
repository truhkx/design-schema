Add an optional `tokens` block to the naming doc, so an adopter's existing CSS variables and JS token names keep working. Read site/src/content/docs/process/schema-hardening.md, "Rules every job follows", and site/src/content/docs/process/customization-and-naming.md ("How the rename is applied", "What a fork still owns" in themes/demo-brand/naming.md) first.

Token names are canonical by design today. The header of schema/naming.ts says a naming doc never touches "token paths like `color.action.primary.background`". prompts/templates/web.md tells the model to style "ONLY through the CSS custom properties generated from tokens (`--color-…`, `--space-…`)". Only a component's own hooks take `namespace.cssPrefix` (`--ds-button-background` → `--acme-button-background`), while `var(--color-action-primary-background)` stays. tools/naming_demo.ts's `protectedVocabulary` fails the demo if a token reference moves. That was the right default, because the gates key off token paths. It leaves a brand with an existing token set in front of a migration, though: its stylesheets say `--acme-color-brand-primary`, and its JS reads `tokens.colorBrandPrimary`. tokens/build.mjs derives every output name from the DTCG path alone, through the `name/kebab-no-default` and `name/camel-no-default` transforms, and it has no way to be told otherwise.

This job keeps the canonical path as the one vocabulary every tool reads, and lets a naming doc change only the *emitted* names: the CSS variable and the JS/RN/Swift key. The dotted path stays canonical in `generated/`, in the json output that tools/parse.ts, tools/spec_sheet.ts, the MCP server and the docs site read, and in the `TokenRef` type components use for `overrides`.

Depends on 620 (the token manifest in schema/tokens.ts). Confirm it exists, and read what it exports: the set of public dotted token names (trailing `default` dropped) is what this job validates against. If it exports no such list, stop and say so. Before any edit, write logs/628-hash.mjs: it prints `<sha256>  <path>` for every file under packages/tokens/dist and packages/swiftui/Sources/DesignSchemaTokens, sorted. Run `node logs/628-hash.mjs > logs/628-dist-before.txt`.

1. **Schema.** In schema/naming.ts add `tokens`, optional and defaulting to `{}`, as a strict object with two optional keys:
   - `cssPrefix`, using namespace `cssPrefix`'s regex with no default. Absent means token variables stay unprefixed, which is today's behavior.
   - `rename`, a record of canonical public dotted path → brand dotted path. Use one path regex that every name in 620's manifest satisfies, and add a test that asserts so.

   In `.check`, two paths renamed onto one brand path is an issue, worded like `props`. Describe both keys, including the sentence "The dotted path stays canonical everywhere a tool reads it; only the emitted CSS variable and JS/RN/Swift key change." Run `node --import tsx tools/schema.ts`. Update the header comment of schema/naming.ts, whose "What it never touches" list names token paths.
2. **Names, in one place.** In tools/lib/tokens.ts, next to `cssName` and `camelName`, add pure helpers:
   - `emittedCssName(path, tokensNaming)`: `--<cssPrefix>-<kebab of the brand path>`, or today's `cssName` when nothing applies
   - `emittedCamelName(path, tokensNaming)`

   Both are derived from `rename` and `cssPrefix`. `cssPrefix` applies to CSS names only; a JS key has no global namespace to protect.
3. **Resolution checks** in tools/naming.ts, against 620's manifest. Stranded keys go through `assertKnownKeys`, the rest through `NamingError`, each naming the key:
   - A key that is not a manifest name, with the message naming the public spelling when the key ends in `.default`.
   - A brand path equal to another canonical path that is not itself renamed away.
   - Two tokens whose emitted CSS names, or emitted camel names, coincide after renaming, e.g. `color.brandPrimary` beside `color.brand.primary`.
   - An emitted camel name in build.mjs's `THEME_MEMBERS`. Keep a copy of that set in tools/lib/tokens.ts, with a test that reads tokens/build.mjs as text and asserts the two sets are equal.
   - When `tokens.cssPrefix` equals `namespace.cssPrefix`, a token CSS name that equals, or starts with, a component hook stem `<prefix>-<component-kebab>-` for any canonical or brand component.

   `Resolution` gains `tokens`, holding renames only. `isNoop` is false when `rename` is non-empty or `cssPrefix` is set. `main` prints the count.
4. **Token build.** tokens/build.mjs gains two flags:
   - `--naming BRAND|PATH`, honouring `DS_NAMING` exactly as tools/generate.ts's `DEFAULT_NAMING` does
   - `--out DIR`, relative to the repo root, which writes `<DIR>/tokens/dist/…` and `<DIR>/swiftui/DesignSchemaTokens/…` instead of the committed locations

   With no naming doc, or with one that has no `tokens`, the build takes today's code path and writes today's bytes. The token build must never load tools/parse.ts, directly or through tools/naming.ts (which imports `kebab` and `splitFrontmatter` from it). So put what the build needs in a module that imports only `schema/` and `tools/lib/`, e.g. `tools/lib/token_naming.ts`. That means reading a naming doc (frontmatter through `load` from tools/lib/pyyaml.ts, the reader parse.ts itself uses), parsing it with `namingFrontmatter`, and resolving `tokens` with the step-3 checks. tools/naming.ts `resolve` calls that same module, so the checks exist once. build.mjs loads it with a lazy `await import(…)` only when a doc is selected, so the default path imports nothing new. Report problems the way the build already does: throw an `Error` whose message names the file and key, and print nothing new. Do not use job 609's `warn`/`takeWarnings`, which belong to the parser. When a doc applies:
   - The css transform emits `emittedCssName`. `outputReferences` then follows automatically, because references resolve through the referenced token's name.
   - The js, rn and swift transforms emit `emittedCamelName`.
   - The `json` platform and `names.d.ts`/`TOKEN_NAMES` stay canonical dotted names.
   - In `names.js`, `cssVar`, `tokenKey` and `resolveToken` take a canonical `TokenRef` and return the emitted name, through an emitted table of the renamed entries plus the prefix.
   - In Swift, `TokenRef` case names and `Theme` accessors use the emitted camel name, and raw values stay canonical dotted.

   Never run the build with `--naming` and no `--out` in this repository: it would overwrite the committed dist. If it happens, run `node tokens/build.mjs` and re-check the hashes.
5. **Codemod.** In tools/naming.ts `rewrite`, add a token rule placed *before* the namespace CSS rule. It matches, by exact membership in the direction's name set:
   - a CSS variable name in `var(--…` and bare `--…` positions, in css and ts files
   - a camel token key as a member (`t.colorInverseLink`) or as a whole string literal (`'colorActionPrimaryBackground'` in RN's `VARIANT_TOKENS`), in ts and swift files

   Before implementing, grep packages/*/src to see which platforms use camel keys, and cover exactly those. Dotted refs (`'color.action.primary.background'`, `cssVar('space.md')`) are never touched. The order matters in reverse: with `tokens.cssPrefix: acme` and `namespace.cssPrefix: acme`, `--acme-color-foreground` must revert to `--color-foreground`, not to `--ds-color-foreground`.
6. **Fixture.** Extend themes/nimbus/naming.md with `tokens: { cssPrefix: nimbus, rename: { color.action.primary.background: <a brand path the checks accept> } }`. This deliberately shares the namespace prefix, so the ordering in step 5 is exercised. Add a prose paragraph, and correct the "What it renames" paragraph that says a token's name is untouched. Do **not** extend themes/demo-brand/naming.md: packages/react/demo-brand renders on apps/website against the canonical `@design-schema/tokens` CSS, and `protectedVocabulary` would rightly fail it.
7. **Tests** in tools/__tests__/:
   - one failing fixture per check in steps 1 and 3
   - the two helpers in step 2 with and without a prefix
   - the manifest-regex and `THEME_MEMBERS` equality tests
   - the codemod rule in both directions, including the equal-prefix reverse, a component hook beside a token in the same line, and a dotted ref left alone
   - a doc without `tokens` producing byte-identical rewrite output
   - a round trip on sandbox copies (node:fs) of the committed packages/react/src/Button.css and packages/rn/src/Button.tsx: brand, then canonical restores byte for byte, then brand again equals the first apply

   Do not spawn the token build from a test; step 4 is proved by the gate below.
8. **Docs.** In site/src/content/docs/process/customization-and-naming.md:
   - Add `tokens` to what a naming doc overrides, and replace the claim that a custom property "keeps the rest" of a token name with the new rule and its boundary (emitted names move, dotted paths never do).
   - Rewrite "What a fork still owns" so the token build is no longer described as untaught. `namespace.typePrefix` still does not reach the token build (`TokenRef`, the `DesignSchemaTokens` module, hand-written `Theme.swift`); say that this job leaves it there.
   - State the known limit: a fork's gates run canonical component code, and RN code reading camel keys from a brand-named token build sees missing keys during that run.

There is no shell copy in this environment. Do scratch work inside tests with node:fs, or under logs/ (gitignored).

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm demo:naming:check
    node logs/628-hash.mjs > logs/628-dist-after.txt
    git diff --no-index --exit-code logs/628-dist-before.txt logs/628-dist-after.txt
    node tokens/build.mjs --naming nimbus --out logs/628-tokens
    node --import tsx tools/naming.ts --naming nimbus --platform web,lit,rn --check
    node logs/600-baseline.mjs --out 628

Expected results:
- The hash diff is empty. `pnpm check` rebuilt the tokens with no naming doc, byte-identical to before this job.
- In logs/628-tokens, Grep finds the renamed token under `--nimbus-` in every theme's css. It also finds its camel key in js and rn, and the canonical dotted name still in json and names.d.ts. It does not find `--color-action-primary-background` in css. Report those counts.
- The nimbus `--check` run exits 0 and prints the token rename count.
- In logs/600-measure-628.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty.

Do not modify `packages/*/src`, `prompts/templates/`, `packages/react/demo-brand/`, themes/demo-brand/naming.md, tools/naming_demo.ts, tokens/themes/, or any doc under site/src/content/docs/components/. This job changes the names a build emits under a naming doc, not a token value or a path.
