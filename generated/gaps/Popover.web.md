# Gaps reported while generating Popover for web

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:57 — round 1

- platforms.web.element is 'div' but the a11y root the tests key off (data-ds) needed to be on an always-present wrapper, not the conditionally-portaled role=dialog panel — mirrored Menu.tsx's convention (wrapper div carries data-ds='Popover' and wraps the cloned trigger + portal) so `renders`/`has-accessible-name` scenarios pass even when closed; the panel itself carries only data-part='panel'.
- Notes say 'Modal: uses a native <dialog> with showModal()' but the attributes list also asks for explicit role=dialog/aria-modal on the same element set as non-modal. Followed the codebase precedent (Dialog.tsx/AlertDialog.tsx): native <dialog> for modal (gets inert-background and focus containment from the browser's top layer for free) with explicit role='dialog' aria-modal='true' added redundantly; a plain <div role='dialog' aria-modal='false'> for non-modal.
- 'Lock body scroll while open' is listed as a generic overlay rule, but Popover's own prop doc says non-modal 'the page stays interactive.' Scroll lock is applied only when modal=true; non-modal popovers never lock page scroll. Flagging in case the intent was scroll-lock always.
- Notes call for both a document pointerdown-outside listener and a focusout-to-outside listener for non-modal dismissal. Implemented only pointerdown-outside, because the explicit Tab/Shift+Tab handlers already own the keyboard-driven 'leaves the panel' cases, and a generic focusout listener firing alongside the manual focus-move in the Tab-out handler risked double `onOpenChange` calls for one interaction. A `closingRef` guard was added regardless as a safety net.
- No `headingLevel`/level prop exists on Popover (unlike Dialog which has a fixed level too). Hardcoded the heading to level 2, matching Dialog's own default, since a11y.requires doesn't list heading-hierarchy for Popover anyway.
- Arrow placement is centered on the panel's cross-axis edge (e.g. horizontally centered under the trigger for bottom/top placements) rather than tracking the trigger's actual center, since corner placements (bottom-start/bottom-end) don't guarantee the trigger sits under the panel's midpoint. Accurate for the four non-corner placements (top/bottom/start/end); a visual approximation for the four corner ones.
- The 'start'/'end' pure-side placements resolve left/right using the trigger's computed `direction` (RTL-aware), matching Tooltip's existing precedent; the four corner placements (bottom-start, etc.) stay physical left/right with no RTL awareness, matching Menu's existing precedent. The two families of placements are therefore inconsistent with each other on RTL, but each matches an established sibling component.
- trigger is typed as `ReactElement` (not the schema's generic `content`/ReactNode) since cloning it to inject aria-expanded/aria-controls/onClick/ref requires a single element — same tightening Tooltip already makes for its identical 'exactly one focusable element' wording.

## 2026-09-10 21:02 — round 1

- Popover: the previously generated Popover.tsx hardcoded the panel heading to level={2} and had no headingLevel prop at all, despite the schema defining headingLevel (enum '2'/'3'/'4', default '3'). Added the prop, wired it to Heading's level, and added HeadingLevel2/3/4 stories to cover the three derived scenarios — no other spec/implementation mismatches found.
