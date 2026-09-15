---
title: Authoring a component
description: The contract for a component doc — what goes in frontmatter, what goes in prose, and what the build enforces.
---

A component is one Markdown file at `site/src/content/docs/components/<name>.md`. It has two halves with different jobs.

## The rule

**Frontmatter is for enforcement. Prose is for judgment.**

Anything a generator, a linter, or the MCP server needs to act on — a prop, an event name, a token binding, an accessibility requirement, a platform element — goes in the `component:` block of the frontmatter, where it is validated against `schema/component.schema.json`. Anything a human needs to decide well — when to use it, what to write in the label, why the platforms differ — goes in the body under one of the allowed headings.

If you find yourself writing "must" in prose, ask whether it should be a frontmatter constraint instead. The prose then explains *why* the constraint exists.

## Frontmatter

```yaml
title: Button                    # Starlight page title
description: One sentence.       # Starlight + MCP summary
component:
  name: Button                   # PascalCase; must match the file name
  category: action               # action | typography | input | layout | feedback | navigation | container
  status: draft                  # draft | review | stable | deprecated — only review/stable are published
  anatomy: [container, label]    # named parts, used by docs and generators
  props:                         # name → { type, description, required?, default?, values?, a11y?, platforms? }
  events:                        # name → { description, platforms: { web, lit, rn, … } }
  styles:                        # cssProperty → { token, description? }   tokens may interpolate enum props: space.{size}
  a11y:                          # { role, requires: [...], contrast: [{ foreground, background, level, large? }] }
  platforms:                     # web | lit | rn | swiftui → { element|tag, attributes, props, reflect, supported, notes }; lit needs tag unless supported: false
  behavior:                      # given/when/then scenarios that become one test each per platform (see below)
```

Quote any token path that contains braces (`'space.{size}'`) and any `description`/`notes` string that contains `: ` — YAML treats both as syntax. The parser reports the exact line when it trips.

## Behavior scenarios

`## Behavior` prose says what the component does; the `behavior:` list says it in a form the build can run. Each scenario is platform-neutral and becomes one test on every platform it applies to, rendered by the generator next to the component (`<Name>.test.tsx` on React and React Native, `<Name>.test.ts` on Lit) and run by the `tests` gate.

```yaml
behavior:
  - name: space-toggles                 # kebab-case, unique; the test's name
    description: Enter is left alone.   # optional
    given: { defaultChecked: false }    # prop overrides on the Default story's args
    when: { key: Space }                # one interaction (see below); omit for a render-only scenario
    then:                               # one or more expectations
      - { event: onChange, with: true }
      - { state: checked, is: true }
    platforms: [web, lit]               # optional; default = every platform the component declares
```

**Interactions** (`when`, exactly one): `click: <part>` (a press on native), `key: <chord>` pressed on the part carrying `a11y.role` (a `KeyboardEvent.key` name — `Enter`, `' '` or its alias `Space`, `Escape`, `Tab`, arrows, `Home`, `End`, `F2`, a letter — optionally behind `Shift+`, `Control+`, `Alt+` or `Meta+`), `type: <text>`, `focus: <part>`, `blur: true`, `set: { prop: value }` (a controlled prop change, applied as a re-render), `hover: <part>`.

**Expectations** (`then`, exactly one kind each): `event` (`with` for the first argument / event detail, or `fired: false` for "must not fire" — never both), `state` + `is` (`checked`, `expanded`, `selected`, `pressed`, `disabled`, `invalid`, `open`; `is` is `true`, `false` or `mixed`), `focused` (a part, or `none` / `moved` / `unchanged`), `text`, `copy` (names a `copy.*` template), `focusable: true|false`, `renders: true|false`, `role`, `name` (`true` for the accessible name the naming prop gives, or the exact name as a string), `attribute` + `is` (the value, or `null` for absent; `on: <part>` targets a part other than the primary one). An expectation can carry its own `platforms` to narrow just itself. `whenClause` and `thenClause` in `schema/component.ts` are the definition; the parser rejects anything else.

The parser checks every prop, enum value, anatomy part, event, copy key and platform a scenario names, and rejects what a platform's harness cannot express: React Native tests have no keyboard and cannot observe focus or an invalid state, so a scenario using those must be narrowed to `[web, lit]` explicitly. Where platforms genuinely differ — a Lit property is live state, so "controlled" has no meaning there — narrow the scenario and say why in its `description`.

You do not write the obvious scenarios. From the schema the parser derives `renders`, one `renders-<prop>-<value>` per enum value, `has-accessible-name` (from `accessible-name` / `label-association`), `control-is-focusable` (from `keyboard-operable`, web and Lit) and `error-is-identified` (from `error-identification` when there is an `error` prop). They appear in the generation prompt marked `derived` and are returned by the MCP server's `get_component` alongside the authored ones. Write the scenarios that carry the component's actual behavior: what toggles it, what is ignored, what `disabled` still allows, what a controlled instance does.

## Body

Text before the first `##` is the overview. Then only these headings are allowed, in this order:

`When to use` · `When not to use` · `Behavior` · `Content guidelines` · `Accessibility` · `Platform notes` · `Examples` · `Related`

`When to use` and `Accessibility` are required. `Platform notes` uses `###` sub-headings named after the platforms. The parser splits the body on these headings and serves each section independently, which is what lets an AI ask for "the accessibility guidance for Heading" without receiving the whole page.

## What the build checks

`pnpm check` derives and resolves the themes, then runs two scripts:

- **`tools/parse.ts`** — frontmatter validates against the JSON Schema; the file name matches `component.name`; every `{slot}` in a token path names an enum prop; every event has a mapping for every supported platform; every behavior scenario names real props, parts, events, copy keys and platforms and stays within what each platform's tests can express; headings are from the allowed list; required sections are present. It then writes `generated/components.json` and one generation prompt per platform (schema, scenarios, guidance) to `generated/prompts/`.
- **`tools/check_contrast.ts`** — every `a11y.contrast` pair is resolved through the tokens for every theme and every enum value, and must meet its WCAG level.

A doc that fails either check fails the build. That is the feature.

After the doc passes, `generate.ps1 -Component <Name>` (or `pnpm generate -- --component <Name>`) produces the platform code and its test file and runs the code gates, the tests among them; `pnpm generate:check` fails CI while a changed doc has ungenerated code. When only the scenarios changed, `-Extra "--tests-only"` rewrites just the test file against the existing component. See [Generation pipeline](/process/generation-pipeline/).

## The schema tables on the page

You never write props tables by hand. `site/src/components/MarkdownContent.astro` reads the frontmatter and renders the anatomy, props, events, style bindings, accessibility requirements, and platform mapping tables above your prose.
