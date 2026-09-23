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

describe('docPath', () => {
  test.each([
    ['Button', 'site/src/content/docs/components/button.md'],
    ['SegmentedControl', 'site/src/content/docs/components/segmentedcontrol.md'],
    ['Pattern.SettingsPage', 'site/src/content/docs/patterns/settings-page.md'],
  ] as [string, string][])('%s → %s', (component, doc) => {
    expect(gd.docPath(component)).toBe(doc);
  });
});

const TOOLING = `# Tooling gaps

Prose above the entries is not an entry; neither is this line: - T0 is mentioned here.

- T1 | fixed abc1234 | hit-by: ledger ×20 | cost: 9 rounds, $40.00 | Whole-Storybook gates — fixed, so never ranked however expensive.
- T2 | open | hit-by: Switch.rn r1 | cost: - | A cheap item hit once.
- T3 | open | hit-by: ledger ×2, Slider.web r2 | cost: 1 round, $3.50 | FormFieldValue is \`string | boolean | undefined\` in the conventions.
- T4 | obsolete | hit-by: ledger ×1 | cost: - | Decided otherwise.
- T5 | open | hit-by: ledger ×4 | cost: - | Many hits, no cost.
- T2 | open | hit-by: Switch.rn r2, Tabs.rn r1 | cost: 2 rounds, $5.00 | The same item, filed a second time.
`;

const CODE = `# Code gaps

- C1 | fixed job-716 | hit-by: job-716 | cost: - | Fixed by a job whose commit has not landed.
- C2 | open | hit-by: - | cost: - | Nobody recorded a hit.
- C3 | open | hit-by: Tooltip.lit r2 | cost: 1 round | Rounds but no dollars.
`;

describe('ledgers', () => {
  let dir = '';
  beforeEach(() => {
    dir = join(tmp(), 'gaps');
    write(join(dir, 'TOOLING.md'), TOOLING);
    write(join(dir, 'CODE.md'), CODE);
  });

  test('parseLedger reads only entry lines, with hits, cost and the text intact', () => {
    const entries = gd.parseLedger(join(dir, 'TOOLING.md'));
    expect(entries.map((e) => e.id)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5', 'T2']);
    const t3 = entries[2] as gd.LedgerEntry;
    expect(t3).toMatchObject({ ledger: 'TOOLING', status: 'open', hits: ['ledger ×2', 'Slider.web r2'], hitCount: 3, rounds: 1, dollars: 3.5 });
    expect(t3.text, 'a pipe in the text is not a field separator').toBe('FormFieldValue is `string | boolean | undefined` in the conventions.');
    expect(gd.parseLedger(join(dir, 'CODE.md'))[1]).toMatchObject({ hits: [], hitCount: 0, rounds: 0, dollars: 0 });
  });

  test('a duplicate id is one item: hits and costs add up', () => {
    const t2 = gd.mergeEntries(gd.parseLedger(join(dir, 'TOOLING.md'))).find((e) => e.id === 'T2') as gd.LedgerEntry;
    expect(t2).toMatchObject({ hits: ['Switch.rn r1', 'Switch.rn r2', 'Tabs.rn r1'], hitCount: 3, rounds: 2, dollars: 5, text: 'A cheap item hit once.' });
  });

  test('a duplicate reopens a fixed item', () => {
    const entries = gd.parseLedger(join(dir, 'TOOLING.md'));
    const reopened = [...entries, { ...(entries[0] as gd.LedgerEntry), status: 'open', hits: ['Button.web r1'], hitCount: 1, rounds: 0, dollars: 0 }];
    expect(gd.mergeEntries(reopened).find((e) => e.id === 'T1')?.status).toBe('open');
  });

  test('rankOpen: fixed and obsolete dropped; dollars, then rounds, then hits', () => {
    const all = [...gd.parseLedger(join(dir, 'TOOLING.md')), ...gd.parseLedger(join(dir, 'CODE.md'))];
    expect(gd.rankOpen(all).map((e) => e.id)).toEqual(['T2', 'T3', 'C3', 'T5', 'C2']);
  });

  test('the digest lists the ranked open items and the counts, and main prints the top of the list', () => {
    const text = gd.build(dir, dir, null, 'x');
    const section = text.slice(text.indexOf('## Open ledger items'), text.indexOf('## Gates to fix'));
    expect(section).toContain('5 open · 2 fixed · 1 obsolete, across TOOLING.md and CODE.md');
    expect(section.split('\n').filter((ln) => ln.startsWith('- **')).map((ln) => ln.split('**')[1])).toEqual(['T2', 'T3', 'C3', 'T5', 'C2']);
    expect(section).toContain('- **T2** (TOOLING) 2 round(s), $5.00 · 3 hit(s) — A cheap item hit once.');
    expect(section).toContain('- **C2** (CODE) cost unknown · 0 hit(s)');
    expect(section, 'fixed items are not listed').not.toContain('Whole-Storybook');
    expect(text, 'a ledger is not a component section').not.toContain('## TOOLING');
    Object.assign(gd.paths, { GAPS: dir, LOCK_DIR: dir, ROOT: dir });
    expect(gd.main([])).toBe(0);
    expect(std.out()).toContain('5 open ledger item(s); the most expensive:\n  T2 (TOOLING) 2 round(s), $5.00 · 3 hit(s)');
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

  test('a pattern maps to its pattern doc, and a non-component file is skipped, not a component', () => {
    write(join(gaps, 'Pattern.SettingsPage.web.md'), '# Gaps\n\n## 2026-09-10 12:00 — round 1\n\n- SettingsPage: the doc does not specify the section order.\n');
    write(join(gaps, 'TEST-FAILURES.md'), '# Test failures\n\n## React (web) — 7 failing\n');
    write(join(gaps, 'FOLDS.md'), '2026-09-10 Button web: loading → disables\n');
    write(join(gaps, 'TOOLING.2026-09-23.md'), '# Tooling gaps\n\n- an old free-form line\n');
    const text = gd.build(gaps, root, null, 'x');
    expect(text).toContain('## Pattern.SettingsPage\n\nDoc: `site/src/content/docs/patterns/settings-page.md`');
    expect(text).not.toContain('components/pattern.settingspage.md');
    for (const name of ['TEST-FAILURES', 'FOLDS', 'TOOLING.2026-09-23']) {
      expect(text, name).not.toContain(`## ${name}\n`);
      expect(text, name).not.toContain(`components/${name.toLowerCase()}.md`);
    }
    expect(text).toContain('Not per-target gap files, skipped: FOLDS.md, TEST-FAILURES.md, TOOLING.2026-09-23.md.');
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
