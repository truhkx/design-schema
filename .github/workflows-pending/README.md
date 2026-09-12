# `.github/workflows-pending`

Workflow files written by a Claude Code job but **not installed**. GitHub Actions does not look in
this directory, so nothing here runs.

Jobs 509 and 510 both say their workflow is "hand-delivered", and job 509 spells out why: *"Do not
touch `.github/workflows/*` by any means other than the delivery method `vision-and-decisions.md`
already names for protected workflow files (hand delivery, not a direct commit from this job if that
constraint still applies at the time this runs)."* `vision-and-decisions.md` is not a file in this
repository (see `site/src/content/docs/process/publishing.md`, "The Pages site"), so the constraint
could not be checked — and the safe reading of a constraint you cannot check is to honour it. This
directory is the staging area that lets a job finish its work without writing into the live one.

## Installing one

A human with workflow-write permission moves the file and commits it:

```sh
git mv .github/workflows-pending/deploy-pages.yml .github/workflows/deploy-pages.yml
git commit -m "ci: deploy apps/website to Pages"
```

| File | What it does | From |
| --- | --- | --- |
| `deploy-pages.yml` | Builds `apps/website` and deploys it to GitHub Pages. No Storybook is in the artifact. | job 509 |
| `chromatic.yml` | Publishes `packages/{react,lit,rn}`'s Storybooks to three independent Chromatic projects. | job 510 |

## What each one needs before it will work

`deploy-pages.yml` needs **Settings → Pages → Source: GitHub Actions** set once on the repository;
until it is, `actions/deploy-pages` fails with a permissions error rather than a build one.

`chromatic.yml` needs three Chromatic projects and their tokens as repository secrets
(`CHROMATIC_PROJECT_TOKEN_{REACT,LIT,RN}`). Creating a project is an OAuth flow against a GitHub
account, so no Claude Code session can do it: `jobs/510-chromatic-storybooks.md`, "Log", has the
step-by-step, and each job fails on a named "…is not set" step rather than inside the CLI while a
secret is missing. The two workflows share no job, no artifact and no `needs:` edge, so nothing in
`chromatic.yml` can fail the Pages deploy — that separation is the point of both files.
