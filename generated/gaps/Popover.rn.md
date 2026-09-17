# Gaps reported while generating Popover for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 02:53 — round 1

- Popover: RN's `Modal` always intercepts touch behind it, so `modal=false`'s spec requirement that "the page stays interactive" cannot be reproduced — only "tapping outside closes it" is implemented (backdrop is transparent, not tinted, but still blocks the underlying screen). Same limit this package's Menu already accepts.
- Popover: the panel's accessible name (a11y `accessible-name`, web's `aria-labelledby` the heading or the trigger's rendered text) has no RN equivalent for reading arbitrary trigger content, so it falls back to the trigger element's `label` string prop when present (works for this package's own Button/Link) and is otherwise undefined — a dev warning fires, but a non-Button trigger with no `heading` renders a panel with no accessible name.
- Popover: 'moves focus to the first control (or the heading, if there are none)' cannot be implemented literally — RN has no descendant walker to find a real first focusable control or to detect that the body has none (the same limit Dialog's `initialFocus` and FocusScope document), so focus always lands on the body wrapper via `AccessibilityInfo.setAccessibilityFocus`; the heading fallback is unreachable.
- Popover: `accessibilityState={{ expanded: isOpen }}` cloned onto the trigger has no effect when the trigger is this package's own `Button`, since `Button` does not forward unrecognized props onto its underlying `Pressable` (documented limit already acknowledged by Menu). `aria-controls` has no native analogue and is not attempted.
- Popover: Tab / Shift+Tab (`tab-out` reason, and the modal Tab-wrap) has no implementation — RN's `Pressable` exposes no generic hardware key-event API to detect Tab, and the modal case is inherited from `FocusScope`'s own documented 'no Tab order to confine' limit. `onOpenChange` can never fire with reason `tab-out` on this platform.
- Popover: per the RN platform notes phones should get a `BottomSheet` (height=content) instead of an anchored panel, but this package has no `BottomSheet` component yet, so this generator always renders the tablet/react-native-web anchored-panel variant regardless of form factor — the same acknowledged gap Menu's doc records for its own (missing) ActionSheet fallback.
- Popover: 'repositions on scroll and resize while open' is only handled for resize indirectly (the panel is measured once per open via `measureInWindow`); there is no generic native scroll-position listener to re-measure against, matching Menu's own dropdown, which has the identical limitation though its doc doesn't call it out.
- Popover: the optional arrow (`showArrow`) is centered on the panel's measured edge rather than re-aligned to the trigger's own center once the panel has been shifted to stay on-screen — a cosmetic simplification, not a spec requirement broken outright since the schema doesn't specify arrow alignment precision.
- Popover: `dismissible` is implemented as an all-or-nothing render gate on the close button (hidden when `false`) rather than Dialog's disabled-but-present pattern, since the schema's own wording ('Show the close button') reads as a visibility toggle rather than Dialog's stricter 'must be answered' semantics; flagging the interpretation in case the intended behavior was closer to Dialog's.

## 2026-09-10 18:21 — round 1

- Popover: the file already existed (fully built) but was missing the schema's `headingLevel` prop entirely — Heading level was hardcoded to 2. Added `headingLevel?: '2'|'3'|'4'|2|3|4` (default '3'), threaded to `Heading`'s `level` prop, plus the three HeadingLevel2/3/4 stories and the exported `PopoverHeadingLevel` type; everything else (positioning, modal/non-modal behavior, arrow, overrides, focus handling) was already complete and left unchanged.
- Popover (pre-existing, unchanged): non-modal outside-tap dismissal is approximated — the native `Modal` intercepts all touches behind it, so 'the page stays interactive' from the web spec can't be reproduced, only 'tapping outside closes it'.
- Popover (pre-existing, unchanged): Tab/Shift+Tab tab-out has no native key-event API on `Pressable` and is not implemented; phones render the same tablet/react-native-web transparent-Modal layout since `BottomSheet` composition for phones isn't wired up here.

## 2026-09-16 07:02 — round 1

- Popover: the phone/tablet split has no breakpoint in the spec ('Phones: a BottomSheet'); I used window width <= layout.maxWidth.prose, the same threshold Menu and Select use.
- Popover: on phones, BottomSheet's `dismissible` also turns off scrim taps and drag, but Popover's `dismissible` only hides the close button. Passing it through would leave iOS users with no way to close the sheet, so the phone path always shows BottomSheet's close button and ignores `dismissible` (and `modal`, since a sheet is always modal).
- Popover: BottomSheet reports close reasons `scrim`, `drag` and `action`, which Popover doesn't have. I mapped scrim and drag to `outside`, and action (never emitted) to `close-button`.
- Popover: BottomSheet always uses a level-2 heading and requires a string `heading`, so `headingLevel` has no effect on phones. With no `heading` and no string `label` on the trigger, the sheet title is an empty string and a __DEV__ warning fires.
- Popover: the spec doesn't say whether Popover's overrides should be passed to BottomSheet. I forwarded the bindings both share by name (shadow, radius, inset, partGap, maxWidth, layer, enter, exit) and dropped border, borderWidth, offset and arrowSize.
- Popover: 'the panel is named by the trigger' can't read rendered text on native, so the fallback name is the trigger element's string `label` prop.
- Popover: `trigger` is `type: content` (ReactNode), but its description says it is typed as a single element. I typed it `React.ReactElement` so it can be cloned.
- Popover: `inset` and `partGap` have no named part. I applied inset as the panel surface's padding and partGap as the gap between the header row and the body, and left the body Box at inset none. The gap between the heading and the close button has no binding, so it uses layout.gap.normal.
- Popover: no variant or size is specified for the close button, and the heading-less header layout is unspecified. I used a ghost, sm, icon-only Button with the `close` icon in color.action.ghost.foreground, aligned to the end of the header row when there is no heading.
- Popover: `modal: true` on native is read as 'backdrop taps do nothing, scrim shown, FocusScope trapped'. The spec's rn notes only say that modal adds a scrim.
- Popover: the arrow's color and border aren't specified. It is a rotated square with the overlay surface color and the panel's border/borderWidth, centered on the panel edge.
- Popover: the examples' `given` values are prose ('A Filters Button', 'A DatePicker calendar'), so the example stories use invented stand-in content: a Form with two Checkboxes and an Apply button, a date-labelled Button, an Email Input with Save, and an `info` icon for the help trigger, since there is no help/question glyph.
- Popover: the scenario `escape-closes-a-modal-popover` is limited to web and lit and has no rn test. `tab-out` is never emitted on rn (the notes say so), and Escape on native is only onRequestClose (Android back button, Esc on react-native-web).

## 2026-09-17 10:51 — round 1

- Popover: Behavior lists which closes restore focus (trigger, escape, close-button) and that outside press does not, but says nothing about a controlled consumer setting open=false programmatically (no reason) — chose not to restore focus in that case.
- Popover: rn notes list surface, focusRing and focusRingWidth among the overrides forwarded to BottomSheet, but all three are locked on Popover (not in the overrides type), so there is nothing to forward; only shadow, radius, inset, partGap, layer, enter, exit are forwarded.
- Popover: BottomSheet's close-reason map needs an `action` key for exhaustiveness although the notes say BottomSheet never raises it; mapped it to `close-button`.
- Popover: rn notes say the phone sheet title falls back to the trigger's accessibleName/label and warns in __DEV__ when empty, and separately that the tablet panel is named the same way, but do not say whether the warning applies in the tablet presentation too; chose to warn in both whenever the panel has no name.
- Popover: the closeButton part has a testID convention (`Popover.closeButton`) but Button accepts no testID prop and the composition says to pass exactly the listed props, so the close button carries no part testID (tests find it by its `Close` label).
- Popover: the doc says stories that start open render through a consumer wrapper, naming Default, Keyboard and 'the gates', but does not say whether the headingLevel/state stories should also be open; chose open for headingLevel and state stories (where the difference is only visible open) and closed for placement stories and the four examples (whose given has no open).
- Popover: example `date-picker-panel` says the trigger shows 'the current date' but a story needs a fixed string; used a literal date label rather than computing today's date.
- Popover: examples `date-picker-panel` and `contextual-help` have no heading in `given`, but story args inherit meta's filter-panel `heading: 'Filters'`; set heading: undefined explicitly so they match their given exactly.
- Popover: the `enter` binding describes the slide 'from the trigger side' but not its direction sign for start/end placements under RTL; the slide follows the resolved physical edge after RTL mirroring.
- Popover: `heading-hierarchy` rule says RN has no heading levels, but the doc does not say what headingLevel does on tablets; it only selects Heading's typography there (documented in JSDoc).
