# ios-gallery

The Storybook equivalent for the SwiftUI package: one screen per component, a theme switcher and a
light/dark switcher. It lists `Gallery.entries` from `DesignSchema` and never names a component itself, so
a generated component shows up here as soon as its `Gallery+<Name>.swift` lands.

    swift build                    # from this directory — what CI runs
    open Package.swift             # on a Mac: Xcode opens the package and runs it

## Why a SwiftPM executable and not an Xcode project

Job 400 was written on a Windows machine, where no SwiftUI code can be compiled and no `.xcodeproj` can be
generated or verified. The two options the plan allowed:

- **xcodegen from a `project.yml`.** Produces a real app bundle with a UI-test host, which is what the
  accessibility audit needs — but the project is only materialised on a Mac, so nothing here could check it,
  and a wrong `project.yml` fails the first time someone runs the gate rather than at authoring time.
- **A SwiftPM executable (chosen).** `swift build` compiles the app target, and with it every gallery screen
  and every component those screens use, on the macOS runner today with no extra tooling. It is the whole
  typecheck half of the gate for the gallery.

What it does not give is a runnable app bundle or a UI-test host: SwiftUI's `App` lifecycle wants a bundle,
and XCUITest wants an app to attach to. That was job 440's problem, and `project.yml` is the answer: the
macOS runner generates `DesignSchemaGallery.xcodeproj` from it with XcodeGen, builds the app and the
UI-test bundle for the simulator, and runs the accessibility audit and the keyboard rules against it.

    xcodegen generate --spec project.yml   # on a Mac; the runner does this for you

The project is not checked in — `.gitignore` has it — because a `.xcodeproj` is a build product of a file
that can be read and reviewed anywhere, which is the only reason any of this could be written here. The
same two sources feed both worlds: the app target compiles `Sources/IOSGallery`, and the UI-test target
compiles `../../packages/swiftui/Tests/DesignSchemaUITests`, which is also where `swift build --build-tests`
typechecks them.
