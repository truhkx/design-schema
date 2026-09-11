#!/usr/bin/env node
// Currency gate (Workstream C, process/typescript-and-currency.md): every dependency tracks its
// latest stable release.
//
//   node tools/currency.ts                      runs `pnpm outdated --recursive --format json` and judges it
//   node tools/currency.ts --input report.json  judges a saved report instead (offline, tests)
//   node tools/currency.ts --today 2026-12-01   pretends it is another day (expiry checks)
//   node tools/currency.ts --allow other.json   uses another exception file
//
// A dependency fails when its `latest` tag is a major ahead, or more than one minor ahead within the
// same major. Patch lag never fails: Renovate automerges it. `.currency-allow.json` lists exceptions
// as { "name", "until": "YYYY-MM-DD", "reason" }; an entry past its date fails the job on its own, so
// an exception cannot outlive the reason it was written for. The report goes to stdout and, in CI,
// to the job summary.
//
// Runs under Node's type stripping (22.18+ / 24): annotations only — no enums, namespaces or
// parameter properties.
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

type Dependent = { name: string; location: string };
type OutdatedEntry = {
  current?: string;
  latest?: string;
  wanted?: string;
  isDeprecated?: boolean;
  dependencyType?: string;
  dependentPackages?: Dependent[];
};
type Allow = { name: string; until: string; reason: string };
type Version = { major: number; minor: number; patch: number };

const ALLOW_FILE = '.currency-allow.json';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

function parseVersion(v: string | undefined): Version | null {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v ?? '');
  return m ? { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) } : null;
}

// Why `current` is behind `latest`, or null when it is within one minor.
function lag(current: Version, latest: Version): string | null {
  if (latest.major > current.major) {
    const n = latest.major - current.major;
    return `${n} major${n === 1 ? '' : 's'} behind`;
  }
  if (latest.major === current.major && latest.minor - current.minor > 1) {
    return `${latest.minor - current.minor} minors behind`;
  }
  return null;
}

function stripBom(text: string): string {
  return text.replace(/^﻿/, '');
}

function readOutdated(): Record<string, OutdatedEntry> {
  const input = arg('--input');
  let text: string;
  if (input) {
    text = readFileSync(input, 'utf8');
  } else {
    // pnpm exits 1 whenever something is outdated; the report is still on stdout.
    const r = spawnSync('pnpm', ['outdated', '--recursive', '--format', 'json'], {
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
    if (r.error) throw r.error;
    text = r.stdout ?? '';
    if (!text.trim() && r.status !== null && r.status > 1) {
      process.stderr.write(r.stderr ?? '');
      throw new Error(`pnpm outdated exited ${r.status} without a report`);
    }
  }
  text = stripBom(text).trim();
  if (!text) return {};
  const data: unknown = JSON.parse(text);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('pnpm outdated: expected a JSON object keyed by package name');
  }
  return data as Record<string, OutdatedEntry>;
}

function readAllow(file: string): Allow[] {
  if (!existsSync(file)) return [];
  const data: unknown = JSON.parse(stripBom(readFileSync(file, 'utf8')));
  if (!Array.isArray(data)) throw new Error(`${file}: expected an array of { name, until, reason }`);
  const seen = new Set<string>();
  for (const entry of data as Partial<Allow>[]) {
    const name = typeof entry?.name === 'string' ? entry.name.trim() : '';
    if (!name) throw new Error(`${file}: every entry needs a "name"`);
    if (seen.has(name)) throw new Error(`${file}: "${name}" is listed twice`);
    seen.add(name);
    const until = entry.until;
    if (typeof until !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(until) || Number.isNaN(Date.parse(until))) {
      throw new Error(`${file}: "${name}" needs "until": "YYYY-MM-DD"`);
    }
    if (typeof entry.reason !== 'string' || !entry.reason.trim()) {
      throw new Error(`${file}: "${name}" needs a "reason"`);
    }
  }
  return data as Allow[];
}

function cell(text: string): string {
  return text.replace(/\|/g, '\\|');
}

function main(): number {
  const today = arg('--today') ?? new Date().toISOString().slice(0, 10);
  const allowFile = arg('--allow') ?? ALLOW_FILE;
  const outdated = readOutdated();
  const allow = readAllow(allowFile);
  const allowByName = new Map(allow.map((e) => [e.name, e]));
  const used = new Set<string>();

  const rows: string[] = [];
  const failures: string[] = [];
  const notes: string[] = [];
  let behind = 0;
  let allowed = 0;

  for (const name of Object.keys(outdated).sort()) {
    const e = outdated[name] ?? {};
    const current = parseVersion(e.current);
    const latest = parseVersion(e.latest);
    const who = (e.dependentPackages ?? []).map((d) => d.name).join(', ') || '-';
    const versions = `${e.current ?? '?'} -> ${e.latest ?? '?'}`;
    let status: string;
    if (!current || !latest) {
      status = 'skipped (version not semver)';
    } else {
      const why = lag(current, latest);
      const exception = allowByName.get(name);
      if (!why) {
        status = 'ok';
      } else if (exception && exception.until >= today) {
        used.add(name);
        allowed += 1;
        status = `allowed until ${exception.until}: ${exception.reason}`;
      } else if (exception) {
        used.add(name);
        behind += 1;
        failures.push(`${name}: ${why} (${versions}); the exception expired ${exception.until} (${exception.reason})`);
        status = `FAIL: ${why}; exception expired ${exception.until}`;
      } else {
        behind += 1;
        failures.push(`${name}: ${why} (${versions}; used by ${who})`);
        status = `FAIL: ${why}`;
      }
    }
    if (e.isDeprecated) status += '; deprecated on the registry';
    rows.push(`| ${cell(name)} | ${versions} | ${cell(who)} | ${cell(status)} |`);
  }

  let expired = 0;
  for (const entry of allow) {
    if (used.has(entry.name)) continue;
    if (entry.until < today) {
      expired += 1;
      failures.push(`${allowFile}: "${entry.name}" expired ${entry.until} (${entry.reason}); remove it or renew it with a new reason`);
    } else {
      notes.push(`${allowFile}: "${entry.name}" is within one minor of latest; the entry can go.`);
    }
  }

  const lines: string[] = [];
  lines.push('## currency');
  lines.push('');
  lines.push(`${rows.length} outdated, ${behind} behind, ${allowed} allowed, ${expired} expired exception${expired === 1 ? '' : 's'} (today ${today}; rule: more than one minor behind \`latest\` fails).`);
  lines.push('');
  if (rows.length) {
    lines.push('| package | current -> latest | used by | status |');
    lines.push('| --- | --- | --- | --- |');
    lines.push(...rows);
    lines.push('');
  }
  if (notes.length) {
    lines.push('Notes:');
    lines.push(...notes.map((n) => `- ${n}`));
    lines.push('');
  }
  if (failures.length) {
    lines.push('Failures:');
    lines.push(...failures.map((f) => `- ${f}`));
    lines.push('');
  }
  const report = lines.join('\n');
  process.stdout.write(report + '\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + '\n');

  return failures.length ? 1 : 0;
}

try {
  process.exitCode = main();
} catch (err) {
  process.stderr.write(`currency: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exitCode = 2;
}
