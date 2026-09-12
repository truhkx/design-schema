//  Gallery.swift
//
//  The Storybook equivalent's index. Each component ships a `Gallery+<Name>.swift` (generated alongside the
//  component, the way `<Name>.stories.tsx` is on web) declaring its screen, and the generated
//  `Gallery+Generated.swift` collects them into `Gallery.generated`. `apps/ios-gallery` renders whatever is
//  in `Gallery.entries` — it never names a component itself, so a new component appears in the app the
//  moment its file lands.

import SwiftUI

/// One screen in the gallery: the component's name and a view that shows it in its states.
public struct GalleryEntry: Identifiable {
    public var id: String { name }
    public let name: String
    private let build: () -> AnyView

    public init<V: View>(_ name: String, @ViewBuilder view: @escaping () -> V) {
        self.name = name
        self.build = { AnyView(view()) }
    }

    public var view: AnyView { build() }
}

@MainActor
public enum Gallery {
    /// Every component screen, by name. Empty until the first component lands, so the app has something to
    /// show while `Gallery.generated` is still an empty list.
    public static var entries: [GalleryEntry] {
        let generated = Self.generated.sorted { $0.name < $1.name }
        return generated.isEmpty ? [placeholder] : generated
    }

    static var placeholder: GalleryEntry {
        GalleryEntry("Welcome") {
            VStack(alignment: .leading, spacing: 8) { // literal-ok: the gallery app is not a component
                Text("DesignSchema")
                    .font(.title2.weight(.semibold))
                Text("No components have been generated for the swiftui platform yet. "
                    + "Each one adds a Gallery+<Name>.swift and appears in this list.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
