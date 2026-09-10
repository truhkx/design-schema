# Gaps reported while generating Text for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:46 — round 1

- Text (rn): platforms.rn.props lists only numberOfLines/ellipsizeMode/allowFontScaling, not overrides — added overrides?: Partial<Record<TextOverridableBinding, TokenRef>> anyway per the general Overrides contract (fontFamily, fontSize, fontWeight, lineHeight, color), matching how Box/Card/Container/Dialog implement it despite the same omission in their platform notes.
- Text (rn): could not run the test suite in this session (jest invocation via Bash/PowerShell was blocked pending approval) — Text.test.tsx is unverified by an actual test run, though it follows Box.test.tsx's established pattern exactly.
