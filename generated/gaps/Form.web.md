# Gaps reported while generating Form for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:18 — round 1

- Form: the existing implementation predated the overrides contract, `labelledBy` prop, and `data-ds` testability hook — added `overrides?: Partial<Record<'gap' | 'errorSummaryBorder', TokenRef>>` with `--ds-form-gap`/`--ds-form-error-summary-border` hooks (plus locked hooks `--ds-form-error-summary-text`/`-background` for consistency with the Card/Input pattern, not overridable), added `labelledBy` (web platform) rendering `aria-labelledby` and suppressing `aria-label` when both are set, and added `data-ds="Form"` and `data-part="errorSummary"`.
- Form: replaced inline summary heading text with `COPY.summaryHeading`/`summaryHeadingOne` constants per the copy-verbatim convention; behavior is unchanged.
- Form: gap token was hard-coded as `--space-lg` instead of the `layout.gap.loose` preset (`--layout-gap-loose`, matching Stack/Card's `gap` token resolution) — fixed.
- Form: anatomy parts `fields` and `actions` have no dedicated wrapper elements since they are opaque `children` content (Stack-composed by the consumer), so no `data-part` was added for them — only `errorSummary` is a Form-owned element.
