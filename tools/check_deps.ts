#!/usr/bin/env node
/**
 * Deterministic gate: the generated packages may not grow runtime dependencies.
 *
 * The system's promise is that a component is tokens plus platform primitives. Every runtime
 * dependency a package carries is one an adopter carries too, so the allowed set is fixed here
 * and the generator cannot widen it (a model that adds a package to package.json fails this gate).
 *
 * Allowed runtime dependencies (`dependencies` + `peerDependencies`; devDependencies are free):
 *   tokens   none
 *   react    react, react-dom, @design-schema/tokens
 *   lit      lit, @design-schema/tokens
 *   rn       react, react-native, react-native-svg (decision 2026-09-10: the one third-party runtime
 *            dependency, for Icon), @design-schema/tokens
 *
 * Usage:  node tools/check_deps.ts            # every package
 *         node tools/check_deps.ts --platform rn
 * Exit 1 on any finding.
 *
 * Port of tools/check_deps.py: same flags, same findings, same lines on stdout, same exit codes.
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pySorted, truthy } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads. The tests point these at a sandbox. */
export const paths = { PACKAGES: join(REPO_ROOT, 'packages') };

export const PKG: Record<string, string> = { web: 'react', lit: 'lit', rn: 'rn' };

const TOKENS = '@design-schema/tokens';
export const ALLOWED: Record<string, string[]> = {
  tokens: [],
  react: ['react', 'react-dom', TOKENS],
  lit: ['lit', TOKENS],
  rn: ['react', 'react-native', 'react-native-svg', TOKENS],
};
export const RUNTIME_FIELDS: string[] = ['dependencies', 'peerDependencies', 'optionalDependencies'];

type Manifest = Record<string, unknown>;

/** Findings for one package.json (already parsed). Unknown packages are not checked. */
export function checkPackage(name: string, manifest: Manifest): string[] {
  if (!Object.hasOwn(ALLOWED, name)) return [];
  const allowed = new Set(ALLOWED[name]);
  const findings: string[] = [];
  for (const field of RUNTIME_FIELDS) {
    const block = manifest[field];
    const deps = truthy(block) ? Object.keys(block as Record<string, unknown>) : [];
    for (const dep of pySorted(deps)) {
      if (!allowed.has(dep)) {
        const list = pySorted([...allowed]).join(', ') || 'none';
        findings.push(`packages/${name}: ${field} has '${dep}', which is not an allowed runtime dependency (allowed: ${list})`);
      }
    }
  }
  return findings;
}

export function checkAll(packagesDir: string = paths.PACKAGES, only: string | null = null): string[] {
  const findings: string[] = [];
  for (const name of pySorted(Object.keys(ALLOWED))) {
    if (only && name !== only) continue;
    const manifest = join(packagesDir, name, 'package.json');
    if (!existsSync(manifest)) continue;
    findings.push(...checkPackage(name, JSON.parse(readFileSync(manifest, 'utf8')) as Manifest));
  }
  return findings;
}

export type Args = { platform: string | null };

/** argparse's `--platform {web,lit,rn}` (optional). */
export function parseArgs(argv: string[], prog: string = 'check_deps.ts'): Args {
  const usage = `usage: ${prog} [-h] [--platform {web,lit,rn}]`;
  const die: (message: string) => never = (message) => {
    process.stderr.write(`${usage}\n${prog}: error: ${message}\n`);
    throw Object.assign(new Error(message), { exitCode: 2 });
  };
  const args: Args = { platform: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(`${usage}\n`);
      throw Object.assign(new Error('help'), { exitCode: 0 });
    } else if (arg === '--platform' || arg.startsWith('--platform=')) {
      const value = arg.startsWith('--platform=') ? arg.slice('--platform='.length) : argv[++i];
      if (value === undefined) die('argument --platform: expected one argument');
      if (!Object.hasOwn(PKG, value)) die(`argument --platform: invalid choice: '${value}' (choose from ${Object.keys(PKG).join(', ')})`);
      args.platform = value;
    } else {
      die(`unrecognized arguments: ${arg}`);
    }
  }
  return args;
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let a: Args;
  try {
    a = parseArgs(argv);
  } catch (e) {
    return (e as { exitCode?: number }).exitCode ?? 2;
  }
  const findings = checkAll(paths.PACKAGES, a.platform ? (PKG[a.platform] as string) : null);
  for (const f of findings) process.stdout.write(`✖ ${f}\n`);
  process.stdout.write(`${findings.length ? '✖' : '✔'} check_deps: ${findings.length} finding(s)\n`);
  return findings.length ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
