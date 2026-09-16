**Before you start:** run every gate and proof command in the foreground and wait for it to finish. Never run a command in the background, and never end your turn while a command is still running: this headless session ends the moment you reply, so anything still running is lost and the job is recorded as done without its gates. For jobs that measure, `logs/600-measure-<job>.json` must exist before you reply, and your summary quotes the final line of each gate command.

Write a Claude Code skill that authors a new component doc to the contract, so an adopter (or the owner) can add a component the canonical set lacks and generate it on every platform. The contract is spread across `guides/authoring-a-component.md`, `schema/component.ts` and fifty-one example docs; the component generators log a gap every time a doc leaves a contract in prose, so a doc written carelessly costs a regeneration later.

The model to follow is `.claude/skills/create-theme/SKILL.md`: YAML frontmatter with `name` and a trigger-rich `description`, a numbered workflow, exact commands from the repository root, plain statements of limits. Write `.claude/skills/add-component/SKILL.md`.

Read first, as they are now (phase 2 jobs 610–628 ran earlier in this queue and added optional fields; do not assume their earlier shape):
- `site/src/content/docs/guides/authoring-a-component.md` (the contract and the body headings)
- `schema/component.ts`, `schema/extension.ts`, `schema/platforms.ts`
- `site/src/content/docs/components/button.md` (the complete example) and two composite docs of your choice
- `site/src/content/docs/process/from-vision-to-system.md` (Stage 4: the reference systems and "the APG wins on behavior and the theme wins on look")
- `site/src/content/docs/process/extending-components.md` (extension vs new component), `site/src/content/docs/process/component-roadmap.md`
- `tools/parse.ts` validation messages, `tools/check_contrast.ts`, `tools/generate.ts` CLI flags

1. **Decide what it is.** Check whether a canonical component already covers the need (`pnpm parse`, `generated/components.json`, or the MCP server's `list_components`/`get_component`). A canonical component plus extra props or events is an extension doc; hand that off and stop. Name the WAI-ARIA APG pattern it implements, if any.
2. **Research the contract.** From the APG pattern and the reference systems the process doc names (Material Design 3, GitHub Primer, Atlassian, Shopify Polaris, Adobe Spectrum): the props and their values, events, keyboard model, accessible name and role, states. Record what each source contributed; where they disagree, the APG wins on behavior.
3. **Write the frontmatter** field by field against `schema/component.ts`: `name`, `category`, `status: draft`, `apg`, `anatomy` (and part kinds, including slots where the schema now has them), `props` with types, values and defaults, `events` with per-platform names and payloads, `styles` bound to tokens only (never literals; which bindings lock and why), `a11y` with role and every contrast pair, `keyboard` rules, typed `behavior` scenarios, `composition`, `copy`, and `platforms` (including the Lit `tag`). Prefer a declared field over prose every time the schema has one; the skill should say that prose-only contracts become generator gaps.
4. **Write the body** under exactly the headings `authoring-a-component.md` requires, as guidance a generator acts on.
5. **Validate.** `pnpm parse` (or the narrowest command that validates one doc — check `tools/parse.ts`), `node --import tsx tools/check_contrast.ts`, `pnpm check`. Fix the doc, never the tools.
6. **Generation is the user's call.** State the one-component command that exists in `tools/generate.ts` and `package.json` (confirm the flag name) and the documented cost, and ask before running it.

If writing under `.claude/` is refused in this headless session, write the same files under `prompts/skills/add-component/` and say so in the summary.

Proof: every body heading the skill lists matches `authoring-a-component.md` word for word; every frontmatter field it names exists in `schema/component.ts` (list field → grep hit); every command it names exists in `package.json` or `tools/`. Do not add a component doc to prove it.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools

Do not modify `schema/`, `tools/`, `mcp/`, `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. This job adds a skill; it does not change the pipeline.
