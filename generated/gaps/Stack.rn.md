# Gaps reported while generating Stack for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 00:50 — round 1

- Stack: the existing Stack.tsx predated this spec's rewrite of `gap` from a raw spacing-scale enum ('0'..'12') to the semantic layout-rhythm enum (none/tight/normal/loose/section). Regenerated it against `layout.gap.*` tokens (layoutGapNone/Tight/Normal/Loose/Section) per the spec's explicit contrast with 'the raw spacing scale'. This breaks type-checking in consumers still passing old numeric gap values (AlertDialog.tsx, AlertDialog.stories.tsx, Dialog.tsx, Dialog.stories.tsx, FocusScope.stories.tsx, Form.stories.tsx, and demo/Preferences.tsx, demo/ProfileSettings.tsx, demo/SignIn.tsx) — out of scope for this Stack-only job; those components need their own regeneration pass to adopt the new gap enum.
- Stack: overrides contract lists only `gap` as overridable with no presence-toggle prop (unlike Box's surface/border/radius), so the override is applied unconditionally regardless of the `gap` value (including `gap: none`) rather than gated behind another prop.
- Stack: spec gives no `testID` guidance beyond the general package convention; added `testID="Stack"` on the root View per the package-wide testability-hook rule, matching Box/Card/Container.
- Stack: no story previously existed for overrides or wrap as 'notable states'; added `Wrap` and `WithOverrides` stories (using `space.lg` as an example override token) since the spec requires overrides support but the scenario list only covers the enum props.

## 2026-09-10 00:52 — round 2

- Stack: Round 1's spec-correct rewrite of `gap` from the raw spacing scale ('0'..'12') to the semantic layout-rhythm enum (none/tight/normal/loose/section) broke nine consumers still on the old numeric values, which the typecheck gate caught. Fixed the consumers rather than weakening Stack's type, mapping each usage by matching pixel value where an old spacing-scale token equals a new layout-gap token exactly (space0=layoutGapNone=0, space1=layoutGapTight=4, space2=layoutGapNormal=8, space4=layoutGapLoose=16) and by semantic role for the one value with no exact match: '6' (space6=24px) was always used as the outermost Stack wrapping a whole screen's major sections, so it became 'section' (32px) per the spec's own definition ('section between page sections') even though it's not the closest pixel match to loose (16px).
- Stack: no spec guidance on how a spacing-scale-to-rhythm-enum migration should be handled for existing call sites; treated it as this job's responsibility since the gate blocks the whole package build, but flagging that other in-flight component jobs (AlertDialog, Dialog, FocusScope, Form, and the three demo screens) had their Stack usages touched as a side effect and may want to double-check the chosen gap value reads correctly in their own visual review.
