Fix the generation templates' rules that components keep arguing their way past, per logs/backlog-triage.md, section D runners-up 6 and 8 (T10, T45) and section A.3 (T28, T29, and any line job 714 listed). Jobs 710 to 714 have landed. This is the only job in the series that edits prompts/templates/, so every prompt hash flips once, here.

- **T10.** All three templates (web.md, lit.md, rn.md, the "Testability hooks" bullet) require a `Keyboard` story with "at least three focusable children". Unmeetable for AlertDialog (two buttons), single-tab-stop radio groups, roving-tabindex and activedescendant composites, and components with no `open` (Tree, Feed, Carousel, NumberInput, Search, ProgressBar); ~10 components spent prompt turns arguing past it. Whether `tabIndex="-1"` elements count is unstated.
- **T45.** The prompt reads as if generating from scratch. When the component, CSS, stories, tests and index export already exist and largely conform, every regeneration invents "treat the spec as authoritative, change only contradictions" for itself.
- **T28.** web.md's "Parts and slots" says a composed part "receives exactly the listed `props` … add no other", with no exception for wiring (ids, refs, `tabindex`, copy labels, glyphs, handlers).
- **T29.** web.md's "Controlled state" says every pair is "uncontrolled from the default otherwise", contradicting overlay docs whose `open` is controlled only.

1. **Keyboard story.** Replace "at least three focusable children" with: "enough content to exercise every keyboard rule — at least as many distinct stops or items as the largest index any rule moves to (three for a list or group), counting items reachable by the component's own navigation (roving or activedescendant) whether or not they are tab stops; an overlay with a fixed set of controls renders that set." Same sentence, adapted, in all three.
2. **Reconciliation.** Add a short "When the files already exist" paragraph to each platform template: read the existing component first; the doc is authoritative; change what contradicts it, add what it requires, keep what it does not mention unless a convention forbids it; do not restyle or rename for taste; say in the Output notes what was changed and why.
3. **Wiring exception.** After "add no other": "Wiring is not a prop choice and is always allowed: ids and `aria-*` references, refs, `tabIndex` for roving focus, event handlers, and copy strings the parent owns."
4. **Controlled-only props.** "…uncontrolled from the default otherwise, unless the prop has no `default` and the doc marks it controlled (overlays' `open`): then it is controlled only, and the event requests the change."
5. **Pattern templates** (pattern-web.md, pattern-lit.md, pattern-rn.md) get the same edits where they carry the same sentences.

Gate — all must pass:

    pnpm check
    pnpm typecheck:tools
    pnpm test:tools
    pnpm generate:check    # expected: every target stale; report the count

Diff of prompts/templates/ is exactly the edits above (paste it into the summary).

Do not modify `packages/*/src`, `tools/`, `prompts/conventions/`, or any component doc.
