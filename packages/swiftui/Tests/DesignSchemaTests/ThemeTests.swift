//  Behavior scenarios from the docs land here (job 460). Until then these are the skeleton's own
//  invariants: the token contract every generated component depends on.

import SwiftUI
import Testing
@testable import DesignSchema
import DesignSchemaTokens

@Suite("Theme")
struct ThemeTests {
    @Test("a theme resolves the same ref differently per color scheme")
    func resolvesByColorScheme() {
        let light = Theme(CalmPrecise.definition, colorScheme: .light)
        let dark = Theme(CalmPrecise.definition, colorScheme: .dark)

        #expect(light.color(.colorBackground) == CalmPrecise.Light.colorBackground)
        #expect(dark.color(.colorBackground) == CalmPrecise.Dark.colorBackground)
        #expect(light.color(.colorBackground) != dark.color(.colorBackground))
    }

    @Test("every theme carries the same token names in both modes")
    func modesAgree() {
        for theme in Themes.all {
            #expect(Set(theme.light.values.keys) == Set(theme.dark.values.keys), "\(theme.id)")
        }
    }

    @Test("token refs are the dotted public names")
    func refsAreDotted() {
        #expect(TokenRef.colorBackground.rawValue == "color.background")
        #expect(TokenRef.spaceMd.rawValue == "space.md")
        #expect(TokenRef.layerToast.rawValue == "layer.toast")
        // A trailing `default` segment is dropped by the token build, so no ref may carry one.
        #expect(TokenRef.allCases.allSatisfy { !$0.rawValue.hasSuffix(".default") })
    }

    @Test("typed resolution falls back instead of trapping on the wrong type")
    func typedResolution() {
        let theme = Theme(CalmPrecise.definition, colorScheme: .light)

        #expect(theme.dimension(.spaceMd) == CalmPrecise.Light.spaceMd)
        #expect(theme.duration(.motionDurationFast) == CalmPrecise.Light.motionDurationFast)
        #expect(theme.number(.layerToast) == CalmPrecise.Light.layerToast)
        #expect(theme.shadow(.shadowRaised).blur == CalmPrecise.Light.shadowRaised.blur)
        // `space.md` is a dimension, not a color.
        #expect(theme.color(.spaceMd) == .clear)
    }

    @Test("overlay layers stack in the documented order")
    func layerOrder() {
        let theme = Theme(CalmPrecise.definition, colorScheme: .light)
        let layers: [TokenRef] = [.layerBase, .layerRaised, .layerDropdown, .layerSheet, .layerDialog, .layerToast]
        let values = layers.map { theme.number($0) }

        #expect(values == values.sorted())
        #expect(theme.number(.layerToast) > theme.number(.layerDialog))
    }
}

@Suite("Gallery")
struct GalleryTests {
    @Test("entries are unique by name and sorted")
    @MainActor
    func entriesAreUniqueAndSorted() {
        let names = Gallery.entries.map(\.name)

        #expect(Set(names).count == names.count)
        #expect(names == names.sorted())
    }
}
