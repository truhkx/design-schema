#!/usr/bin/env node
/**
 * Show what a theme doc turned into: the resolved colors of the roles people notice first, per mode, with
 * their contrast, the brand and neutral ramps, and — given inspiration colors — the nearest token to each and
 * how far it drifted.
 *
 *   node --import tsx .claude/skills/create-theme/scripts/preview.ts <id> [#hex ...]
 *
 * Reads tokens/themes/<id>/, so run tools/theme.ts first. Read-only. Drift is the OKLab distance × 100: under 2
 * reads as the same color, under 5 as a close relative, over 10 as a different color.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { loadTheme, modes, THEMES_DIR } from '../../../../tools/lib/tokens.ts';
import { contrast, hexToOklch } from '../../../../tools/oklch.ts';

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * [label, token, the token it sits on, the WCAG AA text floor when the pair is text]. Non-text pairs print their
 * ratio without a verdict: tools/check_contrast.ts decides those from the pairs the component docs declare.
 */
const ROLES: [string, string, string | null, number | null][] = [
  ['page', 'color.background.default', null, null],
  ['subtle surface', 'color.background.subtle', null, null],
  ['text', 'color.foreground.default', 'color.background.default', 4.5],
  ['muted text', 'color.foreground.muted', 'color.background.default', 4.5],
  ['border', 'color.border.default', null, null],
  ['primary button', 'color.action.primary.background', 'color.background.default', null],
  ['primary label', 'color.action.primary.foreground', 'color.action.primary.background', 4.5],
  ['link', 'color.link.default', 'color.background.default', 4.5],
  ['focus ring', 'color.border.focus', 'color.background.default', null],
  ['danger button', 'color.action.danger.background', 'color.background.default', null],
];

function hexOf(v: unknown): string | null {
  return typeof v === 'string' && HEX.test(v) ? v.toUpperCase() : null;
}

function drift(a: string, b: string): number {
  const lab = (h: string): [number, number, number] => {
    const [L, C, H] = hexToOklch(h);
    const rad = (H * Math.PI) / 180;
    return [L, C * Math.cos(rad), C * Math.sin(rad)];
  };
  const [p, q] = [lab(a), lab(b)];
  return 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

function main(argv: string[]): number {
  const [id, ...inspiration] = argv;
  if (!id) {
    process.stderr.write('usage: preview.ts <theme-id> [#hex ...]\n');
    return 2;
  }
  if (!existsSync(join(THEMES_DIR, id))) {
    process.stderr.write(`tokens/themes/${id}/ does not exist: run \`node --import tsx tools/theme.ts\` first\n`);
    return 1;
  }
  const bad = inspiration.filter((h) => !HEX.test(h));
  if (bad.length) {
    process.stderr.write(`not a #rrggbb color: ${bad.join(', ')}\n`);
    return 2;
  }

  for (const [i, mode] of modes(id).entries()) {
    const flat = loadTheme(id, mode);
    const value = (path: string): string | null => hexOf(flat[path]?.$value);
    if (i === 0) {
      // The ramps live in base.json, so they are the same in every mode.
      process.stdout.write(`\n${id} · ramps\n`);
      for (const ramp of ['brand', 'neutral']) {
        const steps = Object.keys(flat)
          .filter((p) => p.startsWith(`color.palette.${ramp}.`))
          .map((p) => `${p.split('.').pop()} ${hexOf(flat[p]?.$value) ?? '?'}`);
        if (steps.length) process.stdout.write(`  ${ramp.padEnd(16)} ${steps.join('  ')}\n`);
      }
    }
    process.stdout.write(`\n${id} · ${mode}\n`);
    for (const [label, path, on, floor] of ROLES) {
      const hex = value(path);
      if (!hex) continue;
      let pair = '';
      const under = on ? value(on) : null;
      if (under) {
        const ratio = contrast(hex, under);
        pair = `${ratio.toFixed(2)}:1 on ${on!.replace('color.', '')}${floor && ratio < floor ? `  ✖ text below ${floor}:1` : ''}`;
      }
      process.stdout.write(`  ${label.padEnd(16)} ${hex}  ${path.padEnd(34)} ${pair}\n`);
    }
    if (inspiration.length) {
      const colors = Object.entries(flat)
        .map(([p, t]) => [p, hexOf(t.$value)] as const)
        .filter((e): e is readonly [string, string] => e[1] !== null);
      process.stdout.write('  inspiration → nearest token\n');
      for (const want of inspiration) {
        let best: readonly [string, string] = colors[0]!;
        for (const c of colors) if (drift(want, c[1]) < drift(want, best[1])) best = c;
        process.stdout.write(`    ${want.toUpperCase()} → ${best[1]} ${best[0]}  drift ${drift(want, best[1]).toFixed(1)}\n`);
      }
    }
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
