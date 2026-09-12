/**
 * tools/swift-gate-report.mjs — the macOS workflow's side of the swiftui gate contract, and the only part
 * of that workflow that can be run anywhere: given the logs the gate steps tee'd, does it write the
 * gates/<Name>.swiftui.json that tools/swiftui_gate.ts reads?
 *
 * The pair is tested together (the report script writes, `results()` reads), because between them they are
 * the whole contract — a rename on either side is otherwise only discovered on a Mac.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { REPO_ROOT } from '../lib/root.ts';
import * as gate from '../swiftui_gate.ts';
import { useTmp, write } from './fixtures.ts';

const tmp = useTmp();

const BUILD_LOG = `[1/3] Compiling DesignSchema Button.swift
Sources/DesignSchema/Button.swift:31:9: error: cannot find 'theme' in scope
Sources/DesignSchema/Button.swift:31:9: note: did you mean 'Theme'?
error: fatalError
`;

/** A UI-test failure as xcodebuild prints it: a runner path, the objc test name, then the test's message. */
function uiFailure(marker: string, message: string): string {
  return `/Users/runner/work/design-schema/packages/swiftui/Tests/DesignSchemaUITests/GalleryUITests.swift:88:`
    + ` error: -[GalleryAuditTests testAccessibilityAudit] : ${marker} ${message}`;
}

let call = 0;

/** Runs the report script the way the workflow step does, in a folder of its own. */
function report(target: string, logs: Record<string, string>): Record<string, gate.Section> {
  const dir = join(tmp(), `run-${++call}`);
  const logDir = join(dir, 'gates-logs');
  const outDir = join(dir, 'gates');
  for (const [name, text] of Object.entries(logs)) write(join(logDir, name), text);
  const p = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'swift-gate-report.mjs'), target, logDir, outDir], { encoding: 'utf8' });
  expect(p.status, p.stderr).toBe(0);
  return JSON.parse(readFileSync(join(outDir, `${target}.swiftui.json`), 'utf8')) as Record<string, gate.Section>;
}

const green = {
  'build.outcome': 'success\n',
  'build-tests.outcome': 'success\n',
  'gallery.outcome': 'success\n',
  'swift-test.outcome': 'success\n',
  'uitests.outcome': 'success\n',
};

describe('the gate report', () => {
  test('every step green is three ok sections', () => {
    const data = report('Button', { ...green, 'build.log': '** BUILD SUCCEEDED **' });
    expect(data['build']).toEqual({ ok: true, errors: [] });
    expect(data['tests']).toEqual({ ok: true, failures: [] });
    expect(data['audit']).toEqual({ ok: true, issues: [] });
    expect(gate.results('Button', data).every((r) => r.ok)).toBe(true);
  });

  test('a failed build carries the compiler`s own lines, and the note beside them', () => {
    const data = report('Button', { ...green, 'build.outcome': 'failure\n', 'build.log': BUILD_LOG });
    expect(data['build']?.ok).toBe(false);
    expect(data['build']?.errors).toEqual([
      "Sources/DesignSchema/Button.swift:31:9: error: cannot find 'theme' in scope",
      'error: fatalError',
    ]);
    const [build] = gate.results('Button', data);
    expect(build?.name).toBe('swift-build');
    expect(build?.ok).toBe(false);
    expect(build?.output).toContain("cannot find 'theme' in scope");
  });

  test('the gallery build is part of the build section', () => {
    const data = report('Icon', { ...green, 'gallery.outcome': 'failure\n', 'gallery.log': 'Sources/IOSGallery/GalleryRoot.swift:9:5: error: no such module' });
    expect(data['build']?.ok).toBe(false);
    expect(data['build']?.errors?.[0]).toContain('no such module');
  });

  test('a snapshot failure is a test failure, not a build error', () => {
    const data = report('Icon', {
      ...green,
      'swift-test.outcome': 'failure\n',
      'swift-test.log': '◇ Test glyphsMatchTheBrowser() started.\n✘ Test glyphsMatchTheBrowser() recorded an issue: 4.1% of pixels differ for "chevron-down"',
    });
    expect(data['build']?.ok).toBe(true);
    expect(data['tests']?.ok).toBe(false);
    expect(data['tests']?.failures?.join('\n')).toContain('4.1% of pixels differ');
  });

  test('a step that failed silently still says something the model can act on', () => {
    const data = report('Button', { ...green, 'build.outcome': 'failure\n', 'build.log': 'Fetching https://example.invalid\n' });
    expect(data['build']?.errors).toEqual(['Fetching https://example.invalid']);
    const empty = report('Button', { ...green, 'build.outcome': 'failure\n' });
    expect(empty['build']?.errors?.[0]).toContain('the step failed without output');
  });
});

describe('the UI test halves', () => {
  test('an audit issue is the audit section, and only the test`s own message survives', () => {
    const data = report('Switch', {
      ...green,
      'uitests.outcome': 'failure\n',
      'uitests.log': [
        uiFailure('DS-AUDIT:', 'Switch: contrast: Element has insufficient contrast [Switch.track]'),
        // XCTest prints every failure twice; the report must not say it twice.
        uiFailure('DS-AUDIT:', 'Switch: contrast: Element has insufficient contrast [Switch.track]'),
      ].join('\n'),
    });
    expect(data['audit']?.ok).toBe(false);
    expect(data['audit']?.issues).toEqual(['Switch: contrast: Element has insufficient contrast [Switch.track]']);
    expect(data['tests']?.ok).toBe(true);
    const audit = gate.results('Switch', data).find((r) => r.name === 'swift-audit');
    expect(audit?.ok).toBe(false);
    expect(audit?.output).toContain('insufficient contrast');
  });

  test('a keyboard rule is a test failure, and leaves the audit passing', () => {
    const data = report('Tabs', {
      ...green,
      'uitests.outcome': 'failure\n',
      'uitests.log': [
        uiFailure('DS-KEYBOARD:', 'Tabs ArrowRight (horizontal): Moves to the next tab.: focus is at position 0, expected 1'),
        'DS-KEYBOARD-SKIP: Tabs ArrowUp (vertical): the doc marks this rule manual',
      ].join('\n'),
    });
    expect(data['tests']?.ok).toBe(false);
    expect(data['tests']?.failures).toEqual([
      'Tabs ArrowRight (horizontal): Moves to the next tab.: focus is at position 0, expected 1',
    ]);
    expect(data['audit']).toEqual({ ok: true, issues: [] });
    // A skip is context in the log, never a finding: nothing claims the rule passed.
    expect(JSON.stringify(data)).not.toContain('marks this rule manual');
  });

  test('both halves of one run land in their own section', () => {
    const data = report('Menu', {
      ...green,
      'swift-test.outcome': 'failure\n',
      'swift-test.log': "✘ Test opensOnClick() recorded an issue: expected true",
      'uitests.outcome': 'failure\n',
      'uitests.log': [
        uiFailure('DS-AUDIT:', 'Menu: element-description: Element has no description [Menu.item]'),
        uiFailure('DS-KEYBOARD:', 'Menu Escape: Closes the menu.: the component is still on screen'),
      ].join('\n'),
    });
    expect(data['tests']?.failures).toEqual([
      '✘ Test opensOnClick() recorded an issue: expected true',
      'Menu Escape: Closes the menu.: the component is still on screen',
    ]);
    expect(data['audit']?.issues).toEqual(['Menu: element-description: Element has no description [Menu.item]']);
  });

  test('a UI run that never happened is skipped, not a pass', () => {
    const data = report('Button', { ...green, 'uitests.outcome': 'skipped\n' });
    expect(data['audit']?.skipped).toBe(true);
    expect(data['audit']?.ok).toBe(true);
    expect(data['audit']?.note).toContain('did not run');
    const audit = gate.results('Button', data).find((r) => r.name === 'swift-audit');
    expect(audit?.ok).toBe(true);
    expect(audit?.output).toContain('skipped on the runner');
  });

  test('a UI run that broke without a finding says so rather than passing', () => {
    const data = report('Button', {
      ...green,
      'uitests.outcome': 'failure\n',
      'uitests.log': 'Testing failed:\n    Application launch failed: process did not start\n',
    });
    expect(data['audit']?.ok).toBe(false);
    expect(data['audit']?.note).toContain('may not have launched');
    expect(data['audit']?.issues?.join('\n')).toContain('process did not start');
  });

  test('no keyboard block is not a missing gate — the target simply has no rules', () => {
    const data = report('Button', {
      ...green,
      'uitests.log': 'keyboard rules: none for Button (the doc declares no keyboard block)\n'
        + 'DS-KEYBOARD-SKIP: Button: no keyboard block in the doc — nothing to check\n',
    });
    expect(data['tests']).toEqual({ ok: true, failures: [] });
    expect(data['audit']).toEqual({ ok: true, issues: [] });
  });
});
