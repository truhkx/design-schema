# Test failures after the harness fixes (2026-09-10T02:29)

Written by the job 170 pass from logs/test-{react,lit,rn}.json. Every row is a doc-versus-code mismatch or an open question, not a harness fault: fix the doc, or regenerate the target. Generated code under packages/*/src is the generator's; nothing here was patched by hand.

## React (web) — 3 failing, 471 passing, 9 skipped

| Scenario | File | Error | Diagnosis |
| --- | --- | --- | --- |
| has-accessible-name | `generated/behavior/Alert.web.test.tsx` | Error: expect(element).toHaveAccessibleName() | Doc requires accessible-name on role=status but names no prop that supplies it (heading is optional). Either drop accessible-name from Alert or say the name is the heading + body. |
| press-tracks | `generated/behavior/Button.web.test.tsx` | AssertionError: expected "spy" to be called with arguments: [ { name: 'signup', …(1) }, Anything ] | Extension scenario (Button.analytics): the generated Button predates the extension and never fires onTrack. Regenerate Button (all platforms). |
| error-is-identified | `generated/behavior/Fieldset.web.test.tsx` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Derived from error-identification: expects aria-invalid on the group. Doc says the error is rendered for the group, not that the group is aria-invalid. Doc: state which element carries aria-invalid, or drop error-identification on Fieldset. |

## Lit — 8 failing, 486 passing, 9 skipped

| Scenario | File | Error | Diagnosis |
| --- | --- | --- | --- |
| has-accessible-name | `generated/behavior/Alert.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| has-accessible-name | `generated/behavior/AlertDialog.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| has-accessible-name | `generated/behavior/Dialog.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| error-is-identified | `generated/behavior/Fieldset.lit.test.ts` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Same as web: doc must say whether the group carries aria-invalid. |
| error-is-identified | `generated/behavior/Input.lit.test.ts` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Lit Input does not set aria-invalid on the field when `error` is set (web does). Code/doc mismatch: regenerate Input.lit. |
| has-accessible-name | `generated/behavior/Menu.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| control-is-focusable | `packages/lit/src/AlertDialog.test.ts` | AssertionError: expected <dialog role="alertdialog" …(4)>…(1)</dialog> to be <ds-button …(7)></ds-button> // Object.is equality | Verified with the deep active element (job 180): initial focus lands on the <dialog role=alertdialog> surface itself, not the cancel Button the doc names. Component: regenerate AlertDialog.lit or fix its initial-focus logic in the doc. |
| control-is-focusable | `packages/lit/src/Dialog.test.ts` | AssertionError: expected <dialog aria-modal="true" …(3)>…(1)</dialog> to be <ds-input …(2)></ds-input> // Object.is equality | Verified with the deep active element (job 180): initial focus lands on the <dialog> surface, not the first field the doc names for initialFocus=first. Component: regenerate Dialog.lit. |

## React Native — 1 failing, 159 passing, 0 skipped

| Scenario | File | Error | Diagnosis |
| --- | --- | --- | --- |
| has-accessible-name | `packages/rn/src/Icon.test.tsx` | Error: Unable to find an element with role: image, name: Warning: over quota | Doc says a labelled Icon exposes accessibilityRole image + accessibilityLabel; the regenerated RN Icon renders the SVG without them. Regenerate Icon.rn or fix the doc's RN platform note. |

