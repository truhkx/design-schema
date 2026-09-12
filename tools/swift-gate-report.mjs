#!/usr/bin/env node
/**
 * swift-gate-report.mjs — the macOS workflow's half of the swiftui gate contract.
 *
 *     node tools/swift-gate-report.mjs <Target> <log dir> <out dir>
 *
 * Reads the logs the gate steps tee'd (build.log, build-tests.log, gallery.log, swift-test.log,
 * uitests.log, each beside an `<name>.outcome` file holding `success`, `failure` or `skipped`) and writes
 * `<out dir>/<Target>.swiftui.json`:
 *
 *     { build: { ok, errors[] }, tests: { ok, failures[] }, audit: { ok, issues[], skipped?, note? } }
 *
 * tools/swiftui_gate.ts downloads that file and hands `errors`/`failures`/`issues` to the model as the
 * round's failing gates, so what matters here is that a line is the compiler's own: a `swift build` error
 * quoted verbatim is what makes a fix round work, and prose around it is noise the model has to argue with.
 *
 * The UI tests are one xcodebuild run producing one log, and their two halves are told apart by the marker
 * the test itself puts at the front of every failure it raises (DesignSchemaUITests/GalleryUITests.swift):
 *
 *     DS-AUDIT: …      → audit.issues
 *     DS-KEYBOARD: …   → tests.failures, beside the `swift test` ones
 *
 * A marker is used rather than the test's name because a UI test failure reaches the host only as a line
 * in this log — there is no other channel from a process on a simulator — and the message is the only part
 * of that line the test controls.
 *
 * Plain .mjs, not .ts: the runner has Swift and Node but never runs `pnpm install`, so this file may not
 * need tsx — and it is the only JavaScript in the repository that runs without the workspace installed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAX_LINES = 200; // a wall of the same cascade helps nobody; the first 200 lines carry the cause
const MAX_LINE = 500;

/** A Swift diagnostic: `Sources/DesignSchema/Button.swift:31:9: error: …`, plus the notes that follow it. */
const DIAGNOSTIC = /(^|:)\s*(error|fatal error|warning: .*never used):/i;
const TEST_FAILURE = /(✘|◇ Test .* failed|XCTAssert|Test Case '.*' failed|failed after .* seconds)/;

/** What the XCUITest prefixes its failures with, so one log can carry both halves. */
const MARKERS = { audit: 'DS-AUDIT:', keyboard: 'DS-KEYBOARD:' };

function read(dir, name) {
  const file = join(dir, name);
  return existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n?/g, '\n') : '';
}

function outcome(dir, name) {
  const text = read(dir, `${name}.outcome`).trim();
  return text === '' ? 'skipped' : text;
}

function lines(text, match) {
  const out = [];
  for (const line of text.split('\n')) {
    const trimmed = line.replace(/\s+$/, '');
    if (trimmed === '' || !match.test(trimmed)) continue;
    out.push(trimmed.length > MAX_LINE ? trimmed.slice(0, MAX_LINE) + ' …' : trimmed);
    if (out.length >= MAX_LINES) break;
  }
  return out;
}

/**
 * The marked failures in the UI-test log, as the test wrote them.
 *
 * The line around a marker is xcodebuild's (an absolute path on a runner, the objc name of the test
 * method), which says nothing to a model fixing a component, so only the message is kept. XCTest prints
 * each failure twice — once where it happened and once in the run's summary — so they are deduplicated.
 */
function marked(text, marker) {
  const out = [];
  for (const line of text.split('\n')) {
    const at = line.indexOf(marker);
    if (at === -1) continue;
    const message = line.slice(at + marker.length).replace(/\s+$/, '').replace(/^\s+/, '');
    if (message === '' || out.includes(message)) continue;
    out.push(message.length > MAX_LINE ? message.slice(0, MAX_LINE) + ' …' : message);
    if (out.length >= MAX_LINES) break;
  }
  return out;
}

/** When a step failed but printed nothing a matcher recognises, the tail of its log is the evidence. */
function fallback(text, taken) {
  if (taken.length > 0) return taken;
  const tail = text.split('\n').filter((l) => l.trim() !== '').slice(-20);
  return tail.length > 0 ? tail : ['the step failed without output — see the run log'];
}

const [target = 'all', logDir = '.', outDir = 'gates'] = process.argv.slice(2);

// ---------------------------------------------------------------- build
// `xcodebuild … generic/platform=iOS` for the package, the host build of the tests, and the gallery app
// with its UI-test bundle: three ways of asking whether the Swift on the branch compiles.

const buildSteps = ['build', 'build-tests', 'gallery'];
const buildText = buildSteps.map((s) => read(logDir, `${s}.log`)).join('\n');
const buildOk = buildSteps.every((s) => outcome(logDir, s) === 'success');
const build = { ok: buildOk, errors: buildOk ? [] : fallback(buildText, lines(buildText, DIAGNOSTIC)) };

// ---------------------------------------------------------------- tests
// The Swift Testing suite on the host, plus the keyboard rules checked on the simulator.

const uiText = read(logDir, 'uitests.log');
const uiOutcome = outcome(logDir, 'uitests');
const keyboardFailures = marked(uiText, MARKERS.keyboard);
const auditIssues = marked(uiText, MARKERS.audit);

const testText = read(logDir, 'swift-test.log');
const swiftTestOk = outcome(logDir, 'swift-test') === 'success';
const swiftTestFailures = swiftTestOk
  ? []
  : fallback(testText, lines(testText, TEST_FAILURE).concat(lines(testText, DIAGNOSTIC)));
const tests = {
  ok: swiftTestOk && keyboardFailures.length === 0,
  failures: swiftTestFailures.concat(keyboardFailures),
};

// ---------------------------------------------------------------- audit
// `performAccessibilityAudit()` on the target's gallery screen. A UI run that never happened is `skipped`
// rather than a pass — tools/swiftui_gate.ts prints a skipped section and never counts it against a round —
// and a UI run that failed without saying anything this script recognises is the gate itself breaking, not
// the component: the tail of the log goes in so a human can see which.
let audit;
if (uiOutcome === 'skipped') {
  audit = {
    ok: true,
    issues: [],
    skipped: true,
    note: 'the XCUITest accessibility audit did not run — the gallery app or the simulator was not ready',
  };
} else if (uiOutcome === 'success' || auditIssues.length > 0 || keyboardFailures.length > 0) {
  audit = { ok: auditIssues.length === 0, issues: auditIssues };
} else {
  audit = {
    ok: false,
    issues: fallback(uiText, lines(uiText, DIAGNOSTIC)),
    note: 'the UI test run failed without reporting an audit issue — the app may not have launched',
  };
}

mkdirSync(outDir, { recursive: true });
const file = join(outDir, `${target}.swiftui.json`);
writeFileSync(file, JSON.stringify({ build, tests, audit }, null, 2) + '\n', 'utf8');
process.stdout.write(
  `${file}: build ${build.ok ? 'ok' : build.errors.length + ' error(s)'}, ` +
    `tests ${tests.ok ? 'ok' : tests.failures.length + ' failure(s)'}, ` +
    `audit ${audit.skipped ? 'skipped' : audit.ok ? 'ok' : audit.issues.length + ' issue(s)'}\n`,
);
