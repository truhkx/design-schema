---
title: Button — analytics
description: Adds a `track` prop and an `onTrack` event to Button, routed through a hand-written analytics module.
extension:
  extends: Button
  name: analytics
  props:
    track:
      type: string
      description: 'An event name sent to analytics when the button is pressed. Omit for no tracking.'
  events:
    onTrack:
      description: "Fired after onPress with the `track` name and the button's label."
      platforms: { web: onTrack, lit: track, rn: onTrack }
  behavior:
    - name: press-tracks
      given: { track: 'signup', label: 'Sign up' }
      when: { click: container }
      then: [{ event: onTrack, with: { name: 'signup', label: 'Sign up' } }]
  modules:
    trackPress:
      path: custom/analytics.ts
      signature: '(name: string, label: string) => void'
      wire: 'Called from onPress when `track` is set, before onTrack fires.'
---

Product analytics needs to know which buttons people press, without every screen wiring its own handler and without the generated Button knowing which analytics vendor is in use. `track` names the event; when it is set, a press calls the hand-written `trackPress` module with the event name and the button's visible label, then fires `onTrack` with the same pair so a screen can react (a toast, a redirect) without touching analytics itself.

The module is the seam. `packages/<platform>/src/custom/analytics.ts` is owned by the adopter: in development it logs the pair to the console; in production it is a no-op until someone points it at a vendor SDK. The generated component imports `trackPress` from `./custom/analytics` and calls it exactly once per press, after `onPress` and before `onTrack`, only when `track` is set. It never reads or rewrites the module body, and a press with no `track` is exactly the upstream Button.
