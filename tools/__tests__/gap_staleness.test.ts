/** tools/gap_staleness.ts — the gap files a fold session still has to read. */
import { readFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import * as gs from '../gap_staleness.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...gs.paths };
afterEach(() => {
  Object.assign(gs.paths, saved);
});

/** A gap file with one `## <when> — round <n>` heading per round, touched at `mtime` (local time). */
function gap(dir: string, name: string, rounds: string[], mtime = '2026-09-23T16:44:49'): void {
  const body = rounds.map((when, i) => `## ${when} — round ${i + 1}\n\n- ${name}: chose something.\n`).join('\n');
  const file = write(join(dir, name), `# Gaps reported while generating ${name}\n\n${body}`);
  const at = new Date(mtime);
  utimesSync(file, at, at);
}

function sandbox(folded: Record<string, string>): string {
  const dir = tmp();
  write(join(dir, 'folded.json'), JSON.stringify({ _note: 'gap file name -> mtime', ...folded }));
  gap(dir, 'Button.web.md', ['2026-09-20 09:58']);
  gap(dir, 'Button.rn.md', ['2026-09-20 09:58', '2026-09-22 09:30', '2026-09-22 09:45']);
  gap(dir, 'Feed.lit.md', ['2026-09-22 10:50']);
  gap(dir, 'Card.web.md', ['2026-09-16 02:51']);
  gap(dir, 'Empty.web.md', []);
  gap(dir, 'TOOLING.md', ['2026-09-23 00:00']);
  Object.assign(gs.paths, { ROOT: dir, GAPS: dir });
  return dir;
}

const FOLDED = { 'Button.web.md': '2026-09-20T10:00:00', 'Button.rn.md': '2026-09-21T10:00:00', 'Card.web.md': '2026-09-16T02:51:40' };

describe('roundTimes', () => {
  test('every round heading, to the minute', () => {
    expect(gs.roundTimes('## 2026-09-20 10:11 — round 1\n\n- x\n\n## 2026-09-20 10:24 — round 2\n## not a round\n')).toEqual([
      '2026-09-20T10:11',
      '2026-09-20T10:24',
    ]);
  });
});

describe('unfolded', () => {
  test('rounds after the entry, compared to the minute', () => {
    expect(gs.unfolded(['2026-09-20T10:11', '2026-09-22T04:12'], '2026-09-20T14:54:31')).toEqual(['2026-09-22T04:12']);
    expect(gs.unfolded(['2026-09-20T14:54'], '2026-09-20T14:54:31')).toEqual([]);
  });

  test('no entry: every round is unfolded', () => {
    expect(gs.unfolded(['2026-09-20T10:11'], null)).toEqual(['2026-09-20T10:11']);
  });
});

describe('staleGapFiles', () => {
  test('only <Name>.<platform>.md files with a round newer than, or missing from, folded.json', () => {
    const dir = sandbox(FOLDED);
    const { stale, total } = gs.staleGapFiles(dir);
    expect(total).toBe(5);
    expect(stale).toEqual([
      { file: 'Button.rn.md', rounds: 2, newest: '2026-09-22T09:45', folded: '2026-09-21T10:00:00', mtime: '2026-09-23T16:44:49' },
      { file: 'Feed.lit.md', rounds: 1, newest: '2026-09-22T10:50', folded: null, mtime: '2026-09-23T16:44:49' },
    ]);
  });

  test('a rewrite that bumps every mtime but adds no round makes nothing stale', () => {
    const dir = tmp();
    write(join(dir, 'folded.json'), JSON.stringify({ 'Button.web.md': '2026-09-20T10:00:00' }));
    gap(dir, 'Button.web.md', ['2026-09-20 09:58'], '2026-09-23T16:45:09');
    expect(gs.staleGapFiles(dir).stale).toEqual([]);
  });

  test('a missing folded.json makes every gap file with a round stale', () => {
    const dir = tmp();
    gap(dir, 'Button.web.md', ['2026-09-20 09:58']);
    expect(gs.staleGapFiles(dir).stale.map((s) => s.file)).toEqual(['Button.web.md']);
  });
});

describe('main', () => {
  test('prints one line per stale file and a count, exit 0', () => {
    sandbox(FOLDED);
    expect(gs.main([])).toBe(0);
    expect(std.out()).toBe(
      'stale  Button.rn.md  2 round(s), newest 2026-09-22T09:45  (folded 2026-09-21T10:00:00)\n' +
        'stale  Feed.lit.md   1 round(s), newest 2026-09-22T10:50  (never folded)\n' +
        '✔ gap staleness: 2 of 5 gap file(s) have rounds newer than folded.json\n',
    );
  });

  test('--json prints the entries to merge into folded.json', () => {
    sandbox(FOLDED);
    expect(gs.main(['--json'])).toBe(0);
    expect(JSON.parse(std.out())).toEqual({ 'Button.rn.md': '2026-09-23T16:44:49', 'Feed.lit.md': '2026-09-23T16:44:49' });
  });

  test('an unknown flag exits 2', () => {
    expect(gs.main(['--stamp'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --stamp');
  });
});

describe('prompts/fold-gaps.md', () => {
  test('tells the fold session to run the staleness tool', () => {
    const prompt = readFileSync(join(REPO_ROOT, 'prompts', 'fold-gaps.md'), 'utf8');
    expect(prompt).toContain('node --import tsx tools/gap_staleness.ts');
  });
});
