#!/usr/bin/env node
/**
 * Render every glyph in tools/icon-paths.json to a PNG with Playwright — the reference the SwiftUI side is
 * held to.
 *
 * The Swift test (packages/swiftui/Tests/DesignSchemaTests/IconSnapshotTests.swift) parses the same `d`
 * string with Support/SVGPath.swift, renders it through an `ImageRenderer` at 16 pt, and compares against
 * the PNG written here. So "the glyph looks the same on iOS as on the web" stops being a claim in a doc and
 * becomes a gate: if the Swift parser gets an arc or a relative coordinate wrong, the pixels say so.
 *
 * The render is deliberately the plainest thing a browser can be asked for — one `<svg viewBox="0 0 16 16">`
 * at 16 CSS px on white, black glyph, `stroke-width: 2` (`border.width.focus`), round caps and joins, and
 * `fill-rule="evenodd"` on the filled glyphs. `vector-effect: non-scaling-stroke` (which production CSS
 * sets) is left out because it cannot matter here: the view box is 16 units wide and the box is 16 px, so
 * user units and CSS pixels are the same length either way.
 *
 * The PNGs are 32×32 — 16 pt at `deviceScaleFactor: 2`, matching `ImageRenderer.scale = 2`. Two renderers
 * never antialias identically, so the comparison counts pixels that differ by more than
 * CHANNEL_TOLERANCE/255 in any channel and allows PIXEL_TOLERANCE of them; IconSnapshotTests applies the
 * same two numbers, and tests/icon-snapshots/index.json carries them so the two cannot drift apart.
 *
 * Usage:  node --import tsx tools/icon-snapshots.ts            # write tests/icon-snapshots/
 *         node --import tsx tools/icon-snapshots.ts --check     # exit 1 if a checked-in PNG has drifted
 *
 * Runs under Node's type stripping (22.18+ / 24): annotations only.
 */
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { docNames, readTable, validate } from './icon-paths.ts';
import type { Glyph, Table } from './icon-paths.ts';
import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads or writes. The tests point these at a sandbox. */
export const paths = {
  ROOT: REPO_ROOT,
  OUT: join(REPO_ROOT, 'tests', 'icon-snapshots'),
};

/** Rendered size in points, and the scale the PNG (and `ImageRenderer`) is taken at. */
export const SIZE = 16;
export const SCALE = 2;
/** A channel must differ by more than this (of 255) for the pixel to count as different. */
export const CHANNEL_TOLERANCE = 32;
/** …and at most this fraction of pixels may differ. The job's 2%. */
export const PIXEL_TOLERANCE = 0.02;

export const BACKGROUND = '#ffffff';
export const FOREGROUND = '#000000';

/** The page one glyph is rendered on. The `<svg>` is the whole viewport, so a screenshot is the glyph. */
export function html(table: Table, glyph: Glyph): string {
  const fill = glyph.filled
    ? ` fill="${FOREGROUND}" stroke="none" fill-rule="evenodd"`
    : ` fill="none" stroke="${FOREGROUND}"`;
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; background: ${BACKGROUND}; }
  svg { display: block; width: ${SIZE}px; height: ${SIZE}px; }
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${table.grid} ${table.grid}" width="${SIZE}" height="${SIZE}"
     fill="none" stroke="none" stroke-width="${table.strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
  <path d="${glyph.d}"${fill} />
</svg>
</body></html>`;
}

export async function render(page: Page, table: Table, glyph: Glyph): Promise<Buffer> {
  await page.setContent(html(table, glyph), { waitUntil: 'load' });
  return page.screenshot({ type: 'png' });
}

// The `page.evaluate` body below runs in the browser, and tools/tsconfig.json has no DOM lib — these tools
// are Node programs. Declaring the handful of globals that body touches keeps the whole DOM out of every
// other tool's global scope.
declare const createImageBitmap: (blob: Blob) => Promise<{ width: number; height: number }>;
interface ImageData {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}
interface OffscreenCanvasRenderingContext2D {
  drawImage(image: unknown, dx: number, dy: number): void;
  getImageData(x: number, y: number, width: number, height: number): ImageData;
}
declare class OffscreenCanvas {
  constructor(width: number, height: number);
  getContext(contextId: '2d'): OffscreenCanvasRenderingContext2D | null;
}

/**
 * The fraction of pixels that differ by more than CHANNEL_TOLERANCE in any channel. Decoded by the browser
 * that wrote them, so this tool needs no PNG decoder of its own.
 */
export async function differingFraction(page: Page, a: Buffer, b: Buffer): Promise<number> {
  // No named function may appear inside the evaluated body: tsx compiles with esbuild's `keepNames`, which
  // rewrites a named declaration into a `__name(…)` call that does not exist in the page.
  return page.evaluate(
    async ([left, right, channel]: [string, string, number]) => {
      const images: ImageData[] = [];
      for (const base64 of [left, right]) {
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        context.drawImage(bitmap, 0, 0);
        images.push(context.getImageData(0, 0, bitmap.width, bitmap.height));
      }
      const x = images[0] as ImageData;
      const y = images[1] as ImageData;
      if (x.width !== y.width || x.height !== y.height) return 1;
      let differing = 0;
      for (let i = 0; i < x.data.length; i += 4) {
        let delta = 0;
        for (let c = 0; c < 4; c += 1) {
          delta = Math.max(delta, Math.abs((x.data[i + c] as number) - (y.data[i + c] as number)));
        }
        if (delta > channel) differing += 1;
      }
      return differing / (x.width * x.height);
    },
    [a.toString('base64'), b.toString('base64'), CHANNEL_TOLERANCE] as [string, string, number],
  );
}

/** What the Swift test reads: the render parameters, the tolerance, and one entry per glyph. */
export function manifest(table: Table, names: string[]): string {
  return `${JSON.stringify(
    {
      about:
        'GENERATED by `node --import tsx tools/icon-snapshots.ts` from tools/icon-paths.json — do not edit. ' +
        'The PNGs beside this file are the reference for IconSnapshotTests: Icon rendered by Chromium at ' +
        `${SIZE} pt, scale ${SCALE}, on ${BACKGROUND} in ${FOREGROUND}.`,
      grid: table.grid,
      size: SIZE,
      scale: SCALE,
      pixels: SIZE * SCALE,
      strokeWidth: table.strokeWidth,
      strokeWidthToken: table.strokeWidthToken,
      background: BACKGROUND,
      foreground: FOREGROUND,
      channelTolerance: CHANNEL_TOLERANCE,
      pixelTolerance: PIXEL_TOLERANCE,
      glyphs: names.map((name) => ({
        name,
        file: `${name}.png`,
        filled: (table.glyphs[name] as Glyph).filled,
        d: (table.glyphs[name] as Glyph).d,
      })),
    },
    null,
    2,
  )}\n`;
}

export async function main(argv: string[]): Promise<number> {
  const check = argv.includes('--check');
  const table = readTable();
  const names = docNames();
  validate(table, names);

  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: SIZE, height: SIZE },
      deviceScaleFactor: SCALE,
    });
    const page = await context.newPage();

    if (check) {
      const diffPage = await context.newPage();
      const problems: string[] = [];
      const expected = new Set(names.map((n) => `${n}.png`).concat(['index.json']));
      for (const file of existsSync(paths.OUT) ? readdirSync(paths.OUT) : []) {
        if (!expected.has(file)) problems.push(`${file}: not a glyph in the table`);
      }
      for (const name of names) {
        const file = join(paths.OUT, `${name}.png`);
        if (!existsSync(file)) {
          problems.push(`${name}.png: missing`);
          continue;
        }
        const fresh = await render(page, table, table.glyphs[name] as Glyph);
        const fraction = await differingFraction(diffPage, readFileSync(file), fresh);
        if (fraction > PIXEL_TOLERANCE) {
          problems.push(`${name}.png: ${(fraction * 100).toFixed(2)}% of pixels differ from a fresh render`);
        }
      }
      const index = join(paths.OUT, 'index.json');
      if (!existsSync(index) || readText(index) !== manifest(table, names)) {
        problems.push('index.json: out of date');
      }
      for (const problem of problems) process.stderr.write(`✖ icon snapshots: ${problem}\n`);
      if (problems.length) {
        process.stderr.write('icon snapshots: run `pnpm icons:snapshots`\n');
        return 1;
      }
      process.stdout.write(`✔ icon snapshots: ${names.length} glyphs match tests/icon-snapshots/\n`);
      return 0;
    }

    // A glyph dropped from the table must lose its PNG, or the Swift test would keep passing against a
    // reference nothing renders any more.
    if (existsSync(paths.OUT)) {
      const keep = new Set(names.map((n) => `${n}.png`).concat(['index.json']));
      for (const file of readdirSync(paths.OUT)) {
        if (!keep.has(file)) rmSync(join(paths.OUT, file));
      }
    }
    for (const name of names) {
      const png = await render(page, table, table.glyphs[name] as Glyph);
      writeBinaryAtomic(join(paths.OUT, `${name}.png`), png);
    }
    writeTextAtomic(join(paths.OUT, 'index.json'), manifest(table, names));
    process.stdout.write(
      `icon snapshots: wrote ${names.length} PNGs (${SIZE * SCALE}×${SIZE * SCALE}) to tests/icon-snapshots/\n`,
    );
    return 0;
  } finally {
    await browser?.close();
  }
}

function writeBinaryAtomic(file: string, data: Buffer): void {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, data);
  renameSync(tmp, file);
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: unknown) => {
      process.stderr.write(`icon snapshots: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    },
  );
}
