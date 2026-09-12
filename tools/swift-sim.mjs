#!/usr/bin/env node
/**
 * swift-sim.mjs — pick the iPad the swiftui gate's UI tests run on.
 *
 *     xcrun simctl list devices available --json | node tools/swift-sim.mjs
 *
 * Prints one UDID. The keyboard block the XCUITest checks is iPadOS hardware-keyboard behavior
 * (process/ios-platform.md), so the device has to be an iPad; which iPad is the runner image's business,
 * and naming one in the workflow would break the week a runner image drops it. So: the newest iOS runtime
 * the image has, and within it the largest iPad available, because the gallery screen has to fit without
 * the layout collapsing into the compact width a component's doc describes differently.
 *
 * Plain .mjs, like tools/swift-gate-report.mjs: the macOS runner has Swift and Node but never runs
 * `pnpm install`, so nothing here may need tsx or a dependency.
 */
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** `com.apple.CoreSimulator.SimRuntime.iOS-26-1` → [26, 1]; anything else sorts last. */
function runtimeVersion(identifier) {
  const match = /iOS-([0-9]+(?:-[0-9]+)*)$/.exec(identifier);
  if (match === null) return [-1];
  return match[1].split('-').map((n) => Number(n));
}

function compare(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (b[i] ?? 0) - (a[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Bigger is better: a 13" iPad Pro shows a component at the width the docs describe. */
function rank(name) {
  const inches = /([0-9]+(?:\.[0-9]+)?)-inch/.exec(name);
  const size = inches === null ? 0 : Number(inches[1]);
  const family = /iPad Pro/.test(name) ? 3 : /iPad Air/.test(name) ? 2 : 1;
  return [family, size];
}

/**
 * The best available iPad in `xcrun simctl list devices available --json` output, or null.
 * Only iOS runtimes are considered: an iPad on a visionOS or watchOS runtime is not a thing, but a
 * malformed key should not become one either.
 */
function pick(listing) {
  const devices = (listing ?? {}).devices ?? {};
  const candidates = [];
  for (const [runtime, list] of Object.entries(devices)) {
    if (!/SimRuntime\.iOS-/.test(runtime)) continue;
    for (const device of Array.isArray(list) ? list : []) {
      const name = String(device?.name ?? '');
      if (!name.includes('iPad')) continue;
      if (device?.isAvailable === false) continue;
      if (typeof device?.udid !== 'string' || device.udid === '') continue;
      candidates.push({ udid: device.udid, name, os: runtimeVersion(runtime), rank: rank(name) });
    }
  }
  candidates.sort((a, b) => compare(a.os, b.os) || compare(a.rank, b.rank) || a.name.localeCompare(b.name));
  return candidates[0] ?? null;
}

function read() {
  const chunks = [];
  return new Promise((done, fail) => {
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => done(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', fail);
  });
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const text = await read();
  let listing;
  try {
    listing = JSON.parse(text || '{}');
  } catch {
    process.stderr.write('swift-sim.mjs: `xcrun simctl list devices available --json` did not produce JSON\n');
    process.exit(1);
  }
  const device = pick(listing);
  if (device === null) {
    process.stderr.write('swift-sim.mjs: the runner image has no available iPad simulator on an iOS runtime\n');
    process.exit(1);
  }
  process.stderr.write(`swift-sim.mjs: ${device.name} (iOS ${device.os.join('.')}) ${device.udid}\n`);
  process.stdout.write(device.udid + '\n');
}
