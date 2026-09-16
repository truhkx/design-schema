---
name: align-existing-api
description: Align Design Schema's generated components with a component library and brand an adopter already has, by inventorying their existing API (exports, props, enum values, defaults, events and callbacks, slots, custom element tags, CSS classes and variables, token names), matching each component to its canonical counterpart, and writing the naming doc (themes/<brand>/naming.md), extension docs and theme doc that make the generated output match, with a plain list of what the schema cannot express. Use when someone is migrating an existing design system or component library onto Design Schema, wants generated components to keep their current names, props, values or tokens, asks how to keep old names working, or asks what parts of their API Design Schema cannot match.
---

# Align with an existing API

An adopter with a library in production does not want `Button variant="primary"` if every screen they own says `ActionButton kind="cta"`. Design Schema never edits a canonical component doc for that. Three sibling files carry the difference, and all three come through an upstream pull untouched:

- **`themes/<brand>/naming.md`** (contract: `schema/naming.ts`). Renames what the generators emit, keeps old names working as deprecated aliases, and renames emitted token names. It never changes behavior, types or structure.
- **`site/src/content/docs/extensions/<Component>.<name>.md`** (contract: `schema/extension.ts`). Adds props, events, style bindings, copy, keyboard rules, scenarios, parts, contrast pairs and hand-written modules, changes defaults and removes upstream items. Merged into the component by `tools/parse.ts`.
- **`site/src/content/docs/themes/<brand>.md`** (contract: `schema/theme.ts`). The look. Written through the `create-theme` skill.

Background: `site/src/content/docs/process/customization-and-naming.md` (naming, aliases, tokens), `process/extending-components.md` (extensions), `guides/updating-your-fork.md` (why these files survive a pull). The worked naming example is `themes/demo-brand/naming.md`; `themes/nimbus/naming.md` uses every key once; `extensions/Button.analytics.md` is the extension example.

Everything below runs from the repository root. The doc is the product: map every difference to a field, or list it as not expressible. **Never drop a difference silently.**

## 1. Inventory their API

Ask where the library lives, and read it yourself rather than asking them to describe it:

- **Source or a package.** A path in this repo or beside it, or `node_modules/<pkg>/`. Prefer the type definitions (`*.d.ts`, `index.ts` barrels): `export` lines, `interface <Name>Props`, union types for enum values, default parameter values or `defaultProps` for defaults.
- **Web components.** `custom-elements.json` if it ships one; otherwise `@customElement('…')`, `customElements.define(…)`, `@property({ attribute, reflect })`, `new CustomEvent('…')`, `<slot name="…">`.
- **React Native.** Props interfaces, `on…` callbacks, `testID`.
- **Storybook.** `*.stories.*` `argTypes` and `args` list props, controls, values and defaults, sometimes better than the types do.
- **Styles and tokens.** CSS class names (`.btn`, `.btn--primary`, `.btn__icon`), component custom properties (`--btn-bg`), token variables (`--brand-primary`) and JS token keys (`tokens.colorBrandPrimary`), plus the values behind them (hex codes, fonts, radii) for the theme.

If they can't give you files, a link to a docs site or a screenshot of a props table is second best. Say which items came from which source.

Produce **one inventory table before proposing anything**, one row per item, citing `file:line` for each:

| Component | Platform | Kind | Their name | Type / values | Default | Source |
| --- | --- | --- | --- | --- | --- | --- |
| ActionButton | web | component | `ActionButton` | | | `src/ActionButton.tsx:12` |
| ActionButton | web | prop | `kind` | `'cta' \| 'plain' \| 'danger'` | `'cta'` | `src/ActionButton.tsx:5` |
| ActionButton | web | event | `onClick` | `(e: MouseEvent) => void` | | `src/ActionButton.tsx:9` |
| ActionButton | lit | tag | `<acme-action-button>` | | | `src/action-button.ts:40` |
| ActionButton | web | css var | `--acme-button-bg` | | | `src/ActionButton.css:3` |

Kinds: component, prop, event (callback), slot / children, tag, class, css var, token. Ask before inventing a row for something you couldn't read.

## 2. Match each component to a canonical one

Build the canonical schema first. `generated/components.json` is gitignored, so a fresh clone has none:

```sh
pnpm parse
node --import tsx .claude/skills/align-existing-api/scripts/canonical.ts --list
node --import tsx .claude/skills/align-existing-api/scripts/canonical.ts Button Alert
node --import tsx .claude/skills/align-existing-api/scripts/canonical.ts --tokens color.action
```

`--list` prints every canonical component with its category, APG pattern and summary. Given names, the script prints each component's public API as generated/components.json has it, with existing extensions already merged: props (type, values, default, required, platforms, lifecycle, Lit attribute), events with the name each platform emits, anatomy parts with their kind and slot names, the Lit tag, class and CSS hook spellings, and the naming key each item takes. `--platform web,rn` narrows the per-platform columns. `--tokens <prefix>` lists the public token names under a prefix, with the CSS variable and JS key each is emitted as, for the token mapping. If the `design-schema` MCP server is connected, `get_component` returns the same component (and `list_components` the list); the script works without it.

For each of their components, name the canonical match and a confidence:

- **High:** same role and APG pattern (`apg`, `a11y.role`), and most props line up by meaning.
- **Medium:** same role, API shaped differently (several renames, a different default, extra props).
- **Low:** partial overlap, or one of theirs covers two canonical components. Ask before building on it.

Then sort:

- **A canonical component plus extras** (their `Button` with a `track` prop) is the canonical component with an **extension**, not a new component.
- **No canonical match** (a `PriceTag`) is a new component doc. Hand it to the `add-component` skill if it is in `.claude/skills/`, or to `site/src/content/docs/guides/authoring-a-component.md` if it isn't. Keep it out of this mapping.
- **One of theirs is two canonical components** (a `Button` that renders a link when given `href`, which is canonical `Link`) goes on the not-expressible list: naming maps are one to one.

## 3. Classify every difference

Compare each inventory row against the script output and give it exactly one mechanism. The field names below are the current ones in the schema files; if `schema/*.ts` has moved since, trust the file over this table.

| Their difference | Mechanism | Field |
| --- | --- | --- |
| Package scope (`@acme/react`) | namespace | `naming.namespace.package` |
| CSS prefix on component hooks, classes, Lit tags and Lit class names | namespace | `naming.namespace.cssPrefix` |
| Type-name prefix on RN's theme context, SwiftUI's `TokenRef` module | namespace | `naming.namespace.typePrefix` (`rn`, `swiftui` only) |
| Component name | rename | `naming.components` (`Button: ActionButton`) |
| Prop name | rename | `naming.props`, bare (`variant: kind`, every component) or dotted (`Button.variant: kind`, one) |
| Event or callback name | rename | `naming.events`: a string is the neutral name (`Alert.onDismiss: onClose`); an object gives each platform's emitted name (`Button.onPress: { web: onActivate, lit: activate, rn: onActivate }`) |
| Part name (class `__part` segment, Lit slot name) | rename | `naming.anatomy` (`Button.trailingIcon: endIcon`) |
| Enum value | value rename | `naming.values`, keyed by the **canonical** prop (`Button.variant: { primary: cta }`) |
| An old name their code still imports or passes | alias | `naming.aliases.components`, `.props`, `.values`, each entry `name`, `since`, `deprecated` (`reason`, `since`, `use`), `platforms` |
| CSS variable or JS key a token is emitted under | token names | `naming.tokens.cssPrefix`, `naming.tokens.rename` (`color.action.primary.background: color.brand.primary`) |
| Token values: colors, typeface, scale, radius, density | theme | theme doc `theme.seed`, `theme.overrides`, `theme.tuning`, through `create-theme` |
| An extra prop, event, style binding, copy string, keyboard rule, behavior scenario, part or contrast pair | extension | `extension.props`, `.events`, `.styles`, `.copy`, `.keyboard`, `.behavior`, `.anatomy`, `.a11y.contrast` |
| Logic of theirs the component must call (analytics, a formatter) | extension module | `extension.modules.<export>`: `path` (under `custom/`), `signature`, `wire`, `platforms` |
| A different default | extension | `extension.defaults` (`variant: secondary`) |
| A canonical prop, event, style, copy string or scenario they don't have | extension | `extension.omit.props`, `.events`, `.styles`, `.copy`, `.behavior` |
| An extra that exists on only some platforms | extension | `extension.platforms` (narrows what it adds, except events) |
| A prop of theirs on its way out with no canonical counterpart | extension | an `extension.props` entry with `deprecated` and `since` |

How the mechanisms combine, and the rules that decide between them:

- **Every naming key is a canonical name, and every value is theirs.** Keys resolve against the merged schema, so a prop an extension adds can be renamed too, and a key naming an omitted item is refused as stranded.
- **Rename or alias?** A rename changes the name the generated code uses. An alias keeps a *second*, older name compiling beside it, marked deprecated, in a `naming-compat/` folder that `tools/naming.ts` writes. It never replaces the rename. The alias `name` is the old spelling of the *current* name: the brand name where the doc renames it, the canonical name otherwise. `since` is a package version (`2.0.0`).
- **Alias support is per kind.** Component aliases work on web, lit, rn and swiftui. Prop and value aliases work on web and rn only (`ALIAS_SUPPORT` in `schema/naming.ts`). If the adopter generates Lit, every prop and value alias needs `platforms: [web, rn]`, or the Lit rename stops with that fix in the message. `themes/demo-brand/naming.md` is an example: it ships React only, so its `kind` alias lists no platforms, and a check that includes `lit` stops on it.
- **Event names differ per platform.** Button's `onPress` is emitted as `onClick` on web, `press` on Lit and `onPress` on React Native. A string rename reaches only platforms that follow the convention, so use the object form whenever the script shows a platform emitting something other than the neutral name. SwiftUI's emitted names can't be renamed.
- **Values are keyed by the canonical prop,** even where `props` renames it: `values: { Button.variant: { primary: cta } }` beside `props: { Button.variant: kind }`.
- **Keep the maps small.** Rename only the names they genuinely use differently. Every key is something to re-check when upstream moves it.

### Not expressible

Keep a separate list, one row per item, with the recommended workaround. The usual entries:

| Their API | Why the schema can't say it | Recommended workaround |
| --- | --- | --- |
| A retyped prop (`size: number` where canonical is `sm \| md \| lg`; `icon: string` where canonical takes content) | naming renames identifiers, never types; an extension can't add a prop under an upstream name | a thin wrapper in their app that maps the type, or accept the canonical API |
| One prop that is two canonical props, or the reverse (`intent="danger-outline"`; a boolean `primary` for an enum value) | a rename is one name to one name | a wrapper in their app |
| Different composition: compound components (`<Card.Header>`), render props, one component that is two canonical ones | naming maps are one to one, and composition is canonical structure | a wrapper, or accept the canonical composition |
| A different callback payload (`onChange(event)` where canonical passes the value) | an event rename changes the name, not the payload | a wrapper in their app |
| A rename onto a reserved prop name: `style`, `className`, `children`, `key`, `ref`, `slot` (web, lit) or `style`, `children`, `key`, `ref`, `testID` (rn) | the renamed output won't typecheck (`RESERVED_WEB` / `RESERVED_RN` in `tools/naming.ts`; aliases refuse these names outright) | keep the canonical name, or a wrapper |
| A different name per platform for one component (React `Btn`, Lit `<acme-button>`) | `naming.components` is one name for every platform; the Lit tag is `<cssPrefix>-<kebab brand name>` | accept one name; a Lit component alias registers one extra `<prefix>-<kebab alias>` tag |
| Prop or value aliases on Lit or SwiftUI | the compatibility layer can't add an attribute or case without editing generated code | accept the new name there, or a wrapper |
| Event renames on SwiftUI | emitted names are argument labels the rename can't scope | accept the canonical label |
| Component hooks named other than `--<prefix>-<component>-<binding>`; classes other than `<prefix>-<component>`, `__<part>`, `--<value>`; the gate hooks `data-ds`, `data-part`, `part`, `testID` | only the prefix of a hook moves; the rest mirrors the canonical binding, and gate hooks stay canonical so the gates stay brand-agnostic | a stylesheet in their app that maps their variables onto the hooks, or accept |
| Removing or loosening an accessibility guarantee: a required prop, a prop with an `a11yRole`, the `a11y.roleFrom` prop, the accessible-name prop, a locked binding, a default on a required prop | the parser refuses it in `omit` and `defaults` | accept the canonical API |
| A keyboard or focus model that differs from the APG pattern | an extension adds keyboard rules; it can't change upstream ones, and the APG wins on behavior | accept, or ask upstream |
| `namespace.typePrefix` on web or lit; the token build's Swift `TokenRef` / `DesignSchemaTokens` names; package manifest names | nothing on those platforms carries a type prefix; the token build doesn't read `typePrefix`; the generator never writes a `package.json` | the fork's own edit, outside the schema |
| Logic that must live inside the component and isn't a call at a declared point | modules are called at a `wire` point, never inlined | a `packages/<platform>/src/custom/` module wired by an extension, if a call point fits; otherwise a wrapper |

Anything that fits none of the rows above goes on this list too, with your best workaround and the reason.

## 4. Show the mapping, agree, then write

Present the classified table (their item, canonical item, mechanism, exact field and value) and the not-expressible list, and get a yes before writing anything. Call out every medium or low match and every alias you had to scope to `platforms`.

Then write:

- **`themes/<brand>/naming.md`**, where `<brand>` is kebab-case. Frontmatter `title`, `description` and a `naming:` block with only the keys you need, then prose saying why each rename exists in their words, in the style of `themes/demo-brand/naming.md`. Comments in the YAML are fine.
- **`site/src/content/docs/extensions/<Component>.<name>.md`**, one per concern per component (`Button.legacy-api.md`, `Button.analytics.md`). Frontmatter `title`, `description` and an `extension:` block with `extends` and a kebab-case `name` equal to the file's middle segment. The prose body goes into the generation prompt, so write it for the model: what the addition is for and where each module is called. For every `modules` entry, write the file at `packages/<platform>/src/<path>` for each targeted platform, exporting a function named after the key, or tell them to. Generation fails before any model call if a module is missing.
- **The theme doc**, through the `create-theme` skill, with their brand guide's exact hex values and typefaces as the inspiration. A token *name* they need goes in `naming.tokens`; a token *value* goes in the theme.

Never overwrite an existing naming, extension or theme doc unless they ask. Never edit a canonical component doc under `site/src/content/docs/components/`: that makes every later pull a conflict.

## 5. Verify

```sh
pnpm check
node --import tsx tools/naming.ts --naming <brand> --platform web,lit,rn --check
```

`pnpm check` re-parses with the extensions merged and fails on any extension error, naming the file. The naming check resolves the doc against `generated/components.json` and prints what a rename would change without writing anything:

- `✖ … key(s) name nothing in the canonical schema` names a stranded key: fix the key (it must be the canonical name).
- `! <platform>: …` lines are notices. A string event rename that doesn't reach a platform needs the object form. A collision with a reserved name belongs on the not-expressible list. A `props` key naming an event or part belongs in `events` or `anatomy`.
- `! <platform>: ambiguous value <file>:<line>` is a literal equal to a renamed value that the rename couldn't tie to its prop, so it was left alone. List these for them to review; they aren't errors.
- `… aliases are not supported on lit` means add `platforms: [web, rn]` to that entry.

Pass only the platforms they ship (`--platform web,rn`; `swiftui` is valid too). End with the **compatibility table**, one row per inventory item:

| Their item | Canonical | Status | Where |
| --- | --- | --- | --- |
| `ActionButton` | `Button` | renamed | `naming.components` |
| `kind="cta"` | `variant="primary"` | value-renamed | `naming.values` |
| `ActionButton` (v1 name) | `Button` | aliased | `naming.aliases.components` |
| `track` | — | extension | `extensions/Button.analytics.md` |
| `size={16}` | `size="md"` | not expressible | wrapper in their app |

Statuses: **exact**, **renamed**, **value-renamed**, **aliased**, **extension**, **not expressible**.

## 6. Generation is their call

Nothing above calls a model. Say what the next step costs, and don't run it without asking:

```sh
pnpm generate:check
pnpm generate --naming <brand> --stale
```

- **`pnpm generate:check`** lists the stale targets without generating anything, and exits 1 when there are any. An extension changes its component's prompt, so each extended component is stale on every platform. A naming doc alone makes nothing stale: renames are applied after generation.
- **`pnpm generate --naming <brand> --stale`** regenerates those targets and applies the names last. The docs put the cost at roughly $1–3 per component per platform at Fable rates, and about a fifth of that on Sonnet, the default. Multiply by the stale count and state the estimate. Unless `package.json`'s `generate` script already starts with `tools/parse.ts`, run `pnpm parse` (or `pnpm check`) first, so no prompt is generated from stale docs. Pass arguments straight after the script name. `pnpm generate -- --stale` fails: pnpm 10 passes the literal `--` through, and `tools/generate.ts` rejects it.
- **A rename with no extensions needs no model.** `node --import tsx tools/naming.ts --naming <brand> --platform web,lit,rn --apply` renames the existing generated tree in place for $0, and writes `naming-compat/` for the aliases. `--revert` undoes it. Once a tree is renamed, every later generation must pass `--naming <brand>` (or set `DS_NAMING=<brand>`), so the tree is normalized before the gates run. Ask before running either.

Finish with a summary: the files written, the compatibility table, the not-expressible list with workarounds, and the command and cost estimate you are leaving to them. Don't commit unless asked.

## Limits, stated plainly

- A naming doc renames *generated output identifiers*. The canonical docs, the prompts, the gates and every token's dotted path keep canonical names.
- A dotted prop or event rename reaches a composite only on the renamed component's own element. A prop threaded through a variable or a spread keeps its canonical spelling, and so does a Lit event heard with `addEventListener` or on an ancestor.
- A value rename moves a value only where the code ties it to its prop. Everything else is reported as ambiguous, never guessed.
- Exposing `naming-compat/` from the package (`exports`, a root re-export) and publishing under the new scope are the fork's own `package.json` edits.
- A renamed tree isn't gateable by the derived behavior and keyboard tests, which is why generation normalizes the tree back to canonical names first.
- The check proves that keys match, not that meanings match. If upstream changes what a prop does without renaming it, only reading the upstream diff shows that.
