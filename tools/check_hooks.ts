#!/usr/bin/env node
/**
 * Deterministic gate: a locked style binding still declares its CSS custom-property hook.
 *
 * `locked: true` (authored, or computed by tools/parse.ts from the contrast pairs, focus ring and
 * target rules) closes the *override API* for a binding — it leaves the `overrides` type and is
 * ignored if passed. It does not close the *styling hook*. On web and in web components every
 * binding, locked ones included, is still `--ds-<component>-<binding>` on the root, defaulting to
 * its token, and the rules read the hook rather than the token. That is the whole point of the rule:
 *
 *   - product CSS can still re-theme a locked binding through the sanctioned escape hatch
 *     (foundations/styling-and-overrides.md, "Layer 3");
 *   - `tools/naming.ts` can rename `--ds-*` to an adopter's brand prefix. A locked binding written
 *     as `color: var(--color-link)` with no hook of its own cannot be renamed or re-themed at all,
 *     which silently drops it out of a fork's brand surface.
 *
 * Exemption: a binding the doc forwards to a composed child (`composition.<part>.forwards.<binding>`)
 * declares no hook on the parent — the child carries it in its own `overrides`, and a parent hook
 * would be dead CSS. Those are skipped and counted separately.
 *
 * Platforms: `web` and `lit` only. Both spell the hook identically (`--ds-<name-kebab>-<binding-kebab>`,
 * on `.ds-<name>` for React and on `:host` for Lit), so one rule covers both; `rn` and `swiftui` have
 * no CSS custom properties at all and are not checked. Web reads `packages/react/src/<Name>.css`,
 * Lit the `css` template inside `packages/lit/src/<Name>.ts`.
 *
 * Reads generated/components.json for the resolved `locked` flag and the composition forwards, so
 * parse must have run.
 *
 * Usage:  node tools/check_hooks.ts                  # web and lit
 *         node tools/check_hooks.ts --platform web
 *         node tools/check_hooks.ts --component Link
 * Exit 1 on any finding.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PACKAGE_DIR, SOURCE_EXT, sourceDir } from '../schema/platforms.ts';
import { readComponents, type Dict, type Entry } from './lib/components.ts';
import { readText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import { kebab } from './parse.ts';

/** Every path the tool reads. The tests point these at a sandbox. */
export const paths = { ROOT: REPO_ROOT, COMPONENTS: join(REPO_ROOT, 'generated', 'components.json') };

/** The platforms that have CSS custom properties. `rn` and `swiftui` style with objects and have no hooks. */
export const HOOK_PLATFORMS: readonly string[] = ['web', 'lit'];

export type Finding = {
  platform: string;
  component: string;
  missing: string[];
  locked: number;
  forwarded: string[];
};

/** `--ds-<component>-<binding>`, the one spelling web and Lit share, and the one tools/naming.ts renames. */
export function hookName(component: string, binding: string): string {
  return `--ds-${kebab(component)}-${kebab(binding)}`;
}

/** Where a component's styles live for the platform: the sibling stylesheet on web, the source file on Lit. */
export function styleFile(root: string, platform: string, component: string): string {
  const dir = sourceDir(root, platform);
  return platform === 'web' ? join(dir, `${component}.css`) : join(dir, `${component}.${SOURCE_EXT[platform] as string}`);
}

/** Every parent binding the doc hands to a composed child's `overrides` — those declare no parent hook. */
export function forwardedBindings(component: Dict): Set<string> {
  const out = new Set<string>();
  for (const entry of Object.values((component.composition ?? {}) as Dict)) {
    if (entry === null || typeof entry !== 'object') continue;
    for (const binding of Object.keys(((entry as Dict).forwards ?? {}) as Dict)) out.add(binding);
  }
  return out;
}

/** One component on one platform; null when it has no locked bindings or no source file on that platform. */
export function checkComponent(root: string, platform: string, component: Dict): Finding | null {
  const styles = (component.styles ?? {}) as Dict;
  // A binding scoped to other platforms (`platforms: [rn, swiftui]`, e.g. Button's touchTarget) has no rule here to hook.
  const onPlatform = (s: Dict): boolean => !Array.isArray(s.platforms) || (s.platforms as string[]).includes(platform);
  const locked = Object.entries(styles).filter(([, s]) => s !== null && typeof s === 'object' && (s as Dict).locked === true && onPlatform(s as Dict));
  if (locked.length === 0) return null;
  const file = styleFile(root, platform, component.name as string);
  if (!existsSync(file)) return null; // not generated for this platform yet — not this gate's business
  const text = readText(file);
  const forwards = forwardedBindings(component);
  const missing: string[] = [];
  const forwarded: string[] = [];
  for (const [binding] of locked) {
    if (text.includes(`${hookName(component.name as string, binding)}:`)) continue;
    if (forwards.has(binding)) forwarded.push(binding);
    else missing.push(binding);
  }
  if (missing.length === 0 && forwarded.length === 0) return null;
  return { platform, component: component.name as string, missing, locked: locked.length, forwarded };
}

export function checkAll(
  root: string = paths.ROOT,
  componentsFile: string = paths.COMPONENTS,
  only: string | null = null,
  onlyComponent: string | null = null,
): Finding[] {
  const entries: Entry[] = readComponents(componentsFile);
  const findings: Finding[] = [];
  for (const platform of HOOK_PLATFORMS) {
    if (only !== null && platform !== only) continue;
    for (const entry of entries) {
      const component = (entry.component ?? null) as Dict | null;
      if (component === null || typeof component.name !== 'string') continue;
      if (onlyComponent !== null && component.name !== onlyComponent) continue;
      const finding = checkComponent(root, platform, component);
      if (finding !== null && finding.missing.length > 0) findings.push(finding);
    }
  }
  return findings;
}

export type Args = { platform: string | null; component: string | null };

/** argparse's `--platform {web,lit}` and `--component NAME`, both optional. */
export function parseArgs(argv: string[], prog: string = 'check_hooks.ts'): Args {
  const usage = `usage: ${prog} [-h] [--platform {${HOOK_PLATFORMS.join(',')}}] [--component COMPONENT]`;
  const die: (message: string) => never = (message) => {
    process.stderr.write(`${usage}\n${prog}: error: ${message}\n`);
    throw Object.assign(new Error(message), { exitCode: 2 });
  };
  const args: Args = { platform: null, component: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    const value = (flag: string): string => {
      const v = arg.startsWith(`${flag}=`) ? arg.slice(flag.length + 1) : argv[++i];
      if (v === undefined) die(`argument ${flag}: expected one argument`);
      return v as string;
    };
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(`${usage}\n`);
      throw Object.assign(new Error('help'), { exitCode: 0 });
    } else if (arg === '--platform' || arg.startsWith('--platform=')) {
      const v = value('--platform');
      if (!HOOK_PLATFORMS.includes(v)) {
        die(`argument --platform: invalid choice: '${v}' (choose from ${HOOK_PLATFORMS.join(', ')} — only these have CSS hooks)`);
      }
      args.platform = v;
    } else if (arg === '--component' || arg.startsWith('--component=')) {
      args.component = value('--component');
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
  const findings = checkAll(paths.ROOT, paths.COMPONENTS, a.platform, a.component);
  let bindings = 0;
  for (const f of findings) {
    bindings += f.missing.length;
    const where = `packages/${PACKAGE_DIR[f.platform] as string}/src/${f.component}`;
    process.stdout.write(
      `✖ ${f.component} (${f.platform}): ${f.missing.length} of ${f.locked} locked binding(s) declare no CSS hook in ${where}` +
        ` — ${f.missing.map((b) => hookName(f.component, b)).join(', ')}\n`,
    );
  }
  const scope = a.platform ?? HOOK_PLATFORMS.join('+');
  process.stdout.write(
    `${findings.length ? '✖' : '✔'} check_hooks [${scope}]: ${bindings} locked binding(s) without a CSS hook` +
      ` in ${findings.length} component(s)\n`,
  );
  if (findings.length > 0) {
    process.stdout.write(
      'A locked binding leaves the `overrides` type but keeps its hook: rules read `var(--ds-<component>-<binding>)`,\n' +
        'not the token directly, or the binding can never be re-themed from CSS nor renamed by tools/naming.ts.\n' +
        'See prompts/templates/{web,lit}.md and foundations/styling-and-overrides.md. Forwarded bindings are exempt.\n',
    );
  }
  return findings.length ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
