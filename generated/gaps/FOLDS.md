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
2026-09-16 Button rn: copy.loading has no rn surface → accessibilityValue text copy.loading beside busy
2026-09-16 Button rn: inverse ghost hover 12% has no token or binding → inverseBackgroundHover + inverseHoverOpacity (opacity.disabled × 0.25)
2026-09-16 Button rn: rn notes omit onPressOut from the Tooltip forwarding list → onPressOut added, chained with pressed-state tracking
2026-09-16 Button rn: accessibleName vs parent accessibilityLabel precedence unspecified → accessibleName ?? accessibilityLabel ?? label
2026-09-16 Button rn: schema declares no ref for parent measuring/focusing → root Pressable exposed as ref for Tooltip and Toolbar
2026-09-16 Button rn: icon-only example has no glyph, renders empty → example given gains leadingIcon close
2026-09-16 Button rn: 1em currentColor ring impossible on rn, no spinner size → spinnerSize binding font.size.{size}; ring in resolved foreground
2026-09-16 Button rn: 44px touch target used an undeclared token → touchTarget binding size.target.comfortable (rn, swiftui) via hitSlop
2026-09-16 Button rn: iconOnly with trailingIcon undefined → trailingIcon not rendered either
2026-09-16 Button rn: expanded undefined might announce collapsed → tri-state; omitted from accessibilityState when undefined
2026-09-16 Button rn: blocked press analytics and Form disabled unspecified → blocked press runs nothing chained; disabled inside a disabled Form
2026-09-16 Button rn: onPress drops GestureResponderEvent, intent unconfirmed → no payload; rn handler takes no arguments
2026-09-16 Button rn: transition claims foreground transitions no variant has → background only
2026-09-16 Button rn: overridable backgroundHover can break the locked AA pair → backgroundHover locked
2026-09-16 Button rn: disabled-stays-focusable reads as a bug on rn → disabled never passed to Pressable; press guard + accessibilityState.disabled
2026-09-16 Button lit: copy.loading has no surface, dropped under aria-label → description via visually hidden node + aria-describedby
2026-09-16 Button lit: accessibleName "start of" contradicts the Amount example → name must contain the label; starting with it preferred
2026-09-16 Button lit: spinnerStroke moved to locked with no deprecation note → locked, keeps its CSS hook, not in the overrides type
2026-09-16 Button lit: blocked click may escape the shadow root → preventDefault + stopPropagation; nothing leaves the host
2026-09-16 Button lit: ds-form inside a native form double-submits → requestSubmit only when no ds-form encloses the button
2026-09-16 Button lit: part vs slot casing collide → part camelCase leadingIcon, slot kebab-case leading-icon
2026-09-16 Button lit: 44px touch target has no token or coarse-pointer rule → web/Lit keep the 24px floor only; touchTarget is rn/swiftui
2026-09-16 Button lit: non-ghost fills on inverse surface unproven → no pair needed; text proven against its own fill
2026-09-16 Button lit: expanded tri-state vs boolean, scenario spelling unclear → tri-state, aria-expanded on the container
2026-09-16 Button lit: overflowLabel not reflected, Toolbar cannot read it → overflow-label reflected; Toolbar reads the attribute
2026-09-16 Button lit: enter/space scenarios need no key code → both scenarios say native button activation
2026-09-16 Button web: web notes deny the expanded prop the scenario passes → expanded is a React prop; rest aria-expanded applies when undefined
2026-09-16 Button web: copy.loading placement would change the accessible name → hidden node via aria-describedby, merged with caller's
2026-09-16 Button web: spinnerStroke removal from overrides type is breaking → locked, keeps --ds-button-spinner-stroke
2026-09-16 Button web: icon-only example renders empty → example given gains leadingIcon close
2026-09-16 Button web: spinner has no anatomy part or data-part → not an anatomy part; takes the leadingIcon position only
2026-09-16 Button web: inverse ghost hover 12% is a bare literal → inverseBackgroundHover + inverseHoverOpacity bindings
2026-09-16 Button web: no comfortable-target binding or rule for when it applies → minTarget is the web floor; touchTarget is rn/swiftui
2026-09-16 Button web: overflowLabel has no web contract for Toolbar → Toolbar reads it from element props; never reaches the DOM
2026-09-16 Button web: onTrack argument shape undeclared → Button.analytics declares payload [name, label], positional on web/rn/swiftui, detail on Lit
2026-09-16 Card rn: hoverBackground is a hover state native lacks → shown while pressed, and on pointer hover where one exists
2026-09-16 Card rn: zero or several Link/Button children unstated → card stays non-interactive and warns once in development
2026-09-16 Card rn: does a disabled child disable the card → yes; accessibilityState disabled, press ignored
2026-09-16 Card rn: focusable tabIndex -1 only works on react-native-web → stated; native screen readers swipe card to card via the header
2026-09-16 Card rn: interactive default card loses its resting border → reserved focus-width border is `border` color on default, transparent on subtle
2026-09-16 Card rn: headingLevel changes nothing visible at size lg → level passed for parity; size lg on every platform
2026-09-16 Card rn: example children are prose strings → plain strings render in Text; link example renders a Link at top level
2026-09-16 Card rn: actionsGap binding names no part → part headerActions
2026-09-16 Card lit: hit area on ds-link host never activates the inner element → card calls click() on the child's inner a[href]/button
2026-09-16 Card lit: interactive default card loses visible border → border color at rest on default, transparent on subtle
2026-09-16 Card lit: header actions/footer clickable above hit area unstated → they sit above it (position relative, z-index 1)
2026-09-16 Card lit: search direct slotted children or all descendants → assigned elements of the default slot only
2026-09-16 Card lit: :focus-within rings the card on mouse or header-action focus → target-focus custom state from :focus-visible on the target
2026-09-16 Card lit: delegatesFocus conflicts with a focusable card → host tabindex -1, no delegatesFocus
2026-09-16 Card lit: which element carries data-part for footer/body/headerActions → the row or wrapper holding the part, not the slot
2026-09-16 Card lit: Heading size lg only in prose notes → heading prop: Heading size lg on every platform
2026-09-16 Card lit: example children prose string not a value → plain strings render as Text; link example renders a Link
2026-09-16 Card lit: article role and tabindex scenarios web-only though Lit implements both → both now [web, lit]
2026-09-16 Card lit: consumer role vs the card's own article role → set role only if none; remove only a role the card wrote
2026-09-16 Card web: interactive default card's reserved border hides the resting border → border color at rest on default
2026-09-16 Card web: zero or several interactive children unstated outside Lit → non-interactive plus one dev warning, every platform
2026-09-16 Card web: how to recognise the one interactive child → top-level body children only; wrappers are not searched
2026-09-16 Card web: whole-card-is-a-link children string cannot be interactive → example renders a Link labelled with that text
2026-09-16 Card web: Heading writes its own data-part, no heading hook → heading found by role or text, keeps Heading's hook
2026-09-16 Card web: Heading default bottom margin inside header → Heading overrides marginBlockEnd space.0
2026-09-16 Card web: :focus-within rings on header-action and mouse focus → ring only via :has(.target:focus-visible)
2026-09-16 Card web: how a focusable card draws its ring → outline focusRingWidth in focusRing on :focus-visible, no offset
2026-09-16 Card web: tabIndex through rest allowed → not a Card prop; `focusable` wins
2026-09-16 Card web: empty heading string handling → counts as omitted (no article, no label)
2026-09-16 Container rn: viewport exactly at a breakpoint → min-width inclusive; that width gets the wider gutter
2026-09-16 Container rn: override on the default gutter replaces all bands or one → replaces the value at every width
2026-09-16 Container rn: override at gutter none only implied inert → does nothing, no dev warning
2026-09-16 Container rn: example children are bare strings → label rendered inside Text on every platform
2026-09-16 Container rn: align start described in CSS margin terms → alignSelf center / flex-start on rn
2026-09-16 Container rn: whether a ref reaches the root View → ref forwarded to the root View, typed as Box does
2026-09-16 Container lit: breakpoint px differ by theme, doc names none → calm-precise 960/1280; other themes switch at those widths (known limit)
2026-09-16 Container lit: plain role="main" host attribute too → no; ElementInternals as Box, landmark scenario web-only
2026-09-16 Container lit: example children strings, children not a property → label rendered in Text; stories build no Stack
2026-09-16 Container lit: override at width full silently ignored → no dev warning
2026-09-16 Container lit: host has no column part marker → host carries data-part column
2026-09-16 Container web: breakpoint px depend on theme but CSS is one file → calm-precise widths; known limit stated
2026-09-16 Container web: which side of an exact token width → inclusive min-width
2026-09-16 Container web: default gutter's middle token unnamed → narrow, layout.gutter.default, wide
2026-09-16 Container web: column part has no binding home → root is the column part with data-part column
2026-09-16 Container web: element div vs main/section prop → div is the default; root renders the element prop's tag
2026-09-16 Container web: example children are prose → label rendered in Text
2026-09-16 Container web: exactly one main unenforceable, warn? → author's responsibility; no enforcement, no warning
2026-09-16 Container web: SwiftUI shrinks gutters unlike web/RN → swiftui note follows the web rule
2026-09-16 Divider rn: rn props list accessibilityRole native lacks → removed; notes say native has no separator role
2026-09-16 Divider rn: how spacing applies on rn → root View padded on the cross axis, line an inner View
2026-09-16 Divider rn: labelled row line pieces hidden from AT? → each line View hidden; label Text readable
2026-09-16 Divider rn: importantForAccessibility no with inner View → decorative root uses no-hide-descendants
2026-09-16 Divider rn: label layout, compose Stack? → no Stack; root is a row with gap labelGap
2026-09-16 Divider rn: empty-string label → no label: decorative, no warning
2026-09-16 Divider rn: vertical + ignored label + semantic → both dev warnings
2026-09-16 Divider rn: dev warning frequency → fires when the combination appears or changes
2026-09-16 Divider rn: label Text size/tone only in web section → composition.label passes size sm, tone muted, element span
2026-09-16 Divider rn: label scenario checks text only on rn → scenario says rn checks text alone
2026-09-16 Divider lit: ElementInternals vs host attributes for role → plain host attributes
2026-09-16 Divider lit: host display block cannot lay out line/label/line → host is the line unlabelled, flex row via data-labelled
2026-09-16 Divider lit: is the label the separator's name → yes; host aria-label is the label text
2026-09-16 Divider lit: spacing none has no token → none renders no space, sets no hook, override inert
2026-09-16 Divider lit: axis spacing applies to → cross axis (margin-block horizontal, margin-inline vertical)
2026-09-16 Divider lit: label Text size, tone, element unstated → composition.label props and forwards labelSize/fontFamily
2026-09-16 Divider lit: aria-hidden/separator expectations web only → now [web, lit]
2026-09-16 Divider lit: label scenario role check web only → now [web, lit]
2026-09-16 Divider lit: vertical divider in block flow has no height → needs a flex/grid row or definite-height parent
2026-09-16 Divider web: separator children presentational, label unannounced → aria-labelledby to the Text's id
2026-09-16 Divider web: hr vs div for an unlabelled semantic divider → semantic is div role separator; decorative is hr aria-hidden
2026-09-16 Divider web: line part has no element when unlabelled → root is the line; labelled, two spans carry data-part line
2026-09-16 Divider web: fontFamily has no part → part label, reaches only the Text
2026-09-16 Divider web: labelColor/labelSize as Text props or bindings → Text size sm tone muted; no own rule
2026-09-16 Divider web: spacing none resolves to layout.gap.none → none is off: no space, no hook
2026-09-16 Divider web: labelGap override with no label → does nothing
2026-09-16 Divider web: vertical display unspecified → inline-block, block-size 100%, align-self stretch, background box
2026-09-16 Divider web: vertical-label warning frequency → when the combination appears or changes
2026-09-16 Divider web: stories need a sized row for vertical → toolbar-groups example in a horizontal Stack, align stretch
2026-09-16 Form rn: error summary has no border width, radius, padding → errorSummaryBorderWidth, Radius, Padding, Gap bindings
2026-09-16 Form rn: summary item links lack target/focus bindings → each item is a Link keeping its own
2026-09-16 Form rn: "Label: message" doubles the label → item text is the field's message; label only when message empty
2026-09-16 Form rn: register name as argument or handle property → register(name, { label, getValue, validate, focus })
2026-09-16 Form rn: onSubmit payload narrower than FormFieldValue → payload widened to string | number | boolean | string[] | [number, number]
2026-09-16 Form rn: disabled opacity would stack on fields → container adds no opacity, only exposes disabled state
2026-09-16 Form rn: summaryHeadingOne/invalidSummary use on RN → summaryHeading only; invalidSummary SwiftUI-only
2026-09-16 Form rn: notes vs guidance on focus target → summary when errorSummary on, else first invalid field
2026-09-16 Form rn: role form has no native landmark → react-native-web only; accessibilityLabel names the group on native
2026-09-16 Form rn: example children/actions are prose → examples name each Input's name and label, in a Stack
2026-09-16 Form lit: discovery: context has no Lit counterpart → attribute discovery over light DOM is the Lit form
2026-09-16 Form lit: no way to tell a field has no blur moment → data-ds-field="change" validates on change
2026-09-16 Form lit: Enter submits in ds-input or any field → any data-ds-field field except textarea, button, link
2026-09-16 Form lit: disabled reaches fields only or actions too → fields plus every ds-button in actions
2026-09-16 Form lit: copy.invalidSummary on Lit → not rendered (SwiftUI only)
2026-09-16 Form lit: summaryHeadingOne duplicates plural; locale unstated → plural by count in nearest lang ancestor's locale
2026-09-16 Form lit: errorSummary attribute name → negated no-error-summary
2026-09-16 Form lit: summary item link not in Related → Link tone inherit, focuses field, never navigates; Link/Text in Related
2026-09-16 Form lit: DsFormField.currentValue type vs submit payload → same widened value contract
2026-09-16 Form lit: example children/actions are prose → concrete Input names and labels
2026-09-16 Form lit: landmark scenario web-only → [web, lit]
2026-09-16 Form lit: summary padding/radius/border/item spacing unbound → four new bindings; list has no markers or indent
2026-09-16 Form web: copy.invalidSummary on web → never rendered (SwiftUI only)
2026-09-16 Form web: summaryHeadingOne duplicates the plural one form → unused on web
2026-09-16 Form web: no locale source for Intl.PluralRules → nearest lang ancestor, else runtime default
2026-09-16 Form web: summary padding/radius/border-width unbound → four new overridable bindings
2026-09-16 Form web: "strong Text" weight and tone → Text weight semibold, tone danger
2026-09-16 Form web: summary link tone and click behavior → Link tone inherit; focuses field, no navigation
2026-09-16 Form web: no spacing between summary heading and list → errorSummaryGap layout.gap.tight; list is a Stack as ul
2026-09-16 Form web: data-ds-field vs discovery: context → context registers; data-ds-field only sorts into document order
2026-09-16 Form web: example children/actions are prose → concrete Input names and labels
2026-09-16 Form web: nameless form gets no warning → nothing enforces it at runtime, no dev warning
2026-09-16 Input rn: TextInput has no hover or long-press handlers → pointer enter/leave; onLongPress after longPressDelay constant
2026-09-16 Input rn: rn notes omit Tooltip's onPressOut → added to forwarded props
2026-09-16 Input rn: description and parent hint both use accessibilityHint → description first, then forwarded hint
2026-09-16 Input rn: parent label vs Fieldset legend order → parent label replaces label; legend still prefixed
2026-09-16 Input rn: disabled cannot stay focusable on native → editable false + accessibilityState.disabled, not focusable
2026-09-16 Input rn: does size set the label's type → fontSize covers field and label; helper text stays helperSize
2026-09-16 Input rn: minTargetSm locked with no per-size override → locked like minTarget
2026-09-16 Input rn: no visually-hidden pattern for hideLabel → label Text not rendered; name in accessibilityLabel only
2026-09-16 Input rn: label/description Text take no testID → Text receives testID Input.<part> directly
2026-09-16 Input rn: required and error scenarios web attributes only → required shown by indicator; error by live region
2026-09-16 Input lit: when the error slot shows copy.required/invalid → error, else only while invalid: required then invalid
2026-09-16 Input lit: Form/field contract for in-field messages → Form sets and clears invalid, never error
2026-09-16 Input lit: data-ds-field vs Form.ts tag list → host carries data-ds-field
2026-09-16 Input lit: does value have an attribute → property-only; default-value is the attribute
2026-09-16 Input lit: does controlled mode revert → yes, shows .value again unless rebound synchronously
2026-09-16 Input lit: helperSize has no CSS hook → reaches Text through its overrides only
2026-09-16 Input lit: is requiredIndicator in the accessible name → yes, plain label text
2026-09-16 Input lit: hideLabel attribute name → hide-label, not reflected
2026-09-16 Input lit: Lit has no FieldsetContext → property from ds-fieldset or formDisabledCallback
2026-09-16 Input lit: no root part but disabledOpacity dims the group → root wrapper named per platform, not an anatomy part
2026-09-16 Input web: onFocus/onBlur list no payload → no payload; onChange passes value only
2026-09-16 Input web: no FieldsetContext in React → group disabled via the prop Fieldset passes
2026-09-16 Input web: no copy for browser validity → reports copy.invalid, never validationMessage
2026-09-16 Input web: ref target root or input → the input element
2026-09-16 Input web: does label size follow size → yes, fontSize covers the label
2026-09-16 Input web: focus-visible says outline, binding says border → the border meets it, no outline
2026-09-16 Input web: descriptionText/errorText have no CSS hook → Text tones, helperSize via Text overrides
2026-09-16 Input web: no transition binding → transition motion.duration.fast, border color only
2026-09-16 Input web: read-only fields submitted and validated? → yes, as native
2026-09-16 Input web: invalid set directly renders copy.invalid? → yes, required or invalid while invalid
2026-09-16 Link rn: what cancelling onPress means on native → returning false cancels the Linking hand-off
2026-09-16 Link rn: notes contradict on icon color under inherit → no color passed; Icon takes TextStyleContext color
2026-09-16 Link rn: external always Linking vs "never both" → openURL after handler unless it returned false
2026-09-16 Link rn: TextNestingContext named but TextStyleContext exported → guidance names TextStyleContext.nested
2026-09-16 Link rn: overrides list bindings inert on native → rn LinkOverridableBinding is transition alone
2026-09-16 Link rn: externalIconGap cannot apply to nested Text → native uses a single space, binding unused
2026-09-16 Link rn: ref to Text root → no ref; Tooltip attaches through forwarded props
2026-09-16 Link rn: external accessible-name expectation web-only → web, lit, rn via accessibilityLabel
2026-09-16 Link rn: "(opens in new tab)" wrong on native → externalSuffix used as-is; copy.external unused on native
2026-09-16 Link lit: colorHover says hover and active → hover only (not :active); pressed color on native
2026-09-16 Link lit: required href/label have no initial value → both start '', no warning
2026-09-16 Link lit: must Lit reach the full external name → yes, through the shadow root
2026-09-16 Link lit: examples lack surrounding paragraph text → descriptions quote it and name the wrapping Text
2026-09-16 Link lit: underline color under tone inherit → follows the inherited color
2026-09-16 Link lit: inherit also turns off hover/visited colors → yes, by design
2026-09-16 Link lit: externalIcon color not bound → Icon is currentColor, follows rest/hover/visited
2026-09-16 Link lit: fires user cannot stop script .click() → Link never dispatches itself; does not filter script clicks
2026-09-16 Link web: Tree passes className and strips underline → Link takes no className/style; composites use tone inherit
2026-09-16 Link web: Tree's data-part clashes with anchor → Link's data-part wins; parent parts go on its own wrapper
2026-09-16 Link web: onClick returns void but contract allows false → typed void | boolean; false calls preventDefault
2026-09-16 Link web: externalIcon is the Icon or a wrapper → span data-part externalIcon wrapper carrying the gap
2026-09-16 Link web: hand-drawn SVG vs Icon rule → Icon name external inline, no label
2026-09-16 Link web: tone inherit turning off locked colors unstated → color/colorHover/colorVisited not applied under inherit
2026-09-16 Link web: copy expectation has no matcher → reads anchor text content incl. visually hidden suffix
2026-09-16 Link web: examples lack surrounding paragraph text → quoted paragraph text in both examples
2026-09-16 Link web: colorHover applied to :hover and :active → hover only
2026-09-16 Alert rn: dismiss close glyph icon name and color token unnamed → Icon close, overrides.color color.action.ghost.foreground; composition names Button ghost/sm/iconOnly
2026-09-16 Alert rn: icon color via overrides.color vs Icon color prop → overrides.color token path on every platform, never RN color prop
2026-09-16 Alert rn: bodyColor and body typography have no RN mechanism → string/number body wrapped in Text; default tone, typography via overrides
2026-09-16 Alert rn: whether heading Text gets accessibilityRole header → raw styled Text, no header role, matching web
2026-09-16 Alert rn: announceForAccessibility iOS-only or every platform → iOS only; Android relies on accessibilityLiveRegion
2026-09-16 Alert rn: non-string body without heading leaves region unnamed → accessibilityLabel left unset; children read on their own
2026-09-16 Alert rn: status scenario has no RN check, role status? → no role on native; rn checks accessibilityLiveRegion polite
2026-09-16 Alert rn: icon alignment with the first line unstated → icon box as tall as first line, Icon centred (iconSize description)
2026-09-16 Alert rn: dismissMargin negative margin vs no-sibling-margins rule → the one sanctioned margin, on the wrapper View
2026-09-16 Alert lit: role via ElementInternals vs plain host attribute → plain role attribute on host, removed when live off
2026-09-16 Alert lit: ariaLabelledByElements name invisible to tests → plain host aria-label with heading text, else body text
2026-09-16 Alert lit: --ds-alert-icon-size hook does not reach Icon → override through overrides.iconSize; hook does not resize Icon
2026-09-16 Alert lit: container bindings have no part → background, border, borderWidth, radius, padding, gap, partGap, fontFamily, lineHeight part container
2026-09-16 Alert lit: named heading slot absent from parts → heading is a string property only; no named slot
2026-09-16 Alert lit: part names kebab-case vs anatomy names verbatim → camelCase for part and data-part
2026-09-16 Alert lit: live-off-renders-no-role limited to web → now [web, lit]
2026-09-16 Alert web: dismissButton data-part blocked by Button's own hook → span wrapper carries data-part and dismissMargin; tests click inner button
2026-09-16 Alert web: icon part hook for a composed Icon → span alignment box carries data-part icon
2026-09-16 Alert web: inline iconSize override defeats consumer CSS hook → hook does not resize Icon; override through overrides.iconSize
2026-09-16 Alert web: body aria-labelledby makes rich body text the name → intended; whole body text including links is the name
2026-09-16 Alert web: next focusable element on dismiss undefined → selector list, skipping disabled, inert and unrendered elements
2026-09-16 Alert web: notes say inline SVG, binding says Icon → system Icon named by tone in the icon box
2026-09-16 Alert web: dismiss glyph described as 1em × glyph → Icon name close with inline
2026-09-16 Breadcrumb rn: nav and list parts share one root View → root View is both parts, testID Breadcrumb, no nav/list testIDs
2026-09-16 Breadcrumb rn: Link takes no testID for the link part → Text wrapping each Link carries Breadcrumb.link; full testID list in rn notes
2026-09-16 Breadcrumb rn: copy.current has no stated use on rn → rn current Text accessibilityLabel is '<label>, <copy.current>'
2026-09-16 Breadcrumb rn: returning false from onNavigate changes nothing on native → typed boolean | void and passed as Link onPress; nothing to cancel
2026-09-16 Breadcrumb rn: native handler has no event argument → onNavigate is (item, index) on native
2026-09-16 Breadcrumb rn: gap without margins, and row gap unspecified → root columnGap plus item-internal gap after separator; row gap none
2026-09-16 Breadcrumb rn: only fontSize reaches the Link's wrapping Text → wrapping Text overrides get fontSize, fontFamily, fontWeight, lineHeight
2026-09-16 Breadcrumb rn: ellipsis glyph unnamed and has no colour source → Icon ellipsis through Button's icon prop, Button colours it
2026-09-16 Breadcrumb rn: ellipsis Button size sm missing from rn notes → composition expand props variant ghost, size sm, iconOnly
2026-09-16 Breadcrumb rn: no container of revealed items to focus → setAccessibilityFocus on first revealed item's View (index 1)
2026-09-16 Breadcrumb rn: click link scenario doesn't say which link → first ancestor link, expects (items[0], 0)
2026-09-16 Breadcrumb lit: separator is a pseudo-element with no data-part → separatorColor styles item ::before; no part on web/Lit; rn Text Breadcrumb.separator
2026-09-16 Breadcrumb lit: itemColor on li but described for plain ancestors → set on item, reaches plain text; Link/current set own
2026-09-16 Breadcrumb lit: ellipsis button has no anatomy part → new anatomy part expand on a wrapper span (part+data-part), rn View Breadcrumb.expand
2026-09-16 Breadcrumb lit: first revealed item may have no href → first revealed link, else first revealed item via tabindex -1
2026-09-16 Breadcrumb lit: gap on both sides of separator with separator in item → list column gap plus item gap; wrapped line may start with separator
2026-09-16 Breadcrumb lit: ellipsis glyph described as three-dot glyph → system Icon ellipsis as Button leadingIcon
2026-09-16 Breadcrumb lit: navigate cancel via event or originalEvent → both cancel; preventDefault on navigate also prevents the click
2026-09-16 Breadcrumb lit: expanded reset when items changes unstated → stays expanded for the instance's life
2026-09-16 Breadcrumb lit: required items has no initial value → Lit starts items as []
2026-09-16 Breadcrumb web: Link data-part clashes with link part → span data-part link wraps Link; Link keeps anchor
2026-09-16 Breadcrumb web: itemColor part vs plain-ancestor description → set on li, reaches plain text; Link/current override
2026-09-16 Breadcrumb web: gap without margins, row gap unspecified → list column-gap plus li gap; row gap none
2026-09-16 Breadcrumb web: copy.current unused on web → not rendered on web/Lit; aria-current announces it
2026-09-16 Breadcrumb web: ellipsis glyph unnamed → Icon ellipsis
2026-09-16 Breadcrumb web: revealed item without href focus target → first revealed link, else first revealed li tabindex -1
2026-09-16 Breadcrumb web: empty-string href handling → counts as absent, plain text
2026-09-16 Breadcrumb web: onNavigate cancel only via preventDefault → returning false or preventDefault cancels
2026-09-16 Breadcrumb web: five items hide only a little → literal rule kept; five items hide the second and third
2026-09-16 Breadcrumb web: empty or single-item trail uncovered → empty list inside named landmark / lone current page, no dev warning
2026-09-16 Checkbox rn: Form value is boolean but prose says value when checked → Form collects boolean checked; value is native-form only; shared names aren't a multi-select
2026-09-16 Checkbox rn: accessibilityLabel is label only, yet required must be in name → label plus requiredIndicator, prefixed with the Fieldset legend
2026-09-16 Checkbox rn: who clears indeterminate, a prop with no event → a toggle clears the mixed indicator locally until the prop changes
2026-09-16 Checkbox rn: next checked value when toggling from indeterminate unspecified → toggling from mixed sets checked to !checked
2026-09-16 Checkbox rn: native focus ring geometry unspecified → focused control's border takes focusRing at focusRingWidth; box keeps its size
2026-09-16 Checkbox rn: pressedOverlay has no part → part control; native draws it as an overlay View inside the box
2026-09-16 Checkbox rn: row vertical padding to centre control in minTarget unbound → no padding; row is at least minTarget tall and centres its contents
2026-09-16 Checkbox rn: helperSize/fontFamily/lineHeight have no part → parts given; forwarded to description/errorMessage Text, and the label Text on native
2026-09-16 Checkbox rn: errorMessage placement and gap unspecified → below the Pressable, outside the hit area, separated by partGap
2026-09-16 Checkbox rn: RN has no invalid accessibility state → danger border plus announced error text; RN checks the text
2026-09-16 Checkbox rn: control hidden from accessibility, scenario assumes it's queryable → row is the one accessible element and RN tests check that
2026-09-16 Checkbox lit: controlled section contradicts Lit live checked property → property starts from attribute else defaultChecked, tracks toggles
2026-09-16 Checkbox lit: what ds-form collects is contradictory → boolean checked; native form gets checked ? value : null
2026-09-16 Checkbox lit: void input can't contain indicator Icon → box wrapper stacks input and indicator span with part/data-part indicator
2026-09-16 Checkbox lit: pressedOverlay has no part or CSS state → :active on unchecked, not-mixed, enabled control, color-mix over controlBackground
2026-09-16 Checkbox lit: helperSize/errorText/partGap have no part → parts given; Text props and forwards in composition; colours from tone
2026-09-16 Checkbox lit: copy.checked/unchecked/mixed unused on Lit → SwiftUI only; web/Lit/rn notes say unused
2026-09-16 Checkbox lit: is requiredIndicator part of the accessible name → yes on every platform, plain label text
2026-09-16 Checkbox lit: validationMessage precedence when invalid+required+unchecked → error, Form message, then copy.required if unchecked, else copy.invalid
2026-09-16 Checkbox lit: no Lit mechanism for Fieldset disabled → ds-fieldset sets disabled on direct data-ds-field children, plus formDisabledCallback
2026-09-16 Checkbox web: Form value model contradicts value multi-select → declared boolean model; value prop and When to use rewritten
2026-09-16 Checkbox web: indicator "inside the control" but input is void → wrapper box span; indicator span carries data-part indicator
2026-09-16 Checkbox web: ref on root wrapper vs input element → forwarded ref resolves to the <input>
2026-09-16 Checkbox web: indeterminate clearing has no controlled pair → local clear until indeterminate prop changes value
2026-09-16 Checkbox web: no React FieldsetContext for group disabled → Fieldset passes disabled prop to direct child fields
2026-09-16 Checkbox web: indicatorStroke hook declared but unread → locked, declares no hook on any platform; Icon applies it
2026-09-16 Checkbox web: pressedOverlay on checked/mixed boxes unspecified → unchecked, not-mixed, enabled only
2026-09-16 Checkbox web: copy.checked/unchecked/mixed unused on web → SwiftUI-only, web note says unused
2026-09-16 Checkbox web: requiredIndicator muted or smaller unstated → plain label text, same size and colour as the label
2026-09-16 Checkbox web: does the gap between control and label toggle → yes, whole row including gap
2026-09-16 Checkbox web: disabledOpacity target part unnamed → part control; dims control and label, not description or error
2026-09-16 Disclosure rn: inline chevron Icon conflicts with overrides.size from triggerFontSize → native non-inline Icon with overrides.size triggerFontSize; web/Lit inline Icon
2026-09-16 Disclosure rn: accessibilityHint listed but its content never stated → removed from rn props; would only repeat accessibilityState
2026-09-16 Disclosure rn: copy.expanded/collapsed have no stated use on native → SwiftUI-only; rn notes say unused
2026-09-16 Disclosure rn: disabled opacity on whole element conflicts with panel keeping state → disabled dims the trigger only
2026-09-16 Disclosure rn: hover binding says pressed but Pressable reports only pressed → RN onHoverIn/onHoverOut or pressed, suppressed while disabled
2026-09-16 Disclosure rn: string children cannot render in a View → component wraps string/number children in the package Text
2026-09-16 Disclosure rn: panelColor cannot reach arbitrary children on native → wrapped strings get it via Text tone; other children keep their own colour
2026-09-16 Disclosure rn: keyboard reason indistinguishable, controlled echo unstated → native press reports pointer; controlled only for uncaused changes; echoes not re-fired
2026-09-16 Disclosure rn: useReducedMotion resolves async so first rotation may animate → chevron snaps until useReducedMotion resolves
2026-09-16 Disclosure rn: disabled-trigger-stays-focusable untestable on RN → RN tests check accessibilityState.disabled, not focusability
2026-09-16 Disclosure rn: heading-level scenarios only check render on native → RN tests check render and the header role on the summary Text
2026-09-16 Disclosure lit: toggle detail documented as { open } but payload has reason → detail { open, reason } on every platform
2026-09-16 Disclosure lit: controlled echo of a user click unspecified → echo not re-fired; pending request clears at the next open change
2026-09-16 Disclosure lit: copy.expanded/collapsed unused on Lit → SwiftUI-only; web/Lit rely on aria-expanded
2026-09-16 Disclosure lit: icon binding has no part → part triggerIcon, a wrapper carrying colour and rotation around the Icon
2026-09-16 Disclosure lit: hover background has no transition binding → transition covers only the chevron; hover background change is instant
2026-09-16 Disclosure lit: RTL mirroring with open rotation unstated for Lit → [dir=rtl] scaleX(-1), plus rotate(90deg) when open, on web and Lit
2026-09-16 Disclosure lit: defaultOpen attribute name missing → default-open attribute, not reflected
2026-09-16 Disclosure web: ref target unclear when root is not interactive → ref resolves to the trigger <button> because Accordion needs it
2026-09-16 Disclosure web: notes say inline SVG, contradicting the Icon binding → system Icon chevron-right inline, aria-hidden, in the triggerIcon wrapper
2026-09-16 Disclosure web: icon binding lacks part; no size forward on web → part triggerIcon; inline Icon follows trigger font on web/Lit
2026-09-16 Disclosure web: focusRing/minTarget/disabledOpacity/transition have no part → first ones part trigger; transition part triggerIcon
2026-09-16 Disclosure web: hover binding says pressed but its state is only hover → :hover and :active, suppressed while disabled
2026-09-16 Disclosure web: web props base unspecified → props extend the button's attributes; rest goes to the trigger
2026-09-16 Disclosure web: controlled echo and mount firing unspecified → echo not re-fired, controlled only for uncaused changes, nothing on mount
2026-09-16 Disclosure web: disabled state assertion with aria-disabled unclear → aria-disabled="true", never the native attribute
2026-09-16 Disclosure web: focus-within undefined after focus leaves to non-focusable area → restore when inside the panel or on body after leaving it
2026-09-16 Disclosure web: renders-heading-level scenarios only say renders → scenarios check a heading of that level contains the trigger
2026-09-16 Fieldset rn: rn props list accessibilityRole but guidance says role prop → rn props list role; role="group", not accessibilityRole
2026-09-16 Fieldset rn: clone fallback kept though rn fields read FieldsetContext → RN/SwiftUI fields read FieldsetContext; no clone fallback
2026-09-16 Fieldset rn: description mapping to accessibilityHint unstated → description is the group View's accessibilityHint
2026-09-16 Fieldset rn: description/error Text size, helperSize/errorText have no part → description Text muted sm, error Text danger sm; parts given
2026-09-16 Fieldset rn: fontFamily/lineHeight have no part → part legend; reach the Texts only through overrides
2026-09-16 Fieldset rn: partGap has no part → part group, gap on the root
2026-09-16 Fieldset rn: Stack/Text take no testID for part hooks → plain Views carrying Fieldset.<part> testIDs
2026-09-16 Fieldset rn: requiredIndicator in group accessibilityLabel unstated → part of the accessible name on every platform
2026-09-16 Fieldset rn: examples give children as prose → descriptions and children strings name the concrete fields
2026-09-16 Fieldset rn: disabled scenario web-only, RN checks undocumented → RN checks legend text and toHaveAccessibleName
2026-09-16 Fieldset rn: non-field child gets no native label association → acceptable; the legend is read in order before it
2026-09-16 Fieldset lit: legend/helper sizes forwarded beyond "add no other forwards" → Text forwards list fontSize/fontWeight/fontFamily/lineHeight
2026-09-16 Fieldset lit: fieldsGap CSS hook cannot reach Stack → token path through Stack overrides.gap only; no --ds-stack-gap
2026-09-16 Fieldset lit: Text defaults need props beyond composition → composition props: legend default/md/medium/span, description muted/sm/span, error danger/sm/span
2026-09-16 Fieldset lit: disabledOpacity has no part → dims legend and description only
2026-09-16 Fieldset lit: helperSize no part, errorMessage plain element → errorMessage is a composed Text; helperSize via overrides
2026-09-16 Fieldset lit: error region always present or only while set → rendered only while error is set
2026-09-16 Fieldset lit: requiredIndicator in accessible name and styling unstated → inside legend, inherits legend Text, part of the name
2026-09-16 Fieldset lit: required indicator has no reactive source → direct data-ds-field children's required on slotchange plus attribute changes
2026-09-16 Fieldset lit: disabled propagation target "slotted ds-* fields" vague → disabled property on direct data-ds-field children, remembering which it set
2026-09-16 Fieldset lit: examples give children as prose, no date Input → children strings name each field; date range uses text Inputs
2026-09-16 Fieldset lit: legend name expectation web-only → [web, lit]
2026-09-16 Fieldset lit: disabled scenario web-only, no Lit test → [web, lit]
2026-09-16 Fieldset web: no data-part="fields" hook on the Stack → Fieldset-owned wrapper carries data-part fields
2026-09-16 Fieldset web: Text bindings forwarded despite "add no other forwards" → forwards listed for legend, description and error Texts
2026-09-16 Fieldset web: errorMessage Text in guidance but plain in parts → danger sm Text inside a role=alert wrapper
2026-09-16 Fieldset web: legendColor/descriptionText have no CSS hook → Text tones default/muted; no hook
2026-09-16 Fieldset web: disabledOpacity has no part → dims legend and description only
2026-09-16 Fieldset web: fragment children count as direct for required? → fragments flattened and count; other wrappers not inspected
2026-09-16 Fieldset web: FieldsetContext location and type unstated → web passes disabled to direct child fields; no React FieldsetContext
2026-09-16 Fieldset web: examples give children as prose → concrete children strings and descriptions
2026-09-16 Fieldset web: requiredIndicator in accessible name unstated → included in the group's accessible name
2026-09-16 Landmark rn: has-accessible-name needs a Default role that takes a label → Default story is role navigation, label "Main"
2026-09-16 Landmark rn: bare string example children cannot sit in a View → Landmark wraps string and number children in Text
2026-09-16 Landmark rn: no rn scenario checks role reaches the View → role, search and region scenarios check role/accessibilityRole/accessibilityLabel on rn
2026-09-16 Landmark rn: missing-label warning text unstated → warning text named; only the missing-label warning applies on rn
2026-09-16 Landmark lit: schema notes say ElementInternals, guidance says plain attributes → plain reflected role/aria-label attributes
2026-09-16 Landmark lit: reflect lists role but the property is landmark → landmark property reflects to role; label to aria-label
2026-09-16 Landmark lit: Default story role unstated, chose main → Default story is role navigation with label "Main"
2026-09-16 Landmark lit: children are light DOM, no slot to render → no <slot>; example strings render in Text
2026-09-16 Landmark lit: region part cannot carry part/data-part → host's data-ds="Landmark" is the only hook
2026-09-16 Landmark lit: no role attribute behavior unstated → no role exposed, development warning
2026-09-16 Landmark web: SidePanel passes className/style through Landmark → Landmark takes no className/style; composites wrap their own element
2026-09-16 Landmark web: which naming sources count for the warnings → label (empty is absent) and a composite's aria-labelledby text
2026-09-16 Landmark web: which instance warns and how often → later landmark in document order, on appear or change
2026-09-16 Landmark web: label on banner/main/contentinfo dropped, warned or rendered → not rendered, with a development warning
2026-09-16 Landmark web: role explicitness when as equals the default element → explicit on header/footer, differing as, non-implying element
2026-09-16 Landmark web: Default role main makes odd renders-as pairs → Default story is role navigation with label "Main"
2026-09-16 Landmark web: unlabelled region, and as section with another role → plain <section> plus warning; role emitted when not implied
2026-09-16 Landmark web: empty-string label not covered → counts as absent
2026-09-16 Meter rn: no valueWeight binding, value text weight unspecified → Text's regular, not a binding
2026-09-16 Meter rn: valueColor and valueSize have no part → part valueText; Text tone muted and a fontSize forward
2026-09-16 Meter rn: accessibilityValue.text omitted when no valueText → always valueText, else the same formatted percentage
2026-09-16 Meter rn: fill behaviour before first layout unstated → snaps with no animation on first layout and resize
2026-09-16 Meter lit: labelGap bound to label but it belongs to the row → new header anatomy part; labelGap on header
2026-09-16 Meter lit: seven bindings have no part → radius track, value* valueText, partGap container, fonts forwarded, transition fill
2026-09-16 Meter lit: required value and label have no Lit starting value → value 0, label '', no warning
2026-09-16 Meter lit: aria-valuetext when valueText is omitted → always set, to valueText or the rounded percentage
2026-09-16 Meter lit: percentage string has no locale or format rule → Intl.NumberFormat percent, maximumFractionDigits 0
2026-09-16 Meter lit: fill width from rounded or exact percentage → exact fraction for width; rounding only for text
2026-09-16 Meter lit: missing or unparseable min/max attributes → fall back to 0 and 100
2026-09-16 Meter lit: label Text props unstated, value a plain span → both Text with props and forwards
2026-09-16 Meter lit: hideValue attribute name and reflection → hide-value, not reflected
2026-09-16 Meter lit: can aria-labelledby point at a composed ds-text host → yes, inside the same shadow root
2026-09-16 Meter web: labelGap on label, no part for the label row → header part, flex row with gap labelGap
2026-09-16 Meter web: seven bindings have no part → part per binding; fonts reach Texts only through forwards
2026-09-16 Meter web: value as a plain span conflicts with composition rules → value is Text span sm muted
2026-09-16 Meter web: aria-valuetext when valueText is omitted → always set; same string on every platform
2026-09-16 Meter web: what text shows when max <= min → empty track, shows and announces 0%
2026-09-16 Meter web: role element vs data-ds element unstated → role/aria-value* on the track, data-ds on the root
2026-09-16 Meter web: notes say transition width → inline-size for fill size and transition
2026-09-16 RadioGroup rn: standalone required group ever renders copy.required? → only once marked invalid, after error and Form message
2026-09-16 RadioGroup rn: where copy.position goes on RN → each radio's accessibilityValue text; not rendered on web/Lit
2026-09-16 RadioGroup rn: how label and description join in accessibilityLabel → `${label}, ${description}`
2026-09-16 RadioGroup rn: group accessibilityLabel with or without required indicator → legend including requiredIndicator, Fieldset legend prefixed
2026-09-16 RadioGroup rn: root testID vs a separate group hook → root is the group part, testID RadioGroup
2026-09-16 RadioGroup rn: whether the native dot View carries a hook → hook only where it is a real node; RN RadioGroup.radioIndicator
2026-09-16 RadioGroup rn: focus-visible part not named → focusRing on radio replaces the control's border
2026-09-16 RadioGroup rn: Default story args and selection unspecified → Default is shipping-method with nothing selected
2026-09-16 RadioGroup rn: disabled option opacity stacking with disabled group → rows dim once, no stacking
2026-09-16 RadioGroup rn: option row padding and label–description gap unbound → optionPaddingBlock and optionTextGap on space.1
2026-09-16 RadioGroup rn: disabled/invalid scenarios, what RN asserts → onChange not firing, copy text, unchecked state
2026-09-16 RadioGroup lit: shadow part names kebab-case vs verbatim → anatomy names verbatim camelCase
2026-09-16 RadioGroup lit: copy.position has no web/Lit use → not rendered on web/Lit; native only
2026-09-16 RadioGroup lit: groupId for option ids undefined in shadow root → `${name || 'radio-group'}-${value}`
2026-09-16 RadioGroup lit: label–description spacing unbound → optionTextGap space.1
2026-09-16 RadioGroup lit: delegatesFocus focuses first radio, not the checked one → host focus() targets checked, else first enabled
2026-09-16 RadioGroup lit: arrow keys and Space in a disabled group → prevented on the fieldset
2026-09-16 RadioGroup lit: aria-invalid on the fieldset or each radio → fieldset only (web and Lit)
2026-09-16 RadioGroup lit: disabledOpacity target for a disabled group → option rows only
2026-09-16 RadioGroup lit: disabled-group-is-inert state check web-only → [web, lit]
2026-09-16 RadioGroup web: no FieldsetContext in React → web gets the disabled prop Fieldset passes
2026-09-16 RadioGroup web: precedence for display or validate() → display error, Form message, then while invalid; validate() required then invalid
2026-09-16 RadioGroup web: copy.position unused on web → not rendered on web/Lit
2026-09-16 RadioGroup web: radioIndicator as ::after only or also ::before → either pseudo-element, no hook
2026-09-16 RadioGroup web: descriptionText/errorText hooks never read → composition Text tones; no own hook; sizes forwarded
2026-09-16 RadioGroup web: whether the root carries data-part group → fieldset carries data-part group
2026-09-16 RadioGroup web: validate blur vs change for a radio group → blur is group focus-out; change on each change
2026-09-16 Switch rn: Overrides list track/thumb geometry the native Switch draws → omitted from RN overridable union; overridable on web/Lit/SwiftUI
2026-09-16 Switch rn: thumb part has no view, track testID placement → no thumb view or testID on RN; Switch.track is the native Switch
2026-09-16 Switch rn: disabled says focusable but native Switch cannot focus → stated limit; accessibilityState announces disabled
2026-09-16 Switch rn: click track impossible on a native Switch → RN tests fire valueChange on the switch role, press on label/description
2026-09-16 Switch rn: focus ring and minTarget cannot be drawn natively → OS focus indicator; minTarget is the row's minHeight
2026-09-16 Switch rn: Fieldset disabled and legend prefix only in prose → FieldsetContext carries disabled and legend, '<legend>, <label>'
2026-09-16 Switch rn: no copy for the Fieldset prefix separator → ', ' is fixed punctuation, not copy
2026-09-16 Switch rn: controlled prop change and no-op press firing unstated → neither fires onChange; nothing on mount
2026-09-16 Switch rn: row padding and padded track frame unspecified → no row padding, no frame; only minHeight minTarget
2026-09-16 Switch lit: Controlled-state contract contradicts Lit live checked → Lit carve-out: live property, no controlled mode
2026-09-16 Switch lit: guidance reflects checked while notes say not reflected → checked not reflected
2026-09-16 Switch lit: pseudo-element thumb has no hook, rendered real span → web and Lit both draw thumb as input ::before, no hook
2026-09-16 Switch lit: DsFormField required/error/validity for a never-validating field → required false, empty message, always valid, no error
2026-09-16 Switch lit: discovery context undefined for Lit → host sets data-ds-field="change"
2026-09-16 Switch lit: radius has no part → part track; applies to track and thumb
2026-09-16 Switch lit: gap/partGap/helperSize/fontFamily/lineHeight lack parts → parts assigned; description Text sm muted forwards
2026-09-16 Switch lit: track alignment with wrapping label or description → top of row, centred on label first line
2026-09-16 Switch lit: FieldsetContext has no Lit mechanism → ds-fieldset sets disabled on data-ds-field children, plus formDisabledCallback
2026-09-16 Switch lit: name not reflected so native form misses it → name reflected
2026-09-16 Switch web: no React FieldsetContext → Fieldset passes disabled to direct child fields
2026-09-16 Switch web: description Text forwards undeclared → forwards fontSize/fontFamily/lineHeight; tone muted, no hook
2026-09-16 Switch web: thumb pseudo-element hookless not stated intentional → input ::before with no hook on web and Lit, by design
2026-09-16 Switch web: disabled Switch form submission unstated → registered like Checkbox; Form's disabled-field rule applies
2026-09-16 Switch web: disabledOpacity has no part → part track; dims track, label and description
2026-09-16 Switch web: reduced motion covers track colour change? → both thumb travel and colour transition removed
2026-09-16 Switch web: minTarget row sizing and gap clicks → min-block-size comfortable target on full-width row; gap clicks toggle
2026-09-16 Switch web: controlled input vs aria-checked mirroring → input uncontrolled for native state; aria-checked mirrored
2026-09-16 FocusScope rn: platform notes and RN guidance disagree on autoFocus target → guidance fixed: wrapper for first, last and container
2026-09-16 FocusScope rn: returnFocusTo shape names View, not an instance type → per-platform types stated; rn RefObject<ViewInstance | null>
2026-09-16 FocusScope rn: accessibilityViewIsModal dependence on active unstated → trapped && active
2026-09-16 FocusScope rn: autoFocus/restore rerun when props change after mount? → once on mount and unmount only
2026-09-16 FocusScope rn: example children are prose, not content → TOOLING
2026-09-16 FocusScope rn: Default story has no children → Behavior names Default: Text plus Cancel/Continue Buttons
2026-09-16 FocusScope rn: role-is-null scenario with two RN role props → rn notes: no role, accessibilityRole or accessibilityLabel
2026-09-16 FocusScope rn: Tab wrap rules untestable on native and rnw → wrap keyboard rules scoped to web, lit, swiftui
2026-09-16 FocusScope rn: ref on the wrapper undeclared → wrapper is root, exposed through ref
2026-09-16 FocusScope lit: returnFocusTo has no Lit RefObject → HTMLElement | Ref<HTMLElement> property
2026-09-16 FocusScope lit: restoreFocus true-default lacks negated attribute; autoFocus attribute unnamed → no-restore-focus (not reflected); auto-focus
2026-09-16 FocusScope lit: delegatesFocus rule contradicts wrapper-is-not-focusable → stated exception: no delegatesFocus
2026-09-16 FocusScope lit: which element carries the scope part on Lit → the tabindex=-1 shadow anchor
2026-09-16 FocusScope lit: sentinels redirect to opposite edge vs continue direction → guidance fixed: continue direction of travel
2026-09-16 FocusScope lit: sentinels when untrapped or inactive unstated → tabindex=0 only while trapped, active and top
2026-09-16 FocusScope lit: reactivated scope ordering in nesting stack unstated → moves to top; only active scopes count
2026-09-16 FocusScope lit: autoFocus before slotted children render internals → waits for slotted updateComplete, folded into scope's
2026-09-16 FocusScope lit: boolean-false states need stories? → TOOLING
2026-09-16 FocusScope lit: disabled undefined for the walker → :disabled, fieldset[disabled], inert; aria-disabled stays in
2026-09-16 FocusScope lit: overlays bound defaults-true booleans as attributes → composers set trapped/active/restoreFocus as properties
2026-09-16 FocusScope web: static tabindex=-1 attribute vs conditional guidance → tabindex=-1 only for autoFocus container
2026-09-16 FocusScope web: sentinel direction contradiction → continue direction of travel (same fold as lit)
2026-09-16 FocusScope web: returnFocusTo names an RN type → RefObject<HTMLElement | null> on web
2026-09-16 FocusScope web: sentinels rendered when untrapped? → tabindex=-1 unless trapped, active and top
2026-09-16 FocusScope web: sentinel and pull-back while paused → do nothing unless trapped, active and top
2026-09-16 FocusScope web: pull-back with no target → focus left where it went; dev warning covers it
2026-09-16 FocusScope web: same-commit nesting order of scopes → order follows tree nesting via context parent link
2026-09-16 FocusScope web: aria-disabled in walker unspecified → aria-disabled stays focusable and included
2026-09-16 FocusScope web: example children are prose descriptions → TOOLING
2026-09-16 FocusScope web: scope data-part vs composing overlay's data-part → FocusScope's own part wins; composer uses own wrapper
2026-09-16 FocusScope web: Shift+Tab from the container wrapper unspecified → Tab to first; Shift+Tab wraps to last, fires backward
2026-09-16 FocusScope web: Dialog closeButton data-part overwritten by Button → CODE
2026-09-16 Tooltip rn: native flip contradicts between Behavior and rn notes → Behavior fixed: flips via measureInWindow; cross axis clamped
2026-09-16 Tooltip rn: Escape on controlled open with no change event → hides until the open prop next changes
2026-09-16 Tooltip rn: warm window loop in delay vs base constant → delay text now says base, the warmWindow constant
2026-09-16 Tooltip rn: long-press end while focus/hover remains on rnw → visible while press, hover, bubble hover or focus
2026-09-16 Tooltip rn: no portal on native; clipping by ancestors → inline absolute View, zIndex layer.toast; clipping stated limit
2026-09-16 Tooltip rn: hoverable bubble event API on rnw unnamed → onPointerEnter/Leave, pointerEvents auto web, none native
2026-09-16 Tooltip rn: rn has no visually-hidden tooltip copy → bubble hidden from accessibility; hint or label carries text
2026-09-16 Tooltip rn: example glyphs bold/italic/copy missing from icon table → examples now use plus, grid, external
2026-09-16 Tooltip rn: example children lack verbatim labels → labels "Items", "Grid view", "View" given verbatim
2026-09-16 Tooltip rn: ref undeclared, package rule adds root ref → Tooltip exposes no ref; caller refs its child
2026-09-16 Tooltip rn: Default story describes=false vs schema default true → Default uses defaults: hint on "Items" Button
2026-09-16 Tooltip lit: describedby on ds-button host misses inner button → aria-label/aria-description on host; system triggers forward (CODE)
2026-09-16 Tooltip lit: warm window loop vs base → base (same fold as rn)
2026-09-16 Tooltip lit: controlled open cannot report Escape → Escape hides until open next changes
2026-09-16 Tooltip lit: hover-opened tooltip Escape while focus elsewhere → document-level Escape listener while visible
2026-09-16 Tooltip lit: Text part has no props or forwards → composition: Text span sm, forwards fontFamily/fontSize/lineHeight
2026-09-16 Tooltip lit: examples name missing glyphs → examples changed to existing glyphs
2026-09-16 Tooltip lit: Toolbar roving through a ds-tooltip wrapper unverified → Tooltip adds no tab stop or role; Toolbar sees through
2026-09-16 Tooltip lit: popup root via data-ds does not map to Lit → host carries data-ds; bubble data-part popup
2026-09-16 Tooltip lit: pointer:coarse vs touch detection disagree → pointerType touch on pointerenter; focus still shows
2026-09-16 Tooltip lit: reduced motion effect on delays unstated → delays kept; only fade removed (swiftui note aligned)
2026-09-16 Tooltip web: web note role=tooltip div vs hidden span → web notes fixed: hidden span has id/role, bubble aria-hidden
2026-09-16 Tooltip web: closed tooltip has no data-ds node for renders → renders finds the always-present hidden role=tooltip span
2026-09-16 Tooltip web: Escape on controlled open → hides until open next changes (same fold)
2026-09-16 Tooltip web: warm window loop vs base → base (same fold)
2026-09-16 Tooltip web: warm window skips delay for default tooltips too? → yes; none is always instant
2026-09-16 Tooltip web: overlay.layer tooltip vs layer.toast binding → category name; its token is layer.toast
2026-09-16 Tooltip web: font bindings reach Text without declared forward → composition forwards to Text overrides
2026-09-16 Tooltip web: maxWidth override replaces base or product? → override replaces base; × 3 stays
2026-09-16 Tooltip web: how logic reads timing token expressions → getComputedStyle when needed; unresolved is 0
2026-09-16 Tooltip web: Escape inside a Dialog closes Dialog too? → capture-phase stop while visible; second Escape closes Dialog
2026-09-16 Tooltip web: examples name missing glyphs → examples changed (same fold)
2026-09-16 Tooltip web: enter fade only, exit motion unspecified → exit is opacity fade-out, none under reduced motion
2026-09-16 Toast rn: no core safe-area inset API → no safe-area term on rn; app pads the provider
2026-09-16 Toast rn: region position on phones vs wide unclear → left/right/bottom regionInset, centered at every width
2026-09-16 Toast rn: toast() promise and programmatic dismiss unnamed → Promise<{ reason }>, dismiss(toastId?) with new reason programmatic
2026-09-16 Toast rn: escape reason on native → kept in type, never fires
2026-09-16 Toast rn: escape-dismiss unmet on native → dismiss button always shown for persistent toasts
2026-09-16 Toast rn: page hidden has no native meaning → AppState not active pauses timers
2026-09-16 Toast rn: focus pause impossible, Button exposes no focus events → native pauses on touch and backgrounding only
2026-09-16 Toast rn: dev warning fires for default duration → warns only when duration passed explicitly
2026-09-16 Toast rn: getByRole alert unusable on non-accessible root → TOOLING
2026-09-16 Toast rn: Button size/iconOnly only in prose → composition: size sm on both, iconOnly on dismiss
2026-09-16 Toast rn: parts contract blocks testID on Button → parts are wrapping Views carrying testIDs
2026-09-16 Toast rn: iOS announcement priority unspecified → queue true for polite, interrupting for danger
2026-09-16 Toast rn: max three stack limit is a prose literal → fixed count, not a token
2026-09-16 Toast rn: enter rise distance has no token → new binding enterOffset: space.2
2026-09-16 Toast lit: stackGap/regionInset/layer overridable on toast or region → region's own overrides
2026-09-16 Toast lit: composition omits button label, iconOnly, size → composition props; labels actionLabel and copy.dismissLabel in Behavior
2026-09-16 Toast lit: tone and close glyph names only in prose → icon binding names Icon name={tone}; Behavior names close
2026-09-16 Toast lit: locked inverse text color on Text without inverse tone → re-scope foreground as Tooltip; part message
2026-09-16 Toast lit: default duration triggers override dev warning → warns only on explicit assignment
2026-09-16 Toast lit: motion loop resolving to zero gives zero timer → non-positive or unresolved loop means persistent
2026-09-16 Toast lit: Escape focus return without F6 → element focus came from, else next focusable after region
2026-09-16 Toast lit: onDismiss before or after exit transition/removal → after exit, just before removal; immediate under reduced motion
2026-09-16 Toast lit: ElementInternals roles vs plain-attribute convention → plain role/aria-label/aria-live attributes
2026-09-16 Toast lit: ToastOptions shape and id vs toastId → options listed; Behavior now says toastId
2026-09-16 Toast lit: region breakpoint has no token → layout.maxWidth.content resolved px, literal-ok like Container
2026-09-16 Toast web: region bindings overridable where → region's own overrides (same fold)
2026-09-16 Toast web: message Text inverse color and font forwards → re-scope foreground; composition forwards font bindings
2026-09-16 Toast web: composition omits size sm from notes → size sm added to composition
2026-09-16 Toast web: Button overwrites passed data-part → parts on toast-owned wrappers
2026-09-16 Toast web: interpolated icon color on Icon without forward → composition forwards icon to Icon color
2026-09-16 Toast web: unresolvable motion token duration behavior → persistent (same fold)
2026-09-16 Toast web: promise yes, programmatic dismiss missing → dismiss(toastId) and dismiss() with reason programmatic
2026-09-16 Toast web: toastId meaning on a directly rendered Toast → accepted, no effect, never DOM id
2026-09-16 Toast web: focus return target without F6 → same rule as lit
2026-09-16 Toast web: dev warning on default duration; action means actionLabel → explicit only; text now says actionLabel
2026-09-16 Toast web: onDismiss timing against exit animation → after exit (same fold)
2026-09-16 Toast web: breakpoint token and safe-area inset → content maxWidth px literal-ok; env(safe-area-inset-bottom) web and Lit
2026-09-16 Toast web: Keyboard story toasts persist in module store → dismiss() clears all; stories call it on cleanup
2026-09-16 Dialog rn: inset has no forward to body Box → body forwards inset to Box paddingBlock/paddingInline; header and footer wrapper pad themselves
2026-09-16 Dialog rn: hideHeading with initialFocus title has no RN focus target → Heading not rendered; accessibilityLabel stays the name; title focus goes to the surface View
2026-09-16 Dialog rn: iOS has no hardware Escape → surface View handles onAccessibilityEscape as onClose escape, even when not dismissible
2026-09-16 Dialog rn: rename-project footer order contradicts primary-first guidance → examples say 'Rename and Cancel Buttons', 'Send invites and Cancel Buttons'
2026-09-16 Dialog rn: md/lg widths not overridable, widthSm scaling unclear → new bindings widthMd (content × 0.75) and widthLg; widthSm is sm only
2026-09-16 Dialog rn: no ref target for Modal-rooted Dialog → rn notes: no ref; callers ref their trigger
2026-09-16 Dialog rn: layer has no RN meaning inside Modal → layer kept as hook; no effect in top layer or native Modal; applies to fixed fallback
2026-09-16 Dialog lit: open required but contract says uncontrolled when omitted → open is controlled only, no initial-state prop
2026-09-16 Dialog lit: ::backdrop scrim has no data-part hook → full-viewport <dialog>, transparent ::backdrop, real data-part scrim element takes the click
2026-09-16 Dialog lit: descriptionGap sits on an unnamed titles group → descriptionGap part header; flex gap of a Dialog-owned titles group
2026-09-16 Dialog lit: footerGap CSS hook can't reach the footer Stack → footer wrapper sets Stack's --ds-stack-gap from --ds-dialog-footer-gap; either route works
2026-09-16 Dialog lit: composed Stack/Heading/Button props not listed → composition props: heading level 2; closeButton ghost sm iconOnly; footer horizontal justify end
2026-09-16 Dialog lit: initialFocus first fallback when body has no focusable → body, then footer, then close button, then heading (tabindex -1)
2026-09-16 Dialog lit: hideHeading hiding and focus ring styled on composed host → heading part is a Dialog-owned wrapper that hides and draws the ring; focusRing part heading
2026-09-16 Dialog lit: part nesting order unclear → Behavior: scrim beside FocusScope; FocusScope wraps surface; surface holds header, body, footer
2026-09-16 Dialog lit: light-DOM method="dialog" form has no <dialog> ancestor → host submit listener prevents default and fires close with action
2026-09-16 Dialog lit: Chromium non-cancelable cancel closes the dialog anyway → report escape, then showModal() again and refocus if open is still true
2026-09-16 Dialog lit: layer has no effect in the top layer → (same fold as rn layer)
2026-09-16 Dialog lit: 'renders nothing' has no Lit meaning → closed and not animating out, the shadow root is empty; null on web; no Modal content on rn
2026-09-16 Dialog web: Controlled state says uncontrolled, schema says required → (same fold as lit open)
2026-09-16 Dialog web: whether the Default story is open → Default is open with rename-project's args; open stories use a wrapper owning open
2026-09-16 Dialog web: inset has no forward to body Box → (same fold as rn inset)
2026-09-16 Dialog web: footerGap binding and CSS hook disagree → (same fold as lit footerGap)
2026-09-16 Dialog web: heading, closeButton, footer parts live on wrappers → those three are Dialog-owned wrappers; body and description carry data-part themselves
2026-09-16 Dialog web: initialFocus first fallback skips the footer → (same fold as lit initialFocus)
2026-09-16 Dialog web: cancel preventDefault 'when not dismissible' vs 'always' → always, since the consumer owns open
2026-09-16 Dialog web: ::backdrop scrim fade relies on custom props inheriting → (same fold as lit scrim; real element fades with the surface)
2026-09-16 Dialog web: onOpened timing with no transition → fires on the next frame after focus moves in
2026-09-16 Dialog web: md/lg width formula and no hooks → (same fold as rn widths)
2026-09-16 AlertDialog rn: which view gets a composed part's testID → each composed part is a wrapping View with testID AlertDialog.<part>
2026-09-16 AlertDialog rn: which view is the root inside a Modal → AlertDialog on the outermost View inside the Modal, AlertDialog.surface on the bordered View
2026-09-16 AlertDialog rn: focusScope has no hook and no props → composition props trapped, restoreFocus; rn autoFocus none (heading by hand); web autoFocus first
2026-09-16 AlertDialog rn: does the overlay expose a ref → no ref on rn; callers ref their trigger
2026-09-16 AlertDialog rn: copy scenario doesn't say where the label is read → text and accessible name of the Button inside cancelButton (lit same fold)
2026-09-16 AlertDialog rn: Default story duplicates DeleteFiles → Default is open with the delete-files args; the repeat is expected
2026-09-16 AlertDialog rn: scrim test passes against a plain View → scrim is a plain View with testID and no press handler; a Pressable breaks the contract
2026-09-16 AlertDialog rn: rn notes don't say the icon is decorative → decorative; Icon unlabelled and its wrapper hidden from accessibility
2026-09-16 AlertDialog rn: exit easing not stated → enter easing standard, exit easing exit, instant under reduced motion (lit, web same fold)
2026-09-16 AlertDialog rn: rise offset and 90% maxHeight have no binding → enter names translateY space.2; new gutter binding caps height at viewport − 2 × gutter
2026-09-16 AlertDialog lit: confirmDisabled claims Button is unfocusable → focusable-but-inert on every platform, still the last Tab stop (web same fold)
2026-09-16 AlertDialog lit: Keyboard story rule needs three focusables, dialog has two → Cancel and Confirm only; the three-focusable rule does not apply (web same fold)
2026-09-16 AlertDialog lit: overlay.dismiss lists close-button but there is none → close-button is the category name for Cancel, reported as cancel
2026-09-16 AlertDialog lit: notes say "title" but the prop is heading → Lit notes say heading
2026-09-16 AlertDialog lit: locked icon color has no Icon forward → composition forwards icon to Icon color, as Alert and Toast (web same fold)
2026-09-16 AlertDialog lit: Heading size and description tone unspecified → Heading level 2 default size; description Text tone muted default size (web same fold)
2026-09-16 AlertDialog lit: Button size for Cancel/Confirm unspecified → size md on both, Cancel variant secondary (web same fold)
2026-09-16 AlertDialog lit: width has no narrow-viewport rule → min(width, viewport − 2 × gutter) through the new gutter binding
2026-09-16 AlertDialog lit: layer has no effect in the top layer → no effect in top layer or native Modal; applies to the fixed fallback
2026-09-16 AlertDialog lit: iconGap bound to icon, which cannot own a gap → iconGap and partGap part surface: row gap and column gap (web same fold)
2026-09-16 AlertDialog web: scrim is ::backdrop and can't carry data-part → scrim has no hook on web; composed parts on AlertDialog-owned wrappers
2026-09-16 AlertDialog web: can consumers override role → role fixed to alertdialog, not accepted from the consumer
2026-09-16 AlertDialog web: swiftui notes cite nonexistent destructive prop → swiftui: initial focus on the cancel Button whatever the tone
2026-09-16 Menu rn: anchor type doesn't compile under RN → anchor typed per platform: web RefObject<HTMLElement | null>, Lit element property, rn host View ref
2026-09-16 Menu rn: focus-out listed but native has no focus signal → new reasons tab-out and focus-out; neither fires on native
2026-09-16 Menu rn: modal false conflicts with native Modal → non-modal means backdrop tap closes and focus is not trapped
2026-09-16 Menu rn: groups both dividers-with-labels and flattened → flattened: group labels, separators and shortcut hints dropped
2026-09-16 Menu rn: phone/tablet comparison unstated → new locked phoneBreakpoint (layout.maxWidth.prose); width <= token is phone
2026-09-16 Menu rn: Escape path on native unspecified → onRequestClose closes with escape; setAccessibilityFocus back to the trigger
2026-09-16 Menu rn: no testable trigger part; list vs popup → wrapping View Menu.trigger; popup View Menu.popup and ScrollView Menu.list
2026-09-16 Menu rn: no separator thickness or groupLabel padding → borderWidth is separator thickness; item paddings pad groupLabel
2026-09-16 Menu rn: hover isn't in Pressable's style callback → onHoverIn/onHoverOut; hover, focus and press share the highlight
2026-09-16 Menu rn: enter rise direction unstated → slides from the trigger side, motion.easing.standard
2026-09-16 Menu rn: Keyboard story open with nothing to close it → open stories use a wrapper owning open; no defaultOpen
2026-09-16 Menu lit: ds-button can't take aria-haspopup/aria-controls → Lit notes waive both; trigger exposes expanded only (Button haspopup → CODE)
2026-09-16 Menu lit: no reason for Tab, focus loss or window blur → (same fold as rn) tab-out and focus-out
2026-09-16 Menu lit: controlled in fires but never raised → changing open fires nothing; reason exists for forwarding
2026-09-16 Menu lit: Keyboard story controlled, no defaultOpen → (same fold as rn)
2026-09-16 Menu lit: does focus restore wait for the open change → controlled menu hides and restores focus only when open becomes false
2026-09-16 Menu lit: anchor has no Lit type → (same fold as rn)
2026-09-16 Menu lit: popup/list one node only in web notes → Lit: one role=menu element, data-part popup, part "popup list"
2026-09-16 Menu lit: many bindings name no part → part popup on surface bindings; itemShortcut and item parts on the rest
2026-09-16 Menu lit: overlay.layer popover vs layer.dropdown → layer is z-index for the fixed fallback only
2026-09-16 Menu lit: no groupLabel padding binding → (same fold as rn)
2026-09-16 Menu lit: popupOffset with flip → gap on the side facing the trigger; flip includes it and keeps it on the new side
2026-09-16 Menu lit: nested groups/separators in a group, warn? → dropped, no development warning
2026-09-16 Menu lit: which dev warnings → iconOnly + none is the only warning
2026-09-16 Menu web: onOpenChange object vs positional → positional (open, reason); Lit detail { open, reason }
2026-09-16 Menu web: no reason for Tab, focus-out or window blur → (same fold as lit)
2026-09-16 Menu web: Shift+Tab rule contradicts itself → Tab to the element after the trigger, Shift+Tab before it
2026-09-16 Menu web: hooks on root don't reach the portaled popup → hooks and inline overrides go on the popup
2026-09-16 Menu web: minWidth override vs computed → override replaces the base; × 2.5 stays
2026-09-16 Menu web: Button overwrites trigger data-part → Menu-owned span data-part trigger wraps the Button
2026-09-16 Menu web: iconOnly shows only leadingIcon → iconOnly glyph is leadingIcon, else trailingIcon
2026-09-16 Menu web: root declared button, anchor mode has no trigger → element div in both modes; ref is the popup, null while closed
2026-09-16 Menu web: window blur close not in overlay.dismiss → (same fold) window blur reports focus-out
2026-09-16 Menu web: enter rise has no binding → new enterDistance binding (space.1)
2026-09-16 Menu web: separators inside groups → (same fold as lit)
2026-09-16 Popover rn: phone/tablet split had no breakpoint → new locked breakpoint (layout.maxWidth.prose); rn width <= token is phone
2026-09-16 Popover rn: BottomSheet dismissible/modal differ → phone sheet always dismissible and modal; Popover's props have no effect there
2026-09-16 Popover rn: BottomSheet reasons don't map → scrim/drag report outside; action never raised
2026-09-16 Popover rn: headingLevel ignored on phones, empty sheet title → no effect on phones; title from heading, trigger accessibleName, label; dev warning if empty
2026-09-16 Popover rn: which overrides forward to BottomSheet → same-named bindings except maxWidth; the rest have no effect
2026-09-16 Popover rn: panel named by trigger can't read native text → trigger's accessibleName, else string label
2026-09-16 Popover rn: trigger content type vs single element → typed React.ReactElement on web and rn
2026-09-16 Popover rn: inset/partGap have no part, header gap unbound → inset pads the panel; partGap header-to-body and heading-to-close-button
2026-09-16 Popover rn: close button variant/size, heading-less header → composition ghost sm iconOnly close; button at the header's inline end
2026-09-16 Popover rn: modal true meaning on native → transparent backdrop, press does nothing, FocusScope trapped
2026-09-16 Popover rn: arrow color/border unspecified → rotated square, surface fill, border/borderWidth outer edges, centered
2026-09-16 Popover rn: modal-Escape scenario web/lit only → Escape is onRequestClose reported as escape; no native test key
2026-09-16 Popover lit: Shift+Tab reason unspecified → tab-out covers both directions
2026-09-16 Popover lit: focus-out listed but no focusout listener → no focusout listener anywhere; Tab handlers report tab-out
2026-09-16 Popover lit: Keyboard story open true is controlled → open stories use a wrapper owning open; uncontrolled starts closed
2026-09-16 Popover lit: Tab-out relies on synchronous consumer close → prevent default and focus the next focusable after the host without waiting
2026-09-16 Popover lit: composition lists no child props → FocusScope trapped←modal, autoFocus none, restoreFocus false; Heading level; Button props
2026-09-16 Popover lit: does the close button count as first control → body focusable, close button, heading (tabindex -1), panel
2026-09-16 Popover lit: aria-expanded ignored on ds-button host → set the trigger's expanded property when it has one
2026-09-16 Popover lit: reading a custom-element trigger's name → aria-label, accessibleName, label, textContent
2026-09-16 Popover lit: date-picker-panel example nests an overlay → quick-pick date Buttons under a date Button
2026-09-16 Popover lit: enter slide distance hard-wired → new enterDistance binding (space.1)
2026-09-16 Popover lit: close button clearance on unbound size.target.min → header row with partGap, no reserved padding
2026-09-16 Popover lit: arrow fill/border/centering → (same fold as rn)
2026-09-16 Popover lit: has-accessible-name runs on closed Default → Default is open with filter-panel args
2026-09-16 Popover web: focusout contradiction → (same fold as lit)
2026-09-16 Popover web: autoFocus first would land on Close → FocusScope autoFocus none; Behavior focus order
2026-09-16 Popover web: restoreFocus conflicts with outside-press/tab-out → restoreFocus false; trigger/Escape/close-button return focus at once
2026-09-16 Popover web: Shift+Tab reason → (same fold as lit)
2026-09-16 Popover web: Tab-out when trigger is last on page → focus trigger without preventDefault; Tab continues natively
2026-09-16 Popover web: root/data-ds/ref for a closed overlay → on the panel, which exists while open or closing; ref null while closed
2026-09-16 Popover web: has-accessible-name on closed Default → (same fold as lit)
2026-09-16 Popover web: modal <dialog> exit transition mechanism → allow-discrete, @starting-style, unmount on transitionend or duration timer
2026-09-16 Popover web: offset mechanism unstated → margin on the trigger-facing side, read by flip; rn adds to measured position
2026-09-16 Popover web: overlay layer popover vs layer.dropdown → popover is the category; binding applies to fixed fallback and rn anchor
2026-09-16 Popover web: data-side unnamed → data-side is the resolved physical side for arrow and slide
2026-09-16 Popover web: inset/partGap element unspecified → (same fold as rn)
2026-09-16 Popover web: modal scroll lock/dimming → locks scroll like Dialog, no scrim anywhere, outside press does nothing
2026-09-16 Popover web: date-picker-panel needs a calendar → (same fold as lit)
2026-09-16 Popover web: no help glyph for contextual-help → icon-only Help Button with info Icon
2026-09-16 Popover web: Keyboard story needs a wrapper to close → (same fold as lit)
2026-09-16 BottomSheet rn: required open vs uncontrolled → controlled only; open stories use a wrapper owning open
2026-09-16 BottomSheet rn: reason action has no mechanism → never raised by the sheet; consumer handler, Lit method="dialog" submit listener
2026-09-16 BottomSheet rn: dismissible false vs close button always exists → as Dialog: no close button or handle; scrim and drag inert; Escape reports
2026-09-16 BottomSheet rn: maxWidth overridable but read once → locked; breakpoint only, from the theme token
2026-09-16 BottomSheet rn: only four overrides forwarded to wide Dialog → every same-named binding forwarded; the rest no effect
2026-09-16 BottomSheet rn: always-present data-ds wrapper vs renders-nothing → wide renders Dialog directly with Dialog's hooks; no wrapping View on rn
2026-09-16 BottomSheet rn: header spacing unbound → new headerPaddingTop, handleGap, headerGap bindings
2026-09-16 BottomSheet rn: below-threshold spring-back unspecified → exit duration, easing standard, timing not spring
2026-09-16 BottomSheet rn: drag dismiss but consumer keeps open → holds release position; open false exits from there, true springs back
2026-09-16 BottomSheet rn: drag start threshold literal → new constant dragSlop (space.1)
2026-09-16 BottomSheet rn: minTarget can't reach Button → closeButton part is a sheet-owned wrapper sized to minTarget; no Button change
2026-09-16 BottomSheet rn: layer meaningless inside Modal → no effect in top layer or Modal; applies to fixed fallback and rn anchor
2026-09-16 BottomSheet rn: scroll-top condition vs header-only PanResponder → only handle/header start the drag, whatever the scroll position
2026-09-16 BottomSheet rn: Android gets no safe-area bottom inset → SafeAreaView on iOS; Android Modal window ends above the nav bar
2026-09-16 BottomSheet lit: dismissible false vs always-visible close button → (same fold)
2026-09-16 BottomSheet lit: reason action has no mechanism → (same fold)
2026-09-16 BottomSheet lit: minTarget only on ds-button host → (same fold: sheet-owned wrapper)
2026-09-16 BottomSheet lit: maxWidth overridable but read once → (same fold)
2026-09-16 BottomSheet lit: breakpoint edge inclusivity → (width > token); exactly the token is a sheet; rn width <= token is a sheet
2026-09-16 BottomSheet lit: no handle/header spacing bindings → (same fold)
2026-09-16 BottomSheet lit: shadow has no part; five overrides not forwarded → shadow part surface; forwarding (same fold)
2026-09-16 BottomSheet lit: scrim fade duration/easing → scrim uses the surface's duration and easing each way
2026-09-16 BottomSheet lit: initial focus order excludes footer → body, footer, close button, heading (tabindex -1)
2026-09-16 BottomSheet lit: scroll-top condition never checked → (same fold)
2026-09-16 BottomSheet lit: controlled-only vs uncontrolled → (same fold)
2026-09-16 BottomSheet lit: wide Dialog emits opened → not re-emitted; stopped at the sheet
2026-09-16 BottomSheet lit: renders-nothing above breakpoint keeps ds-dialog → shadow ds-dialog renders nothing while closed so exit can play
2026-09-16 BottomSheet web: maxWidth hook has nothing to style → (same fold: locked)
2026-09-16 BottomSheet web: only four overrides forwarded → (same fold)
2026-09-16 BottomSheet web: always-visible close button vs dismissible false → (same fold)
2026-09-16 BottomSheet web: minTarget can't raise Button's locked target → (same fold)
2026-09-16 BottomSheet web: reason action never fired → (same fold)
2026-09-16 BottomSheet web: scroll-top check on header → (same fold: no scroll check)
2026-09-16 BottomSheet web: velocity measurement method → last two move samples before release, downward only
2026-09-16 BottomSheet web: handle presence when gesture off → handle only when dragToDismiss and dismissible
2026-09-16 BottomSheet web: data-ds wrapper conflicts with Dialog → (same fold); ref is the active <dialog>, null while closed
2026-09-16 BottomSheet web: header spacing and handle radius unbound → (same fold) plus handleRadius radius.full
2026-09-16 BottomSheet web: exit easing vs generic standard rule → (same fold: enter standard, exit exit)
2026-09-16 ActionSheet rn: open required but described uncontrolled → controlled only; consumer sets false after onAction or onClose
2026-09-16 ActionSheet rn: ref to the surface on rn → no ref on rn; web and Lit ref the <dialog>, null while closed
2026-09-16 ActionSheet rn: dismissible false Cancel row state → Cancel row, its divider and handle not rendered; Escape reports
2026-09-16 ActionSheet rn: root testID part unnamed → testID ActionSheet on the surface; composed parts in wrapping Views
2026-09-16 ActionSheet rn: FocusScope props and first focus → trapped, restoreFocus, autoFocus none; first enabled row after enter
2026-09-16 ActionSheet rn: no inline padding for Cancel row → itemPaddingInline pads header and Cancel row
2026-09-16 ActionSheet rn: divider when every action is danger → divider part: before danger only when both groups exist; above Cancel when shown
2026-09-16 ActionSheet rn: titleColor/titleSize have no part → part heading; Text tone muted size sm forwarding titleSize to fontSize
2026-09-16 ActionSheet rn: shadow, radius, layer, enter, exit no part/easing → part surface; enter standard, exit exit easing
2026-09-16 ActionSheet rn: no sheet max height → BottomSheet's content height cap (90%); list scrolls
2026-09-16 ActionSheet rn: no hover for itemHover → paints only, never moves focus; pressed paints it on rn
2026-09-16 ActionSheet rn: dev warnings for action count → count is guidance, no dev warning
2026-09-16 ActionSheet lit: hidden trigger vs ds-menu anchor → ds-menu anchor set to the opener, no trigger
2026-09-16 ActionSheet lit: open required vs uncontrolled → (same fold as rn)
2026-09-16 ActionSheet lit: dismissible false Cancel row → (same fold as rn)
2026-09-16 ActionSheet lit: overlay.dismiss names differ from reasons → close-button is Cancel (cancel), swipe is drag
2026-09-16 ActionSheet lit: titleSize has no part → (same fold as rn)
2026-09-16 ActionSheet lit: which overrides reach wide ds-menu → same-named Menu bindings plus divider→separator
2026-09-16 ActionSheet lit: maxWidth both override and breakpoint → locked, (width > token), theme token
2026-09-16 ActionSheet lit: shadow/radius/surface/itemHover/divider no part → (same folds)
2026-09-16 ActionSheet lit: no height cap → (same fold as rn)
2026-09-16 ActionSheet lit: header and Cancel row inline padding → (same fold as rn)
2026-09-16 ActionSheet lit: Enter/Space closes vs controlled contract → fires onAction; Keyboard story's consumer closes
2026-09-16 ActionSheet lit: does a hovered row take focus → (same fold as itemHover)
2026-09-16 ActionSheet lit: which element carries the tested name → role=menu list; <dialog> shares aria-label; Cancel named by Button label
2026-09-16 ActionSheet lit: Default story args not given → open with photo-actions args; wrapper closes on onAction and onClose
2026-09-16 ActionSheet lit: scenarios cover only narrow → wide presentation is Menu's own contract
2026-09-16 ActionSheet web: hidden trigger vs Menu anchor → opener ref as Menu anchor
2026-09-16 ActionSheet web: Button overwrites data-part → cancelButton on the wrapping row; itemIcon on a wrapping span
2026-09-16 ActionSheet web: maxWidth override can't move media query → (same fold as lit)
2026-09-16 ActionSheet web: overrides do nothing when wide → (same fold as lit)
2026-09-16 ActionSheet web: dismiss vocabulary vs reasons → (same fold as lit)
2026-09-16 ActionSheet web: titleColor/titleSize no part → (same fold as rn)
2026-09-16 ActionSheet web: font bindings no part → part item, per row
2026-09-16 ActionSheet web: divider when all or no danger → (same fold as rn); wide Menu separator same rule
2026-09-16 ActionSheet web: no easing for enter/exit → (same fold as rn)
2026-09-16 ActionSheet web: Enter/Space closes vs consumer closing → (same fold as lit)
2026-09-16 ActionSheet web: Tab in sheet presentation → trapped between menu stop and Cancel; menu only when not dismissible
2026-09-16 ActionSheet web: no drag-start distance → no slop; a tap passes no threshold and springs back
2026-09-16 ActionSheet web: part hooks when wide → Menu owns every part and hook when wide
2026-09-16 ActionSheet web: Menu's new tab-out/focus-out reasons unmapped → tab-out and focus-out map to scrim, as outside does
2026-09-16 SidePanel rn: uncontrolled non-dismissible Escape → reports escape without closing
2026-09-16 SidePanel rn: copy.expanded has no use on rn → SwiftUI only; others announce state natively
2026-09-16 SidePanel rn: header swipe excluding close button → touch starting on the close button wrapper never becomes the move responder
2026-09-16 SidePanel rn: empty header with hideHeading and no close button → header not rendered
2026-09-16 SidePanel rn: exit easing and spring-back easing → easing from tokens, not overridable; spring-back exit duration + standard
2026-09-16 SidePanel rn: RN Link has no current → aria-current on web and Lit only
2026-09-16 SidePanel rn: filters example Form requires actions → Stack of filter Checkboxes, not a Form
2026-09-16 SidePanel rn: tablets in landscape width or orientation → width > token, not orientation
2026-09-16 SidePanel rn: layer inside native Modal → no effect in top layer or Modal; applies to non-modal panel and rn anchor
2026-09-16 SidePanel rn: modal trap/inert/scroll lock natively → FocusScope trapped + accessibilityViewIsModal; Modal stands in for inert
2026-09-16 SidePanel rn: navigation/action reasons never emitted → navigation not on RN; action for consumer footer handlers only
2026-09-16 SidePanel lit: one shadow <dialog> for both overlay modes → non-modal aside/nav with hidden; <dialog> only when modal
2026-09-16 SidePanel lit: persistent aside can't be navigation → nav for navigation, aside for complementary, not ds-landmark
2026-09-16 SidePanel lit: outside click has no reason → new outside reason; RN never reports it
2026-09-16 SidePanel lit: action reason mechanism → never raised; consumer handler or Lit method="dialog" submit listener
2026-09-16 SidePanel lit: copy.expanded unused on Lit → (same fold)
2026-09-16 SidePanel lit: no defaultOpen, stories control open → uncontrolled starts closed; open stories use a wrapper
2026-09-16 SidePanel lit: scrim/modal/hideHeading attributes → modal, hide-heading, no-scrim, landmark (unreflected)
2026-09-16 SidePanel lit: Escape on the trigger → only from inside the surface
2026-09-16 SidePanel lit: composed parts have no props → Heading level 2 lg; Button ghost iconOnly; Box inset lg; Stack horizontal tight end
2026-09-16 SidePanel lit: partGap and inset no part → partGap part focusScope; inset part body, same on header and footer
2026-09-16 SidePanel lit: modal initial focus order → body, footer, close button, heading
2026-09-16 SidePanel lit: easing not a binding → (same fold as rn)
2026-09-16 SidePanel web: portal vs directly after the trigger → portal everywhere with explicit Tab handling
2026-09-16 SidePanel web: Tab from trigger into panel → trigger wrapper keydown focuses the panel's first tabbable
2026-09-16 SidePanel web: action reason mechanism → (same fold as lit)
2026-09-16 SidePanel web: outside pointerdown reason → (same fold: outside)
2026-09-16 SidePanel web: dismissible false Escape uncontrolled → (same fold as rn)
2026-09-16 SidePanel web: does dismissible false block trigger/navigation/action → only close-button, scrim/outside and swipe gated
2026-09-16 SidePanel web: content state across breakpoint for modal → non-modal keeps state; modal remounts, accepted
2026-09-16 SidePanel web: root/ref/id placement → on the positioned surface element; scrim sibling; ref null while closed
2026-09-16 SidePanel web: widthNarrow computed vs override → hook holds space.20, rule × 3, override replaces the unit
2026-09-16 SidePanel web: breakpoint min-width vs above → (width > token) from the theme token
2026-09-16 SidePanel web: persistent layout and close button → in place, width binding, natural height, no close button
2026-09-16 SidePanel web: autoFocus false not a FocusScope value → autoFocus none; focus placed after showModal()
2026-09-16 SidePanel web: trigger content vs one element → one element in an overlay-owned display:contents span
2026-09-16 SidePanel web: copy.expanded unused on web → (same fold)
2026-09-16 SidePanel web: hideHeading do not render vs keep for AT → visually hidden clip so aria-labelledby resolves
2026-09-16 SidePanel web: no List component; Form requires actions → Stack of Links / Stack of filter Checkboxes
2026-09-16 SidePanel web: safe-area edge unspecified → inset on the physical edge touched, flipped under rtl
2026-09-16 Accordion web,lit,rn: event firing order not declared → onChange before onOpenChange (timing); toggled section first, then one exclusive close per section in item order
2026-09-16 Accordion web,lit,rn: Disclosure's `controlled` onToggle echo unspecified → Accordion ignores it and computes exclusive/controlled itself
2026-09-16 Accordion web,lit,rn: no pointer→trigger reason mapping → Disclosure `pointer` becomes `trigger`, `keyboard` stays `keyboard`
2026-09-16 Accordion web,lit,rn: font/padding bindings had no Disclosure forwards → composition.item forwards triggerPaddingBlock, fontFamily→triggerFontFamily, triggerFontSize, triggerFontWeight
2026-09-16 Accordion web,lit,rn: divider/dividerWidth had no target → forwarded to each Divider's `color`/`thickness` override
2026-09-16 Accordion web,lit,rn: itemGap placement and gap next to dividers → itemGap is the `list` part's gap; falling between item and Divider is intended
2026-09-16 Accordion web,lit,rn: 44px target claim vs locked minTarget → Accessibility says 24px via Disclosure's minTarget; Accordion adds no target/focus rule
2026-09-16 Accordion web,lit: trigger hit area ends at summary text → stated as today's behavior; full-width trigger needs a Disclosure prop
2026-09-16 Accordion web: `list` part had no element → root div carries data-part="list"
2026-09-16 Accordion lit: `list` part had no element → shadow flex container carries data-part and part="list"
2026-09-16 Accordion lit: dividers can't be light-DOM siblings of items → one manual slot per disclosure, ds-divider between slots in the shadow root
2026-09-16 Accordion lit: forwarded overrides to slotted disclosures → set as --ds-disclosure-* hooks valued from the accordion's own hooks
2026-09-16 Accordion lit: slotted disclosure `toggle` reaching the page → left alone for slotted; stopped for disclosures rendered from `items`
2026-09-16 Accordion lit: unslotted children and later slot changes → not rendered; only child add/remove is observed
2026-09-16 Accordion web,lit: how long just-emitted controlled set counts → compared with the next value change only, then cleared
2026-09-16 Accordion web,lit: arrows from a focused disabled trigger → work; arrows/Home/End never land on a disabled trigger
2026-09-16 Accordion lit: turning exclusive on with several open → trimmed to the first open id, no event
2026-09-16 Accordion web: AccordionItem disabled breaks exactOptionalPropertyTypes → field is `disabled?: boolean | undefined`
2026-09-16 Accordion web,lit,rn: click scenario didn't name the trigger → first trigger, nothing open; expects onChange([firstId]) then onOpenChange(firstId, true, trigger)
2026-09-16 Accordion rn: exclusive scenario couldn't observe closing → given free/pro with defaultValue pro; clicking free expects the exclusive close of pro
2026-09-16 Accordion rn: headingLevel has no native level → sets header role only; heading-level scenarios render the same tree
2026-09-16 Accordion rn: react-native-web arrow-key note ambiguous → no web-only key handler; arrows do nothing on react-native-web
2026-09-16 Tabs rn: no key events on iOS/Android → keyboard and roving stop are react-native-web only; native press always selects, activation has no effect
2026-09-16 Tabs rn: roving stop and disabled tabs without Pressable disabled → focusable only on selected tab (rn-web); disabled uses accessibilityState and ignores presses
2026-09-16 Tabs web,lit,rn: example children prose can't be an arg → stories/tests build one TabPanel per args.tabs entry
2026-09-16 Tabs rn: has-accessible-name can't find non-accessible tablist → tablist has role, label, testID Tabs.tablist, not accessible; tests use testID
2026-09-16 Tabs web,lit,rn: click scenario doesn't name the tab → first tab; key scenarios start focused on first tab
2026-09-16 Tabs web,lit,rn: copy.position has no use off SwiftUI → platforms [rn, swiftui]; RN accessibilityValue text; web/Lit don't render it
2026-09-16 Tabs rn: no panel-to-tab link → panel View accessibilityLabel = its tab's label
2026-09-16 Tabs lit: aria-labelledby can't cross shadow root → panels get aria-label = tab label
2026-09-16 Tabs lit: aria-controls IDREF can't reach light-DOM panel → ariaControlsElements = [panel], nothing where unsupported
2026-09-16 Tabs web: aria-controls pointing at unmounted panel → set only while the panel is mounted
2026-09-16 Tabs rn: badgeSize has no line height → badge uses the label's lineHeight multiplier on its own size
2026-09-16 Tabs rn,lit: many bindings had no part → list* on tablist, badge* on tabBadge, font/radius/minTarget/focus/disabled on tab, transition on indicator
2026-09-16 Tabs rn: tab icon size unspecified → composition tabIcon Icon size md in the tab's foreground color
2026-09-16 Tabs web,rn: overflow only described horizontally → vertical fit start list scrolls vertically, keeps selected tab in view
2026-09-16 Tabs web,rn: optional tabs fields reject explicit undefined → shape fields `?: T | undefined`; exported type TabsItem
2026-09-16 Tabs lit: keepMounted has no effect → no effect on Lit (panels kept hidden), kept for parity, not reflected
2026-09-16 Tabs web,lit,rn: tab without panel not rendered flickers → tab still renders with dev warning; orphan panel warns and is hidden
2026-09-16 Tabs web,lit,rn: automatic activation only on forward arrows → every move selects (all arrows, Home, End)
2026-09-16 Tabs web,lit: badge name separator unspecified → label then badge with a plain space ("Inbox 3")
2026-09-16 Tabs lit: panelGap part panel but host gap → gap of the root flex layout, not a panel margin
2026-09-16 Tabs lit: minTarget axis unspecified → minimum block and inline size of every tab
2026-09-16 Tabs lit: Keyboard story activation unspecified → activation manual, three enabled tabs, orientation from args
2026-09-16 Tabs web: scrollIntoView scrolls the page → set the list's own scrollLeft/scrollTop
2026-09-16 Tabs web: raw panel ids can collide → DOM id is `id` prefixed with a shared useId base
2026-09-16 Tabs web: no binding for panel text styles → panel sets no font or color; content brings its own Text
2026-09-16 Tabs web,rn: fit fill has no effect vertically → fill is horizontal only; vertical tabs span list width
2026-09-16 SegmentedControl web,lit,rn: form block without name, notes disagree → form block removed; not a form field, use RadioGroup in a Form
2026-09-16 SegmentedControl web,lit,rn: pill bindings named part segment → selected background, shadow, radius, transition are part indicator
2026-09-16 SegmentedControl web,lit: segmentSpacing is sibling spacing → part group, applied as the group's gap
2026-09-16 SegmentedControl web,lit: several bindings had no part → selectedWeight, padding, font, minTarget, focus, disabledOpacity are part segment
2026-09-16 SegmentedControl web,lit,rn: paddingBlockSm refers to missing paddingBlock → md uses segmentPaddingBlock, same token by design
2026-09-16 SegmentedControl rn: segmentGap does nothing with iconOnly → binding description says so
2026-09-16 SegmentedControl web,lit,rn: pill hiding from AT unstated → aria-hidden on web/Lit; accessibilityElementsHidden/importantForAccessibility on RN
2026-09-16 SegmentedControl web,lit: Tooltip props and icon-only name unclear → aria-label = option label; Tooltip content label, describes false, defaults
2026-09-16 SegmentedControl rn: tooltip part on RN unstated → no Tooltip; label becomes accessibilityLabel, no long-press bubble
2026-09-16 SegmentedControl rn: no native key events → keyboard table react-native-web only; arrow scenarios web and Lit only
2026-09-16 SegmentedControl web,lit,rn: no RTL arrow rule → ArrowLeft next, ArrowRight previous in RTL, as Tabs
2026-09-16 SegmentedControl web,lit,rn: value naming disabled or missing option → kept as given; unknown checks nothing; tab stop first enabled
2026-09-16 SegmentedControl lit: controlled parent rejects change → focus moves, onChange fires, checked state waits for value
2026-09-16 SegmentedControl web,lit,rn: iconOnly option without icon → dev warning once, label shown as text
2026-09-16 SegmentedControl rn: two-to-five count not enforced → guidance only, any count renders, no warning
2026-09-16 SegmentedControl lit: required label has no default → defaults to empty string with a dev warning
2026-09-16 SegmentedControl web: click scenario doesn't name the segment → first segment (the disabled one in the disabled scenario)
2026-09-16 SegmentedControl web,lit: arrow scenarios' starting focus → starts on the selected segment
2026-09-16 SegmentedControl lit: disabled skipping had no scenario → added arrow-skips-disabled-segments (web, lit)
2026-09-16 Listbox rn: ListboxOption named leaf and union → exports ListboxOption, ListboxGroup, ListboxItem on every platform; groups don't nest
2026-09-16 Listbox web,lit,rn: check-mark description contradicted itself → check only with multiple, slot always reserved; single uses optionSelectedWeight, no fill
2026-09-16 Listbox web,rn: invalid had no visual binding → borderInvalid (color.border.danger) when not embedded; error message precedence stated
2026-09-16 Listbox lit: clearing error vs explicit invalid → invalid while invalid true or error non-empty; clearing error never clears invalid
2026-09-16 Listbox rn: group part has no native wrapper → groups flattened into FlatList rows; only the group label row (Listbox.groupLabel)
2026-09-16 Listbox web,lit,rn: valueType string[] vs single-select string → single submits string, multiple array, nothing selected no key
2026-09-16 Listbox rn: accessible list hides empty Text → list not accessible; empty/loading Text is its own stop
2026-09-16 Listbox rn,lit: selectedCount no plural and no home → one form; native accessibilityValue, web/Lit export only
2026-09-16 Listbox rn: onActiveChange had no fires list → fires [user]: key, hover, focus; null on blur; never on mount
2026-09-16 Listbox rn: disabled vs Pressable disabled → accessibilityState.disabled plus press guard, never Pressable disabled
2026-09-16 Listbox web,lit,rn: focus ring changing row height → never changes layout: outline on web/Lit, reserved transparent border on RN
2026-09-16 Listbox lit: labelledBy id can't cross shadow root → Lit uses label as aria-label, never labelledBy
2026-09-16 Listbox web: copy {label} unknown with labelledBy → label is always the {label} in copy
2026-09-16 Listbox web,lit,rn: maxVisible measured vs formula → always computed from tokens, never measured; formula stated
2026-09-16 Listbox web,lit: errorMessage has no composition or home → Text sm danger; partGap and errorText bindings; root wrapper; danger AA contrast pair
2026-09-16 Listbox web,lit: fully disabled list styling → stays focusable with aria-disabled, input inert, disabledOpacity once
2026-09-16 Listbox web,lit: keys before any option is active → Down/PageDown first enabled, Up/PageUp last; Space/Enter act on starting option
2026-09-16 Listbox web,lit: typeahead reset has no token → typeaheadReset binding on motion.duration.loop (as Menu)
2026-09-16 Listbox lit: PageUp/PageDown and selectionFollowsFocus → follow it like the arrows
2026-09-16 Listbox web: PageUp/PageDown with maxVisible all → jump to first/last enabled; otherwise move by row count, clamped
2026-09-16 Listbox web,lit: Shift+Arrow removal and Ctrl+A clear scope → Shift+Arrow only adds; Ctrl+A toggle-off spares disabled selected options
2026-09-16 Listbox web,lit: data-ds-field only with name → root always carries it; without name nothing submits
2026-09-16 Listbox web: optionGap between rows → only inside a row; no gap between rows
2026-09-16 Listbox web: emptyColor has no part → emptyState part, Text tone muted
2026-09-16 Select web,lit,rn: valueType string[] but single submits string → string for single, string[] with multiple, empty submits nothing
2026-09-16 Select rn: Tab rule has no native form → rn notes say Pressable sees no keys
2026-09-16 Select web,lit,rn: fontWeight can't reach options → part value, trigger value text only
2026-09-16 Select web,lit,rn: fontSize/size forwarded to popup? → value and label only; fontFamily and lineHeight forwarded to Listbox
2026-09-16 Select web,lit,rn: many bindings had no part → parts assigned (value, errorMessage, popup, trigger, field group)
2026-09-16 Select web,lit,rn: focusRingWidth with overridden border; focus vs invalid → padding shrinks by the difference; danger color stays when focused
2026-09-16 Select lit,rn: popup border width no binding → popupBorderWidth border.width.thin, part popup
2026-09-16 Select web,lit,rn: chevron/label/description/error composition props unspecified → Icon chevron-down sm; Text medium/muted sm/danger sm with forwards
2026-09-16 Select lit: labelWeight/helperSize hooks do nothing → reached only through child Text overrides, no hook
2026-09-16 Select rn: phone width comparison direction → width at most layout.maxWidth.prose is a phone (BottomSheet)
2026-09-16 Select web,lit,rn: selectedCount has no plural forms → one string, locale-formatted count
2026-09-16 Select web,lit,rn: required indicator in accessible name → yes, the visible label including requiredIndicator
2026-09-16 Select rn: accessibilityValue with nothing selected → copy.placeholder
2026-09-16 Select rn: parts have no testIDs → testID Select.<part> passed to composed Text/Icon
2026-09-16 Select rn: no Escape test → Escape is onRequestClose (Android back); Enter/Escape scenarios web and Lit only
2026-09-16 Select web,lit: listbox composition passes only options → also multiple, value, embedded true, selectionFollowsFocus false, initialActiveValue, labelledBy, events
2026-09-16 Select web: prose said defaultActiveValue → initialActiveValue; web dispatches focusin on open, Lit sets activeValue
2026-09-16 Select web: aria-activedescendant missing from trigger → added, <listboxId>-option-<value>, only while open
2026-09-16 Select web,lit: no key forwarding mechanism → web replays the KeyboardEvent on the list; Lit calls handleKey
2026-09-16 Select web,lit: label element and label click → native label for wraps Text; click focuses trigger, doesn't open
2026-09-16 Select web,lit: errorMessage content without error → role=alert danger Text with error else copy.invalid
2026-09-16 Select web,lit: Space in single select → commits and closes; multiple toggles and stays open
2026-09-16 Select web,lit: re-picking current option → closes without onChange
2026-09-16 Select lit: Tab with controlled open → list never a tab stop; Tab reports close, never blocks focus move
2026-09-16 Select web,lit: native always without JS, chevron, placeholder → Lit native select submits via setFormValue; chevron single only; web disabled empty placeholder option
2026-09-16 Select web,lit: labelledby label+value repeats value → aria-labelledby is the label id alone
2026-09-16 Select lit: live active-option element details → one visually hidden polite span via aria-describedby
2026-09-16 Select web,lit: outside dismiss and placement → pointerdown or focus outside closes without change; below, flips above
2026-09-16 Select web,lit: enter easing and extra transitions → opacity fade only, easing standard, no slide or rotation
2026-09-16 Select web: copy.done unused on web → only the native phone sheet renders it
2026-09-16 Select web,lit,rn: options typed ListboxOption[] → ListboxItem[] (options and one level of groups)
2026-09-16 Combobox rn: multiple value vs string|boolean form handle → values joined with `,` (comma always commits)
2026-09-16 Combobox rn: copy.activeOption has nothing to read on touch → not announced on native
2026-09-16 Combobox rn: filter none type-ahead → typing only opens the list on native
2026-09-16 Combobox rn: no toggle Button on phones → toggleButton is the chevron Icon in the summary Pressable, hidden from AT
2026-09-16 Combobox rn: phone breakpoint not given → width <= layout.maxWidth.prose (BottomSheet breakpoint)
2026-09-16 Combobox rn: Button has no testID for parts → wrapper Views carry chipRemove/clearButton testIDs
2026-09-16 Combobox rn: single-select Done button → copy.done Button in the sheet footer in both modes
2026-09-16 Combobox rn: no visually-hidden status primitive → visible small muted Text; live region Android, announceForAccessibility iOS
2026-09-16 Combobox rn: Backspace/comma not in rn keyboard model → TextInput still handles both
2026-09-16 Combobox web,lit,rn: Enter/comma with text matching an option → commits the option's value; rn Enter without allowCustom commits nothing
2026-09-16 Combobox web,lit,rn: Escape when closed → clears text only; clear button empties value
2026-09-16 Combobox web,lit,rn: focus border vs fieldBorderWidth → focusRingWidth replaces it while focused, padding shrinks by the difference
2026-09-16 Combobox web,lit,rn: loading with stale options → Listbox gets options [] + loading; add-custom row hidden
2026-09-16 Combobox web,lit,rn: Default story args unspecified → fruit-picker example; apple is its Apple option
2026-09-16 Combobox web,lit,rn: options typed ListboxOption[] → ListboxItem[]
2026-09-16 Combobox lit: activedescendant can't reach shadow options → polite live span via aria-describedby, as ds-select
2026-09-16 Combobox web,lit: active option on open → typing none; toggle/click/ArrowDown selected else first; ArrowUp selected else last; Alt+ArrowDown selected else none
2026-09-16 Combobox web,lit: onInputChange says only keystroke → every user-caused text change, not controlled rewrites
2026-09-16 Combobox lit: open reflects only controlled prop → open attribute mirrors effective state
2026-09-16 Combobox lit: negated clearable attribute unnamed → reflected as `no-clear`
2026-09-16 Combobox web,lit: PageUp/PageDown and type-ahead forwarding → only keyboard-table keys forwarded; typing stays in input
2026-09-16 Combobox web,lit: focus-visible vs focus-within field ring → `:has(input:focus-visible)`
2026-09-16 Combobox web,lit: popup border width and part-less bindings → popupBorderWidth added; descriptions name each binding's target
2026-09-16 Combobox web,lit: enter binding has no target → popup opacity fade and field border-color transition
2026-09-16 Combobox web,lit: Tab in multiple mode → Tab never commits
2026-09-16 Combobox web,lit: pressing already-selected option in single → no onChange; restores label and closes
2026-09-16 Combobox lit: statusDebounce under reduced motion → not motion; never zeroed by reduced motion
2026-09-16 Combobox lit: plural locale without locale prop → nearest lang ancestor, else runtime default
2026-09-16 Combobox web,lit: required indicator in accessible name → rendered inside the label, part of the name
2026-09-16 Combobox web: ref on root vs input → Ref<HTMLInputElement> on input; data-ds on wrapper
2026-09-16 Combobox web: forwarding to nonexistent useListbox hook → remounts Listbox with initialActiveValue, re-dispatches arrow keydowns
2026-09-16 Combobox web,lit: Button owns its data-part → part wrappers around Buttons; scenario clicks press the inner Button
2026-09-16 Combobox web: copy.done/activeOption unused on web → not rendered on web
2026-09-16 Combobox web: toggle button tab order → toggle tabIndex -1; clear and chip-remove stay tabbable
2026-09-16 Combobox web,lit,rn: comma commit in single mode → same as Enter
2026-09-16 Combobox web,lit,rn: count 0 with add-custom row → count excludes that row, announces copy.empty
