#!/usr/bin/env node
/**
 * Print a canonical component's public API as the generators see it, so an adopter's existing API can be compared
 * against it name by name: props (type, values, default, required, platforms, lifecycle, Lit attribute), events with
 * the name each platform emits, anatomy parts with their kind and slot names, the Lit tag, the class and CSS hook
 * spellings, and the naming key each item takes in themes/<brand>/naming.md.
 *
 *   node --import tsx .claude/skills/align-existing-api/scripts/canonical.ts Button [Alert ...] [--platform web,lit]
 *   node --import tsx .claude/skills/align-existing-api/scripts/canonical.ts --list
 *   node --import tsx .claude/skills/align-existing-api/scripts/canonical.ts --tokens color.action
 *
 * Reads generated/components.json, where tools/parse.ts has already merged the extension docs (an item an extension
 * added names its file), so run `pnpm parse` first. Hooks and classes are shown under Design Schema's own `ds`
 * prefix; naming.namespace.cssPrefix moves the prefix and nothing else. Read-only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { partKind, PLATFORMS, reflectEntry, slotName } from '../../../../schema/component.ts';
import { TOKEN_NAMES } from '../../../../schema/tokens.ts';
import { enumValues } from '../../../../schema/vocab.ts';
import { REPO_ROOT } from '../../../../tools/lib/root.ts';
import { camelName, cssName } from '../../../../tools/lib/tokens.ts';
import { kebab } from '../../../../tools/parse.ts';

const COMPONENTS = join(REPO_ROOT, 'generated', 'components.json');

type Lifecycle = { since?: string; deprecated?: { reason: string; since?: string; use?: string } };
type Prop = Lifecycle & {
  type: string;
  shape?: string;
  required?: boolean;
  default?: string | number | boolean;
  values?: string[];
  enumRef?: string;
  platforms?: string[];
  valuesOn?: Record<string, string[]>;
  controls?: { event: string; default?: string };
  valueLifecycle?: Record<string, Lifecycle>;
  source?: string;
};
type Event = Lifecycle & { platforms?: Record<string, string>; payload?: unknown; cancelable?: boolean; source?: string };
type Binding = { part?: string; locked?: boolean; platforms?: string[]; source?: string };
type Notes = { element?: string; tag?: string; reflect?: (string | { prop: string; attribute: string })[]; supported?: boolean };
type Component = Lifecycle & {
  name: string;
  category: string;
  status?: string;
  apg?: string;
  anatomy: string[];
  parts?: Record<string, { kind: 'element' | 'component' | 'slot'; slot?: { default?: boolean; prop?: string; platforms?: Record<string, string> } }>;
  props: Record<string, Prop>;
  events?: Record<string, Event>;
  styles?: Record<string, Binding>;
  composition?: Record<string, string | { component: string }>;
  a11y?: { role?: string; roleFrom?: string };
  platforms: Record<string, Notes>;
};
type Extension = {
  name: string;
  file: string;
  adds?: Record<string, string[]>;
  defaults?: Record<string, { from: unknown; to: unknown }>;
  omits?: Record<string, string[]>;
  modules?: Record<string, { path: string; signature: string; wire: string; platforms?: string[] }>;
};
type Entry = { description?: string; component?: Component; extensions?: Extension[] };

/** Columns padded to their widest cell, two spaces apart; the last column is left ragged. */
function table(head: string[], rows: string[][]): string {
  const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)));
  const line = (cells: string[]): string =>
    `  ${cells.map((c, i) => (i === cells.length - 1 ? c : c.padEnd(widths[i] ?? 0))).join('  ')}`.trimEnd();
  return [line(head), ...rows.map(line)].join('\n');
}

function literal(value: unknown): string {
  return value === undefined ? '' : typeof value === 'string' ? value : JSON.stringify(value);
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function lifecycle(item: Lifecycle): string[] {
  const out: string[] = [];
  if (item.since !== undefined) out.push(`since ${item.since}`);
  if (item.deprecated !== undefined) out.push(`deprecated${item.deprecated.use === undefined ? '' : ` → ${item.deprecated.use}`}`);
  return out;
}

function source(item: { source?: string }): string[] {
  return item.source === undefined ? [] : [`from ${item.source}`];
}

function describe(entry: Entry, platforms: readonly string[]): string {
  const c = entry.component as Component;
  const stem = kebab(c.name);
  const declared = PLATFORMS.filter((p) => Object.hasOwn(c.platforms, p) && platforms.includes(p));
  const out: string[] = [];

  const role = c.a11y?.role ?? (c.a11y?.roleFrom === undefined ? undefined : `from ${c.a11y.roleFrom}`);
  out.push(`${c.name} — ${[c.category, c.apg === undefined ? null : `APG ${c.apg}`, c.status ?? null, role === undefined ? null : `role ${role}`, ...lifecycle(c)].filter((x) => x !== null).join(' · ')}`);
  if (entry.description) out.push(`  ${entry.description}`);
  out.push(`  naming key: components.${c.name}`);
  const rendered = declared.map((p) => {
    const n = c.platforms[p] as Notes;
    if (n.supported === false) return `${p}: not supported`;
    return `${p}: ${n.tag !== undefined ? `<${n.tag}>` : (n.element ?? '—')}`;
  });
  out.push(`  platforms: ${rendered.join(' · ')}`);
  out.push(`  class ds-${stem}, part ds-${stem}__<part>, value ds-${stem}--<value>, hooks --ds-${stem}-<binding>`);

  // Props
  const reflected = new Set((c.platforms['lit']?.reflect ?? []).map((r) => reflectEntry(c, r)?.prop).filter((p) => p !== undefined));
  const propRows = Object.entries(c.props).map(([name, p]) => {
    const values = p.type === 'enum' ? enumValues(p).join(' | ') + (p.enumRef === undefined ? '' : ` (${p.enumRef})`) : clip(p.shape ?? '', 48);
    const notes = [
      ...(p.platforms === undefined ? [] : [`only ${p.platforms.join(',')}`]),
      ...(p.controls === undefined ? [] : [`controlled by ${p.controls.event}${p.controls.default === undefined ? '' : `, seeded by ${p.controls.default}`}`]),
      ...Object.entries(p.valuesOn ?? {}).map(([v, on]) => `${v} only ${on.join(',')}`),
      ...Object.entries(p.valueLifecycle ?? {}).flatMap(([v, life]) => lifecycle(life).map((l) => `${v} ${l}`)),
      ...lifecycle(p),
      ...(declared.includes('lit') && c.platforms['lit']?.supported !== false ? [`lit ${kebab(name)}${reflected.has(name) ? ' (reflected)' : ''}`] : []),
      ...source(p),
    ];
    return [name, p.type, values, literal(p.default), p.required === true ? 'yes' : '', `${c.name}.${name}`, notes.join('; ')];
  });
  out.push('', table(['prop', 'type', 'values / shape', 'default', 'req', 'naming key', 'notes'], propRows));

  // Events
  const events = Object.entries(c.events ?? {});
  if (events.length > 0) {
    const eventRows = events.map(([name, e]) => [
      name,
      ...declared.map((p) => clip(e.platforms?.[p] ?? '—', 28)),
      `${c.name}.${name}`,
      [...(e.payload === undefined ? [] : [`payload ${clip(JSON.stringify(e.payload), 60)}`]), ...(e.cancelable === true ? ['cancelable'] : []), ...lifecycle(e), ...source(e)].join('; '),
    ]);
    out.push('', table(['event', ...declared, 'naming key', 'notes'], eventRows));
  }

  // Anatomy
  const partRows = c.anatomy.map((part) => {
    const kind = partKind(c, part);
    const built = c.composition?.[part];
    const target = built === undefined ? '' : typeof built === 'string' ? built : built.component;
    const slots = kind === 'slot' ? declared.map((p) => `${p} ${slotName(c, part, p) || '(default)'}`).join(', ') : '';
    return [part, kind, target, `${c.name}.${part}`, slots];
  });
  out.push('', table(['part', 'kind', 'built from', 'naming key', 'slot names'], partRows));

  // Style bindings: the component's CSS hooks
  const styles = Object.entries(c.styles ?? {});
  if (styles.length > 0) {
    const styleRows = styles.map(([name, b]) => [
      name,
      `--ds-${stem}-${kebab(name)}`,
      b.locked === true ? 'locked' : '',
      [...(b.part === undefined ? [] : [`part ${b.part}`]), ...(b.platforms === undefined ? [] : [`only ${b.platforms.join(',')}`]), ...source(b)].join('; '),
    ]);
    out.push('', table(['binding', 'hook', 'lock', 'notes'], styleRows));
  }

  // Extensions already merged
  for (const x of entry.extensions ?? []) {
    const bits = [
      ...Object.entries(x.adds ?? {}).map(([section, names]) => `adds ${section} ${names.join(', ')}`),
      ...Object.entries(x.defaults ?? {}).map(([prop, d]) => `default ${prop} ${literal(d.from) || '(none)'} → ${literal(d.to)}`),
      ...Object.entries(x.omits ?? {}).map(([section, names]) => `omits ${section} ${names.join(', ')}`),
      ...Object.entries(x.modules ?? {}).map(([name, m]) => `module ${name} (${m.path})`),
    ];
    out.push('', `  extension ${x.name} (${x.file}): ${bits.join('; ')}`);
  }
  return out.join('\n');
}

function main(argv: string[]): number {
  let platforms: readonly string[] = PLATFORMS;
  let tokens: string | null = null;
  let list = false;
  const names: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '--list') list = true;
    else if (arg === '--platform' || arg === '--tokens') {
      const value = argv[++i];
      if (value === undefined) {
        process.stderr.write(`${arg} needs a value\n`);
        return 2;
      }
      if (arg === '--tokens') tokens = value;
      else platforms = value.split(',').map((p) => p.trim());
    } else if (arg.startsWith('-')) {
      process.stderr.write(`unknown option ${arg}\nusage: canonical.ts <Component> [...] [--platform web,lit,rn,swiftui] | --list | --tokens <prefix>\n`);
      return 2;
    } else names.push(...arg.split(',').filter((n) => n !== ''));
  }

  if (tokens !== null) {
    const prefix = tokens;
    const matched = [...TOKEN_NAMES].filter((t) => t === prefix || t.startsWith(`${prefix}.`) || (!prefix.includes('.') && t.includes(prefix))).sort();
    if (matched.length === 0) {
      process.stderr.write(`no public token name starts with ${prefix}\n`);
      return 1;
    }
    process.stdout.write(`${table(['token (naming.tokens.rename key)', 'css variable', 'js / rn key'], matched.map((t) => [t, cssName(t), camelName(t)]))}\n`);
    if (names.length === 0 && !list) return 0;
  }

  if (!existsSync(COMPONENTS)) {
    process.stderr.write('generated/components.json does not exist: run `pnpm parse` first\n');
    return 1;
  }
  const entries = (JSON.parse(readFileSync(COMPONENTS, 'utf8')) as Entry[]).filter((e) => e.component !== undefined);

  if (list) {
    const rows = entries.map((e) => {
      const c = e.component as Component;
      return [c.name, c.category, c.apg ?? '', clip((e.description ?? '').split(/(?<=\.)\s/)[0] ?? '', 90)];
    });
    process.stdout.write(`${table(['component', 'category', 'apg', 'summary'], rows)}\n`);
    return 0;
  }
  if (names.length === 0) {
    if (tokens !== null) return 0;
    process.stderr.write('usage: canonical.ts <Component> [...] [--platform web,lit,rn,swiftui] | --list | --tokens <prefix>\n');
    return 2;
  }

  const unknownPlatform = platforms.find((p) => !(PLATFORMS as readonly string[]).includes(p));
  if (unknownPlatform !== undefined) {
    process.stderr.write(`unknown platform ${unknownPlatform}: expected ${PLATFORMS.join(', ')}\n`);
    return 2;
  }

  const blocks: string[] = [];
  let missing = 0;
  for (const name of names) {
    const entry = entries.find((e) => e.component?.name === name);
    if (entry === undefined) {
      const near = entries.map((e) => (e.component as Component).name).filter((n) => n.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(n.toLowerCase()));
      process.stderr.write(`no canonical component is called ${name}${near.length > 0 ? ` (did you mean ${near.join(', ')}?)` : ''}; --list prints them all\n`);
      missing += 1;
      continue;
    }
    blocks.push(describe(entry, platforms));
  }
  if (blocks.length > 0) process.stdout.write(`${blocks.join('\n\n')}\n`);
  return missing > 0 ? 1 : 0;
}

process.exitCode = main(process.argv.slice(2));
