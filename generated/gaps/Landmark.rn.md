# Gaps reported while generating Landmark for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 01:57 — round 1

- Landmark: pre-existing implementation matched the spec fully except it lacked the mandatory testID="Landmark" testability hook; added it to the root View. No other ambiguity found.

## 2026-09-10 17:54 — round 1

- Landmark: `keyboard`/overrides blocks are absent from the schema and no overridable bindings exist, so no override plumbing or keyboard story was needed — nothing to report beyond the existing implementation already matching the spec verbatim.

## 2026-09-16 05:15 — round 1

- Landmark: the derived `has-accessible-name` scenario only sets `label` on the Default story's args, but the rn platform notes apply accessibilityLabel only for navigation, region and form. The schema doesn't say what role the Default story uses, so on an unlabelled role like main the scenario can't pass. I chose Default role `navigation`; the scenario should set a role that takes a label, or the rn notes should say which roles the scenario applies to.
- Landmark: the examples pass `children` as a bare string ("The page content."). On iOS and Android a raw string can't be a child of a View, so the stories wrap string children in the package `Text`. The doc doesn't say whether example content is text or needs a Text wrapper.
- Landmark: every scenario that checks the role (the-role-prop-chooses-the-landmark, main-is-the-primary-content-landmark, a-region-is-named-by-its-label) is web-only, so nothing tests on rn that `role` reaches the View or that `search` goes through accessibilityRole. The test only checks rendering and the name; an rn scenario checking the `role`/`accessibilityRole` props would close this.
- Landmark: the Guidance's development warnings for a duplicate `main` or duplicate labels don't apply on native (no document to scan, as the doc says), so only the missing-label warning is implemented. The doc doesn't give the warning's text; I kept `Landmark: role "<role>" is only a landmark when it has a label.`
- Landmark: the rn notes don't say whether the root is exposed through `ref`. I followed the package rule (`ref?: React.Ref<ViewInstance> | undefined` on the root View).
