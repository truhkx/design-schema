# Gaps reported while generating Feed for rn

Each entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.

## 2026-09-10 16:48 — round 1

- Feed: composition names `ProgressBar` for loadingIndicator, but @design-schema/rn has no ProgressBar yet (only web/lit have it). Built a private `FeedLoadingIndicator` (indeterminate sliding-fill track, reduced-motion aware) as a stand-in; replace it once ProgressBar ships for RN.
- Feed: platform notes say each article is 'a Card with accessible and an accessibilityLabel from heading + relative time + unread', but Card has no accessible/accessibilityLabel prop, and collapsing the article into one accessible node (as `accessible` does on RN) would hide its action Buttons and any Link in `content` from individual focus. Chose to leave articles un-collapsed (each child keeps its own accessibility) and instead add visually-hidden Text runs for 'unread' and position — so no single composed accessible name exists per article on this platform.
- Feed keyboard model (Tab/PageDown/PageUp/Ctrl+Home/Ctrl+End) has no React Native hardware-keyboard equivalent — Views/FlatList don't receive Page or Ctrl key events on phones/tablets — so none of it is implemented; screen-reader users get the platform's native swipe/browse gestures instead, with no visible-control substitute added.
- Feed: the web spec exposes the absolute timestamp via `<time title>`; there's no native equivalent surfaced here (Card doesn't forward extra accessibility props, and adding a long-press tooltip would mean growing Card's own schema), so the absolute time is not exposed to sighted users or assistive tech on RN — only the relative string is shown.
- Feed: exact relative-time wording/thresholds beyond the one example ('3 min ago') aren't specified; implemented 'just now' (<60s), '{n} min ago' (<60m), '{n} hr ago' (<24h), else '{n} d ago' — a guess.
- Feed: `aria-posinset`/`aria-setsize` have no RN prop equivalent; substituted a hidden `copy.position` text per article, rendered only when `!hasMore` (total known), mirroring the web's `-1`/unknown sentinel by omitting the hint instead of showing an unbounded total.
- Feed: `newItemsOffset` ('space above the new-items button') was applied as the button row's own top padding since nothing render above the Feed by default; unclear whether the intent was a margin the surrounding layout should contribute instead.
