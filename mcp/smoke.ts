/**
 * Smoke test: call the MCP tool functions directly (no protocol) so the index and
 * lookups can be checked from a terminal before wiring the server into a client.
 *
 * Usage: node --import tsx mcp/smoke.ts
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { ljust, pyFixed, pySplitlines, pyStr, readText } from '../tools/lib/py.ts';
import {
  checkContrast,
  getComponent,
  getKeyboardModel,
  getLayoutRules,
  getTokens,
  listComponents,
  listGaps,
  lookupCode,
  paths,
  searchGuidance,
  startTheme,
  writeTheme,
} from './server.ts';

type Dict = Record<string, any>;

/** `print(*parts)`: `str()` of each, joined by a space. */
function print(...parts: unknown[]): void {
  process.stdout.write(parts.map((p) => pyStr(p)).join(' ') + '\n');
}

/** `s[:n]` counts code points. */
function head(s: string, n: number): string {
  return s.length <= n ? s : [...s].slice(0, n).join('');
}

function assert(condition: unknown, message = 'assertion failed'): void {
  if (!condition) throw new Error(message);
}

function show(title: string, rows: Dict[]): void {
  print(`\n=== ${title}`);
  for (const r of rows) {
    const label = (r.component || r.theme || '-') as string;
    print(`  ${pyFixed(r.score as number, 3)}  [${ljust(r.platform as string, 4)}] ${ljust(label, 8)} ${ljust(r.section as string, 20)} ${head(r.text as string, 90).replaceAll('\n', ' ')}`);
  }
}

print('components:', listComponents().map((c) => c.name));
show('how do I show a validation error on a form field?  (platform=rn)', await searchGuidance({ query: 'how do I show a validation error on a form field', platform: 'rn', limit: 5 }));
show('how do I announce a form error to screen readers?  (platform=rn)', await searchGuidance({ query: 'announce the form error to screen readers', platform: 'rn', limit: 4 }));
show('same query, platform=lit', await searchGuidance({ query: 'announce the form error to screen readers', platform: 'lit', limit: 4 }));
show('which heading level should I use / can I skip levels', await searchGuidance({ query: 'can I skip heading levels', limit: 4 }));
show("what is the theme's attitude to animation", await searchGuidance({ query: 'how should motion and animation behave in this design system', limit: 4 }));
show('code search: focus ring implementation (kinds=code, platform=web)', await searchGuidance({ query: 'focus ring outline on focus-visible', platform: 'web', kinds: ['code'], limit: 3 }));

const code = lookupCode({ component: 'Button', platform: 'rn', include: ['source', 'notes', 'tokens'] });
print('\n=== lookup_code Button/rn');
print('  files:', Object.keys(code.files as Dict));
print('  events:', code.events);
print('  bindings sample:', Object.fromEntries(Object.entries(code.tokenBindings as Dict).slice(0, 3)));
print('  notes:', head(code.platformNotes as string, 160).replaceAll('\n', ' '), '...');

const comp = getComponent({ name: 'Input', platform: 'lit' });
print('\n=== get_component Input/lit -> events on platform:', Object.fromEntries(Object.entries(comp.schema.events as Dict).map(([k, v]) => [k, (v as Dict).nameOnPlatform])));

const tk = getTokens({ theme: 'calm-precise', mode: 'dark', platform: 'rn', group: 'color.action.primary' });
print('\n=== get_tokens calm-precise/dark/rn color.action.primary:', Object.fromEntries(Object.entries(tk.tokens as Dict).map(([k, v]) => [k, (v as Dict).value])));

print('\n=== check_contrast color.foreground.muted on color.background (AA):', checkContrast({ foreground: 'color.foreground.muted', background: 'color.background' }));

const kb = getKeyboardModel({ component: 'Dialog' });
print('\n=== get_keyboard_model Dialog:', kb.autoTested, 'auto-tested,', kb.manual, 'manual');
for (const r of (kb.rules as Dict[]).slice(0, 4)) {
  print(`  ${ljust((r.keys as string[]).join('/'), 10)} from=${ljust(r.from as string, 8)} expect=${ljust(r.expect as string, 22)} ${head(r.action as string, 60)}`);
}
assert((kb.rules as Dict[]).every((r) => 'from' in r && 'expect' in r));
print('  no-keyboard component note:', head(getKeyboardModel({ component: 'Text' }).note as string, 60), '...');

const lay = getLayoutRules({ theme: 'calm-precise', mode: 'light' });
print('\n=== get_layout_rules calm-precise/light:', Object.keys(lay.tokens as Dict).length, 'tokens; rules:', head(lay.rules as string, 80).replaceAll('\n', ' '), '...');
print('  gap:', Object.fromEntries(Object.entries(lay.tokens as Dict).filter(([k]) => k.startsWith('layout.gap.')).map(([k, v]) => [k.split('.').pop(), (v as Dict).value])));
assert('layout.maxWidth.page' in (lay.tokens as Dict) && lay.rules);

const gaps = listGaps();
print('\n=== list_gaps: ', gaps.length, 'file(s);', gaps.reduce((n, g) => n + (g.total as number), 0), 'gap(s)');
for (const g of gaps.slice(0, 3)) {
  const latest = (g.rounds as Dict[])[0] ?? null;
  print(`  ${ljust(g.component as string, 12)} ${ljust((g.platform || '-') as string, 4)} rounds=${(g.rounds as Dict[]).length} latest=${latest && (latest.gaps as string[]).length ? head((latest.gaps as string[])[0] as string, 70) : '-'}`);
}
if (gaps.length) {
  const one = listGaps({ component: gaps[0]?.component as string });
  assert(one.length && one.every((g) => g.component === gaps[0]?.component));
}

const st = startTheme();
print('\n=== start_theme:', (st.questions as Dict[]).length, 'questions; required:', st.required);
for (const q of st.questions as Dict[]) print(`  ${ljust(q.id as string, 7)} ${(q.fields as string[]).join(', ')}`);
assert((st.questions as Dict[])[0]?.allowed.tone.minItems === 2);
assert(pyStr((st.questions as Dict[])[3]?.allowed.radius.enum) === pyStr(['none', 'sm', 'md', 'lg', 'full']));

const bad = writeTheme({
  id: 'smoke-test-theme',
  answers: { tone: ['one'], not: 'x', seed: { color: '#12345' }, scale: { base: 16, ratio: 1.2 }, radius: 'md', density: 'comfortable', modes: { default: 'light', supports: ['light'] } },
});
print('\n=== write_theme with invalid answers -> ok:', bad.ok, '| errors:', (bad.errors as string[]).length);
assert(bad.ok === false && bad.written === null && !existsSync(join(paths.THEME_DOCS, 'smoke-test-theme.md')));

const realDocs = paths.THEME_DOCS;
paths.THEME_DOCS = mkdtempSync(join(tmpdir(), 'ds-smoke-themes-')); // the happy path writes somewhere disposable
try {
  const good = writeTheme({
    id: 'smoke-test-theme',
    answers: {
      title: 'Smoke test', tone: ['warm', 'sleek'], not: 'cold',
      seed: { color: '#C89A5C', typeface: 'Google Sans' }, neutralTint: 0.35,
      scale: { base: 16, ratio: 1.25 }, radius: 'md', density: 'comfortable',
      motion: 'expressive', elevation: 'pronounced', layout: { rhythm: 'normal', contentWidth: 1040 },
      modes: { default: 'light', supports: ['light', 'dark'] },
      feel: 'Cream surfaces and a pale-oak accent.', whenToUse: 'Consumer products.',
    },
  });
  const lastLine = pySplitlines(good.themeOutput as string).slice(-1)[0] ?? '-';
  print('\n=== write_theme valid answers ->', good.ok ? 'ok' : 'FAILED', '| wrote:', basename(good.written as string), '| theme.ts:', head(lastLine, 70), '| errors:', good.errors);
  const text = readText(join(paths.THEME_DOCS, 'smoke-test-theme.md'));
  assert(text.startsWith('---\ntitle: Smoke test') && text.includes('## Not cold') && text.includes('### React Native'));
  const again = writeTheme({ id: 'smoke-test-theme', answers: { tone: ['a', 'b'] } });
  assert(again.ok === false, 'an existing doc is not overwritten without overwrite=true');
} finally {
  paths.THEME_DOCS = realDocs;
}

print('\nOK');
