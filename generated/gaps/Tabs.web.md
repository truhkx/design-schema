# Gaps reported while generating Tabs for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 09:26 — round 1

- Tabs: the keyboard table only lists ArrowRight/ArrowLeft (when: horizontal); there is no explicit row for vertical orientation, even though the orientation prop and the guidance prose ('Vertical tab lists ... use Up/Down arrows') require it. I mirrored the same next/prev/wrap logic onto ArrowDown/ArrowUp when orientation=vertical rather than leaving vertical tab lists unnavigable.
- Tabs: the schema gives no guidance on what happens when `tabs[]` and the `TabPanel` children in `children` are out of sync (a tab with no matching panel id, or a panel with no matching tab). I render whatever panels exist that match a tab id and silently skip the rest, with no dev warning.
- Tabs: indicator placement (underline vs. side bar, which edge, whether it sits on top of or replaces the list border) isn't pixel-specified. I placed it flush against the list border edge (bottom for horizontal, inline-end for vertical) and measure its offset/size from the selected tab button via getBoundingClientRect-equivalent offsetLeft/offsetWidth (or offsetTop/offsetHeight), recomputed on selection, orientation, fit and tabs changes plus window resize.
- Tabs: `fit: fill` behavior for vertical orientation is undocumented (the doc only mentions it for phones/horizontal). I applied the same flex:1 stretch to tabs regardless of orientation rather than special-casing or ignoring it when vertical.
- Tabs: disabled tabs use aria-disabled (per the general convention) but, unlike Switch/RadioGroup's 'disabled stays focusable' rule, disabled tabs never receive the roving tabindex (they're excluded from the enabled-tabs array used for Home/End/arrow targets and the initial/default selection), so they are never a Tab-key stop — this follows the APG tabs pattern's roving-tabindex requirement over the generic aria-disabled-stays-focusable rule, but the schema doesn't call out the conflict explicitly.
