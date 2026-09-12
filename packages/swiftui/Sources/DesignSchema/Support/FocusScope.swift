//  FocusScope.swift
//
//  The focus engine the overlay components (Dialog, AlertDialog, BottomSheet, Menu, Popover, Toast) share:
//  keep keyboard focus inside a region while it is open, and give focus back to whatever opened it when it
//  closes. SwiftUI has no focus-trap primitive, so this is the two halves it does have —
//  `@FocusState` (hardware keyboard, iPadOS/Catalyst) and `@AccessibilityFocusState` (VoiceOver) — wired to
//  the doc's rules:
//
//    trap          `.focusSection()` keeps Tab inside, and the scope itself is focusable so the first Tab
//                  after it opens lands in the scope rather than back on the page behind it.
//    initial       focus moves in on appear (VoiceOver focus too, so the announcement follows the dialog).
//    return focus  the opener passes `returnFocus:` — a closure that sets *its own* `@FocusState` back.
//                  SwiftUI focus state is per-view, so there is nothing global to restore; the closure is
//                  the contract, and every component that opens a scope must supply one.
//    escape        `.onKeyPress(.escape)` calls `onDismiss`. (The plan names `.onExitCommand`; that one is
//                  macOS/tvOS only, so the iPad hardware-keyboard path is `.onKeyPress`.)

import SwiftUI

public struct FocusScope<Content: View>: View {
    private let isActive: Bool
    private let returnFocus: () -> Void
    private let onDismiss: (() -> Void)?
    private let content: () -> Content

    @FocusState private var keyboardFocus: Bool
    @AccessibilityFocusState private var voiceOverFocus: Bool

    /// - Parameters:
    ///   - isActive: the scope traps focus only while this is true (an open overlay).
    ///   - returnFocus: called when the scope goes away — restore the opener's own focus state here.
    ///   - onDismiss: Escape on a hardware keyboard. Leave nil where the doc says Escape does not dismiss.
    public init(
        isActive: Bool = true,
        returnFocus: @escaping () -> Void = {},
        onDismiss: (() -> Void)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.isActive = isActive
        self.returnFocus = returnFocus
        self.onDismiss = onDismiss
        self.content = content
    }

    public var body: some View {
        content()
            .focusSection()
            .focusable(isActive)
            .focused($keyboardFocus)
            .accessibilityFocused($voiceOverFocus)
            .onKeyPress(.escape) {
                guard let onDismiss else { return .ignored }
                onDismiss()
                return .handled
            }
            .onAppear {
                guard isActive else { return }
                keyboardFocus = true
                voiceOverFocus = true
            }
            .onChange(of: isActive) { wasActive, nowActive in
                if nowActive {
                    keyboardFocus = true
                    voiceOverFocus = true
                } else if wasActive {
                    returnFocus()
                }
            }
            .onDisappear {
                guard isActive else { return }
                returnFocus()
            }
    }
}

public extension View {
    /// The modifier form, for a component that already has a root view to wrap.
    func dsFocusScope(
        isActive: Bool = true,
        returnFocus: @escaping () -> Void = {},
        onDismiss: (() -> Void)? = nil
    ) -> some View {
        FocusScope(isActive: isActive, returnFocus: returnFocus, onDismiss: onDismiss) { self }
    }
}
