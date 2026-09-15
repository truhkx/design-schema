Write a Claude Code skill that takes an adopter who already has a component library and a brand, and produces the files that make the generated components match their existing API. The adopter path exists in pieces — naming docs, extension docs, theme docs, the fork workflow — but nothing walks someone from "here is my library" to those files, and nothing tells them which parts of their API the schema cannot express.

The model to follow is `.claude/skills/create-theme/SKILL.md`: YAML frontmatter with `name` and a trigger-rich `description`, a numbered workflow, exact commands run from the repository root, and plain statements of limits. Write `.claude/skills/align-existing-api/SKILL.md`, plus a script under `scripts/` only if a step is mechanical enough to deserve one (for example, printing a canonical component's props, events, enum values and defaults from `generated/components.json`).

Read first, as they are now (jobs 612, 622, 623, 624 and 626–628 ran earlier in this queue and changed them; do not assume their earlier shape):
- `schema/naming.ts`, `schema/extension.ts`, `schema/component.ts`, `schema/theme.ts`
- `tools/naming.ts` (its CLI flags), `tools/naming_demo.ts`, `tools/parse.ts` (the extension merge), `tools/generate.ts` (`--naming`)
- `themes/demo-brand/naming.md`, `themes/nimbus/naming.md`, `site/src/content/docs/extensions/Button.analytics.md`
- `site/src/content/docs/process/customization-and-naming.md`, `site/src/content/docs/process/extending-components.md`, `site/src/content/docs/guides/updating-your-fork.md`, `site/src/content/docs/guides/two-ways-in.md`

1. **Inventory the existing API.** The skill asks where the adopter's library lives (a path, a package, type definitions, a Storybook) and reads it: exported components, prop names and types, enum values, defaults, events and callback names per platform, children and slots, custom element tags, CSS class and variable names, token names. It produces one inventory table before proposing anything.
2. **Match to canonical.** For each of their components, find the canonical component (run `pnpm parse` and read `generated/components.json`, or use the `design-schema` MCP server's `get_component` when connected), with a stated confidence. Components with no canonical match are handed to the add-component skill (job 691); one that is a canonical component plus extras is an extension, not a new component.
3. **Classify every difference by the mechanism that expresses it.** Build the mapping from the current schema files: component, prop, event (including per-platform emitted names) and anatomy renames; enum value renames; deprecated aliases for old names; token name mapping; extra props, events and modules (extension); different defaults and removed props (extension). Every field the skill names must exist in `schema/*.ts` when this job runs — grep each one. Keep a separate **not expressible** list (for example a retyped prop, a different composition, a reserved prop name such as `children` or `className`) with a recommended workaround for each (a `src/custom/` module, a thin wrapper in the adopter's app, or accepting the canonical API), and tell the skill never to drop a difference silently.
4. **Write the files.** `themes/<brand>/naming.md`, `site/src/content/docs/extensions/<Component>.<name>.md` per extended component, and a theme doc through the create-theme skill. Show the adopter the mapping table and get agreement before writing.
5. **Verify.** `pnpm check`, then `node --import tsx tools/naming.ts --naming <brand> --platform web,lit,rn --check` (confirm these flags in `tools/naming.ts`). End with a compatibility table: each item of their API → exact, renamed, value-renamed, aliased, extension, or not expressible.
6. **Generation is the adopter's call.** State the command (`pnpm generate --naming <brand> --stale`, or what job 702 made primary, whichever exists in `package.json` and `tools/generate.ts`; never the `pnpm generate -- …` form, because pnpm 10 passes the literal `--` through and tools/generate.ts rejects it) and the cost the docs state (about $1–3 per component per platform), and never run it without asking.

If writing under `.claude/` is refused in this headless session, write the same files under `prompts/skills/align-existing-api/` and say so in the summary.

Proof: dry-run the skill against the demo brand. Every command in the SKILL.md must run: `node --import tsx tools/naming.ts --naming demo-brand --platform web --check` succeeds, and any script you added runs against `Button`. List each schema field the skill names with the file where grep found it.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools

Do not modify `schema/`, `tools/`, `mcp/`, `packages/*/src`, `prompts/templates/`, any doc under `site/src/content/docs/`, or `themes/`. This job adds a skill; it does not change the pipeline.
