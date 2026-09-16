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
