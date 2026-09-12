//  ReducedMotion.swift
//
//  "Nothing animates when Reduce Motion is on" is a rule every component obeys, so it is one helper rather
//  than an `@Environment(\.accessibilityReduceMotion)` read in fifty files. The state change still happens
//  — only the animation is dropped, never the outcome.

import SwiftUI

public enum ReducedMotion {
    /// The imperative form, for an event handler that already has the environment value in hand:
    /// `ReducedMotion.run(theme.animation(.motionEasingStandard), reduceMotion: reduceMotion) { isOpen = true }`
    @MainActor
    public static func run(_ animation: Animation?, reduceMotion: Bool, _ body: () -> Void) {
        if reduceMotion {
            body()
        } else {
            withAnimation(animation, body)
        }
    }
}

struct ReducedMotionAnimation<V: Equatable>: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let animation: Animation?
    let value: V

    func body(content: Content) -> some View {
        content.animation(reduceMotion ? nil : animation, value: value)
    }
}

struct ReducedMotionTransition: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let transition: AnyTransition

    func body(content: Content) -> some View {
        content.transition(reduceMotion ? .identity : transition)
    }
}

public extension View {
    /// `.animation(_:value:)` that honours Reduce Motion.
    func dsAnimation<V: Equatable>(_ animation: Animation?, value: V) -> some View {
        modifier(ReducedMotionAnimation(animation: animation, value: value))
    }

    /// `.transition(_:)` that honours Reduce Motion — the view still appears and disappears, it just cuts.
    func dsTransition(_ transition: AnyTransition) -> some View {
        modifier(ReducedMotionTransition(transition: transition))
    }
}
