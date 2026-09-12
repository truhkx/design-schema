//  IconSnapshotTests.swift
//
//  The Icon gate: every glyph, drawn by Support/SVGPath.swift from the shared path table, must look like the
//  same glyph drawn by a browser from the same `d` string.
//
//  tools/icon-snapshots.ts renders tests/icon-snapshots/<name>.png with Playwright — one `<svg viewBox="0 0
//  16 16">` at 16 pt on white, black glyph, stroke width `border.width.focus`, round caps and joins,
//  fill-rule evenodd on the filled ones. This test renders the same glyph through `ImageRenderer` at the
//  same size and scale and counts the pixels that disagree. Two renderers never antialias identically, so a
//  pixel counts as different only when a channel is off by more than `channelTolerance`, and up to
//  `pixelTolerance` (2%) of them may be. Both numbers come from tests/icon-snapshots/index.json, so the
//  Swift side and the Playwright side cannot drift apart.
//
//  Re-render the references with `pnpm icons:snapshots` after changing tools/icon-paths.json, and look at
//  the PNG before committing it: this test says "SwiftUI agrees with the web", not "the glyph is right".

import CoreGraphics
import Foundation
import ImageIO
import SwiftUI
import Testing
@testable import DesignSchema

@Suite("Icon glyph snapshots")
struct IconSnapshotTests {
    // MARK: - The manifest

    /// tests/icon-snapshots/index.json — the render parameters, the tolerances, and one entry per glyph.
    struct Manifest: Decodable {
        struct Glyph: Decodable {
            let name: String
            let file: String
            let filled: Bool
            let d: String
        }

        let grid: CGFloat
        let size: CGFloat
        let scale: CGFloat
        let pixels: Int
        let strokeWidth: CGFloat
        let channelTolerance: Int
        let pixelTolerance: Double
        let glyphs: [Glyph]
    }

    /// The snapshot directory. `#filePath` is
    /// `<repo>/packages/swiftui/Tests/DesignSchemaTests/IconSnapshotTests.swift`, so the repository root is
    /// five components up; `DS_ICON_SNAPSHOTS` overrides it for a run from somewhere else.
    static var snapshotDirectory: URL {
        if let override = ProcessInfo.processInfo.environment["DS_ICON_SNAPSHOTS"], !override.isEmpty {
            return URL(filePath: override)
        }
        var root = URL(filePath: #filePath)
        for _ in 0 ..< 5 {
            root = root.deletingLastPathComponent()
        }
        return root.appending(path: "tests").appending(path: "icon-snapshots")
    }

    static func loadManifest() throws -> Manifest {
        let url = snapshotDirectory.appending(path: "index.json")
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(Manifest.self, from: data)
    }

    // MARK: - Tests

    @Test("the reference set is exactly the glyph table")
    func manifestMatchesTable() throws {
        let manifest = try Self.loadManifest()

        #expect(manifest.glyphs.map(\.name) == IconPaths.names)
        #expect(manifest.grid == IconPaths.grid)
        #expect(manifest.strokeWidth == IconPaths.strokeWidth)
        #expect(manifest.pixels == Int(manifest.size * manifest.scale))

        // Both files are generated from tools/icon-paths.json; if one was regenerated and the other was not,
        // the pixels below would be compared against a glyph nobody draws any more.
        for glyph in manifest.glyphs {
            let entry = IconPaths.glyph(glyph.name)
            #expect(entry?.path == glyph.d, "\(glyph.name): path data")
            #expect(entry?.filled == glyph.filled, "\(glyph.name): filled")
            #expect(
                FileManager.default.fileExists(atPath: Self.snapshotDirectory.appending(path: glyph.file).path),
                "\(glyph.name): no reference PNG — run `pnpm icons:snapshots`"
            )
        }
    }

    @Test("every glyph's path data parses")
    func everyGlyphParses() throws {
        // A slack of half a unit, because `boundingRect` may count Bézier control points, which sit just
        // outside an arc. This is not a layout assertion — it is the check that catches a parser that has
        // misread a relative coordinate or an arc and put the geometry somewhere absurd.
        let slack: CGFloat = 0.5

        for name in IconPaths.names {
            let glyph = try #require(IconPaths.glyph(name), "\(name): not in the table")
            do {
                let path = try SVGPath.path(from: glyph.path)
                #expect(!path.isEmpty, "\(name): parsed to an empty path")
                let bounds = path.boundingRect
                #expect(
                    bounds.minX >= -slack && bounds.minY >= -slack
                        && bounds.maxX <= IconPaths.grid + slack && bounds.maxY <= IconPaths.grid + slack,
                    "\(name): \(bounds) is not on the \(Int(IconPaths.grid))-grid"
                )
            } catch {
                Issue.record(Comment(rawValue: "\(name): \(error) — d = \(glyph.path)"))
            }
        }
    }

    @MainActor
    @Test("every glyph renders like the web SVG at 16 pt")
    func matchesWebSnapshot() throws {
        let manifest = try Self.loadManifest()
        let side = manifest.pixels

        for glyph in manifest.glyphs {
            let reference = try Self.loadPNG(Self.snapshotDirectory.appending(path: glyph.file))
            #expect(
                reference.width == side && reference.height == side,
                "\(glyph.name): reference is \(reference.width)×\(reference.height), expected \(side)×\(side)"
            )

            let rendered = try Self.render(glyph, manifest: manifest)
            #expect(
                rendered.width == side && rendered.height == side,
                "\(glyph.name): ImageRenderer produced \(rendered.width)×\(rendered.height), expected \(side)×\(side)"
            )

            let fraction = try Self.differingFraction(
                Self.pixels(reference, side: side),
                Self.pixels(rendered, side: side),
                channelTolerance: manifest.channelTolerance
            )
            if fraction > manifest.pixelTolerance {
                let dump = Self.write(rendered, named: "\(glyph.name).swiftui.png")
                Issue.record(
                    Comment(
                        rawValue: """
                        \(glyph.name): \(String(format: "%.2f", fraction * 100))% of pixels differ from \
                        tests/icon-snapshots/\(glyph.file) (tolerance \(manifest.pixelTolerance * 100)%).
                        d = \(glyph.d)
                        what SwiftUI drew: \(dump?.path ?? "(could not be written)")
                        """
                    )
                )
            }
        }
    }

    // MARK: - Rendering

    /// The glyph as the web draws it: black on white, stroked (line glyphs) or even-odd filled.
    private struct GlyphCanvas: View {
        let d: String
        let filled: Bool
        let grid: CGFloat
        let size: CGFloat
        let strokeWidth: CGFloat

        private var shape: SVGPathShape {
            SVGPathShape(d, viewBox: CGSize(width: grid, height: grid))
        }

        var body: some View {
            ZStack {
                Color.white
                if filled {
                    shape.fill(Color.black, style: FillStyle(eoFill: true))
                } else {
                    shape.stroke(
                        Color.black,
                        style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round, lineJoin: .round)
                    )
                }
            }
            .frame(width: size, height: size)
        }
    }

    @MainActor
    private static func render(_ glyph: Manifest.Glyph, manifest: Manifest) throws -> CGImage {
        let renderer = ImageRenderer(
            content: GlyphCanvas(
                d: glyph.d,
                filled: glyph.filled,
                grid: manifest.grid,
                size: manifest.size,
                strokeWidth: manifest.strokeWidth
            )
        )
        renderer.scale = manifest.scale
        renderer.isOpaque = true
        guard let image = renderer.cgImage else {
            throw SnapshotError("\(glyph.name): ImageRenderer produced no image")
        }
        return image
    }

    // MARK: - Pixels

    struct SnapshotError: Error, CustomStringConvertible {
        let description: String
        init(_ description: String) { self.description = description }
    }

    private static func loadPNG(_ url: URL) throws -> CGImage {
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
        else {
            throw SnapshotError("\(url.lastPathComponent): not a readable PNG — run `pnpm icons:snapshots`")
        }
        return image
    }

    /// Both images redrawn into the same 8-bit sRGB buffer on white, so the comparison is not comparing
    /// color spaces or alpha conventions.
    private static func pixels(_ image: CGImage, side: Int) throws -> [UInt8] {
        let bytesPerRow = side * 4
        let count = bytesPerRow * side
        let data = UnsafeMutableRawPointer.allocate(byteCount: count, alignment: 8)
        defer { data.deallocate() }
        _ = data.initializeMemory(as: UInt8.self, repeating: 0, count: count)

        guard let space = CGColorSpace(name: CGColorSpace.sRGB),
              let context = CGContext(
                  data: data,
                  width: side,
                  height: side,
                  bitsPerComponent: 8,
                  bytesPerRow: bytesPerRow,
                  space: space,
                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
              )
        else {
            throw SnapshotError("could not make a \(side)×\(side) sRGB bitmap")
        }
        context.interpolationQuality = .none
        context.setFillColor(gray: 1, alpha: 1)
        context.fill(CGRect(x: 0, y: 0, width: side, height: side))
        context.draw(image, in: CGRect(x: 0, y: 0, width: side, height: side))
        return [UInt8](UnsafeRawBufferPointer(start: data, count: count))
    }

    /// The fraction of pixels where some channel differs by more than `channelTolerance`. The same
    /// comparison tools/icon-snapshots.ts makes in `--check`.
    static func differingFraction(_ a: [UInt8], _ b: [UInt8], channelTolerance: Int) throws -> Double {
        guard a.count == b.count, !a.isEmpty else {
            throw SnapshotError("compared \(a.count) bytes with \(b.count)")
        }
        var differing = 0
        for i in stride(from: 0, to: a.count, by: 4) {
            var delta = 0
            for channel in 0 ..< 4 {
                delta = max(delta, abs(Int(a[i + channel]) - Int(b[i + channel])))
            }
            if delta > channelTolerance { differing += 1 }
        }
        return Double(differing) / Double(a.count / 4)
    }

    /// What SwiftUI drew, for a human looking at a CI failure. Best effort: a failure to write is not the
    /// failure being reported.
    private static func write(_ image: CGImage, named name: String) -> URL? {
        let url = FileManager.default.temporaryDirectory.appending(path: name)
        guard let destination = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil)
        else {
            return nil
        }
        CGImageDestinationAddImage(destination, image, nil)
        return CGImageDestinationFinalize(destination) ? url : nil
    }
}
