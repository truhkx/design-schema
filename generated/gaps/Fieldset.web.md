# Gaps reported while generating Fieldset for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:07 — round 1

- Fieldset: schema's props list has no `required`/`invalid` prop, yet `copy.requiredIndicator` and the behavior note say the indicator appears 'when every field inside is required' — implemented by inspecting each direct child's own `required` prop (Children.toArray + every), since there's no group-level flag to key off.
- Fieldset: composition maps `fields: Stack`, but the platform note only says 'a Stack for the children' without specifying whether Fieldset itself renders the Stack or the consumer is expected to pass one as children. Chose: Fieldset renders the Stack internally (children are the raw field elements), matching how `gap` naturally maps onto Stack's own gap prop — consistent with Card/Dialog precedent of composing Stack directly rather than documenting it as a no-op.
- Fieldset: disabled propagation says 'pass disabled down through a FieldsetContext... until then, the fieldset clones direct children with disabled' — implemented the clone-children fallback only (no FieldsetContext), since Input/Checkbox/Switch/RadioGroup don't read such a context yet and adding an unused context would be speculative; a real FieldsetContext should land when those components regenerate to read it.
- Fieldset: `fieldsGap` is listed as overridable, but forwarding an arbitrary token into the composed Stack without restyling it isn't possible (Stack only exposes a fixed `gap` enum, not an arbitrary token prop). Followed the existing Dialog/AlertDialog/Card precedent for this exact situation: declared the `--ds-fieldset-fields-gap` hook and included `fieldsGap` in the overridable type for API consistency, but it only takes effect through Stack's own closest-preset gap value (a comment in Fieldset.css notes this, matching Dialog.css's `footerGap` comment).

## 2026-09-10 17:54 — round 1

- Fieldset: platforms.web.attributes lists only aria-describedby/aria-disabled, but the notes prose says error sets aria-invalid too — treated the prose as authoritative and added it, since the error-is-identified behavior scenario requires state:invalid.
- Fieldset: styles.disabledOpacity is marked locked: false (overridable) but had no corresponding entry in the component's own overridable-binding union in the existing file — added it; flagging in case the omission was intentional and disabledOpacity was meant to be handled some other way.
- Fieldset: FieldsetContext (for propagating disabled/legend to Input/Checkbox/Switch/RadioGroup, and the derived required-indicator convention) is described in the guidance but not present in the existing implementation, which instead clones direct children with `disabled` only — left as-is since the doc says 'until a field reads the context, Fieldset also clones direct children with disabled', and adding the context plus updating four other components was out of scope for this pass.

## 2026-09-10 21:01 — round 1

- Fieldset: schema's props list has no `required`/`invalid` prop, yet `copy.requiredIndicator` and the behavior note say the indicator appears 'when every field inside is required' — implemented by inspecting each direct child's own `required` prop (Children.toArray + every), since there's no group-level flag to key off.
- Fieldset: composition maps `fields: Stack`, but the platform note only says 'a Stack for the children' without specifying whether Fieldset itself renders the Stack or the consumer is expected to pass one as children. Chose: Fieldset renders the Stack internally (children are the raw field elements), matching how `gap` naturally maps onto Stack's own gap prop.
- Fieldset: disabled propagation says 'pass disabled down through a FieldsetContext... until then, the fieldset clones direct children with disabled' — implemented the clone-children fallback only (no FieldsetContext), since Input/Checkbox/Switch/RadioGroup don't read such a context yet and adding an unused context would be speculative.
- Fieldset: `fieldsGap` is listed as overridable, but forwarding an arbitrary token into the composed Stack without restyling it isn't possible (Stack only exposes a fixed `gap` enum). Declared the `--ds-fieldset-fields-gap` hook and included `fieldsGap` in the overridable type for API consistency, but it only takes effect through Stack's own closest-preset gap value.
- Fieldset: platforms.web.attributes lists only aria-describedby/aria-disabled, but the notes prose says error sets aria-invalid too — treated the prose as authoritative and added it, since the error-is-identified behavior scenario requires state:invalid.

## 2026-09-16 05:28 — round 1

- Fieldset: `fields` is a composed Stack part, but Stack writes its own data-part="container" after ...rest, so no data-part="fields" hook can be put on it without restyling or wrapping the child; left the Stack's own part.
- Fieldset: composition says legend and description are Text, but only `fieldsGap` is listed under forwards; legendSize/legendWeight/helperSize/fontFamily/lineHeight can only reach Text as Text overrides (as the Lit notes say), so they are forwarded to Text's fontSize/fontWeight/fontFamily/lineHeight despite 'add no other forwards'.
- Fieldset: web guidance says 'render the description and error as Text', but the parts list declares `errorMessage` as a plain element and composition omits it; rendered errorMessage as a <p role=alert> styled by Fieldset's errorText/helperSize hooks.
- Fieldset: legendColor (color.foreground) and descriptionText (color.foreground.muted) are locked bindings on Text parts; they are realised as Text tone default/muted rather than as Fieldset CSS hooks, so no --ds-fieldset-legend-color / --ds-fieldset-description-text hooks exist.
- Fieldset: disabledOpacity has no part; dimming the whole root would double-dim fields that apply their own disabled opacity, so it dims only the legend and description.
- Fieldset: the requiredIndicator is 'derived from every direct child field' but the spec doesn't say whether a fragment wrapper counts as direct; fragments are flattened (so `<>…</>` children count), other wrappers are not inspected.
- Fieldset: FieldsetContext did not exist in the package and the spec doesn't say where it lives or its exact value type; defined `FieldsetContext: Context<{ disabled: boolean; legend: string } | null>` plus `useFieldsetContext()` in Fieldset.tsx and exported them. No field reads it yet, so the disabled clone fallback is still active.
- Fieldset: examples give `children` as prose ('Street and city Inputs.'); stories render real Input/Checkbox elements matching the prose rather than the literal string.
- Fieldset: the requiredIndicator is appended inside the legend and so becomes part of the group's accessible name ('Shipping address (required)'); the spec doesn't say whether it should be excluded from the name.

## 2026-09-17 05:33 — round 1

- Fieldset: web notes say 'No React FieldsetContext is exported', but the previous generation exported FieldsetContext/useFieldsetContext and NumberInput read it; I removed the context and index exports and dropped NumberInput's read, so a NumberInput nested deeper than a direct child is no longer disabled by the group. The doc should say NumberInput depends only on the direct-child `disabled` prop on web.
- Fieldset: 'passes disabled to its direct child fields' does not define what a 'field' is before render (data-ds-field lives on the rendered DOM, not the React element). I treat any component element or native input/select/textarea/button/fieldset as a field; plain DOM elements like <p> are left alone. The same rule decides which children count for the required indicator.
- Fieldset: the overrides contract says every binding becomes a --ds-fieldset-* hook, but helperSize says 'no --ds-fieldset-* hook', legendSize/legendWeight/fontFamily/lineHeight 'reach the Text only through overrides', and fieldsGap mentions a --ds-fieldset-fields-gap hook that 'does not reach the Stack'. I emit hooks only for partGap and disabledOpacity; there is no --ds-fieldset-fields-gap, since declaring it would be dead CSS. The doc should say whether that hook is expected to exist.
- Fieldset: the element for the description part is unspecified ('Fieldset-owned elements carrying the parts and ids'); I used a <div data-part=description id> around the span Text, matching the errorMessage <div>.
- Fieldset: legendColor/descriptionText/errorText are 'realised by the Text tone'. I pass tone=default explicitly on the legend Text even though it is Text's default, so the composition props match the schema exactly.
- Fieldset: disabledOpacity 'only while disabled': an override passed while not disabled is not written inline (overrides change values, never presence).
- Fieldset: the requiredIndicator is appended inside the legend Text as a plain string after the legend, so it inherits the legend styling and joins the accessible name. The doc does not say whether it should be a separate styled span; I chose none.
