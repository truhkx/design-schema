---
title: SidePanel
description: A panel that slides in from the start edge after a button — navigation Links, filters, a cart — built on the APG disclosure pattern (a button with aria-expanded controlling a region) rather than a modal dialog, with a modal option for when the page must be inert. On wide screens optionally a persistent sidebar.
component:
  name: SidePanel
  category: overlay
  status: review
  apg: disclosure
  anatomy: [trigger, scrim, surface, focusScope, header, heading, body, footer, closeButton]
  composition:
    focusScope: FocusScope
    heading: { component: Heading, props: { level: '2', size: lg }, forwards: { headingGap: marginBlockEnd } }
    closeButton: { component: Button, props: { variant: ghost, iconOnly: true } }
    body: { component: Box, forwards: { inset: paddingInline } }
    footer: { component: Stack, props: { direction: horizontal, gap: tight, justify: end }, forwards: { footerGap: gap } }
  parts:
    trigger: { kind: slot, slot: { prop: trigger } }
  props:
    trigger:
      type: content
      description: 'The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and a label like "Menu"). It is the APG disclosure button: the panel sets aria-expanded on it, and aria-controls whenever the element it names is in the DOM — a modal panel''s <dialog> unmounts when closed, so the attribute is dropped then rather than pointing at nothing. It stays a toggle — pressing it again closes. Omit to control `open` from elsewhere (a Toolbar). On web and React Native it is exactly one element, because it is cloned to carry that wiring; a fragment or a bare string silently never opens the panel, so both warn in development. On web the clone sits in an overlay-owned `<span data-part="trigger">` with display: contents, and that wrapper — never the Button — is what persistent mode hides.'
    open:
      type: boolean
      description: 'Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel always starts closed and there is no defaultOpen, so a panel that must start open is controlled.'
      controls:
        event: onOpenChange
        state: open
    heading:
      type: string
      required: true
      description: 'The panel''s title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideHeading`.'
    hideHeading:
      type: boolean
      default: false
      description: 'Keep the title for assistive technology but hide it visually (a navigation panel whose Links are self-explanatory): on web and Lit it stays rendered with the visually-hidden clip pattern so aria-labelledby still resolves; on native it is the surface''s accessibilityLabel. When the header would then be empty (no close button because `dismissible` is false or the panel is persistent), the header part is not rendered: no padding, no gap, no height, and on web and Lit the hidden title moves to the top of the surface. On React Native there is nothing to move: the name is the surface''s accessibilityLabel, which has no position in the view tree, so nothing is rendered at all. When the header keeps only the close button (`dismissible` true, not persistent), the close button is end-aligned in it on every platform.'
      a11y: The accessible name is required regardless.
    children:
      type: content
      required: true
      description: 'The body: a Stack or Tree of Links for navigation, a Stack of filter controls (Checkboxes, a RadioGroup — not a Form, whose own actions would duplicate the footer), a Stack of Cards. Scrolls inside the panel when taller than the viewport.'
    footer:
      type: content
      description: Pinned to the bottom of the panel above the safe area (a sign-out Button, a "Apply filters" action row).
    side:
      type: enum
      values: [start, end]
      default: start
      description: 'The edge the panel slides from: `start` is left in left-to-right languages and right in right-to-left; `end` the opposite. Navigation comes from the start; contextual panels (a cart, a detail) from the end.'
    width:
      type: enum
      values: [narrow, default, wide]
      default: default
      description: 'Panel width on wide screens: narrow for a list of links, wide for a form or a detail. On phones the panel is the viewport width minus a gutter that keeps the scrim visible.'
    persistent:
      type: enum
      values: [never, content, page]
      default: never
      description: 'Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the content: always visible, no scrim, no trap, part of the page''s tab order, and the trigger is hidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page; the comparison is `(width > token)` (exactly the token width is still the overlay; on native `window width <= token` is the overlay — a width check, not an orientation check), and the breakpoint is read from the theme token, not per instance — on web and Lit from the token''s resolved custom property on <html> when the component mounts (connects), measured once with an off-screen probe and converted to px before being handed to matchMedia, because a rem breakpoint inside a media query resolves against the initial font size rather than the one on <html>; a theme change after that takes effect on the next mount, and where matchMedia does not exist (jsdom) the overlay presentation renders. Below it, the overlay behavior applies. The sidebar renders where SidePanel sits in the tree (not through the portal), inline-size from the width binding, natural height (the page scrolls, not the body), with no close button; the page''s own layout places it beside the content. This is how one component serves a phone''s hamburger menu and a desktop''s sidebar.'
    role:
      type: enum
      values: [complementary, navigation]
      default: complementary
      description: 'The landmark the panel exposes (in persistent mode and as the region''s role when open), and the component''s rendered role: `a11y.roleFrom` names this prop, so the panel is queried by `complementary` (the default) or `navigation` on every platform, and a test roots there rather than at the component''s own element — which on Lit holds the slotted trigger and would make the trigger its first focusable. `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. On web this is the composed Landmark''s own role, so `navigation` renders a real <nav>; a modal panel is a dialog, not a landmark, and takes none of this. The name `role` is the doc''s; on Lit the property and attribute are `landmark`, because a custom element inherits `Element.role` and must not shadow it. React Native has no landmark roles at all: the persistent sidebar carries the RN role prop and the overlay presentations expose no region role, only their label.'
    modal:
      type: boolean
      default: false
      description: 'False (the default, the disclosure pattern): the panel is a disclosed region — the page stays live and in the tab order after the panel, focus stays on the trigger when it opens, and Escape from inside or a click outside closes it. True: the panel is a modal Dialog at the edge — scrim, focus moved in and trapped, page inert and scroll-locked — for a panel that must be finished or dismissed (a cart checkout, a required filter).'
    scrim:
      type: boolean
      default: true
      description: 'Show the scrim in non-modal mode too (modal always has one). It defaults to true — this structured default is the one that counts — so turn it off for a panel that should feel like part of the page.'
    dismissible:
      type: boolean
      default: true
      description: 'Escape, the close button, a scrim tap / outside click, and the swipe gesture all request close. When false, the close button is not rendered and a scrim tap, an outside press and the swipe do nothing; Escape still reports through onOpenChange with reason escape (the consumer decides), as in Dialog — an uncontrolled non-dismissible panel reports it without closing, so it stays open. Only those four are gated: the trigger toggle (`trigger`), a followed Link (`navigation`) and a consumer''s `action` always close.'
    swipeable:
      type: boolean
      default: true
      description: 'On touch, a swipe toward the edge dismisses; from the edge, a swipe opens (native only). Purely additive. Web and Lit accept the prop for parity and wire no gesture: dragging a panel with a mouse is not an idiom either platform has. On native the dismiss gesture lives on the header, excluding the close button — there is no handle part here; a touch that starts on the close button''s wrapping View (`SidePanel.closeButton`) never becomes the header''s move responder — and the edge-to-open swipe needs a controlled `open`, since an uncontrolled panel exposes nothing to open by hand.'
      a11y: 'A gesture is never the only way (WCAG 2.5.1); the trigger and close button always exist.'
  events:
    onOpenChange:
      description: 'Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`, `close-button`, `scrim`, `outside`, `swipe`, `action`, `navigation` (a Link inside was followed). The `overlay.dismiss` value `scrim` is the shared category for both `scrim` and `outside`; the other dismiss values are reported under their own names.'
      platforms: { web: onOpenChange, lit: open-change, rn: onOpenChange, swiftui: onOpenChange }
      payload:
        - { name: open, type: boolean, description: The new state of the panel. }
        - { name: reason, type: enum, values: [trigger, escape, close-button, scrim, outside, swipe, action, navigation] }
      reasons:
        trigger: 'the trigger was activated. The scrim is not lifted above the trigger: while a scrim is shown it covers the trigger, so a pointer press at the trigger''s position is the scrim''s (`scrim`); `trigger` then comes from the keyboard, or from a pointer when there is no scrim. The outside-press listener excludes the trigger wrapper, so a press that starts on the trigger is the trigger''s however it ends'
        escape: Escape pressed while open
        close-button: the close button was activated
        scrim: 'the scrim was clicked — on web and Lit a `click` whose target is the scrim element, modal and non-modal alike (not pointerdown)'
        outside: 'a pointer press landed outside a non-modal panel with no scrim to catch it (`scrim: false`), and not on the trigger (that is `trigger`); React Native never reports it, since an outside tap lands on its full-screen scrim Pressable (transparent when `scrim` is false) and is `scrim`'
        swipe: 'the panel was swiped away (React Native only; the value stays in the shared reason type on web and Lit, which never emit it)'
        action: 'something inside the panel asked to close — a consumer''s footer action reusing this same handler, or on Lit a slotted form submitted with method="dialog" or by a submitter with formmethod="dialog", caught by a host `submit` listener that prevents default and fires `open-change` with `action` (ignored while persistent). SidePanel never raises it on its own — on web and React Native nothing raises it at all, and the reason exists there purely for a consumer''s footer action reusing this handler.'
        navigation: 'a Link inside the panel was followed: on web and Lit a `click` inside the panel whose (composed) path holds an `<a href>` or a `ds-link` and that is not default-prevented; it does not move focus to the trigger (the navigation owns focus). Never emitted on React Native, which has no router hook'
      fires: [user]
      timing: { phase: after-change }
  keyboard:
    - { keys: [Enter, ' '], action: 'Toggles the panel from the trigger (aria-expanded flips). Non-modal: focus stays on the trigger. Modal: focus moves into the panel.', when: focus on trigger, from: trigger, expect: toggles }
    - { keys: [Tab], action: 'Non-modal: from the trigger, moves to the first tabbable in the open panel; from the last element in the panel, continues to the next tabbable element after the trigger. On web the panel is portaled, so both steps are explicit keydown handling (Popover''s seam); on Lit the shadow panel follows the trigger slot and document order does it. Modal: from the last element wraps to the first.', when: open, from: trigger, expect: manual }
    - { keys: [Escape], action: 'Closes and returns focus to the trigger (from focus anywhere inside the panel surface; Escape with focus on the trigger does nothing, and a persistent sidebar ignores it).', when: open, from: inside, expect: [closes, focus-trigger], target: surface }
    - { keys: [Shift+Tab], action: 'Non-modal: from the first element in the panel, returns to the trigger and leaves the panel open. Modal: wraps to the last element.', when: open, from: first, expect: focus-trigger }
  styles:
    scrim: { token: color.overlay.scrim, part: scrim }
    surface: { token: color.overlay.surface, part: surface }
    shadow: { token: shadow.overlay, description: 'Overlay mode only; the persistent sidebar has a border instead.' }
    border: { token: color.border, description: 'The inner edge of a persistent sidebar — the edge facing the content: inline-end for `side: start`, inline-start for `side: end`.' }
    borderWidth: { token: border.width.thin }
    width: { token: layout.maxWidth.prose, description: 'Default panel width on wide screens; narrow is space.20 × 3 (a link list), wide is layout.maxWidth.content. Below the prose breakpoint the panel is the viewport minus `edgeGutter`; on web and Lit that is `100%` of the fixed containing block, written verbatim rather than as `100vw` — the two differ by a classic scrollbar, and `100%` is the one that keeps the panel inside the viewport. The cap applies to all three width values, so a `narrow` panel on a very small screen still leaves the gutter.' }
    widthNarrow: { token: space.20, computed: { times: 3 }, description: 'space.20 × 3. The hook holds the space.20 unit and the rule multiplies it by 3, so an override replaces the unit, not the final width.' }
    widthWide: { token: layout.maxWidth.content }
    edgeGutter: { token: space.12, description: 'The strip of scrim left visible beside a phone-width panel, so the page is still seen and tappable to close.' }
    inset: { token: layout.inset.lg, part: body, description: 'Pads the inline edges of every part: forwarded as the body Box''s paddingInline (the Box''s block padding stays zero), and read directly as the header''s and footer''s inline padding. The block edges are padded once, on the column that holds the parts (padding-block: inset), never per part, so nothing doubles with `partGap`; in overlay mode the safe-area inset adds to that column''s block-start and block-end padding. On web and Lit the forward travels through the Box''s `--ds-box-padding-inline` set to `--ds-side-panel-inset` in SidePanel''s stylesheet, and `overrides.paddingInline` is passed only when the caller overrode `inset`; on rn the resolved value is always passed in `overrides`. No hook beyond `--ds-side-panel-inset`.' }
    headerGap: { token: layout.gap.normal, part: header, description: 'Between title and close button.' }
    headingGap: { token: space.0, part: heading, description: 'Forwarded to the Heading''s marginBlockEnd, turning its own margin off (as Table and DataGrid do) so the title centers against the close button; `headerGap` and `partGap` own the spacing. It travels the way `inset` does: on web and Lit the heading wrapper''s rule sets the Heading''s own `--ds-heading-margin-block-end` from `--ds-side-panel-heading-gap`, so the default and any override arrive by the same route and no conditional prop is needed; on rn the resolved value is passed in `overrides`.' }
    partGap: { token: layout.gap.loose, part: focusScope, description: 'The only space between header, body and footer: the gap of the column that holds them, which also carries padding-block from `inset`. On web and Lit that column is the `focusScope` part — FocusScope writes its own `data-part="scope"`, so it is an overlay-owned element directly inside FocusScope (and inside the Landmark when non-modal) carrying `data-part="focusScope"`. In modal mode the surface sits between the <dialog> and FocusScope (it is the edge-positioned, width-capped, sliding box), so both modes end surface > FocusScope > column. On React Native FocusScope''s wrapper View cannot be styled or height-constrained, so FocusScope wraps the Animated surface from outside and the column is a flex-filling View inside the surface holding header, body and footer (in overlay mode inside a SafeAreaView, which ignores its own padding, so the column carries the gap and padding-block); FocusScope itself takes no testID, and the column carries `testID="SidePanel.focusScope"` — it is the View that carries this binding. Persistent mode renders no FocusScope at all, and there the sidebar root View is that column and carries the same testID, so the part is addressable in both modes.' }
    footerGap: { token: layout.gap.tight, part: footer }
    layer: { token: layer.sheet, description: 'Has no effect inside the browser top layer (the modal <dialog>) or a native Modal window; it applies to the non-modal position: fixed panel and scrim and to the rn anchor view. The non-modal scrim and surface share this one layer (no token arithmetic); the scrim precedes the surface in the DOM, so the surface paints above it.' }
    enter: { token: motion.duration.base, description: 'Slide in from the edge with the scrim fading over the same duration and easing; motion.easing.standard; instant under reduced motion. The easing is read from the token, not a binding, and is not overridable.' }
    exit: { token: motion.duration.fast, description: 'Slide out, and the scrim fades out, with motion.easing.exit (read from the token, not overridable). A swipe dismiss (React Native) has no momentum or decay physics: the surface holds the released offset until the consumer''s next render, and closing plays this same timing transition from that offset; if `open` is still true on that render it springs back. `open` is optional here, and an uncontrolled panel flips its own state in the same batch as the release, so the held offset is always followed by the exit and the spring-back branch belongs to controlled panels alone. A swipe released below the dismiss threshold, or a dismiss the consumer did not honor, springs back over this duration with motion.easing.standard (a timing animation, not a spring), instant under reduced motion; an interrupted enter animation is finished by the spring-back.' }
    focusRing: { token: color.border.focus }
    focusRingWidth: { token: border.width.focus }
  constants:
    dismissDistance:
      description: 'Fraction of the panel width a swipe toward the edge must pass for release to dismiss it rather than spring back (React Native; web and Lit wire no gesture).'
      value: 0.25
      unit: ratio
    dismissVelocity:
      description: 'Swipe speed at release that dismisses the panel whatever the distance travelled. Measured between the last two move samples before release using `nativeEvent.timestamp`; only speed toward the edge counts. The same rule as BottomSheet.'
      value: 1.5
      unit: px/ms
    dragSlop:
      description: 'Distance a touch must move toward the edge on the header before the swipe claims it, so a tap still activates; the drag offset is measured from where the slop was crossed, so the surface does not jump.'
      token: space.1
      unit: px
    edgeZone:
      description: 'Width of the strip at the `side` edge of the screen root in which `useSidePanelEdgeSwipe` starts an edge-swipe-to-open (React Native only). The open swipe uses the same dragSlop, dismissDistance and dismissVelocity rules toward the content — but the hook is deliberately decoupled from the panel (its options are side, enabled and onOpen), so the distance fraction is of the window width, not of the panel width: exact within a gutter on a phone, and wider than the panel on a tablet below the persistent breakpoint.'
      token: size.target.comfortable
      unit: px
  copy:
    closeLabel: Close
    expanded: Expanded
  overlay:
    layer: sheet
    open: open
    closeEvent: onOpenChange
    dismiss: [escape, scrim, close-button, swipe]
    modal: false
  a11y:
    roleFrom: role
    requires: [accessible-name, expanded-state, focus-restore, escape-dismiss, gesture-alternative, keyboard-operable, focus-visible, contrast-aa, reduced-motion, target-44px, landmark-role, focus-trap, inert-background, scroll-lock]
    contrast:
      - { foreground: color.foreground, background: color.overlay.surface, level: AA }
      - { foreground: color.foreground.muted, background: color.overlay.surface, level: AA }
      - { foreground: color.link, background: color.overlay.surface, level: AA }
  platforms:
    web:
      element: aside
      attributes: [aria-expanded, aria-controls, aria-labelledby, hidden, role=complementary, role=navigation, role=dialog, aria-modal, inert]
      notes: 'Non-modal (default, APG disclosure): the trigger Button gets aria-expanded and aria-controls={panelId}; the panel is the composed Landmark at the `role` the prop names — an <aside aria-labelledby>, or a <nav> for `navigation` — rendered through a portal, so Tab from the trigger does not walk into it by document order; the panel''s own Shift+Tab-from-first returns to the trigger and Tab-from-last continues past it, the same seam Popover has, with the `hidden` attribute when closed (after the exit transition), position: fixed at the edge, full height, on layer.sheet, with an optional scrim <div aria-hidden> that closes on click. Tab from the trigger is a keydown handler on the trigger wrapper that focuses the panel''s first tabbable. Focus stays on the trigger on open; Escape anywhere inside the panel surface closes and refocuses the trigger (not from the trigger); a focusout to outside the panel and trigger does NOT close it (unlike Popover — a navigation panel should survive a stray click) but a `click` on the scrim (reason `scrim`) or, with `scrim: false`, a pointerdown outside the panel and trigger (reason `outside`) does when dismissible. Modal: the same content in the native <dialog> via showModal() as Dialog — showModal() inerts the page, and the scroll lock is SidePanel''s own, a reference-counted class on <html> as Dialog uses, since FocusScope implements no scroll lock; the <dialog> fills the viewport with a transparent ::backdrop and holds a real scrim element (`data-part="scrim"`, a `click` whose target it is → `scrim`) and, above it, the edge-positioned surface element (`data-part="surface"`, the width `min()` and the slide); where the browser closes the <dialog> through a non-cancelable `cancel`, report `escape` and call showModal() again if `open` is still true, as Dialog; FocusScope takes `autoFocus="none"` (its own autoFocus would run before the dialog is shown) and SidePanel focuses, after showModal(), the first focusable in the body, then the footer, then the close button, then the heading (tabindex -1). A Link followed inside the panel closes it with reason navigation (a `click` whose path holds an `<a href>`, not default-prevented; focus is not moved to the trigger; a full navigation makes it moot). Persistent mode above the chosen breakpoint (matchMedia `(width > <token>)` on the token): render the same Landmark at the `role` the prop names in place, where SidePanel sits (not portaled), no dialog, no scrim, no trap, no close button, the trigger wrapper hidden with display none. The switch must not lose a non-modal panel''s content state: the children render into one host node that moves between the portal target and the in-page position. A modal panel changes root element (<dialog> to the sidebar) when crossing the breakpoint, so its children remount; that is accepted. Overlay mode only: safe-area padding via env(safe-area-inset-left) or -right on the physical edge the panel touches (flipped under :dir(rtl)), plus the top and bottom insets added to the parts column''s padding-block; the persistent sidebar pads no safe area (the page layout owns it) and draws its `border` on the edge facing the content (border-inline-end for `side: start`, border-inline-start for `side: end`). Button writes its own `data-part`, so the `closeButton` part is an overlay-owned <span data-part="closeButton"> wrapping the Button, and a click that lands on the wrapper rather than the button is forwarded to it. Box never scrolls, so the `body` part is a Box inside an overlay-owned scroll element; `partGap` measures to that wrapper. Landmark takes no className or style, so `data-ds`, the classes, inline style, style hooks, `id` (the aria-controls target) and ref go on SidePanel''s own root element — the fixed panel element, the full-viewport <dialog> when modal, the in-page sidebar element when persistent — which, unless modal, composes Landmark inside it passing only `role`, `as` and `aria-labelledby`. The non-modal scrim is that element''s sibling, so it cannot inherit the hooks: `.ds-side-panel__scrim` declares the same `--ds-side-panel-*` hook defaults and receives the same inline override style (in modal the scrim sits inside the <dialog> and inherits). The ref resolves to that root element and is null whenever the panel is closed and not persistent; the non-modal surface itself stays mounted with `hidden`, so it is in the DOM while closed. `container?: HTMLElement` (default document.body) is the portal target — a platform prop, not a schema prop. `trigger` is exactly one element, typed as such, because it is cloned to carry aria-expanded, aria-controls and the toggle.'
    lit:
      tag: ds-side-panel
      reflect: [open, side, width, persistent, { prop: dismissible, attribute: no-dismiss }, { prop: swipeable, attribute: no-swipeable }]
      notes: 'Slots `trigger`, default and `footer`. Non-modal overlay mode renders the region as a shadow <nav> (`landmark="navigation"`) or <aside> (`complementary`) with `hidden` when closed, position: fixed at the edge; only a modal panel uses a shadow <dialog> with showModal(), because a <dialog> may carry no landmark role. In persistent mode the host itself lays out as the sidebar (display: block in the parent grid) and the slotted content renders in that same <nav> or <aside>. Lit renders these native elements itself rather than composing ds-landmark (the role belongs on the element in the shadow root; a nested landmark host would add nothing). Attributes, none reflected: `modal`, `hide-heading`, `no-scrim` (negated, since scrim defaults true) and `landmark` for `role`. The shadow region follows the trigger slot, so Tab order needs no handling. Composed `open-change`. matchMedia listener on the persistent breakpoint. `aria-controls` cannot reach the shadow panel from the slotted trigger, so only aria-expanded is set on it; the panel is named by its heading inside the shadow root. `role` selects the landmark role of the shadow region. `container` is not needed: the panel lives in the shadow root. As on web: the scrim is a `click` target (`scrim`) and `outside` a pointerdown; the modal <dialog> fills the viewport with a transparent ::backdrop around a real scrim element and the edge-positioned surface, and a non-cancelable `cancel` reports `escape` and re-opens with showModal() if `open` is still true; the non-modal scrim shares `layer` with the region and precedes it; safe-area padding is overlay-only; the persistent border is on the edge facing the content. The shadow styles live on the host, so the scrim inherits the hooks.'
    rn:
      element: Modal
      props: [visible, transparent, onRequestClose, accessibilityViewIsModal]
      notes: 'Native Modal with an Animated.View surface translated from the start (or end) edge, scrim Pressable to close, PanResponder for the swipe (edge-swipe to open needs a gesture on the screen root; offer it via a `useSidePanelEdgeSwipe` hook rather than assuming). onRequestClose (the Android back button) → escape, and the surface also handles `onAccessibilityEscape` (the VoiceOver two-finger scrub) as the same reason, as BottomSheet does — there is no Escape key here, and focus returns to the trigger when the panel unmounts, at the end of the exit rather than at the moment of the request. Core SafeAreaView is deprecated since RN 0.81 but is still the only core per-edge source and the dependency rule forbids react-native-safe-area-context, so the deprecation warning is accepted until RN removes the component, as in BottomSheet. Above the `persistent` breakpoint (a tablet in landscape, typically): render as a sibling View beside the content (no Modal), matching the web sidebar. RTL flips `start`/`end` via I18nManager. Non-modal ''page stays live'' cannot be reproduced under RN Modal (it intercepts all touches); only tap-outside-to-close is possible, and the doc accepts that. `role` maps to the RN >= 0.74 `role` prop on the persistent sidebar View. `navigation` as a close reason is never emitted natively (no router hook). `useSidePanelEdgeSwipe` requires the panel to be controlled (`open`). The persistent switch is `window width > token` (width <= token is the overlay), not an orientation check. Modal focus trap, inert background and scroll lock have no full native equivalent: the modal panel uses FocusScope `trapped={modal}` plus accessibilityViewIsModal, the Modal window itself stands in for the inert page, and scroll lock has no meaning (there is no page behind to scroll); screen-reader users are confined by accessibilityViewIsModal, which is the accessible alternative. `action` is never raised by the component (the footer is opaque content); it exists for a consumer''s own footer handler. `outside` is never reported: an outside tap always lands on the full-screen scrim Pressable (transparent when `scrim` is false) and is reported as `scrim`. `copy.expanded` is not rendered: the trigger Button''s `expanded` sets accessibilityState.expanded, which the platform announces in its own words. The persistent sidebar View carries `role={role}` and `accessibilityLabel={heading}` (not accessibilityRole none). SidePanel exposes no ref on React Native, in persistent mode either, so the prop does not appear and disappear with the breakpoint; callers ref their trigger. Crossing the breakpoint while open changes the root between Modal and View, so the children remount and lose their state (a native limit; the web non-modal host-node move has no RN equivalent). Safe area: core React Native has no per-edge inset API, so in overlay mode the parts column sits inside a SafeAreaView (iOS pads the top, bottom and the edge side; Android pads nothing), and the persistent sidebar pads none (the screen owns it). The swipe follows `constants` (dismissDistance, dismissVelocity, dragSlop, edgeZone).'
    swiftui:
      element: ZStack
      props: [.offset, .transition, withAnimation, FocusScope, .accessibilityAddTraits=isModal, .accessibilityValue=expanded, Button, .gesture=DragGesture]
      notes: 'A panel slid in from `side` with `.offset` animated over the motion tokens (instant under reduced motion), rendered by the app as the trailing sibling of its content (`SidePanel` is placed in the view tree where it overlays; `.dsPortalHost` is not needed). The trigger `Button` carries `.accessibilityValue(copy.expanded / collapsed)` — SwiftUI is the only platform that uses `copy.expanded`; web, Lit and React Native carry the state through aria-expanded / accessibilityState.expanded and never render the string — (no expanded trait) and controls the panel; `modal` adds the scrim `Rectangle` (`color.overlay.scrim`, tap closes when `dismissOnScrim`), FocusScope trap and `.isModal`; non-modal panels push content aside (`inline`) or overlay it without a scrim. Edge-swipe to close is an addition to the visible close `Button`.'
  behavior:
    # Authored scenarios; the parser adds renders/enum/accessible-name/escape ones from the schema.
    - name: close-button-fires-on-open-change
      description: The close button requests close; the consumer flips `open` when it is controlled.
      given: { open: true }
      when: { click: closeButton }
      then:
        - { event: onOpenChange }
    - name: the-close-button-works-without-the-swipe
      description: The swipe is purely additive — the trigger and close button always exist (WCAG 2.5.1, gesture-alternative).
      given: { open: true, swipeable: false }
      when: { click: closeButton }
      then:
        - { event: onOpenChange }
    - name: non-dismissible-still-reports-escape
      description: With `dismissible` false the close button is not rendered and taps outside do nothing; Escape still reports with reason escape, as in Dialog.
      given: { open: true, dismissible: false }
      when: { key: Escape }
      then:
        - { event: onOpenChange }
      platforms: [web, lit]
    - name: non-dismissible-scrim-tap-does-nothing
      given: { open: true, dismissible: false }
      when: { click: scrim }
      then:
        - { event: onOpenChange, fired: false }
    - name: the-heading-is-rendered
      description: The title names what the panel holds and is shown unless hideHeading.
      given: { open: true, heading: 'Your cart' }
      then:
        - { text: 'Your cart' }
  examples:
    - name: navigation-drawer
      description: The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list.
      given: { trigger: 'An icon-only Button with the menu Icon, labelled Menu', heading: 'Menu', children: 'A Stack of navigation Links with the current page marked where the platform allows it (aria-current on web; unmarked on Lit and React Native, whose Links cannot carry it yet)', hideHeading: true, role: navigation, persistent: content }
    - name: filters
      description: A wide filter panel beside a results page, ending in an action row.
      given: { trigger: 'A Filters Button', heading: 'Filters', children: 'A Stack of filter Checkboxes', footer: 'Clear and Apply Buttons', width: wide }
    - name: cart
      description: A checkout panel from the end edge that must be finished or dismissed, so it is modal.
      given: { open: true, heading: 'Your cart', children: 'A Stack of line-item Cards', footer: 'A Checkout Button', side: end, modal: true }
    - name: detail-panel
      description: A narrow detail panel that should feel like part of the page, so it has no scrim.
      given: { open: true, heading: 'Order details', children: 'A Stack of labelled values for the selected order', side: end, width: narrow, scrim: false }
---

A side panel is the drawer: hidden off the edge until a button asks for it, then sliding in beside the page. It is built on the simplest APG pattern that fits — a button with `aria-expanded` that controls a region — so by default it behaves like a disclosure that happens to slide: focus stays on the button, Tab walks into the panel, Escape puts it away. Only when a panel must be finished or dismissed does it become a modal dialog at the edge. It holds whatever a page needs at hand but not on screen — the navigation Links, a set of filters, the cart — and on a wide screen the same component can stay put as a sidebar, so a product has one menu, not a phone menu and a desktop one.

## When to use

Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a Stack or Tree of Links from the `start` edge), for filters beside a results page, for a cart or a detail panel from the `end` edge, for a settings drawer. Set `persistent: content` when the same panel should become the permanent sidebar on desktop; leave it `never` for panels that are always a temporary overlay (a cart).

## When not to use

Do not use a SidePanel for a short list of actions (Menu, ActionSheet), for a task with a few fields (Dialog or BottomSheet, which the thumb reaches), or for content that is the page's point. Do not open one on hover. Use `modal` only when the page must not be used until the panel is done; a navigation drawer is not that. Do not stack side panels, and do not put a Dialog's job inside one — a panel is a place, not a step.

## Behavior

The trigger toggles the panel and reflects it with `aria-expanded`. Non-modal (default): opening slides the panel in from `side` and fades the scrim if shown; focus stays on the trigger, and the next Tab enters the panel as if it sat right after the trigger (on web the panel is portaled, so this is explicit focus handling; Tab from the panel's last control goes to the element after the trigger); Shift+Tab from the first control returns to the trigger with the panel still open; the page stays live. Modal: focus moves to the first focusable in the body, then the footer, then the close button, then the title (tabindex -1), the page is inert and scroll-locked, Tab is confined. In both, the body scrolls within the panel and the footer stays pinned; Escape (from inside the panel, not from the trigger), the close button, a scrim tap (`scrim`) or, with no scrim, an outside press (`outside`), and a swipe toward the edge request close; following a Link inside closes it with reason `navigation` (without moving focus); every other close returns focus to the trigger. Above the `persistent` breakpoint the panel is simply there: no scrim, no trap, the trigger hidden, the same content in the page's tab order as a `complementary` (or navigation) landmark; crossing the breakpoint while open keeps the content and drops the overlay chrome. `start` and `end` follow the writing direction. The swipe-to-dismiss gesture lives on the header (not the close button). When closed the panel is either unmounted or `hidden` — both remove it from the accessibility tree; the exit transition finishes first. The non-modal scrim fades with the panel's enter/exit durations and easing. The trigger is a single element; a `menu` Icon exists for the usual icon-only trigger. `copy.expanded` is used only on SwiftUI; the other platforms announce the trigger's expanded state natively, and still carry the string in their COPY constant, unused, so the copy stays verbatim with the doc on every platform. The parts get wiring every platform passes, not composition props: the Heading's id/ref/tabindex for naming and initial focus, the close Button's `label` from `copy.closeLabel`, its `close` Icon as `leadingIcon` and its press handler, and the trigger's aria-expanded/aria-controls and toggle. The close Button takes its default size; Button's own minimum target keeps it at 44px. Stories and examples that must start open (`open: true`) render through a wrapper that owns `open`, starting true, and writes `onOpenChange` back, acting as the consumer. The Default story is the exception among the overlays and renders **closed**, behind its trigger, because that is this component's resting state — every enum-value story shows the same, and both platforms follow it. Example stories read as if they started from blank args: Storybook merges `meta.args` into every story, so each example restates the props its `given` names and the ones it relies on being at their default, so an example with no `open` in its `given` (navigation-drawer, filters) renders uncontrolled and closed, opened by its trigger. The `accessible-name` requirement is about the shown panel: a closed panel carries `hidden` on the region (Lit) or its wrapper (web) and is out of the accessibility tree, where it has no name to compute.

## Content guidelines

Titles name what the panel holds ("Menu", "Filters", "Your cart"), not "Side panel". A navigation panel is a Stack (or Tree) of Links with the current page marked where the platform's Link allows it — `aria-current="page"` through Link's rest props on web; not yet on Lit, where `ds-link` has neither a `current` property nor a forward of `aria-current` to its inner `<a>`, so the Lit story leaves it unmarked until Link's own schema grows the prop; and never on React Native, whose Link has no current-page state — grouped with Dividers if long; keep it to what fits without scrolling on a typical phone. Filter panels end with an action row in the footer ("Apply", "Clear"). The trigger's label says what opens ("Menu", "Filters"), and the `menu` Icon alone is only acceptable with that label for assistive technology.

## Accessibility

The default is the APG disclosure pattern: a button with `aria-expanded` and `aria-controls` showing and hiding a named landmark region (WCAG 4.1.2, 1.3.6), with the tab sequence running button → region → the page after the button, so it matches the visual sequence (2.4.3, 1.3.2) — on web the region is portaled and the sequence is stitched by focus handling, on Lit the shadow region simply follows the trigger slot; the hidden panel uses `hidden`, not just off-screen positioning, so it is out of the accessibility tree when closed. Escape closes from inside and restores focus to the button (2.1.2). With `modal` the panel is a modal `dialog` named by its title: focus moves in and is confined, the background is inert and scroll-locked (APG modal dialog). The swipe is additive (2.5.1). In persistent mode it is a landmark region (`complementary` or `navigation`) in the normal tab order, so a screen-reader user can jump to it (1.3.6, 2.4.1). The panel meets contrast on the overlay surface, its close button meets 44px, and the slide respects reduced motion (2.3.3). A phone-width panel leaves a strip of scrim visible so sighted users keep their sense of place and have a large close target.

## Platform notes

### Web
Clone the trigger with `aria-expanded`, `aria-controls`, `onClick` (toggle), inside a `<span data-part="trigger">` with display: contents. Non-modal: render, through a portal into `container` (default document.body), the positioned surface `<div id hidden={!open} data-ds="SidePanel" class="ds-side-panel--{side} ds-side-panel--{width}">`, `position: fixed`, holding `Landmark` (`<aside aria-labelledby>`, or `as="nav"`), and an optional scrim `<div aria-hidden>` before it; Tab on the trigger wrapper → focus the panel's first tabbable, Shift+Tab from the panel's first → trigger, Tab from its last → the next tabbable after the trigger; keydown Escape inside the panel → close + focus trigger; `click` on the scrim → close with `scrim`, or with no scrim a pointerdown outside the panel and trigger (document listener) → close with `outside`, when dismissible; `hidden` is applied after the exit transition ends. Modal: render a full-viewport `<dialog aria-labelledby>` through `showModal()` with a transparent `::backdrop`, holding a scrim element (`data-part="scrim"`, from `scrim`) and the surface element with `position: fixed; inset-block: 0; inset-inline-start: 0` (or `-end`), `inline-size` from the width tokens (`min(var(--ds-side-panel-width), 100% - var(--ds-side-panel-edge-gutter))`), translated from `-100%` to `0` over `enter`; wrap content in `FocusScope trapped={modal} autoFocus="none" restoreFocus` and, after `showModal()`, focus the first focusable in the body, then the footer, then the close button, then the heading (tabindex -1); header `Stack` horizontal with the `Heading` (`level 2`, visually hidden with the clip pattern when `hideHeading`; the header is not rendered when that leaves it empty) and the close `Button` (`ghost`, `iconOnly`, `close` Icon); body `Box` scrolling; footer `Stack`; header, body and footer in the `data-part="focusScope"` column inside FocusScope. A `click` on the scrim element and Escape → close. A `click` on an `<a href>` inside, not default-prevented → close with `navigation`, focus not moved. Persistent: `matchMedia('(width > <token px>)')` (`literal-ok: breakpoint from layout.maxWidth.*`) renders `Landmark as="complementary"` (or `"nav"`) in place — where SidePanel sits, not portaled — with the same children, no close button, `border` on the edge facing the content (`border-inline-end` for `start`, `border-inline-start` for `end`), inline-size from the width binding and natural height, no safe-area padding, and the trigger wrapper with `hidden`; the page layout places it beside the content. Overlay mode only: safe area via `env(safe-area-inset-left)` or `-right` on the physical edge the panel touches (flipped under `:dir(rtl)`), plus the top and bottom insets.

### Lit
`<ds-side-panel heading="Menu" persistent="content"><ds-button slot="trigger" icon-only icon="menu" label="Menu"></ds-button><ds-stack>…</ds-stack></ds-side-panel>`; non-modal: a shadow `<aside>` (or `<nav>` for `landmark="navigation"`) with `hidden` when closed; modal: a shadow `<dialog>` with `showModal()`; persistent mode switches the host to `display: block` in the parent grid and renders the same `<aside>` or `<nav>`; composed `open-change`.

### React Native
`Modal` with an `Animated.View` panel at the `start`/`end` edge (`I18nManager.isRTL` flips), width from tokens capped at screen width minus `edgeGutter`, scrim `Pressable`, `PanResponder` swipe toward the edge to dismiss, `FocusScope`, `onRequestClose` → escape. `persistent` on tablets above the breakpoint renders a sibling `View` with `role={role}` and `accessibilityLabel={heading}`, beside the content (children remount when crossing the breakpoint). Provide `useSidePanelEdgeSwipe()` for the edge-swipe-to-open gesture on the screen root.

## Related

BottomSheet, Dialog, Menu, Landmark, Tree, Link, FocusScope.
