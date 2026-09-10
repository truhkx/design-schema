# Gaps reported while generating Checkbox for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:45 — round 1

- Checkbox: the existing file predated the package's overrides contract (no `overrides` prop, no `CheckboxOverridableBinding`) and drew the checkmark as a raw Unicode '✓' Text glyph and a hand-drawn dash View. Icon.tsx's own docstring explicitly names 'the check in a Checkbox' as a supported use case and calls the Unicode approach 'retired', so rewrote to use `<Icon name="check"/"dash">` with `color=colorControlSelectedForeground` and `overrides.strokeWidth` forwarding the `indicatorStroke` binding, and added the full overrides contract following Box/Button/Input's established pattern.
- Checkbox: `indicator` box is spec'd as 'controlSize minus 2 × space.1' but Icon's `size` prop only accepts discrete font-size-scale presets (xs/sm/md/lg/xl) or a token-ref override, not an arbitrary computed pixel value — used `size="xs"` (closest preset to the default ~12px derived size) centered in the drawn box via flexbox; a `controlSize` override will not proportionally rescale the glyph.
- Checkbox: `validateValue` was missing the `invalid` → `copy.invalid` branch the schema's precedence (`error` → `required` → `invalid`) requires — Input already implements this three-branch precedence, so mirrored it exactly (text only surfaces once a Form validation run populates `formError`, matching the existing 'Invalid' story's documented behavior of showing no message until then).
- Checkbox: `transition` binding's exact scope ('fill and indicator transitions') is descriptive, not literal — implemented as a single Animated.Value driving box background/border color (unchecked → controlSelectedBackground) and indicator opacity together, eased with motion.easing.standard and skipped under `useReducedMotion()`, mirroring Button's pressed-background animation pattern. The `pressedOverlay` effect is instantaneous and dims the whole box (border+fill+indicator), not just an overlay layer on the fill, since RN has no cheap way to layer a second tinted surface without restyling the border.
- Checkbox: root View now carries `testID="Checkbox"`, which the original file lacked.

## 2026-09-10 17:44 — round 1

- Checkbox: the file and its index.ts export already existed from a prior generation pass and matched the spec closely; the only omission was the `hideLabel` prop. Implemented it by following Input.tsx's established RN convention — the label Text node is not rendered, and `accessibilityLabel` (always set to `visibleLabel`) continues to carry the accessible name — since the spec doesn't give an RN-specific rendering for hideLabel beyond 'visually hide'.
- Checkbox: added a `HideLabel` story since Storybook convention requires one per enum/notable-state prop and none existed; used Input's `HideLabel` story as the naming/shape template since the schema gives no example props for a Table selection-column use case.
