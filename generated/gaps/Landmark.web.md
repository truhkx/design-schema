# Gaps reported while generating Landmark for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:56 — round 1

- Landmark: the file already existed from a prior generation pass and matched the spec, except it was missing the `data-ds="Landmark"` testability hook required by package conventions (all 25 other components have it). Added it; had to widen the `createElement` generic prop type to `HTMLAttributes<HTMLElement> & { 'data-ds': string }` since raw `createElement` (used here instead of JSX because the ref must satisfy a union of element types) doesn't get TypeScript's JSX-only allowance for arbitrary `data-*` attributes.

## 2026-09-16 05:13 — round 1

- Landmark: the React convention says `...rest` never forwards `className`/`style` to the root, but SidePanel (web) renders its panel root through Landmark with `className`, `style` (override hooks) and `ref`; stripping them fails `tsc`. Chose to keep forwarding `className` (appended to `ds-landmark`) and `style`. Either the SidePanel doc should say it wraps a plain element and composes Landmark inside, or the Landmark doc should allow a composite parent's class and style.
- Landmark: the dev warnings compare labels, but the doc only defines `label` → aria-label. Composing components (SidePanel) name the landmark with `aria-labelledby` instead. Chose to treat the text that `aria-labelledby` points to as the label when checking for duplicates and missing labels. The doc should say which naming sources count.
- Landmark: 'warns when `main` appears more than once in a document' and 'two … landmarks in the same root' don't say which instance warns or how often. Chose: scan the node's getRootNode() for `[data-ds="Landmark"]` in an effect, and only the later one in document order warns (once per pair when it mounts or its role/label/element changes). Landmarks mounted earlier are not rechecked, and native landmarks not rendered by Landmark are not counted.
- Landmark: 'banner, main and contentinfo never take labels', but the type still accepts `label` on them and the has-accessible-name scenario sets one on the Default role. Chose to still render aria-label for any role and skip the duplicate-label check for those three. The doc should say whether a label on them is dropped, warned about, or rendered.
- Landmark: the platform note on when `role` is explicit ('whenever `as` overrides the element') leaves `as` equal to the default element (role navigation, as nav) unclear. Chose: role is explicit on header/footer, when `as` differs from the role's default element, and whenever the element doesn't imply the role (form role=search). `as` equal to the default adds nothing.
- Landmark: the derived `renders-as-*` scenarios change `as` against the Default story's role, which makes odd pairs (role main as aside → <aside role="main">). Default is role `main` with no label, so Default and PageMain don't warn about a missing region label. The doc doesn't say what role the Default story should use.
- Landmark: the web notes say `section` is a region 'only when labelled', but they don't say what happens to `as: section` with a role other than region, or to role region with no label (it renders a plain <section>, which isn't a landmark, plus a dev warning). Chose to emit `role` whenever the element doesn't imply it and rely on the warning for unlabelled regions.
- Landmark: an empty-string `label` isn't covered. Chose to treat '' as absent (no aria-label attribute, counts as missing for the warnings).

## 2026-09-17 05:21 — round 1

- Landmark: the doc says development warnings fire for more than one `main` and for two navigation/complementary/region/form landmarks that share a label or both lack one, but gives no copy for either; I kept 'Landmark: a document should contain exactly one "main" landmark.' and 'Landmark: two "<role>" landmarks in the same root share the label "<label>" / both lack a label; give each a distinct label.'
- Landmark: the Default story has label "Main" and scenarios/examples are 'given overrides on Default args', so role banner/main/contentinfo scenarios and the page-main / banner-that-is-not-the-page-header examples inherit a label those roles refuse (and warn about); the stories add `label: undefined` for those roles, which goes beyond the example's exact `given`. The doc should say whether examples inherit Default args.
- Landmark: an unlabelled `region` with `as` set to something other than section (e.g. div) is not covered: the 'as differs from default → emit role' rule and the 'unlabelled region renders no role attribute' rule conflict; I followed the `as` rule (role="region" is emitted).
- Landmark: a label on banner/main/contentinfo is dropped, but the doc doesn't say whether a composite's `aria-labelledby` on those roles is dropped too; I forward it unchanged.
- Landmark: the doc says example `children` strings are text inside the package Text but doesn't say which Text size/weight/tone to use; I used the Text defaults.
- Landmark: the renders-as-* scenarios apply `as` on top of Default (role navigation), so e.g. `as: main` renders <main role="navigation" aria-label="Main">, a role/element combination the guidance would call wrong; the scenario only checks that it renders.
