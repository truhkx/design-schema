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

## 2026-09-17 05:23 — round 1

- Landmark: the rn notes say to wrap string and number children in Text but not what to do with strings mixed with elements in an array; I wrap each string/number child individually via React.Children.map.
- Landmark: the Default story has label "Main", and the role stories inherit it; the doc doesn't say whether stories for banner/main/contentinfo/search/complementary should clear it. RN ignores the label for those roles anyway; I set label undefined on them so the stories don't model passing a label to a role that never takes one.
- Landmark: the derived renders-role-region and renders-role-form scenarios inherit the Default label "Main", so they never exercise the missing-label warning, and no scenario tests that warning on RN even though the notes say it is the one warning that applies.
- Landmark: the doc says banner/main/contentinfo never take a label and warn on web/Lit, but on RN 'only the missing-label warning applies'. I emit no warning when a label is passed to those roles on RN (it is silently not applied), and complementary/search labels are also silently dropped because accessibilityLabel is limited to navigation/region/form; the doc doesn't say whether a label on complementary or search should warn.
- Landmark: the doc names no RoleForm story label; I used "Sign in" (the only invented string, story-only) so the form story doesn't trigger the missing-label warning. The doc should give one.
