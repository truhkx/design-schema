//  Announce.swift
//
//  Live regions. The docs' `aria-live` rules become VoiceOver announcements: SwiftUI posts them through
//  `AccessibilityNotification`, which replaced `UIAccessibility.post(notification:argument:)`.
//
//    polite     the default — queued behind whatever VoiceOver is saying (aria-live="polite")
//    assertive  interrupts (aria-live="assertive"): errors, and only where the doc says so
//
//  Strings reach here already localized: a component passes `String(localized:)`, never a raw literal.

import SwiftUI
#if canImport(Accessibility)
// Where the `accessibilitySpeechAnnouncementPriority` attribute on AttributedString lives.
import Accessibility
#endif

public enum Announce {
    public enum Priority: Sendable {
        case polite
        case assertive
    }

    /// Speak `message`. No-op for an empty string, so `Announce.say(model.status)` is safe to call
    /// unconditionally.
    @MainActor
    public static func say(_ message: String, priority: Priority = .polite) {
        guard !message.isEmpty else { return }
        var text = AttributedString(message)
        text.accessibilitySpeechAnnouncementPriority = priority == .assertive ? .high : .default
        AccessibilityNotification.Announcement(text).post()
    }

    /// The screen behind the user changed wholesale (a dialog opened, a step replaced another).
    @MainActor
    public static func screenChanged() {
        AccessibilityNotification.ScreenChanged().post()
    }

    /// Part of the screen changed in place (a disclosure opened, a row expanded).
    @MainActor
    public static func layoutChanged() {
        AccessibilityNotification.LayoutChanged().post()
    }
}

public extension View {
    /// Announce whenever `value` changes and `message` returns something for the new value — the
    /// declarative form components use so the announcement lives next to the state that causes it.
    func dsAnnounce<V: Equatable>(
        on value: V,
        priority: Announce.Priority = .polite,
        _ message: @escaping (V) -> String?
    ) -> some View {
        onChange(of: value) { _, newValue in
            if let text = message(newValue) {
                Announce.say(text, priority: priority)
            }
        }
    }
}
