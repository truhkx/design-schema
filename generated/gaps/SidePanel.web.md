# Gaps reported while generating SidePanel for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 03:25 — round 1

- SidePanel: `trigger` is typed `content` in the schema, but showing/hiding it requires cloning a single element to attach aria-expanded/aria-controls/onClick — typed it as `ReactElement` (matching this package's existing Popover convention) rather than a generic ReactNode.
- SidePanel: the web platform notes describe an `as: nav` switch 'through the Landmark component' for the body-is-navigation case, but the component's own prop table has no `as` prop and Landmark isn't in the composition map. Always render a plain `<aside>`; did not invent an `as` prop.
- SidePanel: `copy.openLabel` ('Open menu') has no render site in the component itself since `trigger` is fully consumer-supplied content with its own label — used it as the default trigger's label in the stories instead.
- SidePanel: the notes describe toggling the native `hidden` attribute on the panel once the exit transition ends; instead followed this package's established BottomSheet/Popover pattern of conditionally mounting/unmounting the panel, which gives the same accessibility-tree result but not the literal mechanism described.
- SidePanel: no anatomy part corresponds to BottomSheet's drag 'handle'. Implemented swipeable's drag-to-dismiss on the header (excluding the close button) as the closest non-interactive surface — the schema doesn't say what part should carry the gesture.
- SidePanel: `dismissible: false` doc text ('only the trigger and footer actions close it') has no stated Escape exception, unlike BottomSheet's explicit 'Escape still reports' carve-out — interpreted this as Escape and the close button both being fully gated by `dismissible`, intentionally differing from BottomSheet's precedent.
- SidePanel: added a `container?: HTMLElement` portal-target prop; it isn't in the component's own schema prop list but matches the existing convention on every other portal-based overlay in this package (Popover, BottomSheet).
