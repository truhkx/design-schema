//  Portal.swift
//
//  The overlay host — the iOS answer to the web package's portal. Toast (and anything else the docs say
//  renders "above the page, outside the current stacking context") sends its view up to the nearest
//  `.dsPortalHost()`, which draws it in a top-level `ZStack` at the `layer.*` token the item names.
//
//  This is a preference, not a shared object: SwiftUI's preference pipeline already carries values from a
//  descendant to an ancestor, so there is no observable singleton to keep in sync, nothing to leak, and the
//  host can sit exactly where the app decides (the gallery puts it on the root, above the theme).
//
//    app root:      ContentView().dsTheme(theme).dsPortalHost()
//    a component:   content.dsPortal(id: "Toast.\(id)", layer: .layerToast) { ToastSurface(…) }

import SwiftUI
import DesignSchemaTokens

/// One thing waiting to be drawn by the host.
public struct PortalItem: Identifiable {
    public let id: String
    public let layer: TokenRef
    let content: AnyView

    public init<V: View>(id: String, layer: TokenRef = .layerToast, @ViewBuilder content: () -> V) {
        self.id = id
        self.layer = layer
        self.content = AnyView(content())
    }
}

// Identity is what changes the overlay set; the view itself is rebuilt on every pass, so comparing it
// would defeat the preference's own equality check.
extension PortalItem: Equatable {
    public static func == (lhs: PortalItem, rhs: PortalItem) -> Bool {
        lhs.id == rhs.id && lhs.layer == rhs.layer
    }
}

struct PortalPreferenceKey: PreferenceKey {
    static var defaultValue: [PortalItem] { [] }

    static func reduce(value: inout [PortalItem], nextValue: () -> [PortalItem]) {
        value.append(contentsOf: nextValue())
    }
}

struct PortalHost: ViewModifier {
    @Environment(\.dsTheme) private var theme

    func body(content: Content) -> some View {
        content.overlayPreferenceValue(PortalPreferenceKey.self) { items in
            ZStack {
                ForEach(items) { item in
                    item.content.zIndex(theme.number(item.layer))
                }
            }
            // The host is invisible and inert until something is in it: an empty ZStack must not eat taps.
            .allowsHitTesting(!items.isEmpty)
            .accessibilityElement(children: .contain)
            .accessibilityIdentifier("PortalHost")
        }
    }
}

public extension View {
    /// Install the overlay host. One per window, on the root view, above `.dsTheme(_:)`.
    func dsPortalHost() -> some View {
        modifier(PortalHost())
    }

    /// Send `content` up to the nearest host while `isPresented` is true.
    func dsPortal<V: View>(
        id: String,
        layer: TokenRef = .layerToast,
        isPresented: Bool = true,
        @ViewBuilder content: () -> V
    ) -> some View {
        preference(
            key: PortalPreferenceKey.self,
            value: isPresented ? [PortalItem(id: id, layer: layer, content: content)] : []
        )
    }
}
