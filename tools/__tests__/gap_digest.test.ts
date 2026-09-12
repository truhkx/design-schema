/** tools/gap_digest.ts — the between-phases summary of what the generator guessed.
 *  (Port of tests/test_gap_digest.py.) */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as gd from '../gap_digest.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...gd.paths };
afterEach(() => {
  Object.assign(gd.paths, saved);
});

const BUTTON_WEB = `# Gaps reported while generating Button for web

## 2026-09-10 10:00 — round 1

- Button: the spec does not say whether \`loading\` disables the button; assumed it does.
- Button: pre-existing bug in FormContext typing, worked around with a cast.
- Button: typecheck could not run (no node_modules), gate skipped.
- Button: no changes were needed to index.ts.

## 2026-09-10 10:20 — round 2

- Button: the spec does not say whether \`loading\` disables the button; assumed it does.
- Button: chose \`aria-busy\` for the loading state.
`;

const BUTTON_RN = `# Gaps reported while generating Button for rn

## 2026-09-10 09:00 — round 1

- Button: no native equivalent of \`type=submit\`; ambiguous whether to emit onPress only.
`;

let root = '';
let gaps = '';

beforeEach(() => {
  root = tmp();
  gaps = join(root, 'gaps');
  write(join(gaps, 'Button.web.md'), BUTTON_WEB);
  write(join(gaps, 'Button.rn.md'), BUTTON_RN);
  write(join(gaps, 'Alert.web.md'), '# Gaps\n\n## 2026-09-10 11:00 — round 1\n\n- Alert: permission denied writing the story.\n');
  write(join(gaps, 'SUMMARY.md'), 'old digest — must be ignored as input');
  write(join(root, 'generate.lock.web.json'), JSON.stringify({
    'Button.web': { hash: 'abc', gates: { parse: true, typecheck: false, tests: false } },
    'Alert.web': { hash: 'def', gates: { parse: true, typecheck: true } },
  }));
  write(join(root, 'generate.lock.rn.json'), JSON.stringify({
    'Button.rn': { hash: null, gates: { literals: false } },
  }));
});

describe('classify', () => {
  test.each([
    ['the spec does not say what happens', 'DOC'],
    ['value is unspecified in the doc', 'DOC'],
    ['ambiguous whether X', 'DOC'],
    ['chose aria-busy', 'DOC'],
    ['assumed the default', 'DOC'],
    ['not stated anywhere', 'DOC'],
    ['pre-existing bug in the context', 'CODE'],
    ['the helper already existed', 'CODE'],
    ['permission denied for Bash', 'TOOLING'],
    ['typecheck could not run', 'TOOLING'],
    ['no node_modules present', 'TOOLING'],
    ['no changes were needed', 'NOISE'],
    ['something with no keyword at all', 'DOC'],
  ] as [string, string][])('%s → %s', (line, cat) => {
    expect(gd.classify(line, new Set())).toBe(cat);
  });

  test('a repeat in the same file is noise whatever it says', () => {
    const seen = new Set<string>();
    expect(gd.classify('the spec does not say X', seen)).toBe('DOC');
    expect(gd.classify('The spec does  not say X ', seen)).toBe('NOISE');
  });

  test('tooling wins over doc words in the same line', () => {
    expect(gd.classify('typecheck could not run, so I assumed it passes', new Set())).toBe('TOOLING');
  });
});

describe('parseGapFile', () => {
  test('rounds newest first with classified lines', () => {
    const g = gd.parseGapFile(join(gaps, 'Button.web.md'));
    expect(g.component).toBe('Button');
    expect(g.platform).toBe('web');
    expect(g.rounds.map((r) => r.round)).toEqual([2, 1]);
    expect(g.rounds[0]?.lines.map(([c]) => c), "the repeat of round 1's first line is noise; the new choice is a doc gap").toEqual(['NOISE', 'DOC']);
    const first = Object.fromEntries((g.rounds[1]?.lines ?? []).map(([c, t]) => [t, c]));
    expect(first['Button: pre-existing bug in FormContext typing, worked around with a cast.']).toBe('CODE');
    expect(first['Button: typecheck could not run (no node_modules), gate skipped.']).toBe('TOOLING');
    expect(first['Button: no changes were needed to index.ts.']).toBe('NOISE');
  });
});

describe('failedGates', () => {
  test('reads every lockfile and lists only false gates', () => {
    expect(gd.failedGates(root)).toEqual([['Button.rn', ['literals']], ['Button.web', ['tests', 'typecheck']]]);
  });
});

describe('digest', () => {
  test('shape', () => {
    const text = gd.build(gaps, root, 'Core', '2026-09-10T12:00');
    expect(text.startsWith('# Gap digest — phase Core')).toBe(true);
    expect(text.indexOf('## Alert'), 'one section per component, sorted').toBeLessThan(text.indexOf('## Button'));
    const button = text.slice(text.indexOf('## Button'), text.indexOf('## Totals'));
    expect(button).toContain('Doc: `site/src/content/docs/components/button.md`');
    // newest round first, across platforms
    expect(button.split('\n').filter((ln) => ln.startsWith('### '))).toEqual([
      '### 2026-09-10 10:20 — web round 2',
      '### 2026-09-10 10:00 — web round 1',
      '### 2026-09-10 09:00 — rn round 1',
    ]);
    const round1 = button.slice(button.indexOf('### 2026-09-10 10:00'), button.indexOf('### 2026-09-10 09:00'));
    const order = round1.split('\n').filter((ln) => ln.startsWith('- **')).map((ln) => ln.split('**')[1]);
    expect(order, 'DOC first, then CODE, then TOOLING').toEqual(['DOC', 'CODE', 'TOOLING']);
    expect(round1).toContain('→ `site/src/content/docs/components/button.md`');
    expect(round1).toContain('NOISE: 1 repeated or empty line(s) collapsed');
    expect(round1, 'noise lines are collapsed, not listed').not.toContain('no changes were needed');
  });

  test('a checklist of failed targets', () => {
    const tail = gd.build(gaps, root).split('## Gates to fix')[1] as string;
    expect(tail).toContain('- [ ] Button.rn — literals');
    expect(tail).toContain('- [ ] Button.web — tests, typecheck');
    expect(tail).not.toContain('Alert.web');
  });

  test('no phase and no failures', () => {
    const empty = join(tmp(), 'empty');
    write(join(empty, 'gaps', '.keep'), '');
    const text = gd.build(join(empty, 'gaps'), empty, null, 'x');
    expect(text.startsWith('# Gap digest\n')).toBe(true);
    expect(text).toContain('- none: every recorded target passed its gates');
  });

  test('the old summary is not read as input', () => {
    const text = gd.build(gaps, root);
    expect(text).not.toContain('old digest');
    expect(text).not.toContain('## SUMMARY');
  });

  test('main writes the summary', () => {
    Object.assign(gd.paths, { GAPS: gaps, LOCK_DIR: root, ROOT: root });
    expect(gd.main(['--phase', 'Core'])).toBe(0);
    expect(readFileSync(join(gaps, 'SUMMARY.md'), 'utf8').startsWith('# Gap digest — phase Core')).toBe(true);
    expect(std.out()).toContain('DOC line(s), 2 failed target(s)');
  });

  test('--out redirects the digest', () => {
    Object.assign(gd.paths, { GAPS: gaps, LOCK_DIR: root, ROOT: root });
    const out = join(root, 'elsewhere', 'DIGEST.md');
    expect(gd.main(['--out', out])).toBe(0);
    // `writeText` is Python's text mode: the line separator is the platform's, so compare normalised.
    expect(readFileSync(out, 'utf8').replace(/\r\n/g, '\n').startsWith('# Gap digest\n')).toBe(true);
    expect(readFileSync(join(gaps, 'SUMMARY.md'), 'utf8')).toBe('old digest — must be ignored as input');
  });
});
