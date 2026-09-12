//  The gallery app's entry point. Everything it shows comes from `Gallery.entries`; it never names a
//  component, so a generated component appears here the moment its Gallery+<Name>.swift lands.

import SwiftUI

@main
struct GalleryApp: App {
    var body: some Scene {
        WindowGroup {
            GalleryRoot()
        }
    }
}
