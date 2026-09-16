# Folds

One line per decision: `<date> <Component> <platform>: <gap> → <what the doc now says>`.

2026-09-16 Accordion rn: onChange payload shape unspecified → events always report `string[]`; `value`/`defaultValue` also take a bare string
2026-09-16 Accordion lit: no "nothing open" representation → `[]` or `''`, never undefined
2026-09-16 Accordion lit: items[].content has no Lit mapping → dropped from the item type, body slotted by the item id
2026-09-16 Accordion web: data-part="item" has no element to land on → the item part is the Disclosure root itself, no wrapper
2026-09-16 Accordion web/lit: keyboard vs trigger reason kept being collapsed → reasons map now names the per-platform signal
2026-09-16 Accordion web: `controlled` reason heuristic undefined → it is any `value` the accordion did not just emit
2026-09-16 Accordion rn: arrow navigation impossible → stated in rn notes with swipe as the alternative
2026-09-16 ActionSheet rn/lit: handle has no style binding → handle, handleHeight, handleWidth, handleRadius added
2026-09-16 ActionSheet rn: handle-to-heading gap unbound → headerGap on layout.gap.tight added
2026-09-16 ActionSheet lit: dismissible in the wide presentation unspecified → it gates the sheet only
2026-09-16 ActionSheet web/lit: Menu cannot anchor to a foreign element → host placed at the opener rect, proxy trigger hidden and unfocusable
2026-09-16 ActionSheet web: ref in the wide presentation → the dialog in the sheet form, null in the wide one
2026-09-16 ActionSheet rn: wide presentation and maxWidth → no wide presentation on native, maxWidth is a no-op
2026-09-16 ActionSheet web: Tab rule was expect:manual with no guidance → the rule now says no handler is needed and why
2026-09-16 Alert web: fontSize reach into a composed body → string bodies only, children keep their own sizing
2026-09-16 Alert web: a missing `neutral` tone → there is none by design; a toneless notice is a Note, `info` until it exists
2026-09-16 Alert web/lit: naming contradicted the a11y section → the region is named by heading, else body, on every platform
2026-09-16 Alert rn: focus-onward on dismiss impossible → stated in rn notes with the native equivalent
2026-09-16 Alert lit: dismiss part name → shadow parts carry the anatomy name in kebab-case
2026-09-16 AlertDialog web/lit/rn: confirmDisabled "aria-disabled, still focusable" → forwarded to the Button's own disabled, per platform
2026-09-16 AlertDialog web: no container prop → declared as a platform prop, as Dialog does
2026-09-16 AlertDialog lit: aria-label vs idref → literal text on purpose, even though the heading shares the root
2026-09-16 AlertDialog lit: confirm event payload → confirm has none, only cancel carries a reason
2026-09-16 AlertDialog lit/web: cancel variant and footer alignment → secondary, justify end, on every platform
2026-09-16 AlertDialog web: icon labelling → decorative and aria-hidden
2026-09-16 AlertDialog web: Tab wrap ownership → FocusScope's, no key handler of its own
2026-09-16 AlertDialog web: partGap wording → measures from the icon-and-text row
2026-09-16 AlertDialog rn: scroll lock, heading levels, initial focus target → all three stated in rn notes
2026-09-16 BottomSheet web/rn: exit "continues at the drag velocity" → same exit transition, no momentum physics
2026-09-16 BottomSheet web: close button vs target-44px → minTarget binding on size.target.comfortable added
2026-09-16 BottomSheet lit: drag-dismiss detail shape → no payload
2026-09-16 BottomSheet lit: 90dvh cap scoping → belongs to height:content alone
2026-09-16 BottomSheet rn: ScrollView starting the drag → header and handle only, no responder arbitration
2026-09-16 BottomSheet rn: role, scroll lock, initial focus → stated in rn notes
2026-09-16 Box web/lit/rn: where the `surface` part lives → data-part on the root and host, root testID only on native
2026-09-16 Box lit: element→role table unnamed → only unconditional roles are set; header/footer/section set none
2026-09-16 Box web: insetBlock/insetInline default → unset means `inset` applies; explicit none stays distinct
2026-09-16 Box rn/lit: inset:none gating → padding overrides apply at every value
2026-09-16 Box rn: radius:none → resolves radius.none explicitly
2026-09-16 Box web: locked binding hooks → kept, as the consumer's own-CSS escape hatch, and out of the overrides type
2026-09-16 Box web: className/style on the root → merged, because Popover and BottomSheet compose it with a layout class
2026-09-16 Box rn: `element` has no native counterpart → Landmark is the region component
2026-09-16 Box lit: contrast pairs unimplementable → a token guarantee, not component behaviour
2026-09-16 Breadcrumb lit: reflect said `collapse` → prose corrected to no-collapse and the navigate detail shape
2026-09-16 Button web: "a Link styled as a button" does not exist → use Link; the weight would be Link's own schema, never page CSS
2026-09-16 Button web: an `outline` variant → there is none; a new emphasis needs its own colour pair and proof
2026-09-16 Button web/lit: `expanded` prop vs aria-expanded → rest-spread on web, JS-property tri-state on Lit
2026-09-16 Button rn: icons "until an Icon component exists" → Icon exists; callers pass its overrides.color
2026-09-16 Card rn: interactive + focusable → interactive wins, focusable is a no-op with a dev warning
2026-09-16 Card rn: borderWidth reserved at focus width → stated; the override only affects non-interactive cards
2026-09-16 Card rn: transition inert on native → stated
2026-09-16 Card web: cloning the child to extend the hit area → the one sanctioned exception, and why
2026-09-16 Card lit: where the hit-area rule lives → injected once per root node by Card itself
2026-09-16 Card lit: focusable missing from reflect → added
2026-09-16 Card rn: `accessible={false}` is not forwarded → the child is neutralised by a wrapping View
2026-09-16 Card rn: which slots are searched for the interactive child → children only
2026-09-16 Carousel web/rn: one slide or one page → one page of perView, everywhere
2026-09-16 Carousel lit/rn: autoplay at the last slide without loop → it stops; continuous rotation sets loop
2026-09-16 Carousel web: slide naming prop → `label` on every platform, repeated visibly by the slide
2026-09-16 Carousel lit: picker items → Carousel's own buttons everywhere, not Button
2026-09-16 Carousel web: no play/pause glyph → a text-labelled secondary Button, said plainly
2026-09-16 Carousel rn: arrows over an image → a controlSurface wrapper carries the surface, the Button is untouched
2026-09-16 Carousel lit: tabs aria-controls across roots → named by the slide label instead
2026-09-16 Carousel rn: snap:false, focus pause, adjustable region → stated in rn notes
2026-09-16 Container web: align:start → margin-inline 0 on both sides
2026-09-16 Container lit: element→role → main only
2026-09-16 Combobox lit: `open` missing from reflect → added
2026-09-16 Combobox web: custom-entry dedup field → value or label
2026-09-16 Combobox rn: a Done string for the sheet footer → copy.done added
2026-09-16 Combobox rn: chips in the sheet header → BottomSheet has no header slot; top of the body
2026-09-16 Combobox rn: read-only chips, no focus trap, loading through emptyMessage → stated in the platform note
2026-09-16 Combobox web: chip truncation at ~20 chars → a content guideline; the chip ellipses when the row runs out
2026-09-16 DataGrid web: Delete/Backspace clear value → onCellChange with value undefined
2026-09-16 DataGrid rn: pinned columns in the guidance vs the schema → guidance corrected to the schema's approach
2026-09-16 DataGrid rn: the `body` rowgroup part has no element → the list carries the role; stated
2026-09-16 DataGrid rn: the keyboard model on native → replaced by touch equivalents, named
2026-09-16 DataGrid web: no container prop → declared as a platform prop for the composed editors
2026-09-16 DatePicker web/rn: monthTitleWeight had nothing to forward into → Select gained a fontWeight binding; forwarded
2026-09-16 DatePicker lit/web: validation order listed a prop that does not exist → `invalid` removed from the order
2026-09-16 DatePicker rn: which range field reports the message → `name` only
2026-09-16 DatePicker web: the calendar's Selects registering as fields → rendered outside the form field context
2026-09-16 DatePicker lit: typed dates outside min/max or on a disabled day → committed; bounds surface as tooEarly/tooLate
2026-09-16 DatePicker lit: size and open missing from reflect → added
2026-09-16 DatePicker rn: no grid roles, no roving tabindex, Alt+ArrowDown → stated in rn notes
2026-09-16 Dialog rn: who emits reason `action` → anything inside the dialog; never Dialog itself
2026-09-16 Dialog web: initialFocus title/close vs FocusScope's enum → FocusScope none, Dialog places focus
2026-09-16 Dialog lit: initialFocus close on a non-dismissible dialog → falls back to first body control, then heading
2026-09-16 Dialog web: heading focusability under hideHeading → keeps tabindex -1
2026-09-16 Dialog rn: which parts take testIDs → root, scrim, header, body, footer
2026-09-16 Disclosure rn: the keyboard reason can never fire → stated in the event description
2026-09-16 Disclosure rn: RTL chevron and icon sizing → mirrored glyph, overrides.size from triggerFontSize
2026-09-16 Divider lit: does an ignored label imply semantic → no; vertical is semantic only when told
2026-09-16 Divider rn: spacing:none override → a no-op, presence is not an override's job
2026-09-16 Divider rn: semantic with no label on native → no effect, warns in development
2026-09-16 Feed rn: copy.position after the heading → Card has no seam; the hidden runs sit before the Card
2026-09-16 Fieldset web/lit: aria-invalid missing from the attribute list → added
2026-09-16 Fieldset lit: legend/description as Text → rendered through Text inside the native elements
2026-09-16 Fieldset rn: cloning disabled onto a non-field child → an intended no-op
2026-09-16 FocusScope web: sentinel direction, restore fallback, walker visibility, wrapper display → all four stated
2026-09-16 FocusScope lit: autoFocus container under delegatesFocus → a tabindex -1 anchor first in the shadow root
2026-09-16 FocusScope rn: autoFocus first/last/container, opener capture, onEscapeAttempt → stated as platform limits
2026-09-16 Form lit: discovery by attribute vs by tag → by data-ds-field, and the tag sentence is gone
2026-09-16 Form rn: `name` on native → inert, kept for parity
2026-09-16 Form rn: the summary's "Label: message" → every field registration carries its label
2026-09-16 Heading rn/lit/web: per-level size defaults in prose → the map is stated as the contract, explicit size wins
2026-09-16 Heading lit: part name and a missing level → part="text"; absent level falls back to h2 with a dev warning
2026-09-16 Heading lit: align has no binding → deliberate; alignment is not a themed value
2026-09-16 Heading rn: composing Text → Heading does not; it owns its typography bindings
2026-09-16 Heading rn: root-is-the-part testID collision → the root hook wins on native
2026-09-16 Heading web: contrast-aaa and heading-hierarchy → build-checked, nothing to implement
2026-09-16 Icon web/lit: the color hook default → currentColor, not the token
2026-09-16 Icon web/lit: which element is the `glyph` part → the svg, on every platform
2026-09-16 Icon lit: where role and name live → on the shadow svg, not the host
2026-09-16 Icon rn: strokeWidth locked vs Checkbox's indicatorStroke → both locked on one token, nothing forwarded
2026-09-16 Icon rn: vector-effect only under react-native-web → web passes the token, native scales it
2026-09-16 Icon rn: TextNestingContext vs TextStyleContext → TextStyleContext, the real export
2026-09-16 Icon rn: inline baseline alignment → matches size and colour only; a stated platform limit
2026-09-16 Icon lit: label="" → the decorative case, not an error
2026-09-16 Icon web: prose geometry vs icon-paths.json → the JSON is the only source; the prose says intent
2026-09-16 Input lit: native `size` attribute collision and disabled form participation → both stated in the Lit note
2026-09-16 Landmark lit: ElementInternals role/name vs plain attributes → plain `role` and `aria-label` on the host
2026-09-16 Link rn: external vs onPress, and tone:inherit on the external mark → order stated, fallback named
2026-09-16 Listbox lit: invalid, embedded, loading and a true-default boolean missing from reflect → all four added
2026-09-16 Listbox lit: the error text had no anatomy name → `errorMessage` added
2026-09-16 Listbox web: embedded's suppression scope and initialActiveValue precedence → both stated
2026-09-16 Listbox rn: a11y.role listbox vs the native list role → the name is found by label on native
2026-09-16 Menu rn: groups, separators and shortcuts in the phone ActionSheet → flattened and dropped, with the reason
2026-09-16 Menu rn: ActionSheet close reasons → escape stays; scrim, cancel and drag become outside
2026-09-16 Menu web: who emits `controlled` → never the menu itself
2026-09-16 Menu web: shortcut vs aria-keyshortcuts → display-only and aria-hidden, never that attribute
2026-09-16 Menu web: popup and list as one element, disabled items, no scroll lock, trigger toggles → all stated
2026-09-16 Menu lit: open-change detail narrowed to { open } → it carries the reason, like every other platform
2026-09-16 Menu lit: a group inside a group → the shape allows it, the component does not draw it
2026-09-16 NumberInput web/lit: outOfRange was gated on `required` in one sentence and not in another → never gated
2026-09-16 NumberInput rn: a single-bound clamp had no message → copy.outOfRangeMin and outOfRangeMax added
2026-09-16 NumberInput rn: hold-to-repeat through a composed Button → single tap on native, adjustable actions instead
2026-09-16 NumberInput rn: leadingText beside a currency format → ignored, so a field never shows two symbols
2026-09-16 Pattern.SettingsPage all: colour mode and density drive nothing → said plainly, with the reason
2026-09-16 Pattern.SettingsPage all: AlertDialog copy and initial focus → copy written out, focus is AlertDialog's own
2026-09-16 Pattern.SettingsPage all: the action row and the Toast region in the tree → actions prop, toast() call
2026-09-16 Popover rn: modal:false, focus on open, tab-out, expanded → four native limits stated
2026-09-16 Popover web: arrow alignment, RTL corner placements, the single-element trigger → stated
2026-09-16 Popover rn: dismissible → a visibility switch, not Dialog's rule
2026-09-16 ProgressBar lit: formatValue ignoring min → the default formatter spans the whole range
2026-09-16 ProgressBar lit: ElementInternals vs attributes, and the live region's role → plain attributes, role=status
2026-09-16 ProgressBar rn: indeterminate value and easing, and a bad range → all three stated
2026-09-16 ProgressBar web: when copy.indeterminate fires and what a backward value does → stated
2026-09-16 RadioGroup web: a11y.role radiogroup vs a fieldset's implicit group → the role is set explicitly
2026-09-16 RadioGroup lit: the indicator is a pseudo-element → no hook on any platform, and the part naming rule
2026-09-16 Search web/lit: composition named Landmark while the notes said role="search" → the attribute wins
2026-09-16 Search lit: when the field becomes a combobox → the prop being set at all, empty array included
2026-09-16 Search lit: onClear from Escape, and the submit button's visibility → both fire, always rendered
2026-09-16 Search web: which field of a suggestion fills the query → the label
2026-09-16 Search rn: name and action on native → inert, and the arrow-key highlight has no native form
2026-09-16 SegmentedControl lit: the touch-comfortable target → native only; web and Lit keep the floor
2026-09-16 SegmentedControl lit: Home and End → they select too, as the arrows do
2026-09-16 Select rn: native:always on a platform with no OS picker → the same as auto
2026-09-16 Select lit: activedescendant across roots, the composed Listbox's form association, label overrides → stated
2026-09-16 Select web: Space in the open popup, the container prop, disabled under native:always → stated
2026-09-16 SidePanel web: scrim default contradicted the modal description → the structured default wins
2026-09-16 SidePanel lit: the `role` prop name against Element.role → `landmark` on Lit, said in the prop
2026-09-16 SidePanel web: Tab from a portaled panel, the container prop, the `as: nav` leftover → stated
2026-09-16 SidePanel rn/lit: swipeable on platforms with no gesture → parity only, and where the gesture lives
2026-09-16 Slider web: aria-invalid and aria-required were missing from the thumb → added
2026-09-16 Slider lit: what "other than the default" means, and no required suffix → both stated
2026-09-16 Slider lit: the bubble's radius had no binding → bubbleRadius added
2026-09-16 Slider lit: required and snapToMarks missing from reflect → added
2026-09-16 Slider rn: Page/Home/End and validate:blur on a pointer control → accessibility actions, interaction end
2026-09-16 Splitter lit: F6 with an empty pane, and the grid-track transition → fallback and limit stated
2026-09-16 Stack rn/lit/web: gap:none as a token or a bare zero → the token, on every platform
2026-09-16 Stack lit/web: the li wrapper's box → display: contents with explicit list roles, and an `item` part
2026-09-16 Stack rn: element has no native counterpart → Landmark for a region, rows carry their own semantics
2026-09-16 Stack rn: justify with no bounded main axis, and wrap on a column → both stated
2026-09-16 Stack web: a wrapped Stack as a card grid → it is not one, and what Grid would need
2026-09-16 Stack web: stale swiftui notes for props that never existed → removed
2026-09-16 Stepper web/lit: composition named Button for a control it cannot be → the component's own native button
2026-09-16 Stepper lit: navigable:completed with an error step → visited by position, error included
2026-09-16 Stepper lit: the indicator numeral had no colour binding → indicatorColor added
2026-09-16 Stepper web: the accessible name's mechanism → list ordinal on web and Lit, copy.stepLabel on native
2026-09-16 Stepper rn: error on the current step, and what transition times → both stated
2026-09-16 Table web: a Heading inside <caption> fails aria-required-children → the caption heading is a labelled sibling
2026-09-16 Table lit: the rowActions cell had no stacked label → it carries the same text as its data-label
2026-09-16 Tabs lit: an orphan panel cannot be refused → "not rendered" means forced hidden there
2026-09-16 Text web/lit/rn: an inverse surface needs a colour the tones lack → re-scope the foreground, per platform
2026-09-16 Text lit: locked meaning both "not in the type" and "ignored" → not in the type; a forward is an error
2026-09-16 Text lit: element missing from reflect broke hidden on a span → element reflects
2026-09-16 Text lit/rn: truncate on a slot, on a span, and on native → all three stated
2026-09-16 Text web: className/style and data-part on the root → merged; no part, composers pass their own
2026-09-16 Text rn: align under RTL, weight and lineHeight rounding, the context outside a Text → stated
2026-09-16 Toolbar web: how much a group collapses, and the More trigger's reserve → whole entries, size.target.min
2026-09-16 Toolbar web: overflow:menu on a vertical toolbar → treated as scroll
2026-09-16 Toolbar rn: no ResizeObserver and no group element → scroll with a warning, Divider grouping
2026-09-16 Tooltip lit: the warm window and the pointer grace had no durations → two constants added
2026-09-16 Tooltip web: one node or two for the description → two, and why
2026-09-16 Tooltip lit/rn: start/end under RTL, and no flip on native → logical everywhere, limit stated
2026-09-16 Tooltip web: Text on the inverse surface → the bubble re-scopes the foreground and composes Text
2026-09-16 Tree web/lit: labelSelectedWeight cannot reach a link label → the row marks selection there
2026-09-16 Tree rn: multiple mode left no accessible path to activate → an activate accessibility action
2026-09-16 TreeGrid lit: the Shift+Space key row listed keys its prose did not mean → the row now says one thing
2026-09-16 TreeGrid lit: no empty-state string → copy.empty added
2026-09-16 TreeGrid web: `*` inclusivity, cascade scope, lazy re-expansion, guide-line shape → all four stated
