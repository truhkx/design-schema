Give naming docs an `events` map that reaches the event name each platform actually emits, and an `anatomy` map for part names, and limit `namespace.typePrefix` to the platforms that have prefixed type names. This is site/src/content/docs/process/schema-hardening.md, Phase 2 table, row 623. Read "Rules every job follows" and "Measuring a job" first. Phase 2 has no per-job section, so this prompt is the spec. Jobs 600 to 622 have landed: read the files as they are now. Jobs 626 to 628 will later add naming `values`, `aliases` and `tokens`. Keep the dotted `Component.member` key form and the renames-only resolution style, so those jobs can follow the same pattern.

schema/naming.ts has one member map, `props`. tools/naming.ts `canonicalIndex` puts props, events and anatomy parts into one `members` set, and `unknownKeys` accepts a `props` key that names any of the three. So events and parts ride on `props`, which does not work for them:
- **Events.** The key is the platform-neutral event name, but generated code emits `eventDef.platforms[<platform>]`. button.md maps `onPress` to `{ web: onClick, lit: press, rn: onPress, swiftui: action }`.
  - `props: { Button.onPress: onTap }` validates and renames React Native, but on web it does nothing: packages/react/src/Button.tsx says `onClick`.
  - The emitted name cannot be the key instead. `Button.onClick` fails `unknownKeys`, and Lit's `press` or `open-change` does not fit a `props` key at all.
  - Where a bare identifier rename does apply, it reaches too far. In packages/rn/src/Button.tsx it would also rename `<Pressable onPress={handlePress}>`, which is React Native's own prop.
  - The emitted name also appears wherever a composite uses the component: `<Button … onClick={handleDismiss}>` in packages/react/src/Alert.tsx, DatePicker.tsx and Toast.tsx; `@press=${…}` inside `<ds-button>` in packages/lit/src/Alert.ts, ActionSheet.ts and AlertDialog.ts; and the derived tests (`onClick: events.onPress` in generated/behavior/Button.web.test.tsx, `addEventListener('press', …)` in Button.lit.test.ts).
  - A brand whose React Button takes `onActivate` cannot say so today.
- **Anatomy.** Renaming a part through `props` also renames any prop with the same name (Button's `leadingIcon` is both), so a brand cannot rename a slot or class part on its own.
- **typePrefix.** `namespaceDef.typePrefix` is `z.partialRecord(platformId, typeName)`, but `prefixedTypes` only knows `rn` and `swiftui`. `typePrefix.web: Acme` parses and renames nothing.

The canonical docs follow a convention. Lit emits the neutral name without `on`, kebab-cased (`onOpenChange` → `open-change`, `onPress` → `press`). Web and React Native emit the neutral name itself. Exceptions: Button on web (`onClick`), and several React Native events (`onChangeText`, `onValueChange`, `onEndReached`, `onSubmitEditing`, `onSlidingComplete`, `onViewableItemsChanged`). Verify this against generated/components.json before relying on it.

1. **Schema.** In schema/naming.ts add `events` and `anatomy`, both optional with a default of `{}`. Keys use the same global-or-dotted form as `props`.
   - An `events` value is one of two forms:
     - A string matching `^on[A-Z][A-Za-z0-9]*$`: the brand's neutral name.
     - A `z.strictObject` with optional keys `web` and `rn` (camelCase names) and `lit` (a lowercase kebab name, `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`): the exact emitted name per platform.
     A `swiftui` key is rejected with the message `event renames reach web, lit and rn; SwiftUI's emitted names are argument labels the rename cannot scope yet`.
   - A string reaches each platform whose canonical emitted name follows the convention: web and React Native get the string itself, and Lit gets its kebab form (`onActivate` → `activate`). The object form reaches exactly the platforms it lists.
   - An `anatomy` value is a `memberName`. It renames the part's own spellings (the class `__part` segment, Lit `slot="…"` and `<slot name="…">`) and never renames an identifier.
   - In the existing `.check`, add injectivity with the existing message shape `<a> and <b> both rename to <brand>`. For `anatomy`, compare per scope, as for `props`. For object-form `events`, compare per scope and platform, and append ` on <platform>` to the message.
   - Export `TYPE_PREFIX_PLATFORMS = ['rn', 'swiftui'] as const`, mention it in `typePrefix`'s description, and keep the `partialRecord` so existing docs still parse.
   Run `node --import tsx tools/schema.ts` and keep the regenerated JSON.
2. **Resolve.** In tools/naming.ts:
   - `CanonicalIndex` gains `events` (component → event → its `platforms` record) and `anatomy` (component → parts). `members` stays unchanged for `props`.
   - `unknownKeys` checks the new maps using its existing message style:
     - `events.Button.onTap: Button has no event called onTap`
     - `events.onTap: no component has an event called onTap`
     - `events.Button.onPress.rn: Button's onPress has no rn mapping`
     - `anatomy.Button.foo: Button has no anatomy part called foo`
   - `Resolution` gains the resolved renames only: for each of web, lit and rn, scope → canonical emitted name → brand emitted name; and anatomy scope → part → brand part. `isNoop` accounts for both, so a doc without the new keys resolves exactly as before.
   - These stop the run with a `NamingError`, the way `assertNoShadowing` does:
     - two events of one component resolving to the same brand name on a platform
     - a brand emitted name equal to another canonical emitted name of that component on that platform that is not itself renamed
     - a brand part equal to another unrenamed part of the same component
   - Add an exported `notices(res, platform)` beside `collisions`. Print its lines with the same `  ! <platform>: …` prefix in `main` and in tools/generate.ts `namingFor`. It reports:
     - a string event rename that does not reach this platform: `Button.onPress → onActivate does not reach web, which emits onClick; use { web: … }`
     - `namespace.typePrefix.<p> renames nothing: only rn and swiftui have prefixed type names`
     - a `props` key that names only an event: `props.Button.onPress names an event, not a prop: it renames the neutral name, not what each platform emits; move it to events`
     - a `props` key that names only an anatomy part, with the matching advice to use `anatomy`
     `props` keeps renaming exactly as it does today. These are warnings only. They go through tools/naming.ts's own reporting (the `collisions` channel), not job 609's `warn` in tools/parse.ts: they belong to a naming run on one platform, not to parsing a doc, and must not end up in generated/parse-warnings.json.
   - `main`'s header line adds `N event(s), N anatomy part(s)`.
3. **Rewrite.** In `vocab`, `rewrite` and `replacement`, the `canonical` direction must be the exact inverse of `brand` for both maps.
   - **Web and React Native events.** Inside the component's own files and inside the component's element opening tag in a composite (`tagScopes`), rename the canonical emitted identifier. Do not rename it inside the opening tag of any element that is not a system component: a lowercase intrinsic tag (`<button onClick={handleClick}>`), or a tag bound by an external import (`<Pressable onPress={…}>`). `tagScopes` must now run when event renames exist, not only when `v.props.size > 0`.
   - **Lit events.** Rename the quoted emitted name in `new CustomEvent(…)` and in `addEventListener` and `removeEventListener` calls in the component's own files (its test file included), and `@<name>=` inside its custom-element opening tag in a composite. A composite that listens with `addEventListener` for a renamed component's event keeps the canonical name; that is a stated limit. Grep packages/lit/src for such listeners on every event the Nimbus fixture renames, and list them in your summary.
   - **Anatomy.** The `__part` segment in `renameCssName`, `slot=` and `<slot name>` look in `anatomy` first, then in `props` (today's behavior). `attribute:` is a prop spelling and looks in `props` only. Gate hooks (`data-part`, `part=`, `::part()`) stay canonical, as they do now.
   tools/naming_demo.ts `explain` must classify event-name and anatomy-part differences from the naming doc, independently of the rewriter, so the demo remains a second opinion. themes/demo-brand/naming.md uses neither map. Do not run `pnpm demo:naming`: `node --import tsx tools/naming_demo.ts --check` must pass with packages/react/demo-brand/ unchanged byte for byte.
4. **Fixture.** themes/nimbus/naming.md is the fixture that uses every key. Add:
   - `events` with the object form on Button: `Button.onPress: { web: onActivate, lit: activate, rn: onActivate }`
   - a string form on one event that follows the convention on all three platforms (pick it from generated/components.json and say which)
   - `anatomy: { Button.trailingIcon: endIcon }`, which renames the part and leaves the prop
   Extend the prose to cover them. Update the assertions that list the fixture's maps in tools/__tests__/naming.test.ts ("the fixture round-trips every key") and tools/__tests__/naming_resolver.test.ts (the Nimbus cases).
5. **Docs.** In site/src/content/docs/process/customization-and-naming.md, "How the rename is applied", add a bullet for events (the emitted name per platform, the string versus object forms, and the Lit `addEventListener` limit) and one for anatomy. Also add one sentence saying `typePrefix` applies to rn and swiftui only.
6. **Tests.**
   - In tools/__tests__/naming.test.ts, add a failing fixture for each new schema rule: the swiftui key, a bad Lit name, and each injectivity case.
   - In tools/__tests__/naming_resolver.test.ts, add a failing fixture for each new `unknownKeys` message, each `NamingError` and each notice.
   - In the resolver test's "the job's gate" describe, copy committed output into the sandbox: Button and Alert for web, Button and Alert for lit, Button for rn. Assert:
     - brand emitted names in the component's own file and in the composite
     - `<button … onClick={handleClick}>` and `<Pressable onPress=` unchanged
     - `new CustomEvent<…>('activate'` and `@activate=` present
     - a brand → canonical round trip that restores every file byte for byte
     - no `!` notice for the fixture's object-form key

Use only the file tools and `pnpm`, `node`, `git status` and `git diff`. Do not use npx or PowerShell, and do not stage or commit.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm mcp:smoke
    node --import tsx tools/schema.ts --check
    node --import tsx tools/naming.ts --naming nimbus --platform web,lit,rn --check
    node --import tsx tools/naming.ts --naming demo-brand --platform web --check
    node --import tsx tools/naming_demo.ts --check
    node logs/600-baseline.mjs --out 623

The Nimbus `--check` header must report a non-zero event count, and the command must print no notice for `Button.onPress`. In logs/600-measure-623.json, every step exits 0 except `generateCheck`, and `vsBaseline.lockedBindingsNoLongerLocked` is empty. `git status` must show no change under packages/, themes/demo-brand/ or site/src/content/docs/components/.

Do not modify `packages/*/src`, packages/react/demo-brand/ (only tools/naming_demo.ts regenerates it, and this job does not), `prompts/templates/`, any component doc, themes/demo-brand/, schema/component.ts or schema/extension.ts.
