Teach the generation templates the fields phase 2 added, in one edit, per site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 625, and "Rules every job follows": "templates change in exactly one job (625), so prompt hashes flip once for all of phase 2 instead of sixteen times." Read that section and "Measuring a job" first.

Jobs 609 to 624 have landed; their prompts are in jobs/done/ and their summaries at the end of logs/jobs/<job>.log. Read all of them before editing anything, then read the current schema/component.ts, schema/events.ts, schema/vocab.ts, schema/tokens.ts, schema/extension.ts and the prompt assembly in tools/parse.ts (the function that fills `{{SCHEMA_YAML}}`, `{{BEHAVIOR_YAML}}`, `{{PLATFORM_NOTES}}`, `{{LOCKED}}` and `{{OVERRIDABLE}}` from prompts/templates/<platform>.md). The names below are the ones those jobs were asked to use; where a job's summary says it chose differently, the code wins.

Today every platform prompt already carries the whole component frontmatter through `{{SCHEMA_YAML}}`, so the new fields reach the model as data. What no template carries is a rule saying what to build from them, so a generator would read `controls:` or `forwards:` as decoration and keep guessing from prose, and phase 3's migrated docs would regenerate no better than today.

1. **Render what the tools already resolve.** A value a phase 2 helper computes per platform goes into the prompt resolved, never left for the model to recompute. In tools/parse.ts, add placeholder sections, each empty (and its heading omitted) when the component uses none of it, so a doc that uses no new field gets the same prompt body as before apart from the template's own new rule text:
   - **Events** (610, 623 does not apply here): per event, the emitted name on this platform, the ordered `payload`, `reasons`, `cancelable`, `fires` and `timing`.
   - **Controlled state** (611): the pairs from `controlledPairs()`, with each pair's event and `state`.
   - **Parts and slots** (612): each anatomy part's `partKind()`, and for slots the name `slotName(component, part, platform)` returns; composition entries with their `props` and `forwards`.
   - **Style bindings** (613): per binding, `part`, `state`, the per-value token map, and `computed` expressed through `computeBinding` as a token expression the platform can write (a `calc()` of custom properties on web and Lit, a multiplication of token values on React Native and SwiftUI).
   - **Keyboard** (614): rules narrowed to this platform, with `given`, `target` and `repeat`.
   - **Form and overlay** (615): the blocks as declared.
   - **Copy** (616): each entry through `copyText`, with `params` and plural forms.
   - **Constants and examples** (624): each constant as a token expression or value with its unit; examples with their `given`.
   - **Lifecycle** (624): props, events, values and components marked `deprecated`, with `use` and `since`.
   Build every platform view through `narrowForPlatform` (617), so a requirement, value, copy entry or binding narrowed away from a platform never appears in its prompt.
2. **Rules in the templates.** In prompts/templates/web.md, lit.md, rn.md and swiftui.md, add one compact "Declared contracts" section of rules, each naming the section from step 1 it reads. Keep each template under 110 lines. The rules, adapted to each platform's idiom:
   - Emit events with exactly the declared name and payload order; type `reasons` as a union; honor `cancelable` (web and React: a returned `false` or `preventDefault`; Lit: a cancelable `CustomEvent`); fire only on the `fires` sources listed; respect `timing` order.
   - Implement every controlled pair: controlled when the prop is provided, uncontrolled from the default otherwise, the event fired in both modes.
   - Render slots under the resolved names only; forward composition `props` and `forwards` exactly as declared, to child bindings that exist.
   - Style state and per-value bindings from the declared tokens, write `computed` as the given token expression, and never introduce a literal (the literal gate still applies).
   - Stories: every keyboard rule with `given` needs its story to accept those args from the Storybook URL, as `storyUrl` in tools/keyboard_tests.ts (614) builds them; every `examples` entry becomes a story with that name and args.
   - Forms register through the one form contract; overlays use the declared `placement`, `collision`, `dismiss` and `modal`.
   - Copy: interpolate only declared `params`; select plural forms with the platform's plural rules (`Intl.PluralRules` on web and Lit, the same on React Native, `String(localized:)` on SwiftUI); never concatenate a count into a sentence.
   - `type: integer` props accept whole numbers only (619).
   - Deprecated members keep working, are marked deprecated in the platform's way (`@deprecated` JSDoc; `@available(*, deprecated, message:)` on SwiftUI), and warn once in development naming `use`.
   The pattern templates (`pattern-*.md`) change only if a rule applies to the components a pattern composes; say which, if any, you changed.
3. **Keep the hash flip to this job.** After the edit, `pnpm check` rewrites every prompt under generated/prompts/. That is expected: `pnpm generate:check` fails until phase 4. Do not regenerate any component and do not touch `generate.lock.*.json`.
4. **Tests.** In tools/__tests__/, a prompt test builds one fixture component that uses every field above and asserts each section renders on each platform with the resolved values (the emitted event name, the slot name, the computed expression, the narrowed copy), and that a fixture using none of them renders no new section. A second test asserts each template contains its "Declared contracts" section and stays under 110 lines.

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    pnpm gates:behavior:check
    node logs/600-baseline.mjs --out 625

In logs/600-measure-625.json every step exit is 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `git diff --stat` shows changes under prompts/templates/, generated/prompts/, tools/ and tests only. In your summary, name one real component whose prompt gained a section today (for example one already using `propDef.platforms` narrowing) and quote the section.

Do not modify `schema/`, `packages/*/src`, any doc under `site/src/content/docs/`, `generated/generate.lock.*.json`, or `prompts/conventions/`. This job changes what the generator is told, not what the schema accepts.
