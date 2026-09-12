Publish all three Storybooks to Chromatic per website-plan.md ("Linking to Storybook"), decided 2026-09-12 in place of self-hosting them on GitHub Pages.

1. Create three Chromatic projects (one per package: `design-schema-react`, `design-schema-lit`, `design-schema-rn`) — this needs a human with a GitHub/Chromatic account, so if it can't be done headlessly, write the exact steps (chromatic.com → "Add project" → pick the repo → note the project token) into this job's log and stop there for Tony to finish, then resume.
2. Store each project's token as a repo secret (`CHROMATIC_PROJECT_TOKEN_REACT`, `_LIT`, `_RN`).
3. `.github/workflows/chromatic.yml` (hand-delivered per the protected-workflow-files note in vision-and-decisions.md): three jobs, one per package, each running `pnpm --filter <pkg> build-storybook` then `chromatic-cli` with `--project-token` and `--build-script-name build-storybook`, on every push to `main` and on PRs (PR builds get their own preview URL automatically — useful for reviewing a generated component's Storybook before merging). Each job is independent: a failing RN build does not block react/lit from publishing.
4. Record each project's permanent published URL (Chromatic's "your project is published at…" output, stable across builds — it's the project's app URL, not a per-build preview) in `generated/chromatic.json`: `{ "react": "https://<slug>.chromatic.com", "lit": "...", "rn": "..." }`, read by job 507's "Open in Storybook" links and by `apps/website`'s footer/nav if a direct Storybook link is wanted there too.
Gate: all three Chromatic projects show a successful published build; `generated/chromatic.json`'s URLs 200 when fetched; a PR touching only `packages/react` triggers only the react Chromatic job. Do not modify `packages/*/src` or `generated/*.json` other than `chromatic.json`.

---

## Log

**2026-09-12, Claude Code.** Steps 3 and 4 are built as far as they can be without an account. Steps 1
and 2 — and the whole gate — need Tony. Everything below is what is done, what is waiting, and the
exact hands-on-keyboard steps to finish it.

### Why this stopped

The three things the job's own step 1 anticipated, all true here:

- **This checkout has no git remote** (`git remote -v` is empty) and there is no `gh` on this machine.
  So there is no repository for Chromatic to be pointed at from here, no way to create a repo secret,
  and no way to run or observe a workflow. This is the same wall job 400–460 hit for the SwiftUI gate.
- **Creating a Chromatic project is an OAuth flow.** It authorises Chromatic against a GitHub account
  or organisation. There is no unauthenticated API for it, and a project token cannot be minted
  without one.
- **Therefore the gate cannot be run here.** "All three Chromatic projects show a successful published
  build", "`chromatic.json`'s URLs 200", and "a PR touching only `packages/react` triggers only the
  react job" are all statements about a hosted repository. They are listed as checks for Tony below
  rather than reported as passing.

### Done in this session

| | |
| --- | --- |
| `.github/workflows-pending/chromatic.yml` | The workflow, **staged not installed** — same hand-delivery treatment `deploy-pages.yml` got, for the reason `.github/workflows-pending/README.md` gives. Four jobs: `changes`, then `react`, `lit`, `rn`. |
| `generated/chromatic.json` | Written with the three keys and `""` for each URL. `""` is the deliberate "no project yet" value: `apps/website/src/examples.ts` already treats an empty or absent URL as *omit the "Open in Storybook ↗" link*, so the site builds and the docs read correctly today, and filling in three strings is the entire resume step. |
| `tools/chromatic.ts`, `pnpm chromatic:check[:fetch]` | The gate for that file, since it is the one thing in `generated/` that is typed by hand and can therefore rot silently. Shape check offline; `--fetch` is the job's "URLs 200 when fetched" criterion. |
| `tools/__tests__/chromatic.test.ts` | The URL gate, and the `changes` job's own shell — the test reads the `run:` block out of `chromatic.yml` and executes it against fixture file lists, with only the two `git` lines stubbed. The gate's "a PR touching only `packages/react` triggers only the react job" is otherwise unobservable outside a hosted repository. Skipped where there is no `bash`. |

Verified locally, being the part of the gate that does not need a hosted repository:

- All three Storybooks build: `pnpm --filter @design-schema/{react,lit,rn} build-storybook` each exit 0 — the RN one included, which builds through `react-native-web` and is what makes it publishable at all.
- The `changes` filter gives `react=true lit=false rn=false` for a `packages/react`-only diff, and all three for a token, `storybook/shared/`, lockfile or workflow change (15 tests in `tools/__tests__/chromatic.test.ts`).
- `pnpm check`, `pnpm typecheck:tools`, `pnpm test:tools` (1305 passed), `pnpm --filter website build`, `pnpm site:routes` (56 pages / 51 components) all pass with the new `chromatic.json` in the tree.
- End to end, by temporarily filling `chromatic.json` and rebuilding: an empty file produces no `chromatic.com` link anywhere in `dist/`, and a filled one produces `https://<slug>.chromatic.com/?path=/story/button-react--default` on Button's page. So step 4's payoff is wired and waiting on the string.

**One deviation from step 3, stated rather than hidden.** Step 3 asks for both `pnpm --filter <pkg>
build-storybook` *and* `chromatic --build-script-name build-storybook`. Those are two builds:
`--build-script-name` makes the CLI run the build script itself. The workflow keeps the explicit build
step (it is worth having "the Storybook does not build" be a different red step from "the publish
failed") and passes `--storybook-build-dir storybook-static` instead, which hands the CLI the
directory that step just produced. It also keeps the build inside pnpm's workspace resolution rather
than whatever package manager the CLI infers from `packages/react/`. The comment at that line says how
to go back in one edit.

### For Tony — step 1: create the three projects

Chromatic supports several projects against one repository, which is what a monorepo needs. Do this
three times, once per package. (Chromatic's UI wording moves; the canonical pages are
<https://www.chromatic.com/docs/setup/> and <https://www.chromatic.com/docs/monorepos/>. If a label
below does not match what is on screen, the page is right and this is stale.)

1. Sign in at <https://www.chromatic.com/start> with the GitHub account that owns the repository, and
   authorise Chromatic for the org if it is an org repo.
2. **Add project** → choose the GitHub repository. For the second and third, add the *same* repository
   again — Chromatic offers to create an additional project rather than reusing the first.
3. Name them, matching the job: **`design-schema-react`**, **`design-schema-lit`**, **`design-schema-rn`**.
   The name is cosmetic; the token and the URL are what matter.
4. From each project's **Manage → Configure** page, copy two things:
   - the **project token** (`chpt_…`) → step 2 below;
   - the **project URL**, the permanent `https://<slug>.chromatic.com` shown as "your project is
     published at…" → step 3 below. It is *not* the `https://<branch>--<slug>.chromatic.com` the CLI
     prints after a build; that one moves with the branch, and `pnpm chromatic:check` rejects it.
5. Skip Chromatic's onboarding "run this command now" step. The workflow does the publishing.

### For Tony — step 2: the secrets and the workflow

Repository **Settings → Secrets and variables → Actions → New repository secret**, three times:

| Secret | Value |
| --- | --- |
| `CHROMATIC_PROJECT_TOKEN_REACT` | the `design-schema-react` project token |
| `CHROMATIC_PROJECT_TOKEN_LIT` | the `design-schema-lit` project token |
| `CHROMATIC_PROJECT_TOKEN_RN` | the `design-schema-rn` project token |

(Or `gh secret set CHROMATIC_PROJECT_TOKEN_REACT` and so on, from a checkout with a remote.)

Then install the workflow, which is the hand-delivery this job's step 3 calls for:

```sh
git mv .github/workflows-pending/chromatic.yml .github/workflows/chromatic.yml
git commit -m "ci: publish the three Storybooks to Chromatic"
```

A job whose secret is missing fails on a named "…is not set" step rather than inside the CLI, so a
half-finished setup reads as a half-finished setup.

### For Tony — step 3: the URLs, and then the gate

Put the three project URLs into `generated/chromatic.json` (the file is already there with the right
keys) and commit it:

```json
{
  "react": "https://<react-slug>.chromatic.com",
  "lit": "https://<lit-slug>.chromatic.com",
  "rn": "https://<rn-slug>.chromatic.com"
}
```

Then the job's gate, in order:

- `pnpm chromatic:check --fetch` — the shape, and the job's "URLs 200 when fetched". Fails naming the
  package while any URL is empty or unreachable.
- Actions → each of `chromatic / react`, `chromatic / lit`, `chromatic / rn` is green on the push to
  `main`, and each project's page on chromatic.com shows that build as published.
- Open a PR that touches only a file under `packages/react/` (a comment in a story is enough) and
  confirm **only** `chromatic / react` runs — `lit` and `rn` skip. Note that the filter also treats
  `packages/tokens/`, `storybook/shared/`, `tokens/`, `tools/theme.ts`, `pnpm-lock.yaml`,
  `package.json` and the workflow itself as shared inputs that rebuild all three, so the PR must touch
  none of those.
- The "Open in Storybook ↗" links on `/docs/components/<slug>` resolve once `chromatic.json` is
  filled; before that they are absent by design, not broken.
