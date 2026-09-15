Write a Claude Code skill that takes an adopter's fork through an upstream update: fetch, merge, fix what the update stranded, re-check, and regenerate only what went stale. The procedure exists as prose in `guides/updating-your-fork.md`; adopters doing it by hand skip the stranded-key and stale-target steps, and those are the steps that break a fork quietly.

The model to follow is `.claude/skills/create-theme/SKILL.md`: YAML frontmatter with `name` and a trigger-rich `description`, a numbered workflow, exact commands from the repository root, plain statements of limits. Write `.claude/skills/update-fork/SKILL.md`.

Read first, as they are now:
- `site/src/content/docs/guides/updating-your-fork.md` (the procedure this skill follows; its section on stranded naming keys)
- `site/src/content/docs/process/customization-and-naming.md` (which files the fork owns and why sibling files make pulls conflict-free)
- `schema/naming.ts`, `tools/naming.ts` (`--check`, `--apply`, `--revert` and how stranded keys fail), `tools/generate.ts` (`--stale`, `--naming`, `generate:check`), `tools/parse.ts` (extension collisions after an upstream adds a key the extension already declared)
- `package.json` scripts

1. **Check the fork's shape.** An `upstream` remote exists (show how to add it if not), the working tree is clean, and the adopter's own files are where the guide says: theme doc, naming doc, extensions, `src/custom/`, their own component docs. Warn about any edit to a canonical doc, because the guide says never to edit one in place.
2. **Preview the update.** `git fetch upstream` and summarize what changed by kind: schema, canonical component docs, templates, tools, generated code. Call out changes that affect the adopter: renamed or removed props and events their naming doc references, new keys that collide with their extensions, deprecations (`deprecated`/`since`, if the schema has them when this job runs).
3. **Merge** following the guide's sequence. Conflicts in files the adopter owns are theirs to resolve with them; a conflict in an upstream-owned file means the fork edited it, so say so and recommend moving the change into a sibling file.
4. **Fix what was stranded.** Run `node --import tsx tools/naming.ts --naming <brand> --platform web,lit,rn --check` (confirm the flags) and the parse step; for each stranded naming key or extension collision, propose the fix and apply it with agreement.
5. **Re-check.** `pnpm check`, and the generation staleness check (`pnpm generate:check`).
6. **Regenerate only what is stale, with permission.** List the stale targets and the documented cost per component per platform, then run the stale generation with the adopter's naming doc only when they agree.
7. **Summarize** what changed upstream, what was fixed in the fork, and what was regenerated.

If writing under `.claude/` is refused in this headless session, write the same files under `prompts/skills/update-fork/` and say so in the summary.

Proof: every section of `updating-your-fork.md` the skill relies on exists by that heading; every `pnpm` script it names exists in `package.json`; every tool flag it names exists in the tool's source (list each with its grep hit). The job itself cannot run `git fetch` or `git merge`; do not try.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools

Do not modify `schema/`, `tools/`, `mcp/`, `packages/*/src`, `prompts/templates/`, or any doc under `site/src/content/docs/`. This job adds a skill; it does not change the pipeline.
