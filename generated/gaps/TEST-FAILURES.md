# Test failures after the harness fixes (2026-09-10T21:11)

Written by the job 170 pass from logs/test-{react,lit,rn}.json. Every row is a doc-versus-code mismatch or an open question, not a harness fault: fix the doc, or regenerate the target. Generated code under packages/*/src is the generator's; nothing here was patched by hand.

## React (web) — 7 failing, 752 passing, 12 skipped

| Scenario | File | Error | Diagnosis |
| --- | --- | --- | --- |
| renders | `generated/behavior/ActionSheet.web.test.tsx` | TypeError: Cannot read properties of undefined (reading 'filter') | See the error; not classified. |
| has-accessible-name | `generated/behavior/ActionSheet.web.test.tsx` | TypeError: Cannot read properties of undefined (reading 'filter') | See the error; not classified. |
| press-tracks | `generated/behavior/Button.web.test.tsx` | AssertionError: expected "spy" to be called with arguments: [ { name: 'signup', …(1) }, Anything ] | Extension scenario (Button.analytics): the generated Button predates the extension and never fires onTrack. Regenerate Button (all platforms). |
| error-is-identified | `generated/behavior/DatePicker.web.test.tsx` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Invalid state not reflected as aria-invalid where the doc places it. |
| has-accessible-name | `generated/behavior/Select.web.test.tsx` | TestingLibraryElementError: Unable to find an accessible element with the role "combobox" and name "Country" | See the error; not classified. |
| error-is-identified | `generated/behavior/Slider.web.test.tsx` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Invalid state not reflected as aria-invalid where the doc places it. |
| has-accessible-name | `generated/behavior/Toast.web.test.tsx` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |

## Lit — 13 failing, 704 passing, 12 skipped

| Scenario | File | Error | Diagnosis |
| --- | --- | --- | --- |
| has-accessible-name | `generated/behavior/BottomSheet.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| has-accessible-name | `generated/behavior/Carousel.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| error-is-identified | `generated/behavior/DatePicker.lit.test.ts` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Invalid state not reflected as aria-invalid where the doc places it. |
| has-accessible-name | `generated/behavior/Feed.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| error-is-identified | `generated/behavior/Input.lit.test.ts` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Lit Input does not set aria-invalid on the field when `error` is set (web does). Code/doc mismatch: regenerate Input.lit. |
| has-accessible-name | `generated/behavior/Menu.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| has-accessible-name | `generated/behavior/ProgressBar.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| error-is-identified | `generated/behavior/Slider.lit.test.ts` | Error: expect(element).toHaveAttribute("aria-invalid", "true") // element.getAttribute("aria-invalid") === "true" | Invalid state not reflected as aria-invalid where the doc places it. |
| has-accessible-name | `generated/behavior/Splitter.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| has-accessible-name | `generated/behavior/Toast.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| has-accessible-name | `generated/behavior/Toolbar.lit.test.ts` | Error: expect(element).toHaveAccessibleName() | Accessible name expected but empty: the doc names no prop that supplies it, or the component omits aria-label/labelling. |
| control-is-focusable | `packages/lit/src/AlertDialog.test.ts` | AssertionError: expected <dialog role="alertdialog" …(4)>…(1)</dialog> to be <ds-button …(7)></ds-button> // Object.is equality | Verified with the deep active element (job 180): initial focus lands on the <dialog role=alertdialog> surface itself, not the cancel Button the doc names. Component: regenerate AlertDialog.lit or fix its initial-focus logic in the doc. |
| control-is-focusable | `packages/lit/src/Dialog.test.ts` | AssertionError: expected <dialog aria-modal="true" …(3)>…(1)</dialog> to be <ds-input …(3)></ds-input> // Object.is equality | Verified with the deep active element (job 180): initial focus lands on the <dialog> surface, not the first field the doc names for initialFocus=first. Component: regenerate Dialog.lit. |

## React Native — 0 failing, 221 passing, 0 skipped

- none

