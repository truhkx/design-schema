/**
 * tools/swift-sim.mjs — which iPad the swiftui gate's UI tests run on.
 *
 * Naming a device in the workflow breaks the week a runner image drops it, so the choice is made from
 * `xcrun simctl list devices available --json`. That listing is the one piece of the macOS job that can be
 * replayed anywhere, so the choice is tested here rather than discovered on a red run.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { REPO_ROOT } from '../lib/root.ts';

type Device = { name: string; udid: string; isAvailable?: boolean };

/** The script as the workflow runs it: the listing on stdin, one UDID on stdout. */
function pick(devices: Record<string, Device[]>): { status: number; udid: string; stderr: string } {
  const p = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'swift-sim.mjs')], {
    input: JSON.stringify({ devices }),
    encoding: 'utf8',
  });
  return { status: p.status ?? 1, udid: p.stdout.trim(), stderr: p.stderr };
}

const iOS26 = 'com.apple.CoreSimulator.SimRuntime.iOS-26-0';
const iOS27 = 'com.apple.CoreSimulator.SimRuntime.iOS-27-0';

describe('the gate`s simulator', () => {
  test('the newest iOS runtime wins, whatever else is installed', () => {
    const { udid } = pick({
      [iOS26]: [{ name: 'iPad Pro 13-inch (M4)', udid: 'old' }],
      [iOS27]: [{ name: 'iPad Pro 13-inch (M4)', udid: 'new' }],
      'com.apple.CoreSimulator.SimRuntime.watchOS-27-0': [{ name: 'iPad Pro 13-inch (M4)', udid: 'watch' }],
    });
    expect(udid).toBe('new');
  });

  test('the largest iPad within that runtime, because a compact width is a different layout', () => {
    const { udid } = pick({
      [iOS27]: [
        { name: 'iPad mini (A17 Pro)', udid: 'mini' },
        { name: 'iPad Pro 11-inch (M4)', udid: 'eleven' },
        { name: 'iPad Pro 13-inch (M4)', udid: 'thirteen' },
        { name: 'iPad Air 13-inch (M3)', udid: 'air' },
      ],
    });
    expect(udid).toBe('thirteen');
  });

  test('iPhones are not iPads: the keyboard rules are iPadOS behavior', () => {
    const { status, stderr } = pick({ [iOS27]: [{ name: 'iPhone 17 Pro', udid: 'phone' }] });
    expect(status).toBe(1);
    expect(stderr).toContain('no available iPad simulator');
  });

  test('an unavailable device is not a device', () => {
    const { udid } = pick({
      [iOS27]: [
        { name: 'iPad Pro 13-inch (M4)', udid: 'unavailable', isAvailable: false },
        { name: 'iPad mini (A17 Pro)', udid: 'usable' },
      ],
    });
    expect(udid).toBe('usable');
  });

  test('an empty listing fails loudly rather than booting nothing', () => {
    const { status, stderr } = pick({});
    expect(status).toBe(1);
    expect(stderr).toContain('no available iPad simulator');
  });
});
