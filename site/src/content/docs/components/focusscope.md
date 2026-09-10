---
title: FocusScope
description: The focus-confinement primitive. Moves focus in on mount, keeps Tab inside while trapped, and returns focus to where it was on unmount — the piece every modal overlay is built on.
component:
  name: FocusScope
  category: primitive
  status: review
  anatomy: [scope]
  props:
    children:
      type: content
      required: true
      description: The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced.
    trapped:
      type: boolean
      default: true
      description: 'Tab and Shift+Tab wrap within the scope''s focusable descendants, and focus that lands outside is pulled back in. False turns the scope into a plain "move focus in and restore on exit" helper, for non-modal panels.'
    autoFocus:
      type: enum
      values: [first, last, container, none]
      default: first
      description: 'Where focus goes on mount: the first focusable descendant, the last, the scope''s own wrapper (made focusable with tabindex -1, for reading-first dialogs), or nowhere.'
    restoreFocus:
      type: boolean
      default: true
      description: 'On unmount, focus returns to the element that was focused when the scope mounted, or to the next focusable element in the document if that one is gone.'
    active:
      type: boolean
      default: true
      description: 'Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is open, so the innermost active scope owns Tab.'
  events:
    onEscapeAttempt:
      description: 'Fired when trapped focus would have left the scope (Tab from the last element, Shift+Tab from the first) just before it wraps, with the direction. Diagnostic; components do not need it.'
      platforms: { web: onEscapeAttempt, lit: escape-attempt, rn: onEscapeAttempt }
  keyboard:
    - { keys: [Tab], action: 'From the last focusable descendant, wraps to the first.', from: last, expect: focus-wraps-to-first }
    - { keys: [Shift+Tab], action: 'From the first focusable descendant, wraps to the last.', from: first, expect: focus-wraps-to-last }
    - { keys: [Tab], action: Ordinary forward movement inside the scope., from: first, expect: focus-next }
  styles: {}
  a11y:
    role: none
    requires: [focus-trap, focus-restore, keyboard-operable]
  platforms:
    web:
      element: div
      attributes: [tabindex=-1, data-focus-scope]
      notes: 'A <div data-focus-scope> wrapper. Focusable descendants are collected in DOM order including across open shadow roots and assigned slot nodes (the same walker the keyboard gate uses); disabled and aria-hidden subtrees are excluded, as are elements with tabindex=-1 except the container itself. Keydown on Tab at the edges calls preventDefault and focuses the other edge. A focusin listener on document pulls focus back to the last focused descendant if it leaves while trapped and active. Two sentinel elements (tabindex=0, visually hidden, data-focus-sentinel so the keyboard gate ignores them) at each end catch focus arriving from the browser chrome. Nested scopes register in a module-level stack; only the top is active.'
    lit:
      tag: ds-focus-scope
      reflect: [trapped, active]
      notes: 'The host is the wrapper (display: contents is NOT used — it breaks focus delegation; the host is display: block). Same walker; slotted light-DOM children are included via assignedElements({ flatten: true }). `escape-attempt` is a composed CustomEvent.'
    rn:
      element: View
      props: [accessibilityViewIsModal]
      notes: 'There is no Tab order to confine on native. trapped maps to accessibilityViewIsModal on the wrapper View (VoiceOver/TalkBack ignore siblings); autoFocus calls AccessibilityInfo.setAccessibilityFocus on the first accessible descendant (or the wrapper) after mount; restoreFocus stores the opener''s node handle and refocuses it on unmount. Hardware-keyboard Tab wrapping is not implemented; that is a platform limit.'
---

FocusScope is the smallest possible answer to the hardest accessibility bug: focus that escapes a modal, or never comes back from one. It has no appearance and no opinion about what is inside it. It moves focus in, keeps Tab inside, and puts focus back — and because it exists once, every overlay that composes it gets those three behaviors right by construction rather than by re-implementation.

## When to use

Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it in their composition, and that is where it should live. Render it yourself only when building a new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay), with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal panel that should still move focus in and restore it on close (a slide-in filter drawer that keeps the page usable).

## When not to use

Do not trap focus in anything that is not modal: a sidebar, a form section, a sticky toolbar. A user who cannot Tab past your panel to the rest of the page is trapped in the WCAG sense, which is a failure, not a feature. Do not use it to make a composite (a menu, a tab list); those use a roving tabindex and let Tab leave. Do not nest it inside a native `<dialog>` that already does the same work unless you are the Dialog component — one scope per modal.

## Behavior

On mount, the scope records `document.activeElement` (the opener), collects its focusable descendants, and focuses per `autoFocus`. While `trapped` and `active`, Tab from the last descendant wraps to the first and Shift+Tab from the first wraps to the last, firing `onEscapeAttempt` first; focus arriving outside the scope from any cause is returned to the last focused descendant. When a nested scope mounts, the outer one becomes inactive until the inner unmounts. On unmount with `restoreFocus`, the opener is focused if it is still in the document; otherwise the next focusable element after its former position. The scope never handles Escape and never makes anything inert — the overlay owns both.

## Content guidelines

None; the scope renders nothing visible.

## Accessibility

A modal must keep keyboard focus within it while open and must provide a way out (WCAG 2.1.2 No Keyboard Trap: Escape, provided by the composing overlay, and the overlay's close controls); FocusScope implements the confinement half and the overlay the exit. Focus moves into the overlay on open and returns on close so sequential navigation remains meaningful (2.4.3 Focus Order). Focus is never left on `body` or on an element that has been removed. The scope adds no role and no name; assistive technology never perceives it. The `Keyboard` story and the keyboard gate verify the wrap in both directions.

## Platform notes

### Web
Render `<div data-focus-scope tabindex={autoFocus === 'container' ? -1 : undefined}>` with two visually hidden sentinels (`<span tabindex="0" data-focus-sentinel>`) at the start and end; a sentinel receiving focus redirects to the opposite edge, which handles focus arriving from browser chrome. Keydown handler for Tab/Shift+Tab at the edges. `document.addEventListener('focusin')` while active and trapped, pulling focus back if `!scope.contains(deepActiveElement)`. The focusable walker descends open shadow roots and includes slot-assigned nodes, and skips `[inert]`, `[aria-hidden="true"]` subtrees, `disabled` and `tabindex="-1"` (except the container). Module-level scope stack for nesting.

### Lit
`<ds-focus-scope trapped>`; the host is a block wrapper with a default slot; walker uses `assignedElements({ flatten: true })` plus shadow-root descent. Sentinels live in the shadow root. Composed `escape-attempt`. `active` is reflected so the outer scope of a nested pair can be styled if needed (it usually is not).

### React Native
A `View` with `accessibilityViewIsModal={trapped}`; on mount, `setAccessibilityFocus` on the first accessible descendant found by walking refs (or the wrapper when `autoFocus: container`); on unmount, `setAccessibilityFocus` on the stored opener handle. No Tab handling; `onEscapeAttempt` never fires on native.

## Related

Dialog, AlertDialog, BottomSheet, ActionSheet, Menu.
