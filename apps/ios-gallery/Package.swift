// swift-tools-version: 6.2
//
// The iOS gallery — the Storybook equivalent: one screen per component, with a theme and mode switcher.
//
// It is a SwiftPM executable rather than an .xcodeproj (see README.md): an Xcode project can only be
// generated and checked on a Mac, and `swift build` here compiles every gallery screen — and so every
// component it lists — on the CI runner today. The simulator build and the XCUITest host come from
// project.yml, which XcodeGen turns into an .xcodeproj on the runner (job 440); the two describe the same
// sources, so what compiles here is what runs there.
//
// The dependency is by path, so SwiftPM takes the package's identity from its directory name ("swiftui"),
// not from the `name:` in its manifest ("DesignSchema") — which is why the products below say
// `package: "swiftui"`.

import PackageDescription

let package = Package(
    name: "IOSGallery",
    platforms: [
        .iOS(.v26),
        .macOS(.v26),
    ],
    dependencies: [
        .package(path: "../../packages/swiftui"),
    ],
    targets: [
        .executableTarget(
            name: "IOSGallery",
            dependencies: [
                .product(name: "DesignSchema", package: "swiftui"),
                .product(name: "DesignSchemaTokens", package: "swiftui"),
            ]
        ),
    ]
)
