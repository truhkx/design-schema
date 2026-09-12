//  SVGPath.swift
//
//  SVG path data → `Path`. Icon's glyphs are authored once, as the `d` strings in tools/icon-paths.json that
//  the web SVG draws (Icon+Paths.swift is generated from that table), so SwiftUI has to read the same
//  grammar rather than have the shapes re-drawn by hand in `Path { … }` closures.
//
//  Deliberately only as much of SVG 1.1 §8.3 as the glyph table uses:
//
//    M / m   moveto            L / l   lineto           H / h   horizontal lineto
//    V / v   vertical lineto   C / c   cubic Bézier     Q / q   quadratic Bézier
//    A / a   elliptical arc    Z / z   closepath
//
//  Everything else (S, T, and the rest) throws `SVGPathError` rather than being silently skipped —
//  tools/icon-paths.ts rejects such a `d` before it can reach this file, and the throw is the backstop.
//  Implicit repeated coordinate sets are supported (`M3 8.5l3.5 3.5L13 5`, and a repeat after `M` is a
//  lineto, per the spec); so are the compact number forms the table uses (`.01`, `-.6`, `1.25,1.25 0 1,0`).
//
//  Y grows downward, as in SVG and as in SwiftUI, so the coordinates need no flip.

import CoreGraphics
import SwiftUI

/// What went wrong, and where in the `d` string — the message is what a failing test prints.
public struct SVGPathError: Error, CustomStringConvertible, Equatable {
    public let message: String
    public let offset: Int

    public var description: String { "SVG path data: \(message) (at offset \(offset))" }
}

public enum SVGPath {
    /// Parse `d` into a `Path` in its own coordinate space — the 16×16 grid for Icon's glyphs, untranslated
    /// and unscaled. Use `SVGPathShape` to lay one out in a rect.
    public static func path(from d: String) throws -> Path {
        var scanner = PathScanner(d)
        var path = Path()
        // The point the next command starts from, the subpath's first point (where `Z` returns to), and the
        // command a bare coordinate set repeats.
        var current = CGPoint.zero
        var subpathStart = CGPoint.zero
        var previous: Character?
        var started = false

        while true {
            scanner.skipSeparators()
            if scanner.atEnd { break }

            let command: Character
            if let next = scanner.peek(), next.isLetter {
                command = next
                scanner.advance()
            } else {
                // A coordinate set with no command repeats the last one; after a moveto it is a lineto.
                guard let last = previous else {
                    throw scanner.error("expected a command letter")
                }
                command = last == "M" ? "L" : (last == "m" ? "l" : last)
            }

            let relative = command.isLowercase
            let base = Character(command.uppercased())

            if base != "M", base != "Z", !started {
                throw scanner.error("\"\(command)\" before any moveto")
            }

            switch base {
            case "M":
                let point = try scanner.point(relativeTo: relative ? current : nil)
                path.move(to: point)
                current = point
                subpathStart = point
                started = true

            case "L":
                let point = try scanner.point(relativeTo: relative ? current : nil)
                path.addLine(to: point)
                current = point

            case "H":
                let x = try scanner.number()
                current = CGPoint(x: relative ? current.x + x : x, y: current.y)
                path.addLine(to: current)

            case "V":
                let y = try scanner.number()
                current = CGPoint(x: current.x, y: relative ? current.y + y : y)
                path.addLine(to: current)

            case "C":
                let origin = relative ? current : nil
                let control1 = try scanner.point(relativeTo: origin)
                let control2 = try scanner.point(relativeTo: origin)
                let end = try scanner.point(relativeTo: origin)
                path.addCurve(to: end, control1: control1, control2: control2)
                current = end

            case "Q":
                let origin = relative ? current : nil
                let control = try scanner.point(relativeTo: origin)
                let end = try scanner.point(relativeTo: origin)
                path.addQuadCurve(to: end, control: control)
                current = end

            case "A":
                let rx = try scanner.number()
                let ry = try scanner.number()
                let rotation = try scanner.number()
                let largeArc = try scanner.flag()
                let sweep = try scanner.flag()
                let end = try scanner.point(relativeTo: relative ? current : nil)
                addArc(
                    to: &path, from: current, to: end,
                    rx: rx, ry: ry, rotationDegrees: rotation, largeArc: largeArc, sweep: sweep
                )
                current = end

            case "Z":
                path.closeSubpath()
                current = subpathStart

            default:
                throw scanner.error("unsupported command \"\(command)\"")
            }

            previous = command
        }

        return path
    }
}

// MARK: - Arcs

/// One `A` command as cubic Béziers. Endpoint → center parameterization from SVG 1.1 appendix F.6.5, then
/// one curve per ≤90° sweep; a quarter of an ellipse is within a third of a pixel of its Bézier at icon
/// sizes, and `Path` has no ellipse-arc primitive that takes SVG's flags.
private func addArc(
    to path: inout Path,
    from start: CGPoint,
    to end: CGPoint,
    rx rxIn: CGFloat,
    ry ryIn: CGFloat,
    rotationDegrees: CGFloat,
    largeArc: Bool,
    sweep: Bool
) {
    // "If the endpoints are identical, this is equivalent to omitting the elliptical arc segment entirely."
    guard start != end else { return }
    var rx = abs(rxIn)
    var ry = abs(ryIn)
    // "If rx = 0 or ry = 0 then this arc is treated as a straight line."
    guard rx > 0, ry > 0 else {
        path.addLine(to: end)
        return
    }

    let phi = rotationDegrees * .pi / 180
    let cosPhi = cos(phi)
    let sinPhi = sin(phi)

    // The endpoints in the ellipse's own frame, halved (F.6.5.1).
    let dx = (start.x - end.x) / 2
    let dy = (start.y - end.y) / 2
    let x1p = cosPhi * dx + sinPhi * dy
    let y1p = -sinPhi * dx + cosPhi * dy

    // Radii too small to span the endpoints are scaled up until they just do (F.6.6.2).
    let lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry)
    if lambda > 1 {
        let scale = sqrt(lambda)
        rx *= scale
        ry *= scale
    }

    // The center, in the ellipse's frame and then in user space (F.6.5.2–3).
    let denominator = rx * rx * y1p * y1p + ry * ry * x1p * x1p
    let numerator = max(0, rx * rx * ry * ry - denominator)
    let sign: CGFloat = largeArc == sweep ? -1 : 1
    let coefficient = denominator > 0 ? sign * sqrt(numerator / denominator) : 0
    let cxp = coefficient * (rx * y1p / ry)
    let cyp = coefficient * -(ry * x1p / rx)
    let cx = cosPhi * cxp - sinPhi * cyp + (start.x + end.x) / 2
    let cy = sinPhi * cxp + cosPhi * cyp + (start.y + end.y) / 2

    // Start angle and swept angle (F.6.5.5–6).
    let u = CGPoint(x: (x1p - cxp) / rx, y: (y1p - cyp) / ry)
    let v = CGPoint(x: (-x1p - cxp) / rx, y: (-y1p - cyp) / ry)
    let theta1 = signedAngle(from: CGPoint(x: 1, y: 0), to: u)
    var delta = signedAngle(from: u, to: v)
    if !sweep, delta > 0 {
        delta -= 2 * .pi
    } else if sweep, delta < 0 {
        delta += 2 * .pi
    }

    // A point on the ellipse at angle θ, and the derivative there (the Bézier handle direction).
    func point(_ cosTheta: CGFloat, _ sinTheta: CGFloat) -> CGPoint {
        CGPoint(
            x: cx + rx * cosTheta * cosPhi - ry * sinTheta * sinPhi,
            y: cy + rx * cosTheta * sinPhi + ry * sinTheta * cosPhi
        )
    }
    func derivative(_ cosTheta: CGFloat, _ sinTheta: CGFloat) -> CGPoint {
        CGPoint(
            x: -rx * sinTheta * cosPhi - ry * cosTheta * sinPhi,
            y: -rx * sinTheta * sinPhi + ry * cosTheta * cosPhi
        )
    }

    let segments = max(1, Int(ceil(abs(delta) / (.pi / 2) - 1e-9)))
    let step = delta / CGFloat(segments)
    // The handle length that makes a cubic match a circular arc of this angle.
    let alpha = 4 / 3 * tan(step / 4)
    var theta = theta1

    for segment in 0 ..< segments {
        let cos1 = cos(theta), sin1 = sin(theta)
        let next = theta + step
        let cos2 = cos(next), sin2 = sin(next)

        let from = point(cos1, sin1)
        let d1 = derivative(cos1, sin1)
        let d2 = derivative(cos2, sin2)
        // The last segment lands on the command's own endpoint, so rounding cannot drift the subpath.
        let to = segment == segments - 1 ? end : point(cos2, sin2)
        let toForHandle = point(cos2, sin2)

        path.addCurve(
            to: to,
            control1: CGPoint(x: from.x + alpha * d1.x, y: from.y + alpha * d1.y),
            control2: CGPoint(x: toForHandle.x - alpha * d2.x, y: toForHandle.y - alpha * d2.y)
        )
        theta = next
    }
}

/// The angle from `u` to `v`, signed the way SVG's sweep flag is (positive = clockwise on screen).
private func signedAngle(from u: CGPoint, to v: CGPoint) -> CGFloat {
    let lengths = sqrt(u.x * u.x + u.y * u.y) * sqrt(v.x * v.x + v.y * v.y)
    guard lengths > 0 else { return 0 }
    let cosine = min(max((u.x * v.x + u.y * v.y) / lengths, -1), 1)
    let angle = acos(cosine)
    return u.x * v.y - u.y * v.x < 0 ? -angle : angle
}

// MARK: - Scanning

/// A cursor over the `d` string. SVG numbers may run together (`1-2` is two numbers, `.5.5` is two), so this
/// consumes one number at a time by grammar rather than splitting on separators.
private struct PathScanner {
    private let characters: [Character]
    private var index = 0

    init(_ d: String) {
        characters = Array(d)
    }

    var atEnd: Bool { index >= characters.count }

    func peek(_ ahead: Int = 0) -> Character? {
        let at = index + ahead
        return at < characters.count ? characters[at] : nil
    }

    mutating func advance() {
        index += 1
    }

    func error(_ message: String) -> SVGPathError {
        SVGPathError(message: message, offset: index)
    }

    /// Whitespace and commas separate numbers and are otherwise meaningless.
    mutating func skipSeparators() {
        while let c = peek(), c == " " || c == "," || c == "\t" || c == "\n" || c == "\r" || c == "\u{0C}" {
            advance()
        }
    }

    mutating func number() throws -> CGFloat {
        skipSeparators()
        let start = index
        if let c = peek(), c == "+" || c == "-" { advance() }
        var digits = false
        while let c = peek(), c.isNumber { advance(); digits = true }
        if peek() == "." {
            advance()
            while let c = peek(), c.isNumber { advance(); digits = true }
        }
        guard digits else { throw error("expected a number") }
        if let c = peek(), c == "e" || c == "E" {
            let mantissa = index
            advance()
            if let sign = peek(), sign == "+" || sign == "-" { advance() }
            var exponent = false
            while let c = peek(), c.isNumber { advance(); exponent = true }
            // `1e` with no digits is not an exponent — give the `e` back.
            if !exponent { index = mantissa }
        }
        let text = String(characters[start ..< index])
        guard let value = Double(text) else { throw error("\"\(text)\" is not a number") }
        return CGFloat(value)
    }

    mutating func point(relativeTo origin: CGPoint?) throws -> CGPoint {
        let x = try number()
        let y = try number()
        guard let origin else { return CGPoint(x: x, y: y) }
        return CGPoint(x: origin.x + x, y: origin.y + y)
    }

    /// An arc flag is one character, `0` or `1` — `11` is two flags, not eleven, so this must not go through
    /// `number()`.
    mutating func flag() throws -> Bool {
        skipSeparators()
        guard let c = peek(), c == "0" || c == "1" else { throw error("expected an arc flag (0 or 1)") }
        advance()
        return c == "1"
    }
}

// MARK: - Shape

/// SVG path data as a `Shape`: the path's own view box scaled uniformly to fit the rect it is laid out in,
/// and centered there, so a glyph keeps its aspect ratio in any square.
///
/// Line glyphs stroke it, `filled` glyphs fill it with `FillStyle(eoFill: true)`; `IconPaths.shape(_:)`
/// builds one per glyph. The path scales with the frame but `stroke(lineWidth:)` does not — the width is
/// points on the already-scaled path — which is the web's `vector-effect: non-scaling-stroke`: a line glyph
/// keeps `border.width.focus` at every rendered size, so it stays legible at `xs`.
public struct SVGPathShape: Shape, Sendable, Hashable {
    public let data: String
    public let viewBox: CGSize

    public init(_ data: String, viewBox: CGSize = CGSize(width: 16, height: 16)) {
        self.data = data
        self.viewBox = viewBox
    }

    public func path(in rect: CGRect) -> Path {
        // Unparsable data draws nothing rather than trapping: the test suite is what fails on a bad glyph,
        // not a screen in front of someone.
        guard let parsed = try? SVGPath.path(from: data), viewBox.width > 0, viewBox.height > 0 else {
            return Path()
        }
        let scale = min(rect.width / viewBox.width, rect.height / viewBox.height)
        let transform = CGAffineTransform(
            translationX: rect.minX + (rect.width - viewBox.width * scale) / 2,
            y: rect.minY + (rect.height - viewBox.height * scale) / 2
        )
        .scaledBy(x: scale, y: scale)
        return parsed.applying(transform)
    }
}
