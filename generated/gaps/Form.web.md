# Gaps reported while generating Form for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:18 — round 1

- Form: the existing implementation predated the overrides contract, `labelledBy` prop, and `data-ds` testability hook — added `overrides?: Partial<Record<'gap' | 'errorSummaryBorder', TokenRef>>` with `--ds-form-gap`/`--ds-form-error-summary-border` hooks (plus locked hooks `--ds-form-error-summary-text`/`-background` for consistency with the Card/Input pattern, not overridable), added `labelledBy` (web platform) rendering `aria-labelledby` and suppressing `aria-label` when both are set, and added `data-ds="Form"` and `data-part="errorSummary"`.
- Form: replaced inline summary heading text with `COPY.summaryHeading`/`summaryHeadingOne` constants per the copy-verbatim convention; behavior is unchanged.
- Form: gap token was hard-coded as `--space-lg` instead of the `layout.gap.loose` preset (`--layout-gap-loose`, matching Stack/Card's `gap` token resolution) — fixed.
- Form: anatomy parts `fields` and `actions` have no dedicated wrapper elements since they are opaque `children` content (Stack-composed by the consumer), so no `data-part` was added for them — only `errorSummary` is a Form-owned element.

## 2026-09-10 17:31 — round 1

- Form: schema anatomy adds `actions` alongside `fields`/`errorSummary`/`container`, but only one `gap` style token governs spacing for all of them ("between fields and between fields and actions"). Kept `children` and `actions` as siblings of the same flex-column root and gave their wrapper divs `display: contents` so the existing single-token gap continues to apply uniformly between every field and before the actions row, matching the Lit implementation's slot-based (non-boxed) layout.
- Form: root landmark role. Spec's `a11y.role: form` plus `aria-label`/`aria-labelledby` are already implied by the native `<form>` element with an accessible name, so no explicit `role="form"` attribute was added (redundant on a native form) — flagging in case an explicit role is wanted for older AT.
- Form: updated packages/react/demo/SignIn.tsx and Preferences.tsx to pass their submit/cancel buttons through the new required `actions` prop instead of embedding them in `children`, since the prop is now mandatory and the old shape would fail to type-check.
