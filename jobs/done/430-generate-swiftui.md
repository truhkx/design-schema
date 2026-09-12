Teach the generator the `swiftui` platform (process/ios-platform.md "Gates, and the Mac problem" — remote gate).

1. tools/generate: `PKG['swiftui'] = 'swiftui'`, label "SwiftUI (iOS)", CONVENTION_FILES for swiftui (`packages/swiftui/Sources/DesignSchema/Gallery.swift`, `Button.swift`), output path `packages/swiftui/Sources/DesignSchema/<Name>.swift`, allowedTools unchanged.
2. Gate client: after the model writes the file, commit on branch `gen/swiftui/<Name>` (a worktree so the main checkout is untouched), push, `gh workflow run swiftui-gates.yml -f target=<Name>` and `gh run watch`; download `gates/<Name>.swiftui.json` ({ build: { ok, errors[] }, tests: { ok, failures[] }, audit: { ok, issues[] } }); feed errors to round 2 exactly as the local typecheck does. On success fast-forward the file into the main checkout and delete the branch.
3. Batch mode: `--platform swiftui` with several components pushes one branch per component in parallel and waits on all, so a phase costs one CI round trip.
4. regen.ps1 / tier2.ps1: accept `-Platform swiftui`; `-AutoFold` unchanged.
Gate: `node tools/generate.ts --platform swiftui --component Button` completes a round trip on the real workflow. Do not modify packages/*/src or generated/ except through the generator.
