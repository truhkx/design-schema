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
2026-09-16 Slider rn: Home/End/Page actions have no copy labels → new copy keys pageUpAction, pageDownAction, homeAction, endAction
2026-09-16 Slider web,lit,rn: snap to marks "when step omitted" undetectable → only snapToMarks enables mark snapping
2026-09-16 Slider web,lit,rn: PageUp/PageDown past the last mark → ten steps clamped; with snapToMarks next mark, then min/max
2026-09-16 Slider rn,lit: required copy standalone, message order → required is valueMissing; region shows error, Form message, else copy.invalid
2026-09-16 Slider web,lit,rn: errorText overridable but Text color locked → errorMessage composed Text tone danger; errorText has no hook, override no-op
2026-09-16 Slider web,lit,rn: composed Text bindings lack forwards → composition lists label/description/valueText/errorMessage Text with forwards
2026-09-16 Slider rn,lit: bubble text color/size don't reach its Text → bubble holds Text with valueSize forwarded; bubbleText re-scopes foreground
2026-09-16 Slider web,lit,rn: bubble padding/offset and label-row gap unbound → bubblePaddingBlock, bubblePaddingInline, bubbleOffset, labelGap bindings
2026-09-16 Slider rn: focus ring geometry unspecified → circle around the visible knob, keyboard focus only
2026-09-16 Slider lit: sixteen bindings have no part → each binding names tickMarks, valueText, label, description, errorMessage, thumb or root
2026-09-16 Slider web,lit: mark labels lack part and gap → labels live in tickMarks as Text xs muted; markLabelGap binding
2026-09-16 Slider rn: tap-on-track has no RN counterpart → pressing the track moves the nearest thumb on every platform
2026-09-16 Slider web,lit,rn: Form value types have no number → decimal string, range two strings under one name; events keep numbers
2026-09-16 Slider rn,lit: disabled via prop, Form or Fieldset → thumbs focusable, input ignored, no value submitted, same for all sources
2026-09-16 Slider lit: marks shape breaks exactOptionalPropertyTypes → label?: string | undefined, exported SliderMark
2026-09-16 Slider web,lit: label for can't name div thumbs → Text span id + aria-labelledby; range thumbs aria-label from minimum/maximumLabel
2026-09-16 Slider lit: label Text size unnamed → Text span size md weight medium with forwards
2026-09-16 Slider web,lit: change-end when value unchanged → onChange/onChangeEnd fire only when the value changed
2026-09-16 Slider lit: Keyboard story range args missing → price-range example args
2026-09-16 Slider web: showValue hover name vs description → hover means pressed or focused, not pointer hover
2026-09-16 Slider web: trackPaddingBlock would thicken the rail → pads an unparted track-area wrapper that is the hit area
2026-09-16 Slider web: validate blur for pointer control → validates when an interaction ends, every platform
2026-09-16 Slider web: halo size contradicts itself → haloSpread binding; diameter thumbSize + 2 × haloSpread
2026-09-16 Slider web: onChange scenarios lack payloads → scenarios carry with: values
2026-09-16 Slider web: which element takes the id for a range → the low thumb, also Form focus-on-error target
2026-09-16 Slider web,rn: composed Text parts need a home → data-part/testID on wrappers Slider owns
2026-09-16 NumberInput web,lit,rn: number valueType but Forms have no number → registers decimal string; empty/disabled registers nothing; Lit valueAsNumber getter
2026-09-16 NumberInput web,lit,rn: Home/End marked native but needs code → native removed; jump to min/max is component code
2026-09-16 NumberInput rn: arrow/page keys and bounds actions → onKeyPress where delivered; iOS uses adjustable actions only, no bound jump
2026-09-16 NumberInput web,lit,rn: "ten steps" count unclear → 10 × step, clamped; a count, not a style value
2026-09-16 NumberInput web,lit,rn: stepper Button size at md → Button size sm at both field sizes
2026-09-16 NumberInput web,lit,rn: controlled value swallows typing while focused → raw text while focused; value takes over on blur, step, prop change
2026-09-16 NumberInput web,lit,rn: null vs undefined value → number | null | undefined; null controlled empty, undefined uncontrolled
2026-09-16 NumberInput web,lit,rn: validation precedence and invalid trigger → error > Form error > required > invalid > out-of-range; invalid = no digits
2026-09-16 NumberInput web,lit,rn: {min}/{max} raw or formatted → formatted with field format, no affixes
2026-09-16 NumberInput web,lit: clamp message location and submit blocking → errorMessage part, aria-invalid, fails validation until next edit
2026-09-16 NumberInput rn: rounding without precision → decimals of step, never snaps to multiples
2026-09-16 NumberInput web,rn: affixes in accessible value → leadingText + formatted value + space + trailingText
2026-09-16 NumberInput rn: disabled steppers dimmed twice → disabledOpacity never on a stepper container
2026-09-16 NumberInput web,lit,rn: hold-to-repeat platforms, token fallback → web/Lit only; unreadable tokens step once
2026-09-16 NumberInput web,lit,rn: FieldsetContext and legend prefix undefined → per-platform: disabled on web/Lit, rn reads context and prefixes legend
2026-09-16 NumberInput web,lit,rn: Button owns data-part, aria-hidden placement → wrapper span/View owns part/testID; aria-hidden on element around both
2026-09-16 NumberInput web: "." group vs decimal separator → "." is decimal only when locale decimal absent
2026-09-16 NumberInput web,lit: prose says suffix and showSteppers → trailingText and unless hideSteppers
2026-09-16 NumberInput lit: which part gets focus ring → borderFocus/focusRingWidth part field
2026-09-16 NumberInput web: stepper hairline width missing → stepperDividerWidth binding border.width.thin
2026-09-16 NumberInput web: paddingInline vs steppers → part field; inline-end only when steppers hidden
2026-09-16 ProgressBar web,lit,rn: announce on mount → reached tiers silent at mount; indeterminate mount announces once
2026-09-16 ProgressBar web,lit,rn: tier boundaries and multi-tier jumps → floor(fraction × 4); one announcement for highest tier
2026-09-16 ProgressBar web,lit,rn: backward reset target → resets to new value's tier; below max re-arms complete
2026-09-16 ProgressBar web,lit: milestone 100 vs copy.complete → max always announces copy.complete
2026-09-16 ProgressBar web,rn: {value} raw or formatted → formatValue(clamped, min, max), same as value text
2026-09-16 ProgressBar lit: tier tracking under announce none → tracked always, switching never replays
2026-09-16 ProgressBar web: identical message re-announcement → always spoken; web/Lit replace node, rn re-announces
2026-09-16 ProgressBar web,rn: clamping and formatValue argument → clamped everywhere; non-finite counts as min
2026-09-16 ProgressBar web: default percentage rounding → whole-number Intl percent, as Meter
2026-09-16 ProgressBar web: invalid range max ≤ min → empty bar, now = min, 0%, no announcements, dev warning
2026-09-16 ProgressBar web,lit,rn: indeterminate aria values → keep min/max, omit now/valuetext, busy true
2026-09-16 ProgressBar web,lit,rn: reduced-motion indeterminate contradictory → static full-width fill at opacity.disabled everywhere
2026-09-16 ProgressBar web,rn: sweep easing unspecified → sweepEasing binding motion.easing.standard
2026-09-16 ProgressBar web,lit: RTL sweep direction → inline start to end, mirrored under dir rtl
2026-09-16 ProgressBar web,lit: label-to-value gap unbound → labelGap binding space.2 on header
2026-09-16 ProgressBar web: value position under hideLabel → header anatomy part, value at inline end
2026-09-16 ProgressBar web,lit,rn: part-less typography and radius bindings → radius part track; Text forwards as Meter; partGap container
2026-09-16 ProgressBar web: role on root or track → track; root is plain wrapper
2026-09-16 ProgressBar lit: aria-labelledby can't cross shadow root → host aria-label mirrored from label
2026-09-16 ProgressBar lit: empty label fallback → aria-label removed, no warning
2026-09-16 ProgressBar lit: ElementInternals prose vs notes → plain host attributes
2026-09-16 ProgressBar lit: hide-value missing from reflect → { prop: showValue, attribute: hide-value } reflected
2026-09-16 ProgressBar rn: disabled/keyboard rules don't apply → rn notes: no disabled, no keyboard, never focusable
2026-09-16 Stepper web,lit,rn: accessible name sentences contradict → web/Lit plain label + hidden status word; stepLabel native only
2026-09-16 Stepper web,lit,rn: status word join unspecified → joined after ", "; upcoming gets none
2026-09-16 Stepper web,lit: notes still say Button ghost → Stepper's own native button everywhere
2026-09-16 Stepper web: element ol vs nav root → element nav; list part is the ol
2026-09-16 Stepper rn: no nav role → no landmark; label on list View
2026-09-16 Stepper web,lit: descriptions in horizontal orientation → not rendered in horizontal
2026-09-16 Stepper web,lit,rn: connector-complete rule → by position before current, statuses ignored
2026-09-16 Stepper lit,rn: explicit status current vs id match → status sets indicator/word; id sets selected, navigable, reveal
2026-09-16 Stepper web,lit: current matches no id → nothing selected, none navigable under completed, Step 1 of m, dev warning
2026-09-16 Stepper web,lit,rn: step count placement → count anatomy part after list, muted sm Text; countColor/countSize bindings
2026-09-16 Stepper lit,rn: what compact clips → web/Lit clip other labels and words; rn omits them, accessibilityLabel suffices
2026-09-16 Stepper rn: auto-compact reads window width → own width via onLayout
2026-09-16 Stepper web,lit: container query can't read custom property → built layout.maxWidth.prose value, literal-ok
2026-09-16 Stepper web,lit: Text bindings lack forwards → composition forwards size/weight/fontFamily; colors via Text tone
2026-09-16 Stepper rn: check/danger Icon size → Icon sm with indicatorFontSize as size override
2026-09-16 Stepper rn: complete indicator ring unbound → indicatorCompleteBorder binding
2026-09-16 Stepper web: indicator radius literal → indicatorRadius binding radius.full
2026-09-16 Stepper web: step padding reused partGap → stepPadding binding space.2
2026-09-16 Stepper lit: part-less bindings → each names a part or target
2026-09-16 Stepper rn: stepHover hover vs press → pressed or hovered
2026-09-16 Stepper rn: composed Text takes no testID → wrapper View carries the part testID
2026-09-16 Stepper all: indicatorColor defined twice → duplicate removed
2026-09-16 Search web,lit,rn: prose says composed Landmark → role=search on Search's own root
2026-09-16 Search web,lit,rn: submit only when action set → submit Button always rendered
2026-09-16 Search web,lit: Enter submits value vs label → label for Enter, click and onSubmit
2026-09-16 Search web,lit,rn: Button sizes and composed props → both ghost sm iconOnly with close/arrow-right
2026-09-16 Search lit,rn: iconColor forward to Button glyphs → search Icon only; Buttons keep ghost colors
2026-09-16 Search web,lit,rn: Icon size per Search size → sm at md, md at lg on every platform
2026-09-16 Search lit,rn: label Text typography → labelWeight binding; fontSize forwarded
2026-09-16 Search web,lit,rn: Listbox props unspecified → label, embedded, value "", emptyMessage for empty/loading
2026-09-16 Search web,lit: what opens/closes suggestions → typing or ArrowDown; closes on Escape, blur, outside, choice, clear, submit
2026-09-16 Search lit: ArrowDown at last suggestion → stops
2026-09-16 Search web,rn: onChange on clear or fill → onChange("") before onClear, onChange(label) before onSubmit
2026-09-16 Search lit: controlled value for submit/clear → value prop when set
2026-09-16 Search lit: disabled behaviour → read-only focusable input, Buttons disabled, keys inert, not registered
2026-09-16 Search web,rn: trimming vs native GET → field trimmed before GET; onSubmit trimmed
2026-09-16 Search web,lit: nested form inside Form → root becomes div role=search, action ignored
2026-09-16 Search web,lit,rn: form registration → trimmed query, always valid, disabled not registered
2026-09-16 Search lit: DsFormField members missing → required false, validationMessage "", checkValidity true
2026-09-16 Search lit: activedescendant can't reach listbox options → polite live span via aria-describedby
2026-09-16 Search web,lit,rn: live-region count debounce → constants.statusDebounce motion.duration.base × 2
2026-09-16 Search web,lit,rn: popup border width → popupBorderWidth binding
2026-09-16 Search web,lit: layer and placement → layer binding layer.dropdown; below, flips above
2026-09-16 Search web,rn: focus border geometry → focusRingWidth replaces borderWidth, padding shrinks
2026-09-16 Search web: landmark and form separate parts → one root element
2026-09-16 Search rn: role on TextInput vs container → container View only when landmark
2026-09-16 Search rn: renamed events and aliases → mapping stated, no aliases
2026-09-16 Search rn: list closes before row press → stays open during press; caller's ScrollView keyboardShouldPersistTaps
2026-09-16 Search rn: no visually-hidden count → announceForAccessibility after statusDebounce
2026-09-16 Search rn: shown label read twice → label Text hidden from accessibility
2026-09-16 Search rn: Escape on native → hardware keyboard only; clear Button is the path
2026-09-16 DatePicker web,rn: Clear closes, fires when empty → stays open, fires onChange(undefined) always
2026-09-16 DatePicker web,rn: Today behaviour and disabled → like picking today's cell; disabled outside min/max or isDateDisabled
2026-09-16 DatePicker web,lit,rn: sm/md field font size unbound → fontSize binding
2026-09-16 DatePicker rn: padding overrides per size → override applies at both sizes
2026-09-16 DatePicker rn: transition properties → background, border, color (rn background only)
2026-09-16 DatePicker rn: day focus ring vs today ring → focus ring replaces today ring while focused
2026-09-16 DatePicker lit: today ring vs selected fill → ring stays, fill takes background
2026-09-16 DatePicker rn: sheet title vs gridLabel → title is label; gridLabel on grid View
2026-09-16 DatePicker web,rn: composed parts lack data-part/testID → wrapper span/View DatePicker owns; rn footer row View
2026-09-16 DatePicker rn,lit: header and footer gaps unbound → headerGap, footerGap bindings
2026-09-16 DatePicker rn: week-number cells unbound → weekNumberSize binding
2026-09-16 DatePicker web: week-number cell semantics → th scope col/row, not focusable
2026-09-16 DatePicker rn: no invalid state → hint + assertive live region + announcement
2026-09-16 DatePicker web,rn: unparseable vs required for partial ranges → explicit validation order written out
2026-09-16 DatePicker lit,web: end equal start → allowed; rangeOrder copy "on or after"
2026-09-16 DatePicker lit: tooEarly/tooLate messages and {min}/{max} format → range validation keys; numeric locale pattern
2026-09-16 DatePicker rn,web: year Select span → each bound falls back alone; always includes shown year
2026-09-16 DatePicker lit,web: composition label Text vs native label → label removed from composition; native label web/lit
2026-09-16 DatePicker lit,web: range form value object → name and name-end strings; name reports message
2026-09-16 DatePicker lit,web: aria-selected on role button → on the gridcell
2026-09-16 DatePicker web: in-range days selected → aria-selected across range; ends get fill
2026-09-16 DatePicker web: full-date label format → Intl dateStyle full UTC plus today/selected
2026-09-16 DatePicker web: calendarInset target and portaled hooks → forwarded to Popover/BottomSheet inset; hooks declared on calendar wrapper
2026-09-16 DatePicker web: calendarSurface forward → not forwarded; Popover/BottomSheet surface locked to same token
2026-09-16 DatePicker web,lit: Tab cycle and trapping → prev, month, year, next, grid, Today, Clear; DatePicker traps Tab
2026-09-16 DatePicker web: second FocusScope → no, Popover's is the only one
2026-09-16 DatePicker lit: which keys skip disabled days → Arrow keys only
2026-09-16 DatePicker web,lit: first range pick and controlled draft → calendar-only draft; closing discards
2026-09-16 DatePicker web: re-picking same day fires → picks always fire; retyping same date doesn't
2026-09-16 DatePicker lit: controlled empty → pass ''; undefined uncontrolled
2026-09-16 DatePicker web: controlled open re-aims → every open aims at value's month and focuses that day
2026-09-16 DatePicker web: locale source and pattern → document lang then Intl; formatToParts 2-digit
2026-09-16 DatePicker lit: open reflect can't express closed → property only, removed from reflect
2026-09-16 DatePicker lit: ids and Selects in shadow root → one shadow root; Selects named month/year, not discovered
2026-09-16 DatePicker lit: what carries name and aria-invalid → the input(s)
2026-09-16 DatePicker lit: Popover first-focus and re-measure → DatePicker focuses day after open, requests reposition
2026-09-16 DatePicker lit: hideLabel binding → visually-hidden clip, none needed
2026-09-16 Toolbar rn: notes said menu works natively, Guidance said scroll → menu renders as scroll; overflow parts have no native element
2026-09-16 Toolbar rn: schema default menu vs native default scroll → default renders scroll silently; only explicit menu warns once
2026-09-16 Toolbar rn: element View vs notes' horizontal ScrollView → root View wraps ScrollView (scroll/menu) or wrapping View (wrap)
2026-09-16 Toolbar rn: who renders native Divider between clusters → ToolbarGroup View on native; Toolbar renders separators, consumers never do
2026-09-16 Toolbar rn: groupGap has no gap-only form → separator padding groupGap − itemGap, clamped at 0, every platform
2026-09-16 Toolbar rn: itemGap override vs density unstated → an override replaces the value at both densities
2026-09-16 Toolbar rn,web,lit: can't tell which children have a size prop → Button/SegmentedControl/Select/Search by identity, direct and ToolbarGroup children
2026-09-16 Toolbar rn,lit: fade shows even with nothing scrolled past → each edge fades only while content is hidden past it
2026-09-16 Toolbar rn: arrow keys on react-native-web without a mechanism → no arrow handling on native or react-native-web; Tab/swipe
2026-09-16 Toolbar rn,lit,web: example children are prose → concrete ghost text Buttons, SegmentedControl and named Selects with options
2026-09-16 Toolbar rn,lit: focusRing locked but applied nowhere → NOISE, Guidance already says so
2026-09-16 Toolbar lit: removing consumer light DOM on collapse → Lit sets hidden plus data-ds-toolbar-collapsed; web removes from render
2026-09-16 Toolbar lit: whole entries from end vs only Buttons collapse → entry collapses only if all Buttons; others skipped and stay
2026-09-16 Toolbar lit,web: ToolbarGroup has no stated props → optional label: group name and Menu group heading; unlabelled uses separator
2026-09-16 Toolbar lit: Divider between group and bare control? → only between two adjacent ToolbarGroups
2026-09-16 Toolbar lit,web: separator length and negative spacing → separator wrapper block size; Divider spacing none, stretches; clamp at 0
2026-09-16 Toolbar lit,web: overflowButton part is inside Menu's own trigger → Menu trigger props named; no Toolbar hook on it
2026-09-16 Toolbar lit,web: SegmentedControl always prevents arrows, focus trapped → in a toolbar it stops wrapping, leaves edge arrows/Home/End (segmentedcontrol.md)
2026-09-16 Toolbar lit: arrows/Home/End in text-entry controls → toolbar never takes them from inputs; put such controls last
2026-09-16 Toolbar lit,web: overflowLabel missing has no fallback → falls back to label then text, dev warning once per control
2026-09-16 Toolbar lit: reflected default size indistinguishable from authored → sized means a size attribute when discovered
2026-09-16 Toolbar lit: orientation scenarios web-only though Lit sets aria-orientation → both orientation scenarios run on web and lit
2026-09-16 Toolbar web: menu item calls onClick without an event → stated: onPress has no payload, handlers reading events are outside contract
2026-09-16 Toolbar web: roving selector drops tabindex -1 and native radios → narrowed selector written into web notes
2026-09-16 Toolbar web: one-tab-stop test checks one tabindex 0 → scenario description says exactly one control has tabindex 0
2026-09-16 Carousel rn: notes say Button has no focus callback → rn Button forwards onFocus/onBlur; focus pauses while it lasts
2026-09-16 Carousel rn: autoplay cleared on touch vs paused while touching → touch pauses while it lasts; only pause button or end stops
2026-09-16 Carousel rn: non-accessible adjustable region unreachable on iOS → adjustable role and actions move to each visible slide
2026-09-16 Carousel rn: increment/decrement action labels not in copy → copy.next and copy.previous
2026-09-16 Carousel rn,web,lit: paging near the end and loop with perView → min/max page formulas, loop wraps last page start, arrows disabled total ≤ page
2026-09-16 Carousel rn,lit: which dots are current with perView > 1, picker past end → every slide on the page; picker index clamps to total − page
2026-09-16 Carousel rn,lit: tab order play/prev/next/picker vs layout → web/Lit DOM order with grid; RN tree order play, prev, next, slides, picker
2026-09-16 Carousel rn,lit,web: tabs picker has no tokens → new tab* bindings (muted/strong, sm, medium, space.sm/md, focus-width underline) + contrast pairs
2026-09-16 Carousel rn: tab weight can't animate → weight constant; transition covers dot background and tab colour
2026-09-16 Carousel rn,lit: controlSurface radius only in prose → new controlRadius binding radius.full
2026-09-16 Carousel rn,lit: controlOffset has no part; play button position → inline inset of controlSurface; play row above viewport at pickerOffset
2026-09-16 Carousel rn,web: composed Buttons can't carry part hooks → wrapper span/View per part; arrows' wrapper inside controlSurface
2026-09-16 Carousel rn,web,lit: how the visible count is measured → page is perView above viewport width layout.maxWidth.prose, else 1
2026-09-16 Carousel rn: programmatic scrolls misreported as swipe → swipe only for user-started scrolls, per platform signal
2026-09-16 Carousel rn,web: interval warning repetition and condition → once per instance, only while autoplay is on, raised in every build
2026-09-16 Carousel rn,lit,web: aria-live on track vs separate liveRegion → only liveRegion is live (off rotating, polite otherwise); RN too
2026-09-16 Carousel rn,lit,web: example slides call for photos and images → Cards with headings as labelled stand-ins
2026-09-16 Carousel lit: composition lists too few Button props → arrows iconOnly secondary; play secondary, not default variant
2026-09-16 Carousel lit: slide name joiner for n of total plus heading → name is copy.slideLabel alone; heading read as content
2026-09-16 Carousel lit,web: CarouselSlide has no schema → label: string required plus children; missing label falls back to goTo with warning
2026-09-16 Carousel lit,web: picker arrows wrap or respect loop? → wrap as Tabs, one slide, reason picker, roving tabindex for dots and tabs
2026-09-16 Carousel lit: autoplay end state without loop → counts as stopped; play restarts from the first slide
2026-09-16 Carousel lit: slideGap on slotted slides → the track's gap; slotted slides get data-part=slide
2026-09-16 Carousel lit: pickerOffset application → a gap between rows, not a margin
2026-09-16 Carousel lit: controlled activeIndex kept after swipe → scrolls back to activeIndex
2026-09-16 Carousel lit: picker accessible name unspecified → new copy.pickerLabel "Choose a slide" on dots group and tablist
2026-09-16 Carousel web: scrollIntoView scrolls the page → scroll the viewport directly, instant under reduced motion and first positioning
2026-09-16 Carousel web: tabs picker slides tabpanel vs group → tabpanel with roledescription slide when picker is tabs
2026-09-16 Carousel web: onChange programmatic ambiguous → autoplay and swipe only; controlled activeIndex change never fires
2026-09-16 Carousel web: does play override the focus it caused → play clears hover/focus/touch pauses; touch pointerenter is not hover
2026-09-16 Carousel web: minTarget names no part → arrow controlSurface hit area and tab minimum block size
2026-09-16 Carousel web: aria-hidden and inert both listed → both set on slides outside the visible page
2026-09-16 Carousel rn: Keyboard story has no given → TOOLING
2026-09-16 Table rn: phones always stacked vs responsive scroll → responsive wins on every width; stack below prose only
2026-09-16 Table rn,web: phone vs tablet and hideBelow in scroll → measured table width vs prose; hideBelow applies in stack only
2026-09-16 Table rn: synced row-header list drifts → row-header cells translated by scroll offset, no second list
2026-09-16 Table rn: scrollFade needs a gradient → react-native-svg as Toolbar; edges fade only with hidden columns
2026-09-16 Table rn: arrow-key scrolling has no native hook → stated limit: scroll region scrolls by swipe only
2026-09-16 Table rn,lit: no binding between stacked row blocks → new stackedBlockGap layout.gap.tight; blocks outlined with rowBorder
2026-09-16 Table rn,lit,web: selected bar drawing and layout shift → inset shadow on first cell (web/Lit); RN reserves border always
2026-09-16 Table rn,lit,web: sort-arrow transition impossible → transition covers hover background only; arrow swaps instantly
2026-09-16 Table rn: which sort phrase is the accessibleName → the phrase for what the press will do
2026-09-16 Table rn,web: forwards give no default; cellGap to iconGap → composition forwards to Heading and Button, Table value always passed
2026-09-16 Table rn: footer typography without cascade → string footer in Text with table font bindings; other content own
2026-09-16 Table rn,lit,web: loading text placement with and without rows → emptyState without rows; muted live Text below table with rows
2026-09-16 Table rn,web: rowCount placement and locale, announcements on native → RN accessibilityHint; web document lang; RN live regions plus iOS announce
2026-09-16 Table rn: stacked Toolbar sort Buttons lack testID → stated: no Table.sortButton testID there
2026-09-16 Table rn: shape strings verbatim vs exactOptionalPropertyTypes → TOOLING
2026-09-16 Table rn: meta.args leak into example stories → TOOLING
2026-09-16 Table lit: onRowPress opt-in can't see listeners → Lit rows pressable only with pressable-rows attribute
2026-09-16 Table lit: captionLevel attribute name → unreflected caption-level
2026-09-16 Table lit,web: single selection header cell → empty td role=cell with no part
2026-09-16 Table lit,web: numericFont fallback undetectable → always mono family plus tabular-nums on end-aligned body cells
2026-09-16 Table lit,web: stickyHeader inside scroll region → sticks only with maxHeight viewport; otherwise no effect in scroll
2026-09-16 Table lit: width min/fill sizing rule → min 1% nowrap, fill takes remaining width
2026-09-16 Table lit,web: sortToolbarLabel and cellLabel unused on web/Lit → stated as RN and SwiftUI only
2026-09-16 Table lit: aria-busy target in shadow root → the shadow table element, which also carries the name
2026-09-16 Table web: sortButton can't carry data-part → no own hook; the Button inside columnHeader
2026-09-16 Table web: visually hidden thead hides focusable controls in stack → select-all and sortable headers stay visible as a wrapping row
2026-09-16 Table web: maxHeight viewport scroll element → frame around table (scroll region in scroll mode), observer root
2026-09-16 Table web: ::before label can't be aria-hidden → content alt text empty with plain fallback
2026-09-16 Table web: row header label in stack mode → no data-label; it is the row's name
2026-09-16 Table web: onRowPress by pointer outside the Button → click anywhere outside a control fires it on web and Lit
2026-09-16 Table web: actions header part → columnHeader part like the others
2026-09-16 Table web: Checkbox registers with Form inside a table → doc says not form fields; Checkbox opt-out to CODE
2026-09-16 DataGrid rn: FlatList role grid vs list as body rowgroup → FlatList is the grid; only the header row has a rowgroup
2026-09-16 DataGrid web,lit,rn: onCellChange value cannot be undefined → value/previous shapes add `| undefined`
2026-09-16 DataGrid rn: number and date editors have no blur → commit on another press or `activate`; `escape` cancels
2026-09-16 DataGrid rn: editable-cell hint hard-coded English → copy.editHint, rn only
2026-09-16 DataGrid web,lit,rn: caption heading level unspecified → new `captionLevel` prop, as Table
2026-09-16 DataGrid web: captionSize/Weight reach the Heading how → composition forwards to fontSize/fontWeight; marginBlockEnd space.0
2026-09-16 DataGrid rn: default column width 160 literal → `columnWidth` binding, space.20 × 2
2026-09-16 DataGrid rn: cellInvalidForeground has nowhere to go → status bar message on a re-scoped cellInvalidBackground span
2026-09-16 DataGrid web,lit,rn: cellMutedColor has no stated use → existing cell text while `loading`
2026-09-16 DataGrid rn,web: viewport height, native and caption/status bar → whole component fits; window height on native
2026-09-16 DataGrid web,lit,rn: onRangeNeeded window size and end inclusive → one page from data.length, end inclusive, never on mount
2026-09-16 DataGrid rn,web: editor inset-zero overrides mapping → per editor names in web notes; Checkbox none
2026-09-16 DataGrid rn: Select editor opening and BottomSheet source → opens at once, closing without choice cancels; sheet is Select's own
2026-09-16 DataGrid rn: pinned order and shadow edges → pins keep order; start pins shade end edge, end pins start edge
2026-09-16 DataGrid rn,web: resize handle on touch and keyboard → always visible on native; not focusable, Shift+Arrow on header; new resizeHandle part
2026-09-16 DataGrid rn: rowHover on native and select cell → pressed fill, select cell included, selected row wins
2026-09-16 DataGrid lit,web: Escape clears range with no empty member → fires nothing; collapse fires one-cell range once
2026-09-16 DataGrid lit,web: unchanged commit fires onCellChange? → only when value differs (Object.is); validate still runs
2026-09-16 DataGrid lit: Delete clears what, validate runs? → per-mode scope, none clears nothing, validate skipped
2026-09-16 DataGrid lit: minWidth floor for resize → minWidth defaults to and never below size.target.min
2026-09-16 DataGrid lit: numericFont target → cells whose raw value is a number, no render
2026-09-16 DataGrid lit: scrollRegion and grid one element or two → two nested; ring on scrollRegion, role/focus on grid
2026-09-16 DataGrid lit,web: statusBar Text with surface, live region vs position → div part with inner role=status span; counts outside it
2026-09-16 DataGrid web: status bar item spacing → new statusBarGap binding, no separator characters
2026-09-16 DataGrid lit,web: Control chords ignore Meta → Control or Meta everywhere in the table
2026-09-16 DataGrid lit,web: pointer row selection rules → select cell/Ctrl-click toggle, Shift-click adds from anchor, plain click focuses
2026-09-16 DataGrid lit: Enter inside select/date editors → belongs to the open popup; date commits from its text field
2026-09-16 DataGrid lit,web: scrollHint placement → status bar while overflowing and not yet scrolled sideways
2026-09-16 DataGrid lit,web: abbr on sortable vs non-sortable headers → non-sortable name is abbr; sortable keeps sort copy
2026-09-16 DataGrid lit: stickyHeader with height content → sticks to the grid's scroll region only, never the page
2026-09-16 DataGrid lit: Home/End/Page keys collapse a range? → every plain navigation key collapses
2026-09-16 DataGrid lit: render type on Lit → lit-renderable value (TemplateResult, string, number)
2026-09-16 DataGrid web: onEditStart preventDefault with positional payload → return false on web and rn
2026-09-16 DataGrid web: selection column width binding → selectColumnWidth, size.target.min plus 2 × cellPaddingInline
2026-09-16 DataGrid web: window before first row measurement → token row size, at most 50 rows
2026-09-16 DataGrid web: sortButton data-part overwritten by Button → grid-owned span; header weight/size forwarded to Button
2026-09-16 DataGrid web: cell mode selection visual → focus ring only; fires on every move
2026-09-16 DataGrid web: Space opens editor in none/cell → Space is never an edit trigger
2026-09-16 DataGrid web: range fill vs pinned cells → fill beneath content, border above, pinned cells cover fill
2026-09-16 DataGrid web: clicked cell ring not :focus-visible → ring whenever grid has focus, pointer included
2026-09-16 TreeGrid web,lit,rn: onCellChange empty value coerced to '' → undefined, as DataGrid
2026-09-16 TreeGrid web,lit,rn: row/selection totals visible or loaded → every loaded row at every level
2026-09-16 TreeGrid rn: row header label format and leaf count → copy.level and copy.childCount joined; count omitted for leaves/unloaded lazy
2026-09-16 TreeGrid rn: native stand-ins for keyboard table → actions, expandAll/collapseAll, Checkboxes; `*`/Shift+Space/Ctrl+A none
2026-09-16 TreeGrid rn: press on editable parent row header → press toggles, long-press edits
2026-09-16 TreeGrid rn: select-all scope without selectChildren → every loaded row at every level, always
2026-09-16 TreeGrid rn,lit,web: DataGrid bindings not overridable here → stated; cellPaddingInline and fixedHeight added
2026-09-16 TreeGrid rn: posinset/setsize on native → stated absent; level and count only
2026-09-16 TreeGrid rn: expand Button inside accessible row header → Button hidden from AT; row actions are the path
2026-09-16 TreeGrid rn: uncontrolled sort vs caller sorts → grid sorts siblings when uncontrolled, as DataGrid
2026-09-16 TreeGrid lit,web: Shift+Arrow column resize dropped → kept on resizable header cells
2026-09-16 TreeGrid lit,web: PageUp/Down, Delete, type-to-edit omitted → new keyboard row, as DataGrid
2026-09-16 TreeGrid lit: ArrowLeft on level-1 row header → moves to the previous cell
2026-09-16 TreeGrid lit,web: `*` in defaultExpanded, lazy rows, controlled → non-empty loaded rows, live, never lazy; resolved on first toggle
2026-09-16 TreeGrid lit,web: `children: []` → a leaf
2026-09-16 TreeGrid lit,web: loading placeholder row navigation → navigable, level+1, loading in row header, other cells empty
2026-09-16 TreeGrid lit,web: Ctrl+Home header row or body → header row included, as DataGrid
2026-09-16 TreeGrid lit,web: indent padding vs indent part → spacer part at row header start
2026-09-16 TreeGrid lit,web: guide line offset → inside row header, cellPaddingInline + indent × depth + half expand button
2026-09-16 TreeGrid lit,web: indeterminate aria-selected and which acts cascade → false; all own-row toggles cascade, ranges don't
2026-09-16 TreeGrid lit,web: importing DataGridColumn / shared base → type import fine; shared base optional
2026-09-16 TreeGrid web: onExpand vs onExpandChange order → onExpand first; nothing when nothing opens
2026-09-16 TreeGrid web: expand Button props and chevron rotation → zero padding overrides, rotation on owned span, RTL mirror
2026-09-16 TreeGrid web: Enter on a leaf row header → DataGrid order: edit, else activate
2026-09-16 Tree rn: custom `activate` action hijacks double-tap → standard `longpress` action in multiple mode
2026-09-16 Tree rn: tap meaning in single and none → Enter's meaning; none does not toggle expansion
2026-09-16 Tree rn: href navigation on native → row calls Linking.openURL; routers use onActivate
2026-09-16 Tree rn,lit: label font bindings never reach Text → label forwards fontFamily, fontSize, lineHeight
2026-09-16 Tree rn: Link cannot take font size → Link tone inherit nested in label Text; no selected weight
2026-09-16 Tree rn: checkbox border width and checked edge → checkboxBorderWidth binding; border takes checkboxSelected when checked
2026-09-16 Tree rn: selection bar shifts layout → absolutely positioned at logical start, mirrored in RTL
2026-09-16 Tree rn: rowHover on touch → pressed fill, instant; selected wins
2026-09-16 Tree rn,web: onExpand first time vs retry → every open of a still-lazy node, as TreeGrid
2026-09-16 Tree rn: chevron color and accessibility → Button's own color; native chevron accessible and named
2026-09-16 Tree rn,lit,web: selectChildren cascade scope and parent id → enabled loaded descendants; parent id iff all selected
2026-09-16 Tree rn: `*` on native → not offered; no expand-all action
2026-09-16 Tree rn: container and group parts on native → root View is container; group has no element
2026-09-16 Tree lit: bare detail vs `ids` payload keys → bare values stated in lit notes; renderer to TOOLING
2026-09-16 Tree lit,web: expand vs expand-change order → onExpand first
2026-09-16 Tree lit,web: expandButtonSize on unsized Button → owned wrapper part sized both axes
2026-09-16 Tree lit,web: checkboxGap vs rowGap → checkbox followed by checkboxGap instead of rowGap
2026-09-16 Tree lit: Enter on href node → clicks the composed link, no onActivate; single selects first
2026-09-16 Tree lit,web: loading placeholder role → aria-disabled treeitem, not navigable, aria-busy parent
2026-09-16 Tree lit: selectedCount announcement timing → hidden status region, every user selection change, multiple only
2026-09-16 Tree lit,web: Control+a ignores Meta → Control or Meta
2026-09-16 Tree lit: type-ahead letters only → any printable character
2026-09-16 Tree lit: ArrowLeft to disabled parent → focus stays put
2026-09-16 Tree lit,web: `*` and disabled or lazy siblings → enabled siblings, focused included, lazy fire onExpand
2026-09-16 Tree lit,web: disabled parent expandable by pointer → no; chevron disabled, don't disable reachable parents
2026-09-16 Tree lit: selected fill on checked nodes → applies to aria-checked true
2026-09-16 Tree lit,web: ul role=tree has no part → no data-part; address by role
2026-09-16 Tree lit: emptyState Text props → tone muted
2026-09-16 Tree lit: CSS hooks don't reach forwarded children → stated: override forwarded bindings via overrides
2026-09-16 Tree web: `*` and lazy ids in defaultExpanded → loaded parents only; listed lazy ids stay closed
2026-09-16 Tree web: aria-activedescendant listed with roving tabindex → removed from attributes; roving only
2026-09-16 Tree web: no-op selection changes → fire only when the set changes
2026-09-16 Tree web: order of ids in events → selection tree order; expansion opening order
2026-09-16 Tree web: Shift+arrows with selectChildren or outside multiple → cascade like Space; plain arrows outside multiple
2026-09-16 Tree web: double-click toggles twice → detail ≥ 2 clicks don't toggle
2026-09-16 Tree web: Heading/Button data-part overwritten → heading and expandButton parts on owned wrappers
2026-09-16 Tree web: Heading-to-tree spacing → Heading's own marginBlockEnd
2026-09-16 Tree web: icon and badge color forwards → Icon forwards iconColor to color; badge is Text tone muted (Text.color locked)
2026-09-16 Tree web: RTL chevron and bar → both mirrored
2026-09-16 Feed rn: RN prose says Cards accessible, notes say un-collapsed → prose now matches notes: un-collapsed Cards with hidden runs
2026-09-16 Feed rn: string content crashes outside Text on native → items: component wraps string/number content in Text
2026-09-16 Feed rn,lit: no gap between timestamp and content in articleBody → new articleBodyGap (layout.gap.tight) forwarded to Stack overrides.gap
2026-09-16 Feed rn,web: emptyState has no inset, colour or size → new emptyStateInset/Color/Size mirroring the end message
2026-09-16 Feed rn,web: does fontFamily reach composed children → forwarded to every Text and the Button; Card heading keeps its own
2026-09-16 Feed all: articleInset token cannot map onto Card's inset enum → Card keeps inset md; forwarded to paddingBlock/paddingInline overrides
2026-09-16 Feed all: relative-time rounding, future times and absolute date style → floor; future is justNow; dateStyle medium, title adds timeStyle short; no ticking; unparseable shown raw
2026-09-16 Feed all: does onItemVisible fire again on re-entry → once per item id per mount
2026-09-16 Feed rn: clearing items to empty with hasMore stalls load-more → hasMore: fires whenever items empty and not loading, including after clear
2026-09-16 Feed lit: Ctrl+End and observer repeat rate while loading → at most once per items/hasMore/loading change; never while loading
2026-09-16 Feed rn: busy state on native undeclared → rn props add accessibilityState.busy following loading
2026-09-16 Feed lit: busy scenario excluded Lit though Lit is web → loading-marks-the-feed-busy platforms [web, lit]
2026-09-16 Feed rn: testID for root vs container part → outer View Feed, FlatList Feed.container
2026-09-16 Feed rn: newItemsOffset sticky row has no RN sticky → View above FlatList, never scrolls away
2026-09-16 Feed lit: aria-labelledby cannot cross into Card's shadow root → Card labels itself with aria-label; Feed sets no aria-labelledby
2026-09-16 Feed lit,web: unreadBorder has no part, Card must not be restyled → part article = Feed-owned wrapper drawing the bar, mirrored in RTL
2026-09-16 Feed lit: endMessageInset on composed Text, loadingInset no part → insets on Feed-owned wrappers carrying the part; loadingInset part loadingIndicator
2026-09-16 Feed lit: locked colours on composed Text owned by whom → Text tone muted plus size prop; size overrides forwarded to fontSize
2026-09-16 Feed lit,web: empty state when hasMore true and not loading → copy.empty only when hasMore false; otherwise blank
2026-09-16 Feed lit,web: order of hidden unread/position runs in articleBody → unread, timestamp, position, content
2026-09-16 Feed lit: feed commands from new-items button; focus after show-new → commands only inside articles; focus moves when first id changes, else stays
2026-09-16 Feed lit: label required with no default → empty label warns in development
2026-09-16 Feed web: Card and Button overwrite data-part → article and newItemsButton parts on Feed-owned wrappers
2026-09-16 Feed web: Text has no visually-hidden option → hidden runs are spans with Feed's visually-hidden class
2026-09-16 Feed web: timestamp time element inside Text span → <time> carries data-part and describedby id inside Text muted xs
2026-09-16 Feed web: onLoadMore says End / Ctrl+End, table only Ctrl+End → Ctrl+End only; plain End is not a feed command
2026-09-16 Feed web: live region element unnamed → always-rendered role=status new-items row; RN liveRegion polite, iOS unannounced
2026-09-16 Feed web: sticky new-items row stacking layer unnamed → new newItemsLayer binding on layer.raised
2026-09-16 Splitter rn: prose says AsyncStorage, prop says no storage dependency → prose now module-level memory map
2026-09-16 Splitter rn: prose says stack below prose as if fixed → all stackBelow values via onLayout; side by side before layout
2026-09-16 Splitter rn,web,lit: size-change-end when a drag collapses the pane → fires on release with last expanded size; rest of gesture ignored
2026-09-16 Splitter all: step below minSize collapses vs Home clamps → step clamps to minSize first, next step collapses; Home never collapses; collapse fires no size events
2026-09-16 Splitter rn,lit,web: separatorActive while focused has no native focus → :focus-visible plus dragging class/data-dragging; native dragging only
2026-09-16 Splitter rn,web: transition scope for colour and keyboard steps → only collapsed-state changes animate; native colour instant
2026-09-16 Splitter rn,web: grip rounded bar has no radius binding → new gripRadius (radius.full)
2026-09-16 Splitter all: collapse Button icons, colour and state semantics unspecified → chevrons toward primary when expanded, mirrored RTL; ghost foreground; aria-expanded/aria-controls
2026-09-16 Splitter rn: collapse Button cannot overlap outside separator on Android → positioned sibling from measured separator position
2026-09-16 Splitter rn: hitSlop ignored on react-native-web → handle is an absolutely positioned overflowing child View
2026-09-16 Splitter rn: accessibilityActions setMinimum/setMaximum have no labels → new copy.setMinimum/setMaximum; activate uses collapse/expand
2026-09-16 Splitter rn: hardware Enter/arrows on react-native-web do nothing → rn notes state it; accessibility actions and Button are the route
2026-09-16 Splitter rn: paneMinTarget minmax wording has no RN mapping → minWidth/minHeight on both panes, dropped for collapsed primary
2026-09-16 Splitter rn: string pane content crashes outside Text → primary/secondary: wrapped in Text on RN
2026-09-16 Splitter rn: sizeText percent rounding unspecified → rounded whole number for sizeText and aria-valuenow; events unrounded
2026-09-16 Splitter lit: controlled collapsed boolean attribute cannot express false → Lit collapsed is boolean|undefined reflected when true
2026-09-16 Splitter lit,web: key press at a bound fires size events? → neither fires; a drag always fires end on release
2026-09-16 Splitter lit,web: aria values while collapsed unspecified → valuenow 0, valuemin 0, sizeText 0
2026-09-16 Splitter lit,web: F6 with collapsed or stacked panes, Shift+F6 → skip unavailable zones; stacked primary↔secondary; no Shift+F6
2026-09-16 Splitter lit: collapse Button tab position and F6 zone → after separator in tab order; separator zone
2026-09-16 Splitter lit: permanent tabindex=-1 wrapper breaks delegatesFocus → tabindex=-1 only while F6-focused, removed on blur
2026-09-16 Splitter lit: collapse Button position while primary collapsed → aligns to secondary pane's start edge
2026-09-16 Splitter lit: @property ignored in shadow roots → Lit CSS.registerProperty in try/catch, same name and syntax as web
2026-09-16 Splitter lit,web: stackBelow breakpoint from token JSON unavailable → read loaded --layout-max-width-* property; never stacks without tokens
2026-09-16 Splitter lit: string primary/secondary in stories → slotted text in stories
2026-09-16 Splitter lit: narrow test viewport stacks and hides separator → separator scenarios given stackBelow: never
2026-09-16 Splitter lit: separator track size and paneMinTarget in grid template → minmax(paneMinTarget, size) separatorSize minmax(paneMinTarget, 1fr)
2026-09-16 Splitter web: Button inside role=separator is hidden from AT → track wrapper holds separator and sibling collapseButton wrapper
2026-09-16 Splitter web: collapseButton data-part overwritten by Button → span wrapper carries the part
2026-09-16 Splitter web: collapsed without collapsible → collapsed ignored unless collapsible
2026-09-16 Splitter web: RTL arrow keys vs mirrored primary → ArrowLeft/ArrowRight swap in RTL
2026-09-16 Splitter web: vertical splitter needs definite height → fills parent block-size 100%; parent needs definite height
2026-09-17 Icon web: inline md fallback when not inside a Text → web/Lit always inherit; md fallback is React Native only
2026-09-17 Icon web: guidance filled list omits play and pause → web guidance names play and pause; paths come verbatim from icon-paths.json
2026-09-17 Icon web: no scenario covers empty label being decorative → new scenario empty-label-is-decorative (aria-hidden / accessibilityElementsHidden)
2026-09-17 Icon lit: guidance host color inherit bypasses the color hook → Lit host uses color: var(--ds-icon-color); guidance snippet updated
2026-09-17 Icon lit: web inline-block vs Lit inline-flex host unexplained → Lit note: inline-flex host differs on purpose; [inline] is inline-block with font-size inherit
2026-09-17 Icon lit: decorative-beside-a-label example has no adjacent text → example says story wraps it in Text with demo word "Saved"
2026-09-17 Icon lit: Default story name unspecified for required name → name description: Default story renders check
2026-09-17 Icon rn: where overrides.color sits in the rn colour order → color prop > overrides.color > enclosing Text colour > color.foreground
2026-09-17 Icon rn: whether native receives vectorEffect at all → vectorEffect only when Platform.OS is web; native gets the scaled width
2026-09-17 Icon rn: fillRule/vectorEffect on Svg root or Path children → strokeWidth, fillRule, vectorEffect go on each Path
2026-09-17 Icon rn: guidance still names TextNestingContext and byte-identical web table → RN guidance uses TextStyleContext and paths from icon-paths.json
2026-09-17 Icon rn: importantForAccessibility auto when labelled missing from notes → rn notes add importantForAccessibility="auto" for labelled icons
2026-09-17 Icon rn: unknown-name empty glyph keeps accessibility props or not → keeps label/decorative props; unlabelled unknown icon stays hidden
2026-09-17 Icon rn: inline-in-running-text story needs surrounding text → example says story nests it in Text "Read the release notes"
2026-09-17 Text web: truncated inline-block span sits off the baseline → truncate span adds vertical-align: bottom
2026-09-17 Text web: consumer title versus generated truncate title precedence → a consumer title always wins, forwarded unchanged, with or without truncate
2026-09-17 Text web: does locked color binding get a CSS hook → no --ds-text-color hook; tone reads the token's custom property directly
2026-09-17 Text web: consumer style versus overrides merge order unspecified → consumer style merges after the overrides hooks and wins
2026-09-17 Text lit: part="text" guidance says for outside styling → Lit guidance: part is an anatomy name only, never ::part styling
2026-09-17 Text lit: truncate title scenario excludes Lit despite Lit rule → scenario platforms [web, lit]; Lit title sits on the part="text" element
2026-09-17 Text lit: title update timing when slotted text changes → title follows live edits via a MutationObserver over the host subtree
2026-09-17 Text lit: align start/end mechanism on Lit unstated → web and Lit use CSS text-align start|end, which follows dir live
2026-09-17 Text lit: onAction custom property name and default hook → default reads var(--color-foreground); onAction reads var(--color-foreground-on-action)
2026-09-17 Text rn: ToneOnAction story needs an action background → tone description: onAction story paints color.action.primary.background behind it
2026-09-17 Text rn: TextForegroundContext export location unspecified → exported from Text.tsx for siblings, not re-exported from index
2026-09-17 Text rn: ref type for Text root not ViewInstance → rn notes: ref is Ref<TextInstance>
2026-09-17 Heading web: [size] selector sentence meaningless for React headings → [size] sentence is Lit-only; web carries the resolved size as a modifier class
2026-09-17 Heading web: no runtime fallback for invalid level on web → missing/invalid level treated as 2 everywhere, one dev warning per element
2026-09-17 Heading web: locked color binding hook could break AAA pair → no --ds-heading-color hook; reads var(--color-foreground-strong) directly
2026-09-17 Heading web: browser default top margin has no binding → web note: UA margin-block-start reset to 0, a reset not a binding
2026-09-17 Heading web: Default story args not given → level description: Default story renders level 2 "Account settings"
2026-09-17 Heading lit: guidance part="heading" contradicts platform note part="text" → Lit guidance says part="text"
2026-09-17 Heading lit: web guidance class vs Lit attribute-selector size mechanism → web uses modifier class; Lit note: attribute selectors, [size] after [level]
2026-09-17 Heading lit: warn once scope and invalid level values → invalid treated as absent; warns once per element for its lifetime
2026-09-17 Heading lit: whether HeadingLevel type includes numbers → HeadingLevel is the string union; prop type adds 1–6
2026-09-17 Heading lit: heading role scenarios exclude Lit → both scenarios run on lit; rn asserts accessibilityRole header
2026-09-17 Heading rn: whether Heading provides TextStyleContext to inline children → Heading provides TextStyleContext with its size and colour; ref is TextInstance
2026-09-17 Stack web: consumer style versus overrides merge order → consumer style merged after overrides hooks; ref is Ref<HTMLElement>
2026-09-17 Stack web: examples give children as prose, not values → children description: stories render the named content with system components
2026-09-17 Stack web: wrapping-filters needs a narrow container to show wrapping → example: story decorator bounds the width, not an arg
2026-09-17 Stack web: consumer role on ul/ol versus forced list role → list role wins on ul/ol; consumer role passes through elsewhere
2026-09-17 Stack web: null/boolean children and li wrappers → null and boolean children are skipped and get no li
2026-09-17 Stack lit: guidance says wrap li via slotchange → Lit guidance: manual assignment rebuilt from childList observer, never slotchange
2026-09-17 Stack lit: consumer CSS gap hook at gap none → none reads var(--layout-gap-none) directly; hook ignored there
2026-09-17 Stack lit: element not reflected, styleable from outside or not → element is not reflected and is not a styling contract
2026-09-17 Stack rn: horizontal example rows stretch children with default align → button-row and wrapping-filters set align: center; Behavior says rows do
2026-09-17 Stack rn: button-row child order and Default story children → Cancel then submit; Default renders three Text children
2026-09-17 Stack rn: rn props style and accessibilityRole note disagree with element → style is internal; element on rn is Landmark or plain View
2026-09-17 Box web: radius none presence-gating versus written-out radius.none → radius.none written out and overrides.radius ignored at none
2026-09-17 Box web: surface none transparent versus no background and hook → none paints transparent explicitly and reads no hook
2026-09-17 Box web: Default story args differ from schema defaults → Default story uses highlighted-panel props
2026-09-17 Box web: ref type when element swaps the tag → ref is Ref<HTMLElement>
2026-09-17 Box lit: ElementInternals role unreadable by role tests → Lit sets a plain role attribute on the host; element scenarios run on lit
2026-09-17 Box lit: behavior prose lists section, Lit note lists main → scenario description names article, aside, main, nav
2026-09-17 Box lit: string children in examples on Lit slots → stories wrap string children in Text on every platform
2026-09-17 Box lit: element attribute versus property, not reflected → element set by attribute or property, not reflected
2026-09-17 Box rn: resolved override type on rn → overrides cast to the binding's own type (number or colour string)
2026-09-17 Pattern.SettingsPage web: Form has no reset contract for Cancel → Inputs controlled; Cancel restores saved copy; errors stay until next submit
2026-09-17 Pattern.SettingsPage web: Form label and field names not given → Form name=profile, no label; every field name listed in structure
2026-09-17 Pattern.SettingsPage web: TabPanels with sibling Fieldsets/Cards have no spacing → Notifications, Appearance, Account panels wrap children in Stack gap=loose
2026-09-17 Pattern.SettingsPage web: Card body children need spacing and alignment → each Card body is Stack gap=normal align=start
2026-09-17 Pattern.SettingsPage web: "the page says so" has no copy → Fieldset descriptions give the two preview-only sentences verbatim
2026-09-17 Pattern.SettingsPage web: initial values for Frequency, Color mode, density → Immediately, System, Comfortable
2026-09-17 Pattern.SettingsPage web: Tabs ids, Request export handler, AlertDialog confirm → ids lowercase; export has no handler; confirm only closes
2026-09-17 Pattern.SettingsPage lit: story title Patterns/Settings versus Patterns/SettingsPage → Acceptance says Patterns/SettingsPage
2026-09-17 Pattern.SettingsPage lit: Notifications controls outside Form, save path → page state, neither saved nor reset; Switch controlled
2026-09-17 Pattern.SettingsPage rn: where ToastProvider comes from on native → adopter app root; the story mounts one in a decorator
2026-09-17 Pattern.SettingsPage rn: AlertDialog placement and ScrollView versus Landmark order → AlertDialog after Container in main; ScrollView wraps Landmark main
2026-09-17 Button web: onClick signature versus onPress with no payload → web onClick receives the MouseEvent unchanged; contract adds no payload
2026-09-17 Button web: inverseHoverOpacity multiplier before or after an override → ×0.25 applies to the resolved token, override included; calc given
2026-09-17 Button web: className/style in props while conventions forbid forwarding → ButtonProps omits className and style
2026-09-17 Button web: disabled Form mechanism missing from the Form contract → web/rn read Form context disabled; Lit relies on ds-form
2026-09-17 Button web: icon-only example gives leadingIcon as prose → given reads `Icon name=close`
2026-09-17 Button lit: caller aria-describedby merge across the shadow root → Lit references only its internal id
2026-09-17 Button lit: whether locked bindings get --ds-button-* hooks → no hook for locked bindings; spinnerStroke the exception
2026-09-17 Button lit: how icon slots are hidden from assistive technology → slots not aria-hidden; unlabelled ds-icon hides itself
2026-09-17 Button lit: fontSize override does not move spinnerSize → spinnerSize independent; override both
2026-09-17 Button lit: backgroundHover state hover versus hover and pressed → :hover and :active on web/Lit, pressed on rn
2026-09-17 Button rn: spinner without leadingIcon widens the button → height kept; width grows by spinner plus iconGap, accepted
2026-09-17 Button rn: loadingSpin easing unspecified → linear
2026-09-17 Button rn: Icon color prop versus overrides.color for caller icons → callers pass Icon's `color` prop
2026-09-17 Link web: Tree stamps data-part onto Link's root → tree.md: `link` part is a span wrapper the tree owns
2026-09-17 Link web: colorHover with or without a hover media guard → plain :hover, no @media (hover: hover)
2026-09-17 Link web: focus ring outline-offset has no binding → new focusRingOffset binding on border.width.focus
2026-09-17 Link web: copy.external unused on web → YAML comment: SwiftUI only
2026-09-17 Link web: Default story args not given → inline-in-a-paragraph href/label are the Default args
2026-09-17 Link web: separate External/Download stories or not → the examples are those state stories
2026-09-17 Link lit: part attributes exposed while no ::part for styling → part and data-part both; names tests read
2026-09-17 Link lit: which element carries the label part → span data-part=label inside the anchor; none on rn
2026-09-17 Link lit: focusRingRadius rounding the resting inline anchor → radius only under :focus-visible
2026-09-17 Link lit: visually hidden pattern incomplete → full pattern listed, no legacy clip
2026-09-17 Link rn: tone inherit standalone label color → color.foreground for label and icon
2026-09-17 Link rn: underline color under tone inherit → no textDecorationColor; follows the Text color
2026-09-17 Link rn: ToneInherit story surrounding text → uses the inside-muted-text wrapper
2026-09-17 Input web: Form sets invalid versus context errors[name] → context entry is a Form-set invalid; order error, entry, copy
2026-09-17 Input web: whitespace-only text under required → only the empty string is empty
2026-09-17 Input web: how validity follows the precedence on web → setCustomValidity with copy; type step reads specific flags
2026-09-17 Input web: root font hooks kept when forwarded to Text → root hooks kept for label and field
2026-09-17 Input web: readOnly is not a schema prop → passes through native props; disabled forces it
2026-09-17 Input lit: transition override changes duration or easing → duration only; easing stays standard
2026-09-17 Input lit: clearing error with a separately set invalid → clears only error's implied invalid; Lit writes reflected false
2026-09-17 Input lit: formResetCallback behaviour unspecified → restores defaultValue; leaves invalid and error
2026-09-17 Input lit: which observable carries the disabled state → aria-disabled=true on the inner input
2026-09-17 Input rn: Text has no testID for part hooks → wrapper Views carry Input.<part> testIDs and the live region
2026-09-17 Input rn: transition override on native → kept in the type for parity, no effect
2026-09-17 Input rn: forwarded focus handlers receive an event or not → no arguments on web and rn
2026-09-17 Input rn: disabled-stays-focusable scenario contradicts native → description: rn asserts only the disabled state
2026-09-17 Form web: which web attribute exposes disabled → none on the form element; fields and actions report
2026-09-17 Form web: errorSummaryGap forwarding and hook → both Stacks' overrides.gap; no --ds-form hook
2026-09-17 Form web: summary shown before any submit → only after a failed submit; shrinks; removed on success
2026-09-17 Form web: plural locale read timing → at the failed submit
2026-09-17 Form web: summary item order → document order at submit; later errors appended
2026-09-17 Form web: closed Disclosure exclusion mechanism → field unmounted and unregistered; no Disclosure check
2026-09-17 Form web: sorting registrations by data-ds-field host → getElementById(id).closest; hostless fields last
2026-09-17 Form web: single action wrapped in a Stack or bare → single action bare; several in a consumer Stack
2026-09-17 Form web: unnamed or duplicate-named form ids → generated id fallback; duplicates an undetected authoring error
2026-09-17 Form lit: whether an empty array counts as empty → null, empty string and empty array contribute no key
2026-09-17 Form lit: summary heading and list arrangement → a Stack of heading and list Stack inside errorSummary
2026-09-17 Form lit: summary role, tabindex and href on Lit → web markup reused; href #id with default prevented
2026-09-17 Form lit: validate change also validating on blur → change only; every mode revalidates after a failed submit
2026-09-17 Form lit: empty message and empty label fallback → the field name
2026-09-17 Form lit: example input types for email and phone → given names type=email and type=tel
2026-09-17 Form rn: summary Link href on native → field name; onPress focuses the field and returns false
2026-09-17 Form rn: danger color reaching an inherit Link natively → each Link nested in Text tone=danger
2026-09-17 Form rn: summary alert role and focus target → View not accessible; focus to the summary heading Text
2026-09-17 Form rn: gap between fields or only fields block → direct children of the fields part; a Stack spaces itself
2026-09-17 Container web: example string Text element and Default children → Text defaults (p); Default children "Container content."
2026-09-17 Container lit: element missing from the reflect list → attribute-settable property, not reflected
2026-09-17 Container lit: host defaults before the first update → plain :host rules equal the prop defaults
2026-09-17 Container rn: column part testID → root keeps testID Container, no part testID
2026-09-17 Container rn: window width versus own width for the gutter → window width on rn; SwiftUI difference stated
2026-09-17 Container rn: width 100% inside a row parent → column parents only; row placement unsupported
2026-09-17 Card web: className clone fails since Link/Button drop it → clone with a data-ds-card-target attribute
2026-09-17 Card web: how web detects a disabled child → :has target with aria-disabled or :disabled
2026-09-17 Card web: focusable no-op when interactive fell back → no-op whenever interactive is set
2026-09-17 Card web: plain string Text element and numbers → Text defaults; numbers and array strings wrapped too
2026-09-17 Card web: interactive scenario on Default lacks a Link → scenario given has a top-level Link child
2026-09-17 Card web: scope of warns once → once per mounted card
2026-09-17 Card web: hoverBackground hover media guard → plain :hover, as Link
2026-09-17 Card lit: disabled target detection on Lit → disabled attribute or aria-disabled, MutationObserver
2026-09-17 Card lit: selectors for single-target and disabled hover rules → custom states has-target and target-disabled
2026-09-17 Card lit: warning timing when the body arrives late → on slotchange and interactive change, not first update
2026-09-17 Card lit: element that draws the focusable ring → outline on the surface part while host :focus-visible
2026-09-17 Card lit: consumer aria-label versus the heading label → card writes and removes only its own aria-label
2026-09-17 Card lit: z-index rows on plain cards → interactive cards only, web and Lit
2026-09-17 Card rn: Fragments among top-level children → a top-level Fragment is flattened
2026-09-17 Card rn: label source and Button press behaviour → child's full press behaviour; Button's label order
2026-09-17 Card rn: surface part hook on native → root is surface with testID Card
2026-09-17 Card rn: dense-grid example versus the Default heading arg → the story clears the Default heading
2026-09-17 Divider web: id and data-part on the composed label Text → platform attributes beyond the composition props
2026-09-17 Divider web: toolbar-groups siblings and row → Stack gap tight between "Bold Italic" and "Align left" Texts
2026-09-17 Divider web: label scenario never checks the accessible name → scenario adds name: or on web and Lit
2026-09-17 Divider web: ref type and rest target across hr/div → Ref<HTMLElement>; rest on whichever root renders
2026-09-17 Divider web: labelled lines centered or on the baseline → align-items center
2026-09-17 Divider lit: labelSize/fontFamily hooks versus forwarding only → no --ds-divider hooks; only overridden bindings forwarded
2026-09-17 Divider lit: block-size 100% collapses in an auto-height row → block-size auto, min-block-size 100%, align-self stretch
2026-09-17 Divider lit: label property versus markup attribute → property reading the attribute, not reflected
2026-09-17 Divider lit: part alongside data-part → both, anatomy names, not styling
2026-09-17 Divider lit: spacing override written at none → not written to the hook at none
2026-09-17 Divider rn: element span on native Text → not passed on native
2026-09-17 Divider rn: label testID when Text takes none → wrapper View with testID Divider.label
2026-09-17 Divider rn: spacing, line width and vertical stretch natively → root padding always; flex 1 lines; both stretch
2026-09-17 Divider rn: key of the second semantic warning → semantic plus label in effect
2026-09-17 Divider rn: section-boundary example contradicts rn silence → description says rn is silent and warns
2026-09-17 Alert rn: number body in label and iOS announcement → string or number body is text for both
2026-09-17 Alert rn: label separator given only for iOS announcement → label joined by ". " like the announcement
2026-09-17 Alert rn: who hides the decorative icon → unlabelled Icon hides itself; Alert adds no a11y props
2026-09-17 Alert rn: live-off scenario has no rn check → then accessibilityLiveRegion is null on rn
2026-09-17 Alert rn: role prop versus accessibilityRole on RN 0.87 → accessibilityRole and accessibilityLiveRegion, not role
2026-09-17 Alert lit: region containing a button delegates focus or not → no delegatesFocus; the alert is a region
2026-09-17 Alert lit: dismissMargin block/inline-end sides ambiguous → margin-block-start and margin-inline-end only
2026-09-17 Alert lit: next-focusable bare a and negative tabindex → a[href]; negative tabindex skipped
2026-09-17 Alert lit: next-focusable walk ignores shadow roots → flat tree walk, open shadow roots and slotted content
2026-09-17 Alert lit: body-text name omits ds-link label attributes → collapsed light-DOM textContent; attribute labels excluded
2026-09-17 Alert lit: what the --ds-alert-icon hook styles → locked, no overrides.icon and no hook
2026-09-17 Alert lit: icon box reads hook, glyph reads override → overrides.iconSize is the only supported input
2026-09-17 Alert lit: empty heading string → same as no heading on every platform
2026-09-17 Alert web: locked icon says override through overrides.icon → clause removed; locked, no override, no hook
2026-09-17 Alert web: next-focusable a without href → a[href]
2026-09-17 Alert web: visibility hidden or zero-size counts as unrendered → hidden attr, display none up the tree, visibility hidden; size not checked
2026-09-17 Alert web: disabled fieldset descendants count as disabled → :disabled, includes them
2026-09-17 Alert web: icon-box math needs a heading signal → data-has-heading on the root, no :has()
2026-09-17 Alert web: fontSize/lineHeight parts versus icon math → hooks on root inherited; heading uses container lineHeight
2026-09-17 Alert web: icon-size hook and forwarded token can diverge → overrides.iconSize is the only supported input
2026-09-17 Alert web: no scenario for focus move on dismiss → web and Lit add a hand-written next/previous/none test
2026-09-17 Alert web: consumer aria-label versus content name → name always from content; consumer aria-label/labelledby dropped
2026-09-17 Breadcrumb rn: Text has no testID for the link part → wrapper View around the Text carries Breadcrumb.link
2026-09-17 Breadcrumb rn: ellipsis Icon colour when Button does not colour icons → explicit color color.action.ghost.foreground
2026-09-17 Breadcrumb rn: current-page label clashes with nav label prop → '<item.label>, <copy.current>'
2026-09-17 Breadcrumb rn: native focus fallback unreachable by hardware keyboard → setAccessibilityFocus on index-1 View; screen reader only
2026-09-17 Breadcrumb rn: pressing link wrapper testID misses the Link → tests press the Link found by role link
2026-09-17 Breadcrumb rn: items href optional under exactOptionalPropertyTypes → href?: string | undefined
2026-09-17 Breadcrumb rn: gap override in list and inside items → applies in both places
2026-09-17 Breadcrumb lit: focus-fallback li has no focus-visible style → new focusRing/focusRingWidth bindings on item, web and Lit
2026-09-17 Breadcrumb lit: tabindex=-1 on revealed li removed later → set once and left, even when items change
2026-09-17 Breadcrumb lit: Lit asserting role=navigation in shadow root → role asserted on web only; Lit via accessible name
2026-09-17 Breadcrumb web: focus-fallback li outline intended → yes, via focusRing/focusRingWidth on the fallback li
2026-09-17 Breadcrumb web: revealed range and items change before focus → indices 1..length−3 at press; fallback index 1
2026-09-17 Breadcrumb web: no part for a plain-text ancestor → text inside item, no part, takes itemColor
2026-09-17 Breadcrumb web: display value of link/expand wrapper spans → no display set; inline in the item row
2026-09-17 Checkbox rn: disabled prop removes Pressable focus → accessibilityState.disabled plus press guard, no disabled prop
2026-09-17 Checkbox rn: value prop meaningless on native → accepted (default 'on'), no effect on RN
2026-09-17 Checkbox rn: error announcement while errorSummary is on → summary announces; live region none, no iOS announcement
2026-09-17 Checkbox rn: focus border versus invalid border precedence → invalid colour never hidden by focus; only width changes
2026-09-17 Checkbox rn: invalid versus selected border on checked box → invalid wins in every state; fill stays selected
2026-09-17 Checkbox rn: wide controlBorderWidth override thins focused border → focused width is max(focusRingWidth, controlBorderWidth)
2026-09-17 Checkbox rn: transition covers check-to-dash glyph swap → fill and border colour only; glyphs swap instantly
2026-09-17 Checkbox rn: derived copy versus validate() order → error > required-and-unchecked > invalid regardless of invalid
2026-09-17 Checkbox rn: vertical alignment for multi-line label → start-aligned; control centred on the label's first line
2026-09-17 Checkbox lit: indicator cannot fade when unchecked renders nothing → indicator not animated
2026-09-17 Checkbox lit: required validity order versus rendered error → validity error > valueMissing > invalid; message waits for invalid
2026-09-17 Checkbox lit: re-setting indeterminate to the same value → cleared state resets only on a value change
2026-09-17 Checkbox lit: checked attribute changes after mount → also set live state; reset restores attribute else defaultChecked
2026-09-17 Checkbox lit: clicks on the error message → outside the hit area, do nothing
2026-09-17 Checkbox lit: Form-message step has no Lit channel → Lit order is error, then invalid-derived copy
2026-09-17 Checkbox web: web input controlled internally for the indicator → never React-controlled; state mirror for indicator only
2026-09-17 Checkbox web: indicator transition impossible when unmounted → fill and border colour only
2026-09-17 Checkbox web: invalid versus selected border on checked box → invalid wins in every state
2026-09-17 Checkbox web: bare invalid renders a role=alert message → invalid description says so
2026-09-17 Checkbox web: inline alignment of error below the row → indented by controlSize + gap on every platform
2026-09-17 Checkbox web: partGap between label and description forwarding → whole text column forwards clicks to the input
2026-09-17 Disclosure rn: useReducedMotion resolution undetectable for first snap → first placement always direct; later changes animate unless reduced
2026-09-17 Disclosure rn: keepMounted closed panel in accessibility tree → display none plus hidden-descendants props
2026-09-17 Disclosure rn: useNativeDriver for the chevron transform → Platform.OS !== 'web'
2026-09-17 Disclosure rn: package Text lacks summary font overrides → package Text with overrides; plain RN Text as stopgap
2026-09-17 Disclosure rn: ignored press then same-value open change → counts as the echo; no controlled
2026-09-17 Disclosure lit: toggle collides with native ToggleEvent name → deliberate exception stated
2026-09-17 Disclosure lit: markup cannot express controlled closed → property only for controlled closed
2026-09-17 Disclosure lit: how long focus counts as within the panel → until a focusout with relatedTarget outside; null does not clear
2026-09-17 Disclosure lit: hidden host and panel need display none → both rules stated in lit notes
2026-09-17 Disclosure lit: no scenarios for controlled and echo rules → new scenario controlled-open-change-reports-controlled
2026-09-17 Disclosure web: controlled after-change timing means request → controlled fires from press handler; uncontrolled after commit
2026-09-17 Disclosure web: two clicks before any echo → only the latest request is remembered
2026-09-17 Disclosure web: trigger has no line-height binding → new triggerLineHeight binding on font.lineHeight.normal
2026-09-17 Disclosure web: children missing from owned button attributes → children omitted from button props; it is panel content
2026-09-17 Disclosure web: where a consumer id goes → trigger button; panel id <id>-panel or useId()
2026-09-17 Fieldset rn: RN Text has no element prop → element span not passed on native
2026-09-17 Fieldset rn: fragments count for the required indicator natively → fragments flattened on web and RN
2026-09-17 Fieldset rn: context legend includes required indicator → visible legend shows it; context carries bare legend
2026-09-17 Fieldset rn: disabledOpacity target and group error dimming → legend/description wrappers dim; error never dims
2026-09-17 Fieldset rn: fontFamily/lineHeight part legend but forward to three → part names the first; forwards decide
2026-09-17 Fieldset rn: legend scenario web/lit only versus rn name check → name via derived accessible-name scenario on rn
2026-09-17 Fieldset rn: empty-string description or error → counts as unset
2026-09-17 Fieldset lit: which bindings get a --ds-fieldset hook → only partGap and disabledOpacity; forwarded-only get none
2026-09-17 Fieldset lit: forwarded bindings always or only when overridden → always sent as resolved token; Stack gets no gap
2026-09-17 Fieldset lit: single part versus multi-part descriptions → part names the first; forwards and descriptions govern
2026-09-17 Fieldset lit: wrapper elements for description, fields, errorMessage → Fieldset-owned divs with data-part and part
2026-09-17 Fieldset lit: indicator counts required property or attribute → either counts; empty group shows none
2026-09-17 Fieldset web: NumberInput nested deeper not disabled by group → no field reads a context; deeper fields need disabled themselves
2026-09-17 Fieldset web: what counts as a field before render → component elements or native form controls
2026-09-17 Fieldset web: element for the description part → div data-part=description with id around the Text
2026-09-17 Fieldset web: required indicator plain string or styled span → plain text inside the legend Text
2026-09-17 Landmark rn: strings mixed with elements in children → each string/number child wrapped in Text
2026-09-17 Landmark rn: role stories inherit Default label Main → label undefined for roles that take none
2026-09-17 Landmark rn: label on complementary or search on RN → dropped silently; only navigation/region/form take it
2026-09-17 Landmark rn: no RoleForm story label → region "Related articles", form "Sign in"
2026-09-17 Landmark lit: guidance uses label attribute that does nothing → aria-label="Main"; label is property-only
2026-09-17 Landmark lit: label reflection versus roles without labels → conditional; element writes aria-label itself
2026-09-17 Landmark lit: no copy for three dev warnings → exact strings in Behavior
2026-09-17 Landmark lit: duplicate scan misses native-element peer roles → role attribute else implicit tag role
2026-09-17 Landmark lit: no labelledBy property on Lit → host aria-labelledby attribute, resolved in getRootNode()
2026-09-17 Landmark lit: aria-labelledby changes do not re-run warnings → not watched, stated
2026-09-17 Landmark lit: Default label carries into page-main example → examples set exactly their given, label undefined otherwise
2026-09-17 Landmark lit: role scenarios merge Default label → per-role scenarios clear label
2026-09-17 Landmark web: no copy for duplicate-main and shared-label warnings → exact strings in Behavior
2026-09-17 Landmark web: examples inherit Default label → given plus label undefined unless named
2026-09-17 Landmark web: unlabelled region with as=div → as rule wins; role=region emitted, still warns
2026-09-17 Landmark web: aria-labelledby on banner/main/contentinfo → dropped like label, with the warning
2026-09-17 Landmark web: Text style for example children → package Text defaults
2026-09-17 Meter rn: element span on native Text → not passed on native
2026-09-17 Meter rn: label and valueText testIDs without Text testID → Meter-owned wrapper Views carry them
2026-09-17 Meter rn: Intl locale source unnamed → Intl.NumberFormat(undefined) runtime default on every platform
2026-09-17 Meter rn: radius on the fill too → track clips and fill carries the same radius
2026-09-17 Meter rn: header layout and long label overflow → space-between, baseline, label wraps; wrapper flexShrink 1
2026-09-17 Meter rn: max<=min 0% locale formatting → same formatter
2026-09-17 Meter rn: animate or snap on min/max with resize → fraction change animates; layout-only or combined snaps
2026-09-17 Meter lit: forwarded bindings via overrides or hooks → overrides only; no --ds-meter hook, no --ds-text writes
2026-09-17 Meter lit: Intl locale source unnamed → runtime default locale
2026-09-17 Meter lit: fontFamily/lineHeight part header meaning → cover both header Texts; header element unstyled
2026-09-17 Meter lit: valueText attribute name and reflection → value-text, not reflected
2026-09-17 Meter web: Intl locale may differ server and browser → runtime default locale, stated
2026-09-17 Meter web: Texts need id and data-part beyond listed props → anatomy plumbing allowed: data-part both, id on label
2026-09-17 Meter web: header font hooks dead for consumer CSS → no hook or header rule for forwarded-only bindings
2026-09-17 Meter web: default tokens of forwarded bindings forwarded → only when overridden
2026-09-17 Meter web: non-finite min or max → min counts as 0, max as 100
2026-09-17 Meter web: max<=min warning text and repetition → exact message; once per distinct invalid pair
2026-09-17 Meter web: aria-valuenow rounded or exact → exact clamped value; only the text is rounded
2026-09-17 Meter web: fill radius or track clipping → track clips and fill carries the radius
2026-09-17 RadioGroup rn: legend/radioLabel typography without composition → composed Texts with bindings as overrides
2026-09-17 RadioGroup rn: optionPaddingBlock part and radio testID node → binding has no part; Pressable row is radio with testID
2026-09-17 RadioGroup rn: fontFamily/lineHeight on legend and radioLabel → applied directly and forwarded to every Text
2026-09-17 RadioGroup rn: dot radius follows controlRadius → dot always a circle
2026-09-17 RadioGroup rn: accessibilityState disabled on group root → listed; group View carries it
2026-09-17 RadioGroup rn: what transition animates → selected border colour and dot opacity; invalid/focus instant
2026-09-17 RadioGroup lit: Form-message step has no Lit channel → Lit order error, then copy while invalid
2026-09-17 RadioGroup lit: ds-form never sets invalid on failing group → app sets invalid or error from ds-form's invalid event
2026-09-17 RadioGroup lit: optionPaddingBlock part radio pads the row → no part; targets the row wrapper
2026-09-17 RadioGroup lit: control outer size when focus border thickens → border-box, outer size unchanged
2026-09-17 RadioGroup lit: radio and legend missing from Lit part list → part/data-part legend, radio, description listed
2026-09-17 RadioGroup lit: defaultValue as attribute → default-value attribute
2026-09-17 RadioGroup web: forwarded-only helper/description/error hooks → no --ds-radio-group hooks; overrides only
2026-09-17 RadioGroup web: disabled guards omit arrow and Space keys → click, change, arrows and Space guarded
2026-09-17 RadioGroup web: validate() order versus display order → error, required, invalid
2026-09-17 RadioGroup web: optionPaddingBlock part radio versus row wrapper → no part; row wrapper
2026-09-17 RadioGroup web: dot diameter reads non-binding space.1 → new indicatorInset binding; diameter controlSize − 2 × indicatorInset
2026-09-17 RadioGroup web: thick focus border could clip the dot → dot keeps size; fits while indicatorInset ≥ focusRingWidth
2026-09-17 Switch rn: disabled switch Form registration contradicts RN Form → disabled adds no key on any platform
2026-09-17 Switch rn: disabledOpacity parts versus whole element → RN dims the whole Pressable row
2026-09-17 Switch rn: native Switch taller than the label line → centres on the line slot, overflows evenly
2026-09-17 Switch rn: disabled example says focusable versus RN limit → focusable except on React Native
2026-09-17 Switch lit: checked attribute initial only versus Lit converter → later attribute changes set live state; reset reads attribute
2026-09-17 Switch lit: aria-disabled switch submitted by native form → setFormValue null while disabled
2026-09-17 Switch lit: thumb no hook versus overridable thumb bindings → thumb is a span part with --ds-switch-thumb-* hooks
2026-09-17 Switch lit: ::before thumb invisible in Firefox → aria-hidden thumb span, not ::before
2026-09-17 Switch lit: helperSize has no hook → forwarded-only bindings get no hook; overrides only
2026-09-17 Switch lit: controlled-updates-on-set without controlled mode → plain property write on Lit
2026-09-17 Switch lit: required always false implementation → readonly getter returning false
2026-09-17 Switch web: one-line 44px row centring → row centres content; track slot one line tall
2026-09-17 Switch web: controlled switch DOM checked sync → defaultChecked, reset in handler, effect syncs
2026-09-17 Switch web: next-equals-checked guard unreachable on web → guard only on RN/SwiftUI
2026-09-17 Switch web: styles key off :checked or aria-checked → [aria-checked='true']
2026-09-17 Switch web: disabledOpacity on composed description Text → on track and text column wrappers
2026-09-17 Switch web: RTL selector misses inherited dir → :dir(rtl); Lit :host(:dir(rtl))
2026-09-17 Switch web: nameless switch inside a Form → does not register; id from useId
2026-09-17 FocusScope web: fieldset[disabled] exclusion disagrees with browser Tab order → walker uses :disabled only; links/tabindex in a disabled fieldset stay
2026-09-17 FocusScope web: reactivated scope can rise above still-active inner scope → stack is containment first, then activation order
2026-09-17 FocusScope web: pull-back target when last focused descendant is gone → first focusable, then wrapper under container, else leave
2026-09-17 FocusScope web: forward Tab from container wrapper, onEscapeAttempt unspecified → fires nothing; only while trapped, active, on top
2026-09-17 FocusScope web: empty-scope warning under autoFocus container → still warns, Tab has nowhere to go
2026-09-17 FocusScope web: restore marker removed along with opener's parent → restore after nearest surviving recorded ancestor
2026-09-17 FocusScope web: data-part scope wins, overlays pass focusScope → kept scope wins; overlays logged to CODE
2026-09-17 FocusScope web,lit,rn: example children are prose, story controls unnamed → Behavior names Close, Apply filters, Accept/Decline, Options; Keyboard First/Second/Third; Default passes children in args
2026-09-17 FocusScope lit: third keyboard rule has no platforms list → platforms web, lit, rn, swiftui; native order, no handler
2026-09-17 FocusScope lit: no context on Lit for stack parent link → containment walks composed tree (parentNode, shadow host)
2026-09-17 FocusScope lit: anchor tabindex static vs conditional on container → tabindex=-1 only while autoFocus is container
2026-09-17 FocusScope lit: active reflected but attribute is negated → styled with [no-active]
2026-09-17 FocusScope lit: autoFocus waits for slotted updateComplete, depth unstated → slotted elements plus light-DOM custom descendants, not their shadow roots
2026-09-17 FocusScope rn: setAccessibilityFocus on non-accessible wrapper may no-op on iOS → stated as platform limit; collapsable false; accessibilityViewIsModal is the alternative
2026-09-17 FocusScope rn: next-focusable fallback has no document order → nothing restored when opener is gone
2026-09-17 FocusScope rn: when TextInput opener is captured → during first render, before children mount
2026-09-17 FocusScope rn: root scope part testID naming → bare testID "FocusScope"
2026-09-17 FocusScope rn: accessibilityViewIsModal renders aria-modal on react-native-web → omitted on react-native-web
2026-09-17 FocusScope rn: returnFocusTo when trigger Button takes no ref → ref a View collapsable false wrapping the trigger
2026-09-17 Tooltip web: class and hooks when data-ds and surface differ → bubble carries class/hooks/overrides; hidden span data-ds + ds-tooltip__description
2026-09-17 Tooltip web: children content type but must be one cloned element → web types it ReactElement
2026-09-17 Tooltip web: composed Text data-part and overrides beyond listed props → Text gets part hook and forwards; font bindings forward-only, value always passed
2026-09-17 Tooltip web: re-hovering dismissed uncontrolled tooltip before leaving → stays hidden until hover and focus both lost
2026-09-17 Tooltip web: exit fade needs bubble mounted after hide → stays mounted through exit fade
2026-09-17 Tooltip web,lit: which CSS property resolves a length token → hidden probe's padding-left, read in px
2026-09-17 Tooltip lit: custom-element trigger detection rule unstated → tag name contains a hyphen
2026-09-17 Tooltip lit: bubble mounted only while shown vs popover → Lit keeps it mounted, closed and aria-hidden
2026-09-17 Tooltip lit: controlled open vs hover/focus/blur changes → while open is set only Escape and open changes count
2026-09-17 Tooltip lit,rn: capture-phase Escape preventDefault and target → stopPropagation + preventDefault; window on react-native-web
2026-09-17 Tooltip lit,rn: warm-toolbar example has no sibling tooltip → example names a "List view" sibling with its own Tooltip
2026-09-17 Tooltip lit: Default story trigger variant unspecified → secondary Button
2026-09-17 Tooltip rn: does focus show the bubble on native → hover/focus handlers react-native-web only; native long-press only
2026-09-17 Tooltip rn: renders scenarios target hidden node rn lacks → root testID "Tooltip"
2026-09-17 Tooltip rn: grace after long-press release → hides at once; pointerGrace only on pointer leave
2026-09-17 Tooltip rn: Text element span has no rn prop → rn passes only size sm
2026-09-17 Toast web: region and dismiss export names unstated → ToastRegion, toast, dismiss
2026-09-17 Toast web,rn: does programmatic dismiss play exit transition → yes; only replaced skips it
2026-09-17 Toast web,lit: forwarded font bindings vs root hooks → forward-only, no --ds-toast hook, value always passed
2026-09-17 Toast web,lit: text binding part message vs container → foreground re-scoped on toast container, not message part
2026-09-17 Toast web: exit transition direction unspecified → reverse of enter, sinks by enterOffset while fading
2026-09-17 Toast web: dev warning once or on every change → each time a change enters the override case
2026-09-17 Toast web: escape scenario lacks focus step → description says the test focuses the dismiss button first
2026-09-17 Toast web: how long empty live region precedes content → one animation frame after auto-mount
2026-09-17 Toast lit: region hook names from tag or toast prefix → --ds-toast-stack-gap, -region-inset, -layer
2026-09-17 Toast lit,rn: durations for toast outside region or native → computed at the toast's own mount
2026-09-17 Toast lit: next focusable after region ignores shadow roots → FocusScope's walker, descends open shadow roots
2026-09-17 Toast lit: focus restore on action/replaced/programmatic removal → restore whenever a focused toast leaves, any reason
2026-09-17 Toast lit: stack order on phones unspecified → newest at the bottom at every width
2026-09-17 Toast lit: pause-while-touched event for Lit → pointerenter until pointerleave/pointercancel
2026-09-17 Toast lit: eviction count includes leaving toasts → toasts in exit transition do not count
2026-09-17 Toast rn: Text element span has no rn prop → rn passes only size md
2026-09-17 Toast rn: example duration long with action warns → background-result drops duration; examples pass persistent or none
2026-09-17 Toast rn: region accessible name on rn → accessibilityLabel from copy.regionLabel
2026-09-17 Toast rn: Button label/icon/onPress beyond listed props → data every platform passes; close Icon colored color.inverse.link on rn
2026-09-17 Toast rn: does Toast expose a ref → no ref; toasts are created by toast()
2026-09-17 Dialog web,lit,rn: open controlled-only contradicts uncontrolled-when-omitted template → Behavior: open is controlled only, no uncontrolled mode
2026-09-17 Dialog rn: body Box has no testID prop → body testID on a wrapping View, also the body focus target
2026-09-17 Dialog rn: which element carries the root testID → surface View with role and name; closed Modal renders nothing
2026-09-17 Dialog web,lit,rn: inset per part plus partGap doubles space between parts → inset pads inline edges plus the surface column's block edges once; partGap is the only space between parts
2026-09-17 Dialog lit: body forward lists paddingBlock only → body forward is inset → paddingInline; Box keeps zero block padding
2026-09-17 Dialog web,lit: forward via overrides versus CSS hook conflict → CSS hook always; overrides only when the caller overrides inset; rn always passes the resolved value
2026-09-17 Dialog rn: initialFocus first order never applies on native → rn first always lands on the body wrapper
2026-09-17 Dialog rn: layer has no effect in native Modal → layer: rn ignores it
2026-09-17 Dialog rn: focusRing bindings but no ring on rn → focusRing is web and Lit only; rn uses the screen-reader indicator
2026-09-17 Dialog rn: enter rise direction unstated → surface starts space.2 below and rises into place; exit is fade only
2026-09-17 Dialog rn: gutter as margin overflows; maxHeight literal → new gutter binding (layout.gutter): rn container padding, max height window − 2 × gutter; web/Lit cap 100vw/100dvh − 2 × gutter
2026-09-17 Dialog rn: KeyboardAvoidingView around body or whole container → wraps the whole centring container
2026-09-17 Dialog rn: onOpened primitive and interrupted enter → requestAnimationFrame; not fired if closed before enter finishes
2026-09-17 Dialog rn: enter animation when mounted already open → enter runs on first mount too
2026-09-17 Dialog rn: focus restore at exit start or end → restore runs when open becomes false (exit start)
2026-09-17 Dialog lit: ds-box overwrites data-part so body loses its part → Lit body and description parts are Dialog-owned wrappers; body is the scroll container
2026-09-17 Dialog lit: close watcher closes dialog without cancel → an unannounced native close while open is reported as escape exactly once, and reopened
2026-09-17 Dialog lit: heading tabindex on wrapper or ds-heading → tabindex -1 on the ds-heading; wrapper draws the ring
2026-09-17 Dialog lit: footer presence without a rendered slot → element children with slot=footer via MutationObserver; bare text is not a footer
2026-09-17 Dialog web: focusScope part cannot carry data-part → Dialog-owned element inside FocusScope wrapping the surface carries it
2026-09-17 Dialog web: Heading id/ref/tabIndex, close Button label beyond listed props → wiring every platform passes, not composition props
2026-09-17 Dialog web: description Text tone unspecified despite muted contrast pair → composition description is Text tone muted
2026-09-17 Dialog web: Box never scrolls, body needs a scroll wrapper → body part is a Dialog-owned scroll container holding the Box
2026-09-17 Dialog web: footer Stack cannot wrap on narrow viewports → footer composition props add wrap: true
2026-09-17 Dialog web,lit: Tab wrap said explicit but FocusScope provides it → FocusScope trapped implements the wrap; Dialog adds no handler
2026-09-17 Dialog web: heading tabindex only granted for title → also when the heading is the last fallback of first or close
2026-09-17 Dialog web: example stories inherit Default slots? → example stories start from blank args; reading-dialog has no footer
2026-09-17 Dialog web: scrim enter/exit timing → scrim fades with the surface, enter on open and exit on close
2026-09-17 Dialog web: initial focus placement vs showModal → Dialog focuses right after showModal and after a native re-open
2026-09-17 AlertDialog web,lit,rn: footer Stack direction/gap/justify not listed → footer composition props direction horizontal, gap tight, justify end
2026-09-17 AlertDialog web,lit,rn: default iconSize forwarded or Icon size prop → no Icon size prop; CSS hook on web/Lit, overrides only when set; rn always
2026-09-17 AlertDialog web,lit: footerGap unset case and root hook → forward delivery per CSS hook; only hook is --ds-alert-dialog-footer-gap
2026-09-17 AlertDialog lit,rn: locked icon color forwarded, unset case → always sent: --ds-icon-color per tone on web/Lit, overrides.color on rn
2026-09-17 AlertDialog rn: which element the accessible-name test targets → role, label, hint and viewIsModal on AlertDialog.surface
2026-09-17 AlertDialog rn: gutter called a margin → paddingHorizontal on centering View; maxHeight window − 2 × gutter
2026-09-17 AlertDialog rn: VoiceOver escape gesture unlisted → onAccessibilityEscape on the surface → onCancel('escape')
2026-09-17 AlertDialog rn: does the scrim fade → Animated.View opacity follows enter/exit, no press handler
2026-09-17 AlertDialog lit: where data-part lives on Lit → every composed part is an AlertDialog-owned wrapper
2026-09-17 AlertDialog web,lit: scrim ::backdrop vs clickable scrim part → real data-part=scrim element, transparent ::backdrop, no listener
2026-09-17 AlertDialog web,lit: who places initial focus before showModal → FocusScope autoFocus none; AlertDialog focuses Cancel after showModal
2026-09-17 AlertDialog web,lit: focusScope part has no home → owned element inside FocusScope wrapping the surface
2026-09-17 AlertDialog web,lit: which element width and gutter size → width and gutter on the surface; dialog fills viewport
2026-09-17 AlertDialog lit: rise distance a prose literal → new rise binding space.2; enter/exit one duration for scrim and surface
2026-09-17 AlertDialog lit: Enter expect closes but element never closes → Enter activates the button; the request fires, the consumer closes
2026-09-17 AlertDialog web: layer names a nonexistent fallback → layer has no effect on any platform
2026-09-17 AlertDialog web: Keyboard story opener borrows confirmLabel → opener labelled with the heading text
2026-09-17 AlertDialog all: shared wiring, inset, blank-args example stories → Behavior wiring sentence, S3 inset description, blank-args sentence
2026-09-17 ActionSheet rn: heading Text element p has no rn prop → rn passes tone muted and size sm only
2026-09-17 ActionSheet rn: actions optional fields fail exactOptionalPropertyTypes → each optional field also accepts explicit undefined
2026-09-17 ActionSheet web,rn: divider sentence mixes the two dividers → danger divider role=separator in menu; cancel divider hidden from AT
2026-09-17 ActionSheet web,rn: empty header when not dismissible and no heading → header not rendered
2026-09-17 ActionSheet rn: heading forwards default or override only → CSS hook on web/Lit, overrides only when set; rn always resolved
2026-09-17 ActionSheet rn: velocity measurement via gestureState.vy → last two move samples by event timestamps, as BottomSheet
2026-09-17 ActionSheet rn: no separate slop conflicts with BottomSheet → new dragSlop constant space.1; offset from slop crossing
2026-09-17 ActionSheet rn: accessibilityViewIsModal listed as Modal prop → View prop on the surface
2026-09-17 ActionSheet rn: story wrapper args and trigger → wrapper calls onAction/onClose args, renders no trigger; blank-args examples
2026-09-17 ActionSheet lit: forwarded ref claim on Lit → Lit exposes no ref-like property
2026-09-17 ActionSheet lit: wrapper-part rule only in web notes → Lit parts are owned wrappers (cancelButton row, itemIcon span, heading)
2026-09-17 ActionSheet web,lit: action/close suppression mechanism → Menu fires action close before onAction; later mapped closes dropped until reopen
2026-09-17 ActionSheet lit: trap paused while closing → focusScope active from open; restore at exit start
2026-09-17 ActionSheet lit: dismiss constants lack token expression → documented literal-ok module constants
2026-09-17 ActionSheet lit: exit binding covers two easings → one duration hook; easings fixed tokens
2026-09-17 ActionSheet web: forwarding locked bindings to Menu → only caller-set overridable shared bindings forwarded
2026-09-17 ActionSheet web: controlled-state prose vs controlled-only open → open is controlled only
2026-09-17 ActionSheet web: no transition binding for row hover → motion.duration.fast, easing standard, none under reduced motion
2026-09-17 ActionSheet web: holding released drag position unstated → hold until next render; exit or spring back
2026-09-17 ActionSheet web: setAttribute open fallback not inert → fallback exists only for jsdom, not a supported path
2026-09-17 BottomSheet web,lit,rn: body Box inset doubles block padding → body forwards inset → paddingInline; column pads block edges once
2026-09-17 BottomSheet rn: header block-end padding unspecified → no part has block padding; partGap only
2026-09-17 BottomSheet web,lit,rn: header top padding without handle → headerPaddingTop is the column's block-start padding when the handle renders
2026-09-17 BottomSheet rn: SafeAreaView pads every edge → empty SafeAreaView last in the column, bottom only
2026-09-17 BottomSheet rn: header taking drag from child Pressable → yes, past the slop (capture)
2026-09-17 BottomSheet web,lit,rn: velocity clock unnamed → event timestamps
2026-09-17 BottomSheet rn: full/half heights and status bar → half window × 0.5, full window − gutter; Android translucent subtracts status bar
2026-09-17 BottomSheet rn,lit: hideHeading row alignment and header gaps → close button end-aligned; handleGap column, headerGap row
2026-09-17 BottomSheet web,lit,rn: spring-back, hold wait, async open → hold to next render (Lit updateComplete + frame); spring back finishes enter
2026-09-17 BottomSheet web,lit: drag from pointerdown or slop crossing → from slop crossing, no jump
2026-09-17 BottomSheet web,lit: dragSlop token to px → resolved --space-1 at gesture start, rem × root font size
2026-09-17 BottomSheet lit: Lit hosts' data-part → every composed part a sheet-owned wrapper
2026-09-17 BottomSheet web,lit: wrapper click outside the Button → focus the Button, request close-button
2026-09-17 BottomSheet lit: close Button size unspecified → ghost sm iconOnly as Dialog
2026-09-17 BottomSheet lit: aria-labelledby vs aria-label → aria-label from heading text
2026-09-17 BottomSheet lit: footer slot gives wide Dialog an empty footer → forward footer slot only with footer children
2026-09-17 BottomSheet lit: controlled template vs prop → open is controlled only
2026-09-17 BottomSheet web,lit: wide media query chosen in JS → resolved --layout-max-width-prose into matchMedia; unresolved renders the sheet
2026-09-17 BottomSheet web: scrim ::backdrop or element → real data-part=scrim element
2026-09-17 BottomSheet web: footerGap CSS hook vs restyling → forward delivery, not restyling; overrides only when set
2026-09-17 BottomSheet web: container not in forwarded list → container passes through to Dialog
2026-09-17 BottomSheet web: wide Dialog layer → Dialog keeps layer.dialog; caller overrides only
2026-09-17 BottomSheet all: wiring vs composition props → Behavior wiring sentence
2026-09-17 Menu rn,lit: maxHeight gutter has no token → new gutter binding layout.gutter
2026-09-17 Menu rn: ref on rn → Menu exposes no ref on rn
2026-09-17 Menu rn: horizontal flip and RTL → only top/bottom flip; start/end follow layout direction, inline shift within gutter
2026-09-17 Menu rn: phone ActionSheet heading and focus restore → heading = label; Menu restores focus in both presentations
2026-09-17 Menu web,lit,rn: enter slide side after flip → from the side facing the trigger after flip
2026-09-17 Menu rn: which item the disabled scenario clicks → the first item, the disabled one
2026-09-17 Menu rn: transparent backdrop color → transparent; scrim token not applied
2026-09-17 Menu web,lit: Tab out while controlled popup stays shown → focus moves to trigger (or anchor rule), native Tab continues
2026-09-17 Menu lit: anchor press counts as outside → anchor stands in for trigger; no close
2026-09-17 Menu lit: iconOnly warning with anchor → no warning when anchor set
2026-09-17 Menu web,lit: which close reasons move focus → escape/action to trigger; outside/focus-out none; focus inside popup always restored
2026-09-17 Menu lit: Escape/Arrow keys on trigger while open → Escape closes, Arrows focus first/last item
2026-09-17 Menu lit: window blur doubles focus-out → one focus loss fires once
2026-09-17 Menu lit: minWidth trigger-width floor → measured at open/reposition, max() with trigger width; none with anchor
2026-09-17 Menu lit: extra part attributes → part=popup list only; others data-part
2026-09-17 Menu web: popupOffset token resolution → read in px from resolved hook at open/reposition
2026-09-17 Menu web: aria-controls while closed → set only while open
2026-09-17 Menu web: which element gets rest props → root wrapper; ref is the popup
2026-09-17 Menu web: enter drives item hover transition → popup only; item highlight instant
2026-09-17 Menu web: typeahead ASCII only → any printable character, case-insensitive
2026-09-17 Menu web: examples and the open wrapper → examples start from blank args
2026-09-17 Popover rn: controlled close with no reason → restore to trigger only if focus is inside
2026-09-17 Popover rn: locked bindings listed as forwarded → forward only overridable ones; locked named as not forwarded
2026-09-17 Popover rn: BottomSheet action reason mapping → one reason map, action → close-button
2026-09-17 Popover rn: no-name warning on tablets → warns in both presentations
2026-09-17 Popover rn: closeButton testID without Button testID → part testIDs on owned wrapper Views
2026-09-17 Popover web,lit,rn: which stories start open, meta args → non-example stories open via wrapper; examples blank args, closed
2026-09-17 Popover rn: date-picker current date → fixed literal date label
2026-09-17 Popover web,lit,rn: enter slide under RTL, exit slide → physical side after mirroring; exit fade only
2026-09-17 Popover rn: headingLevel on tablets → typography only
2026-09-17 Popover lit: trapped scope pulls focus back on exit → focusScope active from open
2026-09-17 Popover lit: ds-button has no leadingIcon → ds-icon close in leading-icon slot
2026-09-17 Popover web,lit: initial-focus order vs Tab first element → Tab uses DOM order, header before body
2026-09-17 Popover lit: focusable after the host undefined → FocusScope walker, document order, skips inert/-1
2026-09-17 Popover lit: Tab with nothing tabbable in panel → non-modal tab-out; modal keeps focus
2026-09-17 Popover web,lit: native dialog cancel or close without cancel → escape, reshown if still open
2026-09-17 Popover lit: PopoverCloseReason naming → existing name kept
2026-09-17 Popover web,lit: arrow alignment with border → centered on border centerline, drawn above
2026-09-17 Popover lit: offset margin on top/left sides → position math subtracts the read-back margin
2026-09-17 Popover lit: examples' submit control placement → Form actions
2026-09-17 Popover lit: has-accessible-name target → the panel
2026-09-17 Popover web: Heading id/tabIndex, close label beyond props → Behavior wiring sentence
2026-09-17 Popover web,lit: focus before onOpenChange on tab-out → focus moves first
2026-09-17 Popover web,lit: Shift+Tab preventDefault → yes, then focus trigger
2026-09-17 Popover web,lit: heading data-part and ring → owned wrapper with :has(:focus-visible); Lit tabindex on ds-heading
2026-09-17 SidePanel rn: FocusScope wrapper can't hold partGap → FocusScope outside surface; column View carries gap and block padding
2026-09-17 SidePanel web,lit: focusScope part can't exist → owned column element inside FocusScope carries data-part
2026-09-17 SidePanel rn: accessibilityRole none vs role prop → role={role} plus accessibilityLabel
2026-09-17 SidePanel rn: ref on rn → exposes no ref on rn
2026-09-17 SidePanel rn: swipe thresholds and edge zone unnamed → constants dismissDistance, dismissVelocity, dragSlop, edgeZone
2026-09-17 SidePanel rn: swipe dismiss curve and unhonored close → hold offset, then timing exit or spring back
2026-09-17 SidePanel web,rn: close button size unlisted → default size; Button keeps 44px target
2026-09-17 SidePanel web,lit,rn: safe area for persistent sidebar → overlay only; persistent pads none
2026-09-17 SidePanel rn: breakpoint crossing remounts children → stated as native limit
2026-09-17 SidePanel rn: header with only close button → end-aligned
2026-09-17 SidePanel lit,rn: examples without open → blank args, closed, opened by trigger
2026-09-17 SidePanel lit: swipe reason never emitted on Lit → rn only; stays in shared type
2026-09-17 SidePanel web,lit: scrim click vs pointerdown → click on scrim element; outside stays pointerdown
2026-09-17 SidePanel lit: scrim covers the trigger → press there is scrim; trigger from keyboard or no scrim
2026-09-17 SidePanel web,lit: navigation detection and focus → click path with a[href] or ds-link; no focus move
2026-09-17 SidePanel lit: formmethod=dialog and action while persistent → both count; ignored while persistent
2026-09-17 SidePanel web,lit: something else closes the modal dialog → non-cancelable cancel reports escape, reshows
2026-09-17 SidePanel web,lit: border-inline-end wrong for side end → border on the edge facing the content
2026-09-17 SidePanel web,lit: inset forward paddingBlock doubles with partGap → inset → paddingInline; column block padding once
2026-09-17 SidePanel web: Heading margin unbalances header → new headingGap binding space.0 forwarded to marginBlockEnd
2026-09-17 SidePanel lit: non-modal scrim layer → shares one layer; DOM order puts surface above
2026-09-17 SidePanel web,lit: when breakpoint token is read → at mount; theme change applies next mount
2026-09-17 SidePanel web: scrim sibling can't inherit hooks → scrim declares same hook defaults and inline overrides
2026-09-17 SidePanel web: ref null while closed vs hidden → ref null when closed and not persistent
2026-09-17 SidePanel web,lit: modal scrim → real data-part=scrim in full-viewport dialog
2026-09-17 SidePanel web: close Button label and icon unlisted → Behavior wiring sentence
2026-09-17 SidePanel web: 100vw includes scrollbar gutter → 100% of the fixed containing block
2026-09-17 Accordion rn: value resolving to the shown set; controlled per section? → controlled only for sections whose state changed, else nothing
2026-09-17 Accordion rn: does toggling exclusive consume the just-emitted set → no, it stays pending until value changes
2026-09-17 Accordion rn,web: exclusive trim permanent or display-only when turned off → uncontrolled permanent; controlled display-only, full value returns silently
2026-09-17 Accordion rn,web: forward defaults always or only consumer overrides → every forward always carries the resolved token
2026-09-17 Accordion rn: Divider between items adds its own spacing? → Divider keeps spacing none; itemGap is the only space
2026-09-17 Accordion lit,web: exclusive "first open id" item order or array order → array order (value order; uncontrolled open order)
2026-09-17 Accordion lit,web: order of controlled onOpenChange events for a value change → item order
2026-09-17 Accordion lit: slotted disclosure's own open attribute seeds the set? → no; value/defaultValue only, child attribute overwritten
2026-09-17 Accordion lit: slotted disclosure controlled toggle echoes reach the page → yes, stated in Lit notes
2026-09-17 Accordion lit: warning when exclusive turned on later with several ids → no warning; silent trim
2026-09-17 Accordion lit: fontFamily has no part, style bindings list incomplete → fontFamily part trigger; divider bindings noted as hooks
2026-09-17 Accordion web: uncontrolled events wait for the React commit? → no; fire from the toggle handler with the new set
2026-09-17 Accordion web: does item id reach the DOM as element id → no; item id is a key, Disclosure generates element ids
2026-09-17 Tabs rn,lit: TabsTab renamed to TabsItem without deprecated alias → TabsTab kept as deprecated alias on every platform
2026-09-17 Tabs rn: vertical plus fill layout on RN unspecified → vertical ScrollView with either fit
2026-09-17 Tabs rn: tab without panel renders an empty panel element? → no panel element rendered
2026-09-17 Tabs rn: Enter/Space manual activation on react-native-web has no instruction → relies on Pressable press; onKeyDown handles arrows/Home/End only
2026-09-17 Tabs rn: badge font weight unspecified → new badgeWeight binding (font.weight.regular)
2026-09-17 Tabs rn: roving tab stop when selected is disabled or none → first enabled tab
2026-09-17 Tabs rn: aria-selected scenario web-only; RN equivalent → RN tests assert accessibilityState.selected
2026-09-17 Tabs lit: ds-tab-panel tag, data-ds and overrides unspecified → plain element, data-ds TabPanel, data-part panel, no overrides
2026-09-17 Tabs lit: panelGap part panel but applied on host → part names what the gap precedes, not the carrier
2026-09-17 Tabs lit: Lit panels tabindex 0 not listed → ds-tabs sets tabindex 0 on panels
2026-09-17 Tabs lit: label and badge spans run together in name → aria-labelledby both spans (same tree); RN joined accessibilityLabel
2026-09-17 Tabs lit: indicator animates on first render? → instant first placement, animate only between tabs
2026-09-17 Tabs lit: scroll selected tab into view on first render? → yes, list's own scroll
2026-09-17 Tabs lit: defaultValue and keepMounted attribute names → default-value; keep-mounted read but not reflected
2026-09-17 Tabs web: how TabPanel learns the useId base → internal unexported context; outside Tabs falls back to raw id
2026-09-17 Tabs web: indicator overlaps border or sits inside → inside the list at inset 0, against the border
2026-09-17 Tabs web: manual activation tab stop after focus leaves list → returns to the selected tab
2026-09-17 Tabs web: Enter/Space under automatic activation → selects under either; no-op when already selected
2026-09-17 Tabs web: RTL indicator placement and scope → RTL in scope; indicator measured from inline-start, Left/Right swap
2026-09-17 Tabs web: tab ids with whitespace make invalid IDREFs → ids must be valid IDREF tokens, not sanitized
2026-09-17 SegmentedControl rn: segment icon size unspecified → Icon size follows control size
2026-09-17 SegmentedControl rn,web: missing-icon warning once per what → once per instance, one message listing all
2026-09-17 SegmentedControl rn: options shape lacks explicit undefined → shape now icon?/disabled? with | undefined
2026-09-17 SegmentedControl rn: pill when value matches no option → unmounted; next selection placed instantly
2026-09-17 SegmentedControl rn,lit: arrows move from focused segment or tab stop → focused segment, tab stop only without focus
2026-09-17 SegmentedControl rn: accessible-name test cannot use getByRole on group → testID SegmentedControl, assert role and name
2026-09-17 SegmentedControl lit,web: iconOnly option without icon keeps Tooltip/aria-label? → neither; visible text is the name
2026-09-17 SegmentedControl lit: toolbar ancestor lookup via composedPath is wrong → parentElement walk crossing shadow hosts at keydown
2026-09-17 SegmentedControl lit,web: which element's direction decides RTL → group/host computed direction at keydown
2026-09-17 SegmentedControl lit: no scenario covers Home/End → new end-selects-the-last-enabled-segment scenario
2026-09-17 SegmentedControl lit: defaultValue attribute name → default-value, not reflected
2026-09-17 SegmentedControl lit,web: controlled arrows fire when back on value; tab stop follows? → fire only when target differs; tab stop follows value
2026-09-17 SegmentedControl web: click scenario with-list restricted to lit/rn → with list now asserted on web too
2026-09-17 SegmentedControl web: toolbar outward arrow with focus on no enabled segment → moves to first/last enabled segment
2026-09-17 SegmentedControl web: only Lit warns on empty label → React/RN rely on required type, no warning
2026-09-17 Listbox rn: row formula rounding of fontSize × lineHeight → RN rounds with toLineHeight
2026-09-17 Listbox rn: typeaheadReset unused on native → accepted in overrides type for parity only
2026-09-17 Listbox rn: unselected option weight unspecified → new optionWeight binding (font.weight.regular)
2026-09-17 Listbox rn: individually disabled options dimmed? → yes, disabledOpacity when list not disabled
2026-09-17 Listbox rn,web,lit: Form error message implies invalid; Lit has none → Form message implies invalid (web, RN); Lit has no Form message
2026-09-17 Listbox rn: initialActiveValue changing after mount → moves active/pre-highlight without onActiveChange
2026-09-17 Listbox rn,lit: disabled list on focus sets active option? → no active, no event; focus ring still drawn
2026-09-17 Listbox rn: selectedCount at zero → "0 selected", no zero form
2026-09-17 Listbox rn: failed submit focus target on native → first selected row, else first enabled row
2026-09-17 Listbox rn: group label inline padding unspecified → optionPaddingInline
2026-09-17 Listbox rn: empty/loading row padding unspecified → option padding bindings
2026-09-17 Listbox lit,web: rename breaks consumers; no deprecation entry → breaking rename stated; ListboxGroupOption deprecated alias
2026-09-17 Listbox lit: typeahead repeated letter cycling → cycles through options starting with that letter (APG)
2026-09-17 Listbox lit,web: who fires null active when host drives without focus → host clears its own active value
2026-09-17 Listbox lit: labelledBy Lit attribute name → labelled-by
2026-09-17 Listbox lit: reflected invalid covers error-implied invalid? → yes; cleared only if error set it
2026-09-17 Listbox lit: errorMessage live region after role=alert removal → no live region; aria-describedby only
2026-09-17 Listbox lit: lineHeight must be unitless for row formula → lineHeight described as unitless multiplier
2026-09-17 Listbox web: which element gets id, ref and rest props → id on list; ref, rest and handlers on wrapper
2026-09-17 Listbox web: useListbox hook not built → no hook; hosts dispatch keydown/focusin on the ref
2026-09-17 Listbox web: typeaheadReset runtime parse and unreadable fallback → parse ms/s; unreadable clears immediately
2026-09-17 Listbox web: option descriptions linked with aria-describedby? → yes, description id on the option
2026-09-17 Listbox web: composed part extra props (id, data-part, check color) → data-part on all, id on error, check via Icon overrides.color at sm
2026-09-17 Listbox web (from Select): embedded list is still a tab stop → embedded list tabindex -1
2026-09-17 Select rn: element prop can't pass on RN → element is web/Lit only
2026-09-17 Select rn: Text and Icon take no testID → layout-only View wrapper carries the testID
2026-09-17 Select rn,web: chevron via Icon color prop or overrides.color → overrides.color, always the locked token, no hook
2026-09-17 Select rn: value Text tone not in composition props → value Text also takes tone default/muted
2026-09-17 Select rn,lit: forward carries default or only override → resolved token with size resolved
2026-09-17 Select rn,lit: Listbox props in composition incomplete, label missing → label added to composition; Behavior lists full set
2026-09-17 Select rn: keyboard-focused ring on Pressable → RN width changes on any focus
2026-09-17 Select rn,lit: closing fade unspecified → enter is opening only; closing instant everywhere
2026-09-17 Select rn: tablet popup modality → modal: scrim, onRequestClose, trapped FocusScope
2026-09-17 Select rn: Tab and focus-leave close on native → focus cannot leave the modal popup; no native form
2026-09-17 Select rn: hideLabel on RN → label Text not rendered; Select.label absent
2026-09-17 Select rn: selectedCount locale on RN → Intl.NumberFormat runtime default locale
2026-09-17 Select lit: errorMessage part vs role=alert element → alert and id on wrapper; data-part on Text
2026-09-17 Select lit: popupOffset applied on both sides → block margin on both sides, stated
2026-09-17 Select lit: value ellipsis can't cross shadow root → Lit clips without ellipsis; web/RN ellipsis
2026-09-17 Select lit: focus padding clamp expression → max(0px, calc(padding - (focusRingWidth - triggerBorderWidth)))
2026-09-17 Select web: replay keys on list element vs wrapper ref → Listbox ref (wrapper)
2026-09-17 Select web: Enter with multiple forwarded or handled → handled by Select, toggles active option
2026-09-17 Select web: root hooks for forwarded font bindings → font hooks kept for native select; tone-realised colors no hook
2026-09-17 Select web: label for turns click into button click → preventDefault and focus trigger by hand
2026-09-17 Select web: where data-part label goes → on the composed Text, not the label element
2026-09-17 Select web: chevron placement wrapper and glyph reserve → layout-only wrapper allowed; new chevronReserve binding
2026-09-17 Select web: controlled open with disabled → disabled wins, popup never shows
2026-09-17 Combobox rn: re-pressing the selected row on native → does nothing; close with Done or outside tap
2026-09-17 Combobox rn,web: allowCustom text matching a disabled option → row suppressed, commit does nothing
2026-09-17 Combobox rn: status announcement on react-native-web → live region like Android, no announce call
2026-09-17 Combobox rn: status part position on tablet/web → between field and error; phones between input row and Listbox
2026-09-17 Combobox rn: uncontrolled input label on value change → rewritten to new label without onInputChange
2026-09-17 Combobox rn: comma with nothing to commit → comma dropped, text kept
2026-09-17 Combobox rn: Tab/blur closing in the phone sheet → blur doesn't close; Done or sheet dismissal does
2026-09-17 Combobox lit,web: unreduced statusDebounce source on web/Lit → computed --motion-duration-base; stylesheets never zero it
2026-09-17 Combobox lit: toggle button tabIndex -1 on Lit → stays tabbable on Lit (ds-button limit), stated
2026-09-17 Combobox lit: copy.done on Lit → not rendered
2026-09-17 Combobox lit,web: multiple+allowCustom text matching a selected option → stays selected, text cleared, no onChange
2026-09-17 Combobox lit: Alt+ArrowDown while open → does nothing
2026-09-17 Combobox lit: consumer-set open attribute makes it controlled → intended; mirror writes don't
2026-09-17 Combobox lit: ds-listbox naming via labelledBy → named with label
2026-09-17 Combobox lit: Keyboard story focusable children count → Keyboard story sets defaultValue apple
2026-09-17 Combobox web: onInputChange when text unchanged → fires only on actual change
2026-09-17 Combobox web: popupOffset on a fixed popup → block margin, as Select
2026-09-17 Combobox web: iconColor has no root hook → no hook; token forwarded to Icon override
2026-09-17 Slider web,lit,rn: errorText overridable but an override does nothing → errorText locked: true
2026-09-17 Slider web,lit,rn: tickMarks holds dots and labels with no layout → dots are tickMarks on the track line; labels an unparted row, markLabelGap after track area
2026-09-17 Slider rn: partGap between track area and label row → not applied; RN column with markLabelGap
2026-09-17 Slider rn: mark label line height token → markLabelSize × font.lineHeight.normal
2026-09-17 Slider web: errorMessage role=alert on web → yes, as Lit
2026-09-17 Slider web: RN-only action copy unused on web → web and Lit do not render them, stated
2026-09-17 Slider web: bubble on any focus or focus-visible → any focus, including pointer-moved focus
2026-09-17 Slider lit: bubble removed or hidden when inactive → stays rendered aria-hidden at opacity 0 for the fade
2026-09-17 Slider rn: bubble width capped by hit area → sizes to content on one line, may overflow the hit area
2026-09-17 Slider web: consumer id on root or thumb → low thumb; high thumb has no id
2026-09-17 Slider web,lit: controlled owner never updates value repeats change → compare against last emitted within an interaction
2026-09-17 Slider lit: validate blur has no interaction-end hook on Lit → plain data-ds-field, focusout validation, stated
2026-09-17 Slider lit: error setter clears consumer invalid → independent; aria-invalid = error or invalid
2026-09-17 Slider lit: currentValue or only submission empty while disabled → currentValue null while disabled
2026-09-17 Slider rn: no hardware key handlers on a core View → stated; actions are the equivalent
2026-09-17 Slider rn: track press tie when both thumbs share a value → before low, after high, exactly on it low
2026-09-17 Slider rn: out-of-range defaultValue and required comparison → default clamped before comparing
2026-09-17 Slider rn: description/error tied to the thumb natively → accessibilityHint = error, else description
2026-09-17 NumberInput web: Keyboard story three-focusable rule → one field with min 0, max 20; rule does not apply
2026-09-17 NumberInput web,lit,rn: disabledOpacity on description Text, frame and error → description via owned wrapper; frame and error not dimmed
2026-09-17 NumberInput web,lit,rn: copy.required/invalid shown outside a Form → Input's rule: error, else message while invalid; plus non-numeric commit and clamp
2026-09-17 NumberInput web: description/error forwards unmapped → composition description and errorMessage Text with helperSize/fontFamily/lineHeight forwards
2026-09-17 NumberInput web: controlled Form validation sees pending or prop value → prop value
2026-09-17 NumberInput web: focus ring border vs outline, block padding → border as Input; inline and block padding both compensate
2026-09-17 NumberInput lit: Form-supplied error channel on Lit → same `error` slot
2026-09-17 NumberInput lit: nothing separates the two steppers → intended; no divider between Buttons
2026-09-17 NumberInput lit: disabled input focusable → web/Lit readonly + aria-disabled; RN editable false
2026-09-17 NumberInput lit: camelCase attribute names and hideLabel → kebab-case list; value property-only
2026-09-17 NumberInput rn: Enter keeps Input's next-field chain → submits, returnKeyType done, no chain
2026-09-17 NumberInput rn: label/error compose Text on RN → yes, composed Texts in testID wrapper Views
2026-09-17 NumberInput rn: suffix flush against stepper divider → suffix keeps affixGap before the divider
2026-09-17 NumberInput rn: non-numeric commit blanks the field → invalid text stays visible until next edit
2026-09-17 NumberInput rn: controlled null while typing → typed text kept until blur/Enter
2026-09-17 NumberInput rn: Home/End at a bound → a step: clears clamp message, fires only on change
2026-09-17 NumberInput rn: fractional accessibilityValue now on Android → accessibilityValue carries text only
2026-09-17 ProgressBar web,lit,rn: tier record on leaving indeterminate → entering indeterminate resets to tier 0, re-arms complete
2026-09-17 ProgressBar web,rn: invalid range becoming valid → nothing recorded while invalid; recorded silently like mount
2026-09-17 ProgressBar web,rn: value typed number but null allowed → generated type number | null | undefined
2026-09-17 ProgressBar web,rn: header alignment with hidden label → end alignment for the lone value text
2026-09-17 ProgressBar web,lit: hidden row takes no space how → header kept with label, itself visually hidden
2026-09-17 ProgressBar web,lit,rn: default Intl locale source → undefined, runtime/device default
2026-09-17 ProgressBar web: transition easing hook → duration hook only; easing fixed token
2026-09-17 ProgressBar lit: CSS hooks for forwarded bindings → none; overrides only
2026-09-17 ProgressBar lit: indeterminate announcement delay after mount → next animation frame after empty region
2026-09-17 ProgressBar lit: non-finite min/max → treated as defaults 0 and 100
2026-09-17 ProgressBar rn: testIDs for composed Texts → wrapper Views ProgressBar.label/valueText
2026-09-17 ProgressBar rn: hideLabel on native → label not rendered; accessibilityLabel carries name
2026-09-17 ProgressBar rn: where accessibility props go → root View, as Meter
2026-09-17 ProgressBar rn: one-third sweep width literal → geometry ratio, literal allowed
2026-09-17 ProgressBar rn: RTL sweep anchoring → inline-start anchor, negative x under isRTL
2026-09-17 Stepper web,lit,rn: forwards default or only overrides → always carry the token; Icons always get size and color
2026-09-17 Stepper web: upcoming label colour by status or position → resolved status
2026-09-17 Stepper web: current ring follows id or status → resolved status current; error wins
2026-09-17 Stepper web: indicatorErrorForeground delivery → danger Icon color override
2026-09-17 Stepper web: description inside button duplicates name → aria-hidden inside, referenced by aria-describedby
2026-09-17 Stepper web: empty label emits empty aria-label → label || copy.navLabel
2026-09-17 Stepper web: count display none mechanism → Text's layout-only className
2026-09-17 Stepper web: status span position → directly after the label, clipped with it in compact
2026-09-17 Stepper web,rn: connector length and padding reach → grows from stepGap min, centred, stops at stepPadding
2026-09-17 Stepper lit: step part spans li and control → step is the li; control bindings style the inner control
2026-09-17 Stepper lit: Lit current '' warns in development → empty current counts as unset, no warning
2026-09-17 Stepper rn: count position with no nav on RN → root View holds list View then count, stepGap
2026-09-17 Stepper rn: horizontal label alignment → label Text align center in horizontal
2026-09-17 Stepper rn: automatic compact shrink-wrap feedback → root stretches; measures offered width
2026-09-17 Stepper rn: dev warning text not in copy → developer-only English message
2026-09-17 Search web: disabled Buttons dim twice → disabledOpacity on label, glyph, input only
2026-09-17 Search web,lit,rn: statusDebounce unreduced source → computed --motion-duration-base web/Lit; theme token RN, as Combobox
2026-09-17 Search web: loading shows nothing vs copy.loading row → loading row shows copy.loading while open
2026-09-17 Search web: Escape on empty field, list closed → no-op, no onClear
2026-09-17 Search web: trimmed query into native GET → hidden named input set at submit; visible input unnamed
2026-09-17 Search web,lit: Listbox wiring props beyond listed → id, selectionFollowsFocus false, handlers, remount key allowed
2026-09-17 Search web,lit: hooks for forwarded label/icon bindings → no hook; overrides only, token always carried
2026-09-17 Search web: suggestionsOffset margin on fixed popup → block margin, as Combobox and Select
2026-09-17 Search lit: label element and data-part placement → label for wraps ds-text span; data-part on ds-text
2026-09-17 Search lit: reportValidity and form reset → reportValidity true; reset restores defaultValue, no events
2026-09-17 Search lit: blur without relatedTarget → does not close
2026-09-17 Search lit: inside-a-Form detection across shadow roots → composed-tree walk for ds-form
2026-09-17 Search lit: disabled not registered on Lit → ds-form skips disabled; setFormValue null
2026-09-17 Search lit: open popup when disabled → disabling closes it
2026-09-17 Search rn: ArrowDown opening on RN → opens from hardware keyboard/react-native-web, no highlight
2026-09-17 Search rn: Keyboard story without open prop → closed with query and suggestions; ArrowDown opens
2026-09-17 Search rn: Button glyph colour and size → Icon default size, color.action.ghost.foreground
2026-09-17 Search rn: locked iconColor via overrides or color prop → overrides.color
2026-09-17 Search rn: disabled RN focusability → editable false, not focusable on iOS, as Input
2026-09-17 Search rn: disabled clear button → rendered with text, disabled
2026-09-17 Search rn: how long a list press lasts → start to release plus a tick; long press and scroll count
2026-09-17 DatePicker web: footer Stack vs footerGap → footer row DatePicker owns, gap footerGap
2026-09-17 DatePicker web: open month with a partial typed range → committed value only; end only via ArrowDown in end input
2026-09-17 DatePicker web,lit: arrow skip with no bounds and all disabled → stop after 3660 days
2026-09-17 DatePicker web,rn: today ring invisible on selected today → accepted; selected wins, today announced
2026-09-17 DatePicker web,lit: week number weight has no binding → new weekNumberWeight binding (font.weight.regular)
2026-09-17 DatePicker web: transition lists border-color → background-color and color only
2026-09-17 DatePicker web,lit: Keyboard story with controlled open → starts open, follows onOpenChange in story state
2026-09-17 DatePicker web: empty range strings → controlled empty range; empty end is missing
2026-09-17 DatePicker web,lit: typed or unparsed text vs controlled value → kept while focused; blur, pick, Clear show formatted value
2026-09-17 DatePicker lit: range second DsFormField on one element → hidden light-DOM end-field child
2026-09-17 DatePicker lit: helperSize can't reach description, error element → description and errorMessage Texts with forwards; role=alert wrapper
2026-09-17 DatePicker lit: Today aria-disabled on ds-button → Lit uses disabled, leaves Tab cycle
2026-09-17 DatePicker lit: data-part on wrapper vs host → on ds-button/ds-select hosts, no wrapper
2026-09-17 DatePicker lit: which range end tooEarly/tooLate checks → either end, once complete
2026-09-17 DatePicker lit: ds-select swallows Tab state → trap ignores Tab through a ds-select
2026-09-17 DatePicker lit: ArrowDown in input while open → focuses the pending start, value or today
2026-09-17 DatePicker lit: requiredIndicator placement → appended to visible label, part of name
2026-09-17 DatePicker rn: calendarSurface forwarded to locked sheet surface → only calendarInset forwarded
2026-09-17 DatePicker rn: BottomSheet title prop → heading={label}
2026-09-17 DatePicker rn: week-number accessibilityLabel on Text → on wrapping accessible View
2026-09-17 DatePicker rn: week-number header cell → visible muted copy.weekNumber at weekdaySize
2026-09-17 DatePicker rn: label size → Text size={size} with fontSize forward
2026-09-17 DatePicker rn: Clear focus and reopen focus impossible → stated as native limit
2026-09-17 DatePicker rn: hideLabel on native → label not rendered, accessibilityLabel names
2026-09-17 Toolbar web,rn: overflowLabel fallback ends at Button's required label → chain ends at label; only Lit reaches text content
2026-09-17 Toolbar web: no stable control identity for the once-per-control warning → identity is the control's place (entry, index in group) per toolbar
2026-09-17 Toolbar web,lit,rn: example says "the same overflowLabel" → each Button's overflowLabel equals its own label
2026-09-17 Toolbar web: is focus-scrolling the toolbar's job → the platform's own focus scrolling, never called by the toolbar
2026-09-17 Toolbar web,lit: fade direction under RTL and when vertical → physical edges, top and bottom when vertical, no RTL case
2026-09-17 Toolbar lit: fade is a gradient or a mask → mask-image on web and Lit, react-native-svg gradient on native
2026-09-17 Toolbar web,lit: which input types count as text entry → every input but the ten listed, plus textarea and contenteditable
2026-09-17 Toolbar web: ArrowUp/Down from a text input in a vertical toolbar → not caret keys, so the toolbar takes them
2026-09-17 Toolbar web: which Menu element carries the overflowMenu part → Menu's own root, not the portaled popup
2026-09-17 Toolbar lit: groupGap declares part group but lands on the separator → part is now separator
2026-09-17 Toolbar lit: what the separator wrapper is on Lit → a shadow-root div between per-entry slots, never a node in the light DOM
2026-09-17 Toolbar lit: slotchange misses a control added inside a group → roving list rebuilt from a childList MutationObserver
2026-09-17 Toolbar lit: Default and Keyboard story children unstated → two labelled groups of three ghost text Buttons
2026-09-17 Toolbar rn: toolbar size sm versus Search's md|lg → a sm toolbar leaves Search at its own default
2026-09-17 Toolbar rn: ToolbarGroup's native props unstated → View, role group, label, testID Toolbar.group, forwarded ref
2026-09-17 Toolbar rn: how a group reads orientation, wrap and gaps → from the Toolbar (context on rn, warns outside one); fragments flattened
2026-09-17 Toolbar rn: does explicit menu warn on a vertical toolbar → warns whatever the orientation
2026-09-17 Toolbar rn: are the Selects' labels visible in the filter row → hidden with hideLabel
2026-09-17 Carousel web,lit,rn: no onChange reason for play restarting at the end → autoplay, and not announced
2026-09-17 Carousel lit,rn: does an arrow or swipe reaching the end also stop → any arrival at the last page while rotating stops
2026-09-17 Carousel web,lit: does a hover/focus/touch pause count as rotating → not rotating: live region polite, control keeps copy.pause
2026-09-17 Carousel web: picker arrows past the capped index → focus moves on, index stays capped, roving stop follows the focused item
2026-09-17 Carousel web,lit: reading layout.maxWidth.prose as a number → built custom property, px or rem; perView stands if unreadable
2026-09-17 Carousel web,lit: how a swipe settles → scrollend where it exists, else the next IntersectionObserver delivery, never a timer
2026-09-17 Carousel web: where minTarget sits on the arrows → the controlSurface, with the part wrapper stretching to fill it
2026-09-17 Carousel web: dots' aria-controls unstated → dots point at their slide, as tabs do
2026-09-17 Carousel web,lit: Default and Keyboard story args unstated → featured-products' four slides, Keyboard adds picker tabs
2026-09-17 Carousel lit: does the wrapper reach into the composed Button → it runs the same action, never into the Button
2026-09-17 Carousel lit: a slide renamed after first render → the picker follows; Lit observes the slide's label attribute
2026-09-17 Carousel lit,rn: dot roundness and the picker focus ring radius → new dotRadius binding (radius.full); tabs square
2026-09-17 Carousel rn: tabs picker label has no lineHeight → new tabLineHeight binding (font.lineHeight.normal)
2026-09-17 Carousel rn: pagingEnabled drifts by a gap a page → paging only at page 1 with gap 0, else snapToInterval
2026-09-17 Carousel rn: does play clear the focus pause it causes → play clears touch and focus pauses; the next focus change pauses again
2026-09-17 Carousel rn: no native aria-current for dots → accessibilityState.selected per page; picker row group/tablist named copy.pickerLabel
2026-09-17 Carousel rn: increment/decrement at an end without loop → stay listed and do nothing
2026-09-17 Carousel rn: an accessible slide hides its inner controls on iOS → stated as a native limit, with where to put slide actions
2026-09-17 Carousel rn: onMomentumScrollEnd may never fire → the swipe window also closes on onScrollEndDrag
2026-09-17 Table web: platforms.web.element said table while the root is a div → element is div, aria-busy/rowcount/colcount on the inner table
2026-09-17 Table web: Web notes still said caption inside the table → Heading sibling with an id, referenced by aria-labelledby
2026-09-17 Table web: how a Link in the row header is detected → a :has() selector on web and Lit; rn tints onRowPress rows only
2026-09-17 Table web: scrollFade has no measurement → scroll offset vs scrollWidth − clientWidth, 1px tolerance, RTL flipped
2026-09-17 Table web: the loading Text's size → Text size sm, tone muted, in its own polite region
2026-09-17 Table web: a string footer's element and a false footer → a p on web; absent or false renders no footer
2026-09-17 Table web: does captionGap apply to a hidden caption → hideCaption sends space.0, so no gap is left
2026-09-17 Table web: width fill has no web recipe → inline-size 100%
2026-09-17 Table web: arrow scrolling assumed space.10 builds to px → read from the token, px or rem
2026-09-17 Table web,lit: per-theme container-query breakpoints → each theme's CSS build stamps its own widths
2026-09-17 Table lit: pressable-rows property name unstated → reflected boolean pressableRows, Lit's alone
2026-09-17 Table lit: are forwarded bindings overridable through Table's hook → no, only through the child's own hook or overrides
2026-09-17 Table lit: does hideCaption hide the Heading or a wrapper → the Heading element itself; there is no wrapper
2026-09-17 Table lit: the stacked header row's gap and borders → stackedRowGap, header cell styling kept, whole row sticks
2026-09-17 Table lit: does the fade mask cover the focus ring → the mask covers content only; the ring stays whole
2026-09-17 Table lit: loading-marks-the-table-busy was web-only → scenario now runs on web and lit
2026-09-17 Table lit: should the loading and announcement regions share one → separate; sort and selection keep the hidden region
2026-09-17 Table rn: unselected start border versus the stacked block outline → rowBorder when stacked, row background in columns
2026-09-17 Table rn: shadow tokens on a wrapper or the View → on the View; Android elevation may clip, accepted
2026-09-17 Table rn: FlatList is both table and body → it carries Table.table; body has no element on rn
2026-09-17 Table rn: what maxHeight viewport measures against → the window height, applied to the list inside the scroll region
2026-09-17 Table rn: stickyHeader with maxHeight none → the header sticks only when the list scrolls itself
2026-09-17 Table rn: no locale source for copy.rowCount's plural → the runtime default locale
2026-09-17 Table rn: the stacked sort Toolbar's density, size and name → Table's density, size sm, copy.sortToolbarLabel even with only select-all
2026-09-17 Table rn: is scrollHint announced when nothing is hidden → always, whenever responsive is scroll
