# Gaps reported while generating Splitter for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 16:38 — round 1

- minSize's description references a `collapseThreshold` that isn't a declared prop anywhere in the schema; I treated `minSize` itself as the collapse trigger (drag/step below minSize collapses when `collapsible`).
- persistKey: the spec calls for 'AsyncStorage when available, else memory', but AsyncStorage is a third-party native module and the package conventions permit only react-native-svg as a runtime dependency, so I implemented persistence as a module-scoped in-memory Map only — it survives a remount but not an app restart, unlike the spec's intent.
- The separator must be a plain View carrying a PanResponder directly (the same constraint documented on Slider's thumb: spreading panHandlers onto Pressable fights its own gesture responder), and a bare View has no onFocus/onBlur in this RN version's types, so the separator itself cannot show a keyboard focus-visible ring — acknowledged platform limit, same as SliderThumb. The composed collapse Button still gets full focus-visible treatment.
- Keyboard model rows for Home/End and the separator's own Enter-to-collapse have no hardware-key equivalent reachable from a bare View; I exposed them as custom accessibilityActions (setMinimum/setMaximum/activate) rather than physical key handlers. F6 pane-cycling has no native/accessibility-action equivalent at all and is not implemented.
- The RN platform notes only describe stacking 'below the prose max' (i.e. the stackBelow default); I generalized this to honor all three stackBelow enum values (prose/content/never) per the schema's prop table, mapping content to layout.maxWidth.content and never to no stacking, which the RN notes don't explicitly confirm.
- handleSize (overridable) and minTarget (locked) both describe the separator's touch footprint without stating how they compose; I implemented the effective hit area as max(handleSize, minTarget) so the locked floor can never be overridden away.
- collapseButtonOffset's anchor/direction isn't specified; I anchored the button to one edge along the drag axis and centered it on the cross axis using a translate of half of Button's known minimum target size (its actual rendered size isn't known ahead of layout).
- separatorHover (locked) has no meaning on a touch-only platform (no pointer hover); left unused — only separatorActive (colorControlSelectedBackground) is applied while dragging.

## 2026-09-10 20:04 — round 1

- minSize's description references a `collapseThreshold` prop that isn't declared anywhere in the schema; treated `minSize` itself as the collapse trigger.
- persistKey: spec says 'AsyncStorage when available, else memory', but AsyncStorage is a third-party dependency not permitted by package conventions (only react-native-svg allowed); implemented as a module-scoped in-memory Map only — survives remount but not app restart.
- The separator must be a plain View with PanResponder directly (Pressable's panHandlers would fight its own responder, same constraint as Slider's thumb), so it has no onFocus/onBlur and cannot show a focus-visible ring itself — acknowledged platform limit; the composed collapse Button still gets full focus treatment.
- Home/End and Enter-to-collapse have no hardware-key equivalent from a bare View; exposed as accessibilityActions (setMinimum/setMaximum/activate) instead of physical key handlers. F6 pane-cycling has no native equivalent and is not implemented.
- RN platform notes only mention stacking below the prose width; generalized to honor all three stackBelow values (prose/content/never), mapping content to layout.maxWidth.content and never to no stacking — not explicitly confirmed by the RN notes.
- handleSize (overridable) and minTarget (locked) don't state how they compose for hit area; implemented effective hit area as max(handleSize, minTarget) so the locked floor can't be overridden away.
- collapseButtonOffset's anchor/direction isn't specified; anchored along the drag axis at one edge and centered on the cross axis via translate of half the target-min size (actual Button size isn't known pre-layout).
- separatorHover (locked) has no meaning on a touch-only platform (no pointer hover); left unused — only separatorActive is applied while dragging.
