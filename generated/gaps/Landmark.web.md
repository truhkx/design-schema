# Gaps reported while generating Landmark for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:56 — round 1

- Landmark: the file already existed from a prior generation pass and matched the spec, except it was missing the `data-ds="Landmark"` testability hook required by package conventions (all 25 other components have it). Added it; had to widen the `createElement` generic prop type to `HTMLAttributes<HTMLElement> & { 'data-ds': string }` since raw `createElement` (used here instead of JSX because the ref must satisfy a union of element types) doesn't get TypeScript's JSX-only allowance for arbitrary `data-*` attributes.
