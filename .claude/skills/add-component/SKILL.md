---
name: add-component
description: Author a new Design Schema component doc (site/src/content/docs/components/<name>.md) to the contract — decide it is really a new component and not an extension, research the props, events, keyboard model and states from the WAI-ARIA APG and the reference design systems, write every contract into validated frontmatter fields rather than prose, write the guidance body, validate with the parser and contrast checker, and hand generation to the user with its command and cost. Use when someone wants a component the canonical set lacks (a PriceTag, a Rating, a FileUpload, a Chip), asks to add or spec a component, or wants to generate a component on every platform that does not exist yet.
---

# Add a component

A component doc is Stage 4 of the pipeline: one Markdown file whose frontmatter is the schema and whose body is guidance. `tools/parse.ts` validates it and writes `generated/prompts/<Name>.<platform>.md`, and `tools/generate.ts` hands that prompt to a model per platform. The model can only be as exact as the doc. **Every contract left in prose is a gap:** the generator guesses, reports it in `generated/gaps/<Name>.<platform>.md`, and folding it back into the doc makes the target stale, which costs another generation. So the rule for this whole skill is: when `schema/component.ts` has a field for something, declare it there; prose explains why.

The contract is `site/src/content/docs/guides/authoring-a-component.md` (frontmatter, behavior scenarios, body headings, what the build checks) and `schema/component.ts` (every field, its allowed values, and the cross-field rules in `componentDef`'s `.check`). Read both before writing; they change as the schema hardens, and this skill names fields, not every rule. The complete example is `site/src/content/docs/components/button.md`; `disclosure.md` and `tabs.md` show a controlled state, a keyboard block and composition.

Existing docs lag the schema. `generated/parse-warnings.json` lists their debts (an overlay with no `overlay` block, `large` where `nonText` belongs, `values` where `enumRef` belongs), and the newest fields (`parts`, `examples`, `constants`, `form`, `overlay`) appear in no doc yet. Copy structure from the examples, never a shape the warnings flag.

## 1. Decide what it is

- **Does a canonical component already cover it?** Run `pnpm parse`, then read the component list in `generated/components.json`. If the `design-schema` MCP server is connected, `list_components` and `get_component` return the same thing. Check `site/src/content/docs/process/component-roadmap.md` too: some needs are documented as a variant, not a component (a FAB is a Button variant, a segmented control is SegmentedControl, a pager is Carousel).
- **A canonical component plus extra props, events, styles, copy, keyboard rules or scenarios is an extension, not a new component.** That is an extension doc at `site/src/content/docs/extensions/<Component>.<name>.md`, described in `site/src/content/docs/process/extending-components.md` and validated by `schema/extension.ts`. Say so, point them there, and stop: this skill does not write extensions.
- **Name the APG pattern** it implements, as a slug from `APG_PATTERNS` in `schema/component.ts` (`button`, `disclosure`, `listbox`, `tabs`, `dialog-modal`…). A mobile pattern with no APG entry is documented as a variant of the closest pattern, so its accessibility rules carry over; say which in the body and leave `apg` out.
- **Name it.** PascalCase, and for an adopter's own component, prefixed with their scope (`AcmePriceTag`): the planned `namespace:` field does not exist yet, and the prefix keeps it from colliding with a future upstream component. The file is `site/src/content/docs/components/<name>.md` in lowercase (the parser matches `component.name` to the file stem case-insensitively). Never overwrite an existing doc.
- **What it composes.** List the system components its parts are built from (a close button is a Button, a title is a Heading). They decide the generation order in step 5.

## 2. Research the contract

Start from the APG pattern page (https://www.w3.org/WAI/ARIA/apg/patterns/) for behavior, then the reference systems `site/src/content/docs/process/from-vision-to-system.md` names in Stage 4 for scope and content: **Material Design 3, GitHub Primer, Atlassian Design System, Shopify Polaris, Adobe Spectrum**. For each, note:

- **Props** and their values: which variants, sizes and tones recur across systems, and which are one system's idiosyncrasy.
- **Events:** what fires, when, with what arguments, and whether the consumer can veto it.
- **Keyboard model:** every key, from the APG, verbatim.
- **Accessible name and role**, the ARIA states and properties.
- **States:** disabled, invalid, selected, expanded, loading, empty.
- **Content guidance:** label length, case, tone.

Keep a line per source saying what it contributed. **Where they disagree, the APG wins on behavior and the theme wins on look**: take no colors, radii, spacing or type sizes from a reference system, only the fact that something has a color or a size, which a token then supplies.

Present a short table — prop, event or rule; decision; source — and get a yes before writing.

## 3. Write the frontmatter

Top level: `title` (the page title, usually the name) and a one-sentence `description` (served by the MCP server as the summary). Then `component:`, field by field against `schema/component.ts`. Where a field exists, declaring it is not optional polish: the parser checks it, the generation prompt quotes it, and the behavior and keyboard gates test it.

- **`name`**, **`category`** (`action`, `typography`, `input`, `layout`, `feedback`, `navigation`, `container`, `overlay`, `data`, `primitive`), **`status: draft`** (only `review` and `stable` are published; a draft still parses and generates), **`apg`**. Leave `since` and `deprecated` out of a new doc.
- **`anatomy`**: every named part. **`parts`**: for each part that is not a plain element, its `kind` — `component` (built from its `composition` entry) or `slot` (a place the consumer fills, rendering no element of its own), with `slot: { default, prop, required, platforms }`. A slot names a `type: content` prop; there is at most one default slot; scenarios cannot click, focus or hover a slot.
- **`props`**: each with `type` (`string`, `number`, `integer`, `boolean`, `enum`, `content`, `array`, `object`, `function`, `union`), `description`, and as they apply `required`, `default` (a literal of the prop's own type; none for content, array, object, function or union), `values` or `enumRef` (`size`, `tone`, `foregroundTone` from `schema/vocab.ts`; the parser warns when `values` are a subset of one), `shape` (TypeScript-like; required for `union`, needed for `array`/`object`/`function`), `a11y` (why it matters), `a11yRole` (`accessible-name`, `description`, `error`), `platforms`, `valuesOn` (a value offered on some platforms only). A controlled value declares `controls: { event, default, state }`: the event that reports a change, the `default<X>` prop that seeds it, and the behavior state a boolean drives. A controlled prop takes no `default` of its own.
- **`events`**: `description` and a `platforms` mapping for **every** platform the component declares. Spell names as the registry does (`EVENT_CONVENTIONS` in `schema/events.ts`: `onChange`, `change` on Lit); drift is a warning. Then `payload` (ordered `{ name, type, shape?, values? }` fields — Lit's `detail` keys), `reasons` (kebab-case reason → when; needs a `reason` enum field in the payload), `fires` (`user`, `programmatic`, `controlled`), `cancelable`, `timing: { phase, before }` (`request`, `before-change`, `after-change`, `commit`), and `gesture: true` for a swipe or drag (requires `gesture-alternative`).
- **`styles`**: binding name → `{ token }`, **tokens only, never a literal** (the literal gate rejects hex, px and ms in generated code, so a value with no token is a question for the theme, not a number in the doc). As needed: `part`, `state` (`hover`, `focus-visible`, `active`, `dragging` and the behavior states), `platforms`, `by` + `values` (a prop's value picks the token), `computed: { times, plus, minus }` for a derived size, `description`. Quote any token with braces (`'space.{size}'`). Include the standard bindings every interactive component has — `focusRing` (`color.border.focus`), `focusRingWidth` (`border.width.focus`), `minTarget` (`size.target.min`), `disabledOpacity`, `transition` (a `motion.duration.*` token).
- **Locking.** A binding locks automatically — cannot be overridden per instance — when a token it resolves to is a focus or target-size token (`LOCKED_TOKENS`), appears in an `a11y.contrast` pair, or its name matches `focusRing*`, `minTarget` or `dismissTarget`. Those carry an accessibility guarantee, so `locked: false` on them is an error and a locked binding may not subtract or scale below 1 in `computed`. Set `locked: true` yourself on anything else that keeps a guarantee (a size that keeps a target reachable), and say why in its `description`.
- **`constants`**: numbers the logic reads (a hover delay, a swipe threshold, a debounce): `{ description, token, multiply }` or `{ description, value }`, with `unit` (`ms`, `px`, `px/ms`, `ratio`, `count`). Never a delay in prose.
- **`a11y`**: exactly one of `role` (a concrete WAI-ARIA 1.2 role) and `roleFrom` (an enum prop whose values are roles); `requires` from `A11Y_REQUIREMENTS`; `requiresOn` to narrow one to some platforms; `contrast`, one pair for **every** foreground drawn on a background in every state: `{ foreground, background, level, large, nonText, state, surface, only }`. Text is `level: AA`; a boundary, focus or state indicator or a meaningful icon is `nonText: true` (3:1), not `large: true`. The parser holds requirements to their fields: a keyboard block needs `keyboard-operable`, an Escape key `escape-dismiss`, an arrow key `arrow-navigation`, `target-24px`/`target-44px` a `size.target.*` binding (or composition), `error-identification` an `error` prop, any pair `contrast-aa`, a modal APG pattern `focus-trap`, `focus-restore`, `escape-dismiss` and `inert-background`.
- **`keyboard`**: one rule per key from the APG: `{ keys, action, when, from, expect, given, target, repeat, platforms, native }`. `expect` is what the keyboard gate asserts (`focus-next`, `closes`, `toggles`, `selects`…); `manual` documents a rule without testing it, so use it only when no outcome fits. A `closes`/`opens` on a component whose root is a widget names the popup part in `target`. Mark a native element's own behavior `native: true`.
- **`behavior`**: typed given/when/then scenarios, one test per platform — the syntax is in the guide's "Behavior scenarios". Do not author the derived ones (renders, one per enum value, accessible name, focusable, error identified). Author what toggles it, what is ignored, what `disabled` still allows, what a controlled instance does. React Native has no keyboard, no focus observation and no invalid state: narrow such a scenario to `platforms: [web, lit]` and say why in `description`.
- **`examples`**: `{ name, description, given, platforms }`, the props a representative usage renders with.
- **`composition`**: part → the system component it must be built from (`closeButton: Button`), or `{ component, props, forwards }` to pass literals or `{ from: <parent prop> }` and forward a styles binding to the child's overrides. A component that does not exist yet is spelled `Name (planned)`. A composed part is `kind: component` in `parts`. Never restyle a composed child; forward a binding instead.
- **`copy`**: every user-facing string the component renders itself (a clear-button label, an empty state, a count): a template string, or `{ text | plural, params, description, platforms }` with each `{placeholder}` a declared param or a prop and CLDR plural forms for counts. Refer to it as `copy.<key>` in descriptions and notes; a reference with no key is a warning.
- **`form`**: for a field, `{ role: field, value, valueType, name, validation, messages, discovery }`; a component with `name` and `error` props and no form block is a warning.
- **`overlay`**: for `category: overlay`, `{ layer, anchor, placement, collision, open, closeEvent, dismiss, modal }`; an overlay with no block is a warning.
- **`platforms`**: `web` (`element`, `attributes`, `notes`), `lit` (`tag`, required unless `supported: false` — `ds-<kebab-name>`; `reflect` every prop a styles token interpolates, as `{ prop, attribute }` with the negated attribute for a boolean that defaults to true; `notes`), `rn` (`element`, `props`, `notes`), `swiftui` (`element`, `props`, `notes`). A platform that cannot support it says `supported: false` and why in `notes`; events then need no mapping for it.

Quote any `description` or `notes` string containing `: `. Before moving on, reread the prose you wrote in descriptions and notes: every "must", every number, every "when X, then Y" is a candidate for a field above.

## 4. Write the body

Text before the first heading is the overview: what it is and the job it does, in two or three sentences. Then only these headings, in this order, spelled exactly as `authoring-a-component.md` lists them:

`## When to use` · `## When not to use` · `## Behavior` · `## Content guidelines` · `## Accessibility` · `## Platform notes` · `## Examples` · `## Related`

`When to use` and `Accessibility` are required. `Platform notes` uses `###` sub-headings named after the platforms, as every existing doc does: `### Web`, `### Lit`, `### React Native`. The parser serves each section on its own, and the generation prompt quotes them, so write them as instructions a generator acts on:

- **When to use / When not to use:** the decision, with the component to use instead named.
- **Behavior:** what happens on each interaction and state change, in order, including focus: where it goes on open, close, removal. The prose restates the frontmatter as a narrative and explains *why*; it never introduces a rule the frontmatter lacks.
- **Content guidelines:** label wording, case, length, what never to write.
- **Accessibility:** role, name, states, keyboard and focus, target size, contrast and motion, each with its WCAG success criterion, and the APG pattern it follows. Where the reference systems disagreed on behavior, say what the APG chose.
- **Platform notes:** the element or view per platform and what cannot be matched there (no hover on touch, no focus-within on native), as a platform limit rather than a silent difference.
- **Related:** neighboring components, `(planned)` for ones that do not exist.

## 5. Register and validate

From the repository root:

1. **Add the component to a phase in `regen.ps1`** (`$phases`), in the first phase that comes after everything it composes. `tools/site_nav.ts` builds the docs sidebar from those phases and fails `pnpm check` for a component no phase claims. This is the one file outside the doc the new component needs; tell the user you changed it.
2. `pnpm parse` validates every doc. There is no single-doc mode; `✖` lines are errors that name the file and field, `⚠` lines are warnings. Fix every warning that names your file too, since each one marks a contract left in prose. The full list lands in `generated/parse-warnings.json`.
3. `node --import tsx tools/check_contrast.ts` resolves every `a11y.contrast` pair for every theme, mode and enum value; `✖` lines name the failing pair. Fix it by choosing a token pair that holds (a stronger foreground, the control or status family built for that surface), never a literal.
4. `pnpm check` runs the whole doc build: themes, tokens, schema check, parse, the docs gallery, the site nav, contrast, the spec sheet and the naming demo check. It must end green.
5. `pnpm test:tools` runs the tool tests, some of which read `generated/components.json`.

**Fix the doc, never the tools.** Do not edit `schema/`, `tools/`, `mcp/` or `prompts/templates/` to make a doc pass. If the schema genuinely cannot express something the component needs, write it in the body, tell the user plainly that it will come back as a generator gap, and describe the field that would close it as a schema proposal for the owner.

## 6. Generation is the user's call

Generation calls a model and costs money, so stop and ask. Tell them:

- **A free look first:** `node --import tsx tools/generate.ts --dry-run --platform web --component <Name>` prints the head of the task prompt and calls nothing.
- **The command:** `node --import tsx tools/generate.ts --platform web,lit,rn --component <Name>` (`--platform` defaults to `web,lit,rn`, three targets), or on Windows `powershell -ExecutionPolicy Bypass -File .\generate.ps1 -Component <Name>`, which runs `pnpm parse` first and logs to `logs\generate.log`. Do not use `pnpm generate -- --component <Name>` as `authoring-a-component.md` writes it: pnpm passes the `--` through and `tools/generate.ts` stops with `unrecognized arguments`.
- **SwiftUI** is `--platform swiftui` on its own run: its gates compile on macOS in GitHub Actions and need `gh` on PATH, authenticated, with an origin to push to.
- **The cost** documented in `site/src/content/docs/process/generation-pipeline.md`: $1.8–2.8 per target with one or two rounds, measured at Fable rates on the first Icon run; the default model is `sonnet`, projected at roughly a fifth of that, unconfirmed until a run measures it; a full first pass of about 150 targets is in the region of $150–250 on Sonnet. `--max-rounds` (default 3) bounds the fix loop, and the lockfile (`generated/generate.lock.<platform>.json`) records each target's actual cost.

Only run generation when they say so. Afterwards, read `generated/gaps/<Name>.<platform>.md` (or the MCP server's `list_gaps`), fold each doc gap into a frontmatter field, run step 5 again, and tell them which targets are stale as a result.

## Finish

Summarize: the component and its APG pattern, what each reference source contributed and where the APG overruled one, which bindings lock and why, the `regen.ps1` phase it joined, any contract left in prose (and so an expected gap), and the validation results. Don't commit unless asked.
