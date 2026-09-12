//  The gallery shell: a list of component screens, a theme picker and a mode picker.
//
//  The switchers are the point of the app — every component has to look right in three themes × two modes,
//  and the accessibility identifiers here are what the gate's XCUITest drives to get to a component's
//  screen (packages/swiftui/Tests/DesignSchemaUITests/GalleryUITests.swift).

import SwiftUI
import DesignSchema
import DesignSchemaTokens

/// System / light / dark. "System" is the honest default: it is what a user's device does.
enum Appearance: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var title: String {
        switch self {
        case .system: "System"
        case .light: "Light"
        case .dark: "Dark"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}

struct GalleryRoot: View {
    @State private var themeID: String = Themes.fallback.id
    @State private var appearance: Appearance = .system

    private var theme: ThemeDefinition {
        Themes.all.first { $0.id == themeID } ?? Themes.fallback
    }

    var body: some View {
        NavigationStack {
            List(Gallery.entries) { entry in
                NavigationLink(entry.name, value: entry.name)
                    .accessibilityIdentifier("Gallery.entry.\(entry.name)")
            }
            .navigationTitle("DesignSchema")
            .navigationDestination(for: String.self) { name in
                ComponentScreen(name: name)
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Picker("Theme", selection: $themeID) {
                        ForEach(Themes.all) { definition in
                            Text(definition.title).tag(definition.id)
                        }
                    }
                    .pickerStyle(.menu)
                    .accessibilityIdentifier("Gallery.themePicker")
                }
                ToolbarItem(placement: .primaryAction) {
                    Picker("Appearance", selection: $appearance) {
                        ForEach(Appearance.allCases) { mode in
                            Text(mode.title).tag(mode)
                        }
                    }
                    .pickerStyle(.menu)
                    .accessibilityIdentifier("Gallery.modePicker")
                }
            }
        }
        .dsTheme(theme)
        .dsPortalHost()
        .preferredColorScheme(appearance.colorScheme)
    }
}

/// One component's screen. The entry is looked up by name so the navigation value stays `Hashable`.
struct ComponentScreen: View {
    let name: String

    var body: some View {
        ScrollView {
            if let entry = Gallery.entries.first(where: { $0.name == name }) {
                entry.view
                    .padding()
            } else {
                Text("No gallery entry named \(name).")
                    .foregroundStyle(.secondary)
                    .padding()
            }
        }
        .navigationTitle(name)
        .accessibilityIdentifier("Gallery.screen.\(name)")
    }
}
